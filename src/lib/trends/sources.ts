import type { TrendEntry, TrendSourceId } from './parse';
import ITEMS from '@/content/trends/items.json';

// 記事は日次バッチ（scripts/trends/update.mjs）が集めて items.json に保存する。サイトはそれを表示するだけ。
// 主役は Claude と Databricks。ほかの会社は「主役と比べてどうか」を見るための比較対象として扱う。

export type VendorId = 'claude' | 'databricks' | 'openai' | 'aws' | 'gcp' | 'azure' | 'nvidia' | 'snowflake' | 'palantir';

/** core: 主役 ／ compare: 比較対象（compareTo の主役と比べる） */
export const VENDORS: Record<VendorId, { name: string; role: 'core' | 'compare'; compareTo?: 'claude' | 'databricks'; accent: string }> = {
  claude: { name: 'Claude', role: 'core', accent: 'var(--d-cld)' },
  databricks: { name: 'Databricks', role: 'core', accent: 'var(--d-dbx)' },
  openai: { name: 'OpenAI', role: 'compare', compareTo: 'claude', accent: 'var(--d-muted)' },
  aws: { name: 'AWS', role: 'compare', compareTo: 'claude', accent: 'var(--d-muted)' },
  gcp: { name: 'Google Cloud', role: 'compare', compareTo: 'claude', accent: 'var(--d-muted)' },
  azure: { name: 'Azure', role: 'compare', compareTo: 'claude', accent: 'var(--d-muted)' },
  nvidia: { name: 'NVIDIA', role: 'compare', compareTo: 'claude', accent: 'var(--d-muted)' },
  snowflake: { name: 'Snowflake', role: 'compare', compareTo: 'databricks', accent: 'var(--d-muted)' },
  palantir: { name: 'Palantir', role: 'compare', compareTo: 'databricks', accent: 'var(--d-muted)' },
};

export const CORE_VENDORS: VendorId[] = ['claude', 'databricks'];

/** 比較対象のまとまり（どの主役と比べるか） */
export const COMPARE_GROUPS: { core: 'claude' | 'databricks'; title: string; lead: string; vendors: VendorId[] }[] = [
  {
    core: 'claude',
    title: 'Claude の比較対象',
    lead: 'ほかの生成 AI と、Claude を提供しているクラウド・AI の土台の動きです。Claude と比べてどうかを見るために載せています。',
    vendors: ['openai', 'aws', 'gcp', 'azure', 'nvidia'],
  },
  {
    core: 'databricks',
    title: 'Databricks の比較対象',
    lead: 'ほかのデータ基盤の動きです。Databricks と比べてどうかを見るために載せています。',
    vendors: ['snowflake', 'palantir'],
  },
];

/** official: 主役の公式発表 ／ compare: 比較対象の公式発表 ／ tips: 技術記事 */
export type TrendKind = 'official' | 'compare' | 'tips';

/** 技術 Tips のテーマ */
export type TipsTheme = 'skills' | 'claudecode' | 'mcp' | 'databricks' | 'compare';

export const TIPS_THEMES: { id: TipsTheme; name: string; note: string }[] = [
  { id: 'skills', name: 'Skill（Agent Skills）', note: 'どんな Skill を作るとよいか、どう使い分けるかの記事です。' },
  { id: 'claudecode', name: 'Claude Code', note: '設定・使い方・ワークフローの工夫の記事です。' },
  { id: 'mcp', name: 'MCP', note: 'MCP サーバーの作り方や、つなぎ方の記事です。' },
  { id: 'databricks', name: 'Databricks', note: '実務での使い方や、つまずきどころの記事です。' },
  { id: 'compare', name: '比較対象（OpenAI・Snowflake）', note: 'Claude・Databricks と直接競合する、OpenAI と Snowflake の記事です。' },
];

type Source = { name: string; vendor: VendorId; kind: TrendKind; home: string; theme?: TipsTheme };

