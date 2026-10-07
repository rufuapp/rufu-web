import type { Metadata } from 'next';
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
import { Breadcrumb, SectionTitle } from '@/components/quiz/ui';
import type { TrackId } from '@/lib/quiz/types';

export const metadata: Metadata = {
  title: '資格対策',
  description: 'Databricks と Claude の認定資格の解説、資格の出題範囲にもとづく学習ガイド、解説付きのオリジナル問題集。',
};

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

export default function ExamPage() {
  const ids = questionIdsBySet();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="pt-8">
        <Breadcrumb items={[{ href: '/', label: 'トップ' }, { label: '資格対策' }]} />
      </div>
      <header className="mt-6 border-b border-line pb-6">
        <h1 className="text-3xl">資格対策</h1>
        <p className="mt-4 text-lg leading-relaxed">
          Databricks と Claude の認定資格について、どんな資格か、何を学べばよいかをまとめ、解説付きのオリジナル問題集で理解を確かめられます。
        </p>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <a href="#certifications" className="link">資格一覧（{CERTIFICATIONS.length} 資格）</a>
          <a href="#study" className="link">学習すべき内容（{STUDY_TOPICS.length} 項目）</a>
          <a href="#question-sets" className="link">問題集一覧（{QUESTION_SETS.length} 冊・{QUESTIONS.length} 問）</a>
        </p>
      </header>

      {/* 第一章 資格一覧 */}
      <section id="certifications" className="scroll-mt-16 py-10">
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

      {/* 第二章 学習すべき内容 */}
      <section id="study" className="scroll-mt-16 py-10">
        <SectionTitle num="第二章" title="学習すべき内容" en="Study guide" />
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

      {/* 第三章 問題集一覧 */}
      <section id="question-sets" className="scroll-mt-16 py-10">
        <SectionTitle num="第三章" title="問題集一覧" en="Question sets" />
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
