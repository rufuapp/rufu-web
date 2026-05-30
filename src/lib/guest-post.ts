/** ゲスト投稿に関するバリデーション・ユーティリティ */

export const GUEST_DAILY_LIMIT = 3;

export function validateNickname(nickname: string): { ok: true } | { ok: false; reason: string } {
  const trimmed = nickname.trim();
  if (trimmed.length === 0) return { ok: false, reason: 'ニックネームを入力してください' };
  if (trimmed.length > 30) return { ok: false, reason: 'ニックネームは30文字以内にしてください' };
  return { ok: true };
}

/**
 * 表示する著者名を解決する。
 * ゲスト投稿の author_name が最優先、なければプロフィール名にフォールバック。
 */
export function resolveAuthorName(
  authorName: string | null | undefined,
  profileDisplayName: string | null | undefined,
  profileName: string | null | undefined
): string {
  return authorName ?? profileDisplayName ?? profileName ?? '不明';
}

/** DB のレート制限エラー (P0001) かどうかを判定する */
export function isRateLimitError(error: { code?: string; message?: string } | null): boolean {
  return error?.code === 'P0001' && (error?.message?.includes('rate_limit_exceeded') ?? false);
}
