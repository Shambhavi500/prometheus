/**
 * Phase 3 seed — Organizations (tenants), a prior same-tenant AI Factory project
 * that carries resolved decisions for cross-project memory, and a foreign tenant
 * whose identical pattern must never surface (isolation proof).
 *
 * Tenant/project keys are set explicitly here; buildSeedGraph defaults all
 * unscoped Phase 1/2 nodes to ORG-NVIDIA-AIFC / PRJ-NVL72-AIFC.
 *
 * Based on: NVIDIA GB300 NVL72 AI Factory Reference Architecture
 */

import type { EntityBase, Edge } from '@prometheus/ontology';
import type { TypedGraph } from './engine';

const NVIDIA_AIFC = 'ORG-NVIDIA-AIFC';
const VERTEX_INFRA = 'ORG-VERTEX-INFRA';
const CURRENT = 'PRJ-NVL72-AIFC';
const PILOT = 'PRJ-NVL72-PILOT';
const VERTEX_AIF = 'PRJ-VERTEX-AIF';

function n(
  partial: Omit<EntityBase, 'verification' | 'owner'> & Partial<Pick<EntityBase, 'verification' | 'owner'>>,
): EntityBase {
  return { verification: 'HumanVerified', owner: 'PER-SHARMA', ...partial };
}

const NODES: EntityBase[] = [
  // Organizations (tenants) — platform-global registry (no tenantId)
  n({ id: NVIDIA_AIFC, type: 'Organization', tag: 'NVIDIA-AIFC', name: 'NVIDIA AI Factory EPC', status: 'Active', props: {} }),
  n({ id: VERTEX_INFRA, type: 'Organization', tag: 'VERTEX-INFRA', name: 'Vertex Infrastructure Partners', status: 'Active', props: {} }),

  // Knowledge/Learning Agent — platform-global worker
  n({ id: 'AGT-KNOWLEDGE', type: 'AIAgent', tag: 'AGT-KNOWLEDGE', name: 'Knowledge/Learning Agent', status: 'Active', props: { domain: 'Cross-project NVIDIA AI Factory memory & pattern matching' } }),

  // ── Prior NVIDIA AIFC project: Hyderabad Pilot (2025). Cross-project memory. ──
  n({ id: PILOT, type: 'Project', tag: 'NVL72-PILOT', name: 'NVIDIA AI Factory — Hyderabad Pilot (NVL72-PILOT)', status: 'Operating', tenantId: NVIDIA_AIFC, projectId: PILOT, props: { year: '2025', location: 'Hyderabad, India', gpuCount: 144, suCount: 2 } }),
  n({ id: 'EQ-PILOT-CDU', type: 'Equipment', tag: 'CDU-PILOT', name: 'Liquid Cooling CDU — Hyderabad Pilot', status: 'Operating', tenantId: NVIDIA_AIFC, projectId: PILOT, props: { description: 'CDU for 2-SU NVL72 pilot; capacity deviation resolved via approved de-rated operation' } }),

  // Resolved precedent 1 — optical transceiver customs delay, resolved by air-freight
  n({ id: 'RISK-P01', type: 'Risk', tag: 'RISK-P01', name: 'QSFP112 transceiver customs delay threatened NVLink cabling milestone', status: 'Mitigated', tenantId: NVIDIA_AIFC, projectId: PILOT, props: { category: 'optical-customs-delay', severity: 'Critical' } }),
  n({ id: 'DEC-P01', type: 'Decision', tag: 'DEC-P01', name: 'Air-freight remaining transceiver batch + pre-terminate fiber cables in parallel', status: 'Signed', tenantId: NVIDIA_AIFC, projectId: PILOT, props: { category: 'optical-customs-delay', outcome: 'Air-freighted 1,200 QSFP112 transceivers from Tokyo; NVLink cabling proceeded in parallel on pre-terminated fiber. Recovered 3 weeks of NVLink commissioning float.', recoveredWeeks: 3, signedBy: 'A. Sharma (AI Factory Project Director)', signedAt: '2025-06-14', docId: 'DOC-LL-PILOT' } }),

  // Resolved precedent 2 — CDU capacity deviation accepted with de-rated operation plan
  n({ id: 'RISK-P02', type: 'Risk', tag: 'RISK-P02', name: 'CDU cooling capacity (128 kW) below 142 kW requirement (voltage-deviation class)', status: 'Mitigated', tenantId: NVIDIA_AIFC, projectId: PILOT, props: { category: 'cdu-capacity-deviation', severity: 'High' } }),
  n({ id: 'DEC-P02', type: 'Decision', tag: 'DEC-P02', name: 'Issue RFI for CDU uprate; accept interim de-rated GPU cluster operation at 90% TDP', status: 'Signed', tenantId: NVIDIA_AIFC, projectId: PILOT, props: { category: 'cdu-capacity-deviation', outcome: 'RFI issued; vendor supplied uprated CDU coil inserts (+18 kW lift) within 6 weeks. Cluster ran at 90% TDP (65 GPUs active of 72) during interim. No milestone impact.', signedBy: 'K. Chen (Infrastructure Engineer)', signedAt: '2025-04-22', docId: 'DOC-LL-PILOT' } }),

  // ── Foreign VERTEX project: same optical-customs pattern — must be walled off. ──
  n({ id: VERTEX_AIF, type: 'Project', tag: 'VERTEX-AIF', name: 'Vertex AI Factory (Vertex Infrastructure Partners)', status: 'In Delivery', tenantId: VERTEX_INFRA, projectId: VERTEX_AIF, props: { year: '2025' } }),
  n({ id: 'RISK-V01', type: 'Risk', tag: 'RISK-V01', name: 'QSFP112 transceiver customs delay (Vertex AI Factory)', status: 'Mitigated', tenantId: VERTEX_INFRA, projectId: VERTEX_AIF, props: { category: 'optical-customs-delay', severity: 'Critical' } }),
  n({ id: 'DEC-V01', type: 'Decision', tag: 'DEC-V01', name: 'Vertex confidential mitigation for transceiver delay', status: 'Signed', tenantId: VERTEX_INFRA, projectId: VERTEX_AIF, props: { category: 'optical-customs-delay', outcome: 'Confidential Vertex mitigation — must never surface to NVIDIA AIFC tenant.', recoveredWeeks: 5, signedBy: 'Vertex PMO' } }),
];

