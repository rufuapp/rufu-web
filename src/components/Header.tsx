'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';

type AuthTab = 'login' | 'register';

const BG   = '#0c1f12';
const SURF = '#132a1a';
const BOR  = 'rgba(255,255,255,0.08)';
const ACC  = '#4ade80';
const TXT  = '#e8f5ec';
const TXTS = '#7aad8a';

export default function Header() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || user.is_anonymous) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnreadCount(0);
      return;
    }
    const supabase = createClient();
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)
      .then(({ count }) => setUnreadCount(count ?? 0));

    channelRef.current = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => setUnreadCount((c) => c + 1))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.new.read === true) {
            supabase.from('notifications').select('id', { count: 'exact', head: true })
              .eq('user_id', user.id).eq('read', false)
              .then(({ count }) => setUnreadCount(count ?? 0));
          }
        })
      .subscribe();

    return () => { channelRef.current?.unsubscribe(); };
  }, [user?.id]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const openAuth = (tab: AuthTab = 'login') => { setAuthTab(tab); setAuthOpen(true); };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      <header className="sticky top-0 z-10 backdrop-blur-md" style={{ backgroundColor: 'rgba(12,31,18,0.95)', borderBottom: `1px solid ${BOR}` }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-lg font-bold tracking-tight" style={{ color: ACC }}>rufu</span>
            <span className="text-xs tracking-wider hidden sm:inline" style={{ color: TXTS }}>流布</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TXTS }}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="検索..."
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-full transition"
                style={{ backgroundColor: SURF, border: `1px solid ${BOR}`, color: TXT, outline: 'none' }}
              />
            </div>
          </form>

          <nav className="flex items-center gap-1 flex-shrink-0 ml-auto">
            <Link href="/feed" className="text-sm px-3 py-1.5 transition-colors hidden sm:block" style={{ color: TXTS }}>フィード</Link>
            <Link href="/ranking" className="text-sm px-3 py-1.5 transition-colors hidden sm:block" style={{ color: TXTS }}>ランキング</Link>

            {user ? (
              user.is_anonymous ? (
                <>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: SURF, border: `1px solid ${BOR}` }} title="ゲスト">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={TXTS} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <button onClick={() => openAuth('register')} className="text-sm px-2 py-1.5 font-medium transition-colors" style={{ color: ACC }}>
                    アカウント登録
                  </button>
                </>
              ) : (
                <>
                  <Link href="/notifications" className="relative w-8 h-8 flex items-center justify-center transition-colors flex-shrink-0" style={{ color: TXTS }} title="通知">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 flex items-center justify-center text-[9px] font-bold rounded-full px-0.5" style={{ backgroundColor: ACC, color: BG }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href={`/user/${user.user_metadata?.name ?? user.email?.split('@')[0]}`}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: ACC, color: BG }}
                  >
                    {(user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
                  </Link>
                  <button onClick={handleSignOut} className="text-sm px-2 py-1.5 transition-colors" style={{ color: TXTS }}>
                    ログアウト
                  </button>
                </>
              )
            ) : (
              <button onClick={() => openAuth('login')} className="text-sm px-3 py-1.5 transition-colors" style={{ color: TXTS }}>
                ログイン
              </button>
            )}

            <Link
              href="/post/new"
              className="text-sm font-semibold px-4 py-1.5 rounded transition-opacity hover:opacity-80 ml-1"
              style={{ backgroundColor: ACC, color: BG }}
            >
              投稿する
            </Link>
          </nav>
        </div>
      </header>

      {authOpen && (
        <AuthModal tab={authTab} onTabChange={setAuthTab} onClose={() => setAuthOpen(false)} />
      )}
    </>
  );
}

function AuthModal({ tab, onTabChange, onClose }: { tab: AuthTab; onTabChange: (t: AuthTab) => void; onClose: () => void }) {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputStyle = { backgroundColor: SURF, border: `1px solid ${BOR}`, color: TXT, outline: 'none' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { name: username, full_name: username } } });
      if (error) { setError(error.message); setLoading(false); return; }
    }
    setLoading(false); setDone(true);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback` } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" style={{ backgroundColor: '#0e2516', border: `1px solid ${BOR}` }}>
        {done ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: SURF }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ACC} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ color: TXT }}>
              {tab === 'login' ? 'ログインしました' : 'アカウントを作成しました'}
            </h2>
            <p className="text-sm mb-6" style={{ color: TXTS }}>rufuへようこそ！</p>
            <button onClick={onClose} className="w-full py-2.5 text-sm font-semibold rounded-full hover:opacity-80 transition-opacity" style={{ backgroundColor: ACC, color: BG }}>
              閉じる
            </button>
          </div>
        ) : (
          <>
            <div className="flex" style={{ borderBottom: `1px solid ${BOR}` }}>
              {(['login', 'register'] as AuthTab[]).map((t) => (
                <button key={t} onClick={() => onTabChange(t)}
                  className="flex-1 py-3.5 text-sm font-medium transition-colors"
                  style={{ color: tab === t ? ACC : TXTS, borderBottom: tab === t ? `2px solid ${ACC}` : '2px solid transparent' }}>
                  {t === 'login' ? 'ログイン' : '新規登録'}
                </button>
              ))}
              <button onClick={onClose} className="px-4 transition-colors" style={{ color: TXTS }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: TXTS }}>ユーザー名</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    placeholder="例: yamada_dev" required
                    className="w-full text-sm rounded-lg px-3 py-2.5 transition" style={inputStyle} />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: TXTS }}>メールアドレス</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full text-sm rounded-lg px-3 py-2.5 transition" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: TXTS }}>パスワード</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={8}
                  className="w-full text-sm rounded-lg px-3 py-2.5 transition" style={inputStyle} />
              </div>

              {tab === 'login' && (
                <div className="text-right">
                  <button type="button" className="text-xs hover:underline" style={{ color: ACC }}>パスワードを忘れた方</button>
                </div>
              )}

              {error && <p className="text-xs text-red-400 rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 text-sm font-semibold rounded-full hover:opacity-80 transition-opacity mt-2 disabled:opacity-50"
                style={{ backgroundColor: ACC, color: BG }}>
                {loading ? '処理中...' : tab === 'login' ? 'ログイン' : 'アカウントを作成'}
              </button>

              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full" style={{ borderTop: `1px solid ${BOR}` }} />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-xs" style={{ backgroundColor: '#0e2516', color: TXTS }}>または</span>
                </div>
              </div>

              <button type="button" onClick={handleGoogle}
                className="w-full py-2.5 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2"
                style={{ border: `1px solid ${BOR}`, color: TXT }}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Googleで続ける
              </button>

              <p className="text-center text-xs pt-1" style={{ color: TXTS }}>
                {tab === 'login' ? (
                  <>アカウントをお持ちでない方は{' '}
                    <button type="button" onClick={() => onTabChange('register')} className="hover:underline" style={{ color: ACC }}>新規登録</button>
                  </>
                ) : (
                  <>すでにアカウントをお持ちの方は{' '}
                    <button type="button" onClick={() => onTabChange('login')} className="hover:underline" style={{ color: ACC }}>ログイン</button>
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
