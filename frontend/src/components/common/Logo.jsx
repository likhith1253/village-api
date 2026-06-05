import React from 'react';

export default function Logo({ className = "h-8 w-8", iconOnly = false }) {
  return (
    <div className="flex items-center gap-2.5 select-none font-sans">
      <div className={`${className} shrink-0`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
          {/* Subtle background coordinate grid lines */}
          <line x1="20" y1="20" x2="80" y2="20" stroke="currentColor" className="text-border-light opacity-30" strokeWidth="1.5" />
          <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" className="text-border-light opacity-30" strokeWidth="1.5" />
          <line x1="20" y1="80" x2="80" y2="80" stroke="currentColor" className="text-border-light opacity-30" strokeWidth="1.5" />
          <line x1="20" y1="20" x2="20" y2="80" stroke="currentColor" className="text-border-light opacity-30" strokeWidth="1.5" />
          <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" className="text-border-light opacity-30" strokeWidth="1.5" />
          <line x1="80" y1="20" x2="80" y2="80" stroke="currentColor" className="text-border-light opacity-30" strokeWidth="1.5" />

          {/* Dotted axis connectors */}
          <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" className="text-primary-500 opacity-40" />
          <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" className="text-primary-500 opacity-40" />

          {/* Census Boundary Hexagonal Grid Outline */}
          <polygon
            points="20,50 50,20 80,35 80,65 50,80 20,50"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinejoin="round"
            className="text-primary-500"
            fill="none"
          />

          {/* Outer Ring boundary nodes */}
          <circle cx="20" cy="50" r="4.5" fill="currentColor" className="text-primary-400" />
          <circle cx="50" cy="20" r="4.5" fill="currentColor" className="text-primary-400" />
          <circle cx="80" cy="35" r="4.5" fill="currentColor" className="text-primary-400" />
          <circle cx="80" cy="65" r="4.5" fill="currentColor" className="text-primary-400" />
          <circle cx="50" cy="80" r="4.5" fill="currentColor" className="text-primary-400" />

          {/* Primary target coordinate center node: Census Highlight */}
          <circle cx="50" cy="50" r="7.5" fill="currentColor" className="text-emerald-400" />
          <circle cx="50" cy="50" r="14" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400 animate-pulse" opacity="0.35" />
        </svg>
      </div>
      {!iconOnly && (
        <span className="font-extrabold tracking-tight text-[17px] text-text-primary">
          Census<span className="text-primary-500 font-black">Grid</span>
        </span>
      )}
    </div>
  );
}
