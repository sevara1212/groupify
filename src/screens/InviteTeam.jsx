import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Mail, CheckCircle, Clock, ArrowRight, Bell, UserPlus, Loader2, Share2, MessageCircle, Link2, Check, Send, AlertTriangle, X } from 'lucide-react';
import StepProgressBar from '../components/ui/StepProgressBar';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

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
  const { user } = useAuth();
  const inviterName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Your teammate';
  const [copied, setCopied] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // { type: 'success'|'error', message: '' }
  const [sentEmails, setSentEmails] = useState([]);

  // Fetch project to get join code + name
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/projects/${projectId}`);
        if (res.ok) {
          const proj = await res.json();
          setJoinCode(proj.join_code || '');
          setProjectName(proj.assignment_title || proj.name || '');
        }
      } catch { /* ignore */ }
    })();
  }, [projectId]);

  // Build a unique join URL using the short code
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

  const shareMessage = `Join our Groupify project${joinCode ? ` using code: ${joinCode}` : ''}!\n\n${joinUrl}`;

  const handleShareEmail = () => {
    const subject = encodeURIComponent('Join our Groupify project!');
    const body = encodeURIComponent(`Hey!\n\nI've created a group project on Groupify. Click the link below to join and take the quiz so we can allocate tasks fairly.\n\n${joinUrl}${joinCode ? `\n\nOr enter the join code: ${joinCode}` : ''}\n\nSee you there!`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Hey! Join our Groupify project 🎓\n\n${joinUrl}${joinCode ? `\n\nJoin code: ${joinCode}` : ''}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join our Groupify project',
          text: `Join our Groupify project${joinCode ? ` (code: ${joinCode})` : ''}`,
          url: joinUrl,
        });
      } catch { /* user cancelled */ }
    }
  };

  const handleSendEmailInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) return;
    // Basic validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    if (sentEmails.includes(email.toLowerCase())) {
      setEmailStatus({ type: 'error', message: 'Invite already sent to this email.' });
      return;
    }

    setSendingEmail(true);
    setEmailStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-invite', {
        body: { email, joinUrl, joinCode, projectName, inviterName },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSentEmails(prev => [...prev, email.toLowerCase()]);
      setEmailStatus({ type: 'success', message: `Invite sent to ${email}!` });
      setInviteEmail('');
      setTimeout(() => setEmailStatus(null), 4000);
    } catch (err) {
      setEmailStatus({
        type: 'error',
        message: err.message || 'Could not send email. Make sure Resend is configured.',
      });
    } finally {
      setSendingEmail(false);
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
              Share the code or link below. Each member completes a short quiz so we can allocate tasks fairly.
            </p>

            {/* Big join code */}
            {joinCode && (
              <div className="text-center mb-6 rounded-xl py-5 px-4"
                style={{ backgroundColor: '#F5F3FF', border: '1px solid #C4B5FD' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8B5CF6' }}>
                  Join Code
                </p>
                <p className="text-3xl font-black tracking-widest font-mono" style={{ color: '#1C1829', letterSpacing: '0.15em' }}>
                  {joinCode}
                </p>
                <p className="text-xs mt-2" style={{ color: '#6B6584' }}>
                  Members enter this at <strong>{window.location.origin}/join-group</strong>
                </p>
              </div>
            )}

            {/* Join link + share options */}
            <div className="rounded-xl mb-6 overflow-hidden" style={{ border: '1px solid #EDE9FE' }}>
              {/* URL bar */}
              <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: '#F8F7FF', borderBottom: '1px solid #EDE9FE' }}>
                <Link2 size={14} style={{ color: '#8B5CF6' }} className="flex-shrink-0" />
                <span className="flex-1 text-sm font-mono truncate" style={{ color: '#1C1829' }}>{joinUrl}</span>
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    backgroundColor: copied ? '#8B5CF6' : 'white',
                    color: copied ? 'white' : '#6B6584',
                    border: copied ? '1px solid #8B5CF6' : '1px solid #EDE9FE',
                  }}>
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
              {/* Share buttons row */}
              <div className="flex items-center gap-2 px-4 py-3 bg-white">
                <span className="text-xs font-semibold mr-1" style={{ color: '#A09BB8' }}>Share via:</span>
                <button onClick={handleShareEmail}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
                  style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#DBEAFE'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#EFF6FF'; }}>
                  <Mail size={12} />
                  Email
                </button>
                <button onClick={handleShareWhatsApp}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
                  style={{ backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#D1FAE5'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ECFDF5'; }}>
                  <MessageCircle size={12} />
                  WhatsApp
                </button>
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button onClick={handleNativeShare}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
                    style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6', border: '1px solid #C4B5FD' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EDE9FE'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F5F3FF'; }}>
                    <Share2 size={12} />
                    More
                  </button>
                )}
              </div>
            </div>

            {/* ── Send invite by email ── */}
            <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: '#F8F7FF', border: '1px solid #EDE9FE' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #8B5CF6)' }}>
                  <Send size={12} color="white" />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#1C1829' }}>Send invite by email</p>
                  <p className="text-xs" style={{ color: '#A09BB8' }}>They will receive a beautiful email with the join link</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="teammate@email.com"
                  value={inviteEmail}
                  onChange={e => { setInviteEmail(e.target.value); setEmailStatus(null); }}
                  onKeyDown={e => e.key === 'Enter' && handleSendEmailInvite()}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-sm transition-all"
                  style={{ borderColor: '#EDE9FE', color: '#1C1829', outline: 'none', backgroundColor: 'white' }}
                  onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
                  disabled={sendingEmail}
                />
                <button onClick={handleSendEmailInvite} disabled={!inviteEmail.trim() || sendingEmail}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}>
                  {sendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {sendingEmail ? 'Sending…' : 'Send'}
                </button>
              </div>
              {/* Status message */}
              {emailStatus && (
                <div className={`flex items-center gap-2 mt-2.5 text-xs font-semibold px-3 py-2 rounded-lg ${emailStatus.type === 'success' ? '' : ''}`}
                  style={{
                    backgroundColor: emailStatus.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                    color: emailStatus.type === 'success' ? '#059669' : '#DC2626',
                    border: emailStatus.type === 'success' ? '1px solid #A7F3D0' : '1px solid #FECACA',
                  }}>
                  {emailStatus.type === 'success' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                  <span className="flex-1">{emailStatus.message}</span>
                  <button onClick={() => setEmailStatus(null)} className="ml-1 opacity-50 hover:opacity-100">
                    <X size={12} />
                  </button>
                </div>
              )}
              {/* Sent emails list */}
              {sentEmails.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {sentEmails.map(e => (
                    <span key={e} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
                      <CheckCircle size={10} /> {e}
                    </span>
                  ))}
                </div>
              )}
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
