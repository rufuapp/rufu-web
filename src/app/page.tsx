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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#07080a', color: '#f0f0f2' }}>

      {/* Nav */}
      <nav className="sticky top-0 z-10 backdrop-blur-md" style={{ backgroundColor: 'rgba(7,8,10,0.85)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight" style={{ color: '#00e05a' }}>rufu</span>
            <span className="text-xs tracking-wider" style={{ color: '#444' }}>流布</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/feed" className="text-sm px-3 py-1.5 hidden sm:block transition-colors text-gray-500 hover:text-white">
              フィードを見る
            </Link>
            <Link
              href="/feed"
              className="text-sm font-semibold px-5 py-1.5 rounded-full transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#00e05a', color: '#07080a' }}
            >
              無料で始める
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* グリッドパターン */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        {/* グリーングロー */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div style={{
            width: '700px', height: '400px',
            background: 'radial-gradient(ellipse at center, rgba(0,224,90,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 tracking-wide"
            style={{ backgroundColor: 'rgba(0,224,90,0.1)', color: '#00e05a', border: '1px solid rgba(0,224,90,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#00e05a' }} />
            AI生成HTML専用プラットフォーム
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            AIが作ったHTMLを、<br />
            <span style={{ background: 'linear-gradient(90deg, #00e05a, #00c4a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              世界に流布
            </span>しよう
          </h1>

          <p className="text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: '#888' }}>
            ClaudeやChatGPTが生成したHTMLコンテンツを投稿・発見・共有できるコミュニティ。
            スライド、ダッシュボード、ビジュアライゼーション——あらゆるHTMLに居場所を。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/feed"
              className="w-full sm:w-auto text-sm font-bold px-8 py-3 rounded-full transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#00e05a', color: '#07080a' }}
            >
              無料で始める →
            </Link>
            <Link
              href="/feed"
              className="w-full sm:w-auto text-sm font-medium px-8 py-3 rounded-full transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#bbb' }}
            >
              フィードを見る
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
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
          <div className="text-center py-16 rounded-2xl" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
            <p className="text-sm mb-4" style={{ color: '#555' }}>まだ投稿がありません。最初の投稿者になりましょう！</p>
            <Link
              href="/post/new"
              className="text-sm font-semibold px-6 py-2.5 rounded-full transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#00e05a', color: '#07080a' }}
            >
              最初に投稿する →
            </Link>
          </div>
        )}
      </section>

      {/* Stats */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#0b0d0f' }}>
        <div className="max-w-4xl mx-auto px-4 py-14 flex flex-wrap justify-center gap-x-16 gap-y-10">
          {STATS.map((s) => (
            <div key={s.label} className="text-center min-w-[100px]">
              <p className="text-4xl font-extrabold" style={{ color: '#00e05a' }}>{s.value}</p>
              <p className="text-xs mt-2 tracking-widest uppercase" style={{ color: '#555' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-28">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-3">投稿・発見・反応を一気通貫で</h2>
          <p style={{ color: '#555' }}>HTMLネイティブ × コミュニティ性。この組み合わせは rufu だけ。</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl p-6" style={{ backgroundColor: '#0e1012', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: 'rgba(0,224,90,0.1)', color: '#00e05a', border: '1px solid rgba(0,224,90,0.15)' }}>
                {f.icon}
              </div>
              <h3 className="text-base font-bold mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-28" style={{ backgroundColor: '#0b0d0f' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-3">使い方はシンプル</h2>
            <p style={{ color: '#555' }}>AIとのチャットから投稿まで、最短30秒。</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-7 z-0"
                    style={{ left: 'calc(100% + 10px)', width: 'calc(100% - 20px)', height: '1px', background: 'linear-gradient(90deg, rgba(0,224,90,0.3), transparent)' }} />
                )}
                <div className="rounded-2xl p-6 relative z-10" style={{ backgroundColor: '#0e1012', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-4xl font-black" style={{ color: 'rgba(0,224,90,0.15)' }}>{step.num}</span>
                  <h3 className="text-base font-bold mt-3 mb-2">{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-28">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div style={{
            width: '600px', height: '300px',
            background: 'radial-gradient(ellipse at center, rgba(0,224,90,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }} />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
            あなたのHTMLを、<br />
            <span style={{ background: 'linear-gradient(90deg, #00e05a, #00c4a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              世界に流布しよう
            </span>
          </h2>
          <p className="mb-10 leading-relaxed" style={{ color: '#555' }}>
            今すぐ無料で参加して、AIコミュニティの一員になりましょう。
          </p>
          <Link
            href="/post/new"
            className="inline-block font-bold px-10 py-3.5 rounded-full transition-opacity hover:opacity-80 text-sm"
            style={{ backgroundColor: '#00e05a', color: '#07080a' }}
          >
            投稿してみる →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight" style={{ color: '#00e05a' }}>rufu</span>
            <span className="text-xs" style={{ color: '#333' }}>流布</span>
          </div>
          <div className="flex items-center gap-6 text-xs" style={{ color: '#444' }}>
            <Link href="/feed" className="hover:text-white transition-colors">フィード</Link>
            <Link href="/search" className="hover:text-white transition-colors">検索</Link>
            <Link href="/post/new" className="hover:text-white transition-colors">投稿する</Link>
          </div>
          <p className="text-xs" style={{ color: '#333' }}>© 2026 rufu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
