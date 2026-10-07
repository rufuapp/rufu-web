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

const STEPS = [
  { title: '資格を知る', body: '資格一覧から、目指す資格の概要・試験の形式・出題範囲を確かめます。' },
  { title: '要点を学ぶ', body: '学習ガイドで、分野ごとに押さえるべき点と、公式の教材を確かめます。' },
  { title: '問題で確かめる', body: '問題集で理解を確かめ、間違えた問題は苦手克服で解き直します。' },
];

export default function TopPage() {
  const ids = questionIdsBySet();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/* 序文 */}
      <section className="grid gap-10 py-10 md:grid-cols-[1.15fr_1fr] md:py-14">
        <div>
          <h1 className="text-2xl leading-relaxed sm:text-[1.75rem]">
            Databricks と Claude の資格を、
            <br className="hidden sm:inline" />
            学んで、解いて、確かめる。
          </h1>
          <p className="mt-5">
            本サイトでは、Databricks と Claude の認定資格について、どんな資格なのか、何をもとに学べばよいのかをまとめています。学んだ内容は、解説付きのオリジナル問題集で確かめられます。登録は要りません。
          </p>
          <h2 className="mt-8 text-sm font-bold tracking-[0.2em] text-muted">本サイトの使い方</h2>
          <ol className="mt-3 space-y-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center border border-ink text-sm font-bold">{i + 1}</span>
                <span>
                  <span className="font-bold">{s.title}</span>
                  <span className="block text-sm text-muted">{s.body}</span>
                </span>
              </li>
            ))}
          </ol>
          <dl className="mt-8 grid grid-cols-4 border-y border-line py-3 text-center">
            {[
              { k: '資格', v: CERTIFICATIONS.length },
              { k: '問題集', v: QUESTION_SETS.length },
              { k: '問題', v: QUESTIONS.length },
              { k: '学習ガイド', v: STUDY_TOPICS.length },
            ].map((s) => (
              <div key={s.k}>
                <dt className="text-xs text-muted">{s.k}</dt>
                <dd className="text-2xl font-bold tabular-nums">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <DailyQuestion />
      </section>

      {/* 第一章 資格一覧 */}
      <section id="certifications" className="scroll-mt-6 py-10">
        <SectionTitle num="第一章" title="資格一覧" en="Certifications" />
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

      {/* 第二章 問題集一覧 */}
      <section id="question-sets" className="scroll-mt-6 py-10">
        <SectionTitle num="第二章" title="問題集一覧" en="Question sets" />
        <p className="mb-6">
          すべて解説付きのオリジナル問題です。練習（1問ごとに解説）、模試（制限時間つき）、苦手克服（間違えた問題だけ）の 3 つの形式で解けます。
        </p>
        <QuestionSetTable questionIds={ids} />
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
    </div>
  );
}
