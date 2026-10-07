import type { MetadataRoute } from 'next';
import { EXAMS } from '@/content/exams';
import { SITE_URL as BASE_URL } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/exams`, changeFrequency: 'weekly', priority: 0.9 },
    ...EXAMS.map((e) => ({
      url: `${BASE_URL}/exams/${e.id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
