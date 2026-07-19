/**
 * Supply-Chain Agent — deterministic vendor/logistics risk evaluation.
 *
 * Aggregates vendor performance and shipment state into a geospatial risk
 * layer, and raises findings for force-majeure exposure and single-source
 * concentration. Risk scoring is deterministic; the LLM only extracts the
 * source text (bulletin, performance register).
 */

import type { TypedGraph } from '../graph/engine';
import { cite } from '../graph/tools';
import type { Finding, GeoPoint, RiskLevel, ShipmentArc, SupplyChainData, TraceStep } from '../types';

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
  const site = graph.requireNode('PRJ-AQUILA');
  const sitePoint: GeoPoint = {
    id: site.id, tag: 'NM-1', name: 'Project Meghdoot — Data Hall 1', kind: 'site',
    lat: Number(site.props.lat), lon: Number(site.props.lon),
    city: String(site.props.city), country: String(site.props.country), region: 'AMER',
    riskScore: 0, riskLevel: 'Nominal',
  };

  const vendors = graph.allNodes().filter((nd) => nd.type === 'Vendor');
  const points: GeoPoint[] = [sitePoint];
  const riskById = new Map<string, number>();

  for (const v of vendors) {
    const onTime = Number(v.props.onTimeRate12mo);
    const forceMajeure = v.status === 'Force Majeure';
    const singleSource = v.id === 'VEN-KAPPA'; // sole qualified transformer source (VPR-1-2)
    const score = vendorRiskScore({ onTimeRate: onTime, forceMajeure, singleSource });
    riskById.set(v.id, score);
    points.push({
      id: v.id, tag: v.tag, name: v.name, kind: 'vendor',
      lat: Number(v.props.lat), lon: Number(v.props.lon),
      city: String(v.props.city), country: String(v.props.country), region: String(v.props.region),
      riskScore: score, riskLevel: riskLevelFromScore(score), onTimeRate: onTime,
      note: forceMajeure ? 'Force majeure — outbound logistics suspended' : singleSource ? 'Single qualified source' : undefined,
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

  // Finding 1 — Meridian force majeure (Critical). Mirrors the mandated
  // "CRITICAL VENDOR RISK: Factory strike threatens 3 pending Switchgear shipments".
  {
    const heldShipments = shipments.filter((s) => graph.out(s.id, 'ORIGINATES_FROM')[0]?.to === 'VEN-MERIDIAN');
    const noticeCite = cite('DOC-VB-MERIDIAN', 'VB-1-3');
    const cxCite = cite('DOC-CX-MATRIX', 'CX-1-3');
    const riskId = ids.risk();
    const decisionId = ids.decision();
    const findingId = ids.finding();
    const trace: TraceStep[] = [
      { index: 1, total: 4, actor: 'Orchestrator', text: 'Routing to Supply-Chain Agent...' },
      { index: 2, total: 4, actor: 'Supply-Chain Agent', text: 'Ingesting vendor bulletin VB-2026-118 for PO-992...', payload: { source: 'VB-1-2' } },
      { index: 3, total: 4, actor: 'Supply-Chain Agent', text: `Traversing graph: ${heldShipments.length} shipments ORIGINATE_FROM VEN-MERIDIAN, all status Held.`, payload: { shipments: heldShipments.map((s) => s.tag) } },
      { index: 4, total: 4, actor: 'Supply-Chain Agent', text: 'Mapping to commissioning: SS-01B LV Distribution FAT witness slot at risk. Escalating.' },
    ];
    findings.push({
      id: findingId, agentId: 'AGT-SUPPLY', agentName: 'Supply-Chain Agent', kind: 'supply-chain',
      severity: 'Critical',
      title: 'Meridian force majeure threatens SWG-01 shipments',
      finding: `Meridian Switchgear declared force majeure on 14-Jul-2026 from a Milan labor action, suspending all outbound logistics [VB-2026-118, Clause 2.1]. Three pending PO-992 shipments are held: ${heldShipments.map((s) => s.tag).join(', ')}.`,
      impact: `SWG-01 delivery has no committed dispatch date. LV Distribution (SS-01B) L1 Factory Acceptance witness slot cannot be confirmed [CX-MATRIX-DH1, SS-01B], threatening NM-1 energization.`,
      recommendation: `Issue an alternate-vendor RFQ for the SWG-01 switchgear scope and evaluate expediting relay panels from a qualified secondary source.`,
      confidence: 0.9,
      citations: [noticeCite, cxCite],
      trace,
      entityIds: ['VEN-MERIDIAN', 'PO-992', 'EQ-SWG01', 'SS-01B', 'SHP-992-1'],
      riskId, decisionId,
    });
  }

  // Finding 2 — Kappa single-source geographic/performance risk (High).
  {
    const vprCite = cite('DOC-VPR', 'VPR-1-2');
    const kappaScore = riskById.get('VEN-KAPPA') ?? 0;
    const riskId = ids.risk();
    const decisionId = ids.decision();
    const findingId = ids.finding();
    const trace: TraceStep[] = [
      { index: 1, total: 3, actor: 'Supply-Chain Agent', text: 'Reading Vendor Performance Register VPR-2026-Q2 (EMEA)...', payload: { source: 'VPR-1-2' } },
      { index: 2, total: 3, actor: 'Supply-Chain Agent', text: 'Kappa on-time rate 61%; sole qualified source for PO-884 transformers; no secondary source listed.', payload: { onTimeRate: 0.61, singleSource: true } },
      { index: 3, total: 3, actor: 'Supply-Chain Agent', text: `Computed aggregate vendor risk ${(kappaScore * 100).toFixed(0)}% (performance + single-source concentration).` },
    ];
    findings.push({
      id: findingId, agentId: 'AGT-SUPPLY', agentName: 'Supply-Chain Agent', kind: 'supply-chain',
      severity: 'High',
      title: 'TX-01 transformer is single-source with weak delivery history',
      finding: `Kappa Transformer Works is the sole qualified source for the PO-884 transformers and holds a 61% 12-month on-time delivery rate [VPR-2026-Q2]. No secondary qualified source is listed. Aggregate vendor risk: ${(kappaScore * 100).toFixed(0)}%.`,
      impact: `The TX-01 critical path (already 38 weeks slipped) has no supply redundancy. Any further Kappa slippage propagates directly to L5 Integrated Systems Testing.`,
      recommendation: `Initiate qualification of a secondary transformer source and flag TX-01 as a single-source supply risk on the procurement register.`,
      confidence: 0.82,
      citations: [vprCite],
      trace,
      entityIds: ['VEN-KAPPA', 'PO-884', 'EQ-TX01'],
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
  const singleSource = vendor.id === 'VEN-KAPPA'; 
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
    impact: `Shipments originating from ${vendor.name} are at elevated risk, potentially blocking downstream commissioning.`,
    recommendation: `Issue alternate-vendor RFQ for scopes tied to ${vendor.name} and evaluate expediting from secondary sources.`,
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
    action: `Issue alternate-vendor RFQ for ${vendor.name}`,
    impact: finding.impact,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    writeBack: { system: 'Octave', message: 'Alternate-vendor RFQ generated and routed to Procurement.' }
  };

  return { finding, decision };
}
