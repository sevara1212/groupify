import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, BarChart2, Shield, Zap, CheckCircle, Users, Star } from 'lucide-react';
import Button from '../components/ui/Button';

// ── Logo mark — SVG nodes-in-circle representing a group ─────────────────────
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

function LogoMarkSmall({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#lg2)" />
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
  { icon: Zap,         color: '#8B5CF6', bg: '#F5F3FF', label: 'AI Task Allocation',   desc: 'Matches tasks to members based on quiz results and rubric.' },
  { icon: Shield,      color: '#EC4899', bg: '#FDF2F8', label: 'Rubric-Aware',         desc: 'Every criterion tracked so nothing slips through.' },
  { icon: BarChart2,   color: '#0EA5E9', bg: '#E0F2FE', label: 'Live Progress',        desc: 'Dashboards, contribution bars, deadline countdowns.' },
  { icon: CheckCircle, color: '#D97706', bg: '#FEF3C7', label: 'Risk Detection',       desc: 'Overdue tasks and imbalances flagged early.' },
];

const STATS = [
  { n: '4×',  sub: 'faster to plan' },
  { n: '97%', sub: 'rubric coverage' },
  { n: '0',   sub: 'coordination emails' },
];

const HOW_IT_WORKS = [
  { title: 'Upload your rubric',      desc: 'AI reads your marking criteria and extracts every requirement automatically.' },
  { title: 'Team takes a quick quiz', desc: '5 questions map everyone\'s skills and availability in under 3 minutes.' },
  { title: 'Get your plan',           desc: 'AI allocates tasks fairly — with rationales, due dates, and risk tracking.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [hovCTA, setHovCTA] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7FF' }}>
      {/* ── Nav ── */}
      <header className="w-full bg-white/90 backdrop-blur-sm sticky top-0 z-50" style={{ borderBottom: '1px solid #EDE9FE' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMarkSmall size={36} />
            <span className="font-extrabold tracking-tight bg-clip-text text-transparent"
              style={{ fontSize: 22, backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
              Groupify
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/signin" className="text-sm font-semibold" style={{ color: '#6B6584' }}>Sign in</a>
            <Button variant="filled" onClick={() => navigate('/create')} className="px-5 py-2.5">Get started free</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 right-0 w-[500px] h-[500px] rounded-full opacity-25"
              style={{ background: 'radial-gradient(circle, #C4B5FD 0%, transparent 65%)', filter: 'blur(60px)' }} />
            <div className="absolute top-40 -left-24 w-80 h-80 rounded-full opacity-15"
              style={{ background: 'radial-gradient(circle, #FBCFE8 0%, transparent 65%)', filter: 'blur(50px)' }} />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #A5F3FC 0%, transparent 65%)', filter: 'blur(40px)' }} />
          </div>

          <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold mb-10 border"
              style={{ backgroundColor: '#F5F3FF', borderColor: '#C4B5FD', color: '#7C3AED' }}>
              <Sparkles size={14} />
              AI-Powered Group Work · Built for university students
            </div>

            <h1 className="font-extrabold leading-none tracking-tight mb-7"
              style={{ fontSize: 'clamp(40px, 7vw, 68px)', color: '#1C1829', letterSpacing: '-0.03em', lineHeight: 1.08 }}>
              Plan group assignments<br />
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}>
                smarter, fairer, together.
              </span>
            </h1>

            <p className="leading-relaxed mb-12 mx-auto max-w-xl" style={{ fontSize: 20, color: '#6B6584' }}>
              Upload your rubric, run a 3-minute team quiz, and get an AI-balanced
              task plan — with live progress tracking and risk detection.
            </p>

            {/* CTA group */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Button variant="filled" onClick={() => navigate('/create')} className="gap-2 px-8 py-3.5 text-base">
                Create a Project <ArrowRight size={18} />
              </Button>
              <Button variant="outlined" className="gap-2 px-8 py-3.5 text-base">
                Join a Project
              </Button>
            </div>

            {/* Stats row */}
            <div className="flex justify-center gap-14 mb-4">
              {STATS.map(({ n, sub }) => (
                <div key={sub} className="text-center">
                  <p className="font-extrabold" style={{ fontSize: 40, color: '#8B5CF6', letterSpacing: '-0.02em' }}>{n}</p>
                  <p className="text-sm mt-1 font-medium" style={{ color: '#A09BB8' }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="max-w-6xl mx-auto w-full px-6 pb-24">
          <p className="text-center text-sm font-bold uppercase tracking-widest mb-12" style={{ color: '#A09BB8', letterSpacing: '0.15em' }}>
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ title, desc }, i) => (
              <div key={title} className="bg-white rounded-2xl p-8 flex items-start gap-5 transition-all duration-200"
                style={{ border: '1px solid #EDE9FE' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div className="w-11 h-11 rounded-xl text-sm font-black flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
                  {i + 1}
                </div>
                <div>
                  <p className="text-lg font-extrabold mb-2" style={{ color: '#1C1829' }}>{title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B6584' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature cards ── */}
        <section className="max-w-6xl mx-auto w-full px-6 pb-24">
          <p className="text-center text-sm font-bold uppercase tracking-widest mb-12" style={{ color: '#A09BB8', letterSpacing: '0.15em' }}>
            Everything your group needs
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, color, bg, label, desc }) => (
              <div key={label} className="bg-white rounded-2xl p-7 flex flex-col gap-4 transition-all duration-200"
                style={{ border: '1px solid #EDE9FE' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.10)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                  <Icon size={22} style={{ color }} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-base font-extrabold mb-1.5" style={{ color: '#1C1829' }}>{label}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B6584' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="max-w-6xl mx-auto w-full px-6 pb-24">
          <div className="rounded-3xl p-14 text-center bg-white" style={{ border: '1px solid #EDE9FE' }}>
            <h2 className="font-extrabold mb-3" style={{ fontSize: 28, color: '#1C1829', letterSpacing: '-0.02em' }}>
              Ready to plan smarter?
            </h2>
            <p className="text-base mb-8" style={{ color: '#6B6584' }}>Create your first project in under a minute.</p>
            <Button variant="filled" onClick={() => navigate('/create')} className="gap-2 px-8 py-3.5 text-base">
              Get started free <ArrowRight size={17} />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
