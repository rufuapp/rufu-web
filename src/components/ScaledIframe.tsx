'use client';

import { useRef, useState, useEffect } from 'react';

const DESIGN_WIDTH = 1200;
const DESIGN_HEIGHT = 900;

interface Props {
  html: string;
  title: string;
  /** コンテナに適用する className（高さを含む） */
  className?: string;
  /**
   * 'cover'  — コンテナ幅に合わせてスケール（高さは overflow:hidden でクロップ）
   * 'contain' — 幅・高さ両方に収まるようスケール（余白は透明）
   */
  mode?: 'cover' | 'contain';
}

export function ScaledIframe({ html, title, className = '', mode = 'cover' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (mode === 'contain') {
        const s = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);
        setScale(s);
        setOffsetX((width - DESIGN_WIDTH * s) / 2);
        setOffsetY((height - DESIGN_HEIGHT * s) / 2);
      } else {
        setScale(width / DESIGN_WIDTH);
        setOffsetX(0);
        setOffsetY(0);
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [mode]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {scale > 0 && (
        <iframe
          srcDoc={html}
          sandbox="allow-scripts"
          title={title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${DESIGN_WIDTH}px`,
            height: `${DESIGN_HEIGHT}px`,
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
            transformOrigin: 'top left',
            border: 'none',
          }}
        />
      )}
    </div>
  );
}
