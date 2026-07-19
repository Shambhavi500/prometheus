/**
 * Phase 3 seed — Organizations (tenants), a prior same-tenant project that
 * carries resolved decisions for cross-project memory, and a foreign tenant
 * whose identical pattern must never surface (isolation proof).
 *
 * Tenant/project keys are set explicitly here; buildSeedGraph defaults all
 * unscoped Phase 1/2 nodes to ORG-HELIOS / PRJ-AQUILA.
 */

import type { EntityBase, Edge } from '@prometheus/ontology';
import type { TypedGraph } from './engine';

const HELIOS = 'ORG-HELIOS';
const VANTA = 'ORG-VANTA';
const AQUILA = 'PRJ-AQUILA';
const MERIDIAN = 'PRJ-MERIDIAN';
const TITAN = 'PRJ-TITAN';

function n(
  partial: Omit<EntityBase, 'verification' | 'owner'> & Partial<Pick<EntityBase, 'verification' | 'owner'>>,
): EntityBase {
  return { verification: 'HumanVerified', owner: 'PER-MASON', ...partial };
}

const NODES: EntityBase[] = [
  // Organizations (tenants) — platform-global registry (no tenantId).
  n({ id: HELIOS, type: 'Organization', tag: 'HELIOS', name: 'Helios Grid EPC', status: 'Active', props: {} }),
  n({ id: VANTA, type: 'Organization', tag: 'VANTA', name: 'Vanta Infrastructure', status: 'Active', props: {} }),

  // Knowledge/Learning Agent — platform-global worker.
  n({ id: 'AGT-KNOWLEDGE', type: 'AIAgent', tag: 'AGT-KNOWLEDGE', name: 'Knowledge/Learning Agent', status: 'Active', props: { domain: 'Cross-project memory & pattern matching' } }),

  // ── Prior HELIOS project: Meridian / DH-0 (2024). Cross-project memory. ──
  n({ id: MERIDIAN, type: 'Project', tag: 'DH-0', name: 'Project Meridian — Data Hall 0', status: 'Operating', tenantId: HELIOS, projectId: MERIDIAN, props: { year: '2024' } }),
  n({ id: 'EQ-TX-M0', type: 'Equipment', tag: 'TX-M0', name: 'Unit Substation Transformer (DH-0)', status: 'Operating', tenantId: HELIOS, projectId: MERIDIAN, props: {} }),

  // Resolved precedent 1 — transformer lead-time slip, mitigated by phased power.
  n({ id: 'RISK-M12', type: 'Risk', tag: 'RISK-M12', name: 'Transformer lead-time slip threatened L5 IST', status: 'Mitigated', tenantId: HELIOS, projectId: MERIDIAN, props: { category: 'transformer-lead-time', severity: 'Critical' } }),
  n({ id: 'DEC-M12', type: 'Decision', tag: 'DEC-M12', name: 'Phased-power energization + A-line re-baseline', status: 'Signed', tenantId: HELIOS, projectId: MERIDIAN, props: { category: 'transformer-lead-time', outcome: 'Energized DH-0 on temporary phased power while awaiting the delayed transformer; recovered 6 weeks of L5 IST float.', recoveredWeeks: 6, signedBy: 'J. Mason (Project Director)', signedAt: '2024-09-12', docId: 'DOC-LL-MERIDIAN' } }),

  // Resolved precedent 2 — voltage deviation accepted with a step-up transformer.
  n({ id: 'RISK-M07', type: 'Risk', tag: 'RISK-M07', name: 'Cooling unit voltage deviation (400V vs 480V)', status: 'Mitigated', tenantId: HELIOS, projectId: MERIDIAN, props: { category: 'voltage-deviation', severity: 'High' } }),
  n({ id: 'DEC-M07', type: 'Decision', tag: 'DEC-M07', name: 'Accept 400V unit with a qualified step-up transformer', status: 'Signed', tenantId: HELIOS, projectId: MERIDIAN, props: { category: 'voltage-deviation', outcome: 'Deviation accepted with an interposing step-up transformer; no schedule impact. Basis retained for reuse.', signedBy: 'A. Rao (Discipline Engineer)', signedAt: '2024-05-30', docId: 'DOC-LL-MERIDIAN' } }),

  // ── Foreign VANTA project: Titan. SAME transformer pattern — must be walled off. ──
  n({ id: TITAN, type: 'Project', tag: 'DH-X', name: 'Project Titan (Vanta Infrastructure)', status: 'In Delivery', tenantId: VANTA, projectId: TITAN, props: { year: '2025' } }),
  n({ id: 'RISK-T01', type: 'Risk', tag: 'RISK-T01', name: 'Transformer lead-time slip (Titan)', status: 'Mitigated', tenantId: VANTA, projectId: TITAN, props: { category: 'transformer-lead-time', severity: 'Critical' } }),
  n({ id: 'DEC-T01', type: 'Decision', tag: 'DEC-T01', name: 'Vanta phased-power mitigation', status: 'Signed', tenantId: VANTA, projectId: TITAN, props: { category: 'transformer-lead-time', outcome: 'Confidential Vanta mitigation — must never surface to Helios.', recoveredWeeks: 9, signedBy: 'Vanta PMO' } }),
];

const EDGES: Array<Omit<Edge, 'id'>> = [
  { from: HELIOS, to: MERIDIAN, verb: 'OWNS' },
  { from: HELIOS, to: AQUILA, verb: 'OWNS' },
  { from: VANTA, to: TITAN, verb: 'OWNS' },
  { from: MERIDIAN, to: 'EQ-TX-M0', verb: 'CONTAINS' },
  { from: 'RISK-M12', to: 'EQ-TX-M0', verb: 'THREATENS' },
  { from: 'DEC-M12', to: 'RISK-M12', verb: 'MITIGATES' },
  { from: 'DEC-M07', to: 'RISK-M07', verb: 'MITIGATES' },
  { from: 'DEC-T01', to: 'RISK-T01', verb: 'MITIGATES' },
];

/** Platform-global types keep tenantId undefined so they are shared across tenants. */
const GLOBAL_TYPES = new Set<EntityBase['type']>(['Standard', 'AIAgent', 'Organization']);

export function applyPhase3Seed(g: TypedGraph): void {
  for (const node of NODES) g.addNode(node);
  EDGES.forEach((e, i) => g.addEdge({ id: `E3-${String(i + 1).padStart(3, '0')}`, ...e }));

  // Default every still-unscoped node to the primary tenant/project.
  for (const node of g.allNodes()) {
    if (GLOBAL_TYPES.has(node.type)) continue;
    if (node.tenantId == null) node.tenantId = HELIOS;
    if (node.projectId == null) node.projectId = AQUILA;
  }
}
