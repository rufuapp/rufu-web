import type { Metadata } from 'next';
import { TRACK_ORDER } from '@/content/catalog';
import { TRACKS } from '@/content/question-sets';
import { Breadcrumb, ExternalLink, SubTitle } from '@/components/quiz/ui';
import { TrendList } from '@/components/trends/TrendList';
import { TRENDS, TREND_SOURCES, TREND_SOURCE_ORDER } from '@/lib/trends/sources';

const PER_SOURCE = 20;

export const metadata: Metadata = {
  title: '最新の動向',
  description: 'Claude と Databricks の公式発表（ニュース・ブログ・リリースノート）を、情報源ごとに新しい順でまとめています。',
};

export default function TrendsPage() {
  const items = TRENDS;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { label: '最新の動向' }]} />
      <header className="mt-6 border-b border-line pb-6">
        <h1 className="text-3xl">最新の動向</h1>
        <p className="mt-4 text-lg leading-relaxed">
          Claude と Databricks の公式発表を、情報源ごとに新しい順でまとめています。毎日集めて、本文をもとに AI（Claude）が日本語の見出しとまとめを付けています。正確な内容は、リンク先の公式の記事で確かめてください。
        </p>
      </header>

      {TRACK_ORDER.slice()
        .reverse()
        .map((track) => (
          <section key={track} className="mt-10">
            <h2 className="border-b-2 border-ink pb-2 text-2xl">
              <span className="mr-2 inline-block h-5 w-1 align-[-2px]" style={{ backgroundColor: TRACKS[track].accent }} />
              {TRACKS[track].name}
            </h2>
            {TREND_SOURCE_ORDER.filter((id) => TREND_SOURCES[id].kind === 'official' && TREND_SOURCES[id].track === track).map((id) => {
              const src = TREND_SOURCES[id];
              const list = items.filter((it) => it.source === id).slice(0, PER_SOURCE);
              return (
                <div key={id}>
                  <SubTitle>{src.name}</SubTitle>
                  <TrendList items={list} showSource={false} />
                  <p className="mt-2 text-right text-sm">
                    <ExternalLink href={src.home}>{src.name}の公式ページ</ExternalLink>
                  </p>
                </div>
              );
            })}
          </section>
        ))}
    </div>
  );
}
