import { TRACKS } from '@/content/question-sets';
import { ExternalLink } from '@/components/quiz/ui';
import { TREND_SOURCES } from '@/lib/trends/fetch';
import type { TrendItem } from '@/lib/trends/parse';

/** 公式の発表の一覧（日付・情報源・原文の見出し） */
export function TrendList({ items, showSource = true }: { items: TrendItem[]; showSource?: boolean }) {
  if (items.length === 0) {
    return <p className="text-muted">いまは公式の発表を取得できませんでした。時間をおいて開き直してください。</p>;
  }
  return (
    <ol className="divide-y divide-line border-y border-ink">
      {items.map((it) => {
        const src = TREND_SOURCES[it.source];
        return (
          <li key={it.url} className="grid gap-x-6 gap-y-1 py-3 sm:grid-cols-[6.5rem_1fr]">
            <p className="text-sm text-muted tabular-nums">
              <time dateTime={it.date}>{it.date.replaceAll('-', '.')}</time>
            </p>
            <div>
              {showSource && (
                <p className="text-xs font-bold tracking-[0.1em]" style={{ color: TRACKS[src.track].accent }}>
                  {src.name}
                </p>
              )}
              <p lang="en" className="mt-0.5 leading-relaxed break-words">
                <ExternalLink href={it.url}>{it.title}</ExternalLink>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
