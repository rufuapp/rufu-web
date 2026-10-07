'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/#certifications', label: '資格一覧', section: '/certifications' },
  { href: '/#question-sets', label: '問題集', section: '/question-sets' },
  { href: '/#study', label: '学習ガイド', section: '/study' },
  { href: '/progress', label: '学習記録', section: '/progress' },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="メイン" className="border-t border-line">
      <ul className="flex flex-wrap justify-center divide-x divide-line text-sm">
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
