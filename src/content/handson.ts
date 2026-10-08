import type { Resource } from '@/lib/quiz/types';

/** やってみた（手順付きのハンズオン） */
export type HandsonGuide = {
  id: string;
  track: 'claude' | 'databricks';
  title: string;
  summary: string;
  level: '入門' | '中級';
  /** 目安の時間（分） */
  minutes: number;
  /** 手順を実際に試したかどうか。tested は本サイトで動かして確かめたもの */
  verified: { status: 'tested' | 'untested'; note: string };
  goal: string[];
  prerequisites: string[];
  steps: { title: string; body: string[]; code?: { label?: string; content: string }[] }[];
  check: string[];
  pitfalls: string[];
  cleanup?: string[];
  resources: Resource[];
};

export const HANDSON_GUIDES: HandsonGuide[] = [
  {
    id: 'claude-code-skill',
    track: 'claude',
    title: 'Claude Code で自作の Skill を作る',
    summary: '日本語のコミットメッセージを決まった形で書く Skill を作り、Claude Code が自動で使うのを確かめる。',
    level: '入門',
    minutes: 15,
    verified: { status: 'tested', note: '2026年10月7日に Claude Code 2.1.292 で手順どおりに動くことを確かめました。' },
    goal: [
      'Skill の置き場所と、SKILL.md の書き方が分かる',
      '頼み方に合わせて、Claude Code が Skill を自動で選んで使うことを確かめる',
    ],
    prerequisites: ['Claude Code が使えること（ログイン済み）', 'git が使えること'],
    steps: [
      {
        title: '練習用のリポジトリを用意する',
        body: ['空のフォルダで git のリポジトリを作り、ファイルを1つコミットしてから、少し書き換えておきます。この書き換えが、コミットメッセージを作る対象になります。'],
        code: [
          {
            content: `mkdir skill-practice && cd skill-practice
git init
printf 'def add(a, b):\\n    return a + b\\n' > calc.py
git add . && git commit -m "init"
printf 'def add(a, b):\\n    return a + b\\n\\n\\ndef sub(a, b):\\n    return a - b\\n' > calc.py`,
          },
        ],
      },
      {
        title: 'Skill のフォルダと SKILL.md を作る',
        body: [
          'プロジェクトの Skill は .claude/skills/<Skill の名前>/SKILL.md に置きます。先頭の name と description が大切で、Claude Code は description を読んで、いつこの Skill を使うかを判断します。',
          '本文には、Skill を使うときの手順を書きます。',
        ],
        code: [
          { label: 'コマンド', content: 'mkdir -p .claude/skills/commit-message-ja' },
          {
            label: '.claude/skills/commit-message-ja/SKILL.md',
            content: `---
name: commit-message-ja
description: git の変更内容から、日本語のコミットメッセージを作る。ユーザーが「コミットメッセージを作って」などと頼んだときに使う。
---

# 日本語のコミットメッセージを作る

1. \`git diff\` と \`git diff --staged\` で変更内容を確かめる。
2. 次の形でコミットメッセージを書く。
   - 1行目: \`種類: 何をしたか\`（種類は feat・fix・docs・refactor・test のどれか）。50 文字以内。
   - 2行目は空ける。
   - 3行目以降: 変更の理由を箇条書きで書く。
3. コミットはせず、メッセージだけを示す。`,
          },
        ],
      },
      {
        title: 'Claude Code に頼む',
        body: ['同じフォルダで Claude Code を起動し、「この変更のコミットメッセージを作って」と頼みます。Skill の名前を言わなくても、description に合う頼み方なら自動で使われます。'],
        code: [{ content: 'claude\n> この変更のコミットメッセージを作って' }],
      },
    ],
    check: [
      '途中で commit-message-ja の Skill を使ったことが表示される',
      '1行目が「feat: 引き算を行う sub 関数を追加」のような形になっている（試したときの実際の出力です）',
      'コミットはされず、メッセージだけが示される',
    ],
    pitfalls: [
      'description があいまいだと、Skill が選ばれません。「いつ使うか」を具体的に書きます。',
      'Skill の手順に「コミットはしない」のような禁止事項を書いておくと、意図しない操作を防げます。権限で確実に止めたいときは settings.json の permissions を使います。',
    ],
    cleanup: ['練習用のフォルダ（skill-practice）を削除します。'],
    resources: [
      { title: 'Skill で Claude を拡張する（Claude Code のドキュメント）', url: 'https://code.claude.com/docs/en/skills', kind: '公式ドキュメント' },
    ],
  },
  {
    id: 'mcp-server-for-claude-code',
    track: 'claude',
    title: '自作の MCP サーバーを作って Claude Code につなぐ',
    summary: '文字数を正確に数えるツールを MCP サーバーとして作り、Claude Code から呼び出す。',
    level: '中級',
    minutes: 30,
    verified: { status: 'tested', note: '2026年10月7日に、MCP の TypeScript SDK 1.32.1・Node.js 24・Claude Code 2.1.292 で手順どおりに動くことを確かめました。' },
    goal: [
      'MCP サーバーの最小の作り（ツールの定義と、標準入出力での接続）が分かる',
      'Claude Code に MCP サーバーを登録して、ツールを呼び出してもらう',
    ],
    prerequisites: ['Node.js 20 以上', 'Claude Code が使えること（ログイン済み）'],
    steps: [
      {
        title: 'プロジェクトを作り、SDK を入れる',
        body: ['MCP の公式の TypeScript SDK と、入力の形を定義する zod を入れます。'],
        code: [
          {
            content: `mkdir moji-counter && cd moji-counter
npm init -y
npm pkg set type=module
npm install @modelcontextprotocol/sdk zod`,
          },
        ],
      },
      {
        title: 'ツールを1つ持つ MCP サーバーを書く',
        body: [
          '生成 AI は文字数を数えるのが苦手なので、プログラムで正確に数えるツールにします。ツールには名前・説明・入力の形を付けます。Claude は説明を読んで、いつ使うかを判断します。',
          'Claude Code とは標準入出力（stdio）でつなぎます。',
        ],
        code: [
          {
            label: 'server.js',
            content: `import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({ name: 'moji-counter', version: '1.0.0' });

server.registerTool(
  'count_characters',
  {
    title: '文字数を数える',
    description: '日本語を含む文章の文字数を正確に数える。改行と空白を除いた文字数も返す。文字数の指定がある文章を書いたときの確認に使う。',
    inputSchema: { text: z.string().describe('数えたい文章') },
  },
  async ({ text }) => {
    const all = [...text].length;
    const withoutSpaces = [...text.replace(/\\s/g, '')].length;
    return { content: [{ type: 'text', text: \`文字数: \${all}（改行・空白を除くと \${withoutSpaces}）\` }] };
  },
);

await server.connect(new StdioServerTransport());`,
          },
        ],
      },
      {
        title: 'Claude Code に登録する',
        body: [
          'claude mcp add で登録します。-- の後ろが、サーバーを起動するコマンドです。既定では、このプロジェクトであなただけが使える設定（local）になります。チームで共有したいときは --scope project を付けると、.mcp.json に保存されます。',
        ],
        code: [{ content: 'claude mcp add moji-counter -- node "$(pwd)/server.js"' }],
      },
      {
        title: 'Claude Code から使ってもらう',
        body: ['Claude Code を起動し、文字数を数えるよう頼みます。初めてツールを使うときは、実行してよいかの確認が出るので許可します。'],
        code: [{ content: 'claude\n> 「生成AIで業務を変える」という文の文字数を、moji-counter のツールで数えて' }],
      },
    ],
    check: [
      'Claude Code の中で /mcp を実行すると、moji-counter が connected と表示される',
      'mcp__moji-counter__count_characters のツールが呼ばれ、「文字数: 11（改行・空白を除くと 11）」が返る（試したときの実際の結果です）',
    ],
    pitfalls: [
      'サーバーのパスは絶対パスで登録します。相対パスだと、Claude Code を別の場所で起動したときに見つかりません。',
      'stdio のサーバーでは、標準出力にログを書かないでください。通信が壊れます。ログは標準エラー出力（console.error）に書きます。',
      'ツールの説明（description）は、Claude がツールを選ぶ手がかりです。いつ使うのかを具体的に書きます。',
    ],
    cleanup: ['claude mcp remove moji-counter で登録を外し、フォルダを削除します。'],
    resources: [
      { title: 'Claude Code で MCP を使う', url: 'https://code.claude.com/docs/en/mcp', kind: '公式ドキュメント' },
      { title: 'MCP サーバーを作る（Model Context Protocol）', url: 'https://modelcontextprotocol.io/docs/develop/build-server', kind: '仕様' },
    ],
  },
  {
    id: 'databricks-ai-query',
    track: 'databricks',
    title: 'ai_query で、テーブルの文章を生成 AI に一括で分類させる',
    summary: 'お問い合わせの文章が入ったテーブルに対して、SQL だけで生成 AI（Claude が使える環境なら Claude）に分類させる。',
    level: '入門',
    minutes: 20,
    verified: {
      status: 'tested',
      note: '2026年10月8日に Databricks（Free Edition、サーバーレスの SQL ウェアハウス）で、Llama 4 Maverick のエンドポイントを使って手順どおりに動くことを確かめました。試した環境には Claude のエンドポイントがなかったため、Claude での動作はまだ確かめていません。',
    },
    goal: ['ai_query の書き方が分かる', 'SQL だけで、生成 AI による大量のデータ処理ができることを確かめる'],
    prerequisites: [
      'Unity Catalog が使える Databricks のワークスペース',
      'Databricks SQL のウェアハウス（Classic では使えません）',
      '使うモデルのエンドポイントに対する CAN QUERY の権限',
      '書き込める Unity Catalog のカタログとスキーマ',
    ],
    steps: [
      {
        title: '練習用のテーブルを作る',
        body: ['SQL エディタで、お問い合わせを3件入れたテーブルを作ります。workspace.default の部分は、書き込めるカタログとスキーマに置き換えます（Free Edition では workspace カタログが使えます）。'],
        code: [
          {
            content: `CREATE OR REPLACE TABLE workspace.default.inquiries AS
SELECT * FROM VALUES
  (1, 'ログインしようとすると、パスワードが違うと表示されます。'),
  (2, '請求書の宛名を会社名に変更したいです。'),
  (3, 'ダッシュボードの読み込みが、昨日から遅くなっています。')
AS t(id, body);`,
          },
        ],
      },
      {
        title: '使えるモデルのエンドポイント名を確かめる',
        body: [
          'ワークスペースの Serving の画面で、使えるモデルのエンドポイント名を確かめます。試した環境では databricks-llama-4-maverick のような名前でした。ai_query には、この画面に出ている名前をそのまま渡します。',
          'Claude のエンドポイントがある環境では、以下の例の名前を、その Claude のエンドポイント名に置き換えてください。使えるモデルは、ワークスペースの種類や地域によって違います。',
        ],
      },
      {
        title: 'ai_query で分類する',
        body: ['ai_query の1つ目にエンドポイントの名前、2つ目に指示の文章を渡します。指示に列の値をつなげると、行ごとに処理されます。'],
        code: [
          {
            content: `SELECT
  id,
  body,
  ai_query(
    'databricks-llama-4-maverick',
    '次のお問い合わせを「アカウント」「請求」「性能」「その他」のどれか1つに分類し、分類名だけを答えてください。\\n\\n' || body
  ) AS category
FROM workspace.default.inquiries;`,
          },
        ],
      },
    ],
    check: ['category の列に、行ごとの分類が入る。試したときの実際の結果は、1 がアカウント、2 が請求、3 が性能でした'],
    pitfalls: [
      'エンドポイントは Serving の画面に出ている名前で指定します。試した環境では、system.ai.モデル名 の形で指定するとエラー（INTERNAL_ERROR）になりました。',
      'SQL Classic のウェアハウスでは使えません。Pro かサーバーレスを使います。',
      '行の数だけモデルを呼ぶので、大きなテーブルでいきなり試すと費用がかさみます。まず LIMIT で件数を絞ります。',
      '答えの形をそろえたいときは、responseFormat で構造化した出力を指定できます（Databricks Runtime 15.4 以上）。',
    ],
    cleanup: ['DROP TABLE workspace.default.inquiries; で練習用のテーブルを削除します。'],
    resources: [
      { title: 'ai_query 関数', url: 'https://docs.databricks.com/aws/en/sql/language-manual/functions/ai_query', kind: '公式ドキュメント' },
      { title: 'Databricks で使えるモデル', url: 'https://docs.databricks.com/aws/en/machine-learning/model-serving/foundation-model-overview', kind: '公式ドキュメント' },
    ],
  },
  {
    id: 'databricks-unity-catalog-permissions',
    track: 'databricks',
    title: 'Unity Catalog で、チーム用のカタログと権限を作る',
    summary: '分析チームにだけ読み取りを許すカタログとスキーマを作り、権限の付け方を確かめる。',
    level: '入門',
    minutes: 20,
    verified: {
      status: 'tested',
      note: '2026年10月8日に Databricks（Free Edition）で確かめました。権限は、ワークスペースで作ったグループには付けられず、アカウントのグループ（試したときは account users）には付けられました。2人目の利用者がいない環境だったため、「読めて、書けない」ことの確認はまだです。',
    },
    goal: ['カタログ・スキーマ・テーブルの3階層と、権限の関係が分かる', 'テーブルを読ませるのに必要な権限の組み合わせを確かめる'],
    prerequisites: [
      'Unity Catalog が使える Databricks のワークスペース',
      'カタログを作る権限（メタストアの CREATE CATALOG）',
      '権限を付ける相手の、アカウントのグループ（例: analysts）。ワークスペースの中だけで作ったグループは使えません',
    ],
    steps: [
      {
        title: 'カタログとスキーマを作る',
        body: ['案件や環境ごとにカタログを分けると、権限の管理がしやすくなります。'],
        code: [
          {
            content: `CREATE CATALOG IF NOT EXISTS sales_dev;
CREATE SCHEMA IF NOT EXISTS sales_dev.reports;
CREATE TABLE sales_dev.reports.monthly AS
SELECT * FROM VALUES ('2026-09', 1200), ('2026-10', 1350) AS t(month, amount);`,
          },
        ],
      },
      {
        title: 'グループに読み取りの権限を付ける',
        body: [
          'テーブルを読むには、テーブルの SELECT だけでなく、親のカタログの USE CATALOG と、スキーマの USE SCHEMA も必要です。権限は個人ではなくグループに付けると、人の入れ替わりに強くなります。',
          '権限を付けられるのは、アカウントのグループです。手元で試すだけなら、最初からある account users（アカウントの全員）に付けても確かめられます。',
        ],
        code: [
          {
            content: `GRANT USE CATALOG ON CATALOG sales_dev TO \`analysts\`;
GRANT USE SCHEMA ON SCHEMA sales_dev.reports TO \`analysts\`;
GRANT SELECT ON TABLE sales_dev.reports.monthly TO \`analysts\`;`,
          },
        ],
      },
      {
        title: '付けた権限を確かめる',
        body: ['SHOW GRANTS で、だれにどの権限が付いているかを確かめます。'],
        code: [{ content: 'SHOW GRANTS ON TABLE sales_dev.reports.monthly;' }],
      },
    ],
    check: ['SHOW GRANTS の結果に、analysts の SELECT が表示される（試したときは account users | SELECT | TABLE | sales_dev.reports.monthly と表示されました）', 'analysts のメンバーが、テーブルを読めて、書き込めない'],
    pitfalls: [
      'ワークスペースの管理画面で作ったグループ（ワークスペースのローカルなグループ）に GRANT すると、「Could not find principal with name …」（PRINCIPAL_DOES_NOT_EXIST）のエラーになります。Unity Catalog の権限は、アカウントのグループに付けます。試したときに実際に出たエラーです。',
      'SELECT だけを付けても、USE CATALOG と USE SCHEMA がないと読めません。いちばん多いつまずきです。',
      'スキーマやカタログに SELECT を付けると、その中のすべてのテーブル（後から作るものも含む）に効きます。範囲を意識して付けます。',
    ],
    cleanup: ['DROP CATALOG sales_dev CASCADE; で、練習用のカタログを中身ごと削除します。'],
    resources: [
      { title: 'Unity Catalog とは', url: 'https://docs.databricks.com/aws/en/data-governance/unity-catalog/', kind: '公式ドキュメント' },
    ],
  },
];

export function getHandsonGuide(id: string): HandsonGuide | undefined {
  return HANDSON_GUIDES.find((g) => g.id === id);
}
