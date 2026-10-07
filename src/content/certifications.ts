import type { Certification, Resource } from '@/lib/quiz/types';

/** 公式情報を確認した日（試験情報の欄に表示する） */
export const FACTS_CHECKED_ON = '2026年10月7日';

const DATABRICKS_ACADEMY: Resource = {
  title: 'Databricks Academy（公式トレーニング）',
  url: 'https://www.databricks.com/learn/training/home',
  kind: '公式コース',
  note: '各資格の試験ガイドで、関連するトレーニングが案内されています',
};

const DATABRICKS_CERTIFICATIONS: Resource = {
  title: 'Databricks の認定資格一覧',
  url: 'https://www.databricks.com/learn/training/certification',
  kind: '公式サイト',
};

function databricksFacts(opts: { questions: number; languages: string; experience?: string }) {
  return [
    { label: '問題数', value: `採点対象 ${opts.questions} 問` },
    { label: '試験時間', value: '90 分' },
    { label: '受験料', value: '200 米ドル' },
    { label: '受験方法', value: 'オンラインまたはテストセンター' },
    { label: '持ち込み', value: 'なし' },
    { label: '受験資格', value: 'なし（関連トレーニングの受講を強く推奨）' },
    ...(opts.experience ? [{ label: '推奨される経験', value: opts.experience }] : []),
    { label: '言語', value: opts.languages },
    { label: '有効期間', value: '2 年（更新には最新版の試験に再合格が必要）' },
  ];
}

const MULTI_LANG = '英語・日本語・ポルトガル語（ブラジル）・韓国語';

const DATABRICKS_STUDY_PLAN = [
  '公式ページで最新の試験ガイドを確認し、出題範囲と配点を把握する',
  '本サイトの学習ガイドで、分野ごとの要点と用語をつかむ',
  'Databricks Academy の関連トレーニングと公式ドキュメントで理解を深め、実際のワークスペースで手を動かす',
  '問題集の練習モードで分野ごとに解き、間違えた問題は苦手克服モードで解き直す',
  '仕上げに模試モードで、1 問あたり約 2 分の時間配分に慣れておく',
];

const CLAUDE_ANNOUNCEMENT: Resource = {
  title: '公式発表「Four role-based certifications for the people who put Claude to work for customers」',
  url: 'https://claude.com/blog/four-role-based-claude-certifications',
  kind: '公式サイト',
  note: '2026年7月23日公開',
};

const CLAUDE_ACADEMY: Resource = {
  title: 'Claude Academy（無料のコース）',
  url: 'https://academy.claude.com/',
  kind: '公式コース',
  note: 'コースの修了バッジは無料でもらえます。有料の認定資格とは別のものです',
};

const CLAUDE_PARTNERS: Resource = {
  title: 'Claude Partner Network',
  url: 'https://claude.com/partners',
  kind: '公式サイト',
  note: '受験には加盟組織への所属が必要です',
};

const CLAUDE_FACTS = [
  { label: '提供元', value: 'Anthropic' },
  { label: '試験方式', value: '監督付き・本人確認ありの試験（Pearson が実施）' },
  { label: '認定の証明', value: 'Credly のデジタルバッジ' },
  { label: '受験資格', value: 'Claude Partner Network に加盟する組織のメンバーのみ' },
  { label: '対策コース', value: 'Anthropic Partner Academy（加盟組織向け）' },
  { label: '受験料・試験時間', value: '公式発表には記載なし（受験時に公式の案内を確認）' },
];

const CLAUDE_OUTLINE_NOTE =
  '公式発表では対象となる技能の概要だけが示されています。詳しい出題範囲は、Anthropic Partner Academy の対策コースなど、公式の案内で確認してください。';

