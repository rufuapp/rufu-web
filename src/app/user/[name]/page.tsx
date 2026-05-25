'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use, useState } from 'react';
import Header from '@/components/Header';
import { getUserByName } from '@/lib/users';
import { POSTS, type Post } from '@/lib/posts';

export default function UserPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const user = getUserByName(name);
  if (!user) notFound();

  const userPosts = POSTS.filter((p) => p.author.name === name);
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');

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
              {user.initial}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{user.displayName}</h1>
                  <p className="text-sm text-gray-400">@{user.name}</p>
                </div>
                <button
                  onClick={() => setFollowing(!following)}
                  className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                    following
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={following ? {} : { backgroundColor: '#00782F' }}
                >
                  {following ? 'フォロー中' : 'フォロー'}
                </button>
              </div>

              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{user.bio}</p>

              <div className="flex flex-wrap gap-4 mt-4">
                <span className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">{(user.followers + (following ? 1 : 0)).toLocaleString()}</span> フォロワー
                </span>
                <span className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">{user.following.toLocaleString()}</span> フォロー中
                </span>
                <span className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">{user.postCount}</span> 投稿
                </span>
                <span className="text-sm text-gray-400">{user.joinedAt}に参加</span>
              </div>

              <div className="flex gap-4 mt-3">
                {user.website && (
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#00782F] hover:underline">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    ウェブサイト
                  </a>
                )}
                {user.twitterHandle && (
                  <a href={`https://twitter.com/${user.twitterHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#00782F] hover:underline">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    @{user.twitterHandle}
                  </a>
                )}
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

        {/* Posts grid */}
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

function MiniPostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
    >
      <div className={`h-36 bg-gradient-to-br ${post.previewGradient} relative`}>
        <div className="absolute top-2 right-2">
          <span className="text-xs bg-black/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
            {post.tags[0]}
          </span>
        </div>
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
            {post.likes}
          </span>
          <span className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            {post.views.toLocaleString()}
          </span>
          <span className="ml-auto">{post.createdAt}</span>
        </div>
      </div>
    </Link>
  );
}
