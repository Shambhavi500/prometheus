/**
 * Commissioning Agent — deterministic L1–L5 readiness rollup.
 *
 * Reads TestRecord nodes that VERIFY each subsystem, computes per-level
 * status and a readiness percentage, rolls subsystems up to systems, and
 * raises turnover-gap findings that link the gap to its upstream supply
 * cause (01_PRD Capability Model; 02_EXPERIENCE "upstream supply causes").
 */

import type { TypedGraph } from '../graph/engine';
import { cite } from '../graph/tools';
import { CX_LEVELS, type CxLevel, type CxNode, type CxStatus, type Finding, type TraceStep } from '../types';

const STATUS_WEIGHT: Record<CxStatus, number> = {
  Complete: 1,
  'In Progress': 0.5,
  'At Risk': 0.25,
  Blocked: 0,
  'Not Started': 0,
};

const STATUS_RANK: Record<CxStatus, number> = {
  Blocked: 0,
  'Not Started': 1,
  'At Risk': 2,
  'In Progress': 3,
  Complete: 4,
};

/** Readiness = mean level weight across L1–L5. Pure, exported for tests. */
export function readinessPct(levels: Record<CxLevel, CxStatus>): number {
  const total = CX_LEVELS.reduce((sum, lv) => sum + STATUS_WEIGHT[levels[lv]], 0);
  return Math.round((total / CX_LEVELS.length) * 100);
}

function emptyLevels(): Record<CxLevel, CxStatus> {
  return { L1: 'Not Started', L2: 'Not Started', L3: 'Not Started', L4: 'Not Started', L5: 'Not Started' };
}

function worst(a: CxStatus, b: CxStatus): CxStatus {
  return STATUS_RANK[a] <= STATUS_RANK[b] ? a : b;
}

export interface CommissioningEvaluation {
  tree: CxNode[];
  findings: Finding[];
}

export function runCommissioning(
  graph: TypedGraph,
  ids: { risk: () => string; decision: () => string; finding: () => string },
): CommissioningEvaluation {
  const systems = graph.allNodes().filter((nd) => nd.type === 'System');
  const tree: CxNode[] = [];

  for (const sys of systems) {
    const subIds = graph.out(sys.id, 'CONTAINS').map((e) => e.to).filter((id) => graph.getNode(id)?.type === 'Subsystem');
    const children: CxNode[] = [];

    for (const subId of subIds) {
      const sub = graph.requireNode(subId);
      const levels = emptyLevels();
      // TestRecords VERIFY the subsystem; each carries a level + cxStatus.
      const records = graph.in(subId, 'VERIFIES').map((e) => graph.requireNode(e.from)).filter((r) => r.type === 'TestRecord');
      for (const r of records) {
        const lv = r.props.level as CxLevel;
        levels[lv] = r.props.cxStatus as CxStatus;
      }
      const blockingCause =
        levels.L1 === 'Blocked' ? 'Awaiting equipment delivery' : levels.L1 === 'At Risk' ? 'Upstream supply / deviation risk' : undefined;
      children.push({ id: sub.id, tag: sub.tag, name: sub.name, kind: 'subsystem', levels, readinessPct: readinessPct(levels), blockingCause });
    }

    // System rollup: per-level worst-of children; readiness = mean of children.
    const rollup = emptyLevels();
    for (const lv of CX_LEVELS) {
      rollup[lv] = children.length ? children.map((c) => c.levels[lv]).reduce(worst) : 'Not Started';
    }
    const readiness = children.length ? Math.round(children.reduce((s, c) => s + c.readinessPct, 0) / children.length) : 0;
    tree.push({ id: sys.id, tag: sys.tag, name: sys.name, kind: 'system', levels: rollup, readinessPct: readiness, children });
  }

  // Finding — SYS-01 turnover gap linked to the upstream TX-01 supply cause.
  const findings: Finding[] = [];
  const sys01 = tree.find((t) => t.id === 'SYS-01');
  if (sys01 && (sys01.levels.L4 !== 'Complete' || sys01.levels.L5 !== 'Complete')) {
    const gapCite = cite('DOC-CX-MATRIX', 'CX-1-6');
    const mvCite = cite('DOC-CX-MATRIX', 'CX-1-2');
    const riskId = ids.risk();
    const decisionId = ids.decision();
    const findingId = ids.finding();
    const trace: TraceStep[] = [
      { index: 1, total: 4, actor: 'Orchestrator', text: 'Routing to Commissioning Agent...' },
      { index: 2, total: 4, actor: 'Commissioning Agent', text: 'Rolling up L1–L5 test records for SYS-01 subsystems...', payload: { SS_01A: sys01.children?.[0]?.readinessPct, SS_01B: sys01.children?.[1]?.readinessPct } },
      { index: 3, total: 4, actor: 'Commissioning Agent', text: 'MV Distribution (SS-01A) L1 blocked: no TX-01 unit to witness FAT.', payload: { source: 'CX-1-2' } },
      { index: 4, total: 4, actor: 'Commissioning Agent', text: 'Tracing upstream cause: SS-01A → TX-01 → A102 (128-week lead) → PO-884. L4/L5 cannot be sequenced.' },
    ];
    findings.push({
      id: findingId, agentId: 'AGT-CX', agentName: 'Commissioning Agent', kind: 'commissioning-gap',
      severity: 'High',
      title: 'SYS-01 L4/L5 turnover gap — blocked by TX-01 delivery',
      finding: `System 01 readiness is ${sys01.readinessPct}%. L4 Functional and L5 Integrated Systems Testing cannot be sequenced until TX-01 is delivered and energized [CX-MATRIX-DH1, SYS-01 rollup]. MV Distribution FAT is blocked with no unit available [CX-MATRIX-DH1, SS-01A].`,
      impact: `The commissioning turnover gap is a direct downstream effect of the TX-01 lead-time slip and Kappa single-source exposure. SYS-01 cannot achieve L5 IST on the current baseline.`,
      recommendation: `Re-sequence SYS-01 L4/L5 against the re-baselined A102 delivery, and pull BMS (SYS-03) commissioning forward to protect the integrated test window.`,
      confidence: 0.88,
      citations: [gapCite, mvCite],
      trace,
      entityIds: ['SYS-01', 'SS-01A', 'EQ-TX01', 'ACT-A102'],
      riskId, decisionId,
    });
  }

  return { tree, findings };
}

