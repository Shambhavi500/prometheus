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

interface KnowledgeGraphViewerProps {
  data: ComplianceAuditResult | null;
}

export function KnowledgeGraphViewer({ data }: KnowledgeGraphViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

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
      style: { width: 250, background: '#1e3a8a', color: '#fff', border: '1px solid #3b82f6', borderRadius: '4px', padding: '10px' },
    });

    yOffset += 120;

    // 2. Add Extracted Entities (Equipment)
    // Spread them out horizontally
    const entityStartX = Math.max(50, 500 - (data.entitiesExtracted.length * 200) / 2);
    data.entitiesExtracted.forEach((entity, index) => {
      const entityId = `entity-${entity.id || index}`;
      generatedNodes.push({
        id: entityId,
        position: { x: entityStartX + index * 220, y: yOffset },
        data: { label: `${entity.type}: ${entity.name}` },
        style: { width: 200, background: '#374151', color: '#fff', border: '1px solid #4b5563', borderRadius: '4px', padding: '10px' },
      });
      
      generatedEdges.push({
        id: `edge-${specNodeId}-${entityId}`,
        source: specNodeId,
        target: entityId,
        animated: true,
        style: { stroke: '#9ca3af' },
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
        style: { width: 400, background: '#7f1d1d', color: '#fff', border: '1px solid #ef4444', borderRadius: '4px', padding: '10px' },
      });

      // Link Deviation to the Spec
      generatedEdges.push({
        id: `edge-spec-${devNodeId}`,
        source: specNodeId,
        target: devNodeId,
        animated: true,
        style: { stroke: '#ef4444', strokeWidth: 2 },
        label: 'VIOLATES',
        labelStyle: { fill: '#ef4444', fontWeight: 700 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
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
          style: { width: 220, background: '#9a3412', color: '#fff', border: '1px solid #f97316', borderRadius: '4px', padding: '10px' },
        });

        generatedEdges.push({
          id: `edge-${devNodeId}-${riskNodeId}`,
          source: devNodeId,
          target: riskNodeId,
          animated: true,
          style: { stroke: '#f97316' },
          label: 'AFFECTS',
        });
      });

      // Add Recommendation (place it to the right of the last risk node)
      const recNodeId = `rec-${index}`;
      generatedNodes.push({
        id: recNodeId,
        position: { x: lastRiskX + 270, y: yOffset + 250 },
        data: { label: `Mitigation: ${dev.recommendation.action}` },
        style: { width: 320, background: '#14532d', color: '#fff', border: '1px solid #22c55e', borderRadius: '4px', padding: '10px' },
      });

      generatedEdges.push({
        id: `edge-${devNodeId}-${recNodeId}`,
        source: recNodeId, // Recommendation mitigates Deviation
        target: devNodeId,
        animated: true,
        style: { stroke: '#22c55e' },
        label: 'MITIGATES',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
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
        className="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#333" gap={16} />
        <Controls className="!bg-gray-900 !border-gray-800 !fill-gray-400" />
      </ReactFlow>
    </div>
  );
}
