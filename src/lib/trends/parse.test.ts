import { decodeEntities, mergeTrends, parseAnthropicNews, parseClaudeBlog, parseRss, toIsoDate } from './parse';

describe('公式発表の読み取り', () => {
  it('文字参照と CDATA を戻す', () => {
    expect(decodeEntities('A &amp; B &#x27;x&#39; <![CDATA[C]]>')).toBe("A & B 'x' C");
  });

  it('日付を YYYY-MM-DD にし、読めなければ undefined', () => {
    expect(toIsoDate('Tue, 06 Oct 2026 16:35:12 GMT')).toBe('2026-10-06');
    expect(toIsoDate('nope')).toBeUndefined();
  });

  it('RSS の item から見出し・リンク・日付を読む（欠けた item は捨てる）', () => {
    const xml = `<rss><channel><title>Databricks</title>
      <item><title><![CDATA[ Lakehouse &amp; more ]]></title><link>https://www.databricks.com/blog/a</link><pubDate>Tue, 06 Oct 2026 16:35:12 GMT</pubDate></item>
      <item><title>no date</title><link>https://x</link></item>
    </channel></rss>`;
    expect(parseRss(xml, 'databricks-blog')).toEqual([
      { source: 'databricks-blog', title: 'Lakehouse & more', url: 'https://www.databricks.com/blog/a', date: '2026-10-06' },
    ]);
  });

  it('Anthropic のニュース一覧から、日付と見出しを読み、同じ記事は1つにする', () => {
    const html = `
      <a href="/news/cvp" class="c"><span>Announcements</span><time>Oct 6, 2026</time><h3>Expanding the Cyber Verification Program</h3><p>We are launching a new version.</p></a>
      <a href="/news/cvp"><span>Oct 6, 2026</span><h4>Expanding the Cyber Verification Program</h4></a>
      <a href="/news/short"><span>Oct 2, 2026</span><span>Policy</span></a>`;
    expect(parseAnthropicNews(html)).toEqual([
      { source: 'anthropic-news', title: 'Expanding the Cyber Verification Program', url: 'https://www.anthropic.com/news/cvp', date: '2026-10-06' },
    ]);
  });

  it('Claude ブログのカードから、直前のリンクと日付・見出しを読む', () => {
    const html = `<a href="/resources/articles/docs"><span class="x__meta">Oct 6, 2026</span><h3 class="x__title y">Claude now works with Google Docs</h3></a>
      <a href="https://claude.com/resources/articles/mods"><span class="x__meta">Oct 1, 2026</span><h3 class="x__title">Customize Claude Code with mods</h3></a>`;
    expect(parseClaudeBlog(html)).toEqual([
      { source: 'claude-blog', title: 'Claude now works with Google Docs', url: 'https://claude.com/resources/articles/docs', date: '2026-10-06' },
      { source: 'claude-blog', title: 'Customize Claude Code with mods', url: 'https://claude.com/resources/articles/mods', date: '2026-10-01' },
    ]);
  });

  it('新しい順に並べ、同じ URL を1つにまとめる', () => {
    const a = { source: 'claude-blog' as const, title: 'A', url: 'u1', date: '2026-10-01' };
    const b = { source: 'anthropic-news' as const, title: 'B', url: 'u2', date: '2026-10-05' };
    expect(mergeTrends([[a, b], [a]])).toEqual([b, a]);
  });
});

describe('日付の扱い', () => {
  // fetch.ts は next の fetch を使うので、日付の関数だけを読む
  const { todayInTokyo, countSince } = jest.requireActual('./fetch') as typeof import('./fetch');

  it('日本時間の今日を返す（UTC では前日の夜でも、日本では翌日）', () => {
    expect(todayInTokyo(new Date('2026-10-06T16:00:00Z'))).toBe('2026-10-07');
  });

  it('直近 N 日の件数を数える', () => {
    const it = (date: string) => ({ source: 'claude-blog' as const, title: 't', url: date, date });
    expect(countSince([it('2026-10-07'), it('2026-09-07'), it('2026-09-06')], '2026-10-07', 30)).toBe(2);
  });
});
