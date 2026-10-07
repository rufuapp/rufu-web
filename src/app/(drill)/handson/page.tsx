import type { Metadata } from 'next';
import Link from 'next/link';
import { HANDSON_GUIDES } from '@/content/handson';
import { Breadcrumb, SubTitle } from '@/components/quiz/ui';

export const metadata: Metadata = {
  alternates: { canonical: '/handson' },
  title: 'やってみた',
  description: 'Claude と Databricks を、手を動かして確かめる手順付きのハンズオン。Claude Code の Skill、MCP サーバー、ai_query、Unity Catalog の権限など。',
};

const GROUPS = [
  { track: 'claude', name: 'Claude' },
  { track: 'databricks', name: 'Databricks' },
] as const;

export default function HandsonPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { label: 'やってみた' }]} />
      <header className="mt-6 border-b border-line pb-6">
        <h1 className="text-3xl">やってみた</h1>
        <p className="mt-4 text-lg leading-relaxed">
          読むだけでなく、手を動かして確かめるための手順集です。それぞれに、目的・用意するもの・手順・確かめ方・つまずきどころ・後片付けをまとめています。
        </p>
        <p className="mt-3 text-sm text-muted">
          「動作確認済み」は、本サイトで実際に手順どおりに動くことを確かめたものです。「未検証」は公式ドキュメントに沿って書いたもので、試した結果を追記していきます。
        </p>
      </header>

      {GROUPS.map((g) => (
        <section key={g.track}>
          <SubTitle>{g.name}</SubTitle>
          <ul className="divide-y divide-line border-y border-ink">
            {HANDSON_GUIDES.filter((h) => h.track === g.track).map((h) => (
              <li key={h.id} className="py-3">
                <p className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`tag ${h.verified.status === 'tested' ? 'text-ok' : 'text-muted'}`}>
                    {h.verified.status === 'tested' ? '動作確認済み' : '未検証'}
                  </span>
                  <span className="text-muted">
                    {h.level}・約 {h.minutes} 分
                  </span>
                </p>
                <Link href={`/handson/${h.id}`} className="link mt-1 inline-block font-bold">
                  {h.title}
                </Link>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted">{h.summary}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
