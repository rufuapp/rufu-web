# rufu (流布) — 設計書

> AI生成HTMLコンテンツの投稿・発見・共有プラットフォーム

---

## 1. プロダクト概要

| 項目 | 内容 |
|------|------|
| サービス名 | rufu（流布） |
| コンセプト | AIが生成したHTMLコンテンツを投稿・発見・共有できるコミュニティ |
| ターゲット | AIツール（Claude / ChatGPT）でHTMLを生成する個人クリエイター・エンジニア |
| 差別化軸 | HTMLネイティブ表示 × コミュニティ性（既存サービスは両立していない） |
| URL | https://www.rufu.dev |

---

## 2. アーキテクチャ図

### 現在（フロントエンドのみ）

```
┌─────────────────────────────────────────────────────────────┐
│                        ユーザー                               │
│                    ブラウザ / スマートフォン                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare DNS                           │
│                       rufu.dev                               │
│              (DNS only / プロキシ OFF)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │               Next.js 16 App Router                  │    │
│  │                                                      │    │
│  │  /              ランディングページ                     │    │
│  │  /feed          フィード                              │    │
│  │  /post/[id]     コンテンツ詳細                        │    │
│  │  /post/new      投稿作成（リミックス対応）              │    │
│  │  /search        検索                                 │    │
│  │  /user/[name]   ユーザープロフィール                   │    │
│  │                                                      │    │
│  │  OGP: /post/[id]/opengraph-image  (ImageResponse)    │    │
│  │  Data: インメモリ モックデータ（posts/users/comments） │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  CDN Edge Network（世界中にキャッシュ配信）                    │
└──────────────────────────────────────────────────────────────┘
                           ▲
                           │ git push → 自動デプロイ
                           │
┌─────────────────────────────────────────────────────────────┐
│                   GitHub Actions CI/CD                       │
│                                                              │
│  push to main                                                │
│       │                                                      │
│       ├── CI Job                                             │
│       │    ├── pnpm lint (ESLint)                            │
│       │    ├── pnpm test --ci (Jest)                         │
│       │    └── pnpm build (Next.js)                          │
│       │                                                      │
│       └── Deploy Job (CI通過後)                              │
│            ├── vercel pull --environment=production          │
│            ├── vercel build --prod                           │
│            └── vercel deploy --prebuilt --prod               │
└─────────────────────────────────────────────────────────────┘
```

### 将来（バックエンド実装後）

```
┌──────────────────────────────────────────────────────────────┐
│                         ユーザー                               │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTPS
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                      Cloudflare DNS                           │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                         Vercel                                │
│   Next.js 16 App Router                                       │
│   ├── Server Components (データフェッチ)                       │
│   ├── API Routes (投稿・いいね・フォロー等)                      │
│   └── Edge Functions (OGP生成)                                │
└──────┬─────────────────────────────────┬────────────────────┘
       │                                 │
       ▼                                 ▼
┌─────────────┐                 ┌────────────────┐
│   Supabase  │                 │ Cloudflare R2  │
│             │                 │                │
│  PostgreSQL │                 │ HTMLファイル    │
│  Auth       │                 │ ストレージ      │
│  Realtime   │                 └────────────────┘
└─────────────┘
```

---

## 3. 技術スタック

| レイヤー | 技術 | 状態 |
|---------|------|------|
| フレームワーク | Next.js 16 App Router + Turbopack | ✅ 実装済み |
| スタイリング | Tailwind CSS v4 | ✅ 実装済み |
| 言語 | TypeScript | ✅ 実装済み |
| パッケージ管理 | pnpm 11 | ✅ 実装済み |
| テスト | Jest + testing-library | ✅ 実装済み |
| OGP生成 | `next/og` (ImageResponse) | ✅ 実装済み |
| CI/CD | GitHub Actions | ✅ 実装済み |
| ホスティング | Vercel | ✅ 実装済み |
| ドメイン | Cloudflare DNS → rufu.dev | ✅ 実装済み |
| HTML安全実行 | `<iframe sandbox="allow-scripts">` | ✅ 実装済み |
| DB | Supabase (PostgreSQL) | 🔲 未実装 |
| 認証 | Clerk または NextAuth.js | 🔲 未実装 |
| ストレージ | Cloudflare R2 | 🔲 未実装 |

---

## 4. ディレクトリ構成

```
web/
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions CI/CD
├── src/
│   ├── app/
│   │   ├── layout.tsx          # ルートレイアウト（メタデータ・開発バナー）
│   │   ├── page.tsx            # ランディングページ (/)
│   │   ├── feed/
│   │   │   └── page.tsx        # フィード (/feed)
│   │   ├── post/
│   │   │   ├── [id]/
│   │   │   │   ├── layout.tsx          # 動的メタデータ (generateMetadata)
│   │   │   │   ├── page.tsx            # 詳細ページ (/post/:id)
│   │   │   │   └── opengraph-image.tsx # OGP画像生成
│   │   │   └── new/
│   │   │       └── page.tsx    # 投稿作成 (/post/new, ?remix=id)
│   │   ├── search/
│   │   │   └── page.tsx        # 検索 (/search?q=...)
│   │   └── user/
│   │       └── [name]/
│   │           └── page.tsx    # ユーザープロフィール (/user/:name)
│   ├── components/
│   │   └── Header.tsx          # ヘッダー（検索・認証モーダル）
│   └── lib/
│       ├── posts.ts            # 投稿データ型・モック・ヘルパー
│       ├── posts.test.ts       # 投稿テスト
│       ├── comments.ts         # コメントデータ型・モック・ヘルパー
│       ├── comments.test.ts    # コメントテスト
│       ├── users.ts            # ユーザーデータ型・モック・ヘルパー
│       └── users.test.ts       # ユーザーテスト
├── jest.config.ts
├── jest.setup.ts
└── package.json
```

