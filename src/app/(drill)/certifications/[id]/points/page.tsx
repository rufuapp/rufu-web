import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBasicsTopic } from '@/content/basics';
import { getCertification } from '@/content/certifications';
import { EXAM_POINT_SETS, examPointsFor } from '@/content/exam-points';
import { SITE_NAME } from '@/content/site';
import { Breadcrumb, ResourceList, SubTitle } from '@/components/quiz/ui';

export function generateStaticParams() {
  return EXAM_POINT_SETS.map((s) => ({ id: s.certId }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const cert = getCertification(id);
  if (!cert || !examPointsFor(id)) return {};
  const title = `${cert.nameJa}で押さえる論点`;
  const description = `${cert.name} の試験に向けて、押さえておきたい論点を、公式ドキュメントにもとづいてまとめています。`;
  return {
    alternates: { canonical: `/certifications/${id}/points` },
    title,
    description,
    openGraph: { title: `${title} | ${SITE_NAME}`, description, type: 'article', images: '/opengraph-image' },
    twitter: { card: 'summary_large_image', title: `${title} | ${SITE_NAME}`, description, images: '/twitter-image' },
  };
}

export default async function ExamPointsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cert = getCertification(id);
  const set = examPointsFor(id);
  if (!cert || !set) notFound();
  const areas = [...new Set(set.points.map((p) => p.area))];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb
        items={[
          { href: '/', label: 'トップ' },
          { href: '/exam#certifications', label: '資格一覧' },
          { href: `/certifications/${cert.id}`, label: cert.nameJa },
          { label: '押さえる論点' },
        ]}
      />
      <header className="mt-6 border-b border-line pb-6">
        <p className="text-xs font-bold tracking-[0.18em] text-muted">{cert.name}</p>
        <h1 className="mt-3 text-3xl">{cert.nameJa}で押さえる論点</h1>
        <p className="mt-4 text-lg leading-relaxed">
          試験に向けて押さえておきたい知識を、論点ごとにまとめています。それぞれに、覚えること・解説・よくある誤解・関連する基礎知識を付けています。
        </p>
        <p className="mt-3 text-sm text-muted">
          著者が試験対策の中で学んだ論点を、{set.checkedOn}時点の公式ドキュメントで確かめて書いています。実際の試験問題や、市販の問題集の問題ではありません。
        </p>
      </header>

      <nav aria-labelledby="points-toc" className="box mt-8 p-5 text-sm">
        <h2 id="points-toc" className="border-b border-ink pb-1.5 font-bold tracking-[0.2em]">
          論点の一覧（{set.points.length}）
        </h2>
        {areas.map((area) => (
          <div key={area} className="mt-3">
            <p className="text-xs font-bold text-muted">{area}</p>
            <ol className="mt-1 space-y-1">
              {set.points
                .filter((p) => p.area === area)
                .map((p) => (
                  <li key={p.id}>
                    <a href={`#${p.id}`} className="link">
                      {p.title}
                    </a>
                  </li>
                ))}
            </ol>
          </div>
        ))}
      </nav>

      <div className="mx-auto mt-6 max-w-3xl">
        {set.points.map((p, i) => (
          <article key={p.id} id={p.id} className="scroll-mt-16 border-b border-line pb-10">
            <p className="mt-10 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="font-bold tracking-[0.12em]">論点 {i + 1}</span>
              <span className="tag">{p.area}</span>
            </p>
            <h2 className="mt-2 text-xl leading-snug">{p.title}</h2>

            <div className="box mt-4 p-4">
              <p className="text-sm font-bold">覚えること</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                {p.keyPoints.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>

            <SubTitle>解説</SubTitle>
            {p.explanation.map((e) => (
              <p key={e} className="mt-3">
                {e}
              </p>
            ))}

            <SubTitle>よくある誤解</SubTitle>
            <ul className="space-y-2">
              {p.misconceptions.map((m) => (
                <li key={m} className="flex gap-2">
                  <span aria-hidden className="text-ng">
                    ✕
                  </span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>

            <SubTitle>関連する基礎知識</SubTitle>
            <ul className="space-y-1">
              {p.basicsIds.map((bid) => {
                const b = getBasicsTopic(bid);
                return b ? (
                  <li key={bid}>
                    <Link href={`/basics/${b.id}`} className="link">
                      {b.title}
                    </Link>
                  </li>
                ) : null;
              })}
            </ul>

            <SubTitle>公式の情報</SubTitle>
            <ResourceList resources={p.resources} />
          </article>
        ))}
        <p className="mt-10 text-sm">
          <Link href={`/certifications/${cert.id}`} className="link">
            ← {cert.nameJa}のページに戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
