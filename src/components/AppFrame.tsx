'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { useDecisions } from '@/core/api/hooks';
import { useWorkspace } from '@/core/state/workspace';
import { CommandPalette } from './CommandPalette';
import { ContextDrawer } from './ContextDrawer';
import { DecisionDrawer } from './DecisionDrawer';
import { UniversalBreadcrumb } from './UniversalBreadcrumb';

/** Workspace chrome: critical alert banner, left rail, drawer, palette, toasts. */

const NAV = [
  { path: '/overview', label: 'Overview', icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /> },
  { path: '/documents', label: 'Documents', icon: <path d="M4 4h16v16H4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
  { path: '/console', label: 'Console', icon: <path d="M3 5h18v14H3zM3 9h18M7 13h6" /> },
  { path: '/spec-compliance', label: 'Spec', icon: <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13l2 2 4-4" /> },
  { path: '/schedule-risk', label: 'Schedule', icon: <path d="M3 6h10M3 12h14M3 18h8M19 15v6M16 18h6" /> },
  { path: '/supply-chain', label: 'Supply', icon: <path d="M12 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM4 12h16M12 4c2.5 2 2.5 14 0 16M12 4c-2.5 2-2.5 14 0 16" /> },
  { path: '/commissioning', label: 'Commission', icon: <path d="M4 5h16M4 10h16M4 15h10M17 14l2 2 4-4" /> },
  { path: '/knowledge', label: 'Knowledge', icon: <path d="M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM9 8h6M9 12h6M9 16h4" /> },
  { path: '/repository', label: 'Repository', icon: <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 7h10v2H7zM7 11h10v2H7zM7 15h6v2H7z" /> },
  { path: '/explorer', label: 'Thread', icon: <path d="M5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM9 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 6h10M6 8l3 6M18 13l-7 5" /> },
  { path: '/audit', label: 'Audit', icon: <path d="M12 3l8 4v6c0 4-3.5 7-8 8-4.5-1-8-4-8-8V7zM9 12l2 2 4-4" /> },
];

const ALERT_KICKER: Record<string, string> = {
  'schedule-risk': 'CRITICAL SCHEDULE RISK',
  'supply-chain': 'CRITICAL VENDOR RISK',
  'spec-deviation': 'CRITICAL DEVIATION',
  'commissioning-gap': 'CRITICAL TURNOVER RISK',
};

function AlertBanner() {
  const { data } = useDecisions();
  const acknowledged = useWorkspace((s) => s.alertAcknowledged);
  const acknowledgeAlert = useWorkspace((s) => s.acknowledgeAlert);
  const selectDecision = useWorkspace((s) => s.selectDecision);
  const router = useRouter();

  const critical = data?.decisions.find((d) => d.severity === 'Critical' && d.status === 'Pending');
  if (!critical || acknowledged) return null;
  const finding = data?.findings[critical.findingId];
  const kicker = finding ? ALERT_KICKER[finding.kind] ?? 'CRITICAL RISK' : 'CRITICAL RISK';

  const getAgentRoute = (agentName: string) => {
    if (agentName.includes('Schedule')) return '/schedule-risk';
    if (agentName.includes('Spec')) return '/spec-compliance';
    if (agentName.includes('Supply')) return '/supply-chain';
    if (agentName.includes('Commissioning')) return '/commissioning';
    if (agentName.includes('Knowledge')) return '/knowledge';
    return '/console';
  };

  return (
    <div className="alert-banner" role="alert">
      <span className="alert-banner__sev">{kicker}</span>
      <span className="alert-banner__text">
        {finding?.finding ?? critical.impact}
        {finding?.cascade ? ` Predicted L5 IST slip: ${finding.cascade.istSlipWeeks} weeks.` : ''}
      </span>
      <button
        type="button"
        className="primary"
        onClick={() => {
          selectDecision(critical.id);
          router.push(getAgentRoute(critical.agentName));
        }}
      >
        Review in Context
      </button>
      <button type="button" onClick={acknowledgeAlert}>
        Acknowledge
      </button>
    </div>
  );
}

function Toasts() {
  const toasts = useWorkspace((s) => s.toasts);
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.kind === 'error' ? ' toast--error' : ''}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useDecisions();
  const projectInitialized = useWorkspace((s) => s.projectInitialized);

  useEffect(() => {
    if (pathname !== '/' && !projectInitialized) {
      router.push('/');
    }
  }, [pathname, projectInitialized, router]);

  return (
    <div className="app-shell">
      {pathname !== '/' && <AlertBanner />}
      <div className="app-row">
        {pathname !== '/' && (
          <nav className="rail" aria-label="Workspace navigation">
          <div className="rail__brand" title="PROMETHEUS - Engineering Intelligence Operating System">
            <img src="/just_logo.png" alt="P" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </div>
          {NAV.map((item) => (
            <Link key={item.path} href={item.path} prefetch={true} className={`rail__item${pathname.startsWith(item.path) ? ' active' : ''}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">{item.icon}</svg>
              {item.label}
            </Link>
          ))}
          <div className="rail__spacer" />
          <div className="rail__user" title={data ? `${data.user.name} — ${data.user.role} · ${data.user.tenantName}` : undefined}>
            {data ? data.user.name.split(' ').map((p) => p[0]).join('').replace('.', '') : '··'}
          </div>
        </nav>
        )}
        <main className="app-main" style={{ display: 'flex', flexDirection: 'column' }}>
          {pathname !== '/' && <UniversalBreadcrumb />}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
        </main>
      </div>
      <ContextDrawer />
      <DecisionDrawer />
      {pathname !== '/' && <CommandPalette />}
      <Toasts />
    </div>
  );
}
