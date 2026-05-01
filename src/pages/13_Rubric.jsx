import React, { useEffect, useState } from 'react';
import {
  BookOpen, CheckCircle, Clock, Loader2, Target, Sparkles,
  ChevronDown, Award, Zap, Circle, Timer,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'https://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

const COVERAGE = {
  covered:     { label: 'Covered',     color: '#10B981', bg: '#ECFDF5', border: '#6EE7B7',  icon: CheckCircle, dot: '#10B981' },
  in_progress: { label: 'In Progress', color: '#8B5CF6', bg: '#F5F3FF', border: '#C4B5FD',  icon: Timer,       dot: '#8B5CF6' },
  partial:     { label: 'Partial',     color: '#D97706', bg: '#FEF3C7', border: '#FDE68A',  icon: Clock,       dot: '#D97706' },
  not_started: { label: 'Not Started', color: '#9CA3AF', bg: '#F9FAFB', border: '#E5E7EB',  icon: Circle,      dot: '#D1D5DB' },
  uncovered:   { label: 'Not Started', color: '#9CA3AF', bg: '#F9FAFB', border: '#E5E7EB',  icon: Circle,      dot: '#D1D5DB' },
};

const SKILL_COLORS = {
  academic_writing:    { bg: '#EDE9FE', color: '#6D28D9', label: '✍️ Writing' },
  research:            { bg: '#DBEAFE', color: '#1D4ED8', label: '🔍 Research' },
  data_analysis:       { bg: '#D1FAE5', color: '#065F46', label: '📊 Data' },
  design:              { bg: '#FCE7F3', color: '#9D174D', label: '🎨 Design' },
  presenting:          { bg: '#FEF3C7', color: '#92400E', label: '🎤 Presenting' },
  coding:              { bg: '#F3F4F6', color: '#111827', label: '💻 Coding' },
  project_management:  { bg: '#E0F2FE', color: '#0C4A6E', label: '📋 PM' },
};

const STAGE_CONFIG = {
  early: { label: 'Early stage', color: '#0EA5E9', bg: '#E0F2FE', icon: '🚀' },
  mid:   { label: 'Mid stage',   color: '#8B5CF6', bg: '#F5F3FF', icon: '⚡' },
  late:  { label: 'Late stage',  color: '#EC4899', bg: '#FDF2F8', icon: '🏁' },
};

const FILTERS = ['all', 'covered', 'in_progress', 'not_started'];

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 space-y-3" style={{ border: '1px solid #EDE9FE' }}>
      {[80, 55, 35, 60].map((w, i) => (
        <div key={i} className="skeleton rounded-lg" style={{ height: i === 0 ? 18 : 12, width: `${w}%` }} />
      ))}
    </div>
  );
}

/* ── Progress ring ──────────────────────────────────── */
function Ring({ value, size = 100, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="white" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (value / 100) * circ}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-extrabold text-white" style={{ fontSize: size > 80 ? 22 : 16 }}>{value}%</span>
      </div>
    </div>
  );
}

