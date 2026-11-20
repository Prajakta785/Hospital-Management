import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  Stethoscope,
  KeyRound,
  Sparkles
} from 'lucide-react';

export function AuthPage({ setActivePage, initialMode = 'signin' }) {
  const { login, register, switchDemoRole } = useAuth();
  const toast = useToast();

  // Mode: 'signin' | 'register_patient' | 'register_admin'
  const [authMode, setAuthMode] = useState(
    initialMode === 'admin' ? 'register_admin' : 'signin'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [adminDept, setAdminDept] = useState('Hospital Administration');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (authMode === 'register_patient' || authMode === 'register_admin') {
      if (!name || !email || !password) {
        toast.warning('Please fill in name, email, and password.');
        setSubmitting(false);
        return;
      }
      const roleToRegister = authMode === 'register_admin' ? 'admin' : 'patient';
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone,
        role: roleToRegister
      });
      setSubmitting(false);
      if (res.success) {
        if (roleToRegister === 'patient') {
          setActivePage('patient_portal');
        } else {
          setActivePage('home');
        }
      }
    } else {
      if (!email || !password) {
        toast.warning('Please enter both email and password.');
        setSubmitting(false);
        return;
      }
      const res = await login(email, password);
      setSubmitting(false);
      if (res.success) {
        if (res.user.role === 'patient') setActivePage('patient_portal');
        else if (res.user.role === 'doctor') setActivePage('doctor_portal');
        else if (res.user.role === 'staff') setActivePage('staff_portal');
        else setActivePage('doctor_portal');
      }
    }
  };

  const handleQuickDemoLogin = async (demoRole) => {
    setSubmitting(true);
    const res = await switchDemoRole(demoRole);
    setSubmitting(false);
    if (res.success) {
      if (demoRole === 'patient') setActivePage('patient_portal');
      else if (demoRole === 'doctor') setActivePage('doctor_portal');
      else if (demoRole === 'staff') setActivePage('staff_portal');
      else setActivePage('doctor_portal');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-100/60">
      <div className="max-w-md w-full space-y-6">
        {/* Hospital Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white p-2 shadow-md border border-slate-100 mx-auto overflow-hidden">
            <img
              src="/images/logo-icon.png"
              alt="MedicalCare Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            MedicalCare Portal
          </h2>
          <p className="text-xs text-slate-500">
            {authMode === 'register_patient'
              ? 'Create a patient account to access online health records'
              : 'Secure login for patients, doctors, and hospital medical staff'}
          </p>
        </div>

        {/* 1-Click Demo Evaluation Box */}
        <div className="bg-gradient-to-br from-[#071933] to-[#0d2a4f] rounded-2xl p-4 text-white shadow-lg border border-[#1e3a5f] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Instant 1-Click Evaluation:
            </span>
            <span className="text-[10px] text-sky-200">No password needed</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('doctor')}
              className="px-3 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-left transition-all shadow-xs flex items-center justify-between cursor-pointer"
            >
              <span>Doctor Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('staff')}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-left transition-all border border-slate-700/60 flex items-center justify-between cursor-pointer"
            >
              <span>Staff Desk</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('patient')}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-left transition-all border border-slate-700/60 flex items-center justify-between cursor-pointer"
            >
              <span>Patient Portal</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-200 text-center">
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                authMode === 'signin'
                  ? 'border-[#0284c7] text-[#0284c7]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register_patient')}
              className={`py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                authMode === 'register_patient'
                  ? 'border-[#0284c7] text-[#0284c7]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Patient Sign Up
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {authMode === 'register_patient' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {authMode === 'register_admin' ? 'Admin Official Email Address *' : 'Email Address *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder={authMode === 'register_admin' ? 'admin@apexcare.org' : 'your.email@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password *
                </label>
                {authMode === 'signin' && (
                  <span className="text-[11px] text-slate-400 hover:text-sky-600 cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 focus:outline-hidden"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white"
            >
              {submitting
                ? 'Processing...'
                : authMode === 'register_patient'
                ? 'Create Patient Account'
                : 'Sign In to Portal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
