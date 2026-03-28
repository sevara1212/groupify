import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const PERIODS = ['morning', 'afternoon', 'evening'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PERIOD_LABELS = ['Morning', 'Afternoon', 'Evening'];
const PERIOD_ICONS = ['☀️', '🌤️', '🌙'];

const TYPE_META = {
  multi_select_roles:  { icon: '🎭', label: 'Your Role',       hint: 'Pick up to two that feel like you.',         color: '#7C3AED' },
  confidence_sliders:  { icon: '📊', label: 'Skill Check',     hint: 'Drag to show how confident you are (0–10).', color: '#2563EB' },
  availability_grid:   { icon: '📅', label: 'Availability',    hint: 'Tap the slots that work for you.',           color: '#059669' },
  preference_ranking:  { icon: '⚡', label: 'Your Preference', hint: 'Pick the one that fits best.',               color: '#D97706' },
  text_input:          { icon: '💬', label: 'Your Thoughts',   hint: 'Just type whatever comes to mind.',          color: '#DB2777' },
};

/* ── Answer components ──────────────────────────────────────────────── */

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
              border: sel ? '2px solid #7C3AED' : '1.5px solid #EDE9FE',
              backgroundColor: sel ? '#F5F3FF' : 'white',
              transform: sel ? 'scale(1.03)' : 'scale(1)',
              boxShadow: sel ? '0 6px 20px rgba(124,58,237,0.18)' : '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            {sel && (
              <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #DB2777)' }}>
                <Check size={10} strokeWidth={3} color="white" />
              </span>
            )}
            <p className="text-sm font-bold pr-6" style={{ color: sel ? '#5B21B6' : '#1C1829' }}>{opt.label}</p>
          </button>
        );
      })}
    </div>
  );
}

