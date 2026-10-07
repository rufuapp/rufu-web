import type { Question } from '@/lib/quiz/types';
import { vocabularyQuestions } from '@/lib/quiz/vocabulary';
import { CLAUDE_VOCABULARY } from '@/content/vocabulary/claude';

// 単語帳（src/content/vocabulary/claude.ts）から作る。単語を足すと問題も増える
export const claudeVocabulary: Question[] = vocabularyQuestions('claude-vocabulary', CLAUDE_VOCABULARY);
