'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EXAMS, TRACKS, domainName, getExam } from '@/content/exams';
import { QUESTIONS, questionsForExam } from '@/content/questions';
import { emptyProgress, examStat, localDate, streakDays } from '@/lib/quiz/progress';
import { updateProgress, useIsClient, useProgress } from '@/lib/quiz/store';

const MODE_NAME = { practice: '練習', mock: '模試', review: '苦手克服' } as const;

export function ProgressClient() {
  const isClient = useIsClient();
  const progress = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isClient) return <div className="mt-8 h-96 animate-pulse rounded-2xl theme-card" aria-hidden />;

  const all = examStat(progress, QUESTIONS.map((q) => q.id));
  const streak = streakDays(progress, localDate());

  if (all.answered === 0) {
    return (
      <div className="mt-8 rounded-2xl p-10 text-center theme-card">
        <p className="text-lg font-bold">まだ記録がありません</p>
        <p className="mt-2 text-sm" style={{ color: 'var(--txts)' }}>
          問題を解くと、ここに正答率や苦手な分野が表示されます。
        </p>
        <Link
          href="/exams"
          className="mt-6 inline-block rounded-xl px-6 py-3 font-bold"
          style={{ backgroundColor: 'var(--acc)', color: 'var(--bg)' }}
        >
          試験を選ぶ
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: '連続学習', v: `${streak}日` },
          { k: '解いた問題', v: `${all.answered}/${all.total}` },
          { k: '通算正答率', v: `${Math.round(all.accuracy * 100)}%` },
          { k: '苦手な問題', v: `${all.weak}問` },
        ].map((s) => (
          <div key={s.k} className="rounded-2xl p-4 theme-card">
            <dt className="text-xs" style={{ color: 'var(--txts)' }}>
              {s.k}
            </dt>
            <dd className="mt-1 text-2xl font-extrabold tabular-nums">{s.v}</dd>
          </div>
        ))}
      </dl>

      <section>
        <h2 className="mb-3 text-lg font-bold">試験別</h2>
        <div className="space-y-3">
          {EXAMS.map((exam) => {
            const qs = questionsForExam(exam.id);
            const stat = examStat(progress, qs.map((q) => q.id));
            const domainStats = exam.domains
              .map((d) => ({ d, s: examStat(progress, qs.filter((q) => q.domain === d.id).map((q) => q.id)) }))
              .filter((x) => x.s.answered > 0);
            const weakest = [...domainStats].sort((a, b) => a.s.accuracy - b.s.accuracy)[0];
            return (
              <div key={exam.id} className="rounded-2xl p-5 theme-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold" style={{ color: TRACKS[exam.track].accent }}>
                      {TRACKS[exam.track].name}
                    </span>
                    <Link href={`/exams/${exam.id}`} className="block font-bold hover:underline">
                      {exam.shortTitle}
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span style={{ color: 'var(--txts)' }}>
                      {stat.answered}/{stat.total} 問
                    </span>
                    <span className="font-bold tabular-nums">{stat.answered ? `${Math.round(stat.accuracy * 100)}%` : '—'}</span>
                    {stat.weak > 0 ? (
                      <Link
                        href={`/exams/${exam.id}?mode=review`}
                        className="rounded-lg px-3 py-1.5 text-xs font-bold"
                        style={{ backgroundColor: 'rgba(251,191,36,0.12)', color: 'var(--warn)' }}
                      >
                        苦手 {stat.weak} 問を解く
                      </Link>
                    ) : (
                      <Link href={`/exams/${exam.id}`} className="rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-white/5" style={{ color: 'var(--txts)' }}>
                        解く
                      </Link>
                    )}
                  </div>
                </div>
                {domainStats.length > 0 && (
                  <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                    {domainStats.map(({ d, s }) => (
                      <div key={d.id}>
                        <div className="mb-0.5 flex justify-between text-xs">
                          <span>{domainName(exam, d.id)}</span>
                          <span className="tabular-nums" style={{ color: 'var(--txts)' }}>
                            {Math.round(s.accuracy * 100)}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--surf2)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.accuracy * 100}%`,
                              backgroundColor: s.accuracy >= 0.7 ? 'var(--ok)' : s.accuracy >= 0.5 ? 'var(--warn)' : 'var(--ng)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {weakest && weakest.s.accuracy < 0.7 && (
                  <p className="mt-3 text-xs" style={{ color: 'var(--txts)' }}>
                    いちばん伸びしろがある分野：<span style={{ color: 'var(--warn)' }}>{weakest.d.name}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {progress.sessions.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">最近の挑戦</h2>
          <ul className="divide-y rounded-2xl theme-card" style={{ borderColor: 'var(--bor)' }}>
            {progress.sessions.slice(0, 10).map((s, i) => {
              const exam = getExam(s.examId);
              const rate = s.total ? s.correct / s.total : 0;
              return (
                <li key={`${s.at}-${i}`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm" style={{ borderColor: 'var(--bor)' }}>
                  <span>
                    <span className="mr-2 text-xs" style={{ color: 'var(--txts)' }}>
                      {s.day.replaceAll('-', '/')}
                    </span>
                    {exam?.shortTitle ?? s.examId}
                    <span className="ml-2 rounded px-1.5 py-0.5 text-[11px]" style={{ backgroundColor: 'var(--surf2)', color: 'var(--txts)' }}>
                      {MODE_NAME[s.mode]}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums" style={{ color: rate >= 0.7 ? 'var(--ok)' : 'var(--txt)' }}>
                    {s.correct}/{s.total}（{Math.round(rate * 100)}%）
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="text-right">
        {confirmReset ? (
          <span className="inline-flex flex-wrap items-center justify-end gap-2 text-sm">
            記録をすべて削除します。元に戻せません。
            <button type="button" onClick={() => setConfirmReset(false)} className="rounded-lg px-3 py-1.5 hover:bg-white/5">
              やめる
            </button>
            <button
              type="button"
              onClick={() => {
                updateProgress(() => emptyProgress());
                setConfirmReset(false);
              }}
              className="rounded-lg px-3 py-1.5 font-semibold"
              style={{ backgroundColor: 'var(--ng)', color: '#1a0505' }}
            >
              削除する
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmReset(true)} className="text-xs hover:underline" style={{ color: 'var(--txts)' }}>
            学習記録をリセット
          </button>
        )}
      </section>
    </div>
  );
}
