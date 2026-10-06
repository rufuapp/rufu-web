'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MOCK_SECONDS_PER_QUESTION, formatDuration, isCorrect } from '@/lib/quiz/engine';
import { recordAnswer } from '@/lib/quiz/progress';
import { updateProgress } from '@/lib/quiz/store';
import { domainName } from '@/content/exams';
import type { AnswerRecord, Exam, QuizMode, SessionQuestion } from '@/lib/quiz/types';

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

type Props = {
  exam: Exam;
  session: SessionQuestion[];
  mode: QuizMode;
  onFinish: (answers: AnswerRecord[], elapsedSec: number) => void;
  onQuit: () => void;
};

export function QuizPlayer({ exam, session, mode, onFinish, onQuit }: Props) {
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
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= current.order.length) {
        toggle(current.order[n - 1]);
        return;
      }
      if (e.key === 'Enter') {
        if (target?.tagName === 'BUTTON') return;
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

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* ステータスバー */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <span className="font-mono font-semibold">
            {index + 1} / {total}
          </span>
          <span className="rounded-full px-2.5 py-0.5 text-xs" style={{ backgroundColor: 'var(--surf2)', color: 'var(--txts)' }}>
            {domainName(exam, q.domain)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isMock ? (
            <span
              className="font-mono font-semibold tabular-nums"
              style={{ color: lowTime ? 'var(--ng)' : 'var(--txt)' }}
              aria-label="残り時間"
            >
              ⏱ {formatDuration(remainingSec)}
            </span>
          ) : (
            <span style={{ color: 'var(--txts)' }}>
              正解 <span className="font-semibold" style={{ color: 'var(--ok)' }}>{correctSoFar}</span> / {answers.length}
            </span>
          )}
          <button
            type="button"
            onClick={() => setConfirmQuit(true)}
            className="rounded-lg px-2.5 py-1 text-xs hover:bg-white/5"
            style={{ color: 'var(--txts)' }}
          >
            中断
          </button>
        </div>
      </div>

      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--surf2)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${((isMock ? answeredCount : answers.length) / total) * 100}%`,
            backgroundColor: 'var(--acc)',
          }}
        />
      </div>

      {confirmQuit && (
        <div className="drill-pop mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 text-sm theme-card">
          <span>中断しますか？{isMock ? '模試の解答は記録されません。' : 'ここまでの解答は記録済みです。'}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirmQuit(false)} className="rounded-lg px-3 py-1.5 hover:bg-white/5">
              続ける
            </button>
            <button
              type="button"
              onClick={onQuit}
              className="rounded-lg px-3 py-1.5 font-semibold"
              style={{ backgroundColor: 'var(--ng)', color: '#1a0505' }}
            >
              中断する
            </button>
          </div>
        </div>
      )}

      {/* 問題 */}
      <article key={q.id} className="drill-pop rounded-2xl p-5 sm:p-7 theme-card">
        <div className="mb-1 flex items-center justify-between gap-2 text-xs" style={{ color: 'var(--txts)' }}>
          <span>{q.type === 'multi' ? `正しいものを${q.answer.length}つ選択` : '1つ選択'}</span>
          {isMock && (
            <button
              type="button"
              onClick={() => setFlagged((prev) => prev.map((v, i) => (i === index ? !v : v)))}
              className="rounded-md px-2 py-1 hover:bg-white/5"
              style={{ color: flagged[index] ? 'var(--warn)' : 'var(--txts)' }}
              aria-pressed={flagged[index]}
            >
              {flagged[index] ? '★ 見直し' : '☆ 見直しに追加'}
            </button>
          )}
        </div>
        <h2 className="text-base font-semibold leading-relaxed sm:text-lg">{q.question}</h2>
        {q.code && (
          <pre
            className="mt-4 overflow-x-auto rounded-lg p-4 font-mono text-sm leading-relaxed"
            style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bor)' }}
          >
            <code>{q.code}</code>
          </pre>
        )}

        <ul className="mt-5 space-y-2.5">
          {current.order.map((original, pos) => {
            const isSel = selected.includes(original);
            const isAns = q.answer.includes(original);
            let border = isSel ? 'var(--acc)' : 'var(--bor)';
            let bg = isSel ? 'rgba(74,222,128,0.08)' : 'transparent';
            let mark: string | null = null;
            if (isRevealed) {
              if (isAns) {
                border = 'var(--ok)';
                bg = 'rgba(74,222,128,0.12)';
                mark = '正解';
              } else if (isSel) {
                border = 'var(--ng)';
                bg = 'rgba(248,113,113,0.1)';
                mark = 'あなたの解答';
              } else {
                border = 'var(--bor)';
                bg = 'transparent';
              }
            }
            return (
              <li key={original}>
                <button
                  type="button"
                  onClick={() => toggle(original)}
                  disabled={isRevealed}
                  aria-pressed={isSel}
                  className="flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left text-sm leading-relaxed transition-colors enabled:hover:bg-white/5 sm:text-[15px]"
                  style={{ border: `1.5px solid ${border}`, backgroundColor: bg }}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold ${q.type === 'multi' ? 'rounded-md' : 'rounded-full'}`}
                    style={{
                      backgroundColor: isSel ? 'var(--acc)' : 'var(--surf2)',
                      color: isSel ? 'var(--bg)' : 'var(--txts)',
                    }}
                  >
                    {LABELS[pos]}
                  </span>
                  <span className="flex-1 break-words">{q.choices[original]}</span>
                  {mark && (
                    <span className="shrink-0 text-xs font-semibold" style={{ color: isAns ? 'var(--ok)' : 'var(--ng)' }}>
                      {mark}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {isRevealed && (
          <div
            className="drill-pop mt-5 rounded-xl p-4 text-sm leading-relaxed"
            style={{
              backgroundColor: wasCorrect ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
              border: `1px solid ${wasCorrect ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
            }}
          >
            <p className="mb-1.5 font-bold" style={{ color: wasCorrect ? 'var(--ok)' : 'var(--ng)' }}>
              {wasCorrect ? '◯ 正解' : '✕ 不正解'}
            </p>
            <p>{q.explanation}</p>
          </div>
        )}
      </article>

      {/* 操作 */}
      <div className="mt-5 flex items-center justify-between gap-3">
        {isMock ? (
          <button
            type="button"
            onClick={() => setIndex(Math.max(0, index - 1))}
            disabled={index === 0}
            className="rounded-xl px-4 py-2.5 text-sm hover:bg-white/5 disabled:opacity-30"
          >
            ← 前へ
          </button>
        ) : (
          <span className="hidden text-xs sm:block" style={{ color: 'var(--txts)' }}>
            キーボード: 1〜{current.order.length} で選択、Enter で{isRevealed ? '次へ' : '回答'}
          </span>
        )}
        <div className="ml-auto flex gap-2">
          {isMock && index === total - 1 ? (
            <button
              type="button"
              onClick={finish}
              className="rounded-xl px-5 py-2.5 text-sm font-bold"
              style={{ backgroundColor: 'var(--acc)', color: 'var(--bg)' }}
            >
              採点する（{answeredCount}/{total} 解答済み）
            </button>
          ) : isMock ? (
            <button
              type="button"
              onClick={next}
              className="rounded-xl px-5 py-2.5 text-sm font-bold"
              style={{ backgroundColor: 'var(--acc)', color: 'var(--bg)' }}
            >
              次へ →
            </button>
          ) : !isRevealed ? (
            <button
              type="button"
              onClick={submit}
              disabled={selected.length === 0}
              className="rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-40"
              style={{ backgroundColor: 'var(--acc)', color: 'var(--bg)' }}
            >
              回答する
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="rounded-xl px-5 py-2.5 text-sm font-bold"
              style={{ backgroundColor: 'var(--acc)', color: 'var(--bg)' }}
            >
              {index < total - 1 ? '次の問題 →' : '結果を見る'}
            </button>
          )}
        </div>
      </div>

      {/* 模試の問題ナビ */}
      {isMock && (
        <nav aria-label="問題一覧" className="mt-8 flex flex-wrap gap-1.5">
          {session.map((s, i) => {
            const done = selections[i].length > 0;
            return (
              <button
                key={s.question.id}
                type="button"
                onClick={() => setIndex(i)}
                className="relative h-9 w-9 rounded-lg font-mono text-xs"
                style={{
                  backgroundColor: done ? 'var(--surf2)' : 'transparent',
                  border: `1.5px solid ${i === index ? 'var(--acc)' : 'var(--bor)'}`,
                  color: done ? 'var(--txt)' : 'var(--txts)',
                }}
                aria-label={`問題 ${i + 1}${done ? '（解答済み）' : ''}${flagged[i] ? '（見直し）' : ''}`}
              >
                {i + 1}
                {flagged[i] && <span className="absolute -right-1 -top-1.5 text-[10px]" style={{ color: 'var(--warn)' }}>★</span>}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
