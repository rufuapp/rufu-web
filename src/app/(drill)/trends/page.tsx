import type { Metadata } from 'next';
import { Breadcrumb, ExternalLink, SubTitle } from '@/components/quiz/ui';
import { TrendList } from '@/components/trends/TrendList';
import { COMPARE_GROUPS, COMPARE_TRENDS, CORE_VENDORS, TRENDS, TREND_SOURCES, TREND_SOURCE_ORDER, VENDORS, isFromVendor } from '@/lib/trends/sources';

const PER_SOURCE = 20;
const PER_COMPARE_VENDOR = 8;

export const metadata: Metadata = {
  alternates: { canonical: '/trends' },
  title: '最新の動向',
  description: 'Claude と Databricks の公式発表を、情報源ごとに新しい順でまとめています。比較対象として OpenAI・AWS・Google Cloud・Azure・NVIDIA・Snowflake・Palantir の発表も載せています。',
};

export default function TrendsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { label: '最新の動向' }]} />
      <header className="mt-6 border-b border-line pb-6">
        <h1 className="text-3xl">最新の動向</h1>
        <p className="mt-4 text-lg leading-relaxed">
          Claude と Databricks の公式発表を、情報源ごとに新しい順でまとめています。毎日集めて、本文をもとに AI（Claude）が日本語の見出しとまとめを付けています。正確な内容は、リンク先の公式の記事で確かめてください。
        </p>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {CORE_VENDORS.map((v) => (
            <a key={v} href={`#${v}`} className="link">
              {VENDORS[v].name}
            </a>
          ))}
          <a href="#compare" className="link">
            比較対象
          </a>
        </p>
      </header>

      {CORE_VENDORS.map((vendor) => (
        <section key={vendor} id={vendor} className="mt-10 scroll-mt-16">
          <h2 className="border-b-2 border-ink pb-2 text-2xl">
            <span className="mr-2 inline-block h-5 w-1 align-[-2px]" style={{ backgroundColor: VENDORS[vendor].accent }} />
            {VENDORS[vendor].name}
          </h2>
          {TREND_SOURCE_ORDER.filter((id) => TREND_SOURCES[id].kind === 'official' && TREND_SOURCES[id].vendor === vendor).map((id) => {
            const src = TREND_SOURCES[id];
            return (
              <div key={id}>
                <SubTitle>{src.name}</SubTitle>
                <TrendList items={TRENDS.filter((it) => it.source === id).slice(0, PER_SOURCE)} showSource={false} />
                <p className="mt-2 text-right text-sm">
                  <ExternalLink href={src.home}>{src.name}の公式ページ</ExternalLink>
                </p>
              </div>
            );
          })}
        </section>
      ))}

      <section id="compare" className="mt-16 scroll-mt-16">
        <h2 className="border-b-2 border-ink pb-2 text-2xl">比較対象</h2>
        <p className="mt-3">主役の Claude と Databricks と比べてどうかを見るために、ほかの会社の公式発表を載せています。</p>
        {COMPARE_GROUPS.map((g) => (
          <div key={g.core} className="mt-8">
            <h3 className="text-xl">{g.title}</h3>
            <p className="mt-1 text-sm text-muted">{g.lead}</p>
            {g.vendors.map((v) => {
              const sources = TREND_SOURCE_ORDER.filter((id) => TREND_SOURCES[id].kind === 'compare' && TREND_SOURCES[id].vendor === v);
              return (
                <div key={v}>
                  <SubTitle>{VENDORS[v].name}</SubTitle>
                  <TrendList items={COMPARE_TRENDS.filter((it) => isFromVendor(it, v)).slice(0, PER_COMPARE_VENDOR)} />
                  <p className="mt-2 flex flex-wrap justify-end gap-x-4 text-sm">
                    {sources.map((id) => (
                      <ExternalLink key={id} href={TREND_SOURCES[id].home}>
                        {TREND_SOURCES[id].name}
                      </ExternalLink>
                    ))}
                  </p>
                </div>
              );
            })}
          </div>
        ))}
      </section>
    </div>
  );
}
