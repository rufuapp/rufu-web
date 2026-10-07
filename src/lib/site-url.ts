const DEFAULT_SITE_URL = 'https://rufu.app';

/** 未設定・空文字（Vercel の Sensitive 変数を pull した場合など）ならデフォルトを使い、末尾の / は除く */
export function resolveSiteUrl(raw: string | undefined): string {
  const url = raw?.trim().replace(/\/+$/, '');
  return url || DEFAULT_SITE_URL;
}

export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
