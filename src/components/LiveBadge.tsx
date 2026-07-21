export function LiveBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 6px',
      borderRadius: '4px',
      background: 'var(--teal-dim)',
      border: '1px solid var(--teal-line)',
      color: 'var(--teal)',
      fontSize: '10px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      <span style={{
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        background: 'var(--teal)',
        boxShadow: '0 0 4px var(--teal)',
        animation: 'pulse 2s infinite'
      }} />
      LIVE
    </span>
  );
}

export function BaselineBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 6px',
      borderRadius: '4px',
      background: 'var(--bg-1)',
      border: '1px solid var(--bg-3)',
      color: 'var(--txt-md)',
      fontSize: '10px',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      BASELINE
    </span>
  );
}

export function StatusBadge({ label }: { label: string }) {
  let color = 'var(--txt-md)';
  let bg = 'var(--bg-2)';
  if (label === 'Processing') {
    color = 'var(--amber)';
    bg = 'var(--amber-dim)';
  } else if (label === 'Processed' || label === 'Active') {
    color = 'var(--teal)';
    bg = 'var(--teal-dim)';
  } else if (label === 'Failed') {
    color = 'var(--red)';
    bg = 'var(--red-dim)';
  }

  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '4px',
      background: bg,
      color: color,
      fontSize: '11px',
      fontWeight: 500,
    }}>
      {label}
    </span>
  );
}
