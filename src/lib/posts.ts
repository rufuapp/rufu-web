export type Post = {
  id: string;
  title: string;
  author: { name: string; initial: string };
  tags: string[];
  likes: number;
  bookmarks: number;
  views: number;
  createdAt: string;
  previewGradient: string;
  htmlContent: string;
};

export const POSTS: Post[] = [
  {
    id: '1',
    title: 'Q4 2025 売上ダッシュボード',
    author: { name: 'yamada_dev', initial: 'Y' },
    tags: ['ダッシュボード', 'ビジネス'],
    likes: 342,
    bookmarks: 87,
    views: 2840,
    createdAt: '2時間前',
    previewGradient: 'from-blue-600 to-cyan-400',
    htmlContent: `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; background: #f0f4f8; color: #1a1a2e; padding: 24px; }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .subtitle { color: #64748b; font-size: 13px; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  .card-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }
  .card-value { font-size: 32px; font-weight: 700; color: #1e40af; }
  .card-delta { font-size: 12px; color: #16a34a; margin-top: 4px; }
  .chart { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  .chart-title { font-size: 14px; font-weight: 600; margin-bottom: 16px; }
  .bars { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
  .bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .bar { width: 100%; background: #3b82f6; border-radius: 4px 4px 0 0; }
  .bar-label { font-size: 10px; color: #94a3b8; }
</style>
</head>
<body>
  <h1>Q4 2025 売上ダッシュボード</h1>
  <p class="subtitle">2025年10月〜12月 / 前四半期比</p>
  <div class="grid">
    <div class="card">
      <div class="card-label">総売上</div>
      <div class="card-value">¥48.2M</div>
      <div class="card-delta">▲ 12.4% vs Q3</div>
    </div>
    <div class="card">
      <div class="card-label">新規顧客</div>
      <div class="card-value">1,240</div>
      <div class="card-delta">▲ 8.1% vs Q3</div>
    </div>
    <div class="card">
      <div class="card-label">平均単価</div>
      <div class="card-value">¥38.8K</div>
      <div class="card-delta">▲ 3.9% vs Q3</div>
    </div>
  </div>
  <div class="chart">
    <div class="chart-title">月次売上推移 (百万円)</div>
    <div class="bars">
      <div class="bar-wrap"><div class="bar" style="height:60%;background:#93c5fd"></div><div class="bar-label">7月</div></div>
      <div class="bar-wrap"><div class="bar" style="height:72%;background:#93c5fd"></div><div class="bar-label">8月</div></div>
      <div class="bar-wrap"><div class="bar" style="height:65%;background:#93c5fd"></div><div class="bar-label">9月</div></div>
      <div class="bar-wrap"><div class="bar" style="height:80%"></div><div class="bar-label">10月</div></div>
      <div class="bar-wrap"><div class="bar" style="height:90%"></div><div class="bar-label">11月</div></div>
      <div class="bar-wrap"><div class="bar" style="height:100%"></div><div class="bar-label">12月</div></div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: '2',
    title: 'TypeScript 5.x 新機能まとめスライド',
    author: { name: 'ts_lover', initial: 'T' },
    tags: ['スライド', 'TypeScript', 'プログラミング'],
    likes: 289,
    bookmarks: 156,
    views: 5120,
    createdAt: '5時間前',
    previewGradient: 'from-violet-600 to-purple-400',
    htmlContent: `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; background: #1e1b4b; color: white; height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 48px; }
  .kicker { font-size: 12px; font-weight: 700; letter-spacing: .2em; color: #a78bfa; text-transform: uppercase; margin-bottom: 12px; }
  h1 { font-size: 36px; font-weight: 800; line-height: 1.2; margin-bottom: 32px; }
  h1 span { color: #a78bfa; }
  .features { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .feat { background: rgba(255,255,255,.07); border: 1px solid rgba(167,139,250,.3); border-radius: 10px; padding: 16px; }
  .feat-title { font-size: 14px; font-weight: 700; color: #a78bfa; margin-bottom: 6px; }
  .feat-desc { font-size: 13px; color: #c4b5fd; line-height: 1.6; }
  code { background: rgba(167,139,250,.2); padding: 1px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
</style>
</head>
<body>
  <div class="kicker">TypeScript 5.x Deep Dive</div>
  <h1>新機能で変わる<br><span>型安全</span>の世界</h1>
  <div class="features">
    <div class="feat">
      <div class="feat-title">Const Type Parameters</div>
      <div class="feat-desc"><code>function fn&lt;const T&gt;()</code> でリテラル型を推論。より厳密な型付けが可能に。</div>
    </div>
    <div class="feat">
      <div class="feat-title">Variadic Tuple Types</div>
      <div class="feat-desc">タプルの可変長部分を <code>...T[]</code> で表現。高度な型操作が直感的に。</div>
    </div>
    <div class="feat">
      <div class="feat-title">using 宣言</div>
      <div class="feat-desc"><code>using</code> キーワードでリソース管理を自動化。明示的なクリーンアップが不要に。</div>
    </div>
    <div class="feat">
      <div class="feat-title">Decorator Metadata</div>
      <div class="feat-desc">Stage 3デコレータのメタデータAPIに対応。フレームワーク開発が大幅に簡素化。</div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: '3',
    title: '東京都の人口推移インタラクティブマップ',
    author: { name: 'data_viz', initial: 'D' },
    tags: ['ビジュアライゼーション', 'データ'],
    likes: 521,
    bookmarks: 203,
    views: 8900,
    createdAt: '1日前',
    previewGradient: 'from-emerald-500 to-teal-400',
    htmlContent: `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; background: #f0fdf4; color: #1a2e1a; padding: 24px; }
  h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  .subtitle { color: #4b7a4b; font-size: 13px; margin-bottom: 24px; }
  .map { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,.06); display: flex; gap: 24px; }
  .tokyo { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; flex: 1; }
  .ward { border-radius: 8px; padding: 8px 4px; text-align: center; font-size: 10px; font-weight: 600; color: white; cursor: pointer; transition: transform .15s; }
  .ward:hover { transform: scale(1.05); }
  .legend { width: 120px; }
  .legend-title { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 12px; }
  .legend-item { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #6b7280; margin-bottom: 6px; }
  .legend-color { width: 16px; height: 16px; border-radius: 4px; }
</style>
</head>
<body>
  <h1>東京都23区 人口密度マップ</h1>
  <p class="subtitle">2024年推計人口データ（人/km²）</p>
  <div class="map">
    <div class="tokyo">
      <div class="ward" style="background:#065f46">豊島区</div>
      <div class="ward" style="background:#065f46">中野区</div>
      <div class="ward" style="background:#047857">文京区</div>
      <div class="ward" style="background:#059669">台東区</div>
      <div class="ward" style="background:#10b981">墨田区</div>
      <div class="ward" style="background:#047857">渋谷区</div>
      <div class="ward" style="background:#059669">新宿区</div>
      <div class="ward" style="background:#10b981">千代田区</div>
      <div class="ward" style="background:#34d399">中央区</div>
      <div class="ward" style="background:#10b981">江東区</div>
      <div class="ward" style="background:#059669">目黒区</div>
      <div class="ward" style="background:#10b981">品川区</div>
      <div class="ward" style="background:#34d399">港区</div>
      <div class="ward" style="background:#6ee7b7">江戸川区</div>
      <div class="ward" style="background:#6ee7b7">葛飾区</div>
      <div class="ward" style="background:#34d399">世田谷区</div>
      <div class="ward" style="background:#6ee7b7">大田区</div>
      <div class="ward" style="background:#a7f3d0">杉並区</div>
      <div class="ward" style="background:#059669">荒川区</div>
      <div class="ward" style="background:#047857">北区</div>
      <div class="ward" style="background:#10b981">板橋区</div>
      <div class="ward" style="background:#34d399">練馬区</div>
      <div class="ward" style="background:#059669">足立区</div>
    </div>
    <div class="legend">
      <div class="legend-title">人口密度</div>
      <div class="legend-item"><div class="legend-color" style="background:#065f46"></div>20,000+</div>
      <div class="legend-item"><div class="legend-color" style="background:#059669"></div>15,000–20,000</div>
      <div class="legend-item"><div class="legend-color" style="background:#10b981"></div>10,000–15,000</div>
      <div class="legend-item"><div class="legend-color" style="background:#34d399"></div>7,000–10,000</div>
      <div class="legend-item"><div class="legend-color" style="background:#6ee7b7"></div>5,000–7,000</div>
      <div class="legend-item"><div class="legend-color" style="background:#a7f3d0"></div>〜5,000</div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: '4',
    title: 'Rufu プロダクト紹介ランディングページ',
    author: { name: 'design_lab', initial: 'D' },
    tags: ['ランディングページ', 'デザイン'],
    likes: 178,
    bookmarks: 64,
    views: 3210,
    createdAt: '1日前',
    previewGradient: 'from-rose-500 to-pink-400',
    htmlContent: `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; background: #fff; color: #111; }
  .hero { background: linear-gradient(135deg, #be123c 0%, #e11d48 50%, #fb7185 100%); color: white; padding: 60px 40px; text-align: center; }
  .badge { display: inline-block; background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.4); border-radius: 999px; padding: 4px 14px; font-size: 12px; font-weight: 600; letter-spacing: .1em; margin-bottom: 20px; }
  h1 { font-size: 40px; font-weight: 800; line-height: 1.15; margin-bottom: 16px; }
  .lead { font-size: 16px; color: rgba(255,255,255,.85); max-width: 480px; margin: 0 auto 28px; line-height: 1.7; }
  .cta { display: inline-block; background: white; color: #be123c; font-weight: 700; padding: 12px 32px; border-radius: 999px; font-size: 15px; }
  .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #f1f5f9; }
  .feat { background: white; padding: 28px 24px; }
  .feat-icon { font-size: 28px; margin-bottom: 12px; }
  .feat-title { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
  .feat-desc { font-size: 13px; color: #64748b; line-height: 1.6; }
</style>
</head>
<body>
  <div class="hero">
    <div class="badge">NEW PLATFORM</div>
    <h1>AIが作ったHTMLを<br>世界に流布しよう</h1>
    <p class="lead">Claudeや ChatGPT が生成したHTMLコンテンツを、ワンクリックで投稿・発見・共有できるプラットフォーム。</p>
    <a class="cta" href="#">無料で始める →</a>
  </div>
  <div class="features">
    <div class="feat">
      <div class="feat-icon">📤</div>
      <div class="feat-title">ワンクリック投稿</div>
      <div class="feat-desc">AIとの会話からそのまま投稿。HTMLファイルのアップロードも対応。</div>
    </div>
    <div class="feat">
      <div class="feat-icon">🔍</div>
      <div class="feat-title">発見しやすい</div>
      <div class="feat-desc">タグ・トレンド・フォロー機能で、自分好みのコンテンツをすぐ見つけられる。</div>
    </div>
    <div class="feat">
      <div class="feat-icon">🔀</div>
      <div class="feat-title">リミックス</div>
      <div class="feat-desc">気に入ったコンテンツをフォークして、自分流にカスタマイズ。</div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: '5',
    title: '2026年AI業界トレンドインフォグラフィック',
    author: { name: 'ai_watcher', initial: 'A' },
    tags: ['インフォグラフィック', 'AI'],
    likes: 634,
    bookmarks: 412,
    views: 12400,
    createdAt: '2日前',
    previewGradient: 'from-amber-500 to-orange-400',
    htmlContent: `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; background: #1c1917; color: white; padding: 32px; }
  h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #a8a29e; margin-bottom: 28px; }
  .trends { display: flex; flex-direction: column; gap: 14px; }
  .trend { display: flex; align-items: center; gap: 16px; }
  .rank { font-size: 24px; font-weight: 900; color: #d97706; width: 36px; flex-shrink: 0; }
  .info { flex: 1; }
  .trend-name { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
  .bar-bg { background: #292524; border-radius: 999px; height: 8px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(to right, #d97706, #f59e0b); }
  .pct { font-size: 13px; font-weight: 700; color: #f59e0b; width: 40px; text-align: right; flex-shrink: 0; }
</style>
</head>
<body>
  <h1>2026年 AI業界トレンド TOP 6</h1>
  <p class="subtitle">エンジニア・研究者 2,400名調査 / 2025年12月実施</p>
  <div class="trends">
    <div class="trend"><div class="rank">#1</div><div class="info"><div class="trend-name">エージェント型AI / Agentic Workflow</div><div class="bar-bg"><div class="bar-fill" style="width:92%"></div></div></div><div class="pct">92%</div></div>
    <div class="trend"><div class="rank">#2</div><div class="info"><div class="trend-name">マルチモーダル大規模モデル</div><div class="bar-bg"><div class="bar-fill" style="width:84%"></div></div></div><div class="pct">84%</div></div>
    <div class="trend"><div class="rank">#3</div><div class="info"><div class="trend-name">オンデバイスAI・エッジ推論</div><div class="bar-bg"><div class="bar-fill" style="width:71%"></div></div></div><div class="pct">71%</div></div>
    <div class="trend"><div class="rank">#4</div><div class="info"><div class="trend-name">AIコード生成・開発自動化</div><div class="bar-bg"><div class="bar-fill" style="width:68%"></div></div></div><div class="pct">68%</div></div>
    <div class="trend"><div class="rank">#5</div><div class="info"><div class="trend-name">RAG・ベクトルDB活用</div><div class="bar-bg"><div class="bar-fill" style="width:59%"></div></div></div><div class="pct">59%</div></div>
    <div class="trend"><div class="rank">#6</div><div class="info"><div class="trend-name">AI規制・ガバナンス対応</div><div class="bar-bg"><div class="bar-fill" style="width:47%"></div></div></div><div class="pct">47%</div></div>
  </div>
</body>
</html>`,
  },
  {
    id: '6',
    title: 'ポートフォリオサイトテンプレート',
    author: { name: 'web_crafter', initial: 'W' },
    tags: ['ランディングページ', 'デザイン'],
    likes: 445,
    bookmarks: 298,
    views: 9870,
    createdAt: '3日前',
    previewGradient: 'from-indigo-500 to-blue-400',
    htmlContent: `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0}nav{display:flex;justify-content:space-between;align-items:center;padding:20px 40px;border-bottom:1px solid #1e293b}.logo{font-weight:800;font-size:18px;color:#818cf8}.nav-links{display:flex;gap:24px;font-size:13px;color:#94a3b8}.hero{padding:80px 40px;display:flex;gap:48px;align-items:center}.avatar{width:140px;height:140px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:800;color:white}.bio h1{font-size:32px;font-weight:800;margin-bottom:8px}.bio .role{color:#818cf8;font-size:14px;font-weight:600;margin-bottom:16px}.bio p{font-size:14px;color:#94a3b8;line-height:1.7;max-width:480px}.skills{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.skill{background:#1e293b;border:1px solid #334155;border-radius:6px;padding:4px 10px;font-size:12px;color:#94a3b8}</style></head><body><nav><div class="logo">K.T</div><div class="nav-links"><span>Works</span><span>About</span><span>Blog</span><span>Contact</span></div></nav><div class="hero"><div class="avatar">K</div><div class="bio"><h1>Kenji Tanaka</h1><div class="role">Full-Stack Engineer / AI enthusiast</div><p>東京在住のフルスタックエンジニア。TypeScript・Next.js・Pythonを主軸に、AIプロダクト開発に従事。趣味はAIでHTMLを生成してrufuに投稿すること。</p><div class="skills"><span class="skill">TypeScript</span><span class="skill">Next.js</span><span class="skill">Python</span><span class="skill">Claude API</span><span class="skill">PostgreSQL</span><span class="skill">Vercel</span></div></div></div></body></html>`,
  },
  {
    id: '7',
    title: 'プロジェクト管理カンバンボード',
    author: { name: 'pm_tool', initial: 'P' },
    tags: ['ダッシュボード', 'ツール'],
    likes: 267,
    bookmarks: 189,
    views: 6540,
    createdAt: '3日前',
    previewGradient: 'from-sky-500 to-blue-400',
    htmlContent: `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#f1f5f9;padding:20px}h1{font-size:18px;font-weight:700;margin-bottom:16px;color:#0f172a}.board{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.col{background:#e2e8f0;border-radius:10px;padding:12px}.col-header{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin-bottom:10px;display:flex;justify-content:space-between}.count{background:#cbd5e1;border-radius:999px;padding:1px 8px;font-size:11px}.card{background:white;border-radius:8px;padding:12px;margin-bottom:8px;box-shadow:0 1px 2px rgba(0,0,0,.06)}.card-title{font-size:13px;font-weight:600;color:#1e293b;margin-bottom:6px}.tag{display:inline-block;font-size:10px;padding:2px 7px;border-radius:999px;font-weight:600;margin-right:4px}.todo .col-header{color:#6366f1}.doing .col-header{color:#f59e0b}.done .col-header{color:#10b981}</style></head><body><h1>Sprint 12 — カンバンボード</h1><div class="board"><div class="col todo"><div class="col-header">Todo <span class="count">4</span></div><div class="card"><div class="card-title">認証画面のUI実装</div><span class="tag" style="background:#ede9fe;color:#7c3aed">Design</span></div><div class="card"><div class="card-title">APIエンドポイント設計書</div><span class="tag" style="background:#dbeafe;color:#1d4ed8">Backend</span></div><div class="card"><div class="card-title">OGP自動生成機能</div><span class="tag" style="background:#dcfce7;color:#15803d">Feature</span></div><div class="card"><div class="card-title">パフォーマンス計測</div><span class="tag" style="background:#fef9c3;color:#854d0e">Infra</span></div></div><div class="col doing"><div class="col-header">In Progress <span class="count">2</span></div><div class="card"><div class="card-title">フィードページ実装</div><span class="tag" style="background:#dcfce7;color:#15803d">Feature</span></div><div class="card"><div class="card-title">iframe sandbox対応</div><span class="tag" style="background:#dbeafe;color:#1d4ed8">Backend</span></div></div><div class="col done"><div class="col-header">Done <span class="count">3</span></div><div class="card"><div class="card-title">Next.js セットアップ</div><span class="tag" style="background:#f1f5f9;color:#64748b">Setup</span></div><div class="card"><div class="card-title">Tailwind設定</div><span class="tag" style="background:#f1f5f9;color:#64748b">Setup</span></div><div class="card"><div class="card-title">モックデータ作成</div><span class="tag" style="background:#f1f5f9;color:#64748b">Setup</span></div></div></div></body></html>`,
  },
  {
    id: '8',
    title: '世界の気候変動データビジュアライゼーション',
    author: { name: 'eco_data', initial: 'E' },
    tags: ['ビジュアライゼーション', 'データ'],
    likes: 892,
    bookmarks: 567,
    views: 18700,
    createdAt: '4日前',
    previewGradient: 'from-green-500 to-emerald-400',
    htmlContent: `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#052e16;color:white;padding:28px}h1{font-size:20px;font-weight:700;margin-bottom:4px}.subtitle{font-size:12px;color:#86efac;margin-bottom:24px}.chart-area{background:rgba(255,255,255,.04);border-radius:12px;padding:20px;margin-bottom:16px}.chart-title{font-size:13px;font-weight:600;color:#4ade80;margin-bottom:16px}.temp-chart{display:flex;align-items:flex-end;gap:4px;height:100px}.temp-bar{flex:1;border-radius:2px 2px 0 0;min-height:4px;transition:opacity .2s}.temp-bar:hover{opacity:.8}.years{display:flex;gap:4px;margin-top:4px}.year{flex:1;font-size:9px;color:#6b7280;text-align:center}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.stat{background:rgba(255,255,255,.05);border-radius:10px;padding:14px;text-align:center}.stat-val{font-size:26px;font-weight:700;color:#4ade80}.stat-label{font-size:11px;color:#86efac;margin-top:4px}</style></head><body><h1>地球温暖化 — 気温偏差の推移</html><p class="subtitle">1960年〜2025年 / 産業革命前比 (°C)</p><div class="chart-area"><div class="chart-title">年平均気温偏差（°C）</div><div class="temp-chart"><div class="temp-bar" style="height:15%;background:#3b82f6"></div><div class="temp-bar" style="height:18%;background:#3b82f6"></div><div class="temp-bar" style="height:22%;background:#3b82f6"></div><div class="temp-bar" style="height:28%;background:#60a5fa"></div><div class="temp-bar" style="height:32%;background:#60a5fa"></div><div class="temp-bar" style="height:38%;background:#86efac"></div><div class="temp-bar" style="height:45%;background:#86efac"></div><div class="temp-bar" style="height:52%;background:#fbbf24"></div><div class="temp-bar" style="height:62%;background:#f97316"></div><div class="temp-bar" style="height:72%;background:#ef4444"></div><div class="temp-bar" style="height:80%;background:#dc2626"></div><div class="temp-bar" style="height:90%;background:#b91c1c"></div><div class="temp-bar" style="height:100%;background:#7f1d1d"></div></div><div class="years"><span class="year">1960</span><span class="year">65</span><span class="year">70</span><span class="year">75</span><span class="year">80</span><span class="year">85</span><span class="year">90</span><span class="year">95</span><span class="year">2000</span><span class="year">05</span><span class="year">10</span><span class="year">20</span><span class="year">25</span></div></div><div class="stats"><div class="stat"><div class="stat-val">+1.48°C</div><div class="stat-label">2024年の偏差</div></div><div class="stat"><div class="stat-val">1.5°C</div><div class="stat-label">パリ協定目標</div></div><div class="stat"><div class="stat-val">2030</div><div class="stat-label">超過予測年</div></div></div></body></html>`,
  },
  {
    id: '9',
    title: 'CSS アニメーション作例集',
    author: { name: 'css_magic', initial: 'C' },
    tags: ['スライド', 'フロントエンド'],
    likes: 731,
    bookmarks: 445,
    views: 14200,
    createdAt: '5日前',
    previewGradient: 'from-fuchsia-500 to-pink-400',
    htmlContent: `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#fdf4ff;padding:28px}h1{font-size:20px;font-weight:700;margin-bottom:4px;color:#4a044e}.subtitle{font-size:13px;color:#a21caf;margin-bottom:24px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.demo{background:white;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.08);text-align:center;overflow:hidden}.demo-area{height:80px;display:flex;align-items:center;justify-content:center;margin-bottom:12px}.demo-title{font-size:12px;font-weight:600;color:#4a044e}.box{width:40px;height:40px;background:linear-gradient(135deg,#d946ef,#a855f7);border-radius:8px}@keyframes spin{to{transform:rotate(360deg)}}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:.7}}@keyframes slide{0%{transform:translateX(-40px);opacity:0}100%{transform:translateX(0);opacity:1}}.spin{animation:spin 2s linear infinite}.bounce{animation:bounce 1s ease-in-out infinite}.pulse{animation:pulse 1.5s ease-in-out infinite}.slide{animation:slide 1s ease-out forwards}</style></head><body><h1>CSS アニメーション作例集</h1><p class="subtitle">CSSのみで実装するUI演出パターン集</p><div class="grid"><div class="demo"><div class="demo-area"><div class="box spin"></div></div><div class="demo-title">Spin — rotate(360deg)</div></div><div class="demo"><div class="demo-area"><div class="box bounce"></div></div><div class="demo-title">Bounce — translateY</div></div><div class="demo"><div class="demo-area"><div class="box pulse"></div></div><div class="demo-title">Pulse — scale + opacity</div></div></div></body></html>`,
  },
];

export function getPostById(id: string): Post | undefined {
  return POSTS.find((p) => p.id === id);
}
