import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/quiz/SiteChrome';
import { ProgressClient } from '@/components/quiz/ProgressClient';

export const metadata: Metadata = {
  title: '学習記録',
  description: '試験別・分野別の正答率、連続学習日数、苦手問題を確認できます。',
};

export default function ProgressPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold">学習記録</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--txts)' }}>
          記録はこのブラウザにだけ保存されます（別の端末やブラウザとは共有されません）。
        </p>
        <ProgressClient />
      </main>
      <SiteFooter />
    </>
  );
}
