'use client';

import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls, MarkerType, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface GraphFact {
  node: string;
  edge: string;
  target: string;
  sourceDoc?: string;
}

interface GraphPathViewerProps {
  facts: GraphFact[];
  onNodeClick?: (nodeId: string) => void;
}

export function GraphPathViewer({ facts, onNodeClick }: GraphPathViewerProps) {
  const { nodes, edges } = useMemo(() => {
    const nds: Node[] = [];
    const eds: Edge[] = [];
    const seen = new Set<string>();

    let x = 0;
    let y = 100;

    facts.forEach((fact, i) => {
      // Add Source Node
      if (!seen.has(fact.node)) {
        seen.add(fact.node);
        nds.push({
          id: fact.node,
          position: { x: x, y: y + (i % 2 === 0 ? -40 : 40) },
          data: { label: fact.node },
          style: { background: 'var(--bg-1)', color: 'var(--teal)', border: '1px solid var(--teal-line)', borderRadius: '4px', padding: '10px' }
        });
        x += 200;
      }

      // Add Target Node
      if (!seen.has(fact.target)) {
        seen.add(fact.target);
        nds.push({
          id: fact.target,
          position: { x: x, y: y + (i % 2 === 0 ? 40 : -40) },
          data: { label: fact.target },
          style: { background: 'var(--bg-1)', color: 'var(--txt-hi)', border: '1px solid var(--line-strong)', borderRadius: '4px', padding: '10px' }
        });
        x += 200;
      }

      // Add Edge
      eds.push({
        id: `e-${fact.node}-${fact.target}-${i}`,
        source: fact.node,
        target: fact.target,
        label: fact.edge,
        animated: true,
        style: { stroke: 'var(--teal)' },
        labelStyle: { fill: 'var(--txt-lo)', fontSize: 10 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'var(--teal)',
        },
      });
    });

    return { nodes: nds, edges: eds };
  }, [facts]);

  if (facts.length === 0) {
    return <div style={{ padding: '24px', color: 'var(--txt-lo)' }}>No structural graph dependencies found for this query.</div>;
  }

  return (
    <div style={{ width: '100%', height: '300px', border: '1px solid var(--line-strong)', borderRadius: '4px', background: '#090d16' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        onNodeClick={(_, node) => onNodeClick && onNodeClick(node.id)}
        fitView
      >
        <Background color="var(--line-strong)" gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
