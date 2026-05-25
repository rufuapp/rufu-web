import { POSTS, getPostById } from './posts';

describe('POSTS', () => {
  it('9件のモック投稿が存在する', () => {
    expect(POSTS).toHaveLength(9);
  });

  it('各投稿は必須フィールドを持つ', () => {
    POSTS.forEach((post) => {
      expect(post.id).toBeTruthy();
      expect(post.title).toBeTruthy();
      expect(post.author.name).toBeTruthy();
      expect(post.author.initial).toHaveLength(1);
      expect(post.tags.length).toBeGreaterThanOrEqual(1);
      expect(post.htmlContent).toContain('<!DOCTYPE html>');
    });
  });

  it('IDはすべてユニーク', () => {
    const ids = POSTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('いいね・閲覧数はすべて正の数', () => {
    POSTS.forEach((post) => {
      expect(post.likes).toBeGreaterThan(0);
      expect(post.views).toBeGreaterThan(0);
      expect(post.bookmarks).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('getPostById', () => {
  it('存在するIDで投稿を返す', () => {
    const post = getPostById('1');
    expect(post).toBeDefined();
    expect(post?.id).toBe('1');
    expect(post?.title).toBe('Q4 2025 売上ダッシュボード');
  });

  it('存在しないIDでundefinedを返す', () => {
    expect(getPostById('999')).toBeUndefined();
    expect(getPostById('')).toBeUndefined();
  });

  it('全IDで投稿を取得できる', () => {
    POSTS.forEach((post) => {
      expect(getPostById(post.id)).toEqual(post);
    });
  });
});
