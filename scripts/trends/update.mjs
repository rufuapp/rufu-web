#!/usr/bin/env node
// 最新の動向を更新する日次バッチ（手元の Mac で動かす）。
//
// 1. 4 つの公式の情報源から記事を集め、まだ載せていない記事だけを選ぶ
// 2. 記事の本文を読み、手元の Claude Code（claude -p、いまのログインを使う。API キーは使わない）で
//    日本語の見出しと、2〜3 文のまとめを作る
// 3. src/content/trends/items.json に保存し、main にコミットして push し、本番にデプロイする
//
// 使い方:
//   pnpm trends:update               # 集める → 訳す → コミット → push → 本番デプロイ
//   pnpm trends:update -- --no-deploy  # コミットまで（push とデプロイはしない）
//   pnpm trends:update -- --dry-run    # 集めるだけで、訳さず、ファイルも変えない
//   pnpm trends:update -- --no-git     # 訳して items.json を書くだけ（ブランチの確認・コミット・デプロイをしない）
//
// Claude Code のコマンドは、CLAUDE_BIN → PATH の claude → VS Code 拡張に同梱のもの、の順に探す。

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseAnthropicNews, parseClaudeBlog, parseRss } from '../../src/lib/trends/parse.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ITEMS_FILE = join(ROOT, 'src/content/trends/items.json');
const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const NO_DEPLOY = args.has('--no-deploy');
const NO_GIT = args.has('--no-git');

/** 初回や久しぶりの実行で古い記事を大量に訳さないよう、この日数より前の記事は対象にしない */
const LOOKBACK_DAYS = 14;
/** 1 回の実行で訳す上限（多すぎる日は翌日に回す） */
const MAX_NEW_PER_RUN = 40;
/** Claude Code 1 回の呼び出しで訳す記事の数 */
const BATCH_SIZE = 8;
/** 保存しておく件数の上限 */
const KEEP = 600;
const ARTICLE_CHARS = 6000;
/** 最後に本番へ出したコミット（デプロイに失敗した日の分を、次の実行で出し直すため。.vercel は git 管理外） */
const DEPLOYED_FILE = join(ROOT, '.vercel/trends-last-deployed');

const SOURCES = [
  { id: 'anthropic-news', url: 'https://www.anthropic.com/news', parse: parseAnthropicNews },
  { id: 'claude-blog', url: 'https://claude.com/blog', parse: parseClaudeBlog },
  { id: 'databricks-blog', url: 'https://www.databricks.com/feed', parse: (xml) => parseRss(xml, 'databricks-blog') },
  { id: 'databricks-release-notes', url: 'https://docs.databricks.com/aws/en/feed.xml', parse: (xml) => parseRss(xml, 'databricks-release-notes') },
];

const log = (...m) => console.log('[trends]', ...m);

function todayInTokyo() {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
}

function daysBefore(day, n) {
  return new Date(Date.parse(`${day}T00:00:00Z`) - n * 86_400_000).toISOString().slice(0, 10);
}

async function get(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20_000),
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; FDE-Kiso-Tokuhon/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

/** 記事のページから本文らしい部分を取り出す */
function articleText(html) {
  const body = html.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
  return body
    .replace(/<(script|style|noscript|svg|nav|footer)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, ARTICLE_CHARS);
}

function findClaude() {
  if (process.env.CLAUDE_BIN && existsSync(process.env.CLAUDE_BIN)) return process.env.CLAUDE_BIN;
  const onPath = spawnSync('sh', ['-c', 'command -v claude'], { encoding: 'utf8' }).stdout.trim();
  if (onPath) return onPath;
  const extDir = join(homedir(), '.vscode/extensions');
  if (existsSync(extDir)) {
    const found = readdirSync(extDir)
      .filter((d) => d.startsWith('anthropic.claude-code-'))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
      .map((d) => join(extDir, d, 'resources/native-binary/claude'))
      .find(existsSync);
    if (found) return found;
  }
  throw new Error('Claude Code（claude コマンド）が見つかりません。CLAUDE_BIN にパスを指定してください。');
}

const SCHEMA = JSON.stringify({
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: { url: { type: 'string' }, titleJa: { type: 'string' }, summaryJa: { type: 'string' } },
        required: ['url', 'titleJa', 'summaryJa'],
      },
    },
  },
  required: ['items'],
});

function prompt(batch) {
  const articles = batch
    .map((it, i) => `### 記事 ${i + 1}\nURL: ${it.url}\n見出し: ${it.title}\n本文（抜粋）:\n${it.text || '（本文を取得できませんでした。見出しだけから訳してください）'}`)
    .join('\n\n');
  return `あなたは、Claude と Databricks の公式発表を日本語で紹介する技術サイトの編集者です。
次の各記事について、日本語の見出し（titleJa）と、まとめ（summaryJa）を作ってください。

決まり:
- titleJa: 原文の見出しの自然な日本語訳。製品名・機能名（Claude Code、Unity Catalog など）は英語のまま残す。
- summaryJa: 本文に書かれている事実だけを、2〜3 文、です・ます調で書く。何が発表され、誰にどう役立つかを中心にする。本文にない推測や評価は書かない。
- 本文を取得できなかった記事は、見出しから分かることだけを 1 文で書く。
- url は、与えられた URL をそのまま返す。すべての記事について 1 件ずつ返す。

${articles}`;
}

