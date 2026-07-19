'use client';

import { useState } from 'react';
import type { Citation } from '@prometheus/ontology';
import { useKnowledge } from '@/core/api/hooks';
import { CitationTag } from '@/components/CitationTag';
import { EvidenceViewer } from '@/components/EvidenceViewer';
import { EntityTag } from '@/components/EntityTag';

/**
 * Knowledge — organizational memory. Cross-project precedents matched to live
 * risks, captured human corrections, and a verifiable tenant-isolation seal.
 * All data is tenant-scoped server-side; a foreign tenant's identical pattern
 * is structurally excluded, never merely hidden.
 */
export function KnowledgeView() {
  const { data, isLoading } = useKnowledge();
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Knowledge</h1>
        <span className="page__meta">
          {isLoading ? 'Traversing tenant memory...' : `${data?.precedents.length ?? 0} cross-project precedents · ${data?.learnings.length ?? 0} captured lessons`}
        </span>
        <span className="page__spacer" />
        <span className="page__meta">Organizational memory · cross-project intelligence within tenant boundary</span>
      </div>

      <div className="page__body" style={{ overflowY: 'auto', display: 'block' }}>
        {/* Tenant & access */}
        {data && (
          <div className="kv-strip">
            <div className="kv-strip__cell">
              <span className="kv-strip__k">Tenant</span>
              <span className="kv-strip__v mono">{data.tenant.name}</span>
            </div>
            <div className="kv-strip__cell">
              <span className="kv-strip__k">Projects in scope</span>
              <span className="kv-strip__chips">
                {data.tenant.projects.map((p) => (
                  <EntityTag key={p.id} id={p.id} tag={p.tag} />
                ))}
              </span>
            </div>
          </div>
        )}

        {/* Cross-project precedents */}
        <section className="kb-section">
          <h2 className="kb-section__title">Cross-Project Precedents</h2>
          <p className="kb-section__sub">Live risks matched to resolved decisions on prior projects in this tenant.</p>
          {data?.precedents.length ? (
            data.precedents.map((p) => (
              <div key={p.id} className="precedent">
                <div className="precedent__col">
                  <span className="precedent__tag">CURRENT · {p.currentEntityTag}</span>
                  <div className="precedent__title">{p.currentTitle}</div>
                  <span className="precedent__cat mono">{p.category}</span>
                </div>
                <div className="precedent__arrow" aria-hidden="true">→ matched to →</div>
                <div className="precedent__col precedent__col--hist">
                  <span className="precedent__tag">
                    {p.historicalProjectTag} · {p.historicalYear} · {p.decisionTag}
                  </span>
                  <div className="precedent__title">{p.decisionAction}</div>
                  <div className="precedent__outcome">{p.outcome}</div>
                  <div className="precedent__meta">
                    {p.recoveredWeeks != null && <span className="precedent__recovered">Recovered {p.recoveredWeeks} weeks</span>}
                    <span className="precedent__signed">Approved by {p.signedBy}</span>
                  </div>
                  <div className="detail__cites">
                    <CitationTag citation={p.citation} onOpen={setActiveCitation} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="kb-empty">No historical precedent found for current risks. Novel patterns become memory once resolved.</div>
          )}
          {activeCitation && (
            <div className="kb-evidence">
              <div className="evidence__bar" style={{ position: 'static' }}>
                <span className="evidence__doc">Source · {activeCitation.docTitle}</span>
                <button type="button" className="btn" onClick={() => setActiveCitation(null)}>Close Source</button>
              </div>
              <div style={{ maxHeight: 340, display: 'flex', flexDirection: 'column' }}>
                <EvidenceViewer docId={activeCitation.docId} highlightBlockId={activeCitation.blockId} />
              </div>
            </div>
          )}
        </section>

        {/* Organizational learning */}
        <section className="kb-section">
          <h2 className="kb-section__title">Organizational Learning</h2>
          <p className="kb-section__sub">Human corrections captured to graph memory — these feed future agent evaluations.</p>
          {data?.learnings.map((l) => (
            <div key={l.id} className="lesson">
              <div className="lesson__head">
                <span className={`lesson__origin lesson__origin--${l.origin}`}>{l.origin === 'historical' ? 'PRIOR PROJECT' : 'THIS SESSION'}</span>
                <span className="lesson__subject">{l.subject}</span>
                {l.entityTag && <span className="lesson__ent mono">{l.entityTag}</span>}
              </div>
              <div className="lesson__rationale">“{l.rationale}”</div>
              <div className="lesson__foot mono">{l.actor}{l.category ? ` · ${l.category}` : ''}</div>
            </div>
          ))}
        </section>

        {/* Tenant isolation seal */}
        {data && (
          <section className="kb-section">
            <h2 className="kb-section__title">Tenant Isolation</h2>
            <div className="isolation-seal">
              <div className="isolation-seal__mark" aria-hidden="true">⧉</div>
              <div className="isolation-seal__body">
                <div className="isolation-seal__head">SEALED · {data.isolation.foreignTenant}</div>
                <p className="isolation-seal__note">{data.isolation.note}</p>
                <dl className="isolation-seal__kv">
                  <div><dt>Pattern</dt><dd className="mono">{data.isolation.patternCategory}</dd></div>
                  <div><dt>In-tenant matches surfaced</dt><dd className="mono">{data.isolation.inTenantMatches}</dd></div>
                  <div><dt>Cross-tenant matches blocked</dt><dd className="mono" style={{ color: 'var(--green)' }}>{data.isolation.blockedCrossTenant}</dd></div>
                  <div><dt>Foreign project</dt><dd className="mono">{data.isolation.foreignProject}</dd></div>
                </dl>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
