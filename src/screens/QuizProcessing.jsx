import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Circle } from 'lucide-react';

const STEPS = [
  { label: 'Rubric criteria mapped',              delay: 0,    type: 'done' },
  { label: 'Assignment sections identified',       delay: 800,  type: 'done' },
  { label: 'Member strengths compared',           delay: 1600, type: 'done' },
  { label: 'Matching tasks to best-fit members',  delay: 2400, type: 'loading' },
  { label: 'Checking deadline coverage',          delay: null, type: 'pending' },
];

const NAVIGATE_AFTER = 4200;

export default function QuizProcessing() {
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const timers = [];
    STEPS.forEach((step, i) => {
      if (step.delay !== null) {
        timers.push(setTimeout(() => setRevealed(i + 1), step.delay + 200));
      }
    });
    timers.push(setTimeout(() => navigate('/allocation'), NAVIGATE_AFTER));
    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: '#F8F7FF' }}>
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 flex flex-col items-center gap-7"
        style={{ border: '1px solid #EDE9FE', boxShadow: '0 8px 32px rgba(139,92,246,0.10)' }}>

        {/* Animated logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', boxShadow: '0 8px 20px rgba(139,92,246,0.30)' }}>
            <span className="text-white font-black text-2xl" style={{ letterSpacing: '-0.04em', display: 'inline-block', animation: 'pulse 1.6s ease-in-out infinite' }}>G</span>
          </div>
          <div className="absolute inset-0 rounded-2xl" style={{ animation: 'ring 1.6s ease-in-out infinite', border: '2px solid #C4B5FD', borderRadius: 16 }} />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-extrabold mb-1" style={{ color: '#1C1829' }}>Building your group's plan</h2>
          <p className="text-xs" style={{ color: '#A09BB8' }}>This only takes a moment…</p>
        </div>

        {/* Checklist */}
        <div className="w-full space-y-3">
          {STEPS.map((step, i) => {
            const isVisible = i < revealed || step.delay === null;
            const isLoading = step.type === 'loading' && i === revealed - 1;
            const isDone = step.type === 'done' && i < revealed;
            const isPending = !isLoading && !isDone;

            return (
              <div key={step.label} className="flex items-center gap-3 transition-all duration-500"
                style={{ opacity: isVisible ? 1 : 0.3 }}>
                {isLoading ? (
                  <Loader2 size={16} className="flex-shrink-0" style={{ color: '#EC4899', animation: 'spin 0.8s linear infinite' }} />
                ) : isDone ? (
                  <CheckCircle size={16} className="flex-shrink-0" style={{ color: '#8B5CF6' }} />
                ) : (
                  <Circle size={16} className="flex-shrink-0" style={{ color: '#D8D3F0' }} />
                )}
                <span className="text-sm" style={{ color: isDone ? '#1C1829' : isLoading ? '#EC4899' : '#A09BB8', fontWeight: isDone ? 600 : isLoading ? 600 : 400 }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE9FE' }}>
            <div className="h-1.5 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.round((revealed / STEPS.length) * 100)}%`,
                background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
              }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.8;transform:scale(0.95)} }
        @keyframes ring { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0;transform:scale(1.3)} }
      `}</style>
    </div>
  );
}
