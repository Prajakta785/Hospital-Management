import React, { useState, useEffect } from 'react';
import { workflowApi } from '../../services/api.js';
import { PrescriptionSlipModal } from '../../components/common/PrescriptionSlipModal.jsx';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon.jsx';
import {
  Stethoscope,
  ShieldAlert,
  HeartHandshake,
  AlertTriangle,
  Search,
  User,
  Clock,
  Calendar,
  FileText,
  Pill,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Lock,
  LogOut,
  RefreshCw,
  Printer,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  Send,
  UserCheck,
  Menu,
  X,
  Users
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

export function DoctorPanel({ setActivePage }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('apexcare_doctor_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loginRoleTab, setLoginRoleTab] = useState('doctor'); // 'doctor' | 'nurse'
  const [loginForm, setLoginForm] = useState({
    loginId: 'DOC101',
    password: 'doctor123'
  });
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Sync stored doctor user on mount or page switch
  useEffect(() => {
    try {
      const stored = localStorage.getItem('apexcare_doctor_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && !currentUser) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.warn('Doctor user sync error:', e);
    }
  }, []);

  // Queue and state
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'completed'

  // Active consultation workflow
  const [consultingPatient, setConsultingPatient] = useState(null);
  const [submittingConsultation, setSubmittingConsultation] = useState(false);
  const [consultationSuccessData, setConsultationSuccessData] = useState(null);

  // In-page Prescription Modal
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);

  const handleOpenPrescription = async (target) => {
    if (!target) return;
    if (target.medicines || target.items || target.prescription_code) {
      setSelectedPrescription(target);
      setPrescriptionModalOpen(true);
      return;
    }
    try {
      const rxId = target.consultation_id || target.id;
      const res = await fetch(`/api/workflow/consultations/${rxId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedPrescription(data.data);
      } else {
        setSelectedPrescription({
          patientName: target.name || target.patient_name,
          patientMrn: target.patient_id,
          patientBloodGroup: target.blood_group,
          diagnosis: target.diagnosis || target.symptoms || 'Clinical Examination',
          doctorName: currentUser?.name || 'Dr. Neha Kapoor, MD',
          doctorSpecialty: currentUser?.specialty || 'Clinical Dermatology & Trichology',
          prescribed_date: target.consultation_date || new Date().toISOString().split('T')[0],
          medicines: target.medicines || [],
          instructions: target.instructions || target.doctor_notes || 'Follow medical advice as directed.'
        });
      }
    } catch {
      setSelectedPrescription({
        patientName: target.name || target.patient_name,
        patientMrn: target.patient_id,
        patientBloodGroup: target.blood_group,
        diagnosis: target.diagnosis || target.symptoms || 'Clinical Examination',
        doctorName: currentUser?.name || 'Dr. Neha Kapoor, MD',
        doctorSpecialty: currentUser?.specialty || 'Clinical Dermatology & Trichology',
        prescribed_date: new Date().toISOString().split('T')[0],
        medicines: target.medicines || [],
        instructions: 'Follow prescription regimen as directed.'
      });
    }
    setPrescriptionModalOpen(true);
  };

  // Structured Consultation Form
  const [consultationForm, setConsultationForm] = useState({
    diagnosis: '',
    observations: '',
    medicines: [
      {
        name: 'Amoxicillin 500mg',
        dosage: '1 capsule',
        frequency: 'Three times daily',
        food_timing: 'After Food',
        duration: '5 days',
        instructions: 'Complete full course with water'
      },
      {
        name: 'Paracetamol 650mg',
        dosage: '1 tablet',
        frequency: 'As needed (max 3 times/day)',
        food_timing: 'After Food',
        duration: '3 days',
        instructions: 'Take in case of fever > 100°F'
      }
    ],
    doctor_notes: '',
    next_appointment_date: '',
    next_appointment_time: '10:00 AM',
    follow_up_instructions: 'Return if symptoms persist beyond 48 hours or temperature exceeds 101°F.'
  });

  const showToast = (msg) => {
    alert(msg);
  };

  const handleLogin = async (e) => {
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

        if (role === 'nurse' || role === 'staff') {
          localStorage.setItem('apexcare_nurse_user', JSON.stringify(user));
          if (setActivePage) setActivePage('nurse');
          else window.location.href = '/nurse';
        } else if (role === 'doctor') {
          const doctorUser = {
            ...user,
            doctor_id: user.doctor_id || user.login_id || 'DOC101',
            specialty: user.specialty || 'General Medicine',
            room_number: user.room_number || 'OPD Suite 204'
          };
          setCurrentUser(doctorUser);
          localStorage.setItem('apexcare_doctor_user', JSON.stringify(doctorUser));
          if (setActivePage) setActivePage('doctor');
        } else if (role === 'superadmin' || role === 'admin') {
          localStorage.setItem('apexcare_superadmin_user', JSON.stringify(user));
          if (setActivePage) setActivePage('superadmin');
          else window.location.href = '/superadmin';
        } else {
          if (setActivePage) setActivePage('home');
          else window.location.href = '/';
        }
      } else {
        setLoginError(res?.message || 'Login failed. Please check Doctor credentials.');
      }
    } catch (err) {
      if (err?.status === 502 || err?.message?.includes('502') || err?.message?.includes('Failed to fetch')) {
        setLoginError('सर्व्हर कनेक्ट होत आहे (Server initializing)... कृपया २ सेकंद थांबा आणि पुन्हा बटण दाबा.');
      } else {
        setLoginError(err?.message || 'Server error during doctor authentication.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('apexcare_doctor_user');
    localStorage.removeItem('apexcare_token');
    if (setActivePage) {
      setActivePage('doctor');
    } else {
      window.location.href = '/doctor';
    }
  };

  // Load assigned patient queue (STRICT: Pending registrations are for Nurse Station ONLY)
  const loadPatients = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const docBadge = String(currentUser?.doctor_id || '').toLowerCase().trim();
      const docLoginId = String(currentUser?.login_id || '').toLowerCase().trim();
      const docNumericId = String(currentUser?.id || '').trim();
      const docNumericId2 = String(currentUser?.doctor_numeric_id || '').trim();
      const docName = String(currentUser?.name || '').toLowerCase().replace(/^dr\.?\s*/i, '').trim();

      const res = await workflowApi.getRegistrations({ 
        search: searchQuery, 
        doctorId: currentUser?.doctor_id || currentUser?.login_id || currentUser?.id 
      });

      if (res && res.success && Array.isArray(res.data)) {
        // STRICT FILTER:
        // 1. MUST NOT BE PENDING - Pending registrations are strictly for Nurse Station triage only!
        // 2. MUST be explicitly assigned to this doctor
        const myPatients = res.data.filter(p => {
          if (!p.assigned_doctor_id && !p.assigned_doctor_name) return false;
          if (p.status === 'Pending') return false; // Never show pending intake to Doctor

          const pDocId = String(p.assigned_doctor_id || '').toLowerCase().trim();
          const pDocName = String(p.assigned_doctor_name || '').toLowerCase().replace(/^dr\.?\s*/i, '').trim();

          const matchBadge = docBadge && (pDocId === docBadge || pDocId.includes(docBadge));
          const matchLogin = docLoginId && (pDocId === docLoginId || pDocId.includes(docLoginId));
          const matchNumeric = docNumericId && pDocId === docNumericId;
          const matchNumeric2 = docNumericId2 && pDocId === docNumericId2;
          const matchNumericField = (docNumericId && p.assigned_doctor_numeric_id && String(p.assigned_doctor_numeric_id).trim() === docNumericId) || 
                                    (docNumericId2 && p.assigned_doctor_numeric_id && String(p.assigned_doctor_numeric_id).trim() === docNumericId2);
          const matchName = docName && pDocName && (pDocName.includes(docName) || docName.includes(pDocName));

          return matchBadge || matchLogin || matchNumeric || matchNumeric2 || matchNumericField || matchName;
        });

        // STRICTLY set to assigned patients only - NEVER fall back to all registrations!
        setPatients(myPatients);
      } else {
        setPatients([]);
      }
    } catch (err) {
      console.error('Failed to load patient queue:', err);
      setPatients([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadPatients();
      const interval = setInterval(() => {
        loadPatients(true);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [currentUser, searchQuery]);

  // Dynamic Medicine Row Handlers
  const handleAddMedicineRow = () => {
    setConsultationForm(prev => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          name: '',
          dosage: '1 tablet',
          frequency: 'Twice daily',
          food_timing: 'After Food',
          duration: '5 days',
          instructions: ''
        }
      ]
    }));
  };

  const handleRemoveMedicineRow = (index) => {
    setConsultationForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, idx) => idx !== index)
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    setConsultationForm(prev => {
      const updated = [...prev.medicines];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, medicines: updated };
    });
  };

  // Open consultation form for a specific patient
  const handleStartConsultation = (patient) => {
    setConsultingPatient(patient);
    setConsultationSuccessData(null);
    // Suggest appointment date 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dateStr = nextWeek.toISOString().split('T')[0];

    setConsultationForm({
      diagnosis: patient.symptoms ? `Acute presentation of: ${patient.symptoms.slice(0, 50)}` : 'Routine OPD Checkup',
      observations: `Patient examined. Vitals stable. Presented complaints: ${patient.symptoms || 'None'}`,
      medicines: [
        {
          name: 'Paracetamol 650mg',
          dosage: '1 tab',
          frequency: 'Twice daily',
          food_timing: 'After Food',
          duration: '3 days',
          instructions: 'Take for fever or pain'
        },
        {
          name: 'Cetirizine 10mg',
          dosage: '1 tab',
          frequency: 'Once at bedtime',
          food_timing: 'After Food',
          duration: '5 days',
          instructions: 'May cause mild drowsiness'
        }
      ],
      doctor_notes: 'Adequate hydration advised. Avoid cold beverages and rest for 48 hours.',
      next_appointment_date: dateStr,
      next_appointment_time: '11:00 AM',
      follow_up_instructions: 'Return immediately if chest tightness or persistent high temperature occurs.'
    });
  };

  // Submit consultation
  const handleSubmitConsultation = async (e) => {
    e.preventDefault();
    if (!consultingPatient) return;
    if (!consultationForm.diagnosis.trim()) {
      alert('Please enter patient diagnosis.');
      return;
    }

    try {
      setSubmittingConsultation(true);
      const payload = {
        registration_id: consultingPatient.id,
        doctor_id: currentUser?.doctor_id || currentUser?.id || 'DOC101',
        doctor_name: currentUser?.name || 'Dr. Neha Kapoor',
        doctor_specialty: currentUser?.specialty || 'General Medicine',
        diagnosis: consultationForm.diagnosis,
        symptoms: consultingPatient.symptoms,
        observations: consultationForm.observations,
        medicines: consultationForm.medicines,
        doctor_notes: consultationForm.doctor_notes,
        next_appointment_date: consultationForm.next_appointment_date,
        next_appointment_time: consultationForm.next_appointment_time,
        follow_up_instructions: consultationForm.follow_up_instructions,
        hostUrl: window.location.origin
      };

      const res = await workflowApi.submitConsultation(payload);
      if (res && res.success) {
        const successData = res.data || res;
        setConsultationSuccessData(successData);
        loadPatients();

        // Auto-open WhatsApp chat in new window/tab for instant 1-click dispatch to patient
        const waUrl = successData?.whatsapp?.intent_url || 
                      successData?.whatsapp?.webIntentUrl || 
                      successData?.whatsapp?.web_intent_url;
        if (waUrl) {
          try {
            window.open(waUrl, '_blank', 'noopener,noreferrer');
          } catch (e) {
            console.warn('Popup blocked, doctor can click the WhatsApp button manually:', e);
          }
        }
      } else {
        alert(res?.message || 'Consultation submission failed.');
      }
    } catch (err) {
      alert(err.message || 'Error saving consultation.');
    } finally {
      setSubmittingConsultation(false);
    }
  };

  // Filter queues (Strictly assigned/in-consultation; Pending is NEVER in doctor's queue)
  const assignedQueue = patients.filter(p => p.status === 'Assigned' || p.status === 'In Consultation');
  const completedQueue = patients.filter(p => p.status === 'Completed');

  // -------------------------------------------------------------
  // RENDER: Login Form
  // -------------------------------------------------------------
  if (!currentUser) {
    const isNurse = loginRoleTab === 'nurse';
    const isDoctor = loginRoleTab === 'doctor';
    const isSuperAdmin = loginRoleTab === 'superadmin';

    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#044434_0%,_#022c22_45%,_#011a14_100%)] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Soft Radial Ambient Glow Blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Tech Dot Pattern Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />

        {/* Translucent Medical Cross Symbols */}
        <div className="absolute top-12 left-12 text-emerald-400/20 pointer-events-none select-none hidden sm:block">
          <svg className="w-24 h-24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4a2 2 0 0 1 4 0v4h4a2 2 0 0 1 0 4h-4v4a2 2 0 0 1-4 0v-4H6a2 2 0 0 1 0-4h4V4z" />
          </svg>
        </div>
        <div className="absolute bottom-12 left-14 text-emerald-400/25 pointer-events-none select-none hidden sm:block">
          <svg className="w-28 h-28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4a2 2 0 0 1 4 0v4h4a2 2 0 0 1 0 4h-4v4a2 2 0 0 1-4 0v-4H6a2 2 0 0 1 0-4h4V4z" />
          </svg>
        </div>
        <div className="absolute top-14 right-16 text-emerald-400/20 pointer-events-none select-none hidden sm:block">
          <svg className="w-20 h-20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4a2 2 0 0 1 4 0v4h4a2 2 0 0 1 0 4h-4v4a2 2 0 0 1-4 0v-4H6a2 2 0 0 1 0-4h4V4z" />
          </svg>
        </div>
        <div className="absolute bottom-16 right-12 text-emerald-400/20 pointer-events-none select-none hidden sm:block">
          <svg className="w-20 h-20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4a2 2 0 0 1 4 0v4h4a2 2 0 0 1 0 4h-4v4a2 2 0 0 1-4 0v-4H6a2 2 0 0 1 0-4h4V4z" />
          </svg>
        </div>

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

          <form onSubmit={handleLogin} className="p-6 sm:p-7 space-y-4 bg-white">
            {/* Staff Role Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 text-xs">
              <button
                type="button"
                onClick={() => {
                  setLoginRoleTab('superadmin');
                  setLoginForm({ loginId: 'ADMIN01', password: 'admin123' });
                  setLoginError(null);
                }}
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
                onClick={() => {
                  setLoginRoleTab('doctor');
                  setLoginForm({ loginId: 'DOC101', password: 'doctor123' });
                  setLoginError(null);
                }}
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
                onClick={() => {
                  setLoginRoleTab('nurse');
                  setLoginForm({ loginId: 'NUR101', password: 'nurse123' });
                  setLoginError(null);
                }}
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

  // -------------------------------------------------------------
  // RENDER: Doctor Consultation Workspace (Dual Independent Scrolling)
  // -------------------------------------------------------------
  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-100 text-slate-800">
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
        {/* Brand / Logo Header (Fixed) */}
        <div className="h-16 shrink-0 px-5 border-b border-[#044434] flex items-center justify-between bg-[#022119]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center font-black shadow-md overflow-hidden shrink-0">
              <img src="/images/logo-icon.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white tracking-tight">Doctor Console</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase">
                  OPD &amp; Rx
                </span>
              </div>
              <p className="text-[10px] text-emerald-200/80 font-mono tracking-wider">APEXCARE CLINICAL SUITE</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-emerald-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Specialty & Department Badge (Fixed) */}
        <div className="shrink-0 p-3 mx-3 mt-3.5 rounded-xl bg-gradient-to-br from-[#033b20] to-[#022c22] border border-emerald-400/30 text-white shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">Department Station</span>
          </div>
          <p className="text-xs font-bold text-white truncate">{currentUser.specialty || 'General Medicine'}</p>
          <div className="mt-2 pt-1.5 border-t border-emerald-900/60 flex items-center justify-between text-[9px] text-emerald-300 font-mono">
            <span>Room: {currentUser.room_number || 'OPD Suite 204'}</span>
            <span className="text-emerald-400 font-semibold">Active Session</span>
          </div>
        </div>

        {/* Sidebar Independent Scrolling Menu (SCROLL 1) */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {/* Group 1: Patient Consultation Queue */}
          <div>
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block mb-2">
              Clinical Consultations
            </span>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('assigned');
                  setConsultingPatient(null);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'assigned' && !consultingPatient
                    ? 'bg-[#059669] hover:bg-[#047857] text-white font-bold shadow-xs'
                    : 'text-slate-200 hover:text-white hover:bg-white/12'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 shrink-0 text-emerald-300" />
                  <span className="truncate">Assigned Patients Waiting</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shrink-0">
                  {assignedQueue.length}
                </span>
              </button>

              {consultingPatient && (
                <div className="p-2.5 rounded-xl bg-[#033b20] border border-emerald-400/30 text-white">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                    Active Consultation
                  </span>
                  <p className="text-xs font-bold truncate">{consultingPatient.name}</p>
                  <p className="text-[10px] text-emerald-200 font-mono">{consultingPatient.patient_id}</p>
                </div>
              )}

              <button
                onClick={() => {
                  setActiveTab('completed');
                  setConsultingPatient(null);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'completed'
                    ? 'bg-[#059669] hover:bg-[#047857] text-white font-bold shadow-xs'
                    : 'text-slate-200 hover:text-white hover:bg-white/12'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
                  <span className="truncate">Completed Consultations</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#044434] text-emerald-200 shrink-0">
                  {completedQueue.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Doctor Profile & Sign Out (Fixed) */}
        <div className="shrink-0 p-3 border-t border-[#044434] bg-[#022119]">
          <div className="p-2.5 rounded-xl bg-[#033b20] border border-emerald-400/25 flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
              🩺
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{currentUser.name || 'Doctor Staff'}</p>
              <p className="text-[10px] text-emerald-200/80 truncate font-mono">ID: {currentUser.doctor_id || 'DOC101'}</p>
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
                  {consultingPatient
                    ? `Clinical Examination & Prescription: ${consultingPatient.name}`
                    : activeTab === 'assigned'
                    ? 'Assigned Patients Consultation Queue'
                    : 'Completed Consultations & Prescription Archive'}
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Doctor ID: {currentUser.doctor_id || 'DOC101'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {currentUser.name} • {currentUser.specialty || 'General Medicine'} Consultation Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refresh Queue */}
            <button
              onClick={loadPatients}
              title="Refresh queue"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Top Bar Sign Out / Logout */}
            <button
              onClick={handleLogout}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              title="Sign Out & Return to Doctor Login"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* If consultation success card is active, display WhatsApp delivery outcome */}
        {consultationSuccessData && (
          <div className="bg-white rounded-2xl border-2 border-emerald-600 shadow-xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Consultation Completed & Prescription Dispatched!
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Prescription for <strong>{consultationSuccessData.consultation?.patient_name}</strong> ({consultationSuccessData.consultation?.patient_id}) has been locked and recorded.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenPrescription(consultationSuccessData.consultation || consultationSuccessData);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  View & Print Official Rx
                </button>
                <button
                  onClick={() => {
                    setConsultationSuccessData(null);
                    setConsultingPatient(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Back to Queue
                </button>
              </div>
            </div>

            {/* WhatsApp Integration Status Box */}
            <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#059669] text-white shrink-0 mt-0.5 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-emerald-950">WhatsApp Prescription Dispatched:</span>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-[10px] font-black rounded-full uppercase">
                      {consultationSuccessData.whatsapp?.status || 'Delivered'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">
                    Patient Registered WhatsApp: <strong className="font-mono text-emerald-950">{consultationSuccessData.consultation?.patient_phone || consultationSuccessData.whatsapp?.phone}</strong>
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Formatted prescription schedule, dosage, follow-up instructions, and verified PDF access link prepared.
                  </p>
                </div>
              </div>

              {(() => {
                const waUrl = consultationSuccessData.whatsapp?.intent_url || 
                              consultationSuccessData.whatsapp?.webIntentUrl || 
                              consultationSuccessData.whatsapp?.web_intent_url;
                if (!waUrl) return null;
                return (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-950/20 whitespace-nowrap cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white" />
                    <span>Send Message on WhatsApp (१-क्लिकने पाठवा)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                );
              })()}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* DOCTOR CONSULTATION FORM (when a patient is selected)     */}
        {/* --------------------------------------------------------- */}
        {consultingPatient && !consultationSuccessData ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Form Top Banner */}
            <div className="bg-gradient-to-r from-[#071933] via-[#0b2447] to-[#0e3160] p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                  Active Clinical Consultation
                </span>
                <h2 className="text-lg font-extrabold mt-0.5">
                  {consultingPatient.name} — Patient ID: {consultingPatient.patient_id}
                </h2>
                <p className="text-xs text-sky-200">
                  {consultingPatient.age ? `${consultingPatient.age} yrs` : 'N/A'} • {consultingPatient.gender} • Blood Group: <strong>{consultingPatient.blood_group}</strong> • WhatsApp: {consultingPatient.phone}
                </p>
              </div>

              <button
                onClick={() => setConsultingPatient(null)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors w-fit"
              >
                Cancel / Return to Queue
              </button>
            </div>

            {/* Nurse Triage Summary Box */}
            <div className="p-4 bg-amber-50/70 border-b border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
              <div>
                <span className="font-bold text-amber-900 block mb-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  Registration Time:
                </span>
                <p className="text-slate-900 font-bold font-mono text-[11px]">
                  {formatDateTime(consultingPatient.registered_at || consultingPatient.created_at)}
                </p>
              </div>
              <div>
                <span className="font-bold text-amber-900 block mb-0.5">Presented Symptoms:</span>
                <p className="text-slate-800 font-medium">{consultingPatient.symptoms || 'General Checkup'}</p>
              </div>
              <div>
                <span className="font-bold text-amber-900 block mb-0.5">Medical History & Allergies:</span>
                <p className="text-slate-800 font-medium">{consultingPatient.medical_history || 'No reported chronic illness or allergies'}</p>
              </div>
              <div>
                <span className="font-bold text-amber-900 block mb-0.5">Nurse Triage Notes:</span>
                <p className="text-slate-800 italic">
                  {consultingPatient.nurse_notes || 'Patient checked into triage with standard vitals.'}
                </p>
              </div>
              <div>
                <span className="font-bold text-amber-900 block mb-0.5">Emergency Contact:</span>
                <div className="text-slate-800 font-medium">
                  {typeof consultingPatient.emergency_contact === 'object' && consultingPatient.emergency_contact !== null ? (
                    <span>
                      {consultingPatient.emergency_contact.name || 'Contact'}
                      {consultingPatient.emergency_contact.phone ? ` (${consultingPatient.emergency_contact.phone})` : ''}
                    </span>
                  ) : (
                    <span>{String(consultingPatient.emergency_contact || 'None specified')}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Consultation Input Form */}
            <form onSubmit={handleSubmitConsultation} className="p-6 space-y-6 text-xs">
              {/* Diagnosis & Clinical Observations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-700" />
                    Doctor's Diagnosis *
                  </label>
                  <input
                    type="text"
                    required
                    value={consultationForm.diagnosis}
                    onChange={(e) => setConsultationForm({ ...consultationForm, diagnosis: e.target.value })}
                    placeholder="e.g. Acute Upper Respiratory Tract Infection (URTI)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Clinical Observations & Findings
                  </label>
                  <input
                    type="text"
                    value={consultationForm.observations}
                    onChange={(e) => setConsultationForm({ ...consultationForm, observations: e.target.value })}
                    placeholder="e.g. Throat congested, bilateral vesicular breath sounds"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Prescribed Medicines (Dynamic Table) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-sm text-slate-900">Prescribed Medicines (Rx Schedule)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Medicine
                  </button>
                </div>

                <div className="space-y-3">
                  {consultationForm.medicines.map((med, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-6 gap-2.5 items-end">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Medicine Name & Strength</label>
                        <input
                          type="text"
                          required
                          value={med.name}
                          onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Azithromycin 500mg"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Dosage</label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          placeholder="1 tab"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Frequency</label>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                          placeholder="Twice daily"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Timing / Food</label>
                        <select
                          value={med.food_timing}
                          onChange={(e) => handleMedicineChange(idx, 'food_timing', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                        >
                          <option value="After Food">After Food</option>
                          <option value="Before Food">Before Food</option>
                          <option value="With Food">With Food</option>
                          <option value="Bedtime">At Bedtime</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Duration</label>
                          <input
                            type="text"
                            value={med.duration}
                            onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                            placeholder="5 days"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        {consultationForm.medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicineRow(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0"
                            title="Remove Medicine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctor's Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Doctor's Clinical Notes & Dietary Advice
                </label>
                <textarea
                  rows={2}
                  value={consultationForm.doctor_notes}
                  onChange={(e) => setConsultationForm({ ...consultationForm, doctor_notes: e.target.value })}
                  placeholder="e.g. Drink plenty of warm fluids. Steam inhalation twice daily. Strict bed rest for 48 hours."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-600 focus:outline-none"
                />
              </div>

              {/* Next Appointment & Follow-up */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    Next Appointment Date
                  </label>
                  <input
                    type="date"
                    value={consultationForm.next_appointment_date}
                    onChange={(e) => setConsultationForm({ ...consultationForm, next_appointment_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    Appointment Time
                  </label>
                  <input
                    type="text"
                    value={consultationForm.next_appointment_time}
                    onChange={(e) => setConsultationForm({ ...consultationForm, next_appointment_time: e.target.value })}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Follow-up Instructions</label>
                  <input
                    type="text"
                    value={consultationForm.follow_up_instructions}
                    onChange={(e) => setConsultationForm({ ...consultationForm, follow_up_instructions: e.target.value })}
                    placeholder="Review symptoms with updated blood work"
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Prescription PDF and WhatsApp message will be generated automatically.
                </span>

                <button
                  type="submit"
                  disabled={submittingConsultation}
                  className="px-6 py-2.5 bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingConsultation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Transmitting Prescription & Dispatching WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Consultation & Send WhatsApp Rx</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* --------------------------------------------------------- */
          /* PATIENT QUEUE VIEW (Assigned & Completed Tabs)            */
          /* --------------------------------------------------------- */
          <div className="space-y-4">
            {/* Animated KPI Stat Boxes for Doctor Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div 
                className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs stat-box-animated cursor-pointer group"
                style={{ animationDelay: '0ms' }}
                onClick={() => setActiveTab('assigned')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Assigned Queue</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 stat-icon-bounce">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-800 my-1">
                  <span className="stat-number-pop">{assignedQueue.length}</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
                  </span>
                  Awaiting examination
                </span>
              </div>

              <div 
                className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs stat-box-animated cursor-pointer group"
                style={{ animationDelay: '80ms' }}
                onClick={() => setActiveTab('completed')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Completed Rx</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 stat-icon-bounce">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-[#059669] my-1">
                  <span className="stat-number-pop">{completedQueue.length}</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold">Prescriptions archived</span>
              </div>

              <div 
                className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs stat-box-animated cursor-pointer group"
                style={{ animationDelay: '160ms' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Intake</span>
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-600 stat-icon-bounce">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 my-1">
                  <span className="stat-number-pop">{patients.length}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Assigned patient records</span>
              </div>

              <div 
                className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs stat-box-animated cursor-pointer group"
                style={{ animationDelay: '240ms' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">WhatsApp Delivery</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 stat-icon-bounce">
                    <WhatsAppIcon className="w-4 h-4 fill-emerald-600" />
                  </div>
                </div>
                <div className="text-2xl font-black text-[#022c22] my-1">
                  <span className="stat-number-pop">100%</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold">Instant digital slips</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Toolbar */}
            <div className="p-3.5 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3.5">
              <div className="p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
                <button
                  onClick={() => setActiveTab('assigned')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'assigned'
                      ? 'bg-[#059669] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  }`}
                >
                  Assigned Queue ({assignedQueue.length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'completed'
                      ? 'bg-[#059669] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  }`}
                >
                  Completed Consultations ({completedQueue.length})
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter queue by name or ID..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-slate-50/50 hover:bg-white focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Patient ID</th>
                    <th className="py-3 px-3">Patient Name</th>
                    <th className="py-3 px-3">Registration Time</th>
                    <th className="py-3 px-3">Age / Gender</th>
                    <th className="py-3 px-3">WhatsApp Number</th>
                    <th className="py-3 px-3">Chief Complaint</th>
                    <th className="py-3 px-3">Nurse Notes</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(activeTab === 'assigned' ? assignedQueue : completedQueue).map(patient => (
                    <tr key={patient.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3 font-mono font-bold text-[#022c22]">
                        {patient.patient_id}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {patient.name}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px] whitespace-nowrap">
                          <Clock className="w-3 h-3 text-emerald-700 shrink-0" />
                          {formatDateTime(patient.registered_at || patient.created_at)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {patient.age ? `${patient.age} yrs` : 'N/A'} • {patient.gender}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {patient.phone}
                      </td>
                      <td className="py-3 px-3 text-slate-700 max-w-xs truncate">
                        {patient.symptoms}
                      </td>
                      <td className="py-3 px-3 text-slate-500 italic max-w-xs truncate">
                        {patient.nurse_notes || 'Triage clear'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {patient.status === 'Completed' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenPrescription(patient)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-lg text-[11px] cursor-pointer shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Prescription</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartConsultation(patient)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-xl text-[11px] shadow-xs cursor-pointer"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>Examine & Prescribe</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(activeTab === 'assigned' ? assignedQueue : completedQueue).length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        {activeTab === 'assigned' ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-base">
                              🩺
                            </span>
                            <p className="text-xs font-semibold text-slate-600">No patients waiting in assigned queue.</p>
                            <p className="text-[11px] text-slate-400 max-w-sm">
                              New registrations are reviewed and assigned by the <strong>Nurse Triage Station</strong> before arriving here.
                            </p>
                          </div>
                        ) : (
                          'No completed consultations yet.'
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        )}
        </main>
      </div>

      {/* In-Page Prescription Slip Modal (No separate page redirection) */}
      <PrescriptionSlipModal
        isOpen={prescriptionModalOpen}
        onClose={() => {
          setPrescriptionModalOpen(false);
          setSelectedPrescription(null);
        }}
        prescription={selectedPrescription}
      />
    </div>
  );
}
export default DoctorPanel;
