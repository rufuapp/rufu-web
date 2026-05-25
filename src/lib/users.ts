export type User = {
  name: string;
  initial: string;
  displayName: string;
  bio: string;
  followers: number;
  following: number;
  postCount: number;
  joinedAt: string;
  website?: string;
  twitterHandle?: string;
};

export const USERS: Record<string, User> = {
  yamada_dev: {
    name: 'yamada_dev',
    initial: 'Y',
    displayName: '山田 Dev',
    bio: 'フルスタックエンジニア。データダッシュボードとビジネス分析が得意。Claude APIを使ったHTML生成を毎日やっています。',
    followers: 1240,
    following: 312,
    postCount: 28,
    joinedAt: '2025年3月',
    twitterHandle: 'yamada_dev',
  },
  ts_lover: {
    name: 'ts_lover',
    initial: 'T',
    displayName: 'TypeScript Lover',
    bio: 'TypeScript / React / Node.js エンジニア。新しい言語機能をスライドにまとめるのが趣味。',
    followers: 892,
    following: 156,
    postCount: 14,
    joinedAt: '2025年4月',
    website: 'https://example.com',
  },
  data_viz: {
    name: 'data_viz',
    initial: 'D',
    displayName: 'Data Viz Lab',
    bio: 'データビジュアライゼーション専門。統計データをインタラクティブなHTMLに変換するのが得意。',
    followers: 2100,
    following: 89,
    postCount: 42,
    joinedAt: '2025年2月',
    twitterHandle: 'data_viz_lab',
  },
  design_lab: {
    name: 'design_lab',
    initial: 'D',
    displayName: 'Design Lab',
    bio: 'UIデザイナー兼フロントエンドエンジニア。美しいランディングページのテンプレートを公開中。',
    followers: 734,
    following: 203,
    postCount: 19,
    joinedAt: '2025年4月',
    website: 'https://example.com',
  },
  ai_watcher: {
    name: 'ai_watcher',
    initial: 'A',
    displayName: 'AI Watcher',
    bio: 'AI業界のトレンドをウォッチしてインフォグラフィックにまとめています。週1更新。',
    followers: 3560,
    following: 445,
    postCount: 67,
    joinedAt: '2025年1月',
    twitterHandle: 'ai_watcher_jp',
  },
  web_crafter: {
    name: 'web_crafter',
    initial: 'W',
    displayName: 'Web Crafter',
    bio: 'フリーランスWebデザイナー。ポートフォリオテンプレートとランディングページを中心に投稿。',
    followers: 1890,
    following: 567,
    postCount: 35,
    joinedAt: '2025年2月',
    website: 'https://example.com',
  },
  pm_tool: {
    name: 'pm_tool',
    initial: 'P',
    displayName: 'PM Tool',
    bio: 'プロダクトマネージャー。プロジェクト管理ツールをHTMLで手軽に作れることを布教中。',
    followers: 423,
    following: 178,
    postCount: 11,
    joinedAt: '2025年5月',
  },
  eco_data: {
    name: 'eco_data',
    initial: 'E',
    displayName: 'Eco Data',
    bio: '環境データエンジニア。気候変動・エネルギー関連のデータを可視化して発信しています。',
    followers: 4120,
    following: 234,
    postCount: 53,
    joinedAt: '2024年12月',
    twitterHandle: 'eco_data_jp',
  },
  css_magic: {
    name: 'css_magic',
    initial: 'C',
    displayName: 'CSS Magic',
    bio: 'CSSアニメーションおたく。純粋なCSS/HTMLだけで作れる表現を追求しています。',
    followers: 2780,
    following: 390,
    postCount: 48,
    joinedAt: '2025年1月',
    website: 'https://example.com',
  },
};

export function getUserByName(name: string): User | undefined {
  return USERS[name];
}
