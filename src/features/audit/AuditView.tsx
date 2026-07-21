'use client';

import { useState } from 'react';
import { useDecisions, useDocuments } from '@/core/api/hooks';
import { StatusBadge } from '@/components/StatusBadge';
import { fmtAuditTs } from '@/core/format';

export function AuditView() {
  const { data: decisionData, isLoading } = useDecisions();
  const { data: docData } = useDocuments();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const decisions = decisionData?.decisions ?? [];

  const LIFECYCLE_STAGES = [
    'Uploaded Documents',
    'Gemini Extraction',
    'Knowledge Graph Update',
    'Hybrid RAG Retrieval',
    'Engineering Reasoning',
    'Generated Recommendation',
    'Engineer Review',
    'Final Decision',
    'Complete Evidence'
  ];

  return (
    <div className="page" style={{ background: 'var(--bg-0)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page__header" style={{ padding: '24px 32px', borderBottom: 'none' }}>
        <h1 className="page__title">Audit Ledger</h1>
        <span className="page__meta">{isLoading ? 'Loading ledger...' : `${decisions.length} AI Decisions Recorded`}</span>
        <span className="page__spacer" />
        <span className="page__meta" style={{ color: 'var(--txt-md)' }}>Immutable Lifecycle Trace</span>
      </div>

      <div className="page__body" style={{ padding: '0 32px 32px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {decisions.map(d => {
            const finding = decisionData?.findings[d.findingId];
            const isExpanded = expandedId === d.id;

            return (
              <div key={d.id} style={{ border: '1px solid var(--line-strong)', borderRadius: '4px', background: 'var(--bg-1)', overflow: 'hidden' }}>
                {/* Header row (Always visible) */}
                <div 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', cursor: 'pointer', background: isExpanded ? 'var(--bg-2)' : 'transparent' }}
                  onClick={() => setExpandedId(isExpanded ? null : d.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--txt-md)', fontFamily: 'var(--font-mono)' }}>{d.id}</span>
                    <span style={{ fontSize: '15px', color: 'var(--txt-hi)', fontWeight: 500 }}>{d.action}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--txt-md)' }}>{fmtAuditTs(d.createdAt)}</span>
                    <StatusBadge label={d.status} />
                    <span style={{ fontSize: '14px', color: 'var(--txt-md)' }}>{isExpanded ? '▴' : '▾'}</span>
                  </div>
                </div>

                {/* Expanded Lifecycle Trace */}
                {isExpanded && finding && (
                  <div style={{ padding: '24px', borderTop: '1px solid var(--line-strong)' }}>
                    <h3 style={{ fontSize: '11px', color: 'var(--txt-md)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px' }}>AI Decision Lifecycle Trace</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '11px', top: '16px', bottom: '16px', width: '2px', background: 'var(--line-strong)' }} />
                      
                      {LIFECYCLE_STAGES.map((stage, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '24px', position: 'relative', zIndex: 1 }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--teal-dim)', border: '2px solid var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--teal)' }} />
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', color: 'var(--teal)', fontWeight: 500, marginBottom: '4px' }}>{stage}</div>
                            
                            {/* Contextual data based on stage */}
                            <div style={{ fontSize: '13px', color: 'var(--txt-hi)', background: 'var(--bg-0)', padding: '12px', borderRadius: '4px', border: '1px solid var(--line)' }}>
                              {idx === 0 && `Document ID: ${finding.documentId || 'Multiple Context Docs'} ingested by user.`}
                              {idx === 1 && `Gemini Multimodal extracted ${finding.citations.length} semantic clauses with ${finding.confidence * 100}% confidence.`}
                              {idx === 2 && `Knowledge Graph created/updated nodes: ${finding.entityIds.join(', ')}`}
                              {idx === 3 && `Agent: ${finding.agentName} executed graph traversal and vector similarity matching.`}
                              {idx === 4 && <div className="mono" style={{ fontSize: '11px', whiteSpace: 'pre-wrap' }}>{finding.finding}</div>}
                              {idx === 5 && `Proposed: ${finding.recommendation}`}
                              {idx === 6 && (d.status === 'Pending' ? `Awaiting Engineer Review...` : `Reviewed by ${d.signedRole} (${d.signedBy})`)}
                              {idx === 7 && `Status: ${d.status}. Rationale: ${d.rationale || 'N/A'}`}
                              {idx === 8 && `Immutable ledger hash committed.`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
              </div>
            );
          })}

          {!isLoading && decisions.length === 0 && (
            <div style={{ color: 'var(--txt-md)', padding: '24px', background: 'var(--bg-1)', borderRadius: '4px', textAlign: 'center' }}>No audit entries recorded for Project Meghdoot.</div>
          )}
        </div>
      </div>
    </div>
  );
}
