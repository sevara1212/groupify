import React from 'react';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const sizeMap = {
  sm: { w: 32, h: 32, fs: 11 },
  md: { w: 40, h: 40, fs: 13 },
  lg: { w: 48, h: 48, fs: 15 },
};

export default function Avatar({ name, color = '#8B5CF6', size = 'md', className = '' }) {
  const s = sizeMap[size] || sizeMap.md;
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{
        width: s.w, height: s.h,
        backgroundColor: color,
        border: '2.5px solid white',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.06)',
        color: 'white',
        fontWeight: 700,
        fontSize: s.fs,
        letterSpacing: '-0.01em',
        fontFamily: 'inherit',
      }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
