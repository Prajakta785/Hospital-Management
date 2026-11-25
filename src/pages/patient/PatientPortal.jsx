import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  patientsApi,
  appointmentsApi,
  labApi,
  billingApi,
  doctorsApi,
  departmentsApi,
  prescriptionsApi,
  notificationsApi,
  workflowApi
} from '../../services/api.js';
import { fallbackDepartments, fallbackDoctors } from '../../data/fallbackData.js';
import { AppointmentSlipModal } from '../../components/common/AppointmentSlipModal.jsx';
import { ReceiptModal } from '../../components/common/ReceiptModal.jsx';
import { LabReportModal } from '../../components/common/LabReportModal.jsx';
import { PrescriptionSlipModal } from '../../components/common/PrescriptionSlipModal.jsx';
import { QRCodeToken } from '../../components/common/QRCodeToken.jsx';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import {
  LayoutDashboard,
  Calendar,
  CalendarPlus,
  FileText,
  FlaskConical,
  Receipt,
  User,
  Heart,
  AlertCircle,
  CreditCard,
  Printer,
  Clock,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Bell,
  MessageSquare,
  Activity,
  Droplet,
  Thermometer,
  Weight,
  Sparkles,
  ArrowRight,
  FileCheck2,
  Share2,
  Download,
  AlertTriangle,
  Pill,
  Send,
  Building2,
  Filter,
  Menu,
  X,
  LogOut,
  ArrowLeft
} from 'lucide-react';