const EDGES: Array<Omit<Edge, 'id'>> = [
  { from: NVIDIA_AIFC, to: PILOT, verb: 'OWNS' },
  { from: NVIDIA_AIFC, to: CURRENT, verb: 'OWNS' },
  { from: VERTEX_INFRA, to: VERTEX_AIF, verb: 'OWNS' },
  { from: PILOT, to: 'EQ-PILOT-CDU', verb: 'CONTAINS' },
  { from: 'RISK-P01', to: 'EQ-PILOT-CDU', verb: 'THREATENS' },
  { from: 'DEC-P01', to: 'RISK-P01', verb: 'MITIGATES' },
  { from: 'DEC-P02', to: 'RISK-P02', verb: 'MITIGATES' },
  { from: 'DEC-V01', to: 'RISK-V01', verb: 'MITIGATES' },
];

/** Platform-global types keep tenantId undefined so they are shared across tenants. */
const GLOBAL_TYPES = new Set<EntityBase['type']>(['Standard', 'AIAgent', 'Organization']);

export function applyPhase3Seed(g: TypedGraph): void {
  for (const node of NODES) g.addNode(node);
  EDGES.forEach((e, i) => g.addEdge({ id: `E3-${String(i + 1).padStart(3, '0')}`, ...e }));

  // Default every still-unscoped node to the primary tenant/project.
  for (const node of g.allNodes()) {
    if (GLOBAL_TYPES.has(node.type)) continue;
    if (node.tenantId == null) node.tenantId = NVIDIA_AIFC;
    if (node.projectId == null) node.projectId = CURRENT;
  }
}
