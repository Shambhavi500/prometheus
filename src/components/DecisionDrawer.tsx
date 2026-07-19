'use client';

import { useEffect, useRef } from 'react';
import { useWorkspace } from '@/core/state/workspace';
import { useDecisions, useEntityIndex } from '@/core/api/hooks';
import { DecisionDetail } from '@/features/decisions/DecisionDetail';
import { X } from 'lucide-react';

export function DecisionDrawer() {
  const decisionId = useWorkspace((s) => s.decisionDrawerId);
  const closeDecisionDrawer = useWorkspace((s) => s.closeDecisionDrawer);
  
  const { data: decisionsData } = useDecisions();
  const { data: entityData } = useEntityIndex();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!decisionId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDecisionDrawer();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [decisionId, closeDecisionDrawer]);

  if (!decisionId) return null;

  const decision = decisionsData?.decisions.find(d => d.id === decisionId);
  if (!decision) return null;
  const finding = decisionsData?.findings[decision.findingId];
  if (!finding) return null;

  const entityTags = finding.entityIds.map((id) => ({
    id,
    tag: entityData?.entities.find((e) => e.id === id)?.tag ?? id,
    uncertain: finding.kind === 'entity-resolution' && id === 'EQ-TX01',
  }));

  return (
    <>
      <div className="drawer-scrim" onClick={closeDecisionDrawer} aria-hidden="true" style={{ zIndex: 100 }} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`Decision Context`} ref={panelRef} style={{ width: '960px', maxWidth: '90vw', zIndex: 101 }}>
        <div className="drawer__head">
          <div>
            <div className="drawer__type">Decision View</div>
            <div className="drawer__tag">{decision.id}</div>
          </div>
          <button type="button" className="drawer__close" onClick={closeDecisionDrawer} aria-label="Close decision drawer">
            <X size={16} />
          </button>
        </div>
        <div className="drawer__body" style={{ padding: 0 }}>
          <DecisionDetail
            decision={decision}
            finding={finding}
            entityTags={entityTags}
          />
        </div>
      </aside>
    </>
  );
}
