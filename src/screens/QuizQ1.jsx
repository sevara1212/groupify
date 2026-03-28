import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import QuizProgress from '../components/ui/QuizProgress';
import Button from '../components/ui/Button';

const ROLES = [
  { id: 'organiser',  emoji: '📋', role: 'Organiser',  desc: 'Tracks tasks & deadlines' },
  { id: 'researcher', emoji: '🔍', role: 'Researcher', desc: 'Finds sources & evidence' },
  { id: 'writer',     emoji: '✍️', role: 'Writer',     desc: 'Drafts and refines content' },
  { id: 'designer',   emoji: '🎨', role: 'Designer',   desc: 'Visuals & slides' },
  { id: 'presenter',  emoji: '🎤', role: 'Presenter',  desc: 'Speaks up & presents' },
];

export default function QuizQ1() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const selectedLabels = selected.map((id) => ROLES.find((r) => r.id === id)?.role).filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10"
      style={{ backgroundColor: '#F8F7FF' }}>
      <div className="w-full max-w-xl">

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold" style={{ color: '#1C1829' }}>
              Question 1 of 5
            </span>
            <QuizProgress current={1} />
          </div>
          <button
            className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
            style={{ color: '#A09BB8', border: '1px solid #EDE9FE' }}
            onClick={() => navigate('/quiz/2')}
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
              <Sparkles size={14} style={{ color: '#8B5CF6' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8B5CF6' }}>Your Role</span>
            </div>
            <h2 className="text-lg font-extrabold mb-1" style={{ color: '#1C1829' }}>
              What kind of group member are you usually?
            </h2>
            <p className="text-sm" style={{ color: '#6B6584' }}>
              Pick up to two that best describe you.
            </p>
          </div>

          <div className="px-7 pb-7 pt-5">
            {/* Role grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {ROLES.map(({ id, emoji, role, desc }) => {
                const isSelected = selected.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggle(id)}
                    className="relative text-left rounded-2xl p-4 transition-all duration-200 focus:outline-none group"
                    style={{
                      border: isSelected ? '2px solid #8B5CF6' : '1.5px solid #EDE9FE',
                      backgroundColor: isSelected ? '#F5F3FF' : '#FFFFFF',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: isSelected ? '0 4px 16px rgba(139,92,246,0.15)' : '0 1px 4px rgba(139,92,246,0.04)',
                    }}
                  >
                    {/* Checkmark badge */}
                    {isSelected && (
                      <span
                        className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
                      >
                        <Check size={10} strokeWidth={3} color="white" />
                      </span>
                    )}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: isSelected ? '#EDE9FE' : '#F8F7FF' }}>
                      <span className="text-xl">{emoji}</span>
                    </div>
                    <p className="text-sm font-bold pr-6" style={{ color: '#1C1829' }}>{role}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6B6584' }}>{desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Confirmation text */}
            {selected.length > 0 && (
              <div className="rounded-xl px-4 py-3 mb-5 flex items-center gap-2"
                style={{ backgroundColor: '#F5F3FF', border: '1px solid #EDE9FE' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
                  <Check size={10} strokeWidth={3} color="white" />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#6D28D9' }}>
                  Selected: {selectedLabels.join(' & ')}
                </p>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex justify-between">
              <Button variant="outlined" onClick={() => navigate('/quiz')} className="gap-1.5">
                <ArrowLeft size={14} /> Back
              </Button>
              <Button
                variant="filled"
                onClick={() => navigate('/quiz/2')}
                disabled={selected.length === 0}
                className="gap-1.5"
              >
                Next <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
