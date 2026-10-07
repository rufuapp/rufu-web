import type { Metadata } from 'next';
import Link from 'next/link';
import { BASICS_CHECKED_ON, BASICS_GROUPS, basicsForGroup } from '@/content/basics';
import { Breadcrumb, SubTitle } from '@/components/quiz/ui';

export const metadata: Metadata = {
  title: '基礎知識',
  description: 'FDE として Claude と Databricks を提案・導入するときに必要な基礎知識。モデルの選び方、データの扱い、料金、PoC の進め方、本番化のチェックリストなど。',
};

export default function BasicsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { label: '基礎知識' }]} />
      <header className="mt-6 border-b border-line pb-6">
        <h1 className="text-3xl">基礎知識</h1>
        <p className="mt-4 text-lg leading-relaxed">
          資格の出題範囲にとらわれず、FDE としてお客さまに Claude と Databricks を提案し、導入するときに必要になる知識をまとめています。
        </p>
        <p className="mt-3 text-sm text-muted">
          料金やモデル、データの扱いは {BASICS_CHECKED_ON}時点の公式の情報をもとにしています。変わることがあるので、お客さまに伝える前に公式の情報を確かめてください。
        </p>
      </header>

      {BASICS_GROUPS.map((g) => (
        <section key={g.id} id={g.id} className="scroll-mt-16">
          <SubTitle>{g.name}</SubTitle>
          <p className="mb-3 text-sm text-muted">{g.lead}</p>
          <ol className="divide-y divide-line border-y border-ink">
            {basicsForGroup(g.id).map((t, i) => (
              <li key={t.id} className="flex gap-3 py-3">
                <span className="w-6 shrink-0 text-sm text-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <Link href={`/basics/${t.id}`} className="link font-bold">
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
