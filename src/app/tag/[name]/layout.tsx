import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const tag = decodeURIComponent(name);
  const description = `「${tag}」タグの投稿一覧 — rufu で AI 生成 HTML を発見・共有しよう。`;

  return {
    title: `#${tag}`,
    description,
    openGraph: {
      title: `#${tag} | rufu`,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `#${tag} | rufu`,
      description,
    },
  };
}

export default function TagLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
