import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

// 著者記事は src/content/articles/<スラッグ>.md に、先頭のメタ情報（--- で囲む）付きの Markdown で書く

export type Article = {
  slug: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  summary: string;
  tags: string[];
  /** 調べものや下書きに AI の手を借りたか */
  aiAssisted: boolean;
  html: string;
  /** 目次用の見出し（## の見出し） */
  headings: { id: string; text: string }[];
};

const DIR = path.join(process.cwd(), 'src/content/articles');

/** 先頭の --- で囲んだ「キー: 値」を読む */
export function parseFrontmatter(source: string): { data: Record<string, string>; body: string } {
  const m = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: source };
  const data: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { data, body: m[2] };
}

/** Markdown を HTML にし、## の見出しに目次用の id を付け、外部リンクは新しいタブで開く */
export function renderArticle(body: string): { html: string; headings: Article['headings'] } {
  const headings: Article['headings'] = [];
  let html = marked.parse(body, { async: false });
  html = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner: string) => {
    const id = `sec-${headings.length + 1}`;
    headings.push({ id, text: inner.replace(/<[^>]+>/g, '') });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  html = html.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
  return { html, headings };
}

function load(file: string): Article {
  const { data, body } = parseFrontmatter(fs.readFileSync(path.join(DIR, file), 'utf8'));
  const { html, headings } = renderArticle(body);
  return {
    slug: file.replace(/\.md$/, ''),
    title: data.title ?? '',
    date: data.date ?? '',
    summary: data.summary ?? '',
    tags: (data.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean),
    aiAssisted: data.aiAssisted === 'true',
    html,
    headings,
  };
}

/** 新しい順の記事 */
export function getArticles(): Article[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('.md'))
    .map(load)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticle(slug: string): Article | undefined {
  return getArticles().find((a) => a.slug === slug);
}
