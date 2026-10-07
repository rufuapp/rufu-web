import type { Resource } from '@/lib/quiz/types';

/** 基礎知識のまとまり。資格の範囲ではなく、FDE の現場で必要になる知識で分ける */
export type BasicsGroup = 'claude' | 'databricks' | 'fde';

export type BasicsTopic = {
  id: string;
  group: BasicsGroup;
  title: string;
  summary: string;
  intro: string[];
  sections: { heading: string; body: string[] }[];
  /** 現場でそのまま使える確認項目（任意） */
  checklist?: string[];
  resources: Resource[];
};

/** 料金・モデル・データの扱いなどを公式情報で確かめた日 */
export const BASICS_CHECKED_ON = '2026年10月7日';

export const BASICS_GROUPS: { id: BasicsGroup; name: string; lead: string }[] = [
  { id: 'claude', name: 'Claude', lead: 'お客さまに Claude を提案し、導入するときの土台になる知識です。' },
  { id: 'databricks', name: 'Databricks', lead: 'データ基盤としての Databricks を、全体像と費用の面からつかみます。' },
  { id: 'fde', name: 'FDE の進め方', lead: 'Claude と Databricks を組み合わせ、PoC から本番まで進めるための知識です。' },
];

const CLAUDE_DOCS = 'https://platform.claude.com/docs/en';
const DBX_DOCS = 'https://docs.databricks.com/aws/en';

