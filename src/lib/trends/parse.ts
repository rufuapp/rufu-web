// 公式の発表を一覧にするための読み取り処理（RSS と、フィードのない公式サイトの一覧ページ）

export type TrendSourceId =
  | 'anthropic-news'
  | 'claude-blog'
  | 'databricks-blog'
  | 'databricks-release-notes'
  // 技術 Tips（技術記事サイトのタグ・トピック）
  | 'zenn-agentskills'
  | 'qiita-agentskills'
  | 'qiita-claudeskills'
  | 'zenn-claudecode'
  | 'qiita-claudecode'
  | 'classmethod-claudecode'
  | 'zenn-mcp'
  | 'qiita-mcp'
  | 'zenn-databricks'
  | 'qiita-databricks'
  | 'classmethod-databricks';

export type TrendItem = {
  source: TrendSourceId;
  title: string;
  url: string;
  /** YYYY-MM-DD（日本時間） */
  date: string;
};

/** サイトに載せる記事（日次バッチで日本語の見出しとまとめを付けたもの） */
export type TrendEntry = TrendItem & {
  titleJa: string;
  summaryJa: string;
};

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

function clean(s: string): string {
  const text = s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, c: string) => c.replace(/</g, '&lt;'));
  return decodeEntities(text.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** 日付の文字列を日本時間の YYYY-MM-DD にする。時刻のない「Oct 6, 2026」は、その日付のまま扱う。読めなければ undefined */
export function toIsoDate(s: string): string | undefined {
  const plain = s.trim().match(/^([A-Za-z]{3})[a-z]* (\d{1,2}), (\d{4})$/);
  if (plain) {
    const month = MONTHS.indexOf(plain[1].toLowerCase());
    if (month < 0) return undefined;
    return new Date(Date.UTC(Number(plain[3]), month, Number(plain[2]))).toISOString().slice(0, 10);
  }
  const d = new Date(s.trim());
  return Number.isNaN(d.getTime()) ? undefined : new Date(d.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}

function tag(block: string, name: string): string | undefined {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? clean(m[1]) : undefined;
}

/** RSS 2.0 の item を読む */
export function parseRss(xml: string, source: TrendSourceId): TrendItem[] {
  const items: TrendItem[] = [];
  for (const m of xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)) {
    const title = tag(m[1], 'title');
    const url = tag(m[1], 'link');
    const date = toIsoDate(tag(m[1], 'pubDate') ?? tag(m[1], 'dc:date') ?? '');
    if (title && url && date) items.push({ source, title, url, date });
  }
  return items;
}

/** Atom の entry を読む（Qiita など） */
export function parseAtom(xml: string, source: TrendSourceId): TrendItem[] {
  const items: TrendItem[] = [];
  for (const m of xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)) {
    const title = tag(m[1], 'title');
    const link = m[1].match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/i)?.[1] ?? m[1].match(/<link[^>]*href="([^"]+)"/i)?.[1];
    const date = toIsoDate(tag(m[1], 'published') ?? tag(m[1], 'updated') ?? '');
    if (title && link && date) items.push({ source, title, url: decodeEntities(link), date });
  }
  return items;
}

const SHORT_DATE = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}, \d{4}$/;

/** anthropic.com/news の一覧ページ。各リンクの中に「日付・分類・見出し」が並んでいる */
export function parseAnthropicNews(html: string): TrendItem[] {
  const items: TrendItem[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(/<a[^>]+href="(\/news\/[a-z0-9-]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = `https://www.anthropic.com${m[1]}`;
    if (seen.has(url)) continue;
    const parts = m[2]
      .split(/<[^>]+>/)
      .map(clean)
      .filter(Boolean);
    const dateText = parts.find((p) => SHORT_DATE.test(p));
    // 大きなカードは見出しタグに、小さなカードは分類と並んだいちばん長い文字列に見出しがある
    const heading = m[2].match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
    const rest = parts.filter((p) => !SHORT_DATE.test(p));
    const title = heading ? clean(heading[1]) : rest.reduce((a, b) => (b.length > a.length ? b : a), '');
    const date = dateText && toIsoDate(dateText);
    if (title.length < 12 || !date) continue;
    seen.add(url);
    items.push({ source: 'anthropic-news', title, url, date });
  }
  return items;
}

/** claude.com/blog の一覧ページ。カードごとに日付と見出しがあり、その前にリンクがある */
export function parseClaudeBlog(html: string): TrendItem[] {
  const items: TrendItem[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(/__meta">([A-Z][a-z]{2,8} \d{1,2}, \d{4})<\/span>[\s\S]*?__title[^>]*>([\s\S]*?)<\/h3>/g)) {
    const before = html.slice(Math.max(0, (m.index ?? 0) - 6000), m.index);
    const hrefs = [...before.matchAll(/href="([^"]+)"/g)].map((h) => h[1]);
    const href = hrefs[hrefs.length - 1];
    const date = toIsoDate(m[1]);
    const title = clean(m[2]);
    if (!href || !date || !title) continue;
    const url = href.startsWith('http') ? href : `https://claude.com${href}`;
    if (seen.has(url)) continue;
    seen.add(url);
    items.push({ source: 'claude-blog', title, url, date });
  }
  return items;
}

/** 新しい順に並べ、同じ URL を1つにまとめる */
export function mergeTrends(lists: TrendItem[][]): TrendItem[] {
  const seen = new Set<string>();
  return lists
    .flat()
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((it) => (seen.has(it.url) ? false : (seen.add(it.url), true)));
}
