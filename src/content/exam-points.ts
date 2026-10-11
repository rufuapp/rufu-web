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
    checkedOn: '2026年10月8日〜11日',
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
        title: 'Message Batches API の2つの期限（処理は 24 時間、結果は 29 日間）と、custom_id での照合',
        area: 'Claude API',
        keyPoints: [
          '処理には最大 24 時間かかることがある（多くは 1 時間以内に終わる）',
          '24 時間以内に処理が終わらなかったリクエストは期限切れになる',
          '結果は作成から 29 日間取得できる（処理の期限とは別）',
          '結果は入力の順に返るとは限らないので、リクエストごとに付ける custom_id で照合する',
          '結果はバッチの処理が終わってから取得する（1件ずつ流れてくるわけではない）',
          '料金は通常の半額',
        ],
        explanation: [
          'Message Batches API は、すぐに結果がいらない大量のリクエストを、まとめて非同期で処理する仕組みです。時間の制限が2種類あり、「処理にかかる時間の上限」と「結果を取りに行ける期間」は別物です。',
          '夜間にまとめて送る処理を設計するときは、24 時間以内に終わらないリクエストがありうることを前提にし、結果は 29 日以内に取得して保存しておきます。',
        ],
        misconceptions: [
          '「1 時間で必ず終わる」: 多くは 1 時間以内に終わりますが、保証ではありません。上限は 24 時間です。',
          '「処理と結果の保持は同じ 24 時間（または同じ 29 日間）」: 処理の上限は 24 時間、結果の取得期間は 29 日間で、別の制限です。',
          '「結果は送った順に返るので、配列の位置で照合できる」: 公式ドキュメントでは、結果はどの順でも返りうるとされています。custom_id で照合します。',
          '「料金が高くなる」: Batch は通常の約半額です。',
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
      {
        id: 'skills-on-demand',
        title: 'まれにしか使わない指示は、Skill にして必要なときだけ読み込む',
        area: 'エージェント開発',
        keyPoints: [
          'Skill は、ふだんは名前と説明だけがコンテキストに入り、仕事が説明に合ったときに本文（指示）が読み込まれる',
          'CLAUDE.md（プロジェクトのメモリ）は、毎回すべて読み込まれる',
          'まれにしか使わない長い指示を CLAUDE.md に書くと、使わないときもコンテキストとトークンを消費し続ける',
        ],
        explanation: [
          'Claude Code の Skill は、必要になるまで中身を読み込まない仕組み（段階的な開示）になっています。公式ドキュメントでも、CLAUDE.md と違い、Skill の本文は使われるときだけ読み込まれるので、長い参考資料も必要になるまではほとんど費用がかからない、と説明されています。',
          '「この作業のときだけ守ってほしい手順」は Skill に、「毎回必ず守ってほしい決まり」は CLAUDE.md に、と使い分けます。',
        ],
        misconceptions: [
          '「CLAUDE.md に書いておけば、必要なときに使われる」: CLAUDE.md は毎回すべて読み込まれるので、必要なときだけ読み込む仕組みにはなりません。',
          '「カスタムツールにする」: ツールは処理を実行するための仕組みで、ツールの定義も常にコンテキストに入ります。指示を必要なときだけ読み込む仕組みではありません。',
          '「MCP サーバーから毎回指示を流す」: 常にコンテキストを占めるので、目的と逆になります。',
        ],
        basicsIds: ['claude-code-for-teams', 'claude-context-management'],
        resources: [{ title: 'Skill で Claude を拡張する（Claude Code）', url: 'https://code.claude.com/docs/en/skills', kind: '公式ドキュメント' }],
      },
      {
        id: 'subagent-handoff',
        title: 'サブエージェントには、仕事に必要な事実を頼むときに渡す',
        area: 'エージェント開発',
        keyPoints: [
          'サブエージェントは、新しい空のコンテキストで始まり、元の会話の履歴を見られない',
          'サブエージェントが受け取るのは、頼むときに書かれた依頼の文（と、設定で渡すもの）',
          '必要な事実・範囲・制約は、依頼の文にはっきり書いて渡す（必要な分だけ）',
        ],
        explanation: [
          '取りまとめ役のエージェントが知っている事実を、サブエージェントは自動では知りません。公式ドキュメントでも、サブエージェントは会話の履歴や、すでに読んだファイルを見られず、取りまとめ役が書いた依頼の文から作業を始める、と説明されています。',
          'サブエージェントの結果が意図とずれるときは、まず依頼の文に、その仕事に必要な事実と範囲が書かれているかを見直します。コンテキストを分ける利点を保ったまま、情報の不足だけを補えます。',
        ],
        misconceptions: [
          '「サブエージェントを1つのコンテキストにまとめる」: 情報は共有できますが、分ける利点がなくなり、コンテキストが汚れて大きくなります。',
          '「会話の履歴をすべて読めるようにする」: 取りまとめ役のコンテキストを丸ごと複製することになり、雑音を遮る・トークンを抑えるという利点が失われます。',
          '「サブエージェントをやめて、順番に1つずつ処理する」: 並行して進める利点と、コンテキストを分ける利点を捨てることになります。',
        ],
        basicsIds: ['claude-context-management', 'claude-agent-design'],
        resources: [{ title: 'サブエージェント（Claude Code）', url: 'https://code.claude.com/docs/en/sub-agents', kind: '公式ドキュメント' }],
      },
      {
        id: 'prompt-injection-defense',
        title: 'プロンプトインジェクションは、何重もの対策で防ぐ',
        area: 'ツール利用',
        keyPoints: [
          '外部から来た文章（アップロードされた文書・取得した Web ページ）は、信頼できないデータとして指示と分けて扱う',
          '影響の大きい操作（メールの送信など）をするツールは、権限を必要最小限にし、実行の前に承認を挟む',
          'プロンプトの警告や、言葉のブロックリストだけに頼らない',
        ],
        explanation: [
          '外部の文章には、攻撃者が仕込んだ指示が紛れ込んでいることがあります。外部の文章はタグなどで区切って「データ」として渡し、内容を検証し、影響の大きいツールの権限は絞って承認を挟みます。仮に指示が紛れ込んでも被害を小さくでき、正しい使い方は妨げずに済みます。',
          'Anthropic も、エージェントにはその仕事に必要な権限だけを持たせ、乗っ取られても組織のシステムに広く触れられないようにする、という考え方を示しています。',
        ],
        misconceptions: [
          '「システムプロンプトで強く警告すれば十分」: 1つだけの弱い対策で、確実な防御にはなりません。',
          '「指示のような言葉を、ブロックリストで消す」: 言い換えで簡単にすり抜けられ、正しい内容まで消してしまうおそれがあります。',
          '「メールのツールに広い権限を与え、承認なしで送れるようにする」: 攻撃されたときの被害が最大になります（最小権限の原則に反する）。',
        ],
        basicsIds: ['claude-tool-design'],
        resources: [
          { title: 'How we contain Claude across products（Anthropic）', url: 'https://www.anthropic.com/engineering/how-we-contain-claude', kind: '公式サイト' },
          { title: 'ツールの使い方（Tool use）', url: `${CLAUDE_DOCS}/agents-and-tools/tool-use/overview`, kind: '公式ドキュメント' },
        ],
      },
      {
        id: 'messages-api-format',
        title: 'Messages API は、状態を持たない HTTP と JSON でやりとりする',
        area: 'Claude API',
        keyPoints: [
          'SDK は Messages API（HTTPS の POST /v1/messages）を包んだもので、中身は JSON のリクエストとレスポンス',
          'レスポンスの content は、種類の付いたブロック（text・tool_use・thinking など）の配列',
          '1回ごとに独立した HTTP のリクエストで、会話の履歴は毎回 messages で送る（ストリーミングのときは SSE）',
          'どの言語の SDK を使っても、通信の形は同じ',
        ],
        explanation: [
          'リクエストの本体には model・max_tokens・messages などを JSON で書きます。レスポンスは、content の配列の中に、文章（text）やツールの呼び出し（tool_use）などのブロックが種類付きで並びます。',
          'サーバーは会話の状態を持たないので、続きの会話をするときは、それまでのやりとりを messages に入れて毎回送ります。',
        ],
        misconceptions: [
          '「SDK ごとに独自のバイナリの形式で通信する」: 言語に関係なく、共通の JSON over HTTP です。',
          '「フォームの形式で送り、ただの文章が返る」: レスポンスは、種類の付いたブロックの構造化されたデータです。',
          '「XML を、つなぎっぱなしのソケットでやりとりする」: XML でも、状態を持つソケットでもありません。',
        ],
        basicsIds: [],
        resources: [{ title: 'Messages（Claude API リファレンス）', url: `${CLAUDE_DOCS}/api/messages`, kind: '公式ドキュメント' }],
      },
      {
        id: 'model-migration',
        title: 'モデルの移行は、固定した評価用データで先に確かめ、変えるのは1つずつ',
        area: 'Claude API',
        keyPoints: [
          '切り替える前に、固定した評価用データ（入力と正解）で、新しいモデルを今のプロンプトのまま試す',
          '大事な項目の精度を比べ、下がっていればプロンプトを調整してから本番に切り替える',
          'モデルとプロンプトを同時に変えない（変えるのは1つずつ）',
          '提供終了の予定日があるので、古いモデルに固定し続けることはできない',
        ],
        explanation: [
          'プロンプトは今のモデルの癖に合わせて調整されていることが多く、モデルを変えると結果が変わることがあります。先に評価で後退がないかを確かめるのが基本です。',
          '変えるものを1つに絞ると、精度が変わったときに原因を特定できます。モデルを変えて評価し、必要ならプロンプトを直してもう一度評価する、という順番で進めます。',
        ],
        misconceptions: [
          '「すぐに本番を切り替えて、お客さまの苦情で不具合を見つける」: 精度を落とさないという要件に反します。',
          '「古いモデルに固定し、非推奨の通知を無視する」: 提供が終わると使えなくなるので、続けられません。',
          '「手間を減らすため、モデルとプロンプトを同時に変える」: 精度が変わった原因を切り分けられず、比べることもできません。',
        ],
        basicsIds: ['claude-evals', 'fde-production-checklist'],
        resources: [
          { title: '成功の基準と評価の作り方', url: `${CLAUDE_DOCS}/test-and-evaluate/develop-tests`, kind: '公式ドキュメント' },
          { title: 'モデルの提供終了の予定（Model deprecations）', url: `${CLAUDE_DOCS}/about-claude/model-deprecations`, kind: '公式ドキュメント' },
        ],
      },
      {
        id: 'claude-md-sharing',
        title: 'チームの決まりはコミットする CLAUDE.md に、個人の上書きはコミットしないファイルに',
        area: 'エージェント開発',
        keyPoints: [
          'プロジェクトの CLAUDE.md（./CLAUDE.md か ./.claude/CLAUDE.md）をコミットすると、全員が同じ決まりを使える',
          '個人の、そのプロジェクトだけの指示は CLAUDE.local.md に書き、.gitignore に入れる',
          'すべてのプロジェクトに効かせたい個人の好みは ~/.claude/CLAUDE.md',
          '設定（settings）も同じで、共有は .claude/settings.json、個人は .claude/settings.local.json（コミットしない）',
        ],
        explanation: [
          '同じリポジトリなのに人によって Claude の動きが違うときは、共有の決まりがリポジトリに入っていないことがよくあります。チームの決まりはプロジェクトの CLAUDE.md に書いてコミットし、個人の上書きは自分の手元だけにあるファイルに置きます。',
          'Claude Code は、自分で作った .claude/settings.local.json を git の対象から外します。手で作ったときは、自分で .gitignore に足します。',
        ],
        misconceptions: [
          '「個人の settings.local.json をコミットする」: 個人の上書きが全員に公開され、非公開にしたいという目的に反します。',
          '「衝突を避けるため、CLAUDE.md を git から外す」: 共有の決まりがチームに行き渡らず、動きのばらつきが直りません。',
          '「共有の決まりを、各自の ~/.claude/CLAUDE.md に書く」: 人ごとに内容がずれ、ばらつきの原因そのものになります。',
        ],
        basicsIds: ['claude-code-for-teams'],
        resources: [
          { title: 'CLAUDE.md とメモリ（Claude Code）', url: 'https://code.claude.com/docs/en/memory', kind: '公式ドキュメント' },
          { title: '設定ファイル（Claude Code）', url: 'https://code.claude.com/docs/en/settings', kind: '公式ドキュメント' },
        ],
      },
      {
        id: 'pin-model-id',
        title: '本番では、指す先が変わらないモデル ID を指定する',
        area: 'Claude API',
        keyPoints: [
          '本番では、特定のスナップショットを指すモデル ID を指定し、新しいモデルが出ても動きが変わらないようにする',
          '公式ドキュメントでは、すべてのモデル ID は固定のスナップショットとされ、4.6 世代以降は日付のない ID も固定',
          '新しいモデルへの切り替えは、評価で確かめてから、意図したときに ID を書き換える',
        ],
        explanation: [
          '「最新のモデル」を指す呼び名に頼ると、新しいモデルが出たときに、本番の動きが予告なく変わるおそれがあります。動きを安定させたいなら、どのモデルを使うかを ID で固定します。',
          'Claude の API では、4.6 世代より前のモデルのエイリアス（別名）は、日付の付いた ID を指す便利な呼び名です。本番の設定では、どの ID を指しているかを確かめたうえで、固定の ID を使うのが確実です。',
        ],
        misconceptions: [
          '「最新のモデルを指す呼び名を使えば、自動で改善される」: 自動で切り替わることこそが、動きが変わる原因になります。',
          '「Batch API を通すと安定する」: Batch は急がない処理を安く行う仕組みで、動きの安定とは関係ありません。',
          '「effort を上げると安定する」: effort は考える深さと費用の調整で、モデルの切り替えによる変化への対策ではありません。',
        ],
        basicsIds: ['claude-models-and-pricing', 'fde-production-checklist'],
        resources: [
          { title: 'モデルの概要（Models overview）', url: `${CLAUDE_DOCS}/about-claude/models/overview`, kind: '公式ドキュメント' },
          { title: 'モデルの提供終了の予定（Model deprecations）', url: `${CLAUDE_DOCS}/about-claude/model-deprecations`, kind: '公式ドキュメント' },
        ],
      },
      {
        id: 'claude-code-config-layers',
        title: 'Claude Code の要件は、強制か・秘密か・助言かで置き場所を決める',
        area: 'エージェント開発',
        keyPoints: [
          '必ず人の承認を待たせたい操作 → フック（PreToolUse で ask や deny を返す）。確実に効く',
          'チームで同じ権限をそろえる → コミットする .claude/settings.json の permissions',
          'API キーなどの秘密 → 環境変数で渡し、コンテキストに読み込まれるファイルには書かない',
          'コーディングの決まり → CLAUDE.md（モデルへの助言）',
        ],
        explanation: [
          '公式ドキュメントでは、CLAUDE.md は「強制される設定ではなく、文脈として扱われる」と説明されています。Claude がどう判断するかに関係なく止めたい操作は、フックで止めます。PreToolUse のフックは、ツールの実行を止めたり（deny・終了コード 2）、人の確認を求めたり（ask）できます。',
          'CLAUDE.md や Skill のファイルはコンテキストに読み込まれるので、秘密の情報を書くと、モデルの入出力に流れ出るおそれがあります。',
        ],
        misconceptions: [
          '「4つの要件を全部 CLAUDE.md に書く」: CLAUDE.md は助言なので、権限や承認を確実に守らせることはできません。',
          '「承認とキーを settings.local.json に書く」: 個人用のファイルなのでチームで共有できず、キーを書くのも危険です。',
          '「承認とキーを Skill のファイルに置く」: 承認は設定（フック）側の仕組みで、Skill に置いたキーはコンテキストに読み込まれます。',
        ],
        basicsIds: ['claude-code-for-teams'],
        resources: [
          { title: 'フック（Hooks）', url: 'https://code.claude.com/docs/en/hooks', kind: '公式ドキュメント' },
          { title: '設定ファイル（Claude Code）', url: 'https://code.claude.com/docs/en/settings', kind: '公式ドキュメント' },
          { title: 'CLAUDE.md とメモリ（Claude Code）', url: 'https://code.claude.com/docs/en/memory', kind: '公式ドキュメント' },
        ],
      },
      {
        id: 'sdk-thin-wrapper',
        title: 'SDK に移しても、使える機能や結果のぶれは変わらない',
        area: 'Claude API',
        keyPoints: [
          'SDK は同じ API（HTTP と JSON）を包んだもので、型・再試行・ストリーミングの扱いなどを楽にする',
          'API にない機能やモデルの能力を、SDK が足すことはない',
          'どのプラットフォーム（Amazon Bedrock など）でどの機能が使えるかは、プラットフォーム側で決まる',
          '結果のぶれ（非決定性）も、SDK にしたからといってなくならない',
        ],
        explanation: [
          'REST の API を直接呼ぶのと SDK を使うのとで、送っている中身は同じです。SDK に移すと書きやすく、間違えにくくなりますが、できることそのものは変わりません。',
          '出力のぶれ方は、モデルと送るパラメータで決まり、REST でも SDK でも同じです。',
        ],
        misconceptions: [
          '「SDK にすると、REST では使えなかったツールが使えるようになる」: 使える機能は API とプラットフォームの提供内容で決まります。',
          '「SDK は独自の非公開の通信方式を使う」: 同じ HTTP と JSON の API を呼んでいます。',
          '「SDK がサンプリングを固定するので、結果が毎回同じになる」: SDK は結果のぶれをなくしません。',
        ],
        basicsIds: [],
        resources: [{ title: 'SDK・CLI・ライブラリ（Claude Platform Docs）', url: `${CLAUDE_DOCS}/api/client-sdks`, kind: '公式ドキュメント' }],
      },
      {
        id: 'agent-loop',
        title: 'エージェントのループの1回分は「送る → ツールか答えか → 実行 → 結果を戻す」',
        area: 'エージェント開発',
        keyPoints: [
          '今のコンテキスト（会話の履歴・ツールの定義）をモデルに送る',
          'モデルは、ツールを使う（tool_use）か、最終的な答えを返すかを決める',
          'ツールを使うなら実行し、その結果（tool_result）をコンテキストに足して、次の判断に戻す',
          'ツールを使わない最終的な答え（stop_reason が end_turn）が返ったら、ループを終える',
        ],
        explanation: [
          'Claude Agent SDK や Claude Code のエージェントは、このループを繰り返して仕事を進めます。公式ドキュメントでも、ツールの結果は毎回 Claude に戻され、次の判断の材料になると説明されています。',
          'ツールを使うかどうかは、モデルが答えを作るときに決めます。アプリ側は、モデルが tool_use を返したときに、そのツールを実行します。',
        ],
        misconceptions: [
          '「待っているツールを先に実行し、まとめてモデルに渡す」: ツールは、モデルが tool_use を返した後に実行します。',
          '「最終的な答えを受け取ってから、ツールが必要だったかを判断する」: 必要かどうかは、モデルが答えを作るときに決めます。',
          '「ループが終わってからツールを実行する」: ツールはループの中で実行し、結果をモデルに戻します。',
        ],
        basicsIds: ['claude-agent-design', 'claude-tool-design'],
        resources: [
          { title: 'エージェントのループの仕組み（Agent SDK）', url: `${CLAUDE_DOCS}/agent-sdk/agent-loop`, kind: '公式ドキュメント' },
          { title: 'ツールの使い方（Tool use）', url: `${CLAUDE_DOCS}/agents-and-tools/tool-use/overview`, kind: '公式ドキュメント' },
        ],
      },
      {
        id: 'business-rule-validation',
        title: 'スキーマは形しか守らない。業務のルールは、生成の後にコードで確かめる',
        area: 'Claude API',
        keyPoints: [
          '構造化出力（スキーマ）が保証するのは、型・必須の項目・決められた値の形など「形」まで',
          '「閉じた口座が有効になっている」のような業務のルールに合っているかは、スキーマでは分からない',
          '生成の後に、コードで業務のルールを確かめ、合わなければ違反の内容を添えてもう一度頼む',
        ],
        explanation: [
          '公式ドキュメントでは、構造化出力はスキーマに合った応答を保証する仕組みと説明されています。保証されるのは形であって、中身が業務として正しいかどうかではありません。',
          'もっともらしいけれど業務のルールに反する答えは、コードで確実に見つけられます。見つけたら、どのルールに反したかを伝えて、もう一度生成させます。',
        ],
        misconceptions: [
          '「スキーマの確認に通ったのだから、正しい」: 形が正しくても、中身が正しいとは限りません。',
          '「例を変える・増やす」: 改善はしても確率的で、違反を確実に見つける仕組みにはなりません。',
          '「effort を上げて、モデル自身に確かめさせる」: 確実な検出にはならず、費用も増えます。',
        ],
        basicsIds: ['claude-evals'],
        resources: [{ title: '構造化出力（Structured outputs）', url: `${CLAUDE_DOCS}/build-with-claude/structured-outputs`, kind: '公式ドキュメント' }],
      },
      {
        id: 'one-shot',
        title: '1つの例で形が決まるなら、例は1つ（ワンショット）でよい',
        area: 'エージェント開発',
        keyPoints: [
          '出力の形（書式）は、言葉で説明するより、例を見せるほうが正確に伝わる',
          '1つの標準的な例で形が完全に決まるなら、例は1つで足りる',
          'いくつもの型や、まれで境界的な場合があるときに、複数の例（マルチショット）が役に立つ',
        ],
        explanation: [
          '公式ドキュメントでは、例は出力の形・口調・構造を導く、最も確実な方法の一つと説明されています。一方で、新しい情報を持たない例を増やしても、トークンが増えるだけで、例に引きずられやすくもなります。',
          '例の数は、伝えたいことに必要な分だけにします。形が1つに決まるならワンショット、いろいろな型があるなら、違いの分かる複数の例を用意します。',
        ],
        misconceptions: [
          '「例は付けずに指示だけにする（ゼロショット）」: 書式は例で示したほうが確実で、指示だけではあいまいさが残りやすくなります。',
          '「同じ形の例を5つ付ける」: 新しい情報がなく、冗長です。',
          '「繰り返し試して直す」: プロンプトを作る進め方の話で、例の数の選び方の答えではありません。',
        ],
        basicsIds: [],
        resources: [{ title: 'プロンプトのベストプラクティス（例の使い方）', url: `${CLAUDE_DOCS}/build-with-claude/prompt-engineering/claude-prompting-best-practices`, kind: '公式ドキュメント' }],
      },
      {
        id: 'hook-decisions',
        title: 'フックは実行の前（PreToolUse）で止める。deny は必ず止める、ask は承認を挟む',
        area: 'エージェント開発',
        keyPoints: [
          '確実に制御したい操作は、プロンプトではなくフックで扱う',
          'PreToolUse はツールの実行の前に動く。PostToolUse は実行の後なので、防ぐことはできない',
          'PreToolUse が返せる判断は allow・deny・ask・defer の4つ',
          'deny: 人の判断なしに必ず止める（絶対に実行させない操作に使う）',
          'ask: 人の承認を挟む（審査すれば実行してよい操作に使う）',
          'defer: フックは判断せず、ふだんの許可の流れ（設定の権限など）に任せる',
        ],
        explanation: [
          '自動で動くエージェントが、審査の必要な決済のツールを呼んでしまうなら、そのツールに対して ask を返す PreToolUse のフックを足します。そのツールだけを承認待ちにでき、ほかの自動化はそのまま残せます。',
          '本番のデータを元に戻せない形で消すコマンドのように、どんな場合でも進めてはいけない操作には deny を返します。ask では、人が承認すると実行できてしまいます。',
        ],
        misconceptions: [
          '「システムプロンプトに大きな字で警告を書く」: 助言にすぎず、モデルが従う保証はありません。',
          '「すべてのツールで自動モードをやめる」: 正しい自動化まで失われ、最初に取る最小の対策ではありません。',
          '「PostToolUse で後から取り消す」: 実行の後に動くので、決済はもう行われています。取り消せるとも限りません。',
          '「絶対に止めたい操作に ask や defer を使う」: ask は人が承認すれば、defer はふだんの許可の流れ次第で、実行されることがあります。',
        ],
        basicsIds: ['claude-code-for-teams'],
        resources: [{ title: 'フック（Hooks）', url: 'https://code.claude.com/docs/en/hooks', kind: '公式ドキュメント' }],
      },
    ],
  },
];

export function examPointsFor(certId: string): ExamPointSet | undefined {
  return EXAM_POINT_SETS.find((s) => s.certId === certId);
}
