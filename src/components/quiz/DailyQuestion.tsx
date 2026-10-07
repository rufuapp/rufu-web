'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getQuestionSet } from '@/content/question-sets';
import { QUESTIONS } from '@/content/questions';
import { topicForDomain } from '@/content/catalog';
import { isCorrect, pickDaily } from '@/lib/quiz/engine';
import { localDate, recordAnswer } from '@/lib/quiz/progress';
import { updateProgress, useIsClient } from '@/lib/quiz/store';
import { CHOICE_LABELS } from './style';

// 英単語の問題集は、今日の一問には出さない
const DAILY_POOL = QUESTIONS.filter((q) => getQuestionSet(q.examId)?.kind !== 'vocabulary');

function DailyBody({ today }: { today: string }) {
  const q = pickDaily(DAILY_POOL, today)!;
  const set = getQuestionSet(q.examId)!;
  const topic = topicForDomain(set.id, q.domain);
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
    <div className="box p-5 sm:p-6">
      <p className="flex items-baseline justify-between border-b border-ink pb-2">
        <span className="font-bold tracking-[0.2em]">今日の一問</span>
        <span className="text-xs text-muted tabular-nums">{today.replaceAll('-', '.')}</span>
      </p>
      <p className="mt-2 text-xs text-muted">
        出典：
        <Link href={`/question-sets/${set.id}`} className="link">
          {set.title}
        </Link>
      </p>
      <p id="daily-q" className="mt-3 leading-relaxed font-bold break-words">
        {q.question}
        <span className="ml-1 text-sm font-normal text-muted">
          {q.type === 'multi' ? `（正しいものを${q.answer.length}つ選べ）` : '（1つ選べ）'}
        </span>
      </p>
      {q.code && (
        <pre className="mt-3 overflow-x-auto border border-line bg-subtle p-3 text-xs leading-relaxed">
          <code>{q.code}</code>
        </pre>
      )}

      <fieldset disabled={revealed} aria-labelledby="daily-q" className="mt-4 space-y-1.5">
        {q.choices.map((c, i) => {
          const sel = selected.includes(i);
          const ans = q.answer.includes(i);
          const state = revealed
            ? ans
              ? 'border-ok bg-ok/5'
              : sel
                ? 'border-ng bg-ng/5'
                : 'border-line opacity-60'
            : 'border-line hover:bg-subtle has-checked:border-brand has-checked:bg-subtle';
          return (
            <label key={i} className={`flex cursor-pointer items-start gap-2.5 border px-3 py-2 text-sm has-disabled:cursor-default ${state}`}>
              <input
                type={q.type === 'single' ? 'radio' : 'checkbox'}
                name="daily"
                checked={sel}
                onChange={() => setSelected(q.type === 'single' ? [i] : sel ? selected.filter((x) => x !== i) : [...selected, i])}
                className="mt-[0.4rem] size-3.5 shrink-0"
              />
              <span className="w-4 shrink-0 font-bold">{CHOICE_LABELS[i]}</span>
              <span className="flex-1 break-words">{c}</span>
            </label>
          );
        })}
      </fieldset>

      {revealed ? (
        <div className="mt-4 border-l-4 bg-subtle py-3 pr-3 pl-4 text-sm leading-relaxed" style={{ borderColor: correct ? 'var(--d-ok)' : 'var(--d-ng)' }}>
          <p className={`font-bold ${correct ? 'text-ok' : 'text-ng'}`}>{correct ? '◯ 正解です' : '✕ 不正解です'}</p>
          <p className="mt-1">
            <span className="font-bold">【解説】</span>
            {q.explanation}
          </p>
          <p className="mt-2 space-x-4">
            <Link href={`/question-sets/${set.id}`} className="link">
              この問題集を解く
            </Link>
            {topic && (
              <Link href={`/study/${topic.id}`} className="link">
                学習ガイド「{topic.title}」
              </Link>
            )}
          </p>
        </div>
      ) : (
        <button type="button" onClick={submit} disabled={selected.length === 0} className="btn btn-primary mt-4">
          解答する
        </button>
      )}
    </div>
  );
}

export function DailyQuestion() {
  const isClient = useIsClient();
  return (
    <div id="daily" className="scroll-mt-6">
      {isClient ? <DailyBody today={localDate()} /> : <div className="box h-96" aria-hidden />}
    </div>
  );
}
