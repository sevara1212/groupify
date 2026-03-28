import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, AlertTriangle, Sparkles, ChevronDown, ChevronUp, Calendar, Star, RefreshCw } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');
const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1'];

export default function Allocation() {
  const navigate = useNavigate();
  const { projectId } = useProject();

  const [allocations, setAllocations] = useState([]);
  const [coverageSummary, setCoverageSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [expanded, setExpanded] = useState({});

  const fetchAllocation = () => {
    setLoading(true); setError(null);
    fetch(`${API}/projects/${projectId}/allocate`, { method: 'POST' })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setAllocations(data.allocations || []); setCoverageSummary(data.coverage_summary || ''); })
      .catch(() => setError('Could not generate the allocation plan. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAllocation();
    setExpanded({});
  }, [projectId]);

  const handleAccept = async () => {
    setConfirming(true);
    try {
      const res = await fetch(`${API}/projects/${projectId}/allocate/confirm`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocations }),
      });
      if (!res.ok) throw new Error();
      navigate('/dashboard');
    } catch {
      setError('Could not save the plan. Please try again.');
      setConfirming(false);
    }
  };

  /* Loading state */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ backgroundColor: '#F8F7FF' }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            boxShadow: '0 8px 24px rgba(139,92,246,0.30)',
            animation: 'pulse 1.6s ease-in-out infinite',
          }}>
          <Sparkles size={32} color="white" />
        </div>
        <div className="text-center">
          <p className="text-lg font-extrabold mb-1" style={{ color: '#1C1829' }}>Generating your plan…</p>
          <p className="text-sm font-medium" style={{ color: '#6B6584' }}>Analysing quiz responses and rubric criteria</p>
        </div>
      </div>
    );
  }

  const totalTasks = allocations.reduce((s, m) => s + (m.tasks || []).length, 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      {/* Gradient Header Banner */}
      <div className="w-full" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
        <div className="max-w-3xl mx-auto px-6 py-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} color="rgba(255,255,255,0.8)" />
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">AI-Generated Plan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
              Your Group's Task Plan
            </h1>
            <p className="text-sm text-white/70 max-w-md leading-relaxed">
              {coverageSummary || 'Tasks matched to each member based on their skills, availability, and rubric criteria.'}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 mt-1">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">{allocations.length}</p>
              <p className="text-xs text-white/60 font-semibold">members</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">{totalTasks}</p>
              <p className="text-xs text-white/60 font-semibold">tasks</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        {/* Error */}
        {error && (
          <div className="rounded-2xl px-5 py-4 mb-6 flex items-start gap-3 animate-slide-down"
            style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" style={{ color: '#D97706' }} />
            <p className="text-sm font-semibold flex-1" style={{ color: '#92400E' }}>{error}</p>
            <button className="text-xs font-bold px-4 py-2 rounded-xl"
              style={{ border: '1px solid #FDE68A', color: '#D97706', backgroundColor: 'white' }}
              onClick={fetchAllocation}>Retry</button>
          </div>
        )}

        {/* Member allocation cards */}
        <div className="space-y-4 mb-10">
          {allocations.map((member, idx) => {
            const color = MEMBER_COLORS[idx % MEMBER_COLORS.length];
            const isExpanded = expanded[member.member_id] !== false;
            const taskCount = (member.tasks || []).length;

            return (
              <div key={member.member_id}
                className="bg-white rounded-2xl overflow-hidden transition-all duration-200"
                style={{ border: '1px solid #EDE9FE', boxShadow: '0 2px 12px rgba(139,92,246,0.06)', borderLeft: `4px solid ${color}` }}>

                {/* Member header */}
                <button
                  className="w-full p-5 flex items-start gap-4 text-left"
                  onClick={() => setExpanded(e => ({ ...e, [member.member_id]: !isExpanded }))}
                >
                  <Avatar name={member.member_name} color={color} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h2 className="text-base font-extrabold" style={{ color: '#1C1829' }}>{member.member_name}</h2>
                      <span className="text-xs px-3 py-1 rounded-full font-bold"
                        style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                        {member.role}
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full font-bold text-white"
                        style={{ backgroundColor: color }}>
                        {taskCount} task{taskCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-sm mb-0.5 font-medium" style={{ color: '#6B6584' }}>{member.skill_summary}</p>
                    <p className="text-xs" style={{ color: '#A09BB8' }}>{member.availability_summary}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Tasks */}
                {isExpanded && taskCount > 0 && (
                  <div className="px-5 pb-5 space-y-3">
                    <div className="h-px" style={{ backgroundColor: '#F3F0FF' }} />
                    {member.tasks.map((task, ti) => (
                      <div key={task.criterion_id + ti} className="rounded-xl p-5 transition-all duration-200"
                        style={{ backgroundColor: '#FAFAFF', border: '1px solid #EDE9FE' }}>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <p className="text-sm font-bold" style={{ color: '#1C1829' }}>{task.title}</p>
                          {task.suggested_due_date && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                              <Calendar size={11} /> {task.suggested_due_date}
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed italic mb-3"
                          style={{ color: '#6B6584', borderLeft: '3px solid #EDE9FE', paddingLeft: 12, lineHeight: 1.7 }}>
                          {task.rationale}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {task.criterion_name && (
                            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                              style={{ backgroundColor: '#EDE9FE', color: '#6D28D9' }}>
                              {task.criterion_name}
                            </span>
                          )}
                          {typeof task.skill_match_score === 'number' && (
                            <span className="text-xs flex items-center gap-1 font-semibold" style={{ color: '#A09BB8' }}>
                              <Star size={11} fill="#FDE68A" stroke="#D97706" /> {task.skill_match_score.toFixed(1)} match
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={fetchAllocation} className="gap-2 text-sm">
            <RefreshCw size={14} /> Regenerate
          </Button>
          <Button variant="filled" onClick={handleAccept}
            disabled={confirming || allocations.length === 0} className="gap-2 px-7">
            {confirming ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <>Accept Plan <ArrowRight size={16} /></>}
          </Button>
        </div>
      </main>
    </div>
  );
}
