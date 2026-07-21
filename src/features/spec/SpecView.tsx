"use client";

import React, { useState } from 'react';
import { runComplianceAudit } from '@/app/api/actions/runComplianceAudit';
import { ComplianceAuditResult } from '@/ontology/engineering';
import { KnowledgeGraphViewer } from '@/components/ui/KnowledgeGraphViewer';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight,
  Activity,
  Cpu,
  Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Demo Submittal Text designed to fail the N+1 Redundancy requirement
const DEMO_SUBMITTAL = `
VENDOR SUBMITTAL DOCUMENT
Date: Oct 24, 2026
Project: Project Prometheus - Data Center Phase 1
System: Mechanical Cooling

EQUIPMENT DETAILS
Manufacturer: ABC Industrial Pumps
Model: XJ-9000 Series Primary Chilled Water Pump
Type: Centrifugal Pump
Power Rating: 55 kW
Flow Rate: 450 L/s

CONFIGURATION PROPOSED
To optimize cost and physical footprint within the mechanical gallery, we are proposing an N (N-only) configuration for the primary chilled water loops. This removes the standby pump unit and saves approximately $120,000 in capital expenditure. Lead time for these units is currently 18 weeks.
`;

export function SpecView() {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [result, setResult] = useState<ComplianceAuditResult | null>(null);
  const [selectedDeviation, setSelectedDeviation] = useState<number | null>(null);

  const handleUpload = async () => {
    setIsAuditing(true);
    setResult(null);
    setAuditProgress(0);

    // Simulate pipeline timeline
    const steps = [
      { progress: 20, time: 1000 }, // Uploading
      { progress: 40, time: 1500 }, // Extracting Entities
      { progress: 60, time: 1000 }, // Building Graph
      { progress: 80, time: 2000 }, // Running Compliance Engine
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.time));
      setAuditProgress(step.progress);
    }

    try {
      const auditResult = await runComplianceAudit(DEMO_SUBMITTAL);
      setResult(auditResult);
      if (auditResult.deviations.length > 0) {
        setSelectedDeviation(0);
      }
    } catch (error) {
      console.error("Audit failed:", error);
      alert("Audit failed. Ensure API keys are set in .env.local");
    } finally {
      setAuditProgress(100);
      setIsAuditing(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert style={{ color: 'var(--teal)', width: 24, height: 24 }} />
          <div>
            <div className="page__title">PROMETHEUS Compliance Agent</div>
            <div className="page__meta">Enterprise Execution Intelligence Layer</div>
          </div>
        </div>
        <div className="badge badge--success">
          Agent Active
        </div>
      </header>

      <div className="page__body" style={{ flexDirection: 'column', overflowY: 'auto', padding: '24px', gap: '24px' }}>
        
        {!result && (
          <div style={{ display: 'flex', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            {/* Drop Zone */}
            <div 
              style={{
                flex: 1,
                border: `1px dashed ${isAuditing ? 'var(--teal)' : 'var(--line-strong)'}`,
                background: isAuditing ? 'var(--teal-dim)' : 'var(--bg-1)',
                borderRadius: 'var(--radius)',
                padding: '48px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: isAuditing ? 'default' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={!isAuditing ? handleUpload : undefined}
            >
              {isAuditing ? (
                <Activity style={{ width: 48, height: 48, color: 'var(--teal)', marginBottom: 24 }} className="blink" />
              ) : (
                <UploadCloud style={{ width: 48, height: 48, color: 'var(--txt-md)', marginBottom: 24 }} />
              )}
              <h3 style={{ fontSize: 'var(--fs-16)', color: 'var(--txt-hi)', marginBottom: '8px' }}>
                {isAuditing ? 'Autonomous Audit in Progress' : 'Upload Vendor Submittal'}
              </h3>
              <p style={{ color: 'var(--txt-md)', fontSize: 'var(--fs-12)', maxWidth: '300px' }}>
                {isAuditing ? 'Intelligence Engine is analyzing structural integrity against Master Specifications.' : 'Drag and drop PDF schematics, or click to run demo compliance check.'}
              </p>
            </div>

            {/* Timeline */}
            <div style={{ flex: 1, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--txt-hi)', fontWeight: 500 }}>
                <Cpu size={16} style={{ color: 'var(--txt-md)' }} /> Audit Pipeline Status
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { label: "Document Ingestion", progress: 20 },
                  { label: "Entity Resolution (NLP)", progress: 40 },
                  { label: "Knowledge Graph Construction", progress: 60 },
                  { label: "Intelligence Engine Analysis", progress: 80 },
                  { label: "Risk Propagation & Output", progress: 100 }
                ].map((step, i) => (
                   <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                     <div style={{ 
                       width: '28px', height: '28px', borderRadius: '50%', 
                       border: `1px solid ${auditProgress >= step.progress ? 'var(--teal)' : 'var(--line-strong)'}`,
                       background: auditProgress >= step.progress ? 'var(--teal-dim)' : 'var(--bg-2)',
                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                       color: auditProgress >= step.progress ? 'var(--teal)' : 'var(--txt-lo)'
                     }}>
                       {auditProgress >= step.progress ? <CheckCircle2 size={16} /> : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--txt-lo)' }} />}
                     </div>
                     <div style={{ fontSize: 'var(--fs-13)', color: auditProgress >= step.progress ? 'var(--txt-hi)' : 'var(--txt-md)' }}>
                       {step.label}
                     </div>
                   </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             {/* Metrics Row */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
               <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', padding: '16px', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <div style={{ color: result.status === 'REJECTED' ? 'var(--red)' : 'var(--green)' }}>
                   {result.status === 'REJECTED' ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
                 </div>
                 <div>
                   <div style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Audit Status</div>
                   <div style={{ fontSize: '18px', fontWeight: 600, color: result.status === 'REJECTED' ? 'var(--red)' : 'var(--green)' }}>{result.status}</div>
                 </div>
               </div>
               <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', padding: '16px', borderRadius: 'var(--radius)' }}>
                 <div style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compliance Score</div>
                 <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--txt-hi)' }}>{result.complianceScore}/100</div>
               </div>
               <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', padding: '16px', borderRadius: 'var(--radius)' }}>
                 <div style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deviations Found</div>
                 <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--txt-hi)' }}>{result.deviations.length}</div>
               </div>
               <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', padding: '16px', borderRadius: 'var(--radius)' }}>
                 <div style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entities Extracted</div>
                 <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--txt-hi)' }}>{result.entitiesExtracted.length}</div>
               </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
               {/* Left: Evidence Panel */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt-hi)', fontWeight: 500, fontSize: 'var(--fs-14)' }}>
                   <FileText size={18} style={{ color: 'var(--teal)' }} /> Detected Deviations
                 </div>
                 {result.deviations.map((dev, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedDeviation(idx)}
                      style={{
                        background: selectedDeviation === idx ? 'var(--bg-2)' : 'var(--bg-1)',
                        border: `1px solid ${selectedDeviation === idx ? 'var(--teal)' : 'var(--line)'}`,
                        borderRadius: 'var(--radius)',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span className="badge badge--critical">{dev.severity}</span>
                        <span style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-md)', fontFamily: 'var(--font-mono)' }}>Conf: {(dev.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div style={{ fontSize: 'var(--fs-13)', color: 'var(--txt-hi)', marginBottom: '16px' }}>{dev.reason}</div>
                      
                      {selectedDeviation === idx && (
                        <div style={{ borderTop: '1px solid var(--line-strong)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                           <div>
                             <div style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase' }}>Requirement ID</div>
                             <div style={{ fontSize: 'var(--fs-12)', color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>{dev.requirementId}</div>
                           </div>
                           <div>
                             <div style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase', marginBottom: 4 }}>Submitted Value</div>
                             <div style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-md)', background: 'var(--bg-0)', padding: '8px', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>{dev.submittedValue}</div>
                           </div>
                           <div>
                             <div style={{ fontSize: 'var(--fs-10)', color: 'var(--amber)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                               <Network size={12} /> Downstream Risk Propagation
                             </div>
                             {dev.downstreamRisks.map((risk, ridx) => (
                                <div key={ridx} style={{ background: 'var(--amber-dim)', border: '1px solid var(--amber-dim)', padding: '8px', borderRadius: 'var(--radius)', marginBottom: 8 }}>
                                  <div style={{ fontSize: 'var(--fs-12)', color: 'var(--amber)', fontWeight: 500 }}>{risk.affectedSystem}:</div>
                                  <div style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-hi)' }}>{risk.description}</div>
                                  {risk.estimatedDelayDays && <div style={{ fontSize: 'var(--fs-11)', color: 'var(--red)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>+{risk.estimatedDelayDays} Days Delay</div>}
                                </div>
                             ))}
                           </div>
                           <div>
                             <div style={{ fontSize: 'var(--fs-10)', color: 'var(--green)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                               <ArrowRight size={12} /> Engineering Recommendation
                             </div>
                             <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green-dim)', padding: '12px', borderRadius: 'var(--radius)' }}>
                               <div style={{ fontSize: 'var(--fs-12)', color: 'var(--txt-hi)', marginBottom: 8 }}>{dev.recommendation.action}</div>
                               <div style={{ fontSize: 'var(--fs-11)', color: 'var(--green)', fontFamily: 'var(--font-mono)', background: 'var(--bg-0)', padding: '8px', border: '1px solid var(--green-dim)', borderRadius: 'var(--radius)', whiteSpace: 'pre-wrap' }}>
                                 {dev.recommendation.draftRFI || "No RFI generated."}
                               </div>
                             </div>
                           </div>
                        </div>
                      )}
                    </div>
                 ))}
               </div>

               {/* Right: Knowledge Graph */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt-hi)', fontWeight: 500, fontSize: 'var(--fs-14)' }}>
                   <Network size={18} style={{ color: 'var(--teal)' }} /> Execution Knowledge Graph
                 </div>
                 <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', height: '700px', padding: '8px' }}>
                    <KnowledgeGraphViewer data={result} />
                 </div>
               </div>
             </div>
          </div>
        )}
      </div>
      <style>{`
        .blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

