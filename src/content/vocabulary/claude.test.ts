import { CLAUDE_VOCABULARY } from './claude';
import { wordSlug } from '@/lib/quiz/vocabulary';
import { questionsForExam } from '@/content/questions';

const words = CLAUDE_VOCABULARY.flatMap((g) => g.words);

describe('Claude の単語帳', () => {
  it('見出しの語・問題 id・意味が重複していない', () => {
    const lower = words.map((w) => w.en.toLowerCase());
    expect(new Set(lower).size).toBe(lower.length);
    const slugs = words.map((w) => wordSlug(w.en));
    expect(new Set(slugs).size).toBe(slugs.length);
    const ja = words.map((w) => w.ja);
    expect(new Set(ja).size).toBe(ja.length);
  });

  it.each(words.map((w) => [w.en, w] as const))('%s の例文に見出しの語が入っている', (_, w) => {
    expect(w.example.toLowerCase()).toContain(w.en.toLowerCase());
    expect(w.exampleJa.length).toBeGreaterThan(0);
  });

  it('紛らわしい語の指定は、単語帳にある語を指している', () => {
    const all = new Set(words.map((w) => w.en));
    for (const w of words) for (const a of w.avoid ?? []) expect(all.has(a)).toBe(true);
  });

  it('各分野に 4 語以上あり、問題集にはすべての語の 4 択の問題がある', () => {
    for (const g of CLAUDE_VOCABULARY) expect(g.words.length).toBeGreaterThanOrEqual(4);
    const qs = questionsForExam('claude-vocabulary');
    expect(qs).toHaveLength(words.length);
    for (const q of qs) expect(q.choices).toHaveLength(4);
  });

  it('紛らわしい語の意味は、誤答の選択肢に出ない', () => {
    const jaOf = new Map(words.map((w) => [w.en, w.ja]));
    for (const w of words.filter((x) => x.avoid)) {
      const q = questionsForExam('claude-vocabulary').find((x) => x.id === `voc-${wordSlug(w.en)}`)!;
      for (const a of w.avoid!) expect(q.choices).not.toContain(jaOf.get(a));
    }
  });
});
