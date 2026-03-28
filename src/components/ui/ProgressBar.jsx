import React from 'react';

export default function ProgressBar({ value = 0, color, label, showPercent = true, gradient = false, className = '' }) {
  const clamped = Math.min(100, Math.max(0, value));
  const fill = gradient || !color
    ? 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%)'
    : color;

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium" style={{ color: '#6B6584' }}>{label}</span>}
          {showPercent && (
            <span className="text-xs font-bold tabular-nums" style={{ color: color || '#8B5CF6' }}>
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: '#EDE9FE' }}>
        <div
          className="h-2 rounded-full"
          style={{ width: `${clamped}%`, background: fill, transition: 'width 800ms cubic-bezier(0.4,0,0.2,1)' }}
        />
      </div>
    </div>
  );
}