export const CERTIFICATIONS: Certification[] = [
  {
    id: 'databricks-data-engineer-associate',
    track: 'databricks',
    vendor: 'Databricks',
    name: 'Databricks Certified Data Engineer Associate',
    nameJa: 'データエンジニア アソシエイト',
    level: '入門',
    summary: 'Databricks でデータの取り込み・変換・ジョブの運用・ガバナンスを行う基礎力を証明する、データエンジニア向けの資格。',
    description: [
      'Databricks のデータインテリジェンスプラットフォームを使い、データの取り込みから変換、ジョブによる自動化、権限の管理までを一通り扱えることを示す資格です。データエンジニアリング分野のアソシエイト（初級）にあたります。',
      '配点が大きいのは「データの変換とモデリング」（22%）と「データの取り込みとロード」（21%）です。最新の出題範囲には、CI/CD の実装や、トラブルシューティング・監視・最適化も含まれます。',
    ],
    audience: [
      'Databricks でデータパイプラインを作り始めたエンジニア',
      'SQL や Python でのデータ処理の経験を、Databricks での実践力として形にしたい人',
      'データ基盤の運用や権限管理に関わる人',
    ],
    facts: databricksFacts({ questions: 45, languages: MULTI_LANG }),
    outline: [
      { name: 'Databricks Intelligence Platform', nameJa: 'Databricks インテリジェンスプラットフォーム', weight: 6, topicIds: ['lakehouse-delta-lake'] },
      { name: 'Data Ingestion and Loading', nameJa: 'データの取り込みとロード', weight: 21, topicIds: ['data-ingestion'] },
      { name: 'Data Transformation and Modeling', nameJa: 'データの変換とモデリング', weight: 22, topicIds: ['pipelines-and-jobs', 'lakehouse-delta-lake'] },
      { name: 'Working with Lakeflow Jobs', nameJa: 'Lakeflow ジョブ', weight: 16, topicIds: ['pipelines-and-jobs'] },
      { name: 'Implementing CI/CD', nameJa: 'CI/CD の実装', weight: 10, topicIds: [] },
      { name: 'Troubleshooting, Monitoring, and Optimization', nameJa: 'トラブルシューティング・監視・最適化', weight: 10, topicIds: ['lakehouse-delta-lake', 'pipelines-and-jobs'] },
      { name: 'Governance and Security', nameJa: 'ガバナンスとセキュリティ', weight: 15, topicIds: ['unity-catalog'] },
    ],
    outlineNote: 'CI/CD（Declarative Automation Bundles など）は、本サイトの学習ガイドと問題集ではまだ扱っていません。公式ドキュメントで学習してください。',
    studyPlan: DATABRICKS_STUDY_PLAN,
    topicIds: ['lakehouse-delta-lake', 'data-ingestion', 'pipelines-and-jobs', 'unity-catalog'],
    officialUrl: 'https://www.databricks.com/learn/certification/data-engineer-associate',
    links: [
      DATABRICKS_ACADEMY,
      {
        title: 'Declarative Automation Bundles（旧 Databricks Asset Bundles）',
        url: 'https://docs.databricks.com/aws/en/dev-tools/bundles/',
        kind: '公式ドキュメント',
        note: 'CI/CD の分野の学習に',
      },
      DATABRICKS_CERTIFICATIONS,
    ],
  },
  {
    id: 'databricks-data-analyst-associate',
    track: 'databricks',
    vendor: 'Databricks',
    name: 'Databricks Certified Data Analyst Associate',
    nameJa: 'データアナリスト アソシエイト',
    level: '入門',
    summary: 'Databricks SQL でのクエリと分析、ダッシュボード、AI/BI Genie を使ったデータ分析の基礎力を証明する、アナリスト向けの資格。',
    description: [
      'SQL ウェアハウス上で Databricks SQL のクエリを書いて結果を分析し、ダッシュボードや AI/BI Genie で共有するまでの力を示す資格です。',
      '配点が大きいのは「Databricks SQL と SQL ウェアハウスでのクエリ実行」（20%）、「ダッシュボードと可視化の作成」（16%）、「クエリの分析」（15%）です。AI/BI Genie スペースの作成・共有・保守も 12% を占めます。',
    ],
    audience: ['SQL でデータ分析をしているアナリスト', 'Databricks でダッシュボードやレポートを作る人', '業務部門にデータを届ける役割の人'],
    facts: databricksFacts({ questions: 45, languages: '英語' }),
    outline: [
      { name: 'Understanding of Databricks Data + AI Platform', nameJa: 'Databricks Data + AI プラットフォームの理解', weight: 11, topicIds: ['databricks-sql', 'lakehouse-delta-lake'] },
      { name: 'Managing Data', nameJa: 'データの管理', weight: 8, topicIds: ['unity-catalog', 'lakehouse-delta-lake'] },
      { name: 'Importing Data', nameJa: 'データのインポート', weight: 5, topicIds: ['data-ingestion'] },
      { name: 'Executing queries using Databricks SQL and Databricks SQL Warehouses', nameJa: 'Databricks SQL と SQL ウェアハウスでのクエリ実行', weight: 20, topicIds: ['databricks-sql'] },
      { name: 'Analyzing Queries', nameJa: 'クエリの分析', weight: 15, topicIds: ['databricks-sql'] },
      { name: 'Creating Dashboards and Visualizations in Databricks', nameJa: 'ダッシュボードと可視化の作成', weight: 16, topicIds: ['databricks-sql'] },
      { name: 'Developing, Sharing, and Maintaining AI/BI Genie spaces', nameJa: 'AI/BI Genie スペースの作成・共有・保守', weight: 12, topicIds: ['databricks-sql'] },
      { name: 'Data Modeling with Databricks SQL', nameJa: 'Databricks SQL でのデータモデリング', weight: 5, topicIds: ['databricks-sql'] },
      { name: 'Securing Data', nameJa: 'データの保護', weight: 8, topicIds: ['unity-catalog'] },
    ],
    studyPlan: DATABRICKS_STUDY_PLAN,
    topicIds: ['databricks-sql', 'unity-catalog', 'lakehouse-delta-lake', 'data-ingestion'],
    officialUrl: 'https://www.databricks.com/learn/certification/data-analyst-associate',
    links: [DATABRICKS_ACADEMY, DATABRICKS_CERTIFICATIONS],
  },
  {
    id: 'databricks-machine-learning-associate',
    track: 'databricks',
    vendor: 'Databricks',
    name: 'Databricks Certified Machine Learning Associate',
    nameJa: '機械学習 アソシエイト',
    level: '中級',
    summary: 'Databricks 上で機械学習モデルを開発し、実験を管理し、デプロイするまでの基礎力を証明する資格。',
    description: [
      'Databricks の機械学習の機能（MLflow、AutoML、特徴量の管理、Model Serving など）を使って、モデルを開発し、実験を記録し、本番に届けるまでの基礎を問う資格です。',
      '出題の約 4 割（38%）が「Databricks Machine Learning」の分野です。公式ページでは、試験ガイドにあるタスクを 6 か月以上実際に行った経験が推奨されています。',
    ],
    audience: ['データサイエンティストや機械学習エンジニア', 'Databricks で MLflow を使ってモデルを管理している人', '機械学習の基礎を Databricks 上の実務につなげたい人'],
    facts: databricksFacts({ questions: 48, languages: MULTI_LANG, experience: '試験ガイドにあるタスクの実務経験 6 か月以上' }),
    outline: [
      { name: 'Databricks Machine Learning', nameJa: 'Databricks の機械学習機能', weight: 38, topicIds: ['mlflow', 'ml-fundamentals'] },
      { name: 'ML Workflows', nameJa: '機械学習のワークフロー', weight: 19, topicIds: ['ml-fundamentals'] },
      { name: 'Model Development', nameJa: 'モデルの開発', weight: 31, topicIds: ['ml-fundamentals'] },
      { name: 'Model Deployment', nameJa: 'モデルのデプロイ', weight: 12, topicIds: ['mlflow'] },
    ],
    studyPlan: DATABRICKS_STUDY_PLAN,
    topicIds: ['ml-fundamentals', 'mlflow'],
    officialUrl: 'https://www.databricks.com/learn/certification/machine-learning-associate',
    links: [DATABRICKS_ACADEMY, DATABRICKS_CERTIFICATIONS],
  },
  {
    id: 'databricks-genai-engineer-associate',
    track: 'databricks',
    vendor: 'Databricks',
    name: 'Databricks Certified Generative AI Engineer Associate',
    nameJa: '生成AIエンジニア アソシエイト',
    level: '中級',
    summary: 'Databricks で RAG やエージェントなどの生成AIアプリを設計・構築・評価する基礎力を証明する資格。',
    description: [
      '大規模言語モデル（LLM）を使ったアプリケーションを、設計とデータの準備から、開発、デプロイ、ガバナンス、評価と監視まで一通り扱えることを示す資格です。',
      '配点が最も大きいのは「アプリケーションの開発」（30%）で、次いで「アプリの組み立てとデプロイ」（22%）です。公式ページでは、6 か月以上の実務経験が推奨されています。',
    ],
    audience: ['RAG やチャットボットなど、LLM を使ったアプリを開発するエンジニア', 'Databricks で生成AIの試作から本番化までを担当する人', 'データエンジニアや ML エンジニアで、生成AIに領域を広げたい人'],
    facts: databricksFacts({ questions: 45, languages: MULTI_LANG, experience: '試験ガイドにあるタスクの実務経験 6 か月以上' }),
    outline: [
      { name: 'Design Applications', nameJa: 'アプリケーションの設計', weight: 14, topicIds: ['genai-apps', 'rag-ai-search'] },
      { name: 'Data Preparation', nameJa: 'データの準備', weight: 14, topicIds: ['rag-ai-search'] },
      { name: 'Application Development', nameJa: 'アプリケーションの開発', weight: 30, topicIds: ['genai-apps', 'rag-ai-search'] },
      { name: 'Assembling and Deploying Apps', nameJa: 'アプリの組み立てとデプロイ', weight: 22, topicIds: ['genai-apps'] },
      { name: 'Governance', nameJa: 'ガバナンス', weight: 8, topicIds: ['genai-apps', 'unity-catalog'] },
      { name: 'Evaluation and Monitoring', nameJa: '評価と監視', weight: 12, topicIds: ['genai-apps'] },
    ],
    studyPlan: DATABRICKS_STUDY_PLAN,
    topicIds: ['rag-ai-search', 'genai-apps', 'unity-catalog'],
    officialUrl: 'https://www.databricks.com/learn/certification/genai-engineer-associate',
    links: [DATABRICKS_ACADEMY, DATABRICKS_CERTIFICATIONS],
  },
  {
    id: 'claude-certified-associate-foundations',
    track: 'claude',
    vendor: 'Anthropic',
    name: 'Claude Certified Associate: Foundations',
    nameJa: 'Claude 認定アソシエイト（Foundations）',
    level: '入門',
    summary: 'Claude に関わるプロジェクトで働く人向けに、Claude を日々の実務で使いこなす力を証明する、Anthropic の公式資格。',
    description: [
      '2026年7月に Anthropic が発表した、役割別の Claude 認定資格の 1 つです。コンサルタントやプロジェクトリード、ビジネス職・技術職を問わず、Claude に関わるプロジェクトに携わる人を対象に、Claude の日常的な実務での活用力を問います。',
      '受験できるのは Claude Partner Network に加盟する組織のメンバーに限られます。個人で学ぶ場合は、無料の Claude Academy のコースと、本サイトの学習ガイド・問題集で同じ領域の力を身につけられます。',
    ],
    audience: ['Claude を業務で使うコンサルタントやプロジェクトリード', 'Claude の導入を進めるビジネス職・技術職', 'まず Claude の実務活用の基礎を固めたい人'],
    facts: CLAUDE_FACTS,
    outline: [{ name: 'Practical, everyday use of Claude', nameJa: 'Claude の日常的な実務での活用', topicIds: ['prompt-engineering'] }],
    outlineNote: CLAUDE_OUTLINE_NOTE,
    studyPlan: [
      '公式発表で、資格の対象者と受験の条件（Claude Partner Network への加盟）を確認する',
      '無料の Claude Academy で「AI Fluency: Framework and foundations」などのコースを受講する',
      '本サイトの学習ガイド「プロンプト設計の基本」で、指示の出し方の要点をつかむ',
      'プロンプト設計の問題集で理解を確かめ、間違えた問題を解き直す',
      '受験できる組織に所属している場合は、Anthropic Partner Academy の対策コースで仕上げる',
    ],
    topicIds: ['prompt-engineering'],
    officialUrl: CLAUDE_ANNOUNCEMENT.url,
    links: [CLAUDE_ACADEMY, CLAUDE_PARTNERS],
  },
  {
    id: 'claude-certified-developer-foundations',
    track: 'claude',
    vendor: 'Anthropic',
    name: 'Claude Certified Developer: Foundations',
    nameJa: 'Claude 認定デベロッパー（Foundations）',
    level: '中級',
    summary: 'Claude を使ったアプリケーションを作るエンジニア向けに、Claude API・ツール利用・エージェント開発の力を証明する公式資格。',
    description: [
      'Claude を組み込んだアプリケーションを作るエンジニア向けの資格です。公式発表では、Claude API、ツール利用（tool use）、エージェント開発が対象として挙げられています。',
      '受験できるのは Claude Partner Network に加盟する組織のメンバーに限られます。本サイトでは、関連する技能を Claude API・プロンプト設計・Claude Code & MCP の問題集で練習できます。',
    ],
    audience: ['Claude API でアプリケーションを開発するエンジニア', 'ツール連携やエージェントを実装する人', 'Claude を使ったプロダクトの技術面に責任を持つ人'],
    facts: CLAUDE_FACTS,
    outline: [
      { name: 'Claude API', nameJa: 'Claude API', topicIds: ['claude-messages-api', 'claude-api-optimization'] },
      { name: 'Tool use', nameJa: 'ツール利用', topicIds: ['claude-tool-use'] },
      { name: 'Agent development', nameJa: 'エージェント開発', topicIds: ['mcp', 'claude-code', 'prompt-engineering'] },
    ],
    outlineNote: CLAUDE_OUTLINE_NOTE,
    studyPlan: [
      '公式発表で、資格の対象者と受験の条件を確認する',
      '本サイトの学習ガイドで、Messages API・ツール利用・コストと性能の最適化の要点をつかむ',
      '公式ドキュメントのコード例を実際に動かし、API の挙動を確かめる',
      'Claude API とプロンプト設計の問題集で理解を確かめ、苦手な問題を解き直す',
      '受験できる組織に所属している場合は、Anthropic Partner Academy の対策コースで仕上げる',
    ],
    topicIds: ['claude-messages-api', 'claude-tool-use', 'claude-api-optimization', 'prompt-engineering', 'mcp'],
    officialUrl: CLAUDE_ANNOUNCEMENT.url,
    links: [
      { title: 'Claude Developer Platform のドキュメント', url: 'https://platform.claude.com/docs/en/intro', kind: '公式ドキュメント' },
      { title: 'Anthropic の学習用教材（GitHub: anthropics/courses）', url: 'https://github.com/anthropics/courses', kind: '公式チュートリアル' },
      CLAUDE_ACADEMY,
      CLAUDE_PARTNERS,
    ],
  },
  {
    id: 'claude-certified-architect-foundations',
    track: 'claude',
    vendor: 'Anthropic',
    name: 'Claude Certified Architect: Foundations',
    nameJa: 'Claude 認定アーキテクト（Foundations）',
    level: '上級',
    summary: 'Claude を使ったエージェントシステムを設計・構築する、ソリューションアーキテクト向けの公式資格。',
    description: [
      'Claude を中心としたエージェントシステムを設計し、構築するソリューションアーキテクト向けの資格です。',
      '受験できるのは Claude Partner Network に加盟する組織のメンバーに限られます。本サイトでは、関連する技能として、ツール利用・MCP・Claude Code の学習ガイドと問題集を用意しています。',
    ],
    audience: ['エージェントを含むシステムの設計を担うアーキテクト', '複数のツールやデータソースを Claude とつなぐ設計をする人', '開発チームの技術選定に関わる人'],
    facts: CLAUDE_FACTS,
    outline: [
      { name: 'Designing and building agent systems', nameJa: 'エージェントシステムの設計と構築', topicIds: ['claude-tool-use', 'mcp', 'claude-code', 'prompt-engineering'] },
    ],
    outlineNote: CLAUDE_OUTLINE_NOTE,
    studyPlan: [
      '公式発表で、資格の対象者と受験の条件を確認する',
      '本サイトの学習ガイドで、ツール利用・MCP・Claude Code の要点をつかむ',
      '小さなエージェントを実際に作り、ツールや MCP サーバーをつないで動かしてみる',
      'Claude Code & MCP の問題集で理解を確かめ、苦手な問題を解き直す',
      '受験できる組織に所属している場合は、Anthropic Partner Academy の対策コースで仕上げる',
    ],
    topicIds: ['claude-tool-use', 'mcp', 'claude-code', 'prompt-engineering'],
    officialUrl: CLAUDE_ANNOUNCEMENT.url,
    links: [
      { title: 'Model Context Protocol（公式サイト）', url: 'https://modelcontextprotocol.io/', kind: '仕様' },
      { title: 'Claude Code のドキュメント', url: 'https://code.claude.com/docs/en/overview', kind: '公式ドキュメント' },
      CLAUDE_PARTNERS,
    ],
  },
  {
    id: 'claude-certified-architect-professional',
    track: 'claude',
    vendor: 'Anthropic',
    name: 'Claude Certified Architect: Professional',
    nameJa: 'Claude 認定アーキテクト（Professional）',
    level: '上級',
    summary: 'エンタープライズ規模の役割を担う人向けの上位資格。統合アーキテクチャ、ガバナンス、評価が対象。',
    description: [
      'アーキテクト資格の上位にあたる、エンタープライズ規模の役割向けの資格です。公式発表では、統合アーキテクチャ、ガバナンス、評価が対象として挙げられています。',
      '受験できるのは Claude Partner Network に加盟する組織のメンバーに限られます。この資格に直接対応する本サイトの問題集はまだありません。',
    ],
    audience: ['大きな組織で Claude の導入アーキテクチャを設計する人', 'AI の運用ガバナンスや評価の仕組みづくりを担う人'],
    facts: CLAUDE_FACTS,
    outline: [
      { name: 'Integration architecture', nameJa: '統合アーキテクチャ', topicIds: ['mcp', 'claude-tool-use'] },
      { name: 'Governance', nameJa: 'ガバナンス', topicIds: [] },
      { name: 'Evaluation', nameJa: '評価', topicIds: ['prompt-engineering'] },
    ],
    outlineNote: `${CLAUDE_OUTLINE_NOTE} ガバナンスの分野は、本サイトの学習ガイドではまだ扱っていません。`,
    studyPlan: [
      '公式発表で、資格の対象者と受験の条件を確認する',
      'Foundations の範囲（API・ツール利用・エージェント設計）を、本サイトの学習ガイドと問題集で固める',
      'MCP によるシステム連携と、プロンプトの評価の進め方を公式ドキュメントで深める',
      '受験できる組織に所属している場合は、Anthropic Partner Academy の対策コースで仕上げる',
    ],
    topicIds: ['mcp', 'claude-tool-use', 'prompt-engineering', 'claude-api-optimization'],
    officialUrl: CLAUDE_ANNOUNCEMENT.url,
    links: [{ title: 'Model Context Protocol（公式サイト）', url: 'https://modelcontextprotocol.io/', kind: '仕様' }, CLAUDE_PARTNERS],
  },
];

export const OFFICIAL_ANNOUNCEMENTS = { claude: CLAUDE_ANNOUNCEMENT };

export function getCertification(id: string): Certification | undefined {
  return CERTIFICATIONS.find((c) => c.id === id);
}
