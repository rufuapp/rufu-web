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
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
            className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00782F]/30 focus:border-[#00782F] bg-white transition"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              !activeTag
                ? 'bg-[#00782F] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            すべて
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeTag === tag
                  ? 'bg-[#00782F] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'trend' | 'new')}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:border-[#00782F] transition"
        >
          <option value="trend">人気順</option>
          <option value="new">新着順</option>
        </select>
      </div>

      {/* Result count */}
      {!loading && (
        <p className="text-xs text-gray-400 mb-4">
          {query || activeTag ? <>{results.length}件ヒット</> : <>全{results.length}件</>}
        </p>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-36 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
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
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          {query ? (
            <>
              <p className="text-sm font-medium text-gray-700 mb-1">「{query}」の検索結果はありません</p>
              <p className="text-xs text-gray-400">別のキーワードやタグで試してみてください</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">まだ投稿がありません</p>
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
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
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
        <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#00782F] transition-colors leading-snug">
          {highlight(post.title, query)}
        </h2>
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
            style={{ backgroundColor: '#00782F' }}
          >
            {initial}
          </div>
          <span className="text-xs text-gray-500">{highlight(authorName, query)}</span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {post.post_tags.map((t) => (
            <span key={t.tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400">読み込み中...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
