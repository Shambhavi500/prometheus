/**
 * Platform store — the Decision & Action (HITL) layer state.
 *
 * System-triggered evaluation: agents run at ingestion time, before any user
 * asks (18_AI Anti-Patterns: the "Chatbot" Fallacy). By the time the
 * workspace loads, the flags already exist. Held in-process for Phase 1;
 * the interface matches the documented FastAPI/graph-backed service.
 */

import type { EntityBase } from '@prometheus/ontology';
import { TypedGraph, type TenantScope } from './graph/engine';
import { buildSeedGraph } from './graph/seed-graph';
import { runSpecCompliance } from './reasoning/spec-compliance';
import { runScheduleRisk } from './reasoning/schedule-risk';
import { runSupplyChain } from './reasoning/supply-chain';
import { runCommissioning } from './reasoning/commissioning';
import { runKnowledge, categoryOf } from './reasoning/knowledge';
import type { AuditEntry, CxNode, DecisionRecord, Finding, IsolationProof, LearningEntry, Precedent, SessionUser, SpecCheckRow, SupplyChainData, UploadedDocument } from './types';

const SESSION_USER: SessionUser = {
  personId: 'PER-SHARMA',
  name: 'A. Sharma',
  role: 'AI Factory Project Director',
  tenantId: 'ORG-NVIDIA-AIFC',
  tenantName: 'NVIDIA AI Factory EPC',
  projectIds: ['PRJ-NVL72-AIFC', 'PRJ-NVL72-PILOT'],
  clearances: ['L5-Commissioning', 'Financial'],
};

const CURRENT_PROJECT = 'PRJ-NVL72-AIFC';

export interface PlatformStore {
  graph: TypedGraph;
  user: SessionUser;
  findings: Finding[];
  specRows: SpecCheckRow[];
  supplyData: SupplyChainData;
  commissioningTree: CxNode[];
  precedents: Precedent[];
  isolation: IsolationProof;
  learnings: LearningEntry[];
  decisions: Map<string, DecisionRecord>;
  audit: AuditEntry[];
  bootedAt: string;
  documents: UploadedDocument[];
}

export function sessionScope(): TenantScope {
  const u = getStore().user;
  return { tenantId: u.tenantId, projectIds: u.projectIds };
}

const SEVERITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 } as const;

export function makeIds() {
  let risk = 200 + Math.floor(Math.random() * 1000);
  let decision = 300 + Math.floor(Math.random() * 1000);
  let finding = 100 + Math.floor(Math.random() * 1000);
  let check = 100 + Math.floor(Math.random() * 1000);
  return {
    risk: () => `RISK-${++risk}`,
    decision: () => `DEC-${++decision}`,
    finding: () => `F-${++finding}`,
    check: () => `CHK-${++check}`,
  };
}

/** Decision metadata that is workflow-specific (action verb, write-back target). */
const DECISION_OVERRIDES: Record<string, Partial<DecisionRecord>> = {
  'schedule-risk': { writeBack: { system: 'Primavera P6', message: 'Decision approved. P6 re-baseline of S400 (Rack Delivery) written back successfully.' } },
  'spec-deviation': { writeBack: { system: 'NVIDIA Mission Control', message: 'RFI-CDU-001 generated and routed to Precision Cooling Systems AG for CDU uprate coil insert.' } },
  'data-gap': { writeBack: { system: 'NVIDIA Mission Control', message: 'Information request routed to Volta Power Systems for inrush current data.' } },
  'entity-resolution': { writeBack: { system: 'Knowledge Graph', message: 'Resolution confirmed. SU-01 linkage marked Human-Verified.' } },
  'supply-chain': { writeBack: { system: 'NVIDIA Mission Control', message: 'Air-freight RFQ for QSFP112/OSFP transceiver batch generated and routed to Procurement.' } },
  'commissioning-gap': { writeBack: { system: 'NVIDIA Mission Control', message: 'AI Factory commissioning re-sequence logged. NVLink cabling critical path updated.' } },
  'knowledge-precedent': { writeBack: { system: 'Primavera P6', message: 'Hyderabad Pilot precedent-based mitigation applied. P6 re-baseline queued.' } },
};

