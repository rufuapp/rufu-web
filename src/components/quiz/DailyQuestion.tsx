'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getExam, TRACKS } from '@/content/exams';
import { QUESTIONS } from '@/content/questions';
import { isCorrect, pickDaily } from '@/lib/quiz/engine';
import { localDate, recordAnswer } from '@/lib/quiz/progress';
import { updateProgress, useIsClient } from '@/lib/quiz/store';

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

function DailyBody({ today }: { today: string }) {
  const q = pickDaily(QUESTIONS, today)!;
  const exam = getExam(q.examId)!;
  const [selected, setSelected] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const correct = revealed && isCorrect(q, selected);

  const submit = () => {
    if (selected.length === 0) return;
    const ok = isCorrect(q, selected);
    updateProgress((p) => recordAnswer(p, { questionId: q.id, domain: q.domain, selected, correct: ok }, new Date().toISOString()));
    setRevealed(true);
  };

  return (
    <div className="rounded-2xl p-5 sm:p-7 theme-card">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full px-2.5 py-0.5 font-bold" style={{ backgroundColor: 'var(--surf2)', color: 'var(--acc)' }}>
          今日の1問・{today.replaceAll('-', '/')}
        </span>
        <span style={{ color: TRACKS[exam.track].accent }}>{exam.shortTitle}</span>
      </div>
      <p className="font-semibold leading-relaxed">{q.question}</p>
      {q.code && (
        <pre className="mt-3 overflow-x-auto rounded-lg p-3 font-mono text-xs" style={{ backgroundColor: 'var(--bg)' }}>
          <code>{q.code}</code>
        </pre>
      )}
      {q.type === 'multi' && (
        <p className="mt-1 text-xs" style={{ color: 'var(--txts)' }}>
          正しいものを{q.answer.length}つ選択
        </p>
      )}
      <ul className="mt-4 space-y-2">
        {q.choices.map((c, i) => {
          const sel = selected.includes(i);
          const ans = q.answer.includes(i);
          const border = revealed ? (ans ? 'var(--ok)' : sel ? 'var(--ng)' : 'var(--bor)') : sel ? 'var(--acc)' : 'var(--bor)';
          return (
            <li key={i}>
              <button
                type="button"
                disabled={revealed}
                aria-pressed={sel}
                onClick={() =>
                  setSelected(q.type === 'single' ? [i] : sel ? selected.filter((x) => x !== i) : [...selected, i])
                }
                className="flex w-full gap-3 rounded-xl px-4 py-2.5 text-left text-sm enabled:hover:bg-white/5"
                style={{ border: `1.5px solid ${border}` }}
              >
                <span className="font-bold" style={{ color: 'var(--txts)' }}>
                  {LABELS[i]}
                </span>
                <span className="flex-1">{c}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {revealed ? (
        <div className="drill-pop mt-4 text-sm leading-relaxed">
          <p className="font-bold" style={{ color: correct ? 'var(--ok)' : 'var(--ng)' }}>
            {correct ? '◯ 正解！' : '✕ 不正解'}
          </p>
          <p className="mt-1" style={{ color: 'var(--txts)' }}>
            {q.explanation}
          </p>
          <Link href={`/exams/${exam.id}`} className="mt-3 inline-block font-semibold" style={{ color: 'var(--acc)' }}>
            {exam.shortTitle} をもっと解く →
          </Link>
        </div>
      ) : (
        <button
          type="button"
          onClick={submit}
          disabled={selected.length === 0}
          className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-40"
          style={{ backgroundColor: 'var(--acc)', color: 'var(--bg)' }}
        >
          回答する
        </button>
      )}
    </div>
  );
}

export function DailyQuestion() {
  const isClient = useIsClient();
  if (!isClient) return <div className="h-80 animate-pulse rounded-2xl theme-card" aria-hidden />;
  return <DailyBody today={localDate()} />;
}
