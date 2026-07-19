import { getStore, sessionScope } from '@/server/store';

export const dynamic = 'force-dynamic';

/** Palette search index: tenant-scoped graph entities, filterable client-side for 0ms latency. */
export async function GET() {
  const store = getStore();
  const entities = store.graph.allNodesScoped(sessionScope()).map((n) => ({
    id: n.id,
    type: n.type,
    tag: n.tag,
    name: n.name,
    status: n.status ?? '',
  }));
  return Response.json({ entities });
}
