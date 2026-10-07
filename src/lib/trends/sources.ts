import type { TrackId } from '@/lib/quiz/types';
import type { TrendEntry, TrendSourceId } from './parse';
import ITEMS from '@/content/trends/items.json';

// 記事は日次バッチ（scripts/trends/update.mjs）が集めて items.json に保存する。サイトはそれを表示するだけ

/** official: 公式の発表（最新の動向）／ tips: 技術記事（技術 Tips） */
export type TrendKind = 'official' | 'tips';

/** 技術 Tips のテーマ */
export type TipsTheme = 'skills' | 'claudecode' | 'mcp' | 'databricks';

export const TIPS_THEMES: { id: TipsTheme; name: string; note: string }[] = [
  { id: 'skills', name: 'Skill（Agent Skills）', note: 'どんな Skill を作るとよいか、どう使い分けるかの記事です。' },
  { id: 'claudecode', name: 'Claude Code', note: '設定・使い方・ワークフローの工夫の記事です。' },
  { id: 'mcp', name: 'MCP', note: 'MCP サーバーの作り方や、つなぎ方の記事です。' },
  { id: 'databricks', name: 'Databricks', note: '実務での使い方や、つまずきどころの記事です。' },
];

type Source = { name: string; track: TrackId; kind: TrendKind; home: string; theme?: TipsTheme };

const zenn = (topic: string, theme: TipsTheme, track: TrackId = 'claude'): Source => ({
  name: 'Zenn',
  track,
  kind: 'tips',
  theme,
  home: `https://zenn.dev/topics/${topic}`,
});
const qiita = (tag: string, theme: TipsTheme, track: TrackId = 'claude'): Source => ({
  name: 'Qiita',
  track,
  kind: 'tips',
  theme,
  home: `https://qiita.com/tags/${tag}`,
});
const classmethod = (tag: string, theme: TipsTheme, track: TrackId = 'claude'): Source => ({
  name: 'DevelopersIO',
  track,
  kind: 'tips',
  theme,
  home: `https://dev.classmethod.jp/tags/${tag}/`,
});

// 技術 Tips の情報源は scripts/trends/update.mjs の SOURCES と同じものを並べる
export const TREND_SOURCES: Record<TrendSourceId, Source> = {
  'anthropic-news': { name: 'Anthropic ニュース', track: 'claude', kind: 'official', home: 'https://www.anthropic.com/news' },
  'claude-blog': { name: 'Claude ブログ', track: 'claude', kind: 'official', home: 'https://claude.com/blog' },
  'databricks-blog': { name: 'Databricks ブログ', track: 'databricks', kind: 'official', home: 'https://www.databricks.com/blog' },
  'databricks-release-notes': { name: 'Databricks リリースノート', track: 'databricks', kind: 'official', home: 'https://docs.databricks.com/aws/en/release-notes/' },
  'zenn-agentskills': zenn('agentskills', 'skills'),
  'qiita-agentskills': qiita('agentskills', 'skills'),
  'qiita-claudeskills': qiita('claudeskills', 'skills'),
  'zenn-claudecode': zenn('claudecode', 'claudecode'),
  'qiita-claudecode': qiita('claudecode', 'claudecode'),
  'classmethod-claudecode': classmethod('claude-code', 'claudecode'),
  'zenn-mcp': zenn('mcp', 'mcp'),
  'qiita-mcp': qiita('mcp', 'mcp'),
  'zenn-databricks': zenn('databricks', 'databricks', 'databricks'),
  'qiita-databricks': qiita('databricks', 'databricks', 'databricks'),
  'classmethod-databricks': classmethod('databricks', 'databricks', 'databricks'),
};

export const TREND_SOURCE_ORDER = Object.keys(TREND_SOURCES) as TrendSourceId[];

const ALL: TrendEntry[] = (ITEMS as TrendEntry[]).slice().sort((a, b) => b.date.localeCompare(a.date));

/** 公式の発表（新しい順） */
export const TRENDS: TrendEntry[] = ALL.filter((it) => TREND_SOURCES[it.source]?.kind === 'official');

/** 技術 Tips（新しい順） */
export const TIPS: TrendEntry[] = ALL.filter((it) => TREND_SOURCES[it.source]?.kind === 'tips');

/** 日本時間の今日（YYYY-MM-DD） */
export function todayInTokyo(now = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** today から days 日前以降の件数 */
export function countSince(items: { date: string }[], today: string, days: number): number {
  const from = new Date(Date.parse(`${today}T00:00:00Z`) - days * 86_400_000).toISOString().slice(0, 10);
  return items.filter((it) => it.date >= from).length;
}
