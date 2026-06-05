import React from 'react';

export default function Logo({ className = "h-8 w-8", iconOnly = false }) {
  return (
    <div className="flex items-center gap-2.5 select-none font-sans">
      <div className={`${className} shrink-0`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
          {/* Stylized geometric Map Pin container */}
          <path
            d="M50 92C50 92 84 62 84 38C84 19.2 68.8 4 50 4C31.2 4 16 19.2 16 38C16 62 50 92 50 92Z"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinejoin="round"
            className="text-primary-500"
          />
          {/* Inner Location Nodes Network - representing Geographic Hierarchy (State -> District -> Village) */}
          {/* Solid Core: Village */}
          <circle cx="50" cy="38" r="7" fill="currentColor" className="text-emerald-400" />
          
          {/* Dotted Middle Layer: District */}
          <circle cx="50" cy="38" r="18" stroke="currentColor" strokeWidth="3.5" strokeDasharray="5 3" className="text-primary-400" />
          
          {/* Solid Outer Layer: State */}
          <circle cx="50" cy="38" r="28" stroke="currentColor" strokeWidth="2" className="text-text-secondary opacity-40" />
          
          {/* Flow connections to imply location intelligence and data platform routing */}
          <line x1="50" y1="10" x2="50" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary-400" />
          <line x1="68" y1="56" x2="60" y2="48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary-400" />
          <line x1="32" y1="56" x2="40" y2="48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary-400" />
        </svg>
      </div>
      {!iconOnly && (
        <span className="font-extrabold tracking-tight text-[17px] text-text-primary">
          Village<span className="text-primary-500 font-black">API</span>
        </span>
      )}
    </div>
  );
}
