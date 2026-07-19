# Architecture Decision Records — TVASHTA Phase 1

Per 08_IMPLEMENTATION §12, every deviation or open implementation detail is
recorded with Context, Decision, and Consequences. The constitutional
hierarchy (Foundation → PRD → … → Implementation) governed each resolution.

## ADR-001 — Scope: Phase 1 (MVP / Demo Core)

- **Context:** The manifest asks for a faithful implementation; the roadmap
  (08_IMPLEMENTATION §13, 01_PRD) defines Phase 1 as Spec-Compliance +
  Schedule-Risk agents, Evidence Viewer, Thread Explorer, on top of the
  Command Console and HITL/audit core.
- **Decision:** Implement Phase 1 completely and cohesively rather than all
  four phases thinly. Supply-Chain geospatial map, Commissioning L1–L5
  rollups, and the Knowledge/Learning agent are Phase 2/3 deliverables.
- **Consequences:** deck.gl/MapLibre, R3F, Monaco, TipTap (mandated for
  Phase 2+ features) are intentionally not yet dependencies.

## ADR-002 — Deterministic in-process Knowledge Fabric & Reasoning Layer

- **Context:** 08_IMPLEMENTATION mandates FastAPI + Neo4j + pgvector +
  LangGraph + Kubernetes. This environment has no Docker/Neo4j/Python
  services and no LLM credentials, and the build must be runnable and
  verifiable. Higher-ranked constitutions mandate: Replaceable Components
  (09 §3.4 — "swappable in a single sprint"), Deterministic Fallbacks
  (09 §3.15), Graceful Degradation (00 §8), and "Can this be done
  deterministically without AI? If yes, do not use AI" (11 §19.4).
- **Decision:** The Knowledge Fabric is a typed in-process property graph and
  the agents are deterministic TypeScript evaluators, exposed exclusively
  through the documented API contracts (REST + SSE). The LLM extraction step
  is represented by typed perception-layer fixtures; evaluation, date math,
  and citation validation are real and tested.
- **Consequences:** Swapping in the Python/Neo4j stack changes only the API
  route implementations; the ontology package, payload contracts, and the
  entire workspace are unaffected. State is per-process (resets on server
  restart) — acceptable for a demo core, noted for Phase 2.

## ADR-003 — Zero modals

- **Context:** 04_INTERACTION permits modals for final approval confirmations;
  06_COMPONENTS bans modal chains and mandates the DecisionBlock as the gate.
- **Decision:** No modals anywhere. Approval is the inline DecisionBlock
  (`role="alertdialog"`), rejection is the inline ConflictForm. The higher
  document's context-preservation principle wins.

## ADR-004 — Canonical numbers resolved by computation

- **Context:** The docs cite the same lead-time example with a 4-week,
  6-week, and 8–10-week IST slip in different places.
- **Decision:** Seed honest float data (A140 = 12w, A200 = 18w free float)
  and let the deterministic cascade compute: 128 − 90 = 38w at A102, 30w
  absorbed, **8w slip at L5 IST** — inside the documented 8–10-week band.
  "Do not guess; compute" (00 §17.4).

## ADR-005 — Command palette answers with entities and actions, not chat

- **Context:** 07_COPYWRITING's palette placeholder says "…or ask a question",
  while every constitution bans conversational UI.
- **Decision:** The palette routes queries to grouped Entities / Commands /
  Pending Decisions. No free-text chat surface exists.

## ADR-006 — Single-app structure with package-boundary aliases

- **Context:** 08_IMPLEMENTATION mandates a Turborepo monorepo with
  `@tvashta/ontology` and `@tvashta/mcp-tools` packages.
- **Decision:** Phase 1 ships one Next.js app; the ontology lives at
  `src/ontology` and is imported only via the `@tvashta/ontology` alias, so
  the boundary is enforced and the lift to a Turborepo package is mechanical.

## ADR-007 — Auth stubbed at the session boundary

- **Context:** OIDC/SSO (Keycloak/Entra) cannot be exercised in this
  environment; the HITL gate requires an identity.
- **Decision:** A fixed session user (J. Mason, Project Director) is issued by
  the store and stamped on every approval and audit entry. The
  `SessionUser` type is the seam where the OIDC principal plugs in.

## ADR-008 — Fonts via system stacks, not network-loaded

- **Context:** 05_FRONTEND mandates self-hosted Inter/JetBrains Mono.
  Build-time font fetching would make the build network-dependent.
- **Decision:** CSS font stacks (`Inter → Segoe UI`, `JetBrains Mono →
  Cascadia Mono → Consolas`) degrade gracefully; self-hosted font files are a
  drop-in later without code changes.

