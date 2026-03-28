import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, AlertTriangle, Sparkles, ChevronDown, ChevronUp, Calendar, Star } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import Avatar from '../components/ui/Avatar';
import Card from '../components/ui/Card';
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ backgroundColor: '#F8F7FF' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', boxShadow: '0 8px 20px rgba(139,92,246,0.30)', animation: 'pulse 1.6s ease-in-out infinite' }}>
          <Sparkles size={26} color="white" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold mb-1" style={{ color: '#1C1829' }}>Building your plan…</p>
          <p className="text-sm" style={{ color: '#A09BB8' }}>Analysing quiz responses and rubric criteria</p>
        </div>
        <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(0.95)}}`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      {/* Header banner */}
      <div className="w-full" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
        <div className="max-w-3xl mx-auto px-6 py-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} color="rgba(255,255,255,0.8)" />
              <span className="text-xs font-semibold text-white/70 uppercase tracking-widest">AI-Generated</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-1">Your Group's Task Plan</h1>
            <p className="text-sm text-white/70 max-w-sm">
              {coverageSummary || 'Tasks matched to each member based on their quiz results and skills.'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-lg" style={{ letterSpacing: '-0.04em' }}>G</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        {error && (
          <div className="rounded-2xl px-4 py-3 mb-6 flex items-start gap-3"
            style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#D97706' }} />
            <p className="text-sm font-medium flex-1" style={{ color: '#92400E' }}>{error}</p>
            <button className="text-xs font-semibold px-3 py-1 rounded-xl"
              style={{ border: '1px solid #FDE68A', color: '#D97706' }}
              onClick={fetchAllocation}>Retry</button>
          </div>
        )}

        <div className="space-y-4 mb-8">
          {allocations.map((member, idx) => {
            const color = MEMBER_COLORS[idx % MEMBER_COLORS.length];
            const isExpanded = expanded[member.member_id] !== false;
            return (
              <div key={member.member_id} className="bg-white rounded-2xl overflow-hidden"
                style={{ border: '1px solid #EDE9FE', boxShadow: '0 2px 12px rgba(139,92,246,0.06)', borderLeft: `4px solid ${color}` }}>
                {/* Member header */}
                <div className="p-5 flex items-start gap-4">
                  <Avatar name={member.member_name} color={color} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="text-sm font-extrabold" style={{ color: '#1C1829' }}>{member.member_name}</h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                        style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                        {member.role}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold text-white"
                        style={{ backgroundColor: color }}>
                        {(member.tasks || []).length} task{(member.tasks || []).length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-xs mb-0.5" style={{ color: '#6B6584' }}>{member.skill_summary}</p>
                    <p className="text-xs" style={{ color: '#A09BB8' }}>{member.availability_summary}</p>
                  </div>
                  <button onClick={() => setExpanded(e => ({ ...e, [member.member_id]: !isExpanded }))}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                    style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* Tasks */}
                {isExpanded && (member.tasks || []).length > 0 && (
                  <div className="px-5 pb-5 space-y-3">
                    <div className="h-px" style={{ backgroundColor: '#F5F3FF' }} />
                    {member.tasks.map((task, ti) => (
                      <div key={task.criterion_id + ti} className="rounded-xl p-4"
                        style={{ backgroundColor: '#FAFAFF', border: '1px solid #EDE9FE' }}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-bold" style={{ color: '#1C1829' }}>{task.title}</p>
                          {task.suggested_due_date && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                              style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                              <Calendar size={10} />
                              {task.suggested_due_date}
                            </span>
                          )}
                        </div>
                        <p className="text-xs leading-relaxed italic mb-2.5"
                          style={{ color: '#6B6584', borderLeft: '2px solid #EDE9FE', paddingLeft: 10 }}>
                          {task.rationale}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {task.criterion_name && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: '#EDE9FE', color: '#6D28D9' }}>
                              {task.criterion_name}
                            </span>
                          )}
                          {typeof task.skill_match_score === 'number' && (
                            <span className="text-xs flex items-center gap-1 font-medium" style={{ color: '#A09BB8' }}>
                              <Star size={10} /> {task.skill_match_score.toFixed(1)} match
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

        <div className="flex justify-end">
          <Button variant="filled" onClick={handleAccept}
            disabled={confirming || allocations.length === 0} className="gap-2">
            {confirming ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <>Accept Plan <ArrowRight size={15} /></>}
          </Button>
        </div>
      </main>
    </div>
  );
}
