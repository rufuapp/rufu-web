import type { Metadata } from 'next';
import { Breadcrumb, ExternalLink, SubTitle } from '@/components/quiz/ui';
import { TrendList } from '@/components/trends/TrendList';
import { TIPS, TREND_SOURCES, TREND_SOURCE_ORDER } from '@/lib/trends/sources';

const PER_TOPIC = 15;

export const metadata: Metadata = {
  title: '技術 Tips',
  description: 'Claude Code の Skill・設定・MCP や、Databricks の実務での使い方について、Zenn の技術記事を毎日集め、日本語の短いまとめを付けて紹介しています。',
};

export default function TipsPage() {
  const topics = TREND_SOURCE_ORDER.filter((id) => TREND_SOURCES[id].kind === 'tips');

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { label: '技術 Tips' }]} />
      <header className="mt-6 border-b border-line pb-6">
        <h1 className="text-3xl">技術 Tips</h1>
        <p className="mt-4 text-lg leading-relaxed">
          どんな Skill を作るとよいか、Claude Code をどう使いこなすか、Databricks を実務でどう使うか。技術記事サイト Zenn に投稿された記事を毎日集め、本文をもとに AI（Claude）が短いまとめを付けています。
        </p>
        <p className="mt-3 text-sm text-muted">
          記事は個人の方が書いたもので、本サイトや各社の公式の見解ではありません。試すときは、リンク先の記事と公式ドキュメントで内容を確かめてください。
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {topics.map((id) => (
            <li key={id}>
              <a href={`#${id}`} className="link">
                {TREND_SOURCES[id].name}
              </a>
            </li>
          ))}
        </ul>
      </header>

      {topics.map((id) => {
        const src = TREND_SOURCES[id];
        return (
          <section key={id} id={id} className="scroll-mt-6">
            <SubTitle>{src.name}</SubTitle>
            {src.note && <p className="mb-3 text-sm text-muted">{src.note}</p>}
            <TrendList items={TIPS.filter((it) => it.source === id).slice(0, PER_TOPIC)} showSource={false} />
            <p className="mt-2 text-right text-sm">
              <ExternalLink href={src.home}>Zenn の「{src.name}」の記事一覧</ExternalLink>
            </p>
          </section>
        );
      })}
    </div>
  );
}
