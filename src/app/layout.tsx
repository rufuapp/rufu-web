import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'rufu — AI生成HTMLの共有プラットフォーム',
    template: '%s | rufu',
  },
  description: 'ClaudeやChatGPTが生成したHTMLコンテンツを投稿・発見・共有できるコミュニティ。スライド、ダッシュボード、ビジュアライゼーションをワンクリックで公開。',
  openGraph: {
    type: 'website',
    siteName: 'rufu',
    title: 'rufu — AI生成HTMLの共有プラットフォーム',
    description: 'ClaudeやChatGPTが生成したHTMLコンテンツを投稿・発見・共有できるコミュニティ。',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'rufu — AI生成HTMLの共有プラットフォーム',
    description: 'ClaudeやChatGPTが生成したHTMLコンテンツを投稿・発見・共有できるコミュニティ。',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
