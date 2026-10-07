import Link from 'next/link';
import { CERTIFICATIONS } from '@/content/certifications';
import { QUESTION_SETS, TRACKS } from '@/content/question-sets';
import { QUESTIONS } from '@/content/questions';
import { STUDY_TOPICS } from '@/content/study-topics';
import {
  TRACK_ORDER,
  certificationsForTopic,
  certificationsForTrack,
  questionIdsBySet,
  questionSetsForCertification,
  topicsForTrack,
} from '@/content/catalog';
import { DailyQuestion } from '@/components/quiz/DailyQuestion';
import { QuestionSetTable } from '@/components/quiz/QuestionSetTable';
import { SectionTitle } from '@/components/quiz/ui';
import { TrendList } from '@/components/trends/TrendList';
import { TRENDS, countSince, todayInTokyo } from '@/lib/trends/sources';
import type { TrackId } from '@/lib/quiz/types';

const CERT_GROUP: Record<TrackId, { title: string; note: string }> = {
  databricks: {
    title: 'Databricks 認定資格',
    note: 'Databricks 社の公式資格です。ここでは、本サイトの問題集で練習できるアソシエイト（初級）の 4 資格を取り上げています。',
  },
  claude: {
    title: 'Claude 認定資格（Anthropic）',
    note: '2026年7月に Anthropic が発表した公式資格です。受験できるのは Claude Partner Network に加盟する組織のメンバーに限られます。',
  },
};

const TOP_TREND_COUNT = 12;

