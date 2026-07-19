import { streamFindingTrace, toSse } from '@/server/reasoning/orchestrator';

export const dynamic = 'force-dynamic';

/** SSE stream of the orchestrator's reasoning trace for a re-run evaluation. */
export async function GET(_req: Request, ctx: { params: Promise<{ findingId: string }> }) {
  const { findingId } = await ctx.params;
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of streamFindingTrace(findingId)) {
          controller.enqueue(encoder.encode(toSse(event)));
        }
      } catch {
        controller.enqueue(encoder.encode(toSse({ type: 'error', message: 'Stream interrupted. Graph connection unstable.' })));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
