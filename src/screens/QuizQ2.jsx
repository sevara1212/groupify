import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BarChart2 } from 'lucide-react';
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
  if (v >= 8) return '#8B5CF6';
  if (v >= 5) return '#EC4899';
  return '#A09BB8';
}

function scoreLabel(v) {
  if (v >= 9) return 'Expert';
  if (v >= 7) return 'Strong';
  if (v >= 5) return 'Good';
  if (v >= 3) return 'Basic';
  return 'Learning';
}

export default function QuizQ2() {
  const navigate = useNavigate();
  const [scores, setScores] = useState(
    Object.fromEntries(SKILLS.map((s) => [s.id, s.default]))
  );

  const set = (id, val) => setScores((prev) => ({ ...prev, [id]: Number(val) }));

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10"
      style={{ backgroundColor: '#F8F7FF' }}>
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold" style={{ color: '#1C1829' }}>
              Question 2 of 5
            </span>
            <QuizProgress current={2} />
          </div>
          <button
            className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
            style={{ color: '#A09BB8', border: '1px solid #EDE9FE' }}
            onClick={() => navigate('/quiz/4')}
          >
            Skip
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl overflow-hidden"
          style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 24px rgba(139,92,246,0.08)' }}>

          {/* Card header with gradient */}
          <div className="px-7 pt-7 pb-5"
            style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)' }}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 size={14} style={{ color: '#8B5CF6' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8B5CF6' }}>Skill Assessment</span>
            </div>
            <h2 className="text-lg font-extrabold mb-1" style={{ color: '#1C1829' }}>
              How confident are you in each of these areas?
            </h2>
            <p className="text-sm" style={{ color: '#6B6584' }}>
              Drag the sliders — 0 = not confident, 10 = very confident.
            </p>
          </div>

          <div className="px-7 pb-7 pt-5">
            <div className="space-y-6">
              {SKILLS.map(({ id, emoji, label }) => {
                const val = scores[id];
                const col = scoreColor(val);
                const pct = val * 10;
                return (
                  <div key={id}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                          style={{ backgroundColor: '#F5F3FF' }}>
                          {emoji}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: '#1C1829' }}>{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium" style={{ color: '#A09BB8' }}>{scoreLabel(val)}</span>
                        <span
                          className="text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                          style={{ backgroundColor: col, boxShadow: `0 2px 8px ${col}40` }}
                        >
                          {val}
                        </span>
                      </div>
                    </div>
                    {/* Custom slider track */}
                    <div className="relative">
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE9FE' }}>
                        <div className="h-2 rounded-full transition-all duration-150"
                          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${col}, ${col}90)` }} />
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={val}
                        onChange={(e) => set(id, e.target.value)}
                        className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                        style={{ margin: 0 }}
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
    </div>
  );
}
