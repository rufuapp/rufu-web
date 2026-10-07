import Link from 'next/link';
import { EXAMS, TRACKS } from '@/content/exams';
import { QUESTIONS } from '@/content/questions';
import { ExamCards } from '@/components/quiz/ExamCards';
import { DailyQuestion } from '@/components/quiz/DailyQuestion';
import { tint } from '@/components/quiz/style';
import type { TrackId } from '@/lib/quiz/types';

const TRACK_HEADINGS: Record<TrackId, string> = {
  databricks: 'Databricks 認定資格の対策',
  claude: 'Claude の実践スキル検定',
};

const FAQ = [
  {
    q: '実際の試験問題ですか？',
    a: 'いいえ。すべて出題範囲を参考に作成したオリジナル問題です。実際の出題範囲や形式は、各社の公式の試験ガイドで確認してください。',
  },
  {
    q: '登録やログインは必要ですか？',
    a: '不要です。ページを開いたらすぐに解き始められます。',
  },
  {
    q: '学習記録はどこに保存されますか？',
    a: 'お使いのブラウザ（localStorage）にだけ保存されます。別の端末やブラウザとは共有されず、ブラウザのデータを消すと記録も消えます。',
  },
  {
    q: '合格ラインは何％ですか？',
    a: 'このサイトでは正答率 70% を目安にしています。実際の合格基準は試験ごとに異なるため、公式情報を確認してください。',
  },
  {
    q: 'Claude の検定は公式の資格ですか？',
    a: 'いいえ。Claude トラックは rufu 独自の非公式スキル検定で、Anthropic の公式資格ではありません。',
  },
];

function questionIdsByExam() {
  const map: Record<string, string[]> = {};
  for (const q of QUESTIONS) (map[q.examId] ??= []).push(q.id);
  return map;
}

function Letter({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-subtle text-xs font-bold text-muted">{children}</span>
  );
}

function Bento({
  className = '',
  eyebrow,
  title,
  desc,
  children,
}: {
  className?: string;
  eyebrow: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <article className={`card flex flex-col overflow-hidden p-6 sm:p-7 ${className}`}>
      <p className="font-mono text-xs font-semibold text-brand">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-bold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
      <div aria-hidden className="mt-6 flex-1 select-none">
        {children}
      </div>
    </article>
  );
}

