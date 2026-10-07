import type { TrackId } from '@/lib/quiz/types';
import type { TrendEntry, TrendSourceId } from './parse';
import ITEMS from '@/content/trends/items.json';

// 記事は日次バッチ（scripts/trends/update.mjs）が集めて items.json に保存する。サイトはそれを表示するだけ

export const TREND_SOURCES: Record<TrendSourceId, { name: string; track: TrackId; home: string }> = {
  'anthropic-news': { name: 'Anthropic ニュース', track: 'claude', home: 'https://www.anthropic.com/news' },
  'claude-blog': { name: 'Claude ブログ', track: 'claude', home: 'https://claude.com/blog' },
  'databricks-blog': { name: 'Databricks ブログ', track: 'databricks', home: 'https://www.databricks.com/blog' },
  'databricks-release-notes': { name: 'Databricks リリースノート', track: 'databricks', home: 'https://docs.databricks.com/aws/en/release-notes/' },
};

export const TREND_SOURCE_ORDER = Object.keys(TREND_SOURCES) as TrendSourceId[];

/** 新しい順の記事 */
export const TRENDS: TrendEntry[] = (ITEMS as TrendEntry[]).slice().sort((a, b) => b.date.localeCompare(a.date));

/** 日本時間の今日（YYYY-MM-DD） */
export function todayInTokyo(now = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** today から days 日前以降の件数 */
export function countSince(items: { date: string }[], today: string, days: number): number {
  const from = new Date(Date.parse(`${today}T00:00:00Z`) - days * 86_400_000).toISOString().slice(0, 10);
  return items.filter((it) => it.date >= from).length;
}
