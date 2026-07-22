/**
 * Phase 2 seed — Supply-Chain (NVIDIA component shipments, vendor geography)
 * and Commissioning (NVIDIA AI Factory subsystem breakdown, L1–L5 test records).
 *
 * Applied on top of the Phase 1 graph.
 * Based on: NVIDIA GB300 NVL72 AI Factory Reference Architecture
 */

import type { EntityBase, Edge } from '@prometheus/ontology';
import type { TypedGraph } from './engine';

function n(partial: Omit<EntityBase, 'verification' | 'owner'> & Partial<Pick<EntityBase, 'verification' | 'owner'>>): EntityBase {
  return { verification: 'SystemVerified', owner: 'PER-SHARMA', ...partial };
}

const NODES: EntityBase[] = [
  // ── Additional Systems ──
  n({ id: 'SYS-STORAGE', type: 'System', tag: 'SYS-STORAGE', name: 'Shared NFS/Lustre Storage Cluster', status: 'In Delivery', props: { throughputGbps: 480 } }),

  // ── Subsystems (AI Factory commissioning breakdown) ──
  n({ id: 'SS-COMPUTE-A', type: 'Subsystem', tag: 'SS-COMPUTE-A', name: 'GPU Compute Cluster — SU-01 to SU-04 (288 GPUs)', status: 'In Delivery', props: {} }),
  n({ id: 'SS-COMPUTE-B', type: 'Subsystem', tag: 'SS-COMPUTE-B', name: 'GPU Compute Cluster — SU-05 to SU-08 (288 GPUs)', status: 'In Delivery', props: {} }),
  n({ id: 'SS-NVLINK', type: 'Subsystem', tag: 'SS-NVLINK', name: 'NVLink 5th-Gen Domain (72-GPU × 8 per-rack domains)', status: 'In Delivery', props: {} }),
  n({ id: 'SS-FABRIC', type: 'Subsystem', tag: 'SS-FABRIC', name: 'Spectrum-X 800G Dual-Plane Compute Fabric', status: 'In Delivery', props: {} }),
  n({ id: 'SS-COOLING-CDU', type: 'Subsystem', tag: 'SS-COOLING-CDU', name: 'Direct Liquid Cooling CDU Array (8 Rack CDUs)', status: 'In Delivery', props: {} }),
  n({ id: 'SS-POWER-PDU', type: 'Subsystem', tag: 'SS-POWER-PDU', name: 'Power Shelf & PDU Distribution (64 × 33kW Shelves)', status: 'In Delivery', props: {} }),
  n({ id: 'SS-OOB-MGMT', type: 'Subsystem', tag: 'SS-OOB-MGMT', name: 'OOB Management Network (16× SN2201 Switches)', status: 'In Delivery', props: {} }),

  // ── Shipments (NVIDIA component supply chain) ──
  // Rack shipments (8 SUs) — long lead time
  n({ id: 'SHP-RACK-SU1', type: 'Shipment', tag: 'SHP-RACK-SU1', name: 'GB300 NVL72 Rack SU-01 Shipment', status: 'In Manufacture', sourceSystem: 'Primavera P6', props: { cargo: 'GB300 NVL72 Rack SU-01 (72 GPUs, 9 NVSwitch Trays, liquid cooling)', eta: 'Est. 29-Aug-2026 — 20-week actual lead', risk: 'Elevated' } }),
  n({ id: 'SHP-RACK-SU2', type: 'Shipment', tag: 'SHP-RACK-SU2', name: 'GB300 NVL72 Rack SU-02 Shipment', status: 'In Manufacture', sourceSystem: 'Primavera P6', props: { cargo: 'GB300 NVL72 Rack SU-02 (72 GPUs)', eta: 'Est. 05-Sep-2026', risk: 'Elevated' } }),
  n({ id: 'SHP-RACK-SU3', type: 'Shipment', tag: 'SHP-RACK-SU3', name: 'GB300 NVL72 Rack SU-03 Shipment', status: 'In Manufacture', sourceSystem: 'Primavera P6', props: { cargo: 'GB300 NVL72 Rack SU-03 (72 GPUs)', eta: 'Est. 12-Sep-2026', risk: 'Nominal' } }),
  n({ id: 'SHP-RACK-SU4', type: 'Shipment', tag: 'SHP-RACK-SU4', name: 'GB300 NVL72 Rack SU-04 Shipment', status: 'In Manufacture', sourceSystem: 'Primavera P6', props: { cargo: 'GB300 NVL72 Rack SU-04 (72 GPUs)', eta: 'Est. 19-Sep-2026', risk: 'Nominal' } }),

  // Fiber optic transceiver batch — held at customs (CRITICAL)
  n({ id: 'SHP-FIBER-001', type: 'Shipment', tag: 'SHP-FIBER-001', name: 'QSFP112/OSFP Transceiver Batch — CUSTOMS HOLD', status: 'Held', sourceSystem: 'Primavera P6', props: { cargo: '3,456 × QSFP112 + 1,152 × OSFP transceivers for Spectrum-X dual-plane fabric', eta: 'Suspended — Pune customs hold, estimated 14-day clearance', risk: 'Critical' } }),

  // CDU shipments (split delivery)
  n({ id: 'SHP-CDU-SU1', type: 'Shipment', tag: 'SHP-CDU-SU1', name: 'Liquid Cooling CDU — SU-01 to SU-04', status: 'In Transit', sourceSystem: 'Primavera P6', props: { cargo: '4× Rack-level CDUs (Precision Cooling Systems AG)', eta: '15-Aug-2026 (on plan)', risk: 'Nominal' } }),
  n({ id: 'SHP-CDU-SU2', type: 'Shipment', tag: 'SHP-CDU-SU2', name: 'Liquid Cooling CDU — SU-05 to SU-08', status: 'In Transit', sourceSystem: 'Primavera P6', props: { cargo: '4× Rack-level CDUs (Precision Cooling Systems AG)', eta: '22-Aug-2026 (on plan)', risk: 'Nominal' } }),

  // PDU power shelves — at risk due to single-source vendor
  n({ id: 'SHP-PDU-001', type: 'Shipment', tag: 'SHP-PDU-001', name: 'Power Shelves Batch 1 — 33× 33kW Shelves', status: 'In Transit', sourceSystem: 'Primavera P6', props: { cargo: '33× 33kW power shelves (Volta Power Systems, Singapore)', eta: '10-Aug-2026 — possible 3-week slip due to Q3 backlog', risk: 'Elevated' } }),
  n({ id: 'SHP-PDU-002', type: 'Shipment', tag: 'SHP-PDU-002', name: 'Power Shelves Batch 2 — 31× 33kW Shelves', status: 'In Manufacture', sourceSystem: 'Primavera P6', props: { cargo: '31× 33kW power shelves (Volta Power Systems, Singapore)', eta: 'Est. 01-Sep-2026 — sole-source risk', risk: 'Elevated' } }),

  // ── Test Records (L1–L5 commissioning) ──
  // GPU Compute
  n({ id: 'TR-COMP-A-L1', type: 'TestRecord', tag: 'TR-COMP-A-L1', name: 'SU-01/04 Factory Acceptance Test (FAT)', status: 'Blocked', props: { level: 'L1', cxStatus: 'Blocked', docId: 'DOC-CX-AIFC', blockId: 'CX-1-2' } }),
  n({ id: 'TR-COMP-B-L1', type: 'TestRecord', tag: 'TR-COMP-B-L1', name: 'SU-05/08 Factory Acceptance Test (FAT)', status: 'At Risk', props: { level: 'L1', cxStatus: 'At Risk', docId: 'DOC-CX-AIFC', blockId: 'CX-1-3' } }),

  // NVLink
  n({ id: 'TR-NVLINK-L2', type: 'TestRecord', tag: 'TR-NVLINK-L2', name: 'NVLink 72-GPU Domain Integrity Test (L2 SAT)', status: 'Blocked', props: { level: 'L2', cxStatus: 'Blocked', docId: 'DOC-CX-AIFC', blockId: 'CX-1-4' } }),

  // Spectrum-X Fabric
  n({ id: 'TR-FABRIC-L2', type: 'TestRecord', tag: 'TR-FABRIC-L2', name: 'Spectrum-X 800G Dual-Plane Fabric Verification (L2 SAT)', status: 'At Risk', props: { level: 'L2', cxStatus: 'At Risk', docId: 'DOC-CX-AIFC', blockId: 'CX-1-5' } }),

  // Cooling
  n({ id: 'TR-COOL-L1', type: 'TestRecord', tag: 'TR-COOL-L1', name: 'CDU Factory Acceptance Test (Hydrostatic + Thermal)', status: 'At Risk', props: { level: 'L1', cxStatus: 'At Risk', docId: 'DOC-CX-AIFC', blockId: 'CX-1-6', note: 'Blocked pending spec deviation resolution (128 kW vs 142 kW)' } }),
  n({ id: 'TR-COOL-L2', type: 'TestRecord', tag: 'TR-COOL-L2', name: 'CDU Site Acceptance — Full-Load Thermal Test', status: 'Not Started', props: { level: 'L2', cxStatus: 'Not Started', docId: 'DOC-CX-AIFC', blockId: 'CX-1-7' } }),

  // Power
  n({ id: 'TR-POWER-L1', type: 'TestRecord', tag: 'TR-POWER-L1', name: 'PSU Shelf FAT — Load Bank Testing', status: 'In Progress', props: { level: 'L1', cxStatus: 'In Progress', docId: 'DOC-CX-AIFC', blockId: 'CX-1-8' } }),
  n({ id: 'TR-POWER-L2', type: 'TestRecord', tag: 'TR-POWER-L2', name: 'Power Distribution Site Acceptance Test', status: 'Not Started', props: { level: 'L2', cxStatus: 'Not Started', docId: 'DOC-CX-AIFC', blockId: 'CX-1-9' } }),

  // OOB Management (progressing green)
  n({ id: 'TR-OOB-L1', type: 'TestRecord', tag: 'TR-OOB-L1', name: 'SN2201 OOB Switch FAT (Redfish API, IPMI)', status: 'Complete', props: { level: 'L1', cxStatus: 'Complete', docId: 'DOC-CX-AIFC', blockId: 'CX-1-10' } }),
  n({ id: 'TR-OOB-L2', type: 'TestRecord', tag: 'TR-OOB-L2', name: 'OOB Network Site Acceptance (BMC connectivity)', status: 'Complete', props: { level: 'L2', cxStatus: 'Complete', docId: 'DOC-CX-AIFC', blockId: 'CX-1-11' } }),
  n({ id: 'TR-OOB-L3', type: 'TestRecord', tag: 'TR-OOB-L3', name: 'OOB Pre-Functional — NVIDIA Mission Control integration', status: 'In Progress', props: { level: 'L3', cxStatus: 'In Progress', docId: 'DOC-CX-AIFC', blockId: 'CX-1-12' } }),

  // Phase 2 Agents
  n({ id: 'AGT-SUPPLY', type: 'AIAgent', tag: 'AGT-SUPPLY', name: 'Supply-Chain Agent', status: 'Active', props: { domain: 'NVIDIA component procurement, logistics & vendor risk' } }),
  n({ id: 'AGT-CX', type: 'AIAgent', tag: 'AGT-CX', name: 'Commissioning Agent', status: 'Active', props: { domain: 'AI Factory L1–L5 commissioning readiness (NVLink, Fabric, GPU burn-in)' } }),
];