import { ExtractedTestRecord } from '@/core/utils/ai';

export function evaluateDynamicCommissioningRisk(
  ex: ExtractedTestRecord,
  docId: string,
  graph: TypedGraph,
  ids: { risk: () => string; decision: () => string; finding: () => string }
): { finding: Finding; decision: DecisionRecord } | null {
  if (ex.status === 'Complete' || ex.status === 'In Progress' || ex.status === 'Not Started') return null;
  
  const allNodes = graph.allNodes();
  const subsystem = allNodes.find(n => n.type === 'Subsystem' && (n.tag === ex.subsystemTag || n.name.includes(ex.subsystemTag)));
  if (!subsystem) return null;

  const system = graph.in(subsystem.id, 'CONTAINS').map(e => graph.getNode(e.from)).find(n => n?.type === 'System');
  
  const decisionId = ids.decision();

  const finding: Finding = {
    id: ids.finding(),
    agentId: 'AGT-CX',
    agentName: 'Commissioning Agent',
    kind: 'commissioning-gap',
    severity: ex.status === 'Blocked' ? 'Critical' : 'High',
    title: `${ex.subsystemTag} ${ex.level} testing is ${ex.status.toLowerCase()}`,
    finding: `Dynamic ingestion extracted a test record [${docId}] indicating ${ex.subsystemTag} ${ex.level} is ${ex.status}.`,
    impact: `The ${ex.status.toLowerCase()} status prevents downstream ${ex.level} and subsequent integrated systems testing${system ? ` for ${system.tag}` : ''}.`,
    recommendation: `Investigate blockers for ${ex.subsystemTag} ${ex.level} and re-sequence concurrent testing.`,
    confidence: 0.95,
    citations: [{ docId, docTitle: `AI Extraction (${docId})`, page: 1, blockId: 'dynamic-extract', quote: `Status: ${ex.status}`, clause: 'Test Record' }],
    trace: [
      { index: 1, total: 3, actor: 'Commissioning Agent', text: `Extracted ${ex.status} status for ${ex.subsystemTag} ${ex.level} from ${docId}.`, payload: { status: ex.status } },
      { index: 2, total: 3, actor: 'Commissioning Agent', text: `Traversing graph to identify impacted systems...`, payload: { system: system?.tag } },
      { index: 3, total: 3, actor: 'Commissioning Agent', text: `Testing block detected. Escalating.` }
    ],
    entityIds: system ? [system.id, subsystem.id] : [subsystem.id],
    riskId: ids.risk(),
    decisionId,
  };

  const decision: DecisionRecord = {
    id: decisionId,
    findingId: finding.id,
    severity: finding.severity,
    agentName: 'Commissioning Agent',
    action: `Re-sequence testing for ${ex.subsystemTag}`,
    impact: finding.impact,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    writeBack: { system: 'Smart Completions', message: 'Commissioning re-sequence logged.' }
  };

  return { finding, decision };
}
