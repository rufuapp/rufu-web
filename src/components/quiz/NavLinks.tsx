'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/exams', label: '試験一覧' },
  { href: '/progress', label: '学習記録' },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="メイン" className="flex items-center gap-1 rounded-full bg-card/80 p-1 ring-1 ring-line">
      {LINKS.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? 'page' : undefined}
            className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-white"
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
