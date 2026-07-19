'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef, type ReactNode } from 'react';

/**
 * VirtualTable — virtualized, keyboard-first data table.
 * J/K (and arrows) traverse rows; selection drives the adjacent SplitView.
 * Numerics are tabular monospace; empty states explain *why* (06_COMPONENTS).
 */

export interface Column<T> {
  key: string;
  header: string;
  width: string; // CSS grid track
  numeric?: boolean;
  render: (row: T) => ReactNode;
}

export function VirtualTable<T>({
  columns,
  rows,
  rowKey,
  selectedKey,
  onSelect,
  emptyText,
  ariaLabel,
  loading = false,
  enableKeys = true,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  selectedKey: string | null;
  onSelect: (row: T) => void;
  emptyText: string;
  ariaLabel: string;
  loading?: boolean;
  enableKeys?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const template = columns.map((c) => c.width).join(' ');

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 32,
    overscan: 12,
  });

  useEffect(() => {
    if (!enableKeys) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const down = e.key === 'j' || e.key === 'ArrowDown';
      const up = e.key === 'k' || e.key === 'ArrowUp';
      if (!down && !up) return;
      if (rows.length === 0) return;
      e.preventDefault();
      const idx = rows.findIndex((r) => rowKey(r) === selectedKey);
      const next = idx < 0 ? 0 : Math.min(rows.length - 1, Math.max(0, idx + (down ? 1 : -1)));
      onSelect(rows[next]);
      virtualizer.scrollToIndex(next);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rows, selectedKey, onSelect, rowKey, enableKeys, virtualizer]);

  return (
    <div className="vt" role="grid" aria-label={ariaLabel}>
      <div className="vt__header" role="row" style={{ gridTemplateColumns: template }}>
        {columns.map((c) => (
          <div key={c.key} role="columnheader" className={c.numeric ? 'num' : undefined}>
            {c.header}
          </div>
        ))}
      </div>
      <div className="vt__scroll" ref={scrollRef}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skel-row">
              <span className="skel" style={{ width: 48 }} />
              <span className="skel" style={{ width: 180 }} />
              <span className="skel" style={{ width: 100 }} />
            </div>
          ))
        ) : rows.length === 0 ? (
          <div className="vt__empty">{emptyText}</div>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((vi) => {
              const row = rows[vi.index];
              const key = rowKey(row);
              const selected = key === selectedKey;
              return (
                <div
                  key={key}
                  role="row"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  className={`vt__row${selected ? ' selected' : ''}`}
                  style={{
                    gridTemplateColumns: template,
                    position: 'absolute',
                    top: 0,
                    transform: `translateY(${vi.start}px)`,
                  }}
                  onClick={() => onSelect(row)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(row);
                    }
                  }}
                >
                  {columns.map((c) => (
                    <div key={c.key} role="gridcell" className={c.numeric ? 'num' : undefined}>
                      {c.render(row)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
