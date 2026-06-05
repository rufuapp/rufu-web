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

  // カラーパレット（深緑ダーク）
  const BG   = '#0c1f12';  // 背景: 深い森の緑
  const SURF = '#132a1a';  // カード・セクション面
  const BOR  = 'rgba(255,255,255,0.08)'; // ボーダー
  const ACC  = '#4ade80';  // アクセント: 明るいグリーン
  const TXT  = '#e8f5ec';  // 主テキスト
  const TXTS = '#7aad8a';  // サブテキスト

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG, color: TXT }}>

      {/* Nav */}
      <nav className="sticky top-0 z-10 backdrop-blur-md" style={{ backgroundColor: 'rgba(12,31,18,0.9)', borderBottom: `1px solid ${BOR}` }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight" style={{ color: ACC }}>rufu</span>
            <span className="text-xs tracking-wider" style={{ color: TXTS }}>流布</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/feed" className="text-sm transition-colors hidden sm:block" style={{ color: TXTS }}>
              フィード
            </Link>
            <Link href="/ranking" className="text-sm transition-colors hidden sm:block" style={{ color: TXTS }}>
              ランキング
            </Link>
            <Link
              href="/post/new"
              className="text-sm font-semibold px-4 py-1.5 rounded transition-opacity hover:opacity-80"
              style={{ backgroundColor: ACC, color: BG }}
            >
              投稿する
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: ACC }}>
          AI-Generated HTML Platform
        </p>
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6" style={{ color: TXT }}>
          AIが作ったHTMLを、<br />
          <span style={{ color: ACC }}>世界に流布</span>しよう
        </h1>
        <p className="text-base sm:text-lg max-w-lg mx-auto mb-10 leading-relaxed" style={{ color: TXTS }}>
          ClaudeやChatGPTが生成したHTMLを投稿・発見・共有するコミュニティ。
          スライド・ダッシュボード・ビジュアライゼーション——あらゆるHTMLに居場所を。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/post/new"
            className="w-full sm:w-auto text-sm font-semibold px-7 py-2.5 rounded transition-opacity hover:opacity-80"
            style={{ backgroundColor: ACC, color: BG }}
          >
            無料で投稿する →
          </Link>
          <Link
            href="/feed"
            className="w-full sm:w-auto text-sm px-7 py-2.5 rounded transition-colors"
            style={{ border: `1px solid ${BOR}`, color: TXTS }}
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
          <div className="text-center py-16 rounded-xl" style={{ border: `1px dashed ${BOR}` }}>
            <p className="text-sm mb-4" style={{ color: TXTS }}>まだ投稿がありません。最初の投稿者になりましょう！</p>
            <Link
              href="/post/new"
              className="text-sm font-semibold px-6 py-2.5 rounded transition-opacity hover:opacity-80"
              style={{ backgroundColor: ACC, color: BG }}
            >
              最初に投稿する →
            </Link>
          </div>
        )}
      </section>

      {/* Stats */}
      <section style={{ backgroundColor: SURF, borderTop: `1px solid ${BOR}`, borderBottom: `1px solid ${BOR}` }}>
        <div className="max-w-5xl mx-auto px-4 py-10 flex flex-wrap justify-center gap-x-16 gap-y-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center min-w-[90px]">
              <p className="text-3xl font-extrabold" style={{ color: ACC }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: TXTS }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-xl font-bold mb-10 pb-3" style={{ color: TXT, borderBottom: `1px solid ${BOR}` }}>
          rufuでできること
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: SURF, color: ACC, border: `1px solid ${BOR}` }}>
                {f.icon}
              </div>
              <h3 className="text-sm font-bold mb-1.5" style={{ color: TXT }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: TXTS }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ backgroundColor: SURF, borderTop: `1px solid ${BOR}`, borderBottom: `1px solid ${BOR}` }} className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-xl font-bold mb-10 pb-3" style={{ color: TXT, borderBottom: `1px solid ${BOR}` }}>
            使い方
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{ backgroundColor: ACC, color: BG }}>
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1" style={{ color: TXT }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: TXTS }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4" style={{ color: TXT }}>
          あなたのHTMLを、世界に流布しよう
        </h2>
        <p className="text-sm mb-8" style={{ color: TXTS }}>
          今すぐ無料で参加して、AIコミュニティの一員になりましょう。
        </p>
        <Link
          href="/post/new"
          className="inline-block font-semibold px-8 py-3 rounded transition-opacity hover:opacity-80 text-sm"
          style={{ backgroundColor: ACC, color: BG }}
        >
          投稿してみる →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${BOR}` }} className="py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold" style={{ color: ACC }}>rufu</span>
            <span className="text-xs" style={{ color: TXTS }}>流布</span>
          </div>
          <div className="flex items-center gap-5 text-xs" style={{ color: TXTS }}>
            <Link href="/feed" className="hover:text-white transition-colors">フィード</Link>
            <Link href="/ranking" className="hover:text-white transition-colors">ランキング</Link>
            <Link href="/search" className="hover:text-white transition-colors">検索</Link>
            <Link href="/post/new" className="hover:text-white transition-colors">投稿する</Link>
          </div>
          <p className="text-xs" style={{ color: TXTS }}>© 2026 rufu</p>
        </div>
      </footer>
    </div>
  );
}
