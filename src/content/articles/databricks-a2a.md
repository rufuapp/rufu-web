---
title: Databricks で A2A は使えるのか — 調べてわかったこと
date: 2026-10-08
summary: エージェント同士をつなぐ A2A プロトコルについて、仕様と Databricks の公式ドキュメント、コミュニティの事例を調べました。公式の機能としては A2A ではなく独自の仕組みでつないでおり、A2A を使うなら Databricks Apps に自分で置く形になります。
tags: Databricks, A2A, MCP, エージェント
aiAssisted: true
---

エージェントを複数組み合わせる構成が増え、「エージェント同士をつなぐ共通の約束事」として A2A（Agent2Agent）プロトコルの名前を聞くことが多くなりました。Databricks でエージェントを作るときに A2A は使えるのか、使うべきなのかを調べました。2026年10月8日時点の情報です。

## 結論

- **Databricks の公式ドキュメントには、A2A は出てきません。** Databricks の機能としてエージェント同士をつなぐときは、Databricks 独自の仕組み（Databricks Apps 上の取りまとめ役のエージェントが、ほかのエージェントを道具として呼ぶ形）を使います。
- **A2A を使いたい場合は、A2A のサーバーを Databricks Apps に自分で置きます。** この方法は、Databricks の社員がコミュニティの技術ブログで紹介しています。
- 著者の考えとしては、**Databricks の中で完結するなら公式の仕組み、ほかの会社の基盤のエージェントとつなぐなら A2A** という使い分けになりそうです。

## A2A とは

A2A は、別々に作られた AI エージェント同士が、互いを見つけて、仕事を頼み、結果を受け取るための共通の約束事です。2026年10月時点の最新の版は 1.0.0 で、Linux Foundation のもとで運営されています（A2A のサイトでは、Agentic AI Foundation への参加が告知されています）。

主な考え方は次のとおりです。

- **Agent Card**: エージェントの名前、できること、必要な認証の方法などを書いた自己紹介の文書です。頼む側はこれを読んで、相手を選びます。
- **Task（タスク）**: 頼まれた仕事の単位です。「作業中」「完了」「失敗」に加えて、「追加の入力が必要」「認証が必要」といった状態を持ちます。
- **Message・Part・Artifact**: やりとりの1回分が Message、その中身（文章・ファイル・構造化データ）が Part、仕事の成果物が Artifact です。
- **通信の方式**: JSON-RPC 2.0・gRPC・HTTP+JSON（REST）のどれかで通信します。途中経過は Server-Sent Events で流せ、時間のかかる仕事は、終わったときに相手に知らせる仕組み（プッシュ通知）も使えます。
- **認証**: OAuth 2.0・API キー・相互 TLS・OpenID Connect など、一般的な方法を使い、必要な方法を Agent Card に書きます。

## MCP との違い

同じく「つなぐ」ための約束事に MCP（Model Context Protocol）があり、よく比べられます。A2A のサイトでは、次のように説明されています。

- **MCP は縦方向**: 1つのエージェントに、ツールやデータをつないで、できることを増やします。
- **A2A は横方向**: 別々のエージェント同士をつなぎ、仕事を頼み合えるようにします。

どちらか一方を選ぶものではなく、組み合わせて使うものです。たとえば、取りまとめ役のエージェントが A2A で専門のエージェントに仕事を頼み、専門のエージェントは MCP で自分のツールやデータを使う、という形です。

## Databricks の公式の仕組み

Databricks の公式ドキュメントでは、複数のエージェントを組み合わせる方法として、次の2つが紹介されています。どちらも A2A という言葉は使っていません。

### Databricks Apps で取りまとめ役のエージェントを作る

取りまとめ役（オーケストレーター）のエージェントが、ほかのエージェントを「呼び出せる道具」として扱い、質問の内容に応じて振り分けます。呼び出せるのは次の3種類です。

- Databricks Apps に置いたほかのエージェント（Databricks の Responses API で呼び出す）
- Genie のエージェント（表形式のデータに自然言語で質問する）
- Model Serving のエンドポイント