const EDGES: Array<Omit<Edge, 'id'>> = [
  { from: 'PRJ-NVL72-AIFC', to: 'SYS-STORAGE', verb: 'CONTAINS' },

  // System → Subsystem
  { from: 'SYS-COMPUTE', to: 'SS-COMPUTE-A', verb: 'CONTAINS' },
  { from: 'SYS-COMPUTE', to: 'SS-COMPUTE-B', verb: 'CONTAINS' },
  { from: 'SYS-COMPUTE', to: 'SS-NVLINK', verb: 'CONTAINS' },
  { from: 'SYS-NETWORK', to: 'SS-FABRIC', verb: 'CONTAINS' },
  { from: 'SYS-COOLING', to: 'SS-COOLING-CDU', verb: 'CONTAINS' },
  { from: 'SYS-POWER', to: 'SS-POWER-PDU', verb: 'CONTAINS' },
  { from: 'SYS-MGMT', to: 'SS-OOB-MGMT', verb: 'CONTAINS' },

  // Subsystem → Equipment
  { from: 'SS-COMPUTE-A', to: 'EQ-NVL72-SU01', verb: 'CONTAINS' },
  { from: 'SS-COMPUTE-A', to: 'EQ-NVL72-SU02', verb: 'CONTAINS' },
  { from: 'SS-COMPUTE-B', to: 'EQ-NVL72-SU03', verb: 'CONTAINS' },
  { from: 'SS-COMPUTE-B', to: 'EQ-NVL72-SU04', verb: 'CONTAINS' },
  { from: 'SS-NVLINK', to: 'EQ-NVSWITCH', verb: 'CONTAINS' },
  { from: 'SS-FABRIC', to: 'EQ-SN5610-LEAF', verb: 'CONTAINS' },
  { from: 'SS-FABRIC', to: 'EQ-SN5600-SPINE', verb: 'CONTAINS' },
  { from: 'SS-FABRIC', to: 'EQ-CX8-MZB', verb: 'CONTAINS' },
  { from: 'SS-COOLING-CDU', to: 'EQ-CDU-RACK', verb: 'CONTAINS' },
  { from: 'SS-POWER-PDU', to: 'EQ-PSU-SHELF', verb: 'CONTAINS' },
  { from: 'SS-OOB-MGMT', to: 'EQ-SN2201-OOB', verb: 'CONTAINS' },

  // Shipments — SHIPPED_UNDER PO, ORIGINATES_FROM vendor, DESTINED_FOR site
  { from: 'SHP-RACK-SU1', to: 'PO-2061', verb: 'SHIPPED_UNDER' },
  { from: 'SHP-RACK-SU1', to: 'VEN-NVIDIA-OEM', verb: 'ORIGINATES_FROM' },
  { from: 'SHP-RACK-SU1', to: 'PRJ-NVL72-AIFC', verb: 'DESTINED_FOR' },
  { from: 'SHP-RACK-SU2', to: 'PO-2061', verb: 'SHIPPED_UNDER' },
  { from: 'SHP-RACK-SU2', to: 'VEN-NVIDIA-OEM', verb: 'ORIGINATES_FROM' },
  { from: 'SHP-RACK-SU2', to: 'PRJ-NVL72-AIFC', verb: 'DESTINED_FOR' },
  { from: 'SHP-RACK-SU3', to: 'PO-2061', verb: 'SHIPPED_UNDER' },
  { from: 'SHP-RACK-SU3', to: 'VEN-NVIDIA-OEM', verb: 'ORIGINATES_FROM' },
  { from: 'SHP-RACK-SU3', to: 'PRJ-NVL72-AIFC', verb: 'DESTINED_FOR' },
  { from: 'SHP-RACK-SU4', to: 'PO-2061', verb: 'SHIPPED_UNDER' },
  { from: 'SHP-RACK-SU4', to: 'VEN-NVIDIA-OEM', verb: 'ORIGINATES_FROM' },
  { from: 'SHP-RACK-SU4', to: 'PRJ-NVL72-AIFC', verb: 'DESTINED_FOR' },

  { from: 'SHP-FIBER-001', to: 'PO-2094', verb: 'SHIPPED_UNDER' },
  { from: 'SHP-FIBER-001', to: 'VEN-FIBER', verb: 'ORIGINATES_FROM' },
  { from: 'SHP-FIBER-001', to: 'PRJ-NVL72-AIFC', verb: 'DESTINED_FOR' },

  { from: 'SHP-CDU-SU1', to: 'PO-2087', verb: 'SHIPPED_UNDER' },
  { from: 'SHP-CDU-SU1', to: 'VEN-COOLANT', verb: 'ORIGINATES_FROM' },
  { from: 'SHP-CDU-SU1', to: 'PRJ-NVL72-AIFC', verb: 'DESTINED_FOR' },
  { from: 'SHP-CDU-SU2', to: 'PO-2087', verb: 'SHIPPED_UNDER' },
  { from: 'SHP-CDU-SU2', to: 'VEN-COOLANT', verb: 'ORIGINATES_FROM' },
  { from: 'SHP-CDU-SU2', to: 'PRJ-NVL72-AIFC', verb: 'DESTINED_FOR' },

  { from: 'SHP-PDU-001', to: 'PO-2098', verb: 'SHIPPED_UNDER' },
  { from: 'SHP-PDU-001', to: 'VEN-PDU', verb: 'ORIGINATES_FROM' },
  { from: 'SHP-PDU-001', to: 'PRJ-NVL72-AIFC', verb: 'DESTINED_FOR' },
  { from: 'SHP-PDU-002', to: 'PO-2098', verb: 'SHIPPED_UNDER' },
  { from: 'SHP-PDU-002', to: 'VEN-PDU', verb: 'ORIGINATES_FROM' },
  { from: 'SHP-PDU-002', to: 'PRJ-NVL72-AIFC', verb: 'DESTINED_FOR' },

  // Test Records VERIFY subsystems
  { from: 'TR-COMP-A-L1', to: 'SS-COMPUTE-A', verb: 'VERIFIES' },
  { from: 'TR-COMP-B-L1', to: 'SS-COMPUTE-B', verb: 'VERIFIES' },
  { from: 'TR-NVLINK-L2', to: 'SS-NVLINK', verb: 'VERIFIES' },
  { from: 'TR-FABRIC-L2', to: 'SS-FABRIC', verb: 'VERIFIES' },
  { from: 'TR-COOL-L1', to: 'SS-COOLING-CDU', verb: 'VERIFIES' },
  { from: 'TR-COOL-L2', to: 'SS-COOLING-CDU', verb: 'VERIFIES' },
  { from: 'TR-POWER-L1', to: 'SS-POWER-PDU', verb: 'VERIFIES' },
  { from: 'TR-POWER-L2', to: 'SS-POWER-PDU', verb: 'VERIFIES' },
  { from: 'TR-OOB-L1', to: 'SS-OOB-MGMT', verb: 'VERIFIES' },
  { from: 'TR-OOB-L2', to: 'SS-OOB-MGMT', verb: 'VERIFIES' },
  { from: 'TR-OOB-L3', to: 'SS-OOB-MGMT', verb: 'VERIFIES' },
];

export function applyPhase2Seed(g: TypedGraph): void {
  // Site geography for the Supply-Chain map (Pune AI Factory)
  const site = g.getNode('PRJ-NVL72-AIFC');
  if (site) {
    site.props = { ...site.props, city: 'Pune', country: 'India', lat: 18.52, lon: 73.85 };
  }
  for (const node of NODES) g.addNode(node);
  EDGES.forEach((e, i) => g.addEdge({ id: `E2-${String(i + 1).padStart(3, '0')}`, ...e }));
}
