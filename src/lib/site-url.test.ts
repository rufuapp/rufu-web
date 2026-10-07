import { resolveSiteUrl } from './site-url';

describe('resolveSiteUrl', () => {
  it('未設定ならデフォルトの URL', () => {
    expect(resolveSiteUrl(undefined)).toBe('https://rufu.app');
  });

  it('空文字や空白だけでもデフォルトの URL', () => {
    expect(resolveSiteUrl('')).toBe('https://rufu.app');
    expect(resolveSiteUrl('  ')).toBe('https://rufu.app');
  });

  it('設定値をそのまま使い、末尾の / は除く', () => {
    expect(resolveSiteUrl('https://www.rufu.dev')).toBe('https://www.rufu.dev');
    expect(resolveSiteUrl('https://www.rufu.dev//')).toBe('https://www.rufu.dev');
  });

  it('結果は常に new URL() に渡せる', () => {
    for (const raw of [undefined, '', 'https://rufu.app/']) {
      expect(() => new URL(resolveSiteUrl(raw))).not.toThrow();
    }
  });
});
