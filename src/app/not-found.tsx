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
      <main id="main" className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <p className="text-sm tracking-[0.3em] text-muted">404</p>
        <h1 className="mt-3 text-2xl sm:text-3xl">お探しのページは見つかりませんでした</h1>
        <p className="mt-4 text-muted">URL が間違っているか、ページが移動した可能性があります。</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            トップへ戻る
          </Link>
          <Link href="/#question-sets" className="btn btn-outline">
            問題集一覧
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
