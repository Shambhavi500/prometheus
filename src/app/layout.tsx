import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/core/query/Providers';
import { AppFrame } from '@/components/AppFrame';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jbMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jbmono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PROMETHEUS — Engineering Intelligence Operating System',
  description: 'Execution-intelligence layer for mission-critical EPC programmes.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${jbMono.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          <AppFrame>{children}</AppFrame>
        </Providers>
      </body>
    </html>
  );
}
