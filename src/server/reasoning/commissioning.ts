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
import { CX_LEVELS, type CxLevel, type CxNode, type CxStatus, type Finding, type TraceStep, type DecisionRecord } from '../types';

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

  // Finding — SYS-COMPUTE turnover gap linked to the upstream rack delivery slip and fiber customs hold.
  const findings: Finding[] = [];
  const sysCompute = tree.find((t) => t.id === 'SYS-COMPUTE');
  if (sysCompute && (sysCompute.levels.L4 !== 'Complete' || sysCompute.levels.L5 !== 'Complete')) {
    const gapCite = cite('DOC-CX-AIFC', 'CX-1-13');
    const mvCite = cite('DOC-CX-AIFC', 'CX-1-2');
    const riskId = ids.risk();
    const decisionId = ids.decision();
    const findingId = ids.finding();
    const trace: TraceStep[] = [
      { index: 1, total: 4, actor: 'Orchestrator', text: 'Routing to Commissioning Agent...' },
      { index: 2, total: 4, actor: 'Commissioning Agent', text: 'Rolling up L1–L5 test records for SYS-COMPUTE subsystems (SS-COMPUTE-A, SS-COMPUTE-B, SS-NVLINK, SS-FABRIC)...', payload: { SS_COMPUTE_A: sysCompute.children?.[0]?.readinessPct, SS_COMPUTE_B: sysCompute.children?.[1]?.readinessPct } },
      { index: 3, total: 4, actor: 'Commissioning Agent', text: 'SS-COMPUTE-A L1 FAT blocked: GB300 NVL72 Racks SU-01/SU-02 in manufacture (20-week actual lead vs 18-week baseline). No units available for FAT witness.', payload: { source: 'CX-1-2' } },
      { index: 4, total: 4, actor: 'Commissioning Agent', text: 'Tracing upstream causes: SS-COMPUTE-A → EQ-NVL72-SU01 → ACT-S400 (2-week slip). SS-COMPUTE-B → SS-NVLINK → SHP-FIBER-001 (customs hold). L2 NVLink domain validation and L4/L5 cannot be sequenced until both blockers are resolved.' },
    ];
    findings.push({
      id: findingId, agentId: 'AGT-CX', agentName: 'Commissioning Agent', kind: 'commissioning-gap',
      severity: 'High',
      title: 'SYS-COMPUTE NVLink L2/L5 commissioning gap — blocked by rack delivery + transceiver customs hold',
      finding: `GPU Compute Cluster readiness is ${sysCompute.readinessPct}%. L4 Functional and L5 AI Workload Acceptance Testing cannot be sequenced until: (1) GB300 NVL72 Racks SU-01/SU-02 are delivered and passed FAT, and (2) QSFP112/OSFP transceiver batch (SHP-FIBER-001) clears Pune customs for NVLink inter-rack cabling [CX-AIFC-001 Rev 3, L5 Rollup].`,
      impact: `The commissioning turnover gap is caused by two concurrent upstream blockers: the 2-week rack delivery slip (ACT-S400) and the QSFP112/OSFP transceiver customs hold (14-day estimated clearance). The NVLink 5th-Gen domain validation (L2 SAT), GPU burn-in (L3), and 576-GPU L5 AI Workload Acceptance cannot be sequenced until both are resolved.`,
      recommendation: `Re-sequence SYS-COMPUTE L2/L5 commissioning against the re-baselined S400 rack delivery. Authorize air-freight of transceiver batch (NVL72-PILOT precedent). Pull OOB Management (SYS-MGMT) commissioning forward to protect the L5 AI Workload Acceptance window.`,
      confidence: 0.90,
      citations: [gapCite, mvCite],
      trace,
      entityIds: ['SYS-COMPUTE', 'SS-COMPUTE-A', 'EQ-NVL72-SU01', 'ACT-S400'],
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
