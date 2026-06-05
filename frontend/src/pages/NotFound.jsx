import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import Button from '../components/ui/button';
import { FileQuestion, ChevronLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '404 Page Not Found | CensusGrid';
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans flex flex-col justify-between overflow-x-hidden relative">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1b22_1px,transparent_1px),linear-gradient(to_bottom,#1b1b22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/70 relative">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="focus:outline-none">
            <Logo className="h-8 w-8" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-md mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center relative z-10 select-none">
        <div className="h-16 w-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 mb-6 shadow-xl shadow-primary-500/5">
          <FileQuestion size={28} className="animate-pulse" />
        </div>
        
        <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest block mb-2">Error 404</span>
        <h2 className="text-xl font-bold text-text-primary tracking-tight">Resource Not Found</h2>
        <p className="text-xs text-text-secondary mt-3 leading-relaxed font-medium">
          The dashboard path or API resource you are trying to query does not exist or has been relocated to another endpoint.
        </p>

        <div className="flex gap-4 mt-8 w-full">
          <Button onClick={() => navigate(-1)} className="flex-1 bg-gradient-to-br from-background-card to-[#1c1c1e] hover:from-[#1c1c1e] hover:to-[#242426] border border-border text-text-primary text-xs flex items-center justify-center gap-1.5 shadow-none">
            <ChevronLeft size={14} />
            <span>Go Back</span>
          </Button>
          <Button onClick={() => navigate('/')} className="flex-1 text-xs">
            Back to Home
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
