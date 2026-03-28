import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

const TYPE_CONFIG = {
  overdue:   { icon: AlertCircle,   color: '#92400E', bg: '#FEF3C7', border: '#FDE68A', accent: '#D97706', label: 'Overdue' },
  at_risk:   { icon: AlertTriangle, color: '#92400E', bg: '#FEF3C7', border: '#FDE68A', accent: '#D97706', label: 'At Risk' },
  imbalance: { icon: AlertTriangle, color: '#6D28D9', bg: '#EDE9FE', border: '#C4B5FD', accent: '#8B5CF6', label: 'Imbalance' },
};

export default function RiskAlerts() {
  const navigate = useNavigate();
  const { projectId } = useProject();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissing, setDismissing] = useState(null);

  useEffect(() => {
    fetch(`${API}/projects/${projectId}/risks`)
      .then(r => r.json())
      .then(data => setAlerts(data.alerts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleDismiss = async (alert) => {
    setDismissing(alert.id);
    try {
      await fetch(`${API}/risks/${alert.id}/dismiss`, { method: 'POST' });
      setAlerts(prev => prev.filter(a => a.id !== alert.id));
    } catch { }
    finally { setDismissing(null); }
  };

  const handleRebalance = (alert) => {
    navigate('/rebalance', { state: { task_id: alert.task_id, from_member_id: alert.member_id } });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <h1 className="text-2xl font-extrabold mb-1" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>
          Risk Alerts
        </h1>
        <p className="text-sm mb-7" style={{ color: '#6B6584' }}>
          Issues detected in your group that may need attention.
        </p>

        {loading ? (
          <div className="flex items-center gap-3 py-12 justify-center">
            <Loader2 size={22} className="animate-spin" style={{ color: '#8B5CF6' }} />
            <span className="text-sm font-medium" style={{ color: '#6B6584' }}>Loading alerts…</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="rounded-3xl p-12 flex flex-col items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)', border: '1px solid #EDE9FE' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', boxShadow: '0 8px 20px rgba(139,92,246,0.25)' }}>
              <CheckCircle size={28} color="white" />
            </div>
            <div className="text-center">
              <p className="text-base font-extrabold mb-1" style={{ color: '#1C1829' }}>All clear!</p>
              <p className="text-sm" style={{ color: '#6B6584' }}>No active risks — your group is on track.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map(alert => {
              const cfg = TYPE_CONFIG[alert.type] || TYPE_CONFIG.at_risk;
              const Icon = cfg.icon;
              const canRebalance = !!alert.task_id && !!alert.member_id;
              return (
                <div key={alert.id} className="bg-white rounded-2xl overflow-hidden"
                  style={{ border: '1px solid #EDE9FE', boxShadow: '0 2px 12px rgba(139,92,246,0.06)', borderLeft: `4px solid ${cfg.accent}` }}>
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: cfg.bg }}>
                        <Icon size={18} style={{ color: cfg.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
                            style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                            {cfg.label}
                          </span>
                          {alert.member_name && (
                            <span className="text-xs font-medium" style={{ color: '#6B6584' }}>{alert.member_name}</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold mb-0.5" style={{ color: '#1C1829' }}>{alert.message}</p>
                        {alert.task_title && (
                          <p className="text-xs" style={{ color: '#A09BB8' }}>Task: {alert.task_title}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <button onClick={() => handleDismiss(alert)} disabled={dismissing === alert.id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                        style={{ border: '1px solid #EDE9FE', color: '#6B6584' }}>
                        {dismissing === alert.id
                          ? <Loader2 size={12} className="animate-spin inline" />
                          : 'Dismiss'}
                      </button>
                      {canRebalance && (
                        <Button variant="warning" onClick={() => handleRebalance(alert)} className="gap-1.5 text-xs py-1.5">
                          Rebalance <ArrowRight size={12} />
                        </Button>
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
