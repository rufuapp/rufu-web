import { vocabularyQuestions, wordSlug } from './vocabulary';
import type { VocabularyGroup, VocabularyWord } from './types';

const word = (en: string, pos: VocabularyWord['pos'], ja: string, extra: Partial<VocabularyWord> = {}): VocabularyWord => ({
  en,
  pos,
  ja,
  example: `Use ${en} here.`,
  exampleJa: `${ja}の例文。`,
  ...extra,
});

const groups: VocabularyGroup[] = [
  {
    id: 'a',
    name: 'A',
    words: [
      word('alpha', '動詞', 'アルファする'),
      word('beta', '動詞', 'ベータする', { avoid: ['gamma'] }),
      word('gamma', '動詞', 'ガンマする'),
      word('delta', '動詞', 'デルタする'),
      word('epsilon', '名詞', 'イプシロン'),
    ],
  },
  {
    id: 'b',
    name: 'B',
    words: [word('zeta', '動詞', 'ゼータする'), word('eta', '名詞', 'イータ'), word('theta', '形容詞', 'シータな'), word('iota', '名詞', 'イオタ')],
  },
];

describe('wordSlug', () => {
  it('小文字にして、英数字以外をハイフンにまとめる', () => {
    expect(wordSlug('human-in-the-loop')).toBe('human-in-the-loop');
    expect(wordSlug('PII')).toBe('pii');
    expect(wordSlug('regardless of')).toBe('regardless-of');
    expect(wordSlug(' cost-effective! ')).toBe('cost-effective');
  });
});

describe('vocabularyQuestions', () => {
  const qs = vocabularyQuestions('set', groups);
  const byId = (id: string) => qs.find((q) => q.id === id)!;

  it('1語につき1問、選択肢が重ならない 4 択の問題を作る', () => {
    expect(qs).toHaveLength(9);
    for (const q of qs) {
      expect(q.examId).toBe('set');
      expect(q.type).toBe('single');
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices).size).toBe(4);
    }
  });

  it('正解は語の意味で、例文を設問の英文にし、解説に訳を入れる', () => {
    const q = byId('voc-alpha');
    expect(q.domain).toBe('a');
    expect(q.choices[q.answer[0]]).toBe('アルファする');
    expect(q.passage).toBe('Use alpha here.');
    expect(q.explanation).toContain('アルファするの例文。');
  });

  it('誤答は、同じ分野の同じ品詞から優先して選ぶ', () => {
    const q = byId('voc-alpha');
    const wrong = q.choices.filter((_, i) => i !== q.answer[0]);
    expect([...wrong].sort()).toEqual(['ガンマする', 'デルタする', 'ベータする'].sort());
  });

  it('紛らわしい語として指定した語は、どちらの問題でも誤答に使わない', () => {
    expect(byId('voc-beta').choices).not.toContain('ガンマする');
    expect(byId('voc-gamma').choices).not.toContain('ベータする');
  });

  it('足りない分は、ほかの分野の同じ品詞から補う', () => {
    // 同じ分野で使える動詞は alpha と delta だけなので、残りはほかの分野の動詞 zeta になる
    expect(byId('voc-beta').choices).toContain('ゼータする');
  });

  it('何度作っても同じ問題になる', () => {
    expect(vocabularyQuestions('set', groups)).toEqual(qs);
  });
});
