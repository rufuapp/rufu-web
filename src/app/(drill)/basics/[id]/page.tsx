import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BASICS_CHECKED_ON, BASICS_GROUPS, BASICS_TOPICS, basicsForGroup, getBasicsTopic } from '@/content/basics';
import { SITE_NAME } from '@/content/site';
import { Breadcrumb, ResourceList, SubTitle } from '@/components/quiz/ui';

export function generateStaticParams() {
  return BASICS_TOPICS.map((t) => ({ id: t.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const topic = getBasicsTopic(id);
  if (!topic) return {};
  return {
    title: `${topic.title}（基礎知識）`,
    description: topic.summary,
    openGraph: { title: `${topic.title} | ${SITE_NAME}`, description: topic.summary, type: 'article' },
    twitter: { card: 'summary', title: `${topic.title} | ${SITE_NAME}`, description: topic.summary },
  };
}

export default async function BasicsTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = getBasicsTopic(id);
  if (!topic) notFound();
  const group = BASICS_GROUPS.find((g) => g.id === topic.group)!;
  const siblings = basicsForGroup(topic.group);
  const index = BASICS_TOPICS.findIndex((t) => t.id === topic.id);
  const prev = BASICS_TOPICS[index - 1];
  const next = BASICS_TOPICS[index + 1];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { href: '/basics', label: '基礎知識' }, { label: topic.title }]} />

      <header className="mt-6 border-b border-line pb-6">
        <p className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold tracking-[0.18em] text-muted">{group.name}</span>
          <span className="tag text-muted">基礎知識</span>
        </p>
        <h1 className="mt-3 text-3xl">{topic.title}</h1>
        <p className="mt-4 text-lg leading-relaxed">{topic.summary}</p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
        <article className="min-w-0 [&>h3:first-child]:mt-0">
          <SubTitle>はじめに</SubTitle>
          {topic.intro.map((p) => (
            <p key={p} className="mt-3">
              {p}
            </p>
          ))}

          {topic.sections.map((s) => (
            <section key={s.heading}>
              <SubTitle>{s.heading}</SubTitle>
              {s.body.map((p) => (
                <p key={p} className="mt-3">
                  {p}
                </p>
              ))}
            </section>
          ))}

          {topic.checklist && (
            <>
              <SubTitle>確認すること</SubTitle>
              <ul className="box divide-y divide-line px-5">
                {topic.checklist.map((c) => (
                  <li key={c} className="flex gap-3 py-2.5">
                    <span aria-hidden className="text-muted">
                      □
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </>
          )}

          <SubTitle>公式の情報</SubTitle>
          <p className="mb-3 text-sm text-muted">{BASICS_CHECKED_ON}時点の公式の情報をもとにしています。内容は更新されることがあるため、最新の版を確かめてください。</p>
          <ResourceList resources={topic.resources} />
        </article>

        <aside className="text-sm">
          <section className="box p-5">
            <h2 className="border-b border-ink pb-1.5 font-bold tracking-[0.1em]">{group.name}の基礎知識</h2>
            <ol className="mt-2 space-y-1.5">
              {siblings.map((t, i) => (
                <li key={t.id} className="flex gap-2">
                  <span className="w-5 shrink-0 text-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  {t.id === topic.id ? (
                    <span aria-current="page" className="font-bold">
                      {t.title}
                    </span>
                  ) : (
                    <Link href={`/basics/${t.id}`} className="link">
                      {t.title}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      <nav aria-label="前後の基礎知識" className="mt-14 grid gap-4 border-t border-ink pt-4 text-sm sm:grid-cols-2">
        <div>
          {prev && (
            <Link href={`/basics/${prev.id}`} className="link">
              ← 前の項目：{prev.title}
            </Link>
          )}
        </div>
        <div className="sm:text-right">
          {next && (
            <Link href={`/basics/${next.id}`} className="link">
              次の項目：{next.title} →
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
