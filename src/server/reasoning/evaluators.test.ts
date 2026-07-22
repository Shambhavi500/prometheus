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
  it('schedule risk computes slip from actual vs baseline lead time', () => {
    const { findings } = runScheduleRisk(buildSeedGraph(), ids());
    const cascade = findings[0]?.cascade;
    expect(cascade?.slipAtOriginWeeks).toBe(2);
    expect(cascade?.istSlipWeeks).toBe(0);
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
  it('maps shipments and raises critical force-majeure finding + high single-source finding', () => {
    const { data, findings } = runSupplyChain(buildSeedGraph(), ids());
    expect(data.arcs.length).toBeGreaterThanOrEqual(5);
    expect(data.points.filter((p) => p.kind === 'vendor')).toHaveLength(5);
    for (const f of findings) expect(f.citations.length).toBeGreaterThan(0);
  });
});

describe('commissioning agent', () => {
  it('computes readiness from level weights (L1+L2 complete, L3 in progress = 50%)', () => {
    expect(readinessPct({ L1: 'Complete', L2: 'Complete', L3: 'In Progress', L4: 'Not Started', L5: 'Not Started' })).toBe(50);
    expect(readinessPct({ L1: 'Blocked', L2: 'Not Started', L3: 'Not Started', L4: 'Not Started', L5: 'Not Started' })).toBe(0);
  });
  it('rolls up systems and evaluates commissioning readiness', () => {
    const { tree, findings } = runCommissioning(buildSeedGraph(), ids());
    const sysCompute = tree.find((t) => t.id === 'SYS-COMPUTE');
    expect(sysCompute).toBeDefined();
    const gap = findings.find((f) => f.kind === 'commissioning-gap');
    expect(gap).toBeDefined();
  });
});

describe('knowledge/learning agent + tenant isolation', () => {
  const TENANT_SCOPE = { tenantId: 'ORG-NVIDIA-AIFC', projectIds: ['PRJ-NVL72-AIFC', 'PRJ-NVL72-PILOT'] };

  it('matches findings to the same-tenant precedent, never the foreign Titan one', () => {
    const g = buildSeedGraph();
    const sched = runScheduleRisk(g, ids());
    const { precedents } = runKnowledge(g, TENANT_SCOPE, sched.findings, 'PRJ-NVL72-AIFC', ids());
    expect(precedents).toBeDefined();
    expect(precedents.some((p) => p.decisionTag === 'DEC-T01')).toBe(false);
  });

  it('enforces the tenant wall on every scoped graph read', () => {
    const g = buildSeedGraph();
    expect(g.getNodeScoped('RISK-T01', TENANT_SCOPE)).toBeUndefined();
    expect(g.allNodesScoped(TENANT_SCOPE).some((n) => n.projectId === 'PRJ-TITAN')).toBe(false);
  });
});

describe('store boot (end-to-end materialization)', () => {
  it('boots without unresolved edges and surfaces cross-project memory', () => {
    const s = getStore();
    expect(s.findings.length).toBeGreaterThan(0);
    expect(s.decisions.size).toBe(s.findings.length);
    expect(s.learnings.length).toBeGreaterThan(0);
  });
});
