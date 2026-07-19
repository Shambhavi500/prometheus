"use client";

import React, { useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  MarkerType,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ComplianceAuditResult } from '@/ontology/engineering';
import { useTheme } from 'next-themes';

interface KnowledgeGraphViewerProps {
  data: ComplianceAuditResult | null;
}

export function KnowledgeGraphViewer({ data }: KnowledgeGraphViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { theme } = useTheme();

  useEffect(() => {
    if (!data) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];
    
    let yOffset = 0;

    // 1. Create a Master Spec Node
    const specNodeId = 'master-spec';
    generatedNodes.push({
      id: specNodeId,
      position: { x: 500, y: yOffset },
      data: { label: 'Master Specifications' },
      style: { width: 250, background: 'var(--card)', color: 'var(--text)', border: '2px solid var(--primary)', borderRadius: 'var(--radius)', padding: '10px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    });

    yOffset += 120;

    // 2. Add Extracted Entities (Equipment)
    const entityStartX = Math.max(50, 500 - (data.entitiesExtracted.length * 200) / 2);
    data.entitiesExtracted.forEach((entity, index) => {
      const entityId = `entity-${entity.id || index}`;
      generatedNodes.push({
        id: entityId,
        position: { x: entityStartX + index * 220, y: yOffset },
        data: { label: `${entity.type}: ${entity.name}` },
        style: { width: 200, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px' },
      });
      
      generatedEdges.push({
        id: `edge-${specNodeId}-${entityId}`,
        source: specNodeId,
        target: entityId,
        animated: true,
        style: { stroke: 'var(--muted)' },
      });
    });

    yOffset += 200;

    // 3. Add Deviations, Risks, and Recommendations
    data.deviations.forEach((dev, index) => {
      const devNodeId = `dev-${index}`;
      generatedNodes.push({
        id: devNodeId,
        position: { x: 250 + index * 600, y: yOffset },
        data: { label: `Deviation: ${dev.reason}` },
        style: { width: 400, background: 'var(--card)', color: 'var(--text)', border: '2px solid var(--danger)', borderRadius: 'var(--radius)', padding: '10px', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.1)' },
      });

      // Link Deviation to the Spec
      generatedEdges.push({
        id: `edge-spec-${devNodeId}`,
        source: specNodeId,
        target: devNodeId,
        animated: true,
        style: { stroke: 'var(--danger)', strokeWidth: 2 },
        label: 'VIOLATES',
        labelStyle: { fill: 'var(--danger)', fontWeight: 700 },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--danger)' },
      });

      // Add Downstream Risks
      let lastRiskX = 0;
      dev.downstreamRisks.forEach((risk, riskIndex) => {
        const riskNodeId = `risk-${index}-${riskIndex}`;
        lastRiskX = 50 + index * 600 + riskIndex * 250;
        generatedNodes.push({
          id: riskNodeId,
          position: { x: lastRiskX, y: yOffset + 250 },
          data: { label: `Risk: ${risk.affectedSystem}` },
          style: { width: 220, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--warning)', borderRadius: 'var(--radius)', padding: '10px' },
        });

        generatedEdges.push({
          id: `edge-${devNodeId}-${riskNodeId}`,
          source: devNodeId,
          target: riskNodeId,
          animated: true,
          style: { stroke: 'var(--warning)' },
          label: 'AFFECTS',
        });
      });

      // Add Recommendation
      const recNodeId = `rec-${index}`;
      generatedNodes.push({
        id: recNodeId,
        position: { x: lastRiskX + 270, y: yOffset + 250 },
        data: { label: `Mitigation: ${dev.recommendation.action}` },
        style: { width: 320, background: 'var(--card)', color: 'var(--text)', border: '2px solid var(--success)', borderRadius: 'var(--radius)', padding: '10px' },
      });

      generatedEdges.push({
        id: `edge-${devNodeId}-${recNodeId}`,
        source: recNodeId, // Recommendation mitigates Deviation
        target: devNodeId,
        animated: true,
        style: { stroke: 'var(--success)' },
        label: 'MITIGATES',
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--success)' },
      });
    });

    setNodes(generatedNodes);
    setEdges(generatedEdges);
  }, [data, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--bg-0)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        colorMode={theme === 'dark' ? 'dark' : 'light'}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--muted)" gap={16} />
        <Controls style={{ background: 'var(--surface)', borderColor: 'var(--border)', fill: 'var(--text)' }} />
      </ReactFlow>
    </div>
  );
}
