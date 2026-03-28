import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, ArrowRight, AlertTriangle, Sparkles, ChevronDown, ChevronUp,
  Calendar, RefreshCw, CheckCircle, ArrowLeftRight, X, Users, Clock,
  Zap, Timer, Shield,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');
const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1', '#DC2626', '#16A34A'];

function getInitials(name) {
  return (name || '?').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function deadlineStyle(dateStr) {
  const d = daysUntil(dateStr);
  if (d === null) return { color: '#9CA3AF', bg: '#F9FAFB', border: '#E5E7EB' };
  if (d < 0) return { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' };
  if (d <= 3) return { color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' };
  return { color: '#8B5CF6', bg: '#F5F3FF', border: '#C4B5FD' };
}

/* ── Waiting screen ─────────────────────────────────── */
function WaitingForQuiz({ members, onRefresh, refreshing }) {
  const done = members.filter(m => m.quiz_done);
  const pending = members.filter(m => !m.quiz_done);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 55%, #EC4899 100%)' }}>
        <div className="absolute pointer-events-none" style={{ top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div className="max-w-2xl mx-auto px-6 py-10 relative text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)' }}>
            <Clock size={28} color="white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
            Waiting for your team
          </h1>
          <p className="text-white/65 text-sm mb-5">
            Tasks will be allocated once everyone completes their quiz
          </p>
          {/* Progress bar */}
          <div className="max-w-xs mx-auto">
            <div className="flex justify-between text-xs font-semibold text-white/70 mb-1.5">
              <span>{done.length} done</span>
              <span>{pending.length} remaining</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: members.length ? `${(done.length / members.length) * 100}%` : '0%', backgroundColor: 'white' }} />
            </div>
            <p className="text-white/50 text-xs mt-1.5">{members.length} member{members.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
        {/* Member status grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {members.map((m, idx) => {
            const color = MEMBER_COLORS[idx % MEMBER_COLORS.length];
            return (
              <div key={m.id} className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all duration-200"
                style={{
                  border: m.quiz_done ? '1.5px solid #6EE7B7' : '1.5px solid #EDE9FE',
                  boxShadow: m.quiz_done ? '0 2px 12px rgba(16,185,129,0.08)' : '0 1px 4px rgba(0,0,0,0.03)',
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
                  {getInitials(m.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: '#111827' }}>{m.name}</p>
                  <p className="text-xs font-medium" style={{ color: m.quiz_done ? '#059669' : '#9CA3AF' }}>
                    {m.quiz_done ? '✓ Quiz completed' : 'Quiz pending…'}
                  </p>
                </div>
                {m.quiz_done
                  ? <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ECFDF5' }}>
                      <CheckCircle size={14} style={{ color: '#10B981' }} />
                    </div>
                  : <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#D1D5DB', animation: 'blink 1.4s ease infinite' }} />
                }
              </div>
            );
          })}
        </div>

        {/* Refresh */}
        <div className="text-center">
          <button onClick={onRefresh} disabled={refreshing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ backgroundColor: 'white', border: '1.5px solid #EDE9FE', color: '#8B5CF6' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C4B5FD'; e.currentTarget.style.backgroundColor = '#F5F3FF'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#EDE9FE'; e.currentTarget.style.backgroundColor = 'white'; }}>
            {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {refreshing ? 'Checking…' : 'Check status'}
          </button>
          <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>Auto-updates every 10 seconds</p>
        </div>
      </main>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

/* ── Reassign modal ─────────────────────────────────── */
function ReassignModal({ task, members, currentMemberId, onReassign, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #F5F3FF', background: 'linear-gradient(135deg,#F5F3FF,#FDF2F8)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8B5CF6' }}>Reassign Task</p>
              <p className="text-sm font-bold" style={{ color: '#1C1829' }}>{task.title}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'white', color: '#8B5CF6', border: '1px solid #EDE9FE' }}>
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <p className="text-xs font-semibold mb-1" style={{ color: '#A09BB8' }}>Move to:</p>
          {members.map((m) => {
            const isCurrent = m.id === currentMemberId;
            const color = m.color || '#8B5CF6';
            return (
              <button key={m.id}
                onClick={() => { onReassign(task, m.id, currentMemberId); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left"
                style={{ backgroundColor: isCurrent ? '#F5F3FF' : 'white', border: `1.5px solid ${isCurrent ? '#C4B5FD' : '#EDE9FE'}` }}
                onMouseEnter={e => { if (!isCurrent) { e.currentTarget.style.backgroundColor = '#FAFAFE'; e.currentTarget.style.borderColor = '#C4B5FD'; } }}
                onMouseLeave={e => { if (!isCurrent) { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#EDE9FE'; } }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
                  {getInitials(m.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#1C1829' }}>{m.name}</p>
                </div>
                {isCurrent && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EDE9FE', color: '#8B5CF6' }}>current</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Task Card ──────────────────────────────────────── */
function TaskCard({ task, memberColor, allMembers, currentMemberId, onReassign }) {
  const [showModal, setShowModal] = useState(false);
  const ds = deadlineStyle(task.suggested_due_date);
  const days = daysUntil(task.suggested_due_date);
  const daysLabel = days === null ? null : days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`;

  return (
    <>
      <div className="rounded-2xl overflow-hidden transition-all duration-200 group"
        style={{ backgroundColor: 'white', border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,92,246,0.10)'; e.currentTarget.style.borderColor = '#C4B5FD'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#EDE9FE'; }}>

        {/* Left accent */}
        <div className="flex">
          <div className="w-1 flex-shrink-0 rounded-l-2xl" style={{ backgroundColor: memberColor }} />
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-bold flex-1 leading-snug" style={{ color: '#111827' }}>{task.title}</p>
              <button onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all flex-shrink-0"
                style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#DBEAFE'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#EFF6FF'; }}>
                <ArrowLeftRight size={10} /> Change
              </button>
            </div>

            {/* Deadline badge */}
            {task.suggested_due_date && (
              <div className="flex items-center gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: ds.bg, border: `1px solid ${ds.border}` }}>
                  <Calendar size={10} style={{ color: ds.color }} />
                  <span className="text-xs font-bold" style={{ color: ds.color }}>
                    {new Date(task.suggested_due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                {daysLabel && (
                  <span className="text-xs font-semibold" style={{ color: ds.color }}>
                    {daysLabel}
                  </span>
                )}
              </div>
            )}

            {/* Rationale */}
            {task.rationale && (
              <p className="text-xs leading-relaxed mb-2.5"
                style={{ color: '#6B7280', borderLeft: `2px solid ${memberColor}40`, paddingLeft: 10 }}>
                {task.rationale}
              </p>
            )}

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              {task.criterion_name && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: '#EDE9FE', color: '#6D28D9' }}>
                  {task.criterion_name}
                </span>
              )}
              {task.stage && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: '#FDF2F8', color: '#BE185D' }}>
                  {task.stage} phase
                </span>
              )}
              <span className="text-xs font-medium" style={{ color: '#C4B5FD' }}>AI suggestion</span>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ReassignModal
          task={task} members={allMembers}
          currentMemberId={currentMemberId}
          onReassign={onReassign}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

/* ── Main ───────────────────────────────────────────── */
export default function Allocation() {
  const navigate = useNavigate();
  const { projectId } = useProject();

  const [phase, setPhase] = useState('loading'); // loading | waiting | allocating | done | error
  const [members, setMembers] = useState([]);
  const [allocations, setAllocations] = useState([]); // Use backend allocations directly
  const [coverageSummary, setCoverageSummary] = useState('');
  const [fairness, setFairness] = useState(null);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const pollRef = useRef(null);

  const checkMembers = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`${API}/projects/${projectId}/members`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.members || [];
    } catch { return null; }
  }, [projectId]);

  const runAllocation = useCallback(async (allMembers) => {
    setPhase('allocating');
    try {
      const res = await fetch(`${API}/projects/${projectId}/allocate`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCoverageSummary(data.coverage_summary || '');
      setFairness(data.fairness || null);

      // Use backend allocations DIRECTLY — no re-distribution!
      // Just add colors for display
      const colored = (data.allocations || []).map((a, idx) => ({
        ...a,
        color: MEMBER_COLORS[idx % MEMBER_COLORS.length],
      }));
      setAllocations(colored);

      const exp = {};
      colored.forEach(m => { exp[m.member_id] = true; });
      setExpanded(exp);
      setPhase('done');
    } catch {
      setError('Could not generate the allocation plan. Please try again.');
      setPhase('error');
    }
  }, [projectId]);

  const load = useCallback(async () => {
    setError(null);
    setPhase('loading');
    const allMembers = await checkMembers();
    if (!allMembers) { setPhase('error'); setError('Could not reach server.'); return; }
    setMembers(allMembers);

    const pending = allMembers.filter(m => !m.quiz_done);
    if (pending.length > 0) {
      setPhase('waiting');
      return;
    }
    await runAllocation(allMembers);
  }, [checkMembers, runAllocation]);

  // Poll while waiting
  useEffect(() => {
    if (phase === 'waiting') {
      pollRef.current = setInterval(async () => {
        const allMembers = await checkMembers();
        if (!allMembers) return;
        setMembers(allMembers);
        const pending = allMembers.filter(m => !m.quiz_done);
        if (pending.length === 0) {
          clearInterval(pollRef.current);
          runAllocation(allMembers);
        }
      }, 10_000);
    }
    return () => clearInterval(pollRef.current);
  }, [phase, checkMembers, runAllocation]);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const allMembers = await checkMembers();
    if (allMembers) {
      setMembers(allMembers);
      const pending = allMembers.filter(m => !m.quiz_done);
      if (pending.length === 0) {
        clearInterval(pollRef.current);
        runAllocation(allMembers);
      }
    }
    setRefreshing(false);
  };

  const handleReassign = useCallback((task, newMemberId, fromMemberId) => {
    setAllocations(prev =>
      prev.map(m => {
        if (m.member_id === fromMemberId) {
          return { ...m, tasks: m.tasks.filter(t => t !== task) };
        }
        if (m.member_id === newMemberId) {
          return { ...m, tasks: [...m.tasks, task] };
        }
        return m;
      })
    );
  }, []);

  const handleAccept = async () => {
    setConfirming(true);
    try {
      const res = await fetch(`${API}/projects/${projectId}/allocate/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocations }),
      });
      if (!res.ok) throw new Error();
      navigate('/dashboard');
    } catch {
      setError('Could not save the plan. Please try again.');
      setConfirming(false);
    }
  };

  // ── Loading / Allocating screens ──
  if (phase === 'loading' || phase === 'allocating') {
    const label = phase === 'loading' ? 'Checking team status…' : 'AI is matching tasks to skills…';
    const sub = phase === 'allocating' ? 'Analysing quiz answers, skills & availability' : '';
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5"
        style={{ background: 'linear-gradient(160deg, #EDE9FE 0%, #FDF2F8 55%, #E0F2FE 100%)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', boxShadow: '0 8px 24px rgba(139,92,246,0.35)', animation: 'pulse 1.6s ease-in-out infinite' }}>
          <Sparkles size={26} color="white" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold mb-1" style={{ color: '#1C1829' }}>{label}</p>
          {sub && <p className="text-sm" style={{ color: '#6B6584' }}>{sub}</p>}
        </div>
        <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(0.95)}}`}</style>
      </div>
    );
  }

  if (phase === 'waiting') {
    return <WaitingForQuiz members={members} onRefresh={handleRefresh} refreshing={refreshing} />;
  }

  const totalTasks = allocations.reduce((s, m) => s + m.tasks.length, 0);

  // Build a flat member list for the reassign modal
  const allMemberList = allocations.map(a => ({
    id: a.member_id,
    name: a.member_name,
    color: a.color,
  }));

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>

      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #EC4899 100%)' }}>
        <div className="absolute pointer-events-none" style={{ top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div className="max-w-3xl mx-auto px-6 py-8 relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} color="rgba(255,255,255,0.75)" />
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">AI-Generated Plan</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-1.5" style={{ letterSpacing: '-0.02em' }}>
              Your Group's Task Plan
            </h1>
            <p className="text-sm text-white/65 max-w-md">
              {coverageSummary || `${totalTasks} tasks split across ${allocations.length} member${allocations.length !== 1 ? 's' : ''}. Tap Change to reassign any task.`}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <Users size={12} /> {allocations.length} member{allocations.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <Zap size={12} /> {totalTasks} tasks
              </span>
              {fairness?.is_balanced && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: 'rgba(16,185,129,0.3)' }}>
                  <Shield size={12} /> Balanced
                </span>
              )}
            </div>
          </div>
          <button onClick={load}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }} title="Regenerate">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">

        {error && (
          <div className="rounded-2xl px-4 py-3 mb-5 flex items-center gap-3"
            style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <AlertTriangle size={15} style={{ color: '#D97706' }} />
            <p className="text-sm flex-1" style={{ color: '#92400E' }}>{error}</p>
            <button className="text-xs font-bold px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'white', border: '1px solid #FDE68A', color: '#D97706' }} onClick={load}>Retry</button>
          </div>
        )}

        {/* Fairness summary */}
        {fairness && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl mb-4"
            style={{ backgroundColor: fairness.is_balanced ? '#F0FDF4' : '#FEF3C7', border: `1px solid ${fairness.is_balanced ? '#BBF7D0' : '#FDE68A'}` }}>
            <Shield size={14} style={{ color: fairness.is_balanced ? '#16A34A' : '#D97706', flexShrink: 0 }} />
            <p className="text-xs font-medium" style={{ color: fairness.is_balanced ? '#15803D' : '#92400E' }}>
              <strong>Fairness:</strong> {fairness.task_count_range} tasks per member · {fairness.weight_range} weight range
              {fairness.is_balanced ? ' — well balanced ✓' : ' — consider reassigning for better balance'}
            </p>
          </div>
        )}

        {/* Tip */}
        {allocations.length > 0 && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl mb-6"
            style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <ArrowLeftRight size={13} style={{ color: '#2563EB', flexShrink: 0 }} />
            <p className="text-xs font-medium" style={{ color: '#1D4ED8' }}>
              Tap <strong>Change</strong> on any task to move it to a different team member.
            </p>
          </div>
        )}

        {allocations.length === 0 && !error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F5F3FF' }}>
              <Users size={24} style={{ color: '#C4B5FD' }} />
            </div>
            <p className="text-base font-bold mb-2" style={{ color: '#1C1829' }}>No tasks yet</p>
            <p className="text-sm" style={{ color: '#A09BB8' }}>Make sure all members have completed the quiz.</p>
          </div>
        ) : (
          <div className="space-y-5 mb-8">
            {allocations.map((member) => {
              const isExpanded = expanded[member.member_id] !== false;
              const color = member.color || MEMBER_COLORS[0];
              return (
                <div key={member.member_id} className="bg-white rounded-2xl overflow-hidden"
                  style={{ border: '1px solid #EDE9FE', boxShadow: '0 2px 12px rgba(139,92,246,0.06)', borderLeft: `4px solid ${color}` }}>
                  <div className="px-5 py-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold"
                      style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
                      {getInitials(member.member_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h2 className="text-sm font-extrabold" style={{ color: '#1C1829' }}>{member.member_name}</h2>
                        {member.role && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>{member.role}</span>}
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold text-white" style={{ backgroundColor: color }}>
                          {member.tasks.length} task{member.tasks.length !== 1 ? 's' : ''}
                        </span>
                        {member.total_weight_percent > 0 && (
                          <span className="text-xs font-semibold" style={{ color: '#A09BB8' }}>
                            ({member.total_weight_percent}% weight)
                          </span>
                        )}
                      </div>
                      {member.skill_summary && <p className="text-xs truncate" style={{ color: '#6B6584' }}>{member.skill_summary}</p>}
                      {member.availability_summary && (
                        <p className="text-xs truncate mt-0.5" style={{ color: '#A09BB8' }}>
                          <Clock size={9} className="inline mr-1" />{member.availability_summary}
                        </p>
                      )}
                    </div>
                    <button onClick={() => setExpanded(e => ({ ...e, [member.member_id]: !isExpanded }))}
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5">
                      <div className="h-px mb-4" style={{ backgroundColor: '#F5F3FF' }} />
                      {member.tasks.length === 0 ? (
                        <div className="text-center py-5 rounded-xl" style={{ border: '1px dashed #EDE9FE' }}>
                          <p className="text-xs" style={{ color: '#A09BB8' }}>No tasks — use Change on another task to move one here</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {member.tasks.map((task, ti) => (
                            <TaskCard
                              key={`${task.criterion_id}-${ti}`}
                              task={task} memberColor={color}
                              allMembers={allMemberList}
                              currentMemberId={member.member_id}
                              onReassign={handleReassign}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Accept bar */}
        {allocations.length > 0 && (
          <div className="bg-white rounded-2xl px-6 py-4 flex items-center justify-between gap-4"
            style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 20px rgba(139,92,246,0.08)' }}>
            <div>
              <p className="text-sm font-bold" style={{ color: '#1C1829' }}>Happy with the plan?</p>
              <p className="text-xs" style={{ color: '#A09BB8' }}>You can still change tasks above before accepting.</p>
            </div>
            <button onClick={handleAccept} disabled={confirming || allocations.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
              {confirming ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <>Accept Plan <ArrowRight size={14} /></>}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
