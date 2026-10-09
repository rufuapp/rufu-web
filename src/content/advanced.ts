import type { BasicsTopic } from './basics';

// 応用知識: 基礎知識を一通り押さえた後に読む、作り方や仕組みに踏み込んだ内容。形は基礎知識と同じ

export const ADVANCED_TOPICS: BasicsTopic[] = [
  {
    id: 'ontobricks-knowledge-graph',
    group: 'databricks',
    title: 'OntoBricks でナレッジグラフを作る',
    summary: 'オントロジーの設計から、テーブルとの対応づけ、グラフの作成、推論と検証、AI エージェントからの利用まで。',
    intro: [
      'OntoBricks でナレッジグラフを作る流れと、その裏で使われている標準を押さえます。何をするツールかは、基礎知識の「OntoBricks とは」を先に読んでください。',
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
    seeAlso: [{ href: '/basics/databricks-ontobricks', title: '基礎知識：OntoBricks とは' }],
    resources: [
      { title: 'databrickslabs/ontobricks（GitHub）', url: 'https://github.com/databrickslabs/ontobricks', kind: '公式サイト' },
      { title: 'OntoBricks の使い方の例（GitHub）', url: 'https://github.com/databrickslabs/ontobricks/blob/master/docs/examples.md', kind: '公式サイト' },
    ],
  },
];

export function getAdvancedTopic(id: string): BasicsTopic | undefined {
  return ADVANCED_TOPICS.find((t) => t.id === id);
}
