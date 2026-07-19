'use client';

import { useEffect, useMemo } from 'react';
import type { DecisionRecord } from '@/server/types';
import { SplitView } from '@/components/SplitView';
import { VirtualTable, type Column } from '@/components/VirtualTable';
import { StatusBadge } from '@/components/StatusBadge';
import { useDecisions, useEntityIndex } from '@/core/api/hooks';
import { DecisionDetail } from '@/features/decisions/DecisionDetail';
import { useWorkspace } from '@/core/state/workspace';

/**
 * Schedule-Risk Board — ranked lead-time conflicts with the computed
 * cascade rendered against the P6 baseline.
 */
export function ScheduleView() {
  const { data, isLoading } = useDecisions();
  const { data: entityData } = useEntityIndex();
  const selectedId = useWorkspace((s) => s.selectedDecisionId);
  const selectDecision = useWorkspace((s) => s.selectDecision);

  const rows = useMemo(() => {
    if (!data) return [] as DecisionRecord[];
    return data.decisions.filter((d) => {
      const f = data.findings[d.findingId];
      return f && (f.kind === 'schedule-risk' || f.kind === 'entity-resolution');
    });
  }, [data]);

  useEffect(() => {
    if (!selectedId && rows.length > 0) selectDecision(rows[0].id);
  }, [rows, selectedId, selectDecision]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;
  const finding = selected ? data?.findings[selected.findingId] : undefined;
  const tagOf = (id: string) => entityData?.entities.find((e) => e.id === id)?.tag ?? id;

  const columns: Column<DecisionRecord>[] = [
    { key: 'sev', header: 'Severity', width: '92px', render: (r) => <StatusBadge label={r.severity} /> },
    { key: 'title', header: 'Risk', width: 'minmax(220px, 1.6fr)', render: (r) => <span style={{ color: 'var(--txt-hi)' }}>{data?.findings[r.findingId]?.title ?? r.action}</span> },
    { key: 'impact', header: 'Impact', width: 'minmax(160px, 1fr)', render: (r) => r.impact },
    { key: 'status', header: 'Status', width: '86px', render: (r) => <StatusBadge label={r.status} /> },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Schedule-Risk</h1>
        <span className="page__meta">
          {isLoading ? 'Traversing graph dependencies...' : `${rows.length} ranked risk${rows.length === 1 ? '' : 's'} on the NM-1 power path`}
        </span>
        <span className="page__spacer" />
        <span className="page__meta">Baseline 3 · P6-EXTR-2026-07</span>
      </div>
      <div className="page__body">
        <SplitView
          primary={
            <VirtualTable
              columns={columns}
              rows={rows}
              rowKey={(r) => r.id}
              selectedKey={selectedId}
              onSelect={(r) => selectDecision(r.id)}
              emptyText="Zero critical path conflicts detected."
              ariaLabel="Ranked schedule risks"
              loading={isLoading}
            />
          }
          secondary={
            selected && finding ? (
              <DecisionDetail
                decision={selected}
                finding={finding}
                entityTags={finding.entityIds.map((id) => ({
                  id,
                  tag: tagOf(id),
                  uncertain: finding.kind === 'entity-resolution' && id === 'EQ-TX01',
                }))}
              />
            ) : (
              <div className="detail__placeholder">Select a risk to review the computed cascade.</div>
            )
          }
        />
      </div>
    </div>
  );
}
