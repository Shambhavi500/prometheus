'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DecisionRecord } from '@/server/types';
import { StatusBadge } from '@/components/StatusBadge';
import { RiskMap } from '@/components/RiskMap';
import { useDecisions, useEntityIndex, useSupplyChain } from '@/core/api/hooks';
import { useWorkspace } from '@/core/state/workspace';

function KpiCard({ title, value, sub, color, icon }: { title: string, value: string, sub: string, color?: string, icon?: string }) {
  return (
    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', padding: '16px', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
      <div style={{ fontSize: '12px', color: 'var(--txt-hi)', fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: '32px', color: 'var(--txt-hi)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--txt-md)' }}>{sub}</div>
      {icon && (
        <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '16px', color: color || 'var(--teal)' }}>
          {icon}
        </div>
      )}
    </div>
  );
}

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

  const critical = supply?.points.filter((p) => p.riskLevel === 'Critical').length ?? 0;
  const inTransit = supply?.arcs.filter((a) => a.status === 'In Transit').length ?? 0;
  const delayed = supply?.arcs.filter((a) => a.status === 'Held').length ?? 0;
  const onTime = Math.max(0, (supply?.arcs.length ?? 0) - delayed - inTransit);

  return (
    <div className="page" style={{ background: 'var(--bg-0)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page__header" style={{ padding: '24px 32px', borderBottom: 'none' }}>
        <div>
          <h1 className="page__title" style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            Supply-Chain <span style={{ color: 'var(--txt-md)', fontSize: '12px', fontWeight: 400 }}>{supply?.arcs.length ?? 0} shipments · {critical} vendor{critical === 1 ? '' : 's'} at critical risk</span>
          </h1>
        </div>
        <span className="page__spacer" />
        <span className="page__meta" style={{ color: 'var(--txt-md)' }}>Geospatial ops layer · vendor risk aggregated over 12-month delivery history</span>
      </div>

      <div style={{ padding: '0 32px 32px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', flex: 1, minHeight: 0 }}>
        
        {/* LEFT MAIN PANE */}
        <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '4px' }}>
          
          {/* KPI ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
            <KpiCard title="Shipments" value={(supply?.arcs.length ?? 0).toString()} sub="Total" />
            <KpiCard title="Critical Risk" value={critical.toString()} sub="Requires Attention" color="var(--red)" />
            <KpiCard title="In Transit" value={inTransit.toString()} sub={`${supply?.arcs.length ? Math.round(inTransit / supply.arcs.length * 100) : 0}% of Shipments`} color="var(--teal)" />
            <KpiCard title="On Time" value={onTime.toString()} sub={`${supply?.arcs.length ? Math.round(onTime / supply.arcs.length * 100) : 0}% of Shipments`} color="var(--green)" />
            <KpiCard title="Delayed" value={delayed.toString()} sub={`${supply?.arcs.length ? Math.round(delayed / supply.arcs.length * 100) : 0}% of Shipments`} color="var(--amber)" />
            <KpiCard title="Avg. Delay" value="8.4" sub="Weeks" color="var(--amber)" />
          </div>

          {/* MAP SECTION */}
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--txt-hi)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Global Supply Chain Flow</h2>
                <div style={{ fontSize: '11px', color: 'var(--txt-md)', marginTop: '4px' }}>Live view of critical equipment shipments</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ background: 'var(--teal-dim)', border: '1px solid var(--teal-line)', color: 'var(--teal)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
                  Flow View
                </button>
                <button style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--txt-md)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
                  Route View
                </button>
                <button style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--txt-md)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
                  Heatmap View
                </button>
              </div>
            </div>

            <div style={{ width: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column', background: 'var(--bg-0)', marginTop: '64px', paddingBottom: '24px' }}>
              {isLoading ? (
                <div style={{ color: 'var(--txt-md)', margin: 'auto' }}>Loading geospatial data...</div>
              ) : (
                <div style={{ flex: 1, width: '100%', position: 'relative', minHeight: '400px' }}>
                  {supply && <RiskMap points={supply.points} arcs={supply.arcs} />}
                </div>
              )}
            </div>
          </div>

          {/* SHIPMENT OVERVIEW TABLE */}
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--txt-hi)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Vendor / Logistics Risks</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1fr', gap: '16px', borderBottom: '1px solid var(--line-strong)', paddingBottom: '12px', fontSize: '11px', color: 'var(--txt-md)', textTransform: 'uppercase' }}>
              <div>Severity</div>
              <div>Vendor / Logistics Risk</div>
              <div>Status</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {rows.map((r, i) => {
                const f = decisionData?.findings[r.findingId];
                return (
                  <div key={r.id} onClick={() => selectDecision(r.id)} style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1fr', gap: '16px', padding: '16px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 'none', cursor: 'pointer', background: selectedId === r.id ? 'var(--bg-2)' : 'transparent' }}>
                    <div><StatusBadge label={r.severity} /></div>
                    <div style={{ color: 'var(--txt-hi)', fontSize: '13px' }}>{f?.title ?? r.action}</div>
                    <div><StatusBadge label={r.status} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR - CONTEXT */}
        <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '24px' }}>
          
          <div>
            <div style={{ fontSize: '11px', color: 'var(--txt-md)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Selected Risk</div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--txt-hi)', marginBottom: '8px' }}>{selected?.action ?? 'No Risk Selected'}</h2>
            {selected?.severity === 'Critical' && <div style={{ color: 'var(--red)', fontSize: '11px', border: '1px solid var(--red-dim)', padding: '4px 8px', display: 'inline-block', borderRadius: '4px', textTransform: 'uppercase' }}>CRITICAL RISK</div>}
            
            {finding && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', marginTop: '24px', fontSize: '12px' }}>
                <div style={{ color: 'var(--txt-md)' }}>Risk ID</div><div className="mono" style={{ color: 'var(--txt-hi)', textAlign: 'right' }}>{selected?.id}</div>
                <div style={{ color: 'var(--txt-md)' }}>Type</div><div style={{ color: 'var(--txt-hi)', textAlign: 'right' }}>{finding?.kind}</div>
                <div style={{ color: 'var(--txt-md)' }}>Status</div><div style={{ textAlign: 'right' }}><span style={{ color: 'var(--teal)' }}>{selected?.status}</span></div>
                <div style={{ color: 'var(--txt-md)' }}>Source</div><div style={{ color: 'var(--txt-hi)', textAlign: 'right' }}>{finding?.source}</div>
              </div>
            )}
          </div>

          <div style={{ width: '100%', height: '1px', background: 'var(--line)' }} />

          <div>
            <div style={{ fontSize: '11px', color: 'var(--txt-md)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Risk Description</div>
            <div style={{ fontSize: '13px', color: 'var(--txt-md)', lineHeight: 1.5 }}>
              {finding?.finding ?? 'Select a risk to review details.'}
            </div>
          </div>

          <div style={{ width: '100%', height: '1px', background: 'var(--line)' }} />

          <div>
            <div style={{ fontSize: '11px', color: 'var(--txt-md)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Affected Entities</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {finding?.entityIds.map((id) => (
                <div key={id} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--txt-hi)', alignItems: 'center', background: 'var(--bg-2)', padding: '4px 8px', borderRadius: '4px' }}>
                  <span style={{ color: 'var(--txt-md)' }}>{tagOf(id)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <button style={{ width: '100%', background: 'var(--teal-dim)', border: '1px solid var(--teal-line)', color: 'var(--teal)', padding: '12px', borderRadius: '4px', fontSize: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'background 0.2s' }}>
              Review Decision Impact →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
