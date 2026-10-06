export type TrackId = 'databricks' | 'claude';

export type Domain = {
  id: string;
  name: string;
};

export type Exam = {
  id: string;
  track: TrackId;
  title: string;
  shortTitle: string;
  level: '入門' | '中級' | '上級';
  summary: string;
  /** 公式試験に対応する場合の名称（非公式検定なら null） */
  officialName: string | null;
  domains: Domain[];
};

export type Question = {
  id: string;
  examId: string;
  domain: string;
  type: 'single' | 'multi';
  question: string;
  code?: string;
  choices: string[];
  /** choices のインデックス（0始まり） */
  answer: number[];
  explanation: string;
};

export type QuizMode = 'practice' | 'mock' | 'review';

/** 出題時の1問。choices はシャッフル済みで、order[i] は元のインデックス */
export type SessionQuestion = {
  question: Question;
  order: number[];
};

export type AnswerRecord = {
  questionId: string;
  domain: string;
  /** 元の choices インデックスで保持する */
  selected: number[];
  correct: boolean;
};

export type DomainScore = {
  domain: string;
  correct: number;
  total: number;
};

export type SessionResult = {
  total: number;
  correct: number;
  rate: number;
  passed: boolean;
  byDomain: DomainScore[];
};
