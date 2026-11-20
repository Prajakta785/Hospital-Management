import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { appointmentsApi, patientsApi, prescriptionsApi, labApi, doctorsApi } from '../../services/api.js';
import { PrescriptionSlipModal } from '../../components/common/PrescriptionSlipModal.jsx';
import { LabReportModal } from '../../components/common/LabReportModal.jsx';
import { AppointmentSlipModal } from '../../components/common/AppointmentSlipModal.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { QRCodeToken } from '../../components/common/QRCodeToken.jsx';
import {
  LayoutDashboard,
  CalendarClock,
  UsersRound,
  FileText,
  Microscope,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  Stethoscope,
  Pill,
  Printer,
  ChevronRight,
  LogOut,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Menu,
  X,
  User,
  HeartPulse,
  Activity,
  Check,
  Send,
  Trash2,
  ChevronDown
} from 'lucide-react';

// Clean, Mobile-Responsive Patient Selector Component (No Obstructive Floating Overlays)
function PatientDropdown({ patients, value, onChange, placeholder = "-- Choose Patient --" }) {
  const selectedPatient = patients.find(p => p.id?.toString() === value?.toString());

  return (
    <div className="space-y-1.5">
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-[#0284c7]/20 focus:border-sky-600 cursor-pointer shadow-2xs transition-colors"
      >
        <option value="">{placeholder}</option>
        {patients.map(p => (
          <option key={p.id} value={p.id}>
            {p.first_name} {p.last_name} ({p.mrn || `MRN-${p.id}`}) • {p.gender}, {p.age || 'Adult'} • Blood: {p.blood_group || 'O+'}
          </option>
        ))}
      </select>

      {selectedPatient && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 bg-sky-50/70 border border-sky-200/80 rounded-lg px-2.5 py-1.5 animate-in fade-in duration-150">
          <span className="font-bold text-[#071933]">{selectedPatient.first_name} {selectedPatient.last_name}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-medium">{selectedPatient.gender}, {selectedPatient.age || 'Adult'}</span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-[10px] text-[#0284c7] bg-sky-100 border border-sky-300 px-1.5 py-0.5 rounded font-bold">{selectedPatient.mrn}</span>
          <span className="text-slate-300">•</span>
          <span className="text-[#0284c7] font-medium">Blood: {selectedPatient.blood_group || 'O+'}</span>
        </div>
      )}
    </div>
  );
}

