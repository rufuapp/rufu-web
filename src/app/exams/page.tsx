import type { Metadata } from 'next';
import { EXAMS, TRACKS } from '@/content/exams';
import { QUESTIONS } from '@/content/questions';
import { SiteFooter, SiteHeader } from '@/components/quiz/SiteChrome';
import { ExamCards } from '@/components/quiz/ExamCards';
import type { TrackId } from '@/lib/quiz/types';

export const metadata: Metadata = {
  title: '試験一覧',
  description: 'Databricks 認定資格の対策問題と、Claude の実践スキル検定の一覧。',
};

export default function ExamsPage() {
  const ids: Record<string, string[]> = {};
  for (const q of QUESTIONS) (ids[q.examId] ??= []).push(q.id);
  const tracks: TrackId[] = ['databricks', 'claude'];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold">試験一覧</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--txts)' }}>
          すべて解説付きのオリジナル問題です。気になる試験を選んで、練習・模試・苦手克服のモードで解けます。
        </p>
        {tracks.map((t) => (
          <section key={t} className="mt-10">
            <h2 className="mb-1 text-xl font-bold" style={{ color: TRACKS[t].accent }}>
              {TRACKS[t].name}
            </h2>
            <p className="mb-4 text-sm" style={{ color: 'var(--txts)' }}>
              {TRACKS[t].tagline}
            </p>
            <ExamCards exams={EXAMS.filter((e) => e.track === t)} questionIds={ids} />
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
