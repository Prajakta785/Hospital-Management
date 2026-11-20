import React, { useState } from 'react';
import { workflowApi } from '../../services/api.js';
import {
  HeartHandshake,
  ShieldAlert,
  Stethoscope,
  Lock,
  AlertTriangle
} from 'lucide-react';

export function HospitalStaffLoginPortal({
  initialRole = 'nurse',
  onLoginSuccess,
  setActivePage
}) {
  const [loginRoleTab, setLoginRoleTab] = useState(initialRole);
  const [loginForm, setLoginForm] = useState(() => {
    if (initialRole === 'doctor') return { loginId: 'DOC101', password: 'doctor123' };
    if (initialRole === 'superadmin') return { loginId: 'ADMIN01', password: 'admin123' };
    return { loginId: 'NUR101', password: 'nurse123' };
  });
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const isNurse = loginRoleTab === 'nurse';
  const isDoctor = loginRoleTab === 'doctor';
  const isSuperAdmin = loginRoleTab === 'superadmin';

  const handleRoleChange = (role) => {
    setLoginRoleTab(role);
    setLoginError(null);
    if (role === 'doctor') {
      setLoginForm({ loginId: 'DOC101', password: 'doctor123' });
    } else if (role === 'superadmin') {
      setLoginForm({ loginId: 'ADMIN01', password: 'admin123' });
    } else {
      setLoginForm({ loginId: 'NUR101', password: 'nurse123' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await workflowApi.login(loginForm.loginId.trim(), loginForm.password);
      if (res && res.success) {
        const user = res.data?.user || res.user || res.data;
        const role = String(user?.role || '').toLowerCase();
        const token = res.data?.token || res.token;
        if (token) localStorage.setItem('apexcare_token', token);

        if (role === 'doctor') {
          const doctorUser = {
            ...user,
            doctor_id: user.doctor_id || user.login_id || 'DOC101',
            specialty: user.specialty || 'General Medicine',
            room_number: user.room_number || 'OPD Suite 204'
          };
          localStorage.setItem('apexcare_doctor_user', JSON.stringify(doctorUser));
          if (setActivePage) setActivePage('doctor');
          if (onLoginSuccess && loginRoleTab === 'doctor') onLoginSuccess(doctorUser);
          else if (!setActivePage) window.location.href = '/doctor';
        } else if (role === 'nurse' || role === 'staff') {
          localStorage.setItem('apexcare_nurse_user', JSON.stringify(user));
          if (setActivePage) setActivePage('nurse');
          if (onLoginSuccess && loginRoleTab === 'nurse') onLoginSuccess(user);
          else if (!setActivePage) window.location.href = '/nurse';
        } else if (role === 'superadmin' || role === 'admin') {
          localStorage.setItem('apexcare_superadmin_user', JSON.stringify(user));
          if (setActivePage) setActivePage('superadmin');
          if (onLoginSuccess && loginRoleTab === 'superadmin') onLoginSuccess(user);
          else if (!setActivePage) window.location.href = '/superadmin';
        } else {
          if (onLoginSuccess) onLoginSuccess(user);
          else if (setActivePage) setActivePage('home');
          else window.location.href = '/';
        }
      } else {
        setLoginError(res?.message || 'Invalid credentials. Please verify ID and password.');
      }
    } catch (err) {
      setLoginError(err.message || 'Authentication error. Please check server connection.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#044434_0%,_#022c22_45%,_#011a14_100%)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Soft Radial Ambient Glow Blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Tech Dot Pattern Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />

      {/* Central Card Container */}
      <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-emerald-950/80 border border-emerald-400/25 overflow-hidden">
        {/* Top Forest Green Header */}
        <div className="bg-gradient-to-b from-[#022119] via-[#022c22] to-[#033b20] px-6 pt-7 pb-6 text-white text-center border-b border-emerald-900/40 relative">
          <div className="w-14 h-14 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-400/25">
            {isSuperAdmin ? (
              <ShieldAlert className="w-8 h-8 text-slate-950" />
            ) : isDoctor ? (
              <Stethoscope className="w-8 h-8 text-slate-950" />
            ) : (
              <HeartHandshake className="w-8 h-8 text-slate-950" />
            )}
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white font-display">
            {isSuperAdmin ? 'Super Admin Command Portal' : isDoctor ? 'Attending Doctor Panel Login' : 'Nurse Triage Station Login'}
          </h1>
          <p className="text-xs text-emerald-300 font-medium mt-1">
            {isSuperAdmin
              ? 'Executive Command, Hospital Network & Access Control'
              : isDoctor
              ? 'Clinical Examination, E-Prescriptions & Consultations'
              : 'Patient Check-in, Intake Review & Doctor Assignment'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 bg-white">
          {/* Staff Role Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 text-xs">
            <button
              type="button"
              onClick={() => handleRoleChange('superadmin')}
              className={`py-2 px-1 rounded-xl font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isSuperAdmin
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👑 Super Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('doctor')}
              className={`py-2 px-1 rounded-xl font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isDoctor
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🩺 Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('nurse')}
              className={`py-2 px-1 rounded-xl font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isNurse
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👩‍⚕️ Nurse</span>
            </button>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isSuperAdmin ? 'Super Admin Login ID / Email' : isDoctor ? 'Doctor Login ID / Email' : 'Nurse Login ID / Email'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={loginForm.loginId}
                onChange={(e) => setLoginForm({ ...loginForm, loginId: e.target.value })}
                placeholder={isSuperAdmin ? 'ADMIN01 or admin@hospital.com' : isDoctor ? 'DOC101' : 'NUR101'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none bg-slate-50/40 hover:bg-white focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none bg-slate-50/40 hover:bg-white focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Quick Demo Pre-fill helper */}
          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/90 text-[11px] text-emerald-950 font-medium">
            <span className="font-bold text-emerald-900 block mb-0.5">
              {isSuperAdmin ? 'Super Admin Credentials:' : isDoctor ? 'Doctor Credentials:' : 'Nurse Credentials:'}
            </span>
            <span>
              {isSuperAdmin
                ? <>Login ID: <strong className="font-mono">ADMIN01</strong> • Password: <strong className="font-mono">admin123</strong></>
                : isDoctor
                ? <>Login ID: <strong className="font-mono">DOC101</strong> • Password: <strong className="font-mono">doctor123</strong></>
                : <>Login ID: <strong className="font-mono">NUR101</strong> • Password: <strong className="font-mono">nurse123</strong></>}
            </span>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-2.5 px-4 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loginLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>
                  {isSuperAdmin ? 'Authenticate & Open Super Admin' : isDoctor ? 'Authenticate & Open Doctor Panel' : 'Authenticate & Open Nurse Desk'}
                </span>
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setActivePage ? setActivePage('home') : window.location.href = '/'}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Return to Public Hospital Site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}