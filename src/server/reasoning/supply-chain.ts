/**
 * Supply-Chain Agent — deterministic vendor/logistics risk evaluation.
 *
 * Aggregates NVIDIA component vendor performance and NVIDIA AI Factory
 * shipment state into a geospatial risk layer. Raises findings for:
 * - Customs-held optical transceiver batch (critical path for NVLink cabling)
 * - PDU power shelf single-source vendor risk (Volta Power Systems)
 *
 * Risk scoring is deterministic; the LLM only extracts source text.
 * Based on: NVIDIA GB300 NVL72 AI Factory Reference Architecture
 */

import type { TypedGraph } from '../graph/engine';
import { cite } from '../graph/tools';
import type { Finding, GeoPoint, RiskLevel, ShipmentArc, SupplyChainData, TraceStep, DecisionRecord } from '../types';

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 0.7) return 'Critical';
  if (score >= 0.35) return 'Elevated';
  return 'Nominal';
}

/** Vendor risk = concentration/status weighted against 12-month on-time performance.
 *  Pure and exported for the deterministic-core tests. */
export function vendorRiskScore(input: { onTimeRate: number; forceMajeure: boolean; singleSource: boolean }): number {
  const performanceRisk = 1 - input.onTimeRate;
  const statusRisk = input.forceMajeure ? 0.6 : 0;
  const concentrationRisk = input.singleSource ? 0.2 : 0;
  return Math.min(1, Math.round((performanceRisk + statusRisk + concentrationRisk) * 100) / 100);
}

export interface SupplyEvaluation {
  data: SupplyChainData;
  findings: Finding[];
}