export function DoctorPortal({ setActivePage, initialTab = 'dashboard' }) {
  const { user, logout, switchDemoRole } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Core Data
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);

  // Modals
  const [selectedRx, setSelectedRx] = useState(null);
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [apptSlipModalOpen, setApptSlipModalOpen] = useState(false);

  // New Prescription Form Modal
  const [createRxModalOpen, setCreateRxModalOpen] = useState(false);
  const [rxForm, setRxForm] = useState({
    patient_id: '',
    appointment_id: '',
    diagnosis: '',
    instructions: '',
    medicines: [
      { medicine_name: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 Days', instructions: 'After food' }
    ]
  });

  // Schedule & Follow-up State
  const [scheduleStatus, setScheduleStatus] = useState('Available for Consultations');
  const [followupModalOpen, setFollowupModalOpen] = useState(false);
  const [followupForm, setFollowupForm] = useState({
    patient_id: '',
    date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    time: '10:00 AM',
    reason: 'Clinical Follow-up & Treatment Review'
  });

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  const loadDoctorData = async () => {
    try {
      setLoading(true);
      const [apptRes, patRes, rxRes, labRes, docRes] = await Promise.all([
        appointmentsApi.getAll({ all: true }),
        patientsApi.getAll(),
        prescriptionsApi.getAll(),
        labApi.getAll(),
        doctorsApi.getAll()
      ]);

      if (apptRes.success) setAppointments(apptRes.data || []);
      if (patRes.success) setPatients(patRes.data || []);
      if (rxRes.success) setPrescriptions(rxRes.data || []);
      if (labRes.success) setLabTests(labRes.data || []);

      if (docRes.success && docRes.data) {
        const currentDoc = docRes.data.find(d => d.email === user?.email || d.user_id === user?.id) || docRes.data[0];
        setDoctorProfile(currentDoc);
      }
    } catch (err) {
      console.error('Doctor data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
  }, [user]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const res = await appointmentsApi.updateStatus(appointmentId, newStatus, `Updated by Dr. ${user?.name || 'Physician'}`);
      if (res.success) {
        toast.success(`Appointment marked as ${newStatus}`);
        loadDoctorData();
      }
    } catch (err) {
      toast.error('Failed to update appointment status');
    }
  };

  const handleAddMedicineRow = () => {
    setRxForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { medicine_name: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 Days', instructions: 'After food' }]
    }));
  };

  const handleRemoveMedicineRow = (index) => {
    setRxForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleCreatePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (!rxForm.patient_id || !rxForm.diagnosis) {
      toast.warning('Please select a patient and enter a diagnosis.');
      return;
    }

    try {
      const validItems = rxForm.medicines.filter(m => m.medicine_name.trim() !== '');
      if (validItems.length === 0) {
        toast.warning('Please specify at least one medication.');
        return;
      }

      const res = await prescriptionsApi.create({
        patient_id: rxForm.patient_id,
        appointment_id: rxForm.appointment_id || null,
        doctor_id: doctorProfile?.id || 1,
        diagnosis: rxForm.diagnosis,
        instructions: rxForm.instructions,
        items: validItems
      });

      if (res.success) {
        toast.success('Digital Prescription generated successfully!');
        setCreateRxModalOpen(false);
        loadDoctorData();
        setSelectedRx(res.data);
        setRxModalOpen(true);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate prescription.');
    }
  };

  const handleCreateFollowup = async (e) => {
    e.preventDefault();
    try {
      const patient = patients.find(p => p.id === parseInt(followupForm.patient_id, 10));
      const res = await appointmentsApi.book({
        patient_id: followupForm.patient_id,
        doctor_id: doctorProfile?.id || 1,
        department_id: doctorProfile?.department_id || 1,
        appointment_date: followupForm.date,
        appointment_time: followupForm.time,
        reason: followupForm.reason,
        type: 'Follow-up Consultation',
        blood_group: patient?.blood_group || 'O+'
      });

      if (res.success) {
        toast.success('Follow-up appointment scheduled successfully!');
        setFollowupModalOpen(false);
        loadDoctorData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to schedule follow-up');
    }
  };

  const handleDeleteRx = async (rx) => {
    if (!window.confirm(`Are you sure you want to remove prescription ${rx.prescription_code} for ${rx.patientName}?`)) {
      return;
    }
    try {
      const res = await prescriptionsApi.delete(rx.id);
      if (res.success) {
        toast.success(`Prescription ${rx.prescription_code} removed successfully.`);
        setPrescriptions(prev => prev.filter(item => item.id !== rx.id));
        if (selectedRx?.id === rx.id) {
          setRxModalOpen(false);
          setSelectedRx(null);
        }
      } else {
        toast.error(res.message || 'Failed to remove prescription.');
      }
    } catch (err) {
      toast.error(err.message || 'Error removing prescription.');
    }
  };

  // Nav Items matching user's exact 6 doctor modules (accessible ONLY to Doctor and Super Admin)
  const menuItems = [
    { id: 'dashboard', label: 'Doctor Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointment Management', icon: CalendarClock, badge: appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length },
    { id: 'patients', label: 'Patient Medical Records', icon: UsersRound },
    { id: 'prescriptions', label: 'Digital Prescription', icon: Pill, badge: prescriptions.length },
    { id: 'lab_reports', label: 'Lab Reports & Diagnosis', icon: Microscope, badge: labTests.length },
    { id: 'schedule', label: 'Doctor Schedule & Follow-up', icon: Clock }
  ];

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-100/80 flex flex-col md:flex-row">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`w-72 bg-[#022c22] text-white flex flex-col h-screen shrink-0 overflow-y-auto overflow-x-hidden sidebar-scrollbar portal-sidebar ${
          sidebarOpen ? 'sidebar-open' : 'sidebar-closed'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 shrink-0 px-5 border-b border-[#044434] flex items-center justify-between bg-[#022119]">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs overflow-hidden">
              <img src="/images/logo-icon.png" alt="MedicalCare Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight font-display text-white">MedicalCare</h1>
              <p className="text-[9px] uppercase tracking-wider text-emerald-300 font-semibold">DOCTOR CLINICAL PORTAL</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 text-emerald-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Identity Card */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-[#033b20] border border-emerald-400/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-sm shrink-0">
            <Stethoscope className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-white truncate">{doctorProfile?.name || user?.name || 'Dr. Neha Kapoor'}</h3>
            <p className="text-[10px] text-amber-300 truncate">{doctorProfile?.specialty || 'Senior Consultant'}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-emerald-200 font-semibold">{scheduleStatus}</span>
            </div>
          </div>
        </div>

        {/* Menu Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-1.5">
          <div className="px-3 pb-1 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
            PORTAL NAVIGATION
          </div>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-500/20 translate-x-0.5'
                    : 'bg-[#033b20]/60 text-slate-200 hover:bg-[#033b20] hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-slate-950 font-bold' : 'text-amber-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`w-5 h-5 rounded-full font-black text-[11px] flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-[#022119] text-amber-400' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="shrink-0 p-3.5 space-y-2.5 border-t border-[#044434] bg-[#022119]/90">
          {/* Back to Public Website */}
          <button
            onClick={() => setActivePage('home')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#033b20] hover:bg-[#044434] border border-emerald-400/30 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Back to Public Website</span>
          </button>

          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-xs font-bold text-white truncate">
              {user?.name?.startsWith('Dr.') ? user.name : `Dr. ${user?.name || 'Physician'}`}
            </span>
            <button
              onClick={() => {
                logout();
                setActivePage('home');
              }}
              className="text-amber-400 hover:text-amber-300 p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 shrink-0 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-display">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">ApexCare Board of Quaternary Medical Leaders</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setRxForm({
                  patient_id: patients[0]?.id || '',
                  appointment_id: '',
                  diagnosis: '',
                  instructions: 'Take medications as directed with plenty of water.',
                  medicines: [{ medicine_name: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 Days', instructions: 'After meals' }]
                });
                setCreateRxModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#071933] text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Rx</span>
            </button>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md uppercase border bg-sky-100 text-[#071933] border-sky-200">
              DOCTOR
            </span>

            <button
              onClick={() => {
                logout();
                setActivePage('home');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-800 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs ml-1"
              title="Sign Out of Doctor Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl w-full mx-auto space-y-6">

            {/* 1. DOCTOR DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Counter Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Patients</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{appointments.length}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Queue</p>
                      <h3 className="text-2xl font-black text-amber-600 mt-1">
                        {appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Rx Issued</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{prescriptions.length}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <Pill className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lab Reviews</p>
                      <h3 className="text-2xl font-black text-purple-600 mt-1">{labTests.length}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                      <Microscope className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Live Consultation Queue Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Live Outpatient Queue & Consultation</h3>
                      <p className="text-xs text-slate-500">Real-time status updates and direct prescription generation</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className="text-xs font-bold text-[#0284c7] hover:text-[#071933] flex items-center gap-1"
                    >
                      View Full Schedule <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Token / Ref</th>
                          <th className="py-3 px-4">Patient Name & Info</th>
                          <th className="py-3 px-4">Time Slot</th>
                          <th className="py-3 px-4">Reason / Triage</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appointments.slice(0, 5).map(apt => (
                          <tr key={apt.id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-4 font-mono font-bold text-slate-700">
                              {apt.appointment_number}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">{apt.patientName}</span>
                              <span className="text-[10px] text-slate-500">MRN: {apt.patientMrn || 'N/A'} • {apt.patientGender}</span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-800">
                              {apt.appointment_time}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-slate-700">{apt.reason}</span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'confirmed' ? 'info' : 'warning'}>
                                {apt.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5">
                              {apt.status !== 'completed' ? (
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, 'completed')}
                                  className="px-2.5 py-1 rounded-lg bg-[#0284c7] hover:bg-[#0284c7] text-white font-bold text-[11px] transition-all cursor-pointer"
                                >
                                  Complete
                                </button>
                              ) : (
                                <span className="text-[11px] font-bold text-[#0284c7]">Done ✓</span>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedAppt(apt);
                                  setApptSlipModalOpen(true);
                                }}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                                title="Print Slip"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. APPOINTMENT MANAGEMENT */}
            {activeTab === 'appointments' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Doctor's Clinical Appointments</h3>
                    <p className="text-xs text-slate-500">Manage, confirm, and complete patient consultations</p>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search patient or token..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-64 focus:outline-hidden focus:border-sky-600"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Token</th>
                        <th className="py-3 px-4">Patient</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Consultation Type</th>
                        <th className="py-3 px-4">Clinical Status</th>
                        <th className="py-3 px-4 text-right">Consultation Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appointments
                        .filter(a =>
                          (a.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (a.appointment_number || '').toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(apt => (
                          <tr key={apt.id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-4 font-mono font-bold text-[#071933]">
                              {apt.appointment_number}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">{apt.patientName}</span>
                              <span className="text-[10px] text-slate-500">Phone: {apt.patientPhone || 'N/A'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-900 block">{apt.appointment_date}</span>
                              <span className="text-[10px] text-[#0284c7] font-bold">{apt.appointment_time}</span>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-700">
                              {apt.type || 'General Consultation'}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'confirmed' ? 'info' : 'warning'}>
                                {apt.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setRxForm({
                                    patient_id: apt.patient_id,
                                    appointment_id: apt.id,
                                    diagnosis: apt.reason || '',
                                    instructions: 'Take medications as scheduled.',
                                    medicines: [{ medicine_name: '', dosage: '1 Tab', frequency: 'Twice daily', duration: '5 Days', instructions: 'After food' }]
                                  });
                                  setCreateRxModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#071933] font-bold text-[11px] transition-all cursor-pointer"
                              >
                                Write Rx
                              </button>
                              {apt.status !== 'completed' && (
                                <button
                                  onClick={() => handleUpdateStatus(apt.id, 'completed')}
                                  className="px-2.5 py-1 rounded-lg bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-[11px] transition-all cursor-pointer"
                                >
                                  Mark Completed
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. PATIENT MEDICAL RECORDS */}
            {activeTab === 'patients' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Patient Electronic Medical Records (EMR)</h3>
                    <p className="text-xs text-slate-500">Access clinical background, allergy alerts, blood groups, and admission logs</p>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search MRN or Patient Name..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-64 focus:outline-hidden focus:border-sky-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patients
                    .filter(p =>
                      `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (p.mrn || '').toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(patient => (
                      <div key={patient.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#0284c7] text-white flex items-center justify-center font-bold text-sm">
                              {patient.first_name?.[0] || 'P'}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{patient.first_name} {patient.last_name}</h4>
                              <p className="text-[10px] text-slate-500 font-mono font-bold">MRN: {patient.mrn}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Blood: {patient.blood_group || 'O+'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block font-bold">Age / Gender</span>
                            <span className="font-semibold text-slate-800">{patient.age} yrs • {patient.gender}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block font-bold">Admission Status</span>
                            <span className="font-semibold text-[#0284c7] capitalize">{patient.admission_status || 'Outpatient'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] text-slate-400 uppercase block font-bold">Known Allergies</span>
                            <span className="font-semibold text-amber-800">{patient.allergies || 'None recorded'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] text-slate-400 uppercase block font-bold">Medical History</span>
                            <span className="text-slate-600 line-clamp-2">{patient.medical_history || 'No acute chronic history.'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => {
                              setRxForm({
                                patient_id: patient.id,
                                appointment_id: '',
                                diagnosis: '',
                                instructions: 'Prescribed during follow-up.',
                                medicines: [{ medicine_name: '', dosage: '1 Tab', frequency: 'Twice daily', duration: '5 Days', instructions: 'After meals' }]
                              });
                              setCreateRxModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs cursor-pointer"
                          >
                            <Pill className="w-3.5 h-3.5" />
                            Prescribe Medication
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 4. DIGITAL PRESCRIPTIONS */}
            {activeTab === 'prescriptions' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Digital E-Prescriptions Registry</h3>
                    <p className="text-xs text-slate-500">Official authenticated prescriptions with QR verification</p>
                  </div>
                  <button
                    onClick={() => {
                      setRxForm({
                        patient_id: patients[0]?.id || '',
                        appointment_id: '',
                        diagnosis: '',
                        instructions: 'Take medications as directed with plenty of water.',
                        medicines: [{ medicine_name: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 Days', instructions: 'After meals' }]
                      });
                      setCreateRxModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-300" />
                    Create Digital Rx
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Rx Code</th>
                        <th className="py-3 px-4">Patient Name</th>
                        <th className="py-3 px-4">Diagnosis</th>
                        <th className="py-3 px-4">Medications Count</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prescriptions.map(rx => (
                        <tr key={rx.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-mono font-bold text-[#071933]">
                            {rx.prescription_code}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {rx.patientName}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700 max-w-xs truncate">
                            {rx.diagnosis}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {rx.items?.length || 0} drugs
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {rx.prescribed_date}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedRx(rx);
                                  setRxModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#071933] font-bold text-xs cursor-pointer transition-colors"
                                title="View & Print Prescription Slip"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                View & Print
                              </button>
                              <button
                                onClick={() => handleDeleteRx(rx)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200/80 font-bold text-xs cursor-pointer transition-colors"
                                title="Remove Prescription"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. LAB REPORTS & DIAGNOSIS */}
            {activeTab === 'lab_reports' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Diagnostic Pathology & Imaging Reports</h3>
                    <p className="text-xs text-slate-500">Review lab findings, abnormal markers, and doctor approvals</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Test Code</th>
                        <th className="py-3 px-4">Patient Name</th>
                        <th className="py-3 px-4">Investigation Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Result Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {labTests.map(test => (
                        <tr key={test.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">
                            {test.test_code}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {test.patientName}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {test.test_name}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {test.category}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={test.status === 'completed' ? 'success' : 'warning'}>
                              {test.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedLab(test);
                                setLabModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs cursor-pointer"
                            >
                              <Microscope className="w-3.5 h-3.5" />
                              Inspect Findings
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. DOCTOR SCHEDULE & FOLLOW-UP */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Consultation Schedule & Practice Availability</h3>
                      <p className="text-xs text-slate-500">Configure daily OPD clinic slots, emergency coverage, and follow-up reviews</p>
                    </div>
                    <button
                      onClick={() => setFollowupModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#071933] text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Book Clinical Follow-up
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 space-y-2">
                      <span className="text-[10px] font-bold text-[#0284c7] uppercase tracking-wider block">Active Status</span>
                      <p className="text-base font-extrabold text-[#071933]">{scheduleStatus}</p>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setScheduleStatus('Available for Consultations')}
                          className="px-3 py-1 rounded-lg bg-[#0284c7] text-white text-xs font-bold cursor-pointer"
                        >
                          Available
                        </button>
                        <button
                          onClick={() => setScheduleStatus('In OT / Surgery')}
                          className="px-3 py-1 rounded-lg bg-amber-500 text-[#071933] text-xs font-bold cursor-pointer"
                        >
                          In Surgery
                        </button>
                        <button
                          onClick={() => setScheduleStatus('On Call / Break')}
                          className="px-3 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                        >
                          On Call
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OPD Clinic Timings</span>
                      <p className="font-bold text-slate-800 text-sm">Monday – Friday</p>
                      <p className="text-slate-600">09:00 AM – 01:00 PM (Morning OPD)</p>
                      <p className="text-slate-600">02:00 PM – 05:00 PM (Specialist Clinic)</p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consultation Fee</span>
                      <p className="font-bold text-[#071933] text-lg">₹{doctorProfile?.consultation_fee || 120}.00</p>
                      <p className="text-slate-500">Includes 7-day free post-consultation review</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* CREATE PRESCRIPTION MODAL */}
      <Modal
        isOpen={createRxModalOpen}
        onClose={() => setCreateRxModalOpen(false)}
        title="Write Digital E-Prescription"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreatePrescriptionSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Patient *</label>
              <PatientDropdown
                patients={patients}
                value={rxForm.patient_id}
                onChange={val => setRxForm(prev => ({ ...prev, patient_id: val }))}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Clinical Diagnosis *</label>
              <input
                type="text"
                placeholder="e.g. Acute Bronchitis / Stage 1 Hypertension"
                value={rxForm.diagnosis}
                onChange={e => setRxForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-sky-600"
                required
              />
            </div>
          </div>

          {/* Medicines Dynamic Rows */}
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Prescribed Medications:</span>
              <button
                type="button"
                onClick={handleAddMedicineRow}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0284c7] hover:text-[#071933] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Drug
              </button>
            </div>

            {rxForm.medicines.map((med, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 items-center">
                <div className="col-span-12 sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Medicine Name & Strength"
                    value={med.medicine_name}
                    onChange={e => {
                      const updated = [...rxForm.medicines];
                      updated[idx].medicine_name = e.target.value;
                      setRxForm(prev => ({ ...prev, medicines: updated }));
                    }}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                    required
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 1 Tab)"
                    value={med.dosage}
                    onChange={e => {
                      const updated = [...rxForm.medicines];
                      updated[idx].dosage = e.target.value;
                      setRxForm(prev => ({ ...prev, medicines: updated }));
                    }}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Frequency"
                    value={med.frequency}
                    onChange={e => {
                      const updated = [...rxForm.medicines];
                      updated[idx].frequency = e.target.value;
                      setRxForm(prev => ({ ...prev, medicines: updated }));
                    }}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Duration"
                    value={med.duration}
                    onChange={e => {
                      const updated = [...rxForm.medicines];
                      updated[idx].duration = e.target.value;
                      setRxForm(prev => ({ ...prev, medicines: updated }));
                    }}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                </div>
                <div className="col-span-6 sm:col-span-2 flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Instructions"
                    value={med.instructions}
                    onChange={e => {
                      const updated = [...rxForm.medicines];
                      updated[idx].instructions = e.target.value;
                      setRxForm(prev => ({ ...prev, medicines: updated }));
                    }}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                  {rxForm.medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicineRow(idx)}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Doctor Advice / Diet Precautions</label>
            <textarea
              rows={2}
              value={rxForm.instructions}
              onChange={e => setRxForm(prev => ({ ...prev, instructions: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-sky-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCreateRxModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold shadow-xs cursor-pointer"
            >
              Generate Digital Prescription
            </button>
          </div>
        </form>
      </Modal>

      {/* FOLLOW UP MODAL */}
      <Modal
        isOpen={followupModalOpen}
        onClose={() => setFollowupModalOpen(false)}
        title="Schedule Clinical Follow-up"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateFollowup} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Patient *</label>
            <PatientDropdown
              patients={patients}
              value={followupForm.patient_id}
              onChange={val => setFollowupForm(prev => ({ ...prev, patient_id: val }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={followupForm.date}
                onChange={e => setFollowupForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Time Slot</label>
              <input
                type="text"
                value={followupForm.time}
                onChange={e => setFollowupForm(prev => ({ ...prev, time: e.target.value }))}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Reason for Follow-up</label>
            <input
              type="text"
              value={followupForm.reason}
              onChange={e => setFollowupForm(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full p-2 rounded-xl border border-slate-200 text-xs"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setFollowupModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold"
            >
              Confirm Follow-up
            </button>
          </div>
        </form>
      </Modal>

      {/* Slip and Report Print Modals */}
      <PrescriptionSlipModal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        prescription={selectedRx}
      />

      <LabReportModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        test={selectedLab}
      />

      <AppointmentSlipModal
        isOpen={apptSlipModalOpen}
        onClose={() => setApptSlipModalOpen(false)}
        appointment={selectedAppt}
      />
    </div>
  );
}
