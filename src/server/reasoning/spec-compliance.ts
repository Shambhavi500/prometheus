/**
 * Spec-Compliance Agent — deterministic evaluators.
 *
 * The extraction step (mapping submittal text to typed values) is represented
 * here by the pre-parsed submittal values below; in production an LLM extracts
 * and this module evaluates. Logic, math, and constraint evaluation are
 * deterministic code, never model output (AI Architecture §2, §6).
 */

import type { TypedGraph } from '../graph/engine';
import { cite } from '../graph/tools';
import type { Finding, SpecCheckRow, TraceStep, DecisionRecord } from '../types';

export interface NumericComparison {
  operator: '=' | '<=' | '>=';
  required: number;
  submitted: number;
}

/** Pure boolean evaluation of a requirement limit. Exported for the Golden-Set-style unit tests. */
export function evaluateLimit(c: NumericComparison): boolean {
  switch (c.operator) {
    case '=':
      return c.submitted === c.required;
    case '<=':
      return c.submitted <= c.required;
    case '>=':
      return c.submitted >= c.required;
  }
}

interface ExtractedValue {
  requirementId: string;
  submittalId: string;
  /** Numeric value extracted from the submittal block, or null when absent (data gap). */
  value: number | null;
  displayValue: string;
  /** Citation anchor in the submittal, when the value (or its absence context) is locatable. */
  docId: string;
  blockId?: string;
  /** Structural extraction confidence (exact table match ⇒ high). */
  confidence: number;
  secondaryDeviation?: string;
}

/** Perception-layer output for NVIDIA AI Factory NVL72-AIFC-001 (stands in for LLM extraction). */
const EXTRACTIONS: ExtractedValue[] = [
  // CDU thermal capacity: submitted 128 kW vs required ≥ 142 kW — DEVIATION
  { requirementId: 'REQ-COOL-001', submittalId: 'SUB-CDU-R1', value: 128, displayValue: '128 kW (PCS-LCC-128 standard model)', docId: 'DOC-SUB-CDU-R1', blockId: 'SCD-2-1', confidence: 0.97, secondaryDeviation: 'Vendor notes an uprated coil insert (PCS-CI-LCC-142) is required for 142 kW — 6-week uplift lead time' },
  // CDU inrush current: not stated in submittal — DATA GAP
  { requirementId: 'REQ-COOL-002', submittalId: 'SUB-CDU-R1', value: null, displayValue: 'Not stated — refer to factory', docId: 'DOC-SUB-CDU-R1', blockId: 'SCD-3-3', confidence: 0.92 },
  // ConnectX-8 MZB compute bandwidth: submitted 800 Gb/s per NIC — COMPLIANT
  { requirementId: 'REQ-NET-001', submittalId: 'SUB-RACK-R2', value: 800, displayValue: '800 Gb/s per ConnectX-8 SuperNIC (4 per tray)', docId: 'DOC-SUB-RACK-R2', blockId: 'SRK-2-1', confidence: 0.99 },
  // NVLink port count per GPU: submitted 18 — COMPLIANT
  { requirementId: 'REQ-NVLINK-001', submittalId: 'SUB-RACK-R2', value: 18, displayValue: '18 NVSwitch ASICs per GPU via copper backplane', docId: 'DOC-SUB-RACK-R2', blockId: 'SRK-3-1', confidence: 0.99 },
];

export interface SpecEvaluation {
  rows: SpecCheckRow[];
  findings: Finding[];
}

let checkSeq = 0;
const nextCheckId = () => `CHK-${String(++checkSeq).padStart(2, '0')}`;

