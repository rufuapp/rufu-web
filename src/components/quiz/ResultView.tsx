'use client';

import { useState } from 'react';
import { PASS_RATE, formatDuration, scoreSession } from '@/lib/quiz/engine';
import { domainName } from '@/content/exams';
import type { AnswerRecord, Exam, QuizMode, SessionQuestion } from '@/lib/quiz/types';

type Props = {
  exam: Exam;
  session: SessionQuestion[];
  answers: AnswerRecord[];
  mode: QuizMode;
  elapsedSec: number;
  onRetry: () => void;
  onRetryWrong: (ids: string[]) => void;
  onBack: () => void;
};

export function ResultView({ exam, session, answers, mode, elapsedSec, onRetry, onRetryWrong, onBack }: Props) {
  const [filter, setFilter] = useState<'all' | 'wrong'>('wrong');
  const result = scoreSession(answers, exam.domains.map((d) => d.id));
  const byId = new Map(answers.map((a) => [a.questionId, a]));
  const wrongIds = answers.filter((a) => !a.correct).map((a) => a.questionId);
  const pct = Math.round(result.rate * 100);
  const unanswered = session.length - answers.filter((a) => a.selected.length > 0).length;
  const shown = session.filter((s) => filter === 'all' || !byId.get(s.question.id)?.correct);

  const ringColor = result.passed ? 'var(--ok)' : pct >= 50 ? 'var(--warn)' : 'var(--ng)';

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="drill-pop rounded-2xl p-6 text-center sm:p-8 theme-card">
        <p className="text-xs font-semibold tracking-widest" style={{ color: 'var(--txts)' }}>
          {mode === 'mock' ? '模試の結果' : mode === 'review' ? '苦手克服の結果' : '練習の結果'}
        </p>
        <div
          className="mx-auto my-5 flex h-36 w-36 items-center justify-center rounded-full"
          style={{ background: `conic-gradient(${ringColor} ${pct * 3.6}deg, var(--surf2) 0deg)` }}
          role="img"
          aria-label={`正答率 ${pct}%`}
        >
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full" style={{ backgroundColor: 'var(--surf)' }}>
            <span className="text-4xl font-extrabold tabular-nums">{pct}%</span>
            <span className="text-xs" style={{ color: 'var(--txts)' }}>
              {result.correct} / {result.total} 問
            </span>
          </div>
        </div>
        {result.total > 0 && (
          <p className="text-lg font-bold" style={{ color: ringColor }}>
            {result.passed
              ? '合格ライン到達！'
              : `合格ラインまであと ${Math.max(1, Math.ceil(result.total * PASS_RATE) - result.correct)} 問`}
          </p>
        )}
        <p className="mt-1 text-xs" style={{ color: 'var(--txts)' }}>
          このサイトでは正答率 {Math.round(PASS_RATE * 100)}% を目安にしています（実際の合格基準は公式情報を確認してください）
          ・所要時間 {formatDuration(elapsedSec)}
          {unanswered > 0 && ` ・未解答 ${unanswered} 問`}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {wrongIds.length > 0 && (
            <button
              type="button"
              onClick={() => onRetryWrong(wrongIds)}
              className="rounded-xl px-5 py-2.5 text-sm font-bold"
              style={{ backgroundColor: 'var(--acc)', color: 'var(--bg)' }}
            >
              間違えた {wrongIds.length} 問を解き直す
            </button>
          )}
          <button type="button" onClick={onRetry} className="rounded-xl px-5 py-2.5 text-sm font-semibold theme-card hover:bg-white/5">
            同じ条件でもう一度
          </button>
          <button type="button" onClick={onBack} className="rounded-xl px-5 py-2.5 text-sm hover:bg-white/5" style={{ color: 'var(--txts)' }}>
            設定に戻る
          </button>
        </div>
      </section>

      {result.byDomain.length > 0 && (
        <section className="mt-6 rounded-2xl p-6 theme-card">
          <h3 className="mb-4 text-sm font-bold">分野別の正答率</h3>
          <ul className="space-y-3">
            {result.byDomain.map((d) => {
              const r = d.correct / d.total;
              return (
                <li key={d.domain}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{domainName(exam, d.domain)}</span>
                    <span className="tabular-nums" style={{ color: 'var(--txts)' }}>
                      {d.correct}/{d.total}（{Math.round(r * 100)}%）
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--surf2)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${r * 100}%`, backgroundColor: r >= PASS_RATE ? 'var(--ok)' : r >= 0.5 ? 'var(--warn)' : 'var(--ng)' }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold">解答の振り返り</h3>
          <div className="flex rounded-lg p-0.5 text-xs theme-card" role="group">
            {(['wrong', 'all'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className="rounded-md px-3 py-1"
                style={filter === f ? { backgroundColor: 'var(--surf2)', color: 'var(--txt)' } : { color: 'var(--txts)' }}
              >
                {f === 'wrong' ? `間違いのみ（${wrongIds.length}）` : `すべて（${session.length}）`}
              </button>
            ))}
          </div>
        </div>
        {shown.length === 0 ? (
          <p className="rounded-2xl p-6 text-center text-sm theme-card" style={{ color: 'var(--txts)' }}>
            全問正解です。おみごと！
          </p>
        ) : (
          <ol className="space-y-3">
            {shown.map((s) => {
              const a = byId.get(s.question.id);
              const ok = !!a?.correct;
              const q = s.question;
              return (
                <li key={q.id} className="rounded-2xl p-5 theme-card">
                  <div className="mb-2 flex items-center gap-2 text-xs">
                    <span className="font-bold" style={{ color: ok ? 'var(--ok)' : 'var(--ng)' }}>
                      {ok ? '◯ 正解' : a && a.selected.length > 0 ? '✕ 不正解' : '− 未解答'}
                    </span>
                    <span style={{ color: 'var(--txts)' }}>{domainName(exam, q.domain)}</span>
                  </div>
                  <p className="text-sm font-semibold leading-relaxed">{q.question}</p>
                  {q.code && (
                    <pre className="mt-3 overflow-x-auto rounded-lg p-3 font-mono text-xs" style={{ backgroundColor: 'var(--bg)' }}>
                      <code>{q.code}</code>
                    </pre>
                  )}
                  <ul className="mt-3 space-y-1 text-sm">
                    {q.choices.map((c, i) => {
                      const isAns = q.answer.includes(i);
                      const isSel = a?.selected.includes(i);
                      if (!isAns && !isSel) return null;
                      return (
                        <li key={i} className="flex gap-2">
                          <span className="shrink-0 text-xs font-semibold" style={{ color: isAns ? 'var(--ok)' : 'var(--ng)', minWidth: '4.5em' }}>
                            {isAns ? (isSel ? '正解・選択' : '正解') : 'あなた'}
                          </span>
                          <span>{c}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--txts)' }}>
                    {q.explanation}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
