import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const STEPS = [
  { emoji: '🎭', title: 'Your group role', desc: 'organiser, writer, researcher…' },
  { emoji: '💪', title: 'Skill strengths', desc: 'what you feel most confident in' },
  { emoji: '📅', title: 'Your availability', desc: 'when you can work on tasks' },
];

export default function QuizIntro() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: 'linear-gradient(160deg, #EDE9FE 0%, #FDF2F8 55%, #E0F2FE 100%)' }}
    >
      <div className="w-full max-w-sm">
        <div
          className="bg-white rounded-3xl overflow-hidden"
          style={{ boxShadow: '0 24px 64px rgba(139,92,246,0.18)', border: '1px solid rgba(196,181,253,0.4)' }}
        >
          {/* Hero */}
          <div
            className="relative px-8 pt-12 pb-10 text-center overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #7C3AED 0%, #DB2777 100%)' }}
          >
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-20" style={{ backgroundColor: 'white' }} />
            <div className="absolute -bottom-6 -left-8 w-28 h-28 rounded-full opacity-10" style={{ backgroundColor: 'white' }} />
            <div className="absolute top-4 left-1/3 w-3 h-3 rounded-full opacity-30" style={{ backgroundColor: 'white' }} />

            <div className="text-5xl mb-5 relative" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>🎯</div>
            <h1 className="text-2xl font-black text-white mb-2.5" style={{ letterSpacing: '-0.03em' }}>
              Quick team check-in
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
              5 short questions so we can match everyone to the right tasks
            </p>

            {/* Info pills */}
            <div className="flex gap-2 justify-center mt-5 flex-wrap">
              {['⚡ 3 minutes', '🔒 Private', '5 questions'].map(label => (
                <span
                  key={label}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)' }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-7 py-7">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8B5CF6' }}>
              What we'll learn about you
            </p>

            <div className="space-y-3 mb-7">
              {STEPS.map(({ emoji, title, desc }) => (
                <div
                  key={title}
                  className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl"
                  style={{ backgroundColor: '#FAFAFF', border: '1.5px solid #EDE9FE' }}
                >
                  <span className="text-2xl flex-shrink-0">{emoji}</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#1C1829' }}>{title}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#A09BB8' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress preview */}
            <div className="mb-6">
              <div className="flex justify-between text-xs mb-2" style={{ color: '#A09BB8' }}>
                <span>0 of 5 completed</span>
                <span className="font-bold" style={{ color: '#8B5CF6' }}>0%</span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#EDE9FE' }}>
                <div className="h-2 rounded-full w-0" style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }} />
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate('/quiz/questions')}
              className="w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2.5 transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
                boxShadow: '0 8px 28px rgba(124,58,237,0.35)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(124,58,237,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.35)'; }}
            >
              Start quiz <ArrowRight size={18} />
            </button>

            <p className="text-center text-xs mt-4" style={{ color: '#C4B5FD' }}>
              Your answers are only shared with your group
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
