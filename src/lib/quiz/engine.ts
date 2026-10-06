import type { AnswerRecord, Question, SessionQuestion, SessionResult } from './types';

export const PASS_RATE = 0.7;
export const MOCK_SECONDS_PER_QUESTION = 120;

/** 再現可能な乱数（mulberry32） */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type BuildOptions = {
  count: number;
  domains?: string[];
  onlyIds?: string[];
  seed: number;
};

export function buildSession(pool: readonly Question[], opts: BuildOptions): SessionQuestion[] {
  const rand = seededRandom(opts.seed);
  let filtered = pool;
  if (opts.domains && opts.domains.length > 0) {
    const set = new Set(opts.domains);
    filtered = filtered.filter((q) => set.has(q.domain));
  }
  if (opts.onlyIds) {
    const set = new Set(opts.onlyIds);
    filtered = filtered.filter((q) => set.has(q.id));
  }
  return shuffle(filtered, rand)
    .slice(0, Math.max(0, opts.count))
    .map((question) => ({
      question,
      order: shuffle(question.choices.map((_, i) => i), rand),
    }));
}

export function isCorrect(question: Question, selected: readonly number[]): boolean {
  if (selected.length !== question.answer.length) return false;
  const want = new Set(question.answer);
  return selected.every((i) => want.has(i)) && new Set(selected).size === selected.length;
}

export function scoreSession(answers: readonly AnswerRecord[], domainOrder: readonly string[] = []): SessionResult {
  const map = new Map<string, { correct: number; total: number }>();
  for (const d of domainOrder) map.set(d, { correct: 0, total: 0 });
  let correct = 0;
  for (const a of answers) {
    const s = map.get(a.domain) ?? { correct: 0, total: 0 };
    s.total += 1;
    if (a.correct) {
      s.correct += 1;
      correct += 1;
    }
    map.set(a.domain, s);
  }
  const total = answers.length;
  const rate = total === 0 ? 0 : correct / total;
  return {
    total,
    correct,
    rate,
    passed: total > 0 && rate >= PASS_RATE,
    byDomain: [...map.entries()]
      .filter(([, s]) => s.total > 0)
      .map(([domain, s]) => ({ domain, ...s })),
  };
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/** 日付（YYYY-MM-DD）から決まる「今日の1問」 */
export function pickDaily<T>(items: readonly T[], date: string): T | undefined {
  if (items.length === 0) return undefined;
  let h = 0;
  for (const c of date) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  return items[h % items.length];
}