export const BASICS_TOPICS: BasicsTopic[] = [
  // ───────── Claude ─────────
  {
    id: 'claude-models-and-pricing',
    group: 'claude',
    title: 'モデルの選び方と料金の考え方',
    summary: 'Fable・Opus・Sonnet・Haiku の使い分けと、費用の見積もり方。',
    intro: [
      'Claude には性能と速さ、料金の違う複数のモデルがあります。お客さまの用途に合わせて選び、費用の見込みを示せることが、提案の第一歩です。',
    ],
    sections: [
      {
        heading: '現行のモデルと使い分け',
        body: [
          '公式の案内では、迷ったらまず Claude Opus 5.5 から始めるのがすすめられています。長時間のコーディングや知的作業に向いたモデルです。',
          'Claude Fable 5.1 は、難しい推論や長時間かかるエージェントの作業向けです。Opus 5.5 で評価して足りないときに検討します。',
          'Claude Sonnet 5.5 は速さと賢さのバランスがよく、Claude Haiku 4.5 は最も速く、安いモデルです。大量の分類や抽出など、件数の多い処理に向きます。',
        ],
      },
      {
        heading: '料金はトークン単位',
        body: [
          '料金は、入力と出力のトークン数で決まります。100 万トークンあたりの基本料金（入力／出力）は、Fable 5.1 が 10／50 ドル、Opus 5.5 が 4／20 ドル、Sonnet 5.5 が 2／10 ドル、Haiku 4.5 が 1／5 ドルです。出力のほうが入力より高い点に注意します。',
          'すぐに結果がいらない処理は、Batch API を使うと半額になります。同じ長い前置き（システムプロンプトや資料）を繰り返し送る場合は、プロンプトキャッシュで入力の費用を大きく下げられます。',
        ],
      },
      {
        heading: '費用の見積もり方',
        body: [
          '「1 件あたりの入力トークン数 × 件数」と「1 件あたりの出力トークン数 × 件数」を出し、それぞれに単価を掛けます。実際のデータで数件試し、使ったトークン数を測ってから掛け算すると、見積もりの精度が上がります。',
          '最初は高性能なモデルで品質を確かめ、評価を見ながら安いモデルに切り替えられるかを試す、という順番が現実的です。',
        ],
      },
    ],
    resources: [
      { title: 'モデルの概要（Models overview）', url: `${CLAUDE_DOCS}/about-claude/models/overview`, kind: '公式ドキュメント' },
      { title: '料金（Pricing）', url: `${CLAUDE_DOCS}/about-claude/pricing`, kind: '公式ドキュメント', note: 'Batch・キャッシュ・長いコンテキストの料金も載っています' },
      { title: 'モデルの選び方（Choosing the right model）', url: `${CLAUDE_DOCS}/about-claude/models/choosing-a-model`, kind: '公式ドキュメント' },
    ],
  },
  {
    id: 'claude-adoption-patterns',
    group: 'claude',
    title: 'よくある導入の型',
    summary: '社内の質問応答・文書検索（RAG）・業務の自動化・開発支援。どの型かで、作るものが変わる。',
    intro: ['お客さまの「AI を使いたい」は、たいてい次のどれかの型に当てはまります。型が決まると、必要なデータ・作るもの・評価のしかたが見えてきます。'],
    sections: [
      {
        heading: '一、社員が直接使う（チャット）',
        body: ['Claude のチーム向け・企業向けのプランを導入し、社員が文章作成や調べものに使う形です。開発はほとんど要りませんが、利用ルールづくりと研修が成功の鍵になります。'],
      },
      {
        heading: '二、社内の文書をもとに答える（RAG）',
        body: [
          '規程やマニュアルなど、社内の文書を検索して、その内容をもとに答えさせる形です。モデルが知らない社内の情報を扱えます。',
          '品質は、文書の分け方（チャンク）や検索の精度に大きく左右されます。回答に出典を付けると、利用者が確かめやすくなります。',
        ],
      },
      {
        heading: '三、業務を自動で進める（エージェント）',
        body: [
          'Claude にツール（社内システムの API や MCP サーバー）を使わせ、問い合わせの一次対応やデータの集計などを自動で進める形です。',
          'できることが増えるぶん、権限の絞り込みと、人が確認する段階の設計が欠かせません。Anthropic は、まず単純な仕組みから始め、必要なときだけ複雑にすることをすすめています。',
        ],
      },
      {
        heading: '四、開発を速くする（Claude Code）',
        body: ['開発者が Claude Code を使い、コードの作成・修正・調査を任せる形です。お客さまの開発チームの生産性向上として提案できます。'],
      },
    ],
    checklist: ['誰が使うか（社員・お客さま・システム）', '社内のデータを使う必要があるか', '人の確認なしに実行してよい操作はどれか', '何をもって成功とするか'],
    resources: [
      { title: 'Building Effective AI Agents（Anthropic）', url: 'https://www.anthropic.com/engineering/building-effective-agents', kind: '公式サイト', note: 'エージェントを単純な構成から始める考え方' },
      { title: 'ハルシネーションを減らす', url: `${CLAUDE_DOCS}/test-and-evaluate/strengthen-guardrails/reduce-hallucinations`, kind: '公式ドキュメント' },
    ],
  },
  {
    id: 'claude-data-handling',
    group: 'claude',
    title: 'データの扱いと、お客さまへの説明',
    summary: '入力は学習に使われるのか、どれだけ保存されるのか。導入前に必ず聞かれる質問への答え方。',
    intro: ['企業のお客さまが最初に気にするのは、「入れたデータがどう扱われるか」です。公式の説明に沿って、正確に答えられるようにしておきます。'],
    sections: [
      {
        heading: '学習に使われるか',
        body: [
          'API やチーム向け・企業向けのプランなど、商用の製品では、入力と出力は既定ではモデルの学習に使われません。',
          '例外は、利用者がフィードバック（良い・悪いの評価ボタンなど）を送った場合や、利用を明示的に許可した場合です。社内の利用ルールで、フィードバックの扱いも決めておくと安心です。',
        ],
      },
      {
        heading: 'どれだけ保存されるか',
        body: [
          'API の入力と出力は、既定では受け取ってから 30 日以内に削除されます。データを保存しない契約（Zero Data Retention）を結ぶこともできます。',
          'ただし、利用ポリシーへの違反と判定された場合は最長 2 年、送られたフィードバックは 5 年保存されるなどの例外があります。',
        ],
      },
      {
        heading: 'クラウド経由で使う場合',
        body: [
          'Claude は Amazon Bedrock・Google Cloud・Microsoft Foundry・Databricks などからも使えます。その場合は、経由するサービスのデータの条件も確認します。お客さまがすでに契約しているクラウドを使うと、社内の審査が通りやすいこともあります。',
        ],
      },
    ],
    checklist: ['学習に使われない条件を説明できるか', '保存期間と例外を説明できるか', '個人情報や機密情報を送る前に伏せる仕組みが要るか', 'どのクラウド・契約経由で使うか'],
    resources: [
      { title: 'データはモデルの学習に使われるか（商用製品）', url: 'https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training', kind: '公式サイト' },
      { title: '組織のデータの保存期間', url: 'https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data', kind: '公式サイト' },
    ],
  },
  {
    id: 'claude-strengths-and-limits',
    group: 'claude',
    title: 'できること・苦手なこと',
    summary: '期待値を合わせるために、得意なことと、仕組みで補うべきことを整理する。',
    intro: ['導入がうまくいかない原因の多くは、期待値のずれです。得意なことと、仕組みで補うべきことを先に共有しておきます。'],
    sections: [
      {
        heading: '得意なこと',
        body: [
          '長い文書を読んで要約・比較すること（現行の主要モデルは 100 万トークンまで扱えます）、文章の作成と書き換え、コードの作成と修正、画像の内容を読み取ることなどです。',
        ],
      },
      {
        heading: '仕組みで補うこと',
        body: [
          '知識には締め切りがあり、それより新しい出来事は知りません。最新の情報や社内の情報は、検索や RAG で渡します。',
          '正確な計算や集計は、ツール（計算用のコードやデータベース）に任せます。',
          '出力は毎回同じとは限らず、もっともらしい誤りが混ざることもあります。根拠の引用を求める、評価用のデータで品質を測り続ける、重要な判断は人が確認する、といった仕組みで補います。',
          '入出力は文章で、画像を生成するモデルではありません。',
        ],
      },
    ],
    resources: [
      { title: 'モデルの概要（知識の締め切り・コンテキストの長さ）', url: `${CLAUDE_DOCS}/about-claude/models/overview`, kind: '公式ドキュメント' },
      { title: 'ハルシネーションを減らす', url: `${CLAUDE_DOCS}/test-and-evaluate/strengthen-guardrails/reduce-hallucinations`, kind: '公式ドキュメント' },
    ],
  },

  // ───────── Databricks ─────────
  {
    id: 'databricks-architecture',
    group: 'databricks',
    title: '全体の構成',
    summary: 'コントロールプレーンとコンピュートプレーン、ワークスペース、Unity Catalog の関係。',
    intro: ['Databricks の提案や設計では、「どこで何が動き、データがどこに置かれるか」を説明できることが大切です。'],
    sections: [
      {
        heading: 'コントロールプレーンとコンピュートプレーン',
        body: [
          'Databricks は、管理用の画面や裏側のサービスを動かす「コントロールプレーン」と、データを処理する「コンピュートプレーン」に分かれています。コントロールプレーンは Databricks のアカウントで動きます。',
          'コンピュートプレーンは2種類あります。クラシックのコンピュートはお客さまのクラウドアカウントの中で動き、サーバーレスのコンピュートは Databricks のアカウントの中で動きます。',
        ],
      },
      {
        heading: 'ワークスペース',
        body: ['利用者が作業する場所です。ノートブック、ジョブ、ダッシュボードなどはワークスペースの中にあります。部署や環境（開発・本番）ごとに分けることがよくあります。'],
      },
      {
        heading: 'Unity Catalog',
        body: [
          'データと AI の資産をまとめて管理する仕組みです。テーブル・ビュー・ボリューム・関数・モデルなどは「カタログ.スキーマ.オブジェクト」の3階層の名前で管理されます。',
          'クエリを実行するときやモデルを呼び出すときに、権限の確認、データの流れ（リネージ）の記録、監査のためのログの記録が自動で行われます。複数のワークスペースで同じ管理の仕組みを共有できます。',
        ],
      },
    ],
    resources: [
      { title: '全体の構成（High-level architecture）', url: `${DBX_DOCS}/getting-started/overview`, kind: '公式ドキュメント' },
      { title: 'Unity Catalog とは', url: `${DBX_DOCS}/data-governance/unity-catalog/`, kind: '公式ドキュメント' },
      { title: 'コンピュート（Compute）', url: `${DBX_DOCS}/compute/`, kind: '公式ドキュメント' },
    ],
  },
  {
    id: 'databricks-pricing',
    group: 'databricks',
    title: '料金の考え方',
    summary: 'DBU の仕組みと、費用が膨らむ典型的な原因、その抑え方。',
    intro: ['Databricks の費用は使った分だけかかるため、設計と運用の仕方で大きく変わります。お客さまに見積もりと抑え方を説明できるようにします。'],
    sections: [
      {
        heading: 'DBU（Databricks Unit）',
        body: [
          'Databricks は、処理量を表す単位「DBU」で料金を計算します。前払いはなく、秒単位の従量課金です。DBU の単価は、使う製品やコンピュートの種類によって違います。',
          'クラシックのコンピュートでは、Databricks の料金とは別に、お客さまのクラウドアカウントで動く仮想マシンやストレージの費用がクラウド事業者から請求されます。',
        ],
      },
      {
        heading: '費用が膨らむ典型的な原因',
        body: [
          '使っていないクラスターや SQL ウェアハウスが動き続けている、必要以上に大きなコンピュートを使っている、定期ジョブを対話用のコンピュートで動かしている、といったことが典型です。',
        ],
      },
      {
        heading: '抑え方',
        body: [
          '自動停止を必ず設定し、定期ジョブにはジョブ用のコンピュートを使います。使用量はシステムテーブル（system.billing.usage）で確かめられるので、部署やプロジェクトごとにタグを付けて集計し、予算を超えそうなときに気づける仕組みを作ります。',
        ],
      },
    ],
    checklist: ['自動停止を設定したか', '定期ジョブ用のコンピュートを分けたか', 'タグで費用を部署・案件ごとに集計できるか', 'クラウド側の費用も見積もりに入れたか'],
    resources: [
      { title: '料金（Pricing）', url: 'https://www.databricks.com/product/pricing', kind: '公式サイト' },
      { title: '課金対象の使用量のシステムテーブル', url: `${DBX_DOCS}/admin/system-tables/billing`, kind: '公式ドキュメント' },
      { title: 'サーバーレスのコンピュート', url: `${DBX_DOCS}/compute/serverless/`, kind: '公式ドキュメント' },
    ],
  },
  {
    id: 'databricks-migration',
    group: 'databricks',
    title: '既存のデータ基盤からの移行',
    summary: 'よくある進め方と、つまずきどころ。',
    intro: ['FDE の案件では、既存のデータウェアハウスや ETL を Databricks に移すことがよくあります。一度に全部を移すのではなく、段階を踏んで進めます。'],
    sections: [
      {
        heading: '進め方の例',
        body: [
          'まず現状を調べ、テーブル・ジョブ・利用者・費用を一覧にします。次に、影響の小さいデータから取り込みと変換を移し、BI ツールの接続先を切り替えます。しばらく新旧を並行して動かし、結果が一致することを確かめてから切り替えます。',
        ],
      },
      {
        heading: 'つまずきどころ',
        body: [
          'SQL の書き方の違い（方言）、権限の設計のやり直し、移行後の費用の見込み違い、利用者の慣れの問題がよく起こります。権限は Unity Catalog で最初に設計しておくと、後からのやり直しを減らせます。',
        ],
      },
    ],
    checklist: ['移す対象と優先順位を一覧にしたか', '新旧の結果を突き合わせる方法を決めたか', '権限の設計を先に済ませたか', '利用者向けの説明や研修を用意したか'],
    resources: [{ title: 'Unity Catalog とは', url: `${DBX_DOCS}/data-governance/unity-catalog/`, kind: '公式ドキュメント' }],
  },

  // ───────── FDE の進め方 ─────────
  {
    id: 'claude-on-databricks',
    group: 'fde',
    title: 'Claude と Databricks の組み合わせ方',
    summary: 'Databricks の上で Claude を使う構成と、その利点。',
    intro: ['Claude と Databricks を組み合わせると、ガバナンスの効いたデータの上で生成 AI を使えます。FDE が提案できる代表的な構成です。'],
    sections: [
      {
        heading: 'Databricks の上で Claude を呼び出す',
        body: [
          'Databricks では、Claude の主要なモデルを Unity Gateway 経由で使えます。使った分だけ払う従量課金のほか、処理能力をあらかじめ確保する方式も選べます。使えるモデルは、公式の一覧で確認します。',
          'SQL の ai_query 関数を使うと、テーブルの大量の行に対して、要約や分類を一括で実行できます。',
        ],
      },
      {
        heading: '組み合わせる利点',
        body: [
          'データを Databricks の外に出さずに処理でき、Unity Catalog の権限管理や監査の仕組みをそのまま使えます。Unity Catalog は、モデルのサービスや MCP のサービスも管理の対象にしています。',
        ],
      },
      {
        heading: 'エージェントにつなぐ',
        body: ['Databricks は、エージェントからデータやツールを使うための MCP にも対応しています。Claude のエージェントから、権限の範囲内で Databricks のデータを使う構成を組めます。'],
      },
    ],
    resources: [
      { title: 'Databricks で使えるモデル', url: `${DBX_DOCS}/machine-learning/model-serving/foundation-model-overview`, kind: '公式ドキュメント' },
      { title: 'ai_query 関数', url: `${DBX_DOCS}/sql/language-manual/functions/ai_query`, kind: '公式ドキュメント' },
      { title: 'MCP とエージェントのツール（Databricks）', url: `${DBX_DOCS}/generative-ai/mcp/`, kind: '公式ドキュメント' },
    ],
  },
  {
    id: 'fde-poc',
    group: 'fde',
    title: 'PoC の進め方',
    summary: 'ヒアリング、成功の基準づくり、評価、本番化の判断まで。',
    intro: ['PoC（概念実証）の目的は、「本番に進むかどうか」を判断できる材料をそろえることです。作ること自体が目的にならないようにします。'],
    sections: [
      {
        heading: '一、ヒアリング',
        body: ['どの業務の、どんな困りごとを解くのかを具体的にします。使えるデータ、守るべき制約（セキュリティ・予算・期限）、最終的に判断する人も確かめます。'],
      },
      {
        heading: '二、成功の基準を先に決める',
        body: ['「回答の正しさが 9 割以上」「1 件あたりの処理時間を半分に」のように、測れる基準を作る前に合意します。Anthropic も、評価の前に成功の基準を決めることをすすめています。'],
      },
      {
        heading: '三、小さく作って評価する',
        body: ['対象を絞って最小限の仕組みを作り、正解付きの評価用データで品質を測ります。うまくいかない例を集め、プロンプトや検索の仕組みを改善します。'],
      },
      {
        heading: '四、本番化を判断する',
        body: ['基準に対する結果、本番での費用の見込み、残る課題と対策をまとめ、本番に進むか、やり方を変えるか、やめるかを判断してもらいます。'],
      },
    ],
    checklist: ['対象の業務と困りごとが具体的か', '測れる成功の基準に合意したか', '評価用のデータ（正解付き）があるか', '本番の費用を見積もったか'],
    resources: [{ title: '成功の基準と評価の作り方', url: `${CLAUDE_DOCS}/test-and-evaluate/develop-tests`, kind: '公式ドキュメント' }],
  },
  {
    id: 'fde-production-checklist',
    group: 'fde',
    title: '本番化のチェックリスト',
    summary: '権限・監視・費用・障害時の対応・モデルの更新。本番に出す前に確かめること。',
    intro: ['PoC で動いたものを本番で使い続けるには、品質以外の準備が要ります。次の項目を、お客さまと一緒に確かめます。'],
    sections: [
      {
        heading: '権限とデータ',
        body: ['AI やエージェントに与える権限は、必要最小限にします。データの扱い（学習に使われない条件、保存期間）を、お客さまの社内規程と照らし合わせて説明できる状態にします。'],
      },
      {
        heading: '監視と品質',
        body: ['入出力やエラーのログを残し、品質を定期的に評価します。プロンプトやモデルを変えるときは、評価用のデータで品質が落ちていないかを確かめます。'],
      },
      {
        heading: '費用',
        body: ['利用量と費用を毎日確認できるようにし、予算を超えそうなときに通知が届くようにします。'],
      },
      {
        heading: '障害と引き継ぎ',
        body: ['モデルや外部サービスが使えないときの代わりの手段と、AI が判断できないときに人へ引き継ぐ流れを決めておきます。'],
      },
      {
        heading: 'モデルの更新',
        body: ['モデルには提供終了の予定日があります。使っているモデルの予定日を確認し、新しいモデルへの切り替えを計画に入れておきます。'],
      },
    ],
    checklist: [
      '権限を必要最小限にしたか',
      'データの扱いを社内規程と照らし合わせたか',
      'ログと品質の定期評価の仕組みがあるか',
      '費用の上限と通知を設定したか',
      '障害時の代わりの手段と、人への引き継ぎを決めたか',
      '使うモデルの提供終了予定日を確認したか',
      '利用者への説明・研修を用意したか',
    ],
    resources: [
      { title: 'モデルの提供終了の予定（Model deprecations）', url: `${CLAUDE_DOCS}/about-claude/model-deprecations`, kind: '公式ドキュメント' },
      { title: '成功の基準と評価の作り方', url: `${CLAUDE_DOCS}/test-and-evaluate/develop-tests`, kind: '公式ドキュメント' },
    ],
  },
];

export function getBasicsTopic(id: string): BasicsTopic | undefined {
  return BASICS_TOPICS.find((t) => t.id === id);
}

export function basicsForGroup(group: BasicsGroup): BasicsTopic[] {
  return BASICS_TOPICS.filter((t) => t.group === group);
}
