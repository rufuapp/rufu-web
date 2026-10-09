import type { BasicsTopic } from './basics';

const DBX_DOCS = 'https://docs.databricks.com/aws/en';

// 応用知識: 基礎知識を一通り押さえた後に読む、作り方や仕組みに踏み込んだ内容。形は基礎知識と同じ

export const ADVANCED_TOPICS: BasicsTopic[] = [
  {
    id: 'databricks-genie-ontology',
    group: 'databricks',
    checkedOn: '2026年10月9日',
    status: 'パブリックプレビュー',
    title: 'オントロジーで AI に業務の意味を伝える（Genie Ontology）',
    summary: 'テーブルの列名だけでは伝わらない「業務の言葉の意味」を、AI に渡すための仕組み。Unity Catalog のセマンティクスと Genie Ontology。',
    intro: [
      '生成 AI にデータの質問をさせると、「売上」「アクティブな顧客」のような業務の言葉を、テーブルのどの列でどう計算するのかが分からず、答えがぶれることがあります。オントロジーは、業務の概念と、その関係を定義したものです。Databricks では、Genie Ontology がこの役割を受け持ちます。',
    ],
    sections: [
      {
        heading: 'セマンティックモデルとオントロジー',
        body: [
          'セマンティックモデルは、指標（売上の合計など）や切り口（地域・月など）のように、人が意図して定義した業務の概念をまとめたものです。オントロジーは、それに加えて、概念どうしの関係や、業務が実際にどう動いているかの知識まで広げたものです。',
        ],
      },
      {
        heading: 'Unity Catalog のセマンティクス',
        body: [
          '人が定義し、管理し、認定する「業務の定義」は、Unity Catalog の機能で持ちます。メトリクスビューは指標と切り口をコードとして一度だけ定義するもの、Pages は概念の正式な意味をデータのそばに書いておく場所、Domains は資産を業務のまとまりごとにグループにするものです。',
        ],
      },
      {
        heading: 'Genie Ontology',
        body: [
          'Genie Ontology は、Genie の仲間の AI（Genie One・Genie Code）に、組織の業務の地図を渡す共通の層です。Unity Catalog のセマンティクス（人が定義したもの）に、メトリクスビュー・ダッシュボード・SQL の問い合わせ・Genie のエージェントから自動で取り出した知識を組み合わせます。',
          '取り出した知識は Unity Catalog の権限で絞られ、利用者が見てよい資産から取り出したものだけが使われます。2026年10月時点ではパブリックプレビューです。',
        ],
      },
      {
        heading: 'Palantir のオントロジーとの比較（参考）',
        body: [
          '比較対象の Palantir も、オントロジーを中核に置いています。Palantir のオントロジーは、データをオブジェクト（もの）とリンク（関係）で表し、さらにアクション（操作）までを持つ「組織の運用の層」と説明されています。Databricks の Genie Ontology は、主に AI がデータの質問に正しく答えるための文脈の層として位置づけられています。',
        ],
      },
    ],
    checklist: ['業務の重要な指標をメトリクスビューで定義したか', '用語の正式な意味を Pages に書いたか', '資産を業務のまとまり（Domains）で整理したか'],
    resources: [
      { title: 'Genie Ontology', url: `${DBX_DOCS}/genie/genie-ontology`, kind: '公式ドキュメント' },
      { title: 'Pages（Unity Catalog）', url: `${DBX_DOCS}/uc-semantics/pages`, kind: '公式ドキュメント' },
      { title: 'メトリクスビュー（Unity Catalog）', url: `${DBX_DOCS}/metric-views/`, kind: '公式ドキュメント' },
      { title: 'Operationalizing Genie Ontology in Your Data Stack（Databricks ブログ）', url: 'https://www.databricks.com/blog/operationalizing-genie-ontology-your-data-stack', kind: '公式サイト' },
      { title: 'Ontology の概要（Palantir）', url: 'https://www.palantir.com/docs/foundry/ontology/overview/', kind: '公式サイト' },
    ],
  },
  {
    id: 'databricks-ontobricks',
    group: 'databricks',
    checkedOn: '2026年10月9日',
    status: 'Labs（サポートなし）',
    title: 'OntoBricks とは',
    summary: 'Unity Catalog のテーブルを、オントロジーにもとづくナレッジグラフにする Databricks Labs のツール。正式な製品ではない。',
    intro: [
      'OntoBricks は、Unity Catalog のテーブルを、たどって調べられるナレッジグラフ（もの同士の関係を網の目で表したデータ）に変えるツールです。Databricks Labs のプロジェクトとして、GitHub で公開されています。',
    ],
    sections: [
      {
        heading: '何をするツールか',
        body: [
          '「顧客」「契約」「製品」のような業務の概念と、その関係（オントロジー）を定義し、それを Unity Catalog のテーブルに結びつけて、ナレッジグラフを作ります。できたグラフは、画面でたどって見たり、AI エージェントから MCP で使ったりできます。',
          'ワークスペースの中に Databricks Apps として置いて使います。',
        ],
      },
      {
        heading: '正式な製品ではない',
        body: [
          'Databricks Labs のプロジェクトは、試すために公開されているもので、Databricks による正式なサポートや SLA はありません（README の記載）。ライセンスは Databricks License です。お客さまに紹介するときは、この点を最初に伝えます。',
        ],
      },
      {
        heading: 'Genie Ontology との使い分け',
        body: [
          'Genie にデータの質問を正しく答えさせたいだけなら、まず Databricks の正式な機能である Genie Ontology と、Unity Catalog のセマンティクス（メトリクスビュー・Pages・Domains）を検討します。',
          'もの同士の関係を何段もたどる問い合わせや、業界の標準のオントロジー（金融・医療・製造など）を使いたい場面で、OntoBricks を検討する、という順番が考えやすいと思います。',
        ],
      },
    ],
    checklist: ['正式なサポートがないことを、お客さまと共有したか', 'Genie Ontology で足りないかを先に検討したか'],
    seeAlso: [
      { href: '/advanced/ontobricks-knowledge-graph', title: '応用知識：OntoBricks でナレッジグラフを作る' },
      { href: '/advanced/databricks-genie-ontology', title: '応用知識：オントロジーで AI に業務の意味を伝える（Genie Ontology）' },
    ],
    resources: [{ title: 'databrickslabs/ontobricks（GitHub）', url: 'https://github.com/databrickslabs/ontobricks', kind: '公式サイト' }],
  },
  {
    id: 'ontobricks-knowledge-graph',
    group: 'databricks',
    checkedOn: '2026年10月9日',
    status: 'Labs（サポートなし）',
    title: 'OntoBricks でナレッジグラフを作る',
    summary: 'オントロジーの設計から、テーブルとの対応づけ、グラフの作成、推論と検証、AI エージェントからの利用まで。',
    intro: [
      'OntoBricks でナレッジグラフを作る流れと、その裏で使われている標準を押さえます。何をするツールかは、「OntoBricks とは」を先に読んでください。',
    ],
    sections: [
      {
        heading: '作る流れ',
        body: [
          '一、オントロジーを設計する: 業務の概念（クラス）と関係を、画面でドラッグして作ります。金融・医療・製造などの業界の標準のオントロジーを取り込んで使うこともできます。',
          '二、テーブルと対応づける: オントロジーの概念を、Unity Catalog のテーブルの列に結びつけます。対応づけの SQL は、LLM が書くのを手伝います。',
          '三、グラフにする: 対応づけにもとづいて、ナレッジグラフのデータ（主語・述語・目的語の3つ組）を作って保存します。',
          '四、推論と検証をする: 定義したルールから新しい関係を導き、データがルールに合っているかを確かめます。',
          '五、問い合わせる・AI に使わせる: 自動で作られる GraphQL の API や SPARQL で問い合わせ、MCP で AI エージェントに公開します。',
        ],
      },
      {
        heading: '使われている標準',
        body: [
          'オントロジーは OWL と RDFS、テーブルとの対応づけは R2RML、推論は OWL 2 RL と SWRL、検証は SHACL です。いずれも W3C などで決められた標準で、ほかのナレッジグラフのツールとも考え方を共有できます。',
        ],
      },
      {
        heading: 'グラフの保存先',
        body: [
          '保存先は、業務のまとまり（ドメイン）ごとに選べます。既定は Lakebase（Postgres）で、Delta のテーブル（追加の仕組みが要らない）、Neo4j、保存しない（オントロジーだけを扱う）からも選べます。',
        ],
      },
      {
        heading: 'AI エージェントから使う',
        body: [
          'MCP に対応しているので、Claude Desktop や Cursor、Databricks の Playground などから、業務の意味を持ったデータとして使えます。テーブルを直接見せるより、概念と関係に沿って問い合わせられるため、AI が業務の言葉で考えやすくなります。',
        ],
      },
    ],
    checklist: ['業界の標準のオントロジーを使えないか確かめたか', 'ドメインごとに保存先を決めたか', '推論と検証のルールを決めたか', 'AI エージェントに公開する範囲を決めたか'],
    seeAlso: [{ href: '/advanced/databricks-ontobricks', title: '応用知識：OntoBricks とは' }],
    resources: [
      { title: 'databrickslabs/ontobricks（GitHub）', url: 'https://github.com/databrickslabs/ontobricks', kind: '公式サイト' },
      { title: 'OntoBricks の使い方の例（GitHub）', url: 'https://github.com/databrickslabs/ontobricks/blob/master/docs/examples.md', kind: '公式サイト' },
    ],
  },
  {
    id: 'databricks-omnigent',
    group: 'databricks',
    checkedOn: '2026年10月9日',
    status: 'ベータ版',
    title: 'Omnigent でエージェントを束ねる',
    summary: 'Claude Code や Codex などのエージェントの上にかぶせ、組み合わせ・統制・共同作業をまとめて扱うメタハーネス。',
    intro: [
      'Omnigent は、Databricks の AI チームなどが作ったオープンソース（Apache 2.0）の「メタハーネス」です。Claude Code・Codex・Cursor などのエージェントを置き換えるのではなく、その上に共通の層をかぶせます。',
    ],
    sections: [
      {
        heading: '組み合わせる',
        body: ['エージェントを短い YAML で定義し、使うハーネス（Claude Code や Codex など）やモデルを1行で切り替えられます。ツール・プロンプト・Skill・ポリシーはそのまま使い回せます。'],
      },
      {
        heading: '統制する',
        body: ['エージェントは OS のサンドボックス（macOS は seatbelt、Linux は bubblewrap）の中で動き、触れるファイルやネットワークが制限されます。「書き込みの前に確認する」などのポリシーや、費用の上限も設定できます。'],
      },
      {
        heading: '一緒に使う',
        body: ['動いているセッションをリンクで共有し、チームの人が一緒に入って指示を出したり、会話を分岐させて続けたりできます。'],
      },
      {
        heading: 'Databricks の上で使う',
        body: [
          'Databricks が管理するサーバーで動かすと、ワークスペースの認証と連携し、モデルは基盤モデルと Unity Gateway を通して使います。Databricks Sandboxes での実行（一部の AWS の地域）や、CEL で書く独自のポリシーも使えます。',
          '2026年10月時点ではベータ版で、Omnigent のプレビューの有効化と、Unity Gateway が使えるワークスペースが必要です。',
        ],
      },
    ],
    checklist: ['どのエージェントに、何を、どこまでさせるかを決めたか', 'サンドボックスと書き込み前の確認を設定したか', '費用の上限を決めたか'],
    resources: [
      { title: 'Omnigent on Databricks', url: `${DBX_DOCS}/omnigent/`, kind: '公式ドキュメント' },
      { title: 'omnigent-ai/omnigent（GitHub）', url: 'https://github.com/omnigent-ai/omnigent', kind: '公式サイト' },
    ],
  },
];

export function getAdvancedTopic(id: string): BasicsTopic | undefined {
  return ADVANCED_TOPICS.find((t) => t.id === id);
}
