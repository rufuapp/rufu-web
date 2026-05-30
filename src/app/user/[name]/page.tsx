'use client';

import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';

type Profile = {
  id: string;
  name: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  followers_count: number;
  following_count: number;
  post_count: number;
  created_at: string;
};

type DbPost = {
  id: string;
  title: string;
  likes_count: number;
  views_count: number;
  created_at: string;
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

function formatJoinDate(iso: string) {
  return new Date(iso).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
}

function formatDate(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff === 0) return '今日';
  if (diff === 1) return '昨日';
  if (diff < 7) return `${diff}日前`;
  return new Date(iso).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
}

export default function UserPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const [profile, setProfile] = useState<Profile | null | 'loading'>('loading');
  const [userPosts, setUserPosts] = useState<DbPost[]>([]);
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.auth.getUser(),
      supabase.from('profiles').select('*').eq('name', name).single(),
    ]).then(async ([{ data: authData }, { data: profileData }]) => {
      if (!profileData) { setProfile(null); return; }
      setProfile(profileData as Profile);

      const uid = authData.user?.id;
      const isAnon = authData.user?.is_anonymous;

      if (uid && profileData.id === uid) {
        setIsOwnProfile(true);
      } else if (uid && !isAnon) {
        const { data: followRow } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', uid)
          .eq('following_id', profileData.id)
          .maybeSingle();
        setFollowing(!!followRow);
      }

      const { data: postsData } = await supabase
        .from('posts')
        .select('id, title, likes_count, views_count, created_at, post_tags(tag)')
        .eq('user_id', profileData.id)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });
      setUserPosts((postsData as unknown as DbPost[]) ?? []);
    });
  }, [name]);

  if (profile === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex gap-5">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/5" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-24 text-center">
          <p className="text-gray-500 text-sm mb-4">ユーザーが見つかりませんでした</p>
          <Link href="/feed" className="text-sm text-[#00782F] hover:underline">フィードに戻る</Link>
        </main>
      </div>
    );
  }

  const initial = (profile.display_name || profile.name)[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0"
              style={{ backgroundColor: '#00782F' }}
            >
              {initial}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{profile.display_name || profile.name}</h1>
                  <p className="text-sm text-gray-400">@{profile.name}</p>
                </div>
                {isOwnProfile ? (
                  <Link
                    href={`/user/${name}/edit`}
                    className="flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    編集
                  </Link>
                ) : (
                  <button
                    onClick={async () => {
                      if (typeof profile !== 'object' || !profile) return;
                      const supabase = createClient();
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user || user.is_anonymous) return;
                      const newFollowing = !following;
                      setFollowing(newFollowing);
                      if (newFollowing) {
                        const { error } = await supabase.from('follows').insert({ follower_id: user.id, following_id: profile.id });
                        if (error) setFollowing(!newFollowing);
                      } else {
                        const { error } = await supabase.from('follows').delete().match({ follower_id: user.id, following_id: profile.id });
                        if (error) setFollowing(!newFollowing);
                      }
                    }}
                    className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                      following
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'text-white hover:opacity-90'
                    }`}
                    style={following ? {} : { backgroundColor: '#00782F' }}
                  >
                    {following ? 'フォロー中' : 'フォロー'}
                  </button>
                )}
              </div>

              {profile.bio && (
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 mt-4">
                <span className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">
                    {(profile.followers_count + (following ? 1 : 0)).toLocaleString()}
                  </span>{' '}
                  フォロワー
                </span>
                <span className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">{profile.following_count.toLocaleString()}</span>{' '}
                  フォロー中
                </span>
                <span className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">{userPosts.length}</span> 投稿
                </span>
                <span className="text-sm text-gray-400">{formatJoinDate(profile.created_at)}に参加</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-5">
          {(['posts', 'likes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-[#00782F] text-[#00782F]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'posts' ? `投稿 (${userPosts.length})` : 'いいね'}
            </button>
          ))}
        </div>

        {activeTab === 'posts' && (
          userPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPosts.map((post) => <MiniPostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400 text-sm">
              まだ投稿がありません
            </div>
          )
        )}

        {activeTab === 'likes' && (
          <div className="text-center py-20 text-gray-400 text-sm">
            いいねした投稿はありません
          </div>
        )}
      </main>
    </div>
  );
}

function MiniPostCard({ post }: { post: DbPost }) {
  const firstTag = post.post_tags[0]?.tag;
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
      <div className="p-3">
        <h2 className="text-xs font-semibold text-gray-900 line-clamp-2 group-hover:text-[#00782F] transition-colors leading-snug mb-2">
          {post.title}
        </h2>
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
          <span className="ml-auto">{formatDate(post.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
