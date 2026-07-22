'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useDecisions, 
  useSpecRows, 
  useDocuments, 
  useEntityIndex,
  useDecisionActions
} from '@/core/api/hooks';
import { useWorkspace } from '@/core/state/workspace';
import { StatusBadge } from '@/components/StatusBadge';
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

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  reasoningTrace?: string;
  graphFacts?: Array<{ node: string; edge: string; target: string; sourceDoc: string }>;
  textChunks?: Array<{ id: string; text: string; sourceDoc: string; similarityScore?: number }>;
  timestamp: string;
}

/** Interactive Knowledge Graph Viewer Component */
function InteractiveKnowledgeGraph({ specRows, findingsList, documents }: { specRows: any[]; findingsList: any[]; documents: any[] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];

    // Master Specification Root Node
    const rootId = 'doc-master-spec';
    const docName = documents[0]?.name || 'CDU_Equipment_Specification.pdf';
    
    generatedNodes.push({
      id: rootId,
      position: { x: 360, y: 16 },
      data: { label: `📄 ${docName}` },
      style: { 
        width: 280, 
        background: 'var(--bg-1)', 
        color: 'var(--txt-hi)', 
        border: '2px solid var(--teal)', 
        borderRadius: '8px', 
        padding: '10px 14px', 
        fontWeight: 600,
        boxShadow: '0 0 20px rgba(0, 240, 255, 0.12)',
        fontSize: '12px',
        textAlign: 'center'
      },
    });

    // 3 Clean Equipment Columns
    const equipmentList = [
      { id: 'eq-cdu', tag: 'CDU-RACK', desc: 'Thermal & Flow Specs', posX: 40 },
      { id: 'eq-compute', tag: 'CX2-H100', desc: 'Compute NIC Bandwidth', posX: 360 },
      { id: 'eq-nvlink', tag: 'NVSWITCH-TRAY', desc: 'NVLink Bus Architecture', posX: 680 }
    ];

    equipmentList.forEach((eq) => {
      generatedNodes.push({
        id: eq.id,
        position: { x: eq.posX, y: 110 },
        data: { label: `⚙️ ${eq.tag} (${eq.desc})` },
        style: { 
          width: 280, 
          background: 'var(--bg-0)', 
          color: 'var(--teal)', 
          border: '1px solid var(--teal-line)', 
          borderRadius: '6px', 
          padding: '8px 12px',
          fontSize: '11px',
          fontWeight: 500,
          textAlign: 'center'
        },
      });

      generatedEdges.push({
        id: `edge-${rootId}-${eq.id}`,
        source: rootId,
        target: eq.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'var(--teal)', strokeWidth: 1.5 },
        label: 'GOVERNS',
        labelStyle: { fill: 'var(--teal)', fontSize: '9px', fontWeight: 600 },
      });
    });

    // Distribute Findings into Clean Columns Under Corresponding Equipment
    findingsList.slice(0, 9).forEach((f, idx) => {
      const colIdx = idx % 3;
      const rowIdx = Math.floor(idx / 3);
      const parentEq = equipmentList[colIdx];
      const findingNodeId = `finding-${f.id || idx}`;
      
      const posX = parentEq.posX;
      const posY = 210 + rowIdx * 85;

      const isCritical = f.severity === 'Critical';
      const isHigh = f.severity === 'High';

      const truncatedTitle = f.title.length > 32 ? f.title.slice(0, 30) + '…' : f.title;

      const borderColor = isCritical ? '#ff4d4d' : isHigh ? '#ff9900' : 'var(--teal)';
      const bgColor = isCritical ? 'rgba(255, 77, 77, 0.08)' : isHigh ? 'rgba(255, 153, 0, 0.08)' : 'var(--bg-1)';
      const textColor = isCritical ? '#ff6666' : isHigh ? '#ffb330' : 'var(--txt-hi)';

      generatedNodes.push({
        id: findingNodeId,
        position: { x: posX, y: posY },
        data: { label: `[${f.severity}] ${truncatedTitle}` },
        style: { 
          width: 280, 
          background: bgColor, 
          color: textColor, 
          border: `1px solid ${borderColor}`, 
          borderRadius: '6px', 
          padding: '8px 12px',
          fontSize: '11px',
          lineHeight: 1.3,
          boxShadow: isCritical ? '0 0 10px rgba(255, 77, 77, 0.15)' : 'none'
        },
      });

      generatedEdges.push({
        id: `edge-${parentEq.id}-${findingNodeId}`,
        source: parentEq.id,
        target: findingNodeId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: borderColor, strokeWidth: 1.5 },
        label: isCritical ? 'VIOLATES' : 'AFFECTS',
        labelStyle: { fill: borderColor, fontSize: '8px', fontWeight: 700 },
        markerEnd: { type: MarkerType.ArrowClosed, color: borderColor },
      });
    });

    setNodes(generatedNodes);
    setEdges(generatedEdges);
  }, [specRows, findingsList, documents, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '460px', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-0)', border: '1px solid var(--line)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255, 255, 255, 0.03)" gap={24} />
        <Controls style={{ background: 'var(--bg-1)', borderColor: 'var(--line)', fill: 'var(--txt-hi)' }} />
      </ReactFlow>
    </div>
  );
}

