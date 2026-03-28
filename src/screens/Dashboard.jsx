import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle, Calendar, Loader2, Clock,
  Sparkles, ArrowRight, TrendingUp, Users, Target, ChevronRight,
  CircleCheck, Circle, Timer, Bell, MessageSquare, Shield,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import ProgressBar from '../components/ui/ProgressBar';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');
const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1'];

function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

/* ─── Circular Progress Ring ──────────────────────── */
function ProgressRing({ value, size = 88, strokeWidth = 7 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="white" strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-extrabold text-white">{value}%</span>
      </div>
    </div>
  );
}

/* ─── Stat Card ───────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, iconColor, iconBg, loading, onClick }) {
  return (
    <div
      className="bg-white rounded-2xl p-5 transition-all duration-200 group"
      style={{
        border: '1px solid #EDE9FE',
        boxShadow: '0 1px 4px rgba(139,92,246,0.06), 0 4px 12px rgba(139,92,246,0.04)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(139,92,246,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(139,92,246,0.06), 0 4px 12px rgba(139,92,246,0.04)';
      }}
    >
      {loading ? (
        <><Skeleton className="h-8 w-16 mb-2" /><Skeleton className="h-3 w-20" /></>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-2xl font-extrabold tabular-nums" style={{ color: '#1C1829' }}>{value}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: '#6B6584' }}>{label}</p>
            {sub && <p className="text-xs mt-0.5" style={{ color: '#A09BB8' }}>{sub}</p>}
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
            style={{ backgroundColor: iconBg }}>
            <Icon size={18} style={{ color: iconColor }} strokeWidth={2.2} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Quick Action ────────────────────────────────── */
