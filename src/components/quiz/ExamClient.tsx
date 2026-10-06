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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <section className="rounded-2xl p-5 sm:p-7 theme-card">
        <h2 className="mb-4 text-sm font-bold">モードを選ぶ</h2>
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="モード">
          {MODES.map((m) => {
            const active = mode === m.id;
            const disabled = m.id === 'review' && weakIds.length === 0;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                onClick={() => setMode(m.id)}
                className="rounded-xl p-4 text-left transition-colors enabled:hover:bg-white/5 disabled:opacity-40"
                style={{ border: `1.5px solid ${active ? 'var(--acc)' : 'var(--bor)'}`, backgroundColor: active ? 'rgba(74,222,128,0.06)' : 'transparent' }}
              >
                <span className="block font-bold">
                  {m.name}
                  {m.id === 'review' && (
                    <span className="ml-1.5 text-xs font-semibold" style={{ color: weakIds.length ? 'var(--warn)' : 'var(--txts)' }}>
                      {weakIds.length}問
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-xs leading-relaxed" style={{ color: 'var(--txts)' }}>
                  {disabled ? 'まだ間違えた問題はありません' : m.desc}
                </span>
              </button>
            );
          })}
        </div>

        {mode !== 'review' && (
          <>
            <h2 className="mb-3 mt-7 text-sm font-bold">問題数</h2>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 20, questions.length]
                .filter((n, i, arr) => n <= questions.length && arr.indexOf(n) === i)
                .map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    aria-pressed={count === n}
                    className="rounded-lg px-4 py-2 text-sm font-semibold"
                    style={{ border: `1.5px solid ${count === n ? 'var(--acc)' : 'var(--bor)'}`, color: count === n ? 'var(--acc)' : 'var(--txt)' }}
                  >
                    {n === questions.length ? `全問（${n}）` : `${n}問`}
                  </button>
                ))}
            </div>
          </>
        )}

        {mode === 'practice' && (
          <>
            <h2 className="mb-1 mt-7 text-sm font-bold">分野で絞り込む</h2>
            <p className="mb-3 text-xs" style={{ color: 'var(--txts)' }}>
              未選択ならすべての分野から出題します
            </p>
            <div className="flex flex-wrap gap-2">
              {exam.domains.map((d) => {
                const on = domains.includes(d.id);
                const n = questions.filter((q) => q.domain === d.id).length;
                return (
                  <button
                    key={d.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setDomains(on ? domains.filter((x) => x !== d.id) : [...domains, d.id])}
                    className="rounded-full px-3.5 py-1.5 text-xs font-semibold"
                    style={{
                      border: `1.5px solid ${on ? 'var(--acc)' : 'var(--bor)'}`,
                      backgroundColor: on ? 'rgba(74,222,128,0.1)' : 'transparent',
                      color: on ? 'var(--acc)' : 'var(--txt)',
                    }}
                  >
                    {d.name}
                    <span className="ml-1 opacity-60">{n}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={startFromSetup}
            disabled={plannedCount === 0}
            className="rounded-xl px-7 py-3 text-base font-bold disabled:opacity-40"
            style={{ backgroundColor: 'var(--acc)', color: 'var(--bg)' }}
          >
            {plannedCount}問をはじめる
          </button>
          {mode === 'mock' && (
            <span className="text-sm" style={{ color: 'var(--txts)' }}>
              制限時間 {Math.round((plannedCount * MOCK_SECONDS_PER_QUESTION) / 60)} 分
            </span>
          )}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl p-5 theme-card">
          <h2 className="mb-3 text-sm font-bold">この試験の記録</h2>
          <dl className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--surf2)' }}>
              <dt className="text-[11px]" style={{ color: 'var(--txts)' }}>解いた問題</dt>
              <dd className="text-xl font-bold tabular-nums">
                {stat.answered}
                <span className="text-xs font-normal" style={{ color: 'var(--txts)' }}>/{stat.total}</span>
              </dd>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--surf2)' }}>
              <dt className="text-[11px]" style={{ color: 'var(--txts)' }}>正答率</dt>
              <dd className="text-xl font-bold tabular-nums">{stat.answered ? `${Math.round(stat.accuracy * 100)}%` : '—'}</dd>
            </div>
          </dl>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--surf2)' }}>
            <div className="h-full rounded-full" style={{ width: `${(stat.answered / Math.max(1, stat.total)) * 100}%`, backgroundColor: 'var(--acc)' }} />
          </div>
        </div>
        <div className="rounded-2xl p-5 text-sm leading-relaxed theme-card">
          <h2 className="mb-2 font-bold">出題分野</h2>
          <ul className="space-y-1" style={{ color: 'var(--txts)' }}>
            {exam.domains.map((d) => (
              <li key={d.id}>・{d.name}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
