import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { EXAMS, TRACKS, getExam } from '@/content/exams';
import { questionsForExam } from '@/content/questions';
import { SiteFooter, SiteHeader } from '@/components/quiz/SiteChrome';
import { ExamClient } from '@/components/quiz/ExamClient';

export function generateStaticParams() {
  return EXAMS.map((e) => ({ id: e.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const exam = getExam(id);
  if (!exam) return {};
  const description = `${exam.title}の練習問題 ${questionsForExam(id).length} 問（解説付き）。${exam.summary}`;
  return {
    title: exam.title,
    description,
    openGraph: { title: `${exam.title} | rufu 資格ドリル`, description, type: 'website' },
    twitter: { card: 'summary', title: `${exam.title} | rufu 資格ドリル`, description },
  };
}

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = getExam(id);
  if (!exam) notFound();
  const questions = questionsForExam(id);
  const track = TRACKS[exam.track];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <nav className="mb-4 text-xs" style={{ color: 'var(--txts)' }}>
          <Link href="/exams" className="hover:underline">
            試験一覧
          </Link>
          <span className="mx-1.5">/</span>
          <span>{exam.shortTitle}</span>
        </nav>
        <header className="mb-8">
          <p className="text-xs font-bold tracking-wide" style={{ color: track.accent }}>
            {track.name}・{exam.level}・{questions.length}問
          </p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{exam.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--txts)' }}>
            {exam.summary}
          </p>
          <p className="mt-2 text-xs" style={{ color: 'var(--txts)' }}>
            {exam.officialName
              ? `「${exam.officialName}」の出題範囲を参考にしたオリジナル問題です。最新の試験ガイドは公式サイトで確認してください。`
              : 'rufu 独自の非公式スキル検定です。Anthropic の公式資格ではありません。'}
          </p>
        </header>
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl theme-card" />}>
          <ExamClient exam={exam} questions={questions} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
