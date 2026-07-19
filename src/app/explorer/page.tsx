import { Suspense } from 'react';
import { ExplorerView } from '@/features/explorer/ExplorerView';

export const metadata = { title: 'Thread Explorer — PROMETHEUS' };

export default function ExplorerPage() {
  return (
    <Suspense>
      <ExplorerView />
    </Suspense>
  );
}
