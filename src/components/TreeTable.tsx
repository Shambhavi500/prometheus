'use client';

import { useState } from 'react';
import { CX_LEVELS, CX_LEVEL_NAME, type CxNode, type CxStatus } from '@/server/types';
import { Check, CircleDashed, AlertTriangle, X, Circle } from 'lucide-react';

/**
 * TreeTable — L1–L5 commissioning readiness. Indentation strictly 16px/level;
 * 44px expand targets; AI-flagged nested risks auto-expand. Each level is a
 * bullet-graph cell; readiness is a horizontal progress bar (06_COMPONENTS §2,
 * 03_DESIGN §Data Visualization).
 */

const STATUS_CLASS: Record<CxStatus, string> = {
  Complete: 'cx--complete',
  'In Progress': 'cx--progress',
  'At Risk': 'cx--atrisk',
  Blocked: 'cx--blocked',
  'Not Started': 'cx--none',
};

const STATUS_GLYPH: Record<CxStatus, React.ReactNode> = {
  Complete: <Check size={14} />,
  'In Progress': <CircleDashed size={14} />,
  'At Risk': <AlertTriangle size={14} />,
  Blocked: <X size={14} />,
  'Not Started': <Circle size={14} opacity={0.3} />,
};

function LevelCell({ level, status }: { level: string; status: CxStatus }) {
  return (
    <div className={`cx-cell ${STATUS_CLASS[status]}`} title={`${level} — ${status}`}>
      <span className="cx-cell__glyph" aria-hidden="true">{STATUS_GLYPH[status]}</span>
      <span className="sr-only">{level} {status}</span>
    </div>
  );
}

function Row({ node, depth, expanded, toggle }: { node: CxNode; depth: number; expanded: boolean; toggle: () => void }) {
  const hasChildren = !!node.children?.length;
  return (
    <div className={`cx-row cx-row--${node.kind}`} role="row">
      <div className="cx-row__name" role="gridcell" style={{ paddingLeft: 8 + depth * 16 }}>
        {hasChildren ? (
          <button type="button" className="cx-row__toggle" onClick={toggle} aria-expanded={expanded} aria-label={`${expanded ? 'Collapse' : 'Expand'} ${node.tag}`}>
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="cx-row__toggle" aria-hidden="true" />
        )}
        <span className="cx-row__tag mono">{node.tag}</span>
        <span className="cx-row__label">{node.name}</span>
        {node.blockingCause && <span className="cx-row__cause">{node.blockingCause}</span>}
      </div>
      {CX_LEVELS.map((lv) => (
        <div key={lv} role="gridcell" className="cx-row__level">
          <LevelCell level={lv} status={node.levels[lv]} />
        </div>
      ))}
      <div className="cx-row__readiness" role="gridcell">
        <div className="cx-bar">
          <div className="cx-bar__fill" style={{ width: `${node.readinessPct}%` }} data-full={node.readinessPct >= 100} />
        </div>
        <span className="cx-bar__pct mono">{node.readinessPct}%</span>
      </div>
    </div>
  );
}

export function TreeTable({ tree }: { tree: CxNode[] }) {
  // AI-flagged nested risks (Blocked/At Risk) auto-expand so the risk is visible.
  const initial = new Set<string>();
  for (const sys of tree) {
    if (sys.children?.some((c) => c.levels.L1 === 'Blocked' || c.levels.L1 === 'At Risk')) initial.add(sys.id);
  }
  const [expanded, setExpanded] = useState<Set<string>>(initial);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="cx-tree" role="grid" aria-label="L1 to L5 commissioning readiness">
      <div className="cx-tree__head" role="row">
        <div role="columnheader">System / Subsystem</div>
        {CX_LEVELS.map((lv) => (
          <div key={lv} role="columnheader" className="cx-tree__lvhead" title={CX_LEVEL_NAME[lv]}>{lv}</div>
        ))}
        <div role="columnheader" className="cx-tree__rhead">Readiness</div>
      </div>
      <div className="cx-tree__body">
        {tree.map((sys) => (
          <div key={sys.id}>
            <Row node={sys} depth={0} expanded={expanded.has(sys.id)} toggle={() => toggle(sys.id)} />
            {expanded.has(sys.id) &&
              sys.children?.map((sub) => <Row key={sub.id} node={sub} depth={1} expanded={false} toggle={() => undefined} />)}
          </div>
        ))}
      </div>
      <div className="cx-tree__legend">
        {CX_LEVELS.map((lv) => (
          <span key={lv} className="mono">{lv} {CX_LEVEL_NAME[lv]}</span>
        ))}
      </div>
    </div>
  );
}
