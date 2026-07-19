import { getDocument } from '@/server/graph/tools';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const doc = getDocument(id);
  if (!doc) return Response.json({ error: `Unknown document: ${id}` }, { status: 404 });
  return Response.json({ document: doc });
}
