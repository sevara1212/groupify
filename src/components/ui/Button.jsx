import React, { useState } from 'react';

const V = {
  filled: {
    base: 'text-white font-bold rounded-2xl px-6 py-3',
    bg: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    bgHover: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    shadow: '0 4px 14px rgba(139,92,246,0.30)',
    shadowHover: '0 6px 20px rgba(139,92,246,0.40)',
  },
  outlined: {
    base: 'font-bold rounded-2xl px-6 py-3 bg-white',
    color: '#8B5CF6',
    border: '#C4B5FD',
    borderHover: '#8B5CF6',
    bgHover: '#F5F3FF',
  },
  ghost: {
    base: 'font-semibold rounded-2xl px-5 py-2.5',
    color: '#8B5CF6',
    bgHover: '#F5F3FF',
  },
  accent: {
    base: 'text-white font-bold rounded-2xl px-6 py-3',
    bg: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    bgHover: 'linear-gradient(135deg, #DB2777 0%, #9D174D 100%)',
    shadow: '0 4px 14px rgba(236,72,153,0.28)',
    shadowHover: '0 6px 20px rgba(236,72,153,0.38)',
  },
  warning: {
    base: 'text-white font-bold rounded-2xl px-6 py-3',
    bg: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    bgHover: 'linear-gradient(135deg, #B45309 0%, #92400E 100%)',
    shadow: '0 4px 14px rgba(217,119,6,0.25)',
  },
};

export default function Button({ variant = 'filled', children, className = '', disabled, ...props }) {
  const [hov, setHov] = useState(false);
  const [act, setAct] = useState(false);
  const v = V[variant] || V.filled;

  const style = {};

  // Background
  if (v.bg) {
    style.background = hov && !disabled ? (v.bgHover || v.bg) : v.bg;
  }
  if (!v.bg && hov && !disabled) {
    style.backgroundColor = v.bgHover || 'transparent';
  }

  // Color
  if (v.color) style.color = v.color;

  // Border
  if (v.border) {
    style.border = `2px solid ${hov && !disabled ? (v.borderHover || v.border) : v.border}`;
  }

  // Shadow
  if (v.shadow) {
    style.boxShadow = hov && !disabled ? (v.shadowHover || v.shadow) : v.shadow;
  }

  // Active press
  if (act && !disabled) style.transform = 'scale(0.97)';

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 text-sm transition-all duration-200 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2
        disabled:opacity-45 disabled:cursor-not-allowed disabled:saturate-50 select-none
        ${v.base} ${className}`}
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
