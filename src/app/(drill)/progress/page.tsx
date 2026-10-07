import type { Metadata } from 'next';
import { ProgressClient } from '@/components/quiz/ProgressClient';
import { Breadcrumb } from '@/components/quiz/ui';

export const metadata: Metadata = {
  title: '学習記録',
  description: '問題集ごとの正答率、連続学習日数、復習したい分野を確認できます。',
};

export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { label: '学習記録' }]} />
      <h1 className="mt-6 text-3xl">学習記録</h1>
      <p className="mt-3 text-muted">記録はこのブラウザにだけ保存されます。別の端末やブラウザとは共有されません。</p>
      <ProgressClient />
    </div>
  );
}
