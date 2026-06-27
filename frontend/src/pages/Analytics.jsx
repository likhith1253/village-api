import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import Card from '../components/ui/card';
import Button from '../components/ui/button';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Key, 
  Lock, 
  RefreshCw, 
  AlertCircle, 
  Inbox,
  PieChart as PieIcon,
  BarChart2,
  LineChart as LineIcon,
  Check
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [statusCodes, setStatusCodes] = useState([]);
  const [daily, setDaily] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const setPremiumMockData = () => {
    setSummary({
      totalRequests: 15240,
      requestsToday: 842,
      uniqueUsers: 24,
      uniqueApiKeys: 18
    });
    setDaily([
      { date: '2026-05-27', count: 1120 },
      { date: '2026-05-28', count: 1250 },
      { date: '2026-05-29', count: 1380 },
      { date: '2026-05-30', count: 1420 },
      { date: '2026-05-31', count: 1560 },
      { date: '2026-06-01', count: 1640 },
      { date: '2026-06-02', count: 1710 },
      { date: '2026-06-03', count: 1820 },
      { date: '2026-06-04', count: 1980 },
      { date: '2026-06-05', count: 2120 }
    ]);
    setStatusCodes([
      { name: 'HTTP 200', value: 14240, code: 200 },
      { name: 'HTTP 400', value: 420, code: 400 },
      { name: 'HTTP 401', value: 285, code: 401 },
      { name: 'HTTP 429', value: 165, code: 429 },
      { name: 'HTTP 500', value: 130, code: 500 }
    ]);
    setEndpoints([
      { endpoint: '/api/v1/villages', count: 8150 },
      { endpoint: '/api/v1/states', count: 2520 },
      { endpoint: '/api/v1/districts', count: 2310 },
      { endpoint: '/api/v1/keys', count: 2140 },
      { endpoint: '/api/v1/search', count: 1120 }
    ]);
  };

  const fetchAnalyticsData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError('');
    setIsLocked(false);

    // Check if user is demo user - bypass API call
    if (user?.isDemo) {
      setPremiumMockData();
      setLoading(false);
      setIsRefreshing(false);
      setIsLocked(false);
      return;
    }

    try {
      const [summaryRes, endpointsRes, statusCodesRes, dailyRes] = await Promise.all([
        apiClient.get('/api/analytics/summary'),
        apiClient.get('/api/analytics/endpoints'),
        apiClient.get('/api/analytics/status-codes'),
        apiClient.get('/api/analytics/daily')
      ]);

      setSummary(summaryRes.data.data);
      setEndpoints(endpointsRes.data.data || []);
      
      // Parse status codes map to array format for Recharts pie chart
      const scMap = statusCodesRes.data.data || {};
      const scArray = Object.keys(scMap).map(code => ({
        name: `HTTP ${code}`,
        value: scMap[code],
        code: parseInt(code, 10)
      })).sort((a, b) => a.code - b.code);
      setStatusCodes(scArray);

      setDaily(dailyRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      if (err.response?.status === 403) {
        setIsLocked(true);
        // Populate dummy stats for background blur preview
        setSummary({
          totalRequests: 3120,
          requestsToday: 142,
          uniqueUsers: 1,
          uniqueApiKeys: 2
        });
        setDaily([
          { date: '2026-05-27', count: 120 },
          { date: '2026-05-28', count: 150 },
          { date: '2026-05-29', count: 180 },
          { date: '2026-05-30', count: 220 },
          { date: '2026-05-31', count: 260 },
          { date: '2026-06-01', count: 240 },
          { date: '2026-06-02', count: 310 },
          { date: '2026-06-03', count: 420 },
          { date: '2026-06-04', count: 480 },
          { date: '2026-06-05', count: 510 }
        ]);
        setStatusCodes([
          { name: 'HTTP 200', value: 2840, code: 200 },
          { name: 'HTTP 400', value: 120, code: 400 },
          { name: 'HTTP 401', value: 85, code: 401 },
          { name: 'HTTP 429', value: 65, code: 429 },
          { name: 'HTTP 500', value: 10, code: 500 }
        ]);
        setEndpoints([
          { endpoint: '/api/v1/villages', count: 2150 },
          { endpoint: '/api/v1/states', count: 520 },
          { endpoint: '/api/v1/districts', count: 310 },
          { endpoint: '/api/v1/keys', count: 140 }
        ]);
      } else {
        setError(err.response?.data?.message || 'Failed to load analytics platform data. Please try again.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    document.title = 'Analytics | CensusGrid';
    fetchAnalyticsData();
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
    </div>
  );

  const ChartSkeleton = () => (
    <div className="bg-gradient-to-br from-background-card to-[#121214] border border-border/80 rounded-xl p-6 h-80 animate-pulse flex flex-col justify-between shadow-lg">
      <div className="h-4 bg-border rounded w-1/4 mb-4"></div>
      <div className="h-full bg-border/40 rounded w-full"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 select-none pb-6">
        <div>
          <div className="h-7 bg-border rounded w-48 animate-pulse mb-2"></div>
          <div className="h-3.5 bg-border rounded w-80 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
          <div className="lg:col-span-1">
            <ChartSkeleton />
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
        <h3 className="text-base font-bold text-text-primary">Failed to load analytics</h3>
        <p className="text-text-secondary mt-1.5 max-w-sm text-xs leading-normal">{error}</p>
        <Button onClick={() => fetchAnalyticsData()} className="mt-6 w-auto px-6">
          Retry
        </Button>
      </div>
    );
  }

  // Handle global no data state
  const totalRequests = summary?.totalRequests || 0;
  if (totalRequests === 0 && !isLocked) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 select-none max-w-md mx-auto">
        <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-border flex items-center justify-center text-text-muted mb-5 shadow-lg">
          <Inbox size={22} />
        </div>
        <h2 className="text-lg font-bold text-text-primary tracking-tight">No Analytics Data Yet</h2>
        <p className="text-xs text-text-secondary mt-2.5 leading-relaxed font-medium">
          The database does not contain any API call logs. Start making request queries using your active API Keys to populate statistics graphs and analytics.
        </p>
        <Button onClick={() => fetchAnalyticsData(true)} className="mt-6 w-auto px-6">
          Refresh Page
        </Button>
      </div>
    );
  }

  // Colors for pie slices
  const COLORS = {
    2: '#10b981', // Emerald for 2xx Success
    3: '#3b82f6', // Blue for 3xx
    4: '#f59e0b', // Amber for 4xx Client Errors
    5: '#ef4444'  // Red for 5xx Server Errors
  };

  const getPieSliceColor = (name) => {
    const prefix = name.replace('HTTP ', '').charAt(0);
    return COLORS[prefix] || '#8b5cf6'; // default purple
  };

  return (
    <div className="space-y-6 select-none font-sans pb-6">
      {/* Header View */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Platform Analytics</h1>
          <p className="text-xs text-text-secondary mt-0.5">Global query log aggregates, HTTP codes distribution, and endpoint traffic.</p>
        </div>
        <button
          onClick={() => fetchAnalyticsData(true)}
          disabled={isRefreshing || isLocked}
          className="flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] font-bold text-text-secondary bg-[#151517] hover:bg-[#1c1c1e] border border-border rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 select-none shrink-0"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="relative">
        <div className={isLocked ? "filter blur-[6px] opacity-40 select-none pointer-events-none" : ""}>
          {/* Top Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Card 1: Total Volume */}
            <Card className="h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Total Requests</span>
                  <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/15">
                    <Activity size={14} />
                  </div>
                </div>
                <div className="mt-3.5">
                  <span className="text-2xl font-bold text-text-primary tracking-tight">
                    {totalRequests.toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-text-muted mt-4 font-semibold">Total historical queries logged</p>
            </Card>

            {/* Card 2: Today's Vol */}
            <Card className="h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Requests Today</span>
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                    <TrendingUp size={14} />
                  </div>
                </div>
                <div className="mt-3.5">
                  <span className="text-2xl font-bold text-text-primary tracking-tight">
                    {(summary?.requestsToday || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-text-muted mt-4 font-semibold">Queries in last 24h period</p>
            </Card>

            {/* Card 3: Unique Users */}
            <Card className="h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Active Users</span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                    <Users size={14} />
                  </div>
                </div>
                <div className="mt-3.5">
                  <span className="text-2xl font-bold text-text-primary tracking-tight">
                    {(summary?.uniqueUsers || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-text-muted mt-4 font-semibold">Unique registered accounts</p>
            </Card>

            {/* Card 4: Unique API Keys */}
            <Card className="h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">API Keys Used</span>
                  <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/15">
                    <Key size={14} />
                  </div>
                </div>
                <div className="mt-3.5">
                  <span className="text-2xl font-bold text-text-primary tracking-tight">
                    {(summary?.uniqueApiKeys || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-text-muted mt-4 font-semibold">Active credentials in database</p>
            </Card>
          </div>

          {/* Main Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Daily Usage Trend (Span 2) */}
            <div className="lg:col-span-2">
              <Card className="p-6 h-[380px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <LineIcon size={14} className="text-primary-400" />
                      <span>Daily Usage Trend</span>
                    </h3>
                    <p className="text-[10px] text-text-secondary mt-0.5">Request rate metrics logged over the last 30 days.</p>
                  </div>
                </div>

                <div className="flex-1 w-full text-xs font-semibold select-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={daily} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#52525b" 
                        tickFormatter={(tick) => tick.substring(5)} 
                        style={{ fontSize: 10, fontWeight: 500 }}
                      />
                      <YAxis 
                        stroke="#52525b"
                        allowDecimals={false}
                        style={{ fontSize: 10, fontWeight: 500 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#151517', 
                          borderColor: 'rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          color: '#f4f4f5',
                          fontSize: '11px',
                          fontWeight: 600
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        name="Requests"
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorUsage)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Status Code Distribution (Span 1) */}
            <div className="lg:col-span-1">
              <Card className="p-6 h-[380px] flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <PieIcon size={14} className="text-primary-400" />
                    <span>Status Code Distribution</span>
                  </h3>
                  <p className="text-[10px] text-text-secondary mt-0.5">HTTP response metrics breakdowns.</p>
                </div>

                {statusCodes.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border/80 rounded-xl bg-background/25">
                    <p className="text-xs text-text-secondary">No status code data logged</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between select-none">
                    <div className="h-[180px] w-full text-xs font-semibold relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusCodes}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {statusCodes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getPieSliceColor(entry.name)} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#151517', 
                              borderColor: 'rgba(255,255,255,0.08)',
                              borderRadius: '8px',
                              color: '#f4f4f5',
                              fontSize: '11px',
                              fontWeight: 600
                            }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Custom Legend */}
                    <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-bold uppercase tracking-wider border-t border-border/40 pt-4">
                      {statusCodes.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: getPieSliceColor(entry.name) }} />
                          <span className="text-text-secondary truncate">{entry.name}</span>
                          <span className="text-text-primary ml-auto font-mono text-[11px]">{entry.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Top Endpoints Card (Full width horizontal bar chart) */}
          <Card className="p-6 min-h-[350px] flex flex-col mt-6">
            <div className="mb-6">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 size={14} className="text-primary-400" />
                <span>Top API Endpoints</span>
              </h3>
              <p className="text-[10px] text-text-secondary mt-0.5">Most active service routes ordered by overall frequency.</p>
            </div>

            {endpoints.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border/80 rounded-xl bg-background/25">
                <p className="text-xs text-text-secondary">No endpoint metrics found</p>
              </div>
            ) : (
              <div className="flex-1 w-full text-xs font-semibold select-none">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    layout="vertical"
                    data={endpoints.slice(0, 5)}
                    margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" horizontal={false} />
                    <XAxis 
                      type="number" 
                      stroke="#52525b"
                      style={{ fontSize: 10, fontWeight: 500 }}
                    />
                    <YAxis 
                      dataKey="endpoint" 
                      type="category" 
                      stroke="#52525b"
                      width={110}
                      style={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#151517', 
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: '#f4f4f5',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      name="Requests"
                      fill="#8b5cf6" 
                      radius={[0, 4, 4, 0]}
                      barSize={16}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center z-20 px-4">
            <div className="max-w-md w-full bg-gradient-to-br from-background-card to-[#121214] border border-primary-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden text-center flex flex-col items-center">
              <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-primary-500/10 blur-2xl pointer-events-none" />
              <div className="h-12 w-12 rounded-xl bg-primary-500/10 border border-primary-500/25 flex items-center justify-center text-primary-400 mb-5 shadow-lg">
                <Lock size={20} className="text-primary-400 animate-pulse" />
              </div>
              <h2 className="text-base font-bold text-text-primary tracking-tight">Upgrade to Pro to Unlock Advanced Analytics</h2>
              <p className="text-[11px] text-text-secondary mt-2.5 leading-relaxed font-medium">
                Access live request traffic telemetry, HTTP response status breakdown, and endpoint logs matching your API usage.
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 my-6 text-[10px] font-bold uppercase tracking-wider text-text-secondary text-left w-full border-t border-b border-border/30 py-4">
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-400" />
                  <span>Advanced Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-400" />
                  <span>Daily Trends</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-400" />
                  <span>Status Breakdown</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-400" />
                  <span>Data Exports</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Button onClick={() => navigate('/pricing')} className="w-full text-xs font-bold uppercase tracking-wider">
                  Upgrade to Pro
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  variant="outline" 
                  className="w-full text-xs font-bold uppercase tracking-wider"
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
