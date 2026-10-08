import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SITE_NAME } from '@/content/site';
import { Breadcrumb } from '@/components/quiz/ui';
import { getArticle, getArticles } from '@/lib/articles';

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return {
    alternates: { canonical: `/articles/${a.slug}` },
    title: a.title,
    description: a.summary,
    openGraph: { title: `${a.title} | ${SITE_NAME}`, description: a.summary, type: 'article', publishedTime: a.date, images: '/opengraph-image' },
    twitter: { card: 'summary_large_image', title: `${a.title} | ${SITE_NAME}`, description: a.summary, images: '/twitter-image' },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { href: '/articles', label: '著者記事' }, { label: a.title }]} />
      <header className="mx-auto mt-6 max-w-3xl border-b border-line pb-6">
        <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="font-bold tracking-[0.18em]">著者記事</span>
          <time dateTime={a.date} className="tabular-nums">
            {a.date.replaceAll('-', '.')}
          </time>
          {a.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </p>
        <h1 className="mt-3 text-3xl leading-snug">{a.title}</h1>
        <p className="mt-4 leading-relaxed text-muted">{a.summary}</p>
        {a.aiAssisted && <p className="mt-3 text-xs text-muted">※ この記事は、調査と下書きに AI（Claude）の手を借り、著者が内容を確かめて公開しています。</p>}
      </header>

      <div className="mx-auto mt-8 max-w-3xl">
        {a.headings.length > 2 && (
          <nav aria-labelledby="article-toc" className="box mb-10 p-5 text-sm">
            <h2 id="article-toc" className="border-b border-ink pb-1.5 font-bold tracking-[0.2em]">
              目次
            </h2>
            <ol className="mt-2 space-y-1.5">
              {a.headings.map((h, i) => (
                <li key={h.id} className="flex gap-2">
                  <span className="w-5 shrink-0 text-muted tabular-nums">{i + 1}.</span>
                  <a href={`#${h.id}`} className="link">
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        {/* 本文はリポジトリに置いた Markdown（著者が書いたもの）から作る */}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: a.html }} />
        <p className="mt-14 border-t border-ink pt-4 text-sm">
          <Link href="/articles" className="link">
            ← 著者記事の一覧に戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
