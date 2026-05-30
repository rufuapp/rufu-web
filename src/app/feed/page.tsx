'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';
import Link from 'next/link';

type DbPost = {
  id: string;
  title: string;
  html_content: string;
  likes_count: number;
  bookmarks_count: number;
  views_count: number;
  created_at: string;
  author_name: string | null;
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

async function ensureAuth(supabase: ReturnType<typeof createClient>): Promise<string | null> {
  let { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const { data } = await supabase.auth.signInAnonymously();
    if (!data.user) return null;
    user = data.user;
  }
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
  if (!profile) {
    const name = `user_${user.id.replace(/-/g, '').substring(0, 8)}`;
    await supabase.from('profiles').insert({ id: user.id, name, display_name: name });
  }
  return user.id;
}

const PAGE_SIZE = 12;
const TABS = ['新着', 'トレンド', 'フォロー中'] as const;
type Tab = (typeof TABS)[number];

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<Tab>('新着');
  const [activeTag, setActiveTag] = useState('すべて');
  const [fetchedPosts, setFetchedPosts] = useState<DbPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isRealUser, setIsRealUser] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(0);
  const tabRef = useRef<Tab>('新着');
  const userIdRef = useRef<string | null>(null);
  const isRealUserRef = useRef(false);

  const fetchPosts = useCallback(async (pageNum: number, reset: boolean, tab: Tab) => {
    if (reset) {
      setLoading(true);
      setFetchedPosts([]);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }
    const supabase = createClient();
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    if (tab === 'フォロー中') {
      const uid = userIdRef.current;
      if (!uid || !isRealUserRef.current) {
        setFetchedPosts((prev) => reset ? [] : prev);
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        return;
      }
      const { data: followsData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', uid);
      const followingIds = (followsData ?? []).map((f: { following_id: string }) => f.following_id);
      if (followingIds.length === 0) {
        setFetchedPosts((prev) => reset ? [] : prev);
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        return;
      }
      const { data } = await supabase
        .from('posts')
        .select(`
          id, title, html_content, likes_count, bookmarks_count, views_count, created_at, author_name,
          profiles!posts_user_id_fkey ( name, display_name ),
          post_tags ( tag )
        `)
        .eq('visibility', 'public')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .range(from, to);
      const newPosts = (data as unknown as DbPost[]) ?? [];
      setFetchedPosts((prev) => reset ? newPosts : [...prev, ...newPosts]);
      setHasMore(newPosts.length === PAGE_SIZE);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    const orderCol = tab === 'トレンド' ? 'likes_count' : 'created_at';
    const { data } = await supabase
      .from('posts')
      .select(`
        id, title, html_content, likes_count, bookmarks_count, views_count, created_at, author_name,
        profiles!posts_user_id_fkey ( name, display_name ),
        post_tags ( tag )
      `)
      .eq('visibility', 'public')
      .order(orderCol, { ascending: false })
      .range(from, to);
    const newPosts = (data as unknown as DbPost[]) ?? [];
    setFetchedPosts((prev) => reset ? newPosts : [...prev, ...newPosts]);
    setHasMore(newPosts.length === PAGE_SIZE);
    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      const realUser = !!uid && !data.user?.is_anonymous;
      setCurrentUserId(uid);
      setIsRealUser(realUser);
      userIdRef.current = uid;
      isRealUserRef.current = realUser;
      if (uid) {
        const [{ data: likeData }, { data: bookmarkData }] = await Promise.all([
          supabase.from('likes').select('post_id').eq('user_id', uid),
          supabase.from('bookmarks').select('post_id').eq('user_id', uid),
        ]);
        setLikedIds(new Set(likeData?.map((r) => r.post_id) ?? []));
        setBookmarkedIds(new Set(bookmarkData?.map((r) => r.post_id) ?? []));
      }
      if (tabRef.current === 'フォロー中') {
        pageRef.current = 0;
        fetchPosts(0, true, 'フォロー中');
      }
    });
  }, [fetchPosts]);

  useEffect(() => {
    pageRef.current = 0;
    tabRef.current = activeTab;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts(0, true, activeTab);
  }, [activeTab, fetchPosts]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
        const next = pageRef.current + 1;
        pageRef.current = next;
        fetchPosts(next, false, tabRef.current);
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, loading, fetchPosts]);

  const allTags = ['すべて', ...Array.from(new Set(fetchedPosts.flatMap((p) => p.post_tags.map((t) => t.tag))))];
  const displayPosts = activeTag === 'すべて'
    ? fetchedPosts
    : fetchedPosts.filter((p) => p.post_tags.some((t) => t.tag === activeTag));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-5">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTag('すべて'); setActiveTab(tab); }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-[#00782F] text-[#00782F]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tag filters */}
        {!loading && allTags.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  activeTag === tag
                    ? 'bg-[#00782F] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

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
        ) : activeTab === 'フォロー中' && !isRealUser ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-sm mb-4">フォロー中の投稿を見るにはログインが必要です</p>
            <p className="text-xs text-gray-300">ユーザーページからフォローすると、その方の投稿がここに表示されます</p>
          </div>
        ) : displayPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                likedIds={likedIds}
                bookmarkedIds={bookmarkedIds}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-sm">
              {activeTab === 'フォロー中'
                ? 'フォロー中のユーザーの投稿がここに表示されます'
                : fetchedPosts.length === 0
                ? 'まだ投稿がありません。最初の投稿者になりましょう！'
                : 'このカテゴリにはまだ投稿がありません'}
            </p>
            {activeTab !== 'フォロー中' && (
              <Link
                href="/post/new"
                className="inline-block mt-4 text-sm font-medium text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#00782F' }}
              >
                投稿する
              </Link>
            )}
          </div>
        )}

        {/* Sentinel — infinite scroll trigger */}
        <div ref={sentinelRef} className="py-6 flex justify-center">
          {loadingMore && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-200 border-t-[#00782F] rounded-full animate-spin" />
              読み込み中...
            </div>
          )}
          {!loading && !loadingMore && !hasMore && fetchedPosts.length > 0 && (
            <p className="text-xs text-gray-400">すべての投稿を表示しました</p>
          )}
        </div>
      </main>
    </div>
  );
}

