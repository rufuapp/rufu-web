'use client';

import { useState, type CSSProperties } from 'react';
import { PASS_RATE, formatDuration, scoreSession } from '@/lib/quiz/engine';
import { domainName } from '@/content/exams';
import type { AnswerRecord, Exam, QuizMode, SessionQuestion } from '@/lib/quiz/types';
import { rateColor } from './style';

const MODE_TITLE: Record<QuizMode, string> = {
  practice: '練習の結果',
  mock: '模試の結果',
  review: '苦手克服の結果',
};

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
  const ringColor = result.total > 0 ? rateColor(result.rate) : 'var(--d-line-strong)';

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="drill-enter card relative isolate overflow-hidden px-6 pt-9 pb-8 text-center sm:px-10">
        <div aria-hidden className="drill-dots pointer-events-none absolute inset-0 -z-10 opacity-70" />
        <p className="text-xs font-semibold tracking-widest text-muted">{MODE_TITLE[mode]}</p>
        <div
          className="score-ring mx-auto mt-5 grid size-40 place-items-center rounded-full"
          style={{ '--pct-to': pct, '--ring': ringColor } as CSSProperties}
          role="img"
          aria-label={`正答率 ${pct}%`}
        >
          <div className="grid size-[8.5rem] place-content-center rounded-full bg-card text-center shadow-soft">
            <span className="text-4xl font-black tracking-tight tabular-nums">{pct}%</span>
            <span className="text-xs text-muted">
              {result.correct} / {result.total} 問
            </span>
          </div>
        </div>
        {result.total > 0 && (
          <p className="mt-5 text-lg font-bold" style={{ color: ringColor }}>
            {result.passed
              ? '合格ライン到達！'
              : `合格ラインまであと ${Math.max(1, Math.ceil(result.total * PASS_RATE) - result.correct)} 問`}
          </p>
        )}
        <dl className="mx-auto mt-5 flex justify-center divide-x divide-line text-sm">
          <div className="px-5">
            <dt className="text-xs text-muted">所要時間</dt>
            <dd className="mt-0.5 font-semibold tabular-nums">{formatDuration(elapsedSec)}</dd>
          </div>
          <div className="px-5">
            <dt className="text-xs text-muted">合格の目安</dt>
            <dd className="mt-0.5 font-semibold">{Math.round(PASS_RATE * 100)}%</dd>
          </div>
          {unanswered > 0 && (
            <div className="px-5">
              <dt className="text-xs text-muted">未解答</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">{unanswered}問</dd>
            </div>
          )}
        </dl>
        <p className="mt-3 text-xs text-muted">合格の目安はこのサイト独自のものです。実際の合格基準は公式情報を確認してください。</p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {wrongIds.length > 0 && (
            <button type="button" onClick={() => onRetryWrong(wrongIds)} className="btn btn-primary">
              間違えた {wrongIds.length} 問を解き直す
            </button>
          )}
          <button type="button" onClick={onRetry} className="btn btn-secondary">
            同じ条件でもう一度
          </button>
          <button type="button" onClick={onBack} className="btn btn-ghost">
            設定に戻る
          </button>
        </div>
      </section>

      {result.byDomain.length > 0 && (
        <section className="card mt-6 p-6 sm:p-7">
          <h3 className="text-sm font-bold">分野別の正答率</h3>
          <ul className="mt-5 space-y-4">
            {result.byDomain.map((d) => {
              const r = d.correct / d.total;
              return (
                <li key={d.domain}>
                  <div className="mb-1.5 flex justify-between gap-2 text-sm">
                    <span>{domainName(exam, d.domain)}</span>
                    <span className="text-muted tabular-nums">
                      {d.correct}/{d.total}（{Math.round(r * 100)}%）
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-subtle">
                    <div className="bar-fill h-full rounded-full" style={{ width: `${r * 100}%`, backgroundColor: rateColor(r) }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold tracking-tight">解答の振り返り</h3>
          <fieldset className="inline-flex gap-1 rounded-full bg-subtle p-1 text-xs ring-1 ring-line">
            <legend className="sr-only">表示する問題</legend>
            {(['wrong', 'all'] as const).map((f) => (
              <label
                key={f}
                className="cursor-pointer rounded-full px-3 py-1 font-semibold text-muted transition hover:text-ink has-checked:bg-card has-checked:text-ink has-checked:shadow-soft"
              >
                <input type="radio" name="review-filter" value={f} checked={filter === f} onChange={() => setFilter(f)} className="sr-only" />
                {f === 'wrong' ? `間違いのみ（${wrongIds.length}）` : `すべて（${session.length}）`}
              </label>
            ))}
          </fieldset>
        </div>
        {shown.length === 0 ? (
          <p className="card p-8 text-center text-sm text-muted">全問正解です。おみごと！</p>
        ) : (
          <ol className="space-y-3">
            {shown.map((s) => {
              const a = byId.get(s.question.id);
              const q = s.question;
              const status = a?.correct
                ? { label: '正解', cls: 'bg-ok/10 text-ok' }
                : a && a.selected.length > 0
                  ? { label: '不正解', cls: 'bg-ng/10 text-ng' }
                  : { label: '未解答', cls: 'bg-subtle text-muted' };
              return (
                <li key={q.id} className="card p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`chip font-semibold ${status.cls}`}>{status.label}</span>
                    <span className="text-muted">{domainName(exam, q.domain)}</span>
                  </div>
                  <p className="mt-3 leading-relaxed font-semibold break-words">{q.question}</p>
                  {q.code && (
                    <pre className="mt-3 overflow-x-auto rounded-xl bg-subtle p-3 font-mono text-xs leading-relaxed ring-1 ring-line">
                      <code>{q.code}</code>
                    </pre>
                  )}
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {q.choices.map((c, i) => {
                      const isAns = q.answer.includes(i);
                      const isSel = a?.selected.includes(i);
                      if (!isAns && !isSel) return null;
                      return (
                        <li key={i} className="flex items-start gap-2">
                          <span className={`chip mt-0.5 shrink-0 ${isAns ? 'bg-ok/10 text-ok' : 'bg-ng/10 text-ng'}`}>
                            {isAns ? (isSel ? '正解・選択' : '正解') : 'あなた'}
                          </span>
                          <span className="break-words">{c}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-4 rounded-xl bg-subtle p-4 text-sm leading-relaxed text-ink/80">{q.explanation}</p>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
