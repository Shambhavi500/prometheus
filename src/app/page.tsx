'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/core/state/workspace';
import { ThemeToggle } from '@/components/ThemeToggle';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
  category: string;
  base64?: string;
}

type OnboardingStep = 'WORKSPACE' | 'UPLOAD' | 'PROCESSING';

export default function Home() {
  const router = useRouter();
  const setProjectInitialized = useWorkspace((s) => s.setProjectInitialized);
  const [step, setStep] = useState<OnboardingStep>('WORKSPACE');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [systemFiles, setSystemFiles] = useState<{name: string, path: string}[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/repository?action=tree')
      .then(res => res.json())
      .then(data => {
        if (data.tree && Array.isArray(data.tree)) {
          // Flatten tree to get just files
          const files: {name: string, path: string}[] = [];
          const extract = (node: any) => {
            if (node.type === 'file') {
              files.push({ name: node.name, path: node.path });
            } else if (node.children && Array.isArray(node.children)) {
              node.children.forEach(extract);
            }
          };
          data.tree.forEach(extract);
          setSystemFiles(files.filter(f => f.name.endsWith('.md')));
        }
      })
      .catch(console.error);
  }, []);

  // AI Processing state
  const [processingProgress, setProcessingProgress] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [logsComplete, setLogsComplete] = useState(false);
  const logTerminalRef = useRef<HTMLDivElement>(null);

  // Category counts (NVIDIA AI Factory construction corpus)
  const [categories, setCategories] = useState({
    'Specifications': 12,
    'Vendor Submittals': 34,
    'NVIDIA RA Docs': 8,
    'Commissioning Records': 47,
    'RFIs & Deviations': 19,
    'Schedule Extracts': 23,
  });

  // Category mapping based on file extension/name keywords
  const detectCategory = (filename: string): string => {
    const lower = filename.toLowerCase();
    if (lower.includes('spec') || lower.includes('require')) return 'Specifications';
    if (lower.includes('submittal') || lower.includes('vendor') || lower.includes('quote')) return 'Vendor Submittals';
    if (lower.includes('dwg') || lower.includes('drawing') || lower.includes('layout')) return 'Drawings';
    if (lower.includes('rfi') || lower.includes('query')) return 'RFIs';
    if (lower.includes('cx') || lower.includes('commissioning') || lower.includes('test')) return 'Commissioning Docs';
    return 'Quality Records';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processSelectedFiles(Array.from(e.target.files));
    }
  };

  const processSelectedFiles = (files: File[]) => {
    files.forEach(file => {
      const fileId = Math.random().toString(36).substring(7);
      const category = detectCategory(file.name);
      
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'uploading',
        category
      };

      setUploadedFiles(prev => [...prev, newFile]);

      // Read file to Base64 to pass to OCR API later
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, base64: reader.result as string } : f));
      };
      reader.readAsDataURL(file);

      // Simulate realistic upload progress based on file size
      let uploadProgress = 0;
      const speed = Math.max(50000, Math.floor(Math.random() * 200000)); // bytes per interval
      const duration = Math.min(3000, Math.max(800, (file.size / speed) * 100));
      const intervalTime = 100;
      const stepValue = 100 / (duration / intervalTime);

      const interval = setInterval(() => {
        uploadProgress += stepValue;
        if (uploadProgress >= 100) {
          uploadProgress = 100;
          clearInterval(interval);
          setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 100, status: 'completed' } : f));
          
          // Increment the category count in UI
          setCategories(prev => ({
            ...prev,
            [category]: prev[category as keyof typeof prev] + 1
          }));
        } else {
          setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: Math.floor(uploadProgress) } : f));
        }
      }, intervalTime);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Scroll logs terminal automatically
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // AI Processing Simulation & Live API Execution
  const runAiPipeline = async () => {
    setStep('PROCESSING');
    
    // Call Ingest endpoint for custom files or fallback mock
    const ocrFiles = uploadedFiles.length > 0 ? uploadedFiles : [{ name: 'CDU_Vendor_Submittal.pdf', base64: 'mock_base64_data', type: 'application/pdf' }];
    
    // For prototype simplicity, we process the first file via SSE to demonstrate the real pipeline
    const file = ocrFiles[0];
    
    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64: file.base64 || 'mock_basic_image',
          fileName: file.name,
          mimeType: (file as any).type || 'application/pdf'
        })
      });

      if (!response.ok || !response.body) {
        throw new Error("API Failure");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.log) {
                setConsoleLogs(prev => [...prev, data.log]);
              }
              if (data.progress) {
                setProcessingProgress(data.progress);
              }
              if (data.error) {
                 setConsoleLogs(prev => [...prev, `[ERROR] ${data.error}`]);
              }
              if (data.done) {
                setLogsComplete(true);
                setProjectInitialized(true);
                setTimeout(() => {
                  router.push('/overview');
                }, 1200);
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (err) {
      setConsoleLogs(prev => [...prev, `[ERROR] Ingestion pipeline failed to connect.`]);
    }
  };

  if (step === 'WORKSPACE') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 64px', background: 'var(--bg-0)', alignItems: 'center', overflowY: 'auto', width: '100%', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '32px', right: '32px', zIndex: 50 }}>
          <ThemeToggle />
        </div>
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 32px 0', gap: '24px' }}>
            <img src="/prometheus_logo.png" alt="PROMETHEUS" style={{ height: '180px', objectFit: 'contain', filter: 'drop-shadow(0 0 32px rgba(0, 240, 255, 0.15))' }} />
            <div style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '14px', 
              color: 'var(--teal)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.15em',
              fontWeight: 400,
              textAlign: 'center',
              textShadow: '0 0 12px rgba(0, 240, 255, 0.25)'
            }}>
              The Execution Intelligence Layer for Data Centre EPC Project Delivery
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Projects</h2>
            
            <div 
              onClick={() => setStep('UPLOAD')}
              style={{ 
                border: '1px solid var(--line-strong)', 
                padding: '32px', 
                cursor: 'pointer',
                background: 'linear-gradient(180deg, rgba(22, 28, 42, 0.4) 0%, rgba(16, 21, 32, 0.8) 100%)',
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--teal)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 240, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--line-strong)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.2)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '28px', color: 'var(--txt-hi)', fontWeight: 300, letterSpacing: '-0.02em' }}>AI Factory NVL72-AIFC-001</span>
                <span className="badge badge--success" style={{ background: 'var(--teal-dim)', color: 'var(--teal)', border: '1px solid rgba(0,240,255,0.4)', boxShadow: '0 0 12px rgba(0,240,255,0.2)' }}>Active</span>
              </div>
              <div style={{ display: 'flex', gap: '24px', fontSize: 'var(--fs-12)', color: 'var(--txt-md)', fontFamily: 'var(--font-mono)' }}>
                <span>ID: PRJ-NVL72-AIFC</span>
                <span>Location: Pune, Maharashtra, India</span>
                <span>Type: NVIDIA AI Factory (576 GPU / 8 SU)</span>
              </div>
            </div>

            <div 
              style={{ 
                border: '1px solid var(--line)', 
                padding: '32px', 
                cursor: 'not-allowed',
                background: 'rgba(16, 21, 32, 0.4)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                opacity: 0.6
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', color: 'var(--txt-md)', fontWeight: 300 }}>AI Factory NVL72-PILOT (Hyderabad)</span>
                <span className="badge" style={{ background: 'var(--bg-1)', color: 'var(--txt-lo)', border: '1px solid var(--line-strong)' }}>Archived</span>
              </div>
              <div style={{ display: 'flex', gap: '24px', fontSize: 'var(--fs-11)', color: 'var(--txt-lo)', fontFamily: 'var(--font-mono)' }}>
                <span>ID: PRJ-NVL72-PILOT</span>
                <span>Location: Hyderabad, Telangana, India</span>
                <span>Type: NVIDIA AI Factory (144 GPU / 2 SU)</span>
              </div>
            </div>

            <button className="btn" style={{ alignSelf: 'flex-start', borderStyle: 'dashed' }}>
              + Create New Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'UPLOAD') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '64px', background: 'var(--bg-0)', alignItems: 'center', overflowY: 'auto', width: '100%', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '32px', right: '32px', zIndex: 50 }}>
          <ThemeToggle />
        </div>
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn" onClick={() => setStep('WORKSPACE')}>← Back</button>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Project Data Sources · Prometheus
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <h1 style={{ fontSize: '32px', color: 'var(--txt-hi)', fontWeight: 300, letterSpacing: '-0.02em' }}>Upload & Connect Data</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
              {Object.entries(categories).map(([label, count]) => (
                <div key={label} style={{ border: '1px solid var(--line)', padding: '20px', background: 'var(--bg-1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-md)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', color: 'var(--teal)' }}>{count} <span style={{ fontSize: 'var(--fs-11)' }}>Files</span></span>
                </div>
              ))}
            </div>

            {/* Drag & Drop uploader */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                border: dragActive ? '2px dashed var(--teal)' : '2px dashed var(--line-strong)', 
                padding: '64px', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                background: dragActive ? 'var(--teal-dim)' : 'linear-gradient(180deg, rgba(22, 28, 42, 0.4) 0%, rgba(16, 21, 32, 0.6) 100%)',
                backdropFilter: 'blur(8px)',
                borderRadius: '16px',
                gap: '16px',
                transition: 'all 0.3s ease',
                boxShadow: dragActive ? '0 0 32px rgba(0, 240, 255, 0.2)' : 'none',
              }}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
              />
              <span style={{ fontSize: '24px', color: dragActive ? 'var(--teal)' : 'var(--txt-md)', transition: 'color 0.3s ease' }}>
                {dragActive ? 'Drop documents to upload...' : 'Drag new project documents here'}
              </span>
              <span style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-lo)' }}>Supports PDF, DWG, XLSX, DOCX (Max 2GB per file)</span>
              <button className="btn" style={{ marginTop: '16px' }} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                Browse Files
              </button>
            </div>

            {/* List of uploaded files with real progress */}
            {(uploadedFiles.length > 0 || systemFiles.length > 0) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Project Documents Queue
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '320px', overflowY: 'auto', paddingRight: '12px' }}>
                  
                  {/* Uploaded Files */}
                  {uploadedFiles.map(file => (
                    <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-1)', border: '1px solid var(--teal-line)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, marginRight: '24px', overflow: 'hidden' }}>
                        <span style={{ fontSize: 'var(--fs-13)', color: 'var(--txt-hi)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{file.name}</span>
                        <div style={{ display: 'flex', gap: '12px', fontSize: 'var(--fs-11)', color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>
                          <span>{(file.size / 1024).toFixed(1)} KB</span>
                          <span>Category: {file.category}</span>
                          <span>[USER UPLOAD]</span>
                        </div>
                      </div>
                      
                      <div style={{ width: '120px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                        <div style={{ fontSize: 'var(--fs-11)', fontFamily: 'var(--font-mono)', color: file.status === 'completed' ? 'var(--teal)' : 'var(--txt-md)' }}>
                          {file.status === 'completed' ? 'Ready' : `${file.progress}%`}
                        </div>
                        <div style={{ width: '100%', height: '2px', background: 'var(--line-strong)', position: 'relative' }}>
                          <div style={{ 
                            position: 'absolute', 
                            left: 0, 
                            top: 0, 
                            bottom: 0, 
                            background: 'var(--teal)', 
                            width: `${file.progress}%`,
                            transition: 'width 0.2s ease-out'
                          }} />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Preloaded System Files */}
                  {systemFiles.map((file, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-1)', border: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, marginRight: '24px', overflow: 'hidden' }}>
                        <span style={{ fontSize: 'var(--fs-13)', color: 'var(--txt-hi)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{file.name}</span>
                        <div style={{ display: 'flex', gap: '12px', fontSize: 'var(--fs-11)', color: 'var(--txt-lo)', fontFamily: 'var(--font-mono)' }}>
                          <span>Preloaded</span>
                          <span>Category: {detectCategory(file.name)}</span>
                        </div>
                      </div>
                      
                      <div style={{ width: '120px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                        <div style={{ fontSize: 'var(--fs-11)', fontFamily: 'var(--font-mono)', color: 'var(--txt-md)' }}>
                          Ready
                        </div>
                        <div style={{ width: '100%', height: '2px', background: 'var(--line-strong)', position: 'relative' }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: 'var(--txt-lo)', width: '100%' }} />
                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--line)', paddingTop: '32px' }}>
              <button className="btn btn--approve" style={{ padding: '16px 32px', fontSize: 'var(--fs-14)' }} onClick={runAiPipeline}>
                Initialize AI Processing
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '64px', background: 'var(--bg-0)', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '32px', right: '32px', zIndex: 50 }}>
        <ThemeToggle />
      </div>
      <div style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-10)', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              System Processing
            </div>
            <h1 style={{ fontSize: '32px', color: 'var(--txt-hi)', fontWeight: 300, letterSpacing: '-0.02em' }}>
              Ingesting Project Data
            </h1>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', color: 'var(--teal)' }}>
            {processingProgress}%
          </div>
        </div>

        {/* Live log Terminal */}
        <div 
          ref={logTerminalRef}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            background: 'rgba(6, 9, 14, 0.95)', 
            padding: '24px', 
            border: '1px solid rgba(0, 240, 255, 0.3)', 
            fontFamily: 'var(--font-mono)', 
            fontSize: 'var(--fs-12)',
            height: '320px',
            overflowY: 'auto',
            borderRadius: '8px',
            boxShadow: 'inset 0 0 32px rgba(0, 0, 0, 0.8), 0 0 24px rgba(0, 240, 255, 0.15)',
            textShadow: '0 0 4px rgba(255, 255, 255, 0.3)',
          }}
        >
          {consoleLogs.map((logMsg, idx) => (
            <div key={idx} style={{ 
              color: logMsg.includes('Baidu OCR Success') ? 'var(--green)' : logMsg.includes('Agent') ? 'var(--teal)' : 'var(--txt-md)',
              whiteSpace: 'pre-wrap',
              textShadow: logMsg.includes('Agent') ? '0 0 8px rgba(0,240,255,0.6)' : logMsg.includes('Success') ? '0 0 8px rgba(0,255,136,0.6)' : 'none'
            }}>
              {logMsg}
            </div>
          ))}
          {!logsComplete && <div className="blink" style={{ color: 'var(--teal)', marginTop: '4px', textShadow: '0 0 8px rgba(0,240,255,0.8)' }}>▍</div>}
        </div>

        {/* Real Loading Bar */}
        <div style={{ height: '4px', background: 'var(--line-strong)', width: '100%', overflow: 'hidden', borderRadius: '2px' }}>
          <div style={{ 
            height: '100%', 
            background: 'var(--teal)', 
            width: `${processingProgress}%`,
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 0 12px var(--teal)'
          }} />
        </div>
      </div>
      <style>{`
        .blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
