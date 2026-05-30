'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';

type BookmarkedPost = {
  id: string;
  title: string;
  likes_count: number;
  views_count: number;
  created_at: string;
  author_name: string | null;
  profiles: { name: string; display_name: string } | null;
  post_tags: { tag: string }[];
};

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

export default function BookmarksPage() {
  const [posts, setPosts] = useState<BookmarkedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      if (!uid || data.user?.is_anonymous) { setAuthed(false); setLoading(false); return; }
      setAuthed(true);

      const { data: bms } = await supabase
        .from('bookmarks')
        .select(`
          post_id,
          posts!bookmarks_post_id_fkey (
            id, title, likes_count, views_count, created_at, author_name,
            profiles!posts_user_id_fkey ( name, display_name ),
            post_tags ( tag )
          )
        `)
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      const parsed = (bms ?? [])
        .map((b: unknown) => {
          const row = b as { posts: BookmarkedPost | null };
          return row.posts;
        })
        .filter((p): p is BookmarkedPost => p !== null);

      setPosts(parsed);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="h-7 bg-gray-200 rounded w-40 mb-6 animate-pulse" />
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
        </main>
      </div>
    );
  }

  if (authed === false) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-32 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">ログインが必要です</p>
          <p className="text-xs text-gray-400 mb-6">ブックマークを見るにはアカウントにログインしてください</p>
          <Link
            href="/"
            className="inline-block text-sm font-medium text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#00782F' }}
          >
            トップへ戻る
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-lg font-bold text-gray-900 mb-6">
          ブックマーク
          {posts.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">{posts.length}件</span>
          )}
        </h1>

        {posts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-4">まだブックマークがありません</p>
            <Link
              href="/feed"
              className="inline-block text-sm font-medium text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#00782F' }}
            >
              フィードを見る
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
                      <span className="text-xs text-gray-300 flex-shrink-0">·</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(post.created_at)}</span>
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
      </main>
    </div>
  );
}
