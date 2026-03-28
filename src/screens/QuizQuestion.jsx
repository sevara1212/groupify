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
            className="relative text-left rounded-2xl p-4 transition-all focus:outline-none"
            style={{
              border: sel ? '2px solid #8B5CF6' : '1px solid #EDE9FE',
              backgroundColor: sel ? '#F5F3FF' : 'white',
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
        return (
          <div key={opt.skill_tag}>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-semibold" style={{ color: '#1C1829' }}>{opt.label}</span>
              <span className="text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                style={{ backgroundColor: col }}>
                {score}
              </span>
            </div>
            <input
              type="range" min={0} max={10} value={score}
              onChange={e => set(opt.skill_tag, e.target.value)}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, ${col} ${pct}%, #EDE9FE ${pct}%)` }}
            />
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="w-24 pb-2" />
            {DAY_LABELS.map(d => (
              <th key={d} className="pb-2 font-semibold text-center" style={{ color: '#6B6584' }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((period, pi) => (
            <tr key={period}>
              <td className="pr-3 py-1.5 text-xs font-medium" style={{ color: '#6B6584' }}>{PERIOD_LABELS[pi]}</td>
              {DAYS.map(day => {
                const on = !!value[`${day}_${period}`];
                return (
                  <td key={day} className="py-1 text-center">
                    <button
                      onClick={() => toggle(day, period)}
                      className="w-8 h-8 rounded-xl transition-all focus:outline-none mx-auto block"
                      style={{
                        backgroundColor: on ? '#8B5CF6' : 'white',
                        border: on ? '2px solid #8B5CF6' : '1px solid #EDE9FE',
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
      <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: '#6B6584' }}>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#8B5CF6' }} /> Preferred
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block border" style={{ borderColor: '#EDE9FE' }} /> Available
        </span>
      </div>
    </div>
  );
}

function PreferenceRanking({ question, value = null, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(question.options || []).map(opt => {
        const on = value === opt.skill_tag;
        return (
          <button
            key={opt.skill_tag}
            onClick={() => onChange(on ? null : opt.skill_tag)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none"
            style={{
              border: on ? '2px solid #8B5CF6' : '1px solid #EDE9FE',
              backgroundColor: on ? '#F5F3FF' : 'white',
              color: on ? '#6D28D9' : '#6B6584',
              fontWeight: on ? 600 : 500,
            }}
          >
            {opt.label}
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
      <p className="text-xs mt-1 text-right" style={{ color: '#A09BB8' }}>{value.length}/{MAX}</p>
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
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin" style={{ color: '#8B5CF6' }} />
          <p className="text-sm font-medium" style={{ color: '#6B6584' }}>Loading quiz…</p>
        </div>
      </div>
    );
  }

  if (fetchError || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#F8F7FF' }}>
        <div className="text-center max-w-sm">
          <p className="text-base font-bold mb-2" style={{ color: '#1C1829' }}>Quiz not available yet</p>
          <p className="text-sm mb-4" style={{ color: '#6B6584' }}>The project admin needs to upload the rubric first.</p>
          <Button variant="outlined" onClick={() => navigate('/quiz')}>Go back</Button>
        </div>
      </div>
    );
  }

  const progress = Math.round((index / total) * 100);

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10" style={{ backgroundColor: '#F8F7FF' }}>
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold" style={{ color: '#1C1829' }}>Question {index + 1}/{total}</span>
            <div className="flex items-center gap-1.5">
              {questions.map((q, i) => (
                <span key={q.id} className="rounded-full transition-all"
                  style={{
                    width: i === index ? 20 : 8, height: 8,
                    backgroundColor: i < index ? '#8B5CF6' : i === index ? '#EC4899' : '#EDE9FE',
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
        <div className="bg-white rounded-2xl p-7" style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 24px rgba(139,92,246,0.06)' }}>
          <h2 className="text-base font-extrabold mb-1" style={{ color: '#1C1829' }}>{question.question_text}</h2>
          <p className="text-sm mb-6" style={{ color: '#A09BB8' }}>
            {question.question_type === 'multi_select_roles' && 'Pick up to two.'}
            {question.question_type === 'confidence_sliders' && '0 = not confident · 10 = expert'}
            {question.question_type === 'availability_grid' && 'Tap cells to mark preferred slots.'}
          </p>

          {question.question_type === 'multi_select_roles' && <MultiSelectRoles question={question} value={currentAnswer || []} onChange={setAnswer} />}
          {question.question_type === 'confidence_sliders' && <ConfidenceSliders question={question} value={currentAnswer || {}} onChange={setAnswer} />}
          {question.question_type === 'availability_grid' && <AvailabilityGrid value={currentAnswer || {}} onChange={setAnswer} />}
          {question.question_type === 'preference_ranking' && <PreferenceRanking question={question} value={currentAnswer ?? null} onChange={setAnswer} />}
          {question.question_type === 'text_input' && <TextInput value={currentAnswer || ''} onChange={setAnswer} />}

          <div className="flex justify-between mt-8">
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
  );
}
