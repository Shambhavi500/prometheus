'use client';

import { useMemo } from 'react';
import type { DecisionRecord } from '@/server/types';
import { StatusBadge } from '@/components/StatusBadge';
import { useCommissioning, useDecisions, useEntityIndex, useDocuments } from '@/core/api/hooks';

export function CommissioningView() {
  const { data: cx, isLoading } = useCommissioning();
  const { data: decisionData } = useDecisions();
  const { data: entityData } = useEntityIndex();
  const { data: docData } = useDocuments();

  const blockedGaps = useMemo(() => {
    if (!decisionData) return [] as DecisionRecord[];
    return decisionData.decisions.filter((d) => decisionData.findings[d.findingId]?.kind === 'commissioning-gap' && d.status === 'Pending');
  }, [decisionData]);

  const tagOf = (id: string) => entityData?.entities.find((e) => e.id === id)?.tag ?? id;
  const docName = (id: string) => docData?.documents.find((d) => d.id === id)?.name ?? id;

  const totalSystems = cx?.tree.length ?? 0;
  const blockedCount = blockedGaps.length;

  return (
    <div className="page" style={{ background: 'var(--bg-0)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page__header" style={{ padding: '24px 32px', borderBottom: 'none' }}>
        <div>
          <h1 className="page__title" style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            Commissioning <span style={{ color: 'var(--txt-md)', fontSize: '12px', fontWeight: 400 }}>{totalSystems} Systems Traced</span>
          </h1>
        </div>
        <span className="page__spacer" />
        <span className="page__meta" style={{ color: 'var(--txt-md)' }}>L1 FAT → L5 Integrated Systems Testing · CX-MATRIX-DH1 Rev 5</span>
      </div>

      <div className="page__body" style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto' }}>
        
        {isLoading ? (
          <div style={{ color: 'var(--txt-md)' }}>Resolving system dependencies...</div>
        ) : (
          <>
            {/* KPI ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', padding: '16px', borderRadius: '4px' }}>
                <div style={{ fontSize: '12px', color: 'var(--txt-hi)', fontWeight: 500 }}>Systems Ready</div>
                <div style={{ fontSize: '32px', color: 'var(--green)', lineHeight: 1, marginTop: '8px' }}>{totalSystems - blockedCount}</div>
                <div style={{ fontSize: '11px', color: 'var(--txt-md)', marginTop: '4px' }}>Cleared for L3 Testing</div>
              </div>
              <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red-dim)', padding: '16px', borderRadius: '4px' }}>
                <div style={{ fontSize: '12px', color: 'var(--txt-hi)', fontWeight: 500 }}>Blocked Systems</div>
                <div style={{ fontSize: '32px', color: 'var(--red)', lineHeight: 1, marginTop: '8px' }}>{blockedCount}</div>
                <div style={{ fontSize: '11px', color: 'var(--txt-md)', marginTop: '4px' }}>Require Engineering Resolution</div>
              </div>
            </div>

            {/* BLOCKED SYSTEMS TRACEABILITY */}
            <section>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--txt-hi)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px' }}>Blocked Systems Dependency Chain</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {blockedGaps.map((d) => {
                  const finding = decisionData?.findings[d.findingId];
                  if (!finding) return null;
                  
                  return (
                    <div key={d.id} style={{ border: '1px solid var(--line-strong)', borderRadius: '4px', background: 'var(--bg-1)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--txt-md)', fontSize: '12px' }}>{d.id}</span>
                            <StatusBadge label={finding.severity} />
                          </div>
                          <h3 style={{ fontSize: '18px', color: 'var(--txt-hi)', fontWeight: 600 }}>{finding.title}</h3>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: 'var(--txt-md)' }}>AI Agent</div>
                          <div style={{ color: 'var(--txt-hi)' }}>{finding.agentName}</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* LEFT: Problem & Impact */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--txt-md)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Missing Equipment / Blockers</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {finding.entityIds.map(id => (
                                <span key={id} className="mono" style={{ background: 'var(--bg-2)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: 'var(--txt-hi)' }}>{tagOf(id)}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--txt-md)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Schedule Impact</div>
                            <div style={{ fontSize: '13px', color: 'var(--txt-hi)' }}>{finding.impact}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--txt-md)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Supporting Evidence</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {finding.citations.map(c => (
                                <div key={c.blockId} style={{ fontSize: '12px', color: 'var(--teal)', borderLeft: '2px solid var(--teal)', paddingLeft: '8px' }}>
                                  Document: {c.docTitle || docName(c.docId)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: AI Recommendation */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--teal-dim)', padding: '16px', borderRadius: '4px', border: '1px solid var(--teal-line)' }}>
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Engineering Reasoning</div>
                            <div style={{ fontSize: '12px', color: 'var(--txt-hi)', fontFamily: 'var(--font-mono)' }}>{finding.finding}</div>
                          </div>
                          <div style={{ width: '100%', height: '1px', background: 'var(--teal-line)' }} />
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>AI Recommendation</div>
                            <div style={{ fontSize: '14px', color: 'var(--txt-hi)', fontWeight: 500 }}>{finding.recommendation}</div>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
                {blockedGaps.length === 0 && (
                  <div style={{ color: 'var(--txt-md)', padding: '24px', background: 'var(--bg-1)', borderRadius: '4px' }}>All systems are cleared. No commissioning blockers detected.</div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
