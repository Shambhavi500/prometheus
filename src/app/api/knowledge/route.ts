import { getStore, sessionScope } from '@/server/store';
import type { KnowledgeData } from '@/server/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const store = getStore();
  const scope = sessionScope();
  const projects = store.user.projectIds
    .map((id) => store.graph.getNodeScoped(id, scope))
    .filter((n): n is NonNullable<typeof n> => !!n)
    .map((n) => ({ id: n.id, tag: n.tag, name: n.name }));

  const data: KnowledgeData = {
    tenant: { id: store.user.tenantId, name: store.user.tenantName, projects },
    precedents: store.precedents,
    learnings: store.learnings,
    isolation: store.isolation,
  };
  return Response.json(data);
}
