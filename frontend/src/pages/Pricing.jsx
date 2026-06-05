import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import Card from '../components/ui/card';
import Button from '../components/ui/button';
import Logo from '../components/common/Logo';
import {
  Check,
  X,
  ArrowRight,
  Zap,
  Shield,
  Sparkles,
  ArrowLeft,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgradePro = async () => {
    if (!user) {
      navigate('/login?redirect=/pricing');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/api/billing/checkout');
      const { checkoutUrl } = response.data.data;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Stripe checkout error:', err);
      setError(err.response?.data?.message || 'Failed to initialize payment checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = (user?.plan || 'FREE').toUpperCase();

  const plans = [
    {
      id: 'FREE',
      name: 'Developer Free',
      description: 'Perfect for prototyping, testing, and small personal projects.',
      price: '$0',
      period: 'forever',
      features: [
        '100 requests per day',
        'Basic village search',
        'Up to 3 active API keys',
        'Community support',
        'Redis caching (standard latency)'
      ],
      notIncluded: [
        'Advanced analytics dashboard',
        'Historical usage trend charts',
        'Data exports (CSV/JSON)',
        'Priority SLA support',
        'Unlimited request quotas'
      ],
      cta: currentPlan === 'FREE' ? 'Current Plan' : 'Select Free Plan',
      ctaAction: () => {
        if (!user) navigate('/register');
      },
      disabled: currentPlan === 'FREE',
      highlight: false,
      icon: Zap
    },
    {
      id: 'PRO',
      name: 'Developer Pro',
      description: 'Designed for production workloads and growing applications.',
      price: '$49',
      period: 'per month',
      features: [
        '10,000 requests per day',
        'Advanced fuzzy village search',
        'Unlimited API keys',
        'Access to Analytics dashboard',
        'Daily usage trends & response charts',
        'Raw telemetry data exports',
        'Standard email support'
      ],
      notIncluded: [
        'Unlimited (Infinity) requests',
        'Priority SLA response times',
        'Dedicated onboarding manager',
        'Custom database queries'
      ],
      cta: currentPlan === 'PRO' ? 'Current Plan' : (currentPlan === 'ENTERPRISE' ? 'Downgrade to Pro' : 'Upgrade to Pro'),
      ctaAction: handleUpgradePro,
      disabled: currentPlan === 'PRO',
      highlight: true,
      icon: Sparkles
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      description: 'For organizations requiring high availability and custom volumes.',
      price: 'Custom',
      period: 'tailored pricing',
      features: [
        'Unlimited requests (Infinity)',
        'Priority support (Slack & Email)',
        'Dedicated onboarding integration',
        '99.9% uptime SLA guarantee',
        'Custom endpoint development',
        'Dedicated account management'
      ],
      notIncluded: [],
      cta: currentPlan === 'ENTERPRISE' ? 'Current Plan' : 'Contact Support',
      ctaAction: () => {
        window.location.href = 'mailto:support@censusgrid.com?subject=CensusGrid%20Enterprise%20Plan%20Inquiry&body=Hi%20CensusGrid%20Team,%0D%0A%0D%0AI%20would%20like%20to%20request%20information%20about%20the%20Enterprise%20Plan%20for%20CensusGrid.%0D%0A%0D%0AMy%20organization%20name:%20%0D%0AEstimated%20daily%20requests:%20%0D%0AUse%20case%20details:%20%0D%0A%0D%0AThanks!';
      },
      disabled: currentPlan === 'ENTERPRISE',
      highlight: false,
      icon: Shield
    }
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans relative select-none pb-20">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1b22_1px,transparent_1px),linear-gradient(to_bottom,#1b1b22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none z-0" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/70 relative">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={user ? "/dashboard" : "/"} className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg border border-border/60 hover:bg-background-popover/30 transition-all duration-200">
              <ArrowLeft size={16} />
            </Link>
            <Logo className="h-8 w-8" />
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="text-xs font-bold text-primary-400 hover:text-primary-300">
                Back to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-xs font-bold text-text-secondary hover:text-text-primary">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg shadow-md hover:from-primary-500 hover:to-primary-400 transition-all">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-16 relative z-10">
        {/* Glow Orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-primary-600/5 blur-[100px] pointer-events-none" />

        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-4">
            Pricing Plans
          </div>
          <h1 className="text-3xl sm:text-4.5xl font-black tracking-tight text-text-primary">
            Flexible Plans for <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-violet-500 bg-clip-text text-transparent">Every Developer Tier</span>
          </h1>
          <p className="text-xs text-text-secondary mt-3 max-w-lg mx-auto">
            Choose a plan matching your product scale. All subscriptions include complete geographic administrative models for India.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-950/40 border border-red-500/30 rounded-xl p-4 flex gap-3 text-red-400 text-xs font-medium">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between p-6 ${
                  plan.highlight
                    ? 'border-primary-500 bg-gradient-to-br from-[#1b1230] to-[#121214] shadow-2xl shadow-primary-500/5'
                    : ''
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-primary-500 text-white text-[9px] font-extrabold uppercase tracking-widest shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-text-primary">{plan.name}</h3>
                    <div className={`p-2 rounded-lg ${plan.highlight ? 'bg-primary-500/10 text-primary-400' : 'bg-border/60 text-text-secondary'}`}>
                      <Icon size={18} />
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed mb-6">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1.5 mb-6">
                    <span className="text-4xl font-extrabold tracking-tight text-text-primary">{plan.price}</span>
                    <span className="text-xs text-text-secondary font-medium">/ {plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8 text-xs font-medium">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-text-primary">
                        <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-text-secondary/50">
                        <X size={14} className="text-text-secondary/20 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-border/30">
                  <Button
                    onClick={plan.ctaAction}
                    disabled={plan.disabled || loading}
                    loading={plan.id === 'PRO' && loading}
                    className={`w-full text-xs font-bold uppercase tracking-wider ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500'
                        : plan.disabled
                        ? 'bg-transparent border border-border text-text-secondary cursor-not-allowed hover:transform-none hover:shadow-none'
                        : 'bg-transparent border border-border hover:bg-background-popover/30 text-text-primary'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-lg font-bold text-text-primary">Detailed Feature Matrix</h2>
            <p className="text-xs text-text-secondary mt-1">Compare technical capabilities across plans.</p>
          </div>

          <div className="bg-[#121214]/40 border border-border/80 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="border-b border-border/80 bg-background-card/50">
                    <th className="p-4 font-bold text-text-secondary uppercase tracking-wider">Features & Limits</th>
                    <th className="p-4 font-bold text-text-secondary uppercase tracking-wider">Free</th>
                    <th className="p-4 font-bold text-text-secondary uppercase tracking-wider text-primary-400">Pro</th>
                    <th className="p-4 font-bold text-text-secondary uppercase tracking-wider">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  <tr>
                    <td className="p-4 text-text-primary font-bold">Daily API Limit</td>
                    <td className="p-4 text-text-secondary">100 requests</td>
                    <td className="p-4 text-primary-400 font-bold">10,000 requests</td>
                    <td className="p-4 text-text-primary">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-text-primary font-bold">API Key Manager</td>
                    <td className="p-4 text-text-secondary">Max 3 keys</td>
                    <td className="p-4 text-primary-400 font-bold">Unlimited</td>
                    <td className="p-4 text-text-primary">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-text-primary font-bold">Fuzzy Village Search</td>
                    <td className="p-4 text-text-secondary">Basic matching</td>
                    <td className="p-4 text-primary-400 font-bold">Advanced indexing</td>
                    <td className="p-4 text-text-primary">Advanced indexing</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-text-primary font-bold">Advanced Analytics</td>
                    <td className="p-4 text-text-secondary flex justify-start"><X size={14} className="text-red-500/50" /></td>
                    <td className="p-4 text-primary-400 font-bold flex justify-start"><Check size={14} className="text-emerald-400" /></td>
                    <td className="p-4 text-text-primary"><Check size={14} className="text-emerald-400" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 text-text-primary font-bold">Historical Usage Charts</td>
                    <td className="p-4 text-text-secondary"><X size={14} className="text-red-500/50" /></td>
                    <td className="p-4 text-primary-400 font-bold"><Check size={14} className="text-emerald-400" /></td>
                    <td className="p-4 text-text-primary"><Check size={14} className="text-emerald-400" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 text-text-primary font-bold">Priority SLA Response</td>
                    <td className="p-4 text-text-secondary"><X size={14} className="text-red-500/50" /></td>
                    <td className="p-4 text-text-secondary"><X size={14} className="text-red-500/50" /></td>
                    <td className="p-4 text-text-primary font-bold">99.9% Guarantee</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-text-primary font-bold">Dedicated Onboarding</td>
                    <td className="p-4 text-text-secondary"><X size={14} className="text-red-500/50" /></td>
                    <td className="p-4 text-text-secondary"><X size={14} className="text-red-500/50" /></td>
                    <td className="p-4 text-text-primary"><Check size={14} className="text-emerald-400" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pricing FAQ */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-lg font-bold text-text-primary">Pricing FAQ</h2>
            <p className="text-xs text-text-secondary mt-1">Frequently asked questions about subscription details.</p>
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-primary mb-2 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-primary-400" />
                <span>How are rate limits calculated?</span>
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed font-medium">
                Rate limits are measured in calendar days based on Coordinated Universal Time (UTC). Once your request quota is met, further API calls will fail with a `429 Too Many Requests` error until the day resets at 00:00 UTC.
              </p>
            </Card>

            <Card className="p-5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-primary mb-2 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-primary-400" />
                <span>Can I cancel my subscription?</span>
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed font-medium">
                Yes. You can cancel your subscription inside your account Settings page at any time. After cancellation, you will retain access to Developer Pro limits and analytics dashboard features until the end of your billing cycle.
              </p>
            </Card>

            <Card className="p-5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-primary mb-2 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-primary-400" />
                <span>What payment methods are supported?</span>
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed font-medium">
                We accept credit card payments, debit cards, and standard Stripe-supported bank redirect methods. Stripe handles our security compliance and customer billing vaults.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
