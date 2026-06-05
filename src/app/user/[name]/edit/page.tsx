'use client';

import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';

export default function EditProfilePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace('/'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, display_name, bio')
        .eq('id', data.user.id)
        .single();

      if (!profile || profile.name !== name) { router.replace(`/user/${name}`); return; }

      setDisplayName(profile.display_name ?? '');
      setBio(profile.bio ?? '');
      setLoading(false);
    });
  }, [name, router]);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const res = await fetch('/api/account', { method: 'DELETE' });
    if (!res.ok) {
      setDeleting(false);
      setShowDeleteModal(false);
      setError('退会処理に失敗しました。再度お試しください。');
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/');
  };

  const handleSave = async () => {
    if (!displayName.trim()) { setError('表示名は必須です'); return; }
    setSaving(true);
    setError('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim(), bio: bio.trim() })
      .eq('id', user.id);
    if (updateError) { setError('保存に失敗しました。再度お試しください。'); setSaving(false); return; }
    router.push(`/user/${name}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0c1f12' }}>
        <Header />
        <div className="max-w-lg mx-auto px-4 py-16 animate-pulse space-y-4">
          <div className="h-6 rounded w-1/3" style={{ backgroundColor: '#132a1a' }} />
          <div className="h-10 rounded" style={{ backgroundColor: '#132a1a' }} />
          <div className="h-24 rounded" style={{ backgroundColor: '#132a1a' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0c1f12' }}>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/user/${name}`} className="transition-colors" style={{ color: '#7aad8a' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold" style={{ color: '#e8f5ec' }}>プロフィールを編集</h1>
        </div>

        <div className="rounded-2xl p-6 space-y-5" style={{ backgroundColor: '#132a1a', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#7aad8a' }}>
              表示名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className="w-full text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/30 focus:border-[#4ade80] transition"
              style={{ backgroundColor: '#132a1a', border: '1px solid rgba(255,255,255,0.08)', color: '#e8f5ec' }}
            />
            <p className="text-xs mt-1 text-right" style={{ color: '#7aad8a' }}>{displayName.length}/50</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#7aad8a' }}>
              自己紹介
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={4}
              placeholder="あなたについて教えてください"
              className="w-full text-sm rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/30 focus:border-[#4ade80] transition resize-none"
              style={{ backgroundColor: '#132a1a', border: '1px solid rgba(255,255,255,0.08)', color: '#e8f5ec' }}
            />
            <p className="text-xs mt-1 text-right" style={{ color: '#7aad8a' }}>{bio.length}/200</p>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Link
              href={`/user/${name}`}
              className="flex-1 py-2.5 text-sm font-medium text-center rounded-full transition-colors"
              style={{ color: '#7aad8a', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              キャンセル
            </Link>
            <button
              onClick={handleSave}
              disabled={saving || !displayName.trim()}
              className="flex-1 py-2.5 text-sm font-medium rounded-full transition-opacity disabled:opacity-40 hover:opacity-90"
              style={{ backgroundColor: '#4ade80', color: '#0c1f12' }}
            >
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>

        {/* 危険ゾーン */}
        <div className="mt-6 rounded-2xl border border-red-900/40 p-6" style={{ backgroundColor: '#132a1a' }}>
          <h2 className="text-sm font-semibold text-red-500 mb-1">危険ゾーン</h2>
          <p className="text-xs mb-4" style={{ color: '#7aad8a' }}>アカウントを削除すると、投稿・コメント・いいねを含む全てのデータが完全に削除されます。この操作は取り消せません。</p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-sm font-medium text-red-400 border border-red-900/40 rounded-full px-4 py-2 hover:bg-red-500/10 transition-colors"
          >
            アカウントを削除する
          </button>
        </div>
      </main>

      {/* 退会確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-xl" style={{ backgroundColor: '#132a1a' }}>
            <h2 className="text-base font-bold mb-2" style={{ color: '#e8f5ec' }}>本当に退会しますか？</h2>
            <p className="text-xs mb-4" style={{ color: '#7aad8a' }}>
              全ての投稿・コメント・データが削除されます。確認のため <span className="font-semibold" style={{ color: '#e8f5ec' }}>「退会する」</span> と入力してください。
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="退会する"
              className="w-full text-sm rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition mb-4"
              style={{ backgroundColor: '#132a1a', border: '1px solid rgba(255,255,255,0.08)', color: '#e8f5ec' }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-medium rounded-full transition-colors"
                style={{ color: '#7aad8a', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== '退会する' || deleting}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors disabled:opacity-40"
              >
                {deleting ? '処理中...' : '退会する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
