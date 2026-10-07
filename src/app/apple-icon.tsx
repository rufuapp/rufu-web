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
          backgroundColor: '#1c5b3a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 答案につける「◯」の印 */}
        <div style={{ width: 110, height: 110, borderRadius: 9999, border: '15px solid #fbf9f3' }} />
      </div>
    ),
    { ...size },
  );
}
