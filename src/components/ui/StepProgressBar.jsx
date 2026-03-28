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
    <div className="w-full flex items-center justify-center gap-0 mb-10">
      {STEPS.map((step, i) => {
        const n = i + 1;
        const done = n < currentStep;
        const active = n === currentStep;
        const future = n > currentStep;

        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center gap-2 min-w-[80px]">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={
                  done   ? { backgroundColor: '#EDE9FE', color: '#8B5CF6' }
                  : active ? { backgroundColor: '#8B5CF6', color: 'white', boxShadow: '0 0 0 4px #EDE9FE' }
                  :          { backgroundColor: '#F3F0FF', color: '#A09BB8' }
                }
              >
                {done ? <Check size={13} strokeWidth={3} /> : n}
              </div>
              <span
                className="text-xs text-center leading-tight"
                style={{
                  color: active ? '#8B5CF6' : '#A09BB8',
                  fontWeight: active ? 600 : 500,
                }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mb-6 mx-1 rounded-full transition-all"
                style={{ backgroundColor: n < currentStep ? '#8B5CF6' : '#EDE9FE' }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
