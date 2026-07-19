'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SpecCheckRow } from '@/server/types';
import { SplitView } from '@/components/SplitView';
import { VirtualTable, type Column } from '@/components/VirtualTable';
import { StatusBadge } from '@/components/StatusBadge';
import { EvidenceViewer } from '@/components/EvidenceViewer';
import { DecisionBlock } from '@/components/DecisionBlock';
import { ReasoningStream } from '@/components/ReasoningStream';
import { EntityTag } from '@/components/EntityTag';
import { useDecisions, useSpecRows } from '@/core/api/hooks';
import { fmtConfidence } from '@/core/format';
import { ContextSidebar } from '@/components/ContextSidebar';
import { useWorkspace } from '@/core/state/workspace';

/**
 * Spec-Compliance Board — side-by-side requirement / submitted / source.
 * One-click disposition with full evidence one interaction away.
 */
export function SpecView() {
  const { data, isLoading } = useSpecRows();
  const { data: decisionData } = useDecisions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedDecisionId = useWorkspace(s => s.selectedDecisionId);
  const selectDecision = useWorkspace(s => s.selectDecision);
  const [tab, setTab] = useState<'spec' | 'submittal'>('spec');

  const rows = data?.rows ?? [];

  useEffect(() => {
    if (selectedDecisionId && decisionData) {
      const dec = decisionData.decisions.find(d => d.id === selectedDecisionId);
      if (dec) {
        const row = rows.find(r => r.findingId === dec.findingId);
        if (row && row.id !== selectedId) {
          setSelectedId(row.id);
        }
      }
    }
  }, [selectedDecisionId, decisionData, rows, selectedId]);

  useEffect(() => {
    if (!selectedId && rows.length > 0) {
      setSelectedId(rows.find((r) => r.verdict !== 'Compliant')?.id ?? rows[0].id);
    }
  }, [rows, selectedId]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const row = rows.find(r => r.id === id);
    if (row && row.findingId && decisionData) {
      const dec = decisionData.decisions.find(d => d.findingId === row.findingId);
      if (dec) selectDecision(dec.id);
    }
  };

  const selected = rows.find((r) => r.id === selectedId) ?? null;
  const finding = useMemo(() => {
    if (!selected?.findingId || !decisionData) return undefined;
    return decisionData.findings[selected.findingId];
  }, [selected, decisionData]);
  const decision = finding ? decisionData?.decisions.find((d) => d.findingId === finding.id) : undefined;

  const deviations = rows.filter((r) => r.verdict === 'Deviation').length;
  const compliant = rows.filter((r) => r.verdict === 'Compliant').length;

  const columns: Column<SpecCheckRow>[] = [
    { key: 'chk', header: 'Check', width: '64px', render: (r) => <span className="mono">{r.id}</span> },
    { key: 'eq', header: 'Equipment', width: '92px', render: (r) => <EntityTag id={r.equipmentId} tag={r.equipmentTag} /> },
    { key: 'param', header: 'Parameter', width: 'minmax(140px, 1fr)', render: (r) => r.parameter },
    { key: 'req', header: 'Required', width: 'minmax(120px, 0.9fr)', render: (r) => <span className="mono">{r.required}</span> },
    { key: 'sub', header: 'Submitted', width: 'minmax(120px, 0.9fr)', render: (r) => <span className="mono">{r.submitted}</span> },
    { key: 'verdict', header: 'Verdict', width: '100px', render: (r) => <StatusBadge label={r.verdict} /> },
    { key: 'conf', header: 'Conf', width: '56px', numeric: true, render: (r) => (r.confidence === null ? '—' : fmtConfidence(r.confidence)) },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Spec-Compliance</h1>
        <span className="page__meta">
          {isLoading ? 'Parsing specification parameters...' : `${rows.length} checks · ${deviations} deviation${deviations === 1 ? '' : 's'} · ${compliant} compliant`}
        </span>
        <span className="page__spacer" />
        <span className="page__meta">Requirement and source shown side-by-side</span>
      </div>
      <div className="page__body">
        <SplitView
          primary={
            <VirtualTable
              columns={columns}
              rows={rows}
              rowKey={(r) => r.id}
              selectedKey={selectedId}
              onSelect={(r) => handleSelect(r.id)}
              emptyText="No open deviations. All submittals compliant with current specifications."
              ariaLabel="Specification compliance checks"
              loading={isLoading}
            />
          }
          secondary={
            selected ? (
              <div style={{ display: 'flex', height: '100%' }}>
                <div className="detail" style={{ flex: 1, overflowY: 'auto' }}>
                  <div className="detail__header">
                  <div className="detail__kicker">
                    <span>{selected.id}</span>
                    <span>· {selected.requirementTag}</span>
                    <StatusBadge label={selected.verdict} />
                  </div>
                  <div className="detail__title">
                    {selected.equipmentTag} — {selected.parameter}
                  </div>
                </div>
                <div className="compare">
                  <div className="compare__cell">
                    <div className="detail__label">Required · {selected.specCitation.docTitle} Clause {selected.specCitation.clause}</div>
                    <div className="compare__value">{selected.required}</div>
                  </div>
                  <div className="compare__cell">
                    <div className="detail__label">Submitted · {selected.submittalTag}</div>
                    <div className={`compare__value ${selected.verdict === 'Compliant' ? 'good' : 'bad'}`}>{selected.submitted}</div>
                  </div>
                </div>
                {finding && (
                  <div className="detail__section">
                    <div className="detail__label">Finding</div>
                    <div className="detail__text">{finding.finding}</div>
                  </div>
                )}
                <div className="tabs" role="tablist" aria-label="Source documents">
                  <button type="button" role="tab" aria-selected={tab === 'spec'} className={tab === 'spec' ? 'active' : ''} onClick={() => setTab('spec')}>
                    {selected.specCitation.docTitle}
                  </button>
                  {selected.submittalCitation && (
                    <button type="button" role="tab" aria-selected={tab === 'submittal'} className={tab === 'submittal' ? 'active' : ''} onClick={() => setTab('submittal')}>
                      {selected.submittalTag}
                    </button>
                  )}
                </div>
                <div style={{ minHeight: 260, maxHeight: 380, display: 'flex', flexDirection: 'column' }}>
                  {tab === 'spec' || !selected.submittalCitation ? (
                    <EvidenceViewer docId={selected.specCitation.docId} highlightBlockId={selected.specCitation.blockId} />
                  ) : (
                    <EvidenceViewer docId={selected.submittalCitation.docId} highlightBlockId={selected.submittalCitation.blockId} />
                  )}
                </div>
                {finding && (
                  <div className="detail__section">
                    <div className="detail__label">Reasoning</div>
                    <ReasoningStream finding={finding} />
                  </div>
                )}
                {decision && <DecisionBlock decision={decision} />}
                {!finding && (
                  <div className="detail__section detail__text">
                    Requirement satisfied. No action required.
                  </div>
                )}
                </div>
                {decision && finding && (
                  <ContextSidebar 
                    decision={decision} 
                    finding={finding} 
                    entityTags={finding.entityIds.map(id => ({ id, tag: id }))} 
                  />
                )}
              </div>
            ) : (
              <div className="detail__placeholder">Select a check to review requirement and source evidence.</div>
            )
          }
        />
      </div>
    </div>
  );
}
