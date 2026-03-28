import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, ArrowRight, AlertTriangle, Sparkles, ChevronDown, ChevronUp,
  Calendar, RefreshCw, CheckCircle, ArrowLeftRight, X, Users,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');
const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1', '#DC2626', '#16A34A'];

/* ── Distribute tasks equally across members ──────── */
function distributeEqually(rawAllocations, allMembers) {
  // Flatten all tasks from the raw allocation
  const allTasks = rawAllocations.flatMap(a =>
    (a.tasks || []).map(t => ({ ...t, _originalMember: a.member_name }))
  );

  // Use members who completed the quiz; fall back to all members
  const eligible = allMembers.filter(m => m.quiz_done);
  const pool = eligible.length > 0 ? eligible : allMembers;
  if (pool.length === 0) return rawAllocations; // nothing to work with

  // Round-robin distribute
  const buckets = {};
  pool.forEach(m => { buckets[m.id] = []; });
  allTasks.forEach((task, i) => {
    const member = pool[i % pool.length];
    buckets[member.id].push(task);
  });

  return pool.map((m, idx) => ({
    member_id: m.id,
    member_name: m.name,
    role: rawAllocations.find(a => a.member_id === m.id)?.role || 'Member',
    skill_summary: rawAllocations.find(a => a.member_id === m.id)?.skill_summary || '',
    availability_summary: rawAllocations.find(a => a.member_id === m.id)?.availability_summary || '',
    tasks: buckets[m.id],
    color: MEMBER_COLORS[idx % MEMBER_COLORS.length],
  }));
}

