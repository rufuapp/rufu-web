import type { MetadataRoute } from 'next';
import { SITE_URL as BASE_URL } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/post/new', '/bookmarks', '/admin/', '/progress'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
