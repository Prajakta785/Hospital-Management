import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  patientsApi,
  appointmentsApi,
  bedsApi,
  pharmacyApi,
  billingApi,
  labApi,
  prescriptionsApi,
  doctorsApi,
  departmentsApi,
  staffApi,
  notificationsApi
} from '../../services/api.js';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { AppointmentSlipModal } from '../../components/common/AppointmentSlipModal.jsx';
import { ReceiptModal } from '../../components/common/ReceiptModal.jsx';
import { LabReportModal } from '../../components/common/LabReportModal.jsx';
import { QRCodeToken } from '../../components/common/QRCodeToken.jsx';
import {
  LayoutDashboard,
  UserPlus,
  Ticket,
  HeartPulse,
  ReceiptIndianRupee,
  CalendarCheck,
  Search,
  Plus,
  Clock,
  Printer,
  BedDouble,
  Pill,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  LogOut,
  ArrowLeft,
  User,
  Activity,
  Send,
  Calendar,
  Microscope,
  CreditCard,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  Eye,
  RefreshCw,
  Users,
  Building,
  Check,
  FileText
} from 'lucide-react';

export function StaffPortal({ setActivePage }) {
  const { user, logout, switchDemoRole } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Real-time Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Core Data
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [beds, setBeds] = useState([]);
  const [pharmacyItems, setPharmacyItems] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [attendance, setAttendance] = useState([]);

  // Sub-tabs for Module 5 (Lab, Pharmacy & Billing Management)
  const [operationsSubTab, setOperationsSubTab] = useState('lab'); // 'lab' | 'pharmacy' | 'billing'

  // Modals & Printing State
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [apptSlipModalOpen, setApptSlipModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [selectedPatientForId, setSelectedPatientForId] = useState(null);
  const [digitalIdModalOpen, setDigitalIdModalOpen] = useState(false);

  // Patient Registration Modal State
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [patientForm, setPatientForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    age: 32,
    gender: 'Male',
    blood_group: 'O+',
    address: '740 Health Sciences Blvd, Chicago',
    allergies: 'None',
    medical_history: 'New registered patient profile',
    admission_status: 'outpatient',
    emergency_contact_name: 'Family Member',
    emergency_contact_phone: '+1 555-019-3342'
  });

  // Walk-in Token Booking Modal State
  const [walkinModalOpen, setWalkinModalOpen] = useState(false);
  const [tokenForm, setTokenForm] = useState({
    patient_id: '',
    department_id: '',
    doctor_id: '',
    appointment_time: '11:00 AM',
    reason: 'Routine OPD Consultation & Vital Triage'
  });

  // Nurse Vitals Check-in Modal State
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState(null);
  const [vitalsForm, setVitalsForm] = useState({
    bp: '120/80 mmHg',
    pulse: '74 bpm',
    temp: '98.6 °F',
    spo2: '99%',
    glucose: '102 mg/dL',
    resp_rate: '16 /min',
    iv_status: 'Normal Saline Infusion (50ml/hr)',
    nursing_notes: 'Patient alert and oriented. Vitals stable within physiological baseline.'
  });

  // Front Counter Payment Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvoiceToPay, setSelectedInvoiceToPay] = useState(null);
  const [payMethod, setPayMethod] = useState('Cash');

  // Pharmacy Dispense Modal State
  const [dispenseModalOpen, setDispenseModalOpen] = useState(false);
  const [selectedItemToDispense, setSelectedItemToDispense] = useState(null);
  const [dispenseQty, setDispenseQty] = useState(1);
  const [dispensePatientId, setDispensePatientId] = useState('');

  // Bed Admission Modal State
  const [admitModalOpen, setAdmitModalOpen] = useState(false);
  const [selectedBedToAdmit, setSelectedBedToAdmit] = useState(null);
  const [admitPatientId, setAdmitPatientId] = useState('');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [patientFilter, setPatientFilter] = useState('all');
  const [tokenStatusFilter, setTokenStatusFilter] = useState('all');
  const [wardFilter, setWardFilter] = useState('all');

  // Duty Handover Notes
  const [handoverNotes, setHandoverNotes] = useState([
    {
      id: 1,
      author: 'Sarah Jenkins, RN (Morning Shift)',
      time: '08:15 AM',
      note: 'ICU Bed 2 cardiac patient scheduled for 2D-Echo at 11:30 AM. NPO maintained.'
    },
    {
      id: 2,
      author: 'James Cooper (Triage Front)',
      time: '09:40 AM',
      note: 'Emergency trauma bay restocked with IV cannulas & normal saline bolus bags.'
    }
  ]);
  const [newHandoverNote, setNewHandoverNote] = useState('');

  // Load All System Data
  const loadStaffData = async () => {
    try {
      setLoading(true);
      const [
        patRes,
        aptRes,
        bedRes,
        pharmRes,
        billRes,
        labRes,
        rxRes,
        docRes,
        deptRes,
        staffRes,
        attRes
      ] = await Promise.all([
        patientsApi.getAll(),
        appointmentsApi.getAll(),
        bedsApi.getAll(),
        pharmacyApi.getAll(),
        billingApi.getAll(),
        labApi.getAll(),
        prescriptionsApi.getAll(),
        doctorsApi.getAll(),
        departmentsApi.getAll(),
        staffApi.getAll(),
        staffApi.getAttendance()
      ]);

      if (patRes?.success) setPatients(patRes.data || []);
      if (aptRes?.success) setAppointments(aptRes.data || []);
      if (bedRes?.success) setBeds(bedRes.data || []);
      if (pharmRes?.success) setPharmacyItems(pharmRes.data || []);
      if (billRes?.success) setInvoices(billRes.data || []);
      if (labRes?.success) setLabTests(labRes.data || []);
      if (rxRes?.success) setPrescriptions(rxRes.data || []);
      if (docRes?.success) setDoctors(docRes.data || []);
      if (deptRes?.success) setDepartments(deptRes.data || []);
      if (staffRes?.success) setStaffList(staffRes.data || []);
      if (attRes?.success) setAttendance(attRes.data || []);
    } catch (err) {
      console.error('Failed to load staff panel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, [user]);

  // Set default doctor and department when modals open
  useEffect(() => {
    if (doctors.length > 0 && !tokenForm.doctor_id) {
      setTokenForm(prev => ({
        ...prev,
        doctor_id: doctors[0].id,
        department_id: doctors[0].department_id || (departments[0]?.id || '')
      }));
    }
    if (patients.length > 0 && !tokenForm.patient_id) {
      setTokenForm(prev => ({ ...prev, patient_id: patients[0].id }));
    }
  }, [doctors, departments, patients]);

  // Handlers for Module 2: Patient Registration
  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const mrn = `MRN-${year}-${randomSuffix}`;

      const res = await patientsApi.create({
        ...patientForm,
        mrn
      });

      if (res.success) {
        toast.success(`Patient ${patientForm.first_name} ${patientForm.last_name} registered! MRN: ${mrn}`);
        setRegisterModalOpen(false);
        setPatientForm({
          first_name: '',
          last_name: '',
          phone: '',
          email: '',
          age: 30,
          gender: 'Male',
          blood_group: 'O+',
          address: '740 Health Sciences Blvd, Chicago',
          allergies: 'None',
          medical_history: 'New registered patient profile',
          admission_status: 'outpatient',
          emergency_contact_name: 'Family Member',
          emergency_contact_phone: '+1 555-019-3342'
        });
        await loadStaffData();

        // Send simulated WhatsApp Welcome Token
        await notificationsApi.send({
          patient_id: res.data?.id,
          phone: patientForm.phone,
          type: 'whatsapp',
          title: 'ApexCare Registration Welcome',
          message: `Welcome to ApexCare Hospital, ${patientForm.first_name}! Your permanent Medical Record Number is ${mrn}.`
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to register patient.');
    }
  };

  // Handlers for Module 3: Appointment & Token Management
  const handleIssueWalkinToken = async (e) => {
    e.preventDefault();
    if (!tokenForm.patient_id || !tokenForm.doctor_id) {
      toast.warning('Please select both patient and doctor.');
      return;
    }

    try {
      const tokenNumber = `TKN-${Math.floor(100 + Math.random() * 900)}`;
      const selectedDoc = doctors.find(d => String(d.id) === String(tokenForm.doctor_id));
      const selectedPat = patients.find(p => String(p.id) === String(tokenForm.patient_id));
      const todayStr = new Date().toISOString().split('T')[0];

      const res = await appointmentsApi.book({
        patient_id: tokenForm.patient_id,
        doctor_id: tokenForm.doctor_id,
        department_id: tokenForm.department_id || selectedDoc?.department_id || 1,
        appointment_date: todayStr,
        appointment_time: tokenForm.appointment_time,
        reason: tokenForm.reason,
        token_number: tokenNumber,
        status: 'confirmed'
      });

      if (res.success) {
        toast.success(`Queue Token ${tokenNumber} issued for ${selectedPat?.first_name || 'Patient'}!`);
        setWalkinModalOpen(false);
        await loadStaffData();
        setSelectedAppt(res.data);
        setApptSlipModalOpen(true);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to issue walk-in token.');
    }
  };

  const handleCheckInPatient = async (appointmentId) => {
    try {
      const res = await appointmentsApi.updateStatus(appointmentId, 'confirmed', 'Checked in at front desk by staff');
      if (res.success) {
        toast.success('Patient checked in! Moved to physician consultation queue.');
        loadStaffData();
      }
    } catch (err) {
      toast.error('Check-in error');
    }
  };

  const handleCallInPatient = async (appointmentId) => {
    try {
      const res = await appointmentsApi.updateStatus(appointmentId, 'in_consultation', 'Called into doctor chamber by staff nurse');
      if (res.success) {
        toast.success('Patient called into consultation chamber!');
        loadStaffData();
      }
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  // Handlers for Module 4: Nurse & Patient Care
  const handleSaveVitals = async (e) => {
    e.preventDefault();
    if (!selectedPatientForVitals) return;
    try {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const vitalsSummary = `[Vitals @ ${timestamp}] BP: ${vitalsForm.bp} | HR: ${vitalsForm.pulse} | Temp: ${vitalsForm.temp} | SpO2: ${vitalsForm.spo2} | Sugar: ${vitalsForm.glucose} | RR: ${vitalsForm.resp_rate} | IV: ${vitalsForm.iv_status} | Note: ${vitalsForm.nursing_notes}`;
      const updatedHistory = `${selectedPatientForVitals.medical_history || ''}\n${vitalsSummary}`;

      await patientsApi.update(selectedPatientForVitals.id, {
        medical_history: updatedHistory
      });

      toast.success(`Nursing vitals recorded for ${selectedPatientForVitals.first_name} ${selectedPatientForVitals.last_name}!`);
      setVitalsModalOpen(false);
      loadStaffData();
    } catch (err) {
      toast.error('Failed to log vitals');
    }
  };

  const handleAdmitToBed = async (e) => {
    e.preventDefault();
    if (!selectedBedToAdmit || !admitPatientId) return;
    try {
      const patient = patients.find(p => String(p.id) === String(admitPatientId));
      await bedsApi.admit({
        bed_id: selectedBedToAdmit.id,
        patient_id: admitPatientId,
        patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Admitted Inpatient'
      });
      await patientsApi.update(admitPatientId, { admission_status: 'admitted' });
      toast.success(`Patient admitted to bed ${selectedBedToAdmit.bed_number}!`);
      setAdmitModalOpen(false);
      loadStaffData();
    } catch (err) {
      toast.error(err.message || 'Failed to admit patient to bed');
    }
  };

  const handleDischargeBed = async (bed) => {
    if (!window.confirm(`Discharge patient from Bed ${bed.bed_number} and mark for clinical cleaning?`)) return;
    try {
      await bedsApi.discharge({ bed_id: bed.id });
      if (bed.patient_id) {
        await patientsApi.update(bed.patient_id, { admission_status: 'outpatient' });
      }
      toast.success(`Bed ${bed.bed_number} cleared and scheduled for sanitation.`);
      loadStaffData();
    } catch (err) {
      toast.error('Discharge failed');
    }
  };

  // Handlers for Module 5: Lab, Pharmacy & Billing Management
  const handleCollectLabSample = async (testId) => {
    try {
      const res = await labApi.authorizeResults(testId, {
        status: 'processing',
        results: 'Specimen collected by staff nurse. Transferred to central diagnostic pathology lab for automated analysis.'
      });
      if (res.success) {
        toast.success('Sample collected! Specimen accessioned to pathology analyzer.');
        loadStaffData();
      }
    } catch (err) {
      toast.error('Failed to update lab test');
    }
  };

  const handleDispenseMedicine = async (e) => {
    e.preventDefault();
    if (!selectedItemToDispense) return;
    try {
      const res = await pharmacyApi.dispense(selectedItemToDispense.id, parseInt(dispenseQty, 10), dispensePatientId || 1);
      if (res.success) {
        toast.success(`Dispensed ${dispenseQty} unit(s) of ${selectedItemToDispense.name} from hospital pharmacy.`);
        setDispenseModalOpen(false);
        loadStaffData();
      }
    } catch (err) {
      toast.error(err.message || 'Dispensing failed');
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceToPay) return;
    try {
      const res = await billingApi.pay(selectedInvoiceToPay.id, {
        payment_method: payMethod,
        transaction_ref: `CTR-${Math.floor(100000 + Math.random() * 900000)}`
      });
      if (res.success) {
        toast.success('Payment received at billing desk! Official GST receipt generated.');
        setPayModalOpen(false);
        loadStaffData();
        setSelectedReceipt(res.data);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      toast.error(err.message || 'Payment processing failed');
    }
  };

  // Handlers for Module 6: Staff Attendance & Duty Management
  const handlePunchAttendance = async (type) => {
    try {
      const staffMember = staffList[0] || { id: 1, name: user?.name || 'Sarah Jenkins, RN' };
      const res = await staffApi.punch({
        staff_id: staffMember.id,
        staff_name: staffMember.name,
        type
      });
      if (res.success) {
        toast.success(res.message);
        const attRes = await staffApi.getAttendance();
        if (attRes.success) setAttendance(attRes.data);
      }
    } catch (err) {
      toast.error('Failed to record punch');
    }
  };

  const handleAddHandoverNote = (e) => {
    e.preventDefault();
    if (!newHandoverNote.trim()) return;
    const newEntry = {
      id: Date.now(),
      author: `${user?.name || 'Sarah Jenkins, RN'} (${user?.role || 'Staff'})`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: newHandoverNote.trim()
    };
    setHandoverNotes(prev => [newEntry, ...prev]);
    setNewHandoverNote('');
    toast.success('Clinical handover note posted to shift log!');
  };

  // Exactly the 6 modules requested by the user
  const menuItems = [
    { id: 'dashboard', label: 'Staff Dashboard', icon: LayoutDashboard },
    { id: 'registration', label: 'Patient Registration', icon: UserPlus, badge: patients.length },
    { id: 'tokens', label: 'Appointment & Token Management', icon: Ticket, badge: appointments.filter(a => a.status === 'pending').length },
    { id: 'nursing', label: 'Nurse & Patient Care', icon: HeartPulse, badge: beds.filter(b => b.status === 'occupied').length },
    { id: 'lab_pharmacy_billing', label: 'Lab, Pharmacy & Billing Management', icon: ReceiptIndianRupee, badge: invoices.filter(i => i.status === 'unpaid').length },
    { id: 'attendance', label: 'Staff Attendance & Duty Management', icon: CalendarCheck }
  ];

  // Filters
  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      (p.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.last_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.mrn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone || '').includes(searchQuery);
    if (patientFilter === 'all') return matchesSearch;
    if (patientFilter === 'admitted') return matchesSearch && p.admission_status === 'admitted';
    if (patientFilter === 'outpatient') return matchesSearch && p.admission_status !== 'admitted';
    return matchesSearch;
  });

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch =
      (a.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.appointment_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (tokenStatusFilter === 'all') return matchesSearch;
    return matchesSearch && a.status === tokenStatusFilter;
  });

  const filteredBeds = beds.filter(b => {
    if (wardFilter === 'all') return true;
    return (b.ward_name || '').toLowerCase().includes(wardFilter.toLowerCase());
  });

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-100/90 flex flex-col md:flex-row font-sans">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Navigation Sidebar */}
      <aside
        className={`w-72 bg-[#022c22] text-white flex flex-col h-screen shrink-0 overflow-y-auto overflow-x-hidden sidebar-scrollbar border-r border-[#044434] portal-sidebar ${
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
              <p className="text-[9px] uppercase tracking-wider text-emerald-300 font-semibold">Staff & Operations Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 text-emerald-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Menu Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-1.5">
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
                  setSearchQuery('');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all duration-200 cursor-pointer text-left ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-500/20 translate-x-0.5'
                    : 'bg-[#033b20]/60 text-slate-200 hover:bg-[#033b20] hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-slate-950 font-bold' : 'text-amber-400'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`w-5 h-5 rounded-full font-black text-[10px] flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-[#022119] text-amber-400'
                      : 'bg-amber-400 text-slate-950'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer - Back to Public Website & Staff Identity Card */}
        <div className="shrink-0 p-3.5 space-y-2.5 border-t border-[#044434] bg-[#022119]/90">
          {/* Back to Public Website */}
          <button
            onClick={() => setActivePage('home')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#033b20] hover:bg-[#044434] border border-emerald-400/30 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Back to Public Website</span>
          </button>

          {/* Sarah Jenkins, RN / Staff (Desk & Billing) / Morning Shift • On Duty */}
          <div className="p-3 rounded-2xl bg-[#033b20] border border-emerald-400/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-xs shrink-0">
                <HeartPulse className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-white truncate">{user?.name || 'Sarah Jenkins, RN'}</h3>
                <p className="text-[10px] text-amber-300 truncate">Staff (Desk & Billing)</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] text-emerald-200 font-semibold">Morning Shift • On Duty</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                setActivePage('home');
              }}
              className="text-amber-400 hover:text-amber-300 p-1.5 rounded-lg hover:bg-white/10 transition-all hover:scale-110 active:scale-95 shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight font-display">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h2>
              <p className="text-[10px] text-slate-500 hidden sm:block">ApexCare Hospital Staff Panel • Nursing & Front Desk Operations</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setRegisterModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#071933] text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Intake Patient</span>
            </button>
            <button
              onClick={() => setWalkinModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5 text-amber-300" />
              <span>Issue Token</span>
            </button>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-slate-950 border border-emerald-200 uppercase">
              STAFF
            </span>
            <button
              onClick={() => {
                logout();
                setActivePage('home');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-800 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs ml-1"
              title="Sign Out of Staff Desk"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <div className="max-w-7xl w-full mx-auto space-y-6">

            {/* ========================================================= */}
            {/* 1. STAFF DASHBOARD                                        */}
            {/* ========================================================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Real-time Shift & Duty Punch Clock Banner */}
                <div className="bg-[#022c22] text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm border border-[#044434]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex flex-col items-center justify-center text-center shrink-0">
                      <Clock className="w-5 h-5 text-amber-400" />
                      <span className="text-[9px] font-mono text-emerald-200 font-bold mt-0.5">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-300">Live Shift Clock</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                          Active Duty
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                        Morning Shift (07:00 AM – 03:00 PM) • Registered Nurse Station
                      </h3>
                      <p className="text-[11px] text-sky-200/80">
                        Today: {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handlePunchAttendance('in')}
                      className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#071933] font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Punch In (Start Shift)
                    </button>
                    <button
                      onClick={() => handlePunchAttendance('out')}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#071933] font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <LogOut className="w-4 h-4" />
                      Punch Out (End Shift)
                    </button>
                  </div>
                </div>

                {/* 6 Key Performance Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  <div
                    onClick={() => setActiveTab('registration')}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Patients</p>
                      <div className="w-7 h-7 rounded-lg bg-sky-50 text-[#0284c7] flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mt-1">{patients.length}</h3>
                    <p className="text-[10px] text-[#0284c7] font-semibold mt-1">Total in Registry</p>
                  </div>

                  <div
                    onClick={() => setActiveTab('tokens')}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Tokens</p>
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                        <Ticket className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-amber-600 mt-1">
                      {appointments.filter(a => a.status === 'pending').length}
                    </h3>
                    <p className="text-[10px] text-amber-800 font-semibold mt-1">Waiting Check-in</p>
                  </div>

                  <div
                    onClick={() => setActiveTab('nursing')}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Beds</p>
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                        <BedDouble className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-purple-700 mt-1">
                      {beds.filter(b => b.status === 'occupied').length} / {beds.length || 12}
                    </h3>
                    <p className="text-[10px] text-purple-800 font-semibold mt-1">
                      {beds.length > 0 ? Math.round((beds.filter(b => b.status === 'occupied').length / beds.length) * 100) : 0}% Occupancy
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setActiveTab('lab_pharmacy_billing');
                      setOperationsSubTab('billing');
                    }}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Unpaid Bills</p>
                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                        <ReceiptIndianRupee className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-rose-600 mt-1">
                      {invoices.filter(i => i.status === 'unpaid').length}
                    </h3>
                    <p className="text-[10px] text-rose-700 font-semibold mt-1">Due at Counter</p>
                  </div>

                  <div
                    onClick={() => {
                      setActiveTab('lab_pharmacy_billing');
                      setOperationsSubTab('lab');
                    }}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Lab Orders</p>
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                        <Microscope className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-blue-700 mt-1">{labTests.length}</h3>
                    <p className="text-[10px] text-blue-800 font-semibold mt-1">Diagnostic Tests</p>
                  </div>

                  <div
                    onClick={() => {
                      setActiveTab('lab_pharmacy_billing');
                      setOperationsSubTab('pharmacy');
                    }}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Pharmacy</p>
                      <div className="w-7 h-7 rounded-lg bg-sky-50 text-[#0284c7] flex items-center justify-center">
                        <Pill className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-[#0284c7] mt-1">{pharmacyItems.length}</h3>
                    <p className="text-[10px] text-[#0284c7] font-semibold mt-1">Medicines Stock</p>
                  </div>
                </div>

                {/* Quick Action Navigation Grid */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#0284c7]" />
                    Quick Operational Shortcuts
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    <button
                      onClick={() => setRegisterModalOpen(true)}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-left transition-all cursor-pointer group"
                    >
                      <UserPlus className="w-4 h-4 text-[#0284c7] mb-1 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-slate-800">Intake Patient</p>
                      <p className="text-[10px] text-slate-500">Register new MRN</p>
                    </button>

                    <button
                      onClick={() => setWalkinModalOpen(true)}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-all cursor-pointer group"
                    >
                      <Ticket className="w-4 h-4 text-amber-700 mb-1 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-slate-800">Issue Token</p>
                      <p className="text-[10px] text-slate-500">Walk-in OPD slot</p>
                    </button>

                    <button
                      onClick={() => {
                        const pat = patients[0];
                        if (pat) {
                          setSelectedPatientForVitals(pat);
                          setVitalsModalOpen(true);
                        } else {
                          toast.info('No patients available');
                        }
                      }}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-left transition-all cursor-pointer group"
                    >
                      <HeartPulse className="w-4 h-4 text-rose-700 mb-1 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-slate-800">Log Vitals</p>
                      <p className="text-[10px] text-slate-500">Chart BP & Temp</p>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('lab_pharmacy_billing');
                        setOperationsSubTab('lab');
                      }}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer group"
                    >
                      <Microscope className="w-4 h-4 text-blue-700 mb-1 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-slate-800">Lab Orders</p>
                      <p className="text-[10px] text-slate-500">Sample collection</p>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('lab_pharmacy_billing');
                        setOperationsSubTab('pharmacy');
                      }}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-left transition-all cursor-pointer group"
                    >
                      <Pill className="w-4 h-4 text-[#0284c7] mb-1 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-slate-800">Dispense Drugs</p>
                      <p className="text-[10px] text-slate-500">Pharmacy stock</p>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('lab_pharmacy_billing');
                        setOperationsSubTab('billing');
                      }}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-all cursor-pointer group"
                    >
                      <ReceiptIndianRupee className="w-4 h-4 text-purple-700 mb-1 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-slate-800">Billing Desk</p>
                      <p className="text-[10px] text-slate-500">Cash & GST bills</p>
                    </button>
                  </div>
                </div>

                {/* 2 Live Split Panels: Token Queue & Inpatient Vitals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Panel A: Live Token Queue Flow */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Today's Token Queue</h4>
                        <p className="text-[11px] text-slate-500">Patient arrival flow and triage check-in</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('tokens')}
                        className="text-xs font-bold text-[#0284c7] hover:text-[#071933] cursor-pointer"
                      >
                        View Full Queue →
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {appointments.slice(0, 4).map(apt => (
                        <div key={apt.id} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="px-2 py-1 rounded-md bg-sky-50 text-[#071933] font-mono font-bold text-xs shrink-0">
                              {apt.appointment_number}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{apt.patientName}</p>
                              <p className="text-[10px] text-slate-500 truncate">{apt.doctorName} • {apt.appointment_time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {apt.status === 'pending' ? (
                              <button
                                onClick={() => handleCheckInPatient(apt.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-[11px] cursor-pointer"
                              >
                                Check In
                              </button>
                            ) : (
                              <Badge variant={apt.status === 'completed' ? 'success' : 'info'}>
                                {apt.status}
                              </Badge>
                            )}
                            <button
                              onClick={() => {
                                setSelectedAppt(apt);
                                setApptSlipModalOpen(true);
                              }}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                              title="Print Token Slip"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Panel B: Inpatient Bed Monitoring */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Inpatient Ward Rounds</h4>
                        <p className="text-[11px] text-slate-500">Active ward occupants & nursing vitals check</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('nursing')}
                        className="text-xs font-bold text-[#0284c7] hover:text-[#071933] cursor-pointer"
                      >
                        Ward Bed Map →
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {beds.filter(b => b.status === 'occupied').slice(0, 4).map(bed => (
                        <div key={bed.id} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-200">
                              {bed.bed_number}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {bed.patient_name || 'Arthur Pendelton'}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">{bed.ward_name} • Rate: ₹{bed.daily_rate}/day</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const found = patients.find(p => p.id === bed.patient_id) || patients[0];
                              setSelectedPatientForVitals(found);
                              setVitalsModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#071933] font-bold text-[11px] shrink-0 cursor-pointer"
                          >
                            Chart Vitals
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 2. PATIENT REGISTRATION                                   */}
            {/* ========================================================= */}
            {activeTab === 'registration' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Patient Registration & Master Health Directory</h3>
                    <p className="text-xs text-slate-500">Fast digital patient intake, automatic MRN assignment, and digital health records</p>
                  </div>
                  <button
                    onClick={() => setRegisterModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-300" />
                    Register New Patient
                  </button>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search patient by name, MRN (e.g. MRN-2026), or phone..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                    />
                  </div>
                  <div className="flex gap-1.5">
                    {['all', 'outpatient', 'admitted'].map(filt => (
                      <button
                        key={filt}
                        onClick={() => setPatientFilter(filt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                          patientFilter === filt
                            ? 'bg-[#0284c7] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {filt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patients Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">MRN</th>
                        <th className="py-3 px-4">Patient Name</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Age / Gender</th>
                        <th className="py-3 px-4">Blood Group</th>
                        <th className="py-3 px-4">Allergies</th>
                        <th className="py-3 px-4">Admission Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPatients.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#071933]">{p.mrn}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{p.first_name} {p.last_name}</span>
                            <span className="text-[10px] text-slate-400">{p.email || 'No email provided'}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-mono">{p.phone}</td>
                          <td className="py-3 px-4 font-medium text-slate-700">{p.age} yrs • {p.gender}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px]">
                              {p.blood_group || 'O+'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 truncate max-w-xs">{p.allergies || 'None'}</td>
                          <td className="py-3 px-4">
                            <Badge variant={p.admission_status === 'admitted' ? 'danger' : 'success'}>
                              {p.admission_status || 'Outpatient'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              onClick={() => {
                                setSelectedPatientForVitals(p);
                                setVitalsModalOpen(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#071933] font-bold text-[11px] cursor-pointer"
                              title="Chart Vitals"
                            >
                              Vitals
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPatientForId(p);
                                setDigitalIdModalOpen(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                              title="View Digital Health ID Card"
                            >
                              ID Card
                            </button>
                            <button
                              onClick={() => {
                                setTokenForm(prev => ({ ...prev, patient_id: p.id }));
                                setWalkinModalOpen(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] cursor-pointer"
                              title="Book Appointment Token"
                            >
                              Token
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 3. APPOINTMENT & TOKEN MANAGEMENT                         */}
            {/* ========================================================= */}
            {activeTab === 'tokens' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Appointment & Token Management Counter</h3>
                    <p className="text-xs text-slate-500">Front desk live queue management, digital OPD token generation, and patient check-in</p>
                  </div>
                  <button
                    onClick={() => setWalkinModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-300" />
                    Issue Walk-in Token
                  </button>
                </div>

                {/* Queue Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-amber-50/60 border border-amber-200/80 p-3.5 rounded-xl">
                    <p className="text-[10px] font-bold text-amber-800 uppercase">Waiting in Queue</p>
                    <h4 className="text-2xl font-black text-amber-900 mt-0.5">
                      {appointments.filter(a => a.status === 'pending').length}
                    </h4>
                  </div>
                  <div className="bg-blue-50/60 border border-blue-200/80 p-3.5 rounded-xl">
                    <p className="text-[10px] font-bold text-blue-800 uppercase">In Consultation</p>
                    <h4 className="text-2xl font-black text-blue-900 mt-0.5">
                      {appointments.filter(a => a.status === 'in_consultation' || a.status === 'confirmed').length}
                    </h4>
                  </div>
                  <div className="bg-sky-50/60 border border-sky-200/80 p-3.5 rounded-xl">
                    <p className="text-[10px] font-bold text-[#0284c7] uppercase">Completed Today</p>
                    <h4 className="text-2xl font-black text-[#071933] mt-0.5">
                      {appointments.filter(a => a.status === 'completed').length}
                    </h4>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-600 uppercase">Avg Wait Time</p>
                    <h4 className="text-2xl font-black text-slate-900 mt-0.5">12 mins</h4>
                  </div>
                </div>

                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search tokens by patient, token #, or doctor..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {['all', 'pending', 'confirmed', 'in_consultation', 'completed'].map(st => (
                      <button
                        key={st}
                        onClick={() => setTokenStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                          tokenStatusFilter === st
                            ? 'bg-[#0284c7] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Queue Token Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Token QR</th>
                        <th className="py-3 px-4">Patient Name</th>
                        <th className="py-3 px-4">Assigned Doctor</th>
                        <th className="py-3 px-4">Time Slot</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Queue Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAppointments.map(apt => (
                        <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#071933] flex items-center gap-2">
                            <QRCodeToken value={apt.appointment_number} size={32} label="" />
                            <span>{apt.appointment_number}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{apt.patientName}</span>
                            <span className="text-[10px] text-slate-500">Phone: {apt.patientPhone || 'N/A'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900 block">{apt.doctorName}</span>
                            <span className="text-[10px] text-slate-500">{apt.departmentName}</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-[#071933] font-mono">
                            {apt.appointment_time}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'confirmed' ? 'info' : apt.status === 'in_consultation' ? 'purple' : 'warning'}>
                              {apt.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            {apt.status === 'pending' && (
                              <button
                                onClick={() => handleCheckInPatient(apt.id)}
                                className="px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs cursor-pointer"
                              >
                                Check In
                              </button>
                            )}
                            {apt.status === 'confirmed' && (
                              <button
                                onClick={() => handleCallInPatient(apt.id)}
                                className="px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs cursor-pointer"
                              >
                                Call Next
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedAppt(apt);
                                setApptSlipModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Slip
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 4. NURSE & PATIENT CARE                                   */}
            {/* ========================================================= */}
            {activeTab === 'nursing' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Nurse & Patient Care Ward Monitor</h3>
                    <p className="text-xs text-slate-500">Monitor active bed occupancies, hourly vital charting, IV fluid management, and patient care</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const pat = patients[0];
                        if (pat) {
                          setSelectedPatientForVitals(pat);
                          setVitalsModalOpen(true);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <HeartPulse className="w-3.5 h-3.5 text-rose-300" />
                      Record Vitals
                    </button>
                  </div>
                </div>

                {/* Ward Filter Buttons */}
                <div className="flex gap-1.5 flex-wrap">
                  {['all', 'ICU', 'General Ward', 'Semi-Private'].map(w => (
                    <button
                      key={w}
                      onClick={() => setWardFilter(w)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        wardFilter === w
                          ? 'bg-[#0284c7] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {w === 'all' ? 'All Wards' : w}
                    </button>
                  ))}
                </div>

                {/* Bed Map Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredBeds.map(bed => (
                    <div
                      key={bed.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        bed.status === 'occupied'
                          ? 'bg-rose-50/30 border-rose-200 shadow-xs'
                          : 'bg-sky-50/30 border-sky-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-black text-sm text-slate-900">{bed.bed_number}</span>
                        <Badge variant={bed.status === 'occupied' ? 'danger' : 'success'}>
                          {bed.status}
                        </Badge>
                      </div>
                      <p className="text-xs font-bold text-slate-800">{bed.ward_name}</p>
                      <p className="text-[10px] text-slate-500 mb-2">Rate: ₹{bed.daily_rate}/day</p>

                      {bed.status === 'occupied' ? (
                        <div className="space-y-2 pt-2 border-t border-rose-100">
                          <div className="text-xs">
                            <span className="text-[10px] text-slate-500 font-semibold block">Current Patient:</span>
                            <span className="font-bold text-slate-900">{bed.patient_name || 'Arthur Pendelton'}</span>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                const found = patients.find(p => p.id === bed.patient_id) || patients[0];
                                setSelectedPatientForVitals(found);
                                setVitalsModalOpen(true);
                              }}
                              className="flex-1 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-[11px] cursor-pointer text-center"
                            >
                              Chart Vitals
                            </button>
                            <button
                              onClick={() => handleDischargeBed(bed)}
                              className="px-2 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] cursor-pointer"
                              title="Clear Bed"
                            >
                              Discharge
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-sky-100">
                          <button
                            onClick={() => {
                              setSelectedBedToAdmit(bed);
                              setAdmitModalOpen(true);
                            }}
                            className="w-full py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0284c7] text-white font-bold text-[11px] cursor-pointer"
                          >
                            Admit Patient
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 5. LAB, PHARMACY & BILLING MANAGEMENT                     */}
            {/* ========================================================= */}
            {activeTab === 'lab_pharmacy_billing' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Lab, Pharmacy & Billing Management</h3>
                    <p className="text-xs text-slate-500">Universal support services desk: pathology diagnostics, medication dispensing, and front cashier billing</p>
                  </div>
                </div>

                {/* 3-Way Sub-Navigation Tabs */}
                <div className="flex border-b border-slate-200 gap-2">
                  <button
                    onClick={() => setOperationsSubTab('lab')}
                    className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                      operationsSubTab === 'lab'
                        ? 'border-[#1e3a5f] text-[#071933]'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Microscope className="w-4 h-4 text-blue-600" />
                    <span>Laboratory Diagnostics ({labTests.length})</span>
                  </button>

                  <button
                    onClick={() => setOperationsSubTab('pharmacy')}
                    className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                      operationsSubTab === 'pharmacy'
                        ? 'border-[#1e3a5f] text-[#071933]'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Pill className="w-4 h-4 text-[#0284c7]" />
                    <span>Pharmacy Formulary ({pharmacyItems.length})</span>
                  </button>

                  <button
                    onClick={() => setOperationsSubTab('billing')}
                    className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                      operationsSubTab === 'billing'
                        ? 'border-[#1e3a5f] text-[#071933]'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <ReceiptIndianRupee className="w-4 h-4 text-purple-600" />
                    <span>Front Billing & Cashier ({invoices.length})</span>
                  </button>
                </div>

                {/* Sub-Tab 1: Laboratory Diagnostics */}
                {operationsSubTab === 'lab' && (
                  <div className="space-y-4 printable-area">
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">Test Code</th>
                            <th className="py-3 px-4">Diagnostic Name</th>
                            <th className="py-3 px-4">Patient Name</th>
                            <th className="py-3 px-4">Ordering Physician</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {labTests.map(test => (
                            <tr key={test.id} className="hover:bg-slate-50/70">
                              <td className="py-3 px-4 font-mono font-bold text-[#071933]">{test.test_code}</td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-slate-900 block">{test.test_name}</span>
                                <span className="text-[10px] text-slate-500">{test.category}</span>
                              </td>
                              <td className="py-3 px-4 font-semibold text-slate-800">{test.patientName}</td>
                              <td className="py-3 px-4 text-slate-600">{test.doctorName}</td>
                              <td className="py-3 px-4">
                                <Badge variant={test.status === 'completed' ? 'success' : test.status === 'processing' ? 'info' : 'warning'}>
                                  {test.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-right space-x-1.5">
                                {test.status !== 'completed' && (
                                  <button
                                    onClick={() => handleCollectLabSample(test.id)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-[11px] cursor-pointer"
                                  >
                                    Collect Sample
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedLab(test);
                                    setLabModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                                >
                                  Report
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 2: Pharmacy Formulary & Dispensing */}
                {operationsSubTab === 'pharmacy' && (
                  <div className="space-y-4 printable-area">
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">Medicine Name</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Dosage / Form</th>
                            <th className="py-3 px-4">Stock Level</th>
                            <th className="py-3 px-4">Unit Price</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pharmacyItems.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/70">
                              <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                              <td className="py-3 px-4 text-slate-600">{item.category}</td>
                              <td className="py-3 px-4 font-medium text-slate-700">{item.dosage || '500mg Tablet'}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  (item.stock_quantity || 100) < 50
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-sky-100 text-[#0284c7]'
                                }`}>
                                  {item.stock_quantity || 100} in stock
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-900">₹{item.price_per_unit || 15}</td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedItemToDispense(item);
                                    setDispenseModalOpen(true);
                                  }}
                                  className="px-3 py-1 rounded-lg bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-[11px] cursor-pointer"
                                >
                                  Dispense
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 3: Front Billing & Cashier Counter */}
                {operationsSubTab === 'billing' && (
                  <div className="space-y-4 printable-area">
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">Invoice #</th>
                            <th className="py-3 px-4">Patient Name</th>
                            <th className="py-3 px-4">Total Amount</th>
                            <th className="py-3 px-4">Due Date</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Counter Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {invoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-slate-50/70">
                              <td className="py-3 px-4 font-mono font-bold text-[#071933]">{inv.invoice_number}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">{inv.patientName}</td>
                              <td className="py-3 px-4 font-extrabold text-slate-900 font-mono">₹{inv.total_amount?.toFixed(2)}</td>
                              <td className="py-3 px-4 text-slate-500">{inv.due_date}</td>
                              <td className="py-3 px-4">
                                <Badge variant={inv.status === 'paid' ? 'success' : 'danger'}>
                                  {inv.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-right space-x-1.5">
                                {inv.status !== 'paid' ? (
                                  <button
                                    onClick={() => {
                                      setSelectedInvoiceToPay(inv);
                                      setPayModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs cursor-pointer"
                                  >
                                    Collect Payment
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedReceipt(inv);
                                      setReceiptModalOpen(true);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    Receipt
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
              </div>
            )}

            {/* ========================================================= */}
            {/* 6. STAFF ATTENDANCE & DUTY MANAGEMENT                     */}
            {/* ========================================================= */}
            {activeTab === 'attendance' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Staff Attendance & Duty Management</h3>
                    <p className="text-xs text-slate-500">Shift duty tracking, biometric punch clock logs, and clinical handover management</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePunchAttendance('in')}
                      className="px-3.5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white text-xs font-bold cursor-pointer"
                    >
                      Punch In Now
                    </button>
                    <button
                      onClick={() => handlePunchAttendance('out')}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#071933] text-xs font-bold cursor-pointer"
                    >
                      Punch Out Now
                    </button>
                  </div>
                </div>

                {/* Duty Roster Table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Staff Roster & Assigned Shifts</h4>
                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Staff Member</th>
                          <th className="py-3 px-4">Role Title</th>
                          <th className="py-3 px-4">Department</th>
                          <th className="py-3 px-4">Shift Schedule</th>
                          <th className="py-3 px-4">Punch In</th>
                          <th className="py-3 px-4">Duty Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendance.map(att => (
                          <tr key={att.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 font-bold text-slate-900">{att.staff_name}</td>
                            <td className="py-3 px-4 text-slate-700">Clinical Support Staff</td>
                            <td className="py-3 px-4 text-slate-500">Inpatient Nursing / Triage</td>
                            <td className="py-3 px-4 font-semibold text-slate-800">{att.shift}</td>
                            <td className="py-3 px-4 font-mono font-bold text-[#0284c7]">{att.punch_in}</td>
                            <td className="py-3 px-4">
                              <Badge variant={att.status === 'Present' ? 'success' : 'info'}>
                                {att.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Clinical Handover Notes Board */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    Shift Handover & Clinical Observations Log
                  </h4>

                  <form onSubmit={handleAddHandoverNote} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a clinical handover note for incoming shift (e.g. Bed 104 IV dose due at 2 PM)..."
                      value={newHandoverNote}
                      onChange={e => setNewHandoverNote(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs cursor-pointer shrink-0"
                    >
                      Post Note
                    </button>
                  </form>

                  <div className="space-y-2 pt-1">
                    {handoverNotes.map(item => (
                      <div key={item.id} className="p-3 rounded-lg bg-white border border-slate-200/80 text-xs flex justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{item.note}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.author}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODALS                                                    */}
      {/* ========================================================= */}

      {/* 1. PATIENT INTAKE MODAL */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Front-Desk Patient Registration Intake"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                value={patientForm.first_name}
                onChange={e => setPatientForm(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                placeholder="e.g. Michael"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                value={patientForm.last_name}
                onChange={e => setPatientForm(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                placeholder="e.g. Vance"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                value={patientForm.phone}
                onChange={e => setPatientForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 555-019-XXXX"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Age *</label>
              <input
                type="number"
                value={patientForm.age}
                onChange={e => setPatientForm(prev => ({ ...prev, age: parseInt(e.target.value, 10) }))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Blood Group *</label>
              <select
                value={patientForm.blood_group}
                onChange={e => setPatientForm(prev => ({ ...prev, blood_group: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white font-bold text-rose-700"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={patientForm.gender}
                onChange={e => setPatientForm(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Admission Type</label>
              <select
                value={patientForm.admission_status}
                onChange={e => setPatientForm(prev => ({ ...prev, admission_status: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white font-semibold"
              >
                <option value="outpatient">Outpatient (OPD Consultation)</option>
                <option value="admitted">Inpatient Admission (IPD Ward)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Known Drug Allergies</label>
            <input
              type="text"
              value={patientForm.allergies}
              onChange={e => setPatientForm(prev => ({ ...prev, allergies: e.target.value }))}
              placeholder="e.g. Penicillin, Sulfa drugs, None"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setRegisterModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold cursor-pointer"
            >
              Confirm Patient Intake
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. WALK-IN TOKEN BOOKING MODAL */}
      <Modal
        isOpen={walkinModalOpen}
        onClose={() => setWalkinModalOpen(false)}
        title="Issue Walk-in OPD Queue Token"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleIssueWalkinToken} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Patient *</label>
            <select
              value={tokenForm.patient_id}
              onChange={e => setTokenForm(prev => ({ ...prev, patient_id: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              required
            >
              <option value="">-- Choose Registered Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} ({p.mrn})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Doctor & Department *</label>
            <select
              value={tokenForm.doctor_id}
              onChange={e => {
                const docId = e.target.value;
                const doc = doctors.find(d => String(d.id) === String(docId));
                setTokenForm(prev => ({
                  ...prev,
                  doctor_id: docId,
                  department_id: doc?.department_id || ''
                }));
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              required
            >
              <option value="">-- Select Consulting Doctor --</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialty})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Time Slot</label>
              <select
                value={tokenForm.appointment_time}
                onChange={e => setTokenForm(prev => ({ ...prev, appointment_time: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white font-mono"
              >
                {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Triage Priority</label>
              <select className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white font-semibold">
                <option>Normal OPD</option>
                <option>Urgent Priority</option>
                <option>Emergency Triage</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Reason for Visit / Symptoms</label>
            <input
              type="text"
              value={tokenForm.reason}
              onChange={e => setTokenForm(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g. Chest tightness, Fever follow-up"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setWalkinModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold cursor-pointer"
            >
              Print Queue Token
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. VITALS RECORDING MODAL */}
      <Modal
        isOpen={vitalsModalOpen}
        onClose={() => setVitalsModalOpen(false)}
        title={`Log Nurse Vitals - ${selectedPatientForVitals?.first_name || 'Patient'} ${selectedPatientForVitals?.last_name || ''}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveVitals} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Blood Pressure</label>
              <input
                type="text"
                value={vitalsForm.bp}
                onChange={e => setVitalsForm(prev => ({ ...prev, bp: e.target.value }))}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Heart Pulse</label>
              <input
                type="text"
                value={vitalsForm.pulse}
                onChange={e => setVitalsForm(prev => ({ ...prev, pulse: e.target.value }))}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Body Temperature</label>
              <input
                type="text"
                value={vitalsForm.temp}
                onChange={e => setVitalsForm(prev => ({ ...prev, temp: e.target.value }))}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">SpO2 Oxygen</label>
              <input
                type="text"
                value={vitalsForm.spo2}
                onChange={e => setVitalsForm(prev => ({ ...prev, spo2: e.target.value }))}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Blood Glucose</label>
              <input
                type="text"
                value={vitalsForm.glucose}
                onChange={e => setVitalsForm(prev => ({ ...prev, glucose: e.target.value }))}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Respiratory Rate</label>
              <input
                type="text"
                value={vitalsForm.resp_rate}
                onChange={e => setVitalsForm(prev => ({ ...prev, resp_rate: e.target.value }))}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Nurse Care Observation</label>
            <textarea
              rows={2}
              value={vitalsForm.nursing_notes}
              onChange={e => setVitalsForm(prev => ({ ...prev, nursing_notes: e.target.value }))}
              className="w-full p-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setVitalsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold cursor-pointer"
            >
              Save to Patient Chart
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. DIGITAL HEALTH ID CARD MODAL */}
      <Modal
        isOpen={digitalIdModalOpen}
        onClose={() => setDigitalIdModalOpen(false)}
        title="Patient Hospital Identification Card"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 printable-area">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#071933] via-[#092244] to-[#041022] text-white border border-[#1e3a5f] shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e3a5f]/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center">
                  <img src="/images/logo-icon.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold tracking-tight">ApexCare Medical Center</h4>
                  <p className="text-[9px] text-amber-300 uppercase tracking-widest font-mono">Digital Patient ID</p>
                </div>
              </div>
              <QRCodeToken value={selectedPatientForId?.mrn || 'MRN-2026'} size={48} label="" />
            </div>

            <div className="pt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-sky-300/80 uppercase">Patient Name</span>
                <span className="font-extrabold text-sm text-white">
                  {selectedPatientForId?.first_name} {selectedPatientForId?.last_name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-sky-300/80 uppercase">MRN Number</span>
                <span className="font-mono font-bold text-amber-300">{selectedPatientForId?.mrn}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-sky-300/80 uppercase">Age / Gender</span>
                <span>{selectedPatientForId?.age} Yrs • {selectedPatientForId?.gender}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-sky-300/80 uppercase">Blood Group</span>
                <span className="font-extrabold text-rose-300">{selectedPatientForId?.blood_group || 'O+'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-sky-300/80 uppercase">Emergency Helpline</span>
                <span className="font-mono text-sky-200">1800-273-9227</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print ID Card
            </button>
          </div>
        </div>
      </Modal>

      {/* 5. COLLECT PAYMENT MODAL */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Collect Hospital Counter Payment"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 space-y-1">
            <p className="text-slate-500 text-[11px]">Invoice Reference: {selectedInvoiceToPay?.invoice_number}</p>
            <p className="text-xl font-black text-[#071933] font-mono">₹{selectedInvoiceToPay?.total_amount?.toFixed(2)}</p>
            <p className="text-xs font-semibold text-slate-700">Patient: {selectedInvoiceToPay?.patientName}</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Method</label>
            <select
              value={payMethod}
              onChange={e => setPayMethod(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white font-bold text-slate-800"
            >
              <option value="Cash">Cash at Counter</option>
              <option value="UPI / QR">UPI / QR Code</option>
              <option value="Credit Card">Credit / Debit Card</option>
              <option value="TPA Insurance">Mediclaim / TPA Insurance</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPayModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold cursor-pointer"
            >
              Confirm Payment & Print Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. PHARMACY DISPENSE MODAL */}
      <Modal
        isOpen={dispenseModalOpen}
        onClose={() => setDispenseModalOpen(false)}
        title={`Dispense Medication - ${selectedItemToDispense?.name || 'Medicine'}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleDispenseMedicine} className="space-y-4 text-xs">
          <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl space-y-1">
            <p className="font-bold text-[#071933]">{selectedItemToDispense?.name}</p>
            <p className="text-slate-600 text-[11px]">Available Stock: {selectedItemToDispense?.stock_quantity || 100} units</p>
            <p className="text-slate-600 text-[11px]">Unit Price: ₹{selectedItemToDispense?.price_per_unit || 15}</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Patient</label>
            <select
              value={dispensePatientId}
              onChange={e => setDispensePatientId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.mrn})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Quantity to Dispense</label>
            <input
              type="number"
              min="1"
              max={selectedItemToDispense?.stock_quantity || 100}
              value={dispenseQty}
              onChange={e => setDispenseQty(parseInt(e.target.value, 10))}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDispenseModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold cursor-pointer"
            >
              Confirm Dispensing
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. BED ADMISSION MODAL */}
      <Modal
        isOpen={admitModalOpen}
        onClose={() => setAdmitModalOpen(false)}
        title={`Admit Patient to Bed ${selectedBedToAdmit?.bed_number || ''}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAdmitToBed} className="space-y-4 text-xs">
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl space-y-1">
            <p className="font-bold text-purple-950">Bed: {selectedBedToAdmit?.bed_number} ({selectedBedToAdmit?.ward_name})</p>
            <p className="text-slate-600 text-[11px]">Daily Ward Rate: ₹{selectedBedToAdmit?.daily_rate}/day</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Patient to Admit *</label>
            <select
              value={admitPatientId}
              onChange={e => setAdmitPatientId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              required
            >
              <option value="">-- Choose Patient --</option>
              {patients.filter(p => p.admission_status !== 'admitted').map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} ({p.mrn})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAdmitModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold cursor-pointer"
            >
              Confirm Ward Admission
            </button>
          </div>
        </form>
      </Modal>

      {/* 8. COMMON MODALS */}
      <AppointmentSlipModal
        isOpen={apptSlipModalOpen}
        onClose={() => setApptSlipModalOpen(false)}
        appointment={selectedAppt}
      />

      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        invoice={selectedReceipt}
      />

      <LabReportModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        labTest={selectedLab}
      />
    </div>
  );
}
