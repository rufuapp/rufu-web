import {
  STORAGE_KEY,
  emptyProgress,
  examStat,
  loadProgress,
  parseProgress,
  recordAnswer,
  recordSession,
  saveProgress,
  streakDays,
  weakQuestionIds,
  type SessionLog,
} from './progress';

const answer = (questionId: string, correct: boolean) => ({ questionId, domain: 'd', selected: [0], correct });
const session = (day: string): SessionLog => ({ examId: 'e', mode: 'practice', total: 1, correct: 1, at: `${day}T10:00:00Z`, day });

describe('recordAnswer', () => {
  it('解答回数・正解数・直近の正誤を更新する', () => {
    let p = emptyProgress();
    p = recordAnswer(p, answer('q1', false), 't1');
    p = recordAnswer(p, answer('q1', true), 't2');
    expect(p.questions.q1).toEqual({ attempts: 2, correct: 1, lastCorrect: true, lastAt: 't2' });
  });

  it('元のオブジェクトを変更しない', () => {
    const p = emptyProgress();
    recordAnswer(p, answer('q1', true), 't');
    expect(p.questions).toEqual({});
  });
});

describe('recordSession', () => {
  it('新しい順に先頭へ追加し、100 件までに制限する', () => {
    let p = emptyProgress();
    for (let i = 0; i < 105; i++) p = recordSession(p, { ...session('2026-10-01'), total: i });
    expect(p.sessions).toHaveLength(100);
    expect(p.sessions[0].total).toBe(104);
  });
});

describe('weakQuestionIds / examStat', () => {
  const p = [answer('a', true), answer('b', false), answer('c', true), answer('c', false)].reduce(
    (acc, a) => recordAnswer(acc, a, 't'),
    emptyProgress(),
  );

  it('直近で間違えた問題だけを返す', () => {
    expect(weakQuestionIds(p).sort()).toEqual(['b', 'c']);
  });

  it('候補 ID で絞り込める（未解答は含まない）', () => {
    expect(weakQuestionIds(p, ['a', 'b', 'z'])).toEqual(['b']);
  });

  it('試験ごとの集計', () => {
    expect(examStat(p, ['a', 'b', 'c', 'z'])).toEqual({ answered: 3, total: 4, accuracy: 0.5, weak: 2 });
  });

  it('未解答なら正答率 0', () => {
    expect(examStat(emptyProgress(), ['a']).accuracy).toBe(0);
  });
});

describe('streakDays', () => {
  it('今日を含む連続日数', () => {
    const p = { questions: {}, sessions: ['2026-10-06', '2026-10-05', '2026-10-04', '2026-10-01'].map(session) };
    expect(streakDays(p, '2026-10-06')).toBe(3);
  });

  it('今日まだ学習していなくても昨日まで続いていれば数える', () => {
    const p = { questions: {}, sessions: ['2026-10-05', '2026-10-04'].map(session) };
    expect(streakDays(p, '2026-10-06')).toBe(2);
  });

  it('月をまたいでも数える', () => {
    const p = { questions: {}, sessions: ['2026-10-01', '2026-09-30'].map(session) };
    expect(streakDays(p, '2026-10-01')).toBe(2);
  });

  it('途切れていれば 0', () => {
    const p = { questions: {}, sessions: ['2026-10-03'].map(session) };
    expect(streakDays(p, '2026-10-06')).toBe(0);
  });
});

describe('parseProgress', () => {
  it('壊れたデータは空の記録として扱う', () => {
    expect(parseProgress(null)).toEqual(emptyProgress());
    expect(parseProgress('{not json')).toEqual(emptyProgress());
    expect(parseProgress('null')).toEqual(emptyProgress());
    expect(parseProgress('{"questions":1,"sessions":"x"}')).toEqual(emptyProgress());
  });
});

describe('loadProgress / saveProgress', () => {
  beforeEach(() => window.localStorage.clear());

  it('保存したものを読み込める', () => {
    const p = recordAnswer(emptyProgress(), answer('q1', true), 't');
    saveProgress(p);
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(loadProgress()).toEqual(p);
  });

  it('ストレージが例外を投げても落ちない', () => {
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(loadProgress()).toEqual(emptyProgress());
    spy.mockRestore();
  });
});
