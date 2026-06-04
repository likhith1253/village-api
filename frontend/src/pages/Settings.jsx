import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import Card from '../components/ui/card';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import { 
  User, 
  Lock, 
  Check, 
  AlertCircle, 
  ShieldAlert, 
  Layers, 
  UserCheck
} from 'lucide-react';

export default function Settings() {
  const [profile, setProfile] = useState({ name: '', email: '', plan: 'FREE', role: 'USER' });
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  
  // Profile update form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFormErrors, setProfileFormErrors] = useState({});

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordFormErrors, setPasswordFormErrors] = useState({});

  // Toast Alerts State
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    setProfileError('');
    try {
      const res = await apiClient.get('/users/me');
      const data = res.data.data;
      setProfile(data);
      setName(data.name || '');
      setEmail(data.email || '');
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setProfileError('Failed to retrieve account details. Please try again.');
      showToast('Failed to retrieve account details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileFormErrors({});
    
    // Client-side validations
    const errors = {};
    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Invalid email address format';
    }

    if (Object.keys(errors).length > 0) {
      setProfileFormErrors(errors);
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await apiClient.put('/users/profile', { name, email });
      setProfile(prev => ({ ...prev, name: res.data.data.name, email: res.data.data.email }));
      showToast('Profile information updated successfully');
    } catch (err) {
      console.error('Profile update error:', err);
      if (err.response?.data?.errors) {
        // Map backend validation errors to fields
        const backendErrors = {};
        err.response.data.errors.forEach(e => {
          backendErrors[e.field] = e.message;
        });
        setProfileFormErrors(backendErrors);
      } else {
        showToast(err.response?.data?.message || 'Failed to update profile information', 'error');
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordFormErrors({});

    // Client-side validations
    const errors = {};
    if (!currentPassword) errors.currentPassword = 'Current password is required';
    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters';
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordFormErrors(errors);
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await apiClient.put('/users/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully');
    } catch (err) {
      console.error('Password update error:', err);
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach(e => {
          backendErrors[e.field] = e.message;
        });
        setPasswordFormErrors(backendErrors);
      } else {
        showToast(err.response?.data?.message || 'Incorrect current password or update failed', 'error');
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 select-none pb-6">
        <div>
          <div className="h-7 bg-border rounded w-48 animate-pulse mb-2"></div>
          <div className="h-3.5 bg-border rounded w-80 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-background-card to-[#121214] border border-border rounded-xl p-6 h-96 animate-pulse" />
          <div className="bg-gradient-to-br from-background-card to-[#121214] border border-border rounded-xl p-6 h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 select-none">
        <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 shadow-lg shadow-red-500/5">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-text-primary">Failed to load account settings</h3>
        <p className="text-text-secondary mt-1.5 max-w-sm text-xs leading-normal">{profileError}</p>
        <Button onClick={fetchUserProfile} className="mt-6 w-auto px-6">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none font-sans pb-6 relative">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Account Settings</h1>
        <p className="text-xs text-text-secondary mt-0.5">Manage your developer profile info, API access plan, and password credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Column: Profile Information Card */}
        <Card className="flex flex-col justify-between p-6">
          <div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-5 flex items-center gap-1.5">
              <User size={14} className="text-primary-400" />
              <span>Profile Information</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Full Name"
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={profileFormErrors.name}
              />

              <Input
                label="Email Address"
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={profileFormErrors.email}
              />

              {/* Readonly Account Details */}
              <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4 mt-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                    <Layers size={11} className="text-primary-400" />
                    <span>Access Plan</span>
                  </span>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20 uppercase tracking-widest">
                      {profile.plan}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                    <UserCheck size={11} className="text-primary-400" />
                    <span>System Role</span>
                  </span>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                      {profile.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/40 pt-5 mt-6">
                <Button 
                  type="submit" 
                  disabled={isSavingProfile} 
                  loading={isSavingProfile}
                  className="w-full text-xs font-bold uppercase tracking-wider"
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Right Column: Password Credentials Card */}
        <Card className="flex flex-col justify-between p-6">
          <div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-5 flex items-center gap-1.5">
              <Lock size={14} className="text-primary-400" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <Input
                label="Current Password"
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={passwordFormErrors.currentPassword}
              />

              <Input
                label="New Password"
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={passwordFormErrors.newPassword}
              />

              <Input
                label="Confirm New Password"
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={passwordFormErrors.confirmPassword}
              />

              <div className="border-t border-border/40 pt-5 mt-6">
                <Button 
                  type="submit" 
                  disabled={isUpdatingPassword} 
                  loading={isUpdatingPassword}
                  className="w-full text-xs font-bold uppercase tracking-wider"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </Card>
        
      </div>

      {/* TOAST SYSTEM POPUPS */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`px-4 py-3 rounded-lg shadow-xl border text-[11px] font-bold uppercase tracking-wider flex items-center gap-2.5 animate-scale-up select-none transition-all duration-300 ${
              toast.type === 'error' 
                ? 'bg-red-950/70 border-red-500/35 text-red-400 shadow-red-900/5' 
                : 'bg-emerald-950/70 border-emerald-500/35 text-emerald-400 shadow-emerald-900/5'
            }`}
          >
            {toast.type === 'error' ? <ShieldAlert size={14} /> : <Check size={14} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
