import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { 
  Terminal, 
  Key, 
  Activity, 
  Database, 
  Layers, 
  Check, 
  Copy, 
  Globe, 
  ArrowRight,
  BookOpen,
  Cpu,
  ChevronRight,
  Menu,
  X,
  Search,
  RefreshCw,
  Eye,
  Server
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(12);

  // Handle copy animation
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const CopyButton = ({ text, id }) => (
    <button
      onClick={() => handleCopy(text, id)}
      className="p-1.5 rounded bg-[#1c1c1e] hover:bg-[#27272a] border border-border/80 text-text-secondary hover:text-text-primary transition-all duration-200"
      title="Copy to clipboard"
    >
      {copiedId === id ? (
        <Check size={12} className="text-emerald-400" />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );

  // Features list based on constraints
  const features = [
    {
      title: 'Village Search',
      description: 'Lightning-fast partial name matching and advanced fuzzy filtering across 457,000+ village records.',
      icon: Search,
      color: 'text-primary-400 bg-primary-500/10 border-primary-500/15'
    },
    {
      title: 'Geographic Hierarchy',
      description: 'Traverse clean parent-child relationships from State down to District, Sub-district, and Village levels.',
      icon: Globe,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/15'
    },
    {
      title: 'Analytics',
      description: 'Comprehensive query insights, response metrics, and error rates accessible directly inside the dashboard.',
      icon: Activity,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/15'
    },
    {
      title: 'API Keys',
      description: 'Self-serve API keys management with automatic rate limits, instant rotation, and request limits tracking.',
      icon: Key,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/15'
    },
    {
      title: 'Redis Caching',
      description: 'Upstash Redis caching engine guarantees lightning fast sub-100ms response latency for hot-read queries.',
      icon: Database,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15'
    }
  ];

  // API Sandbox documentation tabs
  const apiSandbox = {
    search: {
      name: 'Village Search',
      method: 'GET',
      path: '/api/v1/villages?search=Agali',
      curl: 'curl -H "x-api-key: your_api_key_here" \\\n  "https://api.censusgrid.com/api/v1/villages?search=Agali"',
      latency: 34,
      response: {
        success: true,
        count: 1,
        data: [
          {
            code: "622345",
            name: "Agali",
            subDistrict: "Agali",
            district: "Anantapur",
            state: "Andhra Pradesh"
          }
        ]
      }
    },
    hierarchy: {
      name: 'Geographic Hierarchy',
      method: 'GET',
      path: '/api/v1/states',
      curl: 'curl -H "x-api-key: your_api_key_here" \\\n  "https://api.censusgrid.com/api/v1/states"',
      latency: 48,
      response: {
        success: true,
        count: 36,
        data: [
          { code: "AP", name: "Andhra Pradesh", type: "STATE" },
          { code: "KA", name: "Karnataka", type: "STATE" },
          { code: "MH", name: "Maharashtra", type: "STATE" }
        ]
      }
    },
    analytics: {
      name: 'Analytics Data',
      method: 'GET',
      path: '/api/v1/analytics/summary',
      curl: 'curl -H "Authorization: Bearer your_jwt_token" \\\n  "https://api.censusgrid.com/api/v1/analytics/summary"',
      latency: 82,
      response: {
        success: true,
        data: {
          totalRequests: 28490,
          uniqueKeys: 12,
          successRate: "99.8%"
        }
      }
    },
    keys: {
      name: 'API Key Management',
      method: 'POST',
      path: '/api/v1/keys',
      curl: 'curl -X POST -H "Authorization: Bearer your_jwt_token" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"name": "Production App"}\' \\\n  "https://api.censusgrid.com/api/v1/keys"',
      latency: 95,
      response: {
        success: true,
        data: {
          id: "key_prod_82n3x91",
          name: "Production App",
          key: "vap_live_b298c7e9140fa3d",
          isActive: true,
          createdAt: "2026-06-04T08:50:00Z"
        }
      }
    },
    caching: {
      name: 'Redis Cache Test',
      method: 'GET',
      path: '/api/v1/villages/622345',
      curl: 'curl -i -H "x-api-key: your_api_key_here" \\\n  "https://api.censusgrid.com/api/v1/villages/622345"',
      latency: 9,
      response: {
        success: true,
        cached: true,
        source: "REDIS_HIT",
        data: {
          code: "622345",
          name: "Agali",
          subDistrict: "Agali",
          district: "Anantapur",
          state: "Andhra Pradesh"
        }
      }
    }
  };

  // Simulate query loading whenever tab changes
  useEffect(() => {
    document.title = 'CensusGrid | India\'s Geographic Data Platform';
  }, []);

  useEffect(() => {
    setLoading(true);
    const delay = setTimeout(() => {
      setLoading(false);
      setResponseTime(apiSandbox[activeTab].latency);
    }, 300);
    return () => clearTimeout(delay);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary-500/30 overflow-x-hidden relative">
      
      {/* GLOBAL BACKGROUND GRID PATTERN WITH RADIAL MASK */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1b22_1px,transparent_1px),linear-gradient(to_bottom,#1b1b22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none z-0" />
      
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/70 relative">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo className="h-8 w-8" />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors duration-150">Features</a>
            <a href="#api" className="hover:text-text-primary transition-colors duration-150">API Sandbox</a>
            <a href="#stats" className="hover:text-text-primary transition-colors duration-150">Metrics</a>
            <a href="#workflow" className="hover:text-text-primary transition-colors duration-150">How It Works</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-bold text-text-secondary hover:text-text-primary transition-colors duration-150"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 active:scale-[0.98] rounded-lg shadow-md transition-all duration-200"
            >
              <span>Get Started</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-text-secondary hover:text-text-primary focus:outline-none"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Slide Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-[#0d0d0f]/95 backdrop-blur-lg px-6 py-6 space-y-4">
            <nav className="flex flex-col gap-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-text-primary">Features</a>
              <a href="#api" onClick={() => setMobileMenuOpen(false)} className="hover:text-text-primary">API Sandbox</a>
              <a href="#stats" onClick={() => setMobileMenuOpen(false)} className="hover:text-text-primary">Metrics</a>
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="hover:text-text-primary">How It Works</a>
            </nav>
            <div className="flex flex-col gap-3 pt-4 border-t border-border/40">
              <button onClick={() => navigate('/login')} className="text-xs font-bold py-2 text-text-secondary text-left">Sign In</button>
              <button 
                onClick={() => navigate('/login')} 
                className="w-full text-center py-2.5 text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg shadow-md"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-20 flex flex-col items-center text-center z-10">
        {/* Background Glowing Violet/Purple Orb Effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-primary-600/10 blur-[130px] pointer-events-none select-none" />
        
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-primary-500/10 border border-primary-500/25 text-primary-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-6">
          <span>Enterprise Ready</span>
          <span className="h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0 animate-ping" />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-black text-text-primary tracking-tight max-w-4xl leading-[1.08] select-text">
          Access Indian Village Data <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-violet-500 bg-clip-text text-transparent">Through One API</span>
        </h1>
        
        <p className="text-sm md:text-base text-text-secondary mt-6 max-w-2xl leading-relaxed select-text font-medium">
          Search, filter and retrieve data for 457,000+ villages across India. Fast query responses, structured hierarchies, and instant API keys.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 px-7 py-4 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 active:scale-[0.98] hover:-translate-y-[0.5px] rounded-lg shadow-lg hover:shadow-primary-500/15 transition-all duration-200 w-full sm:w-56"
          >
            <span>Get Started</span>
            <ArrowRight size={14} />
          </button>
          
          <button
            onClick={() => window.open('/api-docs', '_blank')}
            className="flex items-center justify-center gap-2 px-7 py-4 text-xs font-bold uppercase tracking-wider text-text-primary bg-gradient-to-br from-background-card to-[#1c1c1e] hover:from-[#1c1c1e] hover:to-[#242426] border border-border hover:border-primary-500/20 active:scale-[0.98] rounded-lg transition-all duration-200 w-full sm:w-56"
          >
            <BookOpen size={14} />
            <span>View Documentation</span>
          </button>
        </div>
      </section>

      {/* 3. CORE FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-border/40 scroll-mt-20 z-10 relative">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">Full Administrative Coverage</h2>
          <p className="text-xs text-text-secondary mt-2">A complete developer toolkit designed for scaling and querying Indian addressing hierarchies.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="bg-gradient-to-br from-background-card to-[#121214]/80 border border-border/80 hover:border-primary-500/30 hover:shadow-glow-purple p-6 rounded-xl transition-all duration-300 group"
              >
                <div className={`p-2.5 rounded-lg border w-fit mb-5 ${feat.color}`}>
                  <Icon size={18} />
                </div>
                <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider mb-2.5">{feat.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed font-medium">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. API EXAMPLES PLAYGROUND SECTION */}
      <section id="api" className="max-w-7xl mx-auto px-6 py-20 border-t border-border/40 scroll-mt-20 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Text Column */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 text-[10px] font-extrabold uppercase tracking-widest w-fit">
              API Sandbox
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">Simple and Powerful Queries</h2>
            <p className="text-xs text-text-secondary leading-relaxed font-medium">
              Integrate database catalogs using clear, standard REST endpoints. Request parameters are mapped against optimized indexing models to assure minimal load times.
            </p>
            <ul className="space-y-4 pt-3 text-xs text-text-secondary font-semibold">
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-primary-400 shrink-0" />
                <span>RESTful Resource Structure</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-primary-400 shrink-0" />
                <span>Strict Authentication Filters</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-primary-400 shrink-0" />
                <span>Full JSON Response Payloads</span>
              </li>
            </ul>
          </div>

          {/* Right Code Column (Interactive Sandbox) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-gradient-to-br from-[#121214] to-[#0c0c0e] border border-border/90 rounded-xl p-5 shadow-2xl flex flex-col gap-4 flex-grow">
              
              {/* Interactive Tabs */}
              <div className="flex flex-wrap gap-1.5 border-b border-border/60 pb-3">
                {Object.keys(apiSandbox).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all duration-150 ${
                      activeTab === key
                        ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                        : 'text-text-secondary hover:text-text-primary border border-transparent'
                    }`}
                  >
                    {apiSandbox[key].name}
                  </button>
                ))}
              </div>

              {/* URL bar */}
              <div className="flex items-center gap-2 px-3 py-2 bg-[#09090b] border border-border/80 rounded-lg text-xs font-mono">
                <span className="text-emerald-400 font-extrabold">{apiSandbox[activeTab].method}</span>
                <span className="text-text-secondary truncate">{apiSandbox[activeTab].path}</span>
                <div className="ml-auto flex items-center gap-2 shrink-0">
                  {loading ? (
                    <RefreshCw size={12} className="animate-spin text-primary-400" />
                  ) : (
                    <span className="text-[10px] bg-primary-950 text-primary-400 border border-primary-500/20 px-1.5 py-0.5 rounded font-sans font-bold">
                      {responseTime}ms
                    </span>
                  )}
                </div>
              </div>

              {/* cURL Request Card */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                  <span>cURL Command</span>
                  <CopyButton text={apiSandbox[activeTab].curl} id="code-curl" />
                </div>
                <pre className="bg-[#09090b] border border-border/80 p-3 rounded-lg font-mono text-[10.5px] text-primary-400 overflow-x-auto select-all leading-relaxed max-h-[100px]">
                  {apiSandbox[activeTab].curl}
                </pre>
              </div>

              {/* Response Code Block */}
              <div className="space-y-1.5 flex-grow">
                <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                  <span>JSON Response</span>
                  <CopyButton text={JSON.stringify(apiSandbox[activeTab].response, null, 2)} id="code-response" />
                </div>
                <div className="relative bg-[#09090b] border border-border/80 rounded-lg overflow-hidden min-h-[160px]">
                  {loading && (
                    <div className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-[1px] flex items-center justify-center">
                      <RefreshCw className="animate-spin text-primary-500" size={24} />
                    </div>
                  )}
                  <pre className="p-3 font-mono text-[10.5px] text-emerald-400 overflow-x-auto select-text leading-relaxed max-h-[220px]">
                    {JSON.stringify(apiSandbox[activeTab].response, null, 2)}
                  </pre>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. PLATFORM STATISTICS SECTION */}
      <section id="stats" className="max-w-7xl mx-auto px-6 py-20 border-t border-border/40 scroll-mt-20 z-10 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-stretch">
          <div className="bg-[#121214]/40 border border-border/60 p-7 rounded-xl text-center space-y-1 flex flex-col justify-center">
            <span className="text-3xl md:text-4xl font-extrabold text-primary-400 tracking-tight">457K+</span>
            <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest">Villages Logged</span>
          </div>

          <div className="bg-[#121214]/40 border border-border/60 p-7 rounded-xl text-center space-y-1 flex flex-col justify-center">
            <span className="text-3xl md:text-4xl font-extrabold text-primary-400 tracking-tight">600+</span>
            <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest">Districts Covered</span>
          </div>

          <div className="bg-[#121214]/40 border border-border/60 p-7 rounded-xl text-center space-y-1 flex flex-col justify-center">
            <span className="text-3xl md:text-4xl font-extrabold text-primary-400 tracking-tight">36</span>
            <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest">States & UTs</span>
          </div>

          <div className="bg-[#121214]/40 border border-border/60 p-7 rounded-xl text-center space-y-1 flex flex-col justify-center">
            <span className="text-3xl md:text-4xl font-extrabold text-primary-400 tracking-tight">&lt;100ms</span>
            <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest">Response Latency</span>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS SECTION */}
      <section id="workflow" className="max-w-7xl mx-auto px-6 py-20 border-t border-border/40 scroll-mt-20 z-10 relative">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">Get Integrated in Minutes</h2>
          <p className="text-xs text-text-secondary mt-2">Follow three simple developer steps to embed addressing catalogs in your workflow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative p-6 bg-[#121214]/30 border border-border/80 rounded-xl space-y-4">
            <div className="h-7 w-7 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 flex items-center justify-center text-xs font-bold">1</div>
            <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider">Create Account</h3>
            <p className="text-xs text-text-secondary leading-relaxed font-medium">
              Sign up instantly for a free developer account in the platform dashboard to access resources.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-6 bg-[#121214]/30 border border-border/80 rounded-xl space-y-4">
            <div className="h-7 w-7 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 flex items-center justify-center text-xs font-bold">2</div>
            <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider">Generate API Key</h3>
            <p className="text-xs text-text-secondary leading-relaxed font-medium">
              Create a secure credentials key string to authenticate queries from script clients.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-6 bg-[#121214]/30 border border-border/80 rounded-xl space-y-4">
            <div className="h-7 w-7 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 flex items-center justify-center text-xs font-bold">3</div>
            <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider">Query Endpoints</h3>
            <p className="text-xs text-text-secondary leading-relaxed font-medium">
              Pass the `x-api-key` header and query endpoints to fetch states, districts, and villages.
            </p>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION (CTA) */}
      <section className="relative max-w-7xl mx-auto px-6 py-16 border-t border-border/40 z-10">
        <div className="relative bg-gradient-to-br from-background-card to-[#161226]/50 border border-primary-500/20 rounded-2xl p-8 md:p-14 overflow-hidden shadow-2xl flex flex-col items-center text-center">
          {/* Accent glow orb */}
          <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary-500/5 blur-3xl pointer-events-none" />

          <h2 className="text-2xl md:text-4xl font-black text-text-primary tracking-tight max-w-2xl leading-tight">Ready to Query Village addressing catalogs?</h2>
          <p className="text-xs md:text-sm text-text-secondary mt-4 max-w-md leading-relaxed font-medium">
            Get started with 100 free requests daily. No credit card required. Upgrade as you scale.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="mt-8 flex items-center justify-center gap-2 px-7 py-4 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 active:scale-[0.98] rounded-lg shadow-lg hover:shadow-primary-500/15 transition-all duration-200"
          >
            <span>Start Querying Now</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* 8. FOOTER SECTION */}
      <footer className="bg-background-card/45 backdrop-blur-md border-t border-border/80 z-10 relative pt-16 pb-12 select-none font-sans text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-border/40 pb-12 mb-8">
          {/* Column 1: Logo & Summary */}
          <div className="space-y-4">
            <Logo className="h-8 w-8" />
            <p className="text-[11px] text-text-secondary leading-relaxed font-medium">
              High-fidelity location intelligence and administrative database mapping 457,000+ Indian villages. Built for performance, caching, and developer experience.
            </p>
          </div>

          {/* Column 2: Platform Links */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-text-secondary font-medium">
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Developer Console</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">API Explorer</Link></li>
              <li><a href="/api-docs" target="_blank" className="hover:text-primary-400 transition-colors">Swagger Schema</a></li>
            </ul>
          </div>

          {/* Column 3: Trust & Legal */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Trust & Legal</h4>
            <ul className="space-y-2 text-text-secondary font-medium">
              <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-primary-400 transition-colors">Cookie Policy</Link></li>
              <li><Link to="/license" className="hover:text-primary-400 transition-colors">Platform License</Link></li>
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Contact & Resources</h4>
            <ul className="space-y-2 text-text-secondary font-medium">
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact Support</Link></li>
              <li><a href="https://github.com/likhith1253/village-api" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">GitHub Repository</a></li>
              <li><a href="/health" target="_blank" className="hover:text-primary-400 transition-colors">API Health Check</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-text-muted font-semibold">
            &copy; {new Date().getFullYear()} CensusGrid. All rights reserved. Indian geographic data services.
          </p>
          <div className="flex gap-4 text-[10px] font-bold text-text-muted">
            <span className="text-emerald-400 inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> All Systems Operational</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
