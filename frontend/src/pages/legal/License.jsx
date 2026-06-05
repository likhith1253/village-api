import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/common/Logo';

export default function License() {
  useEffect(() => {
    document.title = 'License Information | Village API';
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
          <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest block">Permissions & Usage</span>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">License Agreement</h1>
          <p className="text-xs text-text-muted">Last Updated: June 5, 2026</p>
        </div>

        <div className="prose prose-invert prose-xs text-text-secondary leading-relaxed space-y-6">
          <p>
            Village API services, data tables schema, and developer integrations are provided subject to specific developer licensing controls.
          </p>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">1. Platform Service License</h2>
            <p>
              Under standard developer plans, Village API grants you a limited, non-exclusive, non-transferable, revocable license to access geographic resources and query village divisions data in accordance with our usage policies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">2. Proprietary Data Rights</h2>
            <p>
              The unified compilation, normalization formatting, indexing structures, and relational hierarchy mappings of Indian geographic databases remain the intellectual property of Village API. Scraping or dumping large segments of database catalogs to create competing geographic divisions APIs is prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">3. Open-source Libraries</h2>
            <p>
              Our client SDK packages, Swagger configurations templates, and interactive developer tool wrappers are distributed under standard open-source licenses (MIT License). Sub-modules and third-party node packages (such as Recharts and Lucide) remain subject to their respective project licenses.
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
