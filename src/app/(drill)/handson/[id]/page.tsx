import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HANDSON_GUIDES, getHandsonGuide } from '@/content/handson';
import { SITE_NAME } from '@/content/site';
import { Breadcrumb, ResourceList, SubTitle } from '@/components/quiz/ui';

export function generateStaticParams() {
  return HANDSON_GUIDES.map((g) => ({ id: g.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const guide = getHandsonGuide(id);
  if (!guide) return {};
  return {
    alternates: { canonical: `/handson/${guide.id}` },
    title: `${guide.title}（やってみた）`,
    description: guide.summary,
    openGraph: { title: `${guide.title} | ${SITE_NAME}`, description: guide.summary, type: 'article', images: '/opengraph-image' },
    twitter: { card: 'summary_large_image', title: `${guide.title} | ${SITE_NAME}`, description: guide.summary, images: '/twitter-image' },
  };
}

const KANJI = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-6">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export default async function HandsonGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guide = getHandsonGuide(id);
  if (!guide) notFound();
  const tested = guide.verified.status === 'tested';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { href: '/handson', label: 'やってみた' }, { label: guide.title }]} />

      <header className="mt-6 border-b border-line pb-6">
        <p className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-bold tracking-[0.18em] text-muted">{guide.track === 'claude' ? 'CLAUDE' : 'DATABRICKS'}</span>
          <span className={`tag ${tested ? 'text-ok' : 'text-muted'}`}>{tested ? '動作確認済み' : '未検証'}</span>
          <span className="text-muted">
            {guide.level}・約 {guide.minutes} 分
          </span>
        </p>
        <h1 className="mt-3 text-3xl">{guide.title}</h1>
        <p className="mt-4 text-lg leading-relaxed">{guide.summary}</p>
        <p className={`mt-3 text-sm ${tested ? 'text-ok' : 'text-warn'}`}>※ {guide.verified.note}</p>
      </header>

      <article className="mx-auto mt-8 max-w-3xl [&>h3:first-child]:mt-0">
        <SubTitle>この手順でできること</SubTitle>
        <List items={guide.goal} />

        <SubTitle>用意するもの</SubTitle>
        <List items={guide.prerequisites} />

        <SubTitle>手順</SubTitle>
        <ol className="space-y-8">
          {guide.steps.map((s, i) => (
            <li key={s.title}>
              <h4 className="font-bold">
                <span className="mr-1 text-muted">{KANJI[i] ?? i + 1}、</span>
                {s.title}
              </h4>
              {s.body.map((p) => (
                <p key={p} className="mt-2">
                  {p}
                </p>
              ))}
              {s.code?.map((c, j) => (
                <figure key={j} className="mt-3">
                  {c.label && <figcaption className="mb-1 text-xs text-muted">{c.label}</figcaption>}
                  <pre className="overflow-x-auto border border-line bg-subtle p-4 text-[13px] leading-relaxed">
                    <code>{c.content}</code>
                  </pre>
                </figure>
              ))}
            </li>
          ))}
        </ol>

        <SubTitle>うまくいったかの確かめ方</SubTitle>
        <List items={guide.check} />

        <SubTitle>つまずきどころ</SubTitle>
        <List items={guide.pitfalls} />

        {guide.cleanup && (
          <>
            <SubTitle>後片付け</SubTitle>
            <List items={guide.cleanup} />
          </>
        )}

        <SubTitle>公式の情報</SubTitle>
        <ResourceList resources={guide.resources} />

        <p className="mt-12 border-t border-ink pt-4 text-sm">
          <Link href="/handson" className="link">
            ← やってみたの一覧に戻る
          </Link>
        </p>
      </article>
    </div>
  );
}