function ConfidenceSliders({ question, value = {}, onChange }) {
  const set = (tag, score) => onChange({ ...value, [tag]: Number(score) });

  const getColors = (s) => {
    if (s >= 8) return { fill: 'linear-gradient(90deg, #7C3AED, #4F46E5)', bg: '#EDE9FE', badge: '#6D28D9', text: '#5B21B6' };
    if (s >= 5) return { fill: 'linear-gradient(90deg, #8B5CF6, #A78BFA)', bg: '#F5F3FF', badge: '#7C3AED', text: '#6D28D9' };
    if (s >= 3) return { fill: 'linear-gradient(90deg, #EC4899, #F9A8D4)', bg: '#FDF2F8', badge: '#DB2777', text: '#BE185D' };
    return { fill: 'linear-gradient(90deg, #94A3B8, #CBD5E1)', bg: '#F8FAFC', badge: '#64748B', text: '#475569' };
  };

  const getLabel = (s) => ['None','Learning','Learning','Basic','Basic','Good','Good','Strong','Strong','Expert','Expert'][s] || 'None';

  return (
    <div className="space-y-4">
      {(question.options || []).map((opt) => {
        const score = value[opt.skill_tag] ?? 5;
        const pct = score * 10;
        const { fill, bg, badge, text } = getColors(score);
        return (
          <div key={opt.skill_tag} className="rounded-2xl p-4 transition-all duration-200"
            style={{ backgroundColor: bg, border: '1.5px solid rgba(139,92,246,0.12)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold" style={{ color: '#1C1829' }}>{opt.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: `${badge}20`, color: badge }}>
                  {getLabel(score)}
                </span>
                <span className="text-sm font-black w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: fill, boxShadow: `0 3px 10px ${badge}35` }}>
                  {score}
                </span>
              </div>
            </div>
            <div className="relative flex items-center" style={{ height: 32 }}>
              {/* Track */}
              <div className="absolute left-0 right-0 h-3 rounded-full"
                style={{ backgroundColor: 'rgba(139,92,246,0.12)', top: '50%', transform: 'translateY(-50%)' }} />
              {/* Fill */}
              <div className="absolute left-0 h-3 rounded-full transition-all duration-150"
                style={{ width: `${pct}%`, background: fill, top: '50%', transform: 'translateY(-50%)', boxShadow: `0 2px 8px ${badge}35` }} />
              {/* Thumb */}
              <div className="absolute transition-all duration-150 pointer-events-none"
                style={{ left: `calc(${pct}% - 11px)`, top: '50%', transform: 'translateY(-50%)' }}>
                <div className="w-6 h-6 rounded-full bg-white"
                  style={{ border: `3px solid ${badge}`, boxShadow: `0 2px 8px ${badge}50, 0 0 0 4px ${badge}15` }} />
              </div>
              <input type="range" min={0} max={10} value={score}
                onChange={e => set(opt.skill_tag, e.target.value)}
                className="absolute inset-0 w-full cursor-pointer"
                style={{ margin: 0, opacity: 0, height: 32, zIndex: 10 }} />
            </div>
            <div className="flex justify-between mt-1 px-0.5">
              <span className="text-[10px] font-semibold" style={{ color: '#A09BB8' }}>Not confident</span>
              <span className="text-[10px] font-semibold" style={{ color: '#A09BB8' }}>Expert</span>
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
      <div className="overflow-x-auto rounded-2xl" style={{ border: '1.5px solid #EDE9FE' }}>
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed', minWidth: 340 }}>
          <thead>
            <tr style={{ backgroundColor: '#F8F7FF' }}>
              <th className="w-24 py-3 px-3" />
              {DAY_LABELS.map(d => (
                <th key={d} className="py-3 text-center">
                  <span className="text-xs font-bold" style={{ color: '#6B6584' }}>{d}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period, pi) => (
              <tr key={period} style={{ borderTop: '1px solid #EDE9FE' }}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{PERIOD_ICONS[pi]}</span>
                    <span className="text-xs font-semibold" style={{ color: '#6B6584' }}>{PERIOD_LABELS[pi]}</span>
                  </div>
                </td>
                {DAYS.map(day => {
                  const on = !!value[`${day}_${period}`];
                  return (
                    <td key={day} className="py-2 text-center">
                      <button
                        onClick={() => toggle(day, period)}
                        className="w-9 h-9 rounded-xl transition-all duration-200 focus:outline-none mx-auto block"
                        style={{
                          background: on ? 'linear-gradient(135deg, #7C3AED, #DB2777)' : 'white',
                          border: on ? '2px solid #7C3AED' : '1.5px solid #EDE9FE',
                          boxShadow: on ? '0 3px 10px rgba(124,58,237,0.3)' : 'none',
                          transform: on ? 'scale(1.1)' : 'scale(1)',
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
      <div className="flex items-center justify-between mt-3 px-1">
        <div className="flex items-center gap-4 text-xs" style={{ color: '#6B6584' }}>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-md inline-block"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #DB2777)' }} /> Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-md inline-block"
              style={{ border: '1.5px solid #EDE9FE', backgroundColor: 'white' }} /> Available
          </span>
        </div>
        {selectedCount > 0 && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
            {selectedCount} slot{selectedCount !== 1 ? 's' : ''} picked
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
            className="w-full text-left px-4 py-4 rounded-2xl transition-all duration-200 focus:outline-none flex items-center gap-3"
            style={{
              border: on ? '2px solid #D97706' : '1.5px solid #EDE9FE',
              backgroundColor: on ? '#FFFBEB' : 'white',
              boxShadow: on ? '0 4px 16px rgba(217,119,6,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
              transform: on ? 'scale(1.01)' : 'scale(1)',
            }}
          >
            <span className="text-sm font-semibold flex-1" style={{ color: on ? '#92400E' : '#374151' }}>
              {opt.label}
            </span>
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all`}
              style={{
                borderColor: on ? '#D97706' : '#D1D5DB',
                backgroundColor: on ? '#D97706' : 'transparent',
              }}>
              {on && <Check size={10} strokeWidth={3} color="white" />}
            </span>
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
        className="w-full px-4 py-3.5 rounded-2xl text-sm resize-none focus:outline-none transition-all"
        style={{ border: '1.5px solid #EDE9FE', color: '#1C1829', backgroundColor: '#FAFAFE', lineHeight: 1.65 }}
        onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px #EDE9FE'; e.target.style.backgroundColor = 'white'; }}
        onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#FAFAFE'; }}
      />
      <div className="flex justify-between mt-1.5 px-1">
        <span className="text-xs" style={{ color: '#A09BB8' }}>Be as specific as you like</span>
        <span className="text-xs font-medium" style={{ color: value.length > MAX * 0.8 ? '#EC4899' : '#A09BB8' }}>{value.length}/{MAX}</span>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────────── */

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
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #EDE9FE 0%, #FDF2F8 55%, #E0F2FE 100%)' }}>
        <div className="bg-white rounded-3xl px-10 py-12 flex flex-col items-center gap-5"
          style={{ boxShadow: '0 20px 60px rgba(139,92,246,0.15)', border: '1px solid #EDE9FE' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #DB2777)', animation: 'quizPulse 1.4s ease-in-out infinite', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}>
            <Sparkles size={24} color="white" />
          </div>
          <div className="text-center">
            <p className="font-bold text-base" style={{ color: '#1C1829' }}>Loading your questions…</p>
            <p className="text-sm mt-1" style={{ color: '#A09BB8' }}>just a moment!</p>
          </div>
        </div>
        <style>{`@keyframes quizPulse{0%,100%{transform:scale(1)}50%{transform:scale(0.92)}}`}</style>
      </div>
    );
  }

  if (fetchError || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6"
        style={{ background: 'linear-gradient(160deg, #EDE9FE 0%, #FDF2F8 55%, #E0F2FE 100%)' }}>
        <div className="text-center max-w-sm bg-white rounded-3xl p-8"
          style={{ border: '1px solid #EDE9FE', boxShadow: '0 20px 60px rgba(139,92,246,0.12)' }}>
          <div className="text-4xl mb-4">📋</div>
          <p className="text-base font-bold mb-2" style={{ color: '#1C1829' }}>Quiz not ready yet</p>
          <p className="text-sm mb-6" style={{ color: '#6B6584' }}>The project admin needs to upload the assignment first.</p>
          <button
            onClick={() => navigate('/quiz')}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ border: '2px solid #EDE9FE', color: '#6B6584' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#8B5CF6'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#EDE9FE'}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const progress = Math.round(((index + 1) / total) * 100);
  const meta = TYPE_META[question.question_type] || TYPE_META.text_input;

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #EDE9FE 0%, #FDF2F8 55%, #E0F2FE 100%)' }}>

      {/* Top progress bar */}
      <div className="w-full h-1.5 flex-shrink-0" style={{ backgroundColor: 'rgba(196,181,253,0.3)' }}>
        <div className="h-1.5 transition-all duration-700"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #7C3AED, #DB2777)' }} />
      </div>

      <div className="flex-1 flex flex-col items-center px-5 py-8">
        <div className="w-full max-w-xl">

          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              {/* Dot indicators */}
              <div className="flex items-center gap-1.5">
                {questions.map((q, i) => (
                  <span key={q.id} className="rounded-full transition-all duration-300"
                    style={{
                      width: i === index ? 24 : 8,
                      height: 8,
                      background: i < index
                        ? 'linear-gradient(135deg, #7C3AED, #DB2777)'
                        : i === index
                          ? '#7C3AED'
                          : 'rgba(196,181,253,0.5)',
                    }} />
                ))}
              </div>
              <span className="text-sm font-bold tabular-nums" style={{ color: '#7C3AED' }}>
                {progress}%
              </span>
            </div>
            <button
              className="text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all"
              style={{ color: '#A09BB8', backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid rgba(196,181,253,0.4)' }}
              onClick={handleNext}
            >
              Skip
            </button>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(124,58,237,0.12)', border: '1px solid rgba(196,181,253,0.3)' }}>

            {/* Card header */}
            <div className="px-7 pt-7 pb-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)' }}>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-30"
                style={{ backgroundColor: meta.color + '20' }} />
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-2xl">{meta.icon}</span>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: meta.color + '15', color: meta.color }}>
                  {meta.label}
                </span>
                <span className="ml-auto text-xs font-semibold" style={{ color: '#A09BB8' }}>
                  Q{index + 1} of {total}
                </span>
              </div>
              <h2 className="text-lg font-extrabold leading-snug mb-1.5" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>
                {question.question_text}
              </h2>
              <p className="text-sm" style={{ color: '#6B6584' }}>{meta.hint}</p>
            </div>

            {/* Answer area */}
            <div className="px-7 pb-7 pt-5">
              {question.question_type === 'multi_select_roles' && <MultiSelectRoles question={question} value={currentAnswer || []} onChange={setAnswer} />}
              {question.question_type === 'confidence_sliders' && <ConfidenceSliders question={question} value={currentAnswer || {}} onChange={setAnswer} />}
              {question.question_type === 'availability_grid' && <AvailabilityGrid value={currentAnswer || {}} onChange={setAnswer} />}
              {question.question_type === 'preference_ranking' && <PreferenceRanking question={question} value={currentAnswer ?? null} onChange={setAnswer} />}
              {question.question_type === 'text_input' && <TextInput value={currentAnswer || ''} onChange={setAnswer} />}

              {/* Nav */}
              <div className="flex justify-between mt-7">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-5 py-3 rounded-2xl text-sm font-semibold transition-all"
                  style={{ border: '1.5px solid #EDE9FE', color: '#6B6584', backgroundColor: 'white' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C4B5FD'; e.currentTarget.style.color = '#7C3AED'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#EDE9FE'; e.currentTarget.style.color = '#6B6584'; }}
                >
                  <ArrowLeft size={15} /> Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canAdvance && question.question_type !== 'availability_grid'}
                  className="flex items-center gap-1.5 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all min-w-[110px] justify-center disabled:opacity-40"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
                    boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                  }}
                  onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {submitting
                    ? <Loader2 size={15} className="animate-spin" />
                    : isLast
                      ? <>Submit <ArrowRight size={15} /></>
                      : <>Next <ArrowRight size={15} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