const ACTION_LABEL: Record<string, (f: Finding) => string> = {
  'schedule-risk': () => 'Re-baseline P6 Activity S400 (Rack Delivery) to 20-week lead time',
  'spec-deviation': (f) => `Issue RFI-CDU-001 for ${f.title.split(' ')[0]} CDU capacity deviation`,
  'data-gap': () => 'Request inrush current data from Volta Power Systems',
  'entity-resolution': () => 'Confirm resolution SU-1 → SU-01 entity linkage',
  'supply-chain': (f) => (f.entityIds.includes('VEN-FIBER') ? 'Authorize air-freight of QSFP112/OSFP transceiver batch from Tokyo' : 'Flag PSU shelf as single-source supply risk — Volta Power Systems'),
  'commissioning-gap': () => 'Re-sequence SYS-COMPUTE NVLink L2/L5 commissioning against re-baselined rack delivery',
  'knowledge-precedent': () => 'Apply NVL72-PILOT air-freight precedent for QSFP112 transceiver delay',
};

function boot(): PlatformStore {
  const graph = buildSeedGraph();
  const ids = makeIds();
  const bootedAt = new Date().toISOString();

  const spec = runSpecCompliance(graph, ids);
  const sched = runScheduleRisk(graph, ids);
  const supply = runSupplyChain(graph, ids);
  const commissioning = runCommissioning(graph, ids);
  const base = [...sched.findings, ...supply.findings, ...commissioning.findings, ...spec.findings];

  // Knowledge/Learning runs last: it reasons over the current findings and the
  // tenant-scoped graph memory of prior projects.
  const scope: TenantScope = { tenantId: SESSION_USER.tenantId, projectIds: SESSION_USER.projectIds };
  const knowledge = runKnowledge(graph, scope, base, CURRENT_PROJECT, ids);

  const findings = [...base, ...knowledge.findings].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  );

  const decisions = new Map<string, DecisionRecord>();
  const audit: AuditEntry[] = [
    { ts: bootedAt, actor: 'Integration Engine', action: 'INGESTED 11 artifacts', target: 'PRJ-NVL72-AIFC', source: 'NVIDIA Mission Control / P6 / Mail connectors' },
  ];

  for (const f of findings) {
    // Materialize Risk and Decision entities into the graph — findings are
    // graph memory, not transient chat output (10_KNOWLEDGE_GRAPH §7, §8).
    const risk: EntityBase = {
      id: f.riskId, type: 'Risk', tag: f.riskId, name: f.title, status: 'Open',
      owner: 'PER-MASON', verification: 'SystemVerified',
      tenantId: SESSION_USER.tenantId, projectId: CURRENT_PROJECT,
      props: { severity: f.severity, confidence: f.confidence, agent: f.agentName },
      source: 'baseline',
    };
    graph.addNode(risk);
    graph.addEdge({ id: `E-${f.riskId}-DET`, from: f.agentId, to: f.riskId, verb: 'DETECTED' });
    for (const entityId of f.entityIds) {
      graph.addEdge({ id: `E-${f.riskId}-${entityId}`, from: f.riskId, to: entityId, verb: 'THREATENS' });
    }

    const decision: DecisionRecord = {
      id: f.decisionId,
      findingId: f.id,
      severity: f.severity,
      agentName: f.agentName,
      action: ACTION_LABEL[f.kind]?.(f) ?? f.recommendation,
      impact: f.kind === 'schedule-risk' ? `Mitigates ${f.cascade?.istSlipWeeks}-week L5 IST slip` : f.impact,
      status: 'Pending',
      createdAt: bootedAt,
      source: 'baseline',
      ...DECISION_OVERRIDES[f.kind],
    };
    decisions.set(decision.id, decision);

    const decisionNode: EntityBase = {
      id: f.decisionId, type: 'Decision', tag: f.decisionId, name: decision.action, status: 'Pending',
      owner: 'PER-MASON', verification: 'SystemVerified',
      tenantId: SESSION_USER.tenantId, projectId: CURRENT_PROJECT,
      props: { agent: f.agentName },
      source: 'baseline',
    };
    graph.addNode(decisionNode);
    graph.addEdge({ id: `E-${f.decisionId}-MIT`, from: f.decisionId, to: f.riskId, verb: 'MITIGATES' });

    audit.push({ ts: bootedAt, actor: f.agentName, action: `DETECTED ${f.riskId}`, target: f.entityIds[0] ?? f.riskId, source: f.citations[0] ? `${f.citations[0].docTitle}, pg ${f.citations[0].page}` : 'Knowledge Graph' });
  }

  // Seed one historical lesson so organizational memory is populated on boot;
  // in-session rejections append to this list (11_AI §16 Systemic Learning).
  const learnings: LearningEntry[] = [
    {
      id: 'LRN-P01',
      ts: '2025-06-14T00:00:00Z',
      actor: 'A. Sharma (AI Factory Project Director)',
      category: 'optical-customs-delay',
      subject: 'Authorized air-freight for QSFP112 transceiver batch on NVL72-PILOT (Hyderabad)',
      rationale: 'Standard sea-freight customs clearance would have taken 21 days, slipping NVLink cabling and L2 SAT by 3 weeks. Air-freight at USD 42,000 premium recovered 3 weeks of commissioning float and kept the L5 AI Workload Acceptance milestone on plan.',
      entityTag: 'CDU-PILOT',
      origin: 'historical',
    },
  ];

  return {
    graph,
    user: SESSION_USER,
    findings,
    specRows: spec.rows,
    supplyData: supply.data,
    commissioningTree: commissioning.tree,
    precedents: knowledge.precedents,
    isolation: knowledge.isolation,
    learnings,
    decisions,
    audit,
    bootedAt,
    documents: [
      {
        id: 'DOC-CDUEQUIP-75WC',
        name: 'CDU_Equipment_Specification.pdf',
        uploadedAt: bootedAt,
        status: 'Processed',
        type: 'application/pdf',
        source: 'live',
        findingsCount: 3,
        decisionsCount: 2,
        evidenceCount: 4,
        graphNodesCount: 8,
        pagesProcessed: 12,
        ocrResult: {
          words_result_num: 84,
          words_result: [
            { words: 'SECTION 23 64 26 - COOLING DISTRIBUTION UNITS (CDU)' },
            { words: 'PART 1 - GENERAL DESIGN CRITERIA & THERMAL SPECIFICATIONS' },
            { words: '1.01 EQUIPMENT TAG: CDU-RACK-01 (Primary In-Row Cooling Unit)' },
            { words: '1.02 RATED COOLING CAPACITY: 75.0 kW @ 20°C Delta T (Fluid: PG25)' },
            { words: '1.03 SUBMITTED VENDOR DRAWING: PCS-CDU-MOD-402 (Revision B)' },
            { words: '1.04 SUBMITTED THERMAL CAPACITY: 62.5 kW @ 20°C Delta T [DEVIATION DETECTED]' },
            { words: '1.05 PRIMARY CIRCUIT FLOW RATE: 120 L/min @ 4.2 bar differential pressure' },
            { words: '1.06 SECONDARY LOOP PRESSURE DROP: Max allowable 1.5 bar across server manifold' },
            { words: '1.07 POWER REQUIREMENTS: 415V AC 3-Phase 50Hz, Dual Redundant Feed (A+B)' },
            { words: '1.08 MAXIMUM INRUSH CURRENT: 45.0 Amperes (Soft starter circuit required)' },
            { words: '1.09 GOVERNING CODE CLAUSE: ASHRAE TC 9.9 Thermal Guidelines for Data Processing' },
            { words: '1.10 VERDICT: DEVIATION - Thermal capacity deficit of 12.5 kW vs baseline specification' },
            { words: '1.11 RECOMMENDED MITIGATION: Request vendor uprate coil insert or secondary CDU pump booster' }
          ]
        }
      },
      {
        id: 'DOC-NVSWITCH-88K2',
        name: 'NVLink_Switchgear_SingleLine.pdf',
        uploadedAt: bootedAt,
        status: 'Processed',
        type: 'application/pdf',
        source: 'live',
        findingsCount: 2,
        decisionsCount: 1,
        evidenceCount: 3,
        graphNodesCount: 6,
        pagesProcessed: 6,
        ocrResult: {
          words_result_num: 62,
          words_result: [
            { words: 'DRAWING NO: SLD-NVLINK-15KV-004 REV 3' },
            { words: 'TITLE: SINGLE LINE DIAGRAM - 15kV HIGH VOLTAGE SWITCHGEAR NVSWITCH-TRAY' },
            { words: '2.01 BUSBAR RATING: 3000A Continuous, 50kA / 1-sec Short Circuit Withstand' },
            { words: '2.02 CIRCUIT BREAKER SPEC: Vacuum Breaker 17.5kV 31.5kA Spring Charge' },
            { words: '2.03 PROTECTION RELAY: SEL-751 Feeder Protection Relay w/ Arc Flash Mitigation' },
            { words: '2.04 INTERFACE COUPLING: Direct NVLink Busduct connection to Power Shelf' },
            { words: '2.05 SINGLE SOURCE RISK: Volta Power Systems PSU Shelf single source dependency' },
            { words: '2.06 CONTROL VOLTAGE: 110V DC Station Battery Bank Feed' },
            { words: '2.07 VERDICT: HIGH RISK - PSU shelf single source supplier, no secondary backup' }
          ]
        }
      },
      {
        id: 'DOC-TX01STEP-39P1',
        name: 'TX01_StepDown_Transformer_Manual.pdf',
        uploadedAt: bootedAt,
        status: 'Processed',
        type: 'application/pdf',
        source: 'live',
        findingsCount: 1,
        decisionsCount: 1,
        evidenceCount: 2,
        graphNodesCount: 5,
        pagesProcessed: 24,
        ocrResult: {
          words_result_num: 140,
          words_result: [
            { words: 'TECHNICAL DATA SHEET: TX-01 2.5MVA DRY TYPE TRANSFORMER' },
            { words: '3.01 PRIMARY VOLTAGE: 15.0 kV Delta 3-Phase 50Hz' },
            { words: '3.02 SECONDARY VOLTAGE: 415 V Wye 3-Phase 4-Wire Star Neutral Grounded' },
            { words: '3.03 IMPEDANCE VOLTAGE: 5.75% ± 0.25% at 75°C Reference Temperature' },
            { words: '3.04 COOLING METHOD: ONAN / ONAF Forced Air Booster (Class H Insulation)' },
            { words: '3.05 VENDOR QUOTED LEAD TIME: 78 Weeks (Ex-Factory Hamburg)' },
            { words: '3.06 SCHEDULE RISK: Lead time exceeds P6 schedule window by 18 weeks' },
            { words: '3.07 VERDICT: CRITICAL SCHEDULE BOTTLENECK - Air freight or split shipment required' }
          ]
        }
      },
      {
        id: 'DOC-P6SCHED-10V4',
        name: 'P6_Project_Schedule_Rebaseline_Rev4.pdf',
        uploadedAt: bootedAt,
        status: 'Processed',
        type: 'application/pdf',
        source: 'live',
        findingsCount: 2,
        decisionsCount: 2,
        evidenceCount: 4,
        graphNodesCount: 7,
        pagesProcessed: 8,
        ocrResult: {
          words_result_num: 75,
          words_result: [
            { words: 'PRIMAVERA P6 ENTERPRISE SCHEDULE RE-BASELINE SUMMARY (REV 4)' },
            { words: 'PROJECT: NVIDIA AI FACTORY EPC (PRJ-NVL72-AIFC)' },
            { words: '4.01 ACTIVITY S400: Rack & CDU Delivery to Site (Baseline Finish: 12-Aug-2026)' },
            { words: '4.02 CURRENT FORECAST: 14-Oct-2026 (Slips L5 Commissioning by 9 weeks)' },
            { words: '4.03 CUSTOMS HOLD: QSFP112 Transceiver Batch held at Munich Customs' },
            { words: '4.04 FLOAT ANALYSIS: Critical Path Total Float = -4.5 Weeks' },
            { words: '4.05 RECOMMENDED ACTION: Authorize air-freight precedent to recover 4 weeks float' }
          ]
        }
      },
      {
        id: 'DOC-CXPROTO-55A9',
        name: 'L1_L5_Commissioning_Protocol_Rev2.pdf',
        uploadedAt: bootedAt,
        status: 'Processed',
        type: 'application/pdf',
        source: 'live',
        findingsCount: 1,
        decisionsCount: 1,
        evidenceCount: 3,
        graphNodesCount: 6,
        pagesProcessed: 18,
        ocrResult: {
          words_result_num: 110,
          words_result: [
            { words: 'COMMISSIONING EXECUTION PROTOCOL: LEVEL 1 TO LEVEL 5 INTEGRATED SYSTEM TESTING' },
            { words: '5.01 LEVEL 1 (FAT): Factory Acceptance Testing - Complete for CDU-01 & Switchgear' },
            { words: '5.02 LEVEL 2 (SAT): Site Acceptance & Uncrating - In Progress at Building 2' },
            { words: '5.03 LEVEL 3 (PRE-COMMISSIONING): Dry Run & Hydrostatic Pressure Test - Pending' },
            { words: '5.04 LEVEL 4 (FPT): Functional Performance Test - Scheduled for Sep-2026' },
            { words: '5.05 LEVEL 5 (IST): Integrated Systems Load Bank Test (100% Thermal Load) - At Risk' },
            { words: '5.06 DEPENDENCY LINK: L5 IST requires Level 3 Hydrostatic signoff & P6 Activity S400 arrival' }
          ]
        }
      }
    ],
  };
}

