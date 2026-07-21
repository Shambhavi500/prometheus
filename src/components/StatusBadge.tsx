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
