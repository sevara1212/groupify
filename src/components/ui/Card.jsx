import React, { useState } from 'react';

export default function Card({ children, className = '', hover = false, ...props }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      className={`bg-white rounded-2xl ${className}`}
      style={{
        border: '1px solid #EDE9FE',
        boxShadow: hov && hover
          ? '0 8px 24px rgba(139,92,246,0.12), 0 2px 6px rgba(139,92,246,0.06)'
          : '0 1px 4px rgba(139,92,246,0.06), 0 4px 12px rgba(139,92,246,0.04)',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        transform: hov && hover ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      {...props}
    >
      {children}
    </div>
  );
}
