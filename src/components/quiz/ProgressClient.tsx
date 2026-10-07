'use client';

import Link from 'next/link';
import { useState } from 'react';
import { QUESTION_SETS, domainName, getQuestionSet } from '@/content/question-sets';
import { QUESTIONS, questionsForExam } from '@/content/questions';
import { topicForDomain } from '@/content/catalog';
import { emptyProgress, examStat, localDate, streakDays } from '@/lib/quiz/progress';
import { updateProgress, useIsClient, useProgress } from '@/lib/quiz/store';
import { rateColor } from './style';

const MODE_NAME = { practice: '練習', mock: '模試', review: '苦手克服' } as const;

export function ProgressClient() {
  const isClient = useIsClient();
  const progress = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isClient) return <div className="box mt-8 h-64" aria-hidden />;

  const all = examStat(progress, QUESTIONS.map((q) => q.id));
  const streak = streakDays(progress, localDate());

  if (all.answered === 0) {
    return (
      <div className="box mt-8 px-6 py-12 text-center">
        <p className="text-lg font-bold">まだ記録がありません</p>
        <p className="mt-2 text-muted">問題を解くと、ここに正答率や苦手な分野が表示されます。</p>
        <Link href="/#question-sets" className="btn btn-primary mt-6">
          問題集を選ぶ
        </Link>
      </div>
    );
  }

  // 解いたことのある分野を、正答率の低い順に
  const weakDomains = QUESTION_SETS.flatMap((set) => {
    const qs = questionsForExam(set.id);
    return set.domains
      .map((d) => ({ set, domain: d.id, stat: examStat(progress, qs.filter((q) => q.domain === d.id).map((q) => q.id)) }))
      .filter((x) => x.stat.answered > 0 && x.stat.accuracy < 0.7);
  }).sort((a, b) => a.stat.accuracy - b.stat.accuracy);

  return (
    <div className="mt-8 space-y-12">
      <table className="ruled">
        <tbody>
          <tr>
            <th scope="row" className="w-1/2 font-normal text-muted">
              連続学習
            </th>
            <td className="font-bold tabular-nums">{streak} 日</td>
          </tr>
          <tr>
            <th scope="row" className="font-normal text-muted">
              解いた問題
            </th>
            <td className="font-bold tabular-nums">
              {all.answered} / {all.total} 問
            </td>
          </tr>
          <tr>
            <th scope="row" className="font-normal text-muted">
              通算の正答率
            </th>
            <td className="font-bold tabular-nums">{Math.round(all.accuracy * 100)}%</td>
          </tr>
          <tr>
            <th scope="row" className="font-normal text-muted">
              苦手な問題（直近で不正解）
            </th>
            <td className="font-bold tabular-nums">{all.weak} 問</td>
          </tr>
        </tbody>
      </table>

      <section>
        <h2 className="mb-3 border-l-4 border-ink pl-3 text-lg">問題集ごとの記録</h2>
        <div className="overflow-x-auto">
          <table className="ruled">
            <thead>
              <tr>
                <th scope="col">問題集</th>
                <th scope="col">解答済み</th>
                <th scope="col">正答率</th>
                <th scope="col">
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {QUESTION_SETS.map((set) => {
                const stat = examStat(progress, questionsForExam(set.id).map((q) => q.id));
                return (
                  <tr key={set.id}>
                    <th scope="row" className="font-normal">
                      <Link href={`/question-sets/${set.id}`} className="link">
                        {set.title}
                      </Link>
                    </th>
                    <td className="whitespace-nowrap tabular-nums">
                      {stat.answered} / {stat.total}
                    </td>
                    <td className="whitespace-nowrap tabular-nums" style={stat.answered ? { color: rateColor(stat.accuracy) } : undefined}>
                      {stat.answered ? `${Math.round(stat.accuracy * 100)}%` : <span className="text-muted">未挑戦</span>}
                    </td>
                    <td className="text-right text-sm whitespace-nowrap">
                      {stat.weak > 0 && (
                        <Link href={`/question-sets/${set.id}?mode=review`} className="link text-warn">
                          苦手 {stat.weak} 問を解く
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {weakDomains.length > 0 && (
        <section>
          <h2 className="mb-1 border-l-4 border-ink pl-3 text-lg">復習したい分野</h2>
          <p className="mb-3 text-sm text-muted">正答率が 70% に届いていない分野です。学習ガイドで要点を確かめてから、もう一度解いてみましょう。</p>
          <div className="overflow-x-auto">
            <table className="ruled">
              <thead>
                <tr>
                  <th scope="col">分野</th>
                  <th scope="col">正答率</th>
                  <th scope="col">学習ガイド</th>
                </tr>
              </thead>
              <tbody>
                {weakDomains.map(({ set, domain, stat }) => {
                  const topic = topicForDomain(set.id, domain);
                  return (
                    <tr key={`${set.id}-${domain}`}>
                      <th scope="row" className="font-normal">
                        {domainName(set, domain)}
                        <span className="block text-xs text-muted">{set.title}</span>
                      </th>
                      <td className="font-bold tabular-nums" style={{ color: rateColor(stat.accuracy) }}>
                        {Math.round(stat.accuracy * 100)}%
                      </td>
                      <td className="text-sm">
                        {topic ? (
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

      {progress.sessions.length > 0 && (
        <section>
          <h2 className="mb-3 border-l-4 border-ink pl-3 text-lg">最近の挑戦</h2>
          <div className="overflow-x-auto">
            <table className="ruled">
              <thead>
                <tr>
                  <th scope="col">日付</th>
                  <th scope="col">問題集</th>
                  <th scope="col">形式</th>
                  <th scope="col">結果</th>
                </tr>
              </thead>
              <tbody>
                {progress.sessions.slice(0, 10).map((s, i) => {
                  const set = getQuestionSet(s.examId);
                  const rate = s.total ? s.correct / s.total : 0;
                  return (
                    <tr key={`${s.at}-${i}`}>
                      <td className="text-sm whitespace-nowrap tabular-nums">{s.day.replaceAll('-', '.')}</td>
                      <td className="text-sm">{set?.title ?? s.examId}</td>
                      <td className="text-sm whitespace-nowrap">{MODE_NAME[s.mode]}</td>
                      <td className="text-sm whitespace-nowrap tabular-nums" style={{ color: rateColor(rate) }}>
                        {s.correct} / {s.total}（{Math.round(rate * 100)}%）
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="text-right">
        {confirmReset ? (
          <div className="box inline-flex flex-wrap items-center gap-3 p-4 text-left text-sm">
            <span>記録をすべて削除します。元に戻せません。</span>
            <button type="button" onClick={() => setConfirmReset(false)} className="btn btn-outline px-4 py-1.5 text-sm">
              やめる
            </button>
            <button
              type="button"
              onClick={() => {
                updateProgress(() => emptyProgress());
                setConfirmReset(false);
              }}
              className="btn btn-outline border-ng px-4 py-1.5 text-sm text-ng"
            >
              削除する
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmReset(true)} className="btn btn-quiet text-xs">
            学習記録をすべて消す
          </button>
        )}
      </section>
    </div>
  );
}
