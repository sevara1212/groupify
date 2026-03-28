import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, BarChart2, Shield, Zap, CheckCircle, Users, FileText, Target, Clock } from 'lucide-react';
import Button from '../components/ui/Button';

/* ── Logo ─── */
function LogoMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#lg1)" />
      <circle cx="20" cy="20" r="3.5" fill="white" />
      <circle cx="20" cy="9" r="2.5" fill="rgba(255,255,255,0.85)" />
      <circle cx="29.7" cy="14.5" r="2.5" fill="rgba(255,255,255,0.85)" />
      <circle cx="29.7" cy="25.5" r="2.5" fill="rgba(255,255,255,0.85)" />
      <circle cx="20" cy="31" r="2.5" fill="rgba(255,255,255,0.85)" />
      <circle cx="10.3" cy="25.5" r="2.5" fill="rgba(255,255,255,0.85)" />
      <circle cx="10.3" cy="14.5" r="2.5" fill="rgba(255,255,255,0.85)" />
      <line x1="20" y1="20" x2="20" y2="11.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
      <line x1="20" y1="20" x2="27.7" y2="15.7" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
      <line x1="20" y1="20" x2="27.7" y2="24.3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
      <line x1="20" y1="20" x2="20" y2="28.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
      <line x1="20" y1="20" x2="12.3" y2="24.3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
      <line x1="20" y1="20" x2="12.3" y2="15.7" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: Zap,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    label: 'AI Task Allocation',
    desc: 'Matches tasks to team members based on quiz results, skills, and rubric criteria — so work is divided fairly.',
  },
  {
    icon: Shield,
    color: '#EC4899',
    bg: '#FDF2F8',
    label: 'Rubric-Aligned Planning',
    desc: 'Every marking criterion is tracked and assigned — nothing gets missed, no last-minute scramble.',
  },
  {
    icon: BarChart2,
    color: '#0EA5E9',
    bg: '#E0F2FE',
    label: 'Live Progress Tracking',
    desc: 'Real-time dashboards show contribution bars, deadline countdowns, and who's on track.',
  },
  {
    icon: CheckCircle,
    color: '#0D9488',
    bg: '#ECFDF5',
    label: 'Risk Detection & Alerts',
    desc: 'Overdue tasks, imbalanced workloads, and bottlenecks are flagged before they become problems.',
  },
];

const HOW_IT_WORKS = [
  {
    icon: FileText,
    title: 'Upload your rubric & brief',
    desc: 'AI reads your marking criteria and assignment brief, extracting every requirement automatically.',
  },
  {
    icon: Target,
    title: 'Team takes a quick quiz',
    desc: '5 questions map everyone\'s strengths, confidence levels, and availability in under 3 minutes.',
  },
  {
    icon: Sparkles,
    title: 'Get your AI-generated plan',
    desc: 'Tasks are allocated fairly with rationales, smart due dates, and real-time risk monitoring.',
  },
];

