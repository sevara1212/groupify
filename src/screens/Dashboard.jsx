import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle, Calendar, CalendarDays, Loader2, Clock,
  Sparkles, ArrowRight, TrendingUp, Users, Target, ChevronRight,
  CircleCheck, Circle, Timer, Bell, MessageSquare, Shield,
  FolderOpen, FileText, ChevronLeft, ArrowLeftRight, ExternalLink, X, Link2, Upload, Settings,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { supabase } from '../lib/supabase';
import ProgressBar from '../components/ui/ProgressBar';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');
const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1'];

function dashInitials(name) {
  return (name || '?').split(/\s+/).map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

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
function QuickAction({ icon: Icon, label, desc, onClick, color, compact, className = '' }) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 w-full text-left rounded-xl transition-all duration-200 group focus:outline-none ${compact ? 'px-2.5 py-2' : 'px-4 py-3.5 gap-3.5'} ${className}`}
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
      <div className={`${compact ? 'w-8 h-8' : 'w-9 h-9'} rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}
        style={{ backgroundColor: `${color}15` }}>
        <Icon size={compact ? 14 : 16} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${compact ? 'text-xs' : 'text-sm'} font-semibold`} style={{ color: '#1C1829' }}>{label}</p>
        <p className={`${compact ? 'text-[10px]' : 'text-xs'}`} style={{ color: '#A09BB8' }}>{desc}</p>
      </div>
      {!compact && (
        <ChevronRight size={14} style={{ color: '#C4B5FD' }} className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </button>
  );
}

/* ─── Compact deadline chip (aligns with title row; bottom-aligned in hero) ─── */
function DeadlineSpotlight({ dueDate, rawDaysUntilDue, daysRemaining, memberCount }) {
  if (!dueDate) {
    return (
      <div
        className="rounded-2xl px-4 py-3 w-full sm:max-w-[280px] sm:ml-auto"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <p className="text-xs font-bold text-white/90">No due date set</p>
      </div>
    );
  }

  const dateObj = new Date(dueDate);
  const longDate = dateObj.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const shortDate = dateObj.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  const overdue = rawDaysUntilDue < 0;
  const dueToday = rawDaysUntilDue === 0;
  const urgent = !overdue && !dueToday && daysRemaining <= 3;

  let border = '1px solid rgba(255,255,255,0.65)';
  let bg = 'linear-gradient(145deg, rgba(255,255,255,0.97) 0%, rgba(248,250,252,0.98) 100%)';
  if (overdue) {
    border = '1px solid #fecaca';
    bg = 'linear-gradient(145deg, #fff1f2 0%, #ffffff 100%)';
  } else if (dueToday) {
    border = '1px solid #fcd34d';
    bg = 'linear-gradient(145deg, #fffbeb 0%, #ffffff 100%)';
  } else if (urgent) {
    border = '1px solid #fde68a';
    bg = 'linear-gradient(145deg, #fffbeb 0%, #faf5ff 100%)';
  }

  const headline = overdue ? 'Overdue' : dueToday ? 'Today' : String(daysRemaining);
  const sub = overdue ? `Was ${shortDate}` : dueToday ? longDate : daysRemaining === 1 ? 'day left' : 'days left';

  return (
    <div
      className="rounded-2xl px-4 py-3 w-full sm:max-w-[300px] sm:ml-auto shadow-lg"
      style={{
        background: bg,
        border,
        boxShadow: '0 10px 28px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: overdue ? 'linear-gradient(135deg,#e11d48,#f97316)' : 'linear-gradient(135deg,#6d28d9,#db2777)' }}
        >
          <CalendarDays size={18} color="white" strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: overdue ? '#be123c' : '#6d28d9' }}>
              Deadline
            </span>
            <span className="text-[10px] font-semibold tabular-nums" style={{ color: '#94a3b8' }}>{shortDate}</span>
          </div>

          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span
              className={`font-black tabular-nums leading-none ${overdue || dueToday ? 'text-2xl' : 'text-3xl'}`}
              style={{ color: overdue ? '#be123c' : dueToday ? '#b45309' : '#0f172a' }}
            >
              {headline}
            </span>
            {!overdue && !dueToday && (
              <span className="text-xs font-bold" style={{ color: '#64748b' }}>{sub}</span>
            )}
            {(overdue || dueToday) && (
              <span className="text-xs font-semibold" style={{ color: '#64748b' }}>{sub}</span>
            )}
          </div>

          {!overdue && !dueToday && (
            <p className="text-[11px] font-medium mt-1.5 leading-tight" style={{ color: '#64748b' }}>{longDate}</p>
          )}

          {urgent && (
            <p className="text-[10px] font-bold mt-1.5 flex items-center gap-1" style={{ color: '#c2410c' }}>
              <AlertTriangle size={11} strokeWidth={2.5} /> Soon
            </p>
          )}

          {memberCount > 0 && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t" style={{ borderColor: 'rgba(148,163,184,0.35)' }}>
              <Users size={12} style={{ color: '#94a3b8' }} strokeWidth={2.2} />
              <span className="text-[11px] font-bold" style={{ color: '#64748b' }}>
                {memberCount} member{memberCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Deadline Calendar ───────────────────────────── */
function DeadlineCalendar({ tasks, projectDueDate, compact = false }) {
  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);

  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Mon=0

  // Build a map of date string → tasks
  const dateTaskMap = {};
  tasks.forEach(t => {
    const d = t.due_date;
    if (!d) return;
    const key = d.slice(0, 10);
    if (!dateTaskMap[key]) dateTaskMap[key] = [];
    dateTaskMap[key].push(t);
  });

  const projectDueKey = projectDueDate ? projectDueDate.slice(0, 10) : null;

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr });
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const ch = compact ? 'h-7' : 'h-9';
  const fs = compact ? 'text-[10px]' : 'text-xs';
  const hdr = compact ? 'px-3 py-2' : 'px-5 py-4';
  const iconBox = compact ? 'w-6 h-6' : 'w-8 h-8';
  const calIcon = compact ? 11 : 14;
  const navBtn = compact ? 'w-6 h-6' : 'w-7 h-7';
  const chev = compact ? 12 : 14;

  return (
    <div className="bg-white rounded-2xl overflow-hidden"
      style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.06)' }}>
      <div className={`${hdr} flex items-center justify-between`}
        style={{ borderBottom: '1px solid #F5F3FF' }}>
        <div className="flex items-center gap-2">
          <div className={`${iconBox} rounded-lg flex items-center justify-center`}
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
            <Calendar size={calIcon} color="white" />
          </div>
          <h2 className={`font-extrabold ${compact ? 'text-xs' : 'text-sm'}`} style={{ color: '#1C1829' }}>Calendar</h2>
        </div>
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={() => setMonthOffset(m => m - 1)}
            className={`${navBtn} rounded-lg flex items-center justify-center`}
            style={{ color: '#8B5CF6', backgroundColor: '#F5F3FF' }}>
            <ChevronLeft size={chev} />
          </button>
          <span className={`font-bold px-1 ${compact ? 'text-[10px] min-w-[5.5rem]' : 'text-xs min-w-[120px]'} text-center`} style={{ color: '#1C1829' }}>{monthName}</span>
          <button type="button" onClick={() => setMonthOffset(m => m + 1)}
            className={`${navBtn} rounded-lg flex items-center justify-center`}
            style={{ color: '#8B5CF6', backgroundColor: '#F5F3FF' }}>
            <ChevronRight size={chev} />
          </button>
        </div>
      </div>

      <div className={compact ? 'px-2 py-2' : 'px-4 py-3'}>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className={`text-center font-bold py-0.5 ${fs}`} style={{ color: '#A09BB8' }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} className={ch} />;

            const isToday = cell.dateStr === todayStr;
            const isProjectDue = cell.dateStr === projectDueKey;
            const dayTasks = dateTaskMap[cell.dateStr] || [];
            const hasTasks = dayTasks.length > 0;
            const allDone = hasTasks && dayTasks.every(t => t.status === 'done');
            const isPast = cell.dateStr < todayStr;
            const hasOverdue = hasTasks && isPast && !allDone;

            let bg = 'transparent';
            let textColor = '#1C1829';
            let dotColor = null;

            if (isToday) { bg = '#8B5CF6'; textColor = 'white'; }
            else if (isProjectDue) { bg = '#FDF2F8'; textColor = '#BE185D'; }
            else if (hasOverdue) { bg = '#FEF2F2'; textColor = '#EF4444'; }
            else if (isPast) { textColor = '#D1D5DB'; }

            if (hasTasks && !isToday) {
              if (allDone) dotColor = '#10B981';
              else if (hasOverdue) dotColor = '#EF4444';
              else dotColor = '#8B5CF6';
            }

            return (
              <div key={cell.dateStr}
                className={`${ch} rounded-md flex flex-col items-center justify-center relative transition-all`}
                style={{ backgroundColor: bg }}
                title={hasTasks ? `${dayTasks.length} task${dayTasks.length !== 1 ? 's' : ''}: ${dayTasks.map(t => t.title).join(', ')}` : isProjectDue ? 'Project due date' : ''}>
                <span className={`${fs} font-semibold`} style={{ color: textColor }}>
                  {cell.day}
                </span>
                {dotColor && (
                  <div className="flex gap-0.5 absolute bottom-0.5">
                    {dayTasks.slice(0, 3).map((_, di) => (
                      <div key={di} className="w-1 h-1 rounded-full" style={{ backgroundColor: dotColor }} />
                    ))}
                  </div>
                )}
                {isProjectDue && !isToday && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ backgroundColor: '#EC4899' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${compact ? 'mt-1.5 pt-1.5' : 'mt-3 pt-2'}`} style={{ borderTop: '1px solid #F5F3FF' }}>
          <div className="flex items-center gap-1">
            <div className={`rounded-full ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} style={{ backgroundColor: '#8B5CF6' }} />
            <span className={compact ? 'text-[9px]' : 'text-xs'} style={{ color: '#A09BB8' }}>Upcoming</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`rounded-full ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} style={{ backgroundColor: '#10B981' }} />
            <span className={compact ? 'text-[9px]' : 'text-xs'} style={{ color: '#A09BB8' }}>Done</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`rounded-full ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} style={{ backgroundColor: '#EF4444' }} />
            <span className={compact ? 'text-[9px]' : 'text-xs'} style={{ color: '#A09BB8' }}>Late</span>
          </div>
          {projectDueDate && (
            <div className="flex items-center gap-1">
              <div className={`rounded-full ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} style={{ backgroundColor: '#EC4899' }} />
              <span className={compact ? 'text-[9px]' : 'text-xs'} style={{ color: '#A09BB8' }}>Project</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Upcoming Deadlines ──────────────────────────── */
