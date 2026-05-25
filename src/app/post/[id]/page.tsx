'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use, useState } from 'react';
import Header from '@/components/Header';
import { getPostById, POSTS } from '@/lib/posts';
import { getCommentsByPostId, type Comment } from '@/lib/comments';

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const post = getPostById(id);
  if (!post) notFound();

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const related = POSTS.filter(
    (p) => p.id !== post.id && p.tags.some((t) => post.tags.includes(t))
  ).slice(0, 3);

  const initialComments = getCommentsByPostId(id);
  const [comments, setComments] = useState(initialComments);
  const [commentInput, setCommentInput] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-5">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            フィード
          </Link>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-xs">{post.title}</span>
        </nav>

        <div className="flex gap-6 items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 mb-4 leading-snug">
              {post.title}
            </h1>

            {/* Author row */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: '#00782F' }}
              >
                {post.author.initial}
              </div>
              <div>
                <Link href={`/user/${post.author.name}`} className="text-sm font-medium text-gray-800 hover:text-[#00782F] transition-colors">
                  {post.author.name}
                </Link>
                <p className="text-xs text-gray-400">{post.createdAt}</p>
              </div>
              <button
                className="ml-auto text-xs font-medium px-3 py-1.5 rounded-full border border-[#00782F] text-[#00782F] hover:bg-[#00782F] hover:text-white transition-colors"
              >
                フォロー
              </button>
            </div>

            {/* Tags */}
            <div className="flex gap-2 flex-wrap mb-5">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?tag=${tag}`}
                  className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* HTML Preview iframe */}
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm mb-5">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-gray-400 font-mono">preview</span>
              </div>
              <iframe
                srcDoc={post.htmlContent}
                sandbox="allow-scripts"
                className="w-full"
                style={{ height: '480px', border: 'none' }}
                title={post.title}
              />
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-4 py-3 border-t border-b border-gray-200 mb-8">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  liked ? 'text-[#00782F]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <HeartIcon filled={liked} size={18} />
                {post.likes + (liked ? 1 : 0)}
              </button>
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  bookmarked ? 'text-[#00782F]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BookmarkIcon filled={bookmarked} size={18} />
                {post.bookmarks + (bookmarked ? 1 : 0)}
              </button>
              <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                <ShareIcon size={18} />
                シェア
              </button>
              <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors ml-auto">
                <ForkIcon size={18} />
                リミックス
              </button>
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">関連コンテンツ</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/post/${r.id}`}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow group"
                    >
                      <div className={`h-24 bg-gradient-to-br ${r.previewGradient}`} />
                      <div className="p-3">
                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-[#00782F] transition-colors">
                          {r.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{r.author.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Comments */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                コメント {comments.length > 0 && <span className="text-gray-400 font-normal">({comments.length})</span>}
              </h2>

              {/* Comment input */}
              <div className="flex gap-3 mb-6">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#00782F' }}>
                  あ
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="コメントを入力..."
                    rows={2}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#00782F]/30 focus:border-[#00782F] transition placeholder-gray-400"
                  />
                  {commentInput.trim() && (
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => {
                          setComments([
                            {
                              id: `new-${Date.now()}`,
                              postId: id,
                              author: { name: 'あなた', initial: 'あ' },
                              body: commentInput.trim(),
                              createdAt: 'たった今',
                              likes: 0,
                            },
                            ...comments,
                          ]);
                          setCommentInput('');
                        }}
                        className="text-sm font-medium text-white px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#00782F' }}
                      >
                        投稿
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Comment list */}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">まだコメントがありません。最初のコメントを投稿しましょう。</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                統計
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <EyeIcon size={13} /> 閲覧数
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {post.views.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <HeartIcon filled={false} size={13} /> いいね
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {post.likes + (liked ? 1 : 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <BookmarkIcon filled={false} size={13} /> ブックマーク
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {post.bookmarks + (bookmarked ? 1 : 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                HTMLを取得
              </h3>
              <button
                className="w-full text-sm font-medium text-white py-2 rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#00782F' }}
              >
                ダウンロード
              </button>
              <button className="w-full mt-2 text-sm font-medium text-gray-600 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                ソースを見る
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="flex gap-3">
      <Link href={`/user/${comment.author.name}`} className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#00782F' }}>
          {comment.author.initial}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <Link href={`/user/${comment.author.name}`} className="text-xs font-semibold text-gray-800 hover:text-[#00782F] transition-colors">
            {comment.author.name}
          </Link>
          <span className="text-xs text-gray-400">{comment.createdAt}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{comment.body}</p>
        <button
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-1 text-xs mt-1.5 transition-colors ${liked ? 'text-[#00782F]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <HeartIcon filled={liked} size={12} />
          {comment.likes + (liked ? 1 : 0)}
        </button>
      </div>
    </div>
  );
}

function HeartIcon({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function BookmarkIcon({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function EyeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ShareIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function ForkIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" />
      <path d="M6 9v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9" /><line x1="12" y1="12" x2="12" y2="15" />
    </svg>
  );
}
