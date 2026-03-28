import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import QuizProgress from '../components/ui/QuizProgress';
import Button from '../components/ui/Button';

const SKILLS = [
  { id: 'writing',    emoji: '✍️', label: 'Academic Writing',      default: 8 },
  { id: 'research',   emoji: '🔍', label: 'Research and Analysis',  default: 6 },
  { id: 'design',     emoji: '🎨', label: 'Design and Visuals',     default: 9 },
  { id: 'presenting', emoji: '🎤', label: 'Presenting / Speaking',  default: 5 },
  { id: 'coding',     emoji: '💻', label: 'Data and Coding',        default: 4 },
];

function scoreColor(v) {
  if (v >= 8) return '#2563EB';
  if (v >= 5) return '#7C3AED';
  return '#94A3B8';
}

export default function QuizQ2() {
  const navigate = useNavigate();
  const [scores, setScores] = useState(
    Object.fromEntries(SKILLS.map((s) => [s.id, s.default]))
  );

  const set = (id, val) => setScores((prev) => ({ ...prev, [id]: Number(val) }));

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10"
      style={{ backgroundColor: '#F8FAFC' }}>
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>
              Question 2 of 5
            </span>
            <QuizProgress current={2} />
          </div>
          <button
            className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            style={{ color: '#94A3B8' }}
            onClick={() => navigate('/quiz/4')}
          >
            Skip
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>
            How confident are you in each of these areas?
          </h2>
          <p className="text-sm mb-6" style={{ color: '#475569' }}>
            Drag the sliders — 0 = not confident, 10 = very confident.
          </p>

          <div className="space-y-5">
            {SKILLS.map(({ id, emoji, label }) => {
              const val = scores[id];
              return (
                <div key={id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2" style={{ color: '#0F172A' }}>
                      <span>{emoji}</span> {label}
                    </span>
                    <span
                      className="text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: scoreColor(val) }}
                    >
                      {val}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={val}
                      onChange={(e) => set(id, e.target.value)}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #2563EB ${val * 10}%, #E2E8F0 ${val * 10}%)`,
                        accentColor: '#2563EB',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nav */}
          <div className="flex justify-between mt-8">
            <Button variant="outlined" onClick={() => navigate('/quiz/1')} className="gap-1.5">
              <ArrowLeft size={14} /> Back
            </Button>
            <Button variant="filled" onClick={() => navigate('/quiz/4')} className="gap-1.5">
              Next <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
