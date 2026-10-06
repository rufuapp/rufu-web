import Link from 'next/link';

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-20 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(12,31,18,0.9)', borderBottom: '1px solid var(--bor)' }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg font-serif text-lg font-extrabold"
            style={{ backgroundColor: 'var(--surf2)', color: 'var(--acc)' }}
          >
            r
          </span>
          <span>rufu</span>
          <span className="hidden text-xs font-medium sm:inline" style={{ color: 'var(--txts)' }}>
            資格ドリル
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/exams" className="rounded-lg px-3 py-1.5 hover:bg-white/5">
            試験一覧
          </Link>
          <Link href="/progress" className="rounded-lg px-3 py-1.5 hover:bg-white/5">
            学習記録
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto" style={{ borderTop: '1px solid var(--bor)' }}>
      <div className="mx-auto max-w-6xl space-y-3 px-4 py-8 text-xs leading-relaxed sm:px-6" style={{ color: 'var(--txts)' }}>
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
    </footer>
  );
}