function UpcomingDeadlines({ tasks, navigate }) {
  const upcoming = tasks
    .filter(t => t.due_date && t.status !== 'done')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  if (upcoming.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden"
      style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.06)' }}>
      <div className="px-4 py-2.5 flex items-center justify-between"
        style={{ borderBottom: '1px solid #F5F3FF' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)' }}>
            <Clock size={12} color="white" />
          </div>
          <h2 className="text-xs font-extrabold" style={{ color: '#1C1829' }}>Upcoming deadlines</h2>
        </div>
      </div>
      <div className="p-3 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {upcoming.map(task => {
            const daysLeft = Math.ceil((new Date(task.due_date) - new Date()) / 86400000);
            const isOverdue = daysLeft < 0;
            const isUrgent = daysLeft >= 0 && daysLeft <= 3;
            const dateLabel = new Date(task.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });

            return (
              <div
                key={task.id}
                className="rounded-xl p-2.5 flex flex-col justify-between min-h-[88px]"
                style={{
                  backgroundColor: isOverdue ? '#FEF2F2' : isUrgent ? '#FFFBEB' : '#F8F7FF',
                  border: `1px solid ${isOverdue ? '#FECACA' : isUrgent ? '#FDE68A' : '#EDE9FE'}`,
                }}
              >
                <p className="text-xs font-bold leading-tight line-clamp-2" style={{ color: '#1C1829' }}>{task.title}</p>
                <div className="flex items-end justify-between gap-2 mt-2">
                  <span className="text-[10px] font-medium truncate" style={{ color: '#6B7280' }}>{task.member_name || '—'}</span>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-extrabold tabular-nums leading-none" style={{ color: isOverdue ? '#B91C1C' : isUrgent ? '#C2410C' : '#5B21B6' }}>{dateLabel}</p>
                    <p className="text-[10px] font-bold tabular-nums" style={{ color: isOverdue ? '#DC2626' : isUrgent ? '#EA580C' : '#4B5563' }}>
                      {isOverdue ? `${Math.abs(daysLeft)}d over` : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Files Panel (shared links from Supabase; full UI on /files) ─── */
function FilesPanel({ projectId, navigate }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('project_files')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(12);
        if (!cancelled && !error) setLinks(data || []);
      } catch {
        if (!cancelled) setLinks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId]);

  const byFolder = {};
  links.forEach((row) => {
    const f = row.folder || 'Shared';
    if (!byFolder[f]) byFolder[f] = [];
    byFolder[f].push(row);
  });
  const folderOrder = ['Shared', 'Planning', 'References', 'Other'];
  const extraFolders = Object.keys(byFolder).filter((k) => !folderOrder.includes(k));
  const folders = [...folderOrder.filter((k) => byFolder[k]?.length), ...extraFolders];

  return (
    <div className="bg-white rounded-2xl overflow-hidden"
      style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.06)' }}>
      <div className="px-5 py-4 flex items-center justify-between gap-2" style={{ borderBottom: '1px solid #F5F3FF' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #DB2777)' }}>
            <FolderOpen size={14} color="white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold" style={{ color: '#1C1829' }}>Project Files</h2>
            <p className="text-xs font-medium truncate" style={{ color: '#6B6584' }}>
              {loading ? 'Loading…' : `${links.length} item${links.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/files')}
          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0 transition-all"
          style={{ backgroundColor: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}
        >
          Manage <ChevronRight size={12} />
        </button>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin" style={{ color: '#8B5CF6' }} />
          </div>
        ) : links.length === 0 ? (
          <div className="py-4 px-3 rounded-xl" style={{ backgroundColor: '#FAFAFF', border: '1px dashed #E9D5FF' }}>
            <p className="text-xs font-semibold mb-3 text-center" style={{ color: '#4B5563' }}>Nothing here yet</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => navigate('/files')}
                className="flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl border transition-all"
                style={{ borderColor: '#DDD6FE', color: '#6D28D9', backgroundColor: 'white' }}
              >
                <Upload size={14} strokeWidth={2.2} /> Upload
              </button>
              <button
                type="button"
                onClick={() => navigate('/files?mode=link')}
                className="flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl border transition-all"
                style={{ borderColor: '#DDD6FE', color: '#6D28D9', backgroundColor: 'white' }}
              >
                <Link2 size={14} strokeWidth={2.2} /> Add link
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {folders.map((fname) => (
              <div key={fname}>
                <p className="text-[10px] font-extrabold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>
                  {fname}
                </p>
                <div className="space-y-2">
                  {(byFolder[fname] || []).slice(0, 4).map((row) => (
                    <a
                      key={row.id}
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group"
                      style={{ backgroundColor: '#FAFAFF', border: '1px solid #F5F3FF' }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EDE9FE' }}>
                        <FileText size={14} style={{ color: '#7C3AED' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: '#111827' }}>{row.title}</p>
                        <p className="text-[11px] font-medium truncate" style={{ color: '#6B7280' }}>
                          {row.author_name || 'Team'}
                        </p>
                      </div>
                      <ExternalLink size={14} className="flex-shrink-0 opacity-60 group-hover:opacity-100" style={{ color: '#7C3AED' }} />
                    </a>
                  ))}
                </div>
              </div>
            ))}
            {links.length > 4 && (
              <button
                type="button"
                onClick={() => navigate('/files')}
                className="w-full text-xs font-bold py-2 rounded-lg"
                style={{ color: '#7C3AED', backgroundColor: '#F5F3FF' }}
              >
                View all in folder library
              </button>
            )}
          </div>
        )}
      </div>
    </div>
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
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reassignTask, setReassignTask] = useState(null);
  const [reassignSaving, setReassignSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [projRes, tasksRes, rubricRes, risksRes, membersRes] = await Promise.all([
        fetch(`${API}/projects/${projectId}`),
        fetch(`${API}/projects/${projectId}/tasks`),
        fetch(`${API}/projects/${projectId}/rubric`),
        fetch(`${API}/projects/${projectId}/risks`),
        fetch(`${API}/projects/${projectId}/members`),
      ]);
      if (!projRes.ok) throw new Error();
      const [projData, tasksData, rubricData, risksData, membersData] = await Promise.all([
        projRes.json(),
        tasksRes.ok ? tasksRes.json() : { tasks: [] },
        rubricRes.ok ? rubricRes.json() : { criteria: [] },
        risksRes.ok ? risksRes.json() : { alerts: [] },
        membersRes.ok ? membersRes.json() : { members: [] },
      ]);
      setProject(projData);
      setTasks(tasksData.tasks || []);
      setCriteria(rubricData.criteria || []);
      setAlerts((risksData.alerts || []).filter(a => !a.dismissed));
      setMembers(membersData.members || []);
    } catch { setError('Could not load dashboard data.'); }
    finally { setLoading(false); }
  }, [projectId]);

  const patchTaskMember = useCallback(async (taskId, memberId) => {
    if (!projectId) return;
    setReassignSaving(true);
    try {
      const res = await fetch(`${API}/projects/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId }),
      });
      if (res.ok) {
        setReassignTask(null);
        await fetchAll();
      }
    } catch { /* ignore */ }
    finally { setReassignSaving(false); }
  }, [projectId, fetchAll]);

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
  const rawDaysUntilDue = project?.due_date
    ? Math.ceil((new Date(project.due_date) - today) / 86_400_000)
    : null;
  const daysRemaining = rawDaysUntilDue !== null ? Math.max(0, rawDaysUntilDue) : null;
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

      {/* ── Hero Section (compact; deadline bottom-aligned with title block) ── */}
      <div className="w-full relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #5b21b6 0%, #6d28d9 42%, #9333ea 72%, #c026d3 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'radial-gradient(ellipse 80% 50% at 100% 0%, rgba(255,255,255,0.25) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 0% 100%, rgba(255,255,255,0.12) 0%, transparent 45%)',
          }}
        />
        <div className="absolute pointer-events-none top-0 right-0 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

        <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-5 pb-5 sm:pt-6 sm:pb-6 relative z-10">
          {loading ? (
            <div className="space-y-3">
              <div className="h-3.5 w-24 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <div className="h-8 w-64 max-w-full rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
              <div className="h-24 rounded-2xl max-w-[300px] sm:ml-auto" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2.5"
                    style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.22)' }}>
                    <Sparkles size={11} color="white" />
                    <span className="text-[11px] font-bold text-white tracking-wide">{greeting}</span>
                  </div>

                  <h1 className="font-extrabold text-white mb-1 leading-tight"
                    style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)', letterSpacing: '-0.03em' }}>
                    {project?.assignment_title || project?.name || 'Group Project'}
                  </h1>

                  {project?.course_name && (
                    <p className="text-sm font-semibold leading-snug" style={{ color: 'rgba(255,255,255,0.88)' }}>
                      {project.course_name}
                    </p>
                  )}
                </div>

                <div className="w-full sm:w-auto sm:flex-shrink-0">
                  <DeadlineSpotlight
                    dueDate={project?.due_date}
                    rawDaysUntilDue={rawDaysUntilDue}
                    daysRemaining={daysRemaining}
                    memberCount={members.length}
                  />
                </div>
              </div>

              {tasks.length > 0 && (
                <div className="mt-5 pt-5 flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 border-t border-white/15">
                  <div
                    className="flex-shrink-0 flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-0 rounded-2xl px-4 py-3 sm:py-4 mx-auto sm:mx-0 sm:min-w-[120px]"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.14)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.22)',
                    }}
                  >
                    <ProgressRing value={overallProgress} size={72} strokeWidth={6} />
                    <p className="text-[10px] font-extrabold sm:mt-2 tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.88)' }}>Overall</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 flex-1 min-w-0">
                    {[
                      { label: 'Tasks', value: `${tasksDone}/${tasks.length}`, icon: CheckCircle, color: '#34d399' },
                      { label: 'Active', value: tasksInProgress, icon: TrendingUp, color: '#fbbf24' },
                      { label: 'Rubric', value: `${rubricCoverage}%`, icon: Target, color: '#f472b6' },
                    ].map(s => (
                      <div
                        key={s.label}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.12)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        <s.icon size={15} style={{ color: s.color, flexShrink: 0 }} strokeWidth={2.4} />
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-white leading-none tabular-nums">{s.value}</p>
                          <p className="text-[10px] mt-0.5 font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 pb-12 pt-2 relative z-10">
        {error && (
          <div className="bg-white rounded-2xl px-5 py-4 mb-5 flex items-start gap-3"
            style={{ border: '1px solid #FDE68A', boxShadow: '0 2px 12px rgba(217,119,6,0.08)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF3C7' }}>
              <AlertTriangle size={15} style={{ color: '#D97706' }} />
            </div>
            <p className="text-sm font-medium flex-1 pt-1" style={{ color: '#92400E' }}>{error}</p>
            <button className="text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all"
              style={{ backgroundColor: '#FEF3C7', color: '#D97706' }} onClick={fetchAll}>Retry</button>
          </div>
        )}

        {/* Alert Banner */}
        {!loading && alerts.length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-5 flex items-center gap-4 relative z-20"
            style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 20px rgba(15,23,42,0.08)' }}>
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', boxShadow: '0 4px 12px rgba(245,158,11,0.25)' }}>
                <Bell size={17} color="white" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center"
                style={{ backgroundColor: '#EF4444', fontSize: 9, fontWeight: 700 }}>
                {alerts.length}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: '#1C1829' }}>{alerts[0].message}</p>
              <p className="text-xs mt-0.5" style={{ color: '#A09BB8' }}>
                {alerts.length === 1 ? '1 alert needs attention' : `${alerts.length} alerts need attention`}
              </p>
            </div>
            <button onClick={() => navigate('/risk-alerts')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', color: 'white', boxShadow: '0 2px 8px rgba(139,92,246,0.25)' }}>
              View <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard loading={loading}
            value={rawDaysUntilDue !== null && rawDaysUntilDue < 0 ? 'Late' : daysRemaining !== null ? `${daysRemaining}d` : '—'} label="Days Left"
            sub={rawDaysUntilDue !== null && rawDaysUntilDue < 0
              ? `Was ${new Date(project.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
              : daysRemaining !== null && daysRemaining <= 3 ? '⚠️ Due soon!' : (project?.due_date ? new Date(project.due_date).toLocaleDateString('en-AU', { day:'numeric', month:'short' }) : undefined)}
            icon={Clock} iconColor="#8B5CF6" iconBg="#F5F3FF" />
          <StatCard loading={loading}
            value={`${tasksDone}/${tasks.length}`} label="Tasks Done"
            sub={tasksInProgress > 0 ? `${tasksInProgress} in progress` : 'Tap to manage'}
            icon={CheckCircle} iconColor="#0D9488" iconBg="#ECFDF5"
            onClick={() => navigate('/tasks')} />
          <StatCard loading={loading}
            value={`${rubricCoverage}%`} label="Rubric Covered"
            sub={criteria.length > 0 ? `${coveredCriteria} of ${criteria.length} criteria` : undefined}
            icon={Target} iconColor="#EC4899" iconBg="#FDF2F8"
            onClick={() => navigate('/rubric')} />
          <StatCard loading={loading}
            value={members.length || '—'} label="Team Members"
            sub={members.length > 0 ? `${members.filter(m => m.quiz_done).length} quiz done` : 'Join via code'}
            icon={Users} iconColor="#6366F1" iconBg="#EEF2FF" />
        </div>

        {/* Tasks full width, then 3-column widget grid (no skinny sidebar) */}
        <div className="space-y-6">
          <div className="min-w-0">
            <div className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.06)' }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#F5F3FF]">
                {/* Recent Tasks — left */}
                <div className="min-w-0">
                  <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-2"
                    style={{ borderBottom: '1px solid #F5F3FF' }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
                        <CheckCircle size={13} color="white" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm font-extrabold truncate" style={{ color: '#1C1829' }}>Recent tasks</h2>
                        {!loading && tasks.length > 0 && (
                          <p className="text-[11px] truncate" style={{ color: '#A09BB8' }}>{tasksDone}/{tasks.length} done</p>
                        )}
                      </div>
                    </div>
                    <button type="button" className="text-[11px] font-bold flex items-center gap-0.5 px-2.5 py-1 rounded-lg flex-shrink-0"
                      style={{ color: '#8B5CF6', backgroundColor: '#F5F3FF' }}
                      onClick={() => navigate('/tasks')}>
                      All <ChevronRight size={11} />
                    </button>
                  </div>
                  <div className="px-4 py-2 max-h-[280px] overflow-y-auto">
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
                      const daysLeft = task.due_date ? Math.ceil((new Date(task.due_date) - new Date()) / 86400000) : null;
                      const isOverdue = daysLeft !== null && daysLeft < 0 && !isDone;
                      return (
                        <div key={task.id}
                          className="flex items-center gap-2.5 py-2.5 transition-all duration-200"
                          style={{ borderBottom: idx < Math.min(tasks.length, 5) - 1 ? '1px solid #F5F3FF' : 'none' }}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: isDone ? '#ECFDF5' : isInProgress ? '#F5F3FF' : '#FAFAFA' }}>
                            {isDone ? <CircleCheck size={14} style={{ color: '#0D9488' }} />
                              : isInProgress ? <Timer size={14} style={{ color: '#8B5CF6' }} />
                              : <Circle size={14} style={{ color: '#D8D3F0' }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium block truncate"
                              style={{ color: isDone ? '#A09BB8' : '#1C1829', textDecoration: isDone ? 'line-through' : 'none' }}>
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {task.member_name && <span className="text-xs font-medium" style={{ color: '#6B7280' }}>{task.member_name}</span>}
                              {task.due_date && (
                                <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-md"
                                  style={{
                                    color: isOverdue ? '#991B1B' : daysLeft !== null && daysLeft <= 3 ? '#9A3412' : '#374151',
                                    backgroundColor: isOverdue ? '#FEE2E2' : daysLeft !== null && daysLeft <= 3 ? '#FFEDD5' : '#F3F4F6',
                                  }}>
                                  {new Date(task.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                                  {isOverdue ? ' · overdue' : daysLeft === 0 ? ' · today' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              className="text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                              style={{ color: '#2563EB', border: '1px solid #BFDBFE', backgroundColor: '#EFF6FF' }}
                              onClick={(e) => { e.stopPropagation(); setReassignTask(task); }}
                            >
                              <ArrowLeftRight size={11} /> Move
                            </button>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: isDone ? '#ECFDF5' : isInProgress ? '#F5F3FF' : '#FAFAFA',
                                color: isDone ? '#0D9488' : isInProgress ? '#8B5CF6' : '#A09BB8',
                              }}>
                              {isDone ? 'Done' : isInProgress ? 'Active' : 'Todo'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                  </div>
                </div>

                {/* Team progress — right column on lg+ */}
                <div className="min-w-0 flex flex-col border-t lg:border-t-0"
                  style={{ borderColor: '#F5F3FF' }}>
                  <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-2"
                    style={{ borderBottom: '1px solid #F5F3FF' }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                        <Users size={13} color="white" />
                      </div>
                      <h2 className="text-sm font-extrabold truncate" style={{ color: '#1C1829' }}>Team progress</h2>
                    </div>
                    {members.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                        {members.length} people
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-3 max-h-[280px] overflow-y-auto">
                    {loading ? (
                      <div className="space-y-3">{[0,1,2].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
                    ) : memberContribs.length === 0 ? (
                      <div className="py-6 text-center">
                        <p className="text-xs" style={{ color: '#A09BB8' }}>No tasks assigned yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {memberContribs.map(({ id, name, avg, taskCount, color }) => (
                          <div key={id} className="flex items-center gap-2.5">
                            <Avatar name={name} color={color} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-xs font-bold truncate" style={{ color: '#1C1829' }}>{name}</span>
                                <span className="text-[10px] font-bold tabular-nums flex-shrink-0" style={{ color }}>{avg}%</span>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                                  style={{ backgroundColor: `${color}12`, color }}>
                                  {taskCount} tasks
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
                                <div className="h-2 rounded-full transition-all duration-700"
                                  style={{
                                    width: `${avg}%`,
                                    background: `linear-gradient(90deg,${color},${color}CC)`,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
            <div className="space-y-4 min-w-0">
              <div className="bg-white rounded-2xl overflow-hidden"
                style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.06)' }}>
                <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #F5F3FF' }}>
                  <h2 className="text-xs font-extrabold" style={{ color: '#1C1829' }}>Quick actions</h2>
                </div>
                <div className="p-2.5 grid grid-cols-2 gap-2">
                  <QuickAction compact icon={CheckCircle} label="Tasks" desc="To-dos"
                    color="#0D9488" onClick={() => navigate('/tasks')} />
                  <QuickAction compact icon={Target} label="Rubric" desc="Coverage"
                    color="#EC4899" onClick={() => navigate('/rubric')} />
                  <QuickAction compact icon={Shield} label="Alerts" desc={`${alerts.length} active`}
                    color="#D97706" onClick={() => navigate('/risk-alerts')} />
                  <QuickAction compact icon={MessageSquare} label="Chat" desc="Messages"
                    color="#6366F1" onClick={() => navigate('/messages')} />
                  <QuickAction compact icon={Settings} label="Settings" desc="This device"
                    color="#64748B" onClick={() => navigate('/settings')} className="col-span-2" />
                </div>
              </div>
              {!loading && <DeadlineCalendar tasks={tasks} projectDueDate={project?.due_date} compact />}
            </div>

            <div className="space-y-4 min-w-0">
              {!loading && <UpcomingDeadlines tasks={tasks} navigate={navigate} />}
              <FilesPanel projectId={projectId} navigate={navigate} />
            </div>

            <div className="min-w-0 md:col-span-2 xl:col-span-1">
              <div className="bg-white rounded-2xl overflow-hidden h-full"
                style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.06)' }}>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid #F5F3FF' }}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold" style={{ color: '#1C1829' }}>Rubric Coverage</h2>
                    <span className="text-sm font-extrabold" style={{ color: '#EC4899' }}>{rubricCoverage}%</span>
                  </div>
                  {!loading && criteria.length > 0 && (
                    <div className="w-full h-2.5 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: '#E9D5FF' }}>
                      <div className="h-2.5 rounded-full transition-all duration-700"
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
                              {isCovered ? <CircleCheck size={12} style={{ color: '#0D9488' }} />
                                : isIP ? <TrendingUp size={12} style={{ color: '#8B5CF6' }} />
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
        </div>
      </main>

      {reassignTask && members.length > 0 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-5"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
          onClick={() => !reassignSaving && setReassignTask(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #F5F3FF', background: 'linear-gradient(135deg,#F5F3FF,#FDF2F8)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8B5CF6' }}>Reassign task</p>
                  <p className="text-sm font-bold leading-snug" style={{ color: '#1C1829' }}>{reassignTask.title}</p>
                </div>
                <button
                  type="button"
                  disabled={reassignSaving}
                  onClick={() => setReassignTask(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'white', color: '#8B5CF6', border: '1px solid #EDE9FE' }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-2 max-h-[min(60vh,320px)] overflow-y-auto">
              <p className="text-xs font-semibold mb-1" style={{ color: '#A09BB8' }}>Assign to:</p>
              {members
                .filter((m) => m.id !== reassignTask.member_id)
                .map((m, mi) => {
                  const col = MEMBER_COLORS[mi % MEMBER_COLORS.length];
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={reassignSaving}
                      onClick={() => patchTaskMember(reassignTask.id, m.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                      style={{ border: '1.5px solid #EDE9FE', backgroundColor: 'white' }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${col}, ${col}bb)` }}
                      >
                        {dashInitials(m.name)}
                      </div>
                      <span className="text-sm font-semibold flex-1 truncate" style={{ color: '#1C1829' }}>{m.name}</span>
                      {reassignSaving && <Loader2 size={14} className="animate-spin flex-shrink-0" style={{ color: '#8B5CF6' }} />}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .skeleton{background:linear-gradient(90deg,#EDE9FE 25%,#F5F3FF 50%,#EDE9FE 75%);background-size:200% 100%;border-radius:8px;animation:shimmer 1.5s infinite}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>
    </div>
  );
}
