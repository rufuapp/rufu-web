import Link from 'next/link';
import { EXAMS, TRACKS } from '@/content/exams';
import { QUESTIONS } from '@/content/questions';
import { SiteFooter, SiteHeader } from '@/components/quiz/SiteChrome';
import { ExamCards } from '@/components/quiz/ExamCards';
import { DailyQuestion } from '@/components/quiz/DailyQuestion';
import type { TrackId } from '@/lib/quiz/types';

const FEATURES = [
  {
    title: '練習モード',
    desc: '1問ごとに正誤と解説を表示。分野を絞って集中的に解けます。',
  },
  {
    title: '模試モード',
    desc: '制限時間つきで本番さながらに。見直しマークと問題ナビ付き。',
  },
  {
    title: '苦手克服モード',
    desc: '直近で間違えた問題だけを自動で集めて、正解するまで出題します。',
  },
  {
    title: '学習記録',
    desc: '試験別・分野別の正答率と連続学習日数を記録。登録は不要です。',
  },
];

function questionIdsByExam() {
  const map: Record<string, string[]> = {};
  for (const q of QUESTIONS) (map[q.examId] ??= []).push(q.id);
  return map;
}

export default function LandingPage() {
  const ids = questionIdsByExam();
  const tracks: TrackId[] = ['databricks', 'claude'];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* ヒーロー */}
        <section className="relative overflow-hidden">
          <div className="drill-grid-bg pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold theme-card">
                <span style={{ color: 'var(--dbx)' }}>Databricks</span>
                <span style={{ color: 'var(--txts)' }}>×</span>
                <span style={{ color: 'var(--cld)' }}>Claude</span>
                <span style={{ color: 'var(--txts)' }}>資格対策</span>
              </p>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                解いて、間違えて、
                <br />
                <span style={{ color: 'var(--acc)' }}>受かる。</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed" style={{ color: 'var(--txts)' }}>
                Databricks 認定資格の対策問題と、Claude の実践スキル検定を、登録なしでそのまま解けるドリルサイト。
                全 {QUESTIONS.length} 問、すべて解説付きのオリジナル問題です。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/exams"
                  className="rounded-xl px-6 py-3 font-bold"
                  style={{ backgroundColor: 'var(--acc)', color: 'var(--bg)' }}
                >
                  試験を選んで解く
                </Link>
                <Link href="/progress" className="rounded-xl px-6 py-3 font-semibold theme-card hover:bg-white/5">
                  学習記録を見る
                </Link>
              </div>
              <dl className="mt-10 flex gap-8">
                {[
                  { k: '試験', v: EXAMS.length },
                  { k: '問題', v: QUESTIONS.length },
                  { k: '登録', v: '不要' },
                ].map((s) => (
                  <div key={s.k}>
                    <dt className="text-xs" style={{ color: 'var(--txts)' }}>
                      {s.k}
                    </dt>
                    <dd className="text-2xl font-extrabold tabular-nums">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <DailyQuestion />
          </div>
        </section>

        {/* トラック別の試験 */}
        {tracks.map((t) => (
          <section key={t} className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-2xl font-extrabold">
                  <span style={{ color: TRACKS[t].accent }}>{TRACKS[t].name}</span> トラック
                </h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--txts)' }}>
                  {TRACKS[t].tagline}
                </p>
              </div>
            </div>
            <ExamCards exams={EXAMS.filter((e) => e.track === t)} questionIds={ids} />
          </section>
        ))}

        {/* 機能 */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="mb-6 text-2xl font-extrabold">合格までの道具がそろっています</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="rounded-2xl p-5 theme-card">
                <span className="font-mono text-xs font-bold" style={{ color: 'var(--acc)' }}>
                  0{i + 1}
                </span>
                <h3 className="mt-2 font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--txts)' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
