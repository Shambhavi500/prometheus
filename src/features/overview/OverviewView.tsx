'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDecisions, useSupplyChain, useSpecRows, useAudit, useDocuments, useEntityIndex } from '@/core/api/hooks';
import { useWorkspace } from '@/core/state/workspace';
import { StatusBadge } from '@/components/StatusBadge';
import { LiveBadge } from '@/components/LiveBadge';
import { GraphPathViewer } from '@/features/knowledge/components/GraphPathViewer';

export function OverviewView() {
  const router = useRouter();
  const [ragQuery, setRagQuery] = useState('');
  const [ragResponse, setRagResponse] = useState<any>(null);
  const [isRagLoading, setIsRagLoading] = useState(false);
  const { data: decData } = useDecisions();
  const { data: supply } = useSupplyChain();
  const { data: docData } = useDocuments();
  const { data: entityData } = useEntityIndex();
  const selectDecision = useWorkspace((s) => s.selectDecision);

  const handleRagSearch = async () => {
    if (!ragQuery.trim()) return;
    setIsRagLoading(true);
    try {
      const res = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: ragQuery })
      });
      const data = await res.json();
      setRagResponse(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRagLoading(false);
    }
  };

  const getAgentRoute = (agentName: string) => {
    if (agentName.includes('Schedule')) return '/schedule-risk';
    if (agentName.includes('Spec')) return '/spec-compliance';
    if (agentName.includes('Supply')) return '/supply-chain';
    if (agentName.includes('Commissioning')) return '/commissioning';
    if (agentName.includes('Knowledge')) return '/knowledge';
    return '/console';
  };

  const decisions = useMemo(() => {
    return (decData?.decisions ?? []).sort((a, b) => {
      const s = { Critical: 0, High: 1, Medium: 2, Low: 3 } as any;
      const statusDelta = (a.status === 'Pending' ? 0 : 1) - (b.status === 'Pending' ? 0 : 1);
      if (statusDelta !== 0) return statusDelta;
      return (s[a.severity] ?? 9) - (s[b.severity] ?? 9);
    });
  }, [decData]);

  const criticalPending = decisions.filter(d => d.status === 'Pending' && d.severity === 'Critical');
  const primaryDecision = criticalPending[0];
  const primaryFinding = primaryDecision ? decData?.findings[primaryDecision.findingId] : null;

  const vendorCritical = supply?.points.filter((p: any) => p.riskLevel === 'Critical').length ?? 0;
  const { data: specData } = useSpecRows();
  const { data: auditData } = useAudit();

  const specRows = specData?.rows ?? [];
  const compliantCount = specRows.filter(r => r.verdict === 'Compliant').length;
  const specCompliancePct = specRows.length > 0 ? ((compliantCount / specRows.length) * 100).toFixed(1) : '100.0';

  const openRisks = Object.values(decData?.findings ?? {}).length;
  const liveRisks = Object.values(decData?.findings ?? {}).filter(f => f.source === 'live').length;
  const operationalHealth = Math.max(0, 100 - (criticalPending.length * 5) - (vendorCritical * 3) - ((specRows.length - compliantCount) * 2)).toFixed(1);

  const auditEntries = auditData?.entries ?? [];

  return (
    <div className="page" style={{ background: 'var(--bg-0)' }}>
      {/* Top Bar */}
      <div className="page__header">
        <h1 className="page__title">Mission Control</h1>
        <span className="page__meta">Project Meghdoot (NM-1)</span>
        <span className="page__spacer" />
        <span className="page__meta" style={{ display: 'flex', gap: '24px' }}>
          <span>Tenant: <span style={{ color: 'var(--txt-hi)' }}>PROMETHEUS</span></span>
          <span>Role: <span style={{ color: 'var(--txt-hi)' }}>Project Director</span></span>
        </span>
      </div>

      <div className="page__body" style={{ overflowY: 'auto', display: 'block', paddingBottom: '96px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 32px 0', display: 'flex', flexDirection: 'column', gap: '64px' }}>
          

          {/* RAG DEEP DIVE (Replacing the Search bar but keeping interactability) */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px', borderBottom: '1px solid var(--line-strong)', paddingBottom: '64px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--txt-hi)', fontWeight: 300 }}>Hybrid RAG Retrieval State</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="ui-input" 
                style={{ flex: 1, padding: '12px 16px', borderRadius: '4px', border: '1px solid var(--line)', background: 'var(--bg-1)', color: 'var(--txt-hi)' }} 
                placeholder="Query the RAG engine manually (e.g., Lead time for TX-01)..."
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRagSearch()}
              />
              <button className="btn btn--approve" onClick={handleRagSearch} disabled={isRagLoading}>
                {isRagLoading ? 'Retrieving...' : 'Query'}
              </button>
            </div>

            {/* Always show the RAG state, either from manual query or active primary decision */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              {/* Evidence Chunks */}
              <div style={{ background: 'var(--bg-1)', border: '1px solid var(--teal-line)', borderRadius: 'var(--radius)', padding: '24px' }}>
                <div style={{ fontSize: '11px', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Retrieved Evidence Chunks</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(ragResponse?.textChunks || primaryFinding?.citations || []).length > 0 ? (
                    (ragResponse?.textChunks || primaryFinding?.citations || []).slice(0, 3).map((chunk: any, i: number) => (
                      <div key={i} style={{ borderLeft: '2px solid var(--teal)', paddingLeft: '12px', fontSize: '12px', color: 'var(--txt-hi)' }}>
                        <div className="mono" style={{ fontSize: '10px', color: 'var(--teal)', marginBottom: '4px' }}>Source: {chunk.sourceDoc || chunk.docId}</div>
                        "{chunk.text || chunk.quote}"
                      </div>
                    ))
                  ) : (
                    <div style={{ color: 'var(--txt-md)' }}>No evidence retrieved yet.</div>
                  )}
                </div>
              </div>

              {/* KG Nodes & Reasoning */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '24px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--txt-md)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Knowledge Graph Nodes Activated</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(ragResponse?.graphFacts || primaryFinding?.entityIds || []).length > 0 ? (
                       (ragResponse?.graphFacts ? ragResponse.graphFacts.map((f: any) => f.node) : primaryFinding!.entityIds).map((node: string, i: number) => (
                        <span key={i} style={{ background: 'var(--bg-2)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--txt-hi)', border: '1px solid var(--line)' }}>{node}</span>
                      ))
                    ) : (
                      <div style={{ color: 'var(--txt-md)' }}>Waiting for retrieval traversal.</div>
                    )}
                  </div>
                </div>
                
                {ragResponse && (
                  <div style={{ background: 'var(--teal-dim)', border: '1px solid var(--teal-line)', borderRadius: 'var(--radius)', padding: '24px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Generated Answer</div>
                    <div style={{ color: 'var(--txt-hi)', lineHeight: 1.5 }}>{ragResponse.answer}</div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* MAIN GRID - Active Insights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '64px' }}>
            
            {/* LEFT COLUMN: Critical Focus */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
              
              {/* PRIMARY DECISION */}
              {primaryDecision && (
                <section>
                  <header style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--line-strong)', paddingBottom: '12px', marginBottom: '24px' }}>
                    Latest Recommendation Action
                  </header>
                  <div className="dblock" style={{ margin: 0, border: '1px solid var(--red-dim)' }} id="walkthrough-live-finding">
                    <div className="dblock__head" style={{ borderBottomColor: 'var(--red-dim)', background: 'var(--red-dim)' }}>
                      <span style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        CRITICAL: {primaryFinding?.title ?? 'Risk Detected'}
                        {primaryDecision.source === 'live' && <LiveBadge />}
                      </span>
                      <span>{primaryDecision.agentName}</span>
                    </div>
                    <div className="dblock__body" style={{ padding: '24px' }}>
                      <div className="dblock__action" style={{ fontSize: 'var(--fs-16)' }}>{primaryDecision.action}</div>
                      <div className="dblock__impact" style={{ marginTop: '8px' }}>{primaryDecision.impact}</div>
                    </div>
                    <div className="dblock__buttons" style={{ padding: '16px 24px', borderTopColor: 'var(--line)' }}>
                      <button 
                        className="btn btn--approve" 
                        onClick={() => {
                          selectDecision(primaryDecision.id);
                          router.push(getAgentRoute(primaryDecision.agentName));
                        }}
                      >
                        Review Full Context
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* DECISION QUEUE PREVIEW */}
              <section>
                <header style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--line-strong)', paddingBottom: '12px', marginBottom: '24px' }}>
                  Decision Queue
                </header>
                <div className="vt" style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--bg-1)' }}>
                  <div className="vt__header" style={{ gridTemplateColumns: '92px 1fr 120px 86px', background: 'transparent' }}>
                    <div>Severity</div><div>Decision</div><div>Agent</div><div>Status</div>
                  </div>
                  <div className="vt__scroll" style={{ overflow: 'hidden' }}>
                    {decisions.slice(0, 5).map(d => (
                      <div 
                        key={d.id} 
                        className="vt__row" 
                        style={{ gridTemplateColumns: '92px 1fr 120px 86px', height: '44px', background: 'transparent' }}
                        onClick={() => {
                          selectDecision(d.id);
                          router.push(getAgentRoute(d.agentName));
                        }}
                      >
                        <div><StatusBadge label={d.severity} /></div>
                        <div style={{ color: 'var(--txt-hi)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {d.action}
                          {d.source === 'live' && <LiveBadge />}
                        </div>
                        <div>{d.agentName}</div>
                        <div><StatusBadge label={d.status} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              
              {/* KNOWLEDGE HIGHLIGHT */}
              <section>
                <header style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--line-strong)', paddingBottom: '12px', marginBottom: '24px' }}>
                  Knowledge Surface
                </header>
                <div style={{ display: 'flex', border: '1px solid var(--line-strong)', borderRadius: 'var(--radius)', background: 'var(--bg-1)', overflow: 'hidden' }}>
                  
                  {/* Left Box (Historical Info) */}
                  <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px 24px', background: 'var(--teal-dim)', borderRight: '1px solid var(--teal-line)' }}>
                    <div className="precedent__meta">
                      <span className="precedent__tag">NM-0</span>
                      <span className="precedent__cat">Schedule Recovery</span>
                    </div>
                    <div className="precedent__title">Phased Energization Sequence</div>
                  </div>
                  
                  {/* Divider / Arrow */}
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRight: '1px solid var(--line)', fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Recovered
                  </div>
                  
                  {/* Right Box (Outcome & Action) */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px', padding: '20px 24px' }}>
                    <div className="precedent__outcome" style={{ margin: 0 }}>Split switchgear testing into two phases to avoid critical path delay during early procurement faults.</div>
                    <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => router.push('/knowledge')}>View Decision Memory</button>
                  </div>
                  
                </div>
              </section>

            </div>

            {/* RIGHT COLUMN: Intelligence & Activity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
              


              {/* AGENT ACTIVITY FEED */}
              <section>
                <header style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--line-strong)', paddingBottom: '12px', marginBottom: '16px' }}>
                  System Activity
                </header>
                <div className="audit" style={{ padding: 0, overflow: 'visible' }}>
                  <div className="audit__row head" style={{ gridTemplateColumns: '60px 120px 1fr', padding: '12px 8px', borderBottomColor: 'var(--line)' }}>
                    <div>Time</div><div>Agent</div><div>Activity</div>
                  </div>
                  {auditEntries.length === 0 ? (
                    <div style={{ padding: '16px', color: 'var(--txt-md)' }}>No system activity recorded yet.</div>
                  ) : (
                    auditEntries.slice(0, 5).map((entry, idx) => {
                      const time = new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const shortAgent = entry.actor.split(' ')[0].replace('Agent', '').replace('-', '');
                      return (
                        <div key={idx} className="audit__row" style={{ gridTemplateColumns: '60px 120px 1fr', padding: '12px 8px', border: 'none' }}>
                          <div className="audit__ts">{time}</div>
                          <div className="audit__action">{shortAgent}</div>
                          <div className="audit__src" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.action} {entry.target}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

