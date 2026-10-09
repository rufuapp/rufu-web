import type { Metadata } from 'next';
import Link from 'next/link';
import { ADVANCED_TOPICS } from '@/content/advanced';
import { BASICS_CHECKED_ON, BASICS_GROUPS } from '@/content/basics';
import { Breadcrumb, SubTitle } from '@/components/quiz/ui';

export const metadata: Metadata = {
  alternates: { canonical: '/advanced' },
  title: '応用知識',
  description: '基礎知識を押さえた後に読む、Claude と Databricks の作り方や仕組みに踏み込んだ知識。',
};

export default function AdvancedPage() {
  const groups = BASICS_GROUPS.filter((g) => ADVANCED_TOPICS.some((t) => t.group === g.id));
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { label: '応用知識' }]} />
      <header className="mt-6 border-b border-line pb-6">
        <h1 className="text-3xl">応用知識</h1>
        <p className="mt-4 text-lg leading-relaxed">
          <Link href="/basics" className="link">
            基礎知識
          </Link>
          を押さえた後に読む、作り方や仕組みに踏み込んだ内容をまとめています。
        </p>
        <p className="mt-3 text-sm text-muted">{BASICS_CHECKED_ON}時点の公式の情報をもとにしています。お客さまに伝える前に、公式の情報を確かめてください。</p>
      </header>

      {groups.map((g) => (
        <section key={g.id} id={g.id} className="scroll-mt-16">
          <SubTitle>{g.name}</SubTitle>
          <ol className="divide-y divide-line border-y border-ink">
            {ADVANCED_TOPICS.filter((t) => t.group === g.id).map((t, i) => (
              <li key={t.id} className="flex gap-3 py-3">
                <span className="w-6 shrink-0 text-sm text-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <Link href={`/advanced/${t.id}`} className="link font-bold">
                    {t.title}
                  </Link>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted">{t.summary}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
