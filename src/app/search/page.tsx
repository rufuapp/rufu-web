'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';

type DbPost = {
  id: string;
  title: string;
  likes_count: number;
  views_count: number;
  created_at: string;
  profiles: { name: string; display_name: string } | null;
  post_tags: { tag: string }[];
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

function formatDate(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff === 0) return '今日';
  if (diff === 1) return '昨日';
  if (diff < 7) return `${diff}日前`;
  return new Date(iso).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-100 text-yellow-900 rounded-sm px-0.5 not-italic">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function SearchResults() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [activeTag, setActiveTag] = useState('');
  const [sort, setSort] = useState<'trend' | 'new'>('trend');
  const [allPosts, setAllPosts] = useState<DbPost[]>([]);
  const [loading, setLoading] = useState(true);

  // 全投稿を一度取得してクライアント側でフィルタ・ソート（MVPスケール向け）
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('posts')
      .select(`
        id, title, likes_count, views_count, created_at,
        profiles!posts_user_id_fkey ( name, display_name ),
        post_tags ( tag )
      `)
      .eq('visibility', 'public')
      .order('likes_count', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setAllPosts((data as unknown as DbPost[]) ?? []);
        setLoading(false);
      });
  }, []);

  const allTags = Array.from(new Set(allPosts.flatMap((p) => p.post_tags.map((t) => t.tag)))).sort();

  const filtered = useCallback(() => {
    const q = query.toLowerCase().trim();
    return allPosts
      .filter((p) => {
        const matchesQuery =
          !q ||
          p.title.toLowerCase().includes(q) ||
          (p.profiles?.name ?? '').toLowerCase().includes(q) ||
          p.post_tags.some((t) => t.tag.toLowerCase().includes(q));
        const matchesTag = !activeTag || p.post_tags.some((t) => t.tag === activeTag);
        return matchesQuery && matchesTag;
      })
      .sort((a, b) =>
        sort === 'trend'
          ? b.likes_count - a.likes_count
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [allPosts, query, activeTag, sort]);

  const results = filtered();

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      {/* Search input */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: '#7aad8a' }}
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="タイトル・タグ・作者で検索..."
            className="w-full pl-11 pr-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 transition"
            style={{
              backgroundColor: '#132a1a',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#e8f5ec',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: '#7aad8a' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTag('')}
            className="px-3 py-1 rounded-full text-sm transition-colors"
            style={!activeTag
              ? { backgroundColor: '#4ade80', color: '#0c1f12' }
              : { backgroundColor: '#132a1a', border: '1px solid rgba(255,255,255,0.08)', color: '#7aad8a' }}
          >
            すべて
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
              className="px-3 py-1 rounded-full text-sm transition-colors"
              style={activeTag === tag
                ? { backgroundColor: '#4ade80', color: '#0c1f12' }
                : { backgroundColor: '#132a1a', border: '1px solid rgba(255,255,255,0.08)', color: '#7aad8a' }}
            >
              {tag}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'trend' | 'new')}
          className="text-sm rounded-lg px-3 py-1.5 focus:outline-none transition"
          style={{
            backgroundColor: '#132a1a',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#7aad8a',
          }}
        >
          <option value="trend">人気順</option>
          <option value="new">新着順</option>
        </select>
      </div>

      {/* Result count */}
      {!loading && (
        <p className="text-xs mb-4" style={{ color: '#7aad8a' }}>
          {query || activeTag ? <>{results.length}件ヒット</> : <>全{results.length}件</>}
        </p>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden animate-pulse" style={{ backgroundColor: '#132a1a', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="h-36" style={{ backgroundColor: '#1a3a22' }} />
              <div className="p-4 space-y-2">
                <div className="h-4 rounded w-3/4" style={{ backgroundColor: '#1a3a22' }} />
                <div className="h-3 rounded w-1/2" style={{ backgroundColor: '#132a1a' }} />
              </div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((post) => (
            <SearchCard key={post.id} post={post} query={query} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#132a1a' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7aad8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          {query ? (
            <>
              <p className="text-sm font-medium mb-1" style={{ color: '#e8f5ec' }}>「{query}」の検索結果はありません</p>
              <p className="text-xs" style={{ color: '#7aad8a' }}>別のキーワードやタグで試してみてください</p>
            </>
          ) : (
            <p className="text-sm" style={{ color: '#7aad8a' }}>まだ投稿がありません</p>
          )}
        </div>
      )}
    </main>
  );
}

function SearchCard({ post, query }: { post: DbPost; query: string }) {
  const firstTag = post.post_tags[0]?.tag;
  const authorName = post.profiles?.display_name ?? post.profiles?.name ?? '不明';
  const initial = authorName[0]?.toUpperCase() ?? '?';

  return (
    <Link
      href={`/post/${post.id}`}
      className="rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
      style={{ backgroundColor: '#132a1a', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className={`h-36 bg-gradient-to-br ${gradientFor(post.id)} relative`}>
        {firstTag && (
          <div className="absolute top-2 right-2">
            <span className="text-xs bg-black/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              {firstTag}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h2 className="text-sm font-semibold line-clamp-2 mb-2 transition-colors leading-snug" style={{ color: '#e8f5ec' }}>
          {highlight(post.title, query)}
        </h2>
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{ backgroundColor: '#4ade80', color: '#0c1f12' }}
          >
            {initial}
          </div>
          <span className="text-xs" style={{ color: '#7aad8a' }}>{highlight(authorName, query)}</span>
          <span className="text-xs" style={{ color: '#7aad8a' }}>·</span>
          <span className="text-xs" style={{ color: '#7aad8a' }}>{formatDate(post.created_at)}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {post.post_tags.map((t) => (
            <span key={t.tag} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(74,222,128,0.1)', color: '#7aad8a' }}>
              {highlight(t.tag, query)}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0c1f12' }}>
      <Header />
      <Suspense fallback={<div className="p-8 text-center text-sm" style={{ color: '#7aad8a' }}>読み込み中...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
