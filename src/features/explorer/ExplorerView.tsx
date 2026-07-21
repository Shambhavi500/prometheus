'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

const THREAD_STAGES = [
  { id: 'doc', label: 'Document', desc: 'Source Truth', icon: 'FileText' },
  { id: 'req', label: 'Requirement', desc: 'Design Spec', icon: 'CheckSquare' },
  { id: 'eq', label: 'Equipment', desc: 'Physical Asset', icon: 'Box' },
  { id: 'ven', label: 'Vendor', desc: 'Supplier', icon: 'Truck' },
  { id: 'po', label: 'Purchase Order', desc: 'Procurement', icon: 'DollarSign' },
  { id: 'shp', label: 'Shipment', desc: 'Transit Status', icon: 'Navigation' },
  { id: 'sch', label: 'Schedule', desc: 'P6 Activity', icon: 'Calendar' },
  { id: 'cx', label: 'Commissioning', desc: 'System Readiness', icon: 'Activity' },
  { id: 'dec', label: 'Decision', desc: 'Engineering Action', icon: 'GitBranch' },
  { id: 'aud', label: 'Audit Record', desc: 'Immutable Log', icon: 'Shield' }
];

export function ExplorerView() {
  const params = useSearchParams();
  const initialFocus = params.get('focus') ?? 'EQ-TX01';
  const [focusId, setFocusId] = useState(initialFocus);

  return (
    <div className="page" style={{ background: 'var(--bg-0)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page__header" style={{ padding: '24px 32px', borderBottom: 'none' }}>
        <h1 className="page__title">Digital Thread Pipeline</h1>
        <span className="page__meta">Vertical Traceability Chain · Tracking {focusId}</span>
        <span className="page__spacer" />
        <span className="page__meta">From Source Document to Audit Record</span>
      </div>

      <div className="page__body" style={{ padding: '0 32px 32px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 0' }}>
          
          <div style={{ marginBottom: '48px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--txt-md)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracking Entity:</span>
            <input 
              type="text" 
              value={focusId} 
              onChange={e => setFocusId(e.target.value)} 
              className="ui-input" 
              style={{ padding: '8px 16px', background: 'var(--bg-1)', border: '1px solid var(--line)', color: 'var(--txt-hi)', borderRadius: '4px' }} 
            />
          </div>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* The continuous connecting line */}
            <div style={{ position: 'absolute', left: '39px', top: '24px', bottom: '24px', width: '2px', background: 'var(--line-strong)' }} />
            
            {THREAD_STAGES.map((stage, idx) => (
              <div key={stage.id} style={{ display: 'flex', gap: '32px', position: 'relative', zIndex: 1 }}>
                
                {/* Node */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', flexShrink: 0 }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-1)', border: '2px solid var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'var(--teal)' }}>
                    {idx + 1}
                  </div>
                </div>

                {/* Content Block */}
                <div style={{ flex: 1, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '4px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '16px', color: 'var(--txt-hi)', fontWeight: 600 }}>{stage.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--txt-md)' }}>{stage.desc}</div>
                    </div>
                  </div>
                  
                  {/* Mock dynamic data mapped to EQ-TX01 for demonstration of the trace */}
                  <div style={{ fontSize: '13px', color: 'var(--txt-hi)', fontFamily: 'var(--font-mono)', padding: '16px', background: 'var(--bg-0)', border: '1px solid var(--line-strong)', borderRadius: '4px' }}>
                    {stage.id === 'doc' && `DOC-EQ-001 (Main Switchgear Spec, Rev 4)`}
                    {stage.id === 'req' && `REQ-1024: 15kV rated, 3000A continuous bus`}
                    {stage.id === 'eq' && `${focusId} (15kV Main Switchgear)`}
                    {stage.id === 'ven' && `VEN-05 (Siemens Energy)`}
                    {stage.id === 'po' && `PO-2026-8891 (Awarded $1.2M)`}
                    {stage.id === 'shp' && `SHP-1102 (Delayed 4 weeks - Port Congestion)`}
                    {stage.id === 'sch' && `A102.4: Install ${focusId} (At Risk)`}
                    {stage.id === 'cx' && `CX-SYS-03 (Blocked by A102.4 delay)`}
                    {stage.id === 'dec' && `DEC-890: Approve air-freight mitigation for ${focusId}`}
                    {stage.id === 'aud' && `Log: Agent proposed mitigation, Director approved at 14:02Z`}
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
