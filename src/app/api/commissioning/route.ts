import { getStore } from '@/server/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const store = getStore();
  const findingIds = store.findings.filter((f) => f.kind === 'commissioning-gap').map((f) => f.id);
  return Response.json({ tree: store.commissioningTree, findingIds });
}
