import type { AnswerRecord, QuizMode } from './types';

export const STORAGE_KEY = 'rufu-drill-progress-v1';
const MAX_SESSIONS = 100;

export type QuestionStat = {
  attempts: number;
  correct: number;
  /** 直近の解答が正解だったか */
  lastCorrect: boolean;
  lastAt: string;
};

export type SessionLog = {
  examId: string;
  mode: QuizMode;
  total: number;
  correct: number;
  at: string;
  /** 学習した日（ローカル日付 YYYY-MM-DD） */
  day: string;
};

export type Progress = {
  questions: Record<string, QuestionStat>;
  sessions: SessionLog[];
};

export const emptyProgress = (): Progress => ({ questions: {}, sessions: [] });

export function recordAnswer(p: Progress, a: AnswerRecord, at: string): Progress {
  const prev = p.questions[a.questionId] ?? { attempts: 0, correct: 0, lastCorrect: false, lastAt: at };
  return {
    ...p,
    questions: {
      ...p.questions,
      [a.questionId]: {
        attempts: prev.attempts + 1,
        correct: prev.correct + (a.correct ? 1 : 0),
        lastCorrect: a.correct,
        lastAt: at,
      },
    },
  };
}

export function recordSession(p: Progress, log: SessionLog): Progress {
  return { ...p, sessions: [log, ...p.sessions].slice(0, MAX_SESSIONS) };
}

/** 直近で間違えている問題 = 苦手問題 */
export function weakQuestionIds(p: Progress, candidateIds?: readonly string[]): string[] {
  const ids = candidateIds ?? Object.keys(p.questions);
  return ids.filter((id) => p.questions[id] && !p.questions[id].lastCorrect);
}

export type ExamStat = { answered: number; total: number; accuracy: number; weak: number };

export function examStat(p: Progress, questionIds: readonly string[]): ExamStat {
  let answered = 0;
  let attempts = 0;
  let correct = 0;
  let weak = 0;
  for (const id of questionIds) {
    const s = p.questions[id];
    if (!s) continue;
    answered += 1;
    attempts += s.attempts;
    correct += s.correct;
    if (!s.lastCorrect) weak += 1;
  }
  return { answered, total: questionIds.length, accuracy: attempts === 0 ? 0 : correct / attempts, weak };
}

/** 学習した日（ローカル日付）の連続日数。today を含む or 昨日まで続いていれば数える */
export function streakDays(p: Progress, today: string): number {
  const days = new Set(p.sessions.map((s) => s.day));
  const d = new Date(`${today}T00:00:00Z`);
  if (!days.has(today)) d.setUTCDate(d.getUTCDate() - 1);
  let n = 0;
  while (days.has(d.toISOString().slice(0, 10))) {
    n += 1;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return n;
}

export function parseProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress();
  try {
    const v = JSON.parse(raw) as Partial<Progress>;
    if (typeof v !== 'object' || v === null) return emptyProgress();
    return {
      questions: v.questions && typeof v.questions === 'object' ? v.questions : {},
      sessions: Array.isArray(v.sessions) ? v.sessions : [],
    };
  } catch {
    return emptyProgress();
  }
}

export function loadProgress(): Progress {
  try {
    return parseProgress(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(p: Progress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ストレージが使えない環境では記録しない
  }
}

export function localDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
