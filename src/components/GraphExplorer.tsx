'use client';

import { useState } from 'react';
import type { EntityBase, Edge } from '@prometheus/ontology';
import { useNeighborhood } from '@/core/api/hooks';

/**
 * GraphExplorer — orthogonal connected-neighborhood view. Never the whole
 * graph; sharp rectangular nodes; typed edge labels; expansion re-centers
 * (03_DESIGN §Knowledge Graph, 04_INTERACTION §Exploration).
 */

const NODE_W = 208;
const NODE_H = 58;
const V_GAP = 14;
const COL_GAP = 96;

interface Props {
  focusId: string;
  onFocus: (id: string) => void;
}

function NodeCard({
  node,
  x,
  y,
  isFocus,
  dimmed,
  onClick,
  onHover,
}: {
  node: EntityBase;
  x: number;
  y: number;
  isFocus: boolean;
  dimmed: boolean;
  onClick: () => void;
  onHover: (id: string | null) => void;
}) {
  return (
    <g
      transform={`translate(${x},${y})`}
      style={{ cursor: 'pointer', opacity: dimmed ? 0.35 : 1, transition: 'opacity 150ms' }}
      onClick={onClick}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      role="button"
      aria-label={`${node.type} ${node.tag}: ${node.name}. Activate to expand.`}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
    >
      <rect
        width={NODE_W}
        height={NODE_H}
        fill={isFocus ? 'var(--bg-3)' : 'var(--bg-2)'}
        stroke={isFocus ? 'var(--teal)' : 'var(--line-strong)'}
        strokeWidth={isFocus ? 1.5 : 1}
      />
      <text x={10} y={16} fill="var(--txt-lo)" fontSize="8.5" letterSpacing="1" style={{ textTransform: 'uppercase' }}>
        {node.type.toUpperCase()}
      </text>
      <text x={10} y={32} fill={isFocus ? 'var(--teal)' : 'var(--txt-hi)'} fontSize="12" fontWeight="600" fontFamily="var(--font-mono)">
        {node.tag}
      </text>
      <text x={10} y={48} fill="var(--txt-md)" fontSize="9.5">
        {node.name.length > 34 ? `${node.name.slice(0, 33)}…` : node.name}
      </text>
      {node.status && (
        <text x={NODE_W - 8} y={16} fill="var(--txt-lo)" fontSize="8.5" textAnchor="end" fontFamily="var(--font-mono)">
          {node.status.toUpperCase()}
        </text>
      )}
    </g>
  );
}

export function GraphExplorer({ focusId, onFocus }: Props) {
  const { data, isLoading } = useNeighborhood(focusId, 1);
  const [hovered, setHovered] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <div className="gx" aria-busy="true">
        <div style={{ padding: 24 }}>
          <div className="skel" style={{ height: NODE_H, width: NODE_W }} />
        </div>
      </div>
    );
  }

  const { focus, edges } = data;
  const nodeById = new Map(data.nodes.map((n) => [n.id, n]));
  // Inbound: neighbor → focus. Outbound: focus → neighbor.
  const inbound = edges.filter((e) => e.to === focusId && e.from !== focusId);
  const outbound = edges.filter((e) => e.from === focusId && e.to !== focusId);

  const colHeight = (n: number) => n * (NODE_H + V_GAP) - V_GAP;
  const maxRows = Math.max(inbound.length, outbound.length, 1);
  const svgH = Math.max(colHeight(maxRows) + 48, 220);
  const xLeft = 24;
  const xFocus = xLeft + NODE_W + COL_GAP;
  const xRight = xFocus + NODE_W + COL_GAP;
  const svgW = xRight + NODE_W + 24;
  const centerY = (count: number, i: number) => 24 + i * (NODE_H + V_GAP) + (colHeight(maxRows) - colHeight(count)) / 2;
  const focusY = 24 + (colHeight(maxRows) - NODE_H) / 2;

  const edgeDim = (e: Edge) => hovered !== null && e.from !== hovered && e.to !== hovered;
  const nodeDim = (id: string) =>
    hovered !== null &&
    hovered !== id &&
    !edges.some((e) => (e.from === hovered && e.to === id) || (e.to === hovered && e.from === id));

  // Orthogonal elbow path between two node edges.
  const path = (x1: number, y1: number, x2: number, y2: number) => {
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;
  };

  return (
    <div className="gx">
      <svg width={svgW} height={svgH} role="img" aria-label={`Connected neighborhood of ${focus.tag}`}>
        {inbound.map((e, i) => {
          const y1 = centerY(inbound.length, i) + NODE_H / 2;
          const y2 = focusY + NODE_H / 2;
          const midX = (xLeft + NODE_W + xFocus) / 2;
          return (
            <g key={e.id} style={{ opacity: edgeDim(e) ? 0.15 : 1, transition: 'opacity 150ms' }}>
              <path d={path(xLeft + NODE_W, y1, xFocus, y2)} fill="none" stroke="var(--line-strong)" strokeWidth="1" />
              <text x={midX} y={Math.min(y1, y2) === y1 ? y1 - 5 : y1 + 12} fill="var(--txt-lo)" fontSize="8.5" fontFamily="var(--font-mono)" textAnchor="middle">
                {e.verb}
              </text>
            </g>
          );
        })}
        {outbound.map((e, i) => {
          const y1 = focusY + NODE_H / 2;
          const y2 = centerY(outbound.length, i) + NODE_H / 2;
          const midX = (xFocus + NODE_W + xRight) / 2;
          return (
            <g key={e.id} style={{ opacity: edgeDim(e) ? 0.15 : 1, transition: 'opacity 150ms' }}>
              <path d={path(xFocus + NODE_W, y1, xRight, y2)} fill="none" stroke="var(--line-strong)" strokeWidth="1" />
              <text x={midX} y={Math.min(y1, y2) === y2 ? y2 - 5 : y2 + 12} fill="var(--txt-lo)" fontSize="8.5" fontFamily="var(--font-mono)" textAnchor="middle">
                {e.verb}
              </text>
            </g>
          );
        })}
        {inbound.map((e, i) => {
          const node = nodeById.get(e.from);
          if (!node) return null;
          return (
            <NodeCard key={e.from + e.id} node={node} x={xLeft} y={centerY(inbound.length, i)} isFocus={false} dimmed={nodeDim(node.id)} onClick={() => onFocus(node.id)} onHover={setHovered} />
          );
        })}
        <NodeCard node={focus} x={xFocus} y={focusY} isFocus dimmed={false} onClick={() => undefined} onHover={setHovered} />
        {outbound.map((e, i) => {
          const node = nodeById.get(e.to);
          if (!node) return null;
          return (
            <NodeCard key={e.to + e.id} node={node} x={xRight} y={centerY(outbound.length, i)} isFocus={false} dimmed={nodeDim(node.id)} onClick={() => onFocus(node.id)} onHover={setHovered} />
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>Relationships of {focus.tag}</caption>
        <thead><tr><th>From</th><th>Relationship</th><th>To</th></tr></thead>
        <tbody>
          {edges.map((e) => (
            <tr key={e.id}>
              <td>{nodeById.get(e.from)?.tag ?? e.from}</td>
              <td>{e.verb}</td>
              <td>{nodeById.get(e.to)?.tag ?? e.to}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