const g = globalThis as unknown as { __prometheusStore?: PlatformStore };

export function getStore(): PlatformStore {
  if (!g.__prometheusStore) g.__prometheusStore = boot();
  return g.__prometheusStore;
}

export function findingById(id: string): Finding | undefined {
  return getStore().findings.find((f) => f.id === id);
}

export function approveDecision(id: string): DecisionRecord {
  const store = getStore();
  const decision = store.decisions.get(id);
  if (!decision) throw new Error(`Unknown decision: ${id}`);
  if (decision.status !== 'Pending') throw new Error(`Decision ${id} is already ${decision.status.toLowerCase()}. State mutations are append-only.`);
  const now = new Date().toISOString();
  decision.status = 'Signed';
  decision.signedBy = store.user.name;
  decision.signedRole = store.user.role;
  decision.signedAt = now;
  const finding = findingById(decision.findingId);
  const node = store.graph.getNode(id);
  if (node) node.status = 'Signed';
  const riskNode = finding ? store.graph.getNode(finding.riskId) : undefined;
  if (riskNode) riskNode.status = 'Mitigated';
  store.graph.addEdge({ id: `E-APPR-${id}`, from: store.user.personId, to: id, verb: 'APPROVES' });
  if (finding?.kind === 'entity-resolution') {
    const tx = store.graph.getNode('EQ-TX01');
    if (tx) tx.verification = 'HumanVerified';
  }
  store.audit.push({ ts: now, actor: `${store.user.name} (${store.user.role})`, action: `APPROVED ${decision.action}`, target: finding?.entityIds[0] ?? id, source: `${decision.agentName}` });
  if (decision.writeBack) {
    store.audit.push({ ts: now, actor: 'MCP Gateway', action: `WRITE-BACK ${id}`, target: decision.writeBack.system, source: 'Signed decision payload' });
  }
  return decision;
}

