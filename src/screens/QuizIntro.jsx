import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, Clock, Lock, HelpCircle, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const BADGES = [
  { icon: HelpCircle, label: '5 questions', color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: Clock,      label: '~3 minutes', color: '#EC4899', bg: '#FDF2F8' },
  { icon: Lock,       label: 'Anonymous',  color: '#0D9488', bg: '#ECFDF5' },
];

const WHAT_YOU_DO = [
  'Choose your preferred roles (e.g. writing, design, research)',
  'Rate your confidence in each skill area',
  'Select your availability for the next few weeks',
];

export default function QuizIntro() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: '#F8F7FF' }}>

      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden animate-scale-in"
        style={{ border: '1px solid #EDE9FE', boxShadow: '0 12px 40px rgba(139,92,246,0.10)' }}>

        {/* Gradient header */}
        <div className="flex flex-col items-center pt-12 pb-8 px-8"
          style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)' }}>
          <div className="w-18 h-18 rounded-2xl flex items-center justify-center mb-6"
            style={{
              width: 72, height: 72,
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              boxShadow: '0 8px 24px rgba(139,92,246,0.30)',
            }}>
            <Target size={32} color="white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-extrabold text-center mb-3" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>
            Quick Skills Quiz
          </h1>
          <p className="text-sm text-center leading-relaxed max-w-xs" style={{ color: '#6B6584', lineHeight: 1.7 }}>
            Answer a few questions so we can match tasks to your team's strengths fairly
          </p>
        </div>

        <div className="px-8 pb-8">
          {/* Info badges */}
          <div className="flex justify-center gap-3 mt-6 mb-8">
            {BADGES.map(({ icon: Icon, label, color, bg }) => (
              <span key={label} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold"
                style={{ backgroundColor: bg, color }}>
                <Icon size={13} />
                {label}
              </span>
            ))}
          </div>

          {/* What you'll do */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#A09BB8' }}>
              What you'll do
            </p>
            <div className="space-y-3">
              {WHAT_YOU_DO.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: '#F5F3FF' }}>
                    <span className="text-xs font-bold" style={{ color: '#8B5CF6' }}>{i + 1}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B6584' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <Button variant="filled" onClick={() => navigate('/quiz/questions')} className="w-full justify-center gap-2.5 py-3.5 text-base">
            Start Quiz <ArrowRight size={17} />
          </Button>

          <p className="text-center text-xs mt-4 font-medium" style={{ color: '#A09BB8' }}>
            Your answers are only used to assign tasks — they're not graded
          </p>
        </div>
      </div>
    </div>
  );
}
