/**
 * Seed source documents — Project Meghdoot NM-1.
 *
 * These are the unmodified artifacts of record from which all evidence is
 * extracted. Block ids are stable citation anchors. In production these are
 * ingested via OCR/layout parsers from Octave; here they are pre-parsed
 * fixtures representing the output of the Ingestion & Perception layer.
 */

import type { SourceDocument } from '@prometheus/ontology';

export const SEED_DOCUMENTS: SourceDocument[] = [
  {
    id: 'DOC-SPEC-MECH-02',
    title: 'SPEC-MECH-02 — Mechanical Specification: Cooling Distribution',
    docType: 'Specification',
    revision: 'Rev B',
    issued: '11-Feb-2026',
    sourceSystem: 'Octave',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'SM2-1-1', kind: 'heading', text: 'SECTION 4 — COOLING DISTRIBUTION UNITS (CDU)' },
          {
            id: 'SM2-1-2',
            kind: 'para',
            text: 'This section governs the design, fabrication, and testing of cooling distribution units serving Data Hall 1 (NM-1). All units shall comply with the project basis of design and the referenced standards.',
          },
          {
            id: 'SM2-1-3',
            kind: 'clause',
            clause: '4.1.1',
            text: 'Each CDU shall be rated for a continuous thermal duty of 1,200 kW at the design supply/return temperatures stated in Schedule M-201.',
          },
          {
            id: 'SM2-1-4',
            kind: 'clause',
            clause: '4.1.2',
            text: 'CDU electrical supply shall be 480 V, 3-phase, 60 Hz. Units requiring any other supply configuration shall not be submitted without prior written deviation approval.',
          },
        ],
      },
      {
        page: 2,
        blocks: [
          {
            id: 'SM2-2-1',
            kind: 'clause',
            clause: '4.3.1',
            text: 'Vendor shall state the unit operating weight (flooded) in the submittal data sheet for structural coordination of the NM-1 raised slab.',
          },
          {
            id: 'SM2-2-2',
            kind: 'clause',
            clause: '4.3.2',
            text: 'Factory acceptance testing (FAT) shall be witnessed and shall include hydrostatic test records at 1.5x design pressure.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-SPEC-ELEC-01',
    title: 'SPEC-ELEC-01 — Electrical Specification: MV/LV Power Distribution',
    docType: 'Specification',
    revision: 'Rev C',
    issued: '28-Jan-2026',
    sourceSystem: 'Octave',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'SE1-1-1', kind: 'heading', text: 'SECTION 3 — UNIT SUBSTATION TRANSFORMERS' },
          {
            id: 'SE1-1-2',
            kind: 'clause',
            clause: '3.2.1',
            text: 'Unit substation transformers TX-01 and TX-02 shall provide a secondary voltage of 480Y/277 V and shall conform to IEEE C57.12.00 for rating and impedance tolerances.',
          },
          {
            id: 'SE1-1-3',
            kind: 'clause',
            clause: '3.2.4',
            text: 'Transformer impedance shall be 5.75% ± 7.5% tolerance on the self-cooled rating.',
          },
        ],
      },
      {
        page: 2,
        blocks: [
          { id: 'SE1-2-1', kind: 'heading', text: 'SECTION 5 — LV SWITCHGEAR' },
          {
            id: 'SE1-2-2',
            kind: 'clause',
            clause: '5.1.4',
            text: 'LV switchgear SWG-01 shall have a short-circuit withstand rating of not less than 65 kA RMS symmetrical for 30 cycles.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-SUB-CDU01-R1',
    title: 'SUB-CDU01-R1 — CDU-01 Vendor Submittal, Revision 1',
    docType: 'Submittal',
    revision: 'Rev 1',
    issued: '30-Jun-2026',
    sourceSystem: 'Octave',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'SC1-1-1', kind: 'heading', text: 'CDU-01 TECHNICAL SUBMITTAL — HELIOS THERMAL SYSTEMS' },
          {
            id: 'SC1-1-2',
            kind: 'para',
            text: 'Submittal covering cooling distribution unit CDU-01 for Project Meghdoot NM-1, in response to SPEC-MECH-02 Rev B.',
          },
        ],
      },
      {
        page: 2,
        blocks: [
          {
            id: 'SC1-2-1',
            kind: 'para',
            text: 'Thermal performance: continuous duty 1,250 kW at design conditions per Schedule M-201. Hydrostatic FAT at 1.5x design pressure included in standard scope.',
          },
        ],
      },
      {
        page: 3,
        blocks: [
          { id: 'SC1-3-1', kind: 'heading', text: 'ELECTRICAL DATA — CDU-01' },
          {
            id: 'SC1-3-2',
            kind: 'table',
            text: 'Supply voltage: 400 V / 3-phase / 50 Hz. Full load current: 86 A. Control voltage: 24 V DC.',
          },
          {
            id: 'SC1-3-3',
            kind: 'para',
            text: 'Note: Unit as quoted is the EU-market configuration. Alternative supply configurations available on request; refer to factory.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-SUB-TX01-R2',
    title: 'SUB-TX01-R2 — TX-01 Transformer Submittal, Revision 2',
    docType: 'Submittal',
    revision: 'Rev 2',
    issued: '19-Jun-2026',
    sourceSystem: 'Octave',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'ST1-1-1', kind: 'heading', text: 'TX-01 UNIT SUBSTATION TRANSFORMER — KAPPA TRANSFORMER WORKS' },
        ],
      },
      {
        page: 2,
        blocks: [
          {
            id: 'ST1-2-1',
            kind: 'table',
            text: 'Rating: 2,500 kVA ONAN. Primary: 34.5 kV delta. Secondary: 480Y/277 V. Impedance: 5.72% at self-cooled rating. Conforms to IEEE C57.12.00.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-SUB-SWG01-R1',
    title: 'SUB-SWG01-R1 — SWG-01 Switchgear Submittal, Revision 1',
    docType: 'Submittal',
    revision: 'Rev 1',
    issued: '12-Jun-2026',
    sourceSystem: 'Octave',
    pages: [
      {
        page: 4,
        blocks: [
          {
            id: 'SW1-4-1',
            kind: 'table',
            text: 'SWG-01 ratings: 4,000 A main bus. Short-circuit withstand: 65 kA RMS symmetrical, 30 cycles. Enclosure: NEMA 1 indoor.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-VQ-884',
    title: 'VQ-884 — Kappa Transformer Works: Quotation for PO-884',
    docType: 'VendorQuote',
    revision: 'Rev 0',
    issued: '02-Jul-2026',
    sourceSystem: 'Mail Ingest',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'VQ-1-1', kind: 'heading', text: 'QUOTATION Q-2026-0771 — UNIT SUBSTATION TRANSFORMERS' },
          {
            id: 'VQ-1-2',
            kind: 'para',
            text: 'Kappa Transformer Works confirms pricing and scope for two (2) 2,500 kVA unit substation transformers per SPEC-ELEC-01 Rev C, purchase order PO-884.',
          },
        ],
      },
      {
        page: 2,
        blocks: [
          {
            id: 'VQ-2-1',
            kind: 'para',
            text: 'Delivery: current factory loading requires a lead time of 128 weeks ex-works from PO award for unit T-01, and 131 weeks for the second unit. Expedited slots are not available in the current order book.',
          },
          {
            id: 'VQ-2-2',
            kind: 'para',
            text: 'Validity: pricing and delivery are valid for 45 days from the date of this quotation.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-P6-EXTR',
    title: 'P6-EXTR-2026-07 — Primavera P6 Baseline Extract, NM-1 Power Path',
    docType: 'ScheduleExtract',
    revision: 'Baseline 3',
    issued: '01-Jul-2026',
    sourceSystem: 'Primavera P6',
    pages: [
      {
        page: 1,
        blocks: [
          {
            id: 'P6-1-1',
            kind: 'table',
            text: 'A100 Award TX-01 Purchase Order — Finish 06-Mar-2026 (Actual). A102 TX-01 Manufacture & Delivery — Start 09-Mar-2026, Finish 29-Nov-2027. A140 NM-1 Energization — Start 06-Dec-2027, Finish 14-Jan-2028. A200 L4 Functional Testing — Start 17-Jan-2028, Finish 10-Mar-2028. A210 L5 Integrated Systems Testing — Start 13-Mar-2028, Finish 05-May-2028.',
          },
          {
            id: 'P6-1-2',
            kind: 'clause',
            clause: 'Basis of Schedule §2.4',
            text: 'Activity A102 duration is based on a vendor lead-time assumption of 90 weeks for the TX-01 unit substation transformer, per pre-award budgetary quotations received October 2025.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-VB-MERIDIAN',
    title: 'VB-2026-118 — Meridian Switchgear: Force Majeure Notice',
    docType: 'VendorQuote',
    revision: 'Rev 0',
    issued: '14-Jul-2026',
    sourceSystem: 'Mail Ingest',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'VB-1-1', kind: 'heading', text: 'NOTICE OF FORCE MAJEURE — PO-992 SWITCHGEAR' },
          {
            id: 'VB-1-2',
            kind: 'para',
            text: 'Meridian Switchgear declares a force majeure event effective 14-Jul-2026 arising from an industrial labor action at the Milan assembly facility. All outbound logistics are suspended until further notice.',
          },
          {
            id: 'VB-1-3',
            kind: 'clause',
            clause: '2.1',
            text: 'Three (3) pending shipments under PO-992 are affected: switchgear section A, switchgear section B, and the protection relay panels for SWG-01. No revised dispatch date can be committed at this time.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-VPR',
    title: 'VPR-2026-Q2 — Vendor Performance Register (EMEA)',
    docType: 'ScheduleExtract',
    revision: 'Q2 2026',
    issued: '30-Jun-2026',
    sourceSystem: 'Octave',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'VPR-1-1', kind: 'heading', text: 'VENDOR PERFORMANCE — 12-MONTH ROLLING (EMEA)' },
          {
            id: 'VPR-1-2',
            kind: 'table',
            text: 'Kappa Transformer Works — on-time delivery rate 61% across 12-month EMEA history; sole qualified source for the 2,500 kVA unit substation transformers under PO-884. No secondary qualified source is currently listed.',
          },
          {
            id: 'VPR-1-3',
            kind: 'table',
            text: 'Meridian Switchgear — on-time delivery rate 74%. Helios Thermal Systems — on-time delivery rate 88%.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-CX-MATRIX',
    title: 'CX-MATRIX-DH1 — Commissioning Readiness Matrix, NM-1',
    docType: 'ScheduleExtract',
    revision: 'Rev 5',
    issued: '15-Jul-2026',
    sourceSystem: 'Smart Completions',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'CX-1-1', kind: 'heading', text: 'L1–L5 COMMISSIONING READINESS — DATA HALL 1' },
          {
            id: 'CX-1-2',
            kind: 'clause',
            clause: 'SYS-01 / SS-01A',
            text: 'MV Distribution (SS-01A): L1 Factory Acceptance blocked. TX-01 remains in manufacture with no delivery date; no unit is available to witness FAT. L2–L5 not started.',
          },
          {
            id: 'CX-1-3',
            kind: 'clause',
            clause: 'SYS-01 / SS-01B',
            text: 'LV Distribution (SS-01B): L1 Factory Acceptance at risk. SWG-01 dispatch suspended under the Meridian force majeure; FAT witness slot cannot be confirmed.',
          },
          {
            id: 'CX-1-4',
            kind: 'clause',
            clause: 'SYS-02 / SS-02A',
            text: 'Chilled Water (SS-02A): L1 at risk pending resolution of the CDU-01 supply voltage deviation.',
          },
          {
            id: 'CX-1-5',
            kind: 'clause',
            clause: 'SYS-03 / SS-03A',
            text: 'BMS Head-End (SS-03A): L1 and L2 complete; L3 pre-functional testing in progress. On plan.',
          },
          {
            id: 'CX-1-6',
            kind: 'clause',
            clause: 'SYS-01 rollup',
            text: 'System 01 integrated systems testing (L5) is gated on MV Distribution readiness. L4 Functional and L5 Integrated Systems Testing cannot be sequenced until TX-01 is delivered and energized.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-LL-MERIDIAN',
    title: 'LL-DH0-2024 — Project Meridian Lessons-Learned Register',
    docType: 'ScheduleExtract',
    revision: 'Final',
    issued: '30-Nov-2024',
    sourceSystem: 'Knowledge Graph',
    pages: [
      {
        page: 1,
        blocks: [
          { id: 'LL-1-1', kind: 'heading', text: 'DH-0 LESSONS LEARNED — CROSS-PROJECT MEMORY' },
          {
            id: 'LL-1-2',
            kind: 'clause',
            clause: 'DEC-M12',
            text: 'Transformer lead-time slip on DH-0 was mitigated by energizing on temporary phased power while awaiting the delayed unit, and re-baselining the A-line. Outcome: recovered 6 weeks of L5 IST float with no acceleration premium. Approved by J. Mason, 12-Sep-2024.',
          },
          {
            id: 'LL-1-3',
            kind: 'clause',
            clause: 'DEC-M07',
            text: 'A 400V cooling unit was accepted against a 480V requirement via a qualified interposing step-up transformer. No schedule impact. Basis retained for reuse on future data halls. Approved by A. Rao, 30-May-2024.',
          },
        ],
      },
    ],
  },
  {
    id: 'DOC-STD-TIA942',
    title: 'TIA-942-C — Telecommunications Infrastructure Standard (Project Extract)',
    docType: 'Standard',
    revision: 'C',
    issued: '01-Jan-2024',
    sourceSystem: 'Standards Library',
    pages: [
      {
        page: 1,
        blocks: [
          {
            id: 'TIA-1-1',
            kind: 'clause',
            clause: '6.4',
            text: 'Electrical systems serving computer rooms shall provide redundancy consistent with the rated class of the facility, including maintainability of power paths without disruption to critical load.',
          },
        ],
      },
    ],
  },
];