export function runSpecCompliance(graph: TypedGraph, ids: { risk: () => string; decision: () => string; finding: () => string }): SpecEvaluation {
  checkSeq = 0;
  const rows: SpecCheckRow[] = [];
  const findings: Finding[] = [];

  for (const ex of EXTRACTIONS) {
    const req = graph.requireNode(ex.requirementId);
    const equipmentId = graph.out(ex.requirementId, 'APPLIES_TO')[0]?.to;
    const equipment = equipmentId ? graph.requireNode(equipmentId) : undefined;
    const submittal = graph.requireNode(ex.submittalId);
    const specCitation = cite(String(req.props.docId), String(req.props.blockId));
    const submittalCitation = ex.blockId ? cite(ex.docId, ex.blockId) : undefined;

    const requiredValue = req.props.value;
    const unit = req.props.unit ? ` ${req.props.unit}` : '';
    const requiredDisplay = typeof requiredValue === 'number' ? `${req.props.operator === '>=' ? '≥ ' : req.props.operator === '<=' ? '≤ ' : ''}${requiredValue}${unit}${req.props.secondary ? `, ${req.props.secondary}` : ''}` : String(req.name);

    let verdict: SpecCheckRow['verdict'];
    if (ex.value === null) {
      verdict = 'Data Gap';
    } else if (typeof requiredValue === 'number') {
      const pass = evaluateLimit({ operator: req.props.operator as NumericComparison['operator'], required: requiredValue, submitted: ex.value });
      verdict = pass ? 'Compliant' : 'Deviation';
    } else {
      verdict = 'Compliant';
    }

    const row: SpecCheckRow = {
      id: nextCheckId(),
      requirementId: req.id,
      requirementTag: req.tag,
      equipmentId: equipment?.id ?? '',
      equipmentTag: equipment?.tag ?? '',
      submittalId: submittal.id,
      submittalTag: submittal.tag,
      parameter: String(req.props.parameter),
      required: requiredDisplay,
      submitted: ex.displayValue,
      verdict,
      confidence: ex.value === null ? null : ex.confidence,
      specCitation,
      submittalCitation,
    };

    if (verdict === 'Deviation') {
      const riskId = ids.risk();
      const decisionId = ids.decision();
      const findingId = ids.finding();
      row.findingId = findingId;
      const trace: TraceStep[] = [
        { index: 1, total: 4, actor: 'Spec-Compliance Agent', text: `Extracting ${String(req.props.parameter).toLowerCase()} requirement from ${specCitation.docTitle} Clause ${specCitation.clause}...`, payload: { requirement: requiredDisplay, source: specCitation.blockId } },
        { index: 2, total: 4, actor: 'Spec-Compliance Agent', text: `Extracting submitted electrical data from ${submittal.tag}, pg ${submittalCitation?.page}...`, payload: { submitted: ex.displayValue, source: ex.blockId } },
        { index: 3, total: 4, actor: 'Spec-Compliance Agent', text: `Evaluating deterministic comparison: required ${requiredValue}${unit} = submitted ${ex.value}${unit} → false.`, payload: { operator: req.props.operator, required: requiredValue, submitted: ex.value } },
        { index: 4, total: 4, actor: 'Spec-Compliance Agent', text: `Deviation recorded. Confidence ${(ex.confidence * 100).toFixed(0)}% (exact parameter match in validated submittal).` },
      ];
      const isNvidiaCooling = req.id === 'REQ-COOL-001';
      findings.push({
        id: findingId,
        agentId: 'AGT-SPEC',
        agentName: 'Spec-Compliance Agent',
        kind: 'spec-deviation',
        severity: 'High',
        title: `${equipment?.tag} ${String(req.props.parameter).toLowerCase()} deviation`,
        finding: `${submittal.tag} (Precision Cooling Systems AG) states ${ex.displayValue}, conflicting with the NVIDIA-required ${requiredDisplay} threshold [${specCitation.docTitle}, Clause ${specCitation.clause}].${ex.secondaryDeviation ? ` Note from vendor: ${ex.secondaryDeviation}.` : ''}`,
        impact: isNvidiaCooling
          ? `A CDU rated at 128 kW cannot sustain the full GB300 NVL72 rack TDP of 142 kW under sustained training workloads. Under full 72-GPU LLM training load, GPU thermal throttling will activate within 4–6 hours, degrading training throughput by an estimated 10%. L1 FAT witness cannot proceed until the spec deviation is resolved.`
          : `Non-compliant ${String(req.props.parameter).toLowerCase()} blocks L2 commissioning of the affected subsystem. Rework discovered at FAT stage is estimated at 6 weeks.`,
        recommendation: isNvidiaCooling
          ? `Issue RFI-CDU-001 to Precision Cooling Systems AG requesting the uprated coil insert kit (PCS-CI-LCC-142) which lifts CDU capacity to 142 kW. Evaluate interim de-rated GPU cluster operation at 90% TDP (65 active GPUs of 72) consistent with NVL72-PILOT Hyderabad precedent (DEC-P02).`
          : `Generate RFI to Owner documenting the deviation. Hold ${submittal.tag} disposition pending vendor response.`,
        confidence: ex.confidence,
        citations: [specCitation, ...(submittalCitation ? [submittalCitation] : [])],
        trace,
        entityIds: [equipment?.id ?? '', submittal.id, req.id].filter(Boolean),
        riskId,
        decisionId,
      });
    }

    if (verdict === 'Data Gap') {
      const riskId = ids.risk();
      const decisionId = ids.decision();
      const findingId = ids.finding();
      row.findingId = findingId;
      const trace: TraceStep[] = [
        { index: 1, total: 3, actor: 'Spec-Compliance Agent', text: `Extracting ${String(req.props.parameter).toLowerCase()} requirement from ${specCitation.docTitle} Clause ${specCitation.clause}...` },
        { index: 2, total: 3, actor: 'Spec-Compliance Agent', text: `Scanning ${submittal.tag} electrical data sheet for inrush current declaration... field present but value reads: 'Not stated — refer to factory'.`, payload: { scannedPages: [1, 2, 3] } },
        { index: 3, total: 3, actor: 'Spec-Compliance Agent', text: 'Cannot evaluate LV switchboard protection coordination deterministically. Escalating for human input.' },
      ];
      findings.push({
        id: findingId,
        agentId: 'AGT-SPEC',
        agentName: 'Spec-Compliance Agent',
        kind: 'data-gap',
        severity: 'Medium',
        title: `${equipment?.tag} inrush current not stated in submittal`,
        finding: `${submittal.tag} (Precision Cooling Systems AG) does not state the CDU inrush current (peak, 200ms) required by [${specCitation.docTitle}, Clause ${specCitation.clause}]. LV switchboard protection coordination for the data hall PDU cannot be completed without this data.`,
        impact: `LV switchboard protection relay settings (IDMT curves) for the AI Factory main distribution cannot be finalized. Risk of nuisance tripping during CDU start-up at rack energization, which could interrupt all 72 GPUs in the affected rack.`,
        recommendation: `Request inrush current data (peak, 200ms) from Precision Cooling Systems AG and require re-submission of the ${submittal.tag} electrical data sheet before rack energization approval.`,
        confidence: 0.92,
        citations: [specCitation, ...(submittalCitation ? [submittalCitation] : [])],
        trace,
        entityIds: [equipment?.id ?? '', submittal.id, req.id].filter(Boolean),
        riskId,
        decisionId,
      });
    }

    rows.push(row);
  }

  return { rows, findings };
}

