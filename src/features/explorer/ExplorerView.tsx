'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GraphExplorer } from '@/components/GraphExplorer';
import { useEntityIndex, useNeighborhood, useDocuments } from '@/core/api/hooks';

/**
 * Digital Thread Explorer — lateral, relational navigation. Breadcrumbs are
 * traversal history, not folders; every entity is traversable, zero
 * dead-ends (04_INTERACTION §Navigation).
 */
export function ExplorerView() {
  const params = useSearchParams();
  const initialFocus = params.get('focus') ?? 'EQ-TX01';
  const [focusId, setFocusId] = useState(initialFocus);
  const [history, setHistory] = useState<string[]>([initialFocus]);
  const { data: entityData } = useEntityIndex();
  const { data: hood } = useNeighborhood(focusId, 1);
  const { data: docData } = useDocuments();
  
  const [filterMode, setFilterMode] = useState<'all'|'baseline'|'live'>('all');
  const [filterDocId, setFilterDocId] = useState<string>('all');

  useEffect(() => {
    const fromUrl = params.get('focus');
    if (fromUrl && fromUrl !== focusId) {
      setFocusId(fromUrl);
      setHistory((h) => (h[h.length - 1] === fromUrl ? h : [...h, fromUrl]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const tagOf = (id: string) => entityData?.entities.find((e) => e.id === id)?.tag ?? id;

  const focusTo = (id: string) => {
    setFocusId(id);
    setHistory((h) => [...h, id]);
  };

  const jumpTo = (index: number) => {
    setFocusId(history[index]);
    setHistory((h) => h.slice(0, index + 1));
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Thread Explorer</h1>
        <span className="page__meta">
          {hood ? `${hood.nodes.length - 1} connected entities · ${hood.edges.length} typed edges` : 'Traversing graph...'}
        </span>
        <span className="page__spacer" />
        <span className="page__meta" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span>Traversing Graph</span>
          <select 
            value={filterMode} 
            onChange={e => setFilterMode(e.target.value as any)}
            style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', color: 'var(--txt-hi)', padding: '2px 8px', borderRadius: '4px' }}
          >
            <option value="all">All Data</option>
            <option value="baseline">Baseline Only</option>
            <option value="live">Live Only</option>
          </select>
          <select 
            value={filterDocId} 
            onChange={e => setFilterDocId(e.target.value)}
            style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', color: 'var(--txt-hi)', padding: '2px 8px', borderRadius: '4px' }}
          >
            <option value="all">All Documents</option>
            {docData?.documents.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </span>
      </div>
      <div className="gx__crumbs" aria-label="Traversal history">
        {history.map((id, i) => (
          <span key={`${id}-${i}`} style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
            {i > 0 && <span className="sep">→</span>}
            {i === history.length - 1 ? (
              <span className="current">{tagOf(id)}</span>
            ) : (
              <button type="button" onClick={() => jumpTo(i)}>{tagOf(id)}</button>
            )}
          </span>
        ))}
      </div>
      <div className="page__body" style={{ minHeight: 0 }}>
        <GraphExplorer focusId={focusId} onFocus={focusTo} filterMode={filterMode} filterDocId={filterDocId} />
      </div>
    </div>
  );
}
