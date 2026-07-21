'use client';

import { useState, useEffect } from 'react';
import { DocumentViewer } from './DocumentViewer';

export function DocumentsView() {
  const [tree, setTree] = useState<any[]>([]);
  const [crossRefs, setCrossRefs] = useState<any[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedIsFile, setSelectedIsFile] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/repository?action=tree').then(res => res.json()),
      fetch('/api/repository?action=cross-refs').then(res => res.json())
    ]).then(([treeData, refsData]) => {
      if (treeData.tree) setTree(treeData.tree);
      if (refsData.crossRefs) setCrossRefs(refsData.crossRefs);
      setLoading(false);
    });
  }, []);

  const renderTree = (nodes: any[], depth = 0) => {
    return nodes.map((node, i) => (
      <div key={i} style={{ marginLeft: depth > 0 ? '1rem' : 0 }}>
        <div 
          onClick={() => {
            setSelectedPath(node.path);
            setSelectedIsFile(node.type === 'file');
          }}
          style={{
            padding: '0.4rem 0.75rem',
            cursor: 'pointer',
            fontSize: '12px',
            color: selectedPath === node.path ? 'var(--bg-0)' : 'var(--text-1)',
            background: selectedPath === node.path ? 'var(--teal)' : 'transparent',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2px',
            userSelect: 'none'
          }}
        >
          {node.type === 'directory' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          )}
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {node.name.replace(/^[0-9]+-/, '').replace(/-/g, ' ').replace('.md', '')}
          </span>
        </div>
        {node.type === 'directory' && node.children && node.children.length > 0 && (
          <div style={{ marginTop: '2px' }}>
            {renderTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', background: 'var(--bg-0)' }}>
      {/* Sidebar Navigation */}
      <div style={{ 
        width: '300px', 
        borderRight: '1px solid var(--bg-2)', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'var(--bg-0)'
      }}>
        <div style={{ 
          padding: '1.5rem', 
          borderBottom: '1px solid var(--bg-2)' 
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-0)', margin: 0 }}>
            Project Repository
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '0.25rem' }}>
            Prometheus EPC Package
          </p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {loading ? (
            <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>Loading repository...</div>
          ) : (
            renderTree(tree)
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!selectedPath ? (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--text-2)',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.5 }}>
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <div>Select a document or folder from the repository.</div>
          </div>
        ) : selectedIsFile ? (
          <DocumentViewer filePath={selectedPath} crossRefs={crossRefs} />
        ) : (
          <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--text-0)', marginBottom: '1rem' }}>
              Directory Listing
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>
              Select a document from the sidebar to view its contents and cross-references.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
