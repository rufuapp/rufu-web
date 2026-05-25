'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Header from '@/components/Header';
import { POSTS, type Post } from '@/lib/posts';

const ALL_TAGS = ['スライド', 'ダッシュボード', 'ビジュアライゼーション', 'ランディングページ', 'インフォグラフィック', 'ツール'];

function SearchResults() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [activeTag, setActiveTag] = useState('');
  const [sort, setSort] = useState<'trend' | 'new'>('trend');

  const results = POSTS.filter((p) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.author.name.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    const matchesTag = !activeTag || p.tags.includes(activeTag);
    return matchesQuery && matchesTag;
  }).sort((a, b) =>
    sort === 'trend' ? b.likes - a.likes : b.id.localeCompare(a.id)
  );

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
          {ALL_TAGS.map((tag) => (
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
      <p className="text-xs text-gray-400 mb-4">
        {query || activeTag ? (
          <>{results.length}件ヒット</>
        ) : (
          <>全{results.length}件</>
        )}
      </p>

      {/* Results */}
      {results.length > 0 ? (
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
          <p className="text-sm font-medium text-gray-700 mb-1">「{query}」の検索結果はありません</p>
          <p className="text-xs text-gray-400">別のキーワードやタグで試してみてください</p>
        </div>
      )}
    </main>
  );
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
    ) : part
  );
}

function SearchCard({ post, query }: { post: Post; query: string }) {
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
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#00782F] transition-colors leading-snug">
          {highlight(post.title, query)}
        </h2>
        <div className="flex items-center gap-2 mb-3">
          <Link
            href={`/user/${post.author.name}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 hover:underline"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ backgroundColor: '#00782F' }}
            >
              {post.author.initial}
            </div>
            <span className="text-xs text-gray-500">{highlight(post.author.name, query)}</span>
          </Link>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400">{post.createdAt}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {highlight(tag, query)}
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
