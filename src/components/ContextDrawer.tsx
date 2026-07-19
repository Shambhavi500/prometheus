'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { INVERSE_LABEL } from '@prometheus/ontology';
import { useNeighborhood } from '@/core/api/hooks';
import { useWorkspace } from '@/core/state/workspace';
import { StatusBadge } from './StatusBadge';
import { X } from 'lucide-react';

/**
 * ContextDrawer — 360° view of any entity without leaving the page.
 * Focus is trapped while open; Escape closes and returns focus to the
 * triggering element (06_COMPONENTS §Data, Accessibility contract).
 */
export function ContextDrawer() {
  const entityId = useWorkspace((s) => s.drawerEntityId);
  const closeDrawer = useWorkspace((s) => s.closeDrawer);
  const openDrawer = useWorkspace((s) => s.openDrawer);
  const router = useRouter();
  const { data } = useNeighborhood(entityId, 1);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (entityId) closeRef.current?.focus();
  }, [entityId, data]);

  useEffect(() => {
    if (!entityId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDrawer();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>('button, [tabindex="0"], a[href]');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [entityId, closeDrawer]);

  if (!entityId) return null;

  const focus = data?.focus;
  const nodeById = new Map((data?.nodes ?? []).map((n) => [n.id, n]));
  const outbound = (data?.edges ?? []).filter((e) => e.from === entityId);
  const inbound = (data?.edges ?? []).filter((e) => e.to === entityId);
  const riskFlags = inbound
    .filter((e) => e.verb === 'THREATENS')
    .map((e) => nodeById.get(e.from))
    .filter((n) => n && n.type === 'Risk');

  return (
    <>
      <div className="drawer-scrim" onClick={closeDrawer} aria-hidden="true" />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`Context: ${focus?.tag ?? entityId}`} ref={panelRef}>
        <div className="drawer__head">
          <div>
            <div className="drawer__type">{focus?.type ?? 'Entity'}</div>
            <div className="drawer__tag">{focus?.tag ?? entityId}</div>
          </div>
          {focus?.status && <StatusBadge label={focus.status} />}
          <button type="button" className="drawer__close" onClick={closeDrawer} aria-label="Close context drawer" ref={closeRef}>
            <X size={16} />
          </button>
        </div>
        <div className="drawer__body">
          <div className="drawer__section">
            <div className="detail__label">Metadata</div>
            <dl className="drawer__kv">
              <dt>Name</dt>
              <dd style={{ fontFamily: 'var(--font-ui)' }}>{focus?.name}</dd>
              <dt>Verification</dt>
              <dd>{focus?.verification}</dd>
              {focus?.sourceSystem && (
                <>
                  <dt>Source system</dt>
                  <dd>{focus.sourceSystem}</dd>
                </>
              )}
              {Object.entries(focus?.props ?? {}).slice(0, 6).map(([k, v]) => (
                <FragmentKV key={k} k={k} v={String(v)} />
              ))}
            </dl>
          </div>
          {riskFlags.length > 0 && (
            <div className="drawer__section">
              <div className="detail__label">Active Flags</div>
              {riskFlags.map((r) => (
                <div key={r!.id} className="drawer__flag">
                  <StatusBadge label={String(r!.props.severity ?? 'Open')} />
                  <span>{r!.name}</span>
                </div>
              ))}
            </div>
          )}
          <div className="drawer__section">
            <div className="detail__label">Connected Graph Edges</div>
            <div className="drawer__edges">
              {outbound.map((e) => {
                const other = nodeById.get(e.to);
                if (!other) return null;
                return (
                  <div key={e.id} className="drawer__edge">
                    <span className="drawer__verb">{e.verb}</span>
                    <button type="button" className="etag" onClick={(ev) => openDrawer(other.id, ev.currentTarget)}>
                      {other.tag}
                    </button>
                    <span style={{ color: 'var(--txt-lo)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{other.name}</span>
                  </div>
                );
              })}
              {inbound.map((e) => {
                const other = nodeById.get(e.from);
                if (!other) return null;
                return (
                  <div key={e.id} className="drawer__edge">
                    <span className="drawer__verb">{INVERSE_LABEL[e.verb]}</span>
                    <button type="button" className="etag" onClick={(ev) => openDrawer(other.id, ev.currentTarget)}>
                      {other.tag}
                    </button>
                    <span style={{ color: 'var(--txt-lo)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{other.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="drawer__section">
            <button
              type="button"
              className="btn"
              onClick={() => {
                closeDrawer();
                router.push(`/explorer?focus=${encodeURIComponent(entityId)}`);
              }}
            >
              Open in Thread Explorer
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function FragmentKV({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </>
  );
}