const zenn = (topic: string, theme: TipsTheme, vendor: VendorId = 'claude'): Source => ({
  name: 'Zenn',
  vendor,
  kind: 'tips',
  theme,
  home: `https://zenn.dev/topics/${topic}`,
});
const qiita = (tag: string, theme: TipsTheme, vendor: VendorId = 'claude'): Source => ({
  name: 'Qiita',
  vendor,
  kind: 'tips',
  theme,
  home: `https://qiita.com/tags/${tag}`,
});
const classmethod = (tag: string, theme: TipsTheme, vendor: VendorId = 'claude'): Source => ({
  name: 'DevelopersIO',
  vendor,
  kind: 'tips',
  theme,
  home: `https://dev.classmethod.jp/tags/${tag}/`,
});
const compare = (name: string, vendor: VendorId, home: string): Source => ({ name, vendor, kind: 'compare', home });

// 情報源は scripts/trends/update.mjs の SOURCES と同じものを並べる
export const TREND_SOURCES: Record<TrendSourceId, Source> = {
  'anthropic-news': { name: 'Anthropic ニュース', vendor: 'claude', kind: 'official', home: 'https://www.anthropic.com/news' },
  'claude-blog': { name: 'Claude ブログ', vendor: 'claude', kind: 'official', home: 'https://claude.com/blog' },
  'databricks-blog': { name: 'Databricks ブログ', vendor: 'databricks', kind: 'official', home: 'https://www.databricks.com/blog' },
  'databricks-release-notes': { name: 'Databricks リリースノート', vendor: 'databricks', kind: 'official', home: 'https://docs.databricks.com/aws/en/release-notes/' },
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
  'zenn-openai': zenn('openai', 'compare', 'openai'),
  'qiita-openai': qiita('openai', 'compare', 'openai'),
  'zenn-snowflake': zenn('snowflake', 'compare', 'snowflake'),
  'qiita-snowflake': qiita('snowflake', 'compare', 'snowflake'),
  'openai-news': compare('OpenAI ニュース', 'openai', 'https://openai.com/news/'),
  'aws-ml-blog': compare('AWS Machine Learning ブログ', 'aws', 'https://aws.amazon.com/blogs/machine-learning/'),
  'gcp-ai-blog': compare('Google Cloud AI ブログ', 'gcp', 'https://cloud.google.com/blog/products/ai-machine-learning'),
  'azure-blog': compare('Azure ブログ', 'azure', 'https://azure.microsoft.com/en-us/blog/'),
  'azure-foundry-blog': compare('Microsoft Foundry ブログ', 'azure', 'https://devblogs.microsoft.com/foundry/'),
  'nvidia-blog': compare('NVIDIA ブログ', 'nvidia', 'https://blogs.nvidia.com/'),
  'nvidia-developer-blog': compare('NVIDIA 技術ブログ', 'nvidia', 'https://developer.nvidia.com/blog'),
  'snowflake-blog': compare('Snowflake ブログ', 'snowflake', 'https://www.snowflake.com/en/blog/'),
  'snowflake-builders-blog': compare('Snowflake Builders ブログ', 'snowflake', 'https://medium.com/snowflake'),
  'palantir-blog': compare('Palantir ブログ', 'palantir', 'https://blog.palantir.com/'),
};

export const TREND_SOURCE_ORDER = Object.keys(TREND_SOURCES) as TrendSourceId[];

const ALL: TrendEntry[] = (ITEMS as TrendEntry[])
  .filter((it) => TREND_SOURCES[it.source])
  .sort((a, b) => b.date.localeCompare(a.date));

/** 主役（Claude・Databricks）の公式発表（新しい順） */
export const TRENDS: TrendEntry[] = ALL.filter((it) => TREND_SOURCES[it.source].kind === 'official');

/** 比較対象の公式発表（新しい順） */
export const COMPARE_TRENDS: TrendEntry[] = ALL.filter((it) => TREND_SOURCES[it.source].kind === 'compare');

/** 技術 Tips（新しい順） */
export const TIPS: TrendEntry[] = ALL.filter((it) => TREND_SOURCES[it.source].kind === 'tips');

/** その会社の記事か */
export function isFromVendor(it: TrendEntry, vendor: VendorId): boolean {
  return TREND_SOURCES[it.source].vendor === vendor;
}

/** 日本時間の今日（YYYY-MM-DD） */
export function todayInTokyo(now = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** today から days 日前以降の件数 */
export function countSince(items: { date: string }[], today: string, days: number): number {
  const from = new Date(Date.parse(`${today}T00:00:00Z`) - days * 86_400_000).toISOString().slice(0, 10);
  return items.filter((it) => it.date >= from).length;
}
