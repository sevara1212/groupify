import React from 'react';

export default function QuizProgress({ current, total = 5 }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current - 1 ? 20 : 8,
              height: 8,
              background: i < current
                ? 'linear-gradient(135deg, #8B5CF6, #EC4899)'
                : '#EDE9FE',
            }}
          />
        ))}
      </div>
      <span className="text-sm font-bold tabular-nums" style={{ color: '#8B5CF6' }}>
        {pct}%
      </span>
    </div>
  );
}
