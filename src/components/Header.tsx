'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

type AuthTab = 'login' | 'register';

export default function Header() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const openAuth = (tab: AuthTab = 'login') => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl font-bold tracking-tight" style={{ color: '#00782F' }}>
              rufu
            </span>
            <span className="text-xs text-gray-400 font-normal tracking-wider">流布</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="タイトル・タグ・作者で検索..."
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00782F]/30 focus:bg-white border border-transparent focus:border-[#00782F]/30 transition"
              />
            </div>
          </form>

          <nav className="flex items-center gap-2 flex-shrink-0 ml-auto">
            <Link href="/feed" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 transition-colors hidden sm:block">
              フィード
            </Link>
            {user ? (
              <>
                <Link
                  href={`/user/${user.user_metadata?.name ?? user.email?.split('@')[0]}`}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: '#00782F' }}
                >
                  {(user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 transition-colors"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <button
                onClick={() => openAuth('login')}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 transition-colors"
              >
                ログイン
              </button>
            )}
            <Link
              href="/post/new"
              className="text-sm font-medium text-white px-4 py-1.5 rounded-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#00782F' }}
            >
              投稿する
            </Link>
          </nav>
        </div>
      </header>

      {/* Auth modal */}
      {authOpen && (
        <AuthModal
          tab={authTab}
          onTabChange={setAuthTab}
          onClose={() => setAuthOpen(false)}
        />
      )}
    </>
  );
}

function AuthModal({
  tab,
  onTabChange,
  onClose,
}: {
  tab: AuthTab;
  onTabChange: (t: AuthTab) => void;
  onClose: () => void;
}) {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: username, full_name: username } },
      });
      if (error) { setError(error.message); setLoading(false); return; }
    }
    setLoading(false);
    setDone(true);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {done ? (
          <div className="p-8 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#e8f3ec' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00782F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {tab === 'login' ? 'ログインしました' : 'アカウントを作成しました'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">rufuへようこそ！</p>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm font-medium text-white rounded-full hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#00782F' }}
            >
              閉じる
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {(['login', 'register'] as AuthTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onTabChange(t)}
                  className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                    tab === t
                      ? 'text-[#00782F] border-b-2 border-[#00782F] -mb-px'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t === 'login' ? 'ログイン' : '新規登録'}
                </button>
              ))}
              <button
                onClick={onClose}
                className="px-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">ユーザー名</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="例: yamada_dev"
                    required
                    className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00782F]/30 focus:border-[#00782F] transition"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">メールアドレス</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00782F]/30 focus:border-[#00782F] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00782F]/30 focus:border-[#00782F] transition"
                />
              </div>

              {tab === 'login' && (
                <div className="text-right">
                  <button type="button" className="text-xs text-[#00782F] hover:underline">
                    パスワードを忘れた方
                  </button>
                </div>
              )}

              {error && (
                <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-medium text-white rounded-full hover:opacity-90 transition-opacity mt-2 disabled:opacity-60"
                style={{ backgroundColor: '#00782F' }}
              >
                {loading ? '処理中...' : tab === 'login' ? 'ログイン' : 'アカウントを作成'}
              </button>

              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-xs text-gray-400 bg-white">または</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                className="w-full py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Googleで続ける
              </button>

              <p className="text-center text-xs text-gray-400 pt-1">
                {tab === 'login' ? (
                  <>アカウントをお持ちでない方は{' '}
                    <button type="button" onClick={() => onTabChange('register')} className="text-[#00782F] hover:underline">新規登録</button>
                  </>
                ) : (
                  <>すでにアカウントをお持ちの方は{' '}
                    <button type="button" onClick={() => onTabChange('login')} className="text-[#00782F] hover:underline">ログイン</button>
                  </>
                )}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
