import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Clock, Minus, Loader2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const COVERAGE_CFG = {
  covered:     { label: 'Covered',     color: '#8B5CF6', bg: '#F5F3FF' },
  in_progress: { label: 'In Progress', color: '#EC4899', bg: '#FDF2F8' },
  partial:     { label: 'Partial',     color: '#D97706', bg: '#FEF3C7' },
  not_started: { label: 'Not Started', color: '#A09BB8', bg: '#F5F5F5' },
};

function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export default function Rubric() {
  const { projectId } = useProject();
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/projects/${projectId}/rubric`)
      .then(r => r.ok ? r.json() : { criteria: [] })
      .then(data => setCriteria(data.criteria || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const covered = criteria.filter(c => c.coverage_status === 'covered').length;
  const pct = criteria.length ? Math.round((covered / criteria.length) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>Rubric</h1>
            <p className="text-sm mt-0.5" style={{ color: '#6B6584' }}>
              {loading ? '…' : `${covered} of ${criteria.length} criteria covered`}
            </p>
          </div>
          {!loading && criteria.length > 0 && (
            <span className="text-2xl font-extrabold" style={{ color: '#8B5CF6' }}>{pct}%</span>
          )}
        </div>

        {!loading && criteria.length > 0 && (
          <div className="mb-7 rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)', border: '1px solid #EDE9FE' }}>
            <ProgressBar value={pct} gradient showPercent={false} />
            <p className="text-xs mt-2 font-medium" style={{ color: '#8B5CF6' }}>{pct}% rubric coverage</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[0,1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
        ) : criteria.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F5F3FF, #FDF2F8)' }}>
              <BookOpen size={26} style={{ color: '#C4B5FD' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#A09BB8' }}>
              No rubric uploaded yet — upload files in step 2.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {criteria.map((c, i) => {
              const cfg = COVERAGE_CFG[c.coverage_status] || COVERAGE_CFG.not_started;
              return (
                <Card key={c.id || i} className="p-5" hover>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold" style={{ color: '#1C1829' }}>{c.name}</p>
                      {c.description && (
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6B6584' }}>{c.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-extrabold" style={{ color: '#8B5CF6' }}>
                        {c.weight_percent}%
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  {c.required_skills && c.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {c.required_skills.map((s, si) => (
                        <span key={si} className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: '#EDE9FE', color: '#6D28D9' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
