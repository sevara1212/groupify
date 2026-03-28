import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Circle, Sparkles } from 'lucide-react';

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
    timers.push(setTimeout(() => navigate('/waiting-room'), NAVIGATE_AFTER));
    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  const progress = Math.round((revealed / STEPS.length) * 100);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: '#F8F7FF' }}>
      
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl p-8 flex flex-col items-center gap-7 relative"
        style={{ border: '1px solid #EDE9FE', boxShadow: '0 8px 32px rgba(139,92,246,0.10)', zIndex: 1 }}>

        {/* Animated logo */}
        <div className="relative">
          <div className="w-18 h-18 rounded-2xl flex items-center justify-center"
            style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', boxShadow: '0 8px 24px rgba(139,92,246,0.35)' }}>
            <Sparkles size={28} color="white" style={{ animation: 'pulse 1.6s ease-in-out infinite' }} />
          </div>
          <div className="absolute inset-0 rounded-2xl" style={{ width: 72, height: 72, animation: 'ring 1.6s ease-in-out infinite', border: '2px solid #C4B5FD', borderRadius: 16 }} />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-extrabold mb-1.5" style={{ color: '#1C1829' }}>Building your group's plan</h2>
          <p className="text-xs" style={{ color: '#A09BB8' }}>Analysing quiz responses — this only takes a moment…</p>
        </div>

        {/* Checklist */}
        <div className="w-full space-y-3.5">
          {STEPS.map((step, i) => {
            const isVisible = i < revealed || step.delay === null;
            const isLoading = step.type === 'loading' && i === revealed - 1;
            const isDone = step.type === 'done' && i < revealed;

            return (
              <div key={step.label}
                className="flex items-center gap-3 transition-all duration-500"
                style={{ opacity: isVisible ? 1 : 0.25, transform: isVisible ? 'translateX(0)' : 'translateX(-8px)' }}>
                {isLoading ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#FDF2F8' }}>
                    <Loader2 size={14} style={{ color: '#EC4899', animation: 'spin 0.8s linear infinite' }} />
                  </div>
                ) : isDone ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
                    <CheckCircle size={12} color="white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#F5F3FF' }}>
                    <Circle size={12} style={{ color: '#D8D3F0' }} />
                  </div>
                )}
                <span className="text-sm" style={{
                  color: isDone ? '#1C1829' : isLoading ? '#EC4899' : '#A09BB8',
                  fontWeight: isDone || isLoading ? 600 : 400,
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
            <span className="text-xs font-medium" style={{ color: '#6B6584' }}>{revealed} of {STEPS.length} steps</span>
            <span className="text-xs font-bold" style={{ color: '#8B5CF6' }}>{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE9FE' }}>
            <div className="h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
              }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(0.9)} }
        @keyframes ring { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0;transform:scale(1.35)} }
      `}</style>
    </div>
  );
}
