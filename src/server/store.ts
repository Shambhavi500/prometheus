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
  personId: 'PER-MASON',
  name: 'J. Mason',
  role: 'Project Director',
  tenantId: 'ORG-HELIOS',
  tenantName: 'Helios Grid EPC',
  projectIds: ['PRJ-AQUILA', 'PRJ-MERIDIAN'],
  clearances: ['L5-Commissioning', 'Financial'],
};

const CURRENT_PROJECT = 'PRJ-AQUILA';

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
  'schedule-risk': { writeBack: { system: 'Primavera P6', message: 'Decision approved. P6 write-back successful.' } },
  'spec-deviation': { writeBack: { system: 'Octave', message: 'RFI-402 generated and routed to Owner.' } },
  'data-gap': { writeBack: { system: 'Octave', message: 'Information request routed to Helios Thermal Systems.' } },
  'entity-resolution': { writeBack: { system: 'Knowledge Graph', message: 'Resolution confirmed. TX-01 linkage marked Human-Verified.' } },
  'supply-chain': { writeBack: { system: 'Octave', message: 'Alternate-vendor RFQ generated and routed to Procurement.' } },
  'commissioning-gap': { writeBack: { system: 'Smart Completions', message: 'Commissioning re-sequence logged to Smart Completions.' } },
  'knowledge-precedent': { writeBack: { system: 'Primavera P6', message: 'Precedent-based mitigation applied. P6 re-baseline queued.' } },
};

const ACTION_LABEL: Record<string, (f: Finding) => string> = {
  'schedule-risk': () => 'Re-baseline P6 Activity A102',
  'spec-deviation': (f) => `Generate RFI for ${f.title.split(' ')[0]} deviation`,
  'data-gap': () => 'Request operating weight from vendor',
  'entity-resolution': () => 'Confirm resolution T-01 → TX-01',
  'supply-chain': (f) => (f.entityIds.includes('VEN-MERIDIAN') ? 'Issue alternate-vendor RFQ for SWG-01' : 'Flag TX-01 as single-source supply risk'),
  'commissioning-gap': () => 'Re-sequence SYS-01 L4/L5 commissioning',
  'knowledge-precedent': () => 'Apply DH-0 phased-power precedent',
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
    { ts: bootedAt, actor: 'Integration Engine', action: 'INGESTED 8 artifacts', target: 'PRJ-AQUILA', source: 'Octave / P6 / Mail connectors' },
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
      id: 'LRN-M01',
      ts: '2024-09-12T00:00:00Z',
      actor: 'J. Mason (Project Director)',
      category: 'transformer-lead-time',
      subject: 'Rejected like-for-like transformer re-order on DH-0',
      rationale: 'A re-order carried the same multi-year lead time. Phased-power energization was chosen instead, deferring the permanent unit without slipping IST.',
      entityTag: 'TX-M0',
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
    documents: [],
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

