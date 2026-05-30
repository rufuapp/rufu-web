import { gradientFor, GRADIENTS, formatRelativeDate, formatRelativeTime } from './format';

// ─── gradientFor ─────────────────────────────────────────────────────────────

describe('gradientFor', () => {
  it('GRADIENTS の範囲内のクラスを返す', () => {
    const result = gradientFor('test-id');
    expect(GRADIENTS).toContain(result);
  });

  it('同じ ID は常に同じグラデーションを返す（決定的）', () => {
    expect(gradientFor('abc')).toBe(gradientFor('abc'));
  });

  it('空文字列でもクラッシュしない', () => {
    expect(() => gradientFor('')).not.toThrow();
    expect(GRADIENTS).toContain(gradientFor(''));
  });

  it('異なる ID は分散する（全グラデーション使われること）', () => {
    const ids = Array.from({ length: 100 }, (_, i) => `post-${i}`);
    const used = new Set(ids.map(gradientFor));
    expect(used.size).toBeGreaterThan(1);
  });
});

// ─── formatRelativeDate ───────────────────────────────────────────────────────

describe('formatRelativeDate', () => {
  const now = new Date('2026-05-30T12:00:00Z').getTime();

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('同日は「今日」を返す', () => {
    const iso = new Date(now - 3600_000).toISOString(); // 1時間前
    expect(formatRelativeDate(iso)).toBe('今日');
  });

  it('昨日は「昨日」を返す', () => {
    const iso = new Date(now - 86400_000).toISOString();
    expect(formatRelativeDate(iso)).toBe('昨日');
  });

  it('2〜6日前は「N日前」を返す', () => {
    const iso = new Date(now - 3 * 86400_000).toISOString();
    expect(formatRelativeDate(iso)).toBe('3日前');
  });

  it('7日以上前は日付文字列を返す', () => {
    const iso = new Date(now - 8 * 86400_000).toISOString();
    const result = formatRelativeDate(iso);
    expect(result).not.toMatch(/日前/);
    expect(result).toBeTruthy();
  });
});

// ─── formatRelativeTime ───────────────────────────────────────────────────────

describe('formatRelativeTime', () => {
  const now = new Date('2026-05-30T12:00:00Z').getTime();

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('1分未満は「たった今」を返す', () => {
    const iso = new Date(now - 30_000).toISOString(); // 30秒前
    expect(formatRelativeTime(iso)).toBe('たった今');
  });

  it('1〜59分前は「N分前」を返す', () => {
    const iso = new Date(now - 15 * 60_000).toISOString();
    expect(formatRelativeTime(iso)).toBe('15分前');
  });

  it('1〜23時間前は「N時間前」を返す', () => {
    const iso = new Date(now - 3 * 3600_000).toISOString();
    expect(formatRelativeTime(iso)).toBe('3時間前');
  });

  it('1〜6日前は「N日前」を返す', () => {
    const iso = new Date(now - 2 * 86400_000).toISOString();
    expect(formatRelativeTime(iso)).toBe('2日前');
  });

  it('7日以上前は日付文字列を返す', () => {
    const iso = new Date(now - 10 * 86400_000).toISOString();
    const result = formatRelativeTime(iso);
    expect(result).not.toMatch(/日前|時間前|分前/);
    expect(result).toBeTruthy();
  });
});
