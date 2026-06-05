import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/common/Logo';

export default function TermsOfService() {
  useEffect(() => {
    document.title = 'Terms of Service | Village API';
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
          <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest block">Terms & Rules</span>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Terms of Service</h1>
          <p className="text-xs text-text-muted">Last Updated: June 5, 2026</p>
        </div>

        <div className="prose prose-invert prose-xs text-text-secondary leading-relaxed space-y-6">
          <p>
            Welcome to the Village API developer services. By accessing our platform console or invoking our REST API endpoints, you agree to comply with the terms and conditions outlined below.
          </p>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">1. Account & API Usage</h2>
            <p>
              To query administrative database tables, developers must configure valid keys. You are responsible for safeguarding your keys and credentials. All queries counts contribute toward plan limits.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">2. Permitted Use & Quotas</h2>
            <p>
              API access tiers are configured to prevent system abuse:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Free Plan</strong>: Restricted to 100 requests daily. Suitable for development and prototype side-projects only.</li>
              <li><strong>Pro Plan</strong>: Allows up to 10,000 requests daily with edge caching prioritization.</li>
              <li><strong>Fair Use</strong>: Heavy querying must not cause service degradation. Automated scraping without a key or bypassing rate limit counts will result in access termination.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">3. Warranties & SLA</h2>
            <p>
              While we optimize Upstash caching layers to guarantee sub-100ms response speeds, the service is provided "as is" and "as available". We do not guarantee continuous uninterrupted operations or zero-latency query replies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">4. Policy Changes</h2>
            <p>
              We reserve the right to modify API endpoints structure, database schema columns, or rate-limiting parameters at any time. Significant updates will be posted in the documentation sidebar or emailed to registered account addresses.
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
