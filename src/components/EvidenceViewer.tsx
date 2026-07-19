'use client';

import { useEffect, useRef } from 'react';
import { useDocument } from '@/core/api/hooks';

/**
 * EvidenceViewer — renders the unmodified source artifact with the cited
 * block scrolled into view and highlighted in teal. Read-only by design:
 * evidence is never edited (06_COMPONENTS §Visualization).
 */
export function EvidenceViewer({ docId, highlightBlockId }: { docId: string; highlightBlockId?: string }) {
  const { data, isLoading, error } = useDocument(docId);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data && highlightRef.current) {
      highlightRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [data, highlightBlockId]);

  if (isLoading) {
    return (
      <div className="evidence" aria-busy="true">
        <div style={{ padding: 12 }}>
          <div className="skel" style={{ height: 12, width: '60%', marginBottom: 10 }} />
          <div className="skel" style={{ height: 120 }} />
        </div>
      </div>
    );
  }
  if (error || !data) {
    return <div className="detail__placeholder">Document retrieval failed. Graph connection unstable.</div>;
  }

  const doc = data.document;
  return (
    <div className="evidence" role="document" aria-label={`Source document ${doc.title}`}>
      <div className="evidence__bar">
        <span className="evidence__doc">{doc.title}</span>
        <span className="evidence__rev">{doc.revision} · {doc.issued} · {doc.sourceSystem}</span>
      </div>
      {doc.pages.map((page) => (
        <div key={page.page} className="evidence__page">
          <div className="evidence__pagehead">PAGE {page.page} OF {doc.pages[doc.pages.length - 1].page}</div>
          {page.blocks.map((block) => {
            const hl = block.id === highlightBlockId;
            return (
              <div
                key={block.id}
                ref={hl ? highlightRef : undefined}
                className={`evidence__block evidence__block--${block.kind}${hl ? ' hl' : ''}`}
              >
                <span className="evidence__clause">{block.clause ?? ''}</span>
                <span>{block.text}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
