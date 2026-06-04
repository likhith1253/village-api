import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-gradient-to-br from-background-card to-[#121214] border border-border rounded-xl p-6 shadow-xl hover:shadow-glow-purple hover:border-primary-500/25 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}
