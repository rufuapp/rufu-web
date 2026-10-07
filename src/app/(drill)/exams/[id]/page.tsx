import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { EXAMS, TRACKS, getExam } from '@/content/exams';
import { questionsForExam } from '@/content/questions';
import { ExamClient } from '@/components/quiz/ExamClient';
import { tint } from '@/components/quiz/style';

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
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <nav aria-label="パンくずリスト" className="text-xs text-muted">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/exams" className="hover:text-ink hover:underline">
              試験一覧
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">
            {exam.shortTitle}
          </li>
        </ol>
      </nav>
      <header className="mt-5 mb-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip tint" style={tint(track.accent)}>
            <span className="size-1.5 rounded-full bg-current" />
            {track.name}
          </span>
          <span className="chip bg-subtle text-muted ring-1 ring-line">
            {exam.level}・{questions.length}問
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{exam.title}</h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted">{exam.summary}</p>
        <p className="mt-3 text-xs text-muted">
          {exam.officialName
            ? `「${exam.officialName}」の出題範囲を参考にしたオリジナル問題です。最新の試験ガイドは公式サイトで確認してください。`
            : 'rufu 独自の非公式スキル検定です。Anthropic の公式資格ではありません。'}
        </p>
      </header>
      <Suspense fallback={<div className="card h-96 animate-pulse" />}>
        <ExamClient exam={exam} questions={questions} />
      </Suspense>
    </div>
  );
}
