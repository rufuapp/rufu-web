import type { MetadataRoute } from 'next';
import { CERTIFICATIONS } from '@/content/certifications';
import { QUESTION_SETS } from '@/content/question-sets';
import { STUDY_TOPICS } from '@/content/study-topics';
import { SITE_URL as BASE_URL } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, changeFrequency: 'hourly', priority: 1.0 },
    { url: `${BASE_URL}/trends`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/tips`, changeFrequency: 'daily', priority: 0.9 },
    ...CERTIFICATIONS.map((c) => ({
      url: `${BASE_URL}/certifications/${c.id}`,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    ...STUDY_TOPICS.map((t) => ({
      url: `${BASE_URL}/study/${t.id}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...QUESTION_SETS.map((s) => ({
      url: `${BASE_URL}/question-sets/${s.id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
