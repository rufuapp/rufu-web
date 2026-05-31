import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('profiles')
    .select('display_name, bio, post_count, followers_count')
    .eq('name', name)
    .single();

  if (!data) return { title: 'ユーザーが見つかりません' };

  const displayName = data.display_name || name;
  const description = data.bio
    ? `${displayName} (@${name}) — ${data.bio}`
    : `${displayName} (@${name}) の投稿一覧。${data.post_count}件の投稿、${data.followers_count}人のフォロワー。`;

  return {
    title: `${displayName} (@${name})`,
    description,
    openGraph: {
      title: `${displayName} (@${name}) | rufu`,
      description,
      type: 'profile',
      username: name,
    },
    twitter: {
      card: 'summary',
      title: `${displayName} (@${name}) | rufu`,
      description,
    },
  };
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
