import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, Clock, Lock, HelpCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const BADGES = [
  { icon: HelpCircle, label: '5 questions' },
  { icon: Clock,      label: '3 minutes' },
  { icon: Lock,       label: 'Private' },
];

export default function QuizIntro() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: '#F8F7FF' }}>
      <div className="w-full max-w-md bg-white rounded-3xl p-0 overflow-hidden"
        style={{ border: '1px solid #EDE9FE', boxShadow: '0 8px 32px rgba(139,92,246,0.10)' }}>
        {/* Gradient header */}
        <div className="flex flex-col items-center pt-10 pb-8 px-8"
          style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', boxShadow: '0 8px 20px rgba(139,92,246,0.30)' }}>
            <Target size={28} color="white" strokeWidth={2} />
          </div>
          <h1 className="text-xl font-extrabold text-center mb-2" style={{ color: '#1C1829' }}>
            Let's learn how your group works best
          </h1>
          <p className="text-sm text-center leading-relaxed" style={{ color: '#6B6584' }}>
            A quick quiz helps us divide the assignment fairly based on your strengths
          </p>
        </div>

        <div className="px-8 pb-8">
          {/* Info badges */}
          <div className="flex justify-center gap-2 mt-6 mb-7">
            {BADGES.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                style={{ backgroundColor: '#F5F3FF', borderColor: '#EDE9FE', color: '#8B5CF6' }}>
                <Icon size={11} />
                {label}
              </span>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mb-7">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium" style={{ color: '#6B6584' }}>0 of 5 answered</span>
              <span className="text-xs font-bold" style={{ color: '#8B5CF6' }}>0%</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#EDE9FE' }}>
              <div className="h-2 rounded-full" style={{ width: '0%', background: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }} />
            </div>
          </div>

          <Button variant="filled" onClick={() => navigate('/quiz/questions')} className="w-full justify-center gap-2">
            Let's go <ArrowRight size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
}
