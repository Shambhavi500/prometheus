/**
 * Seed graph — Project Meghdoot NM-1.
 *
 * Output of the Ingestion & Perception layer after entity resolution:
 * typed entities mapped from Octave / P6 / mail artifacts into the governed
 * ontology (anti-corruption at the edge — no external ids leak as keys).
 */

import type { EntityBase, Edge } from '@prometheus/ontology';
import { TypedGraph } from './engine';
import { applyPhase2Seed } from './seed-phase2';
import { applyPhase3Seed } from './seed-phase3';

function n(partial: Omit<EntityBase, 'verification' | 'owner'> & Partial<Pick<EntityBase, 'verification' | 'owner'>>): EntityBase {
  return { verification: 'SystemVerified', owner: 'PER-MASON', ...partial };
}

const NODES: EntityBase[] = [
  n({ id: 'PRJ-AQUILA', type: 'Project', tag: 'AQUILA-DH1', name: 'Project Meghdoot — Data Hall 1', status: 'Execution', sourceSystem: 'Octave', props: { region: 'EMEA', phase: 'Build' } }),
  n({ id: 'SYS-01', type: 'System', tag: 'SYS-01', name: 'MV/LV Power Distribution', status: 'In Delivery', props: {} }),
  n({ id: 'SYS-02', type: 'System', tag: 'SYS-02', name: 'Cooling Distribution', status: 'In Delivery', props: {} }),

  n({ id: 'EQ-TX01', type: 'Equipment', tag: 'TX-01', name: 'Unit Substation Transformer 1', status: 'On Order', sourceSystem: 'Octave', props: { rating: '2,500 kVA', criticality: 'Critical Path' } }),
  n({ id: 'EQ-TX02', type: 'Equipment', tag: 'TX-02', name: 'Unit Substation Transformer 2', status: 'On Order', sourceSystem: 'Octave', props: { rating: '2,500 kVA' } }),
  n({ id: 'EQ-SWG01', type: 'Equipment', tag: 'SWG-01', name: 'LV Switchgear Lineup 1', status: 'Submittal Review', sourceSystem: 'Octave', props: { rating: '4,000 A' } }),
  n({ id: 'EQ-CDU01', type: 'Equipment', tag: 'CDU-01', name: 'Cooling Distribution Unit 1', status: 'Submittal Review', sourceSystem: 'Octave', props: { duty: '1,200 kW' } }),

  n({ id: 'SPEC-ELEC-01', type: 'Specification', tag: 'SPEC-ELEC-01', name: 'Electrical Specification — MV/LV Power Distribution', status: 'Rev C', props: { docId: 'DOC-SPEC-ELEC-01' } }),
  n({ id: 'SPEC-MECH-02', type: 'Specification', tag: 'SPEC-MECH-02', name: 'Mechanical Specification — Cooling Distribution', status: 'Rev B', props: { docId: 'DOC-SPEC-MECH-02' } }),
  n({ id: 'STD-TIA942', type: 'Standard', tag: 'TIA-942-C', name: 'TIA-942-C Telecommunications Infrastructure Standard', props: { docId: 'DOC-STD-TIA942' } }),
  n({ id: 'STD-IEEEC57', type: 'Standard', tag: 'IEEE C57.12.00', name: 'IEEE C57.12.00 — Transformer Rating Requirements', props: {} }),

  // Requirements — typed, deterministic parameters live in props.
  n({ id: 'REQ-CDU-041', type: 'Requirement', tag: 'REQ-CDU-041', name: 'CDU electrical supply: 480 V / 3-phase / 60 Hz', status: 'Approved', props: { parameter: 'Supply voltage', operator: '=', value: 480, unit: 'V', secondary: '60 Hz, 3-phase', docId: 'DOC-SPEC-MECH-02', blockId: 'SM2-1-4', page: 1, clause: '4.1.2' } }),
  n({ id: 'REQ-CDU-044', type: 'Requirement', tag: 'REQ-CDU-044', name: 'CDU operating weight stated for structural coordination', status: 'Approved', props: { parameter: 'Operating weight (flooded)', operator: '=', value: 'stated', docId: 'DOC-SPEC-MECH-02', blockId: 'SM2-2-1', page: 2, clause: '4.3.1' } }),
  n({ id: 'REQ-TX-032', type: 'Requirement', tag: 'REQ-TX-032', name: 'Transformer secondary voltage: 480Y/277 V', status: 'Approved', props: { parameter: 'Secondary voltage', operator: '=', value: 480, unit: 'V', docId: 'DOC-SPEC-ELEC-01', blockId: 'SE1-1-2', page: 1, clause: '3.2.1' } }),
  n({ id: 'REQ-SWG-021', type: 'Requirement', tag: 'REQ-SWG-021', name: 'Switchgear short-circuit withstand ≥ 65 kA', status: 'Approved', props: { parameter: 'Short-circuit withstand', operator: '>=', value: 65, unit: 'kA', docId: 'DOC-SPEC-ELEC-01', blockId: 'SE1-2-2', page: 2, clause: '5.1.4' } }),

  // Submittals
  n({ id: 'SUB-CDU01-R1', type: 'Submittal', tag: 'SUB-CDU01-R1', name: 'CDU-01 Vendor Submittal Rev 1', status: 'Under Review', sourceSystem: 'Octave', props: { docId: 'DOC-SUB-CDU01-R1', vendor: 'Helios Thermal Systems' } }),
  n({ id: 'SUB-TX01-R2', type: 'Submittal', tag: 'SUB-TX01-R2', name: 'TX-01 Transformer Submittal Rev 2', status: 'Under Review', sourceSystem: 'Octave', props: { docId: 'DOC-SUB-TX01-R2', vendor: 'Kappa Transformer Works' } }),
  n({ id: 'SUB-SWG01-R1', type: 'Submittal', tag: 'SUB-SWG01-R1', name: 'SWG-01 Switchgear Submittal Rev 1', status: 'Under Review', sourceSystem: 'Octave', props: { docId: 'DOC-SUB-SWG01-R1', vendor: 'Meridian Switchgear' } }),

  // Procurement
  n({ id: 'VEN-KAPPA', type: 'Vendor', tag: 'VEN-KAPPA', name: 'Kappa Transformer Works', status: 'Active', props: { region: 'EMEA', onTimeRate12mo: 0.61, city: 'Istanbul', country: 'Türkiye', lat: 41.0, lon: 29.0, riskDocId: 'DOC-VPR' } }),
  n({ id: 'VEN-HELIOS', type: 'Vendor', tag: 'VEN-HELIOS', name: 'Helios Thermal Systems', status: 'Active', props: { region: 'EU', onTimeRate12mo: 0.88, city: 'Frankfurt', country: 'Germany', lat: 50.1, lon: 8.7, riskDocId: 'DOC-VPR' } }),
  n({ id: 'VEN-MERIDIAN', type: 'Vendor', tag: 'VEN-MERIDIAN', name: 'Meridian Switchgear', status: 'Force Majeure', props: { region: 'EMEA', onTimeRate12mo: 0.74, city: 'Milan', country: 'Italy', lat: 45.5, lon: 9.2, riskDocId: 'DOC-VB-MERIDIAN' } }),
  n({ id: 'PO-884', type: 'PurchaseOrder', tag: 'PO-884', name: 'PO-884 — TX-01 / TX-02 Unit Substation Transformers', status: 'Awarded', sourceSystem: 'Octave', props: { awarded: '06-Mar-2026', quoteDocId: 'DOC-VQ-884' } }),
  n({ id: 'PO-992', type: 'PurchaseOrder', tag: 'PO-992', name: 'PO-992 — SWG-01 LV Switchgear', status: 'Awarded', sourceSystem: 'Octave', props: { awarded: '20-Apr-2026' } }),

  // Schedule activities (typed fields for deterministic date math)
  n({ id: 'ACT-A100', type: 'ScheduleActivity', tag: 'A100', name: 'Award TX-01 Purchase Order', status: 'Complete', sourceSystem: 'Primavera P6', props: { activityId: 'A100', baselineStart: '2026-02-16', baselineFinish: '2026-03-06', freeFloatWeeks: 0 } }),
  n({ id: 'ACT-A102', type: 'ScheduleActivity', tag: 'A102', name: 'TX-01 Manufacture & Delivery', status: 'In Progress', sourceSystem: 'Primavera P6', props: { activityId: 'A102', baselineStart: '2026-03-09', baselineFinish: '2027-11-29', assumedLeadTimeWeeks: 90, freeFloatWeeks: 0 } }),
  n({ id: 'ACT-A140', type: 'ScheduleActivity', tag: 'A140', name: 'NM-1 Energization', status: 'Not Started', sourceSystem: 'Primavera P6', props: { activityId: 'A140', baselineStart: '2027-12-06', baselineFinish: '2028-01-14', freeFloatWeeks: 12 } }),
  n({ id: 'ACT-A200', type: 'ScheduleActivity', tag: 'A200', name: 'L4 Functional Testing', status: 'Not Started', sourceSystem: 'Primavera P6', props: { activityId: 'A200', baselineStart: '2028-01-17', baselineFinish: '2028-03-10', freeFloatWeeks: 18, level: 'L4' } }),
  n({ id: 'ACT-A210', type: 'ScheduleActivity', tag: 'A210', name: 'L5 Integrated Systems Testing', status: 'Not Started', sourceSystem: 'Primavera P6', props: { activityId: 'A210', baselineStart: '2028-03-13', baselineFinish: '2028-05-05', freeFloatWeeks: 0, level: 'L5' } }),

  // People & agents
  n({ id: 'PER-MASON', type: 'Person', tag: 'J.MASON', name: 'J. Mason', status: 'Active', props: { role: 'Project Director' } }),
  n({ id: 'PER-RIVERA', type: 'Person', tag: 'A.RIVERA', name: 'A. Rivera', status: 'Active', props: { role: 'Discipline Engineer' } }),
  n({ id: 'AGT-SPEC', type: 'AIAgent', tag: 'AGT-SPEC', name: 'Spec-Compliance Agent', status: 'Active', props: { domain: 'Specification compliance' } }),
  n({ id: 'AGT-SCHED', type: 'AIAgent', tag: 'AGT-SCHED', name: 'Schedule-Risk Agent', status: 'Active', props: { domain: 'Schedule & lead-time risk' } }),
];