---

## 5. ページ一覧

| ページ | パス | 種別 | 説明 |
|-------|------|------|------|
| ランディング | `/` | Server | ヒーロー・ギャラリー・機能紹介 |
| フィード | `/feed` | Client | タブ・タグフィルター・PostCard一覧 |
| コンテンツ詳細 | `/post/[id]` | Client | iframeプレビュー・コメント・関連投稿 |
| 投稿作成 | `/post/new` | Client | HTML貼付け/アップロード・リミックス対応 |
| 検索 | `/search` | Client | キーワード・タグフィルター・ハイライト |
| ユーザープロフィール | `/user/[name]` | Client | 投稿一覧・フォロー・統計 |

---

## 6. データモデル

### Post

```ts
type Post = {
  id: string;
  title: string;
  author: { name: string; initial: string; };
  tags: string[];
  likes: number;
  bookmarks: number;
  views: number;
  createdAt: string;
  previewGradient: string;  // 将来: OGP画像URL
  htmlContent: string;      // 将来: R2/S3 URL
};
```

### User

```ts
type User = {
  name: string;
  displayName: string;
  initial: string;
  bio: string;
  followers: number;
  following: number;
  postCount: number;
};
```

### Comment

```ts
type Comment = {
  id: string;
  postId: string;
  author: { name: string; initial: string; };
  body: string;
  likes: number;
  createdAt: string;
};
```

### 将来のDBスキーマ（概要）

```sql
users       (id, name, display_name, avatar_url, bio, created_at)
posts       (id, user_id, title, html_url, is_public, created_at)
post_tags   (post_id, tag)
likes       (user_id, post_id, created_at)
bookmarks   (user_id, post_id, created_at)
comments    (id, post_id, user_id, body, created_at)
follows     (follower_id, following_id, created_at)
remixes     (post_id, source_post_id)
```

---

## 7. 主要機能

### リミックス
- `/post/new?remix={id}` でリミックス元のタイトル・HTML・タグを自動プリセット
- 投稿フォームにリミックス元の attribution バッジを表示

### OGP自動生成
- `/post/[id]/opengraph-image` で `ImageResponse` (1200×630) を動的生成
- 緑グラデーション背景、タイトル・タグ・著者・統計を表示
- SNSシェア時に自動適用

### HTML安全実行
```html
<iframe sandbox="allow-scripts" srcDoc={htmlContent} />
```
- `allow-same-origin` は付与しない（ホストの Cookie アクセス防止）
- `allow-forms`, `allow-popups` も付与しない

---

## 8. デザインシステム

### カラーパレット

| 用途 | 値 |
|-----|----|
| ブランドグリーン | `#00782F` |
| ブランドグリーン（薄） | `#e8f3ec` |
| 背景 | `#f9fafb` (gray-50) |
| カード背景 | `#ffffff` |
| 境界線 | `#e5e7eb` (gray-200) |
| 開発バナー | `bg-amber-50 / text-amber-700` |

### コンポーネント規約

| 要素 | スタイル |
|-----|---------|
| プライマリボタン | `bg-[#00782F] text-white rounded-full` |
| カード | `bg-white rounded-xl border border-gray-200 hover:shadow-md` |
| タグチップ | `rounded-full text-xs px-3 py-1` |

---

## 9. CI/CD パイプライン

```
GitHub push (main)
       │
       ├─ CI Job
       │    ├─ pnpm lint     → ESLint (エラーがあれば失敗)
       │    ├─ pnpm test --ci → Jest 20テスト
       │    └─ pnpm build    → Next.js ビルド
       │
       └─ Deploy Job (CI通過後のみ)
            ├─ vercel pull --environment=production
            ├─ vercel build --prod
            └─ vercel deploy --prebuilt --prod
                    │
                    └─→ https://www.rufu.dev
```

**必要な GitHub Secrets**

| 名前 | 用途 |
|------|------|
| `VERCEL_TOKEN` | Vercel CLI 認証 |
| `VERCEL_ORG_ID` | Vercel チーム ID |
| `VERCEL_PROJECT_ID` | Vercel プロジェクト ID |

---

## 10. ロードマップ

| フェーズ | 内容 | 状態 |
|---------|------|------|
| **Phase 0 — UI構築** | Next.js scaffold・全ページUI・モックデータ | ✅ 完了 |
| **Phase 0.5 — インフラ** | CI/CD・Vercelデプロイ・カスタムドメイン・OGP・テスト | ✅ 完了 |
| **Phase 1 — MVP公開** | Supabase DB・Clerk認証・HTMLアップロード（R2）・本番リリース | 🔲 未着手 |
| **Phase 2 — 成長** | SNSシェア・いいね/ブックマークDB連携・ランキング | 🔲 未着手 |
| **Phase 3 — 拡張** | Claude連携投稿フロー・週次ニュースレター・API公開 | 🔲 未着手 |
