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
