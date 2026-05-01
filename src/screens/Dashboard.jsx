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

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'https://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');
const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1'];

function dashInitials(name) {
  return (name || '?').split(/\s+/).map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

/* ─── Stat Card ───────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, iconColor, iconBg, loading, onClick, compact }) {
  const tight = !!compact;
  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl transition-all duration-200 group ${tight ? 'p-4 sm:p-5' : 'p-6 sm:p-7'}`}
      style={{
        border: '1px solid #EDE9FE',
        boxShadow: '0 2px 8px rgba(139,92,246,0.07), 0 8px 24px rgba(139,92,246,0.05)',
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
        <><Skeleton className="h-8 w-20 mb-2" /><Skeleton className="h-3 w-24" /></>
      ) : (
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <p
              className={`font-extrabold tabular-nums tracking-tight leading-none ${tight ? 'text-2xl sm:text-3xl' : 'text-4xl'}`}
              style={{ color: '#1C1829' }}
            >
              {value}
            </p>
            <p className={`font-bold ${tight ? 'text-xs sm:text-sm mt-1.5' : 'text-base mt-2'}`} style={{ color: '#4B5563' }}>{label}</p>
            {sub && (
              <p className={`mt-1 leading-snug ${tight ? 'text-[11px] sm:text-xs' : 'text-sm sm:text-base mt-1.5'}`} style={{ color: '#6B7280' }}>{sub}</p>
            )}
          </div>
          <div
            className={`${tight ? 'w-10 h-10 sm:w-11 sm:h-11' : 'w-14 h-14'} rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}
            style={{ backgroundColor: iconBg }}
          >
            <Icon size={tight ? 20 : 24} style={{ color: iconColor }} strokeWidth={2.2} />
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
      className={`flex items-center gap-2 w-full text-left rounded-2xl transition-all duration-200 group focus:outline-none ${compact ? 'px-3 py-2.5' : 'px-4 py-3.5 gap-3.5'} ${className}`}
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
      <div className={`${compact ? 'w-9 h-9' : 'w-9 h-9'} rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}
        style={{ backgroundColor: `${color}15` }}>
        <Icon size={compact ? 16 : 16} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${compact ? 'text-sm' : 'text-sm'} font-semibold`} style={{ color: '#1C1829' }}>{label}</p>
        <p className={`${compact ? 'text-xs' : 'text-xs'}`} style={{ color: '#A09BB8' }}>{desc}</p>
      </div>
      {!compact && (
        <ChevronRight size={14} style={{ color: '#C4B5FD' }} className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </button>
  );
}

/* ─── Minimal deadline pill (short hero — keep tiny) ─── */
function DeadlineSpotlight({ dueDate, rawDaysUntilDue, daysRemaining, memberCount }) {
  if (!dueDate) {
    return (
      <div
        className="rounded-lg px-2.5 py-1.5 w-full sm:w-auto sm:ml-auto"
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
        }}
      >
        <p className="text-[10px] font-bold text-white/85">No due date</p>
      </div>
    );
  }

  const dateObj = new Date(dueDate);
  const shortDate = dateObj.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  const overdue = rawDaysUntilDue < 0;
  const dueToday = rawDaysUntilDue === 0;
  const urgent = !overdue && !dueToday && daysRemaining <= 3;

  let border = '1px solid rgba(255,255,255,0.5)';
  let bg = 'rgba(255,255,255,0.95)';
  if (overdue) {
    border = '1px solid #fecaca';
    bg = '#fff1f2';
  } else if (dueToday) {
    border = '1px solid #fcd34d';
    bg = '#fffbeb';
  } else if (urgent) {
    border = '1px solid #fde68a';
    bg = '#fffbeb';
  }

  return (
    <div
      className="rounded-2xl pl-3 pr-3.5 py-2.5 w-full sm:w-auto sm:max-w-[min(100%,290px)] sm:ml-auto"
      style={{
        background: bg,
        border,
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: overdue ? 'linear-gradient(135deg,#e11d48,#f97316)' : 'linear-gradient(135deg,#6d28d9,#db2777)' }}
        >
          <CalendarDays size={16} color="white" strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            {overdue && (
              <span className="text-lg font-black leading-none" style={{ color: '#be123c' }}>Overdue</span>
            )}
            {dueToday && !overdue && (
              <span className="text-lg font-black leading-none" style={{ color: '#b45309' }}>Due today</span>
            )}
            {!overdue && !dueToday && (
              <>
                <span className="text-3xl font-black tabular-nums leading-none" style={{ color: '#0f172a' }}>{daysRemaining}</span>
                <span className="text-sm font-bold leading-none" style={{ color: '#64748b' }}>days left</span>
                {urgent && <AlertTriangle size={13} className="flex-shrink-0" style={{ color: '#c2410c' }} strokeWidth={2.5} />}
              </>
            )}
          </div>
          <p className="text-sm font-medium truncate mt-1" style={{ color: '#64748b' }}>
            {shortDate}
            {memberCount > 0 ? ` · ${memberCount} members` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Deadline Calendar ───────────────────────────── */
function DeadlineCalendar({ tasks, projectDueDate, compact = false, large = false }) {
  const useLarge = large && !compact;
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

  const ch = compact ? 'h-7' : useLarge ? 'min-h-[2.75rem] sm:min-h-[3.25rem]' : 'h-9';
  const fs = compact ? 'text-[10px]' : useLarge ? 'text-sm sm:text-base' : 'text-xs';
  const hdr = compact ? 'px-3 py-2' : useLarge ? 'px-5 sm:px-6 py-4 sm:py-5' : 'px-5 py-4';
  const iconBox = compact ? 'w-6 h-6' : useLarge ? 'w-10 h-10 sm:w-11 sm:h-11' : 'w-8 h-8';
  const calIcon = compact ? 11 : useLarge ? 18 : 14;
  const navBtn = compact ? 'w-6 h-6' : useLarge ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-7 h-7';
  const chev = compact ? 12 : useLarge ? 18 : 14;
  const gridGap = useLarge ? 'gap-1 sm:gap-1.5' : 'gap-0.5';

  return (
    <div
      className="bg-white rounded-3xl"
      style={{ border: '1px solid #EDE9FE', boxShadow: '0 2px 12px rgba(139,92,246,0.07), 0 4px 20px rgba(15,23,42,0.04)' }}
    >
      <div
        className={`${hdr} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0`}
        style={{ borderBottom: '1px solid #F5F3FF' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`${iconBox} rounded-xl flex items-center justify-center flex-shrink-0`}
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
            <Calendar size={calIcon} color="white" />
          </div>
          <h2 className={`font-extrabold truncate ${compact ? 'text-sm' : useLarge ? 'text-lg sm:text-xl' : 'text-base'}`} style={{ color: '#1C1829' }}>Calendar</h2>
        </div>
        {/* Month nav: both arrows always visible (narrow columns were clipping the forward btn with overflow-hidden + wide month label) */}
        <div className="flex items-center justify-center sm:justify-end gap-1 flex-shrink-0 w-full sm:w-auto">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setMonthOffset((m) => m - 1)}
            className={`${navBtn} rounded-xl flex items-center justify-center flex-shrink-0`}
            style={{ color: '#8B5CF6', backgroundColor: '#F5F3FF' }}
          >
            <ChevronLeft size={chev} />
          </button>
          <span
            className={`font-bold px-2 min-w-0 text-center ${compact ? 'text-[10px] max-w-[7rem]' : useLarge ? 'text-sm sm:text-base max-w-[11rem] sm:max-w-[13rem]' : 'text-xs max-w-[10rem]'}`}
            style={{ color: '#1C1829' }}
          >
            {monthName}
          </span>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setMonthOffset((m) => m + 1)}
            className={`${navBtn} rounded-xl flex items-center justify-center flex-shrink-0`}
            style={{ color: '#8B5CF6', backgroundColor: '#F5F3FF' }}
          >
            <ChevronRight size={chev} />
          </button>
        </div>
      </div>

      <div className={compact ? 'px-2 py-2' : useLarge ? 'px-4 sm:px-6 py-4 sm:py-5' : 'px-4 py-3'}>
        {/* Day headers */}
        <div className={`grid grid-cols-7 ${gridGap} mb-1`}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className={`text-center font-bold py-1 ${useLarge ? 'text-xs sm:text-sm' : fs}`} style={{ color: '#A09BB8' }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className={`grid grid-cols-7 ${gridGap}`}>
          {cells.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} className={ch} />;

            const isToday = cell.dateStr === todayStr;
            const isProjectDue = cell.dateStr === projectDueKey;
            const dayTasks = dateTaskMap[cell.dateStr] || [];
            const hasTasks = dayTasks.length > 0;
            const allDone = hasTasks && dayTasks.every(t => t.status === 'done');
            const isPast = cell.dateStr < todayStr;
            const isFuture = cell.dateStr > todayStr;
            const hasOverdue = hasTasks && isPast && !allDone;
            const hasOpenFuture = hasTasks && isFuture && !allDone;
            const [cy, cm, cd] = cell.dateStr.split('-').map(Number);
            const cellLocal = new Date(cy, cm - 1, cd);
            const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const daysUntilCell = Math.round((cellLocal - todayLocal) / 86400000);
            const dueSoon = hasOpenFuture && daysUntilCell > 0 && daysUntilCell <= 3;

            let bg = 'transparent';
            let textColor = '#1C1829';
            let dotColor = null;

            if (isToday) {
              bg = '#8B5CF6';
              textColor = 'white';
            } else if (isProjectDue) {
              bg = isPast ? '#FCE7F3' : '#FDF2F8';
              textColor = '#BE185D';
            } else if (hasOverdue) {
              bg = '#FEF2F2';
              textColor = '#B91C1C';
            } else if (dueSoon) {
              bg = '#FFFBEB';
              textColor = '#9A3412';
            } else if (hasOpenFuture) {
              bg = '#F5F3FF';
              textColor = '#5B21B6';
            } else if (isPast && !hasTasks) {
              textColor = '#D1D5DB';
            } else if (isPast && allDone) {
              textColor = '#9CA3AF';
            }

            if (hasTasks && !isToday) {
              if (allDone) dotColor = '#10B981';
              else if (hasOverdue) dotColor = '#EF4444';
              else if (dueSoon) dotColor = '#D97706';
              else if (hasOpenFuture) dotColor = '#7C3AED';
              else dotColor = '#8B5CF6';
            }

            return (
              <div key={cell.dateStr}
                className={`${ch} rounded-lg flex flex-col items-center justify-center relative transition-all`}
                style={{ backgroundColor: bg }}
                title={
                  hasTasks
                    ? `${dayTasks.length} task${dayTasks.length !== 1 ? 's' : ''}: ${dayTasks.map(t => t.title).join(', ')}`
                    : isProjectDue
                      ? (isFuture ? 'Project due (upcoming)' : 'Project due date')
                      : ''
                }>
                <span className={`${fs} font-semibold`} style={{ color: textColor }}>
                  {cell.day}
                </span>
                {dotColor && (
                  <div className={`flex gap-0.5 absolute ${useLarge ? 'bottom-1' : 'bottom-0.5'}`}>
                    {dayTasks.slice(0, 3).map((_, di) => (
                      <div key={di} className={`${useLarge ? 'w-1.5 h-1.5' : 'w-1 h-1'} rounded-full`} style={{ backgroundColor: dotColor }} />
                    ))}
                  </div>
                )}
                {isProjectDue && !isToday && (
                  <div className={`absolute -top-0.5 -right-0.5 ${useLarge ? 'w-2.5 h-2.5' : 'w-2 h-2'} rounded-full`} style={{ backgroundColor: '#EC4899' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 ${compact ? 'mt-1.5 pt-1.5' : useLarge ? 'mt-4 pt-3' : 'mt-3 pt-2'}`} style={{ borderTop: '1px solid #F5F3FF' }}>
          <div className="flex items-center gap-1.5">
            <div className={`rounded-full ${compact ? 'w-1.5 h-1.5' : useLarge ? 'w-2.5 h-2.5' : 'w-2 h-2'}`} style={{ backgroundColor: '#7C3AED' }} />
            <span className={compact ? 'text-[9px]' : useLarge ? 'text-xs sm:text-sm' : 'text-xs'} style={{ color: '#A09BB8' }}>Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`rounded-full ${compact ? 'w-1.5 h-1.5' : useLarge ? 'w-2.5 h-2.5' : 'w-2 h-2'}`} style={{ backgroundColor: '#F59E0B' }} />
            <span className={compact ? 'text-[9px]' : useLarge ? 'text-xs sm:text-sm' : 'text-xs'} style={{ color: '#A09BB8' }}>Due soon</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`rounded-full ${compact ? 'w-1.5 h-1.5' : useLarge ? 'w-2.5 h-2.5' : 'w-2 h-2'}`} style={{ backgroundColor: '#10B981' }} />
            <span className={compact ? 'text-[9px]' : useLarge ? 'text-xs sm:text-sm' : 'text-xs'} style={{ color: '#A09BB8' }}>Done</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`rounded-full ${compact ? 'w-1.5 h-1.5' : useLarge ? 'w-2.5 h-2.5' : 'w-2 h-2'}`} style={{ backgroundColor: '#EF4444' }} />
            <span className={compact ? 'text-[9px]' : useLarge ? 'text-xs sm:text-sm' : 'text-xs'} style={{ color: '#A09BB8' }}>Late</span>
          </div>
          {projectDueDate && (
            <div className="flex items-center gap-1.5">
              <div className={`rounded-full ${compact ? 'w-1.5 h-1.5' : useLarge ? 'w-2.5 h-2.5' : 'w-2 h-2'}`} style={{ backgroundColor: '#EC4899' }} />
              <span className={compact ? 'text-[9px]' : useLarge ? 'text-xs sm:text-sm' : 'text-xs'} style={{ color: '#A09BB8' }}>Project</span>
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
    <div className="bg-white rounded-3xl overflow-hidden"
      style={{ border: '1px solid #EDE9FE', boxShadow: '0 2px 12px rgba(139,92,246,0.07), 0 4px 20px rgba(15,23,42,0.04)' }}>
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
    <div className="bg-white rounded-3xl overflow-hidden"
      style={{ border: '1px solid #EDE9FE', boxShadow: '0 2px 12px rgba(139,92,246,0.07), 0 4px 20px rgba(15,23,42,0.04)' }}>
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

      {/* ── Hero: taller purple band + left accent (ends above quick-actions / alerts row visually) ── */}
      <div className="w-full relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #5b21b6 0%, #6d28d9 40%, #7c3aed 75%, #9333ea 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'radial-gradient(ellipse 80% 60% at 90% 0%, rgba(255,255,255,0.22) 0%, transparent 50%)',
          }}
        />
        {/* Left accent: full hero height; main content (incl. orange Alerts) sits below this band */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 z-[1] pointer-events-none rounded-r-sm"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 70%, transparent 100%)',
            boxShadow: '2px 0 12px rgba(91,33,182,0.25)',
          }}
        />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-5 pb-10 sm:pt-6 sm:pb-12 relative z-10">
          {loading ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
                  <div className="h-7 w-56 max-w-full rounded" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
                </div>
                <div className="h-16 rounded-xl w-full sm:w-56 sm:ml-auto" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[92px] sm:h-[100px] rounded-2xl bg-white p-4 flex flex-col justify-center"
                    style={{ border: '1px solid #EDE9FE', boxShadow: '0 2px 8px rgba(139,92,246,0.07)' }}
                  >
                    <Skeleton className="h-7 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-1.5"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.22)' }}>
                    <Sparkles size={12} color="white" />
                    <span className="text-xs font-bold text-white">{greeting}</span>
                  </span>
                  <h1 className="font-extrabold text-white leading-tight truncate"
                    style={{ fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)', letterSpacing: '-0.03em' }}>
                    {project?.assignment_title || project?.name || 'Group Project'}
                  </h1>
                  {project?.course_name && (
                    <p className="text-base sm:text-lg font-semibold truncate mt-1" style={{ color: 'rgba(255,255,255,0.92)' }}>
                      {project.course_name}
                    </p>
                  )}
                </div>

                <div className="w-full sm:w-auto sm:flex-shrink-0 sm:max-w-[280px]">
                  <DeadlineSpotlight
                    dueDate={project?.due_date}
                    rawDaysUntilDue={rawDaysUntilDue}
                    daysRemaining={daysRemaining}
                    memberCount={members.length}
                  />
                </div>
              </div>

              <div
                className="mt-6 pt-6 border-t grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <StatCard compact loading={false}
                  value={rawDaysUntilDue !== null && rawDaysUntilDue < 0 ? 'Late' : daysRemaining !== null ? `${daysRemaining}d` : '—'} label="Days Left"
                  sub={rawDaysUntilDue !== null && rawDaysUntilDue < 0
                    ? `Was ${new Date(project?.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
                    : daysRemaining !== null && daysRemaining <= 3 ? 'Due soon' : (project?.due_date ? new Date(project.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : undefined)}
                  icon={Clock} iconColor="#8B5CF6" iconBg="#F5F3FF" />
                <StatCard compact loading={false}
                  value={`${tasksDone}/${tasks.length}`} label="Tasks Done"
                  sub={tasksInProgress > 0 ? `${tasksInProgress} in progress` : 'Tap to manage'}
                  icon={CheckCircle} iconColor="#0D9488" iconBg="#ECFDF5"
                  onClick={() => navigate('/tasks')} />
                <StatCard compact loading={false}
                  value={`${rubricCoverage}%`} label="Rubric Covered"
                  sub={criteria.length > 0 ? `${coveredCriteria} of ${criteria.length} criteria` : undefined}
                  icon={Target} iconColor="#EC4899" iconBg="#FDF2F8"
                  onClick={() => navigate('/rubric')} />
                <StatCard compact loading={false}
                  value={members.length || '—'} label="Team Members"
                  sub={members.length > 0 ? `${members.filter(m => m.quiz_done).length} quiz done` : 'Join via code'}
                  icon={Users} iconColor="#6366F1" iconBg="#EEF2FF" />
              </div>
            </>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 lg:px-10 pb-14 pt-7 sm:pt-8 relative z-10">
        {error && (
          <div className="bg-white rounded-3xl px-5 py-4 mb-6 flex items-start gap-3"
            style={{ border: '1px solid #FDE68A', boxShadow: '0 2px 12px rgba(217,119,6,0.08)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF3C7' }}>
              <AlertTriangle size={15} style={{ color: '#D97706' }} />
            </div>
            <p className="text-sm font-medium flex-1 pt-1" style={{ color: '#92400E' }}>{error}</p>
            <button className="text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all"
              style={{ backgroundColor: '#FEF3C7', color: '#D97706' }} onClick={fetchAll}>Retry</button>
          </div>
        )}

        {/* Alert banner — directly above Recent tasks */}
        {!loading && alerts.length > 0 && (
          <div className="bg-white rounded-3xl p-5 mb-6 flex items-center gap-4 relative z-20"
            style={{ border: '1px solid #EDE9FE', boxShadow: '0 2px 12px rgba(139,92,246,0.08), 0 8px 28px rgba(15,23,42,0.06)' }}>
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
              <p className="text-base font-semibold leading-snug" style={{ color: '#1C1829' }}>{alerts[0].message}</p>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                {alerts.length === 1 ? '1 alert needs attention' : `${alerts.length} alerts need attention`}
              </p>
            </div>
            <button onClick={() => navigate('/risk-alerts')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', color: 'white', boxShadow: '0 2px 8px rgba(139,92,246,0.25)' }}>
              View <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* Tasks full width, then 3-column widget grid (no skinny sidebar) */}
        <div className="space-y-8">
          <div className="min-w-0 space-y-5">
            {/* Block 1 — Recent tasks (full width) */}
            <div className="bg-white rounded-3xl overflow-hidden"
              style={{ border: '1px solid #EDE9FE', boxShadow: '0 2px 12px rgba(139,92,246,0.08), 0 4px 24px rgba(15,23,42,0.04)' }}>
              <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-2"
                style={{ borderBottom: '1px solid #F5F3FF' }}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
                    <CheckCircle size={16} color="white" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-extrabold truncate" style={{ color: '#1C1829' }}>Recent tasks</h2>
                    {!loading && tasks.length > 0 && (
                      <p className="text-sm truncate font-medium" style={{ color: '#6B7280' }}>{tasksDone}/{tasks.length} done</p>
                    )}
                  </div>
                </div>
                <button type="button" className="text-sm font-bold flex items-center gap-0.5 px-3 py-1.5 rounded-xl flex-shrink-0"
                  style={{ color: '#8B5CF6', backgroundColor: '#F5F3FF' }}
                  onClick={() => navigate('/tasks')}>
                  All <ChevronRight size={14} />
                </button>
              </div>
              <div className="px-4 py-3 max-h-[320px] overflow-y-auto">
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
                          className="flex items-center gap-3 py-3.5 transition-all duration-200"
                          style={{ borderBottom: idx < Math.min(tasks.length, 5) - 1 ? '1px solid #F5F3FF' : 'none' }}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: isDone ? '#ECFDF5' : isInProgress ? '#F5F3FF' : '#FAFAFA' }}>
                            {isDone ? <CircleCheck size={18} style={{ color: '#0D9488' }} />
                              : isInProgress ? <Timer size={18} style={{ color: '#8B5CF6' }} />
                              : <Circle size={18} style={{ color: '#D8D3F0' }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-base font-semibold block leading-snug"
                              style={{ color: isDone ? '#9CA3AF' : '#111827', textDecoration: isDone ? 'line-through' : 'none' }}>
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {task.member_name && <span className="text-sm font-medium" style={{ color: '#4B5563' }}>{task.member_name}</span>}
                              {task.due_date && (
                                <span className="text-sm font-bold tabular-nums px-2.5 py-1 rounded-lg"
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
                              className="text-sm font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
                              style={{ color: '#2563EB', border: '1px solid #BFDBFE', backgroundColor: '#EFF6FF' }}
                              onClick={(e) => { e.stopPropagation(); setReassignTask(task); }}
                            >
                              <ArrowLeftRight size={14} /> Move
                            </button>
                            <span className="text-sm font-bold px-2.5 py-1 rounded-lg"
                              style={{
                                backgroundColor: isDone ? '#ECFDF5' : isInProgress ? '#F5F3FF' : '#F3F4F6',
                                color: isDone ? '#0D9488' : isInProgress ? '#8B5CF6' : '#6B7280',
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

            {/* Block 2 — Team progress (full width, progress bars below Recent tasks) */}
            <div className="bg-white rounded-3xl overflow-hidden"
              style={{ border: '1px solid #EDE9FE', boxShadow: '0 2px 12px rgba(139,92,246,0.08), 0 4px 24px rgba(15,23,42,0.04)' }}>
              <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-2"
                style={{ borderBottom: '1px solid #F5F3FF' }}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                    <Users size={16} color="white" strokeWidth={2.2} />
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold truncate" style={{ color: '#1C1829' }}>Team progress</h2>
                </div>
                {members.length > 0 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                    {members.length} people
                  </span>
                )}
              </div>
              <div className="px-4 py-3.5 sm:px-5 max-h-[360px] overflow-y-auto">
                {loading ? (
                  <div className="space-y-3">{[0,1,2].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
                ) : memberContribs.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-xs" style={{ color: '#A09BB8' }}>No tasks assigned yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {memberContribs.map(({ id, name, avg, taskCount, color }) => (
                      <div key={id} className="flex items-center gap-3">
                        <Avatar name={name} color={color} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-bold truncate" style={{ color: '#1C1829' }}>{name}</span>
                            <span className="text-sm font-extrabold tabular-nums flex-shrink-0" style={{ color }}>{avg}%</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                              style={{ backgroundColor: `${color}12`, color }}>
                              {taskCount} tasks
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
                            <div className="h-2.5 rounded-full transition-all duration-700"
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 items-stretch">
            {/* Left: Quick actions + Rubric Coverage */}
            <div className="space-y-4 min-w-0 flex flex-col">
              <div className="bg-white rounded-3xl overflow-hidden shadow-card">
                <div className="px-4 py-3.5" style={{ borderBottom: '1px solid #F5F3FF' }}>
                  <h2 className="text-sm font-extrabold" style={{ color: '#1C1829' }}>Quick actions</h2>
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

              <div className="bg-white rounded-3xl overflow-hidden flex flex-col flex-1 min-h-0 shadow-card">
                <div className="px-5 py-4" style={{ borderBottom: '1px solid #F5F3FF' }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}>
                        <Target size={15} color="white" strokeWidth={2.2} />
                      </div>
                      <h2 className="text-sm font-extrabold truncate" style={{ color: '#1C1829' }}>Rubric Coverage</h2>
                    </div>
                    <span className="text-sm font-extrabold tabular-nums flex-shrink-0" style={{ color: '#EC4899' }}>{rubricCoverage}%</span>
                  </div>
                  {!loading && criteria.length > 0 && (
                    <div className="w-full h-2.5 rounded-full mt-3 overflow-hidden" style={{ backgroundColor: '#E9D5FF' }}>
                      <div className="h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${rubricCoverage}%`, background: 'linear-gradient(90deg, #EC4899, #8B5CF6)' }} />
                    </div>
                  )}
                </div>
                <div className="px-5 py-4 flex-1">
                  {loading ? (
                    <div className="space-y-3">{[0,1,2].map(i => <Skeleton key={i} className="h-6 w-full" />)}</div>
                  ) : criteria.length === 0 ? (
                    <div className="py-8 px-2 rounded-2xl text-center" style={{ backgroundColor: '#FAFAFF', border: '1px dashed #E9D5FF' }}>
                      <p className="text-xs font-medium" style={{ color: '#A09BB8' }}>No rubric criteria yet.</p>
                      <button type="button" className="text-xs font-bold mt-2" style={{ color: '#8B5CF6' }} onClick={() => navigate('/rubric')}>Open rubric</button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {criteria.slice(0, 5).map(c => {
                        const isCovered = c.coverage_status === 'covered';
                        const isIP = c.coverage_status === 'in_progress';
                        return (
                          <div key={c.id} className="flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded-xl"
                            style={{ backgroundColor: isCovered ? '#F0FDF4' : 'transparent' }}>
                            <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: isCovered ? '#DCFCE7' : isIP ? '#F5F3FF' : '#FAFAFA' }}>
                              {isCovered ? <CircleCheck size={12} style={{ color: '#0D9488' }} />
                                : isIP ? <TrendingUp size={12} style={{ color: '#8B5CF6' }} />
                                : <Circle size={12} style={{ color: '#D8D3F0' }} />}
                            </div>
                            <span className="text-xs font-medium flex-1 truncate"
                              style={{ color: isCovered ? '#15803D' : '#1C1829' }}>
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
                        <button className="text-xs font-semibold flex items-center gap-1 mt-2 transition-colors w-full justify-center py-1.5 rounded-lg"
                          style={{ color: '#8B5CF6', backgroundColor: '#F5F3FF' }}
                          onClick={() => navigate('/rubric')}>
                          +{criteria.length - 5} more <ChevronRight size={10} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Upcoming + Project Files */}
            <div className="space-y-4 min-w-0 flex flex-col">
              {!loading && <UpcomingDeadlines tasks={tasks} navigate={navigate} />}
              <FilesPanel projectId={projectId} navigate={navigate} />
            </div>

            {/* Right: Calendar (large) */}
            <div className="min-w-0 md:col-span-2 xl:col-span-1 flex flex-col">
              {loading ? (
                <div className="bg-white rounded-3xl overflow-hidden p-5 sm:p-6 flex-1 shadow-card">
                  <Skeleton className="h-9 w-44 mb-5" />
                  <Skeleton className="min-h-[320px] sm:min-h-[360px] w-full rounded-2xl flex-1" />
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-[320px] xl:min-h-0">
                  <DeadlineCalendar tasks={tasks} projectDueDate={project?.due_date} compact={false} large />
                </div>
              )}
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
        .shadow-card{border:1px solid #EDE9FE;box-shadow:0 2px 12px rgba(139,92,246,0.07),0 4px 20px rgba(15,23,42,0.04)}
        .skeleton{background:linear-gradient(90deg,#EDE9FE 25%,#F5F3FF 50%,#EDE9FE 75%);background-size:200% 100%;border-radius:8px;animation:shimmer 1.5s infinite}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>
    </div>
  );
}
