'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EXAMS, TRACKS, domainName, getExam } from '@/content/exams';
import { QUESTIONS, questionsForExam } from '@/content/questions';
import { emptyProgress, examStat, localDate, streakDays } from '@/lib/quiz/progress';
import { updateProgress, useIsClient, useProgress } from '@/lib/quiz/store';
import { rateColor, tint } from './style';

const MODE_NAME = { practice: '練習', mock: '模試', review: '苦手克服' } as const;

export function ProgressClient() {
  const isClient = useIsClient();
  const progress = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isClient) return <div className="card mt-10 h-96 animate-pulse" aria-hidden />;

  const all = examStat(progress, QUESTIONS.map((q) => q.id));
  const streak = streakDays(progress, localDate());

  if (all.answered === 0) {
    return (
      <div className="card mt-10 px-6 py-14 text-center">
        <p className="text-lg font-bold">まだ記録がありません</p>
        <p className="mt-2 text-sm text-muted">問題を解くと、ここに正答率や苦手な分野が表示されます。</p>
        <Link href="/exams" className="btn btn-primary mt-6">
          試験を選ぶ
        </Link>
      </div>
    );
  }

  const tiles = [
    { k: '連続学習', v: streak, u: '日', cls: streak > 0 ? 'text-brand' : '' },
    { k: '解いた問題', v: all.answered, u: `/${all.total}`, cls: '' },
    { k: '通算正答率', v: Math.round(all.accuracy * 100), u: '%', cls: '' },
    { k: '苦手な問題', v: all.weak, u: '問', cls: all.weak > 0 ? 'text-warn' : '' },
  ];

  return (
    <div className="mt-10 space-y-12">
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((s) => (
          <div key={s.k} className="card p-5">
            <dt className="text-xs text-muted">{s.k}</dt>
            <dd className={`mt-2 text-4xl font-black tracking-tight tabular-nums ${s.cls}`}>
              {s.v}
              <span className="ml-0.5 text-sm font-semibold text-muted">{s.u}</span>
            </dd>
          </div>
        ))}
      </dl>

      <section>
        <h2 className="text-xl font-bold tracking-tight">試験別</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {EXAMS.map((exam) => {
            const qs = questionsForExam(exam.id);
            const stat = examStat(progress, qs.map((q) => q.id));
            const domainStats = exam.domains
              .map((d) => ({ d, s: examStat(progress, qs.filter((q) => q.domain === d.id).map((q) => q.id)) }))
              .filter((x) => x.s.answered > 0);
            const weakest = [...domainStats].sort((a, b) => a.s.accuracy - b.s.accuracy)[0];
            return (
              <div key={exam.id} className="card flex flex-col p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="chip tint" style={tint(TRACKS[exam.track].accent)}>
                      <span className="size-1.5 rounded-full bg-current" />
                      {TRACKS[exam.track].name}
                    </span>
                    <Link href={`/exams/${exam.id}`} className="mt-2 block text-lg font-bold tracking-tight hover:underline">
                      {exam.shortTitle}
                    </Link>
                  </div>
                  <div className="text-right">
                    {stat.answered ? (
                      <p className="text-2xl font-black tracking-tight tabular-nums">{Math.round(stat.accuracy * 100)}%</p>
                    ) : (
                      <p className="pt-1.5 text-sm font-semibold text-muted">未挑戦</p>
                    )}
                    <p className="text-xs text-muted">
                      {stat.answered}/{stat.total} 問
                    </p>
                  </div>
                </div>
                {domainStats.length > 0 && (
                  <div className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {domainStats.map(({ d, s }) => (
                      <div key={d.id}>
                        <div className="mb-1 flex justify-between gap-2 text-xs">
                          <span>{domainName(exam, d.id)}</span>
                          <span className="text-muted tabular-nums">{Math.round(s.accuracy * 100)}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
                          <div
                            className="bar-fill h-full rounded-full"
                            style={{ width: `${s.accuracy * 100}%`, backgroundColor: rateColor(s.accuracy) }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex-1" />
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  {weakest && weakest.s.accuracy < 0.7 ? (
                    <p className="text-xs text-muted">
                      伸びしろ：<span className="font-semibold text-warn">{weakest.d.name}</span>
                    </p>
                  ) : (
                    <span />
                  )}
                  {stat.weak > 0 ? (
                    <Link href={`/exams/${exam.id}?mode=review`} className="btn bg-warn/10 px-4 py-2 text-xs text-warn hover:bg-warn/15">
                      苦手 {stat.weak} 問を解く
                    </Link>
                  ) : (
                    <Link href={`/exams/${exam.id}`} className="btn btn-secondary px-4 py-2 text-xs">
                      解く
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {progress.sessions.length > 0 && (
        <section>
          <h2 className="text-xl font-bold tracking-tight">最近の挑戦</h2>
          <ul className="card mt-4 divide-y divide-line">
            {progress.sessions.slice(0, 10).map((s, i) => {
              const exam = getExam(s.examId);
              const rate = s.total ? s.correct / s.total : 0;
              return (
                <li key={`${s.at}-${i}`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-sm">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted tabular-nums">{s.day.replaceAll('-', '/')}</span>
                    <span className="font-medium">{exam?.shortTitle ?? s.examId}</span>
                    <span className="chip bg-subtle text-muted ring-1 ring-line">{MODE_NAME[s.mode]}</span>
                  </span>
                  <span className="font-semibold tabular-nums" style={{ color: rateColor(rate) }}>
                    {s.correct}/{s.total}（{Math.round(rate * 100)}%）
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="flex justify-end">
        {confirmReset ? (
          <div className="drill-enter card flex flex-wrap items-center gap-3 p-4 text-sm">
            <span>記録をすべて削除します。元に戻せません。</span>
            <button type="button" onClick={() => setConfirmReset(false)} className="btn btn-secondary px-4 py-2">
              やめる
            </button>
            <button
              type="button"
              onClick={() => {
                updateProgress(() => emptyProgress());
                setConfirmReset(false);
              }}
              className="btn bg-ng px-4 py-2 text-white hover:bg-ng/90"
            >
              削除する
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmReset(true)} className="btn btn-ghost text-xs">
            学習記録をリセット
          </button>
        )}
      </section>
    </div>
  );
}
