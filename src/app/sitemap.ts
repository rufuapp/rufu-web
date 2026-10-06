import type { MetadataRoute } from 'next';
import { EXAMS } from '@/content/exams';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rufu.app';

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
