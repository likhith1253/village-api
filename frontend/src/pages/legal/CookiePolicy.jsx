import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/common/Logo';

export default function CookiePolicy() {
  useEffect(() => {
    document.title = 'Cookie Policy | Village API';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary-500/30 overflow-x-hidden relative">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1b22_1px,transparent_1px),linear-gradient(to_bottom,#1b1b22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/70 relative">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <Logo className="h-8 w-8" />
          </Link>
          <Link to="/" className="text-xs font-bold text-text-secondary hover:text-text-primary border border-border px-3 py-1.5 rounded-lg transition-colors">
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16 relative z-10 select-text">
        <div className="space-y-2 mb-10">
          <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest block">Privacy Controls</span>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Cookie Policy</h1>
          <p className="text-xs text-text-muted">Last Updated: June 5, 2026</p>
        </div>

        <div className="prose prose-invert prose-xs text-text-secondary leading-relaxed space-y-6">
          <p>
            This Cookie Policy describes how Village API implements browser storage and cookie tracking parameters inside our user console dashboard.
          </p>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">1. Essential Local Storage</h2>
            <p>
              To authorize requests and persist dashboard sessions without requiring repetitive logins, we store your JWT authentication token (`village_token`) directly in your browser's local storage environment.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">2. System Performance Tracking</h2>
            <p>
              We do not integrate any third-party marketing, advertisement tracking, or user targeting scripts inside our portals. We only analyze raw HTTP connection logs server-side to generate internal analytics graphs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">3. Managing Storage</h2>
            <p>
              You can block or delete browser cookies and clear local storage via standard browser settings configurations. However, clearing `village_token` will sign you out and block access to secure developer paths.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-background-card/20 py-8 relative z-10 text-center text-[10px] text-text-muted">
        <p>&copy; {new Date().getFullYear()} Village API. All rights reserved.</p>
      </footer>
    </div>
  );
}