アプリからアプリを呼ぶには OAuth が必要で、取りまとめ役のアプリのサービスプリンシパルに、呼び出し先のアプリの CAN_USE の権限を付けます。公式ドキュメントでは、振り分けの精度は、それぞれのエージェントの説明（description）の良し悪しで大きく変わると強調されています。

### Supervisor Agent

Genie、エージェントのエンドポイント、Unity Catalog の関数、MCP サーバー、Databricks Apps のエージェントなどを、ノーコードで取りまとめる機能です。1つの Supervisor Agent で最大 50 のエージェントを扱え、利用者は自分に権限のあるデータとエージェントにだけアクセスできます。なお、2026年10月時点の公式ドキュメントでは、この機能は「legacy（旧来の機能）」と書かれています。新しく作るなら、上の Databricks Apps の方法を先に検討するのがよさそうです。

## A2A を使うなら: Databricks Apps に A2A サーバーを置く

Databricks の社員による技術ブログ（Databricks Community、2025年10月15日）では、次の構成で A2A のサーバーを Databricks Apps に置く方法が紹介されています。公式のドキュメントではなく、コミュニティの記事である点に注意してください。

- エージェント本体は LangGraph で作り、Databricks のモデル（Model Serving のエンドポイント）を呼ぶ
- 公式の A2A の Python SDK（a2a-sdk）で、Agent Card と JSON-RPC の窓口を持つサーバーを作る
- それを Databricks Apps に置き、トークンなどの秘密の情報は App の設定から渡す

記事では、注意点として次のことが挙げられています。

- Databricks Apps の前段の中継（リバースプロキシ）の都合で、Agent Card に書く URL は相対パスにする
- 例のタスクの保存先はメモリ上なので、本番ではデータベースなどに保存する仕組みが必要
- 途中経過を流すのに SSE を使うため、つなぎっぱなしにできない相手にはプッシュ通知が必要

## FDE としての使い分け（著者の考え）

ここからは、調べた内容をもとにした著者の考えです。

| 場面 | 向いている方法 |
|---|---|
| Databricks の中のエージェントだけを組み合わせる | 公式の仕組み（Databricks Apps の取りまとめ役、Genie、Model Serving） |
| ほかの会社の基盤で動くエージェントと、仕事を頼み合う | A2A（Databricks Apps に A2A サーバーを置く） |
| エージェントに社内のツールやデータを使わせる | MCP（Databricks は MCP にも対応） |

お客さまから「A2A に対応していますか」と聞かれたら、「Databricks の標準の機能としては独自の仕組みでつなぐが、A2A のサーバーを Databricks Apps に置くことはできる」と答えるのが正確だと思います。Databricks の中で完結する構成なら、権限の管理や監査の面で、公式の仕組みのほうが扱いやすいはずです。

## 次にやりたいこと

- 実際に Databricks Apps に A2A のサーバーを置き、ほかのエージェントから呼べるかを試して、「やってみた」にまとめる
- Claude のエージェント（Claude Agent SDK）から、Databricks 上の A2A サーバーに仕事を頼む構成を試す

## 参考にした情報

- [Agent2Agent (A2A) Protocol Specification](https://a2a-protocol.org/latest/specification/)（仕様、版 1.0.0）
- [A2A and MCP](https://a2a-protocol.org/latest/topics/a2a-and-mcp/)（A2A の公式サイト）
- [Build a multi-agent system on Databricks Apps](https://docs.databricks.com/aws/en/agents/custom-agents/multi-agent-apps)（Databricks の公式ドキュメント）
- [Use Supervisor Agent to create a coordinated multi-agent system](https://docs.databricks.com/aws/en/agents/agent-bricks/multi-agent-supervisor)（Databricks の公式ドキュメント）
- [How to Deploy Agent-to-Agent (A2A) Protocol on Databricks Apps](https://community.databricks.com/t5/technical-blog/how-to-deploy-agent-to-agent-a2a-protocol-on-databricks-apps-gt/ba-p/134213)（Databricks Community の技術ブログ、2025年10月15日）
