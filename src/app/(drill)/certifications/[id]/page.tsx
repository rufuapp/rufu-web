import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CERTIFICATIONS, FACTS_CHECKED_ON, getCertification } from '@/content/certifications';
import { getStudyTopic } from '@/content/study-topics';
import { questionIdsBySet, questionSetsForCertification, topicsForCertification } from '@/content/catalog';
import { Breadcrumb, ExternalLink, ResourceList, SubTitle, TrackLabel } from '@/components/quiz/ui';

export function generateStaticParams() {
  return CERTIFICATIONS.map((c) => ({ id: c.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const cert = getCertification(id);
  if (!cert) return {};
  const title = `${cert.nameJa}（${cert.name}）とは`;
  return {
    title,
    description: cert.summary,
    openGraph: { title: `${title} | rufu 資格ドリル`, description: cert.summary, type: 'article' },
    twitter: { card: 'summary', title: `${title} | rufu 資格ドリル`, description: cert.summary },
  };
}

export default async function CertificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cert = getCertification(id);
  if (!cert) notFound();
  const topics = topicsForCertification(cert);
  const sets = questionSetsForCertification(cert.id);
  const ids = questionIdsBySet();
  const hasWeights = cert.outline.some((o) => o.weight !== undefined);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ href: '/', label: 'トップ' }, { href: '/#certifications', label: '資格一覧' }, { label: cert.nameJa }]} />

      <header className="mt-6 border-b border-line pb-6">
        <p className="flex flex-wrap items-center gap-3">
          <TrackLabel track={cert.track} />
          <span className="tag text-brand">{cert.vendor} の公式資格</span>
          <span className="tag text-muted">{cert.level}</span>
        </p>
        <h1 className="mt-3 text-3xl">{cert.nameJa}</h1>
        <p className="mt-1 text-muted">{cert.name}</p>
        <p className="mt-4 text-lg leading-relaxed">{cert.summary}</p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 [&>h3:first-child]:mt-0">
          <SubTitle>どのような資格か</SubTitle>
          {cert.description.map((p) => (
            <p key={p} className="mt-3">
              {p}
            </p>
          ))}

          <SubTitle>こんな人に向いています</SubTitle>
          <ul className="list-disc space-y-1 pl-6">
            {cert.audience.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>

          <SubTitle>出題範囲</SubTitle>
          <div className="overflow-x-auto">
            <table className="ruled">
              <thead>
                <tr>
                  <th scope="col">分野</th>
                  {hasWeights && <th scope="col">配点</th>}
                  <th scope="col">rufu の学習ガイド</th>
                </tr>
              </thead>
              <tbody>
                {cert.outline.map((o) => (
                  <tr key={o.name}>
                    <th scope="row" className="font-normal break-keep">
                      {o.nameJa}
                      <span className="block text-xs text-muted">{o.name}</span>
                    </th>
                    {hasWeights && <td className="whitespace-nowrap tabular-nums">{o.weight}%</td>}
                    <td className="text-sm">
                      {o.topicIds.length > 0 ? (
                        o.topicIds.map((tid) => {
                          const t = getStudyTopic(tid);
                          return t ? (
                            <Link key={tid} href={`/study/${tid}`} className="link block">
                              {t.title}
                            </Link>
                          ) : null;
                        })
                      ) : (
                        <span className="text-muted">まだ扱っていません</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {cert.outlineNote && <p className="mt-3 text-sm text-muted">※ {cert.outlineNote}</p>}

          <SubTitle>勉強の進め方</SubTitle>
          <ol className="list-decimal space-y-2 pl-6">
            {cert.studyPlan.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>

          <SubTitle>学習すべき内容</SubTitle>
          <ul className="divide-y divide-line border-y border-line">
            {topics.map((t) => (
              <li key={t.id} className="py-3">
                <Link href={`/study/${t.id}`} className="link font-bold">
                  {t.title}
                </Link>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted">{t.summary}</span>
              </li>
            ))}
          </ul>

          <SubTitle>問題集</SubTitle>
          {sets.length > 0 ? (
            <>
              {cert.track === 'claude' && (
                <p className="mb-3 text-sm text-muted">
                  公式試験の出題範囲に沿ったものではなく、関連する技能を練習するためのオリジナルの問題集です。
                </p>
              )}
              <ul className="space-y-3">
                {sets.map((s) => (
                  <li key={s.id} className="box flex flex-wrap items-center justify-between gap-3 p-4">
                    <span>
                      <Link href={`/question-sets/${s.id}`} className="link font-bold">
                        {s.title}
                      </Link>
                      <span className="block text-sm text-muted">
                        {s.level}・{(ids[s.id] ?? []).length}問
                      </span>
                    </span>
                    <Link href={`/question-sets/${s.id}`} className="btn btn-primary px-5 text-sm">
                      問題を解く
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-muted">この資格に対応する問題集は、まだありません。</p>
          )}
        </div>

        <aside className="space-y-6">
          <section className="box p-5">
            <h2 className="border-b border-ink pb-1.5 font-bold tracking-[0.1em]">試験の概要</h2>
            <dl className="mt-2 divide-y divide-line text-sm">
              {cert.facts.map((f) => (
                <div key={f.label} className="grid grid-cols-[6.5rem_1fr] gap-2 py-2">
                  <dt className="text-muted">{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {FACTS_CHECKED_ON}時点の公式の情報をもとにしています。受験の前に、必ず公式ページで最新の情報を確認してください。
            </p>
            <p className="mt-3 text-sm">
              <ExternalLink href={cert.officialUrl}>{cert.vendor === 'Anthropic' ? '公式発表を読む' : '公式ページを見る'}</ExternalLink>
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-bold tracking-[0.1em]">公式の教材・リンク</h2>
            <ResourceList resources={cert.links} />
          </section>
        </aside>
      </div>
    </div>
  );
}