export function runSupplyChain(
  graph: TypedGraph,
  ids: { risk: () => string; decision: () => string; finding: () => string },
): SupplyEvaluation {
  const site = graph.requireNode('PRJ-NVL72-AIFC');
  const sitePoint: GeoPoint = {
    id: site.id, tag: 'NVL72-AIFC-001', name: 'NVIDIA AI Factory — Pune Cluster (NVL72-AIFC-001)', kind: 'site',
    lat: 18.52, lon: 73.85,
    city: 'Pune', country: 'India', region: 'APAC',
    riskScore: 0, riskLevel: 'Nominal',
  };

  const vendors = graph.allNodes().filter((nd) => nd.type === 'Vendor');
  const points: GeoPoint[] = [sitePoint];
  const riskById = new Map<string, number>();

  for (const v of vendors) {
    const onTime = Number(v.props.onTimeRate12mo);
    const forceMajeure = v.status === 'Force Majeure';
    // VEN-PDU (Volta Power Systems) is sole qualified source for 33kW PSU shelves
    const singleSource = v.id === 'VEN-PDU';
    const score = vendorRiskScore({ onTimeRate: onTime, forceMajeure, singleSource });
    riskById.set(v.id, score);
    points.push({
      id: v.id, tag: v.tag, name: v.name, kind: 'vendor',
      lat: Number(v.props.lat), lon: Number(v.props.lon),
      city: String(v.props.city), country: String(v.props.country), region: String(v.props.region),
      riskScore: score, riskLevel: riskLevelFromScore(score), onTimeRate: onTime,
      note: forceMajeure ? 'Force majeure — outbound logistics suspended' : singleSource ? 'Sole qualified source for 33kW PSU shelves (NVL72 rack power)' : undefined,
    });
  }

  const shipments = graph.allNodes().filter((nd) => nd.type === 'Shipment');
  const arcs: ShipmentArc[] = shipments.map((s) => {
    const originId = graph.out(s.id, 'ORIGINATES_FROM')[0]?.to ?? '';
    const poId = graph.out(s.id, 'SHIPPED_UNDER')[0]?.to ?? '';
    return {
      id: s.id, tag: s.tag, poTag: graph.getNode(poId)?.tag ?? poId,
      cargo: String(s.props.cargo), fromId: originId, toId: site.id,
      status: s.status ?? 'Unknown', detail: String(s.props.eta),
      riskLevel: (String(s.props.risk) as RiskLevel) ?? 'Nominal',
    };
  });

  const findings: Finding[] = [];

  // Finding 1 — QSFP112/OSFP optical transceiver batch held at Pune customs (Critical).
  // Critical path: transceiver delivery → NVLink inter-rack cabling → L2 SAT → GPU burn-in → L5 Acceptance
  {
    const heldShipments = shipments.filter((s) => s.id === 'SHP-FIBER-001');
    const noticeCite = cite('DOC-VN-FIBER', 'VN-1-3');
    const cxCite = cite('DOC-CX-AIFC', 'CX-1-3');
    const riskId = ids.risk();
    const decisionId = ids.decision();
    const findingId = ids.finding();
    const trace: TraceStep[] = [
      { index: 1, total: 4, actor: 'Orchestrator', text: 'Routing to Supply-Chain Agent...' },
      { index: 2, total: 4, actor: 'Supply-Chain Agent', text: 'Ingesting vendor notice VN-2026-221 from OptiCore Japan for PO-2094...', payload: { source: 'VN-1-2' } },
      { index: 3, total: 4, actor: 'Supply-Chain Agent', text: `Traversing graph: SHP-FIBER-001 (3,456 QSFP112 + 1,152 OSFP) status: Held — Pune customs. Batch on critical path for NVLink inter-rack cabling SU-04 to SU-08.`, payload: { shipments: ['SHP-FIBER-001'] } },
      { index: 4, total: 4, actor: 'Supply-Chain Agent', text: 'Mapping to commissioning: SS-COMPUTE-B L1 FAT and SS-NVLINK L2 SAT cannot proceed without transceiver batch. Escalating Critical.' },
    ];
    findings.push({
      id: findingId, agentId: 'AGT-SUPPLY', agentName: 'Supply-Chain Agent', kind: 'supply-chain',
      severity: 'Critical',
      title: 'QSFP112/OSFP transceiver batch held at Pune customs — NVLink cabling blocked',
      finding: `OptiCore Japan (PO-2094) QSFP112 and OSFP optical transceiver batch (3,456 + 1,152 units) is held at Pune Customs under enhanced dual-use electronics inspection protocol [VN-2026-221, Clause 2.1]. Estimated clearance: 10–14 working days from 14-Jul-2026.`,
      impact: `The held batch covers all QSFP112 modules for the Spectrum-X dual-plane compute fabric (SU-04 to SU-08) and all OSFP transceivers for SN5610 leaf switch ports. Without clearance, NVLink inter-rack fiber cabling cannot begin, blocking L2 SAT NVLink domain validation and threatening the L5 AI Workload Acceptance milestone [CX-AIFC-001 Rev 3, SS-COMPUTE-B].`,
      recommendation: `Authorize air-freight of the customs-cleared transceiver batch at premium freight cost, consistent with the NVL72-PILOT Hyderabad precedent (DEC-P01, recovered 3 weeks). Simultaneously pre-terminate fiber cables for SU-04 to SU-08 in parallel.`,
      confidence: 0.93,
      citations: [noticeCite, cxCite],
      trace,
      entityIds: ['VEN-FIBER', 'PO-2094', 'SHP-FIBER-001', 'SS-COMPUTE-B', 'SS-NVLINK'],
      riskId, decisionId,
    });
  }

  // Finding 2 — Volta Power Systems single-source geographic/performance risk (High).
  {
    const vprCite = cite('DOC-VPR-2026', 'VPR-1-2');
    const pduScore = riskById.get('VEN-PDU') ?? 0;
    const riskId = ids.risk();
    const decisionId = ids.decision();
    const findingId = ids.finding();
    const trace: TraceStep[] = [
      { index: 1, total: 3, actor: 'Supply-Chain Agent', text: 'Reading Vendor Performance Register VPR-2026-Q2 (APAC)...', payload: { source: 'VPR-1-2' } },
      { index: 2, total: 3, actor: 'Supply-Chain Agent', text: 'Volta Power Systems on-time rate 77%; sole qualified source for 5.5 kW PSU modules (33 kW shelf); no secondary source listed. Q3 backlog adds 3–4 week risk.', payload: { onTimeRate: 0.77, singleSource: true } },
      { index: 3, total: 3, actor: 'Supply-Chain Agent', text: `Computed aggregate vendor risk ${(pduScore * 100).toFixed(0)}% (performance + single-source concentration).` },
    ];
    findings.push({
      id: findingId, agentId: 'AGT-SUPPLY', agentName: 'Supply-Chain Agent', kind: 'supply-chain',
      severity: 'High',
      title: '33kW PSU shelves are single-source with substandard delivery history',
      finding: `Volta Power Systems (Singapore) is the sole qualified source for the 5.5 kW hot-swap PSU modules used in the 33 kW power shelves (8/rack × 8 racks = 64 shelves total, PO-2098). Their 12-month on-time delivery rate is 77% [VPR-2026-Q2], and Q3 factory backlog may extend lead times by 3–4 weeks. No secondary qualified source is listed in the approved vendor register. Aggregate vendor risk: ${(pduScore * 100).toFixed(0)}%.`,
      impact: `A further 3–4 week slip in power shelf delivery will delay the Power Distribution Site Acceptance (L2), blocking rack installation commissioning for all 8 NVL72 SUs. The GPU burn-in (L3) and L5 AI Workload Acceptance milestones cannot be sequenced without energized power shelves.`,
      recommendation: `Initiate qualification of a secondary PSU shelf vendor (5.5 kW hot-swap, 33 kW shelf format) and flag Volta Power Systems as a single-source supply risk on the procurement register. Evaluate strategic safety stock (8–12 weeks of critical PSU modules).`,
      confidence: 0.85,
      citations: [vprCite],
      trace,
      entityIds: ['VEN-PDU', 'PO-2098', 'EQ-PSU-SHELF'],
      riskId, decisionId,
    });
  }

  return { data: { points, arcs }, findings };
}

