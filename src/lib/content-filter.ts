type FilterResult = { ok: true } | { ok: false; reason: string };

const NG_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  // Adult content (\b only for ASCII terms — Japanese has no word boundaries)
  {
    pattern: /(18禁|アダルト|エロ|ポルノ|\bnude\b|\bporn\b|\bxxx\b|\bhentai\b|\badult.?content\b)/i,
    reason: 'アダルトコンテンツは投稿できません',
  },
  // Phishing / credential harvesting
  {
    pattern: /(パスワード|password).{0,30}(入力|input|enter|submit)/i,
    reason: '認証情報の入力を求めるコンテンツは投稿できません',
  },
  {
    pattern: /(クレジットカード|カード番号|card.?number).{0,40}(入力|input)/i,
    reason: '金融情報の入力を求めるコンテンツは投稿できません',
  },
  // Spam / scam (no \b — Japanese word boundaries don't exist in JS regex)
  {
    pattern: /(出会い系|マルチ商法|ネズミ講|副業.*稼げる|1日.*万円|楽して.*稼)/i,
    reason: 'スパムまたは詐欺的なコンテンツは投稿できません',
  },
  // External media URLs (images / video / audio)
  {
    pattern: /<(?:img|video|audio|source|embed)[^>]+src\s*=\s*['"]?https?:\/\//i,
    reason: '外部URLの画像・動画は投稿できません（Base64埋め込みはOKです）',
  },
  {
    pattern: /srcset\s*=\s*['"]?https?:\/\//i,
    reason: '外部URLの画像・動画は投稿できません（Base64埋め込みはOKです）',
  },
  {
    pattern: /<object[^>]+data\s*=\s*['"]?https?:\/\//i,
    reason: '外部URLの埋め込みコンテンツは投稿できません',
  },
  {
    pattern: /background(?:-image)?\s*:\s*[^;{]*url\s*\(\s*['"]?https?:\/\//i,
    reason: '外部URLのCSS背景画像は投稿できません（Base64埋め込みはOKです）',
  },
  // Malicious script patterns (even inside sandbox, flag obvious cases)
  {
    pattern: /document\.(cookie|write\s*\(.*fetch|write\s*\(.*XMLHttp)/,
    reason: '不審なスクリプトが含まれています',
  },
  {
    pattern: /fetch\s*\(\s*['"]https?:\/\/(?!rufu\.dev)/,
    reason: '外部へのデータ送信スクリプトは投稿できません',
  },
  {
    pattern: /new\s+XMLHttpRequest/i,
    reason: '外部へのデータ送信スクリプトは投稿できません',
  },
];

function extractText(html: string): string {
  // Strip script/style blocks first, then HTML tags
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function checkContent(html: string): FilterResult {
  // Check raw HTML for script patterns
  for (const { pattern, reason } of NG_PATTERNS) {
    if (pattern.test(html)) {
      return { ok: false, reason };
    }
  }

  // Check visible text for content patterns
  const text = extractText(html);
  for (const { pattern, reason } of NG_PATTERNS) {
    if (pattern.test(text)) {
      return { ok: false, reason };
    }
  }

  return { ok: true };
}
