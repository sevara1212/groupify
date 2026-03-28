import React, { useState } from 'react';

const V = {
  filled: {
    base: 'text-white font-semibold rounded-xl px-5 py-2.5',
    bg: '#8B5CF6',
    bgHover: '#7C3AED',
    shadow: '0 4px 14px rgba(139,92,246,0.35)',
    shadowHover: '0 6px 20px rgba(139,92,246,0.45)',
  },
  outlined: {
    base: 'font-semibold rounded-xl px-5 py-2.5 bg-white',
    color: '#8B5CF6',
    border: '#8B5CF6',
    bgHover: '#F5F3FF',
  },
  ghost: {
    base: 'font-semibold rounded-xl px-5 py-2.5',
    color: '#8B5CF6',
    bgHover: '#F5F3FF',
  },
  accent: {
    base: 'text-white font-semibold rounded-xl px-5 py-2.5',
    bg: '#EC4899',
    bgHover: '#BE185D',
    shadow: '0 4px 14px rgba(236,72,153,0.32)',
    shadowHover: '0 6px 20px rgba(236,72,153,0.42)',
  },
  secondary: {
    base: 'text-white font-semibold rounded-xl px-5 py-2.5',
    bg: '#6366F1',
    bgHover: '#4F46E5',
    shadow: '0 4px 14px rgba(99,102,241,0.28)',
  },
  warning: {
    base: 'text-white font-semibold rounded-xl px-5 py-2.5',
    bg: '#D97706',
    bgHover: '#B45309',
    shadow: '0 4px 14px rgba(217,119,6,0.28)',
  },
  danger: {
    base: 'text-white font-semibold rounded-xl px-5 py-2.5',
    bg: '#D97706',
    bgHover: '#B45309',
    shadow: '0 4px 14px rgba(217,119,6,0.28)',
  },
};

export default function Button({ variant = 'filled', children, className = '', disabled, ...props }) {
  const [hov, setHov] = useState(false);
  const [act, setAct] = useState(false);
  const v = V[variant] || V.filled;

  const style = {};
  if (v.bg)          style.backgroundColor = hov && !disabled ? (v.bgHover || v.bg) : v.bg;
  if (v.color)       style.color           = v.color;
  if (v.border)      style.border          = `2px solid ${v.border}`;
  if (!v.border && !v.bg) style.border     = '1px solid transparent';
  if (v.bg)          style.boxShadow       = hov && !disabled ? (v.shadowHover || v.shadow || 'none') : (v.shadow || 'none');
  if (hov && !disabled && !v.bg) style.backgroundColor = v.bgHover || 'transparent';
  if (act && !disabled) style.transform    = 'scale(0.97)';

  return (
    <button
      className={`inline-flex items-center gap-2 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none ${v.base} ${className}`}
      style={style}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setAct(false); }}
      onMouseDown={() => setAct(true)}
      onMouseUp={() => setAct(false)}
      {...props}
    >
      {children}
    </button>
  );
}
