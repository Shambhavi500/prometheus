'use client';

import { usePathname } from 'next/navigation';
import { useWorkspace } from '@/core/state/workspace';
import { useDecisions } from '@/core/api/hooks';
import { ThemeToggle } from './ThemeToggle';
import Link from 'next/link';

export function UniversalBreadcrumb() {
  const pathname = usePathname();
  const selectedDecisionId = useWorkspace((s) => s.selectedDecisionId);
  const { data } = useDecisions();

  const decision = data?.decisions.find(d => d.id === selectedDecisionId);

  const moduleMap: Record<string, string> = {
    '/overview': 'Overview',
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
    <header style={{ 
      padding: '0 24px', 
      height: '56px',
      borderBottom: '1px solid var(--line)', 
      background: 'var(--bg-1)', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      transition: 'background-color 200ms ease, border-color 200ms ease'
    }}>
      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/just_logo.png" alt="PROMETHEUS" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 'var(--fs-13)', color: 'var(--txt-hi)', letterSpacing: '0.04em' }}>
            PROMETHEUS
          </span>
        </Link>
      </div>

      {/* Center: Page Title */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <h1 style={{ 
          fontSize: 'var(--fs-14)', 
          fontWeight: 500, 
          color: 'var(--txt-hi)',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {currentModule}
          {decision && (
            <>
              <span style={{ color: 'var(--txt-lo)' }}>/</span>
              <span style={{ color: 'var(--amber)', fontSize: 'var(--fs-12)', fontFamily: 'var(--font-mono)' }}>Decision {decision.id}</span>
            </>
          )}
        </h1>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', flex: 1 }}>
        <ThemeToggle />
      </div>
    </header>
  );
}
