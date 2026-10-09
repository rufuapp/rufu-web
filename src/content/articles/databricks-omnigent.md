---
title: Omnigent とは何か — Claude Code や Codex を束ねる、Databricks 発の「メタハーネス」
date: 2026-10-09
summary: Databricks の AI チームなどが作ったオープンソースの Omnigent を調べました。Claude Code や Codex などのエージェントを置き換えるのではなく、その上に共通の層をかぶせて、組み合わせ・統制・共同作業をまとめて扱う仕組みです。Databricks の上で使う機能はベータ版です。
tags: Databricks, Claude Code, エージェント, Omnigent
aiAssisted: true
---

Claude Code、Codex、Cursor など、コードを書く AI エージェントは増え続けています。チームの中で何種類も使うようになると、「設定や権限がばらばら」「だれが何をさせたのか分からない」「費用が読めない」といった問題が出てきます。こうした問題に向けて Databricks の AI チームなどが公開した Omnigent を調べました。2026年10月9日時点の情報です。

## 結論

- **Omnigent は、エージェントを置き換えるものではなく、その上にかぶせる「共通の層」です。** Claude Code や Codex などを、同じ形で組み合わせ、同じルールで統制し、チームで一緒に使えるようにします。
- **オープンソース（Apache 2.0）で、手元の環境でも使えます。** Databricks の上で使う機能も用意されていて、こちらは 2026年10月時点でベータ版です。
- 著者の考えとしては、**お客さまが複数のコーディングエージェントを使い始めたときの「統制の仕組み」**として、FDE が提案できる道具になりそうです。

## Omnigent とは

Omnigent は、公式サイトで「AI エージェントを作り、動かすためのメタハーネス」と説明されています。ハーネスとは、Claude Code や Codex のように、モデルを動かしてツールを使わせる「エージェントの実行の仕組み」のことです。Omnigent は、そのハーネスのさらに上に立つ層、という意味でメタハーネスと名乗っています。

- 作り手: 公式サイトでは「Databricks の AI チーム、Neon、Omnigent の貢献者」が作ったと書かれています。
- ライセンス: Apache 2.0 のオープンソースです。GitHub では 1 万を超えるスターを集めています（2026年10月時点）。
- 公開の時期: 報道によれば、2026年6月に Databricks がオープンソースとして公開しました。

## 3つの役割

### 組み合わせる

エージェントは短い YAML のファイルで定義します。使うハーネス（Claude Code や Codex など）やモデルは1行で切り替えられ、ツール・プロンプト・Skill・ポリシーはそのまま使い回せます。GitHub の README には、次のような例が載っています。

```yaml
name: my_agent
prompt: You are a helpful data analyst.

executor:
  harness: claude-sdk

tools:
  word_count:
    type: function
    callable: mypackage.mymodule.word_count
```

同じセッションの中で、別々のハーネスのエージェントを混ぜて使うこともできます。あるエージェントの仕事を別のエージェントに見直させる、得意なことに合わせて仕事を分ける、といった使い方ができます。

### 統制する

- **サンドボックス**: エージェントは OS のサンドボックスの中で動き、触れるファイルやネットワークが制限されます。macOS では標準の seatbelt、Linux では bubblewrap を使います。
- **ポリシー**: 「シェルのコマンドやファイルの書き込みの前に確認する」といったルールを設定できます。
- **費用の上限**: セッション・エージェント・サーバー全体の単位で、費用の上限と、手前での警告を決められます。

### 一緒に使う

動いているセッションを、リンクでチームの人と共有できます。共有されたセッションに一緒に入って指示を出す、会話を分岐させて別の方向で続ける、といったこともできます。

## 使えるハーネスとモデル

README では、Claude Code、Codex、Cursor、OpenCode、Hermes、Pi と、YAML で書いた自作のエージェントが挙げられています。

モデルの使い方は4通りから選べます。Anthropic や OpenAI の API キー、Claude Pro・Max や ChatGPT のサブスクリプション、OpenRouter・Ollama・Azure などのゲートウェイ、そして Databricks のワークスペースです。

## Databricks の上で使う場合

Databricks の公式ドキュメントにも、Omnigent のページがあります。Databricks の上で使うと、次のような形になります。

- サーバーは Databricks が管理し、ワークスペースの ID（利用者の認証）と連携する
- モデルは、Databricks の基盤モデルと Unity Gateway を通して使う
- エージェントの実行に Databricks Sandboxes を使える（一部の AWS の地域のみ）
- 用意されたポリシーに加えて、CEL（Common Expression Language）で独自のポリシーを書ける

2026年10月時点ではベータ版で、Omnigent のプレビューを有効にし、Unity Gateway が使えるワークスペースが必要です。サンドボックスを使うには、対応する地域と、別のプレビューの有効化も必要です。

## A2A との違い（著者の考え）

前回の記事で取り上げた A2A とは、扱う層が違います。

| | 何をするものか |
|---|---|
| A2A | 別々に作られたエージェント同士が、仕事を頼み合うための「通信の約束事」 |
| Omnigent | 複数のハーネスのエージェントを、1か所で組み合わせ・統制し・共有するための「実行の基盤」 |
| MCP | 1つのエージェントに、ツールやデータをつなぐための「つなぎ方の約束事」 |

つまり、Omnigent は「チームの中でエージェントをどう動かし、どう管理するか」、A2A は「エージェント同士がどう話すか」の話です。どちらか一方を選ぶものではありません。

## FDE としての使いどころ（著者の考え）

- **お客さまの開発チームが、複数のコーディングエージェントを使い始めたとき:** 「どのエージェントに、何を、どこまでさせてよいか」をそろえる仕組みとして提案できそうです。サンドボックスと費用の上限は、情報システム部門の審査で特に聞かれるところです。
- **Claude Code を、Databricks の統制の下で使いたいとき:** Databricks の上で使えば、モデルの利用を Unity Gateway に集め、ワークスペースの認証と結びつけられます。Claude と Databricks を組み合わせる提案の、一つの形になりそうです。
- **注意点:** Databricks の上で使う機能はまだベータ版です。本番の業務に入れる前に、プレビューの条件と、使いたい地域で使えるかを確かめる必要があります。

## 次にやりたいこと

- オープンソース版を手元に入れ、Claude Code のエージェントを YAML で定義して動かしてみる（「やってみた」にまとめる）
- 費用の上限とポリシー（書き込みの前の確認）が、実際にどう効くかを確かめる

## 参考にした情報

- [Omnigent on Databricks](https://docs.databricks.com/aws/en/omnigent/)（Databricks の公式ドキュメント、ベータ版）
- [omnigent-ai/omnigent](https://github.com/omnigent-ai/omnigent)（GitHub、README）
- [Omnigent — a meta-harness for building and running AI agents](https://omnigent.ai/)（公式サイト）
- [Databricks Open-Sources Omnigent](https://www.marktechpost.com/2026/06/13/databricks-open-sources-omnigent-a-meta-harness-that-composes-governs-and-shares-ai-agents-across-claude-code-codex-and-pi/)（MarkTechPost、2026年6月13日。公開の時期の参考）
