import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ApiKeys from './pages/ApiKeys';
import Usage from './pages/Usage';
import Landing from './pages/Landing';
import Analytics from './pages/Analytics';
import ApiExplorer from './pages/ApiExplorer';
import Documentation from './pages/Documentation';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import Payments from './pages/Payments';
import AdminDashboard from './pages/AdminDashboard';

// Trust, Legal & Production Pages
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import CookiePolicy from './pages/legal/CookiePolicy';
import License from './pages/legal/License';
import Contact from './pages/legal/Contact';
import NotFound from './pages/NotFound';
import Maintenance from './pages/Maintenance';

// Components
import FeatureLocked from './components/common/FeatureLocked';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role?.toUpperCase() !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
};

const LockedRoute = ({ children, featureName }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  // Check if user has Pro plan or is demo user
  const isPro = user.plan === 'PRO' || user.isDemo;
  
  if (!isPro) {
    return (
      <DashboardLayout>
        <FeatureLocked featureName={featureName} />
      </DashboardLayout>
    );
  }
  
  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Paths */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      </Route>

      {/* Public Landing & Trust/Legal Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/license" element={<License />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/maintenance" element={<Maintenance />} />

      {/* Dashboard Protected Paths */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/api-keys" element={<ApiKeys />} />
        <Route path="/api-explorer" element={<ApiExplorer />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Pro Tier & Demo Accessible Routes */}
        <Route path="/usage" element={<LockedRoute featureName="Usage Analytics"><Usage /></LockedRoute>} />
        <Route path="/analytics" element={<LockedRoute featureName="Advanced Analytics"><Analytics /></LockedRoute>} />
        <Route path="/payments" element={<LockedRoute featureName="Billing and Payments"><Payments /></LockedRoute>} />

        {/* Admin only */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Route>

      {/* Custom 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