export function rejectDecision(id: string, rationale: string): DecisionRecord {
  const store = getStore();
  const decision = store.decisions.get(id);
  if (!decision) throw new Error(`Unknown decision: ${id}`);
  if (decision.status !== 'Pending') throw new Error(`Decision ${id} is already ${decision.status.toLowerCase()}.`);
  if (!rationale.trim()) throw new Error('Rationale required. Rejections feed graph memory and cannot be empty.');
  const now = new Date().toISOString();
  decision.status = 'Rejected';
  decision.signedBy = store.user.name;
  decision.signedRole = store.user.role;
  decision.signedAt = now;
  decision.rationale = rationale.trim();
  const node = store.graph.getNode(id);
  if (node) node.status = 'Rejected';
  store.audit.push({ ts: now, actor: `${store.user.name} (${store.user.role})`, action: `REJECTED ${decision.action}`, target: decision.findingId, source: `Rationale: ${decision.rationale}` });

  // The rejection rationale becomes organizational memory, feeding the
  // Knowledge/Learning Agent's future evaluations (04_INTERACTION §5, 11_AI §16).
  const finding = findingById(decision.findingId);
  const entityTag = finding ? store.graph.getNode(finding.entityIds[0] ?? '')?.tag : undefined;
  store.learnings.unshift({
    id: `LRN-${id}`,
    ts: now,
    actor: `${store.user.name} (${store.user.role})`,
    category: finding ? categoryOf(finding) : undefined,
    subject: `Rejected: ${decision.action}`,
    rationale: decision.rationale!,
    entityTag,
    origin: 'session',
  });
  return decision;
}

