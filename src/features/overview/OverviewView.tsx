'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDecisions, useSupplyChain, useSpecRows, useAudit } from '@/core/api/hooks';
import { useWorkspace } from '@/core/state/workspace';
import { StatusBadge } from '@/components/StatusBadge';
import { LiveBadge } from '@/components/LiveBadge';

export function OverviewView() {
  const router = useRouter();
  const { data: decData } = useDecisions();
  const { data: supply } = useSupplyChain();
  const selectDecision = useWorkspace((s) => s.selectDecision);

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
          <span style={{ color: 'var(--teal)' }}>Network Nominal (8/8 Agents)</span>
        </span>
      </div>

      <div className="page__body" style={{ overflowY: 'auto', display: 'block', paddingBottom: '96px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 32px 0', display: 'flex', flexDirection: 'column', gap: '64px' }}>
          
          {/* HERO SECTION - Precise, typography-led, no boxes */}
          <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                Operational Health
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '48px', fontWeight: 400, color: 'var(--teal)', lineHeight: 1, letterSpacing: '-0.04em' }}>
                {operationalHealth}<span style={{ fontSize: '32px', color: 'var(--teal)' }}>%</span>
              </div>
            </div>
            
            <div style={{ width: '1px', height: '56px', background: 'var(--line-strong)' }} />
            
            <div style={{ display: 'flex', gap: '40px', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-md)' }}>Spec Compliance</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--green)' }}>{specCompliancePct}%</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} id="walkthrough-mission-control-kpi">
                <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-md)' }}>Open Risks</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: openRisks > 0 ? 'var(--amber)' : 'var(--green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {openRisks}
                  {liveRisks > 0 && <span style={{ fontSize: '10px', color: 'var(--teal)', background: 'rgba(0, 240, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>+{liveRisks} since last upload</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-md)' }}>Critical Decisions</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: criticalPending.length > 0 ? 'var(--red)' : 'var(--txt-hi)' }}>{criticalPending.length}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-md)' }}>Vendor Risk</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: vendorCritical > 0 ? 'var(--red)' : 'var(--amber)' }}>{vendorCritical} Critical</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }} onClick={() => router.push('/repository')}>
                <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-md)' }}>Project Documents</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--txt-hi)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  46 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN GRID - Two columns separated by gap, zero nested borders */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '64px' }}>
            
            {/* LEFT COLUMN: Critical Focus & Queues */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
              
              {/* PRIMARY DECISION */}
              {primaryDecision && (
                <section>
                  <header style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--line-strong)', paddingBottom: '12px', marginBottom: '24px' }}>
                    Requires Judgment
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
                      
                      <div className="isolation-seal__kv" style={{ gridTemplateColumns: '120px 1fr', marginTop: '24px', gap: '16px' }}>
                        <div><dt>Confidence</dt><dd className="mono" style={{ color: 'var(--teal)' }}>95.8%</dd></div>
                        <div><dt>Evidence Base</dt><dd>Vendor Quote, Project Schedule, NM-0 Historical</dd></div>
                      </div>
                    </div>
                    <div className="dblock__buttons" style={{ padding: '16px 24px', borderTopColor: 'var(--line)' }}>
                      <button 
                        className="btn btn--approve" 
                        onClick={() => {
                          selectDecision(primaryDecision.id);
                          router.push(getAgentRoute(primaryDecision.agentName));
                        }}
                      >
                        Review in Context
                      </button>
                      <button className="btn">Delegate</button>
                      <span className="dblock__kbd">Press Enter</span>
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
              
              {/* AGENT STATUS GRID */}
              <section>
                <header style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--line-strong)', paddingBottom: '12px', marginBottom: '24px' }}>
                  Intelligence Network
                </header>
                <div className="isolation-seal__kv" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                  <div style={{ borderLeft: '1px solid var(--teal-line)', paddingLeft: '12px' }}><dt>Spec Agent</dt><dd className="mono" style={{color:'var(--teal)'}}>Analyzing</dd></div>
                  <div style={{ borderLeft: '1px solid var(--teal-line)', paddingLeft: '12px' }}><dt>Schedule Agent</dt><dd className="mono" style={{color:'var(--teal)'}}>Active</dd></div>
                  <div style={{ borderLeft: '1px solid var(--line)', paddingLeft: '12px' }}><dt>Knowledge Agent</dt><dd className="mono" style={{color:'var(--txt-md)'}}>Idle</dd></div>
                  <div style={{ borderLeft: '1px solid var(--teal-line)', paddingLeft: '12px' }}><dt>Supply Agent</dt><dd className="mono" style={{color:'var(--teal)'}}>Active</dd></div>
                  <div style={{ borderLeft: '1px solid var(--amber-dim)', paddingLeft: '12px' }}><dt>Cx Agent</dt><dd className="mono" style={{color:'var(--amber)'}}>Waiting (Data)</dd></div>
                  <div style={{ borderLeft: '1px solid var(--teal-line)', paddingLeft: '12px' }}><dt>Audit Agent</dt><dd className="mono" style={{color:'var(--teal)'}}>Observing</dd></div>
                </div>
              </section>

              {/* PROJECT TIMELINE */}
              <section>
                <header style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--line-strong)', paddingBottom: '12px', marginBottom: '24px' }}>
                  Project Timeline
                </header>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span className="badge badge--success">Design</span>
                  <span className="badge badge--success">Procurement</span>
                  <span className="badge badge--warning" style={{ boxShadow: '0 0 0 1px var(--amber)' }}>Construction</span>
                  <span className="badge badge--neutral">Testing</span>
                  <span className="badge badge--neutral">Commissioning</span>
                  <span className="badge badge--neutral">Go Live</span>
                </div>
              </section>

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

