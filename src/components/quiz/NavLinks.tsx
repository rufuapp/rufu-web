'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// sections: そのタブを選択中として表示するパス（資格対策は、資格・学習ガイド・問題集のページも含む）
const LINKS = [
  { href: '/trends', label: '最新の動向', sections: ['/trends'] },
  { href: '/tips', label: '技術 Tips', sections: ['/tips'] },
  { href: '/basics', label: '基礎知識', sections: ['/basics'] },
  { href: '/handson', label: 'やってみた', sections: ['/handson'] },
  { href: '/articles', label: '著者記事', sections: ['/articles'] },
  { href: '/exam', label: '資格対策', sections: ['/exam', '/certifications', '/study', '/question-sets'] },
  { href: '/progress', label: '学習記録', sections: ['/progress'] },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="メイン" className="-mx-4 overflow-x-auto border-t border-line sm:mx-0">
      {/* 狭い画面では折り返さず、横にスクロールできる1行にする */}
      <ul className="mx-auto flex w-max divide-x divide-line px-4 text-sm whitespace-nowrap sm:px-0">
        {LINKS.map((l) => {
          const active = l.sections.some((s) => pathname === s || pathname.startsWith(`${s}/`));
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className="block px-3 py-2 tracking-[0.08em] hover:text-brand sm:px-6 aria-[current=page]:font-bold aria-[current=page]:underline aria-[current=page]:underline-offset-[6px]"
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
