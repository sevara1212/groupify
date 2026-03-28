import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { ArrowRight, Users, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useProject } from '../context/ProjectContext';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

export default function JoinGroup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { code: routeCode } = useParams(); // supports /join/:code
  const { setProjectId, setCurrentMemberId, setCurrentMemberName } = useProject();

  const initialCode = routeCode || searchParams.get('code') || '';
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState('');
  const [step, setStep] = useState('enter_code'); // enter_code | found | joining | joined | error
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [memberCount, setMemberCount] = useState(0);

  // If code is in URL, auto-lookup
  useEffect(() => {
    if (initialCode) {
      lookupProject(initialCode);
    }
  }, []);

  const lookupProject = async (joinCode) => {
    setError('');
    setStep('enter_code');
    try {
      const res = await fetch(`${API}/projects/join/${joinCode.trim()}`);
      if (!res.ok) {
        setError('Invalid join code. Check and try again.');
        return;
      }
      const proj = await res.json();
      setProject(proj);

      // Get current member count
      const membersRes = await fetch(`${API}/projects/${proj.id}/members`);
      if (membersRes.ok) {
        const data = await membersRes.json();
        setMemberCount(data.members?.length || 0);
      }

      setProjectId(proj.id);
      setStep('found');
    } catch {
      setError('Could not reach the server. Try again later.');
    }
  };

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

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 24px rgba(139,92,246,0.06)' }}>

            {/* Step: Enter code */}
            {(step === 'enter_code') && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F5F3FF' }}>
                    <Users size={20} style={{ color: '#8B5CF6' }} />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold" style={{ color: '#1C1829' }}>Join a Project</h1>
                    <p className="text-sm" style={{ color: '#6B6584' }}>Enter the code your team shared</p>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="e.g. INFO2222-A7K3"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && code.trim() && lookupProject(code)}
                  className="w-full px-4 py-3.5 rounded-xl border text-center text-lg font-mono font-bold tracking-widest transition-all mb-4"
                  style={{ borderColor: '#EDE9FE', color: '#1C1829', outline: 'none', letterSpacing: '0.1em' }}
                  onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px #EDE9FE'; }}
                  onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
                />

                {error && (
                  <div className="flex items-center gap-2 text-sm mb-4" style={{ color: '#DC2626' }}>
                    <AlertTriangle size={14} /> {error}
                  </div>
                )}

                <Button variant="filled" onClick={() => lookupProject(code)} disabled={!code.trim()} className="w-full gap-2 py-3">
                  Find Project <ArrowRight size={16} />
                </Button>
              </>
            )}

            {/* Step: Found — enter name */}
            {step === 'found' && project && (
              <>
                <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#F5F3FF', border: '1px solid #C4B5FD' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8B5CF6' }}>
                    {project.course_name || 'Project'}
                  </p>
                  <p className="text-base font-extrabold" style={{ color: '#1C1829' }}>
                    {project.assignment_title || project.name}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#6B6584' }}>
                    {memberCount} member{memberCount !== 1 ? 's' : ''} joined · {project.group_size || 4} max
                  </p>
                </div>

                <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1829' }}>Your name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && name.trim() && handleJoin()}
                  className="w-full px-4 py-3 rounded-xl border text-sm transition-all mb-4"
                  style={{ borderColor: '#EDE9FE', color: '#1C1829', outline: 'none' }}
                  onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px #EDE9FE'; }}
                  onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
                  autoFocus
                />

                {error && (
                  <div className="flex items-center gap-2 text-sm mb-4" style={{ color: '#DC2626' }}>
                    <AlertTriangle size={14} /> {error}
                  </div>
                )}

                <Button variant="filled" onClick={handleJoin} disabled={!name.trim()} className="w-full gap-2 py-3">
                  Join Project <ArrowRight size={16} />
                </Button>
              </>
            )}

            {/* Step: Joining */}
            {step === 'joining' && (
              <div className="text-center py-8">
                <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: '#8B5CF6' }} />
                <p className="text-sm font-semibold" style={{ color: '#6B6584' }}>Joining project…</p>
              </div>
            )}

            {/* Step: Joined */}
            {step === 'joined' && (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#F5F3FF' }}>
                  <CheckCircle size={28} style={{ color: '#8B5CF6' }} />
                </div>
                <h2 className="text-lg font-extrabold mb-1" style={{ color: '#1C1829' }}>You're in!</h2>
                <p className="text-sm mb-6" style={{ color: '#6B6584' }}>
                  Welcome to <strong>{project.assignment_title || project.name}</strong>. Take the quick quiz so we can match you with the right tasks.
                </p>
                <Button variant="filled" onClick={() => navigate('/quiz')} className="gap-2 py-3">
                  Take the Quiz <ArrowRight size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