function PostCard({
  post,
  currentUserId,
  likedIds,
  bookmarkedIds,
}: {
  post: DbPost;
  currentUserId: string | null;
  likedIds: Set<string>;
  bookmarkedIds: Set<string>;
}) {
  // null = 親Set から派生、true/false = ユーザーが明示的にトグル済み
  const [localLiked, setLocalLiked] = useState<boolean | null>(null);
  const [localBookmarked, setLocalBookmarked] = useState<boolean | null>(null);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [bookmarkCount, setBookmarkCount] = useState(post.bookmarks_count);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  const liked = localLiked ?? likedIds.has(post.id);
  const bookmarked = localBookmarked ?? bookmarkedIds.has(post.id);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / 1200);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const authorName = post.author_name ?? post.profiles?.display_name ?? post.profiles?.name ?? '不明';
  const initial = authorName[0]?.toUpperCase() ?? '?';
  const gradient = gradientFor(post.id);
  const firstTag = post.post_tags[0]?.tag;

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
            <span className="text-xs text-gray-500 truncate">{authorName}</span>
            <span className="text-xs text-gray-300 flex-shrink-0">·</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(post.created_at)}</span>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-3 px-4 pt-2 pb-3 border-t border-gray-50">
        <button
          onClick={async () => {
            const newLiked = !liked;
            setLocalLiked(newLiked);
            setLikeCount((c) => newLiked ? c + 1 : c - 1);
            const supabase = createClient();
            const uid = currentUserId ?? await ensureAuth(supabase);
            if (!uid) { setLocalLiked(!newLiked); setLikeCount((c) => newLiked ? c - 1 : c + 1); return; }
            const { error } = newLiked
              ? await supabase.from('likes').insert({ user_id: uid, post_id: post.id })
              : await supabase.from('likes').delete().match({ user_id: uid, post_id: post.id });
            if (error) { setLocalLiked(!newLiked); setLikeCount((c) => newLiked ? c - 1 : c + 1); }
          }}
          className={`flex items-center gap-1 text-xs transition-colors ${
            liked ? 'text-[#00782F]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <HeartIcon filled={liked} />
          {likeCount}
        </button>
        <button
          onClick={async () => {
            const newBookmarked = !bookmarked;
            setLocalBookmarked(newBookmarked);
            setBookmarkCount((c) => newBookmarked ? c + 1 : c - 1);
            const supabase = createClient();
            const uid = currentUserId ?? await ensureAuth(supabase);
            if (!uid) { setLocalBookmarked(!newBookmarked); setBookmarkCount((c) => newBookmarked ? c - 1 : c + 1); return; }
            const { error } = newBookmarked
              ? await supabase.from('bookmarks').insert({ user_id: uid, post_id: post.id })
              : await supabase.from('bookmarks').delete().match({ user_id: uid, post_id: post.id });
            if (error) { setLocalBookmarked(!newBookmarked); setBookmarkCount((c) => newBookmarked ? c - 1 : c + 1); }
          }}
          className={`flex items-center gap-1 text-xs transition-colors ${
            bookmarked ? 'text-[#00782F]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <BookmarkIcon filled={bookmarked} />
          {bookmarkCount}
        </button>
        <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
          <EyeIcon />
          {post.views_count.toLocaleString()}
        </span>
      </div>
    </article>
  );
}


function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
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
