import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ADVANCED_TOPICS, getAdvancedTopic } from '@/content/advanced';
import { SITE_NAME } from '@/content/site';
import { TopicView } from '@/components/knowledge/TopicView';

export function generateStaticParams() {
  return ADVANCED_TOPICS.map((t) => ({ id: t.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const topic = getAdvancedTopic(id);
  if (!topic) return {};
  return {
    alternates: { canonical: `/advanced/${topic.id}` },
    title: `${topic.title}（応用知識）`,
    description: topic.summary,
    openGraph: { title: `${topic.title} | ${SITE_NAME}`, description: topic.summary, type: 'article', images: '/opengraph-image' },
    twitter: { card: 'summary_large_image', title: `${topic.title} | ${SITE_NAME}`, description: topic.summary, images: '/twitter-image' },
  };
}

export default async function AdvancedTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = getAdvancedTopic(id);
  if (!topic) notFound();
  return <TopicView topic={topic} topics={ADVANCED_TOPICS} section={{ name: '応用知識', base: '/advanced' }} />;
}
