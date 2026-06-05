import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import Button from '../components/ui/button';
import { Settings, RefreshCw } from 'lucide-react';

export default function Maintenance() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'System Maintenance | CensusGrid';
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans flex flex-col justify-between overflow-x-hidden relative">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1b22_1px,transparent_1px),linear-gradient(to_bottom,#1b1b22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/70 relative">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo className="h-8 w-8" iconOnly={true} />
          <div className="flex gap-2 items-center text-[10px] font-bold uppercase tracking-widest text-primary-400 bg-primary-500/10 border border-primary-500/20 px-3 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-ping" />
            <span>Scheduled Upgrade</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-md mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center relative z-10 select-none">
        <div className="h-16 w-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 mb-6 shadow-xl shadow-primary-500/5">
          <Settings size={28} className="animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        
        <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest block mb-2">Service Status</span>
        <h2 className="text-xl font-bold text-text-primary tracking-tight">System Maintenance</h2>
        <p className="text-xs text-text-secondary mt-3 leading-relaxed font-medium">
          We are currently updating our Upstash Redis server indexes and caching engines to accelerate village details hot-reads. Platform REST API endpoints and user console dashboards will resume operations shortly.
        </p>

        <div className="mt-8 w-full">
          <Button onClick={() => window.location.reload()} className="w-full text-xs flex items-center justify-center gap-2">
            <RefreshCw size={13} />
            <span>Refresh Status</span>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-background-card/20 py-8 relative z-10 text-center text-[10px] text-text-muted">
        <p>&copy; {new Date().getFullYear()} CensusGrid. All rights reserved.</p>
      </footer>
    </div>
  );
}
