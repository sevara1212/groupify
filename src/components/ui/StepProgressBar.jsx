import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { label: 'Project Details' },
  { label: 'Upload Files' },
  { label: 'Invite Team' },
  { label: 'AI Quiz' },
];

export default function StepProgressBar({ currentStep }) {
  return (
    <nav aria-label="Progress" className="w-full flex items-center justify-center gap-0 mb-10">
      {STEPS.map((step, i) => {
        const n = i + 1;
        const done = n < currentStep;
        const active = n === currentStep;

        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center gap-2.5 min-w-[90px]">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={
                  done
                    ? { backgroundColor: '#8B5CF6', color: 'white', boxShadow: '0 2px 8px rgba(139,92,246,0.25)' }
                    : active
                    ? { backgroundColor: '#8B5CF6', color: 'white', boxShadow: '0 0 0 4px #EDE9FE, 0 2px 12px rgba(139,92,246,0.3)' }
                    : { backgroundColor: '#F3F0FF', color: '#A09BB8' }
                }
                aria-current={active ? 'step' : undefined}
              >
                {done ? <Check size={14} strokeWidth={3} /> : n}
              </div>
              <span
                className="text-xs text-center leading-tight font-medium"
                style={{
                  color: done ? '#8B5CF6' : active ? '#1C1829' : '#A09BB8',
                  fontWeight: active ? 700 : done ? 600 : 500,
                }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mb-7 mx-2 rounded-full transition-all duration-500"
                style={{ backgroundColor: n < currentStep ? '#8B5CF6' : '#EDE9FE' }}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
