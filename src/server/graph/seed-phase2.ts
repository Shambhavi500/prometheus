/**
 * Phase 2 seed — Supply-Chain (shipments, vendor geography) and
 * Commissioning (subsystem breakdown, L1–L5 test records).
 *
 * Applied on top of the Phase 1 graph. Keeps Phase 1 seed focused while
 * honoring the governed ontology (Shipment, Subsystem, TestRecord are typed
 * entities per 01_PRD Domain Model, 10_KNOWLEDGE_GRAPH §4).
 */

import type { EntityBase, Edge } from '@prometheus/ontology';
import type { TypedGraph } from './engine';

function n(partial: Omit<EntityBase, 'verification' | 'owner'> & Partial<Pick<EntityBase, 'verification' | 'owner'>>): EntityBase {
  return { verification: 'SystemVerified', owner: 'PER-MASON', ...partial };
}

const NODES: EntityBase[] = [
  // Controls system, for a commissioning readiness contrast (progressing green).
  n({ id: 'SYS-03', type: 'System', tag: 'SYS-03', name: 'Controls & BMS', status: 'In Delivery', props: {} }),

  // Subsystems (commissioning breakdown structure).
  n({ id: 'SS-01A', type: 'Subsystem', tag: 'SS-01A', name: 'MV Distribution', status: 'In Delivery', props: {} }),
  n({ id: 'SS-01B', type: 'Subsystem', tag: 'SS-01B', name: 'LV Distribution', status: 'In Delivery', props: {} }),
  n({ id: 'SS-02A', type: 'Subsystem', tag: 'SS-02A', name: 'Chilled Water', status: 'In Delivery', props: {} }),
  n({ id: 'SS-03A', type: 'Subsystem', tag: 'SS-03A', name: 'BMS Head-End', status: 'In Delivery', props: {} }),

  // Shipments (procurement chain).
  n({ id: 'SHP-884-1', type: 'Shipment', tag: 'SHP-884-1', name: 'TX-01 Transformer Shipment', status: 'In Manufacture', sourceSystem: 'Octave', props: { cargo: 'TX-01 · 2,500 kVA transformer', eta: 'Not scheduled — 128-week lead', risk: 'Elevated' } }),
  n({ id: 'SHP-992-1', type: 'Shipment', tag: 'SHP-992-1', name: 'SWG-01 Switchgear Section A', status: 'Held', sourceSystem: 'Octave', props: { cargo: 'SWG-01 · LV switchgear section A', eta: 'Suspended — labor action', risk: 'Critical' } }),
  n({ id: 'SHP-992-2', type: 'Shipment', tag: 'SHP-992-2', name: 'SWG-01 Switchgear Section B', status: 'Held', sourceSystem: 'Octave', props: { cargo: 'SWG-01 · LV switchgear section B', eta: 'Suspended — labor action', risk: 'Critical' } }),
  n({ id: 'SHP-992-3', type: 'Shipment', tag: 'SHP-992-3', name: 'SWG-01 Protection Relays', status: 'Held', sourceSystem: 'Octave', props: { cargo: 'SWG-01 · protection relay panels', eta: 'Suspended — labor action', risk: 'Critical' } }),
  n({ id: 'SHP-CDU-1', type: 'Shipment', tag: 'SHP-CDU-1', name: 'CDU-01 Cooling Unit Shipment', status: 'In Transit', sourceSystem: 'Octave', props: { cargo: 'CDU-01 · cooling distribution unit', eta: '02-Sep-2026 (on plan)', risk: 'Nominal' } }),

  // Test records (L1–L5 commissioning evidence).
  n({ id: 'TR-01A-L1', type: 'TestRecord', tag: 'TR-01A-L1', name: 'MV Distribution FAT', status: 'Blocked', props: { level: 'L1', cxStatus: 'Blocked', docId: 'DOC-CX-MATRIX', blockId: 'CX-1-2' } }),
  n({ id: 'TR-01B-L1', type: 'TestRecord', tag: 'TR-01B-L1', name: 'LV Distribution FAT', status: 'At Risk', props: { level: 'L1', cxStatus: 'At Risk', docId: 'DOC-CX-MATRIX', blockId: 'CX-1-3' } }),
  n({ id: 'TR-02A-L1', type: 'TestRecord', tag: 'TR-02A-L1', name: 'Chilled Water FAT', status: 'At Risk', props: { level: 'L1', cxStatus: 'At Risk', docId: 'DOC-CX-MATRIX', blockId: 'CX-1-4' } }),
  n({ id: 'TR-03A-L1', type: 'TestRecord', tag: 'TR-03A-L1', name: 'BMS Head-End FAT', status: 'Complete', props: { level: 'L1', cxStatus: 'Complete', docId: 'DOC-CX-MATRIX', blockId: 'CX-1-5' } }),
  n({ id: 'TR-03A-L2', type: 'TestRecord', tag: 'TR-03A-L2', name: 'BMS Site Acceptance', status: 'Complete', props: { level: 'L2', cxStatus: 'Complete', docId: 'DOC-CX-MATRIX', blockId: 'CX-1-5' } }),
  n({ id: 'TR-03A-L3', type: 'TestRecord', tag: 'TR-03A-L3', name: 'BMS Pre-Functional', status: 'In Progress', props: { level: 'L3', cxStatus: 'In Progress', docId: 'DOC-CX-MATRIX', blockId: 'CX-1-5' } }),

  // Phase 2 agents.
  n({ id: 'AGT-SUPPLY', type: 'AIAgent', tag: 'AGT-SUPPLY', name: 'Supply-Chain Agent', status: 'Active', props: { domain: 'Procurement, logistics & vendor risk' } }),
  n({ id: 'AGT-CX', type: 'AIAgent', tag: 'AGT-CX', name: 'Commissioning Agent', status: 'Active', props: { domain: 'L1–L5 commissioning readiness' } }),
];

