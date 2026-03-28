import React from 'react';

export default function QuizProgress({ current, total = 5 }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full transition-colors"
            style={{ backgroundColor: i < current ? '#2563EB' : '#E2E8F0' }}
          />
        ))}
      </div>
      <span className="text-sm font-semibold tabular-nums" style={{ color: '#2563EB' }}>
        {pct}%
      </span>
    </div>
  );
}
