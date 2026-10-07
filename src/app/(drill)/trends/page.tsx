import type { Metadata } from 'next';
import { TRACK_ORDER } from '@/content/catalog';
import { TRACKS } from '@/content/question-sets';
import { Breadcrumb, ExternalLink, SubTitle } from '@/components/quiz/ui';
import { TrendList } from '@/components/trends/TrendList';
import { TREND_SOURCES, TREND_SOURCE_ORDER, fetchTrends } from '@/lib/trends/fetch';

// 1時間ごとに取り直す（TRENDS_REVALIDATE と同じ値）
export const revalidate = 3600;

const PER_SOURCE = 20;

export const metadata: Metadata = {
  title: '最新の動向',
  description: 'Claude と Databricks の公式発表（ニュース・ブログ・リリースノート）を、情報源ごとに新しい順でまとめています。',
};

export default async function TrendsPage() {
  const { items, failed } = await fetchTrends();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { label: '最新の動向' }]} />
      <header className="mt-6 border-b border-line pb-6">
        <h1 className="text-3xl">最新の動向</h1>
        <p className="mt-4 text-lg leading-relaxed">
          Claude と Databricks の公式発表を、情報源ごとに新しい順でまとめています。1時間ごとに取り直し、見出しは原文のまま載せています。
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
            {TREND_SOURCE_ORDER.filter((id) => TREND_SOURCES[id].track === track).map((id) => {
              const src = TREND_SOURCES[id];
              const list = items.filter((it) => it.source === id).slice(0, PER_SOURCE);
              return (
                <div key={id}>
                  <SubTitle>{src.name}</SubTitle>
                  {failed.includes(id) ? (
                    <p className="text-muted">いまは取得できていません。公式サイトで直接確かめてください。</p>
                  ) : (
                    <TrendList items={list} showSource={false} />
                  )}
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
