import React, { useState, useEffect } from 'react';
import Card from '../components/ui/card';
import { 
  BookOpen, 
  Terminal, 
  Key, 
  Globe, 
  ShieldAlert, 
  Activity, 
  Check, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Code,
  ArrowUpRight
} from 'lucide-react';

export default function Documentation() {
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    document.title = 'Documentation | CensusGrid';
  }, []);

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

  const sections = [
    { id: 'intro', name: 'Introduction' },
    { id: 'auth', name: 'Authentication' },
    { id: 'keys', name: 'API Key Management' },
    { id: 'geo', name: 'Geographic APIs' },
    { id: 'analytics', name: 'Analytics APIs' },
    { id: 'usage', name: 'Usage & Quotas' }
  ];

  // Helper for scroll navigation
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Offset for header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const docsUrl = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}/api-docs`
    : 'http://localhost:3000/api-docs';

  return (
    <div className="space-y-6 select-none font-sans pb-12 relative">
      {/* Header Title & Swagger Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Developer Portal</h1>
          <p className="text-xs text-text-secondary mt-0.5">Integrate geographic data into your client services, models, and scripts.</p>
        </div>
        
        <button
          onClick={() => window.open(docsUrl, '_blank')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 active:scale-[0.98] rounded-lg shadow-md hover:shadow-primary-500/10 transition-all duration-200 select-none shrink-0"
        >
          <span>Open Full Swagger Documentation</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Documentation Core (Span 9) */}
        <div className="lg:col-span-9 space-y-12 select-text">
          
          {/* SECTION 1: INTRODUCTION */}
          <section id="intro" className="space-y-4">
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={16} className="text-primary-400" />
              <span>1. Introduction</span>
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Welcome to the <strong>CensusGrid Geographic Data Platform</strong>. This platform provides lightning-fast, highly optimized REST endpoints to query and filter Indian administrative divisions across <strong>States, Districts, Sub-districts, and Villages</strong>. 
            </p>
            <p className="text-xs text-text-secondary leading-relaxed mt-2">
              Built on a premium technological stack using <strong>Node.js, Express, PostgreSQL (Neon Serverless), and Upstash Redis caching</strong>, the platform is engineered to deliver sub-100ms response times for high-volume database reads. Whether you are building logistics routing, geolocational addressing, agricultural datasets, or compliance verification workflows, our platform provides the perfect SaaS data backbone.
            </p>
          </section>

          {/* SECTION 2: AUTHENTICATION */}
          <section id="auth" className="space-y-4">
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Code size={16} className="text-primary-400" />
              <span>2. Authentication</span>
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              The platform utilizes two distinct authentication mechanisms depending on the category of resources being accessed:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="p-4 bg-[#151517] border border-border/80 rounded-lg space-y-2">
                <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest block">Dashboard JWT Auth</span>
                <p className="text-[11px] text-text-secondary leading-normal">
                  Used for account management, usage checks, and API Key administration. Requires a standard JSON Web Token (JWT) passed in the HTTP Authorization header.
                </p>
                <div className="p-2 bg-[#09090b] rounded border border-border/50 font-mono text-[10px] text-text-muted select-all">
                  Authorization: Bearer &lt;your_jwt_token&gt;
                </div>
              </div>

              <div className="p-4 bg-[#151517] border border-border/80 rounded-lg space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Geographic API Keys</span>
                <p className="text-[11px] text-text-secondary leading-normal">
                  Used for querying data endpoints (`/api/v1/*`). Requires an active developer credential key passed in the custom header block.
                </p>
                <div className="p-2 bg-[#09090b] rounded border border-border/50 font-mono text-[10px] text-text-muted select-all">
                  x-api-key: vap_&lt;your_hex_credential_string&gt;
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: API KEY MANAGEMENT */}
          <section id="keys" className="space-y-4">
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Key size={16} className="text-primary-400" />
              <span>3. API Key Management</span>
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              API Keys are securely generated from the dashboard client portal. You can create multiple keys, activate/deactivate them dynamically to control traffic routing, or revoke keys permanently if compromised.
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              For security reasons, the full API key token is displayed **only once** upon generation. If you lose the token string, you must revoke the key and generate a new credentials token block.
            </p>
          </section>

          {/* SECTION 4: GEOGRAPHIC APIS */}
          <section id="geo" className="space-y-6">
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Globe size={16} className="text-primary-400" />
              <span>4. Geographic APIs</span>
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Geographic endpoints return paginated and query-filtered results. Upstash Redis caches high-frequency reads (e.g. states list, district catalogs) for 1 hour to guarantee high availability and minimal latencies.
            </p>

            {/* ENDPOINT CARD 1: GET States */}
            <div className="border border-border/80 rounded-xl overflow-hidden bg-background-card/25 shadow-lg">
              <div className="bg-[#151517] px-4 py-3 border-b border-border/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-[10px] font-bold uppercase">GET</span>
                  <span className="font-mono text-xs text-text-primary">/api/v1/states</span>
                </div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Fetch States</span>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-xs text-text-secondary">Retrieves all Indian states, sorted alphabetically by name.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* request snippet */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                      <span>cURL Example</span>
                      <CopyButton id="curl-states" text='curl -H "x-api-key: your_key" https://api.censusgrid.in/api/v1/states' />
                    </div>
                    <pre className="bg-[#09090b] border border-border p-3 rounded-lg font-mono text-[10.5px] text-primary-400 overflow-x-auto select-all">
                      curl -H "x-api-key: your_key" \<br />
                      &nbsp;&nbsp;https://api.censusgrid.in/api/v1/states
                    </pre>
                  </div>
                  {/* response snippet */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                      <span>Response Payload</span>
                      <CopyButton id="res-states" text='{"success":true,"count":1,"data":[{"id":1,"name":"Andhra Pradesh","stateCode":"AP"}]}' />
                    </div>
                    <pre className="bg-[#09090b] border border-border p-3 rounded-lg font-mono text-[10.5px] text-emerald-400 overflow-x-auto max-h-[120px] select-text">
{`{
  "success": true,
  "count": 36,
  "data": [
    {
      "id": 1,
      "name": "Andhra Pradesh",
      "stateCode": "AP"
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* ENDPOINT CARD 2: GET Districts */}
            <div className="border border-border/80 rounded-xl overflow-hidden bg-background-card/25 shadow-lg">
              <div className="bg-[#151517] px-4 py-3 border-b border-border/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-[10px] font-bold uppercase">GET</span>
                  <span className="font-mono text-xs text-text-primary">/api/v1/districts</span>
                </div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Fetch Districts</span>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-xs text-text-secondary">Retrieves all districts belonging to a state by its code. Returns 400 if stateCode query argument is missing.</p>
                
                {/* Parameters Table */}
                <div className="overflow-x-auto border border-border/50 rounded-lg">
                  <table className="w-full text-left text-[11px] border-collapse bg-[#151517]/20">
                    <thead>
                      <tr className="border-b border-border/40 text-[9.5px] font-bold text-text-muted uppercase tracking-wider bg-[#151517]/50">
                        <th className="px-4 py-2">Parameter</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Required</th>
                        <th className="px-4 py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 text-text-secondary">
                      <tr>
                        <td className="px-4 py-2.5 font-semibold text-text-primary">stateCode</td>
                        <td className="px-4 py-2.5 font-mono text-[10px]">string</td>
                        <td className="px-4 py-2.5 text-rose-400 font-bold">Yes</td>
                        <td className="px-4 py-2.5">The unique code of the state. Example: `AP`</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* request snippet */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                      <span>cURL Example</span>
                      <CopyButton id="curl-districts" text='curl -H "x-api-key: your_key" "https://api.censusgrid.in/api/v1/districts?stateCode=AP"' />
                    </div>
                    <pre className="bg-[#09090b] border border-border p-3 rounded-lg font-mono text-[10.5px] text-primary-400 overflow-x-auto select-all">
                      curl -H "x-api-key: your_key" \<br />
                      &nbsp;&nbsp;"https://api.censusgrid.in/api/v1/districts?stateCode=AP"
                    </pre>
                  </div>
                  {/* response snippet */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                      <span>Response Payload</span>
                      <CopyButton id="res-districts" text='{"success":true,"count":1,"data":[{"id":1,"name":"Anantapur","districtCode":"AP01"}]}' />
                    </div>
                    <pre className="bg-[#09090b] border border-border p-3 rounded-lg font-mono text-[10.5px] text-emerald-400 overflow-x-auto max-h-[120px] select-text">
{`{
  "success": true,
  "count": 13,
  "data": [
    {
      "id": 1,
      "name": "Anantapur",
      "districtCode": "AP01"
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* ENDPOINT CARD 3: GET Sub-districts */}
            <div className="border border-border/80 rounded-xl overflow-hidden bg-background-card/25 shadow-lg">
              <div className="bg-[#151517] px-4 py-3 border-b border-border/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-[10px] font-bold uppercase">GET</span>
                  <span className="font-mono text-xs text-text-primary">/api/v1/subdistricts</span>
                </div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Fetch Sub-Districts</span>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-xs text-text-secondary">Retrieves sub-districts belonging to a district code. Returns 400 if districtCode is missing.</p>
                
                {/* Parameters Table */}
                <div className="overflow-x-auto border border-border/50 rounded-lg">
                  <table className="w-full text-left text-[11px] border-collapse bg-[#151517]/20">
                    <thead>
                      <tr className="border-b border-border/40 text-[9.5px] font-bold text-text-muted uppercase tracking-wider bg-[#151517]/50">
                        <th className="px-4 py-2">Parameter</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Required</th>
                        <th className="px-4 py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 text-text-secondary">
                      <tr>
                        <td className="px-4 py-2.5 font-semibold text-text-primary">districtCode</td>
                        <td className="px-4 py-2.5 font-mono text-[10px]">string</td>
                        <td className="px-4 py-2.5 text-rose-400 font-bold">Yes</td>
                        <td className="px-4 py-2.5">The unique code of the district. Example: `AP01`</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* request snippet */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                      <span>cURL Example</span>
                      <CopyButton id="curl-subdist" text='curl -H "x-api-key: your_key" "https://api.censusgrid.in/api/v1/subdistricts?districtCode=AP01"' />
                    </div>
                    <pre className="bg-[#09090b] border border-border p-3 rounded-lg font-mono text-[10.5px] text-primary-400 overflow-x-auto select-all">
                      curl -H "x-api-key: your_key" \<br />
                      &nbsp;&nbsp;"https://api.censusgrid.in/api/v1/subdistricts?districtCode=AP01"
                    </pre>
                  </div>
                  {/* response snippet */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                      <span>Response Payload</span>
                      <CopyButton id="res-subdist" text='{"success":true,"count":1,"data":[{"id":1,"name":"Agali","subDistrictCode":"05448"}]}' />
                    </div>
                    <pre className="bg-[#09090b] border border-border p-3 rounded-lg font-mono text-[10.5px] text-emerald-400 overflow-x-auto max-h-[120px] select-text">
{`{
  "success": true,
  "count": 63,
  "data": [
    {
      "id": 1,
      "name": "Agali",
      "subDistrictCode": "05448"
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* ENDPOINT CARD 4: GET Village Search */}
            <div className="border border-border/80 rounded-xl overflow-hidden bg-background-card/25 shadow-lg">
              <div className="bg-[#151517] px-4 py-3 border-b border-border/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-[10px] font-bold uppercase">GET</span>
                  <span className="font-mono text-xs text-text-primary">/api/v1/villages/search</span>
                </div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Search Villages</span>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-xs text-text-secondary">Searches villages using partial case-insensitive string matching. Returns a maximum of 20 matches.</p>
                
                {/* Parameters Table */}
                <div className="overflow-x-auto border border-border/50 rounded-lg">
                  <table className="w-full text-left text-[11px] border-collapse bg-[#151517]/20">
                    <thead>
                      <tr className="border-b border-border/40 text-[9.5px] font-bold text-text-muted uppercase tracking-wider bg-[#151517]/50">
                        <th className="px-4 py-2">Parameter</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Required</th>
                        <th className="px-4 py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 text-text-secondary">
                      <tr>
                        <td className="px-4 py-2.5 font-semibold text-text-primary">q</td>
                        <td className="px-4 py-2.5 font-mono text-[10px]">string</td>
                        <td className="px-4 py-2.5 text-rose-400 font-bold">Yes</td>
                        <td className="px-4 py-2.5">The query string matched against village name. Min 3 chars recommended.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-semibold text-text-primary">subDistrictCode</td>
                        <td className="px-4 py-2.5 font-mono text-[10px]">string</td>
                        <td className="px-4 py-2.5 text-text-muted">No</td>
                        <td className="px-4 py-2.5">Narrow search bounds to a specific sub-district code.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* request snippet */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                      <span>cURL Example</span>
                      <CopyButton id="curl-vsearch" text='curl -H "x-api-key: your_key" "https://api.censusgrid.in/api/v1/villages/search?q=Agali"' />
                    </div>
                    <pre className="bg-[#09090b] border border-border p-3 rounded-lg font-mono text-[10.5px] text-primary-400 overflow-x-auto select-all">
                      curl -H "x-api-key: your_key" \<br />
                      &nbsp;&nbsp;"https://api.censusgrid.in/api/v1/villages/search?q=Agali"
                    </pre>
                  </div>
                  {/* response snippet */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                      <span>Response Payload</span>
                      <CopyButton id="res-vsearch" text='{"success":true,"count":1,"data":[{"villageCode":"622345","name":"Agali"}]}' />
                    </div>
                    <pre className="bg-[#09090b] border border-border p-3 rounded-lg font-mono text-[10.5px] text-emerald-400 overflow-x-auto max-h-[120px] select-text">
{`{
  "success": true,
  "count": 1,
  "data": [
    {
      "villageCode": "622345",
      "name": "Agali"
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* ENDPOINT CARD 5: GET Village Details */}
            <div className="border border-border/80 rounded-xl overflow-hidden bg-background-card/25 shadow-lg">
              <div className="bg-[#151517] px-4 py-3 border-b border-border/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-[10px] font-bold uppercase">GET</span>
                  <span className="font-mono text-xs text-text-primary">/api/v1/villages/:villageCode</span>
                </div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Village Details</span>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-xs text-text-secondary">Retrieves full geographic parent hierarchy of a village using its unique villageCode.</p>
                
                {/* Parameters Table */}
                <div className="overflow-x-auto border border-border/50 rounded-lg">
                  <table className="w-full text-left text-[11px] border-collapse bg-[#151517]/20">
                    <thead>
                      <tr className="border-b border-border/40 text-[9.5px] font-bold text-text-muted uppercase tracking-wider bg-[#151517]/50">
                        <th className="px-4 py-2">Parameter</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Required</th>
                        <th className="px-4 py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 text-text-secondary">
                      <tr>
                        <td className="px-4 py-2.5 font-semibold text-text-primary">:villageCode</td>
                        <td className="px-4 py-2.5 font-mono text-[10px]">string (path)</td>
                        <td className="px-4 py-2.5 text-rose-400 font-bold">Yes</td>
                        <td className="px-4 py-2.5">The unique village code. Example: `622345`</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* request snippet */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                      <span>cURL Example</span>
                      <CopyButton id="curl-vdetails" text='curl -H "x-api-key: your_key" https://api.censusgrid.in/api/v1/villages/622345' />
                    </div>
                    <pre className="bg-[#09090b] border border-border p-3 rounded-lg font-mono text-[10.5px] text-primary-400 overflow-x-auto select-all">
                      curl -H "x-api-key: your_key" \<br />
                      &nbsp;&nbsp;https://api.censusgrid.in/api/v1/villages/622345
                    </pre>
                  </div>
                  {/* response snippet */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                      <span>Response Payload</span>
                      <CopyButton id="res-vdetails" text='{"success":true,"data":{"villageCode":"622345","villageName":"Agali","state":"Andhra Pradesh","district":"Anantapur","subDistrict":"Agali","fullAddress":"Agali, Agali, Anantapur, Andhra Pradesh"}}' />
                    </div>
                    <pre className="bg-[#09090b] border border-border p-3 rounded-lg font-mono text-[10.5px] text-emerald-400 overflow-x-auto max-h-[140px] select-text">
{`{
  "success": true,
  "data": {
    "villageCode": "622345",
    "villageName": "Agali",
    "state": "Andhra Pradesh",
    "district": "Anantapur",
    "subDistrict": "Agali",
    "fullAddress": "Agali, Agali, Anantapur, Andhra Pradesh"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: ANALYTICS APIS */}
          <section id="analytics" className="space-y-4">
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-primary-400" />
              <span>5. Analytics APIs</span>
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              These endpoints aggregate request telemetry logs. For security reasons, analytics data is restricted to users with the <span className="font-semibold text-text-primary">ADMIN</span> role. Querying these endpoints returns a `403 Forbidden` for standard users.
            </p>

            <div className="border border-border/80 rounded-xl overflow-hidden bg-background-card/25 shadow-lg">
              <div className="bg-[#151517] px-4 py-3 border-b border-border/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/15 text-[10px] font-bold uppercase">GET</span>
                  <span className="font-mono text-xs text-text-primary">/api/analytics/summary</span>
                </div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Metrics Summary</span>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-text-secondary">Returns counts of total request logs, daily logs, and unique keys/users active.</p>
                <pre className="bg-[#09090b] border border-border p-3 rounded-lg font-mono text-[10.5px] text-emerald-400 overflow-x-auto max-h-[140px] select-text">
{`{
  "success": true,
  "data": {
    "totalRequests": 1420,
    "requestsToday": 240,
    "uniqueApiKeys": 4,
    "uniqueUsers": 2
  }
}`}
                </pre>
              </div>
            </div>
          </section>

          {/* SECTION 6: USAGE APIS */}
          <section id="usage" className="space-y-4">
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={16} className="text-primary-400" />
              <span>6. Usage & Quotas</span>
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Users can monitor their quota limits programmatically. The usage endpoint determines request quotas and returns active statistics.
            </p>

            <div className="border border-border/80 rounded-xl overflow-hidden bg-background-card/25 shadow-lg">
              <div className="bg-[#151517] px-4 py-3 border-b border-border/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/15 text-[10px] font-bold uppercase">GET</span>
                  <span className="font-mono text-xs text-text-primary">/api/usage/me</span>
                </div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">User Usage Quotas</span>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-text-secondary">Fetches current plan rate limits and the count of queries executed today.</p>
                <pre className="bg-[#09090b] border border-border p-3 rounded-lg font-mono text-[10.5px] text-emerald-400 overflow-x-auto max-h-[150px] select-text">
{`{
  "success": true,
  "data": {
    "userId": 4,
    "plan": "FREE",
    "requestsToday": 12,
    "dailyLimit": 100,
    "remaining": 88
  }
}`}
                </pre>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column: Outline Sidebar Navigation (Span 3) */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-6">
          <Card className="p-5">
            <h4 className="text-[10px] font-bold text-text-secondary tracking-wider uppercase mb-3">On this page</h4>
            <nav className="flex flex-col gap-2.5">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className="flex items-center gap-1.5 text-left text-xs font-semibold text-text-secondary hover:text-primary-400 hover:translate-x-0.5 transition-all duration-150 group"
                >
                  <ChevronRight size={12} className="text-text-muted group-hover:text-primary-400 shrink-0" />
                  <span>{sec.name}</span>
                </button>
              ))}
            </nav>
          </Card>
          
          <Card className="p-5 bg-gradient-to-br from-[#121214] to-[#1d1033]/30 border border-primary-500/10">
            <h4 className="text-[10px] font-bold text-primary-400 tracking-wider uppercase flex items-center gap-1.5 mb-2">
              <Terminal size={12} />
              <span>Full API Playground</span>
            </h4>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Test and run queries dynamically against actual geographic databases using your active keys in the API Explorer.
            </p>
            <button
              onClick={() => window.location.href = '/api-explorer'}
              className="mt-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary-400 hover:text-primary-300 transition-colors"
            >
              <span>Explore Endpoints</span>
              <ChevronRight size={12} />
            </button>
          </Card>
        </div>

      </div>
    </div>
  );
}
