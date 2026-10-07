'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MOCK_SECONDS_PER_QUESTION, formatDuration, isCorrect } from '@/lib/quiz/engine';
import { recordAnswer } from '@/lib/quiz/progress';
import { updateProgress } from '@/lib/quiz/store';
import { domainName } from '@/content/exams';
import type { AnswerRecord, Exam, QuizMode, SessionQuestion } from '@/lib/quiz/types';
import { CHOICE_LABELS } from './style';

/** テキスト入力中はショートカットを無効にする（ラジオ／チェックボックスは対象外） */
function isTextField(el: HTMLElement | null): boolean {
  if (!el) return false;
  if (el.tagName === 'TEXTAREA' || el.isContentEditable) return true;
  return el instanceof HTMLInputElement && el.type !== 'radio' && el.type !== 'checkbox';
}

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
      {/* ステータスバー */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-sm font-semibold tabular-nums">
            {index + 1}
            <span className="text-muted"> / {total}</span>
          </span>
          <span className="chip bg-subtle text-muted ring-1 ring-line">{domainName(exam, q.domain)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isMock ? (
            <span
              role="timer"
              aria-label="残り時間"
              className={`chip px-3 py-1 font-mono text-sm tabular-nums ring-1 ${lowTime ? 'bg-ng/10 text-ng ring-ng/30' : 'bg-card text-ink ring-line'}`}
            >
              ⏱ {formatDuration(remainingSec)}
            </span>
          ) : (
            <span className="text-sm text-muted">
              正解 <span className="font-bold text-ok tabular-nums">{correctSoFar}</span> / {answers.length}
            </span>
          )}
          <button type="button" popoverTarget="kbd-help" className="btn btn-ghost hidden px-3 py-1.5 text-xs sm:inline-flex">
            ⌨ ショートカット
          </button>
          <button type="button" onClick={() => setConfirmQuit(true)} className="btn btn-ghost px-3 py-1.5 text-xs">
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
        className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-line/70"
      >
        <div className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out" style={{ width: `${(done / total) * 100}%` }} />
      </div>

      {confirmQuit && (
        <div className="drill-enter card mt-4 flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <span>中断しますか？{isMock ? '模試の解答は記録されません。' : 'ここまでの解答は記録済みです。'}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirmQuit(false)} className="btn btn-secondary px-4 py-2">
              続ける
            </button>
            <button type="button" onClick={onQuit} className="btn bg-ng px-4 py-2 text-white hover:bg-ng/90">
              中断する
            </button>
          </div>
        </div>
      )}

      {/* 問題 */}
      <article key={q.id} className="drill-enter card mt-6 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-2 text-xs text-muted">
          <span>{q.type === 'multi' ? `正しいものを${q.answer.length}つ選択` : '1つ選択'}</span>
          {isMock && (
            <button
              type="button"
              aria-pressed={flagged[index]}
              onClick={() => setFlagged((prev) => prev.map((v, i) => (i === index ? !v : v)))}
              className={`chip cursor-pointer ring-1 transition ${flagged[index] ? 'bg-warn/10 text-warn ring-warn/30' : 'bg-card text-muted ring-line hover:bg-subtle'}`}
            >
              {flagged[index] ? '★ 見直し' : '☆ 見直しに追加'}
            </button>
          )}
        </div>
        <h2 id={`q-${q.id}`} className="mt-3 text-lg leading-relaxed font-bold break-words sm:text-xl">
          {q.question}
        </h2>
        {q.code && (
          <pre className="mt-4 overflow-x-auto rounded-xl bg-subtle p-4 font-mono text-[13px] leading-relaxed ring-1 ring-line">
            <code>{q.code}</code>
          </pre>
        )}

        <fieldset disabled={isRevealed} aria-labelledby={`q-${q.id}`} className="mt-6 space-y-2.5">
          {current.order.map((original, pos) => {
            const isSel = selected.includes(original);
            const isAns = q.answer.includes(original);
            let state = 'ring-1 ring-line hover:bg-subtle has-checked:bg-brand/5 has-checked:ring-2 has-checked:ring-brand';
            let badge = 'bg-subtle text-muted group-has-checked:bg-brand group-has-checked:text-white';
            let mark: React.ReactNode = null;
            if (isRevealed) {
              if (isAns) {
                state = 'bg-ok/5 ring-2 ring-ok/60';
                badge = 'bg-ok text-white';
                mark = <span className="chip bg-ok/10 text-ok">正解</span>;
              } else if (isSel) {
                state = 'bg-ng/5 ring-2 ring-ng/60';
                badge = 'bg-ng text-white';
                mark = <span className="chip bg-ng/10 text-ng">あなたの解答</span>;
              } else {
                state = 'opacity-50 ring-1 ring-line';
              }
            }
            return (
              <label
                key={original}
                className={`group flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3.5 text-[15px] leading-relaxed transition has-disabled:cursor-default ${state}`}
              >
                <input
                  type={q.type === 'single' ? 'radio' : 'checkbox'}
                  name={`q-${q.id}`}
                  value={original}
                  checked={isSel}
                  onChange={() => toggle(original)}
                  className="sr-only"
                />
                <span
                  className={`mt-0.5 grid size-6 shrink-0 place-items-center text-xs font-bold transition-colors ${q.type === 'multi' ? 'rounded-md' : 'rounded-full'} ${badge}`}
                >
                  {CHOICE_LABELS[pos]}
                </span>
                <span className="flex-1 break-words">{q.choices[original]}</span>
                {mark}
              </label>
            );
          })}
        </fieldset>

        {isRevealed && (
          <div
            role="status"
            className={`drill-enter mt-6 rounded-2xl p-5 text-sm leading-relaxed ring-1 ${wasCorrect ? 'bg-ok/5 ring-ok/25' : 'bg-ng/5 ring-ng/25'}`}
          >
            <p className={`flex items-center gap-2 font-bold ${wasCorrect ? 'text-ok' : 'text-ng'}`}>
              <span aria-hidden className={`grid size-5 place-items-center rounded-full text-[11px] text-white ${wasCorrect ? 'bg-ok' : 'bg-ng'}`}>
                {wasCorrect ? '✓' : '✕'}
              </span>
              <span>{wasCorrect ? '正解！' : '残念、不正解'}</span>
            </p>
            <p className="mt-2">{q.explanation}</p>
          </div>
        )}
      </article>

      {/* 操作 */}
      <div className="mt-6 flex items-center gap-3">
        {isMock && (
          <button type="button" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0} className="btn btn-ghost">
            ← 前へ
          </button>
        )}
        <div className="ml-auto flex gap-2">
          {isMock && index === total - 1 ? (
            <button type="button" onClick={finish} className="btn btn-primary btn-lg">
              採点する（{answeredCount}/{total} 解答済み）
            </button>
          ) : isMock ? (
            <button type="button" onClick={next} className="btn btn-primary btn-lg">
              次へ →
            </button>
          ) : !isRevealed ? (
            <button type="button" onClick={submit} disabled={selected.length === 0} className="btn btn-primary btn-lg">
              回答する
            </button>
          ) : (
            <button type="button" onClick={next} className="btn btn-primary btn-lg">
              {index < total - 1 ? '次の問題 →' : '結果を見る'}
            </button>
          )}
        </div>
      </div>

      {/* 模試の問題ナビ */}
      {isMock && (
        <nav aria-label="問題一覧" className="card mt-8 p-4 sm:p-5">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1.5">
            {session.map((s, i) => {
              const answered = selections[i].length > 0;
              return (
                <button
                  key={s.question.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? 'step' : undefined}
                  className={`relative grid aspect-square place-items-center rounded-lg font-mono text-xs transition ${
                    answered ? 'bg-subtle text-ink' : 'text-muted hover:bg-subtle'
                  } ${i === index ? 'ring-2 ring-brand' : 'ring-1 ring-line'}`}
                  aria-label={`問題 ${i + 1}${answered ? '（解答済み）' : ''}${flagged[i] ? '（見直し）' : ''}`}
                >
                  {i + 1}
                  {flagged[i] && <span className="absolute -top-1.5 -right-1 text-[10px] text-warn">★</span>}
                </button>
              );
            })}
          </div>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <span>
              <span className="mr-1 inline-block size-2.5 rounded-sm bg-subtle ring-1 ring-line align-middle" />
              解答済み
            </span>
            <span>
              <span className="mr-1 text-warn">★</span>見直し
            </span>
          </p>
        </nav>
      )}

      {/* キーボードショートカット（popover 属性で開閉） */}
      <div id="kbd-help" popover="auto" className="card m-auto w-[min(22rem,calc(100vw-2rem))] p-5 text-sm text-ink">
        <h3 className="font-bold">キーボードショートカット</h3>
        <dl className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">選択肢を選ぶ</dt>
            <dd>
              <kbd>1</kbd> 〜 <kbd>{current.order.length}</kbd>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">{isMock ? '次の問題へ' : '回答する / 次へ'}</dt>
            <dd>
              <kbd>Enter</kbd>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">この表示を閉じる</dt>
            <dd>
              <kbd>Esc</kbd>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
