import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { ArrowRight, Users, AlertTriangle, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import { useProject } from '../context/ProjectContext';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

export default function JoinGroup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { code: routeCode } = useParams();
  const { setProjectId, setCurrentMemberId, setCurrentMemberName } = useProject();

  const initialCode = routeCode || searchParams.get('code') || '';
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState('');
  const [step, setStep] = useState('enter_code');
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    if (initialCode) lookupProject(initialCode);
  }, []);

  const lookupProject = async (joinCode) => {
    setError('');
    setStep('enter_code');
    try {
      const res = await fetch(`${API}/projects/join/${joinCode.trim()}`);
      if (!res.ok) {
        setError('Invalid join code. Double-check and try again.');
        return;
      }
      const proj = await res.json();
      setProject(proj);

      const membersRes = await fetch(`${API}/projects/${proj.id}/members`);
      if (membersRes.ok) {
        const data = await membersRes.json();
        setMemberCount(data.members?.length || 0);
      }

      setProjectId(proj.id);
      setStep('found');
    } catch {
      setError('Could not reach the server. Please try again in a moment.');
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) return;
    setStep('joining');
    setError('');
    try {
      const res = await fetch(`${API}/projects/${project.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.detail || 'Could not join. The group might be full.');
        setStep('found');
        return;
      }
      const member = await res.json();
      setCurrentMemberId(member.id);
      setCurrentMemberName(member.name);
      setStep('joined');
    } catch {
      setError('Could not reach the server.');
      setStep('found');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      {/* Header */}
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

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 sm:p-10 animate-scale-in"
            style={{ border: '1px solid #EDE9FE', boxShadow: '0 8px 32px rgba(139,92,246,0.08)' }}>

            {/* ── Step: Enter Code ── */}
            {step === 'enter_code' && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', boxShadow: '0 8px 24px rgba(139,92,246,0.25)' }}>
                    <Users size={28} color="white" />
                  </div>
                  <h1 className="text-2xl font-extrabold mb-2" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>
                    Join a Project
                  </h1>
                  <p className="text-sm font-medium leading-relaxed" style={{ color: '#6B6584' }}>
                    Enter the join code your team leader shared with you
                  </p>
                </div>

                <label htmlFor="joinCode" className="block text-sm font-bold mb-2" style={{ color: '#1C1829' }}>
                  Join Code
                </label>
                <input
                  id="joinCode"
                  type="text"
                  placeholder="e.g. INFO2222-A7K3"
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && code.trim() && lookupProject(code)}
                  className="w-full px-4 py-4 rounded-xl border text-center text-xl font-mono font-extrabold tracking-[0.15em] transition-all duration-200 mb-4"
                  style={{ borderColor: '#EDE9FE', color: '#1C1829', outline: 'none' }}
                  onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
                  autoFocus
                />

                {error && (
                  <div className="flex items-center gap-2 text-sm mb-4 px-1 animate-slide-down"
                    style={{ color: '#DC2626' }}>
                    <AlertTriangle size={15} className="flex-shrink-0" /> {error}
                  </div>
                )}

                <Button variant="filled" onClick={() => lookupProject(code)} disabled={!code.trim()} className="w-full gap-2 py-3.5 text-base">
                  Find Project <ArrowRight size={17} />
                </Button>

                <div className="text-center mt-6">
                  <button onClick={() => navigate('/')}
                    className="text-xs font-semibold transition-colors duration-200"
                    style={{ color: '#A09BB8' }}
                    onMouseEnter={e => e.target.style.color = '#8B5CF6'}
                    onMouseLeave={e => e.target.style.color = '#A09BB8'}>
                    ← Back to home
                  </button>
                </div>
              </>
            )}

            {/* ── Step: Found — Enter Name ── */}
            {step === 'found' && project && (
              <>
                {/* Project info card */}
                <div className="rounded-2xl p-5 mb-6"
                  style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)', border: '1.5px solid #C4B5FD' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} style={{ color: '#8B5CF6' }} />
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8B5CF6' }}>
                      Project Found
                    </p>
                  </div>
                  <p className="text-lg font-extrabold mb-1" style={{ color: '#1C1829' }}>
                    {project.assignment_title || project.name}
                  </p>
                  {project.course_name && (
                    <p className="text-sm font-medium" style={{ color: '#6B6584' }}>{project.course_name}</p>
                  )}
                  <p className="text-xs mt-2 font-medium" style={{ color: '#A09BB8' }}>
                    {memberCount} of {project.group_size || 4} members joined
                  </p>
                </div>

                <label htmlFor="memberName" className="block text-sm font-bold mb-2" style={{ color: '#1C1829' }}>
                  Your Name
                </label>
                <input
                  id="memberName"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && name.trim() && handleJoin()}
                  className="w-full px-4 py-3.5 rounded-xl border text-sm transition-all duration-200 mb-4"
                  style={{ borderColor: '#EDE9FE', color: '#1C1829', outline: 'none' }}
                  onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
                  autoFocus
                />

                {error && (
                  <div className="flex items-center gap-2 text-sm mb-4 px-1 animate-slide-down"
                    style={{ color: '#DC2626' }}>
                    <AlertTriangle size={15} className="flex-shrink-0" /> {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => { setStep('enter_code'); setProject(null); setError(''); }} className="gap-1.5 flex-shrink-0">
                    <ArrowLeft size={14} /> Back
                  </Button>
                  <Button variant="filled" onClick={handleJoin} disabled={!name.trim()} className="flex-1 gap-2 py-3.5">
                    Join Project <ArrowRight size={16} />
                  </Button>
                </div>
              </>
            )}

            {/* ── Step: Joining ── */}
            {step === 'joining' && (
              <div className="text-center py-10">
                <Loader2 size={36} className="animate-spin mx-auto mb-4" style={{ color: '#8B5CF6' }} />
                <p className="text-sm font-bold" style={{ color: '#6B6584' }}>Joining project…</p>
              </div>
            )}

            {/* ── Step: Joined ── */}
            {step === 'joined' && (
              <div className="text-center py-6">
                <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)', border: '2px solid #C4B5FD' }}>
                  <CheckCircle size={36} style={{ color: '#8B5CF6' }} />
                </div>
                <h2 className="text-2xl font-extrabold mb-2" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>
                  You're in!
                </h2>
                <p className="text-sm mb-8 leading-relaxed font-medium" style={{ color: '#6B6584' }}>
                  Welcome to <strong>{project.assignment_title || project.name}</strong>.<br />
                  Now take a quick quiz so we can match you with the right tasks.
                </p>
                <Button variant="filled" onClick={() => navigate('/quiz')} className="gap-2.5 py-3.5 text-base w-full justify-center">
                  Take the Quiz <ArrowRight size={17} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
