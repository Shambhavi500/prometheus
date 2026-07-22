/**
 * Seed graph — NVIDIA AI Factory NVL72-AIFC-001 (Pune Cluster).
 *
 * Output of the Ingestion & Perception layer after entity resolution:
 * typed entities mapped from P6 / vendor documents / commissioning matrix
 * into the governed ontology.
 *
 * Based on: NVIDIA GB300 NVL72 AI Factory Reference Architecture
 * ET AI Hackathon 2026 — Problem Statement 4
 */

import type { EntityBase, Edge } from '@prometheus/ontology';
import { TypedGraph } from './engine';
import { applyPhase2Seed } from './seed-phase2';
import { applyPhase3Seed } from './seed-phase3';

function n(partial: Omit<EntityBase, 'verification' | 'owner'> & Partial<Pick<EntityBase, 'verification' | 'owner'>>): EntityBase {
  return { verification: 'SystemVerified', owner: 'PER-SHARMA', ...partial };
}

const NODES: EntityBase[] = [
  // ── Project ──
  n({ id: 'PRJ-NVL72-AIFC', type: 'Project', tag: 'NVL72-AIFC-001', name: 'NVIDIA AI Factory — Pune Cluster (NVL72-AIFC-001)', status: 'Execution', sourceSystem: 'Primavera P6', props: { region: 'APAC', phase: 'Construction & Commissioning', type: 'NVIDIA AI Factory (576 GPU / 8 SU)' } }),

  // ── Systems ──
  n({ id: 'SYS-COMPUTE', type: 'System', tag: 'SYS-COMPUTE', name: 'GB300 NVL72 Compute Cluster (8 SUs / 576 GPUs)', status: 'In Delivery', props: { gpuCount: 576, suCount: 8 } }),
  n({ id: 'SYS-NETWORK', type: 'System', tag: 'SYS-NETWORK', name: 'Spectrum-X 800G Ethernet Fabric (Dual-Plane)', status: 'In Delivery', props: { technology: 'Spectrum-X', planes: 2 } }),
  n({ id: 'SYS-POWER', type: 'System', tag: 'SYS-POWER', name: 'Power Distribution System (142 kW/rack × 8)', status: 'In Delivery', props: { totalCapacityKw: 1136, redundancy: 'N+1 per shelf' } }),
  n({ id: 'SYS-COOLING', type: 'System', tag: 'SYS-COOLING', name: 'Direct Liquid Cooling Distribution System (8 CDUs)', status: 'In Delivery', props: { cduCount: 8, capacityPerCduKw: 142 } }),
  n({ id: 'SYS-MGMT', type: 'System', tag: 'SYS-MGMT', name: 'Out-of-Band Management Network (SN2201 OOB Switches)', status: 'In Delivery', props: { switchCount: 16 } }),

  // ── Compute Equipment ──
  n({ id: 'EQ-NVL72-SU01', type: 'Equipment', tag: 'SU-01', name: 'GB300 NVL72 Rack — Scalable Unit 01', status: 'In Manufacture', sourceSystem: 'Primavera P6', props: { gpuCount: 72, trays: 18, powerKw: 142, coolingType: 'Direct Liquid Cooling', criticality: 'Critical Path' } }),
  n({ id: 'EQ-NVL72-SU02', type: 'Equipment', tag: 'SU-02', name: 'GB300 NVL72 Rack — Scalable Unit 02', status: 'In Manufacture', sourceSystem: 'Primavera P6', props: { gpuCount: 72, trays: 18, powerKw: 142, coolingType: 'Direct Liquid Cooling' } }),
  n({ id: 'EQ-NVL72-SU03', type: 'Equipment', tag: 'SU-03', name: 'GB300 NVL72 Rack — Scalable Unit 03', status: 'In Manufacture', sourceSystem: 'Primavera P6', props: { gpuCount: 72, trays: 18, powerKw: 142, coolingType: 'Direct Liquid Cooling' } }),
  n({ id: 'EQ-NVL72-SU04', type: 'Equipment', tag: 'SU-04', name: 'GB300 NVL72 Rack — Scalable Unit 04', status: 'In Manufacture', sourceSystem: 'Primavera P6', props: { gpuCount: 72, trays: 18, powerKw: 142, coolingType: 'Direct Liquid Cooling' } }),
  n({ id: 'EQ-NVSWITCH', type: 'Equipment', tag: 'NVSWITCH-TRAY', name: 'NVLink 5th-Gen Switch Trays (9/rack × 8 racks)', status: 'On Order', sourceSystem: 'Primavera P6', props: { traysTotal: 72, nvSwitchAsics: 144, nvLinkBandwidthTbps: 130, description: '9 NVLink switch trays per NVL72 rack; 2 NVSwitch ASICs each' } }),
  n({ id: 'EQ-CX8-MZB', type: 'Equipment', tag: 'CX8-MZB', name: 'ConnectX-8 Mezzanine Network Boards', status: 'On Order', sourceSystem: 'Primavera P6', props: { boardsTotal: 288, nicsTotal: 576, bandwidthPerNicGbps: 800, description: '2 boards × 2 ConnectX-8 ASICs per tray = 4 SuperNICs per tray' } }),
  n({ id: 'EQ-BF3-DPU', type: 'Equipment', tag: 'BF3-DPU', name: 'BlueField-3 B3240 DPUs (1/tray × 144 trays)', status: 'On Order', sourceSystem: 'Primavera P6', props: { dpuCount: 144, model: 'BlueField-3 B3240', aggregateBandwidthGbps: 480, ports: 2, portSpeedGbps: 400, description: 'North/South fabric; ECPF/DPU mode; Redfish BMC integration' } }),

  // ── Network Equipment ──
  n({ id: 'EQ-SN5610-LEAF', type: 'Equipment', tag: 'SN5610-LEAF', name: 'NVIDIA SN5610 Leaf Switches (Compute E/W)', status: 'On Order', sourceSystem: 'Primavera P6', props: { switchCount: 32, ports: 64, portSpeedGbps: 800, role: 'GPU Compute Leaf', planes: 2, description: 'Rail-optimized; 4 leaf switches per plane × 2 planes × 4 GPU rail positions' } }),
  n({ id: 'EQ-SN5600-SPINE', type: 'Equipment', tag: 'SN5600-SPINE', name: 'NVIDIA SN5600 Spine Switches (Compute + Converged)', status: 'On Order', sourceSystem: 'Primavera P6', props: { switchCount: 16, ports: 128, portSpeedGbps: 400, role: 'Compute Spine / Converged Spine', description: 'NVIDIA SN5600 128-port 400 Gb/s switches for both compute and converged fabrics' } }),
  n({ id: 'EQ-SN2201-OOB', type: 'Equipment', tag: 'SN2201-OOB', name: 'NVIDIA SN2201 OOB Management Switches (16 total)', status: 'In Transit', sourceSystem: 'Primavera P6', props: { switchCount: 16, ports1g: 48, ports100g: 4, role: 'Out-of-Band Management', description: '2 SN2201 switches per SU; 16 total for 8-SU cluster' } }),
  n({ id: 'EQ-CDU-RACK', type: 'Equipment', tag: 'CDU-RACK', name: 'Rack-Level Liquid Cooling CDUs (8 total)', status: 'Submittal Review', sourceSystem: 'Primavera P6', props: { cduCount: 8, requiredCapacityKw: 142, submittedCapacityKw: 128, vendor: 'Precision Cooling Systems AG', description: 'Direct liquid cooling per NVL72 rack; CDU submittal under review — SPEC DEVIATION DETECTED' } }),
  n({ id: 'EQ-PSU-SHELF', type: 'Equipment', tag: 'PSU-SHELF', name: '33 kW Power Shelves (8/rack × 8 racks = 64 total)', status: 'On Order', sourceSystem: 'Primavera P6', props: { shelfCount: 64, ratingPerShelfKw: 33, psusPerShelf: 6, ratingPerPsuKw: 5.5, vendor: 'Volta Power Systems', singleSource: true, description: '8 power shelves per NVL72 rack; 6 × 5.5 kW hot-swap PSUs per shelf; N+1 per shelf' } }),

  // ── Specifications ──
  n({ id: 'SPEC-NVRA-001', type: 'Specification', tag: 'SPEC-NVRA-001', name: 'NVIDIA GB300 NVL72 AI Factory Reference Architecture', status: 'Rev 1.0', props: { docId: 'DOC-NVRA-001', url: 'https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/' } }),
  n({ id: 'SPEC-COOL-001', type: 'Specification', tag: 'SPEC-COOL-001', name: 'AI Factory Liquid Cooling System Specification', status: 'Rev B', props: { docId: 'DOC-SPEC-COOL' } }),
  n({ id: 'SPEC-PWR-001', type: 'Specification', tag: 'SPEC-PWR-001', name: 'AI Factory Power Infrastructure Specification', status: 'Rev B', props: { docId: 'DOC-SPEC-PWR' } }),
  n({ id: 'SPEC-NET-001', type: 'Specification', tag: 'SPEC-NET-001', name: 'Spectrum-X 800G Dual-Plane Network Specification', status: 'Rev A', props: { docId: 'DOC-SPEC-NET' } }),
  n({ id: 'SPEC-NVLINK-001', type: 'Specification', tag: 'SPEC-NVLINK-001', name: 'NVLink 5th-Gen Domain Specification', status: 'Rev A', props: { docId: 'DOC-SPEC-NVLINK' } }),

  // ── Requirements ──
  n({ id: 'REQ-COOL-001', type: 'Requirement', tag: 'REQ-COOL-001', name: 'CDU thermal capacity ≥ 142 kW per rack', status: 'Approved', props: { parameter: 'CDU thermal capacity', operator: '>=', value: 142, unit: 'kW', docId: 'DOC-SPEC-COOL', blockId: 'SC-1-4', page: 1, clause: '4.1.1' } }),
  n({ id: 'REQ-COOL-002', type: 'Requirement', tag: 'REQ-COOL-002', name: 'CDU inrush current must be stated in vendor submittal', status: 'Approved', props: { parameter: 'Inrush current (peak, 200ms)', operator: '=', value: 'stated', docId: 'DOC-SPEC-COOL', blockId: 'SC-2-1', page: 2, clause: '4.3.2' } }),
  n({ id: 'REQ-NET-001', type: 'Requirement', tag: 'REQ-NET-001', name: 'ConnectX-8 compute bandwidth ≥ 800 Gb/s per GPU', status: 'Approved', props: { parameter: 'Compute NIC bandwidth', operator: '>=', value: 800, unit: 'Gb/s', secondary: '16 × 400G links in dual-plane breakout', docId: 'DOC-SPEC-NET', blockId: 'SN-1-2', page: 1, clause: '5.1.2' } }),
  n({ id: 'REQ-NVLINK-001', type: 'Requirement', tag: 'REQ-NVLINK-001', name: 'Each GPU connected to 18 NVSwitch ASICs via NVLink 5th-gen', status: 'Approved', props: { parameter: 'NVLink ports per GPU', operator: '=', value: 18, unit: 'links', docId: 'DOC-SPEC-NVLINK', blockId: 'SNL-1-2', page: 1, clause: '6.2.1' } }),

  // ── Submittals ──
  n({ id: 'SUB-CDU-R1', type: 'Submittal', tag: 'SUB-CDU-R1', name: 'Liquid Cooling CDU Vendor Submittal Rev 1 — SPEC DEVIATION', status: 'Under Review', sourceSystem: 'Primavera P6', props: { docId: 'DOC-SUB-CDU-R1', vendor: 'Precision Cooling Systems AG', deviation: 'Proposed capacity 128 kW vs required 142 kW' } }),
  n({ id: 'SUB-RACK-R2', type: 'Submittal', tag: 'SUB-RACK-R2', name: 'GB300 NVL72 Rack Assembly Submittal Rev 2 — COMPLIANT', status: 'Approved', sourceSystem: 'Primavera P6', props: { docId: 'DOC-SUB-RACK-R2', vendor: 'NVIDIA OEM Partner' } }),
  n({ id: 'SUB-BF3-R1', type: 'Submittal', tag: 'SUB-BF3-R1', name: 'BlueField-3 B3240 DPU Submittal Rev 1 — COMPLIANT', status: 'Approved', sourceSystem: 'Primavera P6', props: { docId: 'DOC-SUB-BF3-R1', vendor: 'NVIDIA OEM Partner' } }),

  // ── Vendors ──
  n({ id: 'VEN-NVIDIA-OEM', type: 'Vendor', tag: 'VEN-OEM', name: 'NVIDIA OEM Partner — Rack Assembly', status: 'Active', props: { region: 'APAC', onTimeRate12mo: 0.89, city: 'Shenzhen', country: 'China', lat: 22.54, lon: 114.06, scope: 'GB300 NVL72 Rack assembly, FAT, OEM support' } }),
  n({ id: 'VEN-COOLANT', type: 'Vendor', tag: 'VEN-COOL', name: 'Precision Cooling Systems AG', status: 'Active', props: { region: 'EU', onTimeRate12mo: 0.91, city: 'Stuttgart', country: 'Germany', lat: 48.78, lon: 9.18, scope: 'Rack-level CDU for 8× NVL72 racks' } }),
  n({ id: 'VEN-FIBER', type: 'Vendor', tag: 'VEN-FIBER', name: 'OptiCore Japan — QSFP112/OSFP Transceivers', status: 'Active', props: { region: 'APAC', onTimeRate12mo: 0.84, city: 'Tokyo', country: 'Japan', lat: 35.68, lon: 139.69, scope: 'QSFP112, OSFP, SFP28 optical transceivers for Spectrum-X fabric', riskDocId: 'DOC-VN-FIBER' } }),
  n({ id: 'VEN-PDU', type: 'Vendor', tag: 'VEN-PDU', name: 'Volta Power Systems — 33kW PSU Shelves', status: 'Active', props: { region: 'SEA', onTimeRate12mo: 0.77, city: 'Singapore', country: 'Singapore', lat: 1.35, lon: 103.82, scope: '33 kW power shelves; sole qualified source', riskDocId: 'DOC-VPR-2026' } }),
  n({ id: 'VEN-CIVIL', type: 'Vendor', tag: 'VEN-CIVIL', name: 'Bharat Infrastructure Systems', status: 'Active', props: { region: 'APAC', onTimeRate12mo: 0.93, city: 'Pune', country: 'India', lat: 18.52, lon: 73.85, scope: 'Data hall civil works, raised floor, cable trays' } }),

  // ── Purchase Orders ──
  n({ id: 'PO-2061', type: 'PurchaseOrder', tag: 'PO-2061', name: 'PO-2061 — 8× GB300 NVL72 Racks (8 Scalable Units)', status: 'Awarded', sourceSystem: 'Primavera P6', props: { awarded: '01-Apr-2026', assumedLeadTimeWeeks: 18, quoteDocId: 'DOC-SUB-RACK-R2' } }),
  n({ id: 'PO-2087', type: 'PurchaseOrder', tag: 'PO-2087', name: 'PO-2087 — 8× Rack-Level Liquid Cooling CDUs', status: 'Awarded', sourceSystem: 'Primavera P6', props: { awarded: '15-Mar-2026', assumedLeadTimeWeeks: 20 } }),
  n({ id: 'PO-2094', type: 'PurchaseOrder', tag: 'PO-2094', name: 'PO-2094 — Optical Transceiver Batch (QSFP112/OSFP)', status: 'Awarded', sourceSystem: 'Primavera P6', props: { awarded: '20-Apr-2026', assumedLeadTimeWeeks: 10 } }),
  n({ id: 'PO-2098', type: 'PurchaseOrder', tag: 'PO-2098', name: 'PO-2098 — 64× 33kW Power Shelves (8/rack × 8 racks)', status: 'Awarded', sourceSystem: 'Primavera P6', props: { awarded: '01-Mar-2026', assumedLeadTimeWeeks: 22 } }),

  // ── Schedule Activities ──
  n({ id: 'ACT-S100', type: 'ScheduleActivity', tag: 'S100', name: 'Site Civil & Structural Preparation', status: 'Complete', sourceSystem: 'Primavera P6', props: { activityId: 'S100', baselineStart: '2025-10-01', baselineFinish: '2026-02-28', freeFloatWeeks: 0 } }),
  n({ id: 'ACT-S200', type: 'ScheduleActivity', tag: 'S200', name: 'Power Infrastructure Installation (UPS, PDU, Busbar)', status: 'In Progress', sourceSystem: 'Primavera P6', props: { activityId: 'S200', baselineStart: '2026-01-15', baselineFinish: '2026-07-31', freeFloatWeeks: 0, assumedLeadTimeWeeks: 28 } }),
  n({ id: 'ACT-S300', type: 'ScheduleActivity', tag: 'S300', name: 'Liquid Cooling Infrastructure Installation (CDU, Manifolds)', status: 'In Progress', sourceSystem: 'Primavera P6', props: { activityId: 'S300', baselineStart: '2026-02-01', baselineFinish: '2026-08-15', freeFloatWeeks: 2, assumedLeadTimeWeeks: 28 } }),
  n({ id: 'ACT-S400', type: 'ScheduleActivity', tag: 'S400', name: 'GB300 NVL72 Rack Delivery (8 SUs from OEM)', status: 'In Progress', sourceSystem: 'Primavera P6', props: { activityId: 'S400', baselineStart: '2026-04-01', baselineFinish: '2026-08-29', freeFloatWeeks: 0, assumedLeadTimeWeeks: 18 } }),
  n({ id: 'ACT-S500', type: 'ScheduleActivity', tag: 'S500', name: 'Rack Installation, Network Cabling & Fiber Termination', status: 'Not Started', sourceSystem: 'Primavera P6', props: { activityId: 'S500', baselineStart: '2026-09-01', baselineFinish: '2026-11-30', freeFloatWeeks: 0 } }),
  n({ id: 'ACT-S600', type: 'ScheduleActivity', tag: 'S600', name: 'Spectrum-X 800G Fabric Commissioning (L2 SAT)', status: 'Not Started', sourceSystem: 'Primavera P6', props: { activityId: 'S600', baselineStart: '2026-10-15', baselineFinish: '2026-12-31', freeFloatWeeks: 4 } }),
  n({ id: 'ACT-S700', type: 'ScheduleActivity', tag: 'S700', name: 'NVLink 5th-Gen Domain Validation (72-GPU × 8 SU)', status: 'Not Started', sourceSystem: 'Primavera P6', props: { activityId: 'S700', baselineStart: '2027-01-05', baselineFinish: '2027-02-28', freeFloatWeeks: 0 } }),
  n({ id: 'ACT-S800', type: 'ScheduleActivity', tag: 'S800', name: 'GPU Burn-in & Thermal Baseline (L3 Pre-Functional)', status: 'Not Started', sourceSystem: 'Primavera P6', props: { activityId: 'S800', baselineStart: '2027-03-01', baselineFinish: '2027-04-30', freeFloatWeeks: 4, level: 'L3' } }),
  n({ id: 'ACT-S900', type: 'ScheduleActivity', tag: 'S900', name: 'L5 AI Workload Acceptance Testing (576-GPU cluster)', status: 'Not Started', sourceSystem: 'Primavera P6', props: { activityId: 'S900', baselineStart: '2027-05-01', baselineFinish: '2027-06-30', freeFloatWeeks: 0, level: 'L5' } }),

  // ── People & Agents ──
  n({ id: 'PER-SHARMA', type: 'Person', tag: 'A.SHARMA', name: 'A. Sharma', status: 'Active', props: { role: 'AI Factory Project Director' } }),
  n({ id: 'PER-CHEN', type: 'Person', tag: 'K.CHEN', name: 'K. Chen', status: 'Active', props: { role: 'Infrastructure Engineer' } }),
  n({ id: 'AGT-SPEC', type: 'AIAgent', tag: 'AGT-SPEC', name: 'Spec-Compliance Agent', status: 'Active', props: { domain: 'NVIDIA specification compliance & submittal review' } }),
  n({ id: 'AGT-SCHED', type: 'AIAgent', tag: 'AGT-SCHED', name: 'Schedule-Risk Agent', status: 'Active', props: { domain: 'AI Factory build schedule & lead-time risk' } }),
];

