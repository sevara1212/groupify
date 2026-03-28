import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, BookOpen, MessageSquare, FolderOpen, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const tabs = [
  { label: 'Dashboard',     to: '/dashboard', icon: LayoutDashboard },
  { label: 'Tasks',         to: '/tasks',     icon: CheckSquare },
  { label: 'Rubric',        to: '/rubric',    icon: BookOpen },
  { label: 'Project Files', to: '/files',     icon: FolderOpen },
  { label: 'Messages',      to: '/messages',  icon: MessageSquare },
];

function TabLink({ label, to, icon }) {
  return (
    <NavLink
      to={to}
      className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm transition-all whitespace-nowrap"
      style={({ isActive }) => ({
        color: isActive ? 'var(--c-primary)' : 'var(--c-text-muted)',
        backgroundColor: isActive ? 'var(--c-primary-xlight)' : 'transparent',
        fontWeight: isActive ? 600 : 500,
      })}
    >
      {React.createElement(icon, { size: 14, strokeWidth: 2.2 })}
      <span className="hidden md:block">{label}</span>
    </NavLink>
  );
}

export default function TopNav() {
  const navigate = useNavigate();

  return (
    <header className="bg-white sticky top-0 z-50" style={{ borderBottom: '1px solid var(--c-border)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
        {/* Wordmark */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 focus:outline-none flex-shrink-0"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}
          >
            <span className="text-white font-black" style={{ fontSize: 15, letterSpacing: '-0.04em' }}>G</span>
          </div>
          <span
            className="font-extrabold tracking-tight bg-clip-text text-transparent hidden sm:block"
            style={{ fontSize: 20, backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}
          >
            Groupify
          </span>
        </button>

        {/* Nav tabs */}
        <nav className="flex items-center gap-0.5 overflow-x-auto flex-1 min-w-0 justify-end md:justify-center">
          {tabs.map((tab) => (
            <TabLink key={tab.to} {...tab} />
          ))}
        </nav>

        <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
          <ThemeToggle />
          <NavLink
            to="/settings"
            className="flex-shrink-0 p-2 rounded-xl transition-all"
            style={({ isActive }) => ({
              color: isActive ? 'var(--c-primary)' : 'var(--c-text-muted)',
              backgroundColor: isActive ? 'var(--c-primary-xlight)' : 'transparent',
            })}
            title="Settings"
          >
            <Settings size={18} strokeWidth={2} />
          </NavLink>
        </div>
      </div>
    </header>
  );
}
