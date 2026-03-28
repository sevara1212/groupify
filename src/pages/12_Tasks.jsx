import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle, Clock, Calendar, Loader2, ChevronDown, ChevronUp,
  Circle, CircleCheck, Timer, ArrowRight, GripVertical, Plus,
  MoreHorizontal, Users, Target,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import Avatar from '../components/ui/Avatar';
import ProgressBar from '../components/ui/ProgressBar';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');
const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1'];

const COLUMNS = [
  { key: 'todo',        label: 'Not Started',  icon: Circle,      color: '#6B6584', bg: '#F8F7FF', accent: '#EDE9FE', dotColor: '#A09BB8' },
  { key: 'in_progress', label: 'In Progress',  icon: Timer,       color: '#8B5CF6', bg: '#F5F3FF', accent: '#EDE9FE', dotColor: '#8B5CF6' },
  { key: 'done',        label: 'Done',         icon: CircleCheck, color: '#0D9488', bg: '#ECFDF5', accent: '#D1FAE5', dotColor: '#0D9488' },
];

function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

/* ─── Task Card ───────────────────────────────────── */
function TaskCard({ task, memberColor, onUpdate, onMove }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const overdue = task.status !== 'done' && task.due_date && new Date(task.due_date) < new Date();
  const daysLeft = task.due_date ? Math.ceil((new Date(task.due_date) - new Date()) / 86400000) : null;

  const handleProgressChange = async (newProgress) => {
    setUpdating(true);
    try { await onUpdate(task.id, { progress_percent: newProgress }); }
    finally { setUpdating(false); }
  };

  const handleMove = async (newStatus) => {
    setUpdating(true);
    const newProgress = newStatus === 'done' ? 100 : newStatus === 'todo' ? 0 : task.progress_percent;
    try { await onMove(task.id, { status: newStatus, progress_percent: newProgress }); }
    finally { setUpdating(false); }
  };

  return (
    <div className="bg-white rounded-xl p-4 transition-all duration-200 group"
      style={{
        border: '1px solid #EDE9FE',
        boxShadow: '0 1px 3px rgba(139,92,246,0.04)',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,92,246,0.10)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(139,92,246,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Top: title + more */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold leading-snug" style={{
          color: task.status === 'done' ? '#A09BB8' : '#1C1829',
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
        }}>
          {task.title}
        </p>
        <button onClick={() => setExpanded(!expanded)}
          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: '#F5F3FF' }}>
          <MoreHorizontal size={12} style={{ color: '#8B5CF6' }} />
        </button>
      </div>

      {/* Criterion tag */}
      {task.criterion_name && (
        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-md mb-2.5"
          style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
          {task.criterion_name}
        </span>
      )}

      {/* Progress bar (if in progress) */}
      {task.status === 'in_progress' && typeof task.progress_percent === 'number' && (
        <div className="mb-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium" style={{ color: '#A09BB8' }}>Progress</span>
            <span className="text-xs font-bold" style={{ color: memberColor || '#8B5CF6' }}>{task.progress_percent}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE9FE' }}>
            <div className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${task.progress_percent}%`, backgroundColor: memberColor || '#8B5CF6' }} />
          </div>
        </div>
      )}

      {/* Bottom: member + due date */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {task.member_name && (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: memberColor || '#EDE9FE', fontSize: 9, fontWeight: 700 }}>
                {task.member_name[0]?.toUpperCase()}
              </div>
              <span className="text-xs font-medium truncate" style={{ color: '#6B6584' }}>{task.member_name}</span>
            </div>
          )}
        </div>
        {task.due_date && (
          <span className="flex items-center gap-1 text-xs font-medium flex-shrink-0" style={{
            color: overdue ? '#DC2626' : daysLeft !== null && daysLeft <= 3 ? '#D97706' : '#A09BB8'
          }}>
            <Calendar size={10} />
            {new Date(task.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      {/* Expanded: move actions + progress slider */}
      {expanded && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #F5F3FF' }}>
          {/* Move buttons */}
          <p className="text-xs font-semibold mb-2" style={{ color: '#6B6584' }}>Move to:</p>
          <div className="flex gap-2 mb-3">
            {COLUMNS.filter(c => c.key !== task.status).map(col => (
              <button key={col.key} onClick={() => handleMove(col.key)} disabled={updating}
                className="flex-1 text-xs font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                style={{ backgroundColor: col.bg, color: col.color, border: `1px solid ${col.accent}` }}>
                <col.icon size={12} />
                {col.label}
              </button>
            ))}
          </div>
          {/* Progress slider */}
          {task.status !== 'done' && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#FAFAFF', border: '1px solid #EDE9FE' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: '#6B6584' }}>Progress</span>
                <span className="text-xs font-bold" style={{ color: '#8B5CF6' }}>{task.progress_percent || 0}%</span>
              </div>
              <input
                type="range" min="0" max="100" step="10"
                value={task.progress_percent || 0}
                onChange={e => handleProgressChange(parseInt(e.target.value))}
                disabled={updating}
                className="w-full accent-purple-500"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Kanban Column ───────────────────────────────── */
function KanbanColumn({ column, tasks, memberColorMap, onUpdate, onMove }) {
  const count = tasks.length;

  return (
    <div className="flex flex-col min-w-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: column.dotColor }} />
          <h3 className="text-sm font-bold" style={{ color: '#1C1829' }}>{column.label}</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: column.bg, color: column.color }}>
            {count}
          </span>
        </div>
      </div>

      {/* Column body */}
      <div className="flex-1 rounded-2xl p-2.5 space-y-2.5 min-h-[200px]"
        style={{ backgroundColor: column.bg, border: `1px dashed ${column.accent}` }}>
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-xs font-medium" style={{ color: '#C4B5FD' }}>No tasks</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              memberColor={memberColorMap[task.member_id]}
              onUpdate={onUpdate}
              onMove={onMove}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Main Tasks Page ─────────────────────────────── */
export default function Tasks() {
  const { projectId } = useProject();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberFilter, setMemberFilter] = useState('all');

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`${API}/projects/${projectId}/tasks`);
      if (!res.ok) return;
      const data = await res.json();
      const all = data.tasks || [];
      setTasks(all);
      const seen = {};
      all.forEach(t => {
        if (t.member_id && !seen[t.member_id]) {
          seen[t.member_id] = { id: t.member_id, name: t.member_name, color: MEMBER_COLORS[Object.keys(seen).length % MEMBER_COLORS.length] };
        }
      });
      setMembers(Object.values(seen));
    } catch { }
    finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleUpdateTask = async (taskId, updates) => {
    // Optimistically update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    try {
      const res = await fetch(`${API}/projects/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updated } : t));
      }
    } catch { }
  };

  const memberColorMap = {};
  members.forEach(m => { memberColorMap[m.id] = m.color; });

  const filtered = memberFilter === 'all' ? tasks : tasks.filter(t => t.member_id === memberFilter);

  const todoTasks = filtered.filter(t => t.status === 'todo' || t.status === 'not_started' || (!t.status));
  const inProgressTasks = filtered.filter(t => t.status === 'in_progress');
  const doneTasks = filtered.filter(t => t.status === 'done');

  const doneCount = tasks.filter(t => t.status === 'done').length;
  const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      {/* Header */}
      <div className="w-full" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 40%, #EC4899 100%)' }}>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>Tasks</h1>
              <p className="text-sm text-white/60 mt-0.5">
                {loading ? 'Loading…' : `${doneCount} of ${tasks.length} completed`}
              </p>
            </div>
            {!loading && tasks.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-32 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: 'white' }} />
                </div>
                <span className="text-sm font-extrabold text-white">{pct}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-6">
        {/* Member filter */}
        {members.length > 1 && (
          <div className="flex gap-2 mb-5 flex-wrap">
            <button onClick={() => setMemberFilter('all')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              style={{
                backgroundColor: memberFilter === 'all' ? '#1C1829' : 'white',
                color: memberFilter === 'all' ? 'white' : '#6B6584',
                border: memberFilter === 'all' ? '1px solid #1C1829' : '1px solid #EDE9FE',
              }}>
              <Users size={12} /> All Members
            </button>
            {members.map(m => (
              <button key={m.id} onClick={() => setMemberFilter(memberFilter === m.id ? 'all' : m.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                style={{
                  backgroundColor: memberFilter === m.id ? m.color : 'white',
                  color: memberFilter === m.id ? 'white' : '#6B6584',
                  border: memberFilter === m.id ? `1px solid ${m.color}` : '1px solid #EDE9FE',
                  boxShadow: memberFilter === m.id ? `0 2px 8px ${m.color}30` : 'none',
                }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: memberFilter === m.id ? 'rgba(255,255,255,0.6)' : m.color }} />
                {m.name}
              </button>
            ))}
          </div>
        )}

        {/* Kanban Board */}
        {loading ? (
          <div className="grid grid-cols-3 gap-5">
            {[0,1,2].map(i => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-24" />
                <div className="rounded-2xl p-3 space-y-3" style={{ backgroundColor: '#F5F3FF' }}>
                  {[0,1,2].map(j => <Skeleton key={j} className="h-28 w-full rounded-xl" />)}
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F5F3FF, #FDF2F8)', border: '1px solid #EDE9FE' }}>
              <Target size={28} style={{ color: '#C4B5FD' }} />
            </div>
            <div className="text-center">
              <p className="text-base font-bold mb-1" style={{ color: '#1C1829' }}>No tasks yet</p>
              <p className="text-sm" style={{ color: '#A09BB8' }}>Accept the allocation plan to get started.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <KanbanColumn column={COLUMNS[0]} tasks={todoTasks} memberColorMap={memberColorMap} onUpdate={handleUpdateTask} onMove={handleUpdateTask} />
            <KanbanColumn column={COLUMNS[1]} tasks={inProgressTasks} memberColorMap={memberColorMap} onUpdate={handleUpdateTask} onMove={handleUpdateTask} />
            <KanbanColumn column={COLUMNS[2]} tasks={doneTasks} memberColorMap={memberColorMap} onUpdate={handleUpdateTask} onMove={handleUpdateTask} />
          </div>
        )}

        {/* Member summary */}
        {!loading && members.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#A09BB8' }}>By Member</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {members.map(m => {
                const mt = tasks.filter(t => t.member_id === m.id);
                const done = mt.filter(t => t.status === 'done').length;
                const inProg = mt.filter(t => t.status === 'in_progress').length;
                const p = mt.length ? Math.round((done / mt.length) * 100) : 0;
                return (
                  <div key={m.id} className="bg-white rounded-xl p-4 transition-all duration-200"
                    style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.04)' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,92,246,0.10)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(139,92,246,0.04)'; }}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <Avatar name={m.name} color={m.color} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: '#1C1829' }}>{m.name}</p>
                        <p className="text-xs" style={{ color: '#A09BB8' }}>
                          {done}/{mt.length} done{inProg > 0 ? ` · ${inProg} active` : ''}
                        </p>
                      </div>
                    </div>
                    <ProgressBar value={p} color={m.color} showPercent />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <style>{`
        .skeleton{background:linear-gradient(90deg,#EDE9FE 25%,#F5F3FF 50%,#EDE9FE 75%);background-size:200% 100%;border-radius:8px;animation:shimmer 1.5s infinite}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>
    </div>
  );
}
