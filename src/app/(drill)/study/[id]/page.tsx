import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { STUDY_TOPICS, getStudyTopic } from '@/content/study-topics';
import { domainName, getQuestionSet } from '@/content/question-sets';
import { QUESTIONS } from '@/content/questions';
import { adjacentTopics, certificationsForTopic, topicsForTrack } from '@/content/catalog';
import { SITE_NAME } from '@/content/site';
import { Breadcrumb, ResourceList, SubTitle, TrackLabel } from '@/components/quiz/ui';

const KANJI = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

export function generateStaticParams() {
  return STUDY_TOPICS.map((t) => ({ id: t.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const topic = getStudyTopic(id);
  if (!topic) return {};
  return {
    title: `${topic.title}（学習ガイド）`,
    description: topic.summary,
    openGraph: { title: `${topic.title} | ${SITE_NAME}`, description: topic.summary, type: 'article' },
    twitter: { card: 'summary', title: `${topic.title} | ${SITE_NAME}`, description: topic.summary },
  };
}

export default async function StudyTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = getStudyTopic(id);
  if (!topic) notFound();
  const certs = certificationsForTopic(topic.id);
  const { prev, next } = adjacentTopics(topic.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { href: '/#study', label: '学習すべき内容' }, { label: topic.title }]} />

      <header className="mt-6 border-b border-line pb-6">
        <p className="flex flex-wrap items-center gap-3">
          <TrackLabel track={topic.track} />
          <span className="tag text-muted">学習ガイド</span>
        </p>
        <h1 className="mt-3 text-3xl">{topic.title}</h1>
        <p className="mt-4 text-lg leading-relaxed">{topic.summary}</p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
        <article className="min-w-0 [&>h3:first-child]:mt-0">
          <SubTitle>概要</SubTitle>
          {topic.intro.map((p) => (
            <p key={p} className="mt-3">
              {p}
            </p>
          ))}

          <SubTitle>押さえるべきポイント</SubTitle>
          <ol className="space-y-6">
            {topic.points.map((p, i) => (
              <li key={p.heading}>
                <h4 className="font-bold">
                  <span className="mr-1 text-muted">{KANJI[i] ?? i + 1}、</span>
                  {p.heading}
                </h4>
                <p className="mt-1">{p.body}</p>
              </li>
            ))}
          </ol>

          <SubTitle>重要な用語</SubTitle>
          <div className="overflow-x-auto">
            <table className="ruled">
              <thead>
                <tr>
                  <th scope="col">用語</th>
                  <th scope="col">意味</th>
                </tr>
              </thead>
              <tbody>
                {topic.terms.map((t) => (
                  <tr key={t.term}>
                    <th scope="row" className="font-bold whitespace-nowrap">
                      {t.term}
                    </th>
                    <td className="text-sm leading-relaxed">{t.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SubTitle>おすすめの教材</SubTitle>
          <p className="mb-3 text-sm text-muted">いずれも公式の情報です。内容は更新されることがあるため、最新の版を確認してください。</p>
          <ResourceList resources={topic.resources} />

          <SubTitle>問題で確かめる</SubTitle>
          <ul className="space-y-3">
            {topic.practice.map((p) => {
              const set = getQuestionSet(p.setId);
              if (!set) return null;
              const count = QUESTIONS.filter((q) => q.examId === set.id && p.domains.includes(q.domain)).length;
              return (
                <li key={p.setId} className="box flex flex-wrap items-center justify-between gap-3 p-4">
                  <span>
                    <span className="font-bold">{set.title}</span>
                    <span className="block text-sm text-muted">
                      分野：{p.domains.map((d) => domainName(set, d)).join('、')}（{count}問）
                    </span>
                  </span>
                  <Link href={`/question-sets/${set.id}?domain=${p.domains.join(',')}`} className="btn btn-primary px-5 text-sm">
                    この分野を解く
                  </Link>
                </li>
              );
            })}
          </ul>
        </article>

        <aside className="space-y-6 text-sm">
          <section className="box p-5">
            <h2 className="border-b border-ink pb-1.5 font-bold tracking-[0.1em]">この内容が役立つ資格</h2>
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
            <h2 className="border-b border-ink pb-1.5 font-bold tracking-[0.1em]">{topic.track === 'claude' ? 'Claude' : 'Databricks'} の学習ガイド</h2>
            <ol className="mt-2 space-y-1.5">
              {topicsForTrack(topic.track).map((t, i) => (
                <li key={t.id} className="flex gap-2">
                  <span className="w-5 shrink-0 text-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  {t.id === topic.id ? (
                    <span aria-current="page" className="font-bold">
                      {t.title}
                    </span>
                  ) : (
                    <Link href={`/study/${t.id}`} className="link">
                      {t.title}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      <nav aria-label="前後の学習ガイド" className="mt-14 grid gap-4 border-t border-ink pt-4 text-sm sm:grid-cols-2">
        <div>
          {prev && (
            <Link href={`/study/${prev.id}`} className="link">
              ← 前の項目：{prev.title}
            </Link>
          )}
        </div>
        <div className="sm:text-right">
          {next && (
            <Link href={`/study/${next.id}`} className="link">
              次の項目：{next.title} →
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
