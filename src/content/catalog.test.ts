import { CERTIFICATIONS, getCertification } from './certifications';
import { QUESTION_SETS, getQuestionSet } from './question-sets';
import { STUDY_TOPICS, getStudyTopic } from './study-topics';
import { adjacentTopics, certificationsForTopic, questionSetsForCertification, topicForDomain, topicsForTrack } from './catalog';

const unique = (ids: string[]) => new Set(ids).size === ids.length;

describe('資格・問題集・学習内容のつながり', () => {
  it('ID が重複していない', () => {
    expect(unique(CERTIFICATIONS.map((c) => c.id))).toBe(true);
    expect(unique(QUESTION_SETS.map((s) => s.id))).toBe(true);
    expect(unique(STUDY_TOPICS.map((t) => t.id))).toBe(true);
  });

  it.each(QUESTION_SETS.map((s) => [s.id, s] as const))('問題集 %s の関連資格が存在する', (_, s) => {
    expect(s.certificationIds.length).toBeGreaterThan(0);
    for (const id of s.certificationIds) expect(getCertification(id)).toBeDefined();
  });

  it.each(QUESTION_SETS.map((s) => [s.id, s] as const))('問題集 %s のすべての分野に、復習用の学習内容がある', (_, s) => {
    for (const d of s.domains) expect(topicForDomain(s.id, d.id)).toBeDefined();
  });

  it.each(CERTIFICATIONS.map((c) => [c.id, c] as const))('資格 %s の参照先が存在し、配点の合計が 100%', (_, c) => {
    expect(c.topicIds.length).toBeGreaterThan(0);
    for (const id of c.topicIds) expect(getStudyTopic(id)).toBeDefined();
    for (const o of c.outline) for (const id of o.topicIds) expect(getStudyTopic(id)).toBeDefined();
    const weights = c.outline.map((o) => o.weight).filter((w): w is number => w !== undefined);
    if (weights.length > 0) {
      expect(weights).toHaveLength(c.outline.length);
      expect(weights.reduce((a, b) => a + b, 0)).toBe(100);
    }
    expect(c.officialUrl).toMatch(/^https:\/\//);
    expect(c.facts.length).toBeGreaterThan(0);
  });

  it.each(STUDY_TOPICS.map((t) => [t.id, t] as const))('学習内容 %s の中身と参照先がそろっている', (_, t) => {
    expect(t.points.length).toBeGreaterThanOrEqual(3);
    expect(t.terms.length).toBeGreaterThanOrEqual(3);
    expect(t.resources.length).toBeGreaterThan(0);
    for (const r of t.resources) expect(r.url).toMatch(/^https:\/\//);
    expect(certificationsForTopic(t.id).length).toBeGreaterThan(0);
    expect(t.practice.length).toBeGreaterThan(0);
    for (const p of t.practice) {
      const set = getQuestionSet(p.setId);
      expect(set).toBeDefined();
      expect(set!.track).toBe(t.track);
      for (const d of p.domains) expect(set!.domains.map((x) => x.id)).toContain(d);
    }
  });

  it('Databricks の資格にはそれぞれ問題集がある', () => {
    for (const c of CERTIFICATIONS.filter((x) => x.track === 'databricks')) {
      expect(questionSetsForCertification(c.id).length).toBeGreaterThan(0);
    }
  });

  it('前後の学習内容は同じトラックの中でたどれる', () => {
    const list = topicsForTrack('claude');
    expect(adjacentTopics(list[0].id).prev).toBeUndefined();
    expect(adjacentTopics(list[0].id).next?.id).toBe(list[1].id);
    expect(adjacentTopics(list[list.length - 1].id).next).toBeUndefined();
    expect(adjacentTopics('nope')).toEqual({});
  });
});

describe('基礎知識', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { BASICS_TOPICS, BASICS_GROUPS } = require('./basics') as typeof import('./basics');

  it('ID が重複せず、どの項目もまとまりに属し、公式の情報へのリンクがある', () => {
    expect(new Set(BASICS_TOPICS.map((t) => t.id)).size).toBe(BASICS_TOPICS.length);
    for (const t of BASICS_TOPICS) {
      expect(BASICS_GROUPS.map((g) => g.id)).toContain(t.group);
      expect(t.sections.length).toBeGreaterThan(0);
      expect(t.resources.length).toBeGreaterThan(0);
      for (const r of t.resources) expect(r.url).toMatch(/^https:\/\//);
    }
  });

  it('どのまとまりにも項目がある', () => {
    for (const g of BASICS_GROUPS) expect(BASICS_TOPICS.some((t) => t.group === g.id)).toBe(true);
  });
});
