import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import Button from '../components/ui/Button';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const PERIODS = ['morning', 'afternoon', 'evening'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PERIOD_LABELS = ['Morning', 'Afternoon', 'Evening'];

/* ── Multi-Select Roles ── */
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
            className="relative text-left rounded-2xl p-5 transition-all duration-200 focus:outline-none"
            style={{
              border: sel ? '2px solid #8B5CF6' : '1.5px solid #EDE9FE',
              backgroundColor: sel ? '#F5F3FF' : 'white',
              boxShadow: sel ? '0 4px 12px rgba(139,92,246,0.10)' : 'none',
            }}
          >
            {sel && (
              <span className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
                <Check size={12} strokeWidth={3} color="white" />
              </span>
            )}
            <p className="text-sm font-bold pr-8" style={{ color: sel ? '#6D28D9' : '#1C1829' }}>{opt.label}</p>
          </button>
        );
      })}
    </div>
  );
}

/* ── Confidence Sliders ── */
function ConfidenceSliders({ question, value = {}, onChange }) {
  const set = (tag, score) => onChange({ ...value, [tag]: Number(score) });

  return (
    <div className="space-y-7">
      {(question.options || []).map((opt) => {
        const score = value[opt.skill_tag] ?? 5;
        const pct = score * 10;
        const col = score >= 8 ? '#8B5CF6' : score >= 5 ? '#EC4899' : '#A09BB8';
        return (
          <div key={opt.skill_tag}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold" style={{ color: '#1C1829' }}>{opt.label}</span>
              <span className="text-sm font-extrabold w-9 h-9 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: col }}>
                {score}
              </span>
            </div>
            <input
              type="range" min={0} max={10} value={score}
              onChange={e => set(opt.skill_tag, e.target.value)}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, ${col} ${pct}%, #EDE9FE ${pct}%)` }}
              aria-label={`${opt.label} confidence: ${score} out of 10`}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: '#A09BB8' }}>Not confident</span>
              <span className="text-xs" style={{ color: '#A09BB8' }}>Expert</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Availability Grid ── */
function AvailabilityGrid({ value = {}, onChange }) {
  const toggle = (day, period) => {
    const key = `${day}_${period}`;
    onChange({ ...value, [key]: !value[key] });
  };
  const selectedCount = Object.values(value).filter(Boolean).length;

  return (
    <div>
      <p className="text-xs font-medium mb-3" style={{ color: '#6B6584' }}>
        Tap cells to mark when you're available ({selectedCount} selected)
      </p>
      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #EDE9FE' }}>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{ backgroundColor: '#FAFAFF' }}>
              <th className="w-24 p-2.5 text-left font-bold" style={{ color: '#A09BB8' }}>Time</th>
              {DAY_LABELS.map(d => (
                <th key={d} className="p-2 font-bold text-center" style={{ color: '#6B6584' }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period, pi) => (
              <tr key={period} style={{ borderTop: '1px solid #F3F0FF' }}>
                <td className="p-2.5 text-xs font-semibold" style={{ color: '#6B6584' }}>{PERIOD_LABELS[pi]}</td>
                {DAYS.map(day => {
                  const on = !!value[`${day}_${period}`];
                  return (
                    <td key={day} className="p-1.5 text-center">
                      <button
                        onClick={() => toggle(day, period)}
                        className="w-9 h-9 rounded-xl transition-all duration-200 focus:outline-none mx-auto block"
                        style={{
                          backgroundColor: on ? '#8B5CF6' : 'white',
                          border: on ? '2px solid #8B5CF6' : '1.5px solid #EDE9FE',
                          boxShadow: on ? '0 2px 6px rgba(139,92,246,0.25)' : 'none',
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
      <div className="flex items-center gap-5 mt-3 text-xs font-medium" style={{ color: '#6B6584' }}>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-md inline-block" style={{ backgroundColor: '#8B5CF6' }} /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-md inline-block border" style={{ borderColor: '#EDE9FE' }} /> Not selected
        </span>
      </div>
    </div>
  );
}

/* ── Preference Ranking ── */
function PreferenceRanking({ question, value = null, onChange }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {(question.options || []).map(opt => {
        const on = value === opt.skill_tag;
        return (
          <button
            key={opt.skill_tag}
            onClick={() => onChange(on ? null : opt.skill_tag)}
            className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none"
            style={{
              border: on ? '2px solid #8B5CF6' : '1.5px solid #EDE9FE',
              backgroundColor: on ? '#F5F3FF' : 'white',
              color: on ? '#6D28D9' : '#6B6584',
              fontWeight: on ? 700 : 500,
              boxShadow: on ? '0 2px 8px rgba(139,92,246,0.12)' : 'none',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Text Input ── */
function TextInput({ value = '', onChange }) {
  const MAX = 200;
  return (
    <div>
      <textarea
        value={value}
        onChange={e => e.target.value.length <= MAX && onChange(e.target.value)}
        rows={4}
        placeholder="Type your answer here…"
        className="w-full px-4 py-3.5 rounded-xl border text-sm resize-none focus:outline-none transition-all duration-200"
        style={{ borderColor: '#EDE9FE', color: '#1C1829', backgroundColor: 'white', lineHeight: 1.7 }}
        onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'; }}
        onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
      />
      <div className="flex justify-between mt-1.5">
        <span className="text-xs" style={{ color: '#A09BB8' }}>Be as specific as you like</span>
        <span className="text-xs font-semibold tabular-nums" style={{ color: value.length > MAX * 0.8 ? '#EC4899' : '#A09BB8' }}>
          {value.length}/{MAX}
        </span>
      </div>
    </div>
  );
}

/* ── Main Quiz Screen ── */
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

  /* Loading */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F7FF' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={30} className="animate-spin" style={{ color: '#8B5CF6' }} />
          <p className="text-sm font-semibold" style={{ color: '#6B6584' }}>Loading your quiz…</p>
        </div>
      </div>
    );
  }

  /* Error / no questions */
  if (fetchError || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#F8F7FF' }}>
        <div className="text-center max-w-sm bg-white rounded-2xl p-8" style={{ border: '1px solid #EDE9FE' }}>
          <p className="text-lg font-extrabold mb-2" style={{ color: '#1C1829' }}>Quiz not available yet</p>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: '#6B6584' }}>
            The project admin needs to upload the rubric first so we can generate quiz questions.
          </p>
          <Button variant="outlined" onClick={() => navigate('/quiz')}>Go Back</Button>
        </div>
      </div>
    );
  }

  const progress = Math.round(((index + 1) / total) * 100);
  const answeredCount = Object.keys(answers).length;

  const questionHints = {
    multi_select_roles: 'Pick up to 2 roles you enjoy most',
    confidence_sliders: 'Drag to rate: 0 = not confident, 10 = expert',
    availability_grid: 'Tap cells to mark when you can work',
    preference_ranking: 'Choose the one that fits you best',
    text_input: 'Share any extra context',
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10" style={{ backgroundColor: '#F8F7FF' }}>
      <div className="w-full max-w-xl">

        {/* Progress header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold" style={{ color: '#1C1829' }}>
              Question {index + 1} of {total}
            </span>
            <span className="text-sm font-extrabold tabular-nums" style={{ color: '#8B5CF6' }}>
              {progress}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE9FE' }}>
            <div className="h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }} />
          </div>
          {/* Dot indicators */}
          <div className="flex items-center gap-2 mt-3 justify-center">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setIndex(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === index ? 24 : 10,
                  height: 10,
                  backgroundColor: i < index && answers[q.id] ? '#8B5CF6' : i === index ? '#EC4899' : '#EDE9FE',
                }}
                aria-label={`Go to question ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl p-8 animate-scale-in"
          style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 24px rgba(139,92,246,0.06)' }}>

          <h2 className="text-lg font-extrabold mb-2" style={{ color: '#1C1829', lineHeight: 1.4 }}>
            {question.question_text}
          </h2>
          <p className="text-sm mb-7 font-medium" style={{ color: '#A09BB8' }}>
            {questionHints[question.question_type] || ''}
          </p>

          {question.question_type === 'multi_select_roles' && <MultiSelectRoles question={question} value={currentAnswer || []} onChange={setAnswer} />}
          {question.question_type === 'confidence_sliders' && <ConfidenceSliders question={question} value={currentAnswer || {}} onChange={setAnswer} />}
          {question.question_type === 'availability_grid' && <AvailabilityGrid value={currentAnswer || {}} onChange={setAnswer} />}
          {question.question_type === 'preference_ranking' && <PreferenceRanking question={question} value={currentAnswer ?? null} onChange={setAnswer} />}
          {question.question_type === 'text_input' && <TextInput value={currentAnswer || ''} onChange={setAnswer} />}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-10">
            <Button variant="ghost" onClick={handleBack} className="gap-1.5">
              <ArrowLeft size={15} /> Back
            </Button>
            <div className="flex items-center gap-3">
              {!isLast && (
                <button className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200"
                  style={{ color: '#A09BB8', border: '1px solid #EDE9FE' }}
                  onClick={handleNext}>
                  Skip
                </button>
              )}
              <Button variant="filled" onClick={handleNext}
                disabled={!canAdvance && question.question_type !== 'availability_grid'}
                className="gap-2 min-w-[120px] justify-center">
                {submitting
                  ? <Loader2 size={15} className="animate-spin" />
                  : isLast
                    ? <>Submit Quiz <ArrowRight size={15} /></>
                    : <>Next <ArrowRight size={15} /></>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
