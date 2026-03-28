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

const TYPE_META = {
  multi_select_roles: { icon: '🎯', label: 'Your Role',       hint: 'Pick up to two that fit you best.',         bg: '#F5F3FF', accent: '#8B5CF6' },
  confidence_sliders: { icon: '📊', label: 'Skill Check',     hint: 'Drag the sliders to rate your confidence.', bg: '#FDF2F8', accent: '#EC4899' },
  availability_grid:  { icon: '📅', label: 'Availability',    hint: "Tap the cells to mark when you're free.",   bg: '#EFF6FF', accent: '#2563EB' },
  preference_ranking: { icon: '⚡', label: 'Your Preference', hint: 'Pick the one that fits you best.',          bg: '#ECFDF5', accent: '#059669' },
  text_input:         { icon: '💬', label: 'Open Response',   hint: 'Share your thoughts in your own words.',   bg: '#FFFBEB', accent: '#D97706' },
};

function MultiSelectRoles({ question, value = [], onChange }) {
  const toggle = (tag) => {
    if (value.includes(tag)) onChange(value.filter(t => t !== tag));
    else if (value.length < 2) onChange([...value, tag]);
  };
  const ROLE_EMOJIS = { organiser: '🗂️', researcher: '🔍', writer: '✍️', designer: '🎨', presenter: '🎤' };
  return (
    <div className="grid grid-cols-2 gap-3">
      {(question.options || []).map((opt) => {
        const sel = value.includes(opt.skill_tag);
        const emoji = ROLE_EMOJIS[opt.skill_tag?.toLowerCase()] || '⭐';
        return (
          <button key={opt.skill_tag} onClick={() => toggle(opt.skill_tag)}
            className="relative text-left rounded-2xl p-4 transition-all duration-200 focus:outline-none"
            style={{
              border: sel ? '2px solid #8B5CF6' : '1.5px solid #EDE9FE',
              backgroundColor: sel ? '#F5F3FF' : 'white',
              transform: sel ? 'scale(1.03) translateY(-1px)' : 'scale(1)',
              boxShadow: sel ? '0 6px 20px rgba(139,92,246,0.18)' : '0 1px 4px rgba(139,92,246,0.05)',
            }}>
            {sel && (
              <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
                <Check size={10} strokeWidth={3} color="white" />
              </span>
            )}
            <span className="text-xl mb-2 block">{emoji}</span>
            <p className="text-sm font-bold pr-6" style={{ color: sel ? '#6D28D9' : '#1C1829' }}>{opt.label}</p>
          </button>
        );
      })}
    </div>
  );
}

