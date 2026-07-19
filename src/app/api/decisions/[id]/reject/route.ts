import { rejectDecision } from '@/server/store';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as { rationale?: string };
    const decision = rejectDecision(id, body.rationale ?? '');
    return Response.json({ decision });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Rejection failed.' }, { status: 409 });
  }
}
