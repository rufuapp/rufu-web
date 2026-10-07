import Link from 'next/link';
import { NavLinks } from './NavLinks';

export function LogoMark({ className = 'size-8 text-lg' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-[30%] bg-linear-to-br from-brand to-emerald-500 font-serif font-black text-white shadow-sm shadow-brand/30 ${className}`}
    >
      r
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/75 backdrop-blur-xl">
      <a href="#main" className="btn btn-secondary sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50">
        本文へスキップ
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg">
          <LogoMark />
          <span className="text-[15px] font-bold tracking-tight">rufu</span>
          <span className="chip hidden bg-subtle text-muted ring-1 ring-line sm:inline-flex">資格ドリル</span>
        </Link>
        <NavLinks />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-card/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_2fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg">
            <LogoMark className="size-7 text-base" />
            <span className="font-bold tracking-tight">rufu 資格ドリル</span>
          </Link>
          <p className="mt-3 text-sm text-muted">解いて、間違えて、受かる。</p>
        </div>
        <div className="space-y-3 text-xs leading-relaxed text-muted">
          <p>
            rufu 資格ドリルは個人が運営する非公式の学習サイトです。Databricks, Inc. および Anthropic PBC とは関係ありません。
            掲載している問題はすべて出題範囲を参考に作成したオリジナル問題で、実際の試験問題ではありません。
          </p>
          <p>
            試験の出題範囲・形式・合格基準は変わることがあります。受験前に必ず各社の公式の試験ガイドを確認してください。
            製品名・サービス名は各社の商標です。学習記録はお使いのブラウザにのみ保存されます。
          </p>
          <p>© {new Date().getFullYear()} rufu</p>
        </div>
      </div>
    </footer>
  );
}
