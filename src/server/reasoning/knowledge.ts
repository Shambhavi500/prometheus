/**
 * Knowledge / Learning Agent — cross-project organizational memory.
 *
 * Matches active risks on the current project to *resolved* decisions on
 * prior projects within the same tenant, and surfaces the proven mitigation
 * with its outcome (01_PRD Capability Model; 02_EXPERIENCE Organizational
 * Learning). All graph reads are tenant-scoped: an identical pattern resolved
 * by a *foreign* tenant is structurally invisible here — that is the isolation
 * guarantee, not a filter applied after the fact.
 */

import type { TypedGraph, TenantScope } from '../graph/engine';
import { cite } from '../graph/tools';
import type { Finding, IsolationProof, Precedent, TraceStep } from '../types';

const CATEGORY_BLOCK: Record<string, string> = {
  'optical-customs-delay': 'LL-1-2',
  'cdu-capacity-deviation': 'LL-1-3',
};

/** Derive a pattern category from a current finding (deterministic, no LLM). */
export function categoryOf(f: Finding): string | undefined {
  if (f.kind === 'supply-chain' && f.entityIds.includes('VEN-FIBER')) return 'optical-customs-delay';
  if (f.kind === 'spec-deviation' && f.entityIds.includes('EQ-CDU-RACK')) return 'cdu-capacity-deviation';
  if (f.kind === 'supply-chain') return 'vendor-performance-risk';
  return undefined;
}

export interface KnowledgeEvaluation {
  precedents: Precedent[];
  isolation: IsolationProof;
  findings: Finding[];
}

export function runKnowledge(
  graph: TypedGraph,
  scope: TenantScope,
  currentFindings: Finding[],
  currentProjectId: string,
  ids: { risk: () => string; decision: () => string; finding: () => string },
): KnowledgeEvaluation {
  // Resolved decisions on *other* projects the caller can see (tenant-scoped).
  const scopedDecisions = graph
    .allNodesScoped(scope)
    .filter((n) => n.type === 'Decision' && n.status === 'Signed' && n.projectId !== currentProjectId && n.props.category != null);

  const precedents: Precedent[] = [];
  const findings: Finding[] = [];

  for (const f of currentFindings) {
    const category = categoryOf(f);
    if (!category) continue;
    const match = scopedDecisions.find((d) => d.props.category === category);
    if (!match) continue;

    const project = graph.getNodeScoped(match.projectId!, scope);
    const entityTag = f.entityIds[0] ?? '';
    const precedent: Precedent = {
      id: `PRE-${match.tag}`,
      category,
      currentFindingId: f.id,
      currentTitle: f.title,
      currentEntityTag: entityTag,
      historicalProjectTag: project?.tag ?? match.projectId!,
      historicalProjectName: project?.name ?? 'Prior project',
      historicalYear: String(project?.props.year ?? ''),
      decisionTag: match.tag,
      decisionAction: match.name,
      outcome: String(match.props.outcome ?? ''),
      recoveredWeeks: match.props.recoveredWeeks != null ? Number(match.props.recoveredWeeks) : undefined,
      signedBy: String(match.props.signedBy ?? ''),
      citation: cite(String(match.props.docId ?? 'DOC-LL-MERIDIAN'), CATEGORY_BLOCK[category] ?? 'LL-1-1'),
    };
    precedents.push(precedent);

    // Headline: emit a decision-queue finding for the optical-customs-delay precedent,
    // which supports the active QSFP112 transceiver customs hold critical finding.
    if (category === 'optical-customs-delay') {
      const riskId = ids.risk();
      const decisionId = ids.decision();
      const findingId = ids.finding();
      const trace: TraceStep[] = [
        { index: 1, total: 4, actor: 'Orchestrator', text: 'Routing to Knowledge/Learning Agent...' },
        { index: 2, total: 4, actor: 'Knowledge/Learning Agent', text: `Pattern-matching current risk (category: ${category}) across NVIDIA AIFC tenant memory...`, payload: { tenant: scope.tenantId, projects: scope.projectIds } },
        { index: 3, total: 4, actor: 'Knowledge/Learning Agent', text: `Match on ${precedent.historicalProjectTag} (${precedent.historicalYear}): ${match.tag} — air-freight mitigation recovered ${precedent.recoveredWeeks} weeks of NVLink commissioning float.`, payload: { decision: match.tag } },
        { index: 4, total: 4, actor: 'Knowledge/Learning Agent', text: 'Foreign-tenant matches (Vertex Infrastructure Partners) excluded before retrieval. Surfacing NVIDIA AIFC precedent.' },
      ];
      findings.push({
        id: findingId, agentId: 'AGT-KNOWLEDGE', agentName: 'Knowledge/Learning Agent', kind: 'knowledge-precedent',
        severity: 'Medium',
        title: `Historical precedent: NVL72-PILOT air-freight mitigation for QSFP112 customs delay`,
        finding: `A matching optical transceiver customs delay pattern was resolved on ${precedent.historicalProjectName} (${precedent.historicalYear}). ${precedent.decisionAction} recovered ${precedent.recoveredWeeks} weeks of NVLink commissioning float with an air-freight premium of USD 42,000 [LL-PILOT-2025, ${precedent.decisionTag}].`,
        impact: `The proven NVL72-PILOT mitigation applies directly to the active QSFP112/OSFP customs hold (SHP-FIBER-001): air-freighting the batch from Tokyo and pre-terminating fiber cables in parallel can recover 2–3 weeks of NVLink cabling float for SU-04 to SU-08.`,
        recommendation: `Apply the ${precedent.historicalProjectTag} air-freight precedent (DEC-P01) to the QSFP112/OSFP batch customs hold. Simultaneously pre-terminate fiber cables for racks SU-04 to SU-08 in parallel with customs clearance.`,
        confidence: 0.88,
        citations: [precedent.citation],
        trace,
        entityIds: ['SHP-FIBER-001', match.projectId!, match.id],
        riskId, decisionId,
      });
    }
  }

  // Isolation proof: an identical pattern exists across the tenant wall (Vertex Infrastructure Partners)
  // but is never returned by scoped reads.
  const patternCategory = 'optical-customs-delay';
  const inTenant = scopedDecisions.filter((d) => d.props.category === patternCategory).length;
  const allMatches = graph
    .allNodes()
    .filter((n) => n.type === 'Decision' && n.status === 'Signed' && n.projectId !== currentProjectId && n.props.category === patternCategory).length;
  const blocked = allMatches - inTenant;

  const isolation: IsolationProof = {
    foreignTenant: 'Vertex Infrastructure Partners',
    foreignProject: 'Vertex AI Factory (VERTEX-AIF)',
    patternCategory,
    inTenantMatches: inTenant,
    blockedCrossTenant: blocked,
    note:
      blocked > 0
        ? `Vertex Infrastructure Partners resolved an identical QSFP112 customs delay pattern on their AI Factory project, but it belongs to a different tenant. Scoped traversal terminated before returning it — ${blocked} cross-tenant match blocked.`
        : 'No cross-tenant matches exist for this pattern.',
  };

  return { precedents, isolation, findings };
}