export default function LandingPage() {
  const ids = questionIdsByExam();
  const tracks: TrackId[] = ['databricks', 'claude'];

  return (
    <>
      {/* ヒーロー */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="drill-aurora pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[40rem]" />
        <div aria-hidden className="drill-dots pointer-events-none absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-24 lg:pb-28">
          <div>
            <p className="chip bg-card/80 py-1 pr-3 pl-1 text-[13px] text-ink shadow-soft ring-1 ring-line backdrop-blur">
              <span className="chip tint" style={tint(TRACKS.databricks.accent)}>
                Databricks
              </span>
              <span className="text-muted">×</span>
              <span className="chip tint" style={tint(TRACKS.claude.accent)}>
                Claude
              </span>
              <span className="text-muted">の資格対策</span>
            </p>
            <h1 className="mt-6 text-[2.75rem] leading-[1.08] font-black tracking-tight sm:text-6xl">
              解いて、間違えて、
              <br />
              <span className="text-gradient">受かる。</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Databricks 認定資格の対策問題と、Claude の実践スキル検定を、登録なしでそのまま解けるドリルサイト。全 {QUESTIONS.length} 問、すべて解説付きのオリジナル問題です。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/exams" className="btn btn-primary btn-lg group">
                試験を選んで解く
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <Link href="/progress" className="btn btn-secondary btn-lg">
                学習記録
              </Link>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 divide-x divide-line">
              {[
                { k: '試験', v: EXAMS.length, u: '種類' },
                { k: '問題', v: QUESTIONS.length, u: '問' },
                { k: '登録', v: '不要', u: '' },
              ].map((s) => (
                <div key={s.k} className="px-5 first:pl-0">
                  <dt className="text-xs text-muted">{s.k}</dt>
                  <dd className="mt-1 text-3xl font-black tracking-tight tabular-nums">
                    {s.v}
                    {s.u && <span className="ml-0.5 text-sm font-semibold text-muted">{s.u}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <DailyQuestion />
        </div>
      </section>

      {/* トラック別の試験 */}
      {tracks.map((t) => (
        <section key={t} className="reveal mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="chip tint" style={tint(TRACKS[t].accent)}>
                <span className="size-1.5 rounded-full bg-current" />
                {TRACKS[t].name} トラック
              </p>
              <h2 className="display mt-3 text-2xl font-black tracking-tight sm:text-3xl">{TRACK_HEADINGS[t]}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{TRACKS[t].tagline}</p>
            </div>
          </div>
          <ExamCards exams={EXAMS.filter((e) => e.track === t)} questionIds={ids} />
        </section>
      ))}

      {/* 機能（ベントーグリッド） */}
      <section className="reveal mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="chip bg-subtle text-muted ring-1 ring-line">機能</p>
        <h2 className="display mt-3 text-3xl font-black tracking-tight sm:text-4xl">合格までの道具が、ぜんぶ入り。</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-6">
          <Bento className="md:col-span-4" eyebrow="01" title="練習モード" desc="1問ごとに正誤と解説を表示。分野を絞って集中的に解けます。">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 rounded-xl bg-ok/5 px-3.5 py-2.5 ring-2 ring-ok/50">
                <Letter>A</Letter>
                <span className="flex-1 font-mono text-[13px]">RESTORE TABLE sales TO VERSION AS OF 5</span>
                <span className="chip bg-ok/10 text-ok">正解</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 opacity-55 ring-1 ring-line">
                <Letter>B</Letter>
                <span className="flex-1 font-mono text-[13px]">ROLLBACK TABLE sales TO VERSION 5</span>
              </div>
              <p className="rounded-xl bg-subtle px-3.5 py-2.5 text-xs leading-relaxed text-muted">
                解説：RESTORE TABLE で過去のバージョンに戻せます。復元の操作自体も履歴に残ります。
              </p>
            </div>
          </Bento>
          <Bento className="md:col-span-2" eyebrow="02" title="模試モード" desc="制限時間つきで本番さながらに。見直しマークと問題ナビ付き。">
            <div className="flex flex-col gap-4">
              <span className="chip self-start bg-subtle px-3 py-1 font-mono text-sm text-ink ring-1 ring-line">⏱ 17:42</span>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 10 }, (_, i) => (
                  <span
                    key={i}
                    className={`relative grid aspect-square place-items-center rounded-lg font-mono text-xs ${
                      i === 6 ? 'text-ink ring-2 ring-brand' : i < 6 ? 'bg-subtle text-ink ring-1 ring-line' : 'text-muted ring-1 ring-line'
                    }`}
                  >
                    {i + 1}
                    {i === 3 && <span className="absolute -top-1.5 -right-1 text-[10px] text-warn">★</span>}
                  </span>
                ))}
              </div>
            </div>
          </Bento>
          <Bento className="md:col-span-2" eyebrow="03" title="苦手克服" desc="直近で間違えた問題だけを集めて、正解するまで出題します。">
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black tracking-tight text-warn tabular-nums">6</span>
              <span className="pb-1.5 text-sm text-muted">問が苦手</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['Delta Lake', 'Unity Catalog', 'ツール利用'].map((d) => (
                <span key={d} className="chip bg-warn/10 text-warn">
                  {d}
                </span>
              ))}
            </div>
          </Bento>
          <Bento className="md:col-span-4" eyebrow="04" title="学習記録" desc="試験別・分野別の正答率と連続学習日数を、登録なしで記録します。">
            <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="space-y-3">
                {[
                  { d: 'Delta Lake', r: 0.86 },
                  { d: 'データ取り込み', r: 0.64 },
                  { d: 'Unity Catalog', r: 0.42 },
                ].map((x) => (
                  <div key={x.d}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{x.d}</span>
                      <span className="text-muted tabular-nums">{Math.round(x.r * 100)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${x.r * 100}%`, backgroundColor: x.r >= 0.7 ? 'var(--d-ok)' : x.r >= 0.5 ? 'var(--d-warn)' : 'var(--d-ng)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-subtle px-5 py-4 text-center ring-1 ring-line">
                <p className="text-xs text-muted">連続学習</p>
                <p className="text-3xl font-black tracking-tight tabular-nums">
                  5<span className="text-sm font-semibold text-muted">日</span>
                </p>
              </div>
            </div>
          </Bento>
        </div>
      </section>

      {/* よくある質問（name 付き details で 1 つずつ開くアコーディオン） */}
      <section className="reveal mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="display text-center text-3xl font-black tracking-tight">よくある質問</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} name="faq" className="group card px-5 transition-shadow open:shadow-lift">
              <summary className="flex items-center justify-between gap-4 py-4 font-semibold">
                {f.q}
                <span
                  aria-hidden
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-subtle text-lg leading-none text-muted transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="reveal mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-brand to-emerald-600 px-6 py-14 text-center text-white shadow-lift sm:px-12">
          <div aria-hidden className="drill-dots pointer-events-none absolute inset-0 -z-10 opacity-40 invert" />
          <h2 className="display text-3xl font-black tracking-tight sm:text-4xl">まずは、今日の1問から。</h2>
          <p className="mt-3 text-white/80">登録なし・無料。ページを開いたらすぐ始められます。</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#daily" className="btn btn-lg bg-white text-brand shadow-md hover:bg-white/90">
              今日の1問を解く
            </a>
            <Link href="/exams" className="btn btn-lg text-white ring-1 ring-white/50 hover:bg-white/10">
              試験を選ぶ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
