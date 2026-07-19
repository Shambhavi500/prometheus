'use client';

import { useEffect, useMemo } from 'react';
import type { DecisionRecord } from '@/server/types';
import { SplitView } from '@/components/SplitView';
import { VirtualTable, type Column } from '@/components/VirtualTable';
import { StatusBadge } from '@/components/StatusBadge';
import { useDecisions, useEntityIndex } from '@/core/api/hooks';
import { useWorkspace } from '@/core/state/workspace';
import { DecisionDetail } from '@/features/decisions/DecisionDetail';

/**
 * Command Console — the ranked queue of decisions requiring attention today.
 * Not a dashboard: every row terminates in an executable, gated action.
 */

const SEV_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 } as const;

export function ConsoleView() {
  const { data, isLoading } = useDecisions();
  const { data: entityData } = useEntityIndex();
  const selectedId = useWorkspace((s) => s.selectedDecisionId);
  const selectDecision = useWorkspace((s) => s.selectDecision);

  const rows = useMemo(() => {
    const decisions = data?.decisions ?? [];
    return [...decisions].sort((a, b) => {
      const statusDelta = (a.status === 'Pending' ? 0 : 1) - (b.status === 'Pending' ? 0 : 1);
      if (statusDelta !== 0) return statusDelta;
      return SEV_RANK[a.severity] - SEV_RANK[b.severity];
    });
  }, [data]);

  useEffect(() => {
    if (!selectedId && rows.length > 0) selectDecision(rows[0].id);
  }, [rows, selectedId, selectDecision]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;
  const finding = selected ? data?.findings[selected.findingId] : undefined;
  const pendingCount = rows.filter((r) => r.status === 'Pending').length;

  const columns: Column<DecisionRecord>[] = [
    { key: 'sev', header: 'Severity', width: '92px', render: (r) => <StatusBadge label={r.severity} /> },
    { key: 'id', header: 'Decision', width: '84px', render: (r) => <span className="mono">{r.id}</span> },
    { key: 'action', header: 'Recommended Action', width: 'minmax(200px, 1.4fr)', render: (r) => <span style={{ color: 'var(--txt-hi)' }}>{r.action}</span> },
    { key: 'agent', header: 'Agent', width: 'minmax(130px, 0.7fr)', render: (r) => r.agentName },
    { key: 'status', header: 'Status', width: '86px', render: (r) => <StatusBadge label={r.status} /> },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Command Console</h1>
        <span className="page__meta">Project Meghdoot — NM-1</span>
        <span className="page__spacer" />
        <span className="page__meta">
          {isLoading ? 'Traversing graph dependencies...' : `${pendingCount} decisions require attention · J/K to traverse · Ctrl+K to search`}
        </span>
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
              emptyText="Zero critical path conflicts detected. No decisions pending."
              ariaLabel="Ranked decision queue"
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
                  tag: entityData?.entities.find((e) => e.id === id)?.tag ?? id,
                  uncertain: finding.kind === 'entity-resolution' && id === 'EQ-TX01',
                }))}
              />
            ) : (
              <div className="detail__placeholder">Select a decision to review evidence and reasoning.</div>
            )
          }
        />
      </div>
    </div>
  );
}