export function uploadDocument(id: string, name: string, type: string) {
  const store = getStore();
  const now = new Date().toISOString();
  const existingIdx = store.documents.findIndex(d => d.id === id);
  if (existingIdx >= 0) {
    store.documents[existingIdx].name = name;
    store.documents[existingIdx].uploadedAt = now;
    store.documents[existingIdx].status = 'Processing';
    store.documents[existingIdx].type = type;
    return;
  }
  store.documents.unshift({
    id,
    name,
    uploadedAt: now,
    status: 'Processing',
    type,
    source: 'live',
    findingsCount: 0,
    decisionsCount: 0,
    evidenceCount: 0,
    graphNodesCount: 0,
  });
}

export function updateDocumentStatus(id: string, status: UploadedDocument['status']) {
  const doc = getStore().documents.find(d => d.id === id);
  if (doc) doc.status = status;
}

export function updateDocumentOcr(id: string, ocrResult: UploadedDocument['ocrResult'], pagesProcessed = 1) {
  const doc = getStore().documents.find(d => d.id === id);
  if (doc) {
    doc.ocrResult = ocrResult;
    doc.pagesProcessed = pagesProcessed;
  }
}

export function deleteDocument(id: string) {
  const store = getStore();
  // Filter out the document
  store.documents = store.documents.filter(d => d.id !== id);
  
  // Remove all findings, decisions, graph nodes associated with it
  store.findings = store.findings.filter(f => f.documentId !== id);
  
  // Actually we need to delete from the map properly
  for (const [decId, dec] of store.decisions.entries()) {
    if (dec.documentId === id) store.decisions.delete(decId);
  }
  
  // For graph, we can remove nodes matching documentId
  const nodesToRemove = store.graph.allNodes().filter(n => n.documentId === id);
  for (const n of nodesToRemove) {
    store.graph.removeNode(n.id); // Assuming removeNode exists or we can just ignore it for now as this is frontend mock.
  }
}

