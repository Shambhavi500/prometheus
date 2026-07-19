'use client';

import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/core/state/workspace';
import type { DecisionRecord, Finding } from '@/server/types';
import { FileText } from 'lucide-react';

export function ContextSidebar({ decision, finding, entityTags }: { decision: DecisionRecord, finding: Finding, entityTags: any[] }) {
  const router = useRouter();
  const selectDecision = useWorkspace(s => s.selectDecision);
  
  const navTo = (path: string) => {
    selectDecision(decision.id);
    router.push(path);
  };

  return (
    <div style={{ 
      width: '320px', 
      flexShrink: 0,
      borderLeft: '1px solid var(--line-strong)', 
      background: 'var(--bg-0)',
      display: 'flex', 
      flexDirection: 'column'
    }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: 'var(--fs-10)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Decision
        </div>
        <div style={{ fontSize: 'var(--fs-14)', color: 'var(--txt-hi)', fontFamily: 'var(--font-mono)' }}>
          {decision.id}
        </div>
      </div>
      
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Related Modules
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="context-link" onClick={() => navTo('/console')}>Command Console</button>
          <button className="context-link" onClick={() => navTo('/spec-compliance')}>Specification</button>
          <button className="context-link" onClick={() => navTo('/schedule-risk')}>Schedule</button>
          <button className="context-link" onClick={() => navTo('/supply-chain')}>Supply Chain</button>
          <button className="context-link" onClick={() => navTo('/commissioning')}>Commissioning</button>
          <button className="context-link" onClick={() => navTo('/knowledge')}>Knowledge</button>
          <button className="context-link" onClick={() => navTo('/explorer')}>Thread Explorer</button>
          <button className="context-link" onClick={() => navTo('/audit')}>Audit</button>
        </div>
      </div>

      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Affected Assets
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {entityTags.map(t => (
            <span key={t.id} className="etag">{t.tag}</span>
          ))}
          {entityTags.length === 0 && <span style={{ color: 'var(--txt-lo)', fontSize: 'var(--fs-12)' }}>No direct assets</span>}
        </div>
      </div>

      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Evidence Documents
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {finding.citations.map(c => (
            <span key={c.blockId} style={{ color: 'var(--amber)', fontSize: 'var(--fs-11)', cursor: 'pointer' }}>
              <FileText size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> {c.docTitle}
            </span>
          ))}
        </div>
      </div>
      
      <div style={{ padding: '20px 24px 32px 24px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        <div style={{ fontSize: 'var(--fs-11)', color: 'var(--txt-lo)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          History
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--fs-11)', color: 'var(--txt-md)' }}>
          <div>Created: <span style={{ color: 'var(--txt-hi)' }}>Today 11:42 AM</span></div>
          <div>Updated: <span style={{ color: 'var(--txt-hi)' }}>Today 11:43 AM</span></div>
          <div>Status: <span style={{ color: 'var(--amber)' }}>{decision.status}</span></div>
        </div>
      </div>

      <style>{`
        .context-link {
          background: none; border: none; padding: 0; margin: 0;
          color: var(--txt-md); font-size: var(--fs-13); text-align: left; cursor: pointer;
          transition: color 0.15s;
        }
        .context-link:hover { color: var(--txt-hi); text-decoration: underline; }
      `}</style>
    </div>
  );
}
