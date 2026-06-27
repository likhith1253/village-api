import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import Button from '../ui/button';

export default function FeatureLocked({ featureName = "This Feature" }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 select-none max-w-md mx-auto">
      <div className="h-16 w-16 rounded-2xl bg-primary-500/10 border border-primary-500/25 flex items-center justify-center text-primary-400 mb-6 shadow-lg">
        <Lock size={28} className="text-primary-400" />
      </div>
      <h2 className="text-xl font-bold text-text-primary tracking-tight mb-3">Feature Locked</h2>
      <p className="text-sm text-text-secondary mt-2.5 leading-relaxed font-medium mb-8">
        {featureName} is only available for Pro plan users. Upgrade your account to unlock this feature and more.
      </p>
      <div className="flex flex-col gap-3 w-full">
        <Button onClick={() => navigate('/pricing')} className="w-full text-sm font-bold uppercase tracking-wider">
          Upgrade to Pro
        </Button>
        <Button 
          onClick={() => navigate('/dashboard')} 
          variant="outline" 
          className="w-full text-sm font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} className="mr-2" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
