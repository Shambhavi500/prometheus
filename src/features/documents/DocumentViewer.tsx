'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DocumentViewerProps {
  filePath: string;
  crossRefs: any[];
}

export function DocumentViewer({ filePath, crossRefs }: DocumentViewerProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/repository?action=file&path=${encodeURIComponent(filePath)}`)
      .then(res => res.json())
      .then(data => {
        if (data.content) setContent(data.content);
        else setContent('Error loading document.');
        setLoading(false);
      })
      .catch(() => {
        setContent('Error loading document.');
        setLoading(false);
      });
  }, [filePath]);

  // Find related cross-references for this document based on the file name.
  // We can extract the document number from the file name.
  // E.g., MGD-ATL-PM-REG-0001_Project-Master-Data-Book.md -> MGD-ATL-PM-REG-0001
  const docNoMatch = filePath.match(/([A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+-\d+)/);
  const docNo = docNoMatch ? docNoMatch[1] : '';

  const relatedRefs = crossRefs.filter(ref => 
    ref.source_doc === docNo || ref.target_doc_or_entity === docNo
  );

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 4rem' }} className="markdown-container">
        {loading ? (
          <div style={{ color: 'var(--text-2)' }}>Loading document...</div>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({node, ...props}) => <table className="doc-table" {...props} />,
              th: ({node, ...props}) => <th className="doc-th" {...props} />,
              td: ({node, ...props}) => <td className="doc-td" {...props} />,
              h1: ({node, ...props}) => <h1 className="doc-h1" {...props} />,
              h2: ({node, ...props}) => <h2 className="doc-h2" {...props} />,
              h3: ({node, ...props}) => <h3 className="doc-h3" {...props} />,
              p: ({node, ...props}) => <p className="doc-p" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="doc-blockquote" {...props} />
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>

      <div style={{ width: '320px', borderLeft: '1px solid var(--bg-2)', background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--bg-2)' }}>
          <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: '0.5px' }}>Document Context</h3>
          <div style={{ marginTop: '0.5rem', fontWeight: 500, color: 'var(--text-1)' }}>{docNo || 'Unknown Document'}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-2)', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>Cross References</h4>
          {relatedRefs.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>No linked entities found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {relatedRefs.map((ref, idx) => {
                const isSource = ref.source_doc === docNo;
                const related = isSource ? ref.target_doc_or_entity : ref.source_doc;
                const relLabel = isSource ? ref.relationship : `<- ${ref.relationship}`;
                
                return (
                  <div key={idx} style={{ 
                    padding: '0.75rem', 
                    background: 'var(--bg-1)', 
                    border: '1px solid var(--bg-2)', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    <div style={{ color: 'var(--text-2)', marginBottom: '0.25rem', fontFamily: 'var(--mono)', fontSize: '11px' }}>
                      {relLabel.replace(/_/g, ' ')}
                    </div>
                    <div style={{ color: 'var(--teal)', fontWeight: 500, cursor: 'pointer' }}>
                      {related}
                    </div>
                    {ref.note && (
                      <div style={{ marginTop: '0.5rem', color: 'var(--text-1)', fontSize: '11px' }}>
                        {ref.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
