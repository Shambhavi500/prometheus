import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Providers } from '@/core/query/Providers';
import { AppFrame } from '@/components/AppFrame';

export const metadata: Metadata = {
  title: 'PROMETHEUS — Engineering Intelligence Workspace',
  description: 'Execution-intelligence layer for mission-critical EPC programmes.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppFrame>{children}</AppFrame>
        </Providers>
      </body>
    </html>
  );
}
