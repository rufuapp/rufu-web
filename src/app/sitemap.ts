import type { MetadataRoute } from 'next';
import { ADVANCED_TOPICS } from '@/content/advanced';
import { BASICS_TOPICS } from '@/content/basics';
import { CERTIFICATIONS } from '@/content/certifications';
import { EXAM_POINT_SETS } from '@/content/exam-points';
import { HANDSON_GUIDES } from '@/content/handson';
import { getArticles } from '@/lib/articles';
import { QUESTION_SETS } from '@/content/question-sets';
import { STUDY_TOPICS } from '@/content/study-topics';
import { SITE_URL as BASE_URL } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, changeFrequency: 'hourly', priority: 1.0 },
    { url: `${BASE_URL}/trends`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/tips`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/basics`, changeFrequency: 'monthly', priority: 0.9 },
    ...BASICS_TOPICS.map((b) => ({ url: `${BASE_URL}/basics/${b.id}`, changeFrequency: 'monthly' as const, priority: 0.8 })),
    { url: `${BASE_URL}/advanced`, changeFrequency: 'monthly', priority: 0.8 },
    ...ADVANCED_TOPICS.map((t) => ({ url: `${BASE_URL}/advanced/${t.id}`, changeFrequency: 'monthly' as const, priority: 0.7 })),
    { url: `${BASE_URL}/exam`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/handson`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/articles`, changeFrequency: 'weekly', priority: 0.9 },
    ...getArticles().map((a) => ({ url: `${BASE_URL}/articles/${a.slug}`, lastModified: a.date, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...HANDSON_GUIDES.map((h) => ({ url: `${BASE_URL}/handson/${h.id}`, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...CERTIFICATIONS.map((c) => ({
      url: `${BASE_URL}/certifications/${c.id}`,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    ...EXAM_POINT_SETS.map((s) => ({ url: `${BASE_URL}/certifications/${s.certId}/points`, changeFrequency: 'monthly' as const, priority: 0.8 })),
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
