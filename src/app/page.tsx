'use client';

import { useState } from 'react';
import { POSTS, type Post } from '@/lib/posts';
import Header from '@/components/Header';
import Link from 'next/link';

const ALL_TAGS = ['すべて', 'スライド', 'ダッシュボード', 'ビジュアライゼーション', 'ランディングページ', 'インフォグラフィック'];
const TABS = ['トレンド', '新着', 'フォロー中'] as const;
type Tab = (typeof TABS)[number];

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<Tab>('トレンド');
  const [activeTag, setActiveTag] = useState('すべて');

  const filteredPosts = POSTS.filter(
    (p) => activeTag === 'すべて' || p.tags.includes(activeTag)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-5">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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
        <div className="flex gap-2 flex-wrap mb-6">
          {ALL_TAGS.map((tag) => (
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

        {/* Card grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-sm">このカテゴリにはまだ投稿がありません</p>
          </div>
        )}
      </main>
    </div>
  );
}


function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <article className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <Link href={`/post/${post.id}`} className="block">
        {/* Preview */}
        <div className={`h-40 bg-gradient-to-br ${post.previewGradient} relative`}>
          <PreviewIcon />
          <div className="absolute top-3 right-3">
            <span className="text-xs bg-black/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              {post.tags[0]}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3 group-hover:text-[#00782F] transition-colors leading-snug">
            {post.title}
          </h2>
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
              style={{ backgroundColor: '#00782F' }}
            >
              {post.author.initial}
            </div>
            <span className="text-xs text-gray-500 truncate">{post.author.name}</span>
            <span className="text-xs text-gray-300 flex-shrink-0">·</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{post.createdAt}</span>
          </div>
        </div>
      </Link>

      {/* Stats — outside Link to allow independent click */}
      <div className="flex items-center gap-3 px-4 pb-4 border-t border-gray-100 pt-3">
        <button
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-1 text-xs transition-colors ${
            liked ? 'text-[#00782F]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <HeartIcon filled={liked} />
          {post.likes + (liked ? 1 : 0)}
        </button>
        <button
          onClick={() => setBookmarked(!bookmarked)}
          className={`flex items-center gap-1 text-xs transition-colors ${
            bookmarked ? 'text-[#00782F]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <BookmarkIcon filled={bookmarked} />
          {post.bookmarks + (bookmarked ? 1 : 0)}
        </button>
        <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
          <EyeIcon />
          {post.views.toLocaleString()}
        </span>
      </div>
    </article>
  );
}

function PreviewIcon() {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-20">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="white">
        <rect x="8" y="6" width="48" height="36" rx="4" />
        <rect x="14" y="46" width="36" height="5" rx="2.5" />
        <rect x="22" y="51" width="20" height="5" rx="2.5" />
      </svg>
    </div>
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
