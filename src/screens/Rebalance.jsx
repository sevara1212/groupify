import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Check, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'https://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');
const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1'];

export default function Rebalance() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useProject();
  const { task_id, from_member_id } = location.state || {};

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!task_id || !from_member_id) { navigate('/risk-alerts', { replace: true }); return; }
    fetch(`${API}/projects/${projectId}/rebalance`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id, from_member_id }),
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setPlan)
      .catch(() => setError('Could not generate rebalance plan.'))
      .finally(() => setLoading(false));
  }, [projectId, task_id, from_member_id]);

  const handleApply = async () => {
    if (!plan) return;
    setConfirming(true);
    try {
      const res = await fetch(`${API}/projects/${projectId}/rebalance/confirm`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
      if (!res.ok) throw new Error();
      navigate('/dashboard', { state: { rebalanced: true } });
    } catch {
      setError('Could not apply the plan. Please try again.');
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ backgroundColor: '#F8F7FF' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 8px 20px rgba(139,92,246,0.3)', animation: 'pulse 1.4s ease-in-out infinite' }}>
          <Loader2 size={22} color="white" className="animate-spin" />
        </div>
        <p className="text-sm font-medium" style={{ color: '#6B6584' }}>Calculating rebalance plan…</p>
        <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(0.95)}}`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
        <h1 className="text-2xl font-extrabold mb-1" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>
          Rebalance Tasks
        </h1>
        <p className="text-sm mb-7" style={{ color: '#6B6584' }}>
          Review the proposed reassignment before applying.
        </p>

        {error && (
          <div className="rounded-2xl px-4 py-3 mb-6 flex items-start gap-3"
            style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#D97706' }} />
            <p className="text-sm font-medium" style={{ color: '#92400E' }}>{error}</p>
          </div>
        )}

        {plan && (
          <div className="space-y-4">
            {/* Before / After */}
            <div className="grid grid-cols-2 gap-4">
              {/* Before */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#92400E' }}>
                  Current
                </p>
                <div className="flex items-center gap-3">
                  <Avatar name={plan.original_member?.name || '?'} color="#D97706" size="md" />
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#1C1829' }}>{plan.original_member?.name}</p>
                    <p className="text-xs" style={{ color: '#92400E' }}>Currently assigned</p>
                  </div>
                </div>
              </div>

              {/* After */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: '#F5F3FF', border: '1px solid #C4B5FD' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#6D28D9' }}>
                  Proposed ✦
                </p>
                <div className="space-y-3">
                  {(plan.proposed || []).map((p, idx) => (
                    <div key={p.member_id} className="flex items-start gap-3">
                      <Avatar name={p.member_name} color={MEMBER_COLORS[idx % MEMBER_COLORS.length]} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold" style={{ color: '#1C1829' }}>{p.member_name}</p>
                        <p className="text-xs truncate" style={{ color: '#6B6584' }}>{p.section}</p>
                        {p.estimated_completion_date && (
                          <span className="inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ backgroundColor: '#EDE9FE', color: '#8B5CF6' }}>
                            <Calendar size={9} /> {p.estimated_completion_date}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rubric impact */}
            {plan.rubric_impact && (
              <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#E0F2FE', border: '1px solid #BAE6FD', color: '#0369A1' }}>
                <p className="text-sm">{plan.rubric_impact}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="filled" onClick={handleApply} disabled={confirming} className="gap-2">
                {confirming
                  ? <><Loader2 size={14} className="animate-spin" /> Applying…</>
                  : <><Check size={14} /> Apply Updated Plan</>}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
