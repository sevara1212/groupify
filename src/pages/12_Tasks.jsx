import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle, Calendar, Loader2, Users, Target,
  Circle, Timer, ChevronDown, Sparkles, Filter,
  TrendingUp, Clock, ArrowUpRight, X, AlertTriangle,
  ChevronRight, ChevronLeft,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');
const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1'];

const STATUS_CONFIG = {
  todo:        { label: 'Not Started', icon: Circle,      color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', dot: '#9CA3AF',  gradient: 'linear-gradient(135deg,#6B7280,#9CA3AF)' },
  in_progress: { label: 'In Progress', icon: Timer,       color: '#8B5CF6', bg: '#F5F3FF', border: '#C4B5FD', dot: '#8B5CF6',  gradient: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' },
  done:        { label: 'Done',        icon: CheckCircle, color: '#10B981', bg: '#ECFDF5', border: '#6EE7B7', dot: '#10B981',  gradient: 'linear-gradient(135deg,#10B981,#059669)' },
};

const STATUS_CYCLE = { todo: 'in_progress', in_progress: 'done', done: 'todo' };

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function Skeleton({ w = '100%', h = 16, r = 8 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,#EDE9FE 25%,#F5F3FF 50%,#EDE9FE 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}

/* ─── Deadline Timeline ───────────────────────────── */
function DeadlineTimeline({ tasks }) {
  const upcoming = tasks
    .filter(t => t.due_date && t.status !== 'done')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 6);

  if (upcoming.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden mb-5"
      style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.06)' }}>
      <div className="px-5 py-3 flex items-center gap-2.5" style={{ borderBottom: '1px solid #F5F3FF' }}>
        <Clock size={13} style={{ color: '#8B5CF6' }} />
        <span className="text-xs font-extrabold" style={{ color: '#1C1829' }}>Upcoming Deadlines</span>
      </div>
      <div className="px-5 py-4">
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {upcoming.map(task => {
            const daysLeft = Math.ceil((new Date(task.due_date) - new Date()) / 86400000);
            const isOverdue = daysLeft < 0;
            const isUrgent = daysLeft >= 0 && daysLeft <= 3;
            const isInProgress = task.status === 'in_progress';

            return (
              <div key={task.id} className="flex-shrink-0 w-44 rounded-xl p-3 transition-all"
                style={{
                  backgroundColor: isOverdue ? '#FEF2F2' : isUrgent ? '#FFFBEB' : '#F8F7FF',
                  border: `1px solid ${isOverdue ? '#FECACA' : isUrgent ? '#FDE68A' : '#EDE9FE'}`,
                }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar size={10} style={{ color: isOverdue ? '#EF4444' : isUrgent ? '#D97706' : '#8B5CF6' }} />
                  <span className="text-xs font-bold" style={{ color: isOverdue ? '#EF4444' : isUrgent ? '#D97706' : '#8B5CF6' }}>
                    {new Date(task.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="text-xs font-semibold ml-auto" style={{ color: isOverdue ? '#EF4444' : isUrgent ? '#D97706' : '#A09BB8' }}>
                    {isOverdue ? `${Math.abs(daysLeft)}d late` : daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                  </span>
                </div>
                <p className="text-xs font-semibold truncate mb-1" style={{ color: '#1C1829' }}>{task.title}</p>
                {task.member_name && (
                  <p className="text-xs truncate" style={{ color: '#A09BB8' }}>{task.member_name}</p>
                )}
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE9FE' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${task.progress_percent || 0}%`,
                      backgroundColor: isOverdue ? '#EF4444' : isUrgent ? '#D97706' : '#8B5CF6',
                    }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Status Toggle Pill ─────────────────────────── */
function StatusPill({ status, onChange, disabled }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.todo;
  const Icon = cfg.icon;
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={() => !disabled && onChange(STATUS_CYCLE[status] || 'in_progress')}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex-shrink-0"
      style={{
        backgroundColor: hover ? cfg.border : cfg.bg,
        color: cfg.color,
        border: `1.5px solid ${cfg.border}`,
        boxShadow: hover ? `0 2px 8px ${cfg.dot}30` : 'none',
        cursor: disabled ? 'default' : 'pointer',
        minWidth: 110,
        justifyContent: 'center',
      }}
    >
      <Icon size={11} strokeWidth={2.5} />
      {hover && !disabled ? 'Click to update' : cfg.label}
    </button>
  );
}

/* ─── Task Detail Modal ─────────────────────────────── */
function TaskDetailModal({ task, memberColor, onUpdate, onClose }) {
  const [localStatus, setLocalStatus] = useState(task.status || 'todo');
  const [localProgress, setLocalProgress] = useState(task.progress_percent || 0);
  const [saving, setSaving] = useState(false);

  const cfg = STATUS_CONFIG[localStatus] || STATUS_CONFIG.todo;
  const daysLeft = task.due_date ? Math.ceil((new Date(task.due_date) - new Date()) / 86400000) : null;
  const isOverdue = daysLeft !== null && daysLeft < 0 && localStatus !== 'done';

  const handleSave = async (updates) => {
    setSaving(true);
    try { await onUpdate(task.id, updates); } catch {}
    setSaving(false);
  };

  const handleStatusChange = async (newStatus) => {
    setLocalStatus(newStatus);
    const newProgress = newStatus === 'done' ? 100 : newStatus === 'todo' ? 0 : localProgress;
    if (newStatus === 'done') setLocalProgress(100);
    if (newStatus === 'todo') setLocalProgress(0);
    await handleSave({ status: newStatus, progress_percent: newProgress });
  };

  const handleProgress = async (val) => {
    setLocalProgress(val);
    await handleSave({ progress_percent: val });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header with accent */}
        <div className="relative px-6 pt-6 pb-4"
          style={{ borderBottom: '1px solid #F5F3FF', background: 'linear-gradient(135deg, #F5F3FF, #FDF2F8)' }}>
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: memberColor || '#8B5CF6' }} />
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#8B5CF6' }}>Task Details</p>
              <h2 className="text-base font-extrabold" style={{ color: '#1C1829' }}>{task.title}</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'white', color: '#8B5CF6', border: '1px solid #EDE9FE' }}>
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Info rows */}
          <div className="grid grid-cols-2 gap-3">
            {task.member_name && (
              <div className="rounded-xl p-3" style={{ backgroundColor: '#F8F7FF', border: '1px solid #EDE9FE' }}>
                <p className="text-xs font-bold mb-1" style={{ color: '#A09BB8' }}>Assigned to</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: memberColor || '#8B5CF6', fontSize: 8 }}>
                    {getInitials(task.member_name)}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#1C1829' }}>{task.member_name}</span>
                </div>
              </div>
            )}
            {task.due_date && (
              <div className="rounded-xl p-3"
                style={{ backgroundColor: isOverdue ? '#FEF2F2' : '#F8F7FF', border: `1px solid ${isOverdue ? '#FECACA' : '#EDE9FE'}` }}>
                <p className="text-xs font-bold mb-1" style={{ color: '#A09BB8' }}>Deadline</p>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} style={{ color: isOverdue ? '#EF4444' : '#8B5CF6' }} />
                  <span className="text-sm font-semibold" style={{ color: isOverdue ? '#EF4444' : '#1C1829' }}>
                    {new Date(task.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {daysLeft !== null && (
                  <p className="text-xs mt-1 font-medium" style={{ color: isOverdue ? '#EF4444' : daysLeft <= 3 ? '#D97706' : '#A09BB8' }}>
                    {isOverdue ? `${Math.abs(daysLeft)} days overdue` : daysLeft === 0 ? 'Due today!' : `${daysLeft} days left`}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Criterion */}
          {task.criterion_name && (
            <div className="flex items-center gap-2">
              <Target size={12} style={{ color: '#EC4899' }} />
              <span className="text-xs font-semibold" style={{ color: '#6B6584' }}>Rubric: </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: '#FDF2F8', color: '#BE185D' }}>
                {task.criterion_name}
              </span>
            </div>
          )}

          {/* Status */}
          <div>
            <p className="text-xs font-bold mb-2" style={{ color: '#6B7280' }}>Status</p>
            <div className="flex gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, c]) => {
                const isActive = localStatus === key;
                const SIcon = c.icon;
                return (
                  <button key={key} onClick={() => handleStatusChange(key)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-1 justify-center"
                    style={{
                      backgroundColor: isActive ? c.bg : 'white',
                      border: `1.5px solid ${isActive ? c.border : '#EDE9FE'}`,
                      color: isActive ? c.color : '#9CA3AF',
                      boxShadow: isActive ? `0 2px 8px ${c.dot}20` : 'none',
                    }}>
                    <SIcon size={12} strokeWidth={2.5} />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress */}
          {localStatus !== 'done' && (
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#F8F7FF', border: '1px solid #EDE9FE' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold" style={{ color: '#6B7280' }}>Progress</span>
                <span className="text-sm font-extrabold" style={{ color: '#8B5CF6' }}>{localProgress}%</span>
              </div>
              <div className="relative h-3 rounded-full mb-3" style={{ backgroundColor: '#EDE9FE' }}>
                <div className="h-3 rounded-full transition-all duration-300"
                  style={{ width: `${localProgress}%`, background: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }} />
              </div>
              <div className="flex justify-between gap-1">
                {[0, 25, 50, 75, 100].map(v => (
                  <button key={v} onClick={() => handleProgress(v)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex-1"
                    style={{
                      backgroundColor: localProgress === v ? '#8B5CF6' : 'white',
                      color: localProgress === v ? 'white' : '#A09BB8',
                      border: `1px solid ${localProgress === v ? '#8B5CF6' : '#EDE9FE'}`,
                    }}>
                    {v}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {localStatus === 'done' && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7' }}>
              <CheckCircle size={16} style={{ color: '#10B981' }} />
              <span className="text-sm font-semibold" style={{ color: '#10B981' }}>Task completed! 🎉</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Task Row ───────────────────────────────────── */
function TaskRow({ task, memberColor, onUpdate, isLast }) {
  const [updating, setUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState(task.status || 'todo');
  const [showDetail, setShowDetail] = useState(false);

  const cfg = STATUS_CONFIG[localStatus] || STATUS_CONFIG.todo;
  const overdue = localStatus !== 'done' && task.due_date && new Date(task.due_date) < new Date();
  const daysLeft = task.due_date ? Math.ceil((new Date(task.due_date) - new Date()) / 86400000) : null;

  const handleStatusChange = async (newStatus) => {
    const prev = localStatus;
    setLocalStatus(newStatus);
    setUpdating(true);
    const newProgress = newStatus === 'done' ? 100 : newStatus === 'todo' ? 0 : (task.progress_percent || 0);
    try {
      await onUpdate(task.id, { status: newStatus, progress_percent: newProgress });
    } catch {
      setLocalStatus(prev);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="transition-all duration-200" style={{ borderBottom: isLast ? 'none' : '1px solid #F3F4F6' }}>
        <div className="flex items-center gap-4 px-5 py-3.5 transition-all duration-150"
          style={{ backgroundColor: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FAFAFF'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>

          {/* Status dot */}
          <div className="flex-shrink-0 w-3 h-3 rounded-full transition-all duration-300"
            style={{ backgroundColor: cfg.dot, boxShadow: localStatus !== 'todo' ? `0 0 0 3px ${cfg.dot}22` : 'none' }} />

          {/* Title + tag - clickable for details */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowDetail(true)}>
            <p className="text-sm font-semibold leading-snug"
              style={{
                color: localStatus === 'done' ? '#9CA3AF' : '#111827',
                textDecoration: localStatus === 'done' ? 'line-through' : 'none',
              }}>
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {task.criterion_name && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                  {task.criterion_name}
                </span>
              )}
              {task.due_date && (
                <span className="text-xs font-medium flex items-center gap-1"
                  style={{ color: overdue ? '#EF4444' : daysLeft !== null && daysLeft <= 3 ? '#D97706' : '#A09BB8' }}>
                  <Calendar size={9} />
                  {new Date(task.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  {overdue ? ' (overdue)' : daysLeft === 0 ? ' (today)' : daysLeft !== null && daysLeft <= 3 ? ` (${daysLeft}d)` : ''}
                </span>
              )}
            </div>
          </div>

          {/* Member avatar */}
          {task.member_name && (
            <div className="flex items-center gap-2 flex-shrink-0 hidden sm:flex">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: memberColor || '#8B5CF6', fontSize: 9, fontWeight: 800 }}>
                {getInitials(task.member_name)}
              </div>
              <span className="text-xs font-medium" style={{ color: '#6B7280' }}>{task.member_name}</span>
            </div>
          )}

          {/* Progress bar mini */}
          {localStatus === 'in_progress' && (
            <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0 w-20">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE9FE' }}>
                <div className="h-1.5 rounded-full" style={{ width: `${task.progress_percent || 0}%`, backgroundColor: '#8B5CF6' }} />
              </div>
              <span className="text-xs font-bold w-8 text-right" style={{ color: '#8B5CF6' }}>{task.progress_percent || 0}%</span>
            </div>
          )}

          {/* Status pill */}
          <div onClick={e => e.stopPropagation()}>
            <StatusPill status={localStatus} onChange={handleStatusChange} disabled={updating} />
          </div>
        </div>
      </div>

      {showDetail && (
        <TaskDetailModal
          task={{ ...task, status: localStatus }}
          memberColor={memberColor}
          onUpdate={async (id, updates) => {
            await onUpdate(id, updates);
            if (updates.status) setLocalStatus(updates.status);
          }}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}

/* ─── Status Section ─────────────────────────────── */
function StatusSection({ column, tasks, memberColorMap, onUpdate, collapsed, onToggle }) {
  const cfg = STATUS_CONFIG[column.key];
  if (tasks.length === 0 && column.key !== 'todo') return null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden transition-all duration-200"
      style={{ border: `1px solid ${cfg.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <button className="w-full flex items-center gap-3 px-5 py-4 transition-all"
        style={{ backgroundColor: cfg.bg }}
        onClick={onToggle}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.gradient }}>
          <column.icon size={12} color="white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-extrabold" style={{ color: '#111827' }}>{cfg.label}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-1"
          style={{ backgroundColor: cfg.border, color: cfg.color }}>
          {tasks.length}
        </span>
        <div className="flex-1" />
        {tasks.length > 0 && (
          <ChevronDown size={14} style={{ color: cfg.color, transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s' }} />
        )}
      </button>

      {!collapsed && tasks.length > 0 && (
        <div>
          {tasks.map((task, idx) => (
            <TaskRow key={task.id} task={task} memberColor={memberColorMap[task.member_id]}
              onUpdate={onUpdate} isLast={idx === tasks.length - 1} />
          ))}
        </div>
      )}

      {!collapsed && tasks.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-xs font-medium" style={{ color: '#C4B5FD' }}>No tasks here yet</p>
        </div>
      )}
    </div>
  );
}

const COLUMNS = [
  { key: 'todo',        label: 'Not Started',  icon: Circle      },
  { key: 'in_progress', label: 'In Progress',  icon: Timer       },
  { key: 'done',        label: 'Done',         icon: CheckCircle },
];

/* ─── Main Tasks Page ────────────────────────────── */
export default function Tasks() {
  const { projectId } = useProject();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberFilter, setMemberFilter] = useState('all');
  const [collapsed, setCollapsed] = useState({ todo: false, in_progress: false, done: false });

  const fetchTasks = useCallback(async () => {
    if (!projectId) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/projects/${projectId}/tasks`);
      if (!res.ok) return;
      const data = await res.json();
      const all = (data.tasks || []).map(t => ({ ...t, status: t.status || 'todo' }));
      setTasks(all);
      const seen = {};
      all.forEach(t => {
        if (t.member_id && !seen[t.member_id]) {
          seen[t.member_id] = { id: t.member_id, name: t.member_name, color: MEMBER_COLORS[Object.keys(seen).length % MEMBER_COLORS.length] };
        }
      });
      setMembers(Object.values(seen));
    } catch {}
    finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => {
    const id = setInterval(fetchTasks, 15000);
    return () => clearInterval(id);
  }, [fetchTasks]);

  const handleUpdateTask = async (taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    try {
      await fetch(`${API}/projects/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {}
  };

  const memberColorMap = {};
  members.forEach(m => { memberColorMap[m.id] = m.color; });

  const filtered = memberFilter === 'all' ? tasks : tasks.filter(t => t.member_id === memberFilter);
  const todoTasks = filtered.filter(t => !t.status || t.status === 'todo' || t.status === 'not_started');
  const inProgressTasks = filtered.filter(t => t.status === 'in_progress');
  const doneTasks = filtered.filter(t => t.status === 'done');

  const doneCount = tasks.filter(t => t.status === 'done').length;
  const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  // Count overdue tasks
  const overdueCount = tasks.filter(t => t.due_date && t.status !== 'done' && new Date(t.due_date) < new Date()).length;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #EC4899 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'white', transform: 'translate(30%, -50%)' }} />

        <div className="max-w-5xl mx-auto px-6 py-7 relative">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
                  <Target size={16} color="white" />
                </div>
                <span className="text-white/70 text-sm font-semibold">Task Board</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>
                {loading ? 'Loading…' : `${doneCount} of ${tasks.length} tasks done`}
              </h1>
              <p className="text-white/60 text-sm mt-1">Click any task to see details · Click status pill to update</p>
            </div>

            {!loading && tasks.length > 0 && (
              <div className="flex-shrink-0">
                <div className="relative flex flex-col items-center justify-center w-20 h-20">
                  <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90" style={{ width: 80, height: 80 }}>
                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="7" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="white" strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - pct / 100)}`}
                      style={{ transition: 'stroke-dashoffset 1s ease' }} />
                  </svg>
                  <span className="text-white font-extrabold text-lg z-10">{pct}%</span>
                </div>
              </div>
            )}
          </div>

          {!loading && tasks.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {[
                { label: `${todoTasks.length} not started`, color: 'rgba(255,255,255,0.15)' },
                { label: `${inProgressTasks.length} in progress`, color: 'rgba(139,92,246,0.4)' },
                { label: `${doneTasks.length} done`, color: 'rgba(16,185,129,0.35)' },
                ...(overdueCount > 0 ? [{ label: `${overdueCount} overdue`, color: 'rgba(239,68,68,0.4)' }] : []),
              ].map(p => (
                <span key={p.label} className="text-xs font-semibold text-white px-3 py-1 rounded-full"
                  style={{ backgroundColor: p.color, backdropFilter: 'blur(8px)' }}>
                  {p.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-6">

        {/* Deadline timeline */}
        {!loading && <DeadlineTimeline tasks={filtered} />}

        {/* Member filter */}
        {members.length > 1 && (
          <div className="flex gap-2 mb-5 flex-wrap items-center">
            <div className="flex items-center gap-1.5 text-xs font-bold mr-1" style={{ color: '#A09BB8' }}>
              <Filter size={11} /> Filter:
            </div>
            <button onClick={() => setMemberFilter('all')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              style={{
                backgroundColor: memberFilter === 'all' ? '#1C1829' : 'white',
                color: memberFilter === 'all' ? 'white' : '#6B7280',
                border: `1.5px solid ${memberFilter === 'all' ? '#1C1829' : '#EDE9FE'}`,
              }}>
              <Users size={11} /> All
            </button>
            {members.map(m => (
              <button key={m.id} onClick={() => setMemberFilter(memberFilter === m.id ? 'all' : m.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                style={{
                  backgroundColor: memberFilter === m.id ? m.color : 'white',
                  color: memberFilter === m.id ? 'white' : '#6B7280',
                  border: `1.5px solid ${memberFilter === m.id ? m.color : '#EDE9FE'}`,
                  boxShadow: memberFilter === m.id ? `0 2px 8px ${m.color}40` : 'none',
                }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: memberFilter === m.id ? 'rgba(255,255,255,0.7)' : m.color }} />
                {m.name}
              </button>
            ))}
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <div className="space-y-3">
            {[0,1,2].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 space-y-3" style={{ border: '1px solid #EDE9FE' }}>
                <Skeleton w="60%" h={16} />
                <Skeleton w="30%" h={12} />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F5F3FF, #FDF2F8)', border: '2px dashed #EDE9FE' }}>
              <Sparkles size={32} style={{ color: '#C4B5FD' }} />
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold mb-1" style={{ color: '#1C1829' }}>No tasks yet</p>
              <p className="text-sm" style={{ color: '#A09BB8' }}>Accept the allocation plan to generate your tasks.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {COLUMNS.map(col => {
              const colTasks = col.key === 'todo' ? todoTasks : col.key === 'in_progress' ? inProgressTasks : doneTasks;
              return (
                <StatusSection key={col.key} column={col} tasks={colTasks} memberColorMap={memberColorMap}
                  onUpdate={handleUpdateTask}
                  collapsed={collapsed[col.key]}
                  onToggle={() => setCollapsed(p => ({ ...p, [col.key]: !p[col.key] }))} />
              );
            })}

            {/* Member summary */}
            {members.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden mt-2"
                style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.04)' }}>
                <div className="px-5 py-4 flex items-center gap-2"
                  style={{ borderBottom: '1px solid #F5F3FF', backgroundColor: '#FAFAFF' }}>
                  <Users size={14} style={{ color: '#8B5CF6' }} />
                  <h2 className="text-sm font-extrabold" style={{ color: '#1C1829' }}>Team Progress</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-auto"
                    style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                    {members.length} member{members.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {members.map(m => {
                    const mt = tasks.filter(t => t.member_id === m.id);
                    const done = mt.filter(t => t.status === 'done').length;
                    const inProg = mt.filter(t => t.status === 'in_progress').length;
                    const p = mt.length ? Math.round((done / mt.length) * 100) : 0;
                    return (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ backgroundColor: '#F8F7FF', border: '1px solid #EDE9FE' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                          style={{ background: m.color, fontSize: 12, fontWeight: 800 }}>
                          {getInitials(m.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-bold truncate" style={{ color: '#111827' }}>{m.name}</p>
                            <span className="text-xs font-extrabold ml-2 flex-shrink-0" style={{ color: m.color }}>{p}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE9FE' }}>
                            <div className="h-1.5 rounded-full transition-all duration-700"
                              style={{ width: `${p}%`, backgroundColor: m.color }} />
                          </div>
                          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                            {done}/{mt.length} done{inProg > 0 ? ` · ${inProg} in progress` : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>
    </div>
  );
}
