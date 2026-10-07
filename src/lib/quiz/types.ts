export type TrackId = 'databricks' | 'claude';

export type Level = '入門' | '中級' | '上級';

export type Domain = {
  id: string;
  name: string;
};

/** 問題集（本サイトのオリジナル問題をまとめたもの） */
export type QuestionSet = {
  id: string;
  track: TrackId;
  title: string;
  shortTitle: string;
  level: Level;
  summary: string;
  /** 関連する資格（certifications.ts の id） */
  certificationIds: string[];
  domains: Domain[];
  /** 英単語の問題集（単語帳から問題を作る。今日の一問には出さない） */
  kind?: 'vocabulary';
};

export type Question = {
  id: string;
  /** 所属する問題集の id（保存済みの学習記録と互換のため examId のまま） */
  examId: string;
  domain: string;
  type: 'single' | 'multi';
  question: string;
  /** 設問で読む英文（英単語の問題で、例文を示すときに使う） */
  passage?: string;
  code?: string;
  choices: string[];
  /** choices のインデックス（0始まり） */
  answer: number[];
  explanation: string;
};

export type Resource = {
  title: string;
  url: string;
  kind: '公式ドキュメント' | '公式サイト' | '公式コース' | '公式チュートリアル' | '仕様';
  note?: string;
};

/** 資格（公式の認定資格） */
export type Certification = {
  id: string;
  track: TrackId;
  vendor: 'Databricks' | 'Anthropic';
  /** 公式の正式名称 */
  name: string;
  /** 日本語での呼び方 */
  nameJa: string;
  level: Level;
  summary: string;
  description: string[];
  audience: string[];
  facts: { label: string; value: string }[];
  /** 出題範囲（公式の分野名と配点。配点が公表されていなければ weight なし） */
  outline: { name: string; nameJa: string; weight?: number; topicIds: string[] }[];
  outlineNote?: string;
  studyPlan: string[];
  topicIds: string[];
  officialUrl: string;
  links: Resource[];
};

/** 学習内容（何を、何で学ぶか） */
export type StudyTopic = {
  id: string;
  track: TrackId;
  title: string;
  summary: string;
  intro: string[];
  points: { heading: string; body: string }[];
  terms: { term: string; desc: string }[];
  /** 単語帳（英単語の学習ガイドだけが持つ） */
  vocabulary?: VocabularyGroup[];
  resources: Resource[];
  /** この内容を確かめられる問題集と分野 */
  practice: { setId: string; domains: string[] }[];
};

export type PartOfSpeech = '名詞' | '動詞' | '形容詞' | '句';

/** 単語帳の1語 */
export type VocabularyWord = {
  en: string;
  pos: PartOfSpeech;
  /** 意味（問題の選択肢にも使うので短くする） */
  ja: string;
  /** 補足（よく知られた意味との違いなど） */
  note?: string;
  /** 例文（en を含める。大文字・小文字と、語尾の変化は問わない） */
  example: string;
  exampleJa: string;
  /** 意味が近くて紛らわしいため、誤答の選択肢に使わない語（en で指定） */
  avoid?: string[];
};

/** 単語帳の分野。id は英単語の問題集の分野 id と同じにする */
export type VocabularyGroup = {
  id: string;
  name: string;
  words: VocabularyWord[];
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
