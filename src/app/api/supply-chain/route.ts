import { getStore } from '@/server/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const store = getStore();
  const findingIds = store.findings.filter((f) => f.kind === 'supply-chain').map((f) => f.id);
  return Response.json({ ...store.supplyData, findingIds });
}
