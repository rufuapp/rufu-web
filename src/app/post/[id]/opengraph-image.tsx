import { ImageResponse } from 'next/og';
import { getPostById } from '@/lib/posts';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getPostById(id);
  if (!post) return new Response('Not found', { status: 404 });

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
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'auto' }}>
          <span style={{ fontSize: '28px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
            rufu
          </span>
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em' }}>
            流布
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: post.title.length > 30 ? '52px' : '64px',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.2,
            marginBottom: '32px',
            maxWidth: '900px',
          }}
        >
          {post.title}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          {post.tags.slice(0, 4).map((tag) => (
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

        {/* Author row */}
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
            {post.author.initial}
          </div>
          <span style={{ fontSize: '22px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
            {post.author.name}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>{post.likes}</span>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>いいね</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>{post.views.toLocaleString()}</span>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>閲覧</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
