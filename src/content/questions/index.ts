import type { Question } from '@/lib/quiz/types';
import { databricksDataEngineer } from './databricks-de';
import { databricksDataAnalyst } from './databricks-da';
import { databricksMl } from './databricks-ml';
import { databricksGenai } from './databricks-genai';
import { claudeApi } from './claude-api';
import { claudePrompting } from './claude-prompting';
import { claudeCodeMcp } from './claude-code-mcp';
import { claudeVocabulary } from './claude-vocabulary';

export const QUESTIONS: Question[] = [
  ...databricksDataEngineer,
  ...databricksDataAnalyst,
  ...databricksMl,
  ...databricksGenai,
  ...claudeApi,
  ...claudePrompting,
  ...claudeCodeMcp,
  ...claudeVocabulary,
];

export function questionsForExam(examId: string): Question[] {
  return QUESTIONS.filter((q) => q.examId === examId);
}

export function questionById(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}
