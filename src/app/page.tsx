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
  type?: string;
}

type OnboardingStep = 'WORKSPACE' | 'UPLOAD' | 'PROCESSING';

export default function Home() {
  const router = useRouter();
  const setProjectInitialized = useWorkspace((s) => s.setProjectInitialized);
  const [step, setStep] = useState<OnboardingStep>('WORKSPACE');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Processing state
  const [processingProgress, setProcessingProgress] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [currentStage, setCurrentStage] = useState<string>('Initializing Document Pipeline...');
  const logTerminalRef = useRef<HTMLDivElement>(null);

  const supportedFormats = [
    { label: 'PDF Specs', tag: 'PDF' },
    { label: 'Word Documents', tag: 'DOCX' },
    { label: 'CAD & Schematics', tag: 'Drawings' },
    { label: 'Tech Specifications', tag: 'Specifications' },
    { label: 'Bills of Quantity', tag: 'BOQ' },
    { label: 'OCR Scans', tag: 'Images' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processSelectedFiles(Array.from(e.target.files));
    }
  };

  const processSelectedFiles = (files: File[]) => {
    files.forEach(file => {
      const fileId = Math.random().toString(36).substring(7);
      
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'uploading',
        category: 'Engineering Document',
        type: file.type
      };

      setUploadedFiles(prev => [...prev, newFile]);

      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, base64: reader.result as string } : f));
      };
      reader.readAsDataURL(file);

      let uploadProgress = 0;
      const interval = setInterval(() => {
        uploadProgress += 25;
        if (uploadProgress >= 100) {
          uploadProgress = 100;
          clearInterval(interval);
          setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 100, status: 'completed' } : f));
        } else {
          setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: uploadProgress } : f));
        }
      }, 70);
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

  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const runAutomatedPipeline = async (overrideFile?: UploadedFile) => {
    setStep('PROCESSING');
    setConsoleLogs([]);
    setProcessingProgress(0);

    const file = overrideFile || (uploadedFiles.length > 0 ? uploadedFiles[0] : { name: 'CDU_Equipment_Specification.pdf', base64: 'mock_pdf_base64', type: 'application/pdf' });

    setConsoleLogs([
      `[00:01] Starting Document Analysis Pipeline for: ${file.name}`,
      `[00:03] Step 1/5: Executing Optical Character Recognition (OCR)...`
    ]);

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64: file.base64 || 'mock_basic_image',
          fileName: file.name,
          mimeType: file.type || 'application/pdf'
        })
      });

      if (!response.ok || !response.body) {
        throw new Error("Pipeline API connection failed.");
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
                if (data.log.includes('OCR')) setCurrentStage('OCR Text Extraction...');
                else if (data.log.includes('Gemini')) setCurrentStage('Gemini Multimodal Structure Synthesis...');
                else if (data.log.includes('Graph')) setCurrentStage('Knowledge Graph Memory Update...');
                else if (data.log.includes('VectorStore')) setCurrentStage('Hybrid RAG Indexing...');
              }
              if (data.progress) {
                setProcessingProgress(data.progress);
              }
              if (data.error) {
                setConsoleLogs(prev => [...prev, `[ERROR] ${data.error}`]);
              }
              if (data.done) {
                setProjectInitialized(true);
                setCurrentStage('Analysis Complete! Opening Overview...');
                setTimeout(() => {
                  router.push('/overview');
                }, 800);
              }
            } catch (e) {
              // Ignore parse errors for split chunks
            }
          }
        }
      }
    } catch (err: any) {
      setConsoleLogs(prev => [...prev, `[ERROR] ${err.message || 'Pipeline execution failed.'}`]);
    }
  };

  if (step === 'PROCESSING') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '64px', background: 'var(--bg-0)', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '20px', color: 'var(--txt-hi)', margin: 0, fontWeight: 500 }}>
                Document Analysis Pipeline
              </h1>
              <div style={{ fontSize: '13px', color: 'var(--teal)', marginTop: '4px' }}>
                {currentStage}
              </div>
            </div>
            <div className="mono" style={{ fontSize: '18px', color: 'var(--teal)', fontWeight: 600 }}>
              {processingProgress}%
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-2)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${processingProgress}%`, background: 'var(--teal)', transition: 'width 0.3s' }} />
          </div>

          {/* Log Console */}
          <div 
            ref={logTerminalRef} 
            className="mono" 
            style={{ 
              background: 'var(--bg-1)', 
              border: '1px solid var(--line)', 
              borderRadius: '8px', 
              padding: '20px', 
              height: '320px', 
              overflowY: 'auto', 
              fontSize: '12px', 
              color: 'var(--txt-hi)',
              lineHeight: 1.6
            }}
          >
            {consoleLogs.map((log, idx) => (
              <div key={idx} style={{ color: log.includes('ERROR') ? 'var(--red)' : log.includes('Complete') ? 'var(--teal)' : 'var(--txt-hi)' }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'UPLOAD') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 64px', background: 'var(--bg-0)', alignItems: 'center', overflowY: 'auto', width: '100%', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '32px', right: '32px', zIndex: 50 }}>
          <ThemeToggle />
        </div>

        <div style={{ width: '100%', maxWidth: '920px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn" onClick={() => setStep('WORKSPACE')}>
              ← Back to Projects
            </button>
            <div style={{ fontSize: '14px', color: 'var(--teal)', fontWeight: 500 }}>
              ET — Engineering Intelligence Platform
            </div>
          </div>

          {/* Upload Dropzone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                border: `2px dashed ${dragActive ? 'var(--teal)' : 'var(--teal-line)'}`, 
                padding: '48px 32px', 
                cursor: 'pointer',
                background: dragActive ? 'var(--teal-dim)' : 'var(--bg-1)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                transition: 'all 0.2s',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
              }}
            >
              <input 
                ref={fileInputRef} 
                type="file" 
                multiple 
                onChange={handleFileChange} 
                style={{ display: 'none' }}
                accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg" 
              />

              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', color: 'var(--txt-hi)', fontWeight: 500 }}>
                  Upload Engineering Documents
                </div>
                <div style={{ fontSize: '13px', color: 'var(--txt-md)', marginTop: '4px' }}>
                  Drag & drop your files here, or click to browse
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
                {supportedFormats.map((fmt, i) => (
                  <span key={i} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '4px', background: 'var(--bg-2)', color: 'var(--txt-hi)', border: '1px solid var(--line)' }}>
                    {fmt.label}
                  </span>
                ))}
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--txt-md)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Uploaded Files ({uploadedFiles.length})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {uploadedFiles.map((f, idx) => (
                    <div key={`${f.id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-0)', borderRadius: '6px', border: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="mono" style={{ fontSize: '11px', color: 'var(--teal)' }}>[DOC]</span>
                        <span style={{ fontSize: '13px', color: 'var(--txt-hi)', fontWeight: 500 }}>{f.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--txt-md)' }}>({(f.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <span style={{ fontSize: '11px', color: f.status === 'completed' ? 'var(--teal)' : 'var(--txt-md)' }}>
                        {f.status === 'completed' ? 'Ready for OCR & Gemini Analysis' : `Uploading ${f.progress}%`}
                      </span>
                    </div>
                  ))}
                </div>

                <button 
                  className="btn btn--approve" 
                  style={{ padding: '12px 24px', fontSize: '14px', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => runAutomatedPipeline()}
                >
                  Analyze Document & Open Report →
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // DEFAULT MAIN VIEW: Match exact screenshot layout
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 64px', background: 'var(--bg-0)', alignItems: 'center', overflowY: 'auto', width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '32px', right: '32px', zIndex: 50 }}>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Torch Logo Image & PROMETHEUS Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 32px 0', gap: '20px' }}>
          <img 
            src="/prometheus_logo.png" 
            alt="PROMETHEUS" 
            style={{ height: '160px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 32px rgba(0, 240, 255, 0.2))' }} 
            onError={(e) => {
              // Fallback to just_logo if needed
              (e.target as HTMLElement).setAttribute('src', '/just_logo.png');
            }}
          />
          
          <div style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '13px', 
            color: 'var(--teal)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.15em',
            fontWeight: 400,
            textAlign: 'center',
            textShadow: '0 0 12px rgba(0, 240, 255, 0.25)'
          }}>
            THE EXECUTION INTELLIGENCE LAYER FOR DATA CENTRE EPC PROJECT DELIVERY
          </div>
        </div>

        {/* RECENT PROJECTS SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Projects</h2>
          
          {/* Active Card: Project Meghdoot (NM-1) */}
          <div 
            onClick={() => runAutomatedPipeline()}
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
              <span style={{ fontSize: '26px', color: 'var(--txt-hi)', fontWeight: 300, letterSpacing: '-0.02em' }}>Project Meghdoot (NM-1)</span>
              <span className="badge badge--success" style={{ background: 'var(--teal-dim)', color: 'var(--teal)', border: '1px solid rgba(0,240,255,0.4)', boxShadow: '0 0 12px rgba(0,240,255,0.2)' }}>• ACTIVE</span>
            </div>
            <div style={{ display: 'flex', gap: '24px', fontSize: 'var(--fs-12)', color: 'var(--txt-md)', fontFamily: 'var(--font-mono)' }}>
              <span>ID: PRJ-992</span>
              <span>Location: Navi Mumbai, India</span>
              <span>Type: Hyperscale Data Center</span>
            </div>
          </div>

          {/* Archived Card: Project Vayu (BLR-2) */}
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
              <span style={{ fontSize: '24px', color: 'var(--txt-md)', fontWeight: 300 }}>Project Vayu (BLR-2)</span>
              <span className="badge" style={{ background: 'var(--bg-1)', color: 'var(--txt-lo)', border: '1px solid var(--line-strong)' }}>ARCHIVED</span>
            </div>
            <div style={{ display: 'flex', gap: '24px', fontSize: 'var(--fs-11)', color: 'var(--txt-lo)', fontFamily: 'var(--font-mono)' }}>
              <span>ID: PRJ-401</span>
              <span>Location: Bangalore, India</span>
              <span>Type: Telecom Hub</span>
            </div>
          </div>

          {/* + Create New Project Button */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <button 
              className="btn btn--approve" 
              style={{ padding: '12px 24px', fontSize: '14px' }}
              onClick={() => setStep('UPLOAD')}
            >
              + Create New Project
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
