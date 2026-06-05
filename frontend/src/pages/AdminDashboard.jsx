import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import Card from '../components/ui/card';
import Button from '../components/ui/button';
import {
  Users,
  CreditCard,
  Activity,
  Database,
  Server,
  TrendingUp,
  HardDrive,
  RefreshCw,
  Clock,
  ShieldAlert,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [sysInfo, setSysInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAdminData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError('');
    try {
      const [statsRes, sysInfoRes] = await Promise.all([
        apiClient.get('/api/system/admin/dashboard'),
        apiClient.get('/api/system/info')
      ]);

      setStats(statsRes.data.data);
      setSysInfo(sysInfoRes.data.data);
    } catch (err) {
      console.error('Failed to load admin dashboard stats:', err);
      setError(err.response?.data?.message || 'Failed to retrieve operator console data. Access restricted.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    document.title = 'Operator Console | CensusGrid';
    fetchAdminData();
  }, []);

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);

    return parts.join(' ');
  };

  if (loading) {
    return (
      <div className="space-y-6 select-none pb-6 font-sans">
        <div>
          <div className="h-7 bg-border rounded w-48 animate-pulse mb-2"></div>
          <div className="h-3.5 bg-border rounded w-80 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gradient-to-br from-background-card to-[#121214] border border-border rounded-xl p-6 h-36 animate-pulse flex flex-col justify-between" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-background-card to-[#121214] border border-border rounded-xl p-6 h-80 animate-pulse" />
          <div className="lg:col-span-1 bg-gradient-to-br from-background-card to-[#121214] border border-border rounded-xl p-6 h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 select-none max-w-md mx-auto">
        <div className="h-14 w-14 rounded-2xl bg-red-950/60 border border-red-500/20 flex items-center justify-center text-red-500 mb-5 shadow-lg shadow-red-500/5">
          <ShieldAlert size={24} className="animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-text-primary">Operator Restriction</h3>
        <p className="text-text-secondary mt-2 text-xs leading-relaxed font-medium">{error}</p>
        <Button onClick={() => fetchAdminData()} className="mt-6 w-full">
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none font-sans pb-6">
      {/* Title Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Operator Dashboard</h1>
          <p className="text-xs text-text-secondary mt-0.5">Global SaaS billing metrics, cluster health logs, and backend telemetry.</p>
        </div>
        <button
          onClick={() => fetchAdminData(true)}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] font-bold text-text-secondary bg-[#151517] hover:bg-[#1c1c1e] border border-border rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 select-none shrink-0"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Refresh Console</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {/* Metric 1: Total Users */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Platform Users</span>
              <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/15">
                <Users size={14} />
              </div>
            </div>
            <div className="mt-3.5">
              <span className="text-2xl font-bold text-text-primary tracking-tight">
                {stats?.totalUsers?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-4 font-semibold">Total registered developer accounts</p>
        </Card>

        {/* Metric 2: Active Subscriptions */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Paid Subscriptions</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                <CreditCard size={14} />
              </div>
            </div>
            <div className="mt-3.5">
              <span className="text-2xl font-bold text-text-primary tracking-tight">
                {stats?.activeSubscriptions?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-4 font-semibold">Active Pro & Enterprise tiers</p>
        </Card>

        {/* Metric 3: Est. Revenue */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Projected MRR</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/15">
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="mt-3.5">
              <span className="text-2xl font-bold text-text-primary tracking-tight">
                ${stats?.estimatedRevenue?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-4 font-semibold">Calculated as Pro users count * $49</p>
        </Card>

        {/* Metric 4: API Network Traffic */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">API Traffic Logs</span>
              <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/15">
                <Activity size={14} />
              </div>
            </div>
            <div className="mt-3.5">
              <span className="text-2xl font-bold text-text-primary tracking-tight">
                {stats?.networkTraffic?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-4 font-semibold">Total historical requests captured</p>
        </Card>
      </div>

      {/* Cluster Connections & Node Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Column: Server Health Diagnostics */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-5 flex items-center gap-1.5">
              <Server size={14} className="text-primary-400" />
              <span>Platform Health Check</span>
            </h3>

            <div className="space-y-4">
              {/* DB health */}
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                    <Database size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Neon PostgreSQL Cluster</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5">Remote serverless SQL instances</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {stats?.health?.database === 'healthy' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle size={10} />
                      <span>Online</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                      <AlertCircle size={10} />
                      <span>Offline</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Redis health */}
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/15">
                    <HardDrive size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Upstash Redis Cluster</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5">High-speed read cache database</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {stats?.health?.redis === 'healthy' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle size={10} />
                      <span>Online</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                      <AlertCircle size={10} />
                      <span>Offline</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Core Node Environment info */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/15">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Runtime Node Uptime</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5">Node process execution timeline</p>
                  </div>
                </div>
                <div className="text-right text-xs font-bold text-text-primary">
                  {formatUptime(sysInfo?.uptime)}
                </div>
              </div>

            </div>
          </div>
        </Card>

        {/* Right Column: Node Process Statistics */}
        <Card className="lg:col-span-1 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-5 flex items-center gap-1.5">
              <Clock size={14} className="text-primary-400" />
              <span>System Metadata</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Node Version</span>
                <span className="text-xs font-mono font-bold text-text-primary">{sysInfo?.nodeVersion || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Environment</span>
                <span className="text-xs font-mono font-bold text-text-primary capitalize">{sysInfo?.environment || 'development'}</span>
              </div>

              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Process PID</span>
                <span className="text-xs font-mono font-bold text-text-primary">{process.pid || '1048'}</span>
              </div>

              <div className="flex items-center justify-between pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">API Version</span>
                <span className="text-xs font-mono font-bold text-text-primary">v1.0.0</span>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
