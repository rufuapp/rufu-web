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
    checkedOn: '2026年10月8日〜11月21日',
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
          '多数のリモートの利用者に提供する本番のサーバーは、Streamable HTTP。認証をかけられ、ロードバランサーの後ろで横に増やせる',
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
          'チームで使うプラグインや権限・フックも、コミットする .claude/settings.json に書く。API キーなどの秘密はどのファイルにもコミットしない',
          'チームで使うスラッシュコマンドも、プロジェクトの .claude/commands/（今は .claude/skills/ にまとめられた）に置いてコミットする。~/.claude/commands/ は個人用',
        ],
        explanation: [
          '同じリポジトリなのに人によって Claude の動きが違うときは、共有の決まりがリポジトリに入っていないことがよくあります。チームの決まりはプロジェクトの CLAUDE.md に書いてコミットし、個人の上書きは自分の手元だけにあるファイルに置きます。',
          'Claude Code は、自分で作った .claude/settings.local.json を git の対象から外します。手で作ったときは、自分で .gitignore に足します。',
          '公式ドキュメントでは、.claude/settings.json は「チームの権限・フック・プラグイン」を置く場所とされています。チーム全員に同じプラグインを使わせたいなら、ここに書いてコミットします。',
          '公式ドキュメントでは、カスタムのコマンドは Skill にまとめられ、既存の .claude/commands/ のファイルもそのまま使えると説明されています。どちらでも、リポジトリの中に置いてコミットすれば、クローンした全員に届きます。',
        ],
        misconceptions: [
          '「個人の settings.local.json をコミットする」: 個人の上書きが全員に公開され、非公開にしたいという目的に反します。',
          '「衝突を避けるため、CLAUDE.md を git から外す」: 共有の決まりがチームに行き渡らず、動きのばらつきが直りません。',
          '「共有の決まりを、各自の ~/.claude/CLAUDE.md に書く」: 人ごとに内容がずれ、ばらつきの原因そのものになります。',
          '「チームのプラグインの設定を、各自に手で入れてもらう」: 入れ忘れや違いが出ます。コミットする .claude/settings.json に書けば、全員に同じ設定が届きます。',
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
          '新しいモデルでは、古い設定が受け付けられないことがある。Opus 4.6 以降はプリフィル（assistant の発話を先に書く）が 400 エラー、Opus 5.5 では temperature などのサンプリング設定を送らない',
          '昇格の前に、こうした設定を含む呼び出しを評価で確かめてから ID を切り替える',
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
          'フックそのものは settings.json の hooks に登録します。CLAUDE.md に「〇〇の前に確認すること」と自然な言葉で書いても、フックにはなりません。',
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
          'Claude API は HTTPS の REST API。POST /v1/messages に JSON を送り、JSON を受け取る。ストリーミングは SSE（Server-Sent Events）',
          'そのため、SDK を入れなくても curl などの HTTP クライアントで呼べる。GraphQL や WebSocket、独自のバイナリ形式ではない',
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
          '手書きのループで stop_reason が tool_use なら、ツールを実行し、assistant の応答と、tool_use_id を合わせた tool_result を messages に足して、もう一度呼ぶ。同じリクエストを送り直しても進まない',
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
          '必須の項目が欠けるなどの形の崩れは、生成の直後にスキーマで確かめ、具体的なエラーを添えてもう一度生成させる。パイプラインの最後で構文だけを見るのでは遅く、浅い',
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
          'トーンと論理の順序のように、言葉では近似しかできない複合的なパターンは、違いの分かる複数の例で見せる',
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
          '「止める（執行）」はフック、「記録して異常に気づく（検知）」は監視やログ。役割を混ぜない',
        ],
        explanation: [
          '自動で動くエージェントが、審査の必要な決済のツールを呼んでしまうなら、そのツールに対して ask を返す PreToolUse のフックを足します。そのツールだけを承認待ちにでき、ほかの自動化はそのまま残せます。',
          '本番のデータを元に戻せない形で消すコマンドのように、どんな場合でも進めてはいけない操作には deny を返します。ask では、人が承認すると実行できてしまいます。',
          '監査の記録や異常の検知が求められるときは、フックとは別に監視やログを用意します。ログや監視は起きたことを残して知らせる仕組みで、実行を止める力はありません。止める役はフック、残して気づく役は監視、と分けて考えます。',
        ],
        misconceptions: [
          '「システムプロンプトに大きな字で警告を書く」: 助言にすぎず、モデルが従う保証はありません。',
          '「すべてのツールで自動モードをやめる」: 正しい自動化まで失われ、最初に取る最小の対策ではありません。',
          '「PostToolUse で後から取り消す」: 実行の後に動くので、決済はもう行われています。取り消せるとも限りません。',
          '「絶対に止めたい操作に ask や defer を使う」: ask は人が承認すれば、defer はふだんの許可の流れ次第で、実行されることがあります。',
          '「アクセスログや監視に承認を強制させる」: ログや監視は検知の仕組みで、実行の前に止めることはできません。',
        ],
        basicsIds: ['claude-code-for-teams'],
        resources: [{ title: 'フック（Hooks）', url: 'https://code.claude.com/docs/en/hooks', kind: '公式ドキュメント' }],
      },
      {
        id: 'agent-sdk-query',
        title: 'Agent SDK は、Claude Code と同じエージェントのループを自分のプログラムから動かす',
        area: 'エージェント開発',
        keyPoints: [
          'Claude Agent SDK は、Claude Code を動かしているのと同じツール・エージェントのループ・コンテキストの管理を提供する',
          'ツールの実行と結果の戻しは SDK が行うので、ループを自分で書かなくてよい',
          'Python では query()（1回ごとに新しいセッション。単発の仕事向け）と ClaudeSDKClient（同じセッションで会話を続ける。割り込みもできる）がある',
        ],
        explanation: [
          '公式ドキュメントでは、Agent SDK は「Claude Code を動かしているのと同じツール、エージェントのループ、コンテキストの管理」を提供すると説明されています。Messages API を直接使う場合と違い、tool_use を受けて実行し tool_result を戻す繰り返しを、SDK が受け持ちます。',
          'Python の SDK の公式ページには、query() と ClaudeSDKClient の比較表があります。query() は既定で毎回新しいセッションを作り、ClaudeSDKClient は同じセッションを使い続けます。チャットのように、次の動きが Claude の答えで変わる場合は ClaudeSDKClient が勧められています。',
        ],
        misconceptions: [
          '「Agent SDK を使っても、ツールを実行するループは自分で書く」: ループは SDK が回します。自分で書くのは Messages API を直接使う場合です。',
          '「query() で会話がそのまま続く」: Python の query() は既定で毎回新しいセッションです。続けるなら continue_conversation や resume、または ClaudeSDKClient を使います。',
        ],
        basicsIds: ['claude-agent-design'],
        resources: [
          { title: 'Agent SDK の概要', url: 'https://code.claude.com/docs/en/agent-sdk/overview', kind: '公式ドキュメント' },
          { title: 'Agent SDK（Python）', url: 'https://code.claude.com/docs/en/agent-sdk/python', kind: '公式ドキュメント' },
        ],
      },
      {
        id: 'bedrock-model-ids',
        title: 'Amazon Bedrock では、使う入口によってクライアントとモデル ID の書き方が違う',
        area: 'Claude API',
        keyPoints: [
          '新しい「Claude in Amazon Bedrock」（Opus 4.7 以降）: AnthropicBedrockMantle クライアント、ID は anthropic. で始まる（例: anthropic.claude-opus-5-5）',
          '従来の Bedrock の入口（InvokeModel・Converse。Opus 4.6 以前）: AnthropicBedrock クライアント、ID は推論プロファイル（global. や us. で始まる）',
          '従来の入口でプロファイルの付かない ID を指定すると、「オンデマンドのスループットに対応していない」という 400 エラーになる',
          '新しい入口では、構造化出力・Batch・サーバー側のツールなど、使えない機能がある',
        ],
        explanation: [
          'Bedrock で Claude を使うときは、Anthropic の API と同じ ID をそのまま書いても動きません。どの入口を使うかで、クライアントの種類とモデル ID の形を合わせます。',
          '従来の入口では、リージョンをまたいで処理を振り分ける推論プロファイル（global. や us. などの接頭辞）を ID として指定します。',
          '使える機能は入口ごとに違うので、Anthropic の API で使えた機能が Bedrock でも使えるかは、公式ドキュメントの対応表で確かめます。',
        ],
        misconceptions: [
          '「Anthropic の API と同じモデル ID を Bedrock でも使える」: 入口ごとに決まった形（anthropic. や推論プロファイル）があります。',
          '「400 エラーは権限の不足が原因」: 従来の入口では、推論プロファイルを指定していないことが原因のことがあります。',
        ],
        basicsIds: ['claude-models-and-pricing'],
        resources: [{ title: 'Amazon Bedrock の Claude', url: `${CLAUDE_DOCS}/build-with-claude/claude-in-amazon-bedrock`, kind: '公式ドキュメント' }],
      },
      {
        id: 'context-window-overflow',
        title: 'コンテキストウィンドウを超えたとき: 入力だけで超えたらエラー、出力の途中なら止まる',
        area: 'Claude API',
        keyPoints: [
          '入力だけでコンテキストウィンドウを超えると、どのモデルでも 400 の invalid_request_error（prompt is too long）になる',
          'Claude 4.5 以降では、入力と max_tokens の合計が超えていても受け付け、上限に達したら stop_reason が model_context_window_exceeded で止まる',
          'それより前のモデルでは、入力と max_tokens の合計が超えると検証エラーになる',
          '長い会話には、サーバー側の要約（compaction。4.6 以降のベータで、自分で有効にする）や、古いツールの結果を消す context editing を使う',
          'Claude Code は、上限が近づくと会話を自動で要約（compact）して続ける。/compact で手動でも実行できる。早い段階の細かい指示は要約で落ちることがあるので、守らせたい決まりは CLAUDE.md に書く',
        ],
        explanation: [
          'エラーになるのか、途中で止まるのかは、何が上限を超えたかとモデルの世代で決まります。入力そのものが入り切らないなら、どのモデルでも受け付けられません。',
          '会話が長くなる用途では、上限に当たってから慌てるのではなく、compaction や context editing で古い部分を減らすように設計しておきます。compaction は自動では有効にならず、リクエストで指定して使います。',
        ],
        misconceptions: [
          '「上限を超えたら、API が古い部分を自動で切り捨てる」: 何もしなければ切り捨てられません。compaction や context editing は、自分で有効にする機能です。',
          '「入力と max_tokens の合計が超えたら、どのモデルでも必ずエラー」: Claude 4.5 以降では受け付け、上限で止まります（stop_reason: model_context_window_exceeded）。',
        ],
        basicsIds: ['claude-context-management'],
        resources: [
          { title: 'コンテキストウィンドウ（Context windows）', url: `${CLAUDE_DOCS}/build-with-claude/context-windows`, kind: '公式ドキュメント' },
          { title: '要約（Compaction）', url: `${CLAUDE_DOCS}/build-with-claude/compaction`, kind: '公式ドキュメント' },
          { title: 'コンテキストの編集（Context editing）', url: `${CLAUDE_DOCS}/build-with-claude/context-editing`, kind: '公式ドキュメント' },
        ],
      },
      {
        id: 'adaptive-thinking-only',
        title: '新しいモデルの思考は adaptive だけ。budget_tokens を指定すると 400 エラー',
        area: 'Claude API',
        keyPoints: [
          'Claude 4.7 以降のモデルは、思考を thinking: {type: "adaptive"} でしか受け付けない',
          'thinking: {type: "enabled", budget_tokens: N}（従来の extended thinking）を送ると 400 エラーになる。黙って無視されるわけではない',
          '思考の深さは effort（output_config.effort）で調整する。トークン数を直接決める設定はない',
          'Claude 4.6 では enabled と budget_tokens はまだ動くが非推奨。4.5 以前は extended thinking だけ',
        ],
        explanation: [
          '公式ドキュメントでは、extended thinking は Claude 4.6 で非推奨となり、Claude 4.7 以降のモデルは対応せず 400 エラーを返すと説明されています。エラーの文には、adaptive と output_config.effort を使うよう書かれています。',
          'adaptive では、モデルが依頼ごとに考えるかどうかと、どれだけ考えるかを決めます。費用の上限は max_tokens（思考と答えの合計の上限）で決まり、effort はその中でどれだけ思考に使うかの目安です。',
          'どのモデルがどの思考の設定を受け付けるかは世代ごとに違うので、モデルを切り替えるときは公式の対応表で確かめます。',
        ],
        misconceptions: [
          '「budget_tokens は無視されて、思考はそのまま動く」: 黙って無視されるのではなく、400 エラーになります。',
          '「budget_tokens を max_tokens より小さくすれば通る」: それは古いモデルの extended thinking での決まりで、新しいモデルでは条件を満たしてもエラーです。',
          '「effort でトークン数を正確に決められる」: effort は目安で、トークン数を保証しません。',
        ],
        basicsIds: ['claude-models-and-pricing'],
        resources: [
          { title: '思考のトラブルシューティング（モデルごとの対応表）', url: `${CLAUDE_DOCS}/build-with-claude/thinking-troubleshooting`, kind: '公式ドキュメント' },
          { title: '思考の調整と費用', url: `${CLAUDE_DOCS}/build-with-claude/thinking-steering-and-cost`, kind: '公式ドキュメント' },
        ],
      },
      {
        id: 'tool-failure-isolation',
        title: 'ツール呼び出しが正しく、実行で失敗したなら、問題は統合の側（ハンドラー）',
        area: 'ツール利用',
        keyPoints: [
          '障害は「モデル（どのツールを選び、どう考えたか）」と「統合（ツールを実行するアプリ側のコード）」に分けて切り分ける',
          'モデルが妥当なツール呼び出しを返し、ハンドラーの中で例外が起きたなら、直すのは統合の側',
          'ツールの実行に失敗したら、空の結果を返さず、エラーの内容を tool_result に is_error: true を付けて返す',
        ],
        explanation: [
          'ツールの結果が空でモデルの答えがおかしくなったとき、まずトレースで「モデルが正しいツールと引数を選んだか」を見ます。選択が正しく、実行で例外が出ているなら、モデルやプロンプトを直しても解決しません。',
          '公式ドキュメントでは、ツールの実行でエラーが起きたときは、tool_result に is_error: true とエラーの内容を入れて返すよう説明されています。モデルは失敗を知ったうえで、やり直したり、別の手段を選んだりできます。空の結果を返すと、失敗したこと自体がモデルに伝わりません。',
        ],
        misconceptions: [
          '「答えがおかしいので、モデルがツールの選択を誤った」: トレースで呼び出しが妥当なら、選択の問題ではありません。',
          '「モデルがツールの結果を読み違えた」: 結果が空なら、読み違える以前に情報が渡っていません。',
          '「失敗したときは、空の結果を返しておけばよい」: 失敗が伝わらず、モデルがもっともらしい答えを作るおそれがあります。',
        ],
        basicsIds: ['claude-tool-design'],
        resources: [
          { title: 'ツールの呼び出しを処理する（is_error）', url: `${CLAUDE_DOCS}/agents-and-tools/tool-use/handle-tool-calls`, kind: '公式ドキュメント' },
          { title: 'ツールの使い方（Tool use）', url: `${CLAUDE_DOCS}/agents-and-tools/tool-use/overview`, kind: '公式ドキュメント' },
        ],
      },
      {
        id: 'system-prompt-placement',
        title: 'ずっと変わらない役割やルールはシステムプロンプトに、ターンごとに変わる質問はユーザーのターンに',
        area: 'Claude API',
        keyPoints: [
          '会話全体に効かせたい役割・口調・ルールは、システムプロンプトに書く',
          '顧客の質問のように毎回変わる入力は、ユーザーのターン（messages）に入れる',
          '変わらない部分を先頭にまとめると、プロンプトキャッシュも効きやすい',
        ],
        explanation: [
          '固定の部分と変わる部分を分けると、ルールがぶれず、同じ内容を毎回送り直す無駄もなくなります。',
          'プロンプトキャッシュは tools → system → messages の順に並んだ先頭の部分で一致を見るので、変わらないシステムプロンプトはキャッシュの対象にしやすい部分です。',
        ],
        misconceptions: [
          '「ルールを毎ターン、ユーザーの発話に書き足す」: 冗長で、キャッシュにも不利です。',
          '「質問が変わるたびにシステムプロンプトを書き換える」: 役割の分け方が崩れ、キャッシュも効かなくなります。',
        ],
        basicsIds: [],
        resources: [{ title: 'プロンプトキャッシュ（Prompt caching）', url: `${CLAUDE_DOCS}/build-with-claude/prompt-caching`, kind: '公式ドキュメント' }],
      },
      {
        id: 'prompt-cache-prefix',
        title: 'プロンプトキャッシュは先頭からの完全一致。変わる部分はキャッシュする範囲の後ろへ',
        area: 'Claude API',
        keyPoints: [
          'キャッシュが当たるのは、cache_control を付けたブロックまでの内容が 100% 同じときだけ',
          '並びは tools → system → messages。ある段が変わると、その段と後ろの段のキャッシュが無効になる',
          'タイムスタンプや利用者の入力など毎回変わるものは、キャッシュする範囲より後ろに置く',
          'ブレークポイントは 1 回のリクエストで最大 4 つ。TTL は保持する時間で、一致の判定とは関係ない',
        ],
        explanation: [
          '大きな文書をキャッシュしているのにほとんど当たらないときは、先頭のほうに毎回変わる内容が入っていないかを疑います。1 行でも違えば、別の内容として扱われます。',
          '公式ドキュメントでは、キャッシュの読み取りは入力の基本料金よりずっと安く、書き込みは少し高いと説明されています（料金の倍率はモデルや保持時間で違います）。当たらないキャッシュは、書き込みの分だけ高くつきます。',
        ],
        misconceptions: [
          '「ブレークポイントを増やせば当たるようになる」: 変わる内容が範囲の中にある限り、当たりません。',
          '「キャッシュは似ていれば当たる」: あいまいな一致はなく、完全に同じときだけです。',
          '「TTL を延ばせば当たる」: TTL は保持する時間で、一致するかどうかには影響しません。',
        ],
        basicsIds: [],
        resources: [{ title: 'プロンプトキャッシュ（Prompt caching）', url: `${CLAUDE_DOCS}/build-with-claude/prompt-caching`, kind: '公式ドキュメント' }],
      },
      {
        id: 'context-relevance',
        title: 'コンテキストは多さより関連性。必要なものだけを入れ、要らないものは削る',
        area: 'エージェント開発',
        keyPoints: [
          '関係のない文書やツールの生の出力を詰め込むと、費用と待ち時間が増え、注意が散って精度が下がることもある',
          'モデルは価値の低いトークンを自動で無視しない。入れたものはすべて処理され、課金される',
          '「完全さのため」に全部残すのではなく、必要な部分だけを残し、ツールの出力は要約したり消したりする',
        ],
        explanation: [
          'コンテキストは限りのある資源として扱い、目的に役立つ情報だけを選びます。長い会話では、古いツールの結果を消す context editing や、要約する compaction も使えます。',
          'サブエージェントに調べものを任せて、結果の要約だけを受け取るのも、メインのコンテキストをきれいに保つ方法です。',
        ],
        misconceptions: [
          '「文書を全部入れれば、答えが良くなる」: 関係のない情報は、精度を下げることがあります。',
          '「コンテキストに入れたトークンは無料」: 入力トークンとして課金されます。',
          '「長くなるのは待ち時間だけの問題で、精度は変わらない」: 注意が散って、精度にも影響することがあります。',
        ],
        basicsIds: ['claude-context-management'],
        resources: [
          { title: 'コンテキストウィンドウ（Context windows）', url: `${CLAUDE_DOCS}/build-with-claude/context-windows`, kind: '公式ドキュメント' },
          { title: 'コンテキストの編集（Context editing）', url: `${CLAUDE_DOCS}/build-with-claude/context-editing`, kind: '公式ドキュメント' },
        ],
      },
      {
        id: 'managed-agents-self-hosted',
        title: 'ループは Anthropic に任せ、ツールは自社の環境で動かすなら Managed Agents とセルフホストのサンドボックス',
        area: 'エージェント開発',
        keyPoints: [
          'Claude Managed Agents は、エージェントのループ・ツールの実行・実行環境を Anthropic が用意する仕組み（ベータ版）',
          '実行環境は、Anthropic が管理するクラウドのサンドボックスか、自社のインフラで動かすセルフホストのサンドボックスを選べる',
          '規制でデータを社内に置く必要があるなら、セルフホストのサンドボックスで、ツールを自社のネットワークの中で動かす',
          'リリースをまたいで動きをそろえたいなら、モデル ID は固定する',
        ],
        explanation: [
          '要件が複数あるときは、1 つずつ分けて照らし合わせます。「ツールはどこで動くか」「ループは誰が回すか」「動きをどう安定させるか」を別々に考えると、どの構成がすべてを満たすかが見えます。',
          '公式ドキュメントでは、セルフホストのサンドボックスは、コンプライアンスやデータの所在の要件のための選択肢と説明されています。',
        ],
        misconceptions: [
          '「Anthropic のサンドボックスでツールを動かす」: 社内のネットワークで動かすという要件に反します。',
          '「自前のハーネスを作る」: ループを Anthropic に任せたいという要件に反します。',
          '「最新を指す呼び名でモデルを指定する」: リリースをまたいで動きがそろいません。',
        ],
        basicsIds: ['claude-agent-design'],
        resources: [{ title: 'Claude Managed Agents の概要', url: `${CLAUDE_DOCS}/managed-agents/overview`, kind: '公式ドキュメント' }],
      },
      {
        id: 'client-vs-server-tools',
        title: 'クライアントツールは自分で実行して結果を返す。サーバーツールは Anthropic が実行する',
        area: 'ツール利用',
        keyPoints: [
          'クライアントツール: 自分で定義したツールと、Anthropic がスキーマを公開するツール（bash・text_editor など）。実行するのは自分のアプリ',
          'クライアントツールでは、モデルが stop_reason: tool_use で止まるので、実行して tool_result を返す',
          'サーバーツール（web_search・web_fetch・code_execution など）は Anthropic の側で実行され、結果は同じ応答で返る',
          'Messages API でライブの Web 検索をしたいなら、web_search のサーバーツールを tools に足す',
        ],
        explanation: [
          '公式ドキュメントでは、ツールの違いは主に「コードがどこで動くか」だと説明されています。bash や text_editor は、スキーマこそ Anthropic のものですが、実行も結果を返すのも開発者の責任です。',
          'web_search は Anthropic の基盤で検索し、出典付きの結果を同じ応答で返します。自分でループを書く必要はありません。',
        ],
        misconceptions: [
          '「bash や text_editor は Anthropic が実行してくれる」: スキーマが Anthropic のものでも、実行するのは自分のアプリです。',
          '「API でも claude.ai の Web 検索の設定が引き継がれる」: API では、使うツールをリクエストで指定します。',
          '「text_editor で URL のページを取れる」: ファイルを編集するツールです。ページの取得は web_fetch です。',
        ],
        basicsIds: ['claude-tool-design'],
        resources: [{ title: 'ツールの使い方（Tool use）', url: `${CLAUDE_DOCS}/agents-and-tools/tool-use/overview`, kind: '公式ドキュメント' }],
      },
      {
        id: 'model-routing',
        title: '簡単な依頼と難しい依頼が混ざるなら、小さいモデルで受けて難しいものだけ大きいモデルへ',
        area: 'Claude API',
        keyPoints: [
          '大半の簡単な依頼は、安くて速いモデル（Haiku など）で処理する',
          '難しい依頼や、自信の低い答えだけを、性能の高いモデル（Opus など）に回す（カスケード・ルーティング）',
          '費用を下げつつ、難しい依頼の品質も保てる',
        ],
        explanation: [
          '全部を高性能なモデルにすれば品質は保てますが、費用は下がりません。全部を小さいモデルにすれば安くなりますが、難しい依頼の品質が落ちます。難しさで振り分けると、両方を満たせます。',
          '振り分けの基準（難しさの判定、自信の低さなど）が妥当かは、評価のデータで確かめます。',
        ],
        misconceptions: [
          '「難しさに関係なく、交互に振り分ける」: 難しい依頼が小さいモデルに回って品質が落ち、簡単な依頼に高い費用がかかります。',
        ],
        basicsIds: ['claude-models-and-pricing'],
        resources: [{ title: 'モデルの選び方（Choosing a model）', url: `${CLAUDE_DOCS}/about-claude/models/choosing-a-model`, kind: '公式ドキュメント' }],
      },
      {
        id: 'secrets-and-pii',
        title: 'キーは環境ごとに分けて権限を絞る。個人情報は送る前に減らす',
        area: 'Claude API',
        keyPoints: [
          '最小権限: 開発と本番で別の API キーを使い、それぞれの用途に必要な範囲だけにする。Console ではワークスペースごとにキーを分けられる',
          'キーはコミットするファイルや CLAUDE.md に書かず、環境変数やシークレットの管理の仕組みで渡す',
          '個人情報（社会保障番号など）は、モデルに送る前に、必要な項目だけに絞ったり、伏せたりする',
          '応答を後からフィルタしたり暗号化したりしても、送ってしまった入力は守れない',
        ],
        explanation: [
          'キーを分けておけば、漏れたときの被害がその環境だけで済み、1 本だけを止めたり入れ替えたりできます。',
          '個人情報は、入り口で出さなければ、送信・保存・ログといった経路のどこでも漏れません。後から守るより、最初から入れないほうが確実です。',
        ],
        misconceptions: [
          '「権限の広いキーを 1 本、みんなで使う」: 漏れたときの被害が最大になります。',
          '「顧客の記録を全部送り、応答のほうをフィルタする」: 個人情報はもうモデルに送られ、ログにも残ります。',
        ],
        basicsIds: ['fde-production-checklist'],
        resources: [{ title: 'API キーとワークスペース（Claude Console）', url: `${CLAUDE_DOCS}/build-with-claude/workspaces`, kind: '公式ドキュメント' }],
      },
      {
        id: 'robust-output-parsing',
        title: 'モデルの出力は表記がゆれる。完全一致で分岐せず、受け側で正規化するか構造化出力で決める',
        area: 'Claude API',
        keyPoints: [
          '「APPROVED」との完全一致で分岐すると、「Approved.」のような大文字・小文字や句読点のゆれで失敗する',
          '受け側で正規化（大文字・小文字、空白、句読点をそろえる）してから判定する',
          '決まった値が必要なら、構造化出力の enum やツールの入力で、値そのものを決めさせる',
          '再試行、モデル ID の固定、温度を下げることは、表記のゆれをなくす根本の対策ではない',
        ],
        explanation: [
          '自然な文章の出力は、意味が同じでも表記が少しずつ変わります。根本の原因は、ゆれる出力を厳密に読もうとしている受け側にあります。',
          '公式ドキュメントでは、Opus 5.5 では temperature などのサンプリング設定を送らないよう求められ、temperature を 0 にしても、以前のモデルでも同じ出力は保証されなかったと説明されています。',
        ],
        misconceptions: [
          '「失敗したら再試行する」: 費用と待ち時間が増えるだけで、確実ではありません。',
          '「temperature を 0 にすれば毎回同じになる」: 同じ出力は保証されず、新しいモデルではそもそも送れません。',
        ],
        basicsIds: [],
        resources: [{ title: '構造化出力（Structured outputs）', url: `${CLAUDE_DOCS}/build-with-claude/structured-outputs`, kind: '公式ドキュメント' }],
      },
      {
        id: 'nonfunctional-requirements',
        title: 'モデルやサービスの選び方を決めるのは、応答時間などの非機能の要件',
        area: 'Claude API',
        keyPoints: [
          '要件を「機能（どう振る舞うか）」と「非機能（応答時間・処理量・費用・可用性など）」に分ける',
          '「1 秒以内に応答」のような応答時間の要件は、モデルの大きさ、ストリーミング、キャッシュなどの選び方に直接効く',
          '名前で挨拶する、平易に要約する、怒っている人を引き継ぐ、などはプロンプトや業務の流れで実現する機能の要件',
        ],
        explanation: [
          'FDE が顧客の要件を聞くときは、どれが設計（プロンプトや流れ）で解けて、どれが基盤の選び方を縛るかを分けると、提案が早く固まります。',
        ],
        misconceptions: [
          '「振る舞いの要件がモデルの選択を決める」: 多くはプロンプトや設計で実現でき、基盤の選び方を直接は縛りません。',
        ],
        basicsIds: ['fde-production-checklist'],
        resources: [{ title: 'レイテンシーを下げる（Reducing latency）', url: `${CLAUDE_DOCS}/test-and-evaluate/strengthen-guardrails/reduce-latency`, kind: '公式ドキュメント' }],
      },
      {
        id: 'mcp-primitives',
        title: 'MCP のサーバーが公開するのは、ツール・リソース・プロンプトの 3 つ。操作する主体がそれぞれ違う',
        area: 'ツール利用',
        keyPoints: [
          'ツール（Tools）: モデルが操作する。必要に応じて呼ぶ関数（検索、API の呼び出し、書き込みなど）',
          'リソース（Resources）: アプリが操作する。文脈として渡す読み取り専用のデータ（ファイルの中身、DB のスキーマなど）',
          'プロンプト（Prompts）: 利用者が操作する。明示的に選んで使うひな形（スラッシュコマンドとして現れることが多い）',
        ],
        explanation: [
          'MCP の公式ドキュメントでは、3 つの要素と、それぞれを誰が操作するか（モデル・アプリ・利用者）が表で示されています。',
          'どの要素で公開するかは、「誰がいつ使うかを決めるか」で選びます。モデルに判断させたい操作はツール、アプリが選んで渡したいデータはリソース、利用者が呼び出す定型の作業はプロンプトです。',
        ],
        misconceptions: [
          '「3 つとも接続したらモデルがすべて管理する」: 操作する主体は要素ごとに違います。',
          '「エンドポイント・スキーマ・ハンドラーが 3 つの要素」: これらは MCP の要素の定義ではありません。',
        ],
        basicsIds: [],
        resources: [{ title: 'MCP サーバーの概念（Model Context Protocol）', url: 'https://modelcontextprotocol.io/docs/learn/server-concepts', kind: '公式ドキュメント' }],
      },
      {
        id: 'usage-cost',
        title: 'リクエストごとの費用は、応答の usage のトークン数から計算する',
        area: 'Claude API',
        keyPoints: [
          '応答の usage に、課金の対象になったトークン数が入っている',
          'input_tokens・output_tokens に加え、キャッシュの書き込み（cache_creation_input_tokens）と読み取り（cache_read_input_tokens）が別に記録される',
          '種類ごとに単価が違うので、種類別に集計してモデルの単価を掛ける',
          '思考のトークンも出力として課金される。内訳は output_tokens_details.thinking_tokens で分かる',
        ],
        explanation: [
          '公式ドキュメントでは、入力の合計は cache_read_input_tokens + cache_creation_input_tokens + input_tokens と説明されています。キャッシュの読み取りは安く、書き込みは基本料金より高いので、合計のトークン数だけでは費用が正しく出ません。',
          'stop_reason や応答時間は、終わり方や性能の指標で、課金の根拠にはなりません。',
        ],
        misconceptions: [
          '「システムプロンプトの長さとツールの数から見積もる」: 目安にはなりますが、実際に課金された量ではありません。',
          '「応答時間から費用を出す」: 課金はトークンの量で決まります。',
        ],
        basicsIds: ['claude-models-and-pricing'],
        resources: [
          { title: '料金（Pricing）', url: `${CLAUDE_DOCS}/about-claude/pricing`, kind: '公式ドキュメント' },
          { title: 'プロンプトキャッシュ（Prompt caching）', url: `${CLAUDE_DOCS}/build-with-claude/prompt-caching`, kind: '公式ドキュメント' },
        ],
      },
    ],
  },
];

export function examPointsFor(certId: string): ExamPointSet | undefined {
  return EXAM_POINT_SETS.find((s) => s.certId === certId);
}
