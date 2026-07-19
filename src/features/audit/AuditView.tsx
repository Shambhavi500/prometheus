'use client';

import { useAudit } from '@/core/api/hooks';
import { fmtAuditTs } from '@/core/format';

/**
 * Audit Log — immutable, legally defensible record of every detection,
 * decision, and write-back. Format per 07_COPYWRITING §System Copy.
 */
export function AuditView() {
  const { data, isLoading } = useAudit();
  const entries = data?.entries ?? [];

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Audit Log</h1>
        <span className="page__meta">{isLoading ? 'Retrieving audit ledger...' : `${entries.length} immutable entries · append-only`}</span>
        <span className="page__spacer" />
        <span className="page__meta">[TIMESTAMP] | [ACTOR] | [ACTION] | [TARGET] | [SOURCE]</span>
      </div>
      <div className="audit" role="table" aria-label="Immutable audit log">
        <div className="audit__row head" role="row">
          <span>Timestamp</span>
          <span>Actor</span>
          <span>Action · Target</span>
          <span>Source</span>
        </div>
        {entries.map((e, i) => (
          <div key={i} className="audit__row" role="row">
            <span className="audit__ts">{fmtAuditTs(e.ts)}</span>
            <span>{e.actor}</span>
            <span>
              <span className="audit__action">{e.action}</span> · {e.target}
            </span>
            <span className="audit__src" title={e.source}>{e.source}</span>
          </div>
        ))}
        {!isLoading && entries.length === 0 && (
          <div className="vt__empty">No audit entries recorded for Project Meghdoot.</div>
        )}
      </div>
    </div>
  );
}
