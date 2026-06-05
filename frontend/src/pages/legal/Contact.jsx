import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/common/Logo';
import Card from '../../components/ui/card';
import Input from '../../components/ui/input';
import Button from '../../components/ui/button';
import { Mail, Globe, Clock, MessageSquare, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Contact Support | CensusGrid';
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate support ticket submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary-500/30 overflow-x-hidden relative">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1b22_1px,transparent_1px),linear-gradient(to_bottom,#1b1b22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/70 relative">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <Logo className="h-8 w-8" />
          </Link>
          <Link to="/" className="text-xs font-bold text-text-secondary hover:text-text-primary border border-border px-3 py-1.5 rounded-lg transition-colors">
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-16 relative z-10 select-text">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest block">Get In Touch</span>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">How Can We Help You?</h1>
          <p className="text-xs text-text-secondary leading-relaxed font-medium">
            Have questions about geographic divisions, Upstash cache configurations, custom SLA options, or billing limits? Send us a ticket.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left: Contact Info (Span 5) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <h3 className="text-base font-bold text-text-primary tracking-tight uppercase">Support Desk</h3>
              <p className="text-xs text-text-secondary leading-relaxed font-medium">
                Our core systems team typically responds within 12-24 hours for developer queries, and under 2 hours for premium SLA enterprise accounts.
              </p>

              <div className="space-y-4 border-t border-border/40 pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary-500/10 border border-primary-500/15 flex items-center justify-center text-primary-400">
                    <Mail size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase block">Direct Email</span>
                    <a href="mailto:support@censusgrid.com" className="text-xs font-semibold text-text-primary hover:text-primary-400 transition-colors">
                      support@censusgrid.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary-500/10 border border-primary-500/15 flex items-center justify-center text-primary-400">
                    <Globe size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase block">Monorepo Issues</span>
                    <a href="https://github.com/likhith1253/village-api/issues" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-text-primary hover:text-primary-400 transition-colors">
                      Report on GitHub
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary-500/10 border border-primary-500/15 flex items-center justify-center text-primary-400">
                    <Clock size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase block">Office Hours</span>
                    <span className="text-xs font-semibold text-text-primary">
                      Mon - Fri: 09:00 - 18:00 IST
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-background-card/50 border border-border/80 rounded-xl flex items-start gap-3">
              <MessageSquare size={16} className="text-primary-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-text-secondary leading-relaxed font-medium">
                Standard free account metrics queries are supported community-wide on our repository discussions board.
              </p>
            </div>
          </div>

          {/* Right: Contact Form (Span 7) */}
          <div className="lg:col-span-7 flex">
            <Card className="flex-1 p-6 md:p-8 bg-gradient-to-br from-background-card to-[#0d0d0f]">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-4">
                  <CheckCircle size={44} className="text-emerald-400 animate-bounce" />
                  <h3 className="text-lg font-bold text-text-primary tracking-tight">Support Ticket Created</h3>
                  <p className="text-xs text-text-secondary max-w-sm leading-relaxed font-medium">
                    Thank you! Your query has been logged. Our developer experience engineers will follow up at your email coordinates shortly.
                  </p>
                  <Button onClick={() => setSubmitted(false)} className="w-auto px-6 text-xs">
                    Submit Another Ticket
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    label="Developer Name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. John Doe"
                    disabled={loading}
                  />

                  <Input
                    label="Email Address"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. developer@company.com"
                    disabled={loading}
                  />

                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                      Inquiry Type
                    </label>
                    <select
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-[#151517] border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                      disabled={loading}
                    >
                      <option value="general">General Support</option>
                      <option value="billing">Plan Upgrades & Billing</option>
                      <option value="tech">API Integration & Caching Issues</option>
                      <option value="custom">Enterprise Custom SLA Requirements</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                      Message / Inquiry Details
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder="Please describe your query here..."
                      className="w-full px-3 py-2 bg-[#151517] border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium resize-none"
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" loading={loading} className="w-full text-xs">
                    Send Support Message
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-background-card/20 py-8 relative z-10 text-center text-[10px] text-text-muted">
        <p>&copy; {new Date().getFullYear()} CensusGrid. All rights reserved.</p>
      </footer>
    </div>
  );
}
