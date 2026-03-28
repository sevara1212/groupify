import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Loader2, AlertTriangle, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import AppearanceControls from '../components/layout/AppearanceControls';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://groupify-fuq7.onrender.com/api');

const inputStyle = {
  borderColor: '#EDE9FE',
  color: '#1C1829',
  backgroundColor: 'white',
  outline: 'none',
};

export default function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || null;
  const { user, signIn, signUp } = useAuth();

  const [mode, setMode] = useState(redirectTo ? 'signup' : 'signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // If already signed in, redirect appropriately
  useEffect(() => {
    if (user) {
      // If we came from /create, go straight back to /create
      if (redirectTo) {
        navigate(redirectTo);
        return;
      }
      findUserProject(user);
    }
  }, [user]);

  const findUserProject = async (authUser) => {
    try {
      // Look up member by email or name
      const displayName = authUser.user_metadata?.full_name || authUser.email;
      const res = await fetch(`${API}/projects`);
      if (!res.ok) return;
      const data = await res.json();
      const projects = data.projects || [];

      // Check each project for a member matching this user
      for (const proj of projects) {
        const membersRes = await fetch(`${API}/projects/${proj.id}/members`);
        if (!membersRes.ok) continue;
        const membersData = await membersRes.json();
        const member = (membersData.members || []).find(
          m => m.name?.toLowerCase() === displayName?.toLowerCase() ||
               m.email?.toLowerCase() === authUser.email?.toLowerCase()
        );
        if (member) {
          // Found their project — go to dashboard
          navigate('/dashboard');
          return;
        }
      }

      // No project found — go to create or join
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Please enter your name.');
          setLoading(false);
          return;
        }
        const { data, error: signUpError } = await signUp(email, password, name.trim());
        if (signUpError) {
          setError(signUpError.message);
        } else if (data?.user?.identities?.length === 0) {
          setError('An account with this email already exists. Try signing in.');
        } else if (data?.session) {
          // Auto-confirmed — redirect immediately
          if (redirectTo) {
            navigate(redirectTo);
          }
          // else the useEffect will handle redirect
        } else {
          setSuccess('Account created! Check your email to confirm, then sign in.');
          setMode('signin');
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.message);
        }
        // On success, the useEffect will handle redirect
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  const canSubmit = email.trim() && password.trim() && (mode === 'signin' || name.trim());

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      {/* Header */}
      <header className="w-full bg-white/90 backdrop-blur-sm" style={{ borderBottom: '1px solid #EDE9FE' }}>
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
            onClick={() => navigate('/')}
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
            <span className="text-white font-black" style={{ fontSize: 15, letterSpacing: '-0.04em' }}>G</span>
          </div>
          <span className="font-extrabold tracking-tight bg-clip-text text-transparent cursor-pointer"
            onClick={() => navigate('/')}
            style={{ fontSize: 20, backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
            Groupify
          </span>
          <AppearanceControls className="ml-auto" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #EDE9FE', boxShadow: '0 4px 24px rgba(139,92,246,0.06)' }}>

            {/* Context banner when redirected from create */}
            {redirectTo === '/create' && (
              <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-5"
                style={{ backgroundColor: '#F5F3FF', border: '1px solid #C4B5FD' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
                  <User size={13} color="white" />
                </div>
                <p className="text-xs font-medium" style={{ color: '#6D28D9' }}>
                  {mode === 'signup'
                    ? 'Create an account first, then you can set up your project.'
                    : 'Sign in to your account to create a project.'}
                </p>
              </div>
            )}

            {/* Icon + title */}
            <div className="text-center mb-7">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', boxShadow: '0 6px 20px rgba(139,92,246,0.25)' }}>
                {mode === 'signin'
                  ? <Lock size={24} color="white" />
                  : <User size={24} color="white" />}
              </div>
              <h1 className="text-xl font-extrabold" style={{ color: '#1C1829' }}>
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-sm mt-1" style={{ color: '#6B6584' }}>
                {mode === 'signin'
                  ? 'Sign in to access your group project'
                  : 'Sign up to start collaborating with your team'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name — only on sign-up */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1829' }}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#A09BB8' }} />
                    <input
                      type="text"
                      placeholder="e.g. Sevara Ibragimova"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all"
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px #EDE9FE'; }}
                      onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1829' }}>
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#A09BB8' }} />
                  <input
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px #EDE9FE'; }}
                    onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1829' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#A09BB8' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-xl border text-sm transition-all"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px #EDE9FE'; }}
                    onBlur={e => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: '#A09BB8' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-sm rounded-xl px-3 py-2.5"
                  style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="flex items-center gap-2 text-sm rounded-xl px-3 py-2.5"
                  style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A' }}>
                  <Mail size={14} className="flex-shrink-0" />
                  {success}
                </div>
              )}

              {/* Submit */}
              <Button variant="filled" disabled={!canSubmit || loading}
                className="w-full gap-2 py-3 text-base justify-center mt-2"
                onClick={handleSubmit}>
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Please wait…</>
                  : mode === 'signin'
                    ? <>Sign In <ArrowRight size={16} /></>
                    : <>Create Account <ArrowRight size={16} /></>}
              </Button>
            </form>

            {/* Toggle mode */}
            <div className="text-center mt-6 pt-5" style={{ borderTop: '1px solid #EDE9FE' }}>
              {mode === 'signin' ? (
                <p className="text-sm" style={{ color: '#6B6584' }}>
                  New to Groupify?{' '}
                  <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                    className="font-semibold" style={{ color: '#8B5CF6' }}>
                    Create an account
                  </button>
                </p>
              ) : (
                <p className="text-sm" style={{ color: '#6B6584' }}>
                  Already have an account?{' '}
                  <button onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
                    className="font-semibold" style={{ color: '#8B5CF6' }}>
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
