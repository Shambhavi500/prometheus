'use client';

import { useEffect, useMemo } from 'react';
import type { DecisionRecord } from '@/server/types';
import { SplitView } from '@/components/SplitView';
import { VirtualTable, type Column } from '@/components/VirtualTable';
import { StatusBadge } from '@/components/StatusBadge';
import { TreeTable } from '@/components/TreeTable';
import { DecisionDetail } from '@/features/decisions/DecisionDetail';
import { useCommissioning, useDecisions, useEntityIndex } from '@/core/api/hooks';
import { useWorkspace } from '@/core/state/workspace';

/**
 * Commissioning — L1–L5 readiness tree above ranked turnover gaps.
 * Gaps trace to their upstream supply/schedule causes.
 */
export function CommissioningView() {
  const { data: cx, isLoading } = useCommissioning();
  const { data: decisionData } = useDecisions();
  const { data: entityData } = useEntityIndex();
  const selectedId = useWorkspace((s) => s.selectedDecisionId);
  const selectDecision = useWorkspace((s) => s.selectDecision);

  const rows = useMemo(() => {
    if (!decisionData) return [] as DecisionRecord[];
    return decisionData.decisions.filter((d) => decisionData.findings[d.findingId]?.kind === 'commissioning-gap');
  }, [decisionData]);

  useEffect(() => {
    if (!selectedId && rows.length > 0) selectDecision(rows[0].id);
  }, [rows, selectedId, selectDecision]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;
  const finding = selected ? decisionData?.findings[selected.findingId] : undefined;
  const tagOf = (id: string) => entityData?.entities.find((e) => e.id === id)?.tag ?? id;

  const columns: Column<DecisionRecord>[] = [
    { key: 'sev', header: 'Severity', width: '92px', render: (r) => <StatusBadge label={r.severity} /> },
    { key: 'title', header: 'Turnover Gap', width: 'minmax(220px, 1.6fr)', render: (r) => <span style={{ color: 'var(--txt-hi)' }}>{decisionData?.findings[r.findingId]?.title ?? r.action}</span> },
    { key: 'status', header: 'Status', width: '86px', render: (r) => <StatusBadge label={r.status} /> },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Commissioning</h1>
        <span className="page__meta">
          {isLoading ? 'Rolling up L1–L5 test records...' : `${cx?.tree.length ?? 0} systems · ${rows.length} turnover gap${rows.length === 1 ? '' : 's'}`}
        </span>
        <span className="page__spacer" />
        <span className="page__meta">L1 FAT → L5 Integrated Systems Testing · CX-MATRIX-DH1 Rev 5</span>
      </div>
      <div className="page__body">
        <SplitView
          primary={
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div style={{ flex: '0 0 auto', maxHeight: '55%', display: 'flex', minHeight: 0 }}>
                {cx ? <TreeTable tree={cx.tree} /> : <div className="detail__placeholder">Loading readiness tree...</div>}
              </div>
              <div style={{ borderTop: '1px solid var(--line-strong)', flex: 1, minHeight: 0, display: 'flex' }}>
                <VirtualTable
                  columns={columns}
                  rows={rows}
                  rowKey={(r) => r.id}
                  selectedKey={selectedId}
                  onSelect={(r) => selectDecision(r.id)}
                  emptyText="All systems on track for turnover. No commissioning gaps."
                  ariaLabel="Ranked commissioning turnover gaps"
                  loading={isLoading}
                  enableKeys={false}
                />
              </div>
            </div>
          }
          secondary={
            selected && finding ? (
              <DecisionDetail
                decision={selected}
                finding={finding}
                entityTags={finding.entityIds.map((id) => ({ id, tag: tagOf(id) }))}
              />
            ) : (
              <div className="detail__placeholder">Select a gap to review the readiness trace and mitigation.</div>
            )
          }
        />
      </div>
    </div>
  );
}
