import type { Resource } from '@/lib/quiz/types';

/**
 * 資格ごとの「押さえる論点」。著者が問題集で学んだ内容から、問われた知識を1つずつ論点として取り出したもの。
 * 問題集の問題文・選択肢・例は載せず、説明は公式ドキュメントで確かめた事実をもとに書く。
 */
export type ExamPoint = {
  id: string;
  title: string;
  /** 資格の出題範囲の分野名（certifications.ts の outline の nameJa） */
  area: string;
  /** 覚えること（短く） */
  keyPoints: string[];
  explanation: string[];
  /** よくある誤解（間違えやすい考え方と、なぜ違うか） */
  misconceptions: string[];
  /** 関連する基礎知識（basics.ts の id） */
  basicsIds: string[];
  resources: Resource[];
};

export type ExamPointSet = {
  certId: string;
  /** 内容を公式ドキュメントで確かめた日 */
  checkedOn: string;
  points: ExamPoint[];
};

const CLAUDE_DOCS = 'https://platform.claude.com/docs/en';

export const EXAM_POINT_SETS: ExamPointSet[] = [
  {
    certId: 'claude-certified-developer-foundations',
    checkedOn: '2026年10月8日',
    points: [
      {
        id: 'tool-description',
        title: 'ツールの選び分けは、説明（description）で決まる',
        area: 'ツール利用',
        keyPoints: [
          'Claude はツールの名前と説明を読んで、どれを使うかを決める',
          '名前も入力の形も同じくらい明確なら、見分ける材料はほぼ説明だけ',
          '説明には「いつ使うか」「何が返るか」「似たツールとの違い」を書く',
        ],
        explanation: [
          '似た役割のツールが複数あり、片方ばかりが選ばれてしまうときは、まず説明を直すのがいちばん直接的な対策です。説明が短かったりあいまいだったりすると、どちらのツールを使うべきかをモデルが判断できず、選び方が偏ります。',
          'たとえば「注文を探す」と「返品を探す」のツールなら、それぞれの説明に、どんな依頼のときに使うか、何が返ってくるか、もう一方のツールとどう違うかを書き分けます。',
        ],
        misconceptions: [
          '入力の形（スキーマ）を変える: 選び間違いの原因がスキーマでなければ、効果はありません。',
          'ツール名を変える・ツールを1つにまとめる: 名前がすでに明確なら、根本の原因（説明の不足）は残ります。まとめるのは設計の変更で、直接の対策ではありません。',
        ],
        basicsIds: ['claude-tool-design'],
        resources: [{ title: 'ツールの使い方（Tool use）', url: `${CLAUDE_DOCS}/agents-and-tools/tool-use/overview`, kind: '公式ドキュメント' }],
      },
      {
        id: 'batch-limits',
        title: 'Message Batches API の2つの期限（処理は 24 時間、結果は 29 日間）',
        area: 'Claude API',
        keyPoints: [
          '処理には最大 24 時間かかることがある（多くは 1 時間以内に終わる）',
          '24 時間以内に処理が終わらなかったリクエストは期限切れになる',
          '結果は作成から 29 日間取得できる（処理の期限とは別）',
          '料金は通常の半額',
        ],
        explanation: [
          'Message Batches API は、すぐに結果がいらない大量のリクエストを、まとめて非同期で処理する仕組みです。時間の制限が2種類あり、「処理にかかる時間の上限」と「結果を取りに行ける期間」は別物です。',
          '夜間にまとめて送る処理を設計するときは、24 時間以内に終わらないリクエストがありうることを前提にし、結果は 29 日以内に取得して保存しておきます。',
        ],
        misconceptions: [
          '「1 時間で必ず終わる」: 多くは 1 時間以内に終わりますが、保証ではありません。上限は 24 時間です。',
          '「処理と結果の保持は同じ 24 時間（または同じ 29 日間）」: 処理の上限は 24 時間、結果の取得期間は 29 日間で、別の制限です。',
        ],
        basicsIds: ['claude-cost-optimization'],
        resources: [{ title: 'Batch 処理（Batch processing）', url: `${CLAUDE_DOCS}/build-with-claude/batch-processing`, kind: '公式ドキュメント' }],
      },
      {
        id: 'workflow-vs-agent',
        title: 'ワークフローとエージェントの違いは、だれが次の手を決めるか',
        area: 'エージェント開発',
        keyPoints: [
          'ワークフロー: 開発者がコードで手順と分岐を前もって決める',
          'エージェント: モデルがループの中で途中の結果を見て、次に使うツールや行動を決める',
          '制御の主体が「コード」か「モデル」かが本質の違い',
        ],
        explanation: [
          'ワークフローでは、モデルは決められた経路の中の各段階を受け持ちます。エージェントでは、モデル自身が、ツールの結果などの途中の情報をもとに、実行しながら次の行動を選びます。',
          '流れが決まっている業務はワークフローのほうが安定し、費用も読みやすくなります。手順を前もって決められない仕事にだけ、エージェントを使うのが基本です。',
        ],
        misconceptions: [
          '「ツール（サーバーツールを含む）を呼ぶならエージェント」: ツールはワークフローでも使えるので、見分けるポイントにはなりません。',
          '「構造化した出力を返すならエージェント」: 出力の形式の話で、どちらでも使えます。',
          '「手順を前もって決めて、その通りに進める」: これはワークフローの説明です。',
        ],
        basicsIds: ['claude-agent-design'],
        resources: [{ title: 'Building Effective AI Agents（Anthropic）', url: 'https://www.anthropic.com/engineering/building-effective-agents', kind: '公式サイト' }],
      },
      {
        id: 'mcp-transports',
        title: 'MCP の stdio は「同じパソコンで1人が使う」形に向く',
        area: 'エージェント開発',
        keyPoints: [
          'stdio: AI アプリが MCP サーバーを子プロセスとして起動し、標準入出力でやりとりする',
          '同じパソコンの上で、1つのクライアントが使う形に向く（ネットワークの設定が要らない）',
          '離れた場所・複数の利用者・利用者ごとの認証・台数を増やす構成は Streamable HTTP',
        ],
        explanation: [
          'MCP の通信の方式（トランスポート）には、stdio と Streamable HTTP があります。stdio はクライアントが起動した子プロセスとの通信なので、クライアントとサーバーが同じ機械の上にあることが前提です。',
          '複数の利用者が同時に使うサービス、利用者ごとに OAuth で認証する公開のサーバー、ロードバランサーの後ろで台数を増やす構成には、HTTP の方式を使います。',
        ],
        misconceptions: [
          '「マルチテナント・公開・水平スケールにも stdio」: stdio は子プロセスとの通信なので、離れた場所からの接続や、複数の利用者での共有には向きません。',
        ],
        basicsIds: ['claude-mcp-in-practice'],
        resources: [{ title: 'MCP の仕様', url: 'https://modelcontextprotocol.io/specification/latest', kind: '仕様' }],
      },
      {
        id: 'context-isolation',
        title: 'コンテキストの汚染は、サブエージェントで分けて防ぐ',
        area: 'エージェント開発',
        keyPoints: [
          '関係のないツールの結果がたまると、エージェントの集中力（精度）が落ちる',
          '独立した調べものはサブエージェントに任せ、要約だけを返してもらう',
          'コンテキストウィンドウを広げても、汚染の問題は解決しない',
        ],
        explanation: [
          'サブエージェントは自分のコンテキストでツールを使い、大量の検索結果やログを処理して、要約だけを元のエージェントに返します。元のエージェントのコンテキストは小さいまま保たれ、トークンの増加も抑えられます。',
          'Anthropic も、コンテキストは限りがあり、増えるほど効き目が下がる資源だとしています。ウィンドウの大きさにかかわらず汚染は起こりうるので、容量ではなく中身の質の問題として扱います。',
        ],
        misconceptions: [
          '「ウィンドウを広げればよい」: 入る量は増えますが、関係のない情報は残り、トークンも増え続けます。',
          '「ツールの結果を返さないようにする」: 調べものに必要な情報が得られず、仕事になりません。',
          '「複数の調べものを1つのプロンプトにまとめる」: 情報がさらに混ざり、汚染が悪化します。',
        ],
        basicsIds: ['claude-context-management'],
        resources: [
          { title: 'Effective context engineering for AI agents（Anthropic）', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents', kind: '公式サイト' },
          { title: 'サブエージェント（Claude Code）', url: 'https://code.claude.com/docs/en/sub-agents', kind: '公式ドキュメント' },
        ],
      },
    ],
  },
];

export function examPointsFor(certId: string): ExamPointSet | undefined {
  return EXAM_POINT_SETS.find((s) => s.certId === certId);
}
