'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';
import Link from 'next/link';

type RankingPost = {
  id: string;
  title: string;
  html_content: string;
  total_likes: number;
  bookmarks_count: number;
  views_count: number;
  created_at: string;
  author_name: string;
  period_likes: number;
  tags: string[];
};

type Period = 'week' | 'month';

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

const PAGE_SIZE = 20;

export default function RankingPage() {
  const [period, setPeriod] = useState<Period>('week');
  const [posts, setPosts] = useState<RankingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(0);
  const periodRef = useRef<Period>('week');

  const fetchPosts = useCallback(async (pageNum: number, reset: boolean, p: Period) => {
    if (reset) {
      setLoading(true);
      setPosts([]);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }
    const supabase = createClient();
    const { data } = await supabase.rpc('get_ranking_posts', {
      period: p,
      p_limit: PAGE_SIZE,
      p_offset: pageNum * PAGE_SIZE,
    });
    const newPosts = (data as RankingPost[]) ?? [];
    setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));
    setHasMore(newPosts.length === PAGE_SIZE);
    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    pageRef.current = 0;
    periodRef.current = period;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts(0, true, period);
  }, [period, fetchPosts]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
        const next = pageRef.current + 1;
        pageRef.current = next;
        fetchPosts(next, false, periodRef.current);
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, loading, fetchPosts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-5">
          {(['week', 'month'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                period === p
                  ? 'border-[#00782F] text-[#00782F]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {p === 'week' ? '週間' : '月間'}
            </button>
          ))}
        </div>

        {/* Card grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post, index) => (
              <RankCard key={post.id} post={post} rank={index + 1} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-sm">まだランキングデータがありません</p>
            <Link
              href="/post/new"
              className="inline-block mt-4 text-sm font-medium text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#00782F' }}
            >
              最初に投稿する
            </Link>
          </div>
        )}

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="py-6 flex justify-center">
          {loadingMore && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-200 border-t-[#00782F] rounded-full animate-spin" />
              読み込み中...
            </div>
          )}
          {!loading && !loadingMore && !hasMore && posts.length > 0 && (
            <p className="text-xs text-gray-400">すべての投稿を表示しました</p>
          )}
        </div>
      </main>
    </div>
  );
}

const RANK_BADGE: Record<number, { bg: string; color: string }> = {
  1: { bg: '#FFD700', color: '#7a4f00' },
  2: { bg: '#C0C0C0', color: '#3d3d3d' },
  3: { bg: '#CD7F32', color: '#3d1a00' },
};

function RankCard({ post, rank }: { post: RankingPost; rank: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const gradient = gradientFor(post.id);
  const initial = post.author_name[0]?.toUpperCase() ?? '?';
  const firstTag = post.tags[0];
  const badge = RANK_BADGE[rank] ?? { bg: '#6b7280', color: '#ffffff' };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / 1200);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <article className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
      <Link href={`/post/${post.id}`} className="block">
        <div ref={containerRef} className="relative overflow-hidden h-44">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
          {scale > 0 && post.html_content && (
            <iframe
              srcDoc={post.html_content}
              sandbox="allow-scripts"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '1200px',
                height: '600px',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                border: 'none',
                pointerEvents: 'none',
              }}
              title={post.title}
            />
          )}

          {/* Rank badge */}
          <div
            className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow"
            style={{ backgroundColor: badge.bg, color: badge.color }}
          >
            {rank}
          </div>

          {firstTag && (
            <div className="absolute top-3 right-3 z-10">
              <span className="text-xs bg-black/25 text-white px-2.5 py-1 rounded-full backdrop-blur-sm font-medium">
                {firstTag}
              </span>
            </div>
          )}
        </div>

        <div className="px-4 pt-3 pb-2">
          <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2.5 group-hover:text-[#00782F] transition-colors leading-snug">
            {post.title}
          </h2>
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
              style={{ backgroundColor: '#00782F' }}
            >
              {initial}
            </div>
            <span className="text-xs text-gray-500 truncate">{post.author_name}</span>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-3 px-4 pt-2 pb-3 border-t border-gray-50">
        <span className="flex items-center gap-1 text-xs font-semibold text-[#00782F]">
          <HeartIcon />
          {Number(post.period_likes).toLocaleString()}
          <span className="text-[11px] text-gray-400 font-normal ml-0.5">いいね</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
          <EyeIcon />
          {post.views_count.toLocaleString()}
        </span>
      </div>
    </article>
  );
}

function HeartIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
