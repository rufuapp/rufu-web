import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('posts')
    .select(`
      title, author_name, created_at,
      profiles!posts_user_id_fkey ( name, display_name ),
      post_tags ( tag )
    `)
    .eq('id', id)
    .eq('visibility', 'public')
    .single();

  if (!data) return { title: '投稿が見つかりません' };

  const profiles = data.profiles as unknown as { name: string; display_name: string } | null;
  const authorName = data.author_name ?? profiles?.display_name ?? profiles?.name ?? '不明';
  const tags = (data.post_tags as unknown as { tag: string }[]).map((t) => t.tag);
  const description = `${authorName}が投稿した「${data.title}」— タグ: ${tags.join(', ')}`;

  return {
    title: data.title,
    description,
    openGraph: {
      title: data.title,
      description,
      type: 'article',
      authors: [authorName],
      tags,
      publishedTime: data.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description,
    },
  };
}

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
