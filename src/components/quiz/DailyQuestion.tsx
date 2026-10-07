'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getExam, TRACKS } from '@/content/exams';
import { QUESTIONS } from '@/content/questions';
import { isCorrect, pickDaily } from '@/lib/quiz/engine';
import { localDate, recordAnswer } from '@/lib/quiz/progress';
import { updateProgress, useIsClient } from '@/lib/quiz/store';
import { CHOICE_LABELS, tint } from './style';

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
    <div className="card p-6 shadow-lift sm:p-7">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="chip bg-ink text-white">今日の1問</span>
        <span className="text-muted tabular-nums">{today.replaceAll('-', '/')}</span>
        <span className="chip tint ml-auto" style={tint(TRACKS[exam.track].accent)}>
          {exam.shortTitle}
        </span>
      </div>
      <p id="daily-q" className="mt-4 leading-relaxed font-semibold break-words">
        {q.question}
      </p>
      {q.code && (
        <pre className="mt-3 overflow-x-auto rounded-xl bg-subtle p-3 font-mono text-xs leading-relaxed ring-1 ring-line">
          <code>{q.code}</code>
        </pre>
      )}
      {q.type === 'multi' && <p className="mt-1 text-xs text-muted">正しいものを{q.answer.length}つ選択</p>}

      <fieldset disabled={revealed} aria-labelledby="daily-q" className="mt-4 space-y-2">
        {q.choices.map((c, i) => {
          const sel = selected.includes(i);
          const ans = q.answer.includes(i);
          const state = revealed
            ? ans
              ? 'bg-ok/5 ring-2 ring-ok/60'
              : sel
                ? 'bg-ng/5 ring-2 ring-ng/60'
                : 'opacity-55 ring-1 ring-line'
            : 'ring-1 ring-line hover:bg-subtle has-checked:bg-brand/5 has-checked:ring-2 has-checked:ring-brand';
          return (
            <label
              key={i}
              className={`group flex cursor-pointer items-start gap-3 rounded-xl px-3.5 py-2.5 text-sm transition has-disabled:cursor-default ${state}`}
            >
              <input
                type={q.type === 'single' ? 'radio' : 'checkbox'}
                name="daily"
                checked={sel}
                onChange={() => setSelected(q.type === 'single' ? [i] : sel ? selected.filter((x) => x !== i) : [...selected, i])}
                className="sr-only"
              />
              <span
                className={`grid size-6 shrink-0 place-items-center text-xs font-bold transition-colors ${
                  q.type === 'multi' ? 'rounded-md' : 'rounded-full'
                } bg-subtle text-muted group-has-checked:bg-brand group-has-checked:text-white`}
              >
                {CHOICE_LABELS[i]}
              </span>
              <span className="flex-1 pt-0.5 break-words">{c}</span>
            </label>
          );
        })}
      </fieldset>

      {revealed ? (
        <div className="drill-enter mt-4 rounded-xl bg-subtle p-4 text-sm leading-relaxed">
          <p className={`font-bold ${correct ? 'text-ok' : 'text-ng'}`}>{correct ? '正解！' : '残念、不正解'}</p>
          <p className="mt-1 text-muted">{q.explanation}</p>
          <Link href={`/exams/${exam.id}`} className="mt-3 inline-flex items-center gap-1 font-semibold text-brand hover:underline">
            {exam.shortTitle} をもっと解く <span aria-hidden>→</span>
          </Link>
        </div>
      ) : (
        <button type="button" onClick={submit} disabled={selected.length === 0} className="btn btn-primary mt-5">
          回答する
        </button>
      )}
    </div>
  );
}

export function DailyQuestion() {
  const isClient = useIsClient();
  return (
    <div id="daily" className="scroll-mt-24">
      {isClient ? <DailyBody today={localDate()} /> : <div className="card h-96 animate-pulse" aria-hidden />}
    </div>
  );
}
