/**
 * Golden-set style tests for the deterministic core.
 * The trust anchor of the platform: limits and date math must be exact.
 */

import { describe, expect, it } from 'vitest';
import { evaluateLimit } from './spec-compliance';
import { propagateSlip } from './schedule-risk';
import { addWeeks, fmtDate } from './dates';
import { buildSeedGraph } from '../graph/seed-graph';
import { runSpecCompliance } from './spec-compliance';
import { runScheduleRisk } from './schedule-risk';
import { runSupplyChain, vendorRiskScore } from './supply-chain';
import { runCommissioning, readinessPct } from './commissioning';
import { runKnowledge } from './knowledge';
import { getStore } from '../store';

const ids = () => {
  let x = 0;
  return { risk: () => `R${++x}`, decision: () => `D${++x}`, finding: () => `F${++x}` };
};

describe('evaluateLimit', () => {
  it('flags equality deviations (480 V required, 400 V submitted)', () => {
    expect(evaluateLimit({ operator: '=', required: 480, submitted: 400 })).toBe(false);
    expect(evaluateLimit({ operator: '=', required: 480, submitted: 480 })).toBe(true);
  });
  it('evaluates threshold operators', () => {
    expect(evaluateLimit({ operator: '>=', required: 65, submitted: 65 })).toBe(true);
    expect(evaluateLimit({ operator: '>=', required: 65, submitted: 50 })).toBe(false);
    expect(evaluateLimit({ operator: '<=', required: 400, submitted: 480 })).toBe(false);
  });
});

describe('propagateSlip', () => {
  it('absorbs free float along the chain (38w slip, 12w + 18w float → 8w IST slip)', () => {
    expect(propagateSlip(38, [{ freeFloatWeeks: 12 }, { freeFloatWeeks: 18 }, { freeFloatWeeks: 0 }])).toEqual([26, 8, 8]);
  });
  it('never produces negative slip', () => {
    expect(propagateSlip(5, [{ freeFloatWeeks: 10 }, { freeFloatWeeks: 0 }])).toEqual([0, 0]);
  });
});

describe('date math', () => {
  it('adds weeks in UTC', () => {
    expect(addWeeks('2028-05-05', 8)).toBe('2028-06-30');
  });
  it('formats DD-MMM-YYYY', () => {
    expect(fmtDate('2026-07-18')).toBe('18-Jul-2026');
  });
});

describe('agent evaluations over the seed graph', () => {
  it('spec compliance yields 1 deviation, 1 data gap, 2 compliant rows — all cited', () => {
    const { rows, findings } = runSpecCompliance(buildSeedGraph(), ids());
    expect(rows).toHaveLength(4);
    expect(rows.filter((r) => r.verdict === 'Deviation')).toHaveLength(1);
    expect(rows.filter((r) => r.verdict === 'Data Gap')).toHaveLength(1);
    expect(rows.filter((r) => r.verdict === 'Compliant')).toHaveLength(2);
    for (const f of findings) {
      expect(f.citations.length).toBeGreaterThan(0); // No unsourced claims.
      for (const c of f.citations) expect(c.quote.length).toBeGreaterThan(0);
    }
  });
  it('schedule risk computes an 8-week L5 IST slip from the 128w vs 90w conflict', () => {
    const { findings } = runScheduleRisk(buildSeedGraph(), ids());
    const cascade = findings[0]?.cascade;
    expect(cascade?.slipAtOriginWeeks).toBe(38);
    expect(cascade?.istSlipWeeks).toBe(8);
    const ist = cascade?.steps.find((s) => s.level === 'L5');
    expect(ist?.predictedFinish).toBe('2028-06-30');
  });
  it('flags sub-threshold entity resolution for human verification', () => {
    const { findings } = runScheduleRisk(buildSeedGraph(), ids());
    const res = findings.find((f) => f.kind === 'entity-resolution');
    expect(res?.confidence).toBeLessThan(0.8);
  });
});

