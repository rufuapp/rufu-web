'use client';

import Link from 'next/link';
import { use, useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';

type DbPost = {
  id: string;
  title: string;
  likes_count: number;
  views_count: number;
  created_at: string;
  author_name: string | null;
  profiles: { name: string; display_name: string } | null;
  post_tags: { tag: string }[];
};

const PAGE_SIZE = 12;

const GRADIENTS = [
  'from-blue-400 to-purple-600', 'from-green-400 to-teal-600',
  'from-orange-400 to-red-600',  'from-pink-400 to-rose-600',
  'from-indigo-400 to-blue-600', 'from-yellow-400 to-orange-600',
  'from-teal-400 to-cyan-600',   'from-purple-400 to-pink-600',
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

export default function TagPage({ params }: { params: Promise<{ name: string }> }) {
  const { name: encodedName } = use(params);
  const tagName = decodeURIComponent(encodedName);

  const [posts, setPosts] = useState<DbPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchPage = async (pageNum: number, reset: boolean) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    const supabase = createClient();

    // 1. Get post IDs with this tag for the current page
    const { data: tagRows } = await supabase
      .from('post_tags')
      .select('post_id')
      .eq('tag', tagName)
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    const ids = (tagRows ?? []).map((r: { post_id: string }) => r.post_id);

    if (ids.length === 0) {
      setHasMore(false);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    // 2. Fetch the posts for those IDs
    const { data } = await supabase
      .from('posts')
      .select(`
        id, title, likes_count, views_count, created_at, author_name,
        profiles!posts_user_id_fkey ( name, display_name ),
        post_tags ( tag )
      `)
      .in('id', ids)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false });

    const newPosts = (data as unknown as DbPost[]) ?? [];
    setPosts((prev) => reset ? newPosts : [...prev, ...newPosts]);
    setHasMore(ids.length === PAGE_SIZE);
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    pageRef.current = 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPage(0, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagName]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
        const next = pageRef.current + 1;
        pageRef.current = next;
        fetchPage(next, false);
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, loading]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/feed" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: '#00782F' }}
            >
              #{tagName}
            </span>
            {!loading && (
              <span className="text-sm text-gray-400">{posts.length}件{hasMore ? '以上' : ''}</span>
            )}
          </div>
        </div>

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
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-sm text-gray-500 mb-4">「{tagName}」の投稿はまだありません</p>
            <Link
              href="/post/new"
              className="inline-block text-sm font-medium text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#00782F' }}
            >
              最初の投稿者になる
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => {
              const authorName = post.author_name ?? post.profiles?.display_name ?? post.profiles?.name ?? '不明';
              const initial = authorName[0]?.toUpperCase() ?? '?';
              const firstTag = post.post_tags[0]?.tag;
              return (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className={`h-36 bg-gradient-to-br ${gradientFor(post.id)} relative`}>
                    {firstTag && (
                      <div className="absolute top-2 right-2">
                        <span className="text-xs bg-black/25 text-white px-2.5 py-1 rounded-full backdrop-blur-sm font-medium">
                          {firstTag}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#00782F] transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: '#00782F' }}>
                        {initial}
                      </div>
                      <span className="text-xs text-gray-500 truncate">{authorName}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {post.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                        {post.views_count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Sentinel + loading more indicator */}
        <div ref={sentinelRef} className="py-6 flex justify-center">
          {loadingMore && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-200 border-t-[#00782F] rounded-full animate-spin" />
              読み込み中...
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <p className="text-xs text-gray-400">すべての投稿を表示しました</p>
          )}
        </div>
      </main>
    </div>
  );
}
