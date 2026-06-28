import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import {
  LayoutDashboard,
  Key,
  BarChart3,
  TrendingUp,
  Terminal,
  BookOpen,
  Settings,
  LogOut,
  X,
  CreditCard,
  Server,
  Github
} from 'lucide-react';

export default function Sidebar({ onClose, isMobile = false }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const docsUrl = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}/api-docs`
    : 'http://localhost:3000/api-docs';

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'API Keys', path: '/api-keys', icon: Key },
    { name: 'Usage', path: '/usage', icon: BarChart3 },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'API Explorer', path: '/api-explorer', icon: Terminal },
    { name: 'Documentation', path: docsUrl, icon: BookOpen, isExternal: true },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'System Status', path: '/system-status', icon: Server },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full bg-background-card border-r border-border/80 w-64 text-text-primary select-none font-sans">
      {/* Brand logo header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border/80 h-16 shrink-0 bg-background-card/50 backdrop-blur-sm">
        <Logo className="h-7 w-7" />
        {isMobile && (
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-background/80 transition-colors focus:outline-none"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          if (item.isExternal) {
            return (
              <a
                key={item.name}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-l-2 text-text-secondary border-transparent hover:text-text-primary hover:bg-background-popover/30"
              >
                <Icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-105" />
                <span>{item.name}</span>
              </a>
            );
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-l-2 ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400 border-primary-500 font-semibold shadow-inner shadow-primary-500/5'
                    : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-background-popover/30'
                }`
              }
            >
              <Icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-105" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* GitHub Link */}
      <div className="px-4 pb-2">
        <a
          href="https://github.com/likhith1253/village-api"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-l-2 text-text-secondary border-transparent hover:text-text-primary hover:bg-background-popover/30"
        >
          <Github size={18} className="shrink-0" />
          <span>GitHub Repository</span>
        </a>
      </div>

      {/* Logout Footer Section */}
      <div className="p-4 border-t border-border/80 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut size={18} className="shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
