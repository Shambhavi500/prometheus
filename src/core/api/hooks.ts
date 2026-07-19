'use client';

/** Server-state hooks — all Knowledge Fabric access flows through the API gateway. */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SourceDocument, EntityBase, Edge } from '@prometheus/ontology';
import type { AuditEntry, CxNode, DecisionRecord, Finding, KnowledgeData, SessionUser, SpecCheckRow, SupplyChainData } from '@/server/types';
import { useWorkspace } from '@/core/state/workspace';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const body = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status}).`);
  return body;
}

export interface DecisionsPayload {
  user: SessionUser;
  decisions: DecisionRecord[];
  findings: Record<string, Finding>;
}

export function useDecisions() {
  return useQuery({ queryKey: ['decisions'], queryFn: () => fetchJson<DecisionsPayload>('/api/decisions') });
}

export function useSpecRows() {
  return useQuery({ queryKey: ['spec'], queryFn: () => fetchJson<{ rows: SpecCheckRow[] }>('/api/spec') });
}

export function useNeighborhood(id: string | null, depth = 1) {
  return useQuery({
    queryKey: ['neighborhood', id, depth],
    queryFn: () => fetchJson<{ focus: EntityBase; nodes: EntityBase[]; edges: Edge[] }>(`/api/graph/neighborhood?id=${encodeURIComponent(id ?? '')}&depth=${depth}`),
    enabled: !!id,
  });
}

export function useDocument(docId: string | null) {
  return useQuery({
    queryKey: ['document', docId],
    queryFn: () => fetchJson<{ document: SourceDocument }>(`/api/documents/${encodeURIComponent(docId ?? '')}`),
    enabled: !!docId,
    staleTime: Infinity,
  });
}

export function useSupplyChain() {
  return useQuery({
    queryKey: ['supply-chain'],
    queryFn: () => fetchJson<SupplyChainData & { findingIds: string[] }>('/api/supply-chain'),
  });
}

export function useCommissioning() {
  return useQuery({
    queryKey: ['commissioning'],
    queryFn: () => fetchJson<{ tree: CxNode[]; findingIds: string[] }>('/api/commissioning'),
  });
}

export function useKnowledge() {
  return useQuery({
    queryKey: ['knowledge'],
    queryFn: () => fetchJson<KnowledgeData>('/api/knowledge'),
  });
}

export function useAudit() {
  return useQuery({ queryKey: ['audit'], queryFn: () => fetchJson<{ entries: AuditEntry[] }>('/api/audit') });
}

export interface EntityIndexItem {
  id: string;
  type: string;
  tag: string;
  name: string;
  status: string;
}

export function useEntityIndex() {
  return useQuery({
    queryKey: ['entities'],
    queryFn: () => fetchJson<{ entities: EntityIndexItem[] }>('/api/entities'),
    staleTime: 60_000,
  });
}

/** Optimistic HITL actions: the UI transitions immediately; a failed
 *  write-back reverts calmly with a notification (04_INTERACTION). */
export function useDecisionActions() {
  const qc = useQueryClient();
  const pushToast = useWorkspace((s) => s.pushToast);

  const patchLocal = (id: string, patch: Partial<DecisionRecord>) => {
    qc.setQueryData<DecisionsPayload>(['decisions'], (prev) =>
      prev
        ? { ...prev, decisions: prev.decisions.map((d) => (d.id === id ? { ...d, ...patch } : d)) }
        : prev,
    );
  };

  const approve = useMutation({
    mutationFn: (id: string) => fetchJson<{ decision: DecisionRecord }>(`/api/decisions/${id}/approve`, { method: 'POST' }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['decisions'] });
      const prev = qc.getQueryData<DecisionsPayload>(['decisions']);
      const user = prev?.user;
      patchLocal(id, { status: 'Signed', signedBy: user?.name, signedRole: user?.role, signedAt: new Date().toISOString() });
      return { prev };
    },
    onError: (err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['decisions'], ctx.prev);
      pushToast(`Write-back failed. ${err.message} Decision remains pending.`, 'error');
    },
    onSuccess: (data) => {
      pushToast(data.decision.writeBack?.message ?? 'Decision approved.');
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['decisions'] });
      void qc.invalidateQueries({ queryKey: ['audit'] });
      void qc.invalidateQueries({ queryKey: ['neighborhood'] });
    },
  });

  const reject = useMutation({
    mutationFn: ({ id, rationale }: { id: string; rationale: string }) =>
      fetchJson<{ decision: DecisionRecord }>(`/api/decisions/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rationale }),
      }),
    onSuccess: (data) => {
      pushToast(`Decision rejected. Rationale recorded to graph memory for ${data.decision.agentName}.`);
    },
    onError: (err) => pushToast(err.message, 'error'),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['decisions'] });
      void qc.invalidateQueries({ queryKey: ['audit'] });
      void qc.invalidateQueries({ queryKey: ['knowledge'] });
    },
  });

  return { approve, reject };
}
