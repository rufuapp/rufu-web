import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          backgroundColor: '#0c1f12',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#4ade80',
            fontSize: 110,
            fontWeight: 800,
            fontFamily: 'serif',
            lineHeight: 1,
            marginTop: 6,
          }}
        >
          r
        </span>
      </div>
    ),
    { ...size },
  );
}
