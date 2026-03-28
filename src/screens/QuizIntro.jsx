import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, Clock, Lock, HelpCircle, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';

const BADGES = [
  { icon: HelpCircle, label: '5 questions', color: '#8B5CF6' },
  { icon: Clock,      label: '3 minutes',   color: '#EC4899' },
  { icon: Lock,       label: 'Private',     color: '#6366F1' },
];

const WHAT_WE_LEARN = [
  { emoji: '🎯', text: 'Your preferred roles in a group' },
  { emoji: '💪', text: 'Your skill confidence levels' },
  { emoji: '📅', text: 'When you are available to work' },
];

export default function QuizIntro() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: '#F8F7FF' }}>
      <div className="w-full max-w-md bg-white rounded-3xl p-0 overflow-hidden"
        style={{ border: '1px solid #EDE9FE', boxShadow: '0 8px 32px rgba(139,92,246,0.10)' }}>
        {/* Gradient header */}
        <div className="flex flex-col items-center pt-10 pb-8 px-8 relative"
          style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 50%, #F5F3FF 100%)' }}>
          {/* Decorative dots */}
          <div className="absolute top-4 left-4 w-2 h-2 rounded-full" style={{ backgroundColor: '#EDE9FE' }} />
          <div className="absolute top-8 right-6 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FBCFE8' }} />
          <div className="absolute bottom-6 left-8 w-1 h-1 rounded-full" style={{ backgroundColor: '#C4B5FD' }} />
          
          <div className="w-18 h-18 rounded-2xl flex items-center justify-center mb-5 relative"
            style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', boxShadow: '0 8px 24px rgba(139,92,246,0.35)' }}>
            <Target size={30} color="white" strokeWidth={2} />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: '2px solid white' }}>
              <Sparkles size={10} color="white" />
            </div>
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
          <div className="flex justify-center gap-2 mt-6 mb-6">
            {BADGES.map(({ icon: Icon, label, color }) => (
              <span key={label} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold"
                style={{ backgroundColor: `${color}10`, border: `1px solid ${color}20`, color }}>
                <Icon size={12} />
                {label}
              </span>
            ))}
          </div>

          {/* What we learn */}
          <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: '#FAFAFF', border: '1px solid #EDE9FE' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#8B5CF6' }}>What we'll learn</p>
            <div className="space-y-2.5">
              {WHAT_WE_LEARN.map(({ emoji, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <span className="text-base">{emoji}</span>
                  <span className="text-sm font-medium" style={{ color: '#1C1829' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium" style={{ color: '#6B6584' }}>0 of 5 answered</span>
              <span className="text-xs font-bold" style={{ color: '#8B5CF6' }}>0%</span>
            </div>
            <div className="w-full h-2.5 rounded-full" style={{ backgroundColor: '#EDE9FE' }}>
              <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: '0%', background: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }} />
            </div>
          </div>

          <Button variant="filled" onClick={() => navigate('/quiz/questions')} className="w-full justify-center gap-2 py-3.5 text-base">
            Let's go <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
