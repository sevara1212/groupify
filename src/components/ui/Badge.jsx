import React from 'react';
import { CheckCircle, Clock, Minus, AlertTriangle, AlertCircle } from 'lucide-react';

const iconMap = { CheckCircle, Clock, Minus, AlertTriangle, AlertCircle };

const CONFIGS = {
  done:        { color: '#0369A1', bg: '#E0F2FE', border: '#BAE6FD', label: 'Done',        icon: 'CheckCircle' },
  inProgress:  { color: '#6D28D9', bg: '#EDE9FE', border: '#C4B5FD', label: 'In Progress', icon: 'Clock' },
  notStarted:  { color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB', label: 'Not Started', icon: 'Minus' },
  atRisk:      { color: '#92400E', bg: '#FEF3C7', border: '#FDE68A', label: 'At Risk',     icon: 'AlertTriangle' },
  overdue:     { color: '#92400E', bg: '#FEF3C7', border: '#FCD34D', label: 'Overdue',     icon: 'AlertCircle' },
  quizDone:    { color: '#BE185D', bg: '#FDF2F8', border: '#FBCFE8', label: 'Quiz Done',   icon: 'CheckCircle' },
  // snake_case
  in_progress: { color: '#6D28D9', bg: '#EDE9FE', border: '#C4B5FD', label: 'In Progress', icon: 'Clock' },
  not_started: { color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB', label: 'Not Started', icon: 'Minus' },
  at_risk:     { color: '#92400E', bg: '#FEF3C7', border: '#FDE68A', label: 'At Risk',     icon: 'AlertTriangle' },
};

export default function Badge({ status, className = '' }) {
  const c = CONFIGS[status] || CONFIGS.notStarted;
  const Icon = iconMap[c.icon];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}
      style={{ color: c.color, backgroundColor: c.bg, borderColor: c.border }}
    >
      <Icon size={11} strokeWidth={2.5} />
      {c.label}
    </span>
  );
}
