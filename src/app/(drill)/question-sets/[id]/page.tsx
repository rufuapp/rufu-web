import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { QUESTION_SETS, getQuestionSet } from '@/content/question-sets';
import { questionsForExam } from '@/content/questions';
import { certificationsForQuestionSet, topicsForQuestionSet } from '@/content/catalog';
import { SITE_NAME } from '@/content/site';
import { ExamClient } from '@/components/quiz/ExamClient';
import { Breadcrumb, TrackLabel } from '@/components/quiz/ui';

export function generateStaticParams() {
  return QUESTION_SETS.map((s) => ({ id: s.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const set = getQuestionSet(id);
  if (!set) return {};
  const description = `${set.title}（解説付き ${questionsForExam(id).length} 問）。${set.summary}`;
  return {
    title: set.title,
    description,
    openGraph: { title: `${set.title} | ${SITE_NAME}`, description, type: 'website' },
    twitter: { card: 'summary', title: `${set.title} | ${SITE_NAME}`, description },
  };
}

export default async function QuestionSetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const set = getQuestionSet(id);
  if (!set) notFound();
  const questions = questionsForExam(id);
  const certs = certificationsForQuestionSet(set);
  const topics = topicsForQuestionSet(set.id);

  const sidebar = (
    <>
      <section className="box p-5">
        <h2 className="border-b border-ink pb-1.5 font-bold tracking-[0.1em]">関連する資格</h2>
        <ul className="mt-2 space-y-1.5">
          {certs.map((c) => (
            <li key={c.id}>
              <Link href={`/certifications/${c.id}`} className="link">
                {c.nameJa}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="box p-5">
        <h2 className="border-b border-ink pb-1.5 font-bold tracking-[0.1em]">学習ガイド</h2>
        <p className="mt-2 text-xs text-muted">解く前の確認や、間違えた分野の復習に。</p>
        <ul className="mt-2 space-y-1.5">
          {topics.map((t) => (
            <li key={t.id}>
              <Link href={`/study/${t.id}`} className="link">
                {t.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { href: '/#question-sets', label: '問題集一覧' }, { label: set.title }]} />

      <header className="mt-6 mb-8 border-b border-line pb-6">
        <p className="flex flex-wrap items-center gap-3">
          <TrackLabel track={set.track} />
          <span className="tag text-muted">問題集</span>
          <span className="tag text-muted">
            {set.level}・{questions.length}問
          </span>
        </p>
        <h1 className="mt-3 text-3xl">{set.title}</h1>
        <p className="mt-4 leading-relaxed">{set.summary}</p>
        <p className="mt-2 text-sm text-muted">
          {set.track === 'databricks'
            ? 'すべてオリジナルの問題で、実際の試験問題ではありません。出題範囲は公式の試験ガイドを参考にしています。'
            : 'すべてオリジナルの問題で、Anthropic の公式試験の問題や出題範囲に沿ったものではありません。関連する技能の練習としてお使いください。'}
        </p>
      </header>

      <Suspense fallback={<div className="box h-96" />}>
        <ExamClient set={set} questions={questions} sidebar={sidebar} />
      </Suspense>
    </div>
  );
}
