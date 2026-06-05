import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import Card from '../components/ui/card';
import Button from '../components/ui/button';
import { 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  AlertCircle, 
  HelpCircle, 
  Layers,
  Key,
  Database,
  ArrowRight,
  Info
} from 'lucide-react';

export default function ApiExplorer() {
  const [keys, setKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState('');
  
  const [endpoints] = useState([
    {
      id: 'states',
      name: 'Fetch All States',
      method: 'GET',
      path: '/v1/states',
      description: 'Retrieves a list of all states sorted alphabetically by name.',
      params: []
    },
    {
      id: 'districts',
      name: 'Fetch Districts by State',
      method: 'GET',
      path: '/v1/districts',
      description: 'Retrieves a list of districts belonging to a state by its stateCode, sorted alphabetically.',
      params: [
        { name: 'stateCode', label: 'State Code', placeholder: 'e.g. AP or BR', required: true }
      ]
    },
    {
      id: 'subdistricts',
      name: 'Fetch Sub-Districts by District',
      method: 'GET',
      path: '/v1/subdistricts',
      description: 'Retrieves a list of sub-districts belonging to a district by its districtCode.',
      params: [
        { name: 'districtCode', label: 'District Code', placeholder: 'e.g. AP01', required: true }
      ]
    },
    {
      id: 'village-search',
      name: 'Search Villages by Name',
      method: 'GET',
      path: '/v1/villages/search',
      description: 'Searches for villages using partial case-insensitive matching. Returns maximum 20 results.',
      params: [
        { name: 'q', label: 'Search Query (q)', placeholder: 'e.g. Agali', required: true },
        { name: 'subDistrictCode', label: 'Sub-District Code', placeholder: 'e.g. 05448 (optional)', required: false },
        { name: 'page', label: 'Page', placeholder: '1 (optional)', required: false, type: 'number', defaultValue: '1' },
        { name: 'limit', label: 'Limit', placeholder: '50 (optional)', required: false, type: 'number', defaultValue: '20' }
      ]
    },
    {
      id: 'village-details',
      name: 'Get Village Details',
      method: 'GET',
      path: '/v1/villages/{villageCode}',
      description: 'Retrieves details of a single village including its full geographic parent hierarchy.',
      params: [
        { name: 'villageCode', label: 'Village Code', placeholder: 'e.g. 622345', required: true, isPathParam: true }
      ]
    }
  ]);

  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0]);
  const [params, setParams] = useState({});
  
  // Execution states
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseStatusText, setResponseStatusText] = useState('');
  const [latency, setLatency] = useState(null);
  const [responseError, setResponseError] = useState('');
  const [copied, setCopied] = useState(false);
  const [keysLoading, setKeysLoading] = useState(true);

  // Load API Keys for selector
  const fetchKeys = async () => {
    setKeysLoading(true);
    try {
      const res = await apiClient.get('/keys');
      const activeKeys = (res.data.data || []).filter(k => k.isActive);
      setKeys(activeKeys);
      if (activeKeys.length > 0) {
        setSelectedKey(activeKeys[0].key);
      }
    } catch (err) {
      console.error('Failed to load active keys:', err);
    } finally {
      setKeysLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'API Explorer | Village API';
    fetchKeys();
  }, []);

  // Update parameters defaults when switching endpoints
  useEffect(() => {
    const defaults = {};
    selectedEndpoint.params.forEach(p => {
      if (p.defaultValue) {
        defaults[p.name] = p.defaultValue;
      } else {
        defaults[p.name] = '';
      }
    });
    setParams(defaults);
    setResponse(null);
    setResponseError('');
    setResponseStatus(null);
    setLatency(null);
  }, [selectedEndpoint]);

  const handleParamChange = (name, value) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedKey) {
      setResponseError('API Key is required to run tests. Generate an API Key in the API Keys tab.');
      return;
    }

    setLoading(true);
    setResponse(null);
    setResponseError('');
    setResponseStatus(null);
    setLatency(null);

    // Build URL & Query parameters
    let requestPath = selectedEndpoint.path;
    const queryParams = {};

    selectedEndpoint.params.forEach(p => {
      const value = params[p.name];
      if (value !== undefined && value !== '') {
        if (p.isPathParam) {
          requestPath = requestPath.replace(`{${p.name}}`, value);
        } else {
          queryParams[p.name] = value;
        }
      }
    });

    const startTime = performance.now();
    try {
      const res = await apiClient.get(requestPath, {
        params: queryParams,
        headers: {
          'x-api-key': selectedKey
        }
      });
      const endTime = performance.now();
      
      setLatency(Math.round(endTime - startTime));
      setResponseStatus(res.status);
      setResponseStatusText(res.statusText || 'OK');
      setResponse(res.data);
    } catch (err) {
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      
      if (err.response) {
        setResponseStatus(err.response.status);
        setResponseStatusText(err.response.statusText || 'Error');
        setResponse(err.response.data);
      } else {
        setResponseError(err.message || 'Request failed. Unable to reach server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Syntax highlighting parser helper
  const highlightJson = (jsonObj) => {
    const jsonString = JSON.stringify(jsonObj, null, 2);
    // Escape standard HTML chars
    const escaped = jsonString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-amber-400'; // default string
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-primary-400 font-bold'; // JSON keys
          } else {
            cls = 'text-emerald-400'; // String values
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-indigo-400'; // Boolean
        } else if (/null/.test(match)) {
          cls = 'text-zinc-500'; // Null
        } else {
          cls = 'text-sky-400'; // Number
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  // Re-generate target URL for helper display
  const getDisplayUrl = () => {
    let url = `/api${selectedEndpoint.path}`;
    const queryParts = [];

    selectedEndpoint.params.forEach(p => {
      const val = params[p.name];
      if (val !== undefined && val !== '') {
        if (p.isPathParam) {
          url = url.replace(`{${p.name}}`, val);
        } else {
          queryParts.push(`${p.name}=${encodeURIComponent(val)}`);
        }
      }
    });

    return queryParts.length > 0 ? `${url}?${queryParts.join('&')}` : url;
  };

  return (
    <div className="space-y-6 select-none font-sans pb-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">API Explorer</h1>
        <p className="text-xs text-text-secondary mt-0.5">Test, debug, and explore Geographic API endpoints interactively.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Config Panel (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="flex flex-col flex-1 p-6">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-5 flex items-center gap-1.5">
              <Layers size={14} className="text-primary-400" />
              <span>Configure Request</span>
            </h3>

            <form onSubmit={handleSendRequest} className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* 1. API Key Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                    <Key size={11} className="text-primary-400" />
                    <span>Select API Key</span>
                  </label>
                  {keysLoading ? (
                    <div className="h-9 w-full bg-border/40 animate-pulse rounded-lg border border-border/80" />
                  ) : keys.length === 0 ? (
                    <div className="p-3 bg-red-950/20 border border-red-500/25 rounded-lg text-xs text-red-400 flex items-start gap-2">
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                      <span>No active API Keys found. Go to the API Keys page to generate a key before querying endpoints.</span>
                    </div>
                  ) : (
                    <select
                      value={selectedKey}
                      onChange={(e) => setSelectedKey(e.target.value)}
                      className="w-full px-3 py-2 bg-[#151517] border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
                    >
                      {keys.map(k => (
                        <option key={k.id} value={k.key}>{k.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 2. Endpoint Selector */}
                <div className="space-y-1.5 border-t border-border/40 pt-4">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Select Target Endpoint</label>
                  <select
                    value={selectedEndpoint.id}
                    onChange={(e) => {
                      const found = endpoints.find(ep => ep.id === e.target.value);
                      if (found) setSelectedEndpoint(found);
                    }}
                    className="w-full px-3 py-2 bg-[#151517] border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-semibold"
                  >
                    {endpoints.map(ep => (
                      <option key={ep.id} value={ep.id}>{ep.method} {ep.path}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-text-secondary leading-normal mt-1 opacity-90">{selectedEndpoint.description}</p>
                </div>

                {/* 3. Parameter Fields */}
                {selectedEndpoint.params.length > 0 && (
                  <div className="space-y-3.5 border-t border-border/40 pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Parameters</span>
                    {selectedEndpoint.params.map((p) => (
                      <div key={p.name} className="space-y-1.5">
                        <label htmlFor={p.name} className="text-[10px] font-bold text-text-secondary">
                          {p.label} {p.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          id={p.name}
                          type={p.type || 'text'}
                          placeholder={p.placeholder}
                          value={params[p.name] || ''}
                          onChange={(e) => handleParamChange(p.name, e.target.value)}
                          required={p.required}
                          className="w-full px-3 py-2 bg-[#151517] border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="border-t border-border/40 pt-5 mt-6">
                <Button 
                  type="submit" 
                  disabled={loading || keys.length === 0} 
                  loading={loading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {!loading && <Play size={12} fill="currentColor" />}
                  <span>Send Request</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Response Viewer (Span 7) */}
        <div className="lg:col-span-7 flex flex-col">
          <Card className="flex flex-col flex-1 p-6 bg-gradient-to-br from-background-card to-[#0d0d0f] min-h-[450px]">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Terminal size={14} className="text-primary-400" />
              <span>Response Viewer</span>
            </h3>

            {/* Request Summary Bar */}
            <div className="bg-[#151517] border border-border/80 rounded-lg p-3 flex items-center justify-between gap-4 mb-4 select-text">
              <div className="flex items-center gap-2 text-xs font-semibold overflow-hidden">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-bold">
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-[10.5px] text-text-secondary truncate pr-2">
                  {getDisplayUrl()}
                </span>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-text-muted uppercase">Headers:</span>
                <div className="flex items-center gap-1 text-[10px] font-bold bg-background border border-border px-2 py-0.5 rounded text-text-secondary">
                  <span>x-api-key</span>
                </div>
              </div>
            </div>

            {/* Response Content Block */}
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-pulse">
                <div className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-text-secondary">Waiting for response from server...</p>
              </div>
            ) : responseError ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-red-500/20 rounded-xl bg-red-950/5">
                <AlertCircle size={22} className="text-red-500 mb-3" />
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Network Error</h4>
                <p className="text-[11px] text-text-secondary mt-1.5 max-w-sm leading-relaxed">{responseError}</p>
              </div>
            ) : response ? (
              <div className="flex-1 flex flex-col select-none">
                {/* Meta details bar */}
                <div className="flex items-center justify-between gap-3 text-xs mb-3 border-b border-border/40 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Status:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      responseStatus >= 200 && responseStatus < 300 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {responseStatus} {responseStatusText}
                    </span>
                    
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Time:</span>
                    <span className="text-[11px] font-mono font-bold text-text-primary">
                      {latency} ms
                    </span>
                  </div>

                  <button
                    onClick={handleCopyResponse}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-text-secondary hover:text-text-primary bg-[#151517] hover:bg-[#1c1c1e] border border-border rounded transition-all duration-150 active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check size={11} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Pretty formatted code view */}
                <div className="flex-1 bg-[#09090b] border border-border/80 rounded-lg p-4 font-mono text-[11px] leading-relaxed overflow-auto max-h-[360px] select-text">
                  <pre 
                    className="outline-none"
                    dangerouslySetInnerHTML={{ __html: highlightJson(response) }} 
                  />
                </div>
              </div>
            ) : (
              // Empty initial playground state
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/60 rounded-xl bg-background/10 select-none my-auto">
                <div className="h-12 w-12 rounded-xl bg-primary-950/60 border border-primary-500/25 flex items-center justify-center text-primary-400 mb-4 shadow-lg shadow-primary-500/5">
                  <Database size={20} />
                </div>
                <h4 className="text-xs font-bold text-text-primary tracking-wider uppercase">Ready to Explore</h4>
                <p className="text-[11px] text-text-muted mt-2 max-w-xs leading-relaxed font-medium">
                  Configure the query fields on the left and select an active key. Click <span className="font-semibold text-text-primary">Send Request</span> to test endpoints and inspect response structures in real-time.
                </p>
                
                <div className="flex items-center gap-1.5 mt-5 text-[10px] font-bold uppercase tracking-wider text-text-muted bg-[#151517] border border-border/80 px-3 py-1.5 rounded-lg select-none">
                  <Info size={12} className="text-primary-400" />
                  <span>Queries count towards your daily limit</span>
                </div>
              </div>
            )}
          </Card>
        </div>
        
      </div>
    </div>
  );
}
