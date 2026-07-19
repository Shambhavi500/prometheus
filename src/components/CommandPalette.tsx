'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDecisions, useEntityIndex, type EntityIndexItem } from '@/core/api/hooks';
import { useWorkspace } from '@/core/state/workspace';

/**
 * CommandPalette — keyboard-first universal search & action engine (Ctrl+K).
 * Zero-state: recent entities and pending decisions. Typing streams grouped
 * results: Entities, Commands, Decisions (06_COMPONENTS §4).
 */

interface PaletteItem {
  key: string;
  group: 'Entities' | 'Commands' | 'Pending Decisions';
  label: string;
  hint: string;
  run: () => void;
}

const NAV_COMMANDS: Array<{ label: string; path: string; hint: string }> = [
  { label: 'Open Command Console', path: '/console', hint: 'Workspace' },
  { label: 'Open Spec-Compliance Board', path: '/spec-compliance', hint: 'Workspace' },
  { label: 'Open Schedule-Risk Board', path: '/schedule-risk', hint: 'Workspace' },
  { label: 'Open Thread Explorer', path: '/explorer', hint: 'Workspace' },
  { label: 'Open Audit Log', path: '/audit', hint: 'Workspace' },
];

export function CommandPalette() {
  const open = useWorkspace((s) => s.paletteOpen);
  const setOpen = useWorkspace((s) => s.setPaletteOpen);
  const openDrawer = useWorkspace((s) => s.openDrawer);
  const openDecisionDrawer = useWorkspace((s) => s.openDecisionDrawer);
  const selectDecision = useWorkspace((s) => s.selectDecision);
  const recentIds = useWorkspace((s) => s.recentEntityIds);
  const router = useRouter();
  const { data: entityData } = useEntityIndex();
  const { data: decisionData } = useDecisions();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!useWorkspace.getState().paletteOpen);
      } else if (e.key === 'Escape' && useWorkspace.getState().paletteOpen) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const items = useMemo<PaletteItem[]>(() => {
    const entities = entityData?.entities ?? [];
    const pending = (decisionData?.decisions ?? []).filter((d) => d.status === 'Pending');
    const query = q.trim().toLowerCase();
    const out: PaletteItem[] = [];

    const pushEntity = (e: EntityIndexItem) =>
      out.push({
        key: `ent-${e.id}`,
        group: 'Entities',
        label: `${e.tag} — ${e.name}`,
        hint: e.type,
        run: () => {
          setOpen(false);
          openDrawer(e.id);
        },
      });

    if (!query) {
      for (const id of recentIds) {
        const e = entities.find((x) => x.id === id);
        if (e) pushEntity(e);
      }
      for (const d of pending.slice(0, 4)) {
        out.push({
          key: `dec-${d.id}`,
          group: 'Pending Decisions',
          label: `${d.id} — ${d.action}`,
          hint: d.severity,
          run: () => {
            setOpen(false);
            openDecisionDrawer(d.id);
          },
        });
      }
      for (const c of NAV_COMMANDS.slice(0, 3)) {
        out.push({ key: `cmd-${c.path}`, group: 'Commands', label: c.label, hint: c.hint, run: () => { setOpen(false); router.push(c.path); } });
      }
      return out;
    }

    for (const e of entities.filter((x) => `${x.tag} ${x.name} ${x.type}`.toLowerCase().includes(query)).slice(0, 8)) {
      pushEntity(e);
    }
    for (const c of NAV_COMMANDS.filter((x) => x.label.toLowerCase().includes(query))) {
      out.push({ key: `cmd-${c.path}`, group: 'Commands', label: c.label, hint: c.hint, run: () => { setOpen(false); router.push(c.path); } });
    }
    for (const d of pending.filter((x) => `${x.id} ${x.action}`.toLowerCase().includes(query)).slice(0, 4)) {
      out.push({
        key: `dec-${d.id}`,
        group: 'Pending Decisions',
        label: `${d.id} — ${d.action}`,
        hint: d.severity,
        run: () => {
          setOpen(false);
          openDecisionDrawer(d.id);
        },
      });
    }
    return out;
  }, [q, entityData, decisionData, recentIds, openDrawer, router, selectDecision, setOpen]);

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, items.length - 1)));
  }, [items.length]);

  if (!open) return null;

  let lastGroup = '';

  return (
    <>
      <div className="palette-scrim" onClick={() => setOpen(false)} aria-hidden="true" />
      <div className="palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setActive(0); }}
          placeholder="Search entities, commands, or decisions..."
          aria-label="Search entities, commands, or decisions"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
            else if (e.key === 'Enter' && items[active]) { e.preventDefault(); items[active].run(); }
          }}
        />
        <div className="palette__list" role="listbox">
          {items.length === 0 && <div className="palette__empty">No matching entities, commands, or decisions found in Project Meghdoot.</div>}
          {items.map((item, i) => {
            const showGroup = item.group !== lastGroup;
            lastGroup = item.group;
            return (
              <div key={item.key}>
                {showGroup && <div className="palette__group">{item.group}</div>}
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  className={`palette__item${i === active ? ' active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={item.run}
                >
                  <span className="name">{item.label}</span>
                  <span className="hint">{item.hint}</span>
                </button>
              </div>
            );
          })}
        </div>
        <div className="palette__footer">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
          <span style={{ marginLeft: 'auto' }}>Try: “TX-01” or “Schedule”</span>
        </div>
      </div>
    </>
  );
}
