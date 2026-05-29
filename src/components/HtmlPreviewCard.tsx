'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

type Props = {
  href: string;
  title: string;
  authorName: string;
  firstTag?: string;
  html: string;
  gradient: string;
};

export function HtmlPreviewCard({ href, title, authorName, firstTag, html, gradient }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / 1200);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Link
      href={href}
      className="group block rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div ref={containerRef} className="relative overflow-hidden h-44">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        {scale > 0 && (
          <iframe
            srcDoc={html}
            sandbox="allow-scripts"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1200px',
              height: '600px',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              border: 'none',
              pointerEvents: 'none',
            }}
            title={title}
          />
        )}
        {firstTag && (
          <div className="absolute top-3 right-3 z-10">
            <span className="text-xs bg-black/25 text-white px-2.5 py-1 rounded-full backdrop-blur-sm font-medium">
              {firstTag}
            </span>
          </div>
        )}
      </div>
      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-[#00782F] transition-colors">
          {title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{authorName}</p>
      </div>
    </Link>
  );
}
