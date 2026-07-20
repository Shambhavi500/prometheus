'use client';

import { useState, useRef } from 'react';
import { useDocuments, useDocumentActions } from '@/core/api/hooks';
import { LiveBadge } from '@/components/LiveBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { useRouter } from 'next/navigation';

export function DocumentWorkspaceView() {
  const { data, isLoading, refetch } = useDocuments();
  const { deleteDoc } = useDocumentActions();
  const router = useRouter();

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'name'>('newest');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const docs = data?.documents ?? [];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setLog([`Selected ${file.name}`]);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        const res = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64,
            fileName: file.name,
            mimeType: file.type
          })
        });

        if (!res.body) throw new Error("No response body");

        const decoder = new TextDecoder();
        const readerStream = res.body.getReader();

        let accumulated = '';
        while (true) {
          const { done, value } = await readerStream.read();
          if (done) break;
          
          accumulated += decoder.decode(value, { stream: true });
          const parts = accumulated.split('\n\n');
          accumulated = parts.pop() || '';

          for (const part of parts) {
            if (part.startsWith('data: ')) {
              try {
                const dataStr = part.substring(6);
                const dataJson = JSON.parse(dataStr);
                
                if (dataJson.log) {
                  setLog(prev => [...prev, dataJson.log]);
                }
                if (dataJson.progress) {
                  setProgress(dataJson.progress);
                }
                if (dataJson.error) {
                  setLog(prev => [...prev, `ERROR: ${dataJson.error}`]);
                  setUploading(false);
                  return;
                }
                if (dataJson.done) {
                  setUploading(false);
                  refetch();
                  return;
                }
              } catch (e) {
                // ignore parse errors for partial chunks
              }
            }
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setLog(prev => [...prev, `Failed: ${err}`]);
      setUploading(false);
    }
  };

  let filtered = docs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  if (sort === 'newest') filtered.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  if (sort === 'oldest') filtered.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
  if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

  const fmtTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };
  const fmtDate = (iso: string) => {
    return new Date(iso).toLocaleDateString();
  };

  return (
    <div className="page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page__header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--bg-2)' }}>
        <h1 className="page__title" style={{ fontSize: '20px', color: 'var(--txt-hi)' }}>Document Workspace</h1>
        <div className="page__meta" style={{ marginTop: '8px' }}>
          Upload and manage your intelligence source documents.
        </div>
      </div>
      
      <div style={{ padding: '32px', display: 'flex', gap: '32px', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Col: Upload */}
        <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragActive ? 'var(--teal)' : 'var(--bg-3)'}`,
              borderRadius: '8px',
              padding: '48px 24px',
              textAlign: 'center',
              background: dragActive ? 'var(--teal-dim)' : 'var(--bg-1)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} accept=".pdf,.doc,.docx,.xlsx" />
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.5" style={{ margin: '0 auto 16px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <div style={{ fontSize: '14px', color: 'var(--txt-hi)', fontWeight: 500 }}>
              Drag & Drop document
            </div>
            <div style={{ fontSize: '12px', color: 'var(--txt-md)', marginTop: '8px' }}>
              or click to browse
            </div>
          </div>

          {uploading && (
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--bg-3)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '12px' }}>
                <span style={{ color: 'var(--txt-hi)' }}>Processing...</span>
                <span style={{ color: 'var(--teal)' }}>{progress}%</span>
              </div>
              <div style={{ height: '4px', background: 'var(--bg-3)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--teal)', transition: 'width 0.2s' }} />
              </div>
              <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--txt-md)', fontFamily: 'var(--font-mono)', maxHeight: '120px', overflowY: 'auto' }}>
                {log.map((l, i) => <div key={i}>{l}</div>)}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Document List */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--bg-1)',
                border: '1px solid var(--bg-3)',
                padding: '8px 12px',
                borderRadius: '4px',
                color: 'var(--txt-hi)',
                fontSize: '13px'
              }}
            />
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value as any)}
              style={{
                background: 'var(--bg-1)',
                border: '1px solid var(--bg-3)',
                padding: '8px 12px',
                borderRadius: '4px',
                color: 'var(--txt-hi)',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isLoading && <div style={{ color: 'var(--txt-md)', fontSize: '13px' }}>Loading workspace...</div>}
            {!isLoading && filtered.length === 0 && (
              <div style={{ color: 'var(--txt-md)', fontSize: '13px', textAlign: 'center', padding: '48px', border: '1px dashed var(--bg-3)', borderRadius: '8px' }}>
                No uploaded documents found.
              </div>
            )}
            {filtered.map(doc => (
              <div key={doc.id} style={{
                background: 'var(--bg-1)',
                border: '1px solid var(--bg-3)',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--txt-hi)' }}>{doc.name}</span>
                      {doc.source === 'live' && <LiveBadge />}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--txt-md)', display: 'flex', gap: '16px' }}>
                      <span>Uploaded: {fmtDate(doc.uploadedAt)} {fmtTime(doc.uploadedAt)}</span>
                      <span><StatusBadge label={doc.status} /></span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button" 
                      className="btn"
                      onClick={() => router.push('/overview')}
                      style={{ fontSize: '11px', padding: '4px 12px' }}
                    >
                      View Insights
                    </button>
                    <button 
                      type="button" 
                      className="btn"
                      onClick={() => deleteDoc.mutate(doc.id)}
                      disabled={deleteDoc.isPending}
                      style={{ fontSize: '11px', padding: '4px 12px', color: 'var(--red)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid var(--bg-2)', paddingTop: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--txt-lo)', textTransform: 'uppercase', marginBottom: '4px' }}>Findings</div>
                    <div style={{ fontSize: '14px', color: 'var(--teal)', fontWeight: 600 }}>{doc.findingsCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--txt-lo)', textTransform: 'uppercase', marginBottom: '4px' }}>Decisions</div>
                    <div style={{ fontSize: '14px', color: 'var(--amber)', fontWeight: 600 }}>{doc.decisionsCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--txt-lo)', textTransform: 'uppercase', marginBottom: '4px' }}>Evidence</div>
                    <div style={{ fontSize: '14px', color: 'var(--blue)', fontWeight: 600 }}>{doc.evidenceCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--txt-lo)', textTransform: 'uppercase', marginBottom: '4px' }}>Graph Nodes</div>
                    <div style={{ fontSize: '14px', color: 'var(--purple)', fontWeight: 600 }}>{doc.graphNodesCount}</div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
