'use client';

import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { use, useState, useEffect } from 'react';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';

type DbPost = {
  id: string;
  user_id: string;
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

type DbComment = {
  id: string;
  body: string;
  likes_count: number;
  created_at: string;
  profiles: { name: string; display_name: string } | null;
};

function formatDate(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff === 0) return '今日';
  if (diff === 1) return '昨日';
  if (diff < 7) return `${diff}日前`;
  return new Date(iso).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<DbPost | null | 'loading'>('loading');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserInitial, setCurrentUserInitial] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [comments, setComments] = useState<DbComment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reported, setReported] = useState(false);
  const [copied, setCopied] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!presentationMode) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setPresentationMode(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [presentationMode]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setCurrentUserId(uid);
      if (uid) {
        const [{ data: profile }, { data: likeRow }, { data: bookmarkRow }, { data: commentLikeRows }] = await Promise.all([
          supabase.from('profiles').select('name, display_name').eq('id', uid).single(),
          supabase.from('likes').select('post_id').eq('user_id', uid).eq('post_id', id).maybeSingle(),
          supabase.from('bookmarks').select('post_id').eq('user_id', uid).eq('post_id', id).maybeSingle(),
          supabase.from('comment_likes').select('comment_id').eq('user_id', uid),
        ]);
        setCurrentUserInitial((profile?.display_name ?? profile?.name ?? 'U')[0].toUpperCase());
        setLiked(!!likeRow);
        setBookmarked(!!bookmarkRow);
        setLikedCommentIds(new Set(commentLikeRows?.map((r: { comment_id: string }) => r.comment_id) ?? []));
      }
    });
    supabase
      .from('posts')
      .select(`
        id, title, html_content, likes_count, bookmarks_count, views_count, created_at, user_id, author_name,
        profiles!posts_user_id_fkey ( name, display_name ),
        post_tags ( tag )
      `)
      .eq('id', id)
      .single()
      .then(({ data }) => {
        const p = data as unknown as DbPost | null;
        setPost(p ?? null);
        if (p) { setLikeCount(p.likes_count); setBookmarkCount(p.bookmarks_count); }
      });

    // 閲覧数をインクリメント（fire-and-forget）
    supabase.rpc('increment_views', { post_id: id });

    supabase
      .from('comments')
      .select('id, body, likes_count, created_at, profiles!comments_user_id_fkey(name, display_name)')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setComments((data as unknown as DbComment[]) ?? []);
      });
  }, [id]);

  useEffect(() => {
    if (!currentUserId || post === 'loading' || post === null) return;
    if (currentUserId === post.user_id) return;
    const supabase = createClient();
    supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', currentUserId)
      .eq('following_id', post.user_id)
      .maybeSingle()
      .then(({ data }) => setFollowed(!!data));
  }, [currentUserId, post]);

  const handleFollow = async () => {
    if (post === 'loading' || post === null || !currentUserId) return;
    const newFollowed = !followed;
    setFollowed(newFollowed);
    const supabase = createClient();
    const { error } = newFollowed
      ? await supabase.from('follows').insert({ follower_id: currentUserId, following_id: post.user_id })
      : await supabase.from('follows').delete().match({ follower_id: currentUserId, following_id: post.user_id });
    if (error) setFollowed(!newFollowed);
  };

  const handleLike = async () => {
    if (post === 'loading' || post === null) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => newLiked ? c + 1 : c - 1);
    const supabase = createClient();
    let uid = currentUserId;
    if (!uid) {
      const { data } = await supabase.auth.signInAnonymously();
      if (!data.user) { setLiked(!newLiked); setLikeCount((c) => newLiked ? c - 1 : c + 1); return; }
      uid = data.user.id;
      setCurrentUserId(uid);
      const name = `user_${uid.replace(/-/g, '').substring(0, 8)}`;
      await supabase.from('profiles').upsert({ id: uid, name, display_name: name }, { onConflict: 'id' });
    }
    const { error } = newLiked
      ? await supabase.from('likes').insert({ user_id: uid, post_id: id })
      : await supabase.from('likes').delete().match({ user_id: uid, post_id: id });
    if (error) { setLiked(!newLiked); setLikeCount((c) => newLiked ? c - 1 : c + 1); }
  };

  const handleBookmark = async () => {
    if (post === 'loading' || post === null) return;
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    setBookmarkCount((c) => newBookmarked ? c + 1 : c - 1);
    const supabase = createClient();
    let uid = currentUserId;
    if (!uid) {
      const { data } = await supabase.auth.signInAnonymously();
      if (!data.user) { setBookmarked(!newBookmarked); setBookmarkCount((c) => newBookmarked ? c - 1 : c + 1); return; }
      uid = data.user.id;
      setCurrentUserId(uid);
      const name = `user_${uid.replace(/-/g, '').substring(0, 8)}`;
      await supabase.from('profiles').upsert({ id: uid, name, display_name: name }, { onConflict: 'id' });
    }
    const { error } = newBookmarked
      ? await supabase.from('bookmarks').insert({ user_id: uid, post_id: id })
      : await supabase.from('bookmarks').delete().match({ user_id: uid, post_id: id });
    if (error) { setBookmarked(!newBookmarked); setBookmarkCount((c) => newBookmarked ? c - 1 : c + 1); }
  };

  const handleShare = async () => {
    if (post === 'loading' || post === null) return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // cancelled or not supported
    }
  };

  const handleReport = async (reason: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('reports').insert({
      post_id: id,
      reporter_id: user?.id ?? null,
      reason,
    });
    setReported(true);
    setReportOpen(false);
  };

  const handleDelete = async () => {
    if (!confirm('この投稿を削除しますか？この操作は元に戻せません。')) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      alert('削除に失敗しました');
      setDeleting(false);
      return;
    }
    router.push('/feed');
  };

  const handleCommentLike = async (commentId: string) => {
    if (!currentUserId) return;
    const isLiked = likedCommentIds.has(commentId);
    const next = new Set(likedCommentIds);
    isLiked ? next.delete(commentId) : next.add(commentId);
    setLikedCommentIds(next);
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, likes_count: c.likes_count + (isLiked ? -1 : 1) } : c
      )
    );
    const supabase = createClient();
    const { error } = isLiked
      ? await supabase.from('comment_likes').delete().match({ user_id: currentUserId, comment_id: commentId })
      : await supabase.from('comment_likes').insert({ user_id: currentUserId, comment_id: commentId });
    if (error) {
      setLikedCommentIds(likedCommentIds);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, likes_count: c.likes_count + (isLiked ? 1 : -1) } : c
        )
      );
    }
  };

  const handleComment = async () => {
    if (!commentBody.trim() || !currentUserId) return;
    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: id, user_id: currentUserId, body: commentBody.trim() })
      .select('id, body, likes_count, created_at, profiles!comments_user_id_fkey(name, display_name)')
      .single();
    if (!error && data) {
      setComments((prev) => [...prev, data as unknown as DbComment]);
      setCommentBody('');
    }
    setSubmitting(false);
  };

  if (post === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-6 bg-gray-200 rounded w-2/3" />
            <div className="h-80 bg-gray-200 rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (post === null) notFound();

  if (presentationMode) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-black/90 flex-shrink-0">
          <span className="text-white text-sm font-medium truncate max-w-lg">{post.title}</span>
          <button
            onClick={() => setPresentationMode(false)}
            className="text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded border border-gray-600 hover:border-gray-400 transition-colors flex-shrink-0 ml-4"
          >
            ESC で終了
          </button>
        </div>
        <iframe
          srcDoc={post.html_content}
          sandbox="allow-scripts"
          className="flex-1 w-full"
          style={{ border: 'none' }}
          title={post.title}
        />
      </div>
    );
  }

  const authorName = post.author_name ?? post.profiles?.display_name ?? post.profiles?.name ?? '不明';
  const initial = authorName[0]?.toUpperCase() ?? '?';
  const username = post.profiles?.name ?? '';
  const tags = post.post_tags.map((t) => t.tag);

  const related: DbPost[] = []; // 関連投稿は将来実装

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-5">
          <Link href="/feed" className="hover:text-gray-600 transition-colors">
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
                {initial}
              </div>
              <div>
                <Link href={`/user/${username}`} className="text-sm font-medium text-gray-800 hover:text-[#00782F] transition-colors">
                  {authorName}
                </Link>
                <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
              </div>
              {currentUserId !== post.user_id && (
                <button
                  onClick={handleFollow}
                  className={`ml-auto text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    followed
                      ? 'bg-[#00782F] border-[#00782F] text-white hover:bg-red-500 hover:border-red-500'
                      : 'border-[#00782F] text-[#00782F] hover:bg-[#00782F] hover:text-white'
                  }`}
                >
                  {followed ? 'フォロー中' : 'フォロー'}
                </button>
              )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* HTML Preview iframe */}
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm mb-5">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-gray-400 font-mono">preview</span>
                <button
                  onClick={() => setPresentationMode(true)}
                  className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#00782F] transition-colors font-medium"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                  </svg>
                  全画面プレゼン
                </button>
              </div>
              <iframe
                srcDoc={post.html_content}
                sandbox="allow-scripts"
                className="w-full"
                style={{ height: '480px', border: 'none' }}
                title={post.title}
              />
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-4 py-3 border-t border-b border-gray-200 mb-8">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  liked ? 'text-[#00782F]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <HeartIcon filled={liked} size={18} />
                {likeCount}
              </button>
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  bookmarked ? 'text-[#00782F]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BookmarkIcon filled={bookmarked} size={18} />
                {bookmarkCount}
              </button>
              <button
                onClick={handleShare}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  copied ? 'text-[#00782F]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ShareIcon size={18} />
                {copied ? 'コピー済み！' : 'シェア'}
              </button>
              <Link
                href={`/post/new?remix=${post.id}`}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#00782F] transition-colors ml-auto"
              >
                <ForkIcon size={18} />
                リミックス
              </Link>
              <button
                onClick={() => !reported && setReportOpen(true)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  reported
                    ? 'text-gray-300 cursor-default'
                    : 'text-gray-400 hover:text-red-400'
                }`}
              >
                <FlagIcon size={16} />
                {reported ? '報告済み' : '通報'}
              </button>
              {currentUserId && currentUserId === post.user_id && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  <TrashIcon size={18} />
                  {deleting ? '削除中...' : '削除'}
                </button>
              )}
            </div>

            {related.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">関連コンテンツ</h2>
              </section>
            )}

            {/* Comments */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                コメント
                {comments.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-400">{comments.length}件</span>
                )}
              </h2>

              {/* Comment list */}
              {comments.length > 0 ? (
                <ul className="space-y-4 mb-6">
                  {comments.map((c) => {
                    const name = c.profiles?.display_name ?? c.profiles?.name ?? '不明';
                    const initial = name[0]?.toUpperCase() ?? '?';
                    return (
                      <li key={c.id} className="flex gap-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: '#00782F' }}
                        >
                          {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-800">{name}</span>
                            <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-1">{c.body}</p>
                          <button
                            onClick={() => handleCommentLike(c.id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${likedCommentIds.has(c.id) ? 'text-[#00782F]' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill={likedCommentIds.has(c.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            {c.likes_count > 0 && c.likes_count}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 mb-6">まだコメントがありません。最初のコメントを書きましょう！</p>
              )}

              {/* Comment form */}
              {currentUserId ? (
                <div className="flex gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: '#00782F' }}
                  >
                    {currentUserInitial || 'U'}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleComment();
                      }}
                      placeholder="コメントを書く…"
                      rows={3}
                      className="w-full text-sm text-gray-900 border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#00782F]/30 focus:border-[#00782F] transition-colors placeholder:text-gray-400"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">⌘+Enter で送信</span>
                      <button
                        onClick={handleComment}
                        disabled={!commentBody.trim() || submitting}
                        className="text-xs font-semibold text-white px-4 py-1.5 rounded-full transition-opacity disabled:opacity-40"
                        style={{ backgroundColor: '#00782F' }}
                      >
                        {submitting ? '送信中…' : '送信'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-xs text-gray-400 mb-3">コメントするにはログインが必要です</p>
                  <Link
                    href="/auth/callback"
                    className="text-xs font-semibold text-white px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#00782F' }}
                  >
                    ログイン
                  </Link>
                </div>
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
                    {post.views_count.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <HeartIcon filled={false} size={13} /> いいね
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {likeCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <BookmarkIcon filled={false} size={13} /> ブックマーク
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {bookmarkCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                HTMLを取得
              </h3>
              <button
                onClick={() => {
                  const blob = new Blob([post.html_content], { type: 'text/html' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `${post.title}.html`;
                  a.click();
                }}
                className="w-full text-sm font-medium text-white py-2 rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#00782F' }}
              >
                ダウンロード
              </button>
              <button
                onClick={() => {
                  const win = window.open('', '_blank');
                  win?.document.write(post.html_content);
                }}
                className="w-full mt-2 text-sm font-medium text-gray-600 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                ソースを見る
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>

    {/* Report modal */}
    {reportOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={(e) => { if (e.target === e.currentTarget) setReportOpen(false); }}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-sm font-bold text-gray-900">この投稿を通報する</h2>
            <button onClick={() => setReportOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 px-5 mb-4">通報の理由を選んでください</p>
          <div className="px-5 pb-5 space-y-2">
            {['スパム・宣伝', '不適切なコンテンツ', '著作権侵害', 'その他'].map((reason) => (
              <button
                key={reason}
                onClick={() => handleReport(reason)}
                className="w-full text-left text-sm text-gray-700 px-4 py-2.5 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                {reason}
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
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

function TrashIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  );
}

function FlagIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}
