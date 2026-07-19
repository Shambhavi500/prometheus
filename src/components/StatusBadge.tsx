'use client';

/** Status is always text + color, never color alone (06_COMPONENTS, 03_DESIGN a11y). */

const VARIANT: Record<string, string> = {
  Critical: 'badge--critical',
  High: 'badge--warning',
  Medium: 'badge--neutral',
  Low: 'badge--neutral',
  Deviation: 'badge--critical',
  'Data Gap': 'badge--warning',
  Compliant: 'badge--success',
  Signed: 'badge--success',
  Approved: 'badge--success',
  Rejected: 'badge--neutral',
  Pending: 'badge--neutral',
  Open: 'badge--warning',
  Mitigated: 'badge--success',
};

export function StatusBadge({ label, variant }: { label: string; variant?: string }) {
  const cls = VARIANT[variant ?? label] ?? 'badge--neutral';
  return <span className={`badge ${cls}`}>{label}</span>;
}