export function OverviewView() {
  const router = useRouter();
  const selectDecision = useWorkspace((s) => s.selectDecision);
  
  // Server state hooks
  const { data: decData } = useDecisions();
  const { data: docData } = useDocuments();
  const { data: entityData } = useEntityIndex();
  const { data: specData } = useSpecRows();
  const { approve } = useDecisionActions();

  // Chatbot & Interactive UI states
  const [ragQuery, setRagQuery] = useState('');
  const [isRagLoading, setIsRagLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [showOcrText, setShowOcrText] = useState(false);

  const documents = docData?.documents ?? [];
  const specRows = specData?.rows ?? [];

  const decisions = useMemo(() => {
    return (decData?.decisions ?? []).sort((a, b) => {
      const s = { Critical: 0, High: 1, Medium: 2, Low: 3 } as Record<string, number>;
      const statusDelta = (a.status === 'Pending' ? 0 : 1) - (b.status === 'Pending' ? 0 : 1);
      if (statusDelta !== 0) return statusDelta;
      return (s[a.severity] ?? 9) - (s[b.severity] ?? 9);
    });
  }, [decData]);

  const findingsMap = decData?.findings ?? {};
  const findingsList = Object.values(findingsMap);

  // Active doc for OCR inspector
  const activeOcrDoc = useMemo(() => {
    if (selectedDocId) return documents.find(d => d.id === selectedDocId);
    return documents.find(d => d.ocrResult) || documents[0];
  }, [documents, selectedDocId]);

  // Handle RAG Chatbot query
  const handleRagSearch = async (queryText?: string) => {
    const q = queryText || ragQuery;
    if (!q.trim() || isRagLoading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setRagQuery('');
    setIsRagLoading(true);

    try {
      const res = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: data.answer || "No uploaded documents available for retrieval.",
        reasoningTrace: data.reasoningTrace,
        graphFacts: data.graphFacts || [],
        textChunks: data.textChunks || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `Error querying ET RAG Engine: ${e.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsRagLoading(false);
    }
  };

  return (
    <div className="page" style={{ background: 'var(--bg-0)' }}>
      {/* Top Header Bar */}
      <div className="page__header">
        <div>
          <h1 className="page__title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            Mission Control
            <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '4px', background: 'var(--teal-dim)', border: '1px solid var(--teal-line)', color: 'var(--teal)' }}>
              ET ENGINEERING INTELLIGENCE
            </span>
          </h1>
        </div>
        <span className="page__spacer" />
        <span className="page__meta" style={{ display: 'flex', gap: '24px' }}>
          <span>Platform: <span style={{ color: 'var(--txt-hi)' }}>ET</span></span>
          <span>Role: <span style={{ color: 'var(--txt-hi)' }}>Lead Engineer</span></span>
        </span>
      </div>

      <div className="page__body" style={{ overflowY: 'auto', display: 'block', paddingBottom: '96px' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px 32px 0', display: 'flex', flexDirection: 'column', gap: '40px' }}>

          {/* ========================================================================= */}
          {/* 1. TOP OF PAGE CHATBOT & SEARCH INTERFACE (ASK ET ANYTHING)               */}
          {/* ========================================================================= */}
          <section style={{ background: 'var(--bg-1)', border: '1px solid var(--teal-line)', borderRadius: '12px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 8px 32px rgba(0, 240, 255, 0.05)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--txt-hi)', margin: 0, fontWeight: 400 }}>
                  Ask ET anything...
                </h2>
                <span className="mono" style={{ fontSize: '10px', color: 'var(--teal)', background: 'var(--teal-dim)', padding: '2px 8px', borderRadius: '4px' }}>
                  HYBRID RAG SEARCH
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--txt-md)', marginTop: '4px', margin: 0 }}>
                Query uploaded engineering documents, extract specifications, or search verified compliance evidence.
              </p>
            </div>

            {/* Main Input Box */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                className="ui-input" 
                style={{ flex: 1, padding: '14px 18px', fontSize: '14px', borderRadius: '6px', border: '1px solid var(--teal-line)', background: 'var(--bg-0)', color: 'var(--txt-hi)' }} 
                placeholder="Search uploaded documents or ask a technical question (e.g. Lead time for TX-01)..."
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRagSearch()}
              />
              <button 
                className="btn btn--approve" 
                onClick={() => handleRagSearch()} 
                disabled={isRagLoading || !ragQuery.trim()}
                style={{ padding: '0 28px', fontSize: '14px' }}
              >
                {isRagLoading ? 'Searching...' : 'Search Documents'}
              </button>
            </div>

            {/* Preset Examples per Prompt */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--txt-md)', marginRight: '4px' }}>Examples:</span>
              {[
                "Summarize uploaded specification",
                "Show compliance issues",
                "Find schedule risks",
                "Explain this drawing"
              ].map((example, i) => (
                <button
                  key={i}
                  className="btn"
                  style={{ fontSize: '11px', padding: '5px 12px', background: 'var(--bg-2)' }}
                  onClick={() => handleRagSearch(example)}
                >
                  • {example}
                </button>
              ))}
            </div>

            {/* Message Thread */}
            {messages.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', overflowY: 'auto', marginTop: '8px' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: msg.sender === 'user' ? '80%' : '100%', width: msg.sender === 'ai' ? '100%' : 'auto' }}>
                    <div style={{ fontSize: '10px', color: 'var(--txt-md)' }}>
                      {msg.sender === 'user' ? 'Lead Engineer' : 'ET Assistant'} · {msg.timestamp}
                    </div>

                    <div style={{ 
                      background: msg.sender === 'user' ? 'var(--teal-dim)' : 'var(--bg-0)', 
                      border: `1px solid ${msg.sender === 'user' ? 'var(--teal-line)' : 'var(--line)'}`, 
                      padding: '16px', 
                      borderRadius: '8px',
                      color: 'var(--txt-hi)',
                      fontSize: '13px',
                      lineHeight: 1.5
                    }}>
                      <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

                      {msg.reasoningTrace && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--line)', fontSize: '11px', color: 'var(--txt-md)' }}>
                          <strong>Reasoning Trace:</strong> {msg.reasoningTrace}
                        </div>
                      )}

                      {msg.sender === 'ai' && msg.textChunks && msg.textChunks.length > 0 && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ fontSize: '10px', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Evidence Citations
                          </div>
                          {msg.textChunks.map((chunk, cidx) => (
                            <div key={cidx} style={{ background: 'var(--bg-1)', borderLeft: '2px solid var(--teal)', padding: '8px 12px', borderRadius: '0 4px 4px 0', fontSize: '12px' }}>
                              <div style={{ fontSize: '10px', color: 'var(--txt-md)', marginBottom: '2px' }}>Source: {chunk.sourceDoc}</div>
                              <div style={{ color: 'var(--txt-hi)' }}>"{chunk.text}"</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* 2. OCR RESULTS (REORDERED: NOW FIRST BEFORE DOCUMENT SUMMARY)             */}
          {/* ========================================================================= */}
          <section style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '16px', color: 'var(--txt-hi)', margin: 0, fontWeight: 500 }}>
                  OCR Results
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--txt-md)', marginTop: '2px' }}>
                  Extracted optical text stream and document structure analysis
                </div>
              </div>

              {documents.length > 0 && (
                <select 
                  className="ui-input"
                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px', background: 'var(--bg-2)', color: 'var(--txt-hi)', border: '1px solid var(--line)' }}
                  value={activeOcrDoc?.id || ''}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                >
                  {documents.map((d, idx) => (
                    <option key={`${d.id}-${idx}`} value={d.id}>{d.name} ({d.id})</option>
                  ))}
                </select>
              )}
            </div>

            {activeOcrDoc ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', background: 'var(--bg-0)', padding: '16px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--txt-md)', textTransform: 'uppercase' }}>Pages</div>
                    <div style={{ fontSize: '14px', color: 'var(--txt-hi)', fontWeight: 600, marginTop: '4px' }}>
                      {activeOcrDoc.pagesProcessed ?? 1} Page
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--txt-md)', textTransform: 'uppercase' }}>Extracted Words / Lines</div>
                    <div style={{ fontSize: '14px', color: 'var(--txt-hi)', fontWeight: 600, marginTop: '4px' }}>
                      {activeOcrDoc.ocrResult?.words_result_num ?? 'Standard OCR Parsing'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--txt-md)', textTransform: 'uppercase' }}>Structure Metadata</div>
                    <div style={{ fontSize: '13px', color: 'var(--txt-md)', marginTop: '4px' }}>
                      Accurate Basic Mode
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--txt-md)', textTransform: 'uppercase' }}>OCR Engine</div>
                    <div style={{ fontSize: '13px', color: 'var(--teal)', fontWeight: 500, marginTop: '4px' }}>
                      Baidu High-Accuracy Engine
                    </div>
                  </div>
                </div>

                {activeOcrDoc.ocrResult?.words_result && activeOcrDoc.ocrResult.words_result.length > 0 ? (
                  <div>
                    <button 
                      className="btn" 
                      style={{ fontSize: '12px', padding: '6px 14px' }}
                      onClick={() => setShowOcrText(!showOcrText)}
                    >
                      {showOcrText ? '▲ Hide Extracted Text' : '▼ View Extracted Text'}
                    </button>

                    {showOcrText && (
                      <div className="mono" style={{ marginTop: '12px', padding: '16px', background: 'var(--bg-0)', border: '1px solid var(--teal-line)', borderRadius: '6px', fontSize: '11px', color: 'var(--txt-hi)', maxHeight: '220px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                        {activeOcrDoc.ocrResult.words_result.map((line, idx) => (
                          <div key={idx} style={{ padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ color: 'var(--txt-md)', marginRight: '12px' }}>[{String(idx + 1).padStart(2, '0')}]</span>
                            {line.words}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: 'var(--bg-0)', borderRadius: '6px', border: '1px dashed var(--line)', fontSize: '12px', color: 'var(--txt-md)' }}>
                    Specification document parsed via Gemini. Direct raw OCR text stream not attached to this file.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '24px', background: 'var(--bg-0)', borderRadius: '6px', border: '1px dashed var(--line)', textAlign: 'center', color: 'var(--txt-md)', fontSize: '13px' }}>
                No OCR results available.
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* 3. DOCUMENT SUMMARY (REORDERED: NOW SECOND AFTER OCR RESULTS)             */}
          {/* ========================================================================= */}
          <section style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '16px', color: 'var(--txt-hi)', margin: 0, fontWeight: 500 }}>
                  Document Summary
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--txt-md)', marginTop: '2px' }}>
                  Uploaded project documentation status & analysis manifest
                </div>
              </div>

              <button 
                className="btn" 
                style={{ fontSize: '12px', padding: '6px 14px' }}
                onClick={() => router.push('/')}
              >
                + Upload Engineering Document
              </button>
            </div>

            {documents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {documents.map((doc, idx) => (
                  <div key={`${doc.id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-0)', borderRadius: '6px', border: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="mono" style={{ fontSize: '11px', color: 'var(--teal)' }}>[DOC]</span>
                      <div>
                        <div style={{ fontSize: '13px', color: 'var(--txt-hi)', fontWeight: 500 }}>{doc.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--txt-md)' }}>Uploaded: {new Date(doc.uploadedAt).toLocaleTimeString()} · Type: {doc.type}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'var(--teal-dim)', color: 'var(--teal)', border: '1px solid var(--teal-line)' }}>
                        Status: {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px', background: 'var(--bg-0)', borderRadius: '6px', border: '1px dashed var(--line)', textAlign: 'center', color: 'var(--txt-md)', fontSize: '13px' }}>
                No uploaded documents. Upload an engineering document on the home page to begin analysis.
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* 4. EXECUTION KNOWLEDGE GRAPH (INTERACTIVE GRAPH VIEW)                     */}
          {/* ========================================================================= */}
          <section style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '16px', color: 'var(--txt-hi)', margin: 0, fontWeight: 500 }}>
                  Execution Knowledge Graph
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--txt-md)', marginTop: '2px' }}>
                  Interactive network map connecting documents, extracted equipment specifications, schedule risks, and governing code clauses
                </div>
              </div>

              <button 
                className="btn" 
                style={{ fontSize: '12px', padding: '6px 14px' }}
                onClick={() => router.push('/explorer')}
              >
                Full Thread Explorer →
              </button>
            </div>

            <InteractiveKnowledgeGraph specRows={specRows} findingsList={findingsList} documents={documents} />
          </section>

          {/* ========================================================================= */}
          {/* 5. GEMINI STRUCTURED EXTRACTION                                           */}
          {/* ========================================================================= */}
          <section style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', color: 'var(--txt-hi)', margin: 0, fontWeight: 500 }}>
                Gemini Structured Extraction Results
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--txt-md)', marginTop: '2px' }}>
                Extracted engineering parameters, equipment tags, required specifications, and compliance verdicts
              </div>
            </div>

            {specRows.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--txt-md)', height: '36px' }}>
                      <th style={{ padding: '8px' }}>Equipment Tag</th>
                      <th style={{ padding: '8px' }}>Parameter</th>
                      <th style={{ padding: '8px' }}>Required Spec</th>
                      <th style={{ padding: '8px' }}>Submitted Value</th>
                      <th style={{ padding: '8px' }}>Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specRows.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', height: '40px' }}>
                        <td style={{ padding: '8px', color: 'var(--teal)', fontWeight: 500 }}>{r.equipmentTag}</td>
                        <td style={{ padding: '8px', color: 'var(--txt-hi)' }}>{r.parameter}</td>
                        <td style={{ padding: '8px', color: 'var(--txt-hi)' }}>{r.required}</td>
                        <td style={{ padding: '8px', color: 'var(--txt-hi)' }}>{r.submitted}</td>
                        <td style={{ padding: '8px' }}><StatusBadge label={r.verdict} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '24px', background: 'var(--bg-0)', borderRadius: '6px', border: '1px dashed var(--line)', textAlign: 'center', color: 'var(--txt-md)', fontSize: '13px' }}>
                No extracted entities.
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* 6. FINDINGS & RECOMMENDATIONS                                             */}
          {/* ========================================================================= */}
          <section style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', color: 'var(--txt-hi)', margin: 0, fontWeight: 500 }}>
                EPC Findings & Action Recommendations
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--txt-md)', marginTop: '2px' }}>
                AI reasoned engineering deviations, schedule risks, and vendor bottlenecks
              </div>
            </div>

            {findingsList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {findingsList.map(f => {
                  const matchingDec = decisions.find(d => d.findingId === f.id);
                  return (
                    <div key={f.id} style={{ border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg-0)', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <StatusBadge label={f.severity} />
                          <span style={{ fontSize: '14px', color: 'var(--txt-hi)', fontWeight: 500 }}>{f.title}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--txt-md)' }}>{f.agentName}</span>
                      </div>

                      <div style={{ fontSize: '13px', color: 'var(--txt-md)', lineHeight: 1.5, marginBottom: '12px' }}>
                        <strong>Reason:</strong> {f.finding}
                      </div>

                      {f.citations && f.citations.length > 0 && (
                        <div style={{ fontSize: '11px', color: 'var(--teal)', marginBottom: '12px' }}>
                          <strong>Citation:</strong> {f.citations[0].docTitle} (Page {f.citations[0].page}) — "{f.citations[0].quote}"
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--txt-hi)' }}>
                          <strong>Recommendation:</strong> {f.recommendation}
                        </div>

                        {matchingDec && (
                          <button 
                            className="btn btn--approve" 
                            style={{ fontSize: '11px', padding: '4px 12px' }}
                            onClick={() => approve.mutate(matchingDec.id)}
                            disabled={matchingDec.status !== 'Pending'}
                          >
                            {matchingDec.status === 'Signed' ? 'Approved' : 'Authorize Action'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '24px', background: 'var(--bg-0)', borderRadius: '6px', border: '1px dashed var(--line)', textAlign: 'center', color: 'var(--txt-md)', fontSize: '13px' }}>
                No findings generated.
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* 7. KNOWLEDGE GRAPH INTEGRATION CTA                                         */}
          {/* ========================================================================= */}
          <section style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '16px', color: 'var(--txt-hi)', margin: 0, fontWeight: 500 }}>
                  Knowledge Graph Updated
                </h2>
                <span className="badge badge--success" style={{ background: 'var(--teal-dim)', color: 'var(--teal)', border: '1px solid var(--teal-line)' }}>
                  Active Memory
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--txt-md)', marginTop: '4px' }}>
                Extracted entities, equipment dependencies, and precedent links have been mapped into the governing project graph.
              </div>
            </div>

            <button 
              className="btn btn--approve" 
              style={{ padding: '10px 20px', fontSize: '13px', whiteSpace: 'nowrap' }}
              onClick={() => router.push('/explorer')}
            >
              Open Graph →
            </button>
          </section>

          {/* ========================================================================= */}
          {/* 8. EVIDENCE USED (RAG CONTEXT)                                             */}
          {/* ========================================================================= */}
          <section style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', color: 'var(--txt-hi)', margin: 0, fontWeight: 500 }}>
                Evidence Used
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--txt-md)', marginTop: '2px' }}>
                Verified document snippets and citation sources supporting current AI intelligence
              </div>
            </div>

            {findingsList.some(f => f.citations && f.citations.length > 0) ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {findingsList.filter(f => f.citations?.length).slice(0, 4).map((f, i) => (
                  <div key={i} style={{ background: 'var(--bg-0)', borderLeft: '3px solid var(--teal)', padding: '14px', borderRadius: '0 6px 6px 0', border: '1px solid var(--line)', borderLeftColor: 'var(--teal)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--teal)', fontWeight: 600, marginBottom: '4px' }}>
                      Document: {f.citations[0].docTitle} (Pg {f.citations[0].page})
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--txt-hi)', lineHeight: 1.4 }}>
                      "{f.citations[0].quote}"
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px', background: 'var(--bg-0)', borderRadius: '6px', border: '1px dashed var(--line)', textAlign: 'center', color: 'var(--txt-md)', fontSize: '13px' }}>
                No indexed evidence.
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
