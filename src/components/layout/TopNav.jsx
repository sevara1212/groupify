import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, BookOpen, MessageSquare, FolderOpen, Settings } from 'lucide-react';

const tabs = [
  { label: 'Dashboard',     to: '/dashboard', icon: LayoutDashboard },
  { label: 'Tasks',         to: '/tasks',     icon: CheckSquare },
  { label: 'Rubric',        to: '/rubric',    icon: BookOpen },
  { label: 'Project Files', to: '/files',     icon: FolderOpen },
  { label: 'Messages',      to: '/messages',  icon: MessageSquare },
];

export default function TopNav() {
  const navigate = useNavigate();

  return (
    <header className="bg-white sticky top-0 z-50" style={{ borderBottom: '1px solid #EDE9FE' }}>
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
          {tabs.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm transition-all whitespace-nowrap"
              style={({ isActive }) => ({
                color: isActive ? '#8B5CF6' : '#A09BB8',
                backgroundColor: isActive ? '#F5F3FF' : 'transparent',
                fontWeight: isActive ? 600 : 500,
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="hidden md:block">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/settings"
          className="flex-shrink-0 ml-1 p-2 rounded-xl transition-all"
          style={({ isActive }) => ({
            color: isActive ? '#8B5CF6' : '#A09BB8',
            backgroundColor: isActive ? '#F5F3FF' : 'transparent',
          })}
          title="Settings"
        >
          <Settings size={18} strokeWidth={2} />
        </NavLink>
      </div>
    </header>
  );
}