const EDGES: Array<Omit<Edge, 'id'>> = [
  { from: 'PRJ-AQUILA', to: 'SYS-01', verb: 'CONTAINS' },
  { from: 'PRJ-AQUILA', to: 'SYS-02', verb: 'CONTAINS' },
  { from: 'SYS-01', to: 'EQ-TX01', verb: 'CONTAINS' },
  { from: 'SYS-01', to: 'EQ-TX02', verb: 'CONTAINS' },
  { from: 'SYS-01', to: 'EQ-SWG01', verb: 'CONTAINS' },
  { from: 'SYS-02', to: 'EQ-CDU01', verb: 'CONTAINS' },

  { from: 'SPEC-MECH-02', to: 'REQ-CDU-041', verb: 'SPECIFIES' },
  { from: 'SPEC-MECH-02', to: 'REQ-CDU-044', verb: 'SPECIFIES' },
  { from: 'SPEC-ELEC-01', to: 'REQ-TX-032', verb: 'SPECIFIES' },
  { from: 'SPEC-ELEC-01', to: 'REQ-SWG-021', verb: 'SPECIFIES' },
  { from: 'REQ-CDU-041', to: 'EQ-CDU01', verb: 'APPLIES_TO' },
  { from: 'REQ-CDU-044', to: 'EQ-CDU01', verb: 'APPLIES_TO' },
  { from: 'REQ-TX-032', to: 'EQ-TX01', verb: 'APPLIES_TO' },
  { from: 'REQ-SWG-021', to: 'EQ-SWG01', verb: 'APPLIES_TO' },
  { from: 'REQ-TX-032', to: 'STD-IEEEC57', verb: 'GOVERNED_BY' },
  { from: 'REQ-SWG-021', to: 'STD-TIA942', verb: 'GOVERNED_BY' },

  { from: 'SUB-CDU01-R1', to: 'EQ-CDU01', verb: 'SUBMITTED_FOR' },
  { from: 'SUB-TX01-R2', to: 'EQ-TX01', verb: 'SUBMITTED_FOR' },
  { from: 'SUB-SWG01-R1', to: 'EQ-SWG01', verb: 'SUBMITTED_FOR' },

  { from: 'EQ-TX01', to: 'PO-884', verb: 'SUPPLIED_UNDER' },
  { from: 'EQ-TX02', to: 'PO-884', verb: 'SUPPLIED_UNDER' },
  { from: 'EQ-SWG01', to: 'PO-992', verb: 'SUPPLIED_UNDER' },
  { from: 'PO-884', to: 'VEN-KAPPA', verb: 'ISSUED_TO' },
  { from: 'PO-992', to: 'VEN-MERIDIAN', verb: 'ISSUED_TO' },

  { from: 'EQ-TX01', to: 'ACT-A102', verb: 'ALLOCATED_TO' },
  { from: 'ACT-A102', to: 'ACT-A100', verb: 'DEPENDS_ON' },
  { from: 'ACT-A140', to: 'ACT-A102', verb: 'DEPENDS_ON' },
  { from: 'ACT-A200', to: 'ACT-A140', verb: 'DEPENDS_ON' },
  { from: 'ACT-A210', to: 'ACT-A200', verb: 'DEPENDS_ON' },

  { from: 'PER-MASON', to: 'PRJ-AQUILA', verb: 'OWNS' },
  { from: 'PER-RIVERA', to: 'SPEC-MECH-02', verb: 'OWNS' },
];

export function buildSeedGraph(): TypedGraph {
  const g = new TypedGraph();
  for (const node of NODES) g.addNode(node);
  EDGES.forEach((e, i) => g.addEdge({ id: `E-${String(i + 1).padStart(3, '0')}`, ...e }));
  applyPhase2Seed(g);
  applyPhase3Seed(g);
  return g;
}
