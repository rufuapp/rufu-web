'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MOCK_SECONDS_PER_QUESTION, formatDuration, isCorrect } from '@/lib/quiz/engine';
import { recordAnswer } from '@/lib/quiz/progress';
import { updateProgress } from '@/lib/quiz/store';
import { domainName } from '@/content/question-sets';
import type { AnswerRecord, QuestionSet, QuizMode, SessionQuestion } from '@/lib/quiz/types';
import { CHOICE_LABELS } from './style';

/** テキスト入力中はショートカットを無効にする（ラジオ／チェックボックスは対象外） */
function isTextField(el: HTMLElement | null): boolean {
  if (!el) return false;
  if (el.tagName === 'TEXTAREA' || el.isContentEditable) return true;
  return el instanceof HTMLInputElement && el.type !== 'radio' && el.type !== 'checkbox';
}

type Props = {
  set: QuestionSet;
  session: SessionQuestion[];
  mode: QuizMode;
  onFinish: (answers: AnswerRecord[], elapsedSec: number) => void;
  onQuit: () => void;
};

export function QuizPlayer({ set, session, mode, onFinish, onQuit }: Props) {
  const isMock = mode === 'mock';
  const total = session.length;
  const limitSec = total * MOCK_SECONDS_PER_QUESTION;

  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<number[][]>(() => session.map(() => []));
  const [revealed, setRevealed] = useState<boolean[]>(() => session.map(() => false));
  const [flagged, setFlagged] = useState<boolean[]>(() => session.map(() => false));
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const finishedRef = useRef(false);

  const current = session[index];
  const selected = selections[index];
  const isRevealed = revealed[index];
  const elapsedSec = Math.floor((now - startedAt) / 1000);
  const remainingSec = limitSec - elapsedSec;

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    if (isMock) {
      const at = new Date().toISOString();
      const records = session.map((s, i) => ({
        questionId: s.question.id,
        domain: s.question.domain,
        selected: selections[i],
        correct: isCorrect(s.question, selections[i]),
      }));
      updateProgress((p) => records.reduce((acc, r) => recordAnswer(acc, r, at), p));
      onFinish(records, elapsed);
    } else {
      onFinish(answers, elapsed);
    }
  }, [answers, isMock, onFinish, selections, session, startedAt]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (isMock && remainingSec <= 0) finish();
  }, [finish, isMock, remainingSec]);

  const toggle = useCallback(
    (original: number) => {
      if (isRevealed) return;
      setSelections((prev) => {
        const next = [...prev];
        const cur = next[index];
        if (current.question.type === 'single') next[index] = [original];
        else next[index] = cur.includes(original) ? cur.filter((i) => i !== original) : [...cur, original];
        return next;
      });
    },
    [current, index, isRevealed],
  );

  const submit = useCallback(() => {
    if (isRevealed || selected.length === 0) return;
    const record: AnswerRecord = {
      questionId: current.question.id,
      domain: current.question.domain,
      selected,
      correct: isCorrect(current.question, selected),
    };
    setAnswers((prev) => [...prev, record]);
    updateProgress((p) => recordAnswer(p, record, new Date().toISOString()));
    setRevealed((prev) => prev.map((v, i) => (i === index ? true : v)));
  }, [current, index, isRevealed, selected]);

  const next = useCallback(() => {
    if (index < total - 1) setIndex(index + 1);
    else finish();
  }, [finish, index, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (isTextField(target)) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= current.order.length) {
        toggle(current.order[n - 1]);
        return;
      }
      if (e.key === 'Enter') {
        if (target?.tagName === 'BUTTON' || target?.tagName === 'A') return;
        e.preventDefault();
        if (isMock) next();
        else if (!isRevealed) submit();
        else next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, isMock, isRevealed, next, submit, toggle]);

  const answeredCount = useMemo(() => selections.filter((s) => s.length > 0).length, [selections]);
  const correctSoFar = answers.filter((a) => a.correct).length;
  const q = current.question;
  const wasCorrect = isRevealed && isCorrect(q, selected);
  const lowTime = isMock && remainingSec <= 60;
  const done = isMock ? answeredCount : answers.length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* 進み具合 */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink pb-2 text-sm">
        <p>
          <span className="text-base font-bold">第 {index + 1} 問</span>
          <span className="text-muted"> ／ 全 {total} 問</span>
          <span className="ml-3 text-muted">{domainName(set, q.domain)}</span>
        </p>
        <div className="flex items-center gap-4">
          {isMock ? (
            <span role="timer" aria-label="残り時間" className={`tabular-nums ${lowTime ? 'font-bold text-ng' : ''}`}>
              残り {formatDuration(remainingSec)}
            </span>
          ) : (
            <span className="text-muted">
              正解 <span className="font-bold text-ok tabular-nums">{correctSoFar}</span> ／ {answers.length}
            </span>
          )}
          <button type="button" popoverTarget="kbd-help" className="btn btn-quiet hidden px-0 py-0 text-sm sm:inline-flex">
            キー操作
          </button>
          <button type="button" onClick={() => setConfirmQuit(true)} className="btn btn-quiet px-0 py-0 text-sm">
            中断
          </button>
        </div>
      </div>
      <div
        role="progressbar"
        aria-label="進み具合"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className="h-[3px] w-full bg-line"
      >
        <div className="h-full bg-brand transition-[width] duration-300" style={{ width: `${(done / total) * 100}%` }} />
      </div>

      {confirmQuit && (
        <div className="box mt-4 flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <span>中断しますか。{isMock ? '模試の解答は記録されません。' : 'ここまでの解答は記録済みです。'}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirmQuit(false)} className="btn btn-outline px-4 py-1.5 text-sm">
              続ける
            </button>
            <button type="button" onClick={onQuit} className="btn btn-outline border-ng px-4 py-1.5 text-sm text-ng">
              中断する
            </button>
          </div>
        </div>
      )}

      {/* 問題 */}
      <article key={q.id} className="box mt-6 p-5 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-muted">
            {q.type === 'multi' ? `正しいものを${q.answer.length}つ選べ。` : '最も適切なものを1つ選べ。'}
          </p>
          {isMock && (
            <button
              type="button"
              aria-pressed={flagged[index]}
              onClick={() => setFlagged((prev) => prev.map((v, i) => (i === index ? !v : v)))}
              className={`btn shrink-0 px-2 py-0 text-xs ${flagged[index] ? 'btn-outline border-warn text-warn' : 'btn-quiet'}`}
            >
              {flagged[index] ? '★ 見直す' : '☆ 見直しに印'}
            </button>
          )}
        </div>
        <h2 id={`q-${q.id}`} className="mt-2 text-lg leading-relaxed break-words">
          {q.question}
        </h2>
        {q.passage && (
          <blockquote lang="en" className="mt-4 border-l-4 border-line-strong pl-4 text-lg leading-relaxed italic break-words">
            {q.passage}
          </blockquote>
        )}
        {q.code && (
          <pre className="mt-4 overflow-x-auto border border-line bg-subtle p-4 text-[13px] leading-relaxed">
            <code>{q.code}</code>
          </pre>
        )}

        <fieldset disabled={isRevealed} aria-labelledby={`q-${q.id}`} className="mt-6 space-y-2">
          {current.order.map((original, pos) => {
            const isSel = selected.includes(original);
            const isAns = q.answer.includes(original);
            let state = 'border-line hover:bg-subtle has-checked:border-brand has-checked:bg-subtle';
            let mark: React.ReactNode = null;
            if (isRevealed) {
              if (isAns) {
                state = 'border-ok bg-ok/5';
                mark = <span className="shrink-0 text-sm font-bold text-ok">正解</span>;
              } else if (isSel) {
                state = 'border-ng bg-ng/5';
                mark = <span className="shrink-0 text-sm font-bold text-ng">誤答</span>;
              } else {
                state = 'border-line opacity-60';
              }
            }
            return (
              <label
                key={original}
                className={`flex cursor-pointer items-start gap-3 border px-4 py-3 leading-relaxed has-disabled:cursor-default ${state}`}
              >
                <input
                  type={q.type === 'single' ? 'radio' : 'checkbox'}
                  name={`q-${q.id}`}
                  value={original}
                  checked={isSel}
                  onChange={() => toggle(original)}
                  className="mt-[0.5rem] size-4 shrink-0"
                />
                <span className="w-5 shrink-0 font-bold">{CHOICE_LABELS[pos]}</span>
                <span className="flex-1 break-words">{q.choices[original]}</span>
                {mark}
              </label>
            );
          })}
        </fieldset>

        {isRevealed && (
          <div
            role="status"
            className="mt-6 border-l-4 bg-subtle py-4 pr-4 pl-5 leading-relaxed"
            style={{ borderColor: wasCorrect ? 'var(--d-ok)' : 'var(--d-ng)' }}
          >
            <p className={`text-lg font-bold ${wasCorrect ? 'text-ok' : 'text-ng'}`}>
              <span aria-hidden>{wasCorrect ? '◯ ' : '✕ '}</span>
              <span>{wasCorrect ? '正解です' : '不正解です'}</span>
            </p>
            <p className="mt-2">
              <span className="font-bold">【解説】</span>
              {q.explanation}
            </p>
          </div>
        )}
      </article>

      {/* 操作 */}
      <div className="mt-6 flex items-center gap-3">
        {isMock && (
          <button type="button" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0} className="btn btn-outline">
            前の問題
          </button>
        )}
        <div className="ml-auto flex gap-2">
          {isMock && index === total - 1 ? (
            <button type="button" onClick={finish} className="btn btn-primary px-6">
              採点する（{answeredCount}/{total} 解答済み）
            </button>
          ) : isMock ? (
            <button type="button" onClick={next} className="btn btn-primary px-6">
              次の問題
            </button>
          ) : !isRevealed ? (
            <button type="button" onClick={submit} disabled={selected.length === 0} className="btn btn-primary px-6">
              解答する
            </button>
          ) : (
            <button type="button" onClick={next} className="btn btn-primary px-6">
              {index < total - 1 ? '次の問題へ' : '結果を見る'}
            </button>
          )}
        </div>
      </div>

      {/* 模試の解答状況 */}
      {isMock && (
        <nav aria-label="解答状況" className="mt-10">
          <h3 className="border-b border-ink pb-1 text-sm font-bold tracking-[0.1em]">解答状況</h3>
          <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1.5">
            {session.map((s, i) => {
              const answered = selections[i].length > 0;
              return (
                <button
                  key={s.question.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? 'step' : undefined}
                  className={`relative grid aspect-square place-items-center border text-sm tabular-nums ${
                    i === index ? 'border-2 border-brand' : 'border-line'
                  } ${answered ? 'bg-subtle' : 'bg-card text-muted'}`}
                  aria-label={`第 ${i + 1} 問${answered ? '（解答済み）' : ''}${flagged[i] ? '（見直す）' : ''}`}
                >
                  {i + 1}
                  {flagged[i] && <span className="absolute -top-2 -right-1 text-xs text-warn">★</span>}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted">網かけは解答済み、★ は見直しの印です。</p>
        </nav>
      )}

      {/* キー操作の説明（popover 属性で開閉） */}
      <div id="kbd-help" popover="auto" className="m-auto w-[min(22rem,calc(100vw-2rem))] p-5 text-sm">
        <h3 className="border-b border-ink pb-1 font-bold">キー操作</h3>
        <dl className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">選択肢を選ぶ</dt>
            <dd>
              <kbd>1</kbd> 〜 <kbd>{current.order.length}</kbd>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">{isMock ? '次の問題へ' : '解答する／次の問題へ'}</dt>
            <dd>
              <kbd>Enter</kbd>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">この説明を閉じる</dt>
            <dd>
              <kbd>Esc</kbd>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
