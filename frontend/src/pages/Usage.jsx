import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import Card from '../components/ui/card';
import Button from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  TrendingUp, 
  Layers, 
  AlertTriangle, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  BarChart3, 
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Usage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUsageData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError('');
    try {
      const res = await apiClient.get('/usage/me');
      setUsage(res.data.data);
    } catch (err) {
      console.error('Failed to fetch usage data:', err);
      setError(err.response?.data?.message || 'Failed to retrieve usage stats. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    document.title = 'Usage Statistics | Village API';
    fetchUsageData();
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

  if (loading) {
    return (
      <div className="space-y-6 select-none pb-6">
        <div>
          <div className="h-7 bg-border rounded w-44 animate-pulse mb-2"></div>
          <div className="h-3.5 bg-border rounded w-80 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        <div className="bg-gradient-to-br from-background-card to-[#121214] border border-border/80 rounded-xl p-8 h-60 animate-pulse shadow-lg">
          <div className="h-5 bg-border rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-border rounded w-full mb-6"></div>
          <div className="h-8 bg-border rounded w-full mb-4"></div>
          <div className="h-3 bg-border rounded w-1/3"></div>
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
        <h3 className="text-base font-bold text-text-primary">Failed to load usage stats</h3>
        <p className="text-text-secondary mt-1.5 max-w-sm text-xs leading-normal">{error}</p>
        <Button onClick={() => fetchUsageData()} className="mt-6 w-auto px-6">
          Retry
        </Button>
      </div>
    );
  }

  const plan = usage?.plan || 'FREE';
  const requestsToday = usage?.requestsToday || 0;
  const dailyLimit = usage?.dailyLimit; // null for ADMIN
  const remaining = usage?.remaining; // null for ADMIN

  const isUnlimited = plan === 'ADMIN' || dailyLimit === null || dailyLimit === undefined;
  
  // Usage percentage calculation
  const usagePercentage = isUnlimited 
    ? 0 
    : Math.min((requestsToday / dailyLimit) * 100, 100);

  // Determine status thresholds
  let statusState = 'healthy'; // healthy, warning, critical
  if (!isUnlimited) {
    if (usagePercentage > 95) {
      statusState = 'critical';
    } else if (usagePercentage > 80) {
      statusState = 'warning';
    }
  }

  // Quota config definitions
  const statusStyles = {
    healthy: {
      dotColor: 'bg-emerald-500 shadow-emerald-500/25',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/15',
      label: 'Healthy',
      gradient: 'from-primary-600 to-primary-400 shadow-glow-purple',
      message: 'Your daily API usage is well within your account limits. Nice job!'
    },
    warning: {
      dotColor: 'bg-amber-500 shadow-amber-500/25',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/15',
      label: 'Approaching Limit',
      gradient: 'from-amber-600 to-amber-400 shadow-amber-500/10',
      message: 'You have consumed over 80% of your daily API limit. Consider upgrading your plan to prevent throttled queries.'
    },
    critical: {
      dotColor: 'bg-rose-500 shadow-rose-500/25',
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/15',
      label: 'Critical Threshold',
      gradient: 'from-rose-600 to-rose-400 shadow-rose-500/10',
      message: 'Critical limit reached (95%+). API endpoints will return HTTP 429 once limit is exceeded. Action required.'
    }
  };

  const currentStatus = statusStyles[statusState];

  return (
    <div className="space-y-6 select-none font-sans pb-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">API Quota Usage</h1>
          <p className="text-xs text-text-secondary mt-0.5">Track your platform usage, rate limits, and subscription statistics.</p>
        </div>
        <button
          onClick={() => fetchUsageData(true)}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] font-bold text-text-secondary bg-[#151517] hover:bg-[#1c1c1e] border border-border rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 select-none shrink-0"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Large Summary Cards */}
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
            <div className="mt-3.5">
              <span className="text-2xl font-bold text-text-primary tracking-tight">
                {requestsToday.toLocaleString()}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-4 font-semibold">Logged since 00:00 UTC</p>
        </Card>

        {/* Card 2: Daily Quota Limit */}
        <Card className="h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Daily Quota Limit</span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                <BarChart3 size={14} />
              </div>
            </div>
            <div className="mt-3.5">
              <span className="text-2xl font-bold text-text-primary tracking-tight">
                {isUnlimited ? 'Unlimited' : dailyLimit.toLocaleString()}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-4 font-semibold">Refreshes every 24 hours</p>
        </Card>

        {/* Card 3: Remaining Requests */}
        <Card className="h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Remaining Quota</span>
              <div className={`p-1.5 rounded-lg border ${
                statusState === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' :
                statusState === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/15' :
                'bg-rose-500/10 text-rose-400 border-rose-500/15'
              }`}>
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="mt-3.5">
              <span className="text-2xl font-bold text-text-primary tracking-tight">
                {isUnlimited ? 'Unlimited' : remaining.toLocaleString()}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-4 font-semibold">Resets at midnight UTC</p>
        </Card>

        {/* Card 4: Current Tier Badge */}
        <Card className="h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Active Plan</span>
              <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/15">
                <Layers size={14} />
              </div>
            </div>
            <div className="mt-3.5">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${
                plan === 'ADMIN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                plan === 'PRO' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' :
                'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
              }`}>
                {plan}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-4 font-semibold">User Role: {user?.role || 'USER'}</p>
        </Card>
      </div>

      {/* Main Quota Status & Bar Block */}
      <Card className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Daily Quota Consumption</h3>
            <p className="text-xs text-text-secondary mt-0.5">Realtime monitoring of subscription request limits.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Quota Health:</span>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${currentStatus.bgColor}`}>
              <span className={`h-1.5 w-1.5 rounded-full animate-pulse shrink-0 ${currentStatus.dotColor}`} />
              <span>{currentStatus.label}</span>
            </div>
          </div>
        </div>

        {/* Large Progress Bar */}
        <div className="space-y-4">
          <div className="relative">
            {isUnlimited ? (
              <div className="w-full bg-border/60 rounded-full h-3 overflow-hidden shadow-inner border border-border/20">
                <div 
                  className="bg-gradient-to-r from-primary-600 to-indigo-500 h-3 rounded-full shadow-glow-purple transition-all duration-300 animate-pulse"
                  style={{ width: '100%' }}
                />
              </div>
            ) : (
              <div className="w-full bg-border/60 rounded-full h-3 overflow-hidden shadow-inner border border-border/20">
                <div 
                  className={`bg-gradient-to-r h-3 rounded-full transition-all duration-500 ${currentStatus.gradient}`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-xs font-semibold text-text-secondary">
            <span>{requestsToday.toLocaleString()} requests consumed</span>
            <span>
              {isUnlimited ? 'No limits configured' : `${usagePercentage.toFixed(1)}% of ${dailyLimit.toLocaleString()} limit`}
            </span>
          </div>

          {/* Conditional Warning/Critical Banner Box */}
          {statusState !== 'healthy' && (
            <div className={`mt-4 p-4 rounded-lg border flex items-start gap-3 transition-all duration-200 ${
              statusState === 'warning' ? 'bg-amber-950/20 border-amber-500/20 text-amber-400' : 'bg-rose-950/20 border-rose-500/20 text-rose-400'
            }`}>
              <div className="shrink-0 mt-0.5">
                {statusState === 'warning' ? <ShieldAlert size={16} /> : <AlertCircle size={16} />}
              </div>
              <div className="text-xs leading-normal">
                <span className="font-bold uppercase tracking-wider block mb-0.5">
                  {statusState === 'warning' ? 'Warning Alert' : 'Critical Limit Exceeded Alert'}
                </span>
                <span className="opacity-90">{currentStatus.message}</span>
              </div>
            </div>
          )}

          {isUnlimited && (
            <div className="mt-4 p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <Sparkles size={16} />
              </div>
              <div className="text-xs leading-normal">
                <span className="font-bold uppercase tracking-wider block mb-0.5">Unlimited Developer Environment</span>
                <span className="opacity-90">Your account is running on an admin tier plan. Platform rate limits are bypassed for debugging and analytics audit operations.</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Plan Comparisons Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* FREE TIER CARD */}
        <Card className={`flex flex-col justify-between border ${plan === 'FREE' ? 'border-primary-500/40 ring-1 ring-primary-500/10' : 'border-border/60Opacity'}`}>
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Tier 1</span>
              {plan === 'FREE' && (
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 border border-primary-500/30">
                  Active
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-text-primary">FREE DEVELOPER</h4>
            <p className="text-xs font-semibold text-text-muted mt-0.5">Great for testing & side-projects.</p>
            <div className="my-5 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-text-primary">$0</span>
              <span className="text-xs text-text-muted font-medium">/ month</span>
            </div>
            <ul className="space-y-2.5 text-xs text-text-secondary border-t border-border/40 pt-4">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                <span>100 Daily Requests</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                <span>Standard REST Endpoints</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                <span>In-memory Cache (Redis)</span>
              </li>
            </ul>
          </div>
          {plan === 'FREE' && (
            <div className="mt-6">
              <Button disabled className="w-full text-xs">Current Subscription</Button>
            </div>
          )}
        </Card>

        {/* PRO TIER CARD */}
        <Card className={`flex flex-col justify-between border ${plan === 'PRO' ? 'border-primary-500/40 ring-1 ring-primary-500/10' : 'border-border/60Opacity'} relative overflow-hidden`}>
          {plan !== 'PRO' && plan !== 'ADMIN' && (
            <div className="absolute top-0 right-0 bg-primary-500 text-white text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg shadow-sm">
              Popular
            </div>
          )}
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Tier 2</span>
              {plan === 'PRO' && (
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 border border-primary-500/30">
                  Active
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <span>PRO PRODUCTION</span>
              <Zap size={13} className="text-primary-400 shrink-0 animate-pulse" />
            </h4>
            <p className="text-xs font-semibold text-text-muted mt-0.5">Designed for commercial apps.</p>
            <div className="my-5 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-text-primary">$49</span>
              <span className="text-xs text-text-muted font-medium">/ month</span>
            </div>
            <ul className="space-y-2.5 text-xs text-text-secondary border-t border-border/40 pt-4">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                <span className="font-semibold text-text-primary">10,000 Daily Requests</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                <span>Priority Redis Caching Edge</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                <span>Basic Support SLA</span>
              </li>
            </ul>
          </div>
          <div className="mt-6">
            {plan === 'PRO' ? (
              <Button disabled className="w-full text-xs">Current Subscription</Button>
            ) : plan === 'FREE' ? (
              <Button className="w-full text-xs flex items-center gap-1.5">
                <span>Upgrade to Pro</span>
                <ChevronRight size={13} />
              </Button>
            ) : null}
          </div>
        </Card>

        {/* ADMIN/ENTERPRISE TIER CARD */}
        <Card className={`flex flex-col justify-between border ${plan === 'ADMIN' ? 'border-primary-500/40 ring-1 ring-primary-500/10' : 'border-border/60Opacity'}`}>
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Tier 3</span>
              {plan === 'ADMIN' && (
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 border border-primary-500/30">
                  Active
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-text-primary">ADMIN / ENTERPRISE</h4>
            <p className="text-xs font-semibold text-text-muted mt-0.5">High volume and system control.</p>
            <div className="my-5 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-text-primary">Custom</span>
            </div>
            <ul className="space-y-2.5 text-xs text-text-secondary border-t border-border/40 pt-4">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                <span className="font-semibold text-text-primary">Unlimited Requests</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                <span>Full System Analytics Audit</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                <span>Dedicated Slack Support</span>
              </li>
            </ul>
          </div>
          <div className="mt-6">
            {plan === 'ADMIN' ? (
              <Button disabled className="w-full text-xs">Current Subscription</Button>
            ) : (
              <Button className="w-full text-xs flex items-center justify-center gap-1.5 bg-gradient-to-br from-[#1c1c1e] to-[#242426] border border-border text-text-primary hover:from-[#242426] hover:to-[#2d2d30] hover:text-white hover:border-primary-500/20 shadow-none">
                <span>Contact Enterprise</span>
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
