import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import Card from '../components/ui/card';
import Button from '../components/ui/button';
import { 
  Key, 
  BookOpen, 
  Terminal, 
  Activity, 
  Lock, 
  Layers, 
  TrendingUp, 
  AlertCircle
} from 'lucide-react';

// Modular Admin Restricted empty state component
const AdminRestrictedState = ({ title, description }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/60 rounded-xl bg-background/25 select-none my-auto">
    <div className="h-10 w-10 rounded-lg bg-primary-950/60 border border-primary-500/25 flex items-center justify-center text-primary-400 mb-3 shadow-lg shadow-primary-500/5">
      <Lock size={15} />
    </div>
    <h4 className="text-[11px] font-bold text-text-primary tracking-wider uppercase">{title}</h4>
    <p className="text-[11px] text-text-muted mt-2 max-w-xs leading-relaxed font-medium">
      {description}
    </p>
  </div>
);

export default function Dashboard() {
  const [usage, setUsage] = useState(null);
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminError, setAdminError] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setAdminError(false);
    try {
      const [usageRes, profileRes] = await Promise.all([
        apiClient.get('/usage/me'),
        apiClient.get('/users/me')
      ]);
      setUsage(usageRes.data.data);
      setProfile(profileRes.data.data);

      try {
        const [summaryRes, endpointsRes] = await Promise.all([
          apiClient.get('/analytics/summary'),
          apiClient.get('/analytics/endpoints')
        ]);
        setSummary(summaryRes.data.data);
        setEndpoints(endpointsRes.data.data || []);
      } catch (adminErr) {
        console.warn("Admin analytics failed (likely forbidden for current user role)", adminErr);
        if (adminErr.response?.status === 403) {
          setAdminError(true);
        } else {
          throw adminErr;
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Dashboard | Village API';
    fetchData();
  }, []);

  const CardSkeleton = () => (
    <div className="bg-gradient-to-br from-background-card to-[#121214] border border-border/80 rounded-xl p-6 h-36 animate-pulse flex flex-col justify-between shadow-lg">
      <div className="flex justify-between items-center">
        <div className="h-3 bg-border rounded w-1/3"></div>
        <div className="h-4 w-4 bg-border rounded-full"></div>
      </div>
      <div className="space-y-2 mt-2">
        <div className="h-7 bg-border rounded w-2/3"></div>
        <div className="h-2 bg-border rounded w-full"></div>
      </div>
      <div className="h-2.5 bg-border rounded w-1/4 mt-2"></div>
    </div>
  );

  const TableSkeleton = () => (
    <div className="bg-gradient-to-br from-background-card to-[#121214] border border-border/80 rounded-xl p-6 h-[340px] animate-pulse flex flex-col justify-between shadow-lg">
      <div className="h-5 bg-border rounded w-1/4 mb-6"></div>
      <div className="space-y-5 flex-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-0">
            <div className="h-4 bg-border rounded w-2/5"></div>
            <div className="h-4 bg-border rounded w-1/5"></div>
            <div className="h-2 bg-border rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 select-none">
        <div>
          <div className="h-7 bg-border rounded w-40 animate-pulse mb-2"></div>
          <div className="h-3.5 bg-border rounded w-72 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gradient-to-br from-background-card to-[#121214] border border-border/80 rounded-xl p-6 h-[340px] animate-pulse flex flex-col justify-between shadow-lg">
            <div className="space-y-2">
              <div className="h-5 bg-border rounded w-1/2"></div>
              <div className="h-3.5 bg-border rounded w-3/4"></div>
            </div>
            <div className="space-y-4">
              <div className="h-10 bg-border rounded"></div>
              <div className="h-10 bg-border rounded"></div>
              <div className="h-10 bg-border rounded"></div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <TableSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 select-none">
        <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 shadow-lg shadow-red-500/5">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-text-primary">Failed to load dashboard</h3>
        <p className="text-text-secondary mt-1.5 max-w-sm text-xs leading-normal">{error}</p>
        <Button onClick={fetchData} className="mt-6 w-auto px-6">
          Retry
        </Button>
      </div>
    );
  }

  const maxLimit = usage?.dailyLimit || 100;
  const requestsToday = usage?.requestsToday || 0;
  const usagePercentage = Math.min((requestsToday / maxLimit) * 100, 100);

  // Redesigned premium quick actions button component
  const QuickActionButton = ({ onClick, icon: Icon, label }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-4 py-3 bg-[#151517] hover:bg-[#1c1c1e] border border-border hover:border-primary-500/30 text-text-secondary hover:text-text-primary rounded-lg transition-all duration-200 group active:scale-[0.99] shadow-sm select-none"
    >
      <div className="p-1.5 rounded-md bg-background border border-border/50 text-text-muted group-hover:text-primary-400 group-hover:border-primary-500/20 transition-all duration-200 shrink-0">
        <Icon size={14} />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-wider text-left">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6 select-none font-sans pb-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Dashboard</h1>
        <p className="text-xs text-text-secondary mt-0.5">Monitor your API usage and platform activity.</p>
      </div>

      {/* 4 Stats Cards Section (Ensured identical card heights using h-full flex flex-col justify-between) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {/* Card 1: Requests Today */}
        <Card className="h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Requests Today</span>
              <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/15">
                <Activity size={14} />
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary tracking-tight">{requestsToday.toLocaleString()}</span>
              <span className="text-[11px] text-text-muted font-medium">/ {usage?.dailyLimit ? usage.dailyLimit.toLocaleString() : '∞'}</span>
            </div>
          </div>
          {usage?.dailyLimit ? (
            <div className="mt-4">
              <div className="w-full bg-border/60 rounded-full h-1.5 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-primary-600 to-primary-400 h-1.5 rounded-full shadow-glow-purple transition-all duration-300"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
              <p className="text-[10px] text-text-muted mt-2 text-right font-medium">
                {usagePercentage.toFixed(0)}% consumed
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-[10px] text-text-muted font-semibold">No rate limits configured</p>
            </div>
          )}
        </Card>

        {/* Card 2: Remaining Requests */}
        <Card className="h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Remaining Today</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="mt-3.5">
              <span className="text-2xl font-bold text-text-primary tracking-tight">
                {usage?.remaining !== null && usage?.remaining !== undefined 
                  ? usage.remaining.toLocaleString() 
                  : 'Unlimited'}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-4 font-semibold">Resets daily at 00:00 UTC</p>
        </Card>

        {/* Card 3: Plan Badge */}
        <Card className="h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Current Plan</span>
              <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/15">
                <Layers size={14} />
              </div>
            </div>
            <div className="mt-3.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20 uppercase tracking-widest">
                {profile?.plan || 'Free'}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-4 font-semibold">Role: {profile?.role || 'User'}</p>
        </Card>

        {/* Card 4: Total Requests */}
        <Card className="h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Total Volume</span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                <Activity size={14} />
              </div>
            </div>
            <div className="mt-3.5">
              {adminError ? (
                <div className="flex items-center gap-1.5 text-text-secondary font-semibold bg-background/50 px-2.5 py-1 rounded-md border border-border/80 w-fit">
                  <Lock size={11} className="text-primary-400 shrink-0" />
                  <span className="text-[10px] uppercase tracking-wider text-text-secondary">Admin Only</span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-text-primary tracking-tight">
                  {summary?.totalRequests !== undefined ? summary.totalRequests.toLocaleString() : 0}
                </span>
              )}
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-4 font-semibold">All credentials combined</p>
        </Card>
      </div>

      {/* Grid for Actions and Metrics (Stretched layout that terminates naturally) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Quick Actions Card */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col justify-between p-6">
            <div>
              <h3 className="text-sm font-bold text-text-primary tracking-tight">Quick Actions</h3>
              <p className="text-[11px] text-text-secondary mt-0.5 mb-6">Common configuration and resource links.</p>
            </div>
            
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              <QuickActionButton 
                onClick={() => navigate('/api-keys')} 
                icon={Key} 
                label="Create API Key" 
              />
              <QuickActionButton 
                onClick={() => navigate('/docs')} 
                icon={BookOpen} 
                label="Open Documentation" 
              />
              <QuickActionButton 
                onClick={() => navigate('/api-explorer')} 
                icon={Terminal} 
                label="API Explorer" 
              />
            </div>
          </Card>
        </div>

        {/* Recent Platform Metrics Endpoints Card */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col p-6 min-h-[280px]">
            <h3 className="text-sm font-bold text-text-primary tracking-tight">Recent Platform Metrics</h3>
            <p className="text-[11px] text-text-secondary mt-0.5 mb-5">Top endpoint requests by volume frequency.</p>

            {adminError ? (
              <AdminRestrictedState 
                title="Admin Access Restricted"
                description="Platform-wide endpoint call statistics require administrator credentials. Standard users can monitor daily quota limits in stats cards."
              />
            ) : endpoints.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border/80 rounded-xl bg-background/25 my-auto">
                <p className="text-xs text-text-secondary font-medium">No endpoint metrics recorded yet</p>
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto pb-2">
                <table className="w-full text-left text-sm select-none border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-text-secondary text-[10px] font-bold uppercase tracking-widest">
                      <th className="pb-3 w-[55%]">Endpoint URL</th>
                      <th className="pb-3 w-[20%] text-right pr-4">Requests</th>
                      <th className="pb-3 w-[25%]">Frequency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {endpoints.slice(0, 5).map((ep, idx) => {
                      const maxCount = endpoints[0]?.count || 1;
                      const percentage = Math.min((ep.count / maxCount) * 100, 100);
                      
                      return (
                        <tr key={idx} className="hover:bg-primary-500/[0.02] transition-colors duration-150 last:border-b last:border-border/30">
                          <td className="py-2.5 font-mono text-[11px] text-primary-400 font-semibold truncate max-w-[200px]">
                            {ep.endpoint}
                          </td>
                          <td className="py-2.5 text-right font-semibold text-text-primary pr-4 text-xs font-mono">
                            {ep.count.toLocaleString()}
                          </td>
                          <td className="py-2.5">
                            <div className="w-full bg-border/60 rounded-full h-1.5 overflow-hidden shadow-inner">
                              <div 
                                className="bg-gradient-to-r from-primary-600 to-primary-400 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
