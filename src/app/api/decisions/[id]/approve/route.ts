import { approveDecision } from '@/server/store';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const decision = approveDecision(id);
    return Response.json({ decision });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Approval failed.' }, { status: 409 });
  }
}
