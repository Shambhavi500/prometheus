export function LiveBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 6px',
      borderRadius: '4px',
      background: 'rgba(0, 240, 255, 0.1)',
      border: '1px solid rgba(0, 240, 255, 0.2)',
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
    bg = 'rgba(255, 171, 0, 0.1)';
  } else if (label === 'Processed' || label === 'Active') {
    color = 'var(--teal)';
    bg = 'rgba(0, 240, 255, 0.1)';
  } else if (label === 'Failed') {
    color = 'var(--red)';
    bg = 'rgba(255, 86, 48, 0.1)';
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
