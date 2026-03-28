import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, Clock, Calendar, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');
const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1'];

const FILTERS = [
  { key: 'all',         label: 'All' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'todo',        label: 'To Do' },
  { key: 'done',        label: 'Done' },
  { key: 'at_risk',     label: 'At Risk' },
];

function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

function TaskCard({ task, memberColor, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const overdue = task.status !== 'done' && task.due_date && new Date(task.due_date) < new Date();
  const status = overdue ? 'overdue' : task.status || 'todo';
  const badgeStatus = status === 'in_progress' ? 'inProgress' : status === 'todo' ? 'notStarted' : status === 'at_risk' ? 'atRisk' : status;

  const daysLeft = task.due_date
    ? Math.ceil((new Date(task.due_date) - new Date()) / 86400000)
    : null;

  const handleProgressChange = async (newProgress) => {
    setUpdating(true);
    try {
      await onUpdate(task.id, { progress_percent: newProgress });
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const newProgress = newStatus === 'done' ? 100 : task.progress_percent;
    setUpdating(true);
    try {
      await onUpdate(task.id, { status: newStatus, progress_percent: newProgress });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="py-4 group" style={{ borderBottom: '1px solid #F5F3FF' }}>
      <div className="flex items-start gap-3">
        {/* Color accent */}
        <div className="w-1 rounded-full self-stretch flex-shrink-0"
          style={{ backgroundColor: memberColor || '#EDE9FE', minHeight: 44 }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <button onClick={handleStatusToggle} disabled={updating}
                  className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor: task.status === 'done' ? '#8B5CF6' : '#C4B5FD',
                    backgroundColor: task.status === 'done' ? '#8B5CF6' : 'transparent',
                  }}>
                  {task.status === 'done' && <CheckCircle size={12} style={{ color: 'white' }} />}
                </button>
                <p className="text-sm font-bold truncate" style={{
                  color: '#1C1829',
                  textDecoration: task.status === 'done' ? 'line-through' : 'none',
                  opacity: task.status === 'done' ? 0.5 : 1,
                }}>{task.title}</p>
              </div>
              {task.criterion_name && (
                <p className="text-xs mt-0.5 truncate ml-7" style={{ color: '#A09BB8' }}>{task.criterion_name}</p>
              )}
            </div>
            <Badge status={badgeStatus} className="flex-shrink-0" />
          </div>
          <div className="flex items-center gap-4 ml-7">
            {task.member_name && (
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#6B6584' }}>
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: memberColor || '#EDE9FE', fontSize: 8, fontWeight: 700 }}>
                  {task.member_name[0]?.toUpperCase()}
                </div>
                {task.member_name}
              </span>
            )}
            {task.due_date && (
              <span className="flex items-center gap-1 text-xs font-medium" style={{
                color: overdue ? '#DC2626' : daysLeft !== null && daysLeft <= 3 ? '#D97706' : '#A09BB8'
              }}>
                <Calendar size={10} />
                {new Date(task.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                {daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && !overdue && (
                  <span className="ml-1">({daysLeft}d left)</span>
                )}
                {overdue && <span className="ml-1 font-bold">overdue</span>}
              </span>
            )}
            <button onClick={() => setExpanded(!expanded)}
              className="text-xs flex items-center gap-1 ml-auto" style={{ color: '#8B5CF6' }}>
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Less' : 'Update'}
            </button>
          </div>

          {/* Expanded: progress slider */}
          {expanded && (
            <div className="mt-3 ml-7 p-3 rounded-xl" style={{ backgroundColor: '#F8F7FF', border: '1px solid #EDE9FE' }}>
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
              <div className="flex justify-between text-xs mt-1" style={{ color: '#A09BB8' }}>
                <span>Not started</span>
                <span>Done</span>
              </div>
            </div>
          )}

          {typeof task.progress_percent === 'number' && task.progress_percent > 0 && !expanded && (
            <div className="mt-2.5 ml-7">
              <ProgressBar value={task.progress_percent} color={memberColor} showPercent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { projectId } = useProject();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
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

  const filtered = tasks.filter(t => {
    if (memberFilter !== 'all' && t.member_id !== memberFilter) return false;
    if (filter === 'all') return true;
    if (filter === 'at_risk') {
      const over = t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date();
      return t.status === 'at_risk' || over;
    }
    return t.status === filter;
  });

  const counts = {
    all: tasks.length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    todo: tasks.filter(t => t.status === 'todo' || t.status === 'not_started').length,
    done: tasks.filter(t => t.status === 'done').length,
    at_risk: tasks.filter(t => {
      const over = t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date();
      return t.status === 'at_risk' || over;
    }).length,
  };

  const doneCount = tasks.filter(t => t.status === 'done').length;
  const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  // Group tasks by deadline phase
  const upcoming = tasks
    .filter(t => t.status !== 'done' && t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>Tasks</h1>
            <p className="text-sm mt-0.5" style={{ color: '#6B6584' }}>
              {loading ? '…' : `${doneCount} of ${tasks.length} completed`}
            </p>
          </div>
          {!loading && tasks.length > 0 && (
            <div className="flex items-center gap-2.5 mt-1">
              <div className="w-28 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE9FE' }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', transition: 'width 800ms ease' }} />
              </div>
              <span className="text-sm font-extrabold" style={{ color: '#8B5CF6' }}>{pct}%</span>
            </div>
          )}
        </div>

        {/* Upcoming deadlines banner */}
        {!loading && upcoming.length > 0 && (
          <div className="rounded-2xl p-4 mb-6" style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDF2F8 100%)', border: '1px solid #FDE68A' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#D97706' }}>
              <Clock size={11} className="inline mr-1" /> Upcoming Deadlines
            </p>
            <div className="space-y-1.5">
              {upcoming.map(t => {
                const days = Math.ceil((new Date(t.due_date) - new Date()) / 86400000);
                return (
                  <div key={t.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium truncate mr-3" style={{ color: '#1C1829' }}>{t.title}</span>
                    <span className="font-bold flex-shrink-0" style={{ color: days <= 2 ? '#DC2626' : '#D97706' }}>
                      {days <= 0 ? 'Overdue!' : `${days} day${days !== 1 ? 's' : ''} left`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Member filter */}
        {members.length > 1 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={() => setMemberFilter('all')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{ backgroundColor: memberFilter === 'all' ? '#1C1829' : '#F5F3FF', color: memberFilter === 'all' ? 'white' : '#6B6584' }}>
              All Members
            </button>
            {members.map(m => (
              <button key={m.id} onClick={() => setMemberFilter(memberFilter === m.id ? 'all' : m.id)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5"
                style={{ backgroundColor: memberFilter === m.id ? m.color : '#F5F3FF', color: memberFilter === m.id ? 'white' : '#6B6584' }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: memberFilter === m.id ? 'rgba(255,255,255,0.6)' : m.color }} />
                {m.name}
              </button>
            ))}
          </div>
        )}

        {/* Status filter tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ backgroundColor: '#F0ECFF' }}>
          {FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                backgroundColor: filter === key ? 'white' : 'transparent',
                color: filter === key ? '#1C1829' : '#A09BB8',
                boxShadow: filter === key ? '0 1px 4px rgba(139,92,246,0.10)' : 'none',
              }}>
              {label}
              {counts[key] > 0 && (
                <span className="ml-1.5 text-xs" style={{ color: filter === key ? '#8B5CF6' : '#C4B5FD' }}>
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Task list */}
        <Card className="mb-6">
          {loading ? (
            <div className="p-6 space-y-5">
              {[0,1,2,3,4].map(i => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-1 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #F5F3FF, #FDF2F8)' }}>
                <CheckCircle size={24} style={{ color: '#C4B5FD' }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: '#A09BB8' }}>
                {filter === 'all' ? 'No tasks yet — accept the allocation plan to get started.' : `No ${filter.replace('_', ' ')} tasks.`}
              </p>
            </div>
          ) : (
            <div className="px-5">
              {filtered.map(task => (
                <TaskCard key={task.id} task={task} memberColor={memberColorMap[task.member_id]} onUpdate={handleUpdateTask} />
              ))}
            </div>
          )}
        </Card>

        {/* Member summary */}
        {!loading && members.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#A09BB8' }}>By Member</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {members.map(m => {
                const mt = tasks.filter(t => t.member_id === m.id);
                const done = mt.filter(t => t.status === 'done').length;
                const p = mt.length ? Math.round((done / mt.length) * 100) : 0;
                const nextDue = mt
                  .filter(t => t.status !== 'done' && t.due_date)
                  .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];
                return (
                  <Card key={m.id} className="p-4">
                    <div className="flex items-center gap-2.5 mb-3">
                      <Avatar name={m.name} color={m.color} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: '#1C1829' }}>{m.name}</p>
                        <p className="text-xs" style={{ color: '#A09BB8' }}>{mt.length} task{mt.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <ProgressBar value={p} color={m.color} showPercent />
                    {nextDue && (
                      <p className="text-xs mt-2 flex items-center gap-1" style={{ color: '#6B6584' }}>
                        <Calendar size={10} />
                        Next: {new Date(nextDue.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
