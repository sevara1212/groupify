import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { ArrowRight, Users, AlertTriangle, Loader2, CheckCircle, Hash } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

export default function JoinGroup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { code: routeCode } = useParams();
  const { setProjectId, setCurrentMemberId, setCurrentMemberName } = useProject();
  const { user } = useAuth();

  const codeFromQuery = searchParams.get('code') || '';
  const projectFromQuery = searchParams.get('project') || '';
  // Accept code from /join/:code, ?code=, or join via ?project=<uuid>
  const initialCode = routeCode || codeFromQuery || '';
  const [code, setCode] = useState(initialCode);
  const authName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const [name, setName] = useState('');
  const [step, setStep] = useState('enter_code'); // enter_code | loading_code | found | joining | joined | error
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    if (authName && !name) setName(authName);
  }, [authName]);

  const lookupProject = useCallback(async (joinCode) => {
    if (!joinCode?.trim()) return;
    setError('');
    setStep('loading_code');
    try {
      const res = await fetch(`${API}/projects/join/${joinCode.trim().toUpperCase()}`);
      if (!res.ok) {
        setError('That code doesn\'t match any project. Double-check and try again.');
        setStep('enter_code');
        return;
      }
      const proj = await res.json();
      setProject(proj);
      setProjectId(proj.id);

      const membersRes = await fetch(`${API}/projects/${proj.id}/members`);
      if (membersRes.ok) {
        const data = await membersRes.json();
        setMemberCount(data.members?.length || 0);
      }
      setStep('found');
    } catch {
      setError('Could not reach the server. Please try again.');
      setStep('enter_code');
    }
  }, [setProjectId]);

  const loadProjectById = useCallback(async (projectId) => {
    if (!projectId?.trim()) return;
    setError('');
    setStep('loading_code');
    try {
      const res = await fetch(`${API}/projects/${projectId.trim()}`);
      if (!res.ok) {
        setError('This invite link is invalid or the project no longer exists.');
        setStep('enter_code');
        return;
      }
      const proj = await res.json();
      setProject(proj);
      setProjectId(proj.id);
      if (proj.join_code) setCode(proj.join_code);

      const membersRes = await fetch(`${API}/projects/${proj.id}/members`);
      if (membersRes.ok) {
        const data = await membersRes.json();
        setMemberCount(data.members?.length || 0);
      }
      setStep('found');
    } catch {
      setError('Could not reach the server. Please try again.');
      setStep('enter_code');
    }
  }, [setProjectId]);

  const lastAutoKey = useRef('');
  // Prefer ?code= over ?project= when both present
  useEffect(() => {
    const fromCode = routeCode || codeFromQuery || '';
    const proj = projectFromQuery.trim();
    if (!fromCode && !proj) {
      lastAutoKey.current = '';
      return;
    }
    const key = `${fromCode}|${proj}`;
    if (lastAutoKey.current === key) return;
    lastAutoKey.current = key;
    if (fromCode) lookupProject(fromCode);
    else loadProjectById(proj);
  }, [routeCode, codeFromQuery, projectFromQuery, lookupProject, loadProjectById]);

  const handleJoin = async () => {
    if (!name.trim()) return;
    setStep('joining');
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
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #EDE9FE 0%, #FDF2F8 55%, #E0F2FE 100%)' }}>

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute rounded-full"
          style={{ width: 400, height: 400, top: '-5%', left: '-10%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
        <div className="absolute rounded-full"
          style={{ width: 300, height: 300, bottom: '5%', right: '-8%', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm relative z-10" style={{ borderBottom: '1px solid #EDE9FE' }}>
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

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative z-10">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: '0 20px 60px rgba(139,92,246,0.14)', border: '1px solid rgba(196,181,253,0.4)' }}>

            {/* ── Enter Code ── */}
            {(step === 'enter_code' || step === 'loading_code') && (
              <>
                <div className="px-8 pt-8 pb-6"
                  style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 8px 20px rgba(139,92,246,0.3)' }}>
                    <Hash size={24} color="white" />
                  </div>
                  <h1 className="text-xl font-extrabold mb-1" style={{ color: '#1C1829' }}>Join a Project</h1>
                  <p className="text-sm" style={{ color: '#6B6584' }}>Enter the join code your team shared with you</p>
                </div>

                <div className="px-8 pb-8 pt-6">
                  <input
                    type="text"
                    placeholder="e.g. INFO2222-A7K3"
                    value={code}
                    onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && code.trim() && lookupProject(code)}
                    className="w-full px-4 py-4 rounded-2xl border text-center text-xl font-mono font-black tracking-widest transition-all mb-4"
                    style={{ borderColor: error ? '#FECACA' : '#EDE9FE', color: '#1C1829', outline: 'none', backgroundColor: '#FAFAFE', letterSpacing: '0.12em' }}
                    onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'; e.target.style.backgroundColor = 'white'; }}
                    onBlur={e => { e.target.style.borderColor = error ? '#FECACA' : '#EDE9FE'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#FAFAFE'; }}
                    autoFocus
                  />

                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-sm"
                      style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                      <AlertTriangle size={14} className="flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    onClick={() => lookupProject(code)}
                    disabled={!code.trim() || step === 'loading_code'}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
                    {step === 'loading_code'
                      ? <><Loader2 size={16} className="animate-spin" /> Looking up…</>
                      : <>Find Project <ArrowRight size={16} /></>}
                  </button>
                </div>
              </>
            )}

            {/* ── Project Found ── */}
            {step === 'found' && project && (
              <>
                <div className="px-8 pt-8 pb-6"
                  style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)' }}>
                  {/* Project card */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 6px 16px rgba(139,92,246,0.3)' }}>
                    <Users size={20} color="white" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8B5CF6' }}>
                    {project.course_name || 'Project Found'}
                  </p>
                  <h2 className="text-lg font-extrabold mb-1" style={{ color: '#1C1829' }}>
                    {project.assignment_title || project.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ backgroundColor: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}>
                      {memberCount} member{memberCount !== 1 ? 's' : ''} joined
                    </span>
                    {project.group_size && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{ backgroundColor: 'rgba(255,255,255,0.7)', color: '#6B6584' }}>
                        {project.group_size} max
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-8 pb-8 pt-6">
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1C1829' }}>
                    What's your name?
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && name.trim() && handleJoin()}
                    className="w-full px-4 py-3.5 rounded-2xl border text-sm font-medium transition-all mb-4"
                    style={{ borderColor: '#EDE9FE', color: '#1C1829', outline: 'none', backgroundColor: '#FAFAFE' }}
                    onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'; e.target.style.backgroundColor = 'white'; }}
                    onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#FAFAFE'; }}
                    autoFocus
                  />

                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-sm"
                      style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                      <AlertTriangle size={14} className="flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    onClick={handleJoin}
                    disabled={!name.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
                    Join Project <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('enter_code');
                      setProject(null);
                      setError('');
                      navigate('/join-group', { replace: true });
                    }}
                    className="w-full text-center text-xs font-semibold mt-3 py-2 transition-all"
                    style={{ color: '#A09BB8' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#8B5CF6'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#A09BB8'; }}>
                    ← Enter a different code instead
                  </button>
                </div>
              </>
            )}

            {/* ── Joining ── */}
            {step === 'joining' && (
              <div className="px-8 py-16 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 8px 20px rgba(139,92,246,0.3)' }}>
                  <Loader2 size={24} color="white" className="animate-spin" />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#6B6584' }}>Joining project…</p>
              </div>
            )}

            {/* ── Joined ✓ ── */}
            {step === 'joined' && (
              <div className="px-8 py-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: 'linear-gradient(135deg, #16A34A, #059669)', boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}>
                  <CheckCircle size={28} color="white" />
                </div>
                <h2 className="text-xl font-extrabold mb-2" style={{ color: '#1C1829' }}>You're in! 🎉</h2>
                <p className="text-sm mb-2" style={{ color: '#6B6584' }}>
                  Welcome to <strong style={{ color: '#1C1829' }}>{project?.assignment_title || project?.name}</strong>
                </p>
                <p className="text-sm mb-7" style={{ color: '#6B6584' }}>
                  Take a quick quiz so we can match you with the right tasks.
                </p>
                <button
                  onClick={() => navigate('/quiz')}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
                  Take the Quiz <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Help text below card */}
          {(step === 'enter_code' || step === 'loading_code') && (
            <p className="text-center text-xs mt-5" style={{ color: '#A09BB8' }}>
              Invite links open the project directly — you only enter your name. Codes work too if you prefer typing.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
