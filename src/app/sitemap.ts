import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rufu.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: posts }, { data: profiles }, { data: tags }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, created_at')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(1000),
    supabase
      .from('profiles')
      .select('name, created_at')
      .limit(500),
    supabase
      .from('post_tags')
      .select('tag')
      .limit(200),
  ]);

  const uniqueTags = [...new Set((tags ?? []).map((t) => t.tag))];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/feed`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  ];

  const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${BASE_URL}/post/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const profileRoutes: MetadataRoute.Sitemap = (profiles ?? []).map((p) => ({
    url: `${BASE_URL}/user/${p.name}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const tagRoutes: MetadataRoute.Sitemap = uniqueTags.map((tag) => ({
    url: `${BASE_URL}/tag/${encodeURIComponent(tag)}`,
    changeFrequency: 'daily',
    priority: 0.5,
  }));

  return [...staticRoutes, ...postRoutes, ...profileRoutes, ...tagRoutes];
}