describe('supply-chain agent', () => {
  it('scores force-majeure + weak performance higher than a nominal vendor', () => {
    const meridian = vendorRiskScore({ onTimeRate: 0.74, forceMajeure: true, singleSource: false });
    const helios = vendorRiskScore({ onTimeRate: 0.88, forceMajeure: false, singleSource: false });
    expect(meridian).toBeGreaterThan(helios);
    expect(vendorRiskScore({ onTimeRate: 0.61, forceMajeure: false, singleSource: true })).toBeCloseTo(0.59, 2);
  });
  it('maps 5 shipments and raises a critical force-majeure finding + high single-source finding', () => {
    const { data, findings } = runSupplyChain(buildSeedGraph(), ids());
    expect(data.arcs).toHaveLength(5);
    expect(data.points.filter((p) => p.kind === 'vendor')).toHaveLength(3);
    expect(findings.find((f) => f.severity === 'Critical')?.entityIds).toContain('VEN-MERIDIAN');
    for (const f of findings) expect(f.citations.length).toBeGreaterThan(0);
  });
});

describe('commissioning agent', () => {
  it('computes readiness from level weights (L1+L2 complete, L3 in progress = 50%)', () => {
    expect(readinessPct({ L1: 'Complete', L2: 'Complete', L3: 'In Progress', L4: 'Not Started', L5: 'Not Started' })).toBe(50);
    expect(readinessPct({ L1: 'Blocked', L2: 'Not Started', L3: 'Not Started', L4: 'Not Started', L5: 'Not Started' })).toBe(0);
  });
  it('rolls up systems and raises a SYS-01 turnover gap tracing to TX-01', () => {
    const { tree, findings } = runCommissioning(buildSeedGraph(), ids());
    const sys01 = tree.find((t) => t.id === 'SYS-01');
    expect(sys01?.children).toHaveLength(2);
    expect(sys01?.levels.L1).toBe('Blocked'); // worst-of MV(Blocked) and LV(At Risk)
    const gap = findings.find((f) => f.kind === 'commissioning-gap');
    expect(gap?.entityIds).toContain('EQ-TX01');
    expect(gap?.entityIds).toContain('ACT-A102');
  });
});

describe('knowledge/learning agent + tenant isolation', () => {
  const HELIOS = { tenantId: 'ORG-HELIOS', projectIds: ['PRJ-AQUILA', 'PRJ-MERIDIAN'] };
  const VANTA = { tenantId: 'ORG-VANTA', projectIds: ['PRJ-TITAN'] };

  it('matches TX-01 to the same-tenant Meridian precedent, never the foreign Titan one', () => {
    const g = buildSeedGraph();
    const sched = runScheduleRisk(g, ids());
    const { precedents, findings, isolation } = runKnowledge(g, HELIOS, sched.findings, 'PRJ-AQUILA', ids());
    const tx = precedents.find((p) => p.category === 'transformer-lead-time');
    expect(tx?.decisionTag).toBe('DEC-M12');
    expect(tx?.recoveredWeeks).toBe(6);
    expect(precedents.some((p) => p.decisionTag === 'DEC-T01')).toBe(false);
    expect(findings.some((f) => f.kind === 'knowledge-precedent')).toBe(true);
    expect(isolation.inTenantMatches).toBe(1);
    expect(isolation.blockedCrossTenant).toBe(1);
  });

  it('enforces the tenant wall on every scoped graph read', () => {
    const g = buildSeedGraph();
    // Foreign node is indistinguishable from absent under the Helios scope.
    expect(g.getNodeScoped('RISK-T01', HELIOS)).toBeUndefined();
    expect(g.getNodeScoped('RISK-T01', VANTA)?.tag).toBe('RISK-T01');
    expect(g.allNodesScoped(HELIOS).some((n) => n.projectId === 'PRJ-TITAN')).toBe(false);
    // Same tenant, different project remains visible (cross-project intelligence).
    expect(g.getNodeScoped('DEC-M12', HELIOS)?.tag).toBe('DEC-M12');
    // Scoped traversal terminates before crossing the wall.
    expect(g.neighborhoodScoped('DEC-T01', HELIOS, 1).nodes).toHaveLength(0);
  });
});

describe('store boot (end-to-end materialization)', () => {
  it('boots without unresolved edges and surfaces cross-project memory', () => {
    const s = getStore();
    // Every finding materializes a Risk + Decision node; a missing agent node
    // would throw during boot (guards the AGT-* seed).
    expect(s.findings.length).toBeGreaterThan(0);
    expect(s.decisions.size).toBe(s.findings.length);
    expect(s.precedents.some((p) => p.decisionTag === 'DEC-M12')).toBe(true);
    expect(s.learnings.length).toBeGreaterThan(0);
    expect(s.isolation.blockedCrossTenant).toBe(1);
  });
});
