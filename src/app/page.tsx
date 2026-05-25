import Link from 'next/link';
import { POSTS } from '@/lib/posts';

const STATS = [
  { value: '1,200+', label: '投稿数' },
  { value: '480+', label: 'クリエイター' },
  { value: '45,000+', label: '月間閲覧数' },
  { value: '92%', label: 'Claude生成' },
];

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

const GALLERY_IDS = ['5', '8', '2', '3', '9', '1'];

export default function LandingPage() {
  const galleryPosts = GALLERY_IDS.map((id) => POSTS.find((p) => p.id === id)).filter(Boolean) as typeof POSTS;

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight" style={{ color: '#00782F' }}>rufu</span>
            <span className="text-xs text-gray-400 tracking-wider">流布</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/feed" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 hidden sm:block transition-colors">
              フィードを見る
            </Link>
            <Link href="/feed" className="text-sm font-medium text-white px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity" style={{ backgroundColor: '#00782F' }}>
              無料で始める
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-[#e8f3ec] text-[#00782F] text-xs font-semibold px-3 py-1.5 rounded-full mb-8 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00782F]" />
          AI生成HTML専用プラットフォーム
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
          AIが作ったHTMLを、<br />
          <span style={{ color: '#00782F' }}>世界に流布</span>しよう
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          ClaudeやChatGPTが生成したHTMLコンテンツを投稿・発見・共有できるコミュニティ。
          スライド、ダッシュボード、ビジュアライゼーション——あらゆるHTMLに居場所を。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/feed"
            className="w-full sm:w-auto text-sm font-semibold text-white px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#00782F' }}
          >
            無料で始める →
          </Link>
          <Link
            href="/feed"
            className="w-full sm:w-auto text-sm font-medium text-gray-700 px-8 py-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            フィードを見る
          </Link>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {galleryPosts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="group rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className={`h-32 sm:h-40 bg-gradient-to-br ${post.previewGradient} relative`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-15">
                  <svg width="48" height="48" viewBox="0 0 64 64" fill="white">
                    <rect x="8" y="6" width="48" height="36" rx="4" /><rect x="14" y="46" width="36" height="5" rx="2.5" /><rect x="22" y="51" width="20" height="5" rx="2.5" />
                  </svg>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="text-xs bg-black/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">{post.tags[0]}</span>
                </div>
              </div>
              <div className="bg-white px-3 py-2.5">
                <p className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-[#00782F] transition-colors">{post.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{post.author.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold" style={{ color: '#00782F' }}>{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">投稿・発見・反応を一気通貫で</h2>
          <p className="text-gray-500">HTMLネイティブ × コミュニティ性。この組み合わせは rufu だけ。</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {FEATURES.map((f) => (
            <div key={f.title} className="text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto sm:mx-0" style={{ backgroundColor: '#e8f3ec', color: '#00782F' }}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">使い方はシンプル</h2>
            <p className="text-gray-500">AIとのチャットから投稿まで、最短30秒。</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-full w-full h-px bg-gray-200 -translate-y-0 z-0" style={{ width: 'calc(100% - 3rem)', left: '100%' }} />
                )}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 relative z-10">
                  <span className="text-3xl font-black" style={{ color: '#e8f3ec' }}>{step.num}</span>
                  <h3 className="text-base font-bold text-gray-900 mt-2 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #003d18 0%, #00782F 100%)' }} className="py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            あなたのHTMLを、<br />世界に流布しよう
          </h2>
          <p className="text-green-200 mb-10 leading-relaxed">
            今すぐ無料で参加して、AIコミュニティの一員になりましょう。
          </p>
          <Link
            href="/post/new"
            className="inline-block bg-white font-bold px-10 py-3.5 rounded-full hover:opacity-90 transition-opacity text-sm"
            style={{ color: '#00782F' }}
          >
            投稿してみる →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight" style={{ color: '#00782F' }}>rufu</span>
            <span className="text-xs text-gray-400">流布</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/feed" className="hover:text-gray-600 transition-colors">フィード</Link>
            <Link href="/search" className="hover:text-gray-600 transition-colors">検索</Link>
            <Link href="/post/new" className="hover:text-gray-600 transition-colors">投稿する</Link>
          </div>
          <p className="text-xs text-gray-400">© 2025 rufu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
