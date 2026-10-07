import { TRACKS } from '@/content/question-sets';
import { ExternalLink } from '@/components/quiz/ui';
import { TREND_SOURCES } from '@/lib/trends/sources';
import type { TrendEntry } from '@/lib/trends/parse';

/** 公式の発表の一覧（日付・情報源・日本語の見出しとまとめ・原文の見出し） */
export function TrendList({ items, showSource = true }: { items: TrendEntry[]; showSource?: boolean }) {
  if (items.length === 0) {
    return <p className="text-muted">まだ記事がありません。</p>;
  }
  return (
    <ol className="divide-y divide-line border-y border-ink">
      {items.map((it) => {
        const src = TREND_SOURCES[it.source];
        return (
          <li key={it.url} className="grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[6.5rem_1fr]">
            <p className="text-sm text-muted tabular-nums">
              <time dateTime={it.date}>{it.date.replaceAll('-', '.')}</time>
            </p>
            <article>
              {showSource && (
                <p className="text-xs font-bold tracking-[0.1em]" style={{ color: TRACKS[src.track].accent }}>
                  {src.name}
                </p>
              )}
              <h3 className="mt-0.5 leading-relaxed font-bold break-words">
                <ExternalLink href={it.url}>{it.titleJa}</ExternalLink>
              </h3>
              <p className="mt-1 text-sm leading-relaxed">{it.summaryJa}</p>
              {it.title !== it.titleJa && (
                <p lang="en" className="mt-1 text-xs break-words text-muted">
                  原題：{it.title}
                </p>
              )}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
