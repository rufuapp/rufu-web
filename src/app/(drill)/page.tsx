import type { Metadata } from 'next';
import Link from 'next/link';
import { CERTIFICATIONS } from '@/content/certifications';
import { QUESTION_SETS } from '@/content/question-sets';
import { QUESTIONS } from '@/content/questions';
import { STUDY_TOPICS } from '@/content/study-topics';
import { BASICS_GROUPS, BASICS_TOPICS, basicsForGroup } from '@/content/basics';
import { DailyQuestion } from '@/components/quiz/DailyQuestion';
import { SectionTitle } from '@/components/quiz/ui';
import { TrendList } from '@/components/trends/TrendList';
import { COMPARE_TRENDS, TIPS, TRENDS, TREND_SOURCES, countSince, todayInTokyo } from '@/lib/trends/sources';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const TOP_TREND_COUNT = 12;
const TOP_TIPS_COUNT = 6;
const TOP_COMPARE_COUNT = 6;

const EXAM_PARTS = [
  { href: '/exam#certifications', title: '資格一覧', count: `${CERTIFICATIONS.length} 資格`, body: '目指す資格の概要・試験の形式・出題範囲を確かめます。' },
  { href: '/exam#study', title: '学習すべき内容', count: `${STUDY_TOPICS.length} 項目`, body: '資格の分野ごとに押さえるべき点と、公式の教材を確かめます。' },
  { href: '/exam#question-sets', title: '問題集一覧', count: `${QUESTION_SETS.length} 冊・${QUESTIONS.length} 問`, body: '解説付きの問題で理解を確かめ、間違えた問題は解き直します。' },
];

export default function TopPage() {
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
      href: '#tips',
      num: '第二章',
      title: '技術 Tips',
      count: `直近30日 ${countSince(TIPS, today, 30)} 件`,
      body: 'Skill・Claude Code・MCP・Databricks の技術記事を、短いまとめで確かめます。',
    },
    {
      href: '#basics',
      num: '第三章',
      title: '基礎知識',
      count: `${BASICS_TOPICS.length} 項目`,
      body: 'FDE として Claude と Databricks を提案・導入するための基礎を確かめます。',
    },
    {
      href: '#exam',
      num: '第四章',
      title: '資格対策',
      count: `${CERTIFICATIONS.length} 資格・${QUESTIONS.length} 問`,
      body: '資格の解説・学習ガイド・問題集で、資格の取得を目指します。',
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
            FDE（Forward Deployed Engineer）は、お客さまの現場に入り込み、データ基盤や AI を使って実際の課題を解決するエンジニアです。本サイトでは、生成 AI の Claude と、データ基盤の Databricks の公式発表を毎日集めて、日本語の見出しと短いまとめを付けています。あわせて、FDE に必要な基礎知識と、認定資格の解説・解説付きのオリジナル問題集も用意しています。登録は要りません。
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
      <section id="trends" className="scroll-mt-16 py-10">
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

        <h3 className="mt-12 border-l-4 border-ink pl-3 text-lg">比較対象の動き</h3>
        <p className="mt-2 mb-4 text-sm text-muted">
          Claude と比べる OpenAI・AWS・Google Cloud・Azure・NVIDIA、Databricks と比べる Snowflake・Palantir の公式発表です。
        </p>
        <TrendList items={COMPARE_TRENDS.slice(0, TOP_COMPARE_COUNT)} />
        <p className="mt-4 text-right">
          <Link href="/trends#compare" className="link">
            比較対象の一覧を見る →
          </Link>
        </p>
      </section>

      {/* 第二章 技術 Tips */}
      <section id="tips" className="scroll-mt-16 py-10">
        <SectionTitle num="第二章" title="技術 Tips" en="Tips" />
        <p className="mb-6">
          どんな Skill を作るとよいか、Claude Code や Databricks をどう使いこなすか。Zenn・Qiita・DevelopersIO の技術記事を毎日集め、AI（Claude）が短いまとめを付けています。記事は各サイトの書き手の方によるものです。
        </p>
        <TrendList items={TIPS.filter((it) => TREND_SOURCES[it.source].theme !== 'compare').slice(0, TOP_TIPS_COUNT)} />
        <p className="mt-4 text-right">
          <Link href="/tips" className="link">
            テーマごとの一覧を見る →
          </Link>
        </p>
      </section>

      {/* 第三章 基礎知識 */}
      <section id="basics" className="scroll-mt-16 py-10">
        <SectionTitle num="第三章" title="基礎知識" en="Basics" />
        <p className="mb-8">
          資格の出題範囲にとらわれず、FDE としてお客さまに Claude と Databricks を提案し、導入するときに必要になる知識をまとめています。
        </p>
        <div className="grid gap-10 md:grid-cols-3">
          {BASICS_GROUPS.map((g) => (
            <div key={g.id}>
              <h3 className="text-lg">{g.name}</h3>
              <ol className="mt-3 divide-y divide-line border-y border-ink">
                {basicsForGroup(g.id).map((t) => (
                  <li key={t.id} className="py-2.5">
                    <Link href={`/basics/${t.id}`} className="link font-bold">
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <p className="mt-4 text-right">
          <Link href="/basics" className="link">
            基礎知識の一覧を見る →
          </Link>
        </p>
      </section>

      {/* 第四章 資格対策 */}
      <section id="exam" className="scroll-mt-16 py-10">
        <SectionTitle num="第四章" title="資格対策" en="Certifications" />
        <p className="mb-6">Databricks と Claude の認定資格の解説、資格の出題範囲にもとづく学習ガイド、解説付きのオリジナル問題集をまとめています。</p>
        <ul className="grid gap-4 sm:grid-cols-3">
          {EXAM_PARTS.map((part) => (
            <li key={part.href} className="box p-5">
              <Link href={part.href} className="link font-bold">
                {part.title}
              </Link>
              <span className="mt-1 block text-sm text-muted tabular-nums">{part.count}</span>
              <span className="mt-2 block text-sm leading-relaxed">{part.body}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 max-w-xl">
          <DailyQuestion />
        </div>
      </section>
    </div>
  );
}
