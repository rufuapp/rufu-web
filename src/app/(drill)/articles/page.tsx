import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/quiz/ui';
import { getArticles } from '@/lib/articles';

export const metadata: Metadata = {
  alternates: { canonical: '/articles' },
  title: '著者記事',
  description: 'FDE を目指す著者が、Claude と Databricks を中心に、気になったことを調べて書いた記事です。',
};

export default function ArticlesPage() {
  const articles = getArticles();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { label: '著者記事' }]} />
      <header className="mt-6 border-b border-line pb-6">
        <h1 className="text-3xl">著者記事</h1>
        <p className="mt-4 text-lg leading-relaxed">FDE を目指す著者が、Claude と Databricks を中心に、気になったことを調べて書いた記事です。</p>
      </header>
      <ul className="mt-6 divide-y divide-line border-y border-ink">
        {articles.map((a) => (
          <li key={a.slug} className="py-5">
            <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <time dateTime={a.date} className="tabular-nums">
                {a.date.replaceAll('-', '.')}
              </time>
              {a.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </p>
            <Link href={`/articles/${a.slug}`} className="link mt-1 inline-block text-lg font-bold">
              {a.title}
            </Link>
            <p className="mt-1 text-sm leading-relaxed text-muted">{a.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