function ConfidenceSliders({ question, value = {}, onChange }) {
  const set = (tag, score) => onChange({ ...value, [tag]: Number(score) });
  const getColor = (s) => {
    if (s >= 8) return { main: '#7C3AED', gradient: 'linear-gradient(90deg, #8B5CF6, #7C3AED)', bg: '#F5F3FF', badge: '#6D28D9' };
    if (s >= 6) return { main: '#8B5CF6', gradient: 'linear-gradient(90deg, #A78BFA, #8B5CF6)', bg: '#F5F3FF', badge: '#7C3AED' };
    if (s >= 4) return { main: '#EC4899', gradient: 'linear-gradient(90deg, #F9A8D4, #EC4899)', bg: '#FDF2F8', badge: '#DB2777' };
    if (s >= 2) return { main: '#F59E0B', gradient: 'linear-gradient(90deg, #FCD34D, #F59E0B)', bg: '#FFFBEB', badge: '#D97706' };
    return { main: '#A09BB8', gradient: 'linear-gradient(90deg, #D8D3F0, #A09BB8)', bg: '#F5F5F5', badge: '#6B6584' };
  };
  const getLabel = (s) => {
    if (s >= 9) return 'Expert 🏆';
    if (s >= 7) return 'Strong 💪';
    if (s >= 5) return 'Good 👍';
    if (s >= 3) return 'Basic 📚';
    if (s >= 1) return 'Learning 🌱';
    return 'None';
  };
  return (
    <div className="space-y-4">
      {(question.options || []).map((opt) => {
        const score = value[opt.skill_tag] ?? 5;
        const pct = score * 10;
        const c = getColor(score);
        return (
          <div key={opt.skill_tag} className="rounded-2xl p-4 transition-all duration-200"
            style={{ backgroundColor: c.bg, border: `1.5px solid ${c.main}25` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold" style={{ color: '#1C1829' }}>{opt.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${c.main}18`, color: c.badge }}>{getLabel(score)}</span>
                <span className="text-sm font-black w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: c.gradient, boxShadow: `0 3px 10px ${c.main}35` }}>{score}</span>
              </div>
            </div>
            <div className="relative flex items-center" style={{ height: 28 }}>
              <div className="absolute left-0 right-0 h-2.5 rounded-full"
                style={{ backgroundColor: `${c.main}15`, top: '50%', transform: 'translateY(-50%)' }} />
              <div className="absolute left-0 h-2.5 rounded-full transition-all duration-150"
                style={{ width: `${pct}%`, background: c.gradient, top: '50%', transform: 'translateY(-50%)', boxShadow: `0 2px 8px ${c.main}30` }} />
              <div className="absolute transition-all duration-150 pointer-events-none"
                style={{ left: `calc(${pct}% - 10px)`, top: '50%', transform: 'translateY(-50%)' }}>
                <div className="w-5 h-5 rounded-full bg-white border-[3px]"
                  style={{ borderColor: c.main, boxShadow: `0 2px 8px ${c.main}40, 0 0 0 4px ${c.main}10` }} />
              </div>
              <input type="range" min={0} max={10} value={score}
                onChange={e => set(opt.skill_tag, e.target.value)}
                className="absolute inset-0 w-full cursor-pointer"
                style={{ margin: 0, opacity: 0, height: 28, zIndex: 10 }} />
            </div>
            <div className="flex justify-between mt-1.5 px-0.5">
              <span className="text-[10px] font-semibold" style={{ color: '#A09BB8' }}>0 · Beginner</span>
              <span className="text-[10px] font-semibold" style={{ color: '#A09BB8' }}>10 · Expert</span>
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
                      <button onClick={() => toggle(day, period)}
                        className="w-9 h-9 rounded-xl transition-all duration-200 focus:outline-none mx-auto flex items-center justify-center"
                        style={{
                          background: on ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'white',
                          border: on ? '2px solid #8B5CF6' : '1.5px solid #EDE9FE',
                          boxShadow: on ? '0 3px 10px rgba(139,92,246,0.28)' : 'none',
                          transform: on ? 'scale(1.08)' : 'scale(1)',
                        }}>
                        {on && <Check size={12} color="white" strokeWidth={3} />}
                      </button>
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
            <span className="w-4 h-4 rounded-md inline-block" style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }} /> Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-md inline-block" style={{ border: '1.5px solid #EDE9FE', backgroundColor: 'white' }} /> Available
          </span>
        </div>
        {selectedCount > 0 && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6', border: '1px solid #EDE9FE' }}>
            {selectedCount} slot{selectedCount !== 1 ? 's' : ''} ✓
          </span>
        )}
      </div>
    </div>
  );
}

function PreferenceRanking({ question, value = null, onChange }) {
  const gradients = [
    'linear-gradient(135deg, #8B5CF6, #6366F1)',
    'linear-gradient(135deg, #EC4899, #F43F5E)',
    'linear-gradient(135deg, #0EA5E9, #06B6D4)',
  ];
  return (
    <div className="space-y-2.5">
      {(question.options || []).map((opt, i) => {
        const on = value === opt.skill_tag;
        return (
          <button key={opt.skill_tag} onClick={() => onChange(on ? null : opt.skill_tag)}
            className="w-full text-left px-4 py-4 rounded-2xl transition-all duration-200 focus:outline-none flex items-center gap-3"
            style={{
              border: on ? '2px solid #8B5CF6' : '1.5px solid #EDE9FE',
              backgroundColor: on ? '#F5F3FF' : 'white',
              boxShadow: on ? '0 4px 14px rgba(139,92,246,0.14)' : 'none',
              transform: on ? 'scale(1.01)' : 'scale(1)',
            }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: on ? gradients[i % gradients.length] : '#F5F5F5' }}>
              <span className="text-xs font-bold" style={{ color: on ? 'white' : '#A09BB8' }}>{i + 1}</span>
            </div>
            <span className="text-sm font-medium flex-1" style={{ color: on ? '#6D28D9' : '#1C1829' }}>{opt.label}</span>
            {on && (
              <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
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
      <textarea value={value}
        onChange={e => e.target.value.length <= MAX && onChange(e.target.value)}
        rows={5} placeholder="Type your answer here… be as specific as you like 😊"
        className="w-full px-4 py-3.5 rounded-2xl border text-sm resize-none focus:outline-none transition-all"
        style={{ borderColor: '#EDE9FE', color: '#1C1829', backgroundColor: 'white', lineHeight: 1.6 }}
        onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
        onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }} />
      <div className="flex justify-between mt-2 px-1">
        <span className="text-xs" style={{ color: '#A09BB8' }}>Share your thoughts freely</span>
        <span className="text-xs font-semibold" style={{ color: value.length > MAX * 0.8 ? '#EC4899' : '#A09BB8' }}>
          {value.length}/{MAX}
        </span>
      </div>
    </div>
  );
}

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
      } catch { /* demo mode */ }
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 8px 24px rgba(139,92,246,0.35)', animation: 'loadPulse 1.6s ease-in-out infinite' }}>
            <Sparkles size={26} color="white" />
          </div>
          <p className="text-base font-bold" style={{ color: '#6B6584' }}>Loading your quiz…</p>
          <style>{`@keyframes loadPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(0.93);opacity:0.8}}`}</style>
        </div>
      </div>
    );
  }

  if (fetchError || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6"
        style={{ background: 'linear-gradient(160deg, #EDE9FE 0%, #FDF2F8 55%, #E0F2FE 100%)' }}>
        <div className="text-center max-w-sm bg-white rounded-3xl p-9"
          style={{ border: '1px solid #EDE9FE', boxShadow: '0 8px 32px rgba(139,92,246,0.10)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FEF3C7' }}>
            <span className="text-3xl">📋</span>
          </div>
          <p className="text-base font-bold mb-2" style={{ color: '#1C1829' }}>Quiz not available yet</p>
          <p className="text-sm mb-6" style={{ color: '#6B6584' }}>The project admin needs to upload the rubric first.</p>
          <Button variant="outlined" onClick={() => navigate('/quiz')}>← Go back</Button>
        </div>
      </div>
    );
  }

  const meta = TYPE_META[question.question_type] || TYPE_META.text_input;
  const progress = Math.round(((index + 1) / total) * 100);

  return (
    <div className="min-h-screen flex flex-col items-center px-5 py-10"
      style={{ background: 'linear-gradient(160deg, #EDE9FE 0%, #FDF2F8 55%, #E0F2FE 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute rounded-full"
          style={{ width: 350, height: 350, top: '0%', left: '-8%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)' }} />
        <div className="absolute rounded-full"
          style={{ width: 280, height: 280, bottom: '5%', right: '-6%', background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-xl relative" style={{ zIndex: 1 }}>
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {questions.map((q, i) => (
                <span key={q.id} className="rounded-full transition-all duration-300"
                  style={{
                    width: i === index ? 22 : 8, height: 8,
                    background: i < index ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : i === index ? '#EC4899' : '#D8D3F0',
                  }} />
              ))}
            </div>
            <span className="text-xs font-bold" style={{ color: '#8B5CF6' }}>{index + 1}/{total}</span>
          </div>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
            style={{ color: '#A09BB8', border: '1px solid #EDE9FE', backgroundColor: 'white' }}
            onClick={handleNext}>Skip →</button>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden"
          style={{ border: '1px solid #EDE9FE', boxShadow: '0 8px 40px rgba(139,92,246,0.12)' }}>
          <div className="px-7 pt-7 pb-6"
            style={{ background: `linear-gradient(135deg, ${meta.bg} 0%, white 100%)`, borderBottom: '1px solid #F5F3FF' }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: `${meta.accent}12`, border: `1px solid ${meta.accent}25` }}>
              <span style={{ fontSize: 14 }}>{meta.icon}</span>
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: meta.accent }}>{meta.label}</span>
            </div>
            <h2 className="text-lg font-extrabold leading-snug mb-2" style={{ color: '#1C1829' }}>{question.question_text}</h2>
            <p className="text-sm font-medium" style={{ color: '#6B6584' }}>{meta.hint}</p>
          </div>

          <div className="px-7 pt-6 pb-7">
            {question.question_type === 'multi_select_roles' && <MultiSelectRoles question={question} value={currentAnswer || []} onChange={setAnswer} />}
            {question.question_type === 'confidence_sliders' && <ConfidenceSliders question={question} value={currentAnswer || {}} onChange={setAnswer} />}
            {question.question_type === 'availability_grid' && <AvailabilityGrid value={currentAnswer || {}} onChange={setAnswer} />}
            {question.question_type === 'preference_ranking' && <PreferenceRanking question={question} value={currentAnswer ?? null} onChange={setAnswer} />}
            {question.question_type === 'text_input' && <TextInput value={currentAnswer || ''} onChange={setAnswer} />}

            <div className="mt-7 mb-6">
              <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#EDE9FE' }}>
                <div className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', boxShadow: '0 1px 6px rgba(139,92,246,0.3)' }} />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button variant="outlined" onClick={handleBack} className="gap-1.5">
                <ArrowLeft size={14} /> Back
              </Button>
              <Button variant="filled" onClick={handleNext}
                disabled={!canAdvance && question.question_type !== 'availability_grid'}
                className="gap-1.5 min-w-[110px] justify-center">
                {submitting ? <Loader2 size={14} className="animate-spin" />
                  : isLast ? <>Submit <ArrowRight size={14} /></>
                  : <>Next <ArrowRight size={14} /></>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
