'use client';

import { useState } from 'react';
import type { Citation } from '@prometheus/ontology';
import { useKnowledge } from '@/core/api/hooks';
import { CitationTag } from '@/components/CitationTag';
import { EvidenceViewer } from '@/components/EvidenceViewer';
import { EntityTag } from '@/components/EntityTag';
import { GraphPathViewer } from './components/GraphPathViewer';

/**
 * Knowledge — organizational memory. Cross-project precedents matched to live
 * risks, captured human corrections, and a verifiable tenant-isolation seal.
 * All data is tenant-scoped server-side; a foreign tenant's identical pattern
 * is structurally excluded, never merely hidden.
 */
export function KnowledgeView() {
  const { data, isLoading } = useKnowledge();
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  const [ragQuery, setRagQuery] = useState('');
  const [ragResponse, setRagResponse] = useState<any>(null);
  const [isRagLoading, setIsRagLoading] = useState(false);

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

        {/* Ask the Digital Thread (Layer 2 Hybrid RAG) */}
        <section className="kb-section">
          <h2 className="kb-section__title">Ask the Digital Thread</h2>
          <p className="kb-section__sub">Query the Hybrid Retrieval Engine (Semantic Vector Search + Structural Graph Traversal).</p>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <input 
              type="text" 
              className="ui-input" 
              style={{ flex: 1, padding: '12px 16px', borderRadius: '4px', border: '1px solid var(--line-strong)', background: 'var(--bg-1)', color: 'var(--txt-hi)' }} 
              placeholder="E.g., What is the lead time for TX-01, and what does the vendor quote say about delays?"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRagSearch()}
            />
            <button className="btn btn--approve" onClick={handleRagSearch} disabled={isRagLoading}>
              {isRagLoading ? 'Querying...' : 'Search Engine'}
            </button>
          </div>

          {ragResponse && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', border: '1px solid var(--teal-line)', borderRadius: '8px', padding: '24px', background: 'var(--teal-dim)' }}>
              
              <div>
                <h3 style={{ fontSize: 'var(--fs-10)', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Grounded Answer</h3>
                <div style={{ color: 'var(--txt-hi)', lineHeight: 1.6 }}>
                  {ragResponse.answer}
                </div>
              </div>
              
              <div>
                <h3 style={{ fontSize: 'var(--fs-10)', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Reasoning Trace</h3>
                <div className="mono" style={{ color: 'var(--txt-md)', fontSize: '12px' }}>
                  {ragResponse.reasoningTrace}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 'var(--fs-10)', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Structural Graph Facts (Layer 1)</h3>
                <GraphPathViewer facts={ragResponse.graphFacts || []} />
              </div>

              {ragResponse.textChunks && ragResponse.textChunks.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 'var(--fs-10)', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>Semantic Document Context (Layer 2)</h3>
                  <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {ragResponse.textChunks.map((chunk: any, i: number) => (
                      <div key={i} style={{ minWidth: '300px', width: '300px', border: '1px solid var(--line)', borderRadius: '4px', padding: '16px', background: 'var(--bg-0)' }}>
                        <div className="mono" style={{ fontSize: '10px', color: 'var(--teal)', marginBottom: '8px' }}>[Doc: {chunk.sourceDoc}]</div>
                        <div style={{ fontSize: '12px', color: 'var(--txt-md)', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          "{chunk.text}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </section>
      </div>
    </div>
  );
}
