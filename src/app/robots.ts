import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rufu.app';

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
