import { getArticles, parseFrontmatter, renderArticle } from './articles';

describe('著者記事', () => {
  it('先頭のメタ情報と本文を分ける', () => {
    const { data, body } = parseFrontmatter('---\ntitle: A: B\ndate: 2026-10-08\n---\n本文');
    expect(data).toEqual({ title: 'A: B', date: '2026-10-08' });
    expect(body).toBe('本文');
  });

  it('## の見出しに目次用の id を付け、外部リンクは新しいタブで開く', () => {
    const { html, headings } = renderArticle('## 結論\n\n[仕様](https://example.com/spec)\n\n## 次に');
    expect(headings).toEqual([
      { id: 'sec-1', text: '結論' },
      { id: 'sec-2', text: '次に' },
    ]);
    expect(html).toContain('<h2 id="sec-1">結論</h2>');
    expect(html).toContain('<a href="https://example.com/spec" target="_blank" rel="noopener noreferrer"');
  });

  it('どの記事にもタイトル・日付・概要があり、新しい順に並ぶ', () => {
    const articles = getArticles();
    expect(articles.length).toBeGreaterThan(0);
    for (const a of articles) {
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(a.summary.length).toBeGreaterThan(0);
    }
    const dates = articles.map((a) => a.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });
});
