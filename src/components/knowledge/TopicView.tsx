import Link from 'next/link';
import { BASICS_CHECKED_ON, BASICS_GROUPS, type BasicsTopic } from '@/content/basics';
import { Breadcrumb, ResourceList, SubTitle } from '@/components/quiz/ui';

/** 基礎知識・応用知識の各項目のページ（同じ形で表示する） */
export function TopicView({ topic, topics, section }: { topic: BasicsTopic; topics: BasicsTopic[]; section: { name: string; base: string } }) {
  const group = BASICS_GROUPS.find((g) => g.id === topic.group)!;
  const siblings = topics.filter((t) => t.group === topic.group);
  const index = topics.findIndex((t) => t.id === topic.id);
  const prev = topics[index - 1];
  const next = topics[index + 1];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { href: section.base, label: section.name }, { label: topic.title }]} />

      <header className="mt-6 border-b border-line pb-6">
        <p className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold tracking-[0.18em] text-muted">{group.name}</span>
          <span className="tag text-muted">{section.name}</span>
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

          {topic.seeAlso && (
            <>
              <SubTitle>あわせて読む</SubTitle>
              <ul className="space-y-1">
                {topic.seeAlso.map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} className="link">
                      {s.title}
                    </Link>
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
            <h2 className="border-b border-ink pb-1.5 font-bold tracking-[0.1em]">
              {group.name}の{section.name}
            </h2>
            <ol className="mt-2 space-y-1.5">
              {siblings.map((t, i) => (
                <li key={t.id} className="flex gap-2">
                  <span className="w-5 shrink-0 text-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  {t.id === topic.id ? (
                    <span aria-current="page" className="font-bold">
                      {t.title}
                    </span>
                  ) : (
                    <Link href={`${section.base}/${t.id}`} className="link">
                      {t.title}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      <nav aria-label={`前後の${section.name}`} className="mt-14 grid gap-4 border-t border-ink pt-4 text-sm sm:grid-cols-2">
        <div>
          {prev && (
            <Link href={`${section.base}/${prev.id}`} className="link">
              ← 前の項目：{prev.title}
            </Link>
          )}
        </div>
        <div className="sm:text-right">
          {next && (
            <Link href={`${section.base}/${next.id}`} className="link">
              次の項目：{next.title} →
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
