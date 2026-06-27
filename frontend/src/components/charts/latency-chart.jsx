import React from 'react';
import { Inbox, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Button from '../ui/button';

export default function LatencyChart({ data, loading, onRefresh }) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-32 bg-border rounded mb-2"></div>
          <div className="h-32 w-full bg-border/40 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-border/80 rounded-xl bg-background/25">
        <div className="h-10 w-10 rounded-full bg-zinc-900 border border-border flex items-center justify-center text-text-muted mb-3">
          <Inbox size={18} />
        </div>
        <p className="text-xs text-text-secondary mb-3">No latency data available</p>
        {onRefresh && (
          <Button onClick={onRefresh} size="sm" className="text-xs">
            <RefreshCw size={12} className="mr-2" />
            Refresh
          </Button>
        )}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
        <XAxis 
          dataKey="timestamp" 
          stroke="#52525b" 
          tickFormatter={(tick) => {
            const date = new Date(tick);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }}
          style={{ fontSize: 10, fontWeight: 500 }}
        />
        <YAxis 
          stroke="#52525b"
          domain={[0, 'dataMax + 100']}
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
          labelFormatter={(label) => new Date(label).toLocaleString()}
        />
        <Line 
          type="monotone" 
          dataKey="latency" 
          name="Latency (ms)"
          stroke="#10b981" 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
