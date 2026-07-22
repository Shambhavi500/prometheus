/**
 * Seed source documents — NVIDIA AI Factory NVL72-AIFC-001 (Pune Cluster).
 *
 * These are the artifacts of record from which all evidence is extracted.
 * Block ids are stable citation anchors. Pre-parsed fixtures representing
 * the output of the Ingestion & Perception layer from the AI Factory
 * construction document corpus.
 *
 * Based on: NVIDIA GB300 NVL72 AI Factory Reference Architecture
 * ET AI Hackathon 2026 — Problem Statement 4
 */

import type { SourceDocument } from '@prometheus/ontology';

export const SEED_DOCUMENTS: SourceDocument[] = [
  {
    id: 'DOC-SPEC-COOL',
    title: 'SPEC-COOL-001 — AI Factory Liquid Cooling System Specification',
    docType: 'Specification',
    revision: 'Rev B',
    issued: '01-Mar-2026',
    sourceSystem: 'Primavera P6',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'SC-1-1', kind: 'heading', text: 'SECTION 4 — RACK-LEVEL DIRECT LIQUID COOLING DISTRIBUTION UNITS (CDU)' },
          {
            id: 'SC-1-2',
            kind: 'para',
            text: 'This section governs the design, fabrication, testing, and commissioning of rack-level direct liquid cooling distribution units (CDUs) for the NVIDIA GB300 NVL72 AI Factory, Pune. All units shall comply with the NVIDIA GB300 NVL72 Reference Architecture thermal design envelope and the referenced ASHRAE W4 standards.',
          },
          {
            id: 'SC-1-3',
            kind: 'clause',
            clause: '4.1.0',
            text: 'Each GB300 NVL72 rack (Scalable Unit) shall be served by a dedicated rack-level CDU. The CDU shall be sized to handle the full rack thermal design power (TDP) at any GPU utilization level, including sustained LLM training and inference workloads.',
          },
          {
            id: 'SC-1-4',
            kind: 'clause',
            clause: '4.1.1',
            text: 'Each CDU shall be rated for a continuous thermal duty of not less than 142 kW at the NVIDIA-specified design supply temperature of 18°C and return temperature of 40°C. Units with a capacity below 142 kW shall not be submitted without prior written RFI and Owner approval.',
          },
          {
            id: 'SC-1-5',
            kind: 'clause',
            clause: '4.1.2',
            text: 'CDU supply voltage shall be 415 V, 3-phase, 50 Hz as per the data hall electrical infrastructure. The CDU shall include integrated pump redundancy (N+1 pump configuration) to support continuous operation during single-pump failure without GPU throttling.',
          },
        ],
      },
      {
        page: 2,
        blocks: [
          {
            id: 'SC-2-1',
            kind: 'clause',
            clause: '4.3.2',
            text: 'Vendor shall state the unit inrush current (peak, 200ms duration) in the submittal data sheet to enable coordination with the data hall LV switchboard protection settings. Units where inrush current is not declared shall be returned for resubmission.',
          },
          {
            id: 'SC-2-2',
            kind: 'clause',
            clause: '4.3.3',
            text: 'Factory acceptance testing (FAT) shall be witnessed and shall include hydrostatic test records at 1.5× design pressure, full-load thermal performance test at 142 kW, and pump changeover test.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-SPEC-NET',
    title: 'SPEC-NET-001 — Spectrum-X 800G Dual-Plane Network Specification',
    docType: 'Specification',
    revision: 'Rev A',
    issued: '15-Feb-2026',
    sourceSystem: 'Primavera P6',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'SN-1-1', kind: 'heading', text: 'SECTION 5 — GPU COMPUTE (EAST/WEST) ETHERNET FABRIC' },
          {
            id: 'SN-1-2',
            kind: 'clause',
            clause: '5.1.2',
            text: 'Each compute tray shall provide a minimum recommended compute network bandwidth of 800 Gb/s per GPU via four NVIDIA ConnectX-8 SuperNICs, each operating at 800 Gb/s. The dual-plane topology breaks each 800G interface into 2×400G links, one per independent fabric plane, ensuring N+1 redundancy and NCCL-managed load balancing.',
          },
          {
            id: 'SN-1-3',
            kind: 'clause',
            clause: '5.1.3',
            text: 'The compute fabric shall implement a rail-optimized, non-blocking fat-tree topology using NVIDIA SN5610 leaf switches and NVIDIA SN5600 spine switches. The leaf switches shall be deployed in pairs per GPU rail position, one per plane.',
          },
        ],
      },
      {
        page: 2,
        blocks: [
          {
            id: 'SN-2-1',
            kind: 'clause',
            clause: '5.2.1',
            text: 'Each NVIDIA SN5610 leaf switch shall be configured with RDMA over Converged Ethernet (RoCE) support, Spectrum-X congestion control, and telemetry-based adaptive routing. Dual-ported OSFP optics are recommended at the ConnectX-8 port to simplify breakout cabling.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-SPEC-NVLINK',
    title: 'SPEC-NVLINK-001 — NVLink 5th-Gen Domain Specification',
    docType: 'Specification',
    revision: 'Rev A',
    issued: '15-Feb-2026',
    sourceSystem: 'Primavera P6',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'SNL-1-1', kind: 'heading', text: 'SECTION 6 — NVLINK 5TH-GENERATION IN-RACK DOMAIN' },
          {
            id: 'SNL-1-2',
            kind: 'clause',
            clause: '6.2.1',
            text: 'Each Blackwell Ultra GPU within the NVL72 rack shall be connected to all 18 NVSwitch ASICs via NVLink 5th-generation links through the copper backplane. This creates a fully connected L1 NVLink domain of 72 GPUs with an aggregate bandwidth of 900 GB/s (1,800 GB/s bi-directional) per rack.',
          },
          {
            id: 'SNL-1-3',
            kind: 'clause',
            clause: '6.2.2',
            text: 'Each NVL72 rack shall contain 9 NVLink Switch Trays, each carrying 2 NVSwitch ASICs, for a total of 18 NVSwitch ASICs per rack. The total aggregated NVLink fabric bandwidth is 130 TB/s per NVL72 rack.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-SUB-CDU-R1',
    title: 'SUB-CDU-R1 — Liquid Cooling CDU Vendor Submittal, Revision 1',
    docType: 'Submittal',
    revision: 'Rev 1',
    issued: '30-Jun-2026',
    sourceSystem: 'Primavera P6',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'SCD-1-1', kind: 'heading', text: 'COOLING DISTRIBUTION UNIT TECHNICAL SUBMITTAL — PRECISION COOLING SYSTEMS AG' },
          {
            id: 'SCD-1-2',
            kind: 'para',
            text: 'Submittal covering rack-level liquid cooling distribution units for NVIDIA AI Factory NVL72-AIFC-001 (Pune), in response to SPEC-COOL-001 Rev B. Vendor: Precision Cooling Systems AG, Stuttgart, Germany.',
          },
        ],
      },
      {
        page: 2,
        blocks: [
          {
            id: 'SCD-2-1',
            kind: 'para',
            text: 'Thermal performance: continuous duty 128 kW at 18°C supply / 38°C return. Pump configuration: N+1 (primary + standby). Hydrostatic FAT at 1.5× design pressure included in standard scope.',
          },
          {
            id: 'SCD-2-2',
            kind: 'para',
            text: 'Note: The submitted unit (model PCS-LCC-128) is our standard data center CDU rated at 128 kW. To achieve 142 kW, an upgraded coil insert kit (PCS-CI-LCC-142) must be specified. This is available at additional cost; lead time impact: 6 weeks from order.',
          },
        ],
      },
      {
        page: 3,
        blocks: [
          { id: 'SCD-3-1', kind: 'heading', text: 'ELECTRICAL DATA — CDU UNIT' },
          {
            id: 'SCD-3-2',
            kind: 'table',
            text: 'Supply voltage: 415 V / 3-phase / 50 Hz. Full load current: 62 A. Pump motor rating: 11 kW × 2. Control voltage: 24 V DC.',
          },
          {
            id: 'SCD-3-3',
            kind: 'para',
            text: 'Inrush current: Not stated. Refer to factory for coordination study data.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-SUB-RACK-R2',
    title: 'SUB-RACK-R2 — GB300 NVL72 Rack Assembly Submittal, Revision 2',
    docType: 'Submittal',
    revision: 'Rev 2',
    issued: '10-Jun-2026',
    sourceSystem: 'Primavera P6',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'SRK-1-1', kind: 'heading', text: 'GB300 NVL72 RACK ASSEMBLY — NVIDIA OEM PARTNER TECHNICAL SUBMITTAL' },
        ],
      },
      {
        page: 2,
        blocks: [
          {
            id: 'SRK-2-1',
            kind: 'table',
            text: 'GPU Count: 72 NVIDIA Blackwell Ultra B300 GPUs. CPU Count: 36 NVIDIA Grace CPUs (2 per tray). Compute Trays: 18. NVLink Switch Trays: 9 (18 NVSwitch ASICs). ConnectX-8 SuperNICs: 72 (4 per tray). BlueField-3 B3240 DPUs: 18 (1 per tray). Power: 8× 33kW shelves (6× 5.5kW PSUs/shelf). Cooling: Integrated direct liquid cooling. NVLink Bandwidth: 900 GB/s (uni-directional in-rack domain).',
          },
        ],
      },
      {
        page: 3,
        blocks: [
          {
            id: 'SRK-3-1',
            kind: 'clause',
            clause: 'NVLink Compliance',
            text: 'NVLink 5th-gen port count: 18 links per GPU via copper backplane to all 18 NVSwitch ASICs. Compliant with SPEC-NVLINK-001 REQ-NVLINK-001.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-SUB-BF3-R1',
    title: 'SUB-BF3-R1 — BlueField-3 B3240 DPU Submittal, Revision 1',
    docType: 'Submittal',
    revision: 'Rev 1',
    issued: '05-Jun-2026',
    sourceSystem: 'Primavera P6',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'SBF-1-1', kind: 'heading', text: 'BLUEFIELD-3 B3240 DPU — TECHNICAL SUBMITTAL' },
          {
            id: 'SBF-1-2',
            kind: 'table',
            text: 'Model: BlueField-3 B3240 DPU. Ports: 2× 400G QSFP112. Aggregate bandwidth: 480 Gb/s (dual-port aggregate). Mode: ECPF/DPU mode. BMC: Integrated Redfish 1.4 onboard BMC. Features: BlueField SNAP, zero-trust security, IPSec/MACSec, storage acceleration.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-P6-AIFC',
    title: 'P6-AIFC-2026-07 — Primavera P6 Baseline Extract, AI Factory Build Path',
    docType: 'ScheduleExtract',
    revision: 'Baseline 2',
    issued: '01-Jul-2026',
    sourceSystem: 'Primavera P6',
    pages: [
      {
        page: 1,
        blocks: [
          {
            id: 'P6-1-1',
            kind: 'table',
            text: 'S100 Site Civil Preparation — Finish 28-Feb-2026 (Actual). S200 Power Infrastructure — Start 15-Jan-2026, Finish 31-Jul-2026 (In Progress). S300 Liquid Cooling Installation — Start 01-Feb-2026, Finish 15-Aug-2026 (In Progress). S400 GB300 NVL72 Rack Delivery — Start 01-Apr-2026, Finish 29-Aug-2026. S500 Rack Installation & Network Cabling — Start 01-Sep-2026, Finish 30-Nov-2026. S600 Spectrum-X Fabric Commissioning — Start 15-Oct-2026, Finish 31-Dec-2026. S700 NVLink Domain Validation — Start 05-Jan-2027, Finish 28-Feb-2027. S800 GPU Burn-in & Thermal Baseline (L3) — Start 01-Mar-2027, Finish 30-Apr-2027. S900 L5 AI Workload Acceptance — Start 01-May-2027, Finish 30-Jun-2027.',
          },
          {
            id: 'P6-1-2',
            kind: 'clause',
            clause: 'Basis of Schedule §3.1',
            text: 'Activity S400 duration is based on a vendor lead-time assumption of 18 weeks for the GB300 NVL72 racks (8 Scalable Units) from PO award date of 01-Apr-2026, per OEM pre-award confirmation received March 2026.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-VN-FIBER',
    title: 'VN-2026-221 — OptiCore Japan: Customs Hold Notice (QSFP112/OSFP Batch)',
    docType: 'VendorQuote',
    revision: 'Rev 0',
    issued: '14-Jul-2026',
    sourceSystem: 'Mail Ingest',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'VN-1-1', kind: 'heading', text: 'NOTICE OF CUSTOMS HOLD — PO-2094 OPTICAL TRANSCEIVER BATCH' },
          {
            id: 'VN-1-2',
            kind: 'para',
            text: 'OptiCore Japan regrets to inform that the QSFP112 and OSFP optical transceiver batch (3,456 + 1,152 units) for purchase order PO-2094 is currently held by Pune Customs under an enhanced inspection protocol for dual-use electronics (Notification 3/2026). Estimated customs clearance: 10–14 working days from the date of this notice.',
          },
          {
            id: 'VN-1-3',
            kind: 'clause',
            clause: '2.1',
            text: 'The affected batch covers all QSFP112 modules for the Spectrum-X dual-plane compute fabric and all OSFP transceivers for the SN5610 leaf switch OSFP ports. Without customs clearance, NVLink inter-rack fiber cabling for SU-04 through SU-08 cannot proceed.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-VPR-2026',
    title: 'VPR-2026-Q2 — Vendor Performance Register (APAC/EU) Q2 2026',
    docType: 'ScheduleExtract',
    revision: 'Q2 2026',
    issued: '30-Jun-2026',
    sourceSystem: 'Primavera P6',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'VPR-1-1', kind: 'heading', text: 'VENDOR PERFORMANCE — 12-MONTH ROLLING (APAC/EU REGION)' },
          {
            id: 'VPR-1-2',
            kind: 'table',
            text: 'Volta Power Systems (Singapore) — on-time delivery rate 77% across 12-month APAC history. Sole qualified source for 5.5 kW hot-swap PSU modules (33 kW shelf configuration). No secondary qualified source is currently listed in the approved vendor register. Q3 factory backlog may extend lead times by 3–4 weeks.',
          },
          {
            id: 'VPR-1-3',
            kind: 'table',
            text: 'OptiCore Japan — on-time delivery rate 84%. Precision Cooling Systems AG — on-time delivery rate 91%. NVIDIA OEM Partner — on-time delivery rate 89%.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-CX-AIFC',
    title: 'CX-AIFC-001 Rev 3 — AI Factory Commissioning Readiness Matrix',
    docType: 'ScheduleExtract',
    revision: 'Rev 3',
    issued: '15-Jul-2026',
    sourceSystem: 'NVIDIA Mission Control',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'CX-1-1', kind: 'heading', text: 'L1–L5 COMMISSIONING READINESS — NVIDIA AI FACTORY NVL72-AIFC-001' },
          {
            id: 'CX-1-2',
            kind: 'clause',
            clause: 'SYS-COMPUTE / SS-COMPUTE-A',
            text: 'GPU Compute Cluster SU-01 to SU-04: L1 Factory Acceptance Test (FAT) blocked. Racks SU-01 and SU-02 remain in manufacture at OEM facility with 20-week actual lead time (vs 18-week baseline). No unit available for FAT witness. L2–L5 not started.',
          },
          {
            id: 'CX-1-3',
            kind: 'clause',
            clause: 'SYS-COMPUTE / SS-COMPUTE-B',
            text: 'GPU Compute Cluster SU-05 to SU-08: L1 FAT at risk. Optical transceiver customs hold (SHP-FIBER-001) prevents NVLink inter-rack cabling needed for L2 NVLink domain validation on SU-04 through SU-08.',
          },
          {
            id: 'CX-1-4',
            kind: 'clause',
            clause: 'SYS-COMPUTE / SS-NVLINK',
            text: 'NVLink 5th-Gen Domain (L2 SAT): Blocked. L2 NVLink domain integrity test requires all 9 NVSwitch trays per rack to be cabled and powered. Dependent on SU-01/04 FAT completion and fiber transceiver delivery.',
          },
          {
            id: 'CX-1-5',
            kind: 'clause',
            clause: 'SYS-NETWORK / SS-FABRIC',
            text: 'Spectrum-X 800G Dual-Plane Fabric (L2 SAT): At Risk. SN5610 leaf switch OSFP transceivers are included in the held customs batch (SHP-FIBER-001). Fabric verification cannot proceed without full transceiver inventory.',
          },
          {
            id: 'CX-1-6',
            kind: 'clause',
            clause: 'SYS-COOLING / SS-COOLING-CDU',
            text: 'Liquid Cooling CDU Array (L1 FAT): At Risk. CDU vendor submittal proposes 128 kW capacity vs SPEC-COOL-001 requirement of 142 kW. Spec deviation RFI must be resolved before FAT witness. If accepted with de-rated operation, cluster TDP must be reduced by 10%.',
          },
          {
            id: 'CX-1-7',
            kind: 'clause',
            clause: 'SYS-COOLING / SS-COOLING-CDU (L2)',
            text: 'CDU Site Acceptance (L2): Not Started. Gated on L1 FAT resolution and spec deviation outcome.',
          },
          {
            id: 'CX-1-8',
            kind: 'clause',
            clause: 'SYS-POWER / SS-POWER-PDU',
            text: 'Power Shelf FAT (L1): In Progress. Load bank testing for Batch 1 (33 of 64 shelves) is in progress at Volta Power Systems factory. On plan.',
          },
          {
            id: 'CX-1-9',
            kind: 'clause',
            clause: 'SYS-POWER / SS-POWER-PDU (L2)',
            text: 'Power Distribution Site Acceptance (L2): Not Started. Gated on site delivery of all 64 power shelves and PDU installation completion.',
          },
          {
            id: 'CX-1-10',
            kind: 'clause',
            clause: 'SYS-MGMT / SS-OOB-MGMT',
            text: 'OOB Management (SN2201) FAT (L1): Complete. All 16 SN2201 switches passed Redfish API, IPMI, and network isolation testing at NVIDIA OEM facility.',
          },
          {
            id: 'CX-1-11',
            kind: 'clause',
            clause: 'SYS-MGMT / SS-OOB-MGMT (L2)',
            text: 'OOB Network Site Acceptance (L2): Complete. BMC connectivity verified for all 144 compute tray BlueField-3 BMCs and all rack in-rack SN2201 switches.',
          },
          {
            id: 'CX-1-12',
            kind: 'clause',
            clause: 'SYS-MGMT / SS-OOB-MGMT (L3)',
            text: 'OOB Pre-Functional (L3): In Progress. NVIDIA Mission Control integration in progress. On plan.',
          },
          {
            id: 'CX-1-13',
            kind: 'clause',
            clause: 'L5 Rollup',
            text: 'AI Factory L5 Integrated Systems Testing cannot be sequenced until GPU Compute (SS-COMPUTE-A), NVLink Domain (SS-NVLINK), Spectrum-X Fabric (SS-FABRIC), and Cooling CDU (SS-COOLING-CDU) subsystems achieve L4 Functional clearance. Current critical path: rack delivery → fiber transceiver delivery → NVLink cabling → L2 SAT → GPU burn-in → L5.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-LL-PILOT',
    title: 'LL-PILOT-2025 — AI Factory Hyderabad Pilot Lessons-Learned Register',
    docType: 'ScheduleExtract',
    revision: 'Final',
    issued: '15-Dec-2025',
    sourceSystem: 'Knowledge Graph',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'LL-1-1', kind: 'heading', text: 'HYDERABAD PILOT (NVL72-PILOT) LESSONS LEARNED — CROSS-PROJECT MEMORY' },
          {
            id: 'LL-1-2',
            kind: 'clause',
            clause: 'DEC-P01',
            text: 'QSFP112 transceiver customs delay on NVL72-PILOT was mitigated by air-freighting the blocked batch from Tokyo to Hyderabad and pre-terminating fiber cables in parallel with the customs clearance. Outcome: NVLink cabling for 2-SU pilot recovered 3 weeks of commissioning float. Air-freight premium: USD 42,000. Approved by A. Sharma, 14-Jun-2025.',
          },
          {
            id: 'LL-1-3',
            kind: 'clause',
            clause: 'DEC-P02',
            text: 'CDU cooling capacity (128 kW submitted vs 142 kW required) was resolved on NVL72-PILOT via an RFI requesting an uprated coil insert kit from the vendor. Vendor supplied the upgrade within 6 weeks; cluster ran at 90% TDP (65 active GPUs of 72) during interim. No milestone impact. Approved by K. Chen, 22-Apr-2025.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-NVRA-001',
    title: 'NVIDIA GB300 NVL72 AI Factory Reference Architecture (Enterprise RA)',
    docType: 'Standard',
    revision: '1.0',
    issued: '15-Jan-2026',
    sourceSystem: 'Standards Library',
    pages: [
      {
        page: 1,
        blocks: [
          {
            id: 'NR-1-1',
            kind: 'clause',
            clause: 'Overview §2.1',
            text: 'The NVIDIA Enterprise RA using 2-4-5-800 (dual plane) node architecture with NVIDIA GB300 NVL72 and NVIDIA Spectrum-X Networking offers a fully integrated, rack-scale solution optimized for the most demanding AI workloads. Each NVL72 rack (Scalable Unit) integrates 18 compute trays with 72 NVIDIA Blackwell Ultra GPUs and 36 NVIDIA Grace CPUs.',
          },
          {
            id: 'NR-1-2',
            kind: 'clause',
            clause: 'Power §3.2',
            text: 'Full rack requiring up to 142 kW. 8 power shelves of 33 kW, with each shelf having six 5.5 kW PSUs. The rack solution requires direct liquid cooling.',
          },
        ],
      },
    ],
  },
];
