import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BookOpen, Users, User, LogOut } from 'lucide-react';

export const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'GENERAL',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Problems', path: '/problems', icon: BookOpen },
      ],
    },
    {
      title: 'SOCIAL',
      items: [
        { name: 'Friends', path: '/friends', icon: Users },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'Profile', path: '/profile', icon: User },
      ],
    },
  ];

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <Link to="/dashboard" className="mb-8 block">
        <h1 className="text-2xl font-mono font-bold text-white tracking-tight">
          <span className="text-white">Code</span>
          <span className="text-yellow-300">Crakr</span>
        </h1>
      </Link>

      <nav className="flex-1 space-y-8">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="px-2 py-1 text-[10px] font-semibold text-neutral-500 tracking-wider uppercase mb-3">
              {group.title}
            </div>
            <div className="space-y-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-all duration-200 ${
                      active
                        ? 'bg-white/10 border border-white/20 text-white font-medium'
                        : 'text-white/70 hover:text-white/90 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="my-6 border-t border-neutral-700/30" />

      <div className="space-y-3">
        <div className="px-3 py-3 rounded border border-neutral-700/30 bg-white/5">
          <p className="text-sm text-white/90 font-medium truncate">{user?.username}</p>
          <p className="text-xs text-white/50 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded border border-neutral-700/30 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
