/**
 * Orchestrator streaming — re-runs an evaluation and streams the reasoning
 * trace as discrete mechanical steps over SSE. No generic spinners: the
 * workspace renders exactly these states (04_INTERACTION §Streaming).
 */

import { findingById } from '../store';
import type { StreamEvent, TraceStep } from '../types';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function* streamFindingTrace(findingId: string): AsyncGenerator<StreamEvent> {
  const finding = findingById(findingId);
  if (!finding) {
    yield { type: 'error', message: `Unknown finding: ${findingId}. Re-run aborted.` };
    return;
  }
  const framing: TraceStep = {
    index: 0,
    total: finding.trace.length,
    actor: 'Orchestrator',
    text: `Routing to ${finding.agentName}. Assembling graph context (2-hop neighborhood)...`,
  };
  yield { type: 'step', step: framing };
  await sleep(350);
  for (const step of finding.trace) {
    yield { type: 'step', step };
    await sleep(280 + Math.min(220, step.text.length));
  }
  await sleep(200);
  yield { type: 'result', message: `Evaluation complete. Result unchanged: ${finding.title}.` };
}

export function toSse(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}
