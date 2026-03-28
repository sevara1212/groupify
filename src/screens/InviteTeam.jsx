import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Mail, CheckCircle, Clock, ArrowRight, Bell, UserPlus, Loader2 } from 'lucide-react';
import StepProgressBar from '../components/ui/StepProgressBar';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { useProject } from '../context/ProjectContext';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

const STATUS_CFG = {
  quizDone:    { label: 'Quiz Done',    icon: CheckCircle, color: '#8B5CF6', bg: '#F5F3FF', border: '#C4B5FD' },
  quizPending: { label: 'Quiz Pending', icon: Clock,       color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
  invited:     { label: 'Invited',      icon: Mail,        color: '#A09BB8', bg: '#F5F5F5', border: '#E5E7EB' },
};

const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1', '#DC2626', '#16A34A'];

function StatusBadge({ type }) {
  const c = STATUS_CFG[type] || STATUS_CFG.invited;
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
      style={{ color: c.color, backgroundColor: c.bg, borderColor: c.border }}>
      <Icon size={11} strokeWidth={2.5} />
      {c.label}
    </span>
  );
}

export default function InviteTeam() {
  const navigate = useNavigate();
  const { projectId } = useProject();
  const [copied, setCopied] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  // Build a unique join URL using the project ID
  const joinUrl = `${window.location.origin}/join-group?project=${projectId}`;

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch(`${API}/projects/${projectId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
    // Poll every 10s for new members / quiz status updates
    const interval = setInterval(fetchMembers, 10000);
    return () => clearInterval(interval);
  }, [fetchMembers]);

  const allDone = members.length > 0 && members.every(m => m.quiz_done);

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMember = async () => {
    if (!newName.trim() || adding) return;
    setAdding(true);
    try {
      const res = await fetch(`${API}/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setNewName('');
        fetchMembers();
      }
    } catch { /* ignore */ }
    setAdding(false);
  };

  const getStatus = (member) => {
    if (member.quiz_done) return 'quizDone';
    return 'quizPending';
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      <header className="w-full bg-white" style={{ borderBottom: '1px solid #EDE9FE' }}>
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
            <span className="text-white font-black" style={{ fontSize: 15, letterSpacing: '-0.04em' }}>G</span>
          </div>
          <span className="font-extrabold tracking-tight bg-clip-text text-transparent"
            style={{ fontSize: 20, backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
            Groupify
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <StepProgressBar currentStep={3} />

          <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 24px rgba(139,92,246,0.06)' }}>
            <h1 className="text-xl font-extrabold mb-1" style={{ color: '#1C1829' }}>Invite Your Team</h1>
            <p className="text-sm mb-7" style={{ color: '#6B6584' }}>
              Share the link below. Each member completes a short quiz so we can allocate tasks fairly.
            </p>

            {/* Unique join URL bar */}
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-6"
              style={{ border: '1px solid #EDE9FE', backgroundColor: '#F8F7FF' }}>
              <span className="flex-1 text-sm font-mono truncate" style={{ color: '#1C1829' }}>{joinUrl}</span>
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all"
                style={{ borderColor: copied ? '#C4B5FD' : '#EDE9FE', color: copied ? '#8B5CF6' : '#6B6584', backgroundColor: copied ? '#F5F3FF' : 'transparent' }}>
                <Copy size={11} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Add member manually */}
            <div className="flex items-center gap-2 mb-6">
              <input
                type="text"
                placeholder="Add member by name…"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm transition-all"
                style={{ borderColor: '#EDE9FE', color: '#1C1829', outline: 'none' }}
                onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px #EDE9FE'; }}
                onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
              />
              <button onClick={handleAddMember} disabled={!newName.trim() || adding}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
                {adding ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Add
              </button>
            </div>

            {/* Member list */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin" style={{ color: '#8B5CF6' }} />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: '#A09BB8' }}>No members yet. Add members above or share the join link.</p>
              </div>
            ) : (
              <div className="space-y-1 mb-5">
                {members.map((member, idx) => {
                  const status = getStatus(member);
                  const isPending = status !== 'quizDone';
                  return (
                    <div key={member.id}
                      className="flex items-center gap-3 py-3 px-3 rounded-xl transition-all"
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8F7FF'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <Avatar name={member.name} color={MEMBER_COLORS[idx % MEMBER_COLORS.length]} size="md" />
                      <span className="flex-1 text-sm font-semibold" style={{ color: '#1C1829' }}>{member.name}</span>
                      <StatusBadge type={status} />
                      {isPending && (
                        <button
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all"
                          style={{ borderColor: '#FDE68A', color: '#D97706' }}>
                          <Bell size={10} />
                          Remind
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {allDone && (
              <div className="rounded-xl px-4 py-3 mb-5 flex items-center gap-2.5"
                style={{ backgroundColor: '#F5F3FF', border: '1px solid #C4B5FD' }}>
                <CheckCircle size={15} style={{ color: '#8B5CF6' }} />
                <span className="text-sm font-semibold" style={{ color: '#6D28D9' }}>
                  All members have completed the AI quiz!
                </span>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="filled" onClick={() => navigate('/quiz')} className="gap-2">
                Continue <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
