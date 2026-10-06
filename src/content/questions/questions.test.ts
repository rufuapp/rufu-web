import { EXAMS } from '@/content/exams';
import { QUESTIONS, questionsForExam } from './index';

describe('問題データの整合性', () => {
  it('問題 ID が重複していない', () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('試験 ID が重複していない', () => {
    const ids = EXAMS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(QUESTIONS.map((q) => [q.id, q] as const))('%s の形式が正しい', (_, q) => {
    const exam = EXAMS.find((e) => e.id === q.examId);
    expect(exam).toBeDefined();
    expect(exam!.domains.map((d) => d.id)).toContain(q.domain);
    expect(q.choices.length).toBeGreaterThanOrEqual(2);
    expect(new Set(q.choices).size).toBe(q.choices.length);
    expect(new Set(q.answer).size).toBe(q.answer.length);
    for (const i of q.answer) {
      expect(Number.isInteger(i)).toBe(true);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(q.choices.length);
    }
    if (q.type === 'single') expect(q.answer).toHaveLength(1);
    else expect(q.answer.length).toBeGreaterThanOrEqual(2);
    expect(q.explanation.length).toBeGreaterThan(10);
  });

  it.each(EXAMS.map((e) => [e.id] as const))('%s は 10 問以上あり、全分野に問題がある', (id) => {
    const exam = EXAMS.find((e) => e.id === id)!;
    const qs = questionsForExam(id);
    expect(qs.length).toBeGreaterThanOrEqual(10);
    for (const d of exam.domains) {
      expect(qs.some((q) => q.domain === d.id)).toBe(true);
    }
  });
});
