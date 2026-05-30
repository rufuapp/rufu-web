'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';

type ReporterProfile = { name: string; display_name: string } | null;
type PosterProfile = { name: string; display_name: string } | null;

type Post = {
  id: string;
  title: string;
  visibility: string;
  reports_count: number;
  user_id: string;
  created_at: string;
  profiles: PosterProfile;
};

type Report = {
  id: string;
  post_id: string;
  reason: string | null;
  status: 'open' | 'resolved';
  admin_note: string | null;
  created_at: string;
  reporter_id: string | null;
  posts: Post | null;
  reporter: ReporterProfile;
};

type GroupedPost = {
  post: Post;
  reports: Report[];
  openCount: number;
};

type FilterStatus = 'all' | 'open' | 'resolved';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function VisibilityBadge({ visibility }: { visibility: string }) {
  const styles: Record<string, string> = {
    public: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    flagged: 'bg-red-50 text-red-700 border-red-200',
    limited: 'bg-amber-50 text-amber-700 border-amber-200',
    private: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const labels: Record<string, string> = {
    public: '公開',
    flagged: 'フラグ済み',
    limited: '限定公開',
    private: '非公開',
  };
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${styles[visibility] ?? styles.private}`}>
      {labels[visibility] ?? visibility}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === 'open' ? (
    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
      未対応
    </span>
  ) : (
    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
      解決済み
    </span>
  );
}

export default function AdminReportsPage() {
  const [authorized, setAuthorized] = useState<boolean | 'loading'>('loading');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('open');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setAuthorized(data.user?.email === 'sho24.noubeau@gmail.com');
    });
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/reports');
    if (res.ok) {
      const json = await res.json();
      setReports(json.reports ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (authorized === true) fetchReports();
  }, [authorized, fetchReports]);

  const handleRestore = async (postId: string) => {
    setActionLoading(`restore-${postId}`);
    await fetch(`/api/admin/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility: 'public', resolveReports: true }),
    });
    await fetchReports();
    setActionLoading(null);
  };

  const handleFlag = async (postId: string) => {
    setActionLoading(`flag-${postId}`);
    await fetch(`/api/admin/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility: 'flagged' }),
    });
    await fetchReports();
    setActionLoading(null);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('この投稿を完全に削除しますか？この操作は元に戻せません。')) return;
    setActionLoading(`delete-${postId}`);
    await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' });
    setReports((prev) => prev.filter((r) => r.post_id !== postId));
    setActionLoading(null);
  };

  const handleDismiss = async (postId: string) => {
    setActionLoading(`dismiss-${postId}`);
    await fetch(`/api/admin/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolveReports: true }),
    });
    await fetchReports();
    setActionLoading(null);
  };

  if (authorized === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-[#00782F] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <p className="text-sm font-semibold text-gray-700">アクセス権限がありません</p>
          <Link href="/feed" className="text-xs text-[#00782F] hover:underline">フィードに戻る</Link>
        </div>
      </div>
    );
  }

  // Group reports by post
  const grouped = Object.values(
    reports.reduce<Record<string, GroupedPost>>((acc, report) => {
      if (!report.posts) return acc;
      const pid = report.post_id;
      if (!acc[pid]) {
        acc[pid] = { post: report.posts, reports: [], openCount: 0 };
      }
      acc[pid].reports.push(report);
      if (report.status === 'open') acc[pid].openCount++;
      return acc;
    }, {}),
  ).sort((a, b) => b.openCount - a.openCount || b.reports.length - a.reports.length);

  const filtered = grouped.filter((g) => {
    if (filterStatus === 'open') return g.openCount > 0;
    if (filterStatus === 'resolved') return g.openCount === 0;
    return true;
  });

  const totalOpen = grouped.reduce((s, g) => s + g.openCount, 0);
  const flaggedPosts = grouped.filter((g) => g.post.visibility === 'flagged').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-gray-900">通報レビュー</h1>
            <p className="text-xs text-gray-400 mt-0.5">管理者専用ページ</p>
          </div>
          <button
            onClick={fetchReports}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <RefreshIcon size={13} />
            更新
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">未対応の通報</p>
            <p className="text-2xl font-bold text-orange-600">{totalOpen}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">フラグ付き投稿</p>
            <p className="text-2xl font-bold text-red-600">{flaggedPosts}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">通報のある投稿</p>
            <p className="text-2xl font-bold text-gray-800">{grouped.length}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-4">
          {(['open', 'all', 'resolved'] as FilterStatus[]).map((f) => {
            const labels: Record<FilterStatus, string> = { open: '未対応', all: 'すべて', resolved: '解決済み' };
            return (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  filterStatus === f
                    ? 'border-[#00782F] text-[#00782F]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {labels[f]}
              </button>
            );
          })}
        </div>

        {/* Report list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShieldIcon size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {filterStatus === 'open' ? '未対応の通報はありません' : '通報は見つかりませんでした'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(({ post, reports: postReports, openCount }) => {
              const isExpanded = expandedPostId === post.id;
              const posterName = post.profiles?.display_name ?? post.profiles?.name ?? '不明';
              const isActing = (key: string) => actionLoading === `${key}-${post.id}`;

              return (
                <div key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Post row */}
                  <div className="flex items-start gap-3 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <VisibilityBadge visibility={post.visibility} />
                        {openCount > 0 && (
                          <span className="text-xs font-semibold text-orange-600">
                            未対応 {openCount}件
                          </span>
                        )}
                        <span className="text-xs text-gray-400">通報合計 {postReports.length}件</span>
                      </div>

                      <Link
                        href={`/post/${post.id}`}
                        target="_blank"
                        className="text-sm font-semibold text-gray-900 hover:text-[#00782F] transition-colors line-clamp-1 block"
                      >
                        {post.title}
                        <ExternalLinkIcon size={11} className="inline ml-1 opacity-40" />
                      </Link>

                      <p className="text-xs text-gray-400 mt-0.5">
                        投稿者: {posterName} · {formatDate(post.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {post.visibility === 'flagged' ? (
                        <button
                          onClick={() => handleRestore(post.id)}
                          disabled={!!actionLoading}
                          className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                          {isActing('restore') ? '処理中...' : '投稿を復元'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFlag(post.id)}
                          disabled={!!actionLoading}
                          className="text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
                        >
                          {isActing('flag') ? '処理中...' : 'フラグ設定'}
                        </button>
                      )}
                      {openCount > 0 && (
                        <button
                          onClick={() => handleDismiss(post.id)}
                          disabled={!!actionLoading}
                          className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          {isActing('dismiss') ? '処理中...' : '通報を却下'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={!!actionLoading}
                        className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {isActing('delete') ? '削除中...' : '投稿を削除'}
                      </button>
                      <button
                        onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        title={isExpanded ? '折りたたむ' : '通報詳細を見る'}
                      >
                        <ChevronIcon size={16} open={isExpanded} />
                      </button>
                    </div>
                  </div>

                  {/* Report detail list */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50">
                      {postReports.map((r, idx) => {
                        const reporterName = r.reporter?.display_name ?? r.reporter?.name ?? '匿名';
                        return (
                          <div
                            key={r.id}
                            className={`flex items-start gap-3 px-4 py-3 ${idx < postReports.length - 1 ? 'border-b border-gray-100' : ''}`}
                          >
                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0 mt-0.5">
                              {reporterName[0]?.toUpperCase() ?? '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-medium text-gray-700">{reporterName}</span>
                                <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
                                <StatusBadge status={r.status} />
                              </div>
                              <p className="text-xs text-gray-600">
                                理由: <span className="font-medium">{r.reason ?? '理由なし'}</span>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function RefreshIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function ShieldIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ExternalLinkIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function ChevronIcon({ size = 14, open }: { size?: number; open: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
