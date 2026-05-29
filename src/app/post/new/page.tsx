'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useRef, useState } from 'react';
import Header from '@/components/Header';
import { getPostById } from '@/lib/posts';
import { createClient } from '@/lib/supabase/client';
import { checkContent } from '@/lib/content-filter';

const PRESET_TAGS = ['スライド', 'ダッシュボード', 'ビジュアライゼーション', 'ランディングページ', 'インフォグラフィック', 'ツール', 'ポートフォリオ', 'データ', 'AI', 'デザイン'];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: '公開', desc: '全員に表示' },
  { value: 'limited', label: '限定', desc: 'URLを知る人のみ' },
  { value: 'private', label: '非公開', desc: '自分のみ' },
] as const;

type Visibility = (typeof VISIBILITY_OPTIONS)[number]['value'];
type InputMode = 'paste' | 'upload';

const PLACEHOLDER_HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: #f9fafb;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <p>ここにHTMLを貼り付けるとプレビューが表示されます</p>
</body>
</html>`;

function NewPostForm() {
  const searchParams = useSearchParams();
  const remixId = searchParams.get('remix');
  const remixSource = remixId ? getPostById(remixId) : undefined;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<InputMode>('paste');
  const [title, setTitle] = useState(() => remixSource ? `【リミックス】${remixSource.title}` : '');
  const [html, setHtml] = useState(() => remixSource?.htmlContent ?? '');
  const [previewHtml, setPreviewHtml] = useState(() => remixSource?.htmlContent ?? PLACEHOLDER_HTML);
  const [tags, setTags] = useState<string[]>(() => remixSource ? remixSource.tags.slice(0, 5) : []);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [newPostId, setNewPostId] = useState('');
  const [fileName, setFileName] = useState('');

  const updatePreview = useCallback((value: string) => {
    setPreviewHtml(value.trim() ? value : PLACEHOLDER_HTML);
  }, []);

  const handleHtmlChange = (value: string) => {
    setHtml(value);
    updatePreview(value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setHtml(content);
      updatePreview(content);
      if (!title) {
        setTitle(file.name.replace(/\.html?$/, ''));
      }
    };
    reader.readAsText(file);
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const canSubmit = title.trim() && html.trim() && tags.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitError('');
    setSubmitting(true);

    const filterResult = checkContent(html);
    if (!filterResult.ok) {
      setSubmitError(filterResult.reason);
      setSubmitting(false);
      return;
    }

    const supabase = createClient();
    let { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error || !data.user) {
        setSubmitError('セッションの作成に失敗しました。再度お試しください。');
        setSubmitting(false);
        return;
      }
      user = data.user;
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: title.trim(),
        html_content: html,
        visibility,
        remix_source_id: remixSource ? null : null,
      })
      .select('id')
      .single();

    if (error || !post) {
      const isRateLimit =
        error?.code === 'P0001' && error?.message?.includes('rate_limit_exceeded');
      setSubmitError(
        isRateLimit
          ? '1時間に投稿できるのは5件までです。しばらく待ってから再試行してください。'
          : `投稿に失敗しました: ${error?.message ?? 'unknown error'}`
      );
      setSubmitting(false);
      return;
    }

    if (tags.length > 0) {
      await supabase.from('post_tags').insert(
        tags.map((tag) => ({ post_id: post.id, tag }))
      );
    }

    setNewPostId(post.id);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: '#e8f3ec' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00782F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">投稿が完了しました</h1>
          <p className="text-gray-500 text-sm mb-8">「{title}」を公開しました。</p>
          <div className="flex gap-3 justify-center">
            <Link
              href={newPostId ? `/post/${newPostId}` : '/feed'}
              className="px-5 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              投稿を見る
            </Link>
            <button
              onClick={() => { setSubmitted(false); setTitle(''); setHtml(''); setPreviewHtml(PLACEHOLDER_HTML); setTags([]); setFileName(''); setNewPostId(''); }}
              className="px-5 py-2 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#00782F' }}
            >
              続けて投稿する
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">新規投稿</h1>
        </div>

        <div className="flex gap-6 items-start">
          {/* Left: Form */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Remix attribution badge */}
            {remixSource && (
              <div className="flex items-center gap-3 bg-[#e8f3ec] border border-[#00782F]/20 rounded-xl px-4 py-3">
                <div className="flex-shrink-0" style={{ color: '#00782F' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" />
                    <path d="M6 9v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9" /><line x1="12" y1="12" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#00782F]">リミックス元</p>
                  <Link href={`/post/${remixSource.id}`} className="text-xs text-gray-600 hover:underline truncate block">
                    {remixSource.title} — by {remixSource.author.name}
                  </Link>
                </div>
              </div>
            )}

            {/* Title */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                タイトル <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: Q4 売上ダッシュボード"
                maxLength={100}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00782F]/30 focus:border-[#00782F] transition"
              />
              <p className="text-xs text-gray-400 mt-1.5 text-right">{title.length}/100</p>
            </section>

            {/* HTML input */}
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Mode tabs */}
              <div className="flex border-b border-gray-100">
                {(['paste', 'upload'] as InputMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setInputMode(mode)}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      inputMode === mode
                        ? 'text-[#00782F] border-b-2 border-[#00782F] -mb-px'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {mode === 'paste' ? 'HTMLを貼り付け' : 'ファイルをアップロード'}
                  </button>
                ))}
              </div>

              <div className="p-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  HTMLコンテンツ <span className="text-red-400">*</span>
                </label>

                {inputMode === 'paste' ? (
                  <textarea
                    value={html}
                    onChange={(e) => handleHtmlChange(e.target.value)}
                    placeholder={'<!DOCTYPE html>\n<html>\n  ...\n</html>'}
                    spellCheck={false}
                    className="w-full h-56 text-xs font-mono border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00782F]/30 focus:border-[#00782F] transition resize-none bg-gray-50"
                  />
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-56 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#00782F] hover:bg-[#00782F]/5 transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".html,.htm"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {fileName ? (
                      <>
                        <div className="w-10 h-10 rounded-full bg-[#e8f3ec] flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00782F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-700">{fileName}</p>
                        <p className="text-xs text-gray-400">クリックして別のファイルを選択</p>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500">クリックしてHTMLファイルを選択</p>
                        <p className="text-xs text-gray-400">.html / .htm</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Tags */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                タグ <span className="text-red-400">*</span>
                <span className="ml-2 font-normal text-gray-400 normal-case tracking-normal">最大5件</span>
              </label>

              {/* Selected tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: '#00782F' }}
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="opacity-70 hover:opacity-100 ml-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                ))}
                {tags.length < 5 && (
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="タグを入力してEnter"
                    className="text-xs border-0 outline-none text-gray-700 placeholder-gray-400 min-w-32"
                  />
                )}
              </div>

              {/* Preset tags */}
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    disabled={tags.length >= 5}
                    className="px-2.5 py-1 rounded-full text-xs border border-gray-200 text-gray-500 hover:border-[#00782F] hover:text-[#00782F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </section>

            {/* Visibility */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                公開設定
              </label>
              <div className="flex gap-3">
                {VISIBILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setVisibility(opt.value)}
                    className={`flex-1 py-2.5 px-3 rounded-lg border text-left transition-colors ${
                      visibility === opt.value
                        ? 'border-[#00782F] bg-[#e8f3ec]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className={`text-sm font-semibold ${visibility === opt.value ? 'text-[#00782F]' : 'text-gray-700'}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Submit */}
            {submitError && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{submitError}</p>
            )}
            <div className="flex gap-3">
              <Link
                href="/"
                className="flex-1 py-2.5 text-sm font-medium text-center text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </Link>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="flex-1 py-2.5 text-sm font-medium text-white rounded-full transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: '#00782F' }}
              >
                {submitting ? '投稿中...' : '投稿する'}
              </button>
            </div>
          </div>

          {/* Right: Live preview */}
          <div className="w-[420px] flex-shrink-0 hidden lg:block sticky top-20">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              プレビュー
            </p>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-gray-400 font-mono truncate max-w-48">
                  {title || 'preview'}
                </span>
              </div>
              <iframe
                srcDoc={previewHtml}
                sandbox="allow-scripts"
                className="w-full"
                style={{ height: '460px', border: 'none' }}
                title="プレビュー"
              />
            </div>
            {!canSubmit && (
              <ul className="mt-3 space-y-1">
                {!title.trim() && <li className="text-xs text-gray-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-300" />タイトルを入力してください</li>}
                {!html.trim() && <li className="text-xs text-gray-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-300" />HTMLを追加してください</li>}
                {tags.length === 0 && <li className="text-xs text-gray-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-300" />タグを1つ以上追加してください</li>}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewPostPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50"><div className="p-8 text-center text-sm text-gray-400">読み込み中...</div></div>}>
      <NewPostForm />
    </Suspense>
  );
}
