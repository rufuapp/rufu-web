import type { Certification, QuestionSet, StudyTopic, TrackId } from '@/lib/quiz/types';
import { CERTIFICATIONS, getCertification } from './certifications';
import { QUESTION_SETS } from './question-sets';
import { QUESTIONS } from './questions';
import { STUDY_TOPICS, getStudyTopic } from './study-topics';

export const TRACK_ORDER: TrackId[] = ['databricks', 'claude'];

export function certificationsForTrack(track: TrackId): Certification[] {
  return CERTIFICATIONS.filter((c) => c.track === track);
}

export function questionSetsForTrack(track: TrackId): QuestionSet[] {
  return QUESTION_SETS.filter((s) => s.track === track);
}

export function topicsForTrack(track: TrackId): StudyTopic[] {
  return STUDY_TOPICS.filter((t) => t.track === track);
}

export function questionSetsForCertification(certId: string): QuestionSet[] {
  return QUESTION_SETS.filter((s) => s.certificationIds.includes(certId));
}

export function certificationsForQuestionSet(set: QuestionSet): Certification[] {
  return set.certificationIds.map(getCertification).filter((c): c is Certification => !!c);
}

export function certificationsForTopic(topicId: string): Certification[] {
  return CERTIFICATIONS.filter((c) => c.topicIds.includes(topicId));
}

export function topicsForCertification(cert: Certification): StudyTopic[] {
  return cert.topicIds.map(getStudyTopic).filter((t): t is StudyTopic => !!t);
}

export function topicsForQuestionSet(setId: string): StudyTopic[] {
  return STUDY_TOPICS.filter((t) => t.practice.some((p) => p.setId === setId));
}

/** 問題集の分野に対応する学習内容（結果画面の「復習」リンクに使う） */
export function topicForDomain(setId: string, domainId: string): StudyTopic | undefined {
  return STUDY_TOPICS.find((t) => t.practice.some((p) => p.setId === setId && p.domains.includes(domainId)));
}

export function questionIdsBySet(): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const q of QUESTIONS) (map[q.examId] ??= []).push(q.id);
  return map;
}

/** 同じトラックの中での前後の学習内容 */
export function adjacentTopics(topicId: string): { prev?: StudyTopic; next?: StudyTopic } {
  const topic = getStudyTopic(topicId);
  if (!topic) return {};
  const list = topicsForTrack(topic.track);
  const i = list.findIndex((t) => t.id === topicId);
  return { prev: list[i - 1], next: list[i + 1] };
}
