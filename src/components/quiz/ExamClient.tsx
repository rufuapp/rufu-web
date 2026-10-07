'use client';

import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MOCK_SECONDS_PER_QUESTION, buildSession } from '@/lib/quiz/engine';
import { examStat, localDate, recordSession, weakQuestionIds } from '@/lib/quiz/progress';
import { updateProgress, useProgress } from '@/lib/quiz/store';
import type { AnswerRecord, Question, QuestionSet, QuizMode, SessionQuestion } from '@/lib/quiz/types';
import { QuizPlayer } from './QuizPlayer';
import { ResultView } from './ResultView';

const MODES: { id: QuizMode; name: string; desc: string }[] = [
  { id: 'practice', name: '練習', desc: '1問ごとに正誤と解説を表示します' },
  { id: 'mock', name: '模試', desc: '制限時間つきで解き、最後にまとめて採点します' },
  { id: 'review', name: '苦手克服', desc: '直近で間違えた問題だけを出題します' },
];

type Phase = 'setup' | 'play' | 'result';

/** URL の ?domain=a,b から、この問題集にある分野だけを取り出す */
export function domainsFromParams(params: URLSearchParams, set: QuestionSet): string[] {
  const valid = new Set(set.domains.map((d) => d.id));
  return params
    .getAll('domain')
    .flatMap((v) => v.split(','))
    .filter((d, i, arr) => valid.has(d) && arr.indexOf(d) === i);
}

type Props = { set: QuestionSet; questions: Question[]; sidebar?: React.ReactNode };

