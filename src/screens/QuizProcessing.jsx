import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';

const STEPS = [
  { label: 'Rubric criteria mapped',              delay: 0,    done: true  },
  { label: 'Assignment sections identified',       delay: 700,  done: true  },
  { label: 'Your strengths noted',                delay: 1400, done: true  },
  { label: 'Matching tasks to best-fit members',  delay: 2100, loading: true },
  { label: 'Checking deadline coverage',          delay: null, pending: true },
];

const NAVIGATE_AFTER = 4000;

export default function QuizProcessing() {
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const timers = [];
    STEPS.forEach((step, i) => {
      if (step.delay !== null) {
        timers.push(setTimeout(() => setRevealed(i + 1), step.delay + 150));
      }
    });
    timers.push(setTimeout(() => navigate('/waiting-room'), NAVIGATE_AFTER));
    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  const progress = Math.round((revealed / STEPS.length) * 100);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: 'linear-gradient(160deg, #EDE9FE 0%, #FDF2F8 55%, #E0F2FE 100%)' }}>

      {/* Subtle background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/5 -right-16 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(219,39,119,0.07) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-sm relative" style={{ zIndex: 1 }}>
        <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-7"
          style={{ boxShadow: '0 24px 64px rgba(124,58,237,0.15)', border: '1px solid rgba(196,181,253,0.35)' }}>

          {/* Animated icon */}
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #7C3AED 0%, #DB2777 100%)',
                boxShadow: '0 12px 32px rgba(124,58,237,0.4)',
                animation: 'processingBounce 2s ease-in-out infinite',
              }}>
              <span className="text-3xl" style={{ animation: 'processingWiggle 2s ease-in-out infinite' }}>🧠</span>
            </div>
            {/* Ring */}
            <div className="absolute inset-0 rounded-3xl"
              style={{ border: '2px solid rgba(196,181,253,0.6)', animation: 'processingRing 2s ease-in-out infinite' }} />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-black mb-2" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>
              Building your group plan
            </h2>
            <p className="text-sm" style={{ color: '#A09BB8' }}>
              Analysing responses — almost there! ✨
            </p>
          </div>

          {/* Steps */}
          <div className="w-full space-y-3">
            {STEPS.map((step, i) => {
              const isVisible = i < revealed || step.pending;
              const isActiveLoading = step.loading && i === revealed - 1;
              const isDone = step.done && i < revealed;

              return (
                <div key={step.label}
                  className="flex items-center gap-3 transition-all duration-500"
                  style={{
                    opacity: isVisible ? 1 : 0.2,
                    transform: isVisible ? 'translateX(0)' : 'translateX(-12px)',
                  }}>
                  {isActiveLoading ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#FDF2F8' }}>
                      <Loader2 size={14} style={{ color: '#DB2777', animation: 'spin 0.8s linear infinite' }} />
                    </div>
                  ) : isDone ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #DB2777)' }}>
                      <CheckCircle size={13} color="white" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#F5F3FF', border: '2px solid #EDE9FE' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#D8D3F0', display: 'block' }} />
                    </div>
                  )}
                  <span className="text-sm"
                    style={{
                      color: isDone ? '#1C1829' : isActiveLoading ? '#DB2777' : '#A09BB8',
                      fontWeight: isDone || isActiveLoading ? 600 : 400,
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
              <span className="text-xs font-medium" style={{ color: '#A09BB8' }}>{revealed} of {STEPS.length} done</span>
              <span className="text-xs font-bold" style={{ color: '#7C3AED' }}>{progress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE9FE' }}>
              <div className="h-2.5 rounded-full transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #7C3AED, #DB2777)',
                  boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                }} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes processingBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes processingWiggle { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
        @keyframes processingRing { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:0;transform:scale(1.4)} }
      `}</style>
    </div>
  );
}