/* ── Criterion card ─────────────────────────────────── */
function CriterionCard({ criterion, index }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = COVERAGE[criterion.coverage_status] || COVERAGE.not_started;
  const stage = STAGE_CONFIG[criterion.task_stage] || STAGE_CONFIG.mid;
  const StatusIcon = cfg.icon;
  const tasks = criterion.suggested_tasks || [];

  // Weight → visual thickness
  const weightColor = criterion.weight_percent >= 30 ? '#EC4899'
    : criterion.weight_percent >= 20 ? '#8B5CF6'
    : criterion.weight_percent >= 10 ? '#0EA5E9' : '#9CA3AF';

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        border: `1px solid ${cfg.border}`,
        boxShadow: expanded ? `0 8px 32px ${cfg.dot}18` : '0 1px 4px rgba(0,0,0,0.04)',
        borderLeft: `4px solid ${weightColor}`,
      }}>
      {/* Main row */}
      <button
        className="w-full flex items-start gap-4 px-5 py-5 text-left transition-all"
        style={{ backgroundColor: expanded ? '#FAFAFF' : 'white' }}
        onClick={() => setExpanded(v => !v)}>

        {/* Weight badge */}
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${weightColor}22, ${weightColor}11)`, border: `1.5px solid ${weightColor}44` }}>
          <span className="font-extrabold leading-none" style={{ color: weightColor, fontSize: 18 }}>
            {criterion.weight_percent}
          </span>
          <span className="text-xs font-bold" style={{ color: weightColor }}>%</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold leading-snug" style={{ color: '#111827' }}>
                {criterion.name}
              </p>
              {criterion.description && !expanded && (
                <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: '#6B7280' }}>
                  {criterion.description}
                </p>
              )}
            </div>

            {/* Status pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <StatusIcon size={10} style={{ color: cfg.color }} strokeWidth={2.5} />
              <span className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
            </div>
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: stage.bg, color: stage.color }}>
              {stage.icon} {stage.label}
            </span>
            {(criterion.required_skills || []).slice(0, 3).map((s, si) => {
              const sc = SKILL_COLORS[s] || { bg: '#F3F4F6', color: '#6B7280', label: s };
              return (
                <span key={si} className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: sc.bg, color: sc.color }}>
                  {sc.label}
                </span>
              );
            })}
            {(criterion.required_skills || []).length > 3 && (
              <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
                +{criterion.required_skills.length - 3} more
              </span>
            )}
          </div>
        </div>

        <ChevronDown size={15} style={{
          color: '#C4B5FD', flexShrink: 0, marginTop: 2,
          transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
        }} />
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 pt-1" style={{ borderTop: '1px solid #F5F3FF', backgroundColor: '#FAFAFF' }}>
          {criterion.description && (
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#374151' }}>
              {criterion.description}
            </p>
          )}

          {/* All skills */}
          {(criterion.required_skills || []).length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>Required Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {criterion.required_skills.map((s, si) => {
                  const sc = SKILL_COLORS[s] || { bg: '#F3F4F6', color: '#6B7280', label: s };
                  return (
                    <span key={si} className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggested tasks */}
          {tasks.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>Suggested Tasks</p>
              <div className="space-y-1.5">
                {tasks.map((t, ti) => (
                  <div key={ti} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
                    style={{ backgroundColor: 'white', border: '1px solid #EDE9FE' }}>
                    <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `linear-gradient(135deg,${weightColor},${weightColor}99)` }}>
                      <Zap size={10} color="white" />
                    </div>
                    <p className="text-xs font-medium leading-relaxed" style={{ color: '#374151' }}>{t}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Rubric page ───────────────────────────────── */
export default function Rubric() {
  const { projectId } = useProject();
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!projectId) { setLoading(false); return; }
    fetch(`${API}/projects/${projectId}/rubric`)
      .then(r => r.ok ? r.json() : { criteria: [] })
      .then(data => setCriteria(data.criteria || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const covered = criteria.filter(c => c.coverage_status === 'covered').length;
  const inProg  = criteria.filter(c => c.coverage_status === 'in_progress').length;
  const pct = criteria.length ? Math.round((covered / criteria.length) * 100) : 0;
  const totalWeight = criteria.reduce((s, c) => s + (c.weight_percent || 0), 0);

  const filtered = filter === 'all' ? criteria
    : filter === 'not_started' ? criteria.filter(c => !c.coverage_status || c.coverage_status === 'not_started' || c.coverage_status === 'uncovered')
    : criteria.filter(c => c.coverage_status === filter);

  const FILTER_LABELS = {
    all:         `All (${criteria.length})`,
    covered:     `Covered (${criteria.filter(c => c.coverage_status === 'covered').length})`,
    in_progress: `In Progress (${inProg})`,
    not_started: `Not Started (${criteria.length - covered - inProg})`,
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 50%, #EC4899 100%)' }}>
        <div className="absolute pointer-events-none" style={{ top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div className="absolute pointer-events-none inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        <div className="max-w-4xl mx-auto px-6 pt-8 pb-10 relative z-0">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
                  <BookOpen size={16} color="white" />
                </div>
                <span className="text-white/70 text-sm font-semibold">Marking Rubric</span>
              </div>

              <h1 className="text-2xl font-extrabold text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
                {loading ? 'Loading…' : `${criteria.length} Criteria`}
              </h1>
              <p className="text-white/60 text-sm">
                {loading ? '' : `${covered} covered · ${criteria.length - covered} remaining · ${totalWeight}% total weight`}
              </p>

              {/* Mini stat pills */}
              {!loading && criteria.length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {[
                    { label: `${covered} covered`, bg: 'rgba(16,185,129,0.3)', border: 'rgba(52,211,153,0.4)' },
                    { label: `${inProg} in progress`, bg: 'rgba(139,92,246,0.35)', border: 'rgba(196,181,253,0.4)' },
                    { label: `${criteria.length - covered - inProg} not started`, bg: 'rgba(255,255,255,0.12)', border: 'rgba(255,255,255,0.2)' },
                  ].map(p => (
                    <span key={p.label} className="text-xs font-semibold text-white px-3 py-1 rounded-full"
                      style={{ backgroundColor: p.bg, border: `1px solid ${p.border}`, backdropFilter: 'blur(8px)' }}>
                      {p.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Progress ring */}
            {!loading && criteria.length > 0 && (
              <div className="flex-shrink-0 flex flex-col items-center rounded-2xl px-5 py-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Ring value={pct} size={96} stroke={8} />
                <p className="text-xs font-bold mt-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Covered</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 pb-12 pt-8 relative z-10">

        {/* Filter tabs */}
        {!loading && criteria.length > 0 && (
          <div className="bg-white rounded-2xl p-1.5 mb-5 flex gap-1 overflow-x-auto"
            style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.06)', scrollbarWidth: 'none' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="flex-1 text-xs font-bold px-3 py-2.5 rounded-xl transition-all whitespace-nowrap"
                style={{
                  backgroundColor: filter === f ? '#8B5CF6' : 'transparent',
                  color: filter === f ? 'white' : '#6B7280',
                  boxShadow: filter === f ? '0 2px 8px rgba(139,92,246,0.3)' : 'none',
                }}>
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[0,1,2,3].map(i => <Skeleton key={i} />)}
          </div>
        ) : criteria.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center animate-float"
              style={{ background: 'linear-gradient(135deg,#F5F3FF,#FDF2F8)', border: '2px dashed #C4B5FD' }}>
              <BookOpen size={32} style={{ color: '#C4B5FD' }} />
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold mb-2" style={{ color: '#1C1829' }}>No rubric yet</p>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Upload your assignment brief in step 2 to extract criteria.</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>No criteria match this filter.</p>
          </div>
        ) : (
          <div className="space-y-3 reveal">
            {/* Weight summary bar */}
            <div className="bg-white rounded-2xl px-5 py-4 mb-1"
              style={{ border: '1px solid #EDE9FE', boxShadow: '0 1px 4px rgba(139,92,246,0.04)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Weight Distribution</span>
                <span className="text-xs font-bold" style={{ color: '#8B5CF6' }}>{totalWeight}% total</span>
              </div>
              <div className="flex gap-0.5 h-3 rounded-full overflow-hidden">
                {criteria.map((c, i) => {
                  const w = totalWeight > 0 ? (c.weight_percent / totalWeight) * 100 : 0;
                  const colors = ['#8B5CF6','#EC4899','#0EA5E9','#10B981','#D97706','#6366F1'];
                  return (
                    <div key={i} style={{ width: `${w}%`, backgroundColor: colors[i % colors.length], transition: 'width 0.8s ease', minWidth: w > 0 ? 2 : 0 }}
                      title={`${c.name}: ${c.weight_percent}%`} />
                  );
                })}
              </div>
              <div className="flex gap-3 mt-2 flex-wrap">
                {criteria.map((c, i) => {
                  const colors = ['#8B5CF6','#EC4899','#0EA5E9','#10B981','#D97706','#6366F1'];
                  return (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                      <span className="text-xs" style={{ color: '#6B7280' }}>{c.name} ({c.weight_percent}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {filtered.map((c, i) => (
              <CriterionCard key={c.id || i} criterion={c} index={i} />
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .skeleton{background:linear-gradient(90deg,#EDE9FE 25%,#F5F3FF 50%,#EDE9FE 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
        .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      `}</style>
    </div>
  );
}