function QuickAction({ icon: Icon, label, desc, onClick, color }) {
  return (
    <button
      className="flex items-center gap-3.5 w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 group focus:outline-none"
      style={{ backgroundColor: 'white', border: '1px solid #EDE9FE' }}
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = '#F5F3FF';
        e.currentTarget.style.borderColor = '#C4B5FD';
        e.currentTarget.style.transform = 'translateX(2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = 'white';
        e.currentTarget.style.borderColor = '#EDE9FE';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
        style={{ backgroundColor: `${color}15` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#1C1829' }}>{label}</p>
        <p className="text-xs" style={{ color: '#A09BB8' }}>{desc}</p>
      </div>
      <ChevronRight size={14} style={{ color: '#C4B5FD' }} className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
    </button>
  );
}

/* ─── Main Dashboard ──────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useProject();

  const [toast, setToast] = useState(false);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [projRes, tasksRes, rubricRes, risksRes] = await Promise.all([
        fetch(`${API}/projects/${projectId}`),
        fetch(`${API}/projects/${projectId}/tasks`),
        fetch(`${API}/projects/${projectId}/rubric`),
        fetch(`${API}/projects/${projectId}/risks`),
      ]);
      if (!projRes.ok) throw new Error();
      const [projData, tasksData, rubricData, risksData] = await Promise.all([
        projRes.json(),
        tasksRes.ok ? tasksRes.json() : { tasks: [] },
        rubricRes.ok ? rubricRes.json() : { criteria: [] },
        risksRes.ok ? risksRes.json() : { alerts: [] },
      ]);
      setProject(projData);
      setTasks(tasksData.tasks || []);
      setCriteria(rubricData.criteria || []);
      setAlerts((risksData.alerts || []).filter(a => !a.dismissed));
    } catch { setError('Could not load dashboard data.'); }
    finally { setLoading(false); }
  }, [projectId]);

  const fetchRisks = useCallback(async () => {
    try {
      const res = await fetch(`${API}/projects/${projectId}/risks`);
      if (!res.ok) return;
      const data = await res.json();
      setAlerts((data.alerts || []).filter(a => !a.dismissed));
    } catch { }
  }, [projectId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (location.state?.rebalanced) {
      setToast(true); fetchAll();
      navigate('.', { replace: true, state: {} });
      const t = setTimeout(() => setToast(false), 3500);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(fetchRisks, 60_000);
    return () => clearInterval(id);
  }, [fetchRisks]);

  const today = new Date();
  const daysRemaining = project?.due_date
    ? Math.max(0, Math.ceil((new Date(project.due_date) - today) / 86_400_000))
    : null;
  const tasksDone = tasks.filter(t => t.status === 'done').length;
  const tasksInProgress = tasks.filter(t => t.status === 'in_progress').length;
  const coveredCriteria = criteria.filter(c => c.coverage_status === 'covered').length;
  const rubricCoverage = criteria.length ? Math.round((coveredCriteria / criteria.length) * 100) : 0;
  const overallProgress = tasks.length ? Math.round(tasks.reduce((s, t) => s + (t.progress_percent || 0), 0) / tasks.length) : 0;

  const memberMap = {};
  tasks.forEach(t => {
    if (!t.member_id) return;
    if (!memberMap[t.member_id]) memberMap[t.member_id] = { name: t.member_name || t.member_id, tasks: [] };
    memberMap[t.member_id].tasks.push(t.progress_percent ?? 0);
  });
  const memberContribs = Object.entries(memberMap).map(([id, { name, tasks: pcts }], idx) => ({
    id, name,
    avg: Math.round(pcts.reduce((s, v) => s + v, 0) / pcts.length),
    taskCount: pcts.length,
    color: MEMBER_COLORS[idx % MEMBER_COLORS.length],
  }));

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl"
          style={{ backgroundColor: 'white', border: '1px solid #D1FAE5', boxShadow: '0 8px 32px rgba(13,148,136,0.15)', animation: 'slideUp 300ms ease' }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ECFDF5' }}>
            <CheckCircle size={14} style={{ color: '#0D9488' }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: '#1C1829' }}>Plan updated — risk resolved</span>
        </div>
      )}

      {/* ── Hero Section ── */}
      <div className="w-full" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 40%, #EC4899 100%)' }}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          {loading ? (
            <div className="space-y-3">
              <div className="h-5 w-32 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
              <div className="h-7 w-64 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white/70 mb-1">{greeting} 👋</p>
                <h1 className="text-2xl font-extrabold text-white mb-1.5" style={{ letterSpacing: '-0.02em' }}>
                  {project?.assignment_title || project?.name || 'Group Project'}
                </h1>
                {project?.course_name && (
                  <p className="text-sm text-white/60 font-medium">{project.course_name}</p>
                )}
                {project?.due_date && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                      <Calendar size={12} color="white" />
                      <span className="text-xs font-semibold text-white">
                        Due {new Date(project.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    {daysRemaining !== null && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: daysRemaining <= 3 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.15)' }}>
                        <Timer size={12} color="white" />
                        <span className="text-xs font-semibold text-white">
                          {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Ring progress */}
              {tasks.length > 0 && (
                <div className="flex-shrink-0 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <ProgressRing value={overallProgress} size={80} strokeWidth={6} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pb-12 -mt-5">
        {/* Error */}
        {error && (
          <div className="bg-white rounded-2xl px-5 py-4 mb-5 flex items-start gap-3"
            style={{ border: '1px solid #FDE68A', boxShadow: '0 2px 12px rgba(217,119,6,0.08)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF3C7' }}>
              <AlertTriangle size={15} style={{ color: '#D97706' }} />
            </div>
            <p className="text-sm font-medium flex-1 pt-1" style={{ color: '#92400E' }}>{error}</p>
            <button className="text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all"
              style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}
              onClick={fetchAll}>Retry</button>
          </div>
        )}

        {/* ── Alert Banner (modern redesign) ── */}
        {!loading && alerts.length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-5 flex items-center gap-4"
            style={{
              border: '1px solid #EDE9FE',
              boxShadow: '0 2px 12px rgba(139,92,246,0.06)',
            }}>
            {/* Alert icon with pulse */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', boxShadow: '0 4px 12px rgba(245,158,11,0.25)' }}>
                <Bell size={17} color="white" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs font-bold flex items-center justify-center"
                style={{ backgroundColor: '#EF4444', fontSize: 9 }}>
                {alerts.length}
              </span>
            </div>
            {/* Alert text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: '#1C1829' }}>
                {alerts[0].message}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#A09BB8' }}>
                {alerts.length === 1 ? '1 alert needs attention' : `${alerts.length} alerts need attention`}
              </p>
            </div>
            {/* Action button */}
            <button
              onClick={() => navigate('/risk-alerts')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(139,92,246,0.25)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,92,246,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(139,92,246,0.25)'; }}
            >
              View <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard loading={loading}
            value={daysRemaining !== null ? daysRemaining : '—'} label="Days Left"
            sub={daysRemaining !== null && daysRemaining <= 3 ? '⚠️ Due soon!' : undefined}
            icon={Clock} iconColor="#8B5CF6" iconBg="#F5F3FF" />
          <StatCard loading={loading}
            value={`${tasksDone}/${tasks.length}`} label="Tasks Done"
            sub={tasksInProgress > 0 ? `${tasksInProgress} in progress` : undefined}
            icon={CheckCircle} iconColor="#0D9488" iconBg="#ECFDF5"
            onClick={() => navigate('/tasks')} />
          <StatCard loading={loading}
            value={`${rubricCoverage}%`} label="Rubric Covered"
            sub={`${coveredCriteria} of ${criteria.length}`}
            icon={Target} iconColor="#EC4899" iconBg="#FDF2F8"
            onClick={() => navigate('/rubric')} />
          <StatCard loading={loading}
            value={memberContribs.length} label="Team Members"
            sub={memberContribs.length > 0 ? 'Active contributors' : undefined}
            icon={Users} iconColor="#6366F1" iconBg="#EEF2FF" />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Tasks + Members */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Tasks */}
            <div className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.06)' }}>
              <div className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid #F5F3FF' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
                    <CheckCircle size={14} color="white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold" style={{ color: '#1C1829' }}>Recent Tasks</h2>
                    {!loading && tasks.length > 0 && (
                      <p className="text-xs" style={{ color: '#A09BB8' }}>{tasksDone} of {tasks.length} complete</p>
                    )}
                  </div>
                </div>
                <button className="text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all"
                  style={{ color: '#8B5CF6', backgroundColor: '#F5F3FF' }}
                  onClick={() => navigate('/tasks')}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EDE9FE'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F5F3FF'; }}>
                  View all <ChevronRight size={12} />
                </button>
              </div>
              <div className="px-6 py-2">
                {loading ? (
                  <div className="space-y-3 py-3">{[0,1,2].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
                ) : tasks.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: 'linear-gradient(135deg, #F5F3FF, #FDF2F8)', border: '1px solid #EDE9FE' }}>
                      <Sparkles size={22} style={{ color: '#C4B5FD' }} />
                    </div>
                    <p className="text-sm font-bold mb-1" style={{ color: '#1C1829' }}>No tasks yet</p>
                    <p className="text-xs" style={{ color: '#A09BB8' }}>Accept the allocation plan to get started.</p>
                  </div>
                ) : (
                  <div>
                    {tasks.slice(0, 5).map((task, idx) => {
                      const isDone = task.status === 'done';
                      const isInProgress = task.status === 'in_progress';
                      return (
                        <div key={task.id}
                          className="flex items-center gap-3.5 py-3.5 transition-all duration-200"
                          style={{ borderBottom: idx < Math.min(tasks.length, 5) - 1 ? '1px solid #F5F3FF' : 'none' }}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: isDone ? '#ECFDF5' : isInProgress ? '#F5F3FF' : '#FAFAFA',
                            }}>
                            {isDone
                              ? <CircleCheck size={14} style={{ color: '#0D9488' }} />
                              : isInProgress
                                ? <Timer size={14} style={{ color: '#8B5CF6' }} />
                                : <Circle size={14} style={{ color: '#D8D3F0' }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium block truncate"
                              style={{
                                color: isDone ? '#A09BB8' : '#1C1829',
                                textDecoration: isDone ? 'line-through' : 'none',
                              }}>
                              {task.title}
                            </span>
                            {task.member_name && (
                              <span className="text-xs" style={{ color: '#A09BB8' }}>{task.member_name}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Status pill */}
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: isDone ? '#ECFDF5' : isInProgress ? '#F5F3FF' : '#FAFAFA',
                                color: isDone ? '#0D9488' : isInProgress ? '#8B5CF6' : '#A09BB8',
                              }}>
                              {isDone ? 'Done' : isInProgress ? 'Active' : 'Todo'}
                            </span>
                            <span className="text-xs font-bold tabular-nums w-8 text-right"
                              style={{ color: isDone ? '#0D9488' : '#8B5CF6' }}>
                              {task.progress_percent ?? 0}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Member Contribution */}
            <div className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.06)' }}>
              <div className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid #F5F3FF' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                    <Users size={14} color="white" />
                  </div>
                  <h2 className="text-sm font-extrabold" style={{ color: '#1C1829' }}>Team Progress</h2>
                </div>
                {memberContribs.length > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                    {memberContribs.length} member{memberContribs.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="px-6 py-4">
                {loading ? (
                  <div className="space-y-4">{[0,1,2].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : memberContribs.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm" style={{ color: '#A09BB8' }}>No tasks assigned yet.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {memberContribs.map(({ id, name, avg, taskCount, color }) => (
                      <div key={id} className="flex items-center gap-3.5">
                        <Avatar name={name} color={color} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold" style={{ color: '#1C1829' }}>{name}</span>
                              <span className="text-xs px-2 py-0.5 rounded-md font-medium"
                                style={{ backgroundColor: `${color}12`, color }}>
                                {taskCount} task{taskCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <span className="text-xs font-bold tabular-nums" style={{ color }}>{avg}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE9FE' }}>
                            <div className="h-2 rounded-full transition-all duration-700"
                              style={{ width: `${avg}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.06)' }}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid #F5F3FF' }}>
                <h2 className="text-sm font-extrabold" style={{ color: '#1C1829' }}>Quick Actions</h2>
              </div>
              <div className="p-3 space-y-2">
                <QuickAction icon={CheckCircle} label="View Tasks" desc="Manage your to-dos"
                  color="#0D9488" onClick={() => navigate('/tasks')} />
                <QuickAction icon={Target} label="Rubric" desc="Check coverage"
                  color="#EC4899" onClick={() => navigate('/rubric')} />
                <QuickAction icon={Shield} label="Risk Alerts" desc={`${alerts.length} active`}
                  color="#D97706" onClick={() => navigate('/risk-alerts')} />
                <QuickAction icon={MessageSquare} label="Messages" desc="Team chat"
                  color="#6366F1" onClick={() => navigate('/messages')} />
              </div>
            </div>

            {/* Rubric Coverage */}
            <div className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.06)' }}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid #F5F3FF' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold" style={{ color: '#1C1829' }}>Rubric Coverage</h2>
                  <span className="text-sm font-extrabold" style={{ color: '#EC4899' }}>{rubricCoverage}%</span>
                </div>
                {!loading && criteria.length > 0 && (
                  <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: '#EDE9FE' }}>
                    <div className="h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${rubricCoverage}%`, background: 'linear-gradient(90deg, #EC4899, #8B5CF6)' }} />
                  </div>
                )}
              </div>
              <div className="px-5 py-4">
                {loading ? (
                  <div className="space-y-3">{[0,1,2].map(i => <Skeleton key={i} className="h-6 w-full" />)}</div>
                ) : criteria.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: '#A09BB8' }}>No rubric criteria yet.</p>
                ) : (
                  <div className="space-y-3">
                    {criteria.slice(0, 5).map(c => {
                      const isCovered = c.coverage_status === 'covered';
                      const isIP = c.coverage_status === 'in_progress';
                      return (
                        <div key={c.id} className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: isCovered ? '#ECFDF5' : isIP ? '#F5F3FF' : '#FAFAFA' }}>
                            {isCovered
                              ? <CircleCheck size={12} style={{ color: '#0D9488' }} />
                              : isIP
                                ? <TrendingUp size={12} style={{ color: '#8B5CF6' }} />
                                : <Circle size={12} style={{ color: '#D8D3F0' }} />}
                          </div>
                          <span className="text-xs font-medium flex-1 truncate"
                            style={{ color: isCovered ? '#0D9488' : '#1C1829' }}>
                            {c.name}
                          </span>
                          {c.weight_percent != null && (
                            <span className="text-xs font-semibold tabular-nums" style={{ color: '#A09BB8' }}>
                              {c.weight_percent}%
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {criteria.length > 5 && (
                      <button className="text-xs font-semibold flex items-center gap-1 mt-1 transition-colors"
                        style={{ color: '#8B5CF6' }}
                        onClick={() => navigate('/rubric')}>
                        +{criteria.length - 5} more <ChevronRight size={10} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .skeleton{background:linear-gradient(90deg,#EDE9FE 25%,#F5F3FF 50%,#EDE9FE 75%);background-size:200% 100%;border-radius:8px;animation:shimmer 1.5s infinite}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>
    </div>
  );
}
