import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, AlertCircle, CheckCircle, Loader2, ArrowRight,
  Sparkles, RefreshCw, Users, X, ChevronRight, ArrowLeftRight, Zap,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'https://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

const TYPE_CONFIG = {
  overdue:   { icon: AlertCircle,   color: '#92400E', bg: '#FEF3C7', border: '#FDE68A', accent: '#D97706', label: 'Overdue',   ring: 'rgba(217,119,6,0.15)' },
  at_risk:   { icon: AlertTriangle, color: '#991B1B', bg: '#FEF2F2', border: '#FECACA', accent: '#EF4444', label: 'At Risk',   ring: 'rgba(239,68,68,0.12)' },
  imbalance: { icon: Users,         color: '#5B21B6', bg: '#EDE9FE', border: '#C4B5FD', accent: '#8B5CF6', label: 'Imbalance', ring: 'rgba(139,92,246,0.12)' },
};

/* ── AI Auto-Rebalance Panel ─────────────────────── */
function AutoRebalancePanel({ projectId, onDone }) {
  const [loading, setLoading] = useState(false);
  const [moves, setMoves] = useState(null);
  const [summary, setSummary] = useState('');
  const [applying, setApplying] = useState(false);
  const [done, setDone] = useState(false);

  const analyse = async () => {
    setLoading(true);
    setMoves(null);
    try {
      const res = await fetch(`${API}/projects/${projectId}/auto-rebalance`, { method: 'POST' });
      const data = await res.json();
      setMoves(data.moves || []);
      setSummary(data.summary || '');
    } catch {
      setSummary('Could not reach the server. Please try again.');
      setMoves([]);
    } finally { setLoading(false); }
  };

  const apply = async () => {
    if (!moves?.length) return;
    setApplying(true);
    try {
      await fetch(`${API}/projects/${projectId}/auto-rebalance/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moves }),
      });
      setDone(true);
      setTimeout(onDone, 1500);
    } catch {
      setSummary('Error applying changes. Please try again.');
    } finally { setApplying(false); }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
          <CheckCircle size={24} color="white" />
        </div>
        <p className="text-sm font-bold" style={{ color: '#1C1829' }}>Tasks rebalanced! 🎉</p>
      </div>
    );
  }

  return (
    <div>
      {moves === null && !loading && (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', boxShadow: '0 8px 20px rgba(139,92,246,0.25)' }}>
            <Zap size={22} color="white" />
          </div>
          <p className="text-sm font-bold mb-1" style={{ color: '#1C1829' }}>AI Auto-Fix</p>
          <p className="text-xs mb-4" style={{ color: '#6B7280' }}>Claude will analyse task distribution and suggest the fairest rebalancing.</p>
          <button onClick={analyse}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
            <Sparkles size={14} /> Analyse & Fix
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 size={24} className="animate-spin" style={{ color: '#8B5CF6' }} />
          <p className="text-xs font-medium" style={{ color: '#6B7280' }}>Claude is analysing workload…</p>
        </div>
      )}

      {moves !== null && !loading && (
        <div>
          <p className="text-xs font-semibold mb-3" style={{ color: '#6B7280' }}>{summary}</p>
          {moves.length === 0 ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7' }}>
              <CheckCircle size={14} style={{ color: '#10B981' }} />
              <span className="text-xs font-semibold" style={{ color: '#10B981' }}>All balanced — no changes needed!</span>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {moves.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ backgroundColor: '#F8F7FF', border: '1px solid #EDE9FE' }}>
                    <ArrowLeftRight size={12} style={{ color: '#8B5CF6', flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: '#1C1829' }}>{m.task_title}</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>
                        {m.from_name} → {m.to_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={analyse} disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6', border: '1px solid #C4B5FD' }}>
                  <RefreshCw size={11} /> Re-analyse
                </button>
                <button onClick={apply} disabled={applying}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', boxShadow: '0 3px 10px rgba(139,92,246,0.3)' }}>
                  {applying ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                  {applying ? 'Applying…' : `Apply ${moves.length} change${moves.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function RiskAlerts() {
  const navigate = useNavigate();
  const { projectId } = useProject();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissing, setDismissing] = useState(null);
  const [showAI, setShowAI] = useState(false);

  const fetchAlerts = async () => {
    if (!projectId) { setLoading(false); return; }
    try {
      const r = await fetch(`${API}/projects/${projectId}/risks`);
      const data = await r.json();
      setAlerts(data.alerts || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAlerts(); }, [projectId]);

  const handleDismiss = async (alert) => {
    setDismissing(alert.id);
    try {
      await fetch(`${API}/risks/${alert.id}/dismiss`, { method: 'POST' });
      setAlerts(prev => prev.filter(a => a.id !== alert.id));
    } catch {}
    finally { setDismissing(null); }
  };

  const hasImbalance = alerts.some(a => a.type === 'imbalance');

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      {/* Header */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#7C3AED 0%,#8B5CF6 50%,#EC4899 100%)' }}>
        <div className="absolute pointer-events-none" style={{ top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div className="max-w-3xl mx-auto px-6 py-7 relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
              <AlertTriangle size={16} color="white" />
            </div>
            <h1 className="text-xl font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>Risk Alerts</h1>
            {!loading && alerts.length > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(239,68,68,0.35)', color: 'white', border: '1px solid rgba(239,68,68,0.5)' }}>
                {alerts.length} active
              </span>
            )}
          </div>
          <p className="text-white/60 text-sm ml-12">Issues that may affect your group's grade</p>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-6">

        {/* AI Rebalance panel — show if there's an imbalance alert */}
        {hasImbalance && (
          <div className="bg-white rounded-2xl overflow-hidden mb-5"
            style={{ border: '1px solid #C4B5FD', boxShadow: '0 4px 20px rgba(139,92,246,0.10)' }}>
            <button
              className="w-full flex items-center justify-between px-5 py-4 transition-all"
              style={{ backgroundColor: '#F5F3FF', borderBottom: showAI ? '1px solid #EDE9FE' : 'none' }}
              onClick={() => setShowAI(v => !v)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}>
                  <Sparkles size={14} color="white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-extrabold" style={{ color: '#5B21B6' }}>AI Auto-Fix Imbalance</p>
                  <p className="text-xs" style={{ color: '#8B5CF6' }}>Let Claude redistribute tasks fairly</p>
                </div>
              </div>
              <ChevronRight size={14} style={{ color: '#8B5CF6', transform: showAI ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {showAI && (
              <div className="px-5 py-4">
                <AutoRebalancePanel projectId={projectId} onDone={() => { setShowAI(false); fetchAlerts(); }} />
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16">
            <Loader2 size={22} className="animate-spin" style={{ color: '#8B5CF6' }} />
            <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Scanning for risks…</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="rounded-3xl p-14 flex flex-col items-center gap-4"
            style={{ background: 'linear-gradient(135deg,#F5F3FF 0%,#FDF2F8 100%)', border: '1px dashed #C4B5FD' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', boxShadow: '0 8px 24px rgba(139,92,246,0.25)' }}>
              <CheckCircle size={28} color="white" />
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold mb-1" style={{ color: '#1C1829' }}>All clear! 🎉</p>
              <p className="text-sm" style={{ color: '#6B7280' }}>No active risks — your group is on track.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => {
              const cfg = TYPE_CONFIG[alert.type] || TYPE_CONFIG.at_risk;
              const Icon = cfg.icon;
              const canRebalance = !!alert.task_id && !!alert.member_id;
              return (
                <div key={alert.id}
                  className="bg-white rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    border: `1px solid ${cfg.border}`,
                    boxShadow: `0 2px 12px ${cfg.ring}`,
                    borderLeft: `4px solid ${cfg.accent}`,
                  }}>
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: cfg.bg }}>
                        <Icon size={18} style={{ color: cfg.accent }} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                            style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                            {cfg.label}
                          </span>
                          {alert.member_name && (
                            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>{alert.member_name}</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold" style={{ color: '#1C1829' }}>{alert.message}</p>
                        {alert.task_title && (
                          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Task: {alert.task_title}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => handleDismiss(alert)}
                        disabled={dismissing === alert.id}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
                        style={{ border: '1px solid #EDE9FE', color: '#6B7280', backgroundColor: 'white' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; }}>
                        {dismissing === alert.id
                          ? <Loader2 size={11} className="animate-spin" />
                          : <X size={11} />}
                        Dismiss
                      </button>
                      {canRebalance && (
                        <button
                          onClick={() => navigate('/rebalance', { state: { task_id: alert.task_id, from_member_id: alert.member_id } })}
                          className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl text-white transition-all"
                          style={{ background: `linear-gradient(135deg,${cfg.accent},${cfg.accent}cc)`, boxShadow: `0 3px 10px ${cfg.ring}` }}>
                          Rebalance <ArrowRight size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
