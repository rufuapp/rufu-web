'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/trends', label: '最新の動向', section: '/trends' },
  { href: '/tips', label: '技術 Tips', section: '/tips' },
  { href: '/#certifications', label: '資格一覧', section: '/certifications' },
  { href: '/#study', label: '学習ガイド', section: '/study' },
  { href: '/#question-sets', label: '問題集', section: '/question-sets' },
  { href: '/progress', label: '学習記録', section: '/progress' },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="メイン" className="-mx-4 overflow-x-auto border-t border-line sm:mx-0">
      {/* 狭い画面では折り返さず、横にスクロールできる1行にする */}
      <ul className="mx-auto flex w-max divide-x divide-line px-4 text-sm whitespace-nowrap sm:px-0">
        {LINKS.map((l) => {
          const active = pathname === l.section || pathname.startsWith(`${l.section}/`);
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
