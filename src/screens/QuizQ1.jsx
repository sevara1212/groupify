import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
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
      style={{ backgroundColor: '#F8FAFC' }}>
      <div className="w-full max-w-xl">

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>
              Question 1 of 5
            </span>
            <QuizProgress current={1} />
          </div>
          <button
            className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            style={{ color: '#94A3B8' }}
            onClick={() => navigate('/quiz/2')}
          >
            Skip
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-base font-bold mb-1" style={{ color: '#0F172A' }}>
            What kind of group member are you usually?
          </h2>
          <p className="text-sm mb-5" style={{ color: '#475569' }}>
            Pick up to two that best describe you.
          </p>

          {/* Role grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {ROLES.map(({ id, emoji, role, desc }) => {
              const isSelected = selected.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggle(id)}
                  className="relative text-left rounded-xl border-2 p-4 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{
                    borderColor: isSelected ? '#2563EB' : '#E2E8F0',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                  }}
                >
                  {/* Checkmark badge */}
                  {isSelected && (
                    <span
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#2563EB' }}
                    >
                      <Check size={10} strokeWidth={3} color="white" />
                    </span>
                  )}
                  <div className="text-2xl mb-2">{emoji}</div>
                  <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{role}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{desc}</p>
                </button>
              );
            })}
          </div>

          {/* Confirmation text */}
          {selected.length > 0 && (
            <p className="text-sm mb-4 flex items-center gap-1.5" style={{ color: '#2563EB' }}>
              <Check size={13} strokeWidth={3} />
              You've selected: {selectedLabels.join(', ')}
            </p>
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
  );
}
