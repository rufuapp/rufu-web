'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';

type Notification = {
  id: string;
  type: 'like' | 'comment' | 'follow';
  read: boolean;
  created_at: string;
  post_id: string | null;
  comment_id: string | null;
  actor: { name: string; display_name: string } | null;
  post: { title: string } | null;
  comment: { body: string } | null;
};

function formatDate(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return 'たった今';
  if (diff < 60) return `${diff}分前`;
  if (diff < 1440) return `${Math.floor(diff / 60)}時間前`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}日前`;
  return new Date(iso).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
}

function NotificationIcon({ type }: { type: Notification['type'] }) {
  if (type === 'like') {
    return (
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500 flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </span>
    );
  }
  if (type === 'comment') {
    return (
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-[#00782F] flex-shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    </span>
  );
}

function notificationText(n: Notification): string {
  const actor = n.actor?.display_name ?? n.actor?.name ?? '誰か';
  if (n.type === 'like') return `${actor} さんがあなたの投稿にいいねしました`;
  if (n.type === 'comment') return `${actor} さんがあなたの投稿にコメントしました`;
  return `${actor} さんがあなたをフォローしました`;
}

function notificationHref(n: Notification): string {
  if (n.type === 'follow' && n.actor?.name) return `/user/${n.actor.name}`;
  if (n.post_id) return `/post/${n.post_id}`;
  return '/notifications';
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setCurrentUserId(uid);
      if (!uid || data.user?.is_anonymous) return;

      const { data: rows } = await supabase
        .from('notifications')
        .select(`
          id, type, read, created_at, post_id, comment_id,
          actor:profiles!notifications_actor_id_fkey ( name, display_name ),
          post:posts ( title ),
          comment:comments ( body )
        `)
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(50);

      setNotifications((rows as unknown as Notification[]) ?? []);

      // 取得後に未読を既読に更新
      const unreadIds = (rows ?? []).filter((r: { read: boolean }) => !r.read).map((r: { id: string }) => r.id);
      if (unreadIds.length > 0) {
        await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
      }
    });
  }, []);

  if (notifications === null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const isLoggedIn = currentUserId !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-lg font-bold text-gray-900 mb-5">通知</h1>

        {!isLoggedIn ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            ログインすると通知を確認できます
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            まだ通知はありません
          </div>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li key={n.id}>
                <Link
                  href={notificationHref(n)}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-colors hover:bg-gray-50 ${
                    n.read
                      ? 'bg-white border-gray-200'
                      : 'bg-white border-[#00782F]/30 shadow-sm'
                  }`}
                >
                  {!n.read && (
                    <span className="absolute mt-1.5 ml-[-8px] w-2 h-2 rounded-full bg-[#00782F]" />
                  )}
                  <NotificationIcon type={n.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{notificationText(n)}</p>
                    {n.type !== 'follow' && n.post?.title && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">「{n.post.title}」</p>
                    )}
                    {n.type === 'comment' && n.comment?.body && (
                      <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded px-2 py-1 line-clamp-2 border border-gray-100">
                        {n.comment.body}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{formatDate(n.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
