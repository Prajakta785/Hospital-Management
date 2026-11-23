import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { workflowApi, contactApi } from '../../services/api.js';
import { PrescriptionSlipModal } from '../../components/common/PrescriptionSlipModal.jsx';
import { CustomSelect } from '../../components/common/CustomSelect.jsx';
import {
  ShieldAlert,
  Users,
  UserCheck,
  Stethoscope,
  HeartHandshake,
  Calendar,
  Clock,
  Activity,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  KeyRound,
  FileText,
  MessageSquare,
  Sparkles,
  LogOut,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Layers,
  ArrowRight,
  Link2,
  UserPlus,
  X,
  Menu,
  Building2,
  BadgeCheck,
  Droplet,
  Phone,
  MapPin,
  AlertCircle,
  Printer,
  Wifi,
  Globe,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Download,
  Mail,
  Send
} from 'lucide-react';

const assignmentShiftOptions = [
  { value: 'Morning (08:00 AM - 04:00 PM)', label: 'Morning Shift', sublabel: '08:00 AM - 04:00 PM' },
  { value: 'Evening (04:00 PM - 12:00 AM)', label: 'Evening Shift', sublabel: '04:00 PM - 12:00 AM' },
  { value: 'Night (12:00 AM - 08:00 AM)', label: 'Night Shift', sublabel: '12:00 AM - 08:00 AM' },
  { value: 'Full-Day OPD Clinic', label: 'Full-Day OPD Clinic', sublabel: 'All-Day OPD Coverage' }
];

const clinicalDutyRoleOptions = [
  { value: 'Primary Clinical Assistant & Triage', label: 'Primary Assistant & Triage', sublabel: 'Patient triage & vitals' },
  { value: 'Consultation & Patient Prep Specialist', label: 'Consultation & Patient Prep', sublabel: 'Doctor examination assistance' },
  { value: 'Pre-Op & Post-Op Care Coordinator', label: 'Pre-Op & Post-Op Coordinator', sublabel: 'Recovery & surgical care' },
  { value: 'Medication & Vital Signs Monitor', label: 'Medication & Vitals Monitor', sublabel: 'Dosing & monitoring charts' },
  { value: 'General OPD Clinical Aide', label: 'General OPD Clinical Aide', sublabel: 'OPD floor support' }
];

const nurseShiftOptions = [
  { value: 'Morning', label: 'Morning Shift', sublabel: '08:00 AM - 04:00 PM' },
  { value: 'Evening', label: 'Evening Shift', sublabel: '04:00 PM - 12:00 AM' },
  { value: 'Night', label: 'Night Shift', sublabel: '12:00 AM - 08:00 AM' }
];

