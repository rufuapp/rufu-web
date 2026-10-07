import type { Resource, StudyTopic } from '@/lib/quiz/types';
import { CLAUDE_VOCABULARY } from '@/content/vocabulary/claude';

const DBX_DOCS = 'https://docs.databricks.com/aws/en';
const CLAUDE_DOCS = 'https://platform.claude.com/docs/en';

const DATABRICKS_ACADEMY: Resource = {
  title: 'Databricks Academy（公式トレーニング）',
  url: 'https://www.databricks.com/learn/training/home',
  kind: '公式コース',
};

export const STUDY_TOPICS: StudyTopic[] = [
  // ───────── Databricks ─────────
  {
    id: 'lakehouse-delta-lake',
    track: 'databricks',
    title: 'レイクハウスと Delta Lake',
    summary: 'Databricks のデータの土台になる Delta Lake の仕組みと、タイムトラベル・MERGE・OPTIMIZE・VACUUM などの基本操作を学びます。',
    intro: [
      'Databricks では、テーブルのデータを Delta Lake の形式で保存するのが基本です。Delta Lake は、クラウドストレージ上のデータファイルに「トランザクションログ」を組み合わせることで、データベースのような ACID トランザクションや、過去の状態へのアクセスを実現します。',
      'データエンジニアの資格では、こうした操作と保守の考え方が、データの変換や最適化の分野の土台になります。',
    ],
    points: [
      {
        heading: 'トランザクションログが変更の履歴を記録する',
        body: 'Delta テーブルへの書き込みは、すべてトランザクションログ（_delta_log）にバージョンとして記録されます。DESCRIBE HISTORY で、いつ・誰が・どの操作をしたかを確認できます。',
      },
      {
        heading: 'タイムトラベルで過去の状態を読む・戻す',
        body: 'SELECT ... VERSION AS OF（または TIMESTAMP AS OF）で過去のバージョンを読み、RESTORE TABLE で過去の状態に戻せます。誤った更新を取り消すときに使います。',
      },
      {
        heading: 'MERGE INTO でアップサートする',
        body: '変更データを既存のテーブルに反映するときは MERGE INTO を使います。一致した行の更新と、一致しない行の挿入を、1 つのアトミックな操作で行えます。',
      },
      {
        heading: 'OPTIMIZE で小さなファイルをまとめる',
        body: '小さなファイルが大量にあると、読み取りが遅くなります。OPTIMIZE はファイルをまとめて（コンパクション）読み取りの性能を改善します。データの配置を工夫する方法として、Z-ORDER やリキッドクラスタリングもあります。',
      },
      {
        heading: 'VACUUM で不要なファイルを削除する',
        body: 'VACUUM は、現在のバージョンから参照されず、保持期間（既定は 7 日）を過ぎたデータファイルを削除します。削除したファイルを必要とする古いバージョンには、タイムトラベルできなくなります。',
      },
    ],
    terms: [
      { term: 'Delta Lake', desc: 'データファイルとトランザクションログで、ACID トランザクションやタイムトラベルを実現するテーブルの形式。' },
      { term: 'トランザクションログ', desc: 'テーブルへの変更をバージョンとして記録するログ（_delta_log）。' },
      { term: 'タイムトラベル', desc: '過去のバージョンやタイムスタンプを指定して、テーブルを読む機能。' },
      { term: 'OPTIMIZE', desc: '小さなファイルをまとめて、読み取りの性能を上げる操作。' },
      { term: 'VACUUM', desc: '参照されなくなった古いデータファイルを削除する操作。' },
      { term: 'リキッドクラスタリング', desc: 'CLUSTER BY でクラスタリングのキーを指定し、データの配置を最適化する仕組み。' },
    ],
    resources: [
      { title: 'Delta Lake（Databricks ドキュメント）', url: `${DBX_DOCS}/delta/`, kind: '公式ドキュメント' },
      DATABRICKS_ACADEMY,
    ],
    practice: [{ setId: 'databricks-data-engineer-associate', domains: ['delta'] }],
  },
  {
    id: 'data-ingestion',
    track: 'databricks',
    title: 'データの取り込み（Auto Loader と COPY INTO）',
    summary: 'クラウドストレージに届くファイルを、Auto Loader や COPY INTO で、重複なく効率よく取り込む方法を学びます。',
    intro: [
      'データ基盤づくりの最初の一歩は、外部のファイルをテーブルに取り込むことです。Databricks には、増分で取り込むための仕組みとして Auto Loader と COPY INTO が用意されています。',
      'どちらも「すでに取り込んだファイルは二度取り込まない」ことが要点です。データの量や運用の仕方に応じて使い分けます。',
    ],
    points: [
      {
        heading: 'Auto Loader で新しいファイルだけを取り込む',
        body: 'Auto Loader は spark.readStream.format("cloudFiles") で使うストリーミングのソースです。処理済みのファイルをチェックポイントで管理し、新しく届いたファイルだけを取り込みます。スキーマの推論や、列の追加などスキーマの変化への追従にも対応しています。',
      },
      {
        heading: 'COPY INTO は SQL で手軽に取り込める',
        body: 'COPY INTO は SQL のコマンドです。読み込み済みのファイルを記録しているため、同じコマンドを再実行しても二重に取り込みません（冪等）。ソースのファイルは削除されません。',
      },
      {
        heading: 'availableNow トリガーで増分バッチにする',
        body: 'ストリーミングのクエリに trigger(availableNow=True) を指定すると、その時点で届いているデータをすべて処理してから停止します。ジョブで定期的に実行すれば、ストリーミングの仕組みのまま、バッチのように運用できます。',
      },
      {
        heading: 'まず生データを Bronze に保存する',
        body: '取り込んだデータは、加工せずにそのまま Bronze レイヤーに保存しておくのが一般的です。後から変換をやり直したり、問題を調べたりするときに、元のデータに戻れます。',
      },
    ],
    terms: [
      { term: 'Auto Loader', desc: 'クラウドストレージに届く新しいファイルを、増分で取り込む仕組み（cloudFiles ソース）。' },
      { term: 'COPY INTO', desc: 'ファイルをテーブルに読み込む SQL コマンド。読み込み済みのファイルはスキップされる。' },
      { term: 'チェックポイント', desc: 'ストリーミングの処理がどこまで進んだかを記録する場所。' },
      { term: 'スキーマ進化', desc: '列の追加など、データの構造の変化に合わせてテーブルのスキーマを更新すること。' },
      { term: 'availableNow', desc: '利用可能なデータをすべて処理したら停止する、ストリーミングのトリガー。' },
    ],
    resources: [
      { title: 'Auto Loader（Databricks ドキュメント）', url: `${DBX_DOCS}/ingestion/cloud-object-storage/auto-loader/`, kind: '公式ドキュメント' },
      { title: 'COPY INTO（Databricks ドキュメント）', url: `${DBX_DOCS}/ingestion/cloud-object-storage/copy-into/`, kind: '公式ドキュメント' },
    ],
    practice: [{ setId: 'databricks-data-engineer-associate', domains: ['ingest'] }],
  },
  {
    id: 'pipelines-and-jobs',
    track: 'databricks',
    title: '変換パイプラインとジョブ',
    summary: 'メダリオンアーキテクチャの考え方と、Lakeflow のパイプライン・ジョブでデータ処理を自動化し、運用する方法を学びます。',
    intro: [
      '取り込んだデータは、品質を整え、分析しやすい形に変換して届けます。その段階を整理する考え方が、メダリオンアーキテクチャです。',
      '変換の処理は Lakeflow のパイプライン（旧 Delta Live Tables）で宣言的に書き、Lakeflow ジョブで定期実行や依存関係を管理します。',
    ],
    points: [
      {
        heading: 'メダリオンアーキテクチャ（Bronze・Silver・Gold）',
        body: 'Bronze に生データを保存し、Silver で重複の除去・型の整形・不正値のクレンジング・結合を行い、Gold でビジネス向けの集計を作るのが一般的な役割分担です。',
      },
      {
        heading: 'エクスペクテーションでデータの品質を管理する',
        body: 'パイプラインでは CONSTRAINT 名 EXPECT (条件) で品質のルールを宣言します。ON VIOLATION を指定しなければ、違反した行も書き込まれて件数が記録されます。DROP ROW なら違反した行を捨て、FAIL UPDATE なら更新を失敗させます。',
      },
      {
        heading: 'ジョブでタスクの依存関係を管理する',
        body: 'Lakeflow ジョブでは、複数のタスクの実行順序や依存関係、スケジュールを定義できます。途中のタスクが失敗したときは、修復実行（Repair run）で、失敗したタスクとその下流だけを再実行できます。',
      },
      {
        heading: '運用では監視と最適化も欠かせない',
        body: '本番の処理では、実行の履歴やイベントログで失敗の原因を調べ、テーブルの OPTIMIZE などで性能を保ちます。最新の試験ガイドでは、トラブルシューティング・監視・最適化が独立した分野になっています。',
      },
    ],
    terms: [
      { term: 'メダリオンアーキテクチャ', desc: 'データを Bronze（生）・Silver（整形済み）・Gold（集計済み）の段階で管理する設計。' },
      { term: 'Lakeflow パイプライン', desc: 'データの変換を宣言的に書ける Databricks のパイプライン（旧 Delta Live Tables）。' },
      { term: 'エクスペクテーション', desc: 'パイプラインで宣言する、データ品質のルール。' },
      { term: 'Lakeflow ジョブ', desc: 'タスクの実行順序やスケジュールを管理する、Databricks のワークフローの仕組み。' },
      { term: '修復実行（Repair run）', desc: '失敗したタスクとその下流だけを、再実行する機能。' },
    ],
    resources: [
      { title: 'メダリオンアーキテクチャ（Databricks ドキュメント）', url: `${DBX_DOCS}/lakehouse/medallion`, kind: '公式ドキュメント' },
      { title: 'Lakeflow パイプライン（Databricks ドキュメント）', url: `${DBX_DOCS}/ldp/`, kind: '公式ドキュメント' },
      { title: 'パイプラインのエクスペクテーション（Databricks ドキュメント）', url: `${DBX_DOCS}/ldp/expectations`, kind: '公式ドキュメント' },
      { title: 'Lakeflow ジョブ（Databricks ドキュメント）', url: `${DBX_DOCS}/jobs/`, kind: '公式ドキュメント' },
    ],
    practice: [{ setId: 'databricks-data-engineer-associate', domains: ['pipeline', 'ops'] }],
  },
  {
    id: 'unity-catalog',
    track: 'databricks',
    title: 'Unity Catalog による権限管理',
    summary: 'カタログ・スキーマ・テーブルの階層と権限の仕組み、マネージドテーブルと外部テーブルの違い、リネージを学びます。',
    intro: [
      'Unity Catalog は、Databricks のデータと AI の資産をまとめて管理する、ガバナンスの仕組みです。テーブルだけでなく、ビュー、関数、モデルなども同じ仕組みで権限を管理します。',
      'データエンジニア・データアナリスト・生成AIエンジニアのどの資格でも、ガバナンスやデータの保護の分野の土台になる知識です。',
    ],
    points: [
      {
        heading: '3 階層の名前空間',
        body: 'テーブルは「カタログ.スキーマ.テーブル」の 3 階層で参照します（例: main.sales.orders）。',
      },
      {
        heading: 'テーブルを読むには親の権限も必要',
        body: 'テーブルを読むには、SELECT の権限に加えて、親のカタログの USE CATALOG と、スキーマの USE SCHEMA が必要です。権限は GRANT と REVOKE で付与・取り消しします。',
      },
      {
        heading: 'マネージドテーブルと外部テーブル',
        body: 'マネージドテーブルは、データファイルも Unity Catalog が管理します。外部テーブルは、利用者が指定した外部ロケーションにデータを置き、DROP TABLE してもデータファイルは残ります。',
      },
      {
        heading: 'リネージで影響範囲を確かめる',
        body: 'Unity Catalog は、テーブルや列のリネージ（どこから来て、どこで使われているか）を自動で記録します。列を変更する前に、下流のテーブルやダッシュボードを Catalog Explorer で確認できます。',
      },
    ],
    terms: [
      { term: 'Unity Catalog', desc: 'Databricks のデータと AI 資産の権限・監査・リネージを一元管理する仕組み。' },
      { term: 'メタストア', desc: 'Unity Catalog の最上位の入れ物。カタログやその中のオブジェクトのメタデータを保持する。' },
      { term: 'USE CATALOG / USE SCHEMA', desc: 'カタログやスキーマの中のオブジェクトを使うために必要な権限。' },
      { term: '外部ロケーション', desc: '外部テーブルなどのデータを置く、クラウドストレージ上の場所。' },
      { term: 'リネージ', desc: 'データがどこから来て、どこで使われているかの記録。' },
    ],
    resources: [{ title: 'Unity Catalog（Databricks ドキュメント）', url: `${DBX_DOCS}/data-governance/unity-catalog/`, kind: '公式ドキュメント' }],
    practice: [
      { setId: 'databricks-data-engineer-associate', domains: ['governance'] },
      { setId: 'databricks-data-analyst-associate', domains: ['catalog'] },
    ],
  },
  {
    id: 'databricks-sql',
    track: 'databricks',
    title: 'Databricks SQL・ダッシュボード・Genie',
    summary: 'SQL ウェアハウスでのクエリ、分析でよく使う SQL、ダッシュボードとアラート、AI/BI Genie による自然言語での分析を学びます。',
    intro: [
      'Databricks SQL は、SQL ウェアハウス上でクエリを実行し、結果をダッシュボードやアラートで共有するための機能群です。',
      'データアナリストの資格では、クエリの実行と分析、ダッシュボードと可視化、AI/BI Genie スペースが、配点の大きな分野です。',
    ],
    points: [
      {
        heading: 'クエリは SQL ウェアハウスで実行する',
        body: 'Databricks SQL のクエリやダッシュボードは、SQL ウェアハウス上で実行されます。サーバーレスの SQL ウェアハウスを使うと、起動を待つ時間や管理の手間を減らせます。',
      },
      {
        heading: '分析でよく使う SQL',
        body: 'ウィンドウ関数（ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)）での最新行の抽出、date_trunc による期間ごとの集計、explode による配列の展開、LEFT JOIN による欠けた行の保持は、分析の基本の形です。COUNT(列) が NULL を数えないことにも注意します。',
      },
      {
        heading: 'ビューとテーブルの使い分け',
        body: 'ビューはクエリの定義だけを保存し、参照するたびに計算されます。CREATE TABLE AS SELECT は作成した時点の結果をデータとして保存するため、元のテーブルの変更には追従しません。',
      },
      {
        heading: 'ダッシュボードとアラートで共有する',
        body: 'AI/BI ダッシュボードでクエリの結果を可視化して共有し、アラートで条件を満たしたときに通知できます。',
      },
      {
        heading: 'AI/BI Genie で自然言語の質問に答える',
        body: 'Genie スペースに対象のテーブルや指示文を整えておくと、SQL を書かない人も、自然言語でデータに質問できます。最新の試験ガイドでは、Genie スペースの作成・共有・保守が独立した分野です。',
      },
    ],
    terms: [
      { term: 'SQL ウェアハウス', desc: 'Databricks SQL のクエリを実行するためのコンピュート。' },
      { term: 'ウィンドウ関数', desc: '行のグループごとに順位や累計などを計算する SQL の関数。' },
      { term: 'ビュー', desc: 'クエリの定義だけを保存した、仮想的なテーブル。' },
      { term: 'AI/BI ダッシュボード', desc: 'クエリの結果を可視化して共有する、Databricks のダッシュボード。' },
      { term: 'AI/BI Genie', desc: '整えたデータに対して、自然言語で質問できる Databricks の機能。' },
    ],
    resources: [
      { title: 'Databricks SQL（Databricks ドキュメント）', url: `${DBX_DOCS}/sql/`, kind: '公式ドキュメント' },
      { title: 'ダッシュボード（Databricks ドキュメント）', url: `${DBX_DOCS}/dashboards/`, kind: '公式ドキュメント' },
      { title: 'AI/BI Genie（Databricks ドキュメント）', url: `${DBX_DOCS}/genie/`, kind: '公式ドキュメント' },
    ],
    practice: [{ setId: 'databricks-data-analyst-associate', domains: ['dbsql', 'sql', 'viz'] }],
  },
  {
    id: 'ml-fundamentals',
    track: 'databricks',
    title: '機械学習の基礎（評価・特徴量・リーケージ）',
    summary: '過学習やデータリーケージ、偏ったデータの評価指標、特徴量の作り方、AutoML の使いどころなど、モデル開発の基本を学びます。',
    intro: [
      '機械学習の資格では、Databricks の機能だけでなく、モデル開発の基本的な考え方も問われます。',
      '特に、評価を正しく行うこと（リーケージを防ぎ、目的に合った指標を選ぶこと）は、実務でも試験でも大切な点です。',
    ],
    points: [
      {
        heading: 'データリーケージを防ぐ',
        body: '前処理（スケーリングなど）は学習データだけで fit し、評価データには transform だけを適用します。分割する前に全データで fit すると、評価データの情報が学習側に漏れて、評価が実際より良く見えてしまいます。',
      },
      {
        heading: '過学習を見分ける',
        body: '学習データでの性能が非常に高く、検証データでの性能が大きく下がるのは、過学習のサインです。正則化、モデルの単純化、データの追加などで対処します。',
      },
      {
        heading: '目的に合った評価指標を選ぶ',
        body: 'クラスが大きく偏ったデータでは、正解率だけでは少数のクラスを検出できているか分かりません。適合率・再現率・F1 などを併用します。',
      },
      {
        heading: '特徴量の作り方と、時系列での注意点',
        body: 'カテゴリの変数は、ワンホットエンコーディングなどで数値にします。時系列の特徴量を結合するときは、ポイントインタイム結合で、予測する時点より未来の値が混ざらないようにします。',
      },
      {
        heading: 'AutoML で出発点を作る',
        body: 'Databricks AutoML は、試行ごとのソースコードをノートブックとして生成します。最も良い試行のコードを出発点にして、手作業で改良していけます。',
      },
    ],
    terms: [
      { term: 'データリーケージ', desc: '本来使えないはずの情報（評価データや未来の値）が、学習に混ざってしまうこと。' },
      { term: '過学習', desc: '学習データに合わせすぎて、未知のデータでの性能が落ちること。' },
      { term: '適合率・再現率', desc: '陽性と予測したものの正しさ（適合率）と、実際の陽性をどれだけ拾えたか（再現率）。' },
      { term: 'ワンホットエンコーディング', desc: 'カテゴリの値ごとに 0/1 の列を作って、数値にする方法。' },
      { term: 'ポイントインタイム結合', desc: '各行のタイムスタンプ時点で有効だった特徴量の値だけを結合する方法。' },
    ],
    resources: [
      { title: 'AutoML（Databricks ドキュメント）', url: `${DBX_DOCS}/machine-learning/automl/`, kind: '公式ドキュメント' },
      { title: '特徴量の管理（Databricks ドキュメント）', url: `${DBX_DOCS}/machine-learning/feature-store/`, kind: '公式ドキュメント' },
    ],
    practice: [{ setId: 'databricks-ml-associate', domains: ['modeling', 'features'] }],
  },
  {
    id: 'mlflow',
    track: 'databricks',
    title: 'MLflow とモデルの管理・提供',
    summary: 'MLflow での実験の記録、Unity Catalog でのモデル管理、バッチ推論とリアルタイム推論の使い分けを学びます。',
    intro: [
      'MLflow は、機械学習の実験の記録からモデルの管理、デプロイまでを支えるオープンソースのツールで、Databricks に組み込まれています。',
      'Databricks では、モデルを Unity Catalog に登録して、権限やバージョンを、ほかのデータ資産と同じように管理します。',
    ],
    points: [
      {
        heading: '実験を記録する',
        body: 'ハイパーパラメータは log_param、精度などの数値は log_metric、ファイルは log_artifact で記録します。mlflow.autolog() を使えば、対応するライブラリの学習を自動で記録できます。',
      },
      {
        heading: 'Unity Catalog でモデルを管理する',
        body: 'モデルは「カタログ.スキーマ.モデル名」で登録し、バージョンごとに管理します。本番で使うバージョンはエイリアス（例: champion）で指し、推論する側はエイリアスでモデルを読み込みます。',
      },
      {
        heading: 'Spark ML のパイプライン',
        body: 'Spark ML の Pipeline は Estimator で、fit() すると Transformer である PipelineModel が返ります。PipelineModel.transform() で予測の列を追加します。',
      },
      {
        heading: 'バッチ推論とリアルタイム推論を使い分ける',
        body: '大量のデータにまとめて予測するときは、mlflow.pyfunc.spark_udf でモデルを Spark に載せて分散実行します。個々のリクエストに低いレイテンシで答えるときは、Model Serving のエンドポイント（REST API）を使います。',
      },
    ],
    terms: [
      { term: 'MLflow Tracking', desc: '実験のパラメータ・メトリクス・成果物を記録する MLflow の機能。' },
      { term: 'autolog', desc: '対応ライブラリの学習を自動で記録する MLflow の機能。' },
      { term: 'エイリアス', desc: 'モデルの特定のバージョンを指す名前（例: champion）。' },
      { term: 'spark_udf', desc: 'MLflow のモデルを Spark の関数として使い、分散推論するための仕組み。' },
      { term: 'Model Serving', desc: 'モデルを REST API として公開し、推論を提供する Databricks の機能。' },
    ],
    resources: [
      { title: 'MLflow（Databricks ドキュメント）', url: `${DBX_DOCS}/mlflow/`, kind: '公式ドキュメント' },
      { title: 'Model Serving（Databricks ドキュメント）', url: `${DBX_DOCS}/machine-learning/model-serving/`, kind: '公式ドキュメント' },
    ],
    practice: [{ setId: 'databricks-ml-associate', domains: ['mlflow', 'deploy'] }],
  },
  {
    id: 'rag-ai-search',
    track: 'databricks',
    title: 'RAG と Databricks AI Search',
    summary: '文書のチャンク化と埋め込み、Databricks AI Search（旧 Vector Search）のインデックス、検索の精度を上げる工夫を学びます。',
    intro: [
      'RAG（検索拡張生成）は、質問に関係する文書を検索して LLM に渡し、その内容に基づいて回答させる手法です。社内文書に基づくチャットボットなどの土台になります。',
      'Databricks では、Databricks AI Search（旧 Vector Search）で文書のインデックスを作り、検索します。',
    ],
    points: [
      {
        heading: 'チャンク化は大きさの調整が肝心',
        body: '文書は適切な大きさのチャンクに分けてから埋め込みます。大きすぎると無関係な内容が混ざって検索の精度が落ち、小さすぎると文脈が欠けます。評価しながら調整します。',
      },
      {
        heading: '埋め込みは同じモデルで作る',
        body: '文書と質問の埋め込みは、同じ埋め込みモデルで作ります。異なるモデルのベクトルは別の空間にあるため、類似度が意味を持ちません。',
      },
      {
        heading: 'Delta Sync Index で自動的に同期する',
        body: 'Delta Sync Index は、ソースの Delta テーブルの変更をインデックスに同期します。標準エンドポイントでは、ソーステーブルでチェンジデータフィードを有効にしておく必要があります。手動で更新する Direct Vector Access Index もあります。',
      },
      {
        heading: 'リランキングで上位の精度を上げる',
        body: '候補を多めに取得し、より精度の高いモデルで質問との関連度を計算し直して並べ替えると、上位に返る結果の質を上げられます。',
      },
    ],
    terms: [
      { term: 'RAG', desc: '検索した文書を LLM に渡して、その内容に基づいて回答させる手法。' },
      { term: 'チャンク', desc: '検索しやすい大きさに分けた、文書の断片。' },
      { term: '埋め込み（エンベディング）', desc: '文章の意味を数値のベクトルで表したもの。' },
      { term: 'Databricks AI Search', desc: 'Databricks に組み込まれた検索の仕組み（旧 Vector Search）。' },
      { term: 'チェンジデータフィード', desc: 'Delta テーブルの行レベルの変更を記録する機能。' },
      { term: 'リランキング', desc: '取得した候補を、より精度の高い方法で並べ替えること。' },
    ],
    resources: [{ title: 'Databricks AI Search（Databricks ドキュメント）', url: `${DBX_DOCS}/ai-search/ai-search`, kind: '公式ドキュメント' }],
    practice: [{ setId: 'databricks-genai-engineer-associate', domains: ['rag'] }],
  },
  {
    id: 'genai-apps',
    track: 'databricks',
    title: '生成AIアプリの構築・評価・ガバナンス',
    summary: 'Model Serving とバッチ推論、エージェントとツール、MLflow による評価とトレース、Unity Gateway による利用の管理を学びます。',
    intro: [
      '生成AIのアプリを本番で運用するには、モデルを提供する仕組み、ツールを使うエージェント、品質を測る評価、利用を管理するガバナンスが必要です。',
      '生成AIエンジニアの資格では、アプリケーションの開発（30%）と、アプリの組み立てとデプロイ（22%）が、特に配点の大きい分野です。',
    ],
    points: [
      {
        heading: 'モデルを提供する（Model Serving）',
        body: 'Model Serving は、モデルをリアルタイム推論とバッチ推論の両方で使えるようにする仕組みです。基盤モデルはトークン従量課金ですぐに使え、性能の保証が必要な本番のワークロードでは、プロビジョンドスループットを使います。',
      },
      {
        heading: 'SQL からまとめて推論する（ai_query）',
        body: 'ai_query() 関数を使うと、SQL からテーブルの各行に対してモデルを呼び出せます。結果をテーブルに保存すれば、バッチ推論のパイプラインになります。',
      },
      {
        heading: 'ツールは Unity Catalog の関数として管理できる',
        body: 'エージェントが使うツールを Unity Catalog の関数として定義すると、誰が実行できるかをほかのデータ資産と同じように管理でき、複数のエージェントで再利用しやすくなります。',
      },
      {
        heading: 'MLflow で評価し、トレースで原因を探す',
        body: '評価用のデータセットと LLM ジャッジ（スコアラー）を組み合わせると、根拠性や関連性を、多くの質問で継続的に測れます。MLflow Tracing は、LLM やツールの呼び出しを入出力や所要時間つきで記録し、デバッグに役立ちます。',
      },
      {
        heading: 'Unity Gateway で利用を管理する',
        body: 'Unity Gateway（旧 AI Gateway）では、レート制限、利用状況の監視、リクエストとレスポンスの Unity Catalog の Delta テーブルへの記録、予算の管理などを一元的に行えます。',
      },
      {
        heading: 'プロンプトインジェクションに備える',
        body: '取得した文書やツールの結果に含まれる指示は、信頼できないデータとして扱います。エージェントが実行できる操作は、必要最小限の権限に絞ります。',
      },
    ],
    terms: [
      { term: 'プロビジョンドスループット', desc: '性能を保証するために、推論の処理能力を確保して使う利用形態。' },
      { term: 'ai_query', desc: 'SQL からサービングエンドポイントのモデルを呼び出す関数。' },
      { term: 'MLflow Tracing', desc: 'LLM アプリの各ステップの入出力や所要時間を記録する機能。' },
      { term: 'LLM ジャッジ', desc: 'LLM を使って回答の品質を自動で評価する方法。' },
      { term: 'Unity Gateway', desc: '生成AIの利用を一元管理する Databricks のガバナンス機能（旧 AI Gateway）。' },
      { term: 'プロンプトインジェクション', desc: '外部の文章に紛れた指示で、AI の振る舞いを乗っ取ろうとする攻撃。' },
    ],
    resources: [
      { title: 'Model Serving（Databricks ドキュメント）', url: `${DBX_DOCS}/machine-learning/model-serving/`, kind: '公式ドキュメント' },
      { title: 'AI Functions と ai_query（Databricks ドキュメント）', url: `${DBX_DOCS}/large-language-models/ai-functions`, kind: '公式ドキュメント' },
      { title: 'エージェント（Databricks ドキュメント）', url: `${DBX_DOCS}/agents`, kind: '公式ドキュメント' },
      { title: 'MLflow による生成AIの品質管理（Databricks ドキュメント）', url: `${DBX_DOCS}/mlflow3/genai/agent-observability-and-quality`, kind: '公式ドキュメント' },
      { title: 'Unity Gateway（Databricks ドキュメント）', url: `${DBX_DOCS}/ai-gateway/`, kind: '公式ドキュメント' },
    ],
    practice: [{ setId: 'databricks-genai-engineer-associate', domains: ['serving', 'agents', 'eval'] }],
  },

  // ───────── Claude ─────────
  {
    id: 'claude-messages-api',
    track: 'claude',
    title: 'Messages API の基本',
    summary: 'Messages API のリクエストとレスポンスの形、システムプロンプト、停止理由、ストリーミング、画像の入力、エラーへの対処を学びます。',
    intro: [
      'Claude をアプリケーションから使うときの基本が、Messages API（POST /v1/messages）です。会話を messages の配列で渡し、Claude の応答をコンテンツブロックの配列として受け取ります。',
      '公式の SDK を使えば、認証のヘッダーなどは自動で付きます。それでも、リクエストの構造を理解しておくと、エラーの原因を見つけやすくなります。',
    ],
    points: [
      {
        heading: '必須のパラメータは model・max_tokens・messages',
        body: 'リクエストでは、使うモデル（model）、生成する最大トークン数（max_tokens）、会話（messages）が必須です。HTTP で直接呼ぶ場合は、認証の x-api-key と、API のバージョンを指定する anthropic-version のヘッダーを付けます。',
      },
      {
        heading: 'システムプロンプトはトップレベルの system に書く',
        body: 'Messages API には、"system" ロールのメッセージはありません。役割や前提の指示は、トップレベルの system パラメータで渡します。messages のロールは user と assistant です。',
      },
      {
        heading: '停止理由（stop_reason）を確かめる',
        body: '自然に回答を終えると "end_turn"、max_tokens に達して打ち切られると "max_tokens"、指定した停止文字列で止まると "stop_sequence"、ツールを使おうとしていると "tool_use" になります。',
      },
      {
        heading: 'ストリーミングと画像の入力',
        body: 'stream: true を指定すると、応答が Server-Sent Events（SSE）で少しずつ届きます。画像は、user メッセージの content に image ブロックとして入れ、base64 のデータや URL を指定します。',
      },
      {
        heading: 'エラーは状態コードに応じて対処する',
        body: '429 はレート制限なので、待ち時間を伸ばしながら再試行します。400 はリクエストの形式の誤り、401 は認証の問題です。',
      },
    ],
    terms: [
      { term: 'Messages API', desc: 'Claude と対話するための API（POST /v1/messages）。' },
      { term: 'max_tokens', desc: '生成するトークン数の上限。必須のパラメータ。' },
      { term: 'system パラメータ', desc: 'システムプロンプトを渡す、リクエストのトップレベルの項目。' },
      { term: 'コンテンツブロック', desc: 'テキスト・画像・ツール呼び出しなど、メッセージを構成する単位。' },
      { term: 'stop_reason', desc: '応答の生成が止まった理由。' },
    ],
    resources: [
      { title: 'Claude Developer Platform のドキュメント', url: `${CLAUDE_DOCS}/intro`, kind: '公式ドキュメント' },
      { title: 'Messages API リファレンス', url: `${CLAUDE_DOCS}/api/messages`, kind: '公式ドキュメント' },
      { title: 'Anthropic の学習用教材（GitHub: anthropics/courses）', url: 'https://github.com/anthropics/courses', kind: '公式チュートリアル' },
    ],
    practice: [{ setId: 'claude-api', domains: ['basics'] }],
  },
  {
    id: 'claude-tool-use',
    track: 'claude',
    title: 'ツール利用（Tool use）',
    summary: 'ツールの定義（name・description・input_schema）、tool_use と tool_result のやり取り、良いツール説明の書き方を学びます。',
    intro: [
      'ツール利用（tool use）を使うと、Claude が外部の関数や API を呼び出して、検索や計算、データの更新などを行えます。エージェントを作るときの中心になる仕組みです。',
      'アプリケーション側で定義するツールでは、Claude はツールを直接実行するのではなく、「このツールをこの引数で呼びたい」と応答します。実際に実行して、結果を Claude に返すのはアプリケーションの役割です。',
    ],
    points: [
      {
        heading: 'ツールは name・description・input_schema で定義する',
        body: 'input_schema には、引数の型や必須の項目を JSON Schema で書きます。',
      },
      {
        heading: 'tool_use を受け取り、tool_result を返す',
        body: 'Claude がツールを使うと判断すると、応答に tool_use ブロック（id・name・input）が入り、stop_reason が "tool_use" になります。アプリケーションはツールを実行し、次の user メッセージに、tool_use_id を指定した tool_result ブロックを入れて結果を返します。',
      },
      {
        heading: 'description は具体的に書く',
        body: 'Claude はツールの説明を読んで、使うかどうかと、引数の値を決めます。何をするツールか、いつ使うべきか、各引数の意味や制約を具体的に書くほど、適切に使われます。',
      },
      {
        heading: 'ツールの結果は信頼できないデータとして扱う',
        body: '外部から取得した内容には、指示のように見える文章が紛れていることがあります（プロンプトインジェクション）。ツールに与える権限は、必要最小限にします。',
      },
    ],
    terms: [
      { term: 'tool use', desc: 'Claude が外部の関数や API を使えるようにする仕組み。' },
      { term: 'input_schema', desc: 'ツールの引数の形を JSON Schema で定義する項目。' },
      { term: 'tool_use ブロック', desc: 'Claude がツールを呼びたいときに返す、応答のブロック。' },
      { term: 'tool_result ブロック', desc: 'ツールの実行結果を Claude に返すためのブロック。' },
    ],
    resources: [{ title: 'ツール利用の概要（公式ドキュメント）', url: `${CLAUDE_DOCS}/agents-and-tools/tool-use/overview`, kind: '公式ドキュメント' }],
    practice: [{ setId: 'claude-api', domains: ['tools'] }],
  },
  {
    id: 'claude-api-optimization',
    track: 'claude',
    title: 'コストと性能の最適化',
    summary: 'プロンプトキャッシュ、Message Batches API、トークン数の事前計算、思考（thinking）の深さの調整を学びます。',
    intro: [
      'Claude API の料金は、入力と出力のトークン数で決まります。同じ内容を毎回送る、急がない処理を一件ずつ送る、といった使い方を見直すと、コストとレイテンシを大きく下げられます。',
      'モデルの世代によって、思考の制御の仕方や、トークンの数え方が変わる点にも注意します。',
    ],
    points: [
      {
        heading: 'プロンプトキャッシュで繰り返す部分を安くする',
        body: '毎回送る長いシステムプロンプトや資料に cache_control: {"type": "ephemeral"} を付けると、その部分がキャッシュされます。キャッシュの既定の有効期間は 5 分で、追加料金で 1 時間にもできます。キャッシュからの読み込みは、多くのモデルで通常の入力トークンの 1 割の料金です。',
      },
      {
        heading: '急がない大量の処理は Message Batches API で',
        body: 'Message Batches API は大量のリクエストを非同期で処理し、通常より 50% 安くなります。多くのバッチは 1 時間以内に終わります。',
      },
      {
        heading: '送る前にトークン数を数える',
        body: 'POST /v1/messages/count_tokens に送る予定の内容を渡すと、入力トークン数の見積もりが返ります。利用は無料です（専用のレート制限があります）。Claude 4.7 以降のモデルは新しいトークナイザーを使うため、同じ文章でも以前のモデルより 3 割ほど多く数えられることがあります。',
      },
      {
        heading: '思考の深さは adaptive thinking と effort で調整する',
        body: '最新のモデルでは thinking: {"type": "adaptive"} を指定し、output_config の effort で思考の深さを調整します。budget_tokens で予算を指定する従来の方式は、Claude 4.6 では非推奨、Claude 4.7 以降では使えません。',
      },
    ],
    terms: [
      { term: 'トークン', desc: 'モデルが文章を処理する単位。料金や上限はトークン数で決まる。' },
      { term: 'プロンプトキャッシュ', desc: '繰り返し送るプロンプトの先頭部分をキャッシュして、コストと待ち時間を減らす機能。' },
      { term: 'Message Batches API', desc: '大量のリクエストを非同期でまとめて処理する、割安な API。' },
      { term: 'adaptive thinking', desc: '問題に応じて、Claude が思考するかどうかと、その量を決める方式。' },
      { term: 'effort', desc: '思考の深さなど、応答にかける労力の度合いを指定する設定。' },
    ],
    resources: [
      { title: 'プロンプトキャッシュ（公式ドキュメント）', url: `${CLAUDE_DOCS}/build-with-claude/prompt-caching`, kind: '公式ドキュメント' },
      { title: 'バッチ処理（公式ドキュメント）', url: `${CLAUDE_DOCS}/build-with-claude/batch-processing`, kind: '公式ドキュメント' },
      { title: 'トークン数の計算（公式ドキュメント）', url: `${CLAUDE_DOCS}/build-with-claude/token-counting`, kind: '公式ドキュメント' },
      { title: '拡張思考と adaptive thinking への移行（公式ドキュメント）', url: `${CLAUDE_DOCS}/build-with-claude/extended-thinking`, kind: '公式ドキュメント' },
    ],
    practice: [{ setId: 'claude-api', domains: ['perf', 'advanced'] }],
  },
  {
    id: 'prompt-engineering',
    track: 'claude',
    title: 'プロンプト設計の基本',
    summary: '明確な指示、例の示し方、XML タグ、長い資料の扱い、考えさせ方、ハルシネーション対策、プロンプトの評価を学びます。',
    intro: [
      'Claude から期待どおりの出力を得るための基本が、プロンプトの設計です。Anthropic の公式ドキュメント「Prompting best practices」に、最新のモデルに合わせたやり方がまとまっています。',
      'プロンプトを改善する前に、成功の基準と、それを確かめるテストを用意しておくことが勧められています。',
    ],
    points: [
      {
        heading: '明確に、背景や理由も伝える',
        body: '読み手・目的・形式・長さを具体的に伝えます。指示に理由を添えると、Claude は意図を汲んで、書かれていない場面にも応用できます。「〜しないで」より「〜してほしい」と、望む形を伝える方が効果的です。',
      },
      {
        heading: '例は 3〜5 個、多様に',
        body: '入力と出力の例を示すと、書式やトーンが安定します。公式ドキュメントでは 3〜5 個の例が勧められています。似た例ばかりだと意図しない特徴まで真似されるため、多様な例を用意します。',
      },
      {
        heading: 'XML タグで構造化する',
        body: '指示・資料・例・入力などを、<instructions> や <document> のような XML タグで区切ると、Claude が取り違えにくくなります。',
      },
      {
        heading: '長い資料は先頭に、質問は最後に',
        body: '長い文書はプロンプトの上部に置き、質問や指示はその後に書きます。長い資料に基づく作業では、まず関連する部分を引用させてから回答させると、無関係な部分に引きずられにくくなります。',
      },
      {
        heading: '役割を与え、考えさせる',
        body: 'システムプロンプトで役割を与えると、回答の観点やトーンを合わせやすくなります。複雑な問題では思考機能（thinking）を使います。思考機能を使わない場合は、答える前に順を追って考えさせ、最終回答を <answer> タグに分けて出力させます。',
      },
      {
        heading: '「分からない」と言ってよいと伝える',
        body: '資料に書かれていない場合は「分からない」と答えてよいと明示し、根拠の引用を求めると、根拠のない回答（ハルシネーション）を減らせます。',
      },
      {
        heading: 'プリフィルは最新のモデルでは使えない',
        body: 'Claude 4.6 以降のモデルでは、assistant メッセージの書き出しを指定する「プリフィル」が使えません。出力の形式を固定したい場合は、明確な指示、XML タグ、構造化出力を使います。',
      },
    ],
    terms: [
      { term: 'システムプロンプト', desc: '役割や前提などを Claude に伝える、会話の外側の指示。' },
      { term: 'few-shot（例示）', desc: '入力と出力の例を示して、期待する形を伝える方法。' },
      { term: 'XML タグ', desc: 'プロンプトの各部分を区切るための <tag> 形式の目印。' },
      { term: 'プロンプトチェーン', desc: 'タスクを複数のステップに分け、前の出力を次のプロンプトに渡す方法。中間の出力を確かめたいときに有効。' },
      { term: 'ハルシネーション', desc: 'もっともらしいが事実ではない内容を、モデルが生成すること。' },
      { term: 'プリフィル', desc: 'assistant の応答の書き出しをあらかじめ指定する方法。Claude 4.6 以降は非対応。' },
    ],
    resources: [
      {
        title: 'Prompting best practices（公式ドキュメント）',
        url: `${CLAUDE_DOCS}/build-with-claude/prompt-engineering/claude-prompting-best-practices`,
        kind: '公式ドキュメント',
      },
      {
        title: 'プロンプト設計の対話型チュートリアル（GitHub）',
        url: 'https://github.com/anthropics/prompt-eng-interactive-tutorial',
        kind: '公式チュートリアル',
        note: 'Claude 3 向けに書かれた教材です。最新のモデルと違う点は、公式ドキュメントを優先します',
      },
      {
        title: 'Claude Academy（無料のコース）',
        url: 'https://academy.claude.com/',
        kind: '公式コース',
        note: '「AI Fluency: Framework and foundations」などのコースがあります',
      },
    ],
    practice: [{ setId: 'claude-prompting', domains: ['clarity', 'structure', 'reasoning', 'reliability'] }],
  },
  {
    id: 'claude-code',
    track: 'claude',
    title: 'Claude Code の設定と使い方',
    summary: 'CLAUDE.md、権限の設定、プランモード、非対話モード、スキル、サブエージェント、フックを学びます。',
    intro: [
      'Claude Code は、ターミナルや IDE から、コードベースを読み書きしながら開発を進められる、Anthropic のエージェント型のコーディングツールです。',
      'チームで安全に使うには、プロジェクトの情報の渡し方（CLAUDE.md）、実行を許す範囲（権限）、作業の進め方（プランモードやサブエージェント）を押さえておくことが大切です。',
    ],
    points: [
      {
        heading: 'CLAUDE.md にプロジェクトの情報を書く',
        body: 'リポジトリの CLAUDE.md は、セッションの開始時に読み込まれる、プロジェクトのメモリです。ビルドの方法や規約を書いておけば、毎回説明する必要がありません。/init でひな形を作れます。',
      },
      {
        heading: '権限は settings.json で強制する',
        body: '.claude/settings.json の permissions.allow / deny に、Bash(npm run test:*) のようなルールを書くと、ツールの実行を確認なしで許したり、禁止したりできます。CLAUDE.md の記述はあくまで指示で、強制的な制限ではありません。',
      },
      {
        heading: 'プランモードと非対話モード',
        body: 'プランモードでは、Claude はコードを調べて計画を立てるだけで、ファイルを編集しません。CI などから使うときは claude -p の非対話モードで実行し、結果を標準出力で受け取ります。長い作業では /compact で会話を要約して、コンテキストを節約します。',
      },
      {
        heading: 'スキルとサブエージェントで拡張する',
        body: 'よく使う手順は、.claude/skills/<名前>/SKILL.md にスキルとして定義すると、/<名前> で呼び出せます（従来の .claude/commands/ も引き続き使えます）。サブエージェントは .claude/agents/ に Markdown で定義し、独自のコンテキストで作業して、結果だけを返します。',
      },
      {
        heading: 'フックで決まった処理を自動で走らせる',
        body: 'フックは settings.json に設定し、ツールの実行前後などに決まった処理を走らせます。PreToolUse のフックが終了コード 2 で終わると、そのツールの実行はブロックされ、理由が Claude に伝わります。',
      },
    ],
    terms: [
      { term: 'CLAUDE.md', desc: 'セッション開始時に読み込まれる、プロジェクトのメモリのファイル。' },
      { term: 'permissions', desc: 'ツールの実行を許可・禁止するルール。settings.json に書く。' },
      { term: 'プランモード', desc: 'ファイルを編集せず、調査と計画だけを行うモード。' },
      { term: 'スキル', desc: '手順や知識をまとめ、/名前 で呼び出せるようにしたもの（.claude/skills/）。' },
      { term: 'サブエージェント', desc: '独自のコンテキストとツール権限で作業する、補助のエージェント。' },
      { term: 'フック', desc: '決まったタイミングで自動的に実行される処理（PreToolUse など）。' },
    ],
    resources: [
      { title: 'Claude Code のドキュメント', url: 'https://code.claude.com/docs/en/overview', kind: '公式ドキュメント' },
      { title: 'フック（Claude Code ドキュメント）', url: 'https://code.claude.com/docs/en/hooks', kind: '公式ドキュメント' },
      { title: 'サブエージェント（Claude Code ドキュメント）', url: 'https://code.claude.com/docs/en/sub-agents', kind: '公式ドキュメント' },
    ],
    practice: [{ setId: 'claude-code-mcp', domains: ['setup', 'workflow', 'extend'] }],
  },
  {
    id: 'mcp',
    track: 'claude',
    title: 'Model Context Protocol（MCP）',
    summary: 'MCP のホスト・クライアント・サーバーの関係、3 つのプリミティブ、通信方式、最新の仕様での変更、Claude Code での使い方を学びます。',
    intro: [
      'MCP（Model Context Protocol）は、AI アプリケーションと外部のツールやデータをつなぐための、オープンなプロトコルです。MCP サーバーを一度作れば、Claude Code など MCP に対応したさまざまなアプリから使えます。',
      '仕様はバージョンごとに更新されています。2026年7月28日版の仕様では、プロトコルがステートレスになるなどの変更が入りました。',
    ],
    points: [
      {
        heading: 'ホスト・クライアント・サーバー',
        body: 'MCP ホスト（Claude Code などの AI アプリ）は、つなぐ MCP サーバーごとに MCP クライアントを作り、それぞれが専用の接続を保ちます。',
      },
      {
        heading: '3 つのプリミティブと、それを選ぶ主体',
        body: 'サーバーは Tools（実行できる操作）、Resources（文脈として読むデータ）、Prompts（再利用できるテンプレート）を公開します。Tools はモデルが判断して呼び出し、Resources はアプリケーションが、Prompts はユーザーが選んで使う設計です。',
      },
      {
        heading: '通信方式は stdio と Streamable HTTP',
        body: 'ローカルのサーバーは標準入出力（stdio）、リモートのサーバーは Streamable HTTP でつなぎます。メッセージの形式は JSON-RPC 2.0 です。以前の HTTP+SSE の方式は非推奨です。',
      },
      {
        heading: '最新の仕様での主な変更',
        body: '2026-07-28 版では、すべてのリクエストがプロトコルのバージョンや機能の情報を持つ、ステートレスな設計になりました。server/discover でサーバーの対応状況を確かめられます。クライアント側の sampling は非推奨になっています。',
      },
      {
        heading: 'Claude Code で MCP サーバーを使う',
        body: 'claude mcp add --transport http <名前> <URL> でリモートのサーバーを追加します。スコープは local（既定）、project（.mcp.json に保存してチームで共有）、user（自分のすべてのプロジェクト）から選べます。',
      },
    ],
    terms: [
      { term: 'MCP ホスト', desc: 'MCP クライアントを通じて、サーバーとつながる AI アプリケーション。' },
      { term: 'MCP サーバー', desc: 'ツールやデータを、MCP の形式で提供するプログラム。' },
      { term: 'Tools / Resources / Prompts', desc: 'MCP サーバーが公開する、3 つの主要な機能。' },
      { term: 'Streamable HTTP', desc: 'リモートの MCP サーバーとつなぐための通信方式。' },
      { term: 'JSON-RPC 2.0', desc: 'MCP のメッセージの形式の土台になっているプロトコル。' },
    ],
    resources: [
      { title: 'Model Context Protocol（公式サイト）', url: 'https://modelcontextprotocol.io/', kind: '仕様' },
      { title: 'MCP のアーキテクチャの概要', url: 'https://modelcontextprotocol.io/docs/learn/architecture', kind: '仕様' },
      { title: 'Claude Code で MCP を使う（公式ドキュメント）', url: 'https://code.claude.com/docs/en/mcp', kind: '公式ドキュメント' },
    ],
    practice: [{ setId: 'claude-code-mcp', domains: ['mcp'] }],
  },
  {
    id: 'claude-vocabulary',
    track: 'claude',
    title: 'Claude の頻出英単語',
    summary: '公式ドキュメントや英語の設問でよく使われる単語を、分野ごとに例文つきでまとめた単語帳です。',
    intro: [
      'Claude の公式ドキュメントは英語が基本で、API のパラメーター名やエラーメッセージ、Claude Code の設定項目も英語です。資格試験の言語は公式発表に記載がありませんが、英語の用語を英語のまま理解しておくと、ドキュメントも設問も速く正確に読めます。',
      'この単語帳では、設問の言い回しと、Claude を使ったシステムづくりでよく出る単語を、分野ごとに例文つきでまとめました。単語は、公式ドキュメントや資格の出題範囲の説明で使われる用語を中心に選んでいます。実際の試験問題から集めたものではありません。',
    ],
    points: [
      {
        heading: '問いの一文から先に読む',
        body: '場面設定のある設問では、問いは最後の一文にあることが多いです。先に問いを読み、何を選ぶのかを決めてから本文を読むと、読む量を減らせます。',
      },
      {
        heading: '強調された語と、選ぶ数を見落とさない',
        body: 'NOT・EXCEPT・MOST のように大文字で強調された語や、Select TWO のような選ぶ数の指定は、答えを大きく左右します。下の「重要な用語」で確かめておきましょう。',
      },
      {
        heading: 'よく知っている意味に引きずられない',
        body: 'address（対処する）、primary（主な）、regression（品質の後退）のように、よく知られた意味とは違う意味で使われる語があります。単語帳の補足を読んでおきましょう。',
      },
      {
        heading: '訳しにくい語は、例文ごと英語のまま覚える',
        body: 'latency・grounding・idempotent のように、日本語に置き換えると意味がぼやける語は、例文と一緒に英語のまま覚えるのが近道です。',
      },
    ],
    terms: [
      { term: 'Which of the following', desc: '「次のうちどれか」。選択肢から選ぶ問題の書き出しです。' },
      { term: 'NOT ／ EXCEPT', desc: '「〜でないもの」「〜を除いて」。正しくないものを選ぶ問題で使われ、大文字で強調されることが多い語です。' },
      { term: 'MOST ／ BEST', desc: '「最も〜なもの」。正しそうな選択肢が複数あっても、最も適切な一つを選びます。' },
      { term: 'Select TWO', desc: '「2 つ選べ」。選ぶ数を指定する言い方です。Choose all that apply（当てはまるものをすべて選べ）という形もあります。' },
      { term: 'scenario', desc: '「場面設定」。設問の前提として示される状況の説明です。' },
    ],
    vocabulary: CLAUDE_VOCABULARY,
    resources: [
      {
        title: '用語集（Glossary）',
        url: `${CLAUDE_DOCS}/about-claude/glossary`,
        kind: '公式ドキュメント',
        note: 'コンテキストウィンドウ・latency・トークンなど、基本の用語を英語で説明しています',
      },
      {
        title: 'API のエラー一覧',
        url: `${CLAUDE_DOCS}/api/errors`,
        kind: '公式ドキュメント',
        note: 'rate_limit_error（429）など、エラーの種類と意味を確かめられます',
      },
      {
        title: 'ハルシネーションを減らす',
        url: `${CLAUDE_DOCS}/test-and-evaluate/strengthen-guardrails/reduce-hallucinations`,
        kind: '公式ドキュメント',
      },
      {
        title: 'Claude Academy（無料のコース）',
        url: 'https://academy.claude.com/',
        kind: '公式コース',
      },
    ],
    practice: [{ setId: 'claude-vocabulary', domains: CLAUDE_VOCABULARY.map((g) => g.id) }],
  },
];

export function getStudyTopic(id: string): StudyTopic | undefined {
  return STUDY_TOPICS.find((t) => t.id === id);
}
