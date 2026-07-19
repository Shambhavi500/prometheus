/**
 * Platform types — findings, decisions, reasoning traces, audit.
 * These are the payload contracts between the Reasoning Layer, the
 * Decision & Action (HITL) layer, and the Workspace UI components.
 */

import type { Citation } from '@prometheus/ontology';

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type Verdict = 'Compliant' | 'Deviation' | 'Data Gap';

export interface TraceStep {
  index: number;
  total: number;
  actor: string; // 'Orchestrator' | 'Spec-Compliance Agent' | …
  text: string;
  /** Raw data payload exposed when the user clicks the stream step. */
  payload?: Record<string, unknown>;
}

export interface CascadeStep {
  activityId: string;
  entityId: string;
  name: string;
  level?: string;
  baselineStart: string; // ISO
  baselineFinish: string; // ISO
  predictedFinish: string; // ISO
  slipInWeeks: number;
  floatAbsorbedWeeks: number;
  slipOutWeeks: number;
}

export interface CascadeResult {
  originActivityId: string;
  quotedLeadTimeWeeks: number;
  assumedLeadTimeWeeks: number;
  slipAtOriginWeeks: number;
  istSlipWeeks: number;
  steps: CascadeStep[];
}

export interface SpecCheckRow {
  id: string;
  requirementId: string;
  requirementTag: string;
  equipmentId: string;
  equipmentTag: string;
  submittalId: string;
  submittalTag: string;
  parameter: string;
  required: string;
  submitted: string;
  verdict: Verdict;
  confidence: number | null;
  specCitation: Citation;
  submittalCitation?: Citation;
  findingId?: string;
}

export type FindingKind =
  | 'spec-deviation'
  | 'schedule-risk'
  | 'entity-resolution'
  | 'data-gap'
  | 'supply-chain'
  | 'commissioning-gap'
  | 'knowledge-precedent';

export interface Finding {
  id: string;
  agentId: string;
  agentName: string;
  kind: FindingKind;
  severity: Severity;
  title: string;
  /** Finding / Impact / Recommended Action — structured per 07_COPYWRITING §5. */
  finding: string;
  impact: string;
  recommendation: string;
  confidence: number;
  citations: Citation[];
  trace: TraceStep[];
  entityIds: string[];
  riskId: string;
  decisionId: string;
  cascade?: CascadeResult;
}

export type DecisionStatus = 'Pending' | 'Signed' | 'Rejected';

export interface DecisionRecord {
  id: string;
  findingId: string;
  severity: Severity;
  agentName: string;
  /** Verb-driven action label, e.g. "Re-baseline P6 Activity A102". */
  action: string;
  impact: string;
  status: DecisionStatus;
  createdAt: string; // ISO
  signedBy?: string;
  signedRole?: string;
  signedAt?: string; // ISO
  rationale?: string;
  writeBack?: { system: string; message: string };
}

export interface AuditEntry {
  ts: string; // ISO
  actor: string;
  action: string;
  target: string;
  source: string;
}

// ── Supply-Chain (geospatial) ────────────────────────────────────────
export type RiskLevel = 'Critical' | 'Elevated' | 'Nominal';

export interface GeoPoint {
  id: string;
  tag: string;
  name: string;
  kind: 'vendor' | 'site';
  lat: number;
  lon: number;
  city: string;
  country: string;
  region: string;
  /** Aggregate vendor risk 0..1 (site = 0). */
  riskScore: number;
  riskLevel: RiskLevel;
  onTimeRate?: number;
  note?: string;
}

export interface ShipmentArc {
  id: string;
  tag: string;
  poTag: string;
  cargo: string;
  fromId: string;
  toId: string;
  status: string;
  detail: string;
  riskLevel: RiskLevel;
}

export interface SupplyChainData {
  points: GeoPoint[];
  arcs: ShipmentArc[];
}

// ── Commissioning (L1–L5 readiness) ──────────────────────────────────
export type CxLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type CxStatus = 'Complete' | 'In Progress' | 'At Risk' | 'Blocked' | 'Not Started';

export const CX_LEVELS: CxLevel[] = ['L1', 'L2', 'L3', 'L4', 'L5'];
export const CX_LEVEL_NAME: Record<CxLevel, string> = {
  L1: 'Factory Acceptance (FAT)',
  L2: 'Site Acceptance / Install',
  L3: 'Pre-Functional',
  L4: 'Functional Testing',
  L5: 'Integrated Systems Testing',
};

export interface CxNode {
  id: string;
  tag: string;
  name: string;
  kind: 'system' | 'subsystem';
  levels: Record<CxLevel, CxStatus>;
  readinessPct: number;
  blockingCause?: string;
  children?: CxNode[];
}

export interface StreamEvent {
  type: 'step' | 'result' | 'error';
  step?: TraceStep;
  message?: string;
}

export interface SessionUser {
  personId: string;
  name: string;
  role: string;
  /** Tenant the user belongs to; the AI inherits this authorization scope (15_AI RBAC-to-AI mapping). */
  tenantId: string;
  tenantName: string;
  /** Projects the user is cleared for, within the tenant. */
  projectIds: string[];
  /** ABAC attributes (e.g., 'L5-Commissioning', 'Financial'). */
  clearances: string[];
}

// ── Knowledge / Learning (cross-project memory) ──────────────────────
export interface Precedent {
  id: string;
  category: string;
  /** The current-project risk this precedent matches. */
  currentFindingId: string;
  currentTitle: string;
  currentEntityTag: string;
  /** The historical project & resolved decision it was matched to. */
  historicalProjectTag: string;
  historicalProjectName: string;
  historicalYear: string;
  decisionTag: string;
  decisionAction: string;
  outcome: string;
  recoveredWeeks?: number;
  signedBy: string;
  citation: Citation;
}

export interface LearningEntry {
  id: string;
  ts: string; // ISO
  actor: string;
  category?: string;
  /** What was corrected and why — feeds future agent evaluations (11_AI §16). */
  subject: string;
  rationale: string;
  entityTag?: string;
  origin: 'historical' | 'session';
}

export interface TenantSummary {
  id: string;
  name: string;
  projects: { id: string; tag: string; name: string }[];
}

/** Verifiable proof that a foreign tenant's identical pattern was NOT surfaced. */
export interface IsolationProof {
  foreignTenant: string;
  foreignProject: string;
  patternCategory: string;
  /** Matches for this pattern inside the caller's tenant. */
  inTenantMatches: number;
  /** Matches that exist across the tenant wall but were structurally blocked. */
  blockedCrossTenant: number;
  note: string;
}

export interface KnowledgeData {
  tenant: TenantSummary;
  precedents: Precedent[];
  learnings: LearningEntry[];
  isolation: IsolationProof;
}
