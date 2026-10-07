import type { Viewport } from 'next';
import { SiteFooter, SiteHeader } from '@/components/quiz/SiteChrome';

export const viewport: Viewport = {
  themeColor: '#fbf9f3',
  colorScheme: 'light',
};

export default function DrillLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="drill flex flex-1 flex-col">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
