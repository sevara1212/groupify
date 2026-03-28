import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Copy, Mail, CheckCircle, Clock, ArrowRight, Bell, UserPlus,
  Loader2, Share2, MessageCircle, Link2, Check, QrCode,
} from 'lucide-react';

import StepProgressBar from '../components/ui/StepProgressBar';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9', '#0D9488', '#6366F1', '#DC2626', '#16A34A'];

function StatusBadge({ done }) {
  return done ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
      style={{ color: '#8B5CF6', backgroundColor: '#F5F3FF', borderColor: '#C4B5FD' }}>
      <CheckCircle size={11} strokeWidth={2.5} /> Quiz Done
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
      style={{ color: '#D97706', backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }}>
      <Clock size={11} strokeWidth={2.5} /> Pending
    </span>
  );
}

export default function InviteTeam() {
  const navigate = useNavigate();
  const { projectId } = useProject();
  const { user } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [quizGenState, setQuizGenState] = useState('generating');

  useEffect(() => {
    if (!projectId) return;
    try {
      sessionStorage.setItem(`groupify_quiz_gen_${projectId}`, '1');
    } catch { /* ignore */ }

    (async () => {
      try {
        const res = await fetch(`${API}/projects/${projectId}`);
        if (res.ok) {
          const proj = await res.json();
          setJoinCode(proj.join_code || '');
          setProjectName(proj.assignment_title || proj.name || '');
        }
      } catch { /* ignore */ }

      try {
        const quizRes = await fetch(`${API}/projects/${projectId}/quiz/generate`, { method: 'POST' });
        setQuizGenState(quizRes.ok ? 'done' : 'error');
      } catch {
        setQuizGenState('error');
      }
    })();
  }, [projectId]);

  const joinUrl = joinCode
    ? `${window.location.origin}/join-group?code=${encodeURIComponent(joinCode)}`
    : `${window.location.origin}/join-group?project=${encodeURIComponent(projectId || '')}`;

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
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! Join our Groupify project 🎓\n\nClick to join: ${joinUrl}${joinCode ? `\n\nOr enter code: ${joinCode}` : ''}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${projectName || 'our Groupify project'}`,
          text: joinCode ? `Join code: ${joinCode}` : 'Join our Groupify project',
          url: joinUrl,
        });
      } catch { /* cancelled */ }
    }
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
      if (res.ok) { setNewName(''); fetchMembers(); }
    } catch { /* ignore */ }
    setAdding(false);
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
            <p className="text-sm mb-6" style={{ color: '#6B6584' }}>
              Share the code or link — teammates can join from any device.
            </p>

            {/* Quiz status pill */}
            {quizGenState === 'generating' && (
              <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-5"
                style={{ backgroundColor: '#FDF2F8', border: '1px solid #FBCFE8' }}>
                <Loader2 size={13} className="animate-spin flex-shrink-0" style={{ color: '#EC4899' }} />
                <span className="text-sm font-medium" style={{ color: '#BE185D' }}>Generating quiz in the background…</span>
              </div>
            )}
            {quizGenState === 'done' && (
              <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-5"
                style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <CheckCircle size={13} className="flex-shrink-0" style={{ color: '#16A34A' }} />
                <span className="text-sm font-medium" style={{ color: '#15803D' }}>Quiz ready — members can take it after joining!</span>
              </div>
            )}

            {/* ── Two invite methods ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

              {/* Method 1: Join Code */}
              <div className="rounded-2xl p-5 flex flex-col items-center text-center"
                style={{ backgroundColor: '#F5F3FF', border: '1.5px solid #C4B5FD' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
                  <QrCode size={16} color="white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8B5CF6' }}>Join Code</p>
                <p className="text-2xl font-black tracking-widest font-mono mb-3"
                  style={{ color: '#1C1829', letterSpacing: '0.15em' }}>
                  {joinCode || '———'}
                </p>
                <p className="text-xs mb-4" style={{ color: '#6B6584' }}>
                  Or go to <span className="font-semibold text-purple-600">{window.location.origin}/join-group</span> and type this code
                </p>
                <button
                  onClick={handleCopyCode}
                  disabled={!joinCode}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl w-full justify-center transition-all disabled:opacity-40"
                  style={{
                    backgroundColor: copiedCode ? '#8B5CF6' : 'white',
                    color: copiedCode ? 'white' : '#8B5CF6',
                    border: '1.5px solid #C4B5FD',
                  }}>
                  {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                  {copiedCode ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              {/* Method 2: Join Link */}
              <div className="rounded-2xl p-5 flex flex-col"
                style={{ backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}>
                  <Link2 size={16} color="white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2563EB' }}>Join Link</p>
                <p className="text-xs font-mono break-all mb-3 flex-1"
                  style={{ color: '#1C1829', lineHeight: 1.6 }}>
                  {joinUrl}
                </p>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl flex-1 justify-center transition-all"
                    style={{
                      backgroundColor: copiedLink ? '#2563EB' : 'white',
                      color: copiedLink ? 'white' : '#2563EB',
                      border: '1.5px solid #BFDBFE',
                    }}>
                    {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleShareWhatsApp}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl justify-center transition-all"
                    style={{ backgroundColor: '#ECFDF5', color: '#059669', border: '1.5px solid #A7F3D0' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#D1FAE5'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ECFDF5'; }}>
                    <MessageCircle size={12} />
                    WhatsApp
                  </button>
                  {typeof navigator !== 'undefined' && navigator.share && (
                    <button onClick={handleNativeShare}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl justify-center transition-all"
                      style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6', border: '1.5px solid #C4B5FD' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EDE9FE'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F5F3FF'; }}>
                      <Share2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Add member manually */}
            <div className="flex items-center gap-2 mb-6">
              <input
                type="text"
                placeholder="Or add a member by name manually…"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm transition-all"
                style={{ borderColor: '#EDE9FE', color: '#1C1829', outline: 'none', backgroundColor: 'white' }}
                onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.08)'; }}
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
              <div className="text-center py-8 rounded-xl" style={{ backgroundColor: '#FAFAFE', border: '1px dashed #EDE9FE' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: '#F5F3FF' }}>
                  <UserPlus size={20} style={{ color: '#C4B5FD' }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#1C1829' }}>No members yet</p>
                <p className="text-xs" style={{ color: '#A09BB8' }}>Share the code or link above to get started</p>
              </div>
            ) : (
              <div className="space-y-1.5 mb-5">
                {members.map((member, idx) => (
                  <div key={member.id}
                    className="flex items-center gap-3 py-3 px-3 rounded-xl transition-all"
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8F7FF'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Avatar name={member.name} color={MEMBER_COLORS[idx % MEMBER_COLORS.length]} size="md" />
                    <span className="flex-1 text-sm font-semibold" style={{ color: '#1C1829' }}>{member.name}</span>
                    <StatusBadge done={member.quiz_done} />
                    {!member.quiz_done && (
                      <button className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all"
                        style={{ borderColor: '#FDE68A', color: '#D97706', backgroundColor: '#FFFBEB' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEF3C7'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FFFBEB'; }}>
                        <Bell size={10} />
                        Remind
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {allDone && (
              <div className="rounded-xl px-4 py-3 mb-5 flex items-center gap-2.5"
                style={{ background: 'linear-gradient(135deg, #F5F3FF, #FDF2F8)', border: '1px solid #C4B5FD' }}>
                <CheckCircle size={15} style={{ color: '#8B5CF6' }} />
                <span className="text-sm font-semibold" style={{ color: '#6D28D9' }}>
                  All members have completed the quiz! 🎉
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
