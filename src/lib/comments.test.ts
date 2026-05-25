import { COMMENTS, getCommentsByPostId } from './comments';

describe('COMMENTS', () => {
  it('モックコメントが存在する', () => {
    expect(COMMENTS.length).toBeGreaterThan(0);
  });

  it('各コメントは必須フィールドを持つ', () => {
    COMMENTS.forEach((comment) => {
      expect(comment.id).toBeTruthy();
      expect(comment.postId).toBeTruthy();
      expect(comment.author.name).toBeTruthy();
      expect(comment.body).toBeTruthy();
      expect(comment.likes).toBeGreaterThanOrEqual(0);
    });
  });

  it('コメントIDはすべてユニーク', () => {
    const ids = COMMENTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('getCommentsByPostId', () => {
  it('対象投稿のコメントだけを返す', () => {
    const comments = getCommentsByPostId('1');
    expect(comments.length).toBeGreaterThan(0);
    comments.forEach((c) => expect(c.postId).toBe('1'));
  });

  it('コメントのない投稿は空配列を返す', () => {
    expect(getCommentsByPostId('999')).toEqual([]);
  });

  it('投稿1・2・3にはコメントが存在する', () => {
    expect(getCommentsByPostId('1').length).toBeGreaterThan(0);
    expect(getCommentsByPostId('2').length).toBeGreaterThan(0);
    expect(getCommentsByPostId('3').length).toBeGreaterThan(0);
  });

  it('他の投稿のコメントを混入しない', () => {
    const post1Comments = getCommentsByPostId('1');
    const post2Comments = getCommentsByPostId('2');
    const ids1 = new Set(post1Comments.map((c) => c.id));
    post2Comments.forEach((c) => expect(ids1.has(c.id)).toBe(false));
  });
});
