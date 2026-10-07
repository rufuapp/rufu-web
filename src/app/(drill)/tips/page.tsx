import type { Metadata } from 'next';
import { Breadcrumb, ExternalLink, SubTitle } from '@/components/quiz/ui';
import { TrendList } from '@/components/trends/TrendList';
import { TIPS, TIPS_THEMES, TREND_SOURCES, TREND_SOURCE_ORDER } from '@/lib/trends/sources';

const PER_THEME = 15;

export const metadata: Metadata = {
  alternates: { canonical: '/tips' },
  title: '技術 Tips',
  description: 'Claude Code の Skill・設定・MCP や、Databricks の実務での使い方について、Zenn・Qiita・DevelopersIO の技術記事を毎日集め、日本語の短いまとめを付けて紹介しています。',
};

export default function TipsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { label: '技術 Tips' }]} />
      <header className="mt-6 border-b border-line pb-6">
        <h1 className="text-3xl">技術 Tips</h1>
        <p className="mt-4 text-lg leading-relaxed">
          どんな Skill を作るとよいか、Claude Code をどう使いこなすか、Databricks を実務でどう使うか。Zenn・Qiita・DevelopersIO に投稿された技術記事を毎日集め、本文をもとに AI（Claude）が短いまとめを付けています。
        </p>
        <p className="mt-3 text-sm text-muted">
          記事は各サイトの書き手の方によるもので、本サイトや各社の公式の見解ではありません。試すときは、リンク先の記事と公式ドキュメントで内容を確かめてください。
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {TIPS_THEMES.map((t) => (
            <li key={t.id}>
              <a href={`#${t.id}`} className="link">
                {t.name}
              </a>
            </li>
          ))}
        </ul>
      </header>

      {TIPS_THEMES.map((theme) => {
        const sources = TREND_SOURCE_ORDER.filter((id) => TREND_SOURCES[id].theme === theme.id);
        return (
          <section key={theme.id} id={theme.id} className="scroll-mt-16">
            <SubTitle>{theme.name}</SubTitle>
            <p className="mb-3 text-sm text-muted">{theme.note}</p>
            <TrendList items={TIPS.filter((it) => sources.includes(it.source)).slice(0, PER_THEME)} />
            <p className="mt-2 flex flex-wrap justify-end gap-x-4 text-sm">
              {sources.map((id) => (
                <ExternalLink key={id} href={TREND_SOURCES[id].home}>
                  {TREND_SOURCES[id].name}の記事一覧
                </ExternalLink>
              ))}
            </p>
          </section>
        );
      })}
    </div>
  );
}
