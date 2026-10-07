import Link from 'next/link';
import { NavLinks } from './NavLinks';

export function SiteHeader() {
  return (
    <header className="border-b-[3px] border-double border-ink">
      <a href="#main" className="btn btn-outline sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50">
        本文へ移動
      </a>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-center pt-6 pb-4 text-center">
          <p className="text-[11px] tracking-[0.35em] text-muted">DATABRICKS ・ CLAUDE</p>
          <Link href="/" className="mt-1 text-3xl font-bold tracking-[0.12em] sm:text-4xl">
            rufu 資格ドリル
          </Link>
          <p className="mt-1 text-xs tracking-[0.15em] text-muted">資格を知り、学び、問題で確かめる</p>
        </div>
        <NavLinks />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t-[3px] border-double border-ink">
      <div className="mx-auto max-w-5xl px-4 py-10 text-center text-xs leading-relaxed text-muted sm:px-6">
        <p className="text-sm font-bold tracking-[0.12em] text-ink">rufu 資格ドリル</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <li>
            <Link href="/#certifications" className="hover:underline">
              資格一覧
            </Link>
          </li>
          <li>
            <Link href="/#question-sets" className="hover:underline">
              問題集一覧
            </Link>
          </li>
          <li>
            <Link href="/#study" className="hover:underline">
              学習すべき内容
            </Link>
          </li>
          <li>
            <Link href="/progress" className="hover:underline">
              学習記録
            </Link>
          </li>
        </ul>
        <div className="mx-auto mt-6 max-w-3xl space-y-2 text-left sm:text-center">
          <p>
            rufu 資格ドリルは個人が運営する非公式の学習サイトです。Databricks, Inc. および Anthropic PBC とは関係ありません。問題集の問題はすべてオリジナルで、実際の試験問題ではありません。
          </p>
          <p>
            資格の情報は各社の公式ページをもとにまとめていますが、内容は変わることがあります。受験の前に、必ず公式の情報を確認してください。製品名・サービス名は各社の商標です。学習記録はお使いのブラウザにのみ保存されます。
          </p>
        </div>
        <p className="mt-6">© {new Date().getFullYear()} rufu</p>
      </div>
    </footer>
  );
}
