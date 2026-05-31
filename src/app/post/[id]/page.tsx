import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PostPageClient, { type DbPost, type DbComment } from './PostPageClient';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: postData }, { data: commentsData }] = await Promise.all([
    supabase
      .from('posts')
      .select(`
        id, title, html_content, likes_count, bookmarks_count, views_count, created_at, user_id, author_name,
        profiles!posts_user_id_fkey ( name, display_name ),
        post_tags ( tag )
      `)
      .eq('id', id)
      .eq('visibility', 'public')
      .single(),
    supabase
      .from('comments')
      .select('id, body, likes_count, created_at, profiles!comments_user_id_fkey(name, display_name)')
      .eq('post_id', id)
      .order('created_at', { ascending: true }),
  ]);

  if (!postData) notFound();

  const post = postData as unknown as DbPost;
  const comments = (commentsData as unknown as DbComment[]) ?? [];
  const authorName = post.author_name ?? post.profiles?.display_name ?? post.profiles?.name ?? '不明';
  const tags = post.post_tags.map((t) => t.tag);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    author: { '@type': 'Person', name: authorName },
    datePublished: post.created_at,
    keywords: tags.join(', '),
    interactionStatistic: [
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: post.likes_count },
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/WatchAction', userInteractionCount: post.views_count },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PostPageClient initialPost={post} initialComments={comments} />
    </>
  );
}
