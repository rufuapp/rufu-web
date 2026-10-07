import type { TrackId } from '@/lib/quiz/types';
import { mergeTrends, parseAnthropicNews, parseClaudeBlog, parseRss, type TrendItem, type TrendSourceId } from './parse';

/** 1時間ごとに取り直す */
export const TRENDS_REVALIDATE = 3600;

export const TREND_SOURCES: Record<TrendSourceId, { name: string; track: TrackId; feed: string; home: string; parse: (body: string) => TrendItem[] }> = {
  'anthropic-news': {
    name: 'Anthropic ニュース',
    track: 'claude',
    feed: 'https://www.anthropic.com/news',
    home: 'https://www.anthropic.com/news',
    parse: parseAnthropicNews,
  },
  'claude-blog': {
    name: 'Claude ブログ',
    track: 'claude',
    feed: 'https://claude.com/blog',
    home: 'https://claude.com/blog',
    parse: parseClaudeBlog,
  },
  'databricks-blog': {
    name: 'Databricks ブログ',
    track: 'databricks',
    feed: 'https://www.databricks.com/feed',
    home: 'https://www.databricks.com/blog',
    parse: (xml) => parseRss(xml, 'databricks-blog'),
  },
  'databricks-release-notes': {
    name: 'Databricks リリースノート',
    track: 'databricks',
    feed: 'https://docs.databricks.com/aws/en/feed.xml',
    home: 'https://docs.databricks.com/aws/en/release-notes/',
    parse: (xml) => parseRss(xml, 'databricks-release-notes'),
  },
};

export const TREND_SOURCE_ORDER = Object.keys(TREND_SOURCES) as TrendSourceId[];

async function fetchSource(id: TrendSourceId): Promise<TrendItem[]> {
  const src = TREND_SOURCES[id];
  const res = await fetch(src.feed, {
    next: { revalidate: TRENDS_REVALIDATE },
    signal: AbortSignal.timeout(10_000),
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; FDE-Kiso-Tokuhon/1.0)' },
  });
  if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`);
  return src.parse(await res.text());
}

/** 日本時間の今日（YYYY-MM-DD） */
export function todayInTokyo(now = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** today から days 日前以降の件数 */
export function countSince(items: TrendItem[], today: string, days: number): number {
  const from = new Date(Date.parse(`${today}T00:00:00Z`) - days * 86_400_000).toISOString().slice(0, 10);
  return items.filter((it) => it.date >= from).length;
}

/**
 * すべての情報源から集める。取れなかった情報源は failed に入れ、ほかは表示する。
 * リリースノートには公開予定日の付いた項目があるため、今日より先の日付は除く。
 */
export async function fetchTrends(): Promise<{ items: TrendItem[]; failed: TrendSourceId[]; today: string }> {
  const today = todayInTokyo();
  const results = await Promise.allSettled(TREND_SOURCE_ORDER.map(fetchSource));
  const failed = TREND_SOURCE_ORDER.filter((_, i) => results[i].status === 'rejected' || (results[i] as PromiseFulfilledResult<TrendItem[]>).value.length === 0);
  const lists = results.map((r) => (r.status === 'fulfilled' ? r.value.filter((it) => it.date <= today) : []));
  return { items: mergeTrends(lists), failed, today };
}
