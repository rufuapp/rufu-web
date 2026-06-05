import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { HtmlPreviewCard } from '@/components/HtmlPreviewCard';

type GalleryPost = {
  id: string;
  title: string;
  html_content: string;
  post_tags: { tag: string }[];
  profiles: { name: string; display_name: string } | null;
};

const GRADIENTS = [
  'from-blue-400 to-purple-600',
  'from-green-400 to-teal-600',
  'from-orange-400 to-red-600',
  'from-pink-400 to-rose-600',
  'from-indigo-400 to-blue-600',
  'from-yellow-400 to-orange-600',
  'from-teal-400 to-cyan-600',
  'from-purple-400 to-pink-600',
];

function gradientFor(id: string) {
  const n = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[n % GRADIENTS.length];
}

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    title: '投稿',
    desc: 'HTMLを貼り付けるだけ。Claude・ChatGPTが生成したコードをそのまま公開できます。ファイルアップロードにも対応。',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: '発見',
    desc: 'タグ・トレンド・フォロー機能で、自分好みのコンテンツを見つけられます。スライドからダッシュボードまで多彩なカテゴリ。',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    title: '反応・リミックス',
    desc: 'いいね・コメント・ブックマークで交流できます。気に入ったHTMLをリミックスして自分流にアレンジ。',
  },
];

const STEPS = [
  { num: '01', title: 'AIでHTMLを生成', desc: 'ClaudeやChatGPTに「スライドを作って」と依頼するだけ。どんなHTMLでも投稿できます。' },
  { num: '02', title: 'rufuに投稿', desc: '生成されたHTMLをペーストして、タイトルとタグを付けるだけ。30秒で完了します。' },
  { num: '03', title: 'コミュニティで広まる', desc: 'フィードに表示され、世界中のクリエイターに発見されます。いいね・コメントで反響を確認。' },
];

export default async function LandingPage() {
  const supabase = await createClient();

  const [
    { count: postsCount },
    { data: userIds },
    { data: viewsData },
    { data: galleryPosts },
  ] = await Promise.all([
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('visibility', 'public'),
    supabase
      .from('posts')
      .select('user_id')
      .eq('visibility', 'public'),
    supabase
      .from('posts')
      .select('views_count')
      .eq('visibility', 'public'),
    supabase
      .from('posts')
      .select('id, title, html_content, post_tags(tag), profiles!posts_user_id_fkey(name, display_name)')
      .eq('visibility', 'public')
      .order('likes_count', { ascending: false })
      .limit(6),
  ]);

  const creatorsCount = new Set(userIds?.map((r) => r.user_id)).size;
  const viewsTotal = viewsData?.reduce((sum, r) => sum + (r.views_count ?? 0), 0) ?? 0;

  const STATS = [
    {
      value: (postsCount ?? 0).toLocaleString(),
      label: '投稿数',
    },
    {
      value: creatorsCount.toLocaleString(),
      label: 'クリエイター',
    },
    {
      value: viewsTotal.toLocaleString(),
      label: '累計閲覧数',
    },
  ];

  const gallery = (galleryPosts ?? []) as unknown as GalleryPost[];

  // 深緑ブランドカラー
  const G = '#1a5c2a';
  const GL = '#f0f7f2'; // 薄い緑の背景

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Nav — Zenn風: シンプル・フラット */}
      <nav className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight" style={{ color: G }}>rufu</span>
            <span className="text-xs text-gray-400 tracking-wider">流布</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/feed" className="text-sm text-gray-500 hover:text-gray-800 transition-colors hidden sm:block">
              フィード
            </Link>
            <Link href="/ranking" className="text-sm text-gray-500 hover:text-gray-800 transition-colors hidden sm:block">
              ランキング
            </Link>
            <Link
              href="/post/new"
              className="text-sm font-medium text-white px-4 py-1.5 rounded transition-opacity hover:opacity-85"
              style={{ backgroundColor: G }}
            >
              投稿する
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — Zenn風: 余白大きめ・テキスト中心 */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: G }}>
          AI-Generated HTML Platform
        </p>
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6 text-gray-900">
          AIが作ったHTMLを、<br />
          <span style={{ color: G }}>世界に流布</span>しよう
        </h1>
        <p className="text-base sm:text-lg text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed">
          ClaudeやChatGPTが生成したHTMLを投稿・発見・共有するコミュニティ。
          スライド・ダッシュボード・ビジュアライゼーション——あらゆるHTMLに居場所を。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/post/new"
            className="w-full sm:w-auto text-sm font-semibold text-white px-7 py-2.5 rounded transition-opacity hover:opacity-85"
            style={{ backgroundColor: G }}
          >
            無料で投稿する →
          </Link>
          <Link
            href="/feed"
            className="w-full sm:w-auto text-sm text-gray-600 hover:text-gray-900 px-7 py-2.5 rounded border border-gray-200 hover:border-gray-300 transition-colors"
          >
            フィードを見る
          </Link>
        </div>
      </section>

      {/* Gallery */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        {gallery.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {gallery.map((post) => (
              <HtmlPreviewCard
                key={post.id}
                href={`/post/${post.id}`}
                title={post.title}
                authorName={post.profiles?.name ?? ''}
                firstTag={post.post_tags?.[0]?.tag}
                html={post.html_content ?? ''}
                gradient={gradientFor(post.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
            <p className="text-sm text-gray-400 mb-4">まだ投稿がありません。最初の投稿者になりましょう！</p>
            <Link
              href="/post/new"
              className="text-sm font-semibold text-white px-6 py-2.5 rounded transition-opacity hover:opacity-85"
              style={{ backgroundColor: G }}
            >
              最初に投稿する →
            </Link>
          </div>
        )}
      </section>

      {/* Stats — シンプルな数値行 */}
      <section style={{ backgroundColor: GL, borderTop: `1px solid #d4e8da`, borderBottom: `1px solid #d4e8da` }}>
        <div className="max-w-5xl mx-auto px-4 py-10 flex flex-wrap justify-center gap-x-16 gap-y-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center min-w-[90px]">
              <p className="text-3xl font-extrabold" style={{ color: G }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features — Zenn風: 横並び・アイコン小さめ */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-xl font-bold text-gray-900 mb-10 pb-3 border-b border-gray-100">
          rufuでできること
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: GL, color: G }}>
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ backgroundColor: GL, borderTop: `1px solid #d4e8da`, borderBottom: `1px solid #d4e8da` }} className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-10 pb-3 border-b border-green-100">
            使い方
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                  style={{ backgroundColor: G }}>
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
          あなたのHTMLを、世界に流布しよう
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          今すぐ無料で参加して、AIコミュニティの一員になりましょう。
        </p>
        <Link
          href="/post/new"
          className="inline-block font-semibold text-white px-8 py-3 rounded transition-opacity hover:opacity-85 text-sm"
          style={{ backgroundColor: G }}
        >
          投稿してみる →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold" style={{ color: G }}>rufu</span>
            <span className="text-xs text-gray-300">流布</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <Link href="/feed" className="hover:text-gray-700 transition-colors">フィード</Link>
            <Link href="/ranking" className="hover:text-gray-700 transition-colors">ランキング</Link>
            <Link href="/search" className="hover:text-gray-700 transition-colors">検索</Link>
            <Link href="/post/new" className="hover:text-gray-700 transition-colors">投稿する</Link>
          </div>
          <p className="text-xs text-gray-300">© 2026 rufu</p>
        </div>
      </footer>
    </div>
  );
}
