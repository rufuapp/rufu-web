'use client';

import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MOCK_SECONDS_PER_QUESTION, buildSession } from '@/lib/quiz/engine';
import { examStat, localDate, recordSession, weakQuestionIds } from '@/lib/quiz/progress';
import { updateProgress, useProgress } from '@/lib/quiz/store';
import type { AnswerRecord, Exam, Question, QuizMode, SessionQuestion } from '@/lib/quiz/types';
import { QuizPlayer } from './QuizPlayer';
import { ResultView } from './ResultView';

const MODES: { id: QuizMode; name: string; desc: string }[] = [
  { id: 'practice', name: '練習', desc: '1問ごとに正誤と解説を表示' },
  { id: 'mock', name: '模試', desc: '制限時間つき・最後にまとめて採点' },
  { id: 'review', name: '苦手克服', desc: '直近で間違えた問題だけを出題' },
];

type Phase = 'setup' | 'play' | 'result';

export function ExamClient({ exam, questions }: { exam: Exam; questions: Question[] }) {
  const searchParams = useSearchParams();
  const progress = useProgress();
  const [phase, setPhase] = useState<Phase>('setup');
  const [mode, setMode] = useState<QuizMode>(searchParams.get('mode') === 'review' ? 'review' : 'practice');
  const [count, setCount] = useState(10);
  const [domains, setDomains] = useState<string[]>([]);
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
            examId: exam.id,
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
    [exam.id, playMode],
  );

  if (phase === 'play') {
    return (
      <QuizPlayer
        key={runId}
        exam={exam}
        session={session}
        mode={playMode}
        onFinish={handleFinish}
        onQuit={() => setPhase('setup')}
      />
    );
  }

  if (phase === 'result') {
    return (
      <ResultView
        exam={exam}
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
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startFromSetup();
        }}
        className="card p-6 sm:p-8"
      >
        <fieldset>
          <legend className="text-sm font-bold">モード</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {MODES.map((m) => {
              const disabled = m.id === 'review' && weakIds.length === 0;
              return (
                <label
                  key={m.id}
                  className="flex cursor-pointer flex-col rounded-xl p-4 ring-1 ring-line transition hover:bg-subtle has-checked:bg-brand/5 has-checked:ring-2 has-checked:ring-brand has-disabled:cursor-not-allowed has-disabled:opacity-50 has-disabled:hover:bg-transparent"
                >
                  <input
                    type="radio"
                    name="mode"
                    value={m.id}
                    checked={mode === m.id}
                    disabled={disabled}
                    onChange={() => setMode(m.id)}
                    className="sr-only"
                  />
                  <span className="flex items-center justify-between gap-2 font-bold">
                    {m.name}
                    {m.id === 'review' && (
                      <span className={`chip ${weakIds.length ? 'bg-warn/10 text-warn' : 'bg-subtle text-muted'}`}>{weakIds.length}問</span>
                    )}
                  </span>
                  <span className="mt-1 text-xs leading-relaxed text-muted">{disabled ? 'まだ間違えた問題はありません' : m.desc}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {mode !== 'review' && (
          <fieldset className="mt-8">
            <legend className="text-sm font-bold">問題数</legend>
            <div className="mt-3 inline-flex flex-wrap gap-1 rounded-full bg-subtle p-1 ring-1 ring-line">
              {countOptions.map((n) => (
                <label
                  key={n}
                  className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold text-muted transition hover:text-ink has-checked:bg-card has-checked:text-ink has-checked:shadow-soft"
                >
                  <input type="radio" name="count" value={n} checked={count === n} onChange={() => setCount(n)} className="sr-only" />
                  {n === questions.length ? `全問（${n}）` : `${n}問`}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {mode === 'practice' && (
          <fieldset className="mt-8">
            <legend className="text-sm font-bold">分野で絞り込む</legend>
            <p className="mt-1 text-xs text-muted">未選択なら、すべての分野から出題します</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {exam.domains.map((d) => {
                const on = domains.includes(d.id);
                const n = questions.filter((q) => q.domain === d.id).length;
                return (
                  <label
                    key={d.id}
                    className="chip cursor-pointer bg-card px-3.5 py-1.5 text-[13px] text-ink ring-1 ring-line transition hover:bg-subtle has-checked:bg-brand has-checked:text-white has-checked:ring-brand"
                  >
                    <input
                      type="checkbox"
                      name="domain"
                      value={d.id}
                      checked={on}
                      onChange={() => setDomains(on ? domains.filter((x) => x !== d.id) : [...domains, d.id])}
                      className="sr-only"
                    />
                    {d.name}
                    <span className="tabular-nums opacity-60">{n}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-line pt-6">
          <button type="submit" disabled={plannedCount === 0} className="btn btn-primary btn-lg">
            {plannedCount}問をはじめる
          </button>
          {mode === 'mock' && (
            <span className="text-sm text-muted">制限時間 {Math.round((plannedCount * MOCK_SECONDS_PER_QUESTION) / 60)} 分</span>
          )}
        </div>
      </form>

      <aside className="space-y-4">
        <div className="card p-6">
          <h2 className="text-sm font-bold">この試験の記録</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-subtle p-3">
              <dt className="text-[11px] text-muted">解いた問題</dt>
              <dd className="mt-0.5 text-2xl font-black tabular-nums">
                {stat.answered}
                <span className="text-xs font-semibold text-muted">/{stat.total}</span>
              </dd>
            </div>
            <div className="rounded-xl bg-subtle p-3">
              <dt className="text-[11px] text-muted">正答率</dt>
              <dd className="mt-0.5 text-2xl font-black tabular-nums">
                {stat.answered ? `${Math.round(stat.accuracy * 100)}%` : <span className="text-sm font-semibold text-muted">未挑戦</span>}
              </dd>
            </div>
          </dl>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-subtle">
            <div className="bar-fill h-full rounded-full bg-brand" style={{ width: `${(stat.answered / Math.max(1, stat.total)) * 100}%` }} />
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-sm font-bold">出題分野</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {exam.domains.map((d) => (
              <li key={d.id} className="flex justify-between gap-2">
                <span>{d.name}</span>
                <span className="text-muted tabular-nums">{questions.filter((q) => q.domain === d.id).length}問</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
