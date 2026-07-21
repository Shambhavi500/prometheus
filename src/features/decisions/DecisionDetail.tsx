'use client';

import { useEffect, useState } from 'react';
import type { Citation } from '@prometheus/ontology';
import type { DecisionRecord, Finding, UploadedDocument } from '@/server/types';
import { useDocuments } from '@/core/api/hooks';
import { CitationTag } from '@/components/CitationTag';
import { DecisionBlock } from '@/components/DecisionBlock';
import { EvidenceViewer } from '@/components/EvidenceViewer';
import { ReasoningStream } from '@/components/ReasoningStream';
import { StatusBadge } from '@/components/StatusBadge';
import { CascadeView } from '@/components/CascadeView';
import { EntityTag } from '@/components/EntityTag';
import { fmtConfidence } from '@/core/format';

/**
 * Decision detail — the right pane of the Command Console split view.
 * Finding / Impact / Recommended Action, structural citations, the reasoning
 * trace, the cascade (when computed), and the HITL gate. Clicking a citation
 * opens the source inline, scrolled and highlighted — context is preserved.
 */
export function DecisionDetail({
  decision,
  finding,
  entityTags,
}: {
  decision: DecisionRecord;
  finding: Finding;
  entityTags: Array<{ id: string; tag: string; uncertain?: boolean }>;
}) {
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [viewMode, setViewMode] = useState<'normal' | 'graph'>('normal');
  const { data: docData } = useDocuments();

  useEffect(() => setActiveCitation(null), [finding.id]);

  const sourceDoc = finding.documentId ? docData?.documents.find((d: UploadedDocument) => d.id === finding.documentId) : null;

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div className="detail" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="detail__header">
        <div className="detail__kicker" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>{decision.id}</span>
            <StatusBadge label={finding.severity} />
            <span>· {finding.agentName}</span>
            <StatusBadge label={decision.status} />
          </div>
          <div style={{ display: 'flex', background: 'var(--bg-1)', borderRadius: '4px', border: '1px solid var(--line)', overflow: 'hidden' }}>
            <button 
              type="button"
              onClick={() => setViewMode('normal')}
              style={{ padding: '4px 12px', fontSize: '11px', background: viewMode === 'normal' ? 'var(--teal-dim)' : 'transparent', color: viewMode === 'normal' ? 'var(--teal)' : 'var(--txt-md)', border: 'none', cursor: 'pointer' }}
            >
              Business View
            </button>
            <button 
              type="button"
              onClick={() => setViewMode('graph')}
              style={{ padding: '4px 12px', fontSize: '11px', background: viewMode === 'graph' ? 'var(--teal-dim)' : 'transparent', color: viewMode === 'graph' ? 'var(--teal)' : 'var(--txt-md)', border: 'none', cursor: 'pointer', borderLeft: '1px solid var(--line)' }}
            >
              Developer View (Graph)
            </button>
          </div>
        </div>
        <div className="detail__title">{finding.title}</div>
      </div>

      {viewMode === 'normal' ? (
        <>
          <div className="detail__section">
            <div className="detail__label">Finding</div>
            <div className="detail__text">{finding.finding}</div>
            <div className="detail__cites">
              {finding.citations.map((c) => (
                <CitationTag key={c.blockId} citation={c} onOpen={setActiveCitation} />
              ))}
            </div>
          </div>

          {finding.source === 'live' && sourceDoc && (
            <div className="detail__section" style={{ background: 'var(--teal-dim)', border: '1px dashed var(--teal-dim)' }}>
              <div className="detail__label" style={{ color: 'var(--teal)' }}>Generated From Upload</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px', marginTop: '8px' }}>
                <div><span style={{ color: 'var(--txt-md)' }}>Document:</span> <span style={{ color: 'var(--txt-hi)' }}>{sourceDoc.name}</span></div>
                <div><span style={{ color: 'var(--txt-md)' }}>Extracted At:</span> <span style={{ color: 'var(--txt-hi)' }}>{new Date(finding.timestamp!).toLocaleTimeString()}</span></div>
                <div><span style={{ color: 'var(--txt-md)' }}>Location:</span> <span style={{ color: 'var(--txt-hi)' }}>Page {finding.citations[0]?.page}, Paragraph {finding.citations[0]?.blockId.split('-').pop()}</span></div>
                <div><span style={{ color: 'var(--txt-md)' }}>Confidence:</span> <span style={{ color: 'var(--teal)' }}>{fmtConfidence(finding.confidence)}</span></div>
              </div>
            </div>
          )}

          <div className="detail__section">
            <div className="detail__label">Impact</div>
            <div className="detail__text">{finding.impact}</div>
          </div>

          <div className="detail__section">
            <div className="detail__label">Recommended Action</div>
            <div className="detail__text">{finding.recommendation}</div>
          </div>

          <div className="detail__section" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="detail__conf">
              Confidence:{' '}
              <span className={finding.confidence < 0.8 ? 'low' : undefined}>
                {fmtConfidence(finding.confidence)}
                {finding.confidence < 0.8 ? ' — manual verification recommended' : ''}
              </span>
            </span>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              {entityTags.map((t) => (
                <EntityTag key={t.id} id={t.id} tag={t.tag} uncertain={t.uncertain} />
              ))}
            </span>
          </div>

          {finding.cascade && (
            <div className="detail__section" style={{ padding: 0 }}>
              <div className="detail__label" style={{ padding: '12px 16px 0' }}>Computed Schedule Cascade</div>
              <CascadeView cascade={finding.cascade} />
            </div>
          )}

          <div className="detail__section">
            <div className="detail__label">Reasoning</div>
            <ReasoningStream finding={finding} />
          </div>
        </>
      ) : (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div className="detail__label" style={{ marginBottom: '8px' }}>GraphRAG Traversal Query (Simulated)</div>
            <div style={{ background: 'var(--bg-0)', padding: '16px', borderRadius: '4px', border: '1px solid var(--line-strong)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green)', whiteSpace: 'pre-wrap' }}>
{`// Executed by ${finding.agentName}
MATCH (d:Document {id: "${finding.citations[0]?.docId || 'DOC-CURRENT'}"})-[:EXTRACTED]->(e:Entity)
MATCH (e)-[rel*1..3]-(context:Node)
WHERE context.type IN ['Schedule', 'Spec', 'Vendor']
RETURN e, rel, context LIMIT 50`}
            </div>
          </div>
          <div>
            <div className="detail__label" style={{ marginBottom: '8px' }}>In-Memory Graph Nodes Identified</div>
            <div style={{ background: 'var(--bg-0)', padding: '16px', borderRadius: '4px', border: '1px solid var(--line-strong)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--txt-md)', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
{JSON.stringify(entityTags, null, 2)}
            </div>
          </div>
        </div>
      )}

      {activeCitation && (
        <div className="detail__section" style={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: 320 }}>
          <div className="evidence__bar" style={{ position: 'static' }}>
            <span className="evidence__doc">Source · {activeCitation.docTitle}</span>
            <button type="button" className="btn" onClick={() => setActiveCitation(null)}>
              Close Source
            </button>
          </div>
          <div style={{ maxHeight: 360, display: 'flex', flexDirection: 'column' }}>
            <EvidenceViewer docId={activeCitation.docId} highlightBlockId={activeCitation.blockId} />
          </div>
        </div>
      )}

        <DecisionBlock decision={decision} />
      </div>
    </div>
  );
}
