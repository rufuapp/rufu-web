import type { Metadata } from 'next';
import { ProgressClient } from '@/components/quiz/ProgressClient';

export const metadata: Metadata = {
  title: '学習記録',
  description: '試験別・分野別の正答率、連続学習日数、苦手問題を確認できます。',
};

export default function ProgressPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-4xl font-black tracking-tight">学習記録</h1>
      <p className="mt-3 text-muted">記録はこのブラウザにだけ保存されます（別の端末やブラウザとは共有されません）。</p>
      <ProgressClient />
    </div>
  );
}
