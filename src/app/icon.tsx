import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: '#1c5b3a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 答案につける「◯」の印 */}
        <div style={{ width: 20, height: 20, borderRadius: 9999, border: '3px solid #fbf9f3' }} />
      </div>
    ),
    { ...size },
  );
}