/* ── Reassign modal ────────────────────────────────── */
function ReassignModal({ task, members, currentMemberId, onReassign, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #F5F3FF' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8B5CF6' }}>Reassign Task</p>
              <p className="text-sm font-bold" style={{ color: '#1C1829' }}>{task.title}</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Member list */}
        <div className="p-4 space-y-2">
          <p className="text-xs font-semibold mb-3" style={{ color: '#A09BB8' }}>Select who should do this task:</p>
          {members.map((m, idx) => {
            const isCurrent = m.id === currentMemberId;
            const color = MEMBER_COLORS[idx % MEMBER_COLORS.length];
            return (
              <button key={m.id}
                onClick={() => { onReassign(task, m.id); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left"
                style={{
                  backgroundColor: isCurrent ? '#F5F3FF' : 'white',
                  border: isCurrent ? '1.5px solid #C4B5FD' : '1.5px solid #EDE9FE',
                }}
                onMouseEnter={e => { if (!isCurrent) { e.currentTarget.style.backgroundColor = '#FAFAFE'; e.currentTarget.style.borderColor = '#C4B5FD'; } }}
                onMouseLeave={e => { if (!isCurrent) { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#EDE9FE'; } }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#1C1829' }}>{m.name}</p>
                  {m.quiz_done && <p className="text-xs" style={{ color: '#059669' }}>✓ Quiz done</p>}
                </div>
                {isCurrent && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#EDE9FE', color: '#8B5CF6' }}>current</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Task Card ─────────────────────────────────────── */
function TaskCard({ task, memberColor, allMembers, currentMemberId, onReassign }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="rounded-2xl p-4 transition-all duration-200"
        style={{ backgroundColor: '#FAFAFF', border: '1px solid #EDE9FE' }}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-bold flex-1" style={{ color: '#1C1829' }}>{task.title}</p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {task.suggested_due_date && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                <Calendar size={10} />
                {task.suggested_due_date}
              </span>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition-all"
              style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#DBEAFE'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#EFF6FF'; }}>
              <ArrowLeftRight size={10} />
              Change
            </button>
          </div>
        </div>
        {task.rationale && (
          <p className="text-xs leading-relaxed mb-2.5"
            style={{ color: '#6B6584', borderLeft: `2px solid ${memberColor}30`, paddingLeft: 10 }}>
            {task.rationale}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {task.criterion_name && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: '#EDE9FE', color: '#6D28D9' }}>
              {task.criterion_name}
            </span>
          )}
          {task._originalMember && task._originalMember !== '' && (
            <span className="text-xs font-medium" style={{ color: '#A09BB8' }}>
              AI suggestion
            </span>
          )}
        </div>
      </div>

      {showModal && (
        <ReassignModal
          task={task}
          members={allMembers}
          currentMemberId={currentMemberId}
          onReassign={onReassign}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

/* ── Main Allocation Screen ────────────────────────── */
export default function Allocation() {
  const navigate = useNavigate();
  const { projectId } = useProject();

  const [members, setMembers] = useState([]);
  const [distributed, setDistributed] = useState([]); // final per-member task lists
  const [coverageSummary, setCoverageSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [expanded, setExpanded] = useState({});

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // Fetch members + allocation in parallel
      const [membersRes, allocRes] = await Promise.all([
        fetch(`${API}/projects/${projectId}/members`),
        fetch(`${API}/projects/${projectId}/allocate`, { method: 'POST' }),
      ]);

      const membersData = membersRes.ok ? await membersRes.json() : { members: [] };
      if (!allocRes.ok) throw new Error();
      const allocData = await allocRes.json();

      const allMembers = membersData.members || [];
      setMembers(allMembers);
      setCoverageSummary(allocData.coverage_summary || '');

      const rawAllocations = allocData.allocations || [];
      const dist = distributeEqually(rawAllocations, allMembers);
      setDistributed(dist);

      // Start all expanded
      const exp = {};
      dist.forEach(m => { exp[m.member_id] = true; });
      setExpanded(exp);
    } catch {
      setError('Could not generate the allocation plan. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  /* Move a task from one member to another */
  const handleReassign = useCallback((task, newMemberId) => {
    setDistributed(prev => {
      // Remove task from current owner
      const next = prev.map(m => ({
        ...m,
        tasks: m.tasks.filter(t => t !== task),
      }));
      // Add to new owner
      return next.map(m =>
        m.member_id === newMemberId
          ? { ...m, tasks: [...m.tasks, task] }
          : m
      );
    });
  }, []);

  const handleAccept = async () => {
    setConfirming(true);
    try {
      const res = await fetch(`${API}/projects/${projectId}/allocate/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocations: distributed }),
      });
      if (!res.ok) throw new Error();
      navigate('/dashboard');
    } catch {
      setError('Could not save the plan. Please try again.');
      setConfirming(false);
    }
  };

  const totalTasks = distributed.reduce((s, m) => s + m.tasks.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5"
        style={{ background: 'linear-gradient(160deg, #EDE9FE 0%, #FDF2F8 55%, #E0F2FE 100%)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 8px 24px rgba(139,92,246,0.35)', animation: 'pulse 1.6s ease-in-out infinite' }}>
          <Sparkles size={26} color="white" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold mb-1" style={{ color: '#1C1829' }}>Dividing tasks equally…</p>
          <p className="text-sm" style={{ color: '#6B6584' }}>Matching each member's skills to the right work</p>
        </div>
        <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(0.95)}}`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>

      {/* Hero header */}
      <div className="w-full" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 40%, #EC4899 100%)' }}>
        <div className="max-w-3xl mx-auto px-6 py-8 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={15} color="rgba(255,255,255,0.75)" />
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">AI-Generated Plan</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-1.5" style={{ letterSpacing: '-0.02em' }}>
              Your Group's Task Plan
            </h1>
            <p className="text-sm text-white/65 max-w-md">
              {coverageSummary || `${totalTasks} tasks divided equally across ${distributed.length} member${distributed.length !== 1 ? 's' : ''}. Use the Change button to reassign any task.`}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <Users size={12} color="white" />
                <span className="text-xs font-semibold text-white">{distributed.length} members</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <CheckCircle size={12} color="white" />
                <span className="text-xs font-semibold text-white">{totalTasks} tasks total</span>
              </div>
            </div>
          </div>
          <button onClick={load}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}
            title="Regenerate plan">
            <RefreshCw size={16} />
          </button>
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
              onClick={load}>Retry</button>
          </div>
        )}

        {/* Tip banner */}
        {distributed.length > 0 && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl mb-6"
            style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <ArrowLeftRight size={14} style={{ color: '#2563EB', flexShrink: 0 }} />
            <p className="text-xs font-medium" style={{ color: '#1D4ED8' }}>
              Tap <strong>Change</strong> on any task to move it to a different team member.
            </p>
          </div>
        )}

        {distributed.length === 0 && !error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#F5F3FF' }}>
              <Users size={24} style={{ color: '#C4B5FD' }} />
            </div>
            <p className="text-base font-bold mb-2" style={{ color: '#1C1829' }}>No members yet</p>
            <p className="text-sm" style={{ color: '#A09BB8' }}>
              Members need to join and complete the quiz before tasks can be allocated.
            </p>
          </div>
        ) : (
          <div className="space-y-5 mb-8">
            {distributed.map((member) => {
              const isExpanded = expanded[member.member_id] !== false;
              const color = member.color || MEMBER_COLORS[0];
              return (
                <div key={member.member_id} className="bg-white rounded-2xl overflow-hidden"
                  style={{ border: '1px solid #EDE9FE', boxShadow: '0 2px 12px rgba(139,92,246,0.06)', borderLeft: `4px solid ${color}` }}>

                  {/* Member header */}
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-base"
                      style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 4px 12px ${color}35` }}>
                      {member.member_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h2 className="text-sm font-extrabold" style={{ color: '#1C1829' }}>{member.member_name}</h2>
                        {member.role && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                            style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                            {member.role}
                          </span>
                        )}
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold text-white"
                          style={{ backgroundColor: color }}>
                          {member.tasks.length} task{member.tasks.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {member.skill_summary && (
                        <p className="text-xs" style={{ color: '#6B6584' }}>{member.skill_summary}</p>
                      )}
                      {member.availability_summary && (
                        <p className="text-xs" style={{ color: '#A09BB8' }}>{member.availability_summary}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setExpanded(e => ({ ...e, [member.member_id]: !isExpanded }))}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                      style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {/* Task list */}
                  {isExpanded && (
                    <div className="px-5 pb-5">
                      {member.tasks.length === 0 ? (
                        <div className="text-center py-4 rounded-xl" style={{ backgroundColor: '#FAFAFE', border: '1px dashed #EDE9FE' }}>
                          <p className="text-xs font-medium" style={{ color: '#A09BB8' }}>No tasks assigned — use Change on another task to move one here</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="h-px mb-3" style={{ backgroundColor: '#F5F3FF' }} />
                          {member.tasks.map((task, ti) => (
                            <TaskCard
                              key={`${task.criterion_id}-${ti}`}
                              task={task}
                              memberColor={color}
                              allMembers={distributed.map((m, idx) => ({ id: m.member_id, name: m.member_name, quiz_done: true, idx }))}
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
        {distributed.length > 0 && (
          <div className="bg-white rounded-2xl px-6 py-4 flex items-center justify-between gap-4"
            style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 20px rgba(139,92,246,0.08)' }}>
            <div>
              <p className="text-sm font-bold" style={{ color: '#1C1829' }}>Happy with the plan?</p>
              <p className="text-xs" style={{ color: '#A09BB8' }}>
                You can still change tasks above before accepting.
              </p>
            </div>
            <Button variant="filled" onClick={handleAccept}
              disabled={confirming || distributed.length === 0} className="gap-2 flex-shrink-0">
              {confirming
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : <>Accept Plan <ArrowRight size={15} /></>}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
