'use client';

import type { Citation } from '@prometheus/ontology';

/**
 * CitationTag — anchors an AI claim to its source truth.
 * Hover: QuickPeek with the exact extracted text. Click: opens the source
 * document scrolled to the block, highlighted in teal (06_COMPONENTS).
 */
export function CitationTag({ citation, onOpen }: { citation: Citation; onOpen: (c: Citation) => void }) {
  const label = `${citation.docTitle}, ${citation.clause ? `Clause ${citation.clause}` : `pg ${citation.page}`}`;
  return (
    <button
      type="button"
      className="ctag"
      aria-label={`Open source: ${label}`}
      onClick={() => onOpen(citation)}
    >
      [{label}]
      <span className="ctag__peek" role="tooltip">
        “{citation.quote}”
        <span className="ctag__peek-src">{citation.docTitle} · pg {citation.page}{citation.clause ? ` · Clause ${citation.clause}` : ''}</span>
      </span>
    </button>
  );
}
