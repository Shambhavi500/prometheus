'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useWorkspace } from '@/core/state/workspace';

/**
 * SplitView — the fundamental layout primitive. Master list stays visible
 * while evidence opens beside it. Drag to resize; double-click snaps 50/50;
 * Ctrl+\ toggles the secondary pane (06_COMPONENTS §3).
 */
export function SplitView({ primary, secondary }: { primary: ReactNode; secondary: ReactNode | null }) {
  const ratio = useWorkspace((s) => s.splitRatio);
  const setRatio = useWorkspace((s) => s.setSplitRatio);
  const [collapsed, setCollapsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback(() => setDragging(true), []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setRatio((e.clientX - rect.left) / rect.width);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, setRatio]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const showSecondary = secondary !== null && !collapsed;

  return (
    <div className="split" ref={containerRef}>
      <div className="split__primary" style={{ flex: showSecondary ? `0 0 ${ratio * 100}%` : '1 1 auto' }}>
        {primary}
      </div>
      {showSecondary && (
        <>
          <div
            className={`split__handle${dragging ? ' dragging' : ''}`}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize evidence pane"
            onPointerDown={onPointerDown}
            onDoubleClick={() => setRatio(0.5)}
          />
          <div className="split__secondary" style={{ flex: '1 1 auto' }}>
            {secondary}
          </div>
        </>
      )}
    </div>
  );
}
