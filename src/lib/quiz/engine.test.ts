import { buildSession, formatDuration, isCorrect, pickDaily, scoreSession, seededRandom, shuffle } from './engine';
import type { AnswerRecord, Question } from './types';

const q = (id: string, domain: string, answer: number[] = [0], type: Question['type'] = 'single'): Question => ({
  id,
  examId: 'e',
  domain,
  type,
  question: id,
  choices: ['a', 'b', 'c', 'd'],
  answer,
  explanation: '',
});

const pool = [q('1', 'x'), q('2', 'x'), q('3', 'y'), q('4', 'y'), q('5', 'z')];

describe('seededRandom / shuffle', () => {
  it('同じシードなら同じ順序になる', () => {
    expect(shuffle([1, 2, 3, 4, 5], seededRandom(42))).toEqual(shuffle([1, 2, 3, 4, 5], seededRandom(42)));
  });

  it('要素を失わない', () => {
    expect(shuffle([1, 2, 3, 4, 5], seededRandom(7)).sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('元の配列を変更しない', () => {
    const src = [1, 2, 3];
    shuffle(src, seededRandom(1));
    expect(src).toEqual([1, 2, 3]);
  });
});

describe('buildSession', () => {
  it('指定数だけ出題する', () => {
    expect(buildSession(pool, { count: 3, seed: 1 })).toHaveLength(3);
  });

  it('プールより多い数を指定しても全問まで', () => {
    expect(buildSession(pool, { count: 99, seed: 1 })).toHaveLength(5);
  });

  it('分野で絞り込める', () => {
    const s = buildSession(pool, { count: 10, domains: ['y'], seed: 1 });
    expect(s.map((x) => x.question.id).sort()).toEqual(['3', '4']);
  });

  it('ID で絞り込める', () => {
    const s = buildSession(pool, { count: 10, onlyIds: ['5', '1'], seed: 1 });
    expect(s.map((x) => x.question.id).sort()).toEqual(['1', '5']);
  });

  it('空の onlyIds なら 0 問', () => {
    expect(buildSession(pool, { count: 10, onlyIds: [], seed: 1 })).toHaveLength(0);
  });

  it('選択肢の並びは元インデックスの順列', () => {
    for (const s of buildSession(pool, { count: 5, seed: 3 })) {
      expect([...s.order].sort()).toEqual([0, 1, 2, 3]);
    }
  });
});

describe('isCorrect', () => {
  it('単一選択', () => {
    expect(isCorrect(q('a', 'x', [2]), [2])).toBe(true);
    expect(isCorrect(q('a', 'x', [2]), [1])).toBe(false);
  });

  it('複数選択は過不足なく選んだときだけ正解', () => {
    const m = q('m', 'x', [0, 2], 'multi');
    expect(isCorrect(m, [2, 0])).toBe(true);
    expect(isCorrect(m, [0])).toBe(false);
    expect(isCorrect(m, [0, 1, 2])).toBe(false);
    expect(isCorrect(m, [0, 0])).toBe(false);
  });
});

describe('scoreSession', () => {
  const ans = (domain: string, correct: boolean): AnswerRecord => ({ questionId: domain, domain, selected: [], correct });

  it('正答率と合否を計算する', () => {
    const r = scoreSession([ans('x', true), ans('x', true), ans('y', true), ans('y', false)]);
    expect(r).toMatchObject({ total: 4, correct: 3, rate: 0.75, passed: true });
  });

  it('70% 未満は不合格', () => {
    expect(scoreSession([ans('x', true), ans('x', false)]).passed).toBe(false);
  });

  it('0 問なら不合格・正答率 0', () => {
    expect(scoreSession([])).toMatchObject({ total: 0, rate: 0, passed: false });
  });

  it('分野別スコアは指定順で、出題のない分野は除く', () => {
    const r = scoreSession([ans('y', false), ans('x', true)], ['x', 'y', 'z']);
    expect(r.byDomain).toEqual([
      { domain: 'x', correct: 1, total: 1 },
      { domain: 'y', correct: 0, total: 1 },
    ]);
  });
});

describe('formatDuration', () => {
  it('分:秒で表示する', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(-3)).toBe('0:00');
  });
});

describe('pickDaily', () => {
  it('同じ日付なら同じ要素', () => {
    expect(pickDaily(pool, '2026-10-06')).toBe(pickDaily(pool, '2026-10-06'));
  });

  it('空配列なら undefined', () => {
    expect(pickDaily([], '2026-10-06')).toBeUndefined();
  });
});
