'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PASS_RATE, formatDuration, scoreSession } from '@/lib/quiz/engine';
import { domainName } from '@/content/question-sets';
import { topicForDomain } from '@/content/catalog';
import type { AnswerRecord, QuestionSet, QuizMode, SessionQuestion } from '@/lib/quiz/types';
import { rateColor } from './style';

const MODE_TITLE: Record<QuizMode, string> = {
  practice: '練習の結果',
  mock: '模試の結果',
  review: '苦手克服の結果',
};

type Props = {
  set: QuestionSet;
  session: SessionQuestion[];
  answers: AnswerRecord[];
  mode: QuizMode;
  elapsedSec: number;
  onRetry: () => void;
  onRetryWrong: (ids: string[]) => void;
  onBack: () => void;
};

export function ResultView({ set, session, answers, mode, elapsedSec, onRetry, onRetryWrong, onBack }: Props) {
  const [filter, setFilter] = useState<'all' | 'wrong'>('wrong');
  const result = scoreSession(answers, set.domains.map((d) => d.id));
  const byId = new Map(answers.map((a) => [a.questionId, a]));
  const wrongIds = answers.filter((a) => !a.correct).map((a) => a.questionId);
  const pct = Math.round(result.rate * 100);
  const unanswered = session.length - answers.filter((a) => a.selected.length > 0).length;
  const shown = session.filter((s) => filter === 'all' || !byId.get(s.question.id)?.correct);
  const remaining = Math.max(1, Math.ceil(result.total * PASS_RATE) - result.correct);
  const passPct = Math.round(PASS_RATE * 100);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="box px-5 py-8 text-center sm:px-10">
        <p className="text-sm tracking-[0.3em] text-muted">{MODE_TITLE[mode]}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          <div role="img" aria-label={`正答率 ${pct}%`}>
            <p className="text-6xl font-bold tabular-nums">
              {pct}
              <span className="ml-1 text-2xl">%</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              {result.correct} / {result.total} 問
            </p>
          </div>
          {result.total > 0 && (
            <span aria-hidden className="stamp" style={{ color: result.passed ? 'var(--d-ng)' : 'var(--d-muted)' }}>
              {result.passed ? '合格圏' : '要復習'}
            </span>
          )}
        </div>
        {result.total > 0 && (
          <p className="mt-5">
            {result.passed
              ? `合格の目安（正答率 ${passPct}%）に達しました。`
              : `合格の目安（正答率 ${passPct}%）まで、あと ${remaining} 問です。`}
          </p>
        )}
        <p className="mt-2 text-sm text-muted">
          所要時間 {formatDuration(elapsedSec)}
          {unanswered > 0 && `　未解答 ${unanswered} 問`}
        </p>
        <p className="mt-1 text-xs text-muted">合格の目安はこのサイト独自のものです。実際の合格基準は公式の情報を確認してください。</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {wrongIds.length > 0 && (
            <button type="button" onClick={() => onRetryWrong(wrongIds)} className="btn btn-primary">
              間違えた {wrongIds.length} 問を解き直す
            </button>
          )}
          <button type="button" onClick={onRetry} className="btn btn-outline">
            同じ条件でもう一度
          </button>
          <button type="button" onClick={onBack} className="btn btn-quiet">
            設定に戻る
          </button>
        </div>
      </section>

      {result.byDomain.length > 0 && (
        <section className="mt-10">
          <h3 className="mb-3 border-l-4 border-ink pl-3 text-lg">分野別の正答率</h3>
          <div className="overflow-x-auto">
            <table className="ruled">
              <thead>
                <tr>
                  <th scope="col">分野</th>
                  <th scope="col">正解</th>
                  <th scope="col">正答率</th>
                  <th scope="col">復習</th>
                </tr>
              </thead>
              <tbody>
                {result.byDomain.map((d) => {
                  const r = d.correct / d.total;
                  const topic = topicForDomain(set.id, d.domain);
                  return (
                    <tr key={d.domain}>
                      <th scope="row" className="font-normal">
                        {domainName(set, d.domain)}
                      </th>
                      <td className="tabular-nums">
                        {d.correct} / {d.total}
                      </td>
                      <td className="font-bold tabular-nums" style={{ color: rateColor(r) }}>
                        {Math.round(r * 100)}%
                      </td>
                      <td className="text-sm">
                        {topic && r < PASS_RATE ? (
                          <Link href={`/study/${topic.id}`} className="link">
                            {topic.title}
                          </Link>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-l-4 border-ink pl-3">
          <h3 className="text-lg">解答の振り返り</h3>
          <fieldset className="flex gap-4 text-sm">
            <legend className="sr-only">表示する問題</legend>
            {(['wrong', 'all'] as const).map((f) => (
              <label key={f} className="inline-flex cursor-pointer items-center gap-1.5">
                <input type="radio" name="review-filter" value={f} checked={filter === f} onChange={() => setFilter(f)} className="size-3.5" />
                {f === 'wrong' ? `間違いのみ（${wrongIds.length}）` : `すべて（${session.length}）`}
              </label>
            ))}
          </fieldset>
        </div>
        {shown.length === 0 ? (
          <p className="box p-8 text-center text-muted">全問正解です。お見事でした。</p>
        ) : (
          <ol className="space-y-4">
            {shown.map((s) => {
              const a = byId.get(s.question.id);
              const q = s.question;
              const no = session.indexOf(s) + 1;
              const topic = topicForDomain(set.id, q.domain);
              const status = a?.correct
                ? { label: '◯ 正解', cls: 'text-ok' }
                : a && a.selected.length > 0
                  ? { label: '✕ 不正解', cls: 'text-ng' }
                  : { label: '― 未解答', cls: 'text-muted' };
              return (
                <li key={q.id} className="box p-5 sm:p-6">
                  <p className="flex flex-wrap items-baseline gap-x-3 text-sm">
                    <span className="font-bold">問 {no}</span>
                    <span className={`font-bold ${status.cls}`}>{status.label}</span>
                    <span className="text-muted">{domainName(set, q.domain)}</span>
                  </p>
                  <p className="mt-2 leading-relaxed font-bold break-words">{q.question}</p>
                  {q.passage && (
                    <blockquote lang="en" className="mt-2 border-l-4 border-line-strong pl-3 leading-relaxed italic break-words">
                      {q.passage}
                    </blockquote>
                  )}
                  {q.code && (
                    <pre className="mt-3 overflow-x-auto border border-line bg-subtle p-3 text-xs leading-relaxed">
                      <code>{q.code}</code>
                    </pre>
                  )}
                  <dl className="mt-3 space-y-1 text-sm">
                    <div className="flex gap-2">
                      <dt className="shrink-0 font-bold text-ok">正解</dt>
                      <dd className="break-words">{q.answer.map((i) => q.choices[i]).join(' ／ ')}</dd>
                    </div>
                    {a && a.selected.length > 0 && !a.correct && (
                      <div className="flex gap-2">
                        <dt className="shrink-0 font-bold text-ng">あなたの解答</dt>
                        <dd className="break-words">{a.selected.map((i) => q.choices[i]).join(' ／ ')}</dd>
                      </div>
                    )}
                  </dl>
                  <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed">
                    <span className="font-bold">【解説】</span>
                    {q.explanation}
                  </p>
                  {topic && !a?.correct && (
                    <p className="mt-2 text-sm">
                      <Link href={`/study/${topic.id}`} className="link">
                        学習ガイド「{topic.title}」で復習する
                      </Link>
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