export function ingestDynamicSpec(row: SpecCheckRow, finding?: Finding, decision?: DecisionRecord, docId?: string) {
  const store = getStore();
  const now = new Date().toISOString();
  
  if (docId) {
    row.findingId = finding?.id;
  }
  store.specRows.unshift(row);

  if (finding && decision) {
    finding.source = 'live';
    finding.timestamp = now;
    finding.documentId = docId;
    store.findings.unshift(finding);
    
    decision.source = 'live';
    decision.timestamp = now;
    decision.documentId = docId;
    store.decisions.set(decision.id, decision);

    if (docId) {
      const doc = store.documents.find(d => d.id === docId);
      if (doc) {
        doc.findingsCount++;
        doc.decisionsCount++;
        doc.evidenceCount += finding.citations.length;
        doc.graphNodesCount += 2; // Risk and Decision
      }
    }

    const risk: EntityBase = {
      id: finding.riskId, type: 'Risk', tag: finding.riskId, name: finding.title, status: 'Open',
      owner: store.user.personId, verification: 'SystemVerified',
      tenantId: store.user.tenantId, projectId: 'PRJ-NVL72-AIFC',
      props: { severity: finding.severity, confidence: finding.confidence, agent: finding.agentName },
      source: 'live',
      timestamp: now,
      documentId: docId,
    };
    store.graph.addNode(risk);
    store.graph.addEdge({ id: `E-${finding.riskId}-DET`, from: finding.agentId, to: finding.riskId, verb: 'DETECTED' });
    for (const entityId of finding.entityIds) {
      store.graph.addEdge({ id: `E-${finding.riskId}-${entityId}`, from: finding.riskId, to: entityId, verb: 'THREATENS' });
    }

    const decisionNode: EntityBase = {
      id: finding.decisionId, type: 'Decision', tag: finding.decisionId, name: decision.action, status: 'Pending',
      owner: store.user.personId, verification: 'SystemVerified',
      tenantId: store.user.tenantId, projectId: 'PRJ-AQUILA',
      props: { agent: finding.agentName },
      source: 'live',
      timestamp: now,
      documentId: docId,
    };
    store.graph.addNode(decisionNode);
    store.graph.addEdge({ id: `E-${finding.decisionId}-MIT`, from: finding.decisionId, to: finding.riskId, verb: 'MITIGATES' });

    store.audit.unshift({ ts: now, actor: finding.agentName, action: `DETECTED ${finding.riskId}`, target: finding.entityIds[0] ?? finding.riskId, source: 'Dynamic Document Ingestion' });
  } else {
    store.audit.unshift({ ts: now, actor: 'Spec-Compliance Agent', action: `VERIFIED ${row.equipmentTag}`, target: row.equipmentTag, source: 'Dynamic Document Ingestion' });
  }
}

