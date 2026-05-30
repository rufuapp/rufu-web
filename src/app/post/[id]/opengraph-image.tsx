import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('posts')
    .select(`
      title, author_name, likes_count, views_count,
      profiles!posts_user_id_fkey ( name, display_name ),
      post_tags ( tag )
    `)
    .eq('id', id)
    .eq('visibility', 'public')
    .single();

  if (!data) return new Response('Not found', { status: 404 });

  const profiles = data.profiles as unknown as { name: string; display_name: string } | null;
  const authorName = data.author_name ?? profiles?.display_name ?? profiles?.name ?? '不明';
  const initial = authorName[0]?.toUpperCase() ?? '?';
  const tags = (data.post_tags as unknown as { tag: string }[]).map((t) => t.tag);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #003d18 0%, #00782F 100%)',
          padding: '64px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'auto' }}>
          <span style={{ fontSize: '28px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>rufu</span>
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em' }}>流布</span>
        </div>

        <div
          style={{
            fontSize: data.title.length > 30 ? '52px' : '64px',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.2,
            marginBottom: '32px',
            maxWidth: '900px',
          }}
        >
          {data.title}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          {tags.slice(0, 4).map((tag) => (
            <div
              key={tag}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                borderRadius: '999px',
                padding: '6px 16px',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 800,
              color: 'white',
            }}
          >
            {initial}
          </div>
          <span style={{ fontSize: '22px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{authorName}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>{data.likes_count}</span>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>いいね</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>{data.views_count.toLocaleString()}</span>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>閲覧</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
