import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/sidebar';
import Header from '../components/common/header';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage to check if demo
    const token = localStorage.getItem('census_token');
    const tourCompleted = localStorage.getItem('tour_completed');
    if (token === 'demo_override_token' && !tourCompleted) {
      setShowTour(true);
    }
  }, []);

  const ProductTour = ({ onClose }) => {
    const [step, setStep] = useState(0);

    const tourSteps = [
      {
        title: 'Welcome',
        content: 'Welcome to CensusGrid! Let us show you around the platform.',
        path: '/dashboard'
      },
      {
        title: 'Analytics Dashboard',
        content: 'View your API usage metrics, request trends, and performance analytics.',
        path: '/analytics'
      },
      {
        title: 'API Security',
        content: 'Manage your API keys and secure your integration credentials.',
        path: '/api-keys'
      },
      {
        title: 'API Explorer',
        content: 'Test and explore the API endpoints interactively.',
        path: '/api-explorer'
      }
    ];

    const handleNext = () => {
      if (step < tourSteps.length - 1) {
        navigate(tourSteps[step + 1].path);
        setStep(step + 1);
      } else {
        onClose();
      }
    };

    const currentStep = tourSteps[step];

    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-sm">
        <div className="bg-gradient-to-br from-background-card to-[#121214] border border-primary-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-primary-500/10 blur-2xl pointer-events-none" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary tracking-tight">
                {currentStep.title}
              </h3>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-text-secondary mb-5 leading-relaxed">
              {currentStep.content}
            </p>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-xs font-semibold text-text-secondary bg-[#151517] hover:bg-[#1c1c1e] border border-border rounded-lg transition-all duration-200"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-all duration-200"
              >
                {step === tourSteps.length - 1 ? 'Finish' : 'Next Feature'}
              </button>
            </div>
            
            <div className="flex gap-1 mt-4 justify-center">
              {tourSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === step ? 'w-6 bg-primary-500' : 'w-1.5 bg-border'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-background text-text-primary overflow-hidden font-sans">
      {/* 1. Desktop Sidebar (visible on md screens and larger) */}
      <div className="hidden md:flex md:shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* 2. Mobile Sidebar Slide-over drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop overlay */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Drawer Sidebar wrapper */}
          <div className="relative flex flex-col w-64 max-w-xs h-full bg-background-card border-r border-border transition-transform duration-300 transform translate-x-0">
            <Sidebar onClose={() => setSidebarOpen(false)} isMobile={true} />
          </div>
        </div>
      )}

      {/* 3. Main content area container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic content viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 bg-background relative">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {showTour && (
        <ProductTour onClose={() => { setShowTour(false); localStorage.setItem('tour_completed', 'true'); }} />
      )}
    </div>
  );
}