export default function TopPage() {
  const ids = questionIdsBySet();
  const trends = TRENDS;
  const today = todayInTokyo();

  // 序文の目次（章の並びと同じ順。最新の動向が主で、資格と問題集はそれに付随する）
  const CHAPTERS = [
    {
      href: '#trends',
      num: '第一章',
      title: '最新の動向',
      count: `直近30日 ${countSince(trends, today, 30)} 件`,
      body: 'Claude と Databricks の公式発表を、新しい順に確かめます。',
    },
    {
      href: '#certifications',
      num: '第二章',
      title: '資格一覧',
      count: `${CERTIFICATIONS.length} 資格`,
      body: '目指す資格の概要・試験の形式・出題範囲を確かめます。',
    },
    {
      href: '#study',
      num: '第三章',
      title: '学習すべき内容',
      count: `${STUDY_TOPICS.length} 項目`,
      body: '分野ごとに押さえるべき点と、公式の教材を確かめます。',
    },
    {
      href: '#question-sets',
      num: '第四章',
      title: '問題集一覧',
      count: `${QUESTION_SETS.length} 冊・${QUESTIONS.length} 問`,
      body: '解説付きの問題で理解を確かめ、間違えた問題は苦手克服で解き直します。',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/* 序文 */}
      <section className="grid gap-10 py-10 md:grid-cols-[1.15fr_1fr] md:py-14">
        <div>
          <h1 className="text-2xl leading-relaxed sm:text-[1.75rem]">
            Claude と Databricks の今を、
            <br className="hidden sm:inline" />
            追いかけて、学んで、確かめる。
          </h1>
          <p className="mt-5">
            FDE（Forward Deployed Engineer）は、お客さまの現場に入り込み、データ基盤や AI を使って実際の課題を解決するエンジニアです。本サイトでは、生成 AI の Claude と、データ基盤の Databricks の公式発表を毎日集めて、日本語の見出しと短いまとめを付けています。あわせて、認定資格の解説と、解説付きのオリジナル問題集で、基礎を身につけられます。登録は要りません。
          </p>
        </div>
        <nav aria-labelledby="toc-title" className="box self-start p-5 sm:p-6">
          <h2 id="toc-title" className="border-b border-ink pb-2 font-bold tracking-[0.2em]">
            目次
          </h2>
          <ol className="divide-y divide-line">
            {CHAPTERS.map((c) => (
              <li key={c.href}>
                <a href={c.href} className="group block py-4">
                  <span className="flex items-baseline gap-3">
                    <span className="shrink-0 text-sm tracking-[0.2em] text-muted">{c.num}</span>
                    <span className="shrink-0 font-bold group-hover:text-brand group-hover:underline">{c.title}</span>
                    <span aria-hidden className="min-w-6 flex-1 border-b border-dotted border-line-strong" />
                    <span className="shrink-0 text-sm text-muted tabular-nums">{c.count}</span>
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{c.body}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      {/* 第一章 最新の動向 */}
      <section id="trends" className="scroll-mt-6 py-10">
        <SectionTitle num="第一章" title="最新の動向" en="Latest updates" />
        <p className="mb-6">
          Anthropic と Databricks の公式サイトから、発表を毎日集めています。日本語の見出しとまとめは、本文をもとに AI（Claude）が作ったものです。正確な内容は、リンク先の公式の記事で確かめてください。
        </p>
        <TrendList items={trends.slice(0, TOP_TREND_COUNT)} />
        <p className="mt-4 text-right">
          <Link href="/trends" className="link">
            情報源ごとの一覧を見る →
          </Link>
        </p>
      </section>

      {/* 第二章 資格一覧 */}
      <section id="certifications" className="scroll-mt-6 py-10">
        <SectionTitle num="第二章" title="資格一覧" en="Certifications" />
        {TRACK_ORDER.map((track) => (
          <div key={track} className="mb-12 last:mb-0">
            <h3 className="text-lg">
              <span className="mr-2 inline-block h-4 w-1 align-[-1px]" style={{ backgroundColor: TRACKS[track].accent }} />
              {CERT_GROUP[track].title}
            </h3>
            <p className="mt-1 mb-4 text-sm text-muted">{CERT_GROUP[track].note}</p>
            <div className="overflow-x-auto">
              <table className="ruled">
                <thead>
                  <tr>
                    <th scope="col">資格名</th>
                    <th scope="col" className="hidden md:table-cell">
                      どんな資格か
                    </th>
                    <th scope="col">レベル</th>
                    <th scope="col" className="hidden sm:table-cell">
                      問題集
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {certificationsForTrack(track).map((c) => {
                    const sets = questionSetsForCertification(c.id);
                    return (
                      <tr key={c.id}>
                        <th scope="row" className="font-normal">
                          <Link href={`/certifications/${c.id}`} className="link font-bold break-keep">
                            {c.nameJa}
                          </Link>
                          <span className="block text-xs text-muted">{c.name}</span>
                        </th>
                        <td className="hidden text-sm leading-relaxed md:table-cell">{c.summary}</td>
                        <td className="text-sm whitespace-nowrap">{c.level}</td>
                        <td className="hidden text-sm sm:table-cell">
                          {sets.length > 0 ? (
                            sets.map((s) => (
                              <Link key={s.id} href={`/question-sets/${s.id}`} className="link block whitespace-nowrap">
                                {s.shortTitle}
                              </Link>
                            ))
                          ) : (
                            <span className="text-muted">準備中</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      {/* 第三章 学習すべき内容 */}
      <section id="study" className="scroll-mt-6 py-10">
        <SectionTitle num="第三章" title="学習すべき内容" en="Study guide" />
        <p className="mb-8">
          資格の出題範囲をもとに、学ぶべき内容を項目ごとにまとめました。それぞれの項目に、押さえるべき点、重要な用語、公式の教材、確認の問題をそろえています。
        </p>
        <div className="grid gap-10 md:grid-cols-2">
          {TRACK_ORDER.map((track) => (
            <div key={track}>
              <h3 className="text-lg">
                <span className="mr-2 inline-block h-4 w-1 align-[-1px]" style={{ backgroundColor: TRACKS[track].accent }} />
                {TRACKS[track].name}
              </h3>
              <ol className="mt-3 divide-y divide-line border-y border-ink">
                {topicsForTrack(track).map((t, i) => (
                  <li key={t.id} className="flex gap-3 py-3">
                    <span className="w-6 shrink-0 text-sm text-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <Link href={`/study/${t.id}`} className="link font-bold">
                        {t.title}
                      </Link>
                      <span className="mt-0.5 block text-sm leading-relaxed text-muted">{t.summary}</span>
                      <span className="mt-1 block text-xs text-muted">
                        関連する資格：{certificationsForTopic(t.id).map((c) => c.nameJa).join('、') || '—'}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* 第四章 問題集一覧 */}
      <section id="question-sets" className="scroll-mt-6 py-10">
        <SectionTitle num="第四章" title="問題集一覧" en="Question sets" />
        <p className="mb-6">
          すべて解説付きのオリジナル問題です。練習（1問ごとに解説）、模試（制限時間つき）、苦手克服（間違えた問題だけ）の 3 つの形式で解けます。
        </p>
        <QuestionSetTable questionIds={ids} />
        <div className="mt-10 max-w-xl">
          <DailyQuestion />
        </div>
      </section>
    </div>
  );
}