import { ExtractedSpec } from '@/core/utils/ai';

export function evaluateDynamicExtraction(
  ex: ExtractedSpec,
  submittalTag: string,
  docId: string,
  graph: TypedGraph,
  ids: { risk: () => string; decision: () => string; finding: () => string; check: () => string }
): { row: SpecCheckRow; finding?: Finding; decision?: DecisionRecord } | null {
  const allNodes = graph.allNodes();
  
  // Find equipment
  const equipment = allNodes.find(n => n.type === 'Equipment' && (n.tag === ex.equipmentTag || n.name === ex.equipmentTag));
  if (!equipment) return null;

  // Find requirement
  const requirementEdges = graph.in(equipment.id, 'APPLIES_TO');
  const requirements = requirementEdges.map(e => graph.requireNode(e.from));
  
  const req = requirements.find(r => 
    String(r.props.parameter).toLowerCase().includes(ex.parameter.toLowerCase()) ||
    ex.parameter.toLowerCase().includes(String(r.props.parameter).toLowerCase())
  );
  if (!req) return null;

  // Mock submittal node if it doesn't exist, though we could just create a transient one
  const submittalNode = allNodes.find(n => n.tag === submittalTag);
  const submittalId = submittalNode ? submittalNode.id : `SUB-${Date.now()}`;
  
  const specCitation = cite(String(req.props.docId), String(req.props.blockId));
  const submittalCitation = cite(docId, 'Extracted by AI');

  const requiredValue = req.props.value;
  const unit = req.props.unit ? ` ${req.props.unit}` : '';
  const requiredDisplay = typeof requiredValue === 'number' ? `${req.props.operator === '>=' ? '≥ ' : req.props.operator === '<=' ? '≤ ' : ''}${requiredValue}${unit}${req.props.secondary ? `, ${req.props.secondary}` : ''}` : String(req.name);

  // Parse numeric value from AI extraction (e.g. "5.75%" -> 5.75)
  const numericMatch = ex.value.match(/[\d.]+/);
  const parsedValue = numericMatch ? parseFloat(numericMatch[0]) : null;

  let verdict: SpecCheckRow['verdict'];
  if (parsedValue === null) {
    verdict = 'Data Gap';
  } else if (typeof requiredValue === 'number') {
    const pass = evaluateLimit({ operator: req.props.operator as NumericComparison['operator'], required: requiredValue, submitted: parsedValue });
    verdict = pass ? 'Compliant' : 'Deviation';
  } else {
    verdict = 'Compliant';
  }

  const rowId = ids.check ? ids.check() : `CHK-${Date.now()}`;
  
  const row: SpecCheckRow = {
    id: rowId,
    requirementId: req.id,
    requirementTag: req.tag,
    equipmentId: equipment.id,
    equipmentTag: equipment.tag,
    submittalId: submittalId,
    submittalTag: submittalTag,
    parameter: String(req.props.parameter),
    required: requiredDisplay,
    submitted: ex.value,
    verdict,
    confidence: 0.95,
    specCitation,
    submittalCitation,
  };

  if (verdict === 'Deviation') {
    const riskId = ids.risk();
    const decisionId = ids.decision();
    const findingId = ids.finding();
    row.findingId = findingId;
    
    const trace: TraceStep[] = [
      { index: 1, total: 4, actor: 'Spec-Compliance Agent', text: `Extracting ${String(req.props.parameter).toLowerCase()} requirement from ${specCitation.docTitle} Clause ${specCitation.clause}...`, payload: { requirement: requiredDisplay, source: specCitation.blockId } },
      { index: 2, total: 4, actor: 'Spec-Compliance Agent', text: `Multimodal LLM extracted submitted electrical data from ${submittalTag}...`, payload: { submitted: ex.value, source: 'AI Extraction' } },
      { index: 3, total: 4, actor: 'Spec-Compliance Agent', text: `Evaluating deterministic comparison: required ${requiredValue}${unit} = submitted ${parsedValue}${unit} → false.`, payload: { operator: req.props.operator, required: requiredValue, submitted: parsedValue } },
      { index: 4, total: 4, actor: 'Spec-Compliance Agent', text: `Deviation recorded. Confidence 95% (multimodal context match).` },
    ];
    
    const finding: Finding = {
      id: findingId,
      agentId: 'AGT-SPEC',
      agentName: 'Spec-Compliance Agent',
      kind: 'spec-deviation',
      severity: 'High',
      title: `${equipment.tag} ${String(req.props.parameter).toLowerCase()} deviation`,
      finding: `${submittalTag} states ${ex.value}, conflicting with the ${requiredDisplay} requirement [${specCitation.docTitle}, Clause ${specCitation.clause}].`,
      impact: `Non-compliant supply blocks L2 energization. Discovered dynamically via AI ingestion.`,
      recommendation: `Generate RFI to Owner documenting the deviation. Hold ${submittalTag} disposition.`,
      confidence: 0.95,
      citations: [specCitation, submittalCitation],
      trace,
      entityIds: [equipment.id, submittalId, req.id],
      riskId,
      decisionId,
    };
    
    const decision: DecisionRecord = {
      id: decisionId,
      findingId,
      severity: 'High',
      agentName: 'Spec-Compliance Agent',
      action: `Generate RFI for ${finding.title.split(' ')[0]} deviation`,
      impact: finding.impact,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      writeBack: { system: 'NVIDIA Mission Control', message: 'RFI-CDU-001 generated and routed to Precision Cooling Systems AG.' },
    };
    
    return { row, finding, decision };
  }
  
  return { row };
}
