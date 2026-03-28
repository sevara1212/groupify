import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, CheckCircle, Clock, ArrowRight, ArrowLeft, Bell, UserPlus, Loader2, Link2 } from 'lucide-react';
import StepProgressBar from '../components/ui/StepProgressBar';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { useProject } from '../context/ProjectContext';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

const STATUS_CFG = {
  quizDone:    { label: 'Quiz Done',    icon: CheckCircle, color: '#0D9488', bg: '#ECFDF5', border: '#A7F3D0' },
  quizPending: { label: 'Quiz Pending', icon: Clock,       color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
};

const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1', '#DC2626', '#16A34A'];

function StatusBadge({ type }) {
  const c = STATUS_CFG[type] || STATUS_CFG.quizPending;
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
      style={{ color: c.color, backgroundColor: c.bg, borderColor: c.border }}>
      <Icon size={12} strokeWidth={2.5} />
      {c.label}
    </span>
  );
}

export default function InviteTeam() {
  const navigate = useNavigate();
  const { projectId } = useProject();
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/projects/${projectId}`);
        if (res.ok) {
          const proj = await res.json();
          setJoinCode(proj.join_code || '');
        }
      } catch { /* ignore */ }
    })();
  }, [projectId]);

  const joinUrl = joinCode
    ? `${window.location.origin}/join-group?code=${joinCode}`
    : `${window.location.origin}/join-group?project=${projectId}`;

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
    const interval = setInterval(fetchMembers, 10000);
    return () => clearInterval(interval);
  }, [fetchMembers]);

  const allDone = members.length > 0 && members.every(m => m.quiz_done);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      <header className="w-full bg-white/95 backdrop-blur-md" style={{ borderBottom: '1px solid #EDE9FE' }}>
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
            <span className="text-white font-black" style={{ fontSize: 16, letterSpacing: '-0.04em' }}>G</span>
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

          <div className="bg-white rounded-2xl p-8 sm:p-10 animate-scale-in"
            style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 24px rgba(139,92,246,0.06)' }}>

            <h1 className="text-2xl font-extrabold mb-2" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>
              Invite Your Team
            </h1>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: '#6B6584' }}>
              Share the join code below with your team. Each member completes a quick quiz so we can allocate tasks fairly.
            </p>

            {/* Join Code Display */}
            {joinCode && (
              <div className="text-center mb-8 rounded-2xl py-7 px-6"
                style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)', border: '1.5px solid #C4B5FD' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#8B5CF6' }}>
                  Your Join Code
                </p>
                <div className="flex items-center justify-center gap-4">
                  <p className="text-4xl font-black tracking-[0.2em] font-mono" style={{ color: '#1C1829' }}>
                    {joinCode}
                  </p>
                  <button onClick={handleCopyCode}
                    className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-200"
                    style={{
                      backgroundColor: copied ? '#8B5CF6' : 'white',
                      color: copied ? 'white' : '#8B5CF6',
                      border: `1.5px solid ${copied ? '#8B5CF6' : '#C4B5FD'}`,
                    }}>
                    {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
                <p className="text-xs mt-4 font-medium" style={{ color: '#6B6584' }}>
                  Team members go to{' '}
                  <span className="font-bold" style={{ color: '#8B5CF6' }}>{window.location.origin}/join-group</span>
                  {' '}and enter this code
                </p>
              </div>
            )}

            {/* Full Link (collapsible) */}
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-8"
              style={{ border: '1px solid #EDE9FE', backgroundColor: '#FAFAFF' }}>
              <Link2 size={14} className="flex-shrink-0" style={{ color: '#A09BB8' }} />
              <span className="flex-1 text-xs font-mono truncate" style={{ color: '#6B6584' }}>{joinUrl}</span>
              <button onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all duration-200 flex-shrink-0"
                style={{
                  borderColor: copiedLink ? '#8B5CF6' : '#EDE9FE',
                  color: copiedLink ? '#8B5CF6' : '#6B6584',
                  backgroundColor: copiedLink ? '#F5F3FF' : 'transparent',
                }}>
                <Copy size={11} />
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ backgroundColor: '#EDE9FE' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#A09BB8' }}>Or add manually</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#EDE9FE' }} />
            </div>

            {/* Add member */}
            <div className="flex items-center gap-3 mb-8">
              <input
                type="text"
                placeholder="Enter team member's name…"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                className="flex-1 px-4 py-3 rounded-xl border text-sm transition-all duration-200"
                style={{ borderColor: '#EDE9FE', color: '#1C1829', outline: 'none' }}
                onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
              />
              <Button variant="filled" onClick={handleAddMember} disabled={!newName.trim() || adding} className="gap-2 px-5">
                {adding ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
                Add
              </Button>
            </div>

            {/* Member list */}
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={24} className="animate-spin" style={{ color: '#8B5CF6' }} />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-10 rounded-2xl" style={{ backgroundColor: '#FAFAFF', border: '1px dashed #EDE9FE' }}>
                <UserPlus size={32} style={{ color: '#C4B5FD' }} className="mx-auto mb-3" />
                <p className="text-sm font-semibold" style={{ color: '#6B6584' }}>No members yet</p>
                <p className="text-xs mt-1" style={{ color: '#A09BB8' }}>Add members above or share the join code.</p>
              </div>
            ) : (
              <div className="space-y-1 mb-6">
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#A09BB8' }}>
                  Team Members ({members.length})
                </p>
                {members.map((member, idx) => {
                  const status = member.quiz_done ? 'quizDone' : 'quizPending';
                  return (
                    <div key={member.id}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200"
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAFAFF'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <Avatar name={member.name} color={MEMBER_COLORS[idx % MEMBER_COLORS.length]} size="md" />
                      <span className="flex-1 text-sm font-bold" style={{ color: '#1C1829' }}>{member.name}</span>
                      <StatusBadge type={status} />
                      {!member.quiz_done && (
                        <button
                          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all duration-200"
                          style={{ borderColor: '#FDE68A', color: '#D97706', backgroundColor: 'white' }}>
                          <Bell size={11} /> Remind
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {allDone && (
              <div className="rounded-xl px-5 py-4 mb-6 flex items-center gap-3 animate-slide-up"
                style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                <CheckCircle size={18} style={{ color: '#0D9488' }} />
                <span className="text-sm font-bold" style={{ color: '#065F46' }}>
                  All members have completed the quiz!
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-8">
              <Button variant="ghost" onClick={() => navigate('/upload')} className="gap-1.5 text-sm">
                <ArrowLeft size={14} /> Back
              </Button>
              <Button variant="filled" onClick={() => navigate('/quiz')} className="gap-2 px-7">
                Continue to Quiz <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
