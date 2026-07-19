'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        style={{ width: '32px', height: '32px' }} 
        aria-hidden="true" 
      />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: 'var(--radius)',
        color: 'var(--txt-md)',
        transition: 'color 200ms ease, background-color 200ms ease',
        border: '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--txt-hi)';
        e.currentTarget.style.backgroundColor = 'var(--bg-3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--txt-md)';
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
