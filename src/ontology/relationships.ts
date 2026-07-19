/**
 * @prometheus/ontology — Relationship definitions.
 *
 * All relationships are strictly directed with explicit verbs (KG-001).
 * Bidirectionality is a traversal concern, not a data concern.
 * `RELATES_TO`-style ambiguous verbs are rejected by construction.
 */

export type RelationshipVerb =
  | 'CONTAINS' // Project CONTAINS System; System CONTAINS Equipment
  | 'GOVERNED_BY' // Requirement GOVERNED_BY Standard
  | 'SPECIFIES' // Specification SPECIFIES Requirement
  | 'APPLIES_TO' // Requirement APPLIES_TO Equipment
  | 'SATISFIES' // Submittal SATISFIES Requirement
  | 'VIOLATES' // Submittal VIOLATES Requirement
  | 'SUBMITTED_FOR' // Submittal SUBMITTED_FOR Equipment
  | 'DEPENDS_ON' // ScheduleActivity DEPENDS_ON ScheduleActivity
  | 'ALLOCATED_TO' // Equipment ALLOCATED_TO ScheduleActivity
  | 'SUPPLIED_UNDER' // Equipment SUPPLIED_UNDER PurchaseOrder
  | 'ISSUED_TO' // PurchaseOrder ISSUED_TO Vendor
  | 'SHIPPED_UNDER' // Shipment SHIPPED_UNDER PurchaseOrder
  | 'ORIGINATES_FROM' // Shipment ORIGINATES_FROM Vendor
  | 'DESTINED_FOR' // Shipment DESTINED_FOR Project (site)
  | 'DOCUMENTS' // Document DOCUMENTS Equipment/Specification/…
  | 'SUPPORTS' // Evidence-bearing Document block SUPPORTS Risk (via evidence records)
  | 'PREDICTS' // AIAgent PREDICTS Risk
  | 'DETECTED' // AIAgent DETECTED Risk
  | 'THREATENS' // Risk THREATENS ScheduleActivity/Equipment
  | 'MITIGATES' // Decision MITIGATES Risk
  | 'RESOLVED_BY' // Risk RESOLVED_BY Decision
  | 'APPROVES' // Person APPROVES Decision
  | 'VERIFIES' // TestRecord VERIFIES Equipment
  | 'SUPERSEDES' // Entity_v2 SUPERSEDES Entity_v1
  | 'OWNS'; // Person/Team OWNS entity

export interface Edge {
  id: string;
  from: string;
  to: string;
  verb: RelationshipVerb;
  props?: Record<string, string | number>;
}

/** Human-readable inverse labels, managed by the schema — not the data layer (KG-001). */
export const INVERSE_LABEL: Record<RelationshipVerb, string> = {
  CONTAINS: 'CONTAINED_IN',
  GOVERNED_BY: 'GOVERNS',
  SPECIFIES: 'SPECIFIED_BY',
  APPLIES_TO: 'GOVERNED_BY_REQUIREMENT',
  SATISFIES: 'SATISFIED_BY',
  VIOLATES: 'VIOLATED_BY',
  SUBMITTED_FOR: 'HAS_SUBMITTAL',
  DEPENDS_ON: 'REQUIRED_BY',
  ALLOCATED_TO: 'DELIVERS',
  SUPPLIED_UNDER: 'SUPPLIES',
  ISSUED_TO: 'RECEIVES',
  SHIPPED_UNDER: 'HAS_SHIPMENT',
  ORIGINATES_FROM: 'ORIGIN_OF',
  DESTINED_FOR: 'RECEIVES_SHIPMENT',
  DOCUMENTS: 'DOCUMENTED_BY',
  SUPPORTS: 'SUPPORTED_BY',
  PREDICTS: 'PREDICTED_BY',
  DETECTED: 'DETECTED_BY',
  THREATENS: 'THREATENED_BY',
  MITIGATES: 'MITIGATED_BY',
  RESOLVED_BY: 'RESOLVES',
  APPROVES: 'APPROVED_BY',
  VERIFIES: 'VERIFIED_BY',
  SUPERSEDES: 'SUPERSEDED_BY',
  OWNS: 'OWNED_BY',
};
