'use client';

import Link from 'next/link';
import { TRACKS } from '@/content/exams';
import { examStat } from '@/lib/quiz/progress';
import { useProgress } from '@/lib/quiz/store';
import type { Exam } from '@/lib/quiz/types';

type Props = { exams: Exam[]; questionIds: Record<string, string[]> };

export function ExamCards({ exams, questionIds }: Props) {
  const progress = useProgress();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => {
        const ids = questionIds[exam.id] ?? [];
        const stat = examStat(progress, ids);
        const accent = TRACKS[exam.track].accent;
        return (
          <Link
            key={exam.id}
            href={`/exams/${exam.id}`}
            className="group flex flex-col rounded-2xl p-5 transition-colors hover:border-white/20 theme-card"
          >
            <div className="mb-3 flex items-center justify-between gap-2 text-xs">
              <span className="font-bold tracking-wide" style={{ color: accent }}>
                {TRACKS[exam.track].name}
              </span>
              <span className="rounded-full px-2 py-0.5" style={{ backgroundColor: 'var(--surf2)', color: 'var(--txts)' }}>
                {exam.level}・{ids.length}問
              </span>
            </div>
            <h3 className="text-lg font-bold leading-snug group-hover:underline">{exam.shortTitle}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: 'var(--txts)' }}>
              {exam.summary}
            </p>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[11px]" style={{ color: 'var(--txts)' }}>
                <span>
                  {stat.answered > 0 ? `${stat.answered}/${stat.total} 問 解答済み` : '未挑戦'}
                </span>
                {stat.answered > 0 && <span>正答率 {Math.round(stat.accuracy * 100)}%</span>}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--surf2)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(stat.answered / Math.max(1, stat.total)) * 100}%`, backgroundColor: accent }}
                />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