const EDGES: Array<Omit<Edge, 'id'>> = [
  // Project contains systems
  { from: 'PRJ-NVL72-AIFC', to: 'SYS-COMPUTE', verb: 'CONTAINS' },
  { from: 'PRJ-NVL72-AIFC', to: 'SYS-NETWORK', verb: 'CONTAINS' },
  { from: 'PRJ-NVL72-AIFC', to: 'SYS-POWER', verb: 'CONTAINS' },
  { from: 'PRJ-NVL72-AIFC', to: 'SYS-COOLING', verb: 'CONTAINS' },
  { from: 'PRJ-NVL72-AIFC', to: 'SYS-MGMT', verb: 'CONTAINS' },

  // Systems contain equipment
  { from: 'SYS-COMPUTE', to: 'EQ-NVL72-SU01', verb: 'CONTAINS' },
  { from: 'SYS-COMPUTE', to: 'EQ-NVL72-SU02', verb: 'CONTAINS' },
  { from: 'SYS-COMPUTE', to: 'EQ-NVL72-SU03', verb: 'CONTAINS' },
  { from: 'SYS-COMPUTE', to: 'EQ-NVL72-SU04', verb: 'CONTAINS' },
  { from: 'SYS-COMPUTE', to: 'EQ-NVSWITCH', verb: 'CONTAINS' },
  { from: 'SYS-COMPUTE', to: 'EQ-CX8-MZB', verb: 'CONTAINS' },
  { from: 'SYS-COMPUTE', to: 'EQ-BF3-DPU', verb: 'CONTAINS' },
  { from: 'SYS-NETWORK', to: 'EQ-SN5610-LEAF', verb: 'CONTAINS' },
  { from: 'SYS-NETWORK', to: 'EQ-SN5600-SPINE', verb: 'CONTAINS' },
  { from: 'SYS-MGMT', to: 'EQ-SN2201-OOB', verb: 'CONTAINS' },
  { from: 'SYS-COOLING', to: 'EQ-CDU-RACK', verb: 'CONTAINS' },
  { from: 'SYS-POWER', to: 'EQ-PSU-SHELF', verb: 'CONTAINS' },

  // Specifications → Requirements
  { from: 'SPEC-COOL-001', to: 'REQ-COOL-001', verb: 'SPECIFIES' },
  { from: 'SPEC-COOL-001', to: 'REQ-COOL-002', verb: 'SPECIFIES' },
  { from: 'SPEC-NET-001', to: 'REQ-NET-001', verb: 'SPECIFIES' },
  { from: 'SPEC-NVLINK-001', to: 'REQ-NVLINK-001', verb: 'SPECIFIES' },

  // Requirements → Equipment
  { from: 'REQ-COOL-001', to: 'EQ-CDU-RACK', verb: 'APPLIES_TO' },
  { from: 'REQ-COOL-002', to: 'EQ-CDU-RACK', verb: 'APPLIES_TO' },
  { from: 'REQ-NET-001', to: 'EQ-CX8-MZB', verb: 'APPLIES_TO' },
  { from: 'REQ-NVLINK-001', to: 'EQ-NVSWITCH', verb: 'APPLIES_TO' },
  { from: 'REQ-NET-001', to: 'SPEC-NVRA-001', verb: 'GOVERNED_BY' },
  { from: 'REQ-COOL-001', to: 'SPEC-NVRA-001', verb: 'GOVERNED_BY' },

  // Submittals → Equipment
  { from: 'SUB-CDU-R1', to: 'EQ-CDU-RACK', verb: 'SUBMITTED_FOR' },
  { from: 'SUB-RACK-R2', to: 'EQ-NVL72-SU01', verb: 'SUBMITTED_FOR' },
  { from: 'SUB-BF3-R1', to: 'EQ-BF3-DPU', verb: 'SUBMITTED_FOR' },

  // Equipment → Purchase Orders
  { from: 'EQ-NVL72-SU01', to: 'PO-2061', verb: 'SUPPLIED_UNDER' },
  { from: 'EQ-NVL72-SU02', to: 'PO-2061', verb: 'SUPPLIED_UNDER' },
  { from: 'EQ-NVL72-SU03', to: 'PO-2061', verb: 'SUPPLIED_UNDER' },
  { from: 'EQ-NVL72-SU04', to: 'PO-2061', verb: 'SUPPLIED_UNDER' },
  { from: 'EQ-CDU-RACK', to: 'PO-2087', verb: 'SUPPLIED_UNDER' },
  { from: 'EQ-SN5610-LEAF', to: 'PO-2094', verb: 'SUPPLIED_UNDER' },
  { from: 'EQ-PSU-SHELF', to: 'PO-2098', verb: 'SUPPLIED_UNDER' },

  // POs → Vendors
  { from: 'PO-2061', to: 'VEN-NVIDIA-OEM', verb: 'ISSUED_TO' },
  { from: 'PO-2087', to: 'VEN-COOLANT', verb: 'ISSUED_TO' },
  { from: 'PO-2094', to: 'VEN-FIBER', verb: 'ISSUED_TO' },
  { from: 'PO-2098', to: 'VEN-PDU', verb: 'ISSUED_TO' },

  // Equipment → Schedule Activities
  { from: 'EQ-NVL72-SU01', to: 'ACT-S400', verb: 'ALLOCATED_TO' },
  { from: 'EQ-SN5610-LEAF', to: 'ACT-S500', verb: 'ALLOCATED_TO' },

  // Schedule dependency chain
  { from: 'ACT-S400', to: 'ACT-S100', verb: 'DEPENDS_ON' },
  { from: 'ACT-S500', to: 'ACT-S400', verb: 'DEPENDS_ON' },
  { from: 'ACT-S500', to: 'ACT-S200', verb: 'DEPENDS_ON' },
  { from: 'ACT-S500', to: 'ACT-S300', verb: 'DEPENDS_ON' },
  { from: 'ACT-S600', to: 'ACT-S500', verb: 'DEPENDS_ON' },
  { from: 'ACT-S700', to: 'ACT-S600', verb: 'DEPENDS_ON' },
  { from: 'ACT-S800', to: 'ACT-S700', verb: 'DEPENDS_ON' },
  { from: 'ACT-S900', to: 'ACT-S800', verb: 'DEPENDS_ON' },

  // People
  { from: 'PER-SHARMA', to: 'PRJ-NVL72-AIFC', verb: 'OWNS' },
  { from: 'PER-CHEN', to: 'SPEC-COOL-001', verb: 'OWNS' },
];

export function buildSeedGraph(): TypedGraph {
  const g = new TypedGraph();
  for (const node of NODES) g.addNode(node);
  EDGES.forEach((e, i) => g.addEdge({ id: `E-${String(i + 1).padStart(3, '0')}`, ...e }));
  applyPhase2Seed(g);
  applyPhase3Seed(g);
  return g;
}
