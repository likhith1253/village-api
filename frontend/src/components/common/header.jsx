import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/api-keys')) return 'API Keys';
    if (path.startsWith('/usage')) return 'Usage & Quotas';
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/api-explorer')) return 'API Explorer';
    if (path.startsWith('/docs')) return 'Documentation';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Developer Portal';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="flex items-center justify-between px-6 md:px-8 lg:px-10 bg-background-card/80 backdrop-blur-md border-b border-border/80 h-16 text-text-primary shrink-0 select-none font-sans sticky top-0 z-30">
      {/* Mobile Hamburger / Breadcrumb title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="text-text-secondary hover:text-text-primary md:hidden p-1.5 rounded-md hover:bg-background/80 transition-colors focus:outline-none"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-sm font-semibold text-text-primary tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      {/* User Information & Avatar Badge */}
      <div className="flex items-center gap-4">
        {user && (
          <>
            {/* Plan Badge */}
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20 uppercase tracking-widest">
              {user.plan || 'Free'}
            </span>

            {/* User metadata */}
            <div className="flex items-center gap-3 pl-3 border-l border-border/80">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-text-primary leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-text-muted leading-none mt-0.5 font-medium">
                  {user.email}
                </span>
              </div>

              {/* Initials Avatar Placeholder */}
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 border border-primary-500/20 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-primary-500/10 select-none">
                {getInitials(user.name)}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
