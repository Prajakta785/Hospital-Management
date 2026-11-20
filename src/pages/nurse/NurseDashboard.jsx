import React, { useState, useEffect } from 'react';
import { workflowApi } from '../../services/api.js';
import { PrescriptionSlipModal } from '../../components/common/PrescriptionSlipModal.jsx';
import { HospitalStaffLoginPortal } from '../../components/common/HospitalStaffLoginPortal.jsx';
import {
  HeartHandshake,
  ShieldAlert,
  AlertTriangle,
  Search,
  Filter,
  UserCheck,
  Stethoscope,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
  LogOut,
  RefreshCw,
  Eye,
  Send,
  User,
  Phone,
  Droplet,
  Activity,
  MapPin,
  ChevronRight,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  Menu,
  X,
  QrCode,
  Users,
  Printer,
  Mail
} from 'lucide-react';

// Helper function to format Registration Date & Time in clear localized format
const formatDateTime = (val) => {
  if (!val) return 'Just now';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return String(val);
  }
};

export function NurseDashboard({ setActivePage }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('apexcare_nurse_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loginRoleTab, setLoginRoleTab] = useState('nurse'); // 'nurse' | 'doctor'
  const [loginForm, setLoginForm] = useState({
    loginId: 'NUR101',
    password: 'nurse123'
  });
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Data
  const [registrations, setRegistrations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Assigned Supervising Doctor
  const myAssignment = (assignments || []).find(a => 
    String(a.nurse_id) === String(currentUser?.nurse_id) || 
    String(a.nurse_numeric_id) === String(currentUser?.id) || 
    a.nurse_name === currentUser?.name
  );

  // Modals
  const [selectedPatient, setSelectedPatient] = useState(null); // For full details modal
  const [assignModalPatient, setAssignModalPatient] = useState(null); // For assigning doctor
  const [assignDoctorId, setAssignDoctorId] = useState('');
  const [triageNotes, setTriageNotes] = useState('');
  const [priority, setPriority] = useState('Routine');
  const [assignLoading, setAssignLoading] = useState(false);

  // In-Page Prescription Modal (No separate page redirection)
  const [viewingPrescription, setViewingPrescription] = useState(null);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);

  const handleOpenPrescription = async (patient) => {
    if (!patient) return;
    try {
      const rxId = patient.consultation_id || patient.id;
      const res = await fetch(`/api/workflow/consultations/${rxId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setViewingPrescription(data.data);
      } else {
        setViewingPrescription({
          patientName: patient.name,
          patientMrn: patient.patient_id,
          patientBloodGroup: patient.blood_group,
          diagnosis: patient.diagnosis || patient.symptoms || 'Clinical Consultation',
          doctorName: patient.assigned_doctor_name || 'Dr. Neha Kapoor, MD',
          prescribed_date: patient.consultation_date || (patient.created_at ? patient.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
          medicines: patient.medicines || [],
          instructions: patient.doctor_notes || 'Follow prescribed treatment.'
        });
      }
    } catch {
      setViewingPrescription({
        patientName: patient.name,
        patientMrn: patient.patient_id,
        patientBloodGroup: patient.blood_group,
        diagnosis: patient.diagnosis || patient.symptoms || 'Clinical Consultation',
        doctorName: patient.assigned_doctor_name || 'Dr. Neha Kapoor, MD',
        prescribed_date: new Date().toISOString().split('T')[0],
        medicines: [],
        instructions: 'Follow prescribed treatment.'
      });
    }
    setPrescriptionModalOpen(true);
  };

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await workflowApi.login(loginForm.loginId.trim(), loginForm.password);
      if (res && res.success && res.data) {
        const user = res.data.user;
        const role = user.role;
        localStorage.setItem('apexcare_token', res.data.token);

        if (role === 'doctor') {
          localStorage.setItem('apexcare_doctor_user', JSON.stringify(user));
          if (setActivePage) setActivePage('doctor');
          else window.location.href = '/doctor';
        } else if (role === 'nurse') {
          setCurrentUser(user);
          localStorage.setItem('apexcare_nurse_user', JSON.stringify(user));
          showToast(`Welcome Nurse ${user.name || ''}!`);
        } else if (role === 'superadmin' || role === 'admin') {
          localStorage.setItem('apexcare_superadmin_user', JSON.stringify(user));
          if (setActivePage) setActivePage('superadmin');
          else window.location.href = '/superadmin';
        } else {
          if (setActivePage) setActivePage('home');
          else window.location.href = '/';
        }
      } else {
        setLoginError(res?.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      if (err?.status === 502 || err?.message?.includes('502') || err?.message?.includes('Failed to fetch')) {
        setLoginError('सर्व्हर कनेक्ट होत आहे (Server initializing)... कृपया २ सेकंद थांबा आणि पुन्हा बटण दाबा.');
      } else {
        setLoginError(err?.message || 'Server error during login.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('apexcare_nurse_user');
    localStorage.removeItem('apexcare_token');
    if (setActivePage) {
      setActivePage('nurse');
    } else {
      window.location.href = '/nurse';
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [regRes, docsRes, consultRes, assignRes] = await Promise.all([
        workflowApi.getRegistrations({ search: searchQuery }),
        workflowApi.getDoctors(),
        workflowApi.getConsultations(),
        workflowApi.getNurseDoctorAssignments().catch(() => ({}))
      ]);
      if (regRes?.data) setRegistrations(regRes.data);
      if (docsRes?.data) {
        // Only active doctors
        setDoctors(docsRes.data.filter(d => d.status !== 'inactive'));
      }
      if (consultRes?.data) setConsultations(consultRes.data);
      if (assignRes?.data) setAssignments(assignRes.data);
    } catch (err) {
      console.error('Failed to load nurse data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
      const interval = setInterval(() => {
        // Automatic live synchronization: poll new QR registrations & doctor completions every 4s
        Promise.all([
          workflowApi.getRegistrations({ search: searchQuery }),
          workflowApi.getConsultations()
        ]).then(([regRes, consultRes]) => {
          if (regRes?.data) setRegistrations(regRes.data);
          if (consultRes?.data) setConsultations(consultRes.data);
        }).catch(() => {});
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [currentUser, searchQuery]);

  // Handle Assigning Patient to Doctor
  const handleOpenAssignModal = (patient) => {
    setAssignModalPatient(patient);
    setAssignDoctorId(doctors.length > 0 ? doctors[0].id : '');
    setTriageNotes('');
    setPriority('Routine');
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!assignDoctorId) {
      alert('Please select an available doctor.');
      return;
    }

    try {
      setAssignLoading(true);
      const res = await workflowApi.assignDoctor({
        registration_id: assignModalPatient.id,
        doctor_id: assignDoctorId,
        nurse_id: currentUser?.nurse_id || currentUser?.id,
        nurse_name: currentUser?.name || 'Triage Nurse',
        notes: triageNotes,
        priority
      });

      if (res && res.success) {
        showToast(`Patient successfully routed to Dr. ${res.data.doctor_name}!`);
        setAssignModalPatient(null);
        loadData();
      } else {
        alert(res?.message || 'Assignment failed.');
      }
    } catch (err) {
      alert(err.message || 'Error saving assignment.');
    } finally {
      setAssignLoading(false);
    }
  };

  // Change Status
  const handleUpdateStatus = async (patientId, newStatus) => {
    try {
      const res = await workflowApi.updateRegistrationStatus(patientId, newStatus);
      if (res && res.success) {
        showToast(`Status updated to ${newStatus}`);
        loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter(r => {
    if (statusFilter === 'All') return true;
    return (r.status || 'Pending') === statusFilter;
  });

  // -------------------------------------------------------------
  // RENDER: Login Screen
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <HospitalStaffLoginPortal
        initialRole="nurse"
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
        setActivePage={setActivePage}
      />
    );
  }

  // RENDER: Nurse Station Dashboard (Dual Independent Scrolling)
  // -------------------------------------------------------------
  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-100 text-slate-800">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-6 z-50 bg-[#071933] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-sky-500/30 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR: Independent Scroll Area                 */}
      {/* ========================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 h-full bg-[#022c22] text-slate-200 flex flex-col shrink-0 border-r border-[#044434] transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 px-5 border-b border-[#044434] flex items-center justify-between bg-[#022119]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center font-black shadow-md overflow-hidden shrink-0">
              <img src="/images/logo-icon.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white tracking-tight">Nurse Station</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase">
                  Triage
                </span>
              </div>
              <p className="text-[10px] text-emerald-200/80 font-mono tracking-wider">APEXCARE CLINICAL CARE</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-emerald-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Supervising Doctor Banner Card in Sidebar */}
        {myAssignment && (
          <div className="p-3 mx-3 mt-3.5 rounded-xl bg-gradient-to-br from-[#033b20] to-[#022c22] border border-emerald-400/30 text-white shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">Supervising Doctor</span>
            </div>
            <p className="text-xs font-bold text-white truncate">{myAssignment.doctor_name}</p>
            <p className="text-[10px] text-emerald-200 truncate">{myAssignment.doctor_specialty}</p>
            <div className="mt-2 pt-1.5 border-t border-emerald-900/60 flex items-center justify-between text-[9px] text-emerald-300 font-mono">
              <span>{myAssignment.room_or_ward || 'OPD Suite'}</span>
              <span className="text-amber-300 font-semibold">{myAssignment.shift?.split(' ')[0] || 'Morning'}</span>
            </div>
          </div>
        )}

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {/* Group 1: Patient Triage Queue */}
          <div>
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block mb-2">
              Patient Triage Queue
            </span>
            <div className="space-y-1">
              {[
                { id: 'All', label: 'All Registered Patients', count: registrations.length, icon: Users },
                { id: 'Pending', label: 'Pending Intake & Triage', count: registrations.filter(r => (r.status || 'Pending') === 'Pending').length, icon: AlertCircle, badgeColor: 'bg-amber-400 text-slate-950' },
                { id: 'Assigned', label: 'Assigned / In Queue', count: registrations.filter(r => r.status === 'Assigned').length, icon: UserCheck, badgeColor: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' },
                { id: 'In Consultation', label: 'In Consultation', count: registrations.filter(r => r.status === 'In Consultation').length, icon: Activity, badgeColor: 'bg-purple-500/20 text-purple-200 border border-purple-400/30' },
                { id: 'Completed', label: 'Completed Consultations', count: registrations.filter(r => r.status === 'Completed').length, icon: CheckCircle2, badgeColor: 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' }
              ].map(item => {
                const Icon = item.icon;
                const active = statusFilter === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setStatusFilter(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-[#059669] hover:bg-[#047857] text-white font-bold shadow-xs'
                        : 'text-slate-200 hover:text-white hover:bg-white/12'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-emerald-300'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        active ? 'bg-white/20 text-white' : (item.badgeColor || 'bg-[#044434] text-emerald-200')
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 2: Station Shortcuts */}
          <div>
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block mb-2">
              Station Shortcuts
            </span>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  if (setActivePage) setActivePage('register-qr');
                  else window.location.href = '/register-qr';
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/12 transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Patient QR Registration</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Nurse Profile & Sign Out (Fixed) */}
        <div className="shrink-0 p-3 border-t border-[#044434] bg-[#022119]">
          <div className="p-2.5 rounded-xl bg-[#033b20] border border-emerald-400/25 flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
              👩‍⚕️
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{currentUser.name || 'Nurse Staff'}</p>
              <p className="text-[10px] text-emerald-200/80 truncate font-mono">ID: {currentUser.nurse_id || 'NUR101'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 hover:text-white text-xs font-bold transition-all border border-rose-500/30 cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN VIEW AREA: Independent Scroll Area (SCROLL 2)      */}
      {/* ========================================================= */}
      <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden">
        {/* Modern Top Header Bar (Fixed) */}
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Patient Intake &amp; Triage Queue
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Station Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Hospital OPD &amp; Emergency Patient Check-In and Specialist Assignment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refresh Queue */}
            <button
              onClick={loadData}
              title="Refresh queue"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Top Bar Sign Out / Logout */}
            <button
              onClick={handleLogout}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              title="Sign Out & Return to Nurse Login"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Super Admin Official Duty Allocation Banner */}
        {(() => {
          const myAssignment = assignments.find(a => 
            String(a.nurse_id) === String(currentUser?.nurse_id) || 
            String(a.nurse_numeric_id) === String(currentUser?.id) || 
            a.nurse_name === currentUser?.name
          );
          if (!myAssignment) return null;
          return (
            <div className="bg-gradient-to-r from-[#022119] via-[#022c22] to-[#033b20] p-4 rounded-2xl text-white shadow-xs border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Super Admin Official Doctor Assignment</span>
                  <span className="text-sm font-extrabold">{myAssignment.doctor_name} ({myAssignment.doctor_specialty})</span>
                  <span className="text-xs text-emerald-200 block">Role: {myAssignment.duty_role} • Station: {myAssignment.room_or_ward || myAssignment.doctor_room}</span>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-[#033b20] rounded-xl border border-emerald-500/30 text-xs font-mono font-semibold self-start sm:self-auto text-emerald-200">
                Shift: {myAssignment.shift}
              </div>
            </div>
          );
        })()}

        {/* Metric Badges with Interactive Animations */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div 
            className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs stat-box-animated cursor-pointer group"
            style={{ animationDelay: '0ms' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Pending Intake</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 stat-icon-bounce">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600 my-1">
              <span className="stat-number-pop">{registrations.filter(r => (r.status || 'Pending') === 'Pending').length}</span>
            </div>
            <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-600"></span>
              </span>
              Requires triage & doctor assignment
            </span>
          </div>

          <div 
            className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs stat-box-animated cursor-pointer group"
            style={{ animationDelay: '80ms' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Assigned / In Queue</span>
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600 stat-icon-bounce">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-sky-600 my-1">
              <span className="stat-number-pop">{registrations.filter(r => r.status === 'Assigned').length}</span>
            </div>
            <span className="text-[10px] text-sky-700 font-semibold">With attending doctor</span>
          </div>

          <div 
            className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs stat-box-animated cursor-pointer group"
            style={{ animationDelay: '160ms' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">In Consultation</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 stat-icon-bounce">
                <Stethoscope className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-600 my-1">
              <span className="stat-number-pop">{registrations.filter(r => r.status === 'In Consultation').length}</span>
            </div>
            <span className="text-[10px] text-purple-700 font-semibold">Doctor actively examining</span>
          </div>

          <div 
            className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs stat-box-animated cursor-pointer group"
            style={{ animationDelay: '240ms' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Completed</span>
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600 stat-icon-bounce">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-sky-600 my-1">
              <span className="stat-number-pop">{registrations.filter(r => r.status === 'Completed').length}</span>
            </div>
            <span className="text-[10px] text-sky-700 font-semibold">Prescription messaged via WhatsApp</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="relative w-full md:w-80 lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient ID (PAT-...), Name, or Mobile..."
              className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-slate-50/50 hover:bg-white focus:bg-white transition-colors"
            />
          </div>

          <div className="p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
            {['All', 'Pending', 'Assigned', 'In Consultation', 'Completed'].map(status => {
              const active = statusFilter === status;
              const count = status === 'All'
                ? registrations.length
                : registrations.filter(r => (r.status || 'Pending') === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#059669] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  }`}
                >
                  <span>{status}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Patient Registrations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Patient Queue ({filteredRegistrations.length} records)
            </h3>
            <span className="text-[11px] text-slate-500">Live Triage Dispatch</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3">Patient ID</th>
                  <th className="py-3 px-3">Patient Details</th>
                  <th className="py-3 px-3">Registration Date &amp; Time</th>
                  <th className="py-3 px-3">WhatsApp Mobile</th>
                  <th className="py-3 px-3">Symptoms / Triage Concern</th>
                  <th className="py-3 px-3">Assigned Doctor</th>
                  <th className="py-3 px-3">Current Status</th>
                  <th className="py-3 px-3 text-right">Triage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.map(patient => (
                  <tr key={patient.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-mono font-bold text-[#022c22]">
                      {patient.patient_id}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{patient.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {patient.age ? `${patient.age} yrs` : 'N/A'} • {patient.gender} • <strong className="text-rose-700">{patient.blood_group}</strong>
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-900 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 text-[11px] whitespace-nowrap">
                        <Clock className="w-3 h-3 text-emerald-700 shrink-0" />
                        {formatDateTime(patient.registered_at || patient.created_at)}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {patient.phone}
                    </td>
                    <td className="py-3 px-3 text-slate-700 max-w-xs">
                      <p className="line-clamp-2">{patient.symptoms}</p>
                    </td>
                    <td className="py-3 px-3">
                      {patient.assigned_doctor_name ? (
                        <div>
                          <span className="font-bold text-slate-900 block">{patient.assigned_doctor_name}</span>
                          <span className="text-[10px] text-slate-500">{patient.department || 'General Medicine'}</span>
                        </div>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        patient.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : patient.status === 'In Consultation'
                          ? 'bg-purple-100 text-purple-800'
                          : patient.status === 'Assigned'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {patient.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View full 10-field details */}
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 text-[11px] flex items-center gap-1 cursor-pointer"
                          title="View Full Registration Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>

                        {/* Assign to Doctor Button */}
                        {patient.status !== 'Completed' && (
                          <button
                            onClick={() => handleOpenAssignModal(patient)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>{patient.assigned_doctor_id ? 'Reassign' : 'Assign Doctor'}</span>
                          </button>
                        )}

                        {/* If completed, view submitted prescription (Read-Only in modal) */}
                        {patient.status === 'Completed' && (
                          <button
                            type="button"
                            onClick={() => handleOpenPrescription(patient)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer border border-emerald-200"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>Prescription</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRegistrations.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No patients in this queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL: VIEW COMPLETE PATIENT REGISTRATION DETAILS         */}
      {/* ========================================================= */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* 1. STICKY MODAL HEADER (Always Visible on Screen) */}
            <div className="shrink-0 bg-slate-900 px-5 sm:px-6 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-sky-300 font-bold text-sm">
                  {selectedPatient.name ? selectedPatient.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'PT'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white tracking-tight">{selectedPatient.name}</h3>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-sky-300 font-semibold">
                      {selectedPatient.patient_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{selectedPatient.age ? `${selectedPatient.age} yrs` : 'Age N/A'} • {selectedPatient.gender}</span>
                    <span>•</span>
                    <span className="text-rose-400 font-bold flex items-center gap-0.5">
                      <Droplet className="w-3 h-3 fill-rose-500 text-rose-500" /> {selectedPatient.blood_group || 'O+'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  selectedPatient.status === 'Completed'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : selectedPatient.status === 'Assigned'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : selectedPatient.status === 'In Consultation'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {selectedPatient.status || 'Pending'}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close Dossier"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. SCROLLABLE CLINICAL DOSSIER BODY (Fitted smoothly inside 90vh) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
              
              {/* Registration Timestamp Banner */}
              <div className="p-3 bg-emerald-50/90 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-2xs">
                <span className="text-emerald-900 font-bold flex items-center gap-1.5 text-xs">
                  <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                  नोंदणी तारीख आणि वेळ (Registration Date &amp; Time):
                </span>
                <span className="font-mono font-black text-slate-950 text-xs">
                  {formatDateTime(selectedPatient.registered_at || selectedPatient.created_at)}
                </span>
              </div>

              {/* 10-Point Formatted Registration Record */}
              <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 space-y-3">
                {/* 1 & 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2.5 border-b border-slate-200/70">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">1. Full Name:</span>
                    <strong className="text-slate-900 text-sm font-extrabold">{selectedPatient.name}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">2. Age / Date of Birth:</span>
                    <strong className="text-slate-800 text-xs font-bold">
                      {selectedPatient.age ? `${selectedPatient.age} yrs` : 'N/A'}{selectedPatient.dob ? ` (${selectedPatient.dob})` : ''}
                    </strong>
                  </div>
                </div>

                {/* 3 & 4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2.5 border-b border-slate-200/70">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">3. Gender:</span>
                    <strong className="text-slate-800 text-xs font-bold">{selectedPatient.gender || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">4. WhatsApp Mobile:</span>
                    <strong className="text-slate-900 text-xs font-mono font-bold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-sky-700" />
                      {selectedPatient.phone}
                    </strong>
                  </div>
                </div>

                {/* 5 & 7 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2.5 border-b border-slate-200/70">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">5. Email:</span>
                    <strong className="text-slate-800 text-xs font-bold truncate block">{selectedPatient.email || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">7. Blood Group:</span>
                    <strong className="text-rose-600 text-xs font-extrabold flex items-center gap-0.5">
                      <Droplet className="w-3 h-3 fill-rose-500 text-rose-500" /> {selectedPatient.blood_group || 'O+'}
                    </strong>
                  </div>
                </div>

                {/* 6. Residential Address */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">6. Residential Address:</span>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedPatient.address || 'Walk-in (Address not recorded)'}</span>
                  </div>
                </div>

                {/* 8. Presented Symptoms & Health Problem */}
                <div>
                  <span className="text-[11px] font-bold text-amber-900 block mb-1">8. Presented Symptoms &amp; Health Problem:</span>
                  <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/90 text-slate-900 font-semibold leading-relaxed">
                    {selectedPatient.symptoms || 'General medical examination requested.'}
                  </div>
                </div>

                {/* 9. Previous Medical History & Allergies */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">9. Previous Medical History &amp; Allergies:</span>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium leading-relaxed">
                    {selectedPatient.medical_history || 'No prior chronic illness or drug allergies reported'}
                  </div>
                </div>

                {/* 10. Emergency Contact */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">10. Emergency Contact:</span>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>
                      {typeof selectedPatient.emergency_contact === 'object' && selectedPatient.emergency_contact !== null
                        ? (selectedPatient.emergency_contact.name || selectedPatient.emergency_contact.phone
                            ? `${selectedPatient.emergency_contact.name || 'Contact'}${selectedPatient.emergency_contact.phone ? ` (${selectedPatient.emergency_contact.phone})` : ''}`
                            : 'Emergency Contact')
                        : String(selectedPatient.emergency_contact || 'Emergency Contact')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nurse Triage / Assignment Details */}
              {selectedPatient.assigned_doctor_name && (
                <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-900 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-sky-700" /> Attending Doctor Assignment
                    </span>
                    <span className="text-[10px] text-sky-700 font-semibold font-mono">
                      Nurse: {selectedPatient.assigned_nurse_name || 'Triage Desk'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Assigned Physician:</span>
                      <strong className="text-slate-900 text-sm">{selectedPatient.assigned_doctor_name}</strong>
                      <span className="text-slate-500 block text-[11px]">{selectedPatient.assigned_doctor_specialty || 'General Medicine'}</span>
                    </div>
                  </div>
                  {selectedPatient.nurse_notes && (
                    <div className="pt-2 border-t border-sky-100 text-[11px] text-sky-950">
                      <span className="font-bold">Triage Notes: </span>
                      <span className="italic">{selectedPatient.nurse_notes}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Doctor Consultation & Prescription Section (If Completed) */}
              {(selectedPatient.status === 'Completed' || selectedPatient.diagnosis) && (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
                    <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-emerald-700" />
                      Doctor Consultation &amp; Official Prescription
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenPrescription(selectedPatient)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-bold text-[11px] shadow-xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3 h-3" />
                      <span>View Printable Rx Slip</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-emerald-800/80 font-bold block text-[10px] uppercase">Clinical Diagnosis:</span>
                      <span className="font-extrabold text-slate-900 text-sm">{selectedPatient.diagnosis || 'Clinical evaluation completed'}</span>
                    </div>
                    <div>
                      <span className="text-emerald-800/80 font-bold block text-[10px] uppercase">Next Follow-Up Appointment:</span>
                      <span className="font-bold text-emerald-900 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                        {selectedPatient.next_appointment_date ? `${selectedPatient.next_appointment_date} at ${selectedPatient.next_appointment_time || '10:00 AM'}` : 'Follow-up as required'}
                      </span>
                    </div>
                  </div>

                  {Array.isArray(selectedPatient.medicines) && selectedPatient.medicines.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">Prescribed Medications:</span>
                      <div className="bg-white rounded-xl border border-emerald-200/80 overflow-hidden shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-emerald-50 text-[10px] font-bold text-emerald-900 uppercase">
                            <tr>
                              <th className="py-2 px-3">Medicine</th>
                              <th className="py-2 px-3">Dosage</th>
                              <th className="py-2 px-3">Frequency</th>
                              <th className="py-2 px-3">Duration</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-50">
                            {selectedPatient.medicines.map((m, idx) => (
                              <tr key={idx} className="hover:bg-emerald-50/40">
                                <td className="py-2 px-3 font-bold text-slate-900">{m.medicine_name || m.name}</td>
                                <td className="py-2 px-3 text-slate-600">{m.dosage}</td>
                                <td className="py-2 px-3 text-emerald-800 font-semibold">{m.frequency}</td>
                                <td className="py-2 px-3 text-slate-600">{m.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedPatient.doctor_notes && (
                    <div className="text-xs pt-1">
                      <span className="text-[10px] font-bold uppercase text-emerald-900 block">Doctor's Advice &amp; Instructions:</span>
                      <p className="text-slate-800 font-medium italic mt-0.5">{selectedPatient.doctor_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. STICKY MODAL FOOTER (Always Visible on Screen) */}
            <div className="shrink-0 p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Status:</span>
                {['Pending', 'Assigned', 'In Consultation', 'Completed'].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateStatus(selectedPatient.id, st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      selectedPatient.status === st
                        ? 'bg-[#059669] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {selectedPatient.status === 'Completed' && (
                  <button
                    type="button"
                    onClick={() => handleOpenPrescription(selectedPatient)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Prescription</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ASSIGN PATIENT TO DOCTOR                           */}
      {/* ========================================================= */}
      {assignModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-emerald-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#022119] to-[#022c22] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Assign Patient to Doctor</h3>
                <p className="text-xs text-emerald-300">
                  Routing: {assignModalPatient.name} ({assignModalPatient.patient_id})
                </p>
              </div>
              <button
                onClick={() => setAssignModalPatient(null)}
                className="text-emerald-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Doctor (Department & Specialization) *
                </label>
                <select
                  required
                  value={assignDoctorId}
                  onChange={(e) => setAssignDoctorId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="">-- Choose Available Specialist --</option>
                  {myAssignment && (
                    <option value={myAssignment.doctor_numeric_id || myAssignment.doctor_id} className="font-bold bg-amber-50 text-slate-950">
                      ⭐ [Assigned Supervising Doctor] {myAssignment.doctor_name} — {myAssignment.doctor_specialty}
                    </option>
                  )}
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.specialty} ({doc.qualifications || 'MD'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Triage Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="Routine">Routine OPD</option>
                  <option value="Urgent">Urgent / High Pain</option>
                  <option value="Emergency">Immediate Priority</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nurse Triage Notes for Attending Doctor
                </label>
                <textarea
                  rows={3}
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                  placeholder="e.g. Vitals checked: BP 120/80, SpO2 98%, Temp 99.4F. Patient reports sharp headache since morning."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalPatient(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-950/20"
                >
                  {assignLoading ? 'Dispatching...' : 'Assign & Transfer to Doctor Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-Page Prescription Slip Modal (No separate page redirection) */}
      <PrescriptionSlipModal
        isOpen={prescriptionModalOpen}
        onClose={() => {
          setPrescriptionModalOpen(false);
          setViewingPrescription(null);
        }}
        prescription={viewingPrescription}
      />
    </div>
  );
}
export default NurseDashboard;