const STATS = [
  { n: '3 min',  sub: 'to set up a project' },
  { n: '100%', sub: 'rubric coverage' },
  { n: '0',   sub: 'free-rider arguments' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>

      {/* ── Sticky Nav ── */}
      <header className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-50" style={{ borderBottom: '1px solid #EDE9FE' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={38} />
            <span className="font-extrabold tracking-tight bg-clip-text text-transparent"
              style={{ fontSize: 22, backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
              Groupify
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/join-group')}
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors duration-200"
              style={{ color: '#6B6584' }}
              onMouseEnter={e => e.target.style.color = '#8B5CF6'}
              onMouseLeave={e => e.target.style.color = '#6B6584'}
            >
              Join a Group
            </button>
            <Button variant="filled" onClick={() => navigate('/create')} className="px-5 py-2.5 text-sm">
              Get Started Free
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">

        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden">
          {/* Soft decorative blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-32 right-0 w-[600px] h-[600px] rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #C4B5FD 0%, transparent 60%)', filter: 'blur(80px)' }} />
            <div className="absolute top-48 -left-32 w-96 h-96 rounded-full opacity-12"
              style={{ background: 'radial-gradient(circle, #FBCFE8 0%, transparent 60%)', filter: 'blur(60px)' }} />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full opacity-15"
              style={{ background: 'radial-gradient(circle, #A5F3FC 0%, transparent 60%)', filter: 'blur(50px)' }} />
          </div>

          <div className="relative max-w-4xl mx-auto px-6 pt-20 sm:pt-28 pb-20 text-center">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold mb-8 animate-scale-in"
              style={{ backgroundColor: '#F5F3FF', border: '1.5px solid #C4B5FD', color: '#7C3AED' }}>
              <Sparkles size={15} />
              AI-Powered Group Work · Built for University Students
            </div>

            <h1 className="font-extrabold leading-[1.08] tracking-tight mb-6 animate-slide-up"
              style={{ fontSize: 'clamp(36px, 6vw, 64px)', color: '#1C1829', letterSpacing: '-0.03em' }}>
              Plan group assignments<br />
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
                smarter, fairer, together.
              </span>
            </h1>

            <p className="leading-relaxed mb-10 mx-auto max-w-2xl animate-fade-in"
              style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#6B6584', lineHeight: 1.7 }}>
              Upload your rubric, take a 3-minute team quiz, and get an AI-balanced
              task plan — with live progress tracking and risk detection. No more uneven workloads.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-16 animate-fade-in">
              <Button variant="filled" onClick={() => navigate('/create')} className="gap-2.5 px-8 py-4 text-base">
                Create a Project <ArrowRight size={18} />
              </Button>
              <Button variant="outlined" onClick={() => navigate('/join-group')} className="gap-2.5 px-8 py-4 text-base">
                <Users size={18} /> Join with Code
              </Button>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-12 sm:gap-16">
              {STATS.map(({ n, sub }) => (
                <div key={sub} className="text-center">
                  <p className="font-extrabold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: '#8B5CF6', letterSpacing: '-0.02em' }}>{n}</p>
                  <p className="text-sm mt-1 font-medium" style={{ color: '#A09BB8' }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="max-w-6xl mx-auto w-full px-6 pb-24" id="how-it-works">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#8B5CF6', letterSpacing: '0.15em' }}>
              How It Works
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>
              Set up your group in 3 easy steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title}
                className="bg-white rounded-2xl p-8 flex flex-col gap-5 transition-all duration-300 cursor-default"
                style={{ border: '1px solid #EDE9FE' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(139,92,246,0.10)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}>
                    <Icon size={22} color="white" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-extrabold rounded-full px-3 py-1"
                    style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                    Step {i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-extrabold mb-2" style={{ color: '#1C1829' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B6584', lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature Cards ── */}
        <section className="max-w-6xl mx-auto w-full px-6 pb-24">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#EC4899', letterSpacing: '0.15em' }}>
              Features
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#1C1829', letterSpacing: '-0.02em' }}>
              Everything your group needs to succeed
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, color, bg, label, desc }) => (
              <div key={label}
                className="bg-white rounded-2xl p-7 flex items-start gap-5 transition-all duration-300 cursor-default"
                style={{ border: '1px solid #EDE9FE' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(139,92,246,0.10)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                  <Icon size={26} style={{ color }} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold mb-2" style={{ color: '#1C1829' }}>{label}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B6584', lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Social Proof / Trust ── */}
        <section className="max-w-3xl mx-auto w-full px-6 pb-24">
          <div className="rounded-3xl p-10 sm:p-14 text-center"
            style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)', border: '1px solid #EDE9FE' }}>
            <div className="flex justify-center mb-6">
              <div className="flex -space-x-3">
                {['#8B5CF6', '#EC4899', '#0EA5E9', '#D97706', '#0D9488'].map((c, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center"
                    style={{ backgroundColor: c, zIndex: 5 - i }}>
                    <Users size={16} color="white" />
                  </div>
                ))}
              </div>
            </div>
            <p className="text-lg sm:text-xl font-extrabold italic mb-4" style={{ color: '#1C1829', lineHeight: 1.5 }}>
              "We used Groupify for our INFO2222 assignment and it completely eliminated the 'who's doing what' problem.
              Tasks were fair and the rubric was fully covered."
            </p>
            <p className="text-sm font-semibold" style={{ color: '#8B5CF6' }}>— University of Sydney students</p>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="max-w-4xl mx-auto w-full px-6 pb-24">
          <div className="rounded-3xl p-10 sm:p-16 text-center bg-white relative overflow-hidden"
            style={{ border: '1px solid #EDE9FE', boxShadow: '0 8px 40px rgba(139,92,246,0.08)' }}>
            {/* Decorative gradient accent */}
            <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }} />
            <h2 className="font-extrabold mb-4" style={{ fontSize: 'clamp(24px, 3vw, 32px)', color: '#1C1829', letterSpacing: '-0.02em' }}>
              Ready to plan your group work?
            </h2>
            <p className="text-base mb-8 max-w-md mx-auto" style={{ color: '#6B6584', lineHeight: 1.7 }}>
              Create your first project in under a minute. No sign-up needed — just paste your rubric and go.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="filled" onClick={() => navigate('/create')} className="gap-2.5 px-8 py-4 text-base">
                Create a Project <ArrowRight size={18} />
              </Button>
              <Button variant="outlined" onClick={() => navigate('/join-group')} className="gap-2.5 px-8 py-4 text-base">
                Join with Code
              </Button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t py-8 px-6" style={{ borderColor: '#EDE9FE' }}>
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <LogoMark size={28} />
              <span className="text-sm font-bold" style={{ color: '#A09BB8' }}>Groupify</span>
            </div>
            <p className="text-xs" style={{ color: '#A09BB8' }}>
              Built for INFO2222 · University of Sydney · 2026
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
