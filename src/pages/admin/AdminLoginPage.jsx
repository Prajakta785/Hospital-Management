import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  KeyRound
} from 'lucide-react';

export function AdminLoginPage({ setActivePage, onLoginSuccess }) {
  const { user, isAuthenticated, login, switchDemoRole } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('admin@hospital.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter your admin official email and password.');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      toast.success(`Welcome to Super Admin Dashboard, ${res.user.name}!`);
      if (onLoginSuccess) onLoginSuccess(res.user.role);
      else setActivePage('admin_overview');
    }
  };

  const handleQuickDemoRole = async (targetRole) => {
    setSubmitting(true);
    const res = await switchDemoRole(targetRole);
    setSubmitting(false);
    if (res && res.success) {
      const label = targetRole === 'admin'
        ? 'Super Administrator'
        : targetRole === 'doctor'
        ? 'Chief Doctor'
        : targetRole === 'patient'
        ? 'Registered Patient'
        : 'Hospital Staff';
      toast.success(`Signed in as ${label}!`);
      setActivePage('admin_overview');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071933] via-[#0b2447] to-slate-950 text-white flex flex-col p-3 sm:p-4 relative overflow-y-auto">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Back to Website */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10 shrink-0 mb-1">
        <button
          onClick={() => setActivePage('home')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-sky-100 hover:text-white text-xs font-bold backdrop-blur-md border border-white/10 transition-all hover:-translate-x-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to MedicalCare Website</span>
        </button>
      </div>

      {/* Center Auth Card - Perfectly Centered Without Excess Empty Space */}
      <div className="flex-1 flex flex-col items-center justify-center py-2 sm:py-3 z-10 w-full">
        <div className="max-w-lg w-full space-y-4">
          {/* Branding Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white p-2 shadow-2xl border border-sky-400/30 mx-auto overflow-hidden">
              <img
                src="/images/logo-icon.png"
                alt="MedicalCare Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Restricted Access Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                MedicalCare Admin Login
              </h1>
              <p className="text-xs text-sky-200/80 mt-0.5">
                Hospital Clinical Management, Patients, Beds &amp; Billing Control
              </p>
            </div>
          </div>

          {/* Active Session Notice if already logged in as Admin/Staff/Doctor */}
          {isAuthenticated && user?.role !== 'patient' && (
            <div className="p-3.5 px-4 rounded-2xl bg-[#0b2447]/90 border border-sky-400/50 backdrop-blur-md shadow-2xl flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#071933] border border-sky-500/50 flex items-center justify-center font-bold text-amber-300 shrink-0 text-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">{user.role} Active Session</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const target = user?.role === 'admin' ? 'admin_overview' : 'admin_appointments';
                  if (onLoginSuccess) onLoginSuccess(user?.role);
                  else setActivePage(target);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer shrink-0 flex items-center gap-1.5 hover:scale-105"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Form Container - Tall, Spacious & Elegant */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 border border-slate-100 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Administrator Sign In
                  </h3>
                  <p className="text-[10px] text-slate-400">Authorized personnel only</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-200 uppercase tracking-wide">
                Official Portal
              </span>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Administrator Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="admin@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-sky-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-sky-600 focus:outline-hidden font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] active:scale-[0.99] text-white font-bold text-xs shadow-lg shadow-sky-800/25 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-amber-300" />
                    <span>Sign In to Admin Panel</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Super Admin Access */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Quick Super Admin Access
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                  Super Admin Only
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickDemoRole('admin')}
                disabled={submitting}
                className="w-full p-3 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 hover:from-amber-100 hover:to-amber-200/70 active:scale-[0.99] text-left transition-all cursor-pointer group shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-200/90 flex items-center justify-center text-amber-900 font-bold text-xs shrink-0">
                      👑
                    </div>
                    <span className="text-xs font-black text-amber-950">Super Admin (All 10 Panels)</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">1-Click Sign In</span>
                </div>
                <p className="text-[10px] text-amber-800 leading-tight pl-8">
                  Full hospital system overview, doctors, staff, beds, billing &amp; executive control
                </p>
              </button>
            </div>

            {/* Security Assurance Badge */}
            <div className="pt-2 text-center border-t border-slate-100 text-[10px] text-slate-400 font-medium">
              256-Bit SSL Encrypted Admin Portal • NABH &amp; JCI Compliant
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[11px] text-sky-400/60 z-10 shrink-0 py-1.5">
        MedicalCare Quaternary Hospital Management System • All Rights Reserved
      </div>
    </div>
  );
}