export function ExamClient({ set, questions, sidebar }: Props) {
  const searchParams = useSearchParams();
  const progress = useProgress();
  const [phase, setPhase] = useState<Phase>('setup');
  const [mode, setMode] = useState<QuizMode>(searchParams.get('mode') === 'review' ? 'review' : 'practice');
  const [count, setCount] = useState(10);
  const [domains, setDomains] = useState<string[]>(() => domainsFromParams(searchParams, set));
  const [session, setSession] = useState<SessionQuestion[]>([]);
  const [playMode, setPlayMode] = useState<QuizMode>('practice');
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [lastIds, setLastIds] = useState<string[] | undefined>(undefined);
  const [lastDomains, setLastDomains] = useState<string[] | undefined>(undefined);
  const [runId, setRunId] = useState(0);

  const ids = questions.map((q) => q.id);
  const stat = examStat(progress, ids);
  const weakIds = weakQuestionIds(progress, ids);
  const pool = mode === 'practice' && domains.length > 0 ? questions.filter((q) => domains.includes(q.domain)) : questions;
  const plannedCount = mode === 'review' ? weakIds.length : Math.min(count, pool.length);

  const start = useCallback(
    (m: QuizMode, opts: { onlyIds?: string[]; count: number; domains?: string[] }) => {
      const s = buildSession(questions, { ...opts, seed: Date.now() });
      if (s.length === 0) return;
      setSession(s);
      setPlayMode(m);
      setLastIds(opts.onlyIds);
      setLastDomains(opts.domains);
      setAnswers([]);
      setRunId((r) => r + 1);
      setPhase('play');
      window.scrollTo({ top: 0 });
    },
    [questions],
  );

  const startFromSetup = () => {
    if (mode === 'review') start('review', { onlyIds: weakIds, count: weakIds.length });
    else start(mode, { count, domains: mode === 'practice' ? domains : undefined });
  };

  const handleFinish = useCallback(
    (records: AnswerRecord[], sec: number) => {
      const now = new Date();
      setAnswers(records);
      setElapsed(sec);
      if (records.length > 0) {
        updateProgress((p) =>
          recordSession(p, {
            examId: set.id,
            mode: playMode,
            total: records.length,
            correct: records.filter((r) => r.correct).length,
            at: now.toISOString(),
            day: localDate(now),
          }),
        );
      }
      setPhase('result');
      window.scrollTo({ top: 0 });
    },
    [set.id, playMode],
  );

  if (phase === 'play') {
    return <QuizPlayer key={runId} set={set} session={session} mode={playMode} onFinish={handleFinish} onQuit={() => setPhase('setup')} />;
  }

  if (phase === 'result') {
    return (
      <ResultView
        set={set}
        session={session}
        answers={answers}
        mode={playMode}
        elapsedSec={elapsed}
        onRetry={() => start(playMode, { onlyIds: lastIds, count: session.length, domains: lastDomains })}
        onRetryWrong={(wrong) => start('review', { onlyIds: wrong, count: wrong.length })}
        onBack={() => setPhase('setup')}
      />
    );
  }

  const countOptions = [5, 10, 20, questions.length].filter((n, i, arr) => n <= questions.length && arr.indexOf(n) === i);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startFromSetup();
        }}
        className="box p-5 sm:p-7"
      >
        <fieldset>
          <legend className="font-bold tracking-[0.1em]">一、出題の形式</legend>
          <div className="mt-3 space-y-2">
            {MODES.map((m) => {
              const disabled = m.id === 'review' && weakIds.length === 0;
              return (
                <label
                  key={m.id}
                  className="flex cursor-pointer items-start gap-3 border border-line px-4 py-3 hover:bg-subtle has-checked:border-brand has-checked:bg-subtle has-disabled:cursor-not-allowed has-disabled:opacity-50 has-disabled:hover:bg-transparent"
                >
                  <input
                    type="radio"
                    name="mode"
                    value={m.id}
                    checked={mode === m.id}
                    disabled={disabled}
                    onChange={() => setMode(m.id)}
                    className="mt-[0.45rem] size-4 shrink-0"
                  />
                  <span>
                    <span className="font-bold">{m.name}</span>
                    {m.id === 'review' && <span className="ml-2 text-sm text-warn">（{weakIds.length}問）</span>}
                    <span className="block text-sm text-muted">{disabled ? 'まだ間違えた問題はありません' : m.desc}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {mode !== 'review' && (
          <fieldset className="mt-7">
            <legend className="font-bold tracking-[0.1em]">二、問題数</legend>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {countOptions.map((n) => (
                <label key={n} className="inline-flex cursor-pointer items-center gap-2">
                  <input type="radio" name="count" value={n} checked={count === n} onChange={() => setCount(n)} className="size-4" />
                  {n === questions.length ? `全問（${n}）` : `${n}問`}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {mode === 'practice' && (
          <fieldset className="mt-7">
            <legend className="font-bold tracking-[0.1em]">三、分野</legend>
            <p className="mt-1 text-sm text-muted">選ばなければ、すべての分野から出題します。</p>
            <div className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {set.domains.map((d) => {
                const on = domains.includes(d.id);
                const n = questions.filter((q) => q.domain === d.id).length;
                return (
                  <label key={d.id} className="inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      name="domain"
                      value={d.id}
                      checked={on}
                      onChange={() => setDomains(on ? domains.filter((x) => x !== d.id) : [...domains, d.id])}
                      className="size-4"
                    />
                    {d.name}
                    <span className="text-sm text-muted">（{n}問）</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line pt-5">
          <button type="submit" disabled={plannedCount === 0} className="btn btn-primary px-6">
            {plannedCount}問をはじめる
          </button>
          {mode === 'mock' && (
            <span className="text-sm text-muted">制限時間 {Math.round((plannedCount * MOCK_SECONDS_PER_QUESTION) / 60)} 分</span>
          )}
        </div>
      </form>

      <aside className="space-y-6 text-sm">
        <section className="box p-5">
          <h2 className="border-b border-ink pb-1.5 font-bold tracking-[0.1em]">この問題集の記録</h2>
          <dl className="mt-3 space-y-1.5">
            <div className="flex justify-between">
              <dt className="text-muted">解いた問題</dt>
              <dd className="tabular-nums">
                {stat.answered} / {stat.total} 問
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">正答率</dt>
              <dd className="tabular-nums">{stat.answered ? `${Math.round(stat.accuracy * 100)}%` : '未挑戦'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">苦手な問題</dt>
              <dd className="tabular-nums">{weakIds.length}問</dd>
            </div>
          </dl>
        </section>
        {sidebar}
      </aside>
    </div>
  );
}
