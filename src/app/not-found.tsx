import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/quiz/SiteChrome';

export const metadata: Metadata = {
  title: 'ページが見つかりません',
};

export default function NotFound() {
  return (
    <div className="drill flex flex-1 flex-col">
      <SiteHeader />
      <main id="main" className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-sm font-semibold text-brand">404</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">ページが見つかりません</h1>
        <p className="mt-4 text-muted">URL が間違っているか、ページが移動した可能性があります。</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            トップへ
          </Link>
          <Link href="/exams" className="btn btn-secondary">
            試験一覧
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
