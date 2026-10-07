import type { Question, VocabularyGroup, VocabularyWord } from './types';
import { seededRandom, shuffle } from './engine';

/** 問題 id に使う英単語の表記（例: "human-in-the-loop" → "human-in-the-loop"、"PII" → "pii"） */
export function wordSlug(en: string): string {
  return en
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193) >>> 0;
  return h;
}

function confusable(a: VocabularyWord, b: VocabularyWord): boolean {
  return (a.avoid ?? []).includes(b.en) || (b.avoid ?? []).includes(a.en);
}

/**
 * 誤答の選択肢を選ぶ。紛らわしい語は除き、
 * 同じ分野の同じ品詞 → ほかの分野の同じ品詞 → 同じ分野のほかの品詞 の順に候補にする。
 * 同じ語には毎回同じ選択肢が出るよう、語ごとに決まる乱数で並べる。
 */
function pickDistractors(word: VocabularyWord, group: VocabularyGroup, groups: VocabularyGroup[], count: number): string[] {
  const rand = seededRandom(hashString(word.en));
  const usable = (w: VocabularyWord) => w.en !== word.en && w.ja !== word.ja && !confusable(word, w);
  const others = groups.filter((g) => g.id !== group.id).flatMap((g) => g.words);
  const tiers = [
    group.words.filter((w) => usable(w) && w.pos === word.pos),
    others.filter((w) => usable(w) && w.pos === word.pos),
    group.words.filter((w) => usable(w) && w.pos !== word.pos),
  ];
  const picked: string[] = [];
  for (const tier of tiers) {
    for (const w of shuffle(tier, rand)) {
      if (!picked.includes(w.ja)) picked.push(w.ja);
      if (picked.length === count) return picked;
    }
  }
  return picked;
}

/** 単語帳から、例文の中の英単語の意味を問う 4 択の問題を作る */
export function vocabularyQuestions(setId: string, groups: VocabularyGroup[]): Question[] {
  return groups.flatMap((group) =>
    group.words.map((word): Question => {
      const wrong = pickDistractors(word, group, groups, 3);
      const at = hashString(`${word.en}:answer`) % (wrong.length + 1);
      return {
        id: `voc-${wordSlug(word.en)}`,
        examId: setId,
        domain: group.id,
        type: 'single',
        question: `次の英文の「${word.en}」の意味として、最も適切なものはどれか。`,
        passage: word.example,
        choices: [...wrong.slice(0, at), word.ja, ...wrong.slice(at)],
        answer: [at],
        explanation: `「${word.en}」は「${word.ja}」という意味です。${word.note ?? ''}例文の訳：${word.exampleJa}`,
      };
    }),
  );
}
