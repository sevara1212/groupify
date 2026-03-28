import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Mail, CheckCircle, Clock, ArrowRight, Bell } from 'lucide-react';
import StepProgressBar from '../components/ui/StepProgressBar';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';

const JOIN_URL = 'groupify.app/join/AB3C';

const STATUS_CFG = {
  quizDone:    { label: 'Quiz Done',    icon: CheckCircle, color: '#8B5CF6', bg: '#F5F3FF', border: '#C4B5FD' },
  quizPending: { label: 'Quiz Pending', icon: Clock,       color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
  invited:     { label: 'Invited',      icon: Mail,        color: '#A09BB8', bg: '#F5F5F5', border: '#E5E7EB' },
};

const MEMBER_COLORS = ['#8B5CF6', '#EC4899', '#D97706', '#0EA5E9'];

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

const INIT_MEMBERS = [
  { name: 'Ethan',    status: 'quizDone' },
  { name: 'Sophie',   status: 'quizDone' },
  { name: 'Maya',     status: 'quizPending' },
  { name: 'Member 4', status: 'invited' },
];

export default function InviteTeam() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [members, setMembers] = useState(INIT_MEMBERS);

  const allDone = members.every(m => m.status === 'quizDone');

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${JOIN_URL}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleStatus = (name) => {
    setMembers(prev => prev.map(m =>
      m.name === name ? { ...m, status: m.status === 'quizDone' ? 'quizPending' : 'quizDone' } : m
    ));
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

            {/* URL bar */}
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-2"
              style={{ border: '1px solid #EDE9FE', backgroundColor: '#F8F7FF' }}>
              <span className="flex-1 text-sm font-mono truncate" style={{ color: '#1C1829' }}>{JOIN_URL}</span>
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all"
                style={{ borderColor: copied ? '#C4B5FD' : '#EDE9FE', color: copied ? '#8B5CF6' : '#6B6584', backgroundColor: copied ? '#F5F3FF' : 'transparent' }}>
                <Copy size={11} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all"
                style={{ borderColor: '#EDE9FE', color: '#6B6584' }}>
                <Mail size={11} />
                Email
              </button>
            </div>

            <p className="text-xs mb-6" style={{ color: '#A09BB8' }}>
              Demo: click a member to toggle quiz status.
            </p>

            {/* Member list */}
            <div className="space-y-1 mb-5">
              {members.map(({ name, status }, idx) => {
                const isPending = status !== 'quizDone';
                return (
                  <div key={name}
                    onClick={() => toggleStatus(name)}
                    className="flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer transition-all"
                    style={{ ':hover': { backgroundColor: '#F8F7FF' } }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8F7FF'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Avatar name={name} color={MEMBER_COLORS[idx]} size="md" />
                    <span className="flex-1 text-sm font-semibold" style={{ color: '#1C1829' }}>{name}</span>
                    <StatusBadge type={status} />
                    {isPending && (
                      <button onClick={e => e.stopPropagation()}
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
              <Button variant="filled" disabled={!allDone} onClick={() => navigate('/dashboard')} className="gap-2">
                Continue <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
