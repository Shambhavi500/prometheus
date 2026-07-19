'use client';

import { useEffect, useState } from 'react';
import type { Citation } from '@prometheus/ontology';
import type { DecisionRecord, Finding } from '@/server/types';
import { CitationTag } from '@/components/CitationTag';
import { DecisionBlock } from '@/components/DecisionBlock';
import { EvidenceViewer } from '@/components/EvidenceViewer';
import { ReasoningStream } from '@/components/ReasoningStream';
import { StatusBadge } from '@/components/StatusBadge';
import { CascadeView } from '@/components/CascadeView';
import { EntityTag } from '@/components/EntityTag';
import { fmtConfidence } from '@/core/format';
import { ContextSidebar } from '@/components/ContextSidebar';

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

  useEffect(() => setActiveCitation(null), [finding.id]);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div className="detail" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="detail__header">
        <div className="detail__kicker">
          <span>{decision.id}</span>
          <StatusBadge label={finding.severity} />
          <span>· {finding.agentName}</span>
          <StatusBadge label={decision.status} />
        </div>
        <div className="detail__title">{finding.title}</div>
      </div>

      <div className="detail__section">
        <div className="detail__label">Finding</div>
        <div className="detail__text">{finding.finding}</div>
        <div className="detail__cites">
          {finding.citations.map((c) => (
            <CitationTag key={c.blockId} citation={c} onOpen={setActiveCitation} />
          ))}
        </div>
      </div>

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
      <ContextSidebar decision={decision} finding={finding} entityTags={entityTags} />
    </div>
  );
}
