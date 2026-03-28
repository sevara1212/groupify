import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Calendar, Loader2, Clock, BarChart2, Sparkles, ArrowRight } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Avatar from '../components/ui/Avatar';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');
const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1'];

function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

function StatCard({ label, value, sub, icon: Icon, iconColor, iconBg, loading }) {
  return (
    <Card className="p-6" hover>
      {loading ? (
        <><Skeleton className="h-8 w-16 mb-2" /><Skeleton className="h-3 w-24" /></>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-3xl font-extrabold tracking-tight" style={{ color: iconColor }}>{value}</p>
            <p className="text-sm font-semibold mt-1" style={{ color: '#1C1829' }}>{label}</p>
            {sub && <p className="text-xs mt-0.5 font-medium" style={{ color: '#A09BB8' }}>{sub}</p>}
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: iconBg }}>
            <Icon size={22} style={{ color: iconColor }} strokeWidth={2} />
          </div>
        </div>
      )}
    </Card>
  );
}

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
    color: MEMBER_COLORS[idx % MEMBER_COLORS.length],
  }));

  const activeAlert = alerts[0] ?? null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      {/* Success toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-6 py-3.5 rounded-2xl animate-slide-down"
          style={{ backgroundColor: 'white', border: '1px solid #A7F3D0', boxShadow: '0 8px 32px rgba(13,148,136,0.15)' }}>
          <CheckCircle size={18} style={{ color: '#0D9488' }} />
          <span className="text-sm font-bold" style={{ color: '#065F46' }}>Plan updated — risk resolved!</span>
        </div>
      )}

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* Error banner */}
        {error && (
          <div className="rounded-2xl px-5 py-4 mb-6 flex items-start gap-3 animate-slide-down"
            style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" style={{ color: '#D97706' }} />
            <p className="text-sm font-semibold flex-1" style={{ color: '#92400E' }}>{error}</p>
            <button className="text-xs font-bold px-4 py-2 rounded-xl"
              style={{ border: '1px solid #FDE68A', color: '#D97706', backgroundColor: 'white' }}
              onClick={fetchAll}>Retry</button>
          </div>
        )}

        {/* Risk alert banner */}
        {!loading && activeAlert && (
          <div className="rounded-2xl px-5 py-4 mb-6 flex items-center gap-3 animate-slide-down"
            style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderLeft: '4px solid #D97706' }}>
            <AlertTriangle size={16} className="flex-shrink-0" style={{ color: '#D97706' }} />
            <p className="text-sm font-medium flex-1" style={{ color: '#92400E' }}>{activeAlert.message}</p>
            <button onClick={() => navigate('/risk-alerts')}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl flex-shrink-0 transition-all duration-200"
              style={{ border: '1px solid #FDE68A', color: '#D97706', backgroundColor: 'white' }}>
              View Alerts <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* Project header */}
        <div className="mb-8">
          {loading
            ? <Skeleton className="h-8 w-64 mb-2" />
            : (
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>
                  {project?.assignment_title || project?.name || 'Group Project'}
                </h1>
                {project?.course_name && (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6', border: '1px solid #EDE9FE' }}>
                    {project.course_name}
                  </span>
                )}
              </div>
            )}
          {loading
            ? <Skeleton className="h-4 w-44 mt-2" />
            : project?.due_date && (
              <p className="text-sm flex items-center gap-2 mt-2 font-medium" style={{ color: '#6B6584' }}>
                <Calendar size={14} />
                Due {new Date(project.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                {daysRemaining !== null && daysRemaining <= 7 && (
                  <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                    {daysRemaining} days left
                  </span>
                )}
              </p>
            )}
        </div>

        {/* Overall progress banner */}
        {!loading && tasks.length > 0 && (
          <div className="mb-8 rounded-2xl p-6"
            style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)', border: '1px solid #EDE9FE' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} style={{ color: '#8B5CF6' }} />
                <p className="text-sm font-bold" style={{ color: '#1C1829' }}>Overall Progress</p>
              </div>
              <span className="text-lg font-extrabold tabular-nums" style={{ color: '#8B5CF6' }}>{overallProgress}%</span>
            </div>
            <ProgressBar value={overallProgress} gradient showPercent={false} />
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard loading={loading} value={daysRemaining !== null ? daysRemaining : '—'} label="Days Remaining"
            sub={project?.due_date ? `Due ${project.due_date}` : undefined}
            icon={Clock} iconColor="#8B5CF6" iconBg="#F5F3FF" />
          <StatCard loading={loading} value={`${tasksDone}/${tasks.length}`} label="Tasks Complete"
            icon={CheckCircle} iconColor="#0D9488" iconBg="#ECFDF5" />
          <StatCard loading={loading} value={`${rubricCoverage}%`} label="Rubric Coverage"
            sub={`${coveredCriteria} of ${criteria.length} criteria`}
            icon={BarChart2} iconColor="#EC4899" iconBg="#FDF2F8" />
        </div>

        {/* Two-column layout for member + tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Member contribution */}
          <Card className="p-6" hover>
            <h2 className="text-base font-extrabold mb-5" style={{ color: '#1C1829' }}>Member Contribution</h2>
            {loading ? (
              <div className="space-y-4">{[0,1,2,3].map(i => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : memberContribs.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm font-medium" style={{ color: '#A09BB8' }}>No tasks assigned yet.</p>
                <p className="text-xs mt-1" style={{ color: '#C4B5FD' }}>Accept the allocation plan to get started.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {memberContribs.map(({ id, name, avg, color }) => (
                  <div key={id} className="flex items-center gap-3">
                    <Avatar name={name} color={color} size="sm" />
                    <div className="flex-1">
                      <ProgressBar value={avg} color={color} label={name} showPercent />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent tasks */}
          <Card className="p-6" hover>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-extrabold" style={{ color: '#1C1829' }}>Recent Tasks</h2>
              {tasks.length > 5 && (
                <button onClick={() => navigate('/tasks')}
                  className="text-xs font-bold flex items-center gap-1 transition-colors duration-200"
                  style={{ color: '#8B5CF6' }}>
                  View all <ArrowRight size={12} />
                </button>
              )}
            </div>
            {loading ? (
              <div className="space-y-3">{[0,1,2].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm font-medium" style={{ color: '#A09BB8' }}>No tasks yet.</p>
                <p className="text-xs mt-1" style={{ color: '#C4B5FD' }}>Accept the allocation plan to populate tasks.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {tasks.slice(0, 6).map(task => (
                  <div key={task.id}
                    className="flex items-center gap-3 py-3 px-3 rounded-xl transition-all duration-200"
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAFAFF'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: task.status === 'done' ? '#ECFDF5' : '#F5F3FF' }}>
                      <CheckCircle size={14} style={{ color: task.status === 'done' ? '#0D9488' : '#C4B5FD' }} />
                    </div>
                    <span className="flex-1 text-sm font-medium truncate" style={{
                      color: '#1C1829',
                      textDecoration: task.status === 'done' ? 'line-through' : 'none',
                      opacity: task.status === 'done' ? 0.5 : 1,
                    }}>
                      {task.title}
                    </span>
                    <span className="text-xs font-bold tabular-nums" style={{ color: '#8B5CF6' }}>
                      {task.progress_percent ?? 0}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
