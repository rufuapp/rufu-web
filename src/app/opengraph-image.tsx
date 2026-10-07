import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/content/site';

// SNS で共有したときの画像（生成りの紙に明朝体、上下に二重線）
export const alt = `${SITE_NAME} — Claude と Databricks の最新動向と基礎知識`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const KICKER = 'FORWARD DEPLOYED ENGINEER';
const TAGLINE = 'Claude と Databricks の最新動向と、FDE の基礎知識';

/** 画像に使う文字だけを含む Noto Serif JP を Google Fonts から読む（ビルド時に 1 回） */
async function loadFont(text: string): Promise<ArrayBuffer> {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@700&text=${encodeURIComponent(text)}`)).text();
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error('Noto Serif JP を読み込めませんでした');
  return (await fetch(url)).arrayBuffer();
}

export default async function OpengraphImage() {
  const font = await loadFont(KICKER + SITE_NAME + TAGLINE);
  const rule = { width: '100%', height: 10, borderTop: '3px solid #1f1c18', borderBottom: '3px solid #1f1c18' };
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 72px',
          backgroundColor: '#fbf9f3',
          color: '#1f1c18',
          fontFamily: 'Noto Serif JP',
        }}
      >
        <div style={rule} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 26, letterSpacing: '0.35em', color: '#5d574e' }}>{KICKER}</div>
          <div style={{ marginTop: 18, fontSize: 112, letterSpacing: '0.12em' }}>{SITE_NAME}</div>
          <div style={{ marginTop: 22, fontSize: 34, color: '#1c5b3a' }}>{TAGLINE}</div>
        </div>
        <div style={rule} />
      </div>
    ),
    { ...size, fonts: [{ name: 'Noto Serif JP', data: font, weight: 700, style: 'normal' }] },
  );
}
