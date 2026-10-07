'use client';

import Link from 'next/link';
import { TRACK_ORDER, certificationsForQuestionSet, questionSetsForTrack } from '@/content/catalog';
import { TRACKS } from '@/content/question-sets';
import { examStat } from '@/lib/quiz/progress';
import { useProgress } from '@/lib/quiz/store';

/** 問題集の一覧表（進み具合はブラウザの学習記録から表示する） */
export function QuestionSetTable({ questionIds }: { questionIds: Record<string, string[]> }) {
  const progress = useProgress();
  return (
    <div className="overflow-x-auto">
      <table className="ruled">
        <thead>
          <tr>
            <th scope="col">問題集</th>
            <th scope="col" className="hidden md:table-cell">
              関連する資格
            </th>
            <th scope="col">問題数</th>
            <th scope="col" className="hidden sm:table-cell">
              進み具合
            </th>
            <th scope="col">
              <span className="sr-only">操作</span>
            </th>
          </tr>
        </thead>
        {TRACK_ORDER.map((track) => (
          <tbody key={track}>
            <tr>
              <th scope="colgroup" colSpan={5} className="bg-subtle text-sm tracking-[0.18em]" style={{ color: TRACKS[track].accent }}>
                {TRACKS[track].name}
              </th>
            </tr>
            {questionSetsForTrack(track).map((s) => {
              const ids = questionIds[s.id] ?? [];
              const stat = examStat(progress, ids);
              return (
                <tr key={s.id}>
                  <td>
                    <Link href={`/question-sets/${s.id}`} className="link font-bold">
                      {s.title}
                    </Link>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{s.summary}</p>
                  </td>
                  <td className="hidden text-sm md:table-cell">
                    {certificationsForQuestionSet(s).map((c) => (
                      <Link key={c.id} href={`/certifications/${c.id}`} className="link block break-keep">
                        {c.nameJa}
                      </Link>
                    ))}
                  </td>
                  <td className="text-sm whitespace-nowrap tabular-nums">{ids.length}問</td>
                  <td className="hidden text-sm whitespace-nowrap sm:table-cell">
                    {stat.answered > 0 ? (
                      <>
                        {stat.answered}/{stat.total} 問
                        <span className="block text-xs text-muted">正答率 {Math.round(stat.accuracy * 100)}%</span>
                      </>
                    ) : (
                      <span className="text-muted">未挑戦</span>
                    )}
                  </td>
                  <td className="text-right">
                    <Link href={`/question-sets/${s.id}`} className="btn btn-outline px-3 py-1 text-sm">
                      解く
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
    </div>
  );
}
