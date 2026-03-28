import React from 'react';
import { Moon, Sun } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();
  const Icon = isDark ? Sun : Moon;
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`topbar-control theme-toggle flex items-center justify-center rounded-xl transition-all ${className}`.trim()}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
    >
      <Icon size={17} strokeWidth={2.1} />
    </button>
  );
}
