import type { Metadata } from 'next';
import { EXAMS, TRACKS } from '@/content/exams';
import { QUESTIONS } from '@/content/questions';
import { ExamCards } from '@/components/quiz/ExamCards';
import { tint } from '@/components/quiz/style';
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
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-4xl font-black tracking-tight">試験一覧</h1>
      <p className="mt-3 max-w-2xl text-muted">
        すべて解説付きのオリジナル問題です。試験を選んで、練習・模試・苦手克服のモードで解けます。
      </p>
      {tracks.map((t) => (
        <section key={t} className="mt-14">
          <div className="mb-6">
            <p className="chip tint" style={tint(TRACKS[t].accent)}>
              <span className="size-1.5 rounded-full bg-current" />
              {TRACKS[t].name}
            </p>
            <p className="mt-2 text-sm text-muted">{TRACKS[t].tagline}</p>
          </div>
          <ExamCards exams={EXAMS.filter((e) => e.track === t)} questionIds={ids} />
        </section>
      ))}
    </div>
  );
}