const EDGES: Array<Omit<Edge, 'id'>> = [
  { from: 'PRJ-AQUILA', to: 'SYS-03', verb: 'CONTAINS' },
  // System → Subsystem → Equipment.
  { from: 'SYS-01', to: 'SS-01A', verb: 'CONTAINS' },
  { from: 'SYS-01', to: 'SS-01B', verb: 'CONTAINS' },
  { from: 'SYS-02', to: 'SS-02A', verb: 'CONTAINS' },
  { from: 'SYS-03', to: 'SS-03A', verb: 'CONTAINS' },
  { from: 'SS-01A', to: 'EQ-TX01', verb: 'CONTAINS' },
  { from: 'SS-01A', to: 'EQ-TX02', verb: 'CONTAINS' },
  { from: 'SS-01B', to: 'EQ-SWG01', verb: 'CONTAINS' },
  { from: 'SS-02A', to: 'EQ-CDU01', verb: 'CONTAINS' },

  // Shipments: SHIPPED_UNDER PO, ORIGINATES_FROM vendor, DESTINED_FOR site.
  { from: 'SHP-884-1', to: 'PO-884', verb: 'SHIPPED_UNDER' },
  { from: 'SHP-884-1', to: 'VEN-KAPPA', verb: 'ORIGINATES_FROM' },
  { from: 'SHP-884-1', to: 'PRJ-AQUILA', verb: 'DESTINED_FOR' },
  { from: 'SHP-992-1', to: 'PO-992', verb: 'SHIPPED_UNDER' },
  { from: 'SHP-992-1', to: 'VEN-MERIDIAN', verb: 'ORIGINATES_FROM' },
  { from: 'SHP-992-1', to: 'PRJ-AQUILA', verb: 'DESTINED_FOR' },
  { from: 'SHP-992-2', to: 'PO-992', verb: 'SHIPPED_UNDER' },
  { from: 'SHP-992-2', to: 'VEN-MERIDIAN', verb: 'ORIGINATES_FROM' },
  { from: 'SHP-992-2', to: 'PRJ-AQUILA', verb: 'DESTINED_FOR' },
  { from: 'SHP-992-3', to: 'PO-992', verb: 'SHIPPED_UNDER' },
  { from: 'SHP-992-3', to: 'VEN-MERIDIAN', verb: 'ORIGINATES_FROM' },
  { from: 'SHP-992-3', to: 'PRJ-AQUILA', verb: 'DESTINED_FOR' },
  { from: 'SHP-CDU-1', to: 'PO-992', verb: 'SHIPPED_UNDER' },
  { from: 'SHP-CDU-1', to: 'VEN-HELIOS', verb: 'ORIGINATES_FROM' },
  { from: 'SHP-CDU-1', to: 'PRJ-AQUILA', verb: 'DESTINED_FOR' },

  // Test records VERIFY subsystems.
  { from: 'TR-01A-L1', to: 'SS-01A', verb: 'VERIFIES' },
  { from: 'TR-01B-L1', to: 'SS-01B', verb: 'VERIFIES' },
  { from: 'TR-02A-L1', to: 'SS-02A', verb: 'VERIFIES' },
  { from: 'TR-03A-L1', to: 'SS-03A', verb: 'VERIFIES' },
  { from: 'TR-03A-L2', to: 'SS-03A', verb: 'VERIFIES' },
  { from: 'TR-03A-L3', to: 'SS-03A', verb: 'VERIFIES' },
];

export function applyPhase2Seed(g: TypedGraph): void {
  // Site geography for the Supply-Chain map (Ashburn, Virginia).
  const site = g.getNode('PRJ-AQUILA');
  if (site) {
    site.props = { ...site.props, city: 'Ashburn, VA', country: 'United States', lat: 39.04, lon: -77.49 };
  }
  for (const node of NODES) g.addNode(node);
  EDGES.forEach((e, i) => g.addEdge({ id: `E2-${String(i + 1).padStart(3, '0')}`, ...e }));
}
