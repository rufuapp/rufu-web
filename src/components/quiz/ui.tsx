import Link from 'next/link';
import { TRACKS } from '@/content/question-sets';
import type { Resource, TrackId } from '@/lib/quiz/types';

export function SectionTitle({ id, num, title, en }: { id?: string; num?: string; title: string; en?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b-2 border-ink pb-2">
      <h2 id={id} className="text-xl sm:text-2xl">
        {num && <span className="mr-3 text-sm font-normal tracking-[0.2em] text-muted">{num}</span>}
        {title}
      </h2>
      {en && <span className="hidden text-xs tracking-[0.25em] text-muted uppercase sm:block">{en}</span>}
    </div>
  );
}

export function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-10 mb-3 border-l-4 border-ink pl-3 text-lg">{children}</h3>;
}

export function Breadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="パンくずリスト" className="text-xs text-muted">
      <ol className="flex flex-wrap items-center gap-x-2">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-x-2">
            {i > 0 && <span aria-hidden>›</span>}
            {it.href ? (
              <Link href={it.href} className="hover:text-ink hover:underline">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function TrackLabel({ track }: { track: TrackId }) {
  return (
    <span className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: TRACKS[track].accent }}>
      {TRACKS[track].name}
    </span>
  );
}

export function ExternalLink({ href, children, className = 'link' }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span aria-hidden className="ml-0.5 text-[0.8em]">↗</span>
      <span className="sr-only">（新しいタブで開きます）</span>
    </a>
  );
}

export function ResourceList({ resources }: { resources: Resource[] }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {resources.map((r) => (
        <li key={r.url} className="flex flex-col items-start gap-1 py-3">
          <span className="tag text-muted">{r.kind}</span>
          <span>
            <ExternalLink href={r.url}>{r.title}</ExternalLink>
            {r.note && <span className="block text-sm text-muted">{r.note}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