## ADR-013 — Tenant isolation via scoped graph reads (Phase 3)

- **Context:** 08_IMPLEMENTATION §7 and 10_KNOWLEDGE_GRAPH §14 mandate
  database-level multi-tenant isolation: "traversal queries automatically
  terminate before returning any nodes related to [an unauthorized] project."
- **Decision:** Add optional `tenantId`/`projectId` to every entity
  (undefined ⇒ platform-global: standards, agents, organizations). The engine
  exposes only scoped reads (`getNodeScoped`, `allNodesScoped`,
  `neighborhoodScoped`) that filter by an injected `TenantScope`; the API
  gateway derives the scope from the session and never calls the unscoped
  primitives. An out-of-tenant id returns 404 — indistinguishable from absent,
  so existence itself does not leak. The AI inherits the caller's scope
  (15_AI RBAC-to-AI mapping): the Knowledge Agent reads the same scoped view,
  so a foreign tenant's identical pattern cannot be surfaced by construction.
- **Consequences:** Isolation is enforced at the single choke point (the engine
  read methods), not sprinkled across call sites. A real Neo4j backend would
  push the same predicate into Cypher; the seam is unchanged.

## ADR-014 — Cross-project memory as same-tenant resolved Decisions (Phase 3)

- **Context:** The Knowledge/Learning Agent must match a live risk to how an
  equivalent problem was resolved on a prior project, and capture human
  corrections as durable memory (02_EXPERIENCE Organizational Learning; 11_AI §16).
- **Decision:** Model precedents as ordinary Decision nodes (status Signed,
  `props.category`, `outcome`) on a prior same-tenant project (PRJ-MERIDIAN).
  Matching is deterministic by category — no embeddings, no LLM guess. Rejection
  rationales append `LearningEntry` records to organizational memory and feed
  future evaluations. A foreign tenant (PRJ-TITAN) seeds an *identical* pattern
  purely to prove, via the isolation seal, that it is never surfaced.
- **Consequences:** Cross-project intelligence reuses the existing Decision
  ontology rather than a bespoke "precedent" type; the value is the scoped
  traversal, not a new schema.

## ADR-010 — Self-contained SVG geospatial map (Phase 2)

- **Context:** 05_FRONTEND mandates deck.gl + MapLibre for the Supply-Chain
  map. Both require fetching external vector/satellite map tiles at runtime.
  00_FOUNDATION's Data Sovereignty non-negotiable requires air-gapped
  deployability, and this environment has no network egress.
- **Decision:** Render the map as a self-contained SVG equirectangular
  projection with coarse continent outlines, projecting vendor/site lat-lon
  the same way as shipment great-circle arcs. Zero external tiles; risk-colored
  markers and held-shipment dashes follow 03_DESIGN's geospatial language.
- **Consequences:** No pan-zoom tile streaming; acceptable for the ops overview.
  The projection helper and `GeoPoint`/`ShipmentArc` contracts are the seam
  where a deck.gl layer drops in for a networked deployment, unchanged upstream.

## ADR-011 — Commissioning subsystem layer added to the graph (Phase 2)

- **Context:** 01_PRD's domain model lists Project → System → Subsystem and
  L1–L5 test records, but the Phase 1 seed linked equipment directly to systems.
- **Decision:** Introduce Subsystem nodes and TestRecord nodes (typed per the
  ontology) with `CONTAINS` and `VERIFIES` edges; the Commissioning Agent rolls
  subsystem readiness up to systems using a deterministic worst-of-children
  per level. Equipment retains its existing System membership (dual parentage:
  allocated to both system and subsystem) rather than rewiring Phase 1 edges.
- **Consequences:** The graph is richer without breaking Phase 1 traversals;
  the readiness rollup is pure and unit-tested.

## ADR-012 — Shipment as a first-class ontology entity (Phase 2)

- **Context:** The map and force-majeure reasoning need per-shipment state.
- **Decision:** Add `Shipment` to `EntityType` with `SHIPPED_UNDER` /
  `ORIGINATES_FROM` / `DESTINED_FOR` verbs and inverse labels, rather than
  encoding shipments as vendor props. Honors "the ontology is the law."

## ADR-009 — CSS design tokens over a utility framework

- **Context:** 03_DESIGN explicitly bans the default Tailwind/shadcn look;
  05_FRONTEND bans un-customized component libraries.
- **Decision:** Hand-written token-based stylesheet (4px grid, 1px borders,
  0–2px radii, semantic color variables). Zero UI-kit dependencies.
