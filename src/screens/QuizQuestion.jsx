import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import Button from '../components/ui/Button';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const PERIODS = ['morning', 'afternoon', 'evening'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PERIOD_LABELS = ['Morning', 'Afternoon', 'Evening'];
const PERIOD_ICONS = ['☀️', '🌤️', '🌙'];

/* ─── Sub-components ──────────────────────────────── */

function MultiSelectRoles({ question, value = [], onChange }) {
  const toggle = (tag) => {
    if (value.includes(tag)) onChange(value.filter(t => t !== tag));
    else if (value.length < 2) onChange([...value, tag]);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {(question.options || []).map((opt) => {
        const sel = value.includes(opt.skill_tag);
        return (
          <button
            key={opt.skill_tag}
            onClick={() => toggle(opt.skill_tag)}
            className="relative text-left rounded-2xl p-4 transition-all duration-200 focus:outline-none"
            style={{
              border: sel ? '2px solid #8B5CF6' : '1.5px solid #EDE9FE',
              backgroundColor: sel ? '#F5F3FF' : 'white',
              transform: sel ? 'scale(1.02)' : 'scale(1)',
              boxShadow: sel ? '0 4px 16px rgba(139,92,246,0.15)' : '0 1px 4px rgba(139,92,246,0.04)',
            }}
          >
            {sel && (
              <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
                <Check size={10} strokeWidth={3} color="white" />
              </span>
            )}
            <p className="text-sm font-bold pr-6" style={{ color: '#1C1829' }}>{opt.label}</p>
          </button>
        );
      })}
    </div>
  );
}

function ConfidenceSliders({ question, value = {}, onChange }) {
  const set = (tag, score) => onChange({ ...value, [tag]: Number(score) });

  return (
    <div className="space-y-6">
      {(question.options || []).map((opt) => {
        const score = value[opt.skill_tag] ?? 5;
        const pct = score * 10;
        const col = score >= 8 ? '#8B5CF6' : score >= 5 ? '#EC4899' : '#A09BB8';
        const label = score >= 9 ? 'Expert' : score >= 7 ? 'Strong' : score >= 5 ? 'Good' : score >= 3 ? 'Basic' : 'Learning';
        return (
          <div key={opt.skill_tag}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold" style={{ color: '#1C1829' }}>{opt.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: '#A09BB8' }}>{label}</span>
                <span className="text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: col, boxShadow: `0 2px 8px ${col}40` }}>
                  {score}
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE9FE' }}>
                <div className="h-2 rounded-full transition-all duration-150"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${col}, ${col}90)` }} />
              </div>
              <input
                type="range" min={0} max={10} value={score}
                onChange={e => set(opt.skill_tag, e.target.value)}
                className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                style={{ margin: 0 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AvailabilityGrid({ value = {}, onChange }) {
  const toggle = (day, period) => {
    const key = `${day}_${period}`;
    onChange({ ...value, [key]: !value[key] });
  };

  const selectedCount = Object.values(value).filter(Boolean).length;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th className="w-24 pb-3" />
              {DAY_LABELS.map(d => (
                <th key={d} className="pb-3 text-center">
                  <span className="text-xs font-bold" style={{ color: '#6B6584' }}>{d}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period, pi) => (
              <tr key={period}>
                <td className="pr-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{PERIOD_ICONS[pi]}</span>
                    <span className="text-xs font-semibold" style={{ color: '#6B6584' }}>{PERIOD_LABELS[pi]}</span>
                  </div>
                </td>
                {DAYS.map(day => {
                  const on = !!value[`${day}_${period}`];
                  return (
                    <td key={day} className="py-1.5 text-center">
                      <button
                        onClick={() => toggle(day, period)}
                        className="w-9 h-9 rounded-xl transition-all duration-200 focus:outline-none mx-auto block"
                        style={{
                          background: on ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'white',
                          border: on ? '2px solid #8B5CF6' : '1.5px solid #EDE9FE',
                          boxShadow: on ? '0 2px 8px rgba(139,92,246,0.25)' : 'none',
                          transform: on ? 'scale(1.05)' : 'scale(1)',
                        }}
                        aria-label={`${PERIOD_LABELS[pi]} ${DAY_LABELS[DAYS.indexOf(day)]} ${on ? 'selected' : ''}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-4 text-xs" style={{ color: '#6B6584' }}>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-md inline-block" style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }} /> Preferred
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-md inline-block" style={{ border: '1.5px solid #EDE9FE', backgroundColor: 'white' }} /> Available
          </span>
        </div>
        {selectedCount > 0 && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
            {selectedCount} slot{selectedCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

function PreferenceRanking({ question, value = null, onChange }) {
  return (
    <div className="space-y-2.5">
      {(question.options || []).map(opt => {
        const on = value === opt.skill_tag;
        return (
          <button
            key={opt.skill_tag}
            onClick={() => onChange(on ? null : opt.skill_tag)}
            className="w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 focus:outline-none flex items-center gap-3"
            style={{
              border: on ? '2px solid #8B5CF6' : '1.5px solid #EDE9FE',
              backgroundColor: on ? '#F5F3FF' : 'white',
              boxShadow: on ? '0 2px 12px rgba(139,92,246,0.12)' : 'none',
            }}
          >
            <span className="text-sm font-medium" style={{ color: on ? '#6D28D9' : '#6B6584' }}>
              {opt.label}
            </span>
            {on && (
              <span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
                <Check size={10} strokeWidth={3} color="white" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function TextInput({ value = '', onChange }) {
  const MAX = 200;
  return (
    <div>
      <textarea
        value={value}
        onChange={e => e.target.value.length <= MAX && onChange(e.target.value)}
        rows={4}
        placeholder="Type your answer here…"
        className="w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none transition-all"
        style={{ borderColor: '#EDE9FE', color: '#1C1829', backgroundColor: 'white' }}
        onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px #EDE9FE'; }}
        onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
      />
      <div className="flex justify-between mt-1.5">
        <span className="text-xs" style={{ color: '#A09BB8' }}>Be as specific as you like</span>
        <span className="text-xs font-medium" style={{ color: value.length > MAX * 0.8 ? '#EC4899' : '#A09BB8' }}>{value.length}/{MAX}</span>
      </div>
    </div>
  );
}

/* ─── Question type metadata ──────────────────────── */

const TYPE_META = {
  multi_select_roles: { icon: '🎯', label: 'Your Role', hint: 'Pick up to two.' },
  confidence_sliders: { icon: '📊', label: 'Skill Assessment', hint: '0 = not confident · 10 = expert' },
  availability_grid: { icon: '📅', label: 'Availability', hint: 'Tap cells to mark preferred slots.' },
  preference_ranking: { icon: '⚡', label: 'Preference', hint: 'Choose the one that fits best.' },
  text_input: { icon: '💬', label: 'Open Response', hint: 'Share your thoughts in your own words.' },
};

/* ─── Main Component ──────────────────────────────── */

export default function QuizQuestion() {
  const navigate = useNavigate();
  const { projectId, currentMemberId } = useProject();
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch(`${API}/projects/${projectId}/quiz/questions`)
      .then(r => r.json())
      .then(data => setQuestions(data.questions || []))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [projectId]);

  const question = questions[index];
  const total = questions.length || 5;
  const isLast = index === questions.length - 1;
  const currentAnswer = answers[question?.id];
  const setAnswer = useCallback(val => setAnswers(prev => ({ ...prev, [question.id]: val })), [question]);

  const handleNext = async () => {
    if (isLast) {
      setSubmitting(true);
      const payload = { answers: Object.entries(answers).map(([question_id, answer]) => ({ question_id, answer })) };
      const memberId = currentMemberId || 'demo-member';
      try {
        await fetch(`${API}/projects/${projectId}/quiz/answers/${memberId}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
      } catch { /* proceed in demo mode */ }
      navigate('/quiz/processing');
    } else {
      setIndex(i => i + 1);
    }
  };
  const handleBack = () => index > 0 ? setIndex(i => i - 1) : navigate('/quiz');

  const canAdvance = (() => {
    if (!question) return false;
    const ans = currentAnswer;
    switch (question.question_type) {
      case 'multi_select_roles': return Array.isArray(ans) && ans.length > 0;
      case 'confidence_sliders': return typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0;
      case 'availability_grid': return true;
      case 'preference_ranking': return ans !== null && ans !== undefined;
      case 'text_input': return typeof ans === 'string' && ans.trim().length > 0;
      default: return true;
    }
  })();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F7FF' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', boxShadow: '0 8px 20px rgba(139,92,246,0.30)', animation: 'pulse 1.6s ease-in-out infinite' }}>
            <Sparkles size={22} color="white" />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#6B6584' }}>Loading quiz…</p>
          <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(0.95);opacity:0.8}}`}</style>
        </div>
      </div>
    );
  }

  if (fetchError || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#F8F7FF' }}>
        <div className="text-center max-w-sm bg-white rounded-3xl p-8"
          style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 24px rgba(139,92,246,0.08)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#FEF3C7' }}>
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-base font-bold mb-2" style={{ color: '#1C1829' }}>Quiz not available yet</p>
          <p className="text-sm mb-5" style={{ color: '#6B6584' }}>The project admin needs to upload the rubric first.</p>
          <Button variant="outlined" onClick={() => navigate('/quiz')}>Go back</Button>
        </div>
      </div>
    );
  }

  const progress = Math.round(((index + 1) / total) * 100);
  const meta = TYPE_META[question.question_type] || TYPE_META.text_input;

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10" style={{ backgroundColor: '#F8F7FF' }}>
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold" style={{ color: '#1C1829' }}>Question {index + 1}/{total}</span>
            <div className="flex items-center gap-1.5">
              {questions.map((q, i) => (
                <span key={q.id} className="rounded-full transition-all duration-300"
                  style={{
                    width: i === index ? 20 : 8, height: 8,
                    background: i < index ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : i === index ? '#EC4899' : '#EDE9FE',
                  }} />
              ))}
            </div>
            <span className="text-sm font-bold tabular-nums" style={{ color: '#8B5CF6' }}>{progress}%</span>
          </div>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
            style={{ color: '#A09BB8', border: '1px solid #EDE9FE' }}
            onClick={handleNext}>Skip</button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl overflow-hidden"
          style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 24px rgba(139,92,246,0.08)' }}>
          
          {/* Card header */}
          <div className="px-7 pt-7 pb-5"
            style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">{meta.icon}</span>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8B5CF6' }}>{meta.label}</span>
            </div>
            <h2 className="text-lg font-extrabold mb-1" style={{ color: '#1C1829' }}>{question.question_text}</h2>
            <p className="text-sm" style={{ color: '#6B6584' }}>{meta.hint}</p>
          </div>

          <div className="px-7 pb-7 pt-5">
            {question.question_type === 'multi_select_roles' && <MultiSelectRoles question={question} value={currentAnswer || []} onChange={setAnswer} />}
            {question.question_type === 'confidence_sliders' && <ConfidenceSliders question={question} value={currentAnswer || {}} onChange={setAnswer} />}
            {question.question_type === 'availability_grid' && <AvailabilityGrid value={currentAnswer || {}} onChange={setAnswer} />}
            {question.question_type === 'preference_ranking' && <PreferenceRanking question={question} value={currentAnswer ?? null} onChange={setAnswer} />}
            {question.question_type === 'text_input' && <TextInput value={currentAnswer || ''} onChange={setAnswer} />}

            {/* Progress indicator */}
            <div className="mt-6 mb-6">
              <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#EDE9FE' }}>
                <div className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }} />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outlined" onClick={handleBack} className="gap-1.5">
                <ArrowLeft size={14} /> Back
              </Button>
              <Button variant="filled" onClick={handleNext}
                disabled={!canAdvance && question.question_type !== 'availability_grid'}
                className="gap-1.5 min-w-[100px] justify-center">
                {submitting
                  ? <Loader2 size={14} className="animate-spin" />
                  : isLast
                    ? <>Submit <ArrowRight size={14} /></>
                    : <>Next <ArrowRight size={14} /></>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
