import type { Resource } from '@/lib/quiz/types';

/** 基礎知識のまとまり。資格の範囲ではなく、FDE の現場で必要になる知識で分ける */
export type BasicsGroup = 'claude' | 'databricks' | 'fde';

export type BasicsTopic = {
  id: string;
  group: BasicsGroup;
  /** 正式な提供前の機能などの状態（応用知識で使う） */
  status?: 'パブリックプレビュー' | 'ベータ版' | 'Labs（サポートなし）';
  /** 公式の情報で確かめた日（省略すると BASICS_CHECKED_ON） */
  checkedOn?: string;
  title: string;
  summary: string;
  intro: string[];
  sections: { heading: string; body: string[] }[];
  /** 現場でそのまま使える確認項目（任意） */
  checklist?: string[];
  /** あわせて読む（サイト内の別のページ） */
  seeAlso?: { href: string; title: string }[];
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

  {
    id: 'claude-tool-design',
    group: 'claude',
    title: 'ツールの設計',
    summary: '何をツールにし、どう説明し、どこまで任せるか。エージェントの出来を左右する設計の考え方。',
    intro: ['Claude にお客さまのシステムを使わせるときは、ツール（関数）を定義して渡します。ツールの切り方と説明の書き方で、正確さも安全性も大きく変わります。'],
    sections: [
      {
        heading: 'ツールの仕組み',
        body: [
          'ツールは名前（name）・説明（description）・入力の形（input_schema）で定義します。Claude はツールを使うと判断すると tool_use を返すので、アプリ側でツールを実行し、結果を tool_result として返します。',
        ],
      },
      {
        heading: '何をツールにするか',
        body: [
          'お客さまの業務の単位で切ると、Claude が選びやすくなります。「API を1つずつ全部ツールにする」より、「顧客情報を調べる」「注文を作る」のように、業務の言葉で分けます。',
          '読み取りと書き込みは別のツールに分けます。読み取りは自由に、書き込みは確認付きに、のように扱いを変えられます。',
        ],
      },
      {
        heading: '説明は具体的に書く',
        body: ['description には、何をするツールか、いつ使うか、いつ使わないか、何が返るか、入力の注意点を書きます。名前と入力の形が同じくらい明確なら、Claude がツールを見分ける材料は、ほぼ説明だけになります。'],
      },
      {
        heading: '似たツールで、いつも片方が選ばれるとき',
        body: [
          'たとえば「注文を探す」ツールと「返品を探す」ツールがあり、返品のことを聞かれても注文のツールばかり選ばれる、という問題はよく起こります。まず直すべきは説明です。それぞれに「どんな依頼のときに使うか」「何が返るか」「もう一方とどう違うか」を書き分けます。',
          '入力の形やツール名を変える、ツールを1つにまとめる、といった対策は、説明を直しても解決しないときに考えます。',
        ],
      },
      {
        heading: '結果は信頼できないデータとして扱う',
        body: ['Web ページやメールなど、外部から来た文章をツールの結果として渡すと、そこに紛れた指示（プロンプトインジェクション）に従ってしまうおそれがあります。重要な操作の前には、人の確認や、決まった条件のチェックを挟みます。'],
      },
    ],
    checklist: ['ツールを業務の言葉で切ったか', '読み取りと書き込みを分けたか', '説明に「いつ使うか・使わないか」を書いたか', '書き込みの前に確認を挟んだか'],
    resources: [{ title: 'ツールの使い方（Tool use）', url: `${CLAUDE_DOCS}/agents-and-tools/tool-use/overview`, kind: '公式ドキュメント' }],
  },
  {
    id: 'claude-mcp-in-practice',
    group: 'claude',
    title: 'MCP を現場で使う',
    summary: '社内システムを MCP サーバーにして、Claude や Claude Code から使えるようにする。',
    intro: ['MCP（Model Context Protocol）は、AI アプリと外部のツールやデータをつなぐための共通の約束事です。一度 MCP サーバーを作れば、MCP に対応したいろいろな AI アプリから使えます。'],
    sections: [
      {
        heading: 'ホスト・クライアント・サーバー',
        body: ['Claude Code などの AI アプリ（ホスト）は、つなぐ MCP サーバーごとにクライアントを作ります。サーバーは、Tools（実行できる操作）、Resources（読むデータ）、Prompts（使い回すテンプレート）を公開します。'],
      },
      {
        heading: 'つなぎ方は2通り',
        body: [
          'stdio では、AI アプリが MCP サーバーを自分の子プロセスとして起動し、標準入出力でやりとりします。同じパソコンの上で、1人が使う形に向いていて、ネットワークの設定も要りません。',
          'Streamable HTTP では、サーバーが1つの窓口（エンドポイント）で HTTP のリクエストを受けます。離れた場所からつなぐ、複数の利用者が同時に使う、利用者ごとに認証する、台数を増やして負荷に耐える、といった場合はこちらを使います。お客さまのチームで共有するなら、HTTP のサーバーを1か所に置き、認証を付けるのが一般的です。',
        ],
      },
      {
        heading: 'Claude Code での共有のしかた',
        body: ['Claude Code では、MCP サーバーの設定を local（自分だけ・このプロジェクト）、project（.mcp.json に保存してチームで共有）、user（自分のすべてのプロジェクト）から選べます。チームで使うサーバーは project にしてリポジトリに入れると、全員が同じ設定で使えます。'],
      },
      {
        heading: '最新の仕様の変化',
        body: ['2026-07-28 版の仕様では、すべてのリクエストがバージョンなどの情報を持つステートレスな設計になりました。サーバーを作るときは、使う SDK が対応している仕様の版を確かめます。'],
      },
    ],
    checklist: ['手元用（stdio）か共有用（HTTP）かを決めたか', '共有するサーバーに認証を付けたか', 'チームの設定を .mcp.json で共有するか決めたか'],
    resources: [
      { title: 'MCP の仕様', url: 'https://modelcontextprotocol.io/specification/latest', kind: '仕様' },
      { title: 'Claude Code で MCP を使う', url: 'https://code.claude.com/docs/en/mcp', kind: '公式ドキュメント' },
    ],
  },
  {
    id: 'claude-code-for-teams',
    group: 'claude',
    title: 'Claude Code をチームに導入する',
    summary: 'CLAUDE.md・権限・フック・Skill・サブエージェントで、チームで安全に使える形を作る。',
    intro: ['Claude Code を個人で使うのとチームで使うのとでは、準備が違います。全員が同じ前提で、決まった範囲で動かせるようにします。'],
    sections: [
      {
        heading: 'CLAUDE.md でプロジェクトの前提を共有する',
        body: ['リポジトリに CLAUDE.md を置き、ビルドやテストのコマンド、コードの書き方の決まり、触ってはいけない場所などを書きます。Claude Code は毎回これを読んでから作業します。'],
      },
      {
        heading: '権限は settings.json で強制する',
        body: ['実行してよいコマンドや、読んではいけないファイルは、settings.json の permissions で決めます。プロジェクトの .claude/settings.json に書いてリポジトリに入れると、チーム全員に同じ制限がかかります。'],
      },
      {
        heading: 'フックで決まった処理を必ず走らせる',
        body: ['ファイルを編集したら整形ツールを走らせる、危険なコマンドの前に止める、といった処理はフックで自動化します。PreToolUse のフックが終了コード 2 で終わると、そのツールの実行を止められます。'],
      },
      {
        heading: 'Skill とサブエージェントで仕事を任せる',
        body: ['繰り返す手順は Skill（.claude/skills/）に、調査やレビューのような独立した仕事はサブエージェント（.claude/agents/）にまとめます。CI では claude -p（非対話モード）や GitHub Actions との連携で動かせます。'],
      },
    ],
    checklist: ['CLAUDE.md にコマンドと決まりを書いたか', '禁止したい操作を permissions で止めたか', '整形やテストをフックで自動化したか', 'チームの Skill とサブエージェントをリポジトリで共有したか'],
    seeAlso: [
      { href: '/advanced/databricks-omnigent', title: '新しい動き（応用知識）：Omnigent でエージェントを束ねる' },
    ],
    resources: [
      { title: '設定ファイル（Settings）', url: 'https://code.claude.com/docs/en/settings', kind: '公式ドキュメント' },
      { title: 'フック（Hooks）', url: 'https://code.claude.com/docs/en/hooks', kind: '公式ドキュメント' },
      { title: 'サブエージェント', url: 'https://code.claude.com/docs/en/sub-agents', kind: '公式ドキュメント' },
      { title: 'Claude Code GitHub Actions', url: 'https://code.claude.com/docs/en/github-actions', kind: '公式ドキュメント' },
    ],
  },
  {
    id: 'claude-cost-optimization',
    group: 'claude',
    title: 'コストと速さの最適化',
    summary: 'プロンプトキャッシュ・Batch・モデルの使い分け・effort で、品質を保ったまま費用と待ち時間を下げる。',
    intro: ['本番で使い始めると、費用と応答の速さが問題になります。品質を測りながら、次の手を順に試します。'],
    sections: [
      {
        heading: 'プロンプトキャッシュ',
        body: [
          '長いシステムプロンプトや資料など、毎回同じ前半部分を送る場合に効きます。キャッシュの持続は 5 分（既定）か 1 時間で、キャッシュからの読み込みは通常の入力の料金の約 1 割で済みます（Opus 5.5 は 5%）。',
          'キャッシュは前半部分が一致しないと効かないので、変わらない部分を先頭に、変わる部分を後ろに置きます。',
        ],
      },
      {
        heading: 'Message Batches API',
        body: [
          'すぐに結果がいらない大量の処理は、Batch でまとめて送ると料金が半額になります。夜間の一括処理や、評価用のデータの採点などに向きます。',
          '時間の制限は2種類あり、混同しないよう注意します。処理には最大 24 時間かかることがあり（多くは 1 時間以内に終わります）、24 時間以内に終わらなかったリクエストは期限切れになります。結果は、作成から 29 日間取得できます。',
        ],
      },
      {
        heading: 'モデルと effort の使い分け',
        body: [
          '簡単な分類や抽出は Haiku 4.5 のような速くて安いモデルで足りることが多くあります。難しい部分だけを高性能なモデルに回す構成も有効です。',
          '考える深さは effort で調整できます。effort を下げると、速く安くなる代わりに、難しい問題での精度が下がることがあります。',
        ],
      },
      {
        heading: '送る前に数える',
        body: ['トークン数を数える API（count_tokens）は無料です。送る前に入力の大きさを確かめ、費用の見積もりや、上限を超えないかの確認に使えます。'],
      },
    ],
    checklist: ['変わらない前半部分にキャッシュを使ったか', '急がない処理を Batch にしたか', '安いモデルで足りる部分を見つけたか', '変更のたびに品質を評価したか'],
    resources: [
      { title: 'プロンプトキャッシュ', url: `${CLAUDE_DOCS}/build-with-claude/prompt-caching`, kind: '公式ドキュメント' },
      { title: 'Batch 処理', url: `${CLAUDE_DOCS}/build-with-claude/batch-processing`, kind: '公式ドキュメント' },
      { title: 'effort', url: `${CLAUDE_DOCS}/build-with-claude/effort`, kind: '公式ドキュメント' },
      { title: 'トークン数を数える', url: `${CLAUDE_DOCS}/build-with-claude/token-counting`, kind: '公式ドキュメント' },
    ],
  },
  {
    id: 'claude-evals',
    group: 'claude',
    title: '評価の作り方',
    summary: '「良くなったか」を感覚ではなく数字で判断するための、評価用データと採点の作り方。',
    intro: ['生成 AI の仕組みは、プロンプトやモデルを少し変えるだけで結果が変わります。評価の仕組みがないと、改善したのか悪化したのか分かりません。'],
    sections: [
      {
        heading: '成功の基準を先に決める',
        body: ['「正しく分類できる割合が 9 割以上」「回答に必ず出典が付く」のように、測れる基準を決めます。お客さまと合意しておくと、PoC の判断もしやすくなります。'],
      },
      {
        heading: '評価用のデータを作る',
        body: ['実際の業務に近い入力と、期待する答えを組にして集めます。よくある例だけでなく、まれで境界的な例（エッジケース）や、断るべき依頼も入れます。'],
      },
      {
        heading: '採点のしかたは3種類',
        body: [
          'コードで判定する（完全一致・形式のチェックなど）は速くて確実です。言い回しの自由な答えは、採点の基準表（ルーブリック）を渡して、別のモデルに採点させる方法もあります。最終的な品質の確認や、採点の妥当性の確認には、人による評価を組み合わせます。',
        ],
      },
      {
        heading: '変更のたびに回す',
        body: ['プロンプトやモデルを変えるたびに評価を回し、以前より悪くなっていないか（回帰）を確かめます。CI に組み込むと、確認の漏れを防げます。'],
      },
    ],
    checklist: ['測れる成功の基準があるか', 'エッジケースを含む評価用データがあるか', '採点のしかたを決めたか', '変更のたびに評価を回す仕組みがあるか'],
    resources: [{ title: '成功の基準と評価の作り方', url: `${CLAUDE_DOCS}/test-and-evaluate/develop-tests`, kind: '公式ドキュメント' }],
  },
  {
    id: 'claude-agent-design',
    group: 'claude',
    title: 'エージェントの設計',
    summary: '決まった流れ（ワークフロー）と、自分で考えて動くエージェントの使い分け。',
    intro: ['「エージェントを作りたい」という相談でも、実際には決まった流れの自動化で足りることがよくあります。Anthropic も、まず単純な仕組みから始め、必要なときだけ複雑にすることをすすめています。'],
    sections: [
      {
        heading: '違いの本質は、だれが次の手を決めるか',
        body: [
          'ワークフローでは、開発者がコードで手順と分岐を前もって決め、モデルはその中の各段階を受け持ちます。エージェントでは、モデル自身がループの中で途中の結果（ツールの結果など）を見て、次にどのツールを使い、何をするかを決めます。',
          'ツールを使うか、構造化した出力を返すかは、どちらでも使えるので、見分けるポイントにはなりません。',
        ],
      },
      {
        heading: 'ワークフローの型',
        body: ['処理を順につなぐ（プロンプトの連結）、入力で振り分ける（ルーティング）、並行して処理する、取りまとめ役が仕事を割り振る、作った結果を別の役が評価して直す、といった型があります。流れが決まっている業務なら、まずこれらで組みます。'],
      },
      {
        heading: 'エージェントが向く場面',
        body: ['手順を前もって決められず、状況を見ながら次の手を選ぶ必要がある場面に向きます。そのぶん費用と時間がかかり、結果もぶれやすいので、権限の絞り込みと人の確認がいっそう大切になります。'],
      },
      {
        heading: '作るための道具',
        body: ['Claude Agent SDK を使うと、Claude Code と同じ仕組み（ツールの実行、文脈の管理、サブエージェントなど）を、自分のアプリに組み込めます。'],
      },
    ],
    checklist: ['ワークフローで足りないかを先に検討したか', 'エージェントに与える権限を絞ったか', '人が確認する段階を設けたか', '費用と時間の上限を決めたか'],
    seeAlso: [
      { href: '/advanced/databricks-omnigent', title: '新しい動き（応用知識）：Omnigent でエージェントを束ねる' },
    ],
    resources: [
      { title: 'Building Effective AI Agents（Anthropic）', url: 'https://www.anthropic.com/engineering/building-effective-agents', kind: '公式サイト' },
      { title: 'Agent SDK の概要', url: `${CLAUDE_DOCS}/agent-sdk/overview`, kind: '公式ドキュメント' },
    ],
  },
  {
    id: 'claude-context-management',
    group: 'claude',
    title: 'コンテキストの管理',
    summary: 'コンテキストは限りある資源。長く動くエージェントの集中力を保つための、分ける・まとめる・書き留める工夫。',
    intro: [
      'エージェントを長く動かすと、ツールの結果やファイルの中身がコンテキストにたまり、関係のない情報に埋もれて精度が落ちていきます。Anthropic は、コンテキストを「限りがあり、増えるほど効き目が下がる資源」として扱うようすすめています。',
    ],
    sections: [
      {
        heading: 'ウィンドウを広げるだけでは解決しない',
        body: [
          'コンテキストウィンドウを大きくすれば入る量は増えますが、関係のない情報が混ざる問題（コンテキストの汚染）は残り、トークンも増え続けます。Anthropic も、どの大きさのウィンドウでもこの問題は起こりうるとしています。容量ではなく、中身の質の問題として扱います。',
        ],
      },
      {
        heading: '分ける: サブエージェント',
        body: [
          '独立した調べものに分けられる仕事は、サブエージェントに任せます。サブエージェントは自分のコンテキストでツールを使い、大量の検索結果やログを処理して、要約だけを返します。元のエージェントのコンテキストは小さいまま保たれます。',
          '何度もやりとりしながら仕上げる作業は、分けずに元の会話で進めたほうが向いています。',
        ],
      },
      {
        heading: 'まとめる・書き留める',
        body: [
          'コンテキストが上限に近づいたら、それまでの内容を要約して入れ替えます（コンパクション）。長い仕事では、進み具合や決めたことをファイルなどに書き留めておき、必要なときに読み直す方法も有効です。',
          'ツールの結果も、必要な部分だけを返すように作ると、コンテキストを汚しにくくなります。',
        ],
      },
    ],
    checklist: ['独立した調べものをサブエージェントに分けたか', 'ツールが必要以上に大きな結果を返していないか', '長い仕事の途中経過を書き留める仕組みがあるか'],
    resources: [
      { title: 'Effective context engineering for AI agents（Anthropic）', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents', kind: '公式サイト' },
      { title: 'サブエージェント（Claude Code）', url: 'https://code.claude.com/docs/en/sub-agents', kind: '公式ドキュメント' },
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

  {
    id: 'databricks-permission-design',
    group: 'databricks',
    title: 'Unity Catalog の権限設計',
    summary: 'カタログの分け方、グループへの付与、行・列の制御。後からやり直さないための設計。',
    intro: ['権限の設計は、移行やデータ活用の最初に決めておくべきことです。後から直そうとすると、利用者への影響が大きくなります。'],
    sections: [
      {
        heading: '3 階層と、必要な権限の組み合わせ',
        body: ['データは「カタログ.スキーマ.テーブル」の3階層で管理します。テーブルを読むには、テーブルの SELECT に加えて、親のカタログの USE CATALOG と、スキーマの USE SCHEMA が必要です。'],
      },
      {
        heading: 'カタログの分け方',
        body: ['開発・検証・本番の環境ごと、または事業部ごとにカタログを分けると、権限をまとめて管理できます。カタログやスキーマに付けた権限は、その中のテーブル（後から作るものも含む）に引き継がれます。'],
      },
      {
        heading: '権限はグループに付ける',
        body: ['個人ではなくグループに付けると、人の異動や退職のたびに権限を付け直さずに済みます。本番のジョブは、個人ではなくサービスプリンシパルで動かします。'],
      },
      {
        heading: '行と列の制御',
        body: ['同じテーブルでも、部署によって見せる行を変えたり、個人情報の列を伏せたりできます（行フィルター・列マスク）。属性にもとづく制御（ABAC）も一般提供されています。'],
      },
    ],
    checklist: ['環境や事業部ごとのカタログの分け方を決めたか', '権限をグループに付けたか', '本番のジョブをサービスプリンシパルで動かすか', '個人情報の列の扱いを決めたか'],
    resources: [
      { title: '権限の管理（Manage privileges）', url: `${DBX_DOCS}/data-governance/unity-catalog/manage-privileges/`, kind: '公式ドキュメント' },
      { title: '行フィルターと列マスク', url: `${DBX_DOCS}/tables/row-and-column-filters`, kind: '公式ドキュメント' },
    ],
  },
  {
    id: 'databricks-lakeflow',
    group: 'databricks',
    title: 'Lakeflow でデータパイプラインを作る',
    summary: '取り込み（Lakeflow Connect）・変換（Lakeflow パイプライン）・実行の管理（Lakeflow Jobs）の役割分担。',
    intro: ['Databricks のデータの流れは、Lakeflow という名前の3つの機能で組み立てます。どれを何に使うかが分かると、設計の会話がしやすくなります。'],
    sections: [
      {
        heading: '取り込む: Lakeflow Connect',
        body: ['業務システムや SaaS、データベースからデータを取り込むための、用意された接続（コネクタ）です。自分で取り込みの処理を書かずに済みます。'],
      },
      {
        heading: '変換する: Lakeflow パイプライン',
        body: [
          'Spark Declarative Pipelines（旧 Delta Live Tables）にもとづく、宣言的なパイプラインです。「どんなテーブルを作りたいか」を書くと、処理の順番や増分の更新は Databricks が管理します。',
          'エクスペクテーション（期待する条件）を書くと、条件に合わないデータを記録したり、取り除いたりできます。',
        ],
      },
      {
        heading: '実行を管理する: Lakeflow Jobs',
        body: ['ノートブック・パイプライン・SQL などのタスクを、依存関係を付けて順番に実行し、スケジュールや失敗時の再実行を管理します。'],
      },
      {
        heading: 'メダリオンアーキテクチャ',
        body: ['取り込んだままの Bronze、整えた Silver、業務で使う形に集計した Gold、の3段に分けるのが定番の設計です。どの段で何を保証するかを決めておくと、品質の問題を追いやすくなります。'],
      },
    ],
    checklist: ['取り込み・変換・実行の役割を分けたか', 'Bronze・Silver・Gold の役割を決めたか', 'データの品質の条件（エクスペクテーション）を書いたか', '失敗時の通知と再実行を設定したか'],
    resources: [
      { title: 'Lakeflow Connect', url: `${DBX_DOCS}/ingestion/lakeflow-connect/`, kind: '公式ドキュメント' },
      { title: 'Lakeflow パイプライン', url: `${DBX_DOCS}/ldp/`, kind: '公式ドキュメント' },
      { title: 'Lakeflow Jobs', url: `${DBX_DOCS}/jobs/`, kind: '公式ドキュメント' },
    ],
  },
  {
    id: 'databricks-delta-operations',
    group: 'databricks',
    title: 'Delta Lake の運用',
    summary: '履歴とタイムトラベル、MERGE、小さなファイルの整理、liquid clustering と予測的最適化。',
    intro: ['Databricks のテーブルは、標準で Delta Lake の形式で保存されます。本番で使い続けるには、性能と費用を保つための運用の知識が要ります。'],
    sections: [
      {
        heading: '履歴とタイムトラベル',
        body: ['変更はすべて履歴（トランザクションログ）に残るので、過去の版を読んだり、誤った更新から元に戻したりできます。DESCRIBE HISTORY で、だれがいつ何をしたかを確かめられます。'],
      },
      {
        heading: 'MERGE で差分を反映する',
        body: ['MERGE INTO を使うと、新しいデータと既存のテーブルを突き合わせて、更新・追加・削除をまとめて行えます。業務システムの変更を取り込むときの基本の操作です。'],
      },
      {
        heading: '小さなファイルと不要なファイル',
        body: ['取り込みを繰り返すと小さなファイルが増え、読み込みが遅くなります。OPTIMIZE でまとめ、VACUUM で不要になった古いファイルを削除します（既定では 7 日より古いもの）。'],
      },
      {
        heading: 'liquid clustering と予測的最適化',
        body: ['liquid clustering は、よく絞り込みに使う列でデータを並べ、読み込みを速くする仕組みで、後から並べる列を変えられます。予測的最適化を有効にすると、OPTIMIZE や VACUUM を Databricks が自動で行います。'],
      },
    ],
    checklist: ['誤更新から戻す手順（タイムトラベル）を確かめたか', '小さなファイルの整理を自動化したか', 'よく絞り込む列で liquid clustering を検討したか'],
    resources: [
      { title: 'テーブルの履歴', url: `${DBX_DOCS}/delta/history`, kind: '公式ドキュメント' },
      { title: 'liquid clustering', url: `${DBX_DOCS}/delta/clustering`, kind: '公式ドキュメント' },
      { title: '予測的最適化', url: `${DBX_DOCS}/optimizations/predictive-optimization`, kind: '公式ドキュメント' },
    ],
  },
  {
    id: 'databricks-sql-and-bi',
    group: 'databricks',
    title: 'Databricks SQL と AI/BI',
    summary: 'SQL ウェアハウス、ダッシュボード、自然言語で質問できる Genie。分析する人に届ける部分。',
    intro: ['データ基盤の価値は、分析する人や業務の担当者に届いて初めて生まれます。Databricks SQL と AI/BI は、その「届ける」部分を受け持ちます。'],
    sections: [
      {
        heading: 'SQL ウェアハウス',
        body: ['SQL を実行するためのコンピュートです。サーバーレス・Pro・Classic の種類があり、サーバーレスはすぐに起動し、使わないときは自動で止まります。ai_query など一部の機能は Classic では使えません。'],
      },
      {
        heading: 'ダッシュボード',
        body: ['SQL の結果をグラフや表にまとめ、関係者に共有します。Unity Catalog の権限が効くので、見せてよいデータだけが表示されます。'],
      },
      {
        heading: 'Genie',
        body: ['業務の担当者が、自然言語でデータに質問できる仕組みです。使えるテーブル・用語の意味・よく使う問い合わせの例を登録しておくと、答えの精度が上がります。'],
      },
    ],
    checklist: ['用途に合う SQL ウェアハウスの種類を選んだか', 'ダッシュボードの共有範囲を権限で管理したか', 'Genie に用語の意味と問い合わせの例を登録したか'],
    seeAlso: [
      { href: '/advanced/databricks-genie-ontology', title: '新しい動き（応用知識）：オントロジーで AI に業務の意味を伝える（Genie Ontology）' },
    ],
    resources: [
      { title: 'SQL ウェアハウス', url: `${DBX_DOCS}/compute/sql-warehouse/`, kind: '公式ドキュメント' },
      { title: 'ダッシュボード', url: `${DBX_DOCS}/dashboards/`, kind: '公式ドキュメント' },
      { title: 'Genie', url: `${DBX_DOCS}/genie/`, kind: '公式ドキュメント' },
    ],
  },
  {
    id: 'databricks-genai-apps',
    group: 'databricks',
    title: '生成 AI アプリを作る',
    summary: 'Model Serving・AI Search・Agent Bricks・MLflow・Unity Gateway で、データの上に生成 AI を組み立てる。',
    intro: ['Databricks では、データの管理と同じ場所で生成 AI のアプリを作れます。部品の役割を押さえておくと、Claude と組み合わせた提案がしやすくなります。'],
    sections: [
      {
        heading: 'モデルを呼ぶ: Model Serving と Unity Gateway',
        body: ['基盤モデル（Claude を含む）や自分のモデルを、エンドポイントとして呼び出せます。Unity Gateway（旧 AI Gateway）で、利用の制限、使用量の監視、入出力の記録などをまとめて管理します。'],
      },
      {
        heading: '探す: AI Search',
        body: ['AI Search（旧 Vector Search）は、文書を意味で検索する仕組みで、RAG の検索部分を受け持ちます。元のテーブルと自動で同期させられます。'],
      },
      {
        heading: '組み立てる: Agent Bricks',
        body: ['よくある用途のエージェントを、自分のデータに合わせて作り、改善するための仕組みです。コードで細かく作る方法も用意されています。'],
      },
      {
        heading: '測る: MLflow',
        body: ['エージェントの動きをトレースとして記録し、どこで間違えたかを調べられます。評価用のデータで品質を測り、変更の前後を比べます。'],
      },
    ],
    checklist: ['モデルの呼び出しを Unity Gateway で管理したか', '検索の元データと同期させたか', 'トレースと評価で品質を測る仕組みがあるか'],
    seeAlso: [
      { href: '/advanced/databricks-genie-ontology', title: '新しい動き（応用知識）：Genie Ontology' },
      { href: '/advanced/databricks-ontobricks', title: '新しい動き（応用知識）：OntoBricks とは' },
    ],
    resources: [
      { title: 'Databricks で使えるモデル', url: `${DBX_DOCS}/machine-learning/model-serving/foundation-model-overview`, kind: '公式ドキュメント' },
      { title: 'AI Search', url: `${DBX_DOCS}/vector-search/vector-search`, kind: '公式ドキュメント' },
      { title: 'Agent Bricks', url: `${DBX_DOCS}/generative-ai/agent-bricks/`, kind: '公式ドキュメント' },
      { title: 'エージェントの観測と品質（MLflow）', url: `${DBX_DOCS}/mlflow3/genai/`, kind: '公式ドキュメント' },
    ],
  },
  {
    id: 'databricks-dev-workflow',
    group: 'databricks',
    title: '開発の進め方（Git・Bundles・環境の分け方）',
    summary: 'ノートブックを Git で管理し、Declarative Automation Bundles で開発から本番まで同じ定義で動かす。',
    intro: ['PoC ではノートブックを直接書き換えても困りませんが、本番ではそうはいきません。コードを管理し、同じ手順で環境に出せる形にします。'],
    sections: [
      {
        heading: 'Git folders でコードを管理する',
        body: ['ワークスペースの Git folders を使うと、ノートブックやファイルを Git のリポジトリとして扱えます。変更の履歴が残り、レビューもできるようになります。'],
      },
      {
        heading: 'Declarative Automation Bundles で定義する',
        body: ['ジョブやパイプラインなどの設定を、コードと一緒にファイルで定義する仕組みです。開発・本番などの環境（ターゲット）ごとの違いだけを書き分け、同じ定義から各環境に出せます。'],
      },
      {
        heading: '環境の分け方',
        body: ['開発と本番で、カタログ（または、ワークスペース）を分けます。本番への反映は人の手ではなく CI/CD から行い、本番のジョブはサービスプリンシパルで動かします。'],
      },
    ],
    checklist: ['コードを Git で管理しているか', 'ジョブやパイプラインを Bundles で定義したか', '開発と本番の環境を分けたか', '本番への反映を CI/CD にしたか'],
    resources: [
      { title: 'Git folders', url: `${DBX_DOCS}/repos/`, kind: '公式ドキュメント' },
      { title: 'Declarative Automation Bundles', url: `${DBX_DOCS}/dev-tools/bundles/`, kind: '公式ドキュメント' },
    ],
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
