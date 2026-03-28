import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, BookOpen, MessageSquare } from 'lucide-react';

const tabs = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Tasks',     to: '/tasks',     icon: CheckSquare },
  { label: 'Rubric',   to: '/rubric',    icon: BookOpen },
  { label: 'Messages', to: '/messages',  icon: MessageSquare },
];

export default function TopNav() {
  const navigate = useNavigate();

  return (
    <header className="bg-white sticky top-0 z-50" style={{ borderBottom: '1px solid #EDE9FE' }}>
      <div className="max-w-5xl mx-auto px-5 flex items-center justify-between h-14">
        {/* Wordmark */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 focus:outline-none"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}
          >
            <span className="text-white font-black text-sm" style={{ letterSpacing: '-0.04em' }}>G</span>
          </div>
          <span
            className="font-extrabold text-base tracking-tight bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}
          >
            Groupify
          </span>
        </button>

        {/* Nav tabs */}
        <nav className="flex items-center gap-0.5">
          {tabs.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all"
              style={({ isActive }) => ({
                color: isActive ? '#8B5CF6' : '#A09BB8',
                backgroundColor: isActive ? '#F5F3FF' : 'transparent',
                fontWeight: isActive ? 600 : 500,
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