import { ExtractedSupply } from '@/core/utils/ai';

export function evaluateDynamicSupplyRisk(
  ex: ExtractedSupply,
  docId: string,
  graph: TypedGraph,
  ids: { risk: () => string; decision: () => string; finding: () => string }
): { finding: Finding; decision: DecisionRecord } | null {
  if (ex.status === 'Nominal') return null;
  
  const allNodes = graph.allNodes();
  const vendor = allNodes.find(n => n.type === 'Vendor' && (n.name.toLowerCase().includes(ex.vendorName.toLowerCase()) || (n.tag && n.tag.toLowerCase().includes(ex.vendorName.toLowerCase()))));
  if (!vendor) return null;

  // Recompute score dynamically
  const onTime = Number(vendor.props.onTimeRate12mo) || 0.95;
  const forceMajeure = ex.status === 'Force Majeure';
  const singleSource = vendor.id === 'VEN-PDU'; 
  const score = vendorRiskScore({ onTimeRate: onTime, forceMajeure, singleSource });

  const decisionId = ids.decision();

  const finding: Finding = {
    id: ids.finding(),
    agentId: 'AGT-SUPPLY',
    agentName: 'Supply-Chain Agent',
    kind: 'supply-chain',
    severity: score >= 0.7 ? 'Critical' : score >= 0.35 ? 'High' : 'Medium',
    title: `${vendor.name} ${ex.status.toLowerCase()} detected`,
    finding: `Dynamic ingestion identified a ${ex.status} status for ${vendor.name} [${docId}]. Note: ${ex.note || 'None'}. Aggregate vendor risk score updated to ${(score * 100).toFixed(0)}%.`,
    impact: `Shipments originating from ${vendor.name} are at elevated risk, potentially blocking downstream AI Factory commissioning.`,
    recommendation: `Issue alternate-vendor assessment for NVIDIA AI Factory scopes tied to ${vendor.name} and evaluate expediting from secondary sources.`,
    confidence: 0.9,
    citations: [{ docId, docTitle: `AI Extraction (${docId})`, page: 1, blockId: 'dynamic-extract', quote: `Status: ${ex.status}`, clause: 'Vendor Notice' }],
    trace: [
      { index: 1, total: 3, actor: 'Supply-Chain Agent', text: `Extracted ${ex.status} status for ${vendor.name} from ${docId}.`, payload: { status: ex.status } },
      { index: 2, total: 3, actor: 'Supply-Chain Agent', text: `Recalculating vendor risk score...`, payload: { forceMajeure, onTime } },
      { index: 3, total: 3, actor: 'Supply-Chain Agent', text: `Vendor risk score updated to ${(score * 100).toFixed(0)}%. Escalating.` }
    ],
    entityIds: [vendor.id],
    riskId: ids.risk(),
    decisionId,
  };

  const decision: DecisionRecord = {
    id: decisionId,
    findingId: finding.id,
    severity: finding.severity,
    agentName: 'Supply-Chain Agent',
    action: `Issue alternate-vendor assessment for ${vendor.name}`,
    impact: finding.impact,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    writeBack: { system: 'NVIDIA Mission Control', message: 'Alternate-vendor RFQ generated and routed to Procurement.' }
  };

  return { finding, decision };
}