function summarize(claude, batch) {
  const cwd = mkdtempSync(join(tmpdir(), 'fde-trends-'));
  const res = spawnSync(
    claude,
    ['-p', '--output-format', 'json', '--model', 'haiku', '--tools', '', '--no-session-persistence', '--json-schema', SCHEMA],
    { input: prompt(batch), encoding: 'utf8', cwd, timeout: 300_000, maxBuffer: 20 * 1024 * 1024 },
  );
  if (res.status !== 0) throw new Error(`claude -p が失敗しました: ${res.stderr || res.stdout}`.slice(0, 2000));
  const out = JSON.parse(res.stdout);
  const data = out.structured_output ?? (typeof out.result === 'string' ? JSON.parse(out.result) : out.result);
  if (!data || !Array.isArray(data.items)) throw new Error(`想定外の出力です: ${res.stdout.slice(0, 500)}`);
  return new Map(data.items.map((x) => [x.url, x]));
}

function git(...a) {
  return execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function run(cmd, a) {
  log('$', cmd, a.join(' '));
  execFileSync(cmd, a, { cwd: ROOT, stdio: 'inherit' });
}

/** まだ本番に出していないコミットがあれば、push してデプロイする */
function deployIfNeeded() {
  if (NO_DEPLOY || NO_GIT) return log('--no-deploy または --no-git のため、push とデプロイはしません。');
  const head = git('rev-parse', 'HEAD');
  const deployed = existsSync(DEPLOYED_FILE) ? readFileSync(DEPLOYED_FILE, 'utf8').trim() : '';
  if (head === deployed) return log('本番は最新です。');
  run('git', ['push']);
  run('vercel', ['pull', '--yes', '--environment=production']);
  run('vercel', ['build', '--prod']);
  run('vercel', ['deploy', '--prebuilt', '--prod']);
  writeFileSync(DEPLOYED_FILE, `${head}\n`);
  log('本番に反映しました。');
}

async function main() {
  if (!DRY_RUN && !NO_GIT) {
    if (git('rev-parse', '--abbrev-ref', 'HEAD') !== 'main') throw new Error('main ブランチで実行してください。');
    if (git('status', '--porcelain')) throw new Error('コミットしていない変更があります。片付けてから実行してください。');
    run('git', ['pull', '--ff-only']);
  }

  const today = todayInTokyo();
  const since = daysBefore(today, LOOKBACK_DAYS);
  const existing = existsSync(ITEMS_FILE) ? JSON.parse(readFileSync(ITEMS_FILE, 'utf8')) : [];
  const known = new Set(existing.map((it) => it.url));

  const found = [];
  for (const src of SOURCES) {
    try {
      const items = src.parse(await get(src.url)).filter((it) => it.date <= today && it.date >= since && !known.has(it.url));
      log(`${src.id}: 新しい記事 ${items.length} 件`);
      found.push(...items);
    } catch (e) {
      log(`${src.id}: 取得できませんでした（${e.message}）`);
    }
  }
  const unique = [...new Map(found.map((it) => [it.url, it])).values()].sort((a, b) => b.date.localeCompare(a.date));
  const targets = unique.slice(0, MAX_NEW_PER_RUN);
  if (unique.length > targets.length) log(`多いため ${targets.length} 件だけ訳し、残り ${unique.length - targets.length} 件は次回に回します。`);
  if (targets.length === 0) {
    log('新しい記事はありません。');
    if (!DRY_RUN) deployIfNeeded();
    return;
  }
  if (DRY_RUN) {
    for (const it of targets) log(`  ${it.date} ${it.source} ${it.title}`);
    return log('--dry-run のため、ここで終わります。');
  }

  for (const it of targets) {
    try {
      it.text = articleText(await get(it.url));
    } catch {
      it.text = '';
    }
  }

  const claude = findClaude();
  log(`Claude Code: ${claude}`);
  const added = [];
  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    log(`訳しています（${i + 1}〜${i + batch.length} 件目）`);
    const result = summarize(claude, batch);
    for (const it of batch) {
      const r = result.get(it.url);
      // 訳が返らなかった記事は保存せず、次回もう一度訳す
      if (!r?.titleJa || !r?.summaryJa) {
        log(`  訳が返らなかったため次回に回します: ${it.url}`);
        continue;
      }
      added.push({ source: it.source, title: it.title, url: it.url, date: it.date, titleJa: r.titleJa.trim(), summaryJa: r.summaryJa.trim() });
    }
  }
  if (added.length === 0) {
    log('保存できた記事はありません。');
    deployIfNeeded();
    return;
  }

  const merged = [...added, ...existing].sort((a, b) => b.date.localeCompare(a.date)).slice(0, KEEP);
  writeFileSync(ITEMS_FILE, `${JSON.stringify(merged, null, 2)}\n`);
  log(`${added.length} 件を追加しました（合計 ${merged.length} 件）。`);

  if (NO_GIT) return log('--no-git のため、コミットとデプロイはしません。');
  run('git', ['add', 'src/content/trends/items.json']);
  run('git', ['commit', '-m', `chore: 最新の動向を更新（${today}・${added.length} 件）`]);
  deployIfNeeded();
}

main().catch((e) => {
  console.error('[trends] 失敗しました:', e.message);
  process.exit(1);
});
