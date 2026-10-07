'use client';

import Link from 'next/link';
import { TRACKS } from '@/content/exams';
import { examStat } from '@/lib/quiz/progress';
import { useProgress } from '@/lib/quiz/store';
import type { Exam } from '@/lib/quiz/types';
import { tint } from './style';

type Props = { exams: Exam[]; questionIds: Record<string, string[]> };

export function ExamCards({ exams, questionIds }: Props) {
  const progress = useProgress();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => {
        const ids = questionIds[exam.id] ?? [];
        const stat = examStat(progress, ids);
        const accent = TRACKS[exam.track].accent;
        const started = stat.answered > 0;
        return (
          <Link
            key={exam.id}
            href={`/exams/${exam.id}`}
            className="group card flex flex-col p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="chip tint" style={tint(accent)}>
                <span className="size-1.5 rounded-full bg-current" />
                {TRACKS[exam.track].name}
              </span>
              <span className="text-xs text-muted">
                {exam.level}・{ids.length}問
              </span>
            </div>
            <h3 className="mt-5 text-lg leading-snug font-bold tracking-tight">{exam.shortTitle}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{exam.summary}</p>
            <div className="mt-6">
              <div className="mb-1.5 flex justify-between gap-2 text-xs text-muted">
                <span>{started ? `${stat.answered}/${stat.total} 問 解答済み` : '未挑戦'}</span>
                {started && <span className="tabular-nums">正答率 {Math.round(stat.accuracy * 100)}%</span>}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
                <div
                  className="bar-fill h-full rounded-full"
                  style={{ width: `${(stat.answered / Math.max(1, stat.total)) * 100}%`, backgroundColor: accent }}
                />
              </div>
            </div>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand">
              {started ? 'つづきを解く' : '解いてみる'}
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
