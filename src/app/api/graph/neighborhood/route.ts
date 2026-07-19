import { getStore, sessionScope } from '@/server/store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const depth = Math.min(2, Math.max(1, Number(url.searchParams.get('depth') ?? 1)));
  const store = getStore();
  const scope = sessionScope();
  const focus = id ? store.graph.getNodeScoped(id, scope) : undefined;
  // Out-of-tenant ids are indistinguishable from absent — no existence leak.
  if (!focus) {
    return Response.json({ error: `Unknown entity: ${id ?? '(missing id)'}` }, { status: 404 });
  }
  const { nodes, edges } = store.graph.neighborhoodScoped(id!, scope, depth);
  return Response.json({ focus, nodes, edges });
}
