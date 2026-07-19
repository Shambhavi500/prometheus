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
  'transformer-lead-time': 'LL-1-2',
  'voltage-deviation': 'LL-1-3',
};

/** Derive a pattern category from a current finding (deterministic, no LLM). */
export function categoryOf(f: Finding): string | undefined {
  if (f.kind === 'schedule-risk' && f.entityIds.includes('EQ-TX01')) return 'transformer-lead-time';
  if (f.kind === 'spec-deviation' && f.entityIds.includes('EQ-CDU01')) return 'voltage-deviation';
  if (f.kind === 'supply-chain') return 'vendor-force-majeure';
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

    // Headline: emit a decision-queue finding for the transformer precedent,
    // which supports the live TX-01 critical.
    if (category === 'transformer-lead-time') {
      const riskId = ids.risk();
      const decisionId = ids.decision();
      const findingId = ids.finding();
      const trace: TraceStep[] = [
        { index: 1, total: 4, actor: 'Orchestrator', text: 'Routing to Knowledge/Learning Agent...' },
        { index: 2, total: 4, actor: 'Knowledge/Learning Agent', text: `Pattern-matching current risk (category: ${category}) across tenant memory...`, payload: { tenant: scope.tenantId, projects: scope.projectIds } },
        { index: 3, total: 4, actor: 'Knowledge/Learning Agent', text: `Match on ${precedent.historicalProjectTag} (${precedent.historicalYear}): ${match.tag} recovered ${precedent.recoveredWeeks} weeks.`, payload: { decision: match.tag } },
        { index: 4, total: 4, actor: 'Knowledge/Learning Agent', text: 'Foreign-tenant matches excluded before retrieval. Surfacing precedent.' },
      ];
      findings.push({
        id: findingId, agentId: 'AGT-KNOWLEDGE', agentName: 'Knowledge/Learning Agent', kind: 'knowledge-precedent',
        severity: 'Medium',
        title: `Historical precedent for the TX-01 lead-time risk`,
        finding: `A matching transformer lead-time pattern was resolved on ${precedent.historicalProjectName} (${precedent.historicalYear}). ${precedent.decisionAction} recovered ${precedent.recoveredWeeks} weeks of L5 IST float with no acceleration premium [LL-DH0-2024, ${precedent.decisionTag}].`,
        impact: `The proven mitigation applies directly to TX-01: phased-power energization decouples NM-1 turnover from the delayed transformer delivery.`,
        recommendation: `Apply the ${precedent.historicalProjectTag} phased-power precedent to the TX-01 cascade and evaluate temporary energization for NM-1.`,
        confidence: 0.84,
        citations: [precedent.citation],
        trace,
        entityIds: ['EQ-TX01', match.projectId!, match.id],
        riskId, decisionId,
      });
    }
  }

  // Isolation proof: an identical pattern exists across the tenant wall but is
  // never returned by scoped reads.
  const patternCategory = 'transformer-lead-time';
  const inTenant = scopedDecisions.filter((d) => d.props.category === patternCategory).length;
  const allMatches = graph
    .allNodes()
    .filter((n) => n.type === 'Decision' && n.status === 'Signed' && n.projectId !== currentProjectId && n.props.category === patternCategory).length;
  const blocked = allMatches - inTenant;

  const isolation: IsolationProof = {
    foreignTenant: 'Vanta Infrastructure',
    foreignProject: 'Project Titan (DH-X)',
    patternCategory,
    inTenantMatches: inTenant,
    blockedCrossTenant: blocked,
    note:
      blocked > 0
        ? `Project Titan resolved an identical transformer lead-time pattern, but it belongs to another tenant. Scoped traversal terminated before returning it — ${blocked} cross-tenant match blocked.`
        : 'No cross-tenant matches exist for this pattern.',
  };

  return { precedents, isolation, findings };
}
