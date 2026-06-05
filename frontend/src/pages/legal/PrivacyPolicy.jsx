import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/common/Logo';

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy | CensusGrid';
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
          <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest block">Trust & Safety</span>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-text-muted">Last Updated: June 5, 2026</p>
        </div>

        <div className="prose prose-invert prose-xs text-text-secondary leading-relaxed space-y-6">
          <p>
            At CensusGrid, we commit to protecting your developer account and query metrics privacy. This Privacy Policy details our data collection, security protection, and information usage guidelines.
          </p>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">1. Data We Collect</h2>
            <p>
              We collect credentials necessary to create accounts and authenticate API queries:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Profile Data</strong>: Your name, email coordinates, and password hashes.</li>
              <li><strong>API Credentials</strong>: Names and values of developer tokens generated inside your console.</li>
              <li><strong>Telemetry Logs</strong>: Request counts, query routes, target status codes, response latencies, and active user agent profiles to check rate limits.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">2. Information Security</h2>
            <p>
              Your passwords are hashed safely using bcrypt before storage. All communications with our servers are encrypted via transport layer security. Query telemetry is stored in secure database structures and is only accessible by administrators for system analytics.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">3. Sharing & Disclosure</h2>
            <p>
              We do not sell, license, or lease developer metrics or account listings to any marketing networks or third parties. We will only disclose logs if mandated by regional regulations or strict compliance requirements.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">4. Developer Rights</h2>
            <p>
              You maintain full authority over your profile information and active API tokens. You can edit email details inside settings, rotate generated key arrays, or delete account configurations entirely from our databases.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-background-card/20 py-8 relative z-10 text-center text-[10px] text-text-muted">
        <p>&copy; {new Date().getFullYear()} CensusGrid. All rights reserved.</p>
      </footer>
    </div>
  );
}
