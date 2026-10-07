import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 日本語は Noto Sans JP（使う文字の分だけ unicode-range で読み込まれる）
const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const SITE_TITLE = 'rufu 資格ドリル — Databricks・Claude の資格対策問題';
const SITE_DESC = 'Databricks 認定資格の対策問題と Claude の実践スキル検定を、登録なしで解けるドリルサイト。練習・模試・苦手克服モードと学習記録つき。すべて解説付きのオリジナル問題です。';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s | rufu 資格ドリル',
  },
  description: SITE_DESC,
  openGraph: {
    type: 'website',
    siteName: 'rufu 資格ドリル',
    title: SITE_TITLE,
    description: SITE_DESC,
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESC,
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
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansJp.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
