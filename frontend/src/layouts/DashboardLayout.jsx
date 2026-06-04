import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/sidebar';
import Header from '../components/common/header';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    </div>
  );
}
