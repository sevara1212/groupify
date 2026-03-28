import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Circle, Sparkles } from 'lucide-react';

const STEPS = [
  { label: 'Rubric criteria mapped',              delay: 0,    type: 'done' },
  { label: 'Assignment sections identified',       delay: 800,  type: 'done' },
  { label: 'Member strengths compared',           delay: 1600, type: 'done' },
  { label: 'Matching tasks to best-fit members',  delay: 2400, type: 'loading' },
  { label: 'Verifying deadline coverage',          delay: 3200, type: 'done' },
];

const NAVIGATE_AFTER = 4500;

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

  const pct = Math.round((revealed / STEPS.length) * 100);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: '#F8F7FF' }}>

      <div className="w-full max-w-sm bg-white rounded-3xl p-10 flex flex-col items-center gap-8 animate-scale-in"
        style={{ border: '1px solid #EDE9FE', boxShadow: '0 12px 40px rgba(139,92,246,0.10)' }}>

        {/* Animated logo */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              boxShadow: '0 8px 24px rgba(139,92,246,0.30)',
            }}>
            <Sparkles size={32} color="white" style={{ animation: 'pulse 1.6s ease-in-out infinite' }} />
          </div>
          <div className="absolute inset-0 rounded-2xl"
            style={{ animation: 'ring 1.6s ease-in-out infinite', border: '2px solid #C4B5FD', borderRadius: 16 }} />
        </div>

        <div className="text-center">
          <h2 className="text-xl font-extrabold mb-2" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>
            Building your plan
          </h2>
          <p className="text-sm font-medium" style={{ color: '#6B6584' }}>
            AI is matching tasks to your team…
          </p>
        </div>

        {/* Checklist */}
        <div className="w-full space-y-4">
          {STEPS.map((step, i) => {
            const isRevealed = i < revealed;
            const isCurrentlyLoading = i === revealed - 1 && step.type === 'loading';
            const isDone = isRevealed && !isCurrentlyLoading;

            return (
              <div key={step.label}
                className="flex items-center gap-3 transition-all duration-500"
                style={{ opacity: isRevealed ? 1 : 0.3, transform: isRevealed ? 'translateX(0)' : 'translateX(-8px)' }}>
                {isCurrentlyLoading ? (
                  <Loader2 size={18} className="flex-shrink-0 animate-spin" style={{ color: '#EC4899' }} />
                ) : isDone ? (
                  <CheckCircle size={18} className="flex-shrink-0" style={{ color: '#0D9488' }} />
                ) : (
                  <Circle size={18} className="flex-shrink-0" style={{ color: '#D8D3F0' }} />
                )}
                <span className="text-sm" style={{
                  color: isDone ? '#1C1829' : isCurrentlyLoading ? '#EC4899' : '#A09BB8',
                  fontWeight: isDone || isCurrentlyLoading ? 600 : 400,
                }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold" style={{ color: '#6B6584' }}>Progress</span>
            <span className="text-xs font-bold tabular-nums" style={{ color: '#8B5CF6' }}>{pct}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE9FE' }}>
            <div className="h-2.5 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
              }} />
          </div>
        </div>
      </div>
    </div>
  );
}
