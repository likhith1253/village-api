import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

export default function useAnalytics() {
  const [data, setData] = useState({
    summary: null,
    endpoints: [],
    statusCodes: [],
    daily: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!apiClient) {
        throw new Error('API client not initialized');
      }

      const [summaryRes, endpointsRes, statusCodesRes, dailyRes] = await Promise.all([
        apiClient.get('/api/analytics/summary').catch(() => ({ data: { data: null } })),
        apiClient.get('/api/analytics/endpoints').catch(() => ({ data: { data: [] } })),
        apiClient.get('/api/analytics/status-codes').catch(() => ({ data: { data: {} } })),
        apiClient.get('/api/analytics/daily').catch(() => ({ data: { data: [] } }))
      ]);

      const scMap = statusCodesRes.data.data || {};
      const scArray = Object.keys(scMap).map(code => ({
        name: `HTTP ${code}`,
        value: scMap[code],
        code: parseInt(code, 10)
      })).sort((a, b) => a.code - b.code);

      setData({
        summary: summaryRes.data.data,
        endpoints: endpointsRes.data.data || [],
        statusCodes: scArray,
        daily: dailyRes.data.data || []
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
    hasData: data.summary?.totalRequests > 0 || data.endpoints.length > 0 || data.daily.length > 0
  };
}