export function ingestDynamicFinding(finding: Finding, decision?: DecisionRecord, docId?: string) {
  const store = getStore();
  const now = new Date().toISOString();
  
  finding.source = 'live';
  finding.timestamp = now;
  finding.documentId = docId;
  store.findings.unshift(finding);
  
  if (decision) {
    decision.source = 'live';
    decision.timestamp = now;
    decision.documentId = docId;
    store.decisions.set(decision.id, decision);
  }

  if (docId) {
    const doc = store.documents.find(d => d.id === docId);
    if (doc) {
      doc.findingsCount++;
      if (decision) doc.decisionsCount++;
      doc.evidenceCount += finding.citations.length;
      doc.graphNodesCount += decision ? 2 : 1;
    }
  }

  const risk: EntityBase = {
    id: finding.riskId, type: 'Risk', tag: finding.riskId, name: finding.title, status: 'Open',
    owner: store.user.personId, verification: 'SystemVerified',
    tenantId: store.user.tenantId, projectId: 'PRJ-AQUILA',
    props: { severity: finding.severity, confidence: finding.confidence, agent: finding.agentName },
    source: 'live',
    timestamp: now,
    documentId: docId,
  };
  store.graph.addNode(risk);
  store.graph.addEdge({ id: `E-${finding.riskId}-DET`, from: finding.agentId, to: finding.riskId, verb: 'DETECTED' });
  for (const entityId of finding.entityIds) {
    store.graph.addEdge({ id: `E-${finding.riskId}-${entityId}`, from: finding.riskId, to: entityId, verb: 'THREATENS' });
  }

  if (decision) {
    const decisionNode: EntityBase = {
      id: finding.decisionId, type: 'Decision', tag: finding.decisionId, name: decision.action, status: 'Pending',
      owner: store.user.personId, verification: 'SystemVerified',
      tenantId: store.user.tenantId, projectId: 'PRJ-AQUILA',
      props: { agent: finding.agentName },
      source: 'live',
      timestamp: now,
      documentId: docId,
    };
    store.graph.addNode(decisionNode);
    store.graph.addEdge({ id: `E-${finding.decisionId}-MIT`, from: finding.decisionId, to: finding.riskId, verb: 'MITIGATES' });
  }

  store.audit.unshift({ ts: now, actor: finding.agentName, action: `DETECTED ${finding.riskId}`, target: finding.entityIds[0] ?? finding.riskId, source: 'Dynamic Document Ingestion' });
}

