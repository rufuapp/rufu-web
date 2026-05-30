import { validateNickname, resolveAuthorName, isRateLimitError, GUEST_DAILY_LIMIT } from './guest-post';

// ─── validateNickname ─────────────────────────────────────────────────────

describe('validateNickname', () => {
  it('空文字はエラー', () => {
    expect(validateNickname('')).toEqual({ ok: false, reason: 'ニックネームを入力してください' });
  });

  it('空白のみはエラー', () => {
    expect(validateNickname('   ')).toEqual({ ok: false, reason: 'ニックネームを入力してください' });
  });

  it('31文字以上はエラー', () => {
    const result = validateNickname('a'.repeat(31));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('30文字以内');
  });

  it('1文字は有効', () => {
    expect(validateNickname('A')).toEqual({ ok: true });
  });

  it('30文字ちょうどは有効', () => {
    expect(validateNickname('a'.repeat(30))).toEqual({ ok: true });
  });

  it('前後の空白はトリムして評価する', () => {
    expect(validateNickname('  hello  ')).toEqual({ ok: true });
  });

  it('日本語ニックネームは有効', () => {
    expect(validateNickname('ゲストユーザー')).toEqual({ ok: true });
  });

  it('英数字・記号混在も有効', () => {
    expect(validateNickname('anon_creator42')).toEqual({ ok: true });
  });
});

// ─── resolveAuthorName ────────────────────────────────────────────────────

describe('resolveAuthorName', () => {
  it('author_name が最優先で使われる', () => {
    expect(resolveAuthorName('ゲスト名', 'display_name', 'name')).toBe('ゲスト名');
  });

  it('author_name が null のときは profileDisplayName にフォールバック', () => {
    expect(resolveAuthorName(null, 'display_name', 'name')).toBe('display_name');
  });

  it('author_name・displayName ともに null のときは profileName にフォールバック', () => {
    expect(resolveAuthorName(null, null, 'name')).toBe('name');
  });

  it('すべて null・undefined のときは "不明"', () => {
    expect(resolveAuthorName(null, null, null)).toBe('不明');
    expect(resolveAuthorName(undefined, undefined, undefined)).toBe('不明');
  });

  it('空文字の author_name は undefined 扱いせずそのまま返す', () => {
    // '' は falsy だが ?? 演算子は null/undefined のみフォールバックする
    expect(resolveAuthorName('', 'display_name', 'name')).toBe('');
  });
});

// ─── isRateLimitError ────────────────────────────────────────────────────

describe('isRateLimitError', () => {
  it('P0001 + rate_limit_exceeded はレート制限エラー', () => {
    expect(isRateLimitError({ code: 'P0001', message: 'rate_limit_exceeded' })).toBe(true);
  });

  it('コードが異なればレート制限エラーではない', () => {
    expect(isRateLimitError({ code: '23505', message: 'rate_limit_exceeded' })).toBe(false);
  });

  it('メッセージが異なればレート制限エラーではない', () => {
    expect(isRateLimitError({ code: 'P0001', message: 'some other error' })).toBe(false);
  });

  it('null はレート制限エラーではない', () => {
    expect(isRateLimitError(null)).toBe(false);
  });
});

// ─── GUEST_DAILY_LIMIT ────────────────────────────────────────────────────

describe('GUEST_DAILY_LIMIT', () => {
  it('ゲストの1日の上限は3件', () => {
    expect(GUEST_DAILY_LIMIT).toBe(3);
  });
});
