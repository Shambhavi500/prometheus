/**
 * Knowledge Fabric — typed property graph engine.
 *
 * Phase 1 deterministic implementation. The interface is the contract:
 * per 09_SYSTEM_ARCHITECTURE §3 (Replaceable Components) this container is
 * swappable for a Neo4j-backed engine behind the same semantic tool surface.
 * AI never generates queries against this store; it invokes the typed tools
 * in `tools.ts` (AI-002, Deterministic Tool Boundaries).
 */

import type { EntityBase, Edge, RelationshipVerb } from '@prometheus/ontology';

/**
 * Tenant scope — the ABAC boundary injected into every scoped read.
 * A user sees only nodes in their tenant (plus platform-global nodes),
 * and only within the projects they are cleared for.
 */
export interface TenantScope {
  tenantId: string;
  projectIds: string[];
}

/** A node is visible if it is platform-global, or in-tenant and in-scope-project. */
export function isVisible(node: EntityBase, scope: TenantScope): boolean {
  if (node.tenantId == null) return true; // platform-global (standards, agents)
  if (node.tenantId !== scope.tenantId) return false; // hard tenant wall
  if (node.projectId == null) return true; // tenant-global (e.g., the Organization)
  return scope.projectIds.includes(node.projectId);
}

export class TypedGraph {
  private nodes = new Map<string, EntityBase>();
  private edges: Edge[] = [];
  private outAdj = new Map<string, Edge[]>();
  private inAdj = new Map<string, Edge[]>();

  addNode(node: EntityBase): void {
    if (this.nodes.has(node.id)) {
      throw new Error(`Duplicate entity id rejected by entity resolution: ${node.id}`);
    }
    this.nodes.set(node.id, node);
  }

  removeNode(id: string): void {
    if (!this.nodes.has(id)) return;
    this.nodes.delete(id);
    this.edges = this.edges.filter((e) => e.from !== id && e.to !== id);
    this.outAdj.delete(id);
    this.inAdj.delete(id);
    for (const [key, edges] of this.outAdj.entries()) {
      this.outAdj.set(key, edges.filter((e) => e.to !== id));
    }
    for (const [key, edges] of this.inAdj.entries()) {
      this.inAdj.set(key, edges.filter((e) => e.from !== id));
    }
  }

  addEdge(edge: Edge): void {
    if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) {
      throw new Error(`Edge ${edge.id} references unknown entity (${edge.from} -> ${edge.to})`);
    }
    this.edges.push(edge);
    const out = this.outAdj.get(edge.from) ?? [];
    out.push(edge);
    this.outAdj.set(edge.from, out);
    const inn = this.inAdj.get(edge.to) ?? [];
    inn.push(edge);
    this.inAdj.set(edge.to, inn);
  }

  getNode(id: string): EntityBase | undefined {
    return this.nodes.get(id);
  }

  requireNode(id: string): EntityBase {
    const n = this.nodes.get(id);
    if (!n) throw new Error(`Unknown entity: ${id}`);
    return n;
  }

  allNodes(): EntityBase[] {
    return [...this.nodes.values()];
  }

  // ── Tenant-scoped reads (ABAC enforcement) ─────────────────────────
  /** Node by id, but only if visible to the scope — otherwise undefined (indistinguishable from absent). */
  getNodeScoped(id: string, scope: TenantScope): EntityBase | undefined {
    const n = this.nodes.get(id);
    return n && isVisible(n, scope) ? n : undefined;
  }

  allNodesScoped(scope: TenantScope): EntityBase[] {
    return [...this.nodes.values()].filter((n) => isVisible(n, scope));
  }

  /** Scoped neighborhood: traversal terminates before crossing the tenant wall. */
  neighborhoodScoped(id: string, scope: TenantScope, depth = 1): { nodes: EntityBase[]; edges: Edge[] } {
    if (!this.getNodeScoped(id, scope)) return { nodes: [], edges: [] };
    const seen = new Set<string>([id]);
    const edgeSet = new Map<string, Edge>();
    let frontier = [id];
    for (let hop = 0; hop < depth; hop++) {
      const next: string[] = [];
      for (const nodeId of frontier) {
        for (const e of [...this.out(nodeId), ...this.in(nodeId)]) {
          const other = e.from === nodeId ? e.to : e.from;
          const otherNode = this.nodes.get(other);
          if (!otherNode || !isVisible(otherNode, scope)) continue; // do not expand across the wall
          edgeSet.set(e.id, e);
          if (!seen.has(other)) {
            seen.add(other);
            next.push(other);
          }
        }
      }
      frontier = next;
    }
    return { nodes: [...seen].map((n) => this.requireNode(n)), edges: [...edgeSet.values()] };
  }

  out(id: string, verb?: RelationshipVerb): Edge[] {
    const list = this.outAdj.get(id) ?? [];
    return verb ? list.filter((e) => e.verb === verb) : list;
  }

  in(id: string, verb?: RelationshipVerb): Edge[] {
    const list = this.inAdj.get(id) ?? [];
    return verb ? list.filter((e) => e.verb === verb) : list;
  }

  /** Connected neighborhood of an entity, bounded by hop count (07_AI context discipline). */
  neighborhood(id: string, depth = 1): { nodes: EntityBase[]; edges: Edge[] } {
    const seen = new Set<string>([id]);
    const edgeSet = new Map<string, Edge>();
    let frontier = [id];
    for (let hop = 0; hop < depth; hop++) {
      const next: string[] = [];
      for (const nodeId of frontier) {
        for (const e of [...this.out(nodeId), ...this.in(nodeId)]) {
          edgeSet.set(e.id, e);
          const other = e.from === nodeId ? e.to : e.from;
          if (!seen.has(other)) {
            seen.add(other);
            next.push(other);
          }
        }
      }
      frontier = next;
    }
    return {
      nodes: [...seen].map((n) => this.requireNode(n)),
      edges: [...edgeSet.values()],
    };
  }

  /** Downstream DEPENDS_ON chain: activities that depend (transitively) on `id`, in order. */
  downstreamChain(id: string): EntityBase[] {
    const chain: EntityBase[] = [];
    const seen = new Set<string>([id]);
    let current = id;
    // Successor = activity that DEPENDS_ON current.
    for (;;) {
      const successors = this.in(current, 'DEPENDS_ON').map((e) => e.from);
      const next = successors.find((s) => !seen.has(s));
      if (!next) break;
      seen.add(next);
      chain.push(this.requireNode(next));
      current = next;
    }
    return chain;
  }
}
