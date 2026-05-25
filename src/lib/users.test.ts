import { USERS, getUserByName } from './users';

describe('USERS', () => {
  it('投稿者全員のプロフィールが存在する', () => {
    const expectedAuthors = [
      'yamada_dev', 'ts_lover', 'data_viz', 'design_lab',
      'ai_watcher', 'web_crafter', 'pm_tool', 'eco_data', 'css_magic',
    ];
    expectedAuthors.forEach((name) => {
      expect(USERS[name]).toBeDefined();
    });
  });

  it('各ユーザーは必須フィールドを持つ', () => {
    Object.values(USERS).forEach((user) => {
      expect(user.name).toBeTruthy();
      expect(user.displayName).toBeTruthy();
      expect(user.initial).toHaveLength(1);
      expect(user.bio).toBeTruthy();
      expect(user.followers).toBeGreaterThanOrEqual(0);
      expect(user.following).toBeGreaterThanOrEqual(0);
      expect(user.postCount).toBeGreaterThan(0);
    });
  });

  it('nameとキーが一致する', () => {
    Object.entries(USERS).forEach(([key, user]) => {
      expect(user.name).toBe(key);
    });
  });
});

describe('getUserByName', () => {
  it('存在するユーザーを返す', () => {
    const user = getUserByName('yamada_dev');
    expect(user).toBeDefined();
    expect(user?.name).toBe('yamada_dev');
    expect(user?.displayName).toBe('山田 Dev');
  });

  it('存在しないユーザー名でundefinedを返す', () => {
    expect(getUserByName('unknown_user')).toBeUndefined();
    expect(getUserByName('')).toBeUndefined();
  });

  it('フォロワー数は正の数', () => {
    const user = getUserByName('ai_watcher');
    expect(user?.followers).toBeGreaterThan(0);
  });
});
