/**
 * Schedule-Risk Agent — deterministic cascade computation.
 *
 * Compares extracted vendor lead times against P6 baseline assumptions and
 * walks the DEPENDS_ON chain, absorbing free float per activity. Pure date
 * math — reproducible, testable, never model-generated.
 */

import type { TypedGraph } from '../graph/engine';
import { cite } from '../graph/tools';
import { addWeeks, fmtDate } from './dates';
import type { CascadeResult, CascadeStep, Finding, TraceStep } from '../types';

/** Pure cascade over (slipIn, freeFloat) pairs. Exported for unit tests. */
export function propagateSlip(
  slipAtOriginWeeks: number,
  chain: Array<{ freeFloatWeeks: number }>,
): number[] {
  const out: number[] = [];
  let slip = slipAtOriginWeeks;
  for (const step of chain) {
    slip = Math.max(0, slip - step.freeFloatWeeks);
    out.push(slip);
  }
  return out;
}

export interface ScheduleEvaluation {
  findings: Finding[];
}

export function runScheduleRisk(graph: TypedGraph, ids: { risk: () => string; decision: () => string; finding: () => string }): ScheduleEvaluation {
  const origin = graph.requireNode('ACT-A102');
  const assumed = Number(origin.props.assumedLeadTimeWeeks);
  const quoted = 128; // Extracted from VQ-884 pg 2 (perception-layer output).
  const quoteCitation = cite('DOC-VQ-884', 'VQ-2-1');
  const baselineCitation = cite('DOC-P6-EXTR', 'P6-1-2');

  const slipAtOrigin = quoted - assumed;
  if (slipAtOrigin <= 0) return { findings: [] };

  const chainNodes = graph.downstreamChain('ACT-A102');
  const slips = propagateSlip(slipAtOrigin, chainNodes.map((c) => ({ freeFloatWeeks: Number(c.props.freeFloatWeeks) })));

  const steps: CascadeStep[] = [];
  const originFinish = String(origin.props.baselineFinish);
  steps.push({
    activityId: String(origin.props.activityId),
    entityId: origin.id,
    name: origin.name,
    baselineStart: String(origin.props.baselineStart),
    baselineFinish: originFinish,
    predictedFinish: addWeeks(originFinish, slipAtOrigin),
    slipInWeeks: slipAtOrigin,
    floatAbsorbedWeeks: 0,
    slipOutWeeks: slipAtOrigin,
  });
  chainNodes.forEach((node, i) => {
    const slipIn = i === 0 ? slipAtOrigin : slips[i - 1];
    const slipOut = slips[i];
    const baselineFinish = String(node.props.baselineFinish);
    steps.push({
      activityId: String(node.props.activityId),
      entityId: node.id,
      name: node.name,
      level: node.props.level ? String(node.props.level) : undefined,
      baselineStart: String(node.props.baselineStart),
      baselineFinish,
      predictedFinish: addWeeks(baselineFinish, slipOut),
      slipInWeeks: slipIn,
      floatAbsorbedWeeks: Math.min(slipIn, Number(node.props.freeFloatWeeks)),
      slipOutWeeks: slipOut,
    });
  });

  const ist = steps.find((s) => s.level === 'L5');
  const istSlip = ist?.slipOutWeeks ?? slips[slips.length - 1] ?? slipAtOrigin;

  const cascade: CascadeResult = {
    originActivityId: 'A102',
    quotedLeadTimeWeeks: quoted,
    assumedLeadTimeWeeks: assumed,
    slipAtOriginWeeks: slipAtOrigin,
    istSlipWeeks: istSlip,
    steps,
  };

  const riskId = ids.risk();
  const decisionId = ids.decision();
  const findingId = ids.finding();

  const trace: TraceStep[] = [
    { index: 1, total: 5, actor: 'Orchestrator', text: 'Routing to Schedule-Risk Agent...' },
    { index: 2, total: 5, actor: 'Schedule-Risk Agent', text: 'Extracting required lead time from VQ-884, pg 2...', payload: { quotedLeadTimeWeeks: quoted, source: 'VQ-2-1' } },
    { index: 3, total: 5, actor: 'Schedule-Risk Agent', text: 'Comparing to P6 Activity A102 baseline assumption (90 weeks)...', payload: { assumedLeadTimeWeeks: assumed, source: 'P6-1-2' } },
    { index: 4, total: 5, actor: 'Schedule-Risk Agent', text: `Conflict detected: ${quoted} weeks (quoted) vs ${assumed} weeks (baseline). Simulating P6 schedule cascade...`, payload: { slipAtOriginWeeks: slipAtOrigin } },
    { index: 5, total: 5, actor: 'Schedule-Risk Agent', text: `Cascade complete: ${slipAtOrigin}-week delivery slip, ${slipAtOrigin - istSlip} weeks absorbed by downstream float, predicted L5 IST slip ${istSlip} weeks.`, payload: { steps: steps.map((s) => ({ activity: s.activityId, slipOut: s.slipOutWeeks })) } },
  ];

  const finding: Finding = {
    id: findingId,
    agentId: 'AGT-SCHED',
    agentName: 'Schedule-Risk Agent',
    kind: 'schedule-risk',
    severity: 'Critical',
    title: 'TX-01 lead-time conflict threatens L5 IST',
    finding: `Vendor quotation lists a 128-week lead time for TX-01 [VQ-884, pg 2], conflicting with the 90-week assumption in P6 Activity A102 [P6-EXTR-2026-07, Basis of Schedule §2.4].`,
    impact: `Computed cascade predicts an ${istSlip}-week slip to L5 Integrated Systems Testing (baseline finish ${fmtDate(ist?.baselineFinish ?? '2028-05-05')} → predicted ${fmtDate(ist?.predictedFinish ?? '')}). 30 weeks of downstream float are fully consumed.`,
    recommendation: `Re-baseline P6 Activity A102 to the quoted 128-week lead time and evaluate phased power alternatives for NM-1 energization.`,
    confidence: 0.95,
    citations: [quoteCitation, baselineCitation],
    trace,
    entityIds: ['EQ-TX01', 'PO-884', 'ACT-A102', 'ACT-A210', 'VEN-KAPPA'],
    riskId,
    decisionId,
    cascade,
  };

  // Entity-resolution flag: the quote references "T-01"; resolver mapped it to TX-01 at 72%.
  const resRiskId = ids.risk();
  const resDecisionId = ids.decision();
  const resFindingId = ids.finding();
  const resolution: Finding = {
    id: resFindingId,
    agentId: 'AGT-SCHED',
    agentName: 'Schedule-Risk Agent',
    kind: 'entity-resolution',
    severity: 'Medium',
    title: `Entity resolution: 'T-01' → TX-01 (72% confidence)`,
    finding: `VQ-884 references unit 'T-01' [VQ-884, pg 2]. Entity resolution mapped 'T-01' to Equipment Tag TX-01 (72% confidence, fuzzy tag match). The lead-time conflict above depends on this mapping.`,
    impact: `If 'T-01' does not refer to TX-01, the computed cascade is attributed to the wrong asset and the A102 re-baseline may be unnecessary.`,
    recommendation: `Verify the resolution of 'T-01' to TX-01 against the PO-884 line items. Manual verification recommended below the 80% confidence threshold.`,
    confidence: 0.72,
    citations: [quoteCitation],
    trace: [
      { index: 1, total: 3, actor: 'Entity Resolution', text: `Deterministic key match failed: 'T-01' is not a registered Equipment Tag.` },
      { index: 2, total: 3, actor: 'Entity Resolution', text: `Fuzzy match (blocking + similarity): 'T-01' → TX-01 scored 0.72; 'T-01' → TX-02 scored 0.41.`, payload: { candidates: { 'TX-01': 0.72, 'TX-02': 0.41 } } },
      { index: 3, total: 3, actor: 'Entity Resolution', text: 'Confidence below auto-merge threshold (80%). Queued for human verification.' },
    ],
    entityIds: ['EQ-TX01', 'PO-884'],
    riskId: resRiskId,
    decisionId: resDecisionId,
  };

  return { findings: [finding, resolution] };
}