export function SuperAdminDashboard({ setActivePage }) {
  // Mobile Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('apexcare_superadmin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const safeDate = (val) => {
    if (!val) return 'N/A';
    try {
      const d = new Date(val);
      return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  const safeTime = (val) => {
    if (!val) return 'N/A';
    try {
      const d = new Date(val);
      return isNaN(d.getTime()) ? 'N/A' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  const [loginRoleTab, setLoginRoleTab] = useState('superadmin'); // 'superadmin' | 'nurse' | 'doctor'
  const [loginForm, setLoginForm] = useState({
    loginId: 'ADMIN01',
    password: 'admin123'
  });
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Tab: 'overview' | 'nurses' | 'doctors' | 'registrations' | 'assignments' | 'prescriptions' | 'whatsapp' | 'activity'
  const [activeTab, setActiveTab] = useState('overview');

  // In-Page Prescription Modal (No separate page redirection)
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);

  // Stats & Data Collections
  const [stats, setStats] = useState(null);
  const [nurses, setNurses] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [whatsappLogs, setWhatsappLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportSearchQuery, setSupportSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(false);

  // Assignment Modal States (Super Admin Exclusive Duty Pairing)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [doctorDropdownOpen, setDoctorDropdownOpen] = useState(false);
  const [doctorSearchText, setDoctorSearchText] = useState('');
  const [nurseDropdownOpen, setNurseDropdownOpen] = useState(false);
  const [nurseSearchText, setNurseSearchText] = useState('');
  const [assignmentFormData, setAssignmentFormData] = useState({
    doctorId: '',
    nurseId: '',
    shift: 'Morning (08:00 AM - 04:00 PM)',
    dutyRole: 'Primary Clinical Assistant & Triage',
    roomOrWard: '',
    notes: ''
  });

  // Patient Quick Assign Modal State (Super Admin Access)
  const [patientAssignModalOpen, setPatientAssignModalOpen] = useState(false);
  const [selectedPatientForAssign, setSelectedPatientForAssign] = useState(null);
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState(null);

  // Super Admin Exclusive: Mobile QR Network IP Configuration
  const [networkIp, setNetworkIp] = useState(() => {
    try {
      const saved = localStorage.getItem('apexcare_custom_lan_ip');
      return (saved && saved !== '192.168.1.30') ? saved : '192.168.1.37';
    } catch {
      return '192.168.1.37';
    }
  });
  const [networkIpInput, setNetworkIpInput] = useState('');
  const [savingIp, setSavingIp] = useState(false);
  const [adminQrDataUrl, setAdminQrDataUrl] = useState('');
  const [copiedQrLink, setCopiedQrLink] = useState(false);

  useEffect(() => {
    fetch('/api/workflow/network-info')
      .then(r => r.json())
      .then(d => {
        if (d && d.success && d.localIp && d.localIp !== '127.0.0.1') {
          setNetworkIp(d.localIp);
          setNetworkIpInput(d.localIp);
          try {
            localStorage.setItem('apexcare_custom_lan_ip', d.localIp);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const CLOUD_QR_URL = 'https://hospital-management-system-swart-nu.vercel.app/register-qr';

  // Permanent, fixed, static Cloud QR code - Never changes, ideal for printing and physical posters
  useEffect(() => {
    QRCode.toDataURL(CLOUD_QR_URL, {
      width: 280,
      margin: 4,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' }
    })
      .then(url => setAdminQrDataUrl(url))
      .catch(() => {});
  }, []);

  const handleSaveNetworkIp = async (e) => {
    e.preventDefault();
    if (!networkIpInput.trim()) return;
    setSavingIp(true);
    try {
      const res = await fetch('/api/workflow/network-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localIp: networkIpInput.trim() })
      }).then(r => r.json());
      if (res.success) {
        setNetworkIp(res.localIp);
        localStorage.setItem('apexcare_custom_lan_ip', res.localIp);
        showNotification(`QR Mobile Wi-Fi link updated to ${res.localIp}! All patient devices will now use this link.`);
      } else {
        showNotification(res.message || 'Failed to update IP');
      }
    } catch {
      setNetworkIp(networkIpInput.trim());
      localStorage.setItem('apexcare_custom_lan_ip', networkIpInput.trim());
      showNotification(`Saved local QR link IP: ${networkIpInput.trim()}`);
    } finally {
      setSavingIp(false);
    }
  };
  const [patientAssignDoctorId, setPatientAssignDoctorId] = useState('');
  const [patientAssignNotes, setPatientAssignNotes] = useState('');
  const [patientAssignLoading, setPatientAssignLoading] = useState(false);

  // Modal States
  const [nurseModalOpen, setNurseModalOpen] = useState(false);
  const [editingNurse, setEditingNurse] = useState(null);
  const [nurseFormData, setNurseFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Emergency & Triage',
    shift: 'Morning',
    qualification: 'B.Sc. Nursing',
    login_id: '',
    password: ''
  });

  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorFormData, setDoctorFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: 'General Medicine',
    department_id: 1,
    qualifications: 'MBBS, MD',
    experience_years: 6,
    consultation_fee: 100,
    login_id: '',
    password: ''
  });

  // Action notification toast
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Perform Login (Smart Role-Aware Authentication: Super Admin, Nurse, Doctor)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      // Do not restrict expectedRole: allows Super Admin, Nurse, and Doctor to log in from this management panel
      const res = await workflowApi.login(loginForm.loginId.trim(), loginForm.password);
      if (res && res.success) {
        const user = res.data?.user || res.user || res.data;
        const role = String(user?.role || '').toLowerCase();
        const token = res.data?.token || res.token;
        if (token) localStorage.setItem('apexcare_token', token);

        if (role === 'nurse' || role === 'staff') {
          localStorage.setItem('apexcare_nurse_user', JSON.stringify(user));
          showNotification(`Authenticated as Nurse ${user.name}! Redirecting to Nurse Desk...`);
          if (setActivePage) {
            setActivePage('nurse');
          } else {
            window.location.href = '/nurse';
          }
        } else if (role === 'doctor') {
          const doctorUser = {
            ...user,
            doctor_id: user.doctor_id || user.login_id || 'DOC101',
            specialty: user.specialty || 'General Medicine',
            room_number: user.room_number || 'OPD Suite 204'
          };
          localStorage.setItem('apexcare_doctor_user', JSON.stringify(doctorUser));
          showNotification(`Authenticated as Dr. ${user.name}! Redirecting to Doctor Panel...`);
          if (setActivePage) {
            setActivePage('doctor');
          } else {
            window.location.href = '/doctor';
          }
        } else {
          // Super Admin
          setCurrentUser(user);
          localStorage.setItem('apexcare_superadmin_user', JSON.stringify(user));
          showNotification(`Welcome back, ${user.name || 'Super Admin'}!`);
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
    localStorage.removeItem('apexcare_superadmin_user');
    localStorage.removeItem('apexcare_token');
    localStorage.removeItem('apexcare_superadmin_mode');
    setLoginRoleTab('superadmin');
    setLoginForm({ loginId: 'ADMIN01', password: 'admin123' });
    setLoginError(null);
    if (setActivePage) {
      setActivePage('superadmin');
    }
  };

  // Load all dashboard data
  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [statsRes, nursesRes, docsRes, regRes, consultRes, waRes, actRes, assignRes, contactRes] = await Promise.all([
        workflowApi.getStats().catch(() => ({})),
        workflowApi.getNurses().catch(() => ({})),
        workflowApi.getDoctors().catch(() => ({})),
        workflowApi.getRegistrations().catch(() => ({})),
        workflowApi.getConsultations().catch(() => ({})),
        workflowApi.getWhatsAppLogs().catch(() => ({})),
        workflowApi.getActivityLogs().catch(() => ({})),
        workflowApi.getNurseDoctorAssignments().catch(() => ({})),
        contactApi.getAll().catch(() => ({}))
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (nursesRes?.data) setNurses(nursesRes.data);
      if (docsRes?.data) setDoctors(docsRes.data);
      if (regRes?.data) setRegistrations(regRes.data);
      if (consultRes?.data) setConsultations(consultRes.data);
      if (waRes?.data) setWhatsappLogs(waRes.data);
      if (actRes?.data) setActivityLogs(actRes.data);
      if (assignRes?.data) setAssignments(assignRes.data);
      if (contactRes?.data) setSupportMessages(contactRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAllData();
      const interval = setInterval(loadAllData, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Nurse Account Actions
  const handleOpenAddNurse = () => {
    setEditingNurse(null);
    const randomDigits = Math.floor(100 + Math.random() * 900);
    setNurseFormData({
      name: '',
      email: '',
      phone: '',
      department: 'Emergency & Triage',
      shift: 'Morning',
      qualification: 'B.Sc. Nursing',
      login_id: `NUR${randomDigits}`,
      password: 'nurse123'
    });
    setNurseModalOpen(true);
  };

  const handleOpenEditNurse = (nurse) => {
    setEditingNurse(nurse);
    setNurseFormData({
      name: nurse.name || '',
      email: nurse.email || '',
      phone: nurse.phone || '',
      department: nurse.department || 'Emergency & Triage',
      shift: nurse.shift || 'Morning',
      qualification: nurse.qualification || 'B.Sc. Nursing',
      login_id: nurse.login_id || nurse.nurse_id || '',
      password: ''
    });
    setNurseModalOpen(true);
  };

  const handleSaveNurse = async (e) => {
    e.preventDefault();
    try {
      if (editingNurse) {
        const res = await workflowApi.updateNurse(editingNurse.id, nurseFormData);
        if (res && res.success) {
          showNotification('Nurse account updated successfully!');
          setNurseModalOpen(false);
          loadAllData();
        }
      } else {
        const res = await workflowApi.createNurse(nurseFormData);
        if (res && res.success) {
          showNotification(`Nurse account created! Assigned ID: ${res.data.nurse_id}`);
          setNurseModalOpen(false);
          loadAllData();
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save nurse.');
    }
  };

  const handleToggleNurseStatus = async (nurse) => {
    const nextStatus = nurse.status === 'inactive' ? 'active' : 'inactive';
    try {
      await workflowApi.updateNurse(nurse.id, { status: nextStatus });
      showNotification(`Nurse marked as ${nextStatus}`);
      loadAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Doctor Account Actions
  const handleOpenAddDoctor = () => {
    setEditingDoctor(null);
    const randomDigits = Math.floor(100 + Math.random() * 900);
    setDoctorFormData({
      name: '',
      email: '',
      phone: '',
      specialty: 'General Medicine',
      department_id: 1,
      qualifications: 'MBBS, MD',
      experience_years: 6,
      consultation_fee: 100,
      login_id: `DOC${randomDigits}`,
      password: 'doctor123'
    });
    setDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doc) => {
    setEditingDoctor(doc);
    setDoctorFormData({
      name: doc.name || '',
      email: doc.email || '',
      phone: doc.phone || '',
      specialty: doc.specialty || 'General Medicine',
      department_id: doc.department_id || 1,
      qualifications: doc.qualifications || 'MBBS',
      experience_years: doc.experience_years || 5,
      consultation_fee: doc.consultation_fee || 100,
      login_id: doc.login_id || doc.doctor_id || '',
      password: ''
    });
    setDoctorModalOpen(true);
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        const res = await workflowApi.updateDoctor(editingDoctor.id, doctorFormData);
        if (res && res.success) {
          showNotification('Doctor account updated successfully!');
          setDoctorModalOpen(false);
          loadAllData();
        }
      } else {
        const res = await workflowApi.createDoctor(doctorFormData);
        if (res && res.success) {
          showNotification(`Doctor created! Assigned ID: ${res.data.doctor_id}`);
          setDoctorModalOpen(false);
          loadAllData();
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save doctor.');
    }
  };

  const handleToggleDoctorStatus = async (doc) => {
    const nextStatus = doc.status === 'inactive' ? 'active' : 'inactive';
    try {
      await workflowApi.updateDoctor(doc.id, { status: nextStatus });
      showNotification(`Doctor marked as ${nextStatus}`);
      loadAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // WhatsApp Resend Trigger
  const handleResendWhatsApp = async (logId) => {
    try {
      const res = await workflowApi.resendWhatsApp(logId);
      if (res && res.success) {
        showNotification('WhatsApp prescription message resent!');
        loadAllData();
      }
    } catch (err) {
      alert('Resend failed: ' + err.message);
    }
  };

  const handleUpdateInquiryStatus = async (id, newStatus) => {
    try {
      await contactApi.updateStatus(id, newStatus);
      showNotification(`Inquiry marked as ${newStatus}!`);
      loadAllData();
    } catch (err) {
      showNotification('Failed to update inquiry: ' + err.message, 'error');
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Delete this website contact message?')) return;
    try {
      await contactApi.delete(id);
      showNotification('Inquiry deleted successfully!');
      loadAllData();
    } catch (err) {
      showNotification('Failed to delete inquiry: ' + err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // SUPER ADMIN NURSE-TO-DOCTOR DUTY ALLOCATION HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddAssignment = () => {
    const defaultDocId = doctors.length > 0 ? (doctors[0].doctor_id || doctors[0].id) : '';
    const defaultNurseId = nurses.length > 0 ? (nurses[0].nurse_id || nurses[0].id) : '';
    const defaultRoom = doctors.length > 0 ? (doctors[0].room_number || 'OPD Suite 101') : 'OPD Suite 101';

    setAssignmentFormData({
      doctorId: defaultDocId,
      nurseId: defaultNurseId,
      shift: 'Morning (08:00 AM - 04:00 PM)',
      dutyRole: 'Primary Clinical Assistant & Triage',
      roomOrWard: defaultRoom,
      notes: 'Super Admin official allocation for outpatient consultations and inpatient rounds.'
    });
    setDoctorDropdownOpen(false);
    setDoctorSearchText('');
    setNurseDropdownOpen(false);
    setNurseSearchText('');
    setAssignmentModalOpen(true);
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentFormData.doctorId || !assignmentFormData.nurseId) {
      showNotification('Please select both Doctor and Nurse.', 'error');
      return;
    }

    try {
      const res = await workflowApi.assignNurseToDoctor(assignmentFormData);
      if (res && res.success) {
        showNotification(res.message || 'Nurse successfully assigned to Doctor!');
        setAssignmentModalOpen(false);
        loadAllData();
      } else {
        showNotification(res?.message || 'Failed to save assignment.', 'error');
      }
    } catch (err) {
      showNotification(err.message || 'Error saving assignment.', 'error');
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to unassign this nurse from this doctor?')) return;
    try {
      const res = await workflowApi.removeNurseDoctorAssignment(assignmentId);
      if (res && res.success) {
        showNotification('Assignment successfully removed.');
        loadAllData();
      } else {
        showNotification(res?.message || 'Failed to remove assignment.', 'error');
      }
    } catch (err) {
      showNotification(err.message || 'Error removing assignment.', 'error');
    }
  };

  // -------------------------------------------------------------
  // SUPER ADMIN QUICK PATIENT ASSIGNMENT HANDLERS
  // -------------------------------------------------------------
  const handleOpenAssignPatient = (reg) => {
    setSelectedPatientForAssign(reg);
    setPatientAssignDoctorId(doctors.length > 0 ? (doctors[0].doctor_id || doctors[0].id) : '');
    setPatientAssignNotes(`Assigned by Super Admin. Priority: Routine Triage Consultation.`);
    setPatientAssignModalOpen(true);
  };

  const handleSavePatientAssign = async (e) => {
    e.preventDefault();
    if (!selectedPatientForAssign || !patientAssignDoctorId) return;

    try {
      setPatientAssignLoading(true);
      const res = await workflowApi.assignDoctor({
        registrationId: selectedPatientForAssign.id,
        doctorId: patientAssignDoctorId,
        nurseNotes: patientAssignNotes,
        nurseName: 'Super Admin Office'
      });

      if (res && res.success) {
        showNotification(`Patient ${selectedPatientForAssign.name} assigned to doctor successfully!`);
        setPatientAssignModalOpen(false);
        setSelectedPatientForAssign(null);
        loadAllData();
      } else {
        showNotification(res?.message || 'Patient assignment failed.', 'error');
      }
    } catch (err) {
      showNotification(err.message || 'Error saving patient assignment.', 'error');
    } finally {
      setPatientAssignLoading(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER: Login Form if not authenticated as Super Admin
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
              {isNurse ? (
                <HeartHandshake className="w-8 h-8 text-slate-950" />
              ) : isDoctor ? (
                <Stethoscope className="w-8 h-8 text-slate-950" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-slate-950" />
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

  // Lookups & filtered lists for Nurse-to-Doctor Assignment Modal
  const selectedDoctorForModal = doctors.find(d => String(d.doctor_id || d.id) === String(assignmentFormData.doctorId));
  const selectedNurseForModal = nurses.find(n => String(n.nurse_id || n.id) === String(assignmentFormData.nurseId));

  const modalFilteredDoctors = doctors.filter(d => {
    if (!doctorSearchText.trim()) return true;
    const q = doctorSearchText.toLowerCase();
    return (
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.specialty && d.specialty.toLowerCase().includes(q)) ||
      (d.room_number && d.room_number.toLowerCase().includes(q))
    );
  });

  const modalFilteredNurses = nurses.filter(n => {
    if (!nurseSearchText.trim()) return true;
    const q = nurseSearchText.toLowerCase();
    return (
      (n.name && n.name.toLowerCase().includes(q)) ||
      (n.department && n.department.toLowerCase().includes(q)) ||
      (n.shift && n.shift.toLowerCase().includes(q))
    );
  });

  // -------------------------------------------------------------
  // RENDER: Authenticated Super Admin Dashboard (Dual Independent Scrolling)
  // -------------------------------------------------------------
  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-100 text-slate-800">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-5 right-6 z-50 bg-[#022c22] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-[#044434] animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification.msg}</span>
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
        {/* Brand / Logo Header (Fixed) */}
        <div className="h-16 shrink-0 px-5 border-b border-[#044434] flex items-center justify-between bg-[#022119]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center font-black shadow-md overflow-hidden shrink-0">
              <img src="/images/logo-icon.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white tracking-tight">Super Admin</span>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                  Console
                </span>
              </div>
              <p className="text-[10px] text-emerald-200/80 font-mono tracking-wider">APEXCARE HEALTHCARE</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-emerald-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
          {/* Group 1: Clinical Workflow */}
          <div>
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block mb-2">
              Clinical Operations
            </span>
            <div className="space-y-1">
              {[
                { id: 'overview', label: 'Executive Overview', icon: TrendingUp },
                { id: 'assignments', label: 'Doctor-Nurse Allocation', count: (assignments || []).length, icon: Link2, badgeColor: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' },
                { id: 'registrations', label: 'Patient Queue & Intake', count: (registrations || []).length, icon: UserCheck, badgeColor: 'bg-amber-500/20 text-amber-200 border border-amber-400/30' },
                { id: 'consultations', label: 'Prescriptions & Consultations', count: (consultations || []).length, icon: FileText, badgeColor: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' }
              ].map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
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

          {/* Group 2: Staff & Directory */}
          <div>
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block mb-2">
              Staff & Provisioning
            </span>
            <div className="space-y-1">
              {[
                { id: 'doctors', label: 'Doctors Directory', count: (doctors || []).length, icon: Stethoscope, badgeColor: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' },
                { id: 'nurses', label: 'Nurses Directory', count: (nurses || []).length, icon: Users, badgeColor: 'bg-purple-500/20 text-purple-200 border border-purple-400/30' }
              ].map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
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
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      active ? 'bg-white/20 text-white' : (item.badgeColor || 'bg-[#044434] text-emerald-200')
                    }`}>
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 3: Monitoring & Communications */}
          <div>
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block mb-2">
              System & Monitoring
            </span>
            <div className="space-y-1">
              {[
                { id: 'whatsapp', label: 'WhatsApp Dispatch Logs', count: (whatsappLogs || []).length, icon: MessageSquare, badgeColor: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' },
                { id: 'inquiries', label: 'Website Inquiries & Contact', count: (supportMessages || []).length, icon: Mail, badgeColor: 'bg-amber-500/20 text-amber-200 border border-amber-400/30' }
              ].map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
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
        </div>

        {/* Sidebar Footer: Super Admin Profile & Sign Out (Fixed) */}
        <div className="shrink-0 p-3 border-t border-[#044434] bg-[#022119]">
          <div className="p-2.5 rounded-2xl bg-[#033b20] border border-emerald-400/25 flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/30 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
              👑
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Dr. Marcus Vance'}</p>
              <p className="text-[10px] text-emerald-200/80 truncate">{currentUser?.email || 'admin@hospital.com'}</p>
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
                  {activeTab === 'overview' && 'Executive Overview'}
                  {activeTab === 'assignments' && 'Doctor-Nurse Allocation (Duty Roster)'}
                  {activeTab === 'registrations' && 'Patient Registrations & QR Intake'}
                  {activeTab === 'consultations' && 'Prescriptions & Consultations'}
                  {activeTab === 'doctors' && 'Doctors Management & Credentials'}
                  {activeTab === 'nurses' && 'Nurses Management & Shifts'}
                  {activeTab === 'whatsapp' && 'WhatsApp Notifications & Dispatch Logs'}
                  {activeTab === 'inquiries' && 'Website Inquiries & Patient Contact Messages'}
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  Live Synced
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Hospital Administration & Staff Access Provisioning Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Actions per Tab */}
            {activeTab === 'assignments' && (
              <button
                onClick={() => setAssignmentModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Pair Doctor-Nurse</span>
              </button>
            )}
            {activeTab === 'nurses' && (
              <button
                onClick={handleOpenAddNurse}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Provision Nurse</span>
              </button>
            )}
            {activeTab === 'doctors' && (
              <button
                onClick={handleOpenAddDoctor}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Provision Doctor</span>
              </button>
            )}

            {/* Refresh Button */}
            {/* Refresh Data */}
            <button
              onClick={loadAllData}
              title="Refresh Hospital Data"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Top Bar Sign Out / Logout */}
            <button
              onClick={handleLogout}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              title="Sign Out & Return to Admin Login"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ========================================================= */}
        {/* TAB 1: EXECUTIVE OVERVIEW                                 */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Stat Cards with Interactive Animations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 1. Total Patients */}
              <div 
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs stat-box-animated cursor-pointer group"
                style={{ animationDelay: '0ms' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Patients</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 stat-icon-bounce">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 my-1">
                  <span className="stat-number-pop">{stats?.totalPatients || registrations.length}</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  Live synchronized
                </span>
              </div>

              {/* 2. Total Doctors */}
              <div 
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs stat-box-animated cursor-pointer group"
                style={{ animationDelay: '70ms' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Doctors</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 stat-icon-bounce">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 my-1">
                  <span className="stat-number-pop">{stats?.totalDoctors || doctors.length}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Across 8 departments</span>
              </div>

              {/* 3. Total Nurses */}
              <div 
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs stat-box-animated cursor-pointer group"
                style={{ animationDelay: '140ms' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Nurses</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 stat-icon-bounce">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 my-1">
                  <span className="stat-number-pop">{stats?.totalNurses || nurses.length}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Active triage staff</span>
              </div>

              {/* 4. Pending Triage */}
              <div 
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs stat-box-animated cursor-pointer group"
                style={{ animationDelay: '210ms' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Pending Triage</span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600 stat-icon-bounce">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-600 my-1">
                  <span className="stat-number-pop">{stats?.pendingRegistrations || 0}</span>
                </div>
                <span className="text-[10px] text-amber-700 font-semibold">Awaiting nurse assignment</span>
              </div>

              {/* 5. WhatsApp Delivery */}
              <div 
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs stat-box-animated cursor-pointer group"
                style={{ animationDelay: '280ms' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">WhatsApp Delivery</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 stat-icon-bounce">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 my-1">
                  <span className="stat-number-pop">{stats?.whatsappDeliveryRate || '100%'}</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold">Automatic prescription dispatches</span>
              </div>
            </div>

            {/* Quick Action & Flow Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Recent Patient Workflow Stream
                </h3>
                <div className="divide-y divide-slate-100">
                  {registrations.slice(0, 5).map(reg => (
                    <div key={reg.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{reg.name}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {reg.patient_id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Symptoms: {reg.symptoms?.slice(0, 60)}...
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          reg.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : reg.status === 'Assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {reg.status || 'Pending'}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {safeDate(reg.registered_at || reg.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {registrations.length === 0 && (
                    <p className="text-xs text-slate-400 py-4 text-center">No registrations yet.</p>
                  )}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-gradient-to-br from-[#022c22] via-[#033b20] to-[#044434] text-white p-6 rounded-2xl shadow-xl border border-emerald-500/20 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">Access Control & Staffing</span>
                  <h3 className="text-base font-extrabold mt-1 mb-2 text-white">Staff Credentials Provisioning</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-6">
                    As Super Admin, only you can provision Nurse and Doctor accounts, auto-assign unique ID badges, and configure login passwords.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      setAssignmentFormData({
                        doctorId: '',
                        nurseId: '',
                        shift: 'Morning (08:00 AM - 04:00 PM)',
                        dutyRole: 'Primary Clinical Assistant & Triage',
                        roomOrWard: 'Consultation Suite',
                        notes: 'Assigned via Super Admin Executive Overview'
                      });
                      setDoctorDropdownOpen(false);
    setDoctorSearchText('');
    setNurseDropdownOpen(false);
    setNurseSearchText('');
    setAssignmentModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl flex items-center justify-between shadow-md shadow-emerald-950/30 transition-all cursor-pointer"
                  >
                    <span>🔗 Assign Nurse to Doctor Panel</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleOpenAddNurse}
                    className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center justify-between border border-white/10 transition-all cursor-pointer"
                  >
                    <span>+ Provision New Nurse Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleOpenAddDoctor}
                    className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center justify-between border border-white/10 transition-all cursor-pointer"
                  >
                    <span>+ Provision New Doctor Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveTab('inquiries')}
                    className="w-full py-2.5 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-bold rounded-xl flex items-center justify-between border border-emerald-400/30 transition-all cursor-pointer"
                  >
                    <span>✉️ Review Website Inquiries ({supportMessages.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: NURSE MANAGEMENT                                   */}
        {/* ========================================================= */}
        {activeTab === 'nurses' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Nurse Accounts & Roster</h2>
                <p className="text-xs text-slate-500">Manage hospital triage nurses, credentials, and access statuses.</p>
              </div>
              <button
                onClick={handleOpenAddNurse}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add New Nurse
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Nurse ID</th>
                    <th className="py-3 px-3">Name & Email</th>
                    <th className="py-3 px-3">Login ID</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Assigned Doctor / Panel</th>
                    <th className="py-3 px-3">Shift</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {nurses.map(nurse => {
                    const assigned = (assignments || []).find(a => 
                      String(a.nurse_id) === String(nurse.nurse_id || nurse.id) ||
                      String(a.nurse_name) === String(nurse.name)
                    );
                    const docName = assigned?.doctor_name || nurse.assigned_doctor_name;
                    const specialty = assigned?.doctor_specialty || nurse.assigned_doctor_specialty;

                    return (
                      <tr key={nurse.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-mono font-bold text-sky-900">
                          {nurse.nurse_id || `NUR-${nurse.id}`}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">{nurse.name}</span>
                          <span className="text-[11px] text-slate-500">{nurse.email}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700 font-semibold">
                          {nurse.login_id || nurse.nurse_id || 'NUR101'}
                        </td>
                        <td className="py-3 px-3 text-slate-700">{nurse.department || 'Triage'}</td>
                        <td className="py-3 px-3">
                          {docName ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 font-bold text-[11px] border border-sky-200">
                                🩺 {docName}
                              </span>
                              <span className="block text-[10px] text-slate-500">
                                {specialty || 'General Medicine'} {assigned?.room_or_ward ? `• ${assigned.room_or_ward}` : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                              ⚠️ Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 text-[10px]">
                            {assigned?.shift || nurse.shift || 'Morning'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            nurse.status === 'inactive'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}>
                            {nurse.status === 'inactive' ? 'Deactivated' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setAssignmentFormData({
                                  doctorId: assigned?.doctor_id || assigned?.doctor_numeric_id ? String(assigned.doctor_id || assigned.doctor_numeric_id) : '',
                                  nurseId: nurse.nurse_id || String(nurse.id),
                                  shift: assigned?.shift || (nurse.shift ? `${nurse.shift} Shift` : 'Morning (08:00 AM - 04:00 PM)'),
                                  dutyRole: assigned?.duty_role || 'Primary Clinical Assistant & Triage',
                                  roomOrWard: assigned?.room_or_ward || 'OPD Suite',
                                  notes: `Super Admin assigned Nurse ${nurse.name} to clinic doctor panel.`
                                });
                                setDoctorDropdownOpen(false);
    setDoctorSearchText('');
    setNurseDropdownOpen(false);
    setNurseSearchText('');
    setAssignmentModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                              title="Assign Doctor or Clinic Panel to Nurse"
                            >
                              <Link2 className="w-3 h-3" />
                              <span>Assign Panel</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditNurse(nurse)}
                              className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="Edit Nurse & Credentials"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleNurseStatus(nurse)}
                              className={`p-1.5 rounded-lg cursor-pointer ${
                                nurse.status === 'inactive'
                                  ? 'text-sky-700 hover:bg-sky-50'
                                  : 'text-rose-600 hover:bg-rose-50'
                              }`}
                              title={nurse.status === 'inactive' ? 'Activate Account' : 'Deactivate Account'}
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {nurses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">No nurses registered. Click 'Add New Nurse' above.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DOCTOR MANAGEMENT                                  */}
        {/* ========================================================= */}
        {activeTab === 'doctors' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Doctor Accounts & Specializations</h2>
                <p className="text-xs text-slate-500">Configure medical credentials, assigned departments, and consulting rates.</p>
              </div>
              <button
                onClick={handleOpenAddDoctor}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add New Doctor
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Doctor ID</th>
                    <th className="py-3 px-3">Doctor Name</th>
                    <th className="py-3 px-3">Login ID</th>
                    <th className="py-3 px-3">Specialty / Department</th>
                    <th className="py-3 px-3">Fee</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctors.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-sky-900">
                        {doc.doctor_id || `DOC-${doc.id}`}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{doc.name}</span>
                        <span className="text-[11px] text-slate-500">{doc.qualifications || 'MD'} • {doc.experience_years || 5} yrs exp</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 font-semibold">
                        {doc.login_id || doc.doctor_id || 'DOC101'}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {doc.specialty}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        ₹{doc.consultation_fee || 100}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.status === 'inactive'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}>
                          {doc.status === 'inactive' ? 'Deactivated' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditDoctor(doc)}
                            className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-slate-100 rounded-lg"
                            title="Edit Doctor & Credentials"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleDoctorStatus(doc)}
                            className={`p-1.5 rounded-lg ${
                              doc.status === 'inactive'
                                ? 'text-sky-700 hover:bg-sky-50'
                                : 'text-rose-600 hover:bg-rose-50'
                            }`}
                            title={doc.status === 'inactive' ? 'Activate Doctor' : 'Deactivate Doctor'}
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {doctors.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">No doctors registered. Click 'Add New Doctor' above.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SUPER ADMIN DOCTOR-NURSE DUTY ALLOCATION           */}
        {/* ========================================================= */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1 border border-emerald-200">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Super Admin Exclusive Access</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Doctor &amp; Nurse Duty Allocation</h2>
                  <p className="text-xs text-slate-500">Pair clinical nurses to attending doctors, configure OPD clinic stations, and assign shift duties.</p>
                </div>
                <button
                  onClick={handleOpenAddAssignment}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Nurse to Doctor</span>
                </button>
              </div>

              {/* KPI Mini-Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Active Allocations</span>
                  <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">{assignments.length}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Active Doctor-Nurse pairs</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">Nurses Deployed</span>
                  <span className="text-xl font-black text-[#042f1a] font-mono mt-0.5 block">
                    {new Set((assignments || []).map(a => a.nurse_name || a.nurse_id)).size} / {(nurses || []).length}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Rostered on clinical duty</span>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
                  <span className="text-[10px] font-bold uppercase text-blue-800 block">Doctors Supported</span>
                  <span className="text-xl font-black text-blue-950 font-mono mt-0.5 block">
                    {new Set((assignments || []).map(a => a.doctor_name || a.doctor_id)).size} / {(doctors || []).length}
                  </span>
                  <span className="text-[10px] text-blue-700 font-semibold">With dedicated station nurses</span>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                  <span className="text-[10px] font-bold uppercase text-amber-800 block">Total Capacity</span>
                  <span className="text-xl font-black text-amber-950 font-mono mt-0.5 block">100%</span>
                  <span className="text-[10px] text-amber-700 font-semibold">Real-time sync enabled</span>
                </div>
              </div>

              {/* Assignments Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-3">Supervising Doctor</th>
                      <th className="py-3 px-3">Assigned Clinical Nurse</th>
                      <th className="py-3 px-3">Duty Shift</th>
                      <th className="py-3 px-3">Clinical Duty Role</th>
                      <th className="py-3 px-3">Station / Suite</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignments.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                              <Stethoscope className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{item.doctor_name}</span>
                              <span className="text-[10px] text-sky-700 font-semibold">{item.doctor_specialty}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0">
                              <Users className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 block">{item.nurse_name}</span>
                              <span className="text-[10px] text-slate-500">{item.nurse_department || 'Clinical Care'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {item.shift}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-800 block">{item.duty_role}</span>
                          {item.notes && <span className="text-[10px] text-slate-400 block truncate max-w-xs">{item.notes}</span>}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {item.room_or_ward || item.doctor_room || 'OPD Suite'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 flex items-center gap-1 w-max">
                            <BadgeCheck className="w-3 h-3" />
                            <span>Active Duty</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleRemoveAssignment(item.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            title="Unassign Nurse from Doctor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {assignments.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No doctor-nurse allocations found. Click 'Assign Nurse to Doctor' above to create pairings.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: PATIENT REGISTRATIONS                              */}
        {/* ========================================================= */}
        {activeTab === 'registrations' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">QR Patient Registrations Registry</h2>
                <p className="text-xs text-slate-500">Live feed of all patient self-registrations and clinical triage states.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await loadAllData();
                  }}
                  disabled={loadingData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  title="Pull latest iOS / Android mobile QR registrations"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                  <span>Sync Mobile Registrations</span>
                </button>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Mobile (iOS / Android) Sync Active</span>
                </div>
              </div>
            </div>

            {/* SUPER ADMIN EXCLUSIVE: MOBILE QR CODE & NETWORK IP CONFIGURATION */}
            <div className="mb-6 p-5 bg-gradient-to-br from-[#022c22] via-[#033b20] to-[#044434] rounded-2xl text-white shadow-md border border-emerald-800/60">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                
                {/* QR Preview & Live Info */}
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-xs shrink-0">
                    {adminQrDataUrl ? (
                      <img src={adminQrDataUrl} alt="Patient QR Code" className="w-24 h-24 rounded-lg" />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center text-slate-400">
                        <QrCode className="w-8 h-8 text-emerald-600 animate-pulse" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                      <ShieldAlert className="w-3 h-3" /> Live Patient QR Station
                    </span>
                    <h3 className="text-base font-extrabold text-white">Universal Patient Registration QR Code</h3>
                    <p className="text-xs text-slate-300">
                      Live Cloud QR Code — Works universally on all Android and iOS phones via Mobile Data (Jio/Airtel/Vi) or Wi-Fi.
                    </p>

                    <div className="pt-2 flex items-center gap-2">
                      <span className="text-[11px] text-emerald-300 font-mono font-semibold truncate max-w-xs">
                        {CLOUD_QR_URL}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(CLOUD_QR_URL);
                          setCopiedQrLink(true);
                          setTimeout(() => setCopiedQrLink(false), 2000);
                        }}
                        className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedQrLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedQrLink ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Super Admin IP Setting Form */}
                <form onSubmit={handleSaveNetworkIp} className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-200 mb-1">
                      Wi-Fi / LAN IP Address or Domain:
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 sm:w-56">
                        <Wifi className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={networkIpInput}
                          onChange={(e) => setNetworkIpInput(e.target.value.trim())}
                          placeholder="e.g. 192.168.1.30"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={savingIp}
                        className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {savingIp ? 'Saving...' : 'Update & Save IP'}
                      </button>
                    </div>
                  </div>
                </form>

              </div>
            </div>

            <div className="mb-4 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-950">📋 Nurse Station Exclusive Intake:</span>
                <span>Newly submitted patient registration forms appear exclusively on the <strong>Nurse Desk</strong> for vitals review, initial triage, and doctor assignment. Doctors only receive patients after a Nurse assigns them.</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Patient ID</th>
                    <th className="py-3 px-3">Patient Name</th>
                    <th className="py-3 px-3">WhatsApp Phone</th>
                    <th className="py-3 px-3">Symptoms</th>
                    <th className="py-3 px-3">Assigned Doctor</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Registration Time</th>
                    <th className="py-3 px-3 text-right">Super Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.map(reg => (
                    <tr key={reg.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-sky-950">
                        {reg.patient_id}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{reg.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-500">{reg.gender} • {reg.blood_group}</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            📱 iOS / Android QR
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {reg.phone}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                        {reg.symptoms}
                      </td>
                      <td className="py-3 px-3">
                        {reg.assigned_doctor_name ? (
                          <span className="font-semibold text-sky-900 bg-sky-50 px-2 py-0.5 rounded text-[11px] border border-sky-200">
                            {reg.assigned_doctor_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          reg.status === 'Completed'
                            ? 'bg-sky-100 text-sky-800'
                            : reg.status === 'Assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {reg.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {safeDate(reg.registered_at || reg.created_at)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPatientForDetails(reg)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] transition-all cursor-pointer border border-slate-200"
                            title="View Registration Details"
                          >
                            <FileText className="w-3 h-3 text-slate-600" />
                            <span>Details</span>
                          </button>
                          {(!reg.status || reg.status === 'Pending') ? (
                            <button
                              onClick={() => handleOpenAssignPatient(reg)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                              title="Assign to Doctor & Nurse"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>Assign</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Assigned ✓
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {registrations.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">No registrations found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: PRESCRIPTIONS & CONSULTATIONS                      */}
        {/* ========================================================= */}
        {activeTab === 'consultations' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Submitted Prescriptions & Consultations</h2>
                <p className="text-xs text-slate-500">Full clinical prescriptions issued by attending doctors.</p>
              </div>
            </div>

            <div className="space-y-4">
              {consultations.map(consult => (
                <div key={consult.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{consult.patient_name}</span>
                        <span className="font-mono text-xs text-emerald-900 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                          {consult.patient_id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Consultant: <strong>{consult.doctor_name}</strong> • Nurse: {consult.nurse_name || 'Triage'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">
                        {safeDate(consult.consultation_date || consult.created_at)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPrescription(consult);
                          setPrescriptionModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                      >
                        View Official Prescription
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                    <div>
                      <span className="text-slate-400 block font-medium">Diagnosis:</span>
                      <span className="font-bold text-slate-800">{consult.diagnosis}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Next Appointment:</span>
                      <span className="font-bold text-sky-700">
                        {consult.next_appointment_date ? `${consult.next_appointment_date} at ${consult.next_appointment_time || '10:00 AM'}` : 'As required'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Medicines Prescribed:</span>
                      <span className="font-bold text-slate-800">{consult.medicines?.length || 0} items</span>
                    </div>
                  </div>

                  {consult.medicines && consult.medicines.length > 0 && (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Medication Summary:</span>
                      <div className="flex flex-wrap gap-2">
                        {consult.medicines.map((m, idx) => (
                          <span key={idx} className="px-2 py-1 bg-slate-100 rounded font-semibold text-slate-800">
                            {m.name} ({m.dosage}, {m.frequency}, {m.food_timing || m.food_instructions || 'After Food'})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {consultations.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">No consultations submitted yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: WHATSAPP NOTIFICATION LOGS                         */}
        {/* ========================================================= */}
        {activeTab === 'whatsapp' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">WhatsApp Prescription Delivery Logs</h2>
                <p className="text-xs text-slate-500">Live records of prescriptions dispatched to patients' WhatsApp numbers.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Message ID</th>
                    <th className="py-3 px-3">Recipient & Mobile</th>
                    <th className="py-3 px-3">Doctor</th>
                    <th className="py-3 px-3">Delivery Status</th>
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {whatsappLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-sky-950">
                        {log.message_id || log.id}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{log.patient_name}</span>
                        <span className="font-mono text-[11px] text-slate-500">{log.phone}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {log.doctor_name || 'Dr. Neha Kapoor'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'Failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}>
                          {log.status || 'Delivered'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {safeDate(log.created_at)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {log.intent_url && (
                            <a
                              href={log.intent_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded bg-sky-50 text-sky-800 font-bold hover:bg-sky-100 transition-colors border border-sky-200"
                            >
                              Direct WhatsApp
                            </a>
                          )}
                          <button
                            onClick={() => handleResendWhatsApp(log.id)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                          >
                            Resend
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {whatsappLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">No WhatsApp messages dispatched yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: WEBSITE INQUIRIES & CONTACT MESSAGES               */}
        {/* ========================================================= */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-sky-600" />
                    <span>Website Contact & Patient Inquiries</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                      {supportMessages.length} Total
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Messages and consultation inquiries submitted via the public Contact page.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[260px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={supportSearchQuery}
                    onChange={(e) => setSupportSearchQuery(e.target.value)}
                    placeholder="Search name, email, ticket..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Inquiries Cards Grid */}
              <div className="space-y-4">
                {supportMessages
                  .filter(msg => {
                    if (!supportSearchQuery) return true;
                    const q = supportSearchQuery.toLowerCase();
                    return (
                      (msg.name && msg.name.toLowerCase().includes(q)) ||
                      (msg.email && msg.email.toLowerCase().includes(q)) ||
                      (msg.ticket_id && msg.ticket_id.toLowerCase().includes(q)) ||
                      (msg.department && msg.department.toLowerCase().includes(q)) ||
                      (msg.message && msg.message.toLowerCase().includes(q))
                    );
                  })
                  .map(msg => (
                    <div
                      key={msg.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-sky-300 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                            ✉️
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900">{msg.name}</h3>
                              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-200">
                                {msg.ticket_id}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                msg.status === 'resolved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {msg.status || 'new'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                              <span>Dept: <strong className="text-slate-700">{msg.department || 'General'}</strong></span>
                              <span>•</span>
                              <span>Subject: <strong className="text-slate-700">{msg.subject || 'Consultation Request'}</strong></span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{safeDate(msg.created_at)}</span>
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                        <p className="font-semibold text-slate-800 mb-1">Message:</p>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      </div>

                      {/* Contact Details & Quick Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                        <div className="flex flex-wrap items-center gap-4 text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-sky-600" />
                            <a href={`mailto:${msg.email}`} className="text-sky-700 font-semibold hover:underline">
                              {msg.email}
                            </a>
                          </span>
                          {msg.phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <a href={`tel:${msg.phone}`} className="font-mono text-slate-700 font-semibold hover:underline">
                                {msg.phone}
                              </a>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {msg.phone && (
                            <a
                              href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${msg.name}, this is ApexCare Hospital regarding your inquiry (${msg.ticket_id}).`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <a
                            href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject || 'ApexCare Hospital Inquiry'} (${msg.ticket_id})`)}`}
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Reply Email</span>
                          </a>
                          <button
                            onClick={() => handleUpdateInquiryStatus(msg.id, msg.status === 'resolved' ? 'new' : 'resolved')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                          >
                            {msg.status === 'resolved' ? 'Mark as New' : 'Mark Resolved'}
                          </button>
                          <button
                            onClick={() => handleDeleteInquiry(msg.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {supportMessages.length === 0 && (
                  <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-600">No contact messages received yet</p>
                    <p className="text-xs text-slate-400 mt-1">Inquiries submitted from the public Contact page will appear here instantly.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT NURSE ACCOUNT                           */}
      {/* ========================================================= */}
      {nurseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#022c22] to-[#033b20] px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-bold">
                  {editingNurse ? 'Edit Nurse Account & Credentials' : 'Provision New Nurse Account'}
                </h3>
                <p className="text-[11px] sm:text-xs text-emerald-300">Auto-assign credentials and triage shift</p>
              </div>
              <button
                onClick={() => setNurseModalOpen(false)}
                className="text-emerald-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNurse} className="p-4 sm:p-6 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nurse Full Name *</label>
                <input
                  type="text"
                  required
                  value={nurseFormData.name}
                  onChange={(e) => setNurseFormData({ ...nurseFormData, name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins, RN"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={nurseFormData.email}
                    onChange={(e) => setNurseFormData({ ...nurseFormData, email: e.target.value })}
                    placeholder="nurse@hospital.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    value={nurseFormData.phone}
                    onChange={(e) => setNurseFormData({ ...nurseFormData, phone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={nurseFormData.department}
                    onChange={(e) => setNurseFormData({ ...nurseFormData, department: e.target.value })}
                    placeholder="e.g. Emergency & Triage"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="min-w-0">
                  <CustomSelect
                    label="Shift"
                    value={nurseFormData.shift}
                    onChange={(val) => setNurseFormData({ ...nurseFormData, shift: val })}
                    options={nurseShiftOptions}
                    searchable={false}
                  />
                </div>
              </div>

              {/* Login Credentials Assignment */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                <span className="font-bold text-emerald-950 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-800" />
                  Assigned Login Credentials (Super Admin Controlled)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-emerald-900 mb-1">Assigned Login ID</label>
                    <input
                      type="text"
                      required
                      value={nurseFormData.login_id}
                      onChange={(e) => setNurseFormData({ ...nurseFormData, login_id: e.target.value })}
                      placeholder="e.g. NUR101"
                      className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-white font-mono font-bold text-emerald-950"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-emerald-900 mb-1">
                      {editingNurse ? 'New Password (Leave blank to keep)' : 'Initial Password'}
                    </label>
                    <input
                      type="password"
                      value={nurseFormData.password}
                      onChange={(e) => setNurseFormData({ ...nurseFormData, password: e.target.value })}
                      placeholder={editingNurse ? '••••••••' : 'nurse123'}
                      className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNurseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingNurse ? 'Save Updates' : 'Create Nurse Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT DOCTOR ACCOUNT                          */}
      {/* ========================================================= */}
      {doctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-emerald-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#022c22] to-[#033b20] px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-bold">
                  {editingDoctor ? 'Edit Doctor Account & Specialization' : 'Provision New Doctor Account'}
                </h3>
                <p className="text-[11px] sm:text-xs text-emerald-300">Assign Doctor ID, credentials, department and fee</p>
              </div>
              <button
                onClick={() => setDoctorModalOpen(false)}
                className="text-sky-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} className="p-4 sm:p-6 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor Full Name *</label>
                <input
                  type="text"
                  required
                  value={doctorFormData.name}
                  onChange={(e) => setDoctorFormData({ ...doctorFormData, name: e.target.value })}
                  placeholder="e.g. Dr. Neha Kapoor"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={doctorFormData.email}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, email: e.target.value })}
                    placeholder="doctor@hospital.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    value={doctorFormData.phone}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, phone: e.target.value })}
                    placeholder="+91 98765 11111"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialization / Discipline *</label>
                  <input
                    type="text"
                    required
                    value={doctorFormData.specialty}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, specialty: e.target.value })}
                    placeholder="e.g. Cardiology, Neurology, General Medicine"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={doctorFormData.qualifications}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, qualifications: e.target.value })}
                    placeholder="MBBS, MD (Cardiology)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={doctorFormData.experience_years}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, experience_years: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={doctorFormData.consultation_fee}
                    onChange={(e) => setDoctorFormData({ ...doctorFormData, consultation_fee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Login Credentials Assignment */}
              <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 space-y-3">
                <span className="font-bold text-sky-950 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-sky-800" />
                  Assigned Login Credentials (Super Admin Controlled)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-sky-900 mb-1">Assigned Login ID</label>
                    <input
                      type="text"
                      required
                      value={doctorFormData.login_id}
                      onChange={(e) => setDoctorFormData({ ...doctorFormData, login_id: e.target.value })}
                      placeholder="e.g. DOC101"
                      className="w-full px-3 py-1.5 rounded-lg border border-sky-300 bg-white font-mono font-bold text-sky-950"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-sky-900 mb-1">
                      {editingDoctor ? 'New Password (Leave blank to keep)' : 'Initial Password'}
                    </label>
                    <input
                      type="password"
                      value={doctorFormData.password}
                      onChange={(e) => setDoctorFormData({ ...doctorFormData, password: e.target.value })}
                      placeholder={editingDoctor ? '••••••••' : 'doctor123'}
                      className="w-full px-3 py-1.5 rounded-lg border border-sky-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDoctorModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingDoctor ? 'Save Updates' : 'Create Doctor Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ASSIGN NURSE TO DOCTOR (SUPER ADMIN CONTROL)       */}
      {/* ========================================================= */}
      {assignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-emerald-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#022c22] via-[#033b20] to-[#022c22] px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between shrink-0">
              <div className="min-w-0 pr-2">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider mb-1">
                  <ShieldAlert className="w-3 h-3 shrink-0" />
                  <span>Super Admin Exclusive</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold truncate">Assign Nurse to Doctor</h3>
                <p className="text-[11px] sm:text-xs text-emerald-300 leading-tight">Link attending nurse with supervising doctor for OPD &amp; ward duties</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAssignmentModalOpen(false);
                  setDoctorDropdownOpen(false);
                  setNurseDropdownOpen(false);
                }}
                className="text-emerald-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 shrink-0 cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body - Scrollable if content is tall */}
            <form onSubmit={handleSaveAssignment} className="p-4 sm:p-6 space-y-3 sm:space-y-3.5 text-xs overflow-y-auto flex-1">
              {/* 1. SELECT SUPERVISING DOCTOR (Responsive & Overflow-safe) */}
              <div className="relative">
                <label className="block font-bold text-slate-700 mb-1">Select Supervising Doctor *</label>
                <button
                  type="button"
                  onClick={() => {
                    setDoctorDropdownOpen(!doctorDropdownOpen);
                    setNurseDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 sm:py-2.5 rounded-xl border text-left bg-white text-xs font-semibold text-slate-900 transition-all flex items-center justify-between gap-2 cursor-pointer shadow-2xs ${
                    doctorDropdownOpen ? 'border-sky-600 ring-2 ring-sky-500/20' : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="min-w-0 flex-1 truncate">
                    {selectedDoctorForModal ? (
                      <span className="block truncate">
                        <strong className="text-slate-900 font-bold">{selectedDoctorForModal.name}</strong>{' '}
                        <span className="text-sky-700 font-medium text-[11px]">({selectedDoctorForModal.specialty})</span>{' '}
                        <span className="text-slate-400 text-[11px]">• {selectedDoctorForModal.room_number || 'OPD'}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">-- Choose Doctor --</span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${doctorDropdownOpen ? 'rotate-180 text-sky-600' : ''}`} />
                </button>

                {/* Dropdown Options Popup - Constrained to modal width and scrollable max height */}
                {doctorDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDoctorDropdownOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1.5 w-full max-w-full bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col">
                      {/* Search Filter Header */}
                      <div className="p-2 border-b border-slate-100 bg-slate-50/90 sticky top-0 z-10">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Filter doctor or specialty..."
                            value={doctorSearchText}
                            onChange={(e) => setDoctorSearchText(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Doctor Options List */}
                      <div className="max-h-52 sm:max-h-60 overflow-y-auto overflow-x-hidden divide-y divide-slate-100 text-xs overscroll-contain">
                        {modalFilteredDoctors.length > 0 ? (
                          modalFilteredDoctors.map(d => {
                            const isSelected = String(d.doctor_id || d.id) === String(assignmentFormData.doctorId);
                            return (
                              <div
                                key={d.id}
                                onClick={() => {
                                  setAssignmentFormData({
                                    ...assignmentFormData,
                                    doctorId: String(d.doctor_id || d.id),
                                    roomOrWard: d.room_number || assignmentFormData.roomOrWard
                                  });
                                  setDoctorDropdownOpen(false);
                                  setDoctorSearchText('');
                                }}
                                className={`px-3 py-2.5 hover:bg-sky-50 cursor-pointer transition-colors text-left flex items-start justify-between gap-2 ${
                                  isSelected ? 'bg-sky-50/90 border-l-4 border-sky-600' : ''
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-slate-900 text-xs truncate">{d.name}</div>
                                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1 mt-0.5 leading-snug">
                                    <span className="text-sky-700 font-medium">{d.specialty}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-600 font-mono text-[10px]">{d.room_number || 'OPD'}</span>
                                  </div>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />}
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-slate-400 text-xs">
                            No doctors matching "{doctorSearchText}"
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 2. SELECT ATTENDING NURSE (Responsive & Overflow-safe) */}
              <div className="relative">
                <label className="block font-bold text-slate-700 mb-1">Select Attending Nurse *</label>
                <button
                  type="button"
                  onClick={() => {
                    setNurseDropdownOpen(!nurseDropdownOpen);
                    setDoctorDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 sm:py-2.5 rounded-xl border text-left bg-white text-xs font-semibold text-slate-900 transition-all flex items-center justify-between gap-2 cursor-pointer shadow-2xs ${
                    nurseDropdownOpen ? 'border-sky-600 ring-2 ring-sky-500/20' : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="min-w-0 flex-1 truncate">
                    {selectedNurseForModal ? (
                      <span className="block truncate">
                        <strong className="text-slate-900 font-bold">{selectedNurseForModal.name}</strong>{' '}
                        <span className="text-teal-700 font-medium text-[11px]">({selectedNurseForModal.department || 'Nursing'})</span>{' '}
                        <span className="text-slate-400 text-[11px]">• {selectedNurseForModal.shift || 'Shift Active'}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">-- Choose Nurse --</span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${nurseDropdownOpen ? 'rotate-180 text-sky-600' : ''}`} />
                </button>

                {/* Dropdown Options Popup */}
                {nurseDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNurseDropdownOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1.5 w-full max-w-full bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col">
                      {/* Search Filter Header */}
                      <div className="p-2 border-b border-slate-100 bg-slate-50/90 sticky top-0 z-10">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Filter nurse by name or dept..."
                            value={nurseSearchText}
                            onChange={(e) => setNurseSearchText(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Nurse Options List */}
                      <div className="max-h-52 sm:max-h-60 overflow-y-auto overflow-x-hidden divide-y divide-slate-100 text-xs overscroll-contain">
                        {modalFilteredNurses.length > 0 ? (
                          modalFilteredNurses.map(n => {
                            const isSelected = String(n.nurse_id || n.id) === String(assignmentFormData.nurseId);
                            return (
                              <div
                                key={n.id}
                                onClick={() => {
                                  setAssignmentFormData({
                                    ...assignmentFormData,
                                    nurseId: String(n.nurse_id || n.id)
                                  });
                                  setNurseDropdownOpen(false);
                                  setNurseSearchText('');
                                }}
                                className={`px-3 py-2.5 hover:bg-sky-50 cursor-pointer transition-colors text-left flex items-start justify-between gap-2 ${
                                  isSelected ? 'bg-sky-50/90 border-l-4 border-sky-600' : ''
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-slate-900 text-xs truncate">{n.name}</div>
                                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1 mt-0.5 leading-snug">
                                    <span className="text-teal-700 font-medium">{n.department || 'Nursing'}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-600 text-[10px]">{n.shift || 'Shift Active'}</span>
                                  </div>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />}
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-slate-400 text-xs">
                            No nurses matching "{nurseSearchText}"
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 3. SHIFT & ROOM (Stacked on mobile, 2 cols on desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <CustomSelect
                    label="Duty Shift"
                    required
                    value={assignmentFormData.shift}
                    onChange={(val) => setAssignmentFormData({ ...assignmentFormData, shift: val })}
                    options={assignmentShiftOptions}
                    searchable={false}
                  />
                </div>
                <div className="min-w-0">
                  <label className="block font-bold text-slate-700 uppercase mb-1 text-[11px]">Clinic Room / Station</label>
                  <input
                    type="text"
                    value={assignmentFormData.roomOrWard}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, roomOrWard: e.target.value })}
                    placeholder="e.g. Suite 415 / Neuro OPD"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                </div>
              </div>

              {/* 4. DUTY ROLE */}
              <div className="min-w-0">
                <CustomSelect
                  label="Clinical Duty Role"
                  required
                  value={assignmentFormData.dutyRole}
                  onChange={(val) => setAssignmentFormData({ ...assignmentFormData, dutyRole: val })}
                  options={clinicalDutyRoleOptions}
                  searchable={false}
                />
              </div>

              {/* 5. NOTES */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Super Admin Instructions / Duty Notes</label>
                <textarea
                  rows={2}
                  value={assignmentFormData.notes}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, notes: e.target.value })}
                  placeholder="Special instructions for patient triage, round timings, or clinic assistance..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600 resize-none"
                />
              </div>

              {/* 6. ACTION BUTTONS (Stacked on mobile, inline on desktop) */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-slate-100 sm:border-0 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setAssignmentModalOpen(false);
                    setDoctorDropdownOpen(false);
                    setNurseDropdownOpen(false);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold shadow-xs cursor-pointer text-center"
                >
                  Save Duty Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: QUICK PATIENT ASSIGNMENT BY SUPER ADMIN             */}
      {/* ========================================================= */}
      {patientAssignModalOpen && selectedPatientForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-emerald-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#022c22] to-[#033b20] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Assign Patient to Doctor</h3>
                <p className="text-xs text-emerald-300">Route patient to physician for consultation</p>
              </div>
              <button
                onClick={() => setPatientAssignModalOpen(false)}
                className="text-emerald-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePatientAssign} className="p-6 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-900">{selectedPatientForAssign.name}</span>
                  <span className="font-mono font-bold text-emerald-950 text-[11px]">{selectedPatientForAssign.patient_id}</span>
                </div>
                <p className="text-slate-600 text-[11px] mb-1">
                  <strong>Symptoms:</strong> {selectedPatientForAssign.symptoms || 'General Checkup'}
                </p>
                <p className="text-slate-500 text-[10px]">
                  WhatsApp: {selectedPatientForAssign.phone} • Blood: {selectedPatientForAssign.blood_group}
                </p>
              </div>

              <div className="min-w-0">
                <CustomSelect
                  label="Select Available Doctor"
                  required
                  placeholder="-- Choose Doctor --"
                  value={patientAssignDoctorId}
                  onChange={(val) => setPatientAssignDoctorId(val)}
                  options={doctors.map(d => ({
                    value: String(d.doctor_id || d.id),
                    label: d.name,
                    sublabel: `${d.specialty} • ${d.room_number || 'OPD Suite'}`
                  }))}
                  searchable={true}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Triage / Assignment Notes</label>
                <textarea
                  rows={2}
                  value={patientAssignNotes}
                  onChange={(e) => setPatientAssignNotes(e.target.value)}
                  placeholder="Notes for attending doctor..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPatientAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={patientAssignLoading}
                  className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {patientAssignLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PATIENT FULL REGISTRATION DOSSIER                  */}
      {/* ========================================================= */}
      {selectedPatientForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* 1. STICKY MODAL HEADER (Always Visible on Screen) */}
            <div className="shrink-0 bg-slate-900 px-5 sm:px-6 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-sky-300 font-bold text-sm">
                  {selectedPatientForDetails.name ? selectedPatientForDetails.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'PT'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white tracking-tight">{selectedPatientForDetails.name}</h3>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-sky-300 font-semibold">
                      {selectedPatientForDetails.patient_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{selectedPatientForDetails.age ? `${selectedPatientForDetails.age} yrs` : 'Age N/A'} • {selectedPatientForDetails.gender}</span>
                    <span>•</span>
                    <span className="text-rose-400 font-bold flex items-center gap-0.5">
                      <Droplet className="w-3 h-3 fill-rose-500 text-rose-500" /> {selectedPatientForDetails.blood_group || 'O+'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  selectedPatientForDetails.status === 'Completed'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : selectedPatientForDetails.status === 'Assigned'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : selectedPatientForDetails.status === 'In Consultation'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {selectedPatientForDetails.status || 'Pending'}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPatientForDetails(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close Dossier"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. SCROLLABLE CLINICAL DOSSIER BODY (Fitted smoothly inside 90vh) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
              
              {/* 10-Point Formatted Registration Record */}
              <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 space-y-3">
                {/* 1 & 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2.5 border-b border-slate-200/70">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">1. Full Name:</span>
                    <strong className="text-slate-900 text-sm font-extrabold">{selectedPatientForDetails.name}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">2. Age / Date of Birth:</span>
                    <strong className="text-slate-800 text-xs font-bold">
                      {selectedPatientForDetails.age ? `${selectedPatientForDetails.age} yrs` : 'N/A'}{selectedPatientForDetails.dob ? ` (${selectedPatientForDetails.dob})` : ''}
                    </strong>
                  </div>
                </div>

                {/* 3 & 4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2.5 border-b border-slate-200/70">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">3. Gender:</span>
                    <strong className="text-slate-800 text-xs font-bold">{selectedPatientForDetails.gender || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">4. WhatsApp Mobile:</span>
                    <strong className="text-slate-900 text-xs font-mono font-bold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-sky-700" />
                      {selectedPatientForDetails.phone}
                    </strong>
                  </div>
                </div>

                {/* 5 & 7 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2.5 border-b border-slate-200/70">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">5. Email:</span>
                    <strong className="text-slate-800 text-xs font-bold truncate block">{selectedPatientForDetails.email || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">7. Blood Group:</span>
                    <strong className="text-rose-600 text-xs font-extrabold flex items-center gap-0.5">
                      <Droplet className="w-3 h-3 fill-rose-500 text-rose-500" /> {selectedPatientForDetails.blood_group || 'O+'}
                    </strong>
                  </div>
                </div>

                {/* 6. Residential Address */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">6. Residential Address:</span>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedPatientForDetails.address || 'Walk-in (Address not recorded)'}</span>
                  </div>
                </div>

                {/* 8. Presented Symptoms & Health Problem */}
                <div>
                  <span className="text-[11px] font-bold text-amber-900 block mb-1">8. Presented Symptoms &amp; Health Problem:</span>
                  <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/90 text-slate-900 font-semibold leading-relaxed">
                    {selectedPatientForDetails.symptoms || 'General medical examination requested.'}
                  </div>
                </div>

                {/* 9. Previous Medical History & Allergies */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">9. Previous Medical History &amp; Allergies:</span>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium leading-relaxed">
                    {selectedPatientForDetails.medical_history || 'No prior chronic illness or drug allergies reported'}
                  </div>
                </div>

                {/* 10. Emergency Contact */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">10. Emergency Contact:</span>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>
                      {typeof selectedPatientForDetails.emergency_contact === 'object' && selectedPatientForDetails.emergency_contact !== null
                        ? (selectedPatientForDetails.emergency_contact.name || selectedPatientForDetails.emergency_contact.phone
                            ? `${selectedPatientForDetails.emergency_contact.name || 'Contact'}${selectedPatientForDetails.emergency_contact.phone ? ` (${selectedPatientForDetails.emergency_contact.phone})` : ''}`
                            : 'Emergency Contact')
                        : String(selectedPatientForDetails.emergency_contact || 'Emergency Contact')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nurse Triage / Assignment Details */}
              {selectedPatientForDetails.assigned_doctor_name && (
                <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-900 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-sky-700" /> Attending Doctor Assignment
                    </span>
                    <span className="text-[10px] text-sky-700 font-semibold font-mono">
                      Nurse: {selectedPatientForDetails.assigned_nurse_name || 'Triage Desk'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Assigned Physician:</span>
                      <strong className="text-slate-900 text-sm">{selectedPatientForDetails.assigned_doctor_name}</strong>
                      <span className="text-slate-500 block text-[11px]">{selectedPatientForDetails.assigned_doctor_specialty || 'General Medicine'}</span>
                    </div>
                  </div>
                  {selectedPatientForDetails.nurse_notes && (
                    <div className="pt-2 border-t border-sky-100 text-[11px] text-sky-950">
                      <span className="font-bold">Triage Notes: </span>
                      <span className="italic">{selectedPatientForDetails.nurse_notes}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Doctor Consultation & Prescription Section (If Completed) */}
              {(selectedPatientForDetails.status === 'Completed' || selectedPatientForDetails.diagnosis) && (
                <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-sky-200/80 pb-2.5">
                    <span className="text-xs font-extrabold text-sky-950 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-sky-700" />
                      Doctor Consultation &amp; Official Prescription
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPrescription(selectedPatientForDetails);
                        setPrescriptionModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#059669] hover:bg-[#047857] text-white rounded-lg font-bold text-[11px] shadow-xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3 h-3" />
                      <span>View Printable Rx Slip</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-sky-800/80 font-bold block text-[10px] uppercase">Clinical Diagnosis:</span>
                      <span className="font-extrabold text-slate-900 text-sm">{selectedPatientForDetails.diagnosis || 'Clinical evaluation completed'}</span>
                    </div>
                    <div>
                      <span className="text-sky-800/80 font-bold block text-[10px] uppercase">Next Follow-Up Appointment:</span>
                      <span className="font-bold text-sky-900 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-sky-700" />
                        {selectedPatientForDetails.next_appointment_date ? `${selectedPatientForDetails.next_appointment_date} at ${selectedPatientForDetails.next_appointment_time || '10:00 AM'}` : 'Follow-up as required'}
                      </span>
                    </div>
                  </div>

                  {Array.isArray(selectedPatientForDetails.medicines) && selectedPatientForDetails.medicines.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-900 block">Prescribed Medications:</span>
                      <div className="bg-white rounded-xl border border-sky-200/80 overflow-hidden shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-sky-50 text-[10px] font-bold text-sky-900 uppercase">
                            <tr>
                              <th className="py-2 px-3">Medicine</th>
                              <th className="py-2 px-3">Dosage</th>
                              <th className="py-2 px-3">Frequency</th>
                              <th className="py-2 px-3">Duration</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-sky-50">
                            {selectedPatientForDetails.medicines.map((m, idx) => (
                              <tr key={idx} className="hover:bg-sky-50/40">
                                <td className="py-2 px-3 font-bold text-slate-900">{m.medicine_name || m.name}</td>
                                <td className="py-2 px-3 text-slate-600">{m.dosage}</td>
                                <td className="py-2 px-3 text-sky-800 font-semibold">{m.frequency}</td>
                                <td className="py-2 px-3 text-slate-600">{m.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedPatientForDetails.doctor_notes && (
                    <div className="text-xs pt-1">
                      <span className="text-[10px] font-bold uppercase text-sky-900 block">Doctor's Advice &amp; Instructions:</span>
                      <p className="text-slate-800 font-medium italic mt-0.5">{selectedPatientForDetails.doctor_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. STICKY MODAL FOOTER (Always Visible on Screen) */}
            <div className="shrink-0 p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">
                  Registered: <strong className="text-slate-800">{safeDate(selectedPatientForDetails.registered_at || selectedPatientForDetails.created_at)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(selectedPatientForDetails.status === 'Completed' || selectedPatientForDetails.diagnosis) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPrescription(selectedPatientForDetails);
                      setPrescriptionModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Rx</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedPatientForDetails(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

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
export default SuperAdminDashboard;
