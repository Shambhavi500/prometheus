/**
 * @prometheus/ontology — Entity definitions.
 *
 * The governed EPC ontology. The typed graph is the truth: AI extracts,
 * the schema enforces (08_IMPLEMENTATION §1, 10_KNOWLEDGE_GRAPH §4).
 * New entity types must be registered here before any data is ingested.
 */

export type EntityType =
  | 'Organization'
  | 'Project'
  | 'System'
  | 'Subsystem'
  | 'Equipment'
  | 'Specification'
  | 'Requirement'
  | 'Standard'
  | 'Submittal'
  | 'PurchaseOrder'
  | 'Vendor'
  | 'Shipment'
  | 'ScheduleActivity'
  | 'TestRecord'
  | 'Document'
  | 'Risk'
  | 'Decision'
  | 'Person'
  | 'AIAgent';

/** Knowledge validation lifecycle (10_KNOWLEDGE_GRAPH §12). */
export type VerificationState = 'Unverified' | 'SystemVerified' | 'HumanVerified';

export type ScalarProp = string | number | boolean | null;

export interface EntityBase {
  id: string;
  type: EntityType;
  /** Canonical tag exactly as it appears in the system of record (e.g. TX-01, PO-884). */
  tag: string;
  name: string;
  status?: string;
  /** Deterministic owner — a Person or Team id. Every node has an owner. */
  owner: string;
  verification: VerificationState;
  /** Provenance: external system this entity was mapped from (anti-corruption layer). */
  sourceSystem?: string;
  /**
   * Multi-tenant isolation keys (08_IMPLEMENTATION §7, 10_KNOWLEDGE_GRAPH §14).
   * `tenantId` undefined ⇒ a platform-global node (codes, standards, agents)
   * shared across tenants. Scoped queries inject these; traversal terminates
   * before returning any node outside the caller's tenant.
   */
  tenantId?: string;
  projectId?: string;
  props: Record<string, ScalarProp>;
}

/** Typed parameters a Requirement mandates — evaluated deterministically, never by an LLM. */
export interface RequirementParameter {
  parameter: string;
  operator: '=' | '<=' | '>=';
  value: number | string;
  unit?: string;
}

/** Typed schedule fields used by the Schedule-Risk agent's deterministic date math. */
export interface ScheduleActivityFields {
  activityId: string;
  baselineStart: string; // ISO date
  baselineFinish: string; // ISO date
  /** Lead-time assumption baked into the baseline, in weeks (if procurement-driven). */
  assumedLeadTimeWeeks?: number;
  /** Free float available before this activity delays its successor, in weeks. */
  freeFloatWeeks: number;
  /** Commissioning level, when the activity is an L1–L5 gate. */
  level?: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
}
