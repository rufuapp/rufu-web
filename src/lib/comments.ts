export type Comment = {
  id: string;
  postId: string;
  author: { name: string; initial: string };
  body: string;
  createdAt: string;
  likes: number;
};

export const COMMENTS: Comment[] = [
  // Post 1
  { id: 'c1', postId: '1', author: { name: 'ts_lover', initial: 'T' }, body: 'グラデーションのバーチャートが綺麗ですね。前四半期との差分をもっと目立たせると更に見やすくなりそうです！', createdAt: '1時間前', likes: 12 },
  { id: 'c2', postId: '1', author: { name: 'data_viz', initial: 'D' }, body: 'レイアウトがシンプルでいい。カード3枚 + グラフの構成は鉄板ですね。自分もこのパターンよく使います。', createdAt: '1時間前', likes: 8 },
  { id: 'c3', postId: '1', author: { name: 'ai_watcher', initial: 'A' }, body: 'これClaude 3.5で生成したんですか？プロンプト教えてほしいです', createdAt: '30分前', likes: 5 },

  // Post 2
  { id: 'c4', postId: '2', author: { name: 'web_crafter', initial: 'W' }, body: 'const type parametersの説明がわかりやすい！ずっともやっとしてたところがスッキリしました。', createdAt: '4時間前', likes: 34 },
  { id: 'c5', postId: '2', author: { name: 'css_magic', initial: 'C' }, body: 'using宣言は知らなかった。Goのdeferみたいな使い方できるんですね。', createdAt: '3時間前', likes: 21 },
  { id: 'c6', postId: '2', author: { name: 'pm_tool', initial: 'P' }, body: '暗い背景に紫のハイライト、めちゃくちゃ読みやすい。デザインの参考にします。', createdAt: '2時間前', likes: 9 },

  // Post 3
  { id: 'c7', postId: '3', author: { name: 'eco_data', initial: 'E' }, body: '豊島区の人口密度が一番高いの、改めて数字で見ると実感しますね。CSSグリッドだけでここまで表現できるの凄い。', createdAt: '20時間前', likes: 47 },
  { id: 'c8', postId: '3', author: { name: 'yamada_dev', initial: 'Y' }, body: '23区全部入れてるの偉い。ホバーで詳細ポップアップとかあったらさらに面白そう。', createdAt: '18時間前', likes: 29 },

  // Post 5
  { id: 'c9', postId: '5', author: { name: 'ts_lover', initial: 'T' }, body: 'エージェント型AIが92%なのはわかる。今年はほとんどのプロジェクトでその話が出てくる。', createdAt: '2日前', likes: 56 },
  { id: 'c10', postId: '5', author: { name: 'design_lab', initial: 'D' }, body: 'ダークテーマのインフォグラフィックって珍しい。オレンジのグラデーションが映えてますね。', createdAt: '2日前', likes: 31 },
  { id: 'c11', postId: '5', author: { name: 'web_crafter', initial: 'W' }, body: 'AI規制・ガバナンスがランクインしてるのが今年らしい。来年はもっと上位に来そう。', createdAt: '1日前', likes: 18 },

  // Post 8
  { id: 'c12', postId: '8', author: { name: 'ai_watcher', initial: 'A' }, body: 'このデータ、見るたびに気が引き締まる。1.5°C超えるのが2030年って本当に早い。', createdAt: '3日前', likes: 89 },
  { id: 'c13', postId: '8', author: { name: 'yamada_dev', initial: 'Y' }, body: 'ダークグリーンの配色が内容と合っていて良い。バーの色が年代とともに赤くなっていくのも巧み。', createdAt: '3日前', likes: 44 },

  // Post 9
  { id: 'c14', postId: '9', author: { name: 'data_viz', initial: 'D' }, body: 'アニメーションがめちゃくちゃ滑らか！pure CSSでここまでできるのを改めて実感しました。', createdAt: '4日前', likes: 72 },
  { id: 'c15', postId: '9', author: { name: 'pm_tool', initial: 'P' }, body: 'Bounceのeasing、ease-in-outにしてるのがポイントですね。linearだとカクつく。', createdAt: '4日前', likes: 38 },
];

export function getCommentsByPostId(postId: string): Comment[] {
  return COMMENTS.filter((c) => c.postId === postId);
}
