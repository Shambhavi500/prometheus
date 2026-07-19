'use client';

import { usePathname } from 'next/navigation';
import { useWorkspace } from '@/core/state/workspace';
import { useDecisions } from '@/core/api/hooks';

export function UniversalBreadcrumb() {
  const pathname = usePathname();
  const selectedDecisionId = useWorkspace((s) => s.selectedDecisionId);
  const { data } = useDecisions();

  const decision = data?.decisions.find(d => d.id === selectedDecisionId);

  const moduleMap: Record<string, string> = {
    '/overview': 'Mission Control',
    '/console': 'Command Console',
    '/spec-compliance': 'Specification',
    '/schedule-risk': 'Schedule',
    '/supply-chain': 'Supply',
    '/commissioning': 'Commissioning',
    '/knowledge': 'Knowledge',
    '/explorer': 'Thread Explorer',
    '/audit': 'Audit Log',
  };

  const currentModule = Object.entries(moduleMap).find(([path]) => pathname.startsWith(path))?.[1] || 'Dashboard';

  return (
    <div style={{ 
      padding: '12px 32px', 
      fontSize: 'var(--fs-10)', 
      fontFamily: 'var(--font-mono)', 
      color: 'var(--txt-lo)', 
      borderBottom: '1px solid var(--line)', 
      background: 'var(--bg-1)', 
      display: 'flex', 
      gap: '12px', 
      alignItems: 'center', 
      letterSpacing: '0.04em',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <span style={{ color: 'var(--txt-md)' }}>PROMETHEUS</span>
      <span>›</span>
      <span style={{ color: 'var(--txt-md)' }}>Project Meghdoot</span>
      {decision && (
        <>
          <span>›</span>
          <span style={{ color: 'var(--amber)' }}>Decision {decision.id}</span>
        </>
      )}
      <span>›</span>
      <span style={{ color: 'var(--txt-hi)' }}>{currentModule}</span>
    </div>
  );
}
