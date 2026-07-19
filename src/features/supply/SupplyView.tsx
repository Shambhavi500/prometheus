'use client';

import { useEffect, useMemo } from 'react';
import type { DecisionRecord } from '@/server/types';
import { SplitView } from '@/components/SplitView';
import { VirtualTable, type Column } from '@/components/VirtualTable';
import { StatusBadge } from '@/components/StatusBadge';
import { RiskMap } from '@/components/RiskMap';
import { DecisionDetail } from '@/features/decisions/DecisionDetail';
import { useDecisions, useEntityIndex, useSupplyChain } from '@/core/api/hooks';
import { useWorkspace } from '@/core/state/workspace';

/**
 * Supply-Chain — geospatial ops map above the ranked vendor/logistics risks.
 * Selecting a risk opens its evidence, cascade-to-commissioning, and HITL gate.
 */
export function SupplyView() {
  const { data: supply, isLoading } = useSupplyChain();
  const { data: decisionData } = useDecisions();
  const { data: entityData } = useEntityIndex();
  const selectedId = useWorkspace((s) => s.selectedDecisionId);
  const selectDecision = useWorkspace((s) => s.selectDecision);

  const rows = useMemo(() => {
    if (!decisionData) return [] as DecisionRecord[];
    return decisionData.decisions.filter((d) => decisionData.findings[d.findingId]?.kind === 'supply-chain');
  }, [decisionData]);

  useEffect(() => {
    if (!selectedId && rows.length > 0) selectDecision(rows[0].id);
  }, [rows, selectedId, selectDecision]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;
  const finding = selected ? decisionData?.findings[selected.findingId] : undefined;
  const tagOf = (id: string) => entityData?.entities.find((e) => e.id === id)?.tag ?? id;

  const columns: Column<DecisionRecord>[] = [
    { key: 'sev', header: 'Severity', width: '92px', render: (r) => <StatusBadge label={r.severity} /> },
    { key: 'title', header: 'Vendor / Logistics Risk', width: 'minmax(220px, 1.6fr)', render: (r) => <span style={{ color: 'var(--txt-hi)' }}>{decisionData?.findings[r.findingId]?.title ?? r.action}</span> },
    { key: 'status', header: 'Status', width: '86px', render: (r) => <StatusBadge label={r.status} /> },
  ];

  const critical = supply?.points.filter((p) => p.riskLevel === 'Critical').length ?? 0;

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Supply-Chain</h1>
        <span className="page__meta">
          {isLoading ? 'Traversing procurement graph...' : `${supply?.arcs.length ?? 0} shipments · ${critical} vendor${critical === 1 ? '' : 's'} at critical risk`}
        </span>
        <span className="page__spacer" />
        <span className="page__meta">Geospatial ops layer · vendor risk aggregated over 12-month delivery history</span>
      </div>
      <div className="page__body">
        <SplitView
          primary={
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {supply ? <RiskMap points={supply.points} arcs={supply.arcs} /> : <div className="detail__placeholder">Loading geospatial layer...</div>}
              <VirtualTable
                columns={columns}
                rows={rows}
                rowKey={(r) => r.id}
                selectedKey={selectedId}
                onSelect={(r) => selectDecision(r.id)}
                emptyText="No vendor or logistics risks detected."
                ariaLabel="Ranked supply-chain risks"
                loading={isLoading}
                enableKeys={false}
              />
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
              <div className="detail__placeholder">Select a risk to review evidence and mitigation.</div>
            )
          }
        />
      </div>
    </div>
  );
}