export function PatientPortal({ setActivePage }) {
  const { user, logout, switchDemoRole } = useAuth();
  const toast = useToast();

  // 6 Main Modules:
  // 1. 'dashboard' - Patient Dashboard
  // 2. 'booking' - Online Appointment Booking
  // 3. 'history' - Medical History & Records
  // 4. 'prescriptions_lab' - Digital Prescription & Lab Reports
  // 5. 'billing' - Online Payment & Billing
  // 6. 'notifications' - Notifications & Follow-up Reminders
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Portal Data States
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [doctorsList, setDoctorsList] = useState(fallbackDoctors);
  const [departmentsList, setDepartmentsList] = useState(fallbackDepartments);

  // Sub-filter for Prescriptions & Lab Reports
  const [rxLabSubTab, setRxLabSubTab] = useState('all');

  // Real-time Online Booking Stats State
  const [onlineStats, setOnlineStats] = useState({ totalOnlineCount: 0, slotCounts: {}, data: [] });
  const [onlineViewScope, setOnlineViewScope] = useState('all_online');

  // Modals for Printing
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedLabTest, setSelectedLabTest] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [rxModalOpen, setRxModalOpen] = useState(false);

  // Online Appointment Booking Form State
  const [bookingDept, setBookingDept] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState('');
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Notification Preferences
  const [notifPrefs, setNotifPrefs] = useState({
    whatsapp: true,
    sms: true,
    email: false
  });

  // Reminders Acknowledgment State for Patient Dashboard
  const [dismissedReminders, setDismissedReminders] = useState({});
  const handleAcknowledgeReminder = (id, title) => {
    setDismissedReminders(prev => ({ ...prev, [id]: true }));
    toast.success(`Reminder acknowledged: ${title}`);
  };

  const loadPatientPortalData = async () => {
    try {
      setLoading(true);
      const [allPatients, docRes, deptRes, statsRes, paidRes] = await Promise.all([
        patientsApi.getAll().catch(() => ({ success: false })),
        doctorsApi.getAll().catch(() => ({ success: true, data: fallbackDoctors })),
        departmentsApi.getAll().catch(() => ({ success: true, data: fallbackDepartments })),
        (appointmentsApi.getOnlineStats ? appointmentsApi.getOnlineStats() : Promise.resolve({ success: false })).catch(() => ({ success: false })),
        (billingApi.getPaidTransactions ? billingApi.getPaidTransactions() : Promise.resolve({ success: false })).catch(() => ({ success: false }))
      ]);

      if (docRes && docRes.success && Array.isArray(docRes.data) && docRes.data.length > 0) {
        setDoctorsList(docRes.data);
      }
      if (deptRes && deptRes.success && Array.isArray(deptRes.data) && deptRes.data.length > 0) {
        setDepartmentsList(deptRes.data);
      }
      if (statsRes && statsRes.success) setOnlineStats(statsRes);

      let myPatient = null;
      if (allPatients && allPatients.success && allPatients.data) {
        myPatient = allPatients.data.find(
          p => p.user_id === user?.id || (user?.email && p.email?.toLowerCase() === user?.email?.toLowerCase())
        );
      }

      const [rxRes, notifRes] = await Promise.all([
        prescriptionsApi.getAll(myPatient ? { patientId: myPatient.id } : {}),
        notificationsApi.getAll(myPatient ? { patientId: myPatient.id } : {})
      ]);

      if (rxRes.success) setPrescriptions(rxRes.data || []);
      if (notifRes.success) setNotifications(notifRes.data || []);

      if (myPatient) {
        const dossierRes = await patientsApi.getById(myPatient.id);
        if (dossierRes.success && dossierRes.data) {
          setPatientData(dossierRes.data);
          setAppointments(dossierRes.data.appointments || []);
          setLabTests(dossierRes.data.labTests || []);
          setInvoices(dossierRes.data.invoices || []);
        }
      } else {
        const [aptRes, labRes, invRes] = await Promise.all([
          appointmentsApi.getAll(),
          labApi.getAll(),
          billingApi.getAll()
        ]);
        if (aptRes.success && aptRes.data) setAppointments(aptRes.data);
        if (labRes.success && labRes.data) setLabTests(labRes.data);
        if (invRes.success && invRes.data) setInvoices(invRes.data);

        setPatientData({
          first_name: user?.name ? user.name.split(' ')[0] : 'David',
          last_name: user?.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : 'Miller',
          mrn: 'MRN-2026-0814',
          blood_group: 'O+',
          age: 38,
          gender: 'Male',
          phone: '+1 (555) 019-7756',
          email: user?.email || 'patient@hospital.com',
          emergency_contact_name: 'Sarah Miller (Spouse) - +1 (555) 019-8821',
          insurance_provider: 'BlueCross BlueShield Premier (#BC-992184)',
          allergies: 'Penicillin',
          medical_history: 'Essential hypertension under cardiological treatment. No known diabetic complications.'
        });
      }

      // Synchronize with Clinical Workflow (QR Registrations, Consultations, Doctor Prescriptions)
      try {
        const [wfRegsRes, wfConsultsRes] = await Promise.all([
          workflowApi.getRegistrations().catch(() => ({ data: [] })),
          workflowApi.getConsultations().catch(() => ({ data: [] }))
        ]);

        const allRegs = Array.isArray(wfRegsRes?.data) ? wfRegsRes.data : [];
        const allConsults = Array.isArray(wfConsultsRes?.data) ? wfConsultsRes.data : [];

        // Match patient by email, phone, or name
        const myReg = allRegs.find(r => 
          (user?.email && r.email?.toLowerCase() === user?.email?.toLowerCase()) ||
          (user?.phone && r.phone && r.phone.includes(user.phone)) ||
          (user?.name && r.name && (r.name.toLowerCase().includes(user.name.toLowerCase()) || user.name.toLowerCase().includes(r.name.toLowerCase())))
        ) || allRegs[allRegs.length - 1]; // Fallback to latest registration if active in demo session

        const matchedConsults = allConsults.filter(c => 
          (myReg && (String(c.registration_id) === String(myReg.id) || String(c.patient_id) === String(myReg.patient_id))) ||
          (user?.email && c.patient_email?.toLowerCase() === user?.email?.toLowerCase()) ||
          (user?.name && c.patient_name && (c.patient_name.toLowerCase().includes(user.name.toLowerCase()) || user.name.toLowerCase().includes(c.patient_name.toLowerCase())))
        );

        if (matchedConsults.length > 0) {
          const formattedWfRxs = matchedConsults.map(c => ({
            id: c.id,
            consultation_id: c.id,
            prescription_code: c.prescription_code || `RX-${c.id}`,
            patient_name: c.patient_name,
            patientName: c.patient_name,
            patientMrn: c.patient_id,
            blood_group: c.patient_blood_group,
            doctor_name: c.doctor_name,
            doctorName: c.doctor_name,
            doctorSpecialty: c.doctor_specialty,
            diagnosis: c.diagnosis,
            instructions: c.doctor_notes || c.follow_up_instructions,
            prescribed_date: c.consultation_date || (c.created_at ? c.created_at.split('T')[0] : ''),
            items: c.medicines || [],
            medicines: c.medicines || [],
            next_appointment_date: c.next_appointment_date,
            next_appointment_time: c.next_appointment_time,
            status: 'Active'
          }));

          setPrescriptions(prev => {
            const existingCodes = new Set(prev.map(p => p.prescription_code));
            const newOnes = formattedWfRxs.filter(r => !existingCodes.has(r.prescription_code));
            return [...newOnes, ...prev];
          });

          // Add follow-up appointments
          const formattedWfApts = matchedConsults
            .filter(c => c.next_appointment_date)
            .map(c => ({
              id: `wf-${c.id}`,
              appointment_number: `APT-${c.id}`,
              doctor_name: c.doctor_name,
              doctorName: c.doctor_name,
              department_name: c.doctor_specialty || 'General Consultation',
              appointment_date: c.next_appointment_date,
              appointment_time: c.next_appointment_time || '10:00 AM',
              status: 'confirmed',
              type: 'Follow-up Consultation',
              reason: `Follow-up for ${c.diagnosis}`
            }));

          if (formattedWfApts.length > 0) {
            setAppointments(prev => {
              const existingNums = new Set(prev.map(a => a.appointment_number));
              const newApts = formattedWfApts.filter(a => !existingNums.has(a.appointment_number));
              return [...newApts, ...prev];
            });
          }
        }

        if (myReg) {
          setPatientData(prev => ({
            ...(prev || {}),
            first_name: myReg.name ? myReg.name.split(' ')[0] : (prev?.first_name || 'Patient'),
            last_name: myReg.name && myReg.name.split(' ').length > 1 ? myReg.name.split(' ').slice(1).join(' ') : (prev?.last_name || ''),
            mrn: myReg.patient_id || prev?.mrn || 'PAT-2026',
            blood_group: myReg.blood_group || prev?.blood_group,
            phone: myReg.phone || prev?.phone,
            email: myReg.email || prev?.email,
            address: myReg.address || prev?.address,
            symptoms: myReg.symptoms || prev?.symptoms,
            medical_history: myReg.medical_history || prev?.medical_history,
            workflow_status: myReg.status,
            assigned_doctor_name: myReg.assigned_doctor_name,
            assigned_doctor_specialty: myReg.assigned_doctor_specialty
          }));
        }
      } catch (wfErr) {
        console.warn('Clinical workflow synchronization notice:', wfErr.message);
      }
    } catch (err) {
      console.error('Failed to load patient portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientPortalData();
    const interval = setInterval(() => {
      // Live synchronization for updated doctor prescriptions & appointments
      loadPatientPortalData();
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle Online Booking
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!bookingDoctor || !bookingDate || !bookingTime) {
      toast.warning('Please select a doctor, consultation date, and preferred time slot.');
      return;
    }

    try {
      setBookingSubmitting(true);
      const selectedDocObj = doctorsList.find(d => String(d.id) === String(bookingDoctor));
      const payload = {
        patient_id: patientData?.id || 1,
        doctor_id: parseInt(bookingDoctor, 10),
        department_id: selectedDocObj?.department_id || 1,
        appointment_date: bookingDate,
        appointment_time: bookingTime,
        reason: bookingReason || 'General Clinical Consultation',
        status: 'confirmed',
        booking_channel: 'online'
      };

      const res = await appointmentsApi.book(payload);
      setBookingSubmitting(false);

      if (res.success) {
        toast.success('Consultation successfully scheduled! Appointment token generated.');
        setBookingReason('');
        await loadPatientPortalData();
        setSelectedAppointment(res.data);
        setSlipModalOpen(true);
        setActiveTab('dashboard');
      } else {
        toast.error(res.message || 'Failed to book appointment.');
      }
    } catch (err) {
      setBookingSubmitting(false);
      toast.error(err.message || 'Booking submission error.');
    }
  };

  // Handle Online Payment
  const handlePayInvoice = async (invoiceId) => {
    try {
      const res = await billingApi.pay(invoiceId, {
        payment_method: 'Online Portal (UPI / Card)',
        transaction_ref: `TXN-PATIENT-${Math.floor(100000 + Math.random() * 900000)}`
      });
      if (res.success) {
        toast.success('Payment successfully processed! Official tax receipt updated.');
        await loadPatientPortalData();
        setSelectedReceipt(res.data);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      toast.error(err.message || 'Payment simulation failed.');
    }
  };

  // Vitals State
  const vitals = [
    { label: 'Blood Pressure', value: '118/76', unit: 'mmHg', status: 'Normal', icon: Heart, color: 'text-[#0284c7]', bg: 'bg-sky-50' },
    { label: 'Heart Rate', value: '72', unit: 'bpm', status: 'Optimal', icon: Activity, color: 'text-rose-700', bg: 'bg-rose-50' },
    { label: 'Blood Glucose', value: '98', unit: 'mg/dL', status: 'Fasting Normal', icon: Droplet, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'SpO2 Oxygen', value: '99', unit: '%', status: 'Optimal', icon: Sparkles, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Temperature', value: '98.4', unit: '°F', status: 'Normal', icon: Thermometer, color: 'text-indigo-700', bg: 'bg-indigo-50' },
    { label: 'Body Mass Index', value: '22.4', unit: 'BMI', status: 'Healthy', icon: Weight, color: 'text-[#0284c7]', bg: 'bg-sky-50' }
  ];

  // Outstanding Billing Metrics
  const totalBilled = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
  const outstandingDue = invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

  // Next Upcoming Appointment
  const upcomingAppointment = appointments.find(apt => apt.status === 'confirmed') || appointments[0];

  // Filtered doctors for booking tab
  const filteredDoctors = bookingDept
    ? doctorsList.filter(d => String(d.department_id) === String(bookingDept))
    : doctorsList;

  // Interactive Clinical Reminders - 6 Real-time Patient Alerts
  const dashboardReminders = [
    {
      id: 'rem-1',
      type: 'followup',
      title: 'Doctor Follow-up Due',
      doctor: 'Dr. Neha Kapoor (Dermatology)',
      timing: 'Next Tuesday • 10:30 AM',
      note: 'Routine post-medication follow-up consultation.',
      icon: Stethoscope,
      bg: 'bg-sky-50/80',
      border: 'border-sky-200',
      badge: 'Upcoming Follow-up',
      badgeColor: 'bg-sky-100 text-[#071933] border border-sky-300',
      actionText: 'Confirm Attendance',
      onAction: () => {
        toast.success('Follow-up attendance confirmed with Dr. Neha Kapoor!');
      }
    },
    {
      id: 'rem-2',
      type: 'rx',
      title: 'Prescription Reminder',
      doctor: 'Prescription Ref: RX-2026-9041',
      timing: 'Daily • 08:30 PM (Tonight)',
      note: 'Take Atorvastatin 20mg (1 tablet) after dinner with water.',
      icon: Pill,
      bg: 'bg-amber-50/80',
      border: 'border-amber-200',
      badge: 'Medication Due',
      badgeColor: 'bg-amber-100 text-amber-950 border border-amber-300',
      actionText: 'Mark Taken',
      onAction: () => {
        toast.success('Medication marked as taken for today!');
      }
    },
    {
      id: 'rem-3',
      type: 'lab',
      title: 'Lab Report Ready',
      doctor: 'Pathology Laboratory Wing',
      timing: 'Completed Today • 09:15 AM',
      note: 'Your Metabolic Panel & Lipid Profile are authorized by Chief Pathologist.',
      icon: FlaskConical,
      bg: 'bg-blue-50/80',
      border: 'border-blue-200',
      badge: 'Report Ready',
      badgeColor: 'bg-blue-100 text-blue-950 border border-blue-300',
      actionText: 'View Lab Report',
      onAction: () => {
        if (labTests.length > 0) {
          setSelectedLabTest(labTests[0]);
          setLabModalOpen(true);
        } else {
          setActiveTab('prescriptions_lab');
        }
      }
    },
    {
      id: 'rem-4',
      type: 'imaging',
      title: 'Diagnostic Imaging Scheduled',
      doctor: 'Cardiac Ultrasound Suite 204',
      timing: 'Thursday • 11:00 AM',
      note: '2D Echocardiogram Doppler check. Please wear loose clothing.',
      icon: Activity,
      bg: 'bg-indigo-50/80',
      border: 'border-indigo-200',
      badge: 'Diagnostic Scan',
      badgeColor: 'bg-indigo-100 text-indigo-950 border border-indigo-300',
      actionText: 'Confirm Appointment',
      onAction: () => {
        toast.success('Cardiac Ultrasound appointment confirmed!');
      }
    },
    {
      id: 'rem-5',
      type: 'fasting',
      title: 'Fasting Blood Sugar Test',
      doctor: 'Central Phlebotomy Lab',
      timing: 'Tomorrow • 08:00 AM',
      note: 'Requires 10-hour overnight fasting. Water intake is allowed.',
      icon: Droplet,
      bg: 'bg-rose-50/80',
      border: 'border-rose-200',
      badge: 'Fasting Protocol',
      badgeColor: 'bg-rose-100 text-rose-950 border border-rose-300',
      actionText: 'I Understand (Fast Ready)',
      onAction: () => {
        toast.success('Fasting instructions acknowledged!');
      }
    },
    {
      id: 'rem-6',
      type: 'vaccine',
      title: 'Annual Vaccine Booster Due',
      doctor: 'Preventive Care Clinic',
      timing: 'Due This Month • Walk-in Available',
      note: 'Annual Quadrivalent Flu Vaccine and Tdap Immunity Booster recommended.',
      icon: ShieldCheck,
      bg: 'bg-sky-50/80',
      border: 'border-sky-200',
      badge: 'Preventive Care',
      badgeColor: 'bg-sky-100 text-[#071933] border border-sky-300',
      actionText: 'Schedule Shot',
      onAction: () => {
        setActiveTab('booking');
        toast.info('Navigating to appointment booking for vaccination.');
      }
    }
  ];

  // Active unacknowledged reminders count
  const activeRemindersCount = dashboardReminders.filter(r => !dismissedReminders[r.id]).length;

  // 6 Navigation Menu Items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'booking', label: 'Book Appointment', icon: CalendarPlus, badge: appointments.length },
    { id: 'history', label: 'Medical Records', icon: User },
    { id: 'prescriptions_lab', label: 'Prescriptions & Labs', icon: FileText, badge: prescriptions.length + labTests.length },
    { id: 'billing', label: 'Billing & Payments', icon: Receipt, badge: invoices.filter(i => i.status !== 'paid').length || null },
    { id: 'notifications', label: 'Alerts & Reminders', icon: Bell, badge: activeRemindersCount }
  ];

  const currentModuleTitle = menuItems.find(m => m.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-slate-100/90 overflow-hidden font-sans selection:bg-sky-200">
      {/* Printable Modals */}
      <AppointmentSlipModal
        isOpen={slipModalOpen}
        onClose={() => setSlipModalOpen(false)}
        appointment={selectedAppointment}
      />
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        invoice={selectedReceipt}
      />
      <LabReportModal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        labTest={selectedLabTest}
      />
      <PrescriptionSlipModal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        prescription={selectedPrescription}
      />

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =========================================================================
          LEFT SIDEBAR NAVIGATION (Format matching Doctor & Admin Panels)
          ========================================================================= */}
      <aside
        className={`w-72 bg-[#022c22] text-white flex flex-col h-screen shrink-0 overflow-y-auto overflow-x-hidden sidebar-scrollbar border-r border-[#044434] portal-sidebar ${
          sidebarOpen ? 'sidebar-open' : 'sidebar-closed'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 shrink-0 px-5 border-b border-[#044434] flex items-center justify-between bg-[#022119]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              <img src="/images/logo-icon.png" alt="MedicalCare Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-white tracking-tight font-display">MedicalCare</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-mono">
                  PATIENT
                </span>
              </div>
              <p className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">Personal Health Portal</p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-emerald-300 hover:text-white p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Profile Card (Nested in Sidebar) */}
        <div className="p-4 border-b border-[#044434]">
          <div className="p-3.5 rounded-2xl bg-[#033b20] border border-emerald-400/30 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-sm shrink-0">
                {user?.name ? user.name.charAt(0) : 'D'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white truncate">{user?.name || 'David Miller'}</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Verified Patient" />
                </div>
                <p className="text-[10px] text-amber-300 font-mono font-semibold truncate">
                  {patientData?.mrn || 'MRN-2026-0814'}
                </p>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-emerald-900/60 text-center text-[10px]">
              <div className="bg-[#022119] py-1 rounded-lg">
                <span className="text-emerald-300/70 block text-[8px] uppercase">Blood</span>
                <strong className="text-white">{patientData?.blood_group || 'O+'}</strong>
              </div>
              <div className="bg-[#022119] py-1 rounded-lg">
                <span className="text-emerald-300/70 block text-[8px] uppercase">Age</span>
                <strong className="text-white">{patientData?.age || 38} Yrs</strong>
              </div>
              <div className="bg-[#022119] py-1 rounded-lg">
                <span className="text-amber-400 block text-[8px] uppercase">Allergy</span>
                <strong className="text-amber-300 truncate block px-0.5">{patientData?.allergies || 'Penicillin'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5 scrollbar-thin">
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-500/20 translate-x-0.5'
                    : 'bg-[#033b20]/60 text-slate-200 hover:bg-[#033b20] hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950 font-bold' : 'text-amber-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                  <span
                    className={`w-5 h-5 rounded-full font-black text-[11px] flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-[#022119] text-amber-400' : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3.5 border-t border-[#044434] bg-[#022119]/90 space-y-2">
          <button
            onClick={() => setActivePage('home')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#033b20] hover:bg-[#044434] border border-emerald-400/30 text-amber-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Back to Public Website</span>
          </button>
          <button
            onClick={() => {
              setActivePage('auth');
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 shrink-0 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-display">
                {currentModuleTitle}
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Welcome back, {user?.name || 'David'} • Verified Personal Medical Dossier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('booking')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#071933] text-xs font-extrabold shadow-xs transition-all hover:scale-102 cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Book Consultation</span>
            </button>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center border border-sky-100">
              <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
            </div>
          </div>
        </header>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

          {/* =========================================================================
              MODULE 1: DASHBOARD (Clean 2-Column Format)
              ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Row 1: 4 Key Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Appointments</span>
                    <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{appointments.length}</p>
                    <span className="text-[10px] text-[#0284c7] font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Scheduled on record
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Active Prescriptions</span>
                    <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{prescriptions.length || 1}</p>
                    <span className="text-[10px] text-[#0284c7] font-semibold flex items-center gap-1 mt-0.5">
                      <Pill className="w-3 h-3" /> Digital Rx Regimens
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Certified Lab Reports</span>
                    <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{labTests.length}</p>
                    <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1 mt-0.5">
                      <FlaskConical className="w-3 h-3" /> Pathology & Imaging
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Outstanding Balance</span>
                    <p className="text-2xl font-black text-slate-900 mt-1 font-mono">₹{outstandingDue.toFixed(2)}</p>
                    <span className={`text-[10px] font-semibold flex items-center gap-1 mt-0.5 ${outstandingDue > 0 ? 'text-amber-700' : 'text-[#0284c7]'}`}>
                      {outstandingDue > 0 ? '● Payment Due' : '✓ All Invoices Cleared'}
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Row 2: Main 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column (8 cols): Upcoming Visit + Vitals + Active Prescriptions */}
                <div className="lg:col-span-8 space-y-6">

                  {/* 1. Upcoming Appointment Spotlight Card */}
                  {upcomingAppointment ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                          <h3 className="text-sm font-bold text-slate-900">Next Scheduled Consultation</h3>
                        </div>
                        <Badge variant="success">Confirmed Appointment</Badge>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-xl bg-[#0284c7] text-amber-300 flex items-center justify-center shrink-0">
                              <Stethoscope className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-xs font-mono font-bold text-[#0284c7] bg-sky-50 px-2.5 py-0.5 rounded">
                                Token: #{upcomingAppointment.appointment_number}
                              </span>
                              <h4 className="text-base font-extrabold text-slate-900 mt-1">
                                {upcomingAppointment.doctorName || 'Senior Consultant'}
                              </h4>
                              <p className="text-xs font-semibold text-[#0284c7]">
                                {upcomingAppointment.departmentName || 'Specialist Clinic'} • OPD Wing B, Level 2
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Date</span>
                              <strong className="text-slate-800">{upcomingAppointment.appointment_date}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Time Slot</span>
                              <strong className="text-slate-800">{upcomingAppointment.appointment_time}</strong>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                setSelectedAppointment(upcomingAppointment);
                                setSlipModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5 text-amber-300" />
                              Print Token Voucher
                            </button>
                            <button
                              onClick={() => setActiveTab('booking')}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                            >
                              + New Booking
                            </button>
                          </div>
                        </div>

                        {/* QR Code Reception Token */}
                        <div className="flex flex-col items-center justify-center p-3.5 bg-sky-50/60 rounded-2xl border border-sky-100 text-center shrink-0">
                          <QRCodeToken value={upcomingAppointment.appointment_number || 'APEX-2026'} size={92} label="Reception Token" />
                          <p className="text-[10px] font-bold text-slate-700 mt-1.5">Scan at Reception</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                      <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">No Upcoming Consultation</h4>
                        <p className="text-xs text-slate-500">Schedule your next doctor visit online in seconds.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('booking')}
                        className="px-4 py-2 rounded-xl bg-[#0284c7] text-white text-xs font-bold hover:bg-[#0b2447] transition-colors"
                      >
                        Book Appointment Now
                      </button>
                    </div>
                  )}

                  {/* 2. Patient Clinical Vitals Panel */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Clinical Vitals & Health Biometrics</h3>
                        <p className="text-[11px] text-slate-500">Latest recorded vitals synced from Electronic Health Records</p>
                      </div>
                      <Badge variant="success">Normal Limits</Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {vitals.map((v, idx) => {
                        const Icon = v.icon;
                        return (
                          <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-slate-500">{v.label}</span>
                              <div className={`w-6 h-6 rounded-lg ${v.bg} ${v.color} flex items-center justify-center`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                            </div>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-lg font-black text-slate-900">{v.value}</span>
                              <span className="text-[10px] text-slate-500 font-semibold">{v.unit}</span>
                            </div>
                            <span className="text-[10px] font-bold text-[#0284c7] bg-sky-50 px-1.5 py-0.2 rounded inline-block">
                              {v.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Active Digital Prescriptions (Rx) Quick Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Active Prescriptions (Rx)</h3>
                        <p className="text-[11px] text-slate-500">Currently active doctor regimens and refill availability</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('prescriptions_lab')}
                        className="text-xs font-bold text-[#0284c7] hover:underline"
                      >
                        View All →
                      </button>
                    </div>

                    {prescriptions.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">No active prescriptions logged.</p>
                    ) : (
                      <div className="space-y-3">
                        {prescriptions.slice(0, 2).map(rx => (
                          <div key={rx.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-mono font-bold text-[#0284c7]">{rx.prescription_code}</span>
                                <h4 className="font-bold text-slate-900 mt-0.5">{rx.diagnosis}</h4>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedPrescription(rx);
                                  setRxModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0284c7] text-white font-bold text-[11px] hover:bg-[#0b2447] transition-colors"
                              >
                                <Printer className="w-3 h-3" />
                                Print Rx Slip
                              </button>
                            </div>
                            <p className="text-slate-500">
                              Prescribed by {rx.doctorName || 'Dr. Neha Kapoor, MD'} • Refill at ApexCare Pharmacy
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column (4 cols): Alerts & Reminders + Billing Quick Card + Emergency Card */}
                <div className="lg:col-span-4 space-y-6">

                  {/* 1. Alerts & Clinical Reminders */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-bold text-slate-900">Active Reminders</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        {dashboardReminders.filter(r => !dismissedReminders[r.id]).length} Due
                      </span>
                    </div>

                    <div className="space-y-3">
                      {dashboardReminders.map(rem => {
                        const Icon = rem.icon;
                        const isDismissed = dismissedReminders[rem.id];
                        if (isDismissed) return null;

                        return (
                          <div key={rem.id} className={`p-3.5 rounded-xl border ${rem.border} ${rem.bg} space-y-2 text-xs`}>
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${rem.badgeColor}`}>
                                {rem.badge}
                              </span>
                              <span className="text-[10px] text-slate-500 font-semibold">{rem.timing}</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{rem.title}</h4>
                              <p className="text-[11px] text-slate-600 mt-0.5">{rem.note}</p>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <button
                                onClick={rem.onAction}
                                className="px-3 py-1.5 rounded-lg bg-[#0284c7] text-white font-bold text-[11px] hover:bg-[#0b2447] transition-colors cursor-pointer"
                              >
                                {rem.actionText}
                              </button>
                              <button
                                onClick={() => handleAcknowledgeReminder(rem.id, rem.title)}
                                className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Billing & Online Payment Quick Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-[#0284c7]" />
                        <h3 className="text-sm font-bold text-slate-900">Billing Account</h3>
                      </div>
                      <Badge variant={outstandingDue > 0 ? 'warning' : 'success'}>
                        {outstandingDue > 0 ? 'Due' : 'Cleared'}
                      </Badge>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Current Outstanding Balance</span>
                      <p className="text-2xl font-black text-slate-900 font-mono">₹{outstandingDue.toFixed(2)}</p>
                      <p className="text-[11px] text-slate-500">Total Billed: ₹{totalBilled.toFixed(2)} • Paid: ₹{totalPaid.toFixed(2)}</p>
                    </div>

                    <div className="space-y-2 pt-1">
                      {outstandingDue > 0 ? (
                        <button
                          onClick={() => setActiveTab('billing')}
                          className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#071933] font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay Online Now (₹{outstandingDue.toFixed(2)})
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveTab('billing')}
                          className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center block"
                        >
                          View Invoices & Receipts
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3. Emergency & Support Card */}
                  <div className="bg-gradient-to-br from-rose-950 to-rose-900 text-white rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-800 text-rose-200 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-300">24/7 Trauma Emergency</h4>
                        <a href="tel:18002739227" className="text-sm font-bold text-white hover:underline">
                          1-800-273-9227
                        </a>
                      </div>
                    </div>
                    <p className="text-[11px] text-rose-200/90 leading-relaxed">
                      Instant paramedic and trauma support available round the clock.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MODULE 2: ONLINE APPOINTMENT BOOKING
              ========================================================================= */}
          {activeTab === 'booking' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 printable-area">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-display">Schedule a Specialist Consultation</h3>
                    <p className="text-xs text-slate-500">Select department, specialist doctor, preferred date & instant token generation</p>
                  </div>
                  <span className="text-xs font-bold text-[#0284c7] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                    Instant Confirmation
                  </span>
                </div>

                <form onSubmit={handleCreateAppointment} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Department Filter */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">1. Select Medical Department</label>
                      <select
                        value={bookingDept}
                        onChange={(e) => {
                          setBookingDept(e.target.value);
                          setBookingDoctor('');
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-700 focus:ring-1 focus:ring-[#0284c7] cursor-pointer"
                      >
                        <option value="">All Departments & Specialty Institutes</option>
                        {departmentsList.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name} ({dept.doctorCount || 4} Specialists)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Doctor Picker */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">2. Select Consultant Doctor</label>
                      <select
                        value={bookingDoctor}
                        onChange={(e) => setBookingDoctor(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-700 focus:ring-1 focus:ring-[#0284c7] cursor-pointer"
                      >
                        <option value="">-- Choose Specialist Doctor --</option>
                        {filteredDoctors.map(doc => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name} — {doc.specialty || doc.specialization || doc.departmentName || 'Specialist'} (Fee: ₹{doc.consultation_fee || doc.consultationFee || 1000})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Picker */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">3. Preferred Appointment Date</label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-700 focus:ring-1 focus:ring-[#0284c7] cursor-pointer"
                      />
                    </div>

                    {/* Time Slot Picker */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">4. Preferred Time Slot</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'].map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setBookingTime(slot)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              bookingTime === slot
                                ? 'bg-[#0284c7] text-white border-[#1e3a5f] shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reason for Visit */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">5. Clinical Reason / Presenting Symptoms</label>
                    <textarea
                      rows={3}
                      value={bookingReason}
                      onChange={(e) => setBookingReason(e.target.value)}
                      placeholder="Describe symptoms, routine follow-up, second opinion, or medication renewal..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-700 focus:ring-1 focus:ring-[#0284c7]"
                    />
                  </div>

                  {/* Summary & Submit */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-600">
                      <span>Standard Consultation Fee: <strong className="text-[#0284c7] font-bold">₹50.00</strong></span>
                      <span className="mx-2">•</span>
                      <span>Includes QR Token & Reception Priority</span>
                    </div>

                    <button
                      type="submit"
                      disabled={bookingSubmitting}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {bookingSubmitting ? (
                        <span>Scheduling Appointment...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-amber-300" />
                          <span>Confirm Appointment & Generate Token</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* List of Existing Appointments */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Your Appointment History & Tokens</h3>
                {appointments.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                    No appointments booked yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appointments.map(apt => (
                      <div
                        key={apt.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              #{apt.appointment_number}
                            </span>
                            <Badge variant={apt.status === 'confirmed' ? 'success' : apt.status === 'completed' ? 'info' : 'neutral'}>
                              {apt.status}
                            </Badge>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{apt.doctorName || 'Senior Consultant'}</h4>
                            <p className="text-xs font-semibold text-[#0284c7]">{apt.departmentName || 'Specialist Clinic'}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Date</span>
                              <strong className="text-slate-800">{apt.appointment_date}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Time Slot</span>
                              <strong className="text-slate-800">{apt.appointment_time}</strong>
                            </div>
                          </div>

                          <p className="text-xs text-slate-500">Reason: {apt.reason}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-700">₹{apt.consultationFee?.toFixed(2) || '50.00'}</span>
                          <button
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setSlipModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#071933] text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#0284c7]" />
                            View Booking Slip
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              MODULE 3: MEDICAL HISTORY & RECORDS
              ========================================================================= */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 printable-area">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Electronic Health Record (EHR) — Comprehensive Patient Dossier
                    </h3>
                    <p className="text-xs text-slate-500">HIPAA & Digital Health Data Protection Certified</p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Medical Summary
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider block">Full Patient Name</span>
                    <p className="text-sm font-bold text-slate-900 mt-1">{patientData?.first_name} {patientData?.last_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider block">Medical Record Number (MRN)</span>
                    <p className="text-sm font-mono font-bold text-slate-900 mt-1">{patientData?.mrn || 'MRN-2026-0814'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider block">Blood Group & Rh</span>
                    <p className="text-sm font-bold text-[#0284c7] mt-1">{patientData?.blood_group || 'O+'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider block">Age & Gender</span>
                    <p className="text-sm font-bold text-slate-900 mt-1">{patientData?.age || 38} Yrs • {patientData?.gender || 'Male'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider block">Registered Phone</span>
                    <p className="text-sm font-bold text-slate-900 mt-1">{patientData?.phone || '+1 (555) 019-7756'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider block">Emergency Contact</span>
                    <p className="text-sm font-bold text-slate-900 mt-1">{patientData?.emergency_contact_name || 'Family Contact'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider block">Health Insurance Policy</span>
                    <p className="text-sm font-bold text-slate-900 mt-1">{patientData?.insurance_provider || 'BlueCross BlueShield Premier (#BC-992184)'}</p>
                  </div>
                </div>

                {/* Critical Allergies Card */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Clinical Allergies & Contraindications</span>
                  </div>
                  <p className="text-xs text-amber-800 font-semibold">
                    {patientData?.allergies || 'Penicillin'}
                  </p>
                  <p className="text-[11px] text-amber-700/80">
                    Patient exhibits cutaneous sensitivity to penicillin-class antibiotics. Always cross-check before prescribing.
                  </p>
                </div>

                {/* Chronic Medical Conditions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Chronic Conditions & Ongoing Diagnoses</h4>
                  <div className="space-y-2">
                    <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900 block">Essential Primary Hypertension (ICD-10 I10)</strong>
                        <span className="text-slate-500">Diagnosed: March 2024 • Treated by Dr. Neha Kapoor (Cardiology)</span>
                      </div>
                      <Badge variant="success">Controlled with Medication</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MODULE 4: DIGITAL PRESCRIPTION & LAB REPORTS
              ========================================================================= */}
          {activeTab === 'prescriptions_lab' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setRxLabSubTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    rxLabSubTab === 'all' ? 'bg-[#0284c7] text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Documents ({prescriptions.length + labTests.length})
                </button>
                <button
                  onClick={() => setRxLabSubTab('prescriptions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    rxLabSubTab === 'prescriptions' ? 'bg-[#0284c7] text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Digital Prescriptions ({prescriptions.length || 1})
                </button>
                <button
                  onClick={() => setRxLabSubTab('lab')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    rxLabSubTab === 'lab' ? 'bg-[#0284c7] text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Certified Diagnostic Labs ({labTests.length})
                </button>
              </div>

              {/* Prescriptions Section */}
              {(rxLabSubTab === 'all' || rxLabSubTab === 'prescriptions') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Active Digital Prescriptions (Rx)</h3>
                    <Badge variant="success">E-Signature Verified</Badge>
                  </div>

                  {prescriptions.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                      No digital prescriptions on record yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {prescriptions.map(rx => (
                        <div key={rx.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-wrap gap-2">
                            <div>
                              <span className="text-xs font-mono font-bold text-slate-600">{rx.prescription_code}</span>
                              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{rx.diagnosis}</h4>
                              <p className="text-xs text-slate-500">Prescribing Physician: {rx.doctorName || 'Dr. Neha Kapoor, MD'}</p>
                            </div>
                            <Badge variant="success">Active Regimen</Badge>
                          </div>
                          <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {(rx.items || []).map((med, idx) => (
                                <div key={idx} className="p-3.5 rounded-xl border border-sky-100 bg-sky-50/50 space-y-1 text-xs">
                                  <div className="flex justify-between font-bold text-slate-900">
                                    <span>{idx + 1}. {med.medicine_name}</span>
                                    <span className="text-[#0284c7] font-semibold">{med.dosage}</span>
                                  </div>
                                  <p className="text-slate-600 font-medium">Frequency: {med.frequency} • Duration: {med.duration}</p>
                                  <p className="text-slate-500 italic">Instructions: {med.instructions || 'Take with water after meals'}</p>
                                </div>
                              ))}
                            </div>
                            <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                              <span>Advice: {rx.instructions || 'Refill available at ApexCare Outpatient Pharmacy.'}</span>
                              <button
                                onClick={() => {
                                  setSelectedPrescription(rx);
                                  setRxModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0b2447] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                Print Official Rx Slip
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Diagnostic Lab Reports Section */}
              {(rxLabSubTab === 'all' || rxLabSubTab === 'lab') && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Certified Diagnostic Pathology & Imaging</h3>
                    <Badge variant="info">NABH / NABL Accredited Lab</Badge>
                  </div>

                  {labTests.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                      No diagnostic test results logged.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {labTests.map(test => (
                        <div
                          key={test.id}
                          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-slate-500">{test.test_code}</span>
                              <Badge variant={test.status === 'completed' ? 'success' : 'warning'}>
                                {test.status}
                              </Badge>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">{test.test_name}</h4>
                            <p className="text-xs text-slate-500">
                              Category: {test.category} • Ordered: {test.ordered_date} • Authorized: {test.authorized_by || 'Dr. Robert Vance, MD'}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedLabTest(test);
                              setLabModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                          >
                            <FlaskConical className="w-3.5 h-3.5 text-amber-300" />
                            View Certified Report
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              MODULE 5: ONLINE PAYMENT & BILLING
              ========================================================================= */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Invoiced Amount</span>
                  <p className="text-2xl font-black text-slate-900 mt-1 font-mono">₹{totalBilled.toFixed(2)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Cumulative clinical charges & GST</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Amount Paid</span>
                  <p className="text-2xl font-black text-[#0284c7] mt-1 font-mono">₹{totalPaid.toFixed(2)}</p>
                  <p className="text-[11px] text-[#0284c7] mt-0.5">Receipts generated & verified</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Pending / Due Balance</span>
                  <p className="text-2xl font-black text-amber-700 mt-1 font-mono">₹{outstandingDue.toFixed(2)}</p>
                  <p className="text-[11px] text-amber-600 mt-0.5">{outstandingDue > 0 ? 'Action required: pay online' : 'Account in good standing'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Hospital Billing & Official GST Invoices</h3>
                  <span className="text-xs text-slate-500 font-semibold">18% Healthcare GST itemized</span>
                </div>

                {invoices.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                    No invoices on file.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.map(inv => (
                      <div
                        key={inv.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-500">{inv.invoice_number}</span>
                            <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>
                              {inv.status}
                            </Badge>
                          </div>
                          <h4 className="text-base font-extrabold text-slate-900 font-mono">
                            ₹{parseFloat(inv.total_amount).toFixed(2)}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Due Date: {inv.due_date || 'Immediate'} • Method: {inv.payment_method || 'Awaiting Payment'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {inv.status === 'unpaid' && (
                            <button
                              onClick={() => handlePayInvoice(inv.id)}
                              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#071933] text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pay Online (₹{parseFloat(inv.total_amount).toFixed(2)})
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedReceipt(inv);
                              setReceiptModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5 text-[#0284c7]" />
                            View Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              MODULE 6: NOTIFICATIONS & FOLLOW-UP REMINDERS
              ========================================================================= */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Communication & Alert Gateway</h3>
                    <p className="text-xs text-slate-500">Real-time WhatsApp, SMS, and Doctor Follow-up Reminders</p>
                  </div>
                  <span className="text-xs text-[#0284c7] font-semibold flex items-center gap-1.5 bg-sky-50 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" /> Live Gateway Connected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-xs font-bold text-slate-800 block">WhatsApp Alerts</strong>
                      <span className="text-[10px] text-slate-500">Booking slips & Rx refills</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPrefs.whatsapp}
                      onChange={(e) => setNotifPrefs(p => ({ ...p, whatsapp: e.target.checked }))}
                      className="w-4 h-4 text-[#0284c7] rounded cursor-pointer accent-sky-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-xs font-bold text-slate-800 block">SMS Reminders</strong>
                      <span className="text-[10px] text-slate-500">2-hour pre-visit alerts</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPrefs.sms}
                      onChange={(e) => setNotifPrefs(p => ({ ...p, sms: e.target.checked }))}
                      className="w-4 h-4 text-[#0284c7] rounded cursor-pointer accent-sky-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-xs font-bold text-slate-800 block">Email Summaries</strong>
                      <span className="text-[10px] text-slate-500">Discharge & Lab PDFs</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPrefs.email}
                      onChange={(e) => setNotifPrefs(p => ({ ...p, email: e.target.checked }))}
                      className="w-4 h-4 text-[#0284c7] rounded cursor-pointer accent-sky-600"
                    />
                  </div>
                </div>
              </div>

              {/* Active Clinical Reminders & Actions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Active Action Reminders & Clinical Alerts</h3>
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                    {activeRemindersCount} Active Alert{activeRemindersCount === 1 ? '' : 's'} Due
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardReminders.map(rem => {
                    const RemIcon = rem.icon;
                    const isDismissed = dismissedReminders[rem.id];
                    return (
                      <div
                        key={rem.id}
                        className={`p-4 rounded-2xl border transition-all ${rem.bg} ${rem.border} ${
                          isDismissed ? 'opacity-50 grayscale-50' : 'shadow-xs hover:shadow-md'
                        } flex flex-col justify-between gap-3`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${rem.badgeColor}`}>
                              {rem.badge}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">{rem.timing}</span>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-white/90 p-1.5 shadow-xs shrink-0 flex items-center justify-center">
                              <RemIcon className="w-5 h-5 text-slate-800" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{rem.title}</h4>
                              <p className="text-[11px] text-slate-600 font-medium truncate">{rem.doctor}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-white/80">
                            {rem.note}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50">
                          <button
                            onClick={rem.onAction}
                            disabled={isDismissed}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-[#0284c7] hover:bg-[#0284c7] text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer text-center"
                          >
                            {rem.actionText}
                          </button>
                          <button
                            onClick={() => handleAcknowledgeReminder(rem.id, rem.title)}
                            disabled={isDismissed}
                            className="py-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 shadow-xs cursor-pointer"
                            title="Acknowledge reminder"
                          >
                            {isDismissed ? '✓ Done' : 'Acknowledge'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Messages Feed */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">WhatsApp & SMS Live Notification Stream</h3>
                {notifications.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                    No alerts recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-start gap-4"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          notif.type === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {notif.type === 'whatsapp' ? <WhatsAppIcon className="w-5 h-5 fill-emerald-600" /> : <Bell className="w-5 h-5 text-blue-700" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                              {notif.title}
                              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-600">
                                {notif.type.toUpperCase()}
                              </span>
                            </h4>
                            <span className="text-[11px] text-slate-400">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                            "{notif.message}"
                          </p>
                          <p className="text-[11px] text-[#0284c7] font-medium">Status: {notif.status} to {notif.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
