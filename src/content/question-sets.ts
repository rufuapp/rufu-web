import type { QuestionSet, TrackId } from '@/lib/quiz/types';

export const TRACKS: Record<TrackId, { name: string; tagline: string; accent: string }> = {
  databricks: {
    name: 'Databricks',
    tagline: 'データエンジニアリングから生成AIまで、Databricks 認定資格の出題範囲を想定した演習',
    accent: 'var(--d-dbx)',
  },
  claude: {
    name: 'Claude',
    tagline: 'Claude API・プロンプト設計・Claude Code / MCP の実践的な理解を確かめる演習',
    accent: 'var(--d-cld)',
  },
};

export const QUESTION_SETS: QuestionSet[] = [
  {
    id: 'databricks-data-engineer-associate',
    track: 'databricks',
    title: 'Data Engineer Associate 問題集',
    shortTitle: 'Data Engineer Associate',
    level: '入門',
    summary: 'Delta Lake、取り込み（Auto Loader / COPY INTO）、メダリオン設計、パイプライン、ジョブ、Unity Catalog の基礎。',
    certificationIds: ['databricks-data-engineer-associate'],
    domains: [
      { id: 'delta', name: 'Delta Lake' },
      { id: 'ingest', name: 'データ取り込み' },
      { id: 'pipeline', name: 'パイプラインと処理' },
      { id: 'ops', name: 'ジョブと運用' },
      { id: 'governance', name: 'Unity Catalog' },
    ],
  },
  {
    id: 'databricks-data-analyst-associate',
    track: 'databricks',
    title: 'Data Analyst Associate 問題集',
    shortTitle: 'Data Analyst Associate',
    level: '入門',
    summary: 'Databricks SQL、SQL の集計・ウィンドウ関数、ダッシュボードとアラート、AI/BI Genie、データ探索。',
    certificationIds: ['databricks-data-analyst-associate'],
    domains: [
      { id: 'dbsql', name: 'Databricks SQL' },
      { id: 'sql', name: 'SQL 分析' },
      { id: 'viz', name: '可視化とアラート' },
      { id: 'catalog', name: 'データ管理と探索' },
    ],
  },
  {
    id: 'databricks-ml-associate',
    track: 'databricks',
    title: 'Machine Learning Associate 問題集',
    shortTitle: 'ML Associate',
    level: '中級',
    summary: 'MLflow によるトラッキングとモデル管理、特徴量、評価指標、AutoML、バッチ／リアルタイム推論。',
    certificationIds: ['databricks-machine-learning-associate'],
    domains: [
      { id: 'mlflow', name: 'MLflow とモデル管理' },
      { id: 'modeling', name: 'モデリングと評価' },
      { id: 'features', name: '特徴量エンジニアリング' },
      { id: 'deploy', name: 'デプロイと推論' },
    ],
  },
  {
    id: 'databricks-genai-engineer-associate',
    track: 'databricks',
    title: 'Generative AI Engineer Associate 問題集',
    shortTitle: 'GenAI Engineer Associate',
    level: '中級',
    summary: 'RAG 設計、Databricks AI Search、Model Serving、エージェント、評価とガバナンス。',
    certificationIds: ['databricks-genai-engineer-associate'],
    domains: [
      { id: 'rag', name: 'RAG とデータ準備' },
      { id: 'serving', name: 'モデル提供' },
      { id: 'agents', name: 'エージェントとツール' },
      { id: 'eval', name: '評価・安全性・ガバナンス' },
    ],
  },
  {
    id: 'claude-api',
    track: 'claude',
    title: 'Claude API 問題集',
    shortTitle: 'Claude API',
    level: '中級',
    summary: 'Messages API の基本、ストリーミング、ツール利用、プロンプトキャッシュ、Batches、思考の制御。',
    certificationIds: ['claude-certified-developer-foundations'],
    domains: [
      { id: 'basics', name: 'Messages API の基本' },
      { id: 'tools', name: 'ツール利用' },
      { id: 'perf', name: 'コストと性能' },
      { id: 'advanced', name: '発展機能' },
    ],
  },
  {
    id: 'claude-prompting',
    track: 'claude',
    title: 'プロンプト設計 問題集',
    shortTitle: 'プロンプト設計',
    level: '入門',
    summary: '明確な指示、例示、XML タグ、長文の扱い、思考の促し方、ハルシネーション対策、タスク分割。',
    certificationIds: ['claude-certified-associate-foundations', 'claude-certified-developer-foundations'],
    domains: [
      { id: 'clarity', name: '明確な指示' },
      { id: 'structure', name: '構造化' },
      { id: 'reasoning', name: '推論と分割' },
      { id: 'reliability', name: '信頼性' },
    ],
  },
  {
    id: 'claude-code-mcp',
    track: 'claude',
    title: 'Claude Code & MCP 問題集',
    shortTitle: 'Claude Code & MCP',
    level: '上級',
    summary: 'CLAUDE.md、権限設定、フック、スキル、サブエージェント、MCP のプリミティブと接続方式。',
    certificationIds: ['claude-certified-developer-foundations', 'claude-certified-architect-foundations'],
    domains: [
      { id: 'setup', name: '設定とメモリ' },
      { id: 'workflow', name: 'ワークフロー' },
      { id: 'extend', name: '拡張' },
      { id: 'mcp', name: 'MCP' },
    ],
  },
];

export function getQuestionSet(id: string): QuestionSet | undefined {
  return QUESTION_SETS.find((s) => s.id === id);
}

export function domainName(set: QuestionSet, domainId: string): string {
  return set.domains.find((d) => d.id === domainId)?.name ?? domainId;
}
