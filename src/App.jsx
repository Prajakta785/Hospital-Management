import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { AppointmentBookingModal } from './components/common/AppointmentBookingModal.jsx';
import { AppointmentSlipModal } from './components/common/AppointmentSlipModal.jsx';

// Public Website Pages
import { HomePage } from './pages/public/HomePage.jsx';
import { AboutPage } from './pages/public/AboutPage.jsx';
import { DoctorsPage } from './pages/public/DoctorsPage.jsx';
import { DepartmentsPage } from './pages/public/DepartmentsPage.jsx';
import { AppointmentBookingPage } from './pages/public/AppointmentBookingPage.jsx';
import { ContactPage } from './pages/public/ContactPage.jsx';
import { AuthPage } from './pages/auth/AuthPage.jsx';

// Role-Based Clinical Panels & QR Workflow Pages
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard.jsx';
import { NurseDashboard } from './pages/nurse/NurseDashboard.jsx';
import { DoctorPanel } from './pages/doctor/DoctorPanel.jsx';
import { QrRegistrationPage } from './pages/public/QrRegistrationPage.jsx';
import { PrescriptionViewPage } from './pages/public/PrescriptionViewPage.jsx';
import { QrRegistrationModal } from './components/common/QrRegistrationModal.jsx';

// Operational Portals (Doctor, Staff Desk, and Patient Portal)
import { PatientPortal } from './pages/patient/PatientPortal.jsx';
import { DoctorPortal } from './pages/doctor/DoctorPortal.jsx';
import { StaffPortal } from './pages/staff/StaffPortal.jsx';

// Mobile App View Components (Native App Bottom Navigation & PWA Install)
import { MobileAppBottomBar } from './components/layout/MobileAppBottomBar.jsx';
import { PwaInstallPrompt } from './components/common/PwaInstallPrompt.jsx';

function getInitialPage() {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '').replace(/^\//, '');
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
  let queryTarget = '';
  try {
    const search = new URLSearchParams(window.location.search);
    queryTarget = search.get('page') || search.get('tab') || search.get('p') || search.get('route') || '';
  } catch {}
  const target = queryTarget.toLowerCase() || path || hash;

  // 1. Super Admin Panel route (/superadmin or /admin)
  if (['superadmin', 'admin', 'super-admin', 'super_admin'].some(k => target === k || target.startsWith(k))) {
    return 'superadmin';
  }

  // 2. Nurse & Doctor Panels & Workflows
  if (['nurse', 'nurse-panel', 'nurse_panel', 'nurse_dashboard'].some(k => target === k || target.startsWith(k))) {
    return 'nurse';
  }
  if (['doctor', 'doctor-panel', 'doctor_panel'].some(k => target === k || target.startsWith(k))) {
    return 'doctor';
  }
  if (['register-qr', 'register_qr', 'qr-register', 'qr_register', 'patient-qr', 'register'].some(k => target === k || target.startsWith(k))) {
    return 'register-qr';
  }
  if (window.location.search && window.location.search.toLowerCase().includes('register')) {
    return 'register-qr';
  }
  if (target.startsWith('prescription')) {
    return target;
  }

  // Root / or #home: load public hospital website
  if (!target || target === 'home') {
    return 'home';
  }

  // Dedicated Portals
  if (['patient', 'patient-portal', 'patient_portal', 'patient_dashboard'].includes(target)) {
    return 'patient_portal';
  }
  if (['staff', 'staff-panel', 'staff_panel', 'staff_portal'].includes(target)) {
    return 'staff_portal';
  }

  // Public Pages
  if (['about', 'doctors', 'departments', 'booking', 'contact', 'auth'].includes(target)) {
    return target;
  }

  return 'home';
}

function MainApp() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activePage, setActivePage] = useState(getInitialPage);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);

  // Quick Booking Form Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingModalDoctor, setBookingModalDoctor] = useState(null);
  const [confirmedSlip, setConfirmedSlip] = useState(null);
  const [slipModalOpen, setSlipModalOpen] = useState(false);

  // QR Patient Registration Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const handleSelectDepartment = (deptId = null) => {
    setSelectedDepartmentId(deptId);
    setActivePage('departments');
  };

  // Automatically scroll to top, persist activePage and sync browser URL
  useEffect(() => {
    localStorage.setItem('apexcare_active_page', activePage);
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const targetPath = activePage === 'home' ? '/' : `/${activePage}`;

      if (currentPath !== targetPath && !window.location.hash) {
        window.history.pushState(null, '', targetPath);
      }
    }
  }, [activePage]);

  // Support browser Back/Forward navigation and Hash changes
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '').replace(/^\//, '');
      const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
      let queryTarget = '';
      try {
        const search = new URLSearchParams(window.location.search);
        queryTarget = search.get('page') || search.get('tab') || search.get('p') || search.get('route') || '';
      } catch {}
      const target = queryTarget.toLowerCase() || path || hash;

      if (['superadmin', 'admin', 'super-admin', 'super_admin'].some(k => target === k || target.startsWith(k))) {
        setActivePage('superadmin');
      } else if (['nurse', 'nurse-panel', 'nurse_panel', 'nurse_dashboard'].some(k => target === k || target.startsWith(k))) {
        setActivePage('nurse');
      } else if (['doctor', 'doctor-panel', 'doctor_panel'].some(k => target === k || target.startsWith(k))) {
        setActivePage('doctor');
      } else if (['register-qr', 'register_qr', 'qr-register', 'qr_register', 'patient-qr', 'register'].some(k => target === k || target.startsWith(k)) || (window.location.search && window.location.search.toLowerCase().includes('register'))) {
        setActivePage('register-qr');
      } else if (target.startsWith('prescription')) {
        setActivePage(target);
      } else if (!target || target === 'home') {
        setActivePage('home');
      } else if (['patient', 'patient-portal', 'patient_portal', 'patient_dashboard'].includes(target)) {
        setActivePage('patient_portal');
      } else if (['staff', 'staff-panel', 'staff_panel', 'staff_portal'].includes(target)) {
        setActivePage('staff_portal');
      } else if (target) {
        setActivePage(target);
      } else {
        setActivePage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const handleOpenBookingModal = (doctor = null) => {
    setBookingModalDoctor(doctor);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (appointment) => {
    setConfirmedSlip(appointment);
    setSlipModalOpen(true);
  };

  const handleSelectDoctorForBooking = (doctor) => {
    setSelectedDoctorForBooking(doctor);
    setActivePage('booking');
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-sky-200">Loading MedicalCare Portal...</p>
        </div>
      </div>
    );
  }

  // 1. Super Admin Panel Dedicated View (/superadmin or /admin)
  if (activePage === 'superadmin' || activePage === 'admin') {
    return <SuperAdminDashboard setActivePage={setActivePage} />;
  }

  // 2. Nurse Panel Dedicated View (/nurse)
  if (activePage === 'nurse') {
    return <NurseDashboard setActivePage={setActivePage} />;
  }

  // 3. Doctor Panel Dedicated View
  if (activePage === 'doctor' || activePage === 'doctor_panel') {
    return <DoctorPanel setActivePage={setActivePage} />;
  }

  // 4. QR Patient Registration Page View (Dedicated Full-Screen Patient Intake Form - No Bottom App Bar)
  if (activePage === 'register-qr' || activePage === 'qr_registration') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <QrRegistrationPage setActivePage={setActivePage} />
      </div>
    );
  }

  // 5. Printable Prescription Page View
  if (activePage === 'prescription' || activePage.startsWith('prescription')) {
    const rxId = activePage.includes('/') ? activePage.split('/')[1] : null;
    return <PrescriptionViewPage prescriptionId={rxId} onBack={() => setActivePage('home')} />;
  }

  // Patient Portal Dedicated View
  if (activePage === 'patient_portal' || activePage === 'patient_dashboard') {
    if (!isAuthenticated) {
      return <AuthPage setActivePage={setActivePage} initialMode="signin" />;
    }
    return <PatientPortal setActivePage={setActivePage} />;
  }

  // Staff Portal Dedicated View
  if (activePage === 'staff_portal') {
    if (!isAuthenticated) {
      return <AuthPage setActivePage={setActivePage} initialMode="signin" />;
    }
    return <StaffPortal setActivePage={setActivePage} />;
  }

  // Render Public Hospital Website
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-100 selection:text-sky-900 pb-20 md:pb-0">
      {/* Mobile PWA Install Banner */}
      <PwaInstallPrompt />

      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenBookingModal={() => handleOpenBookingModal()}
        onOpenQrModal={() => setQrModalOpen(true)}
      />

      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            setActivePage={setActivePage}
            onSelectDoctorForBooking={handleSelectDoctorForBooking}
            onOpenBookingModal={handleOpenBookingModal}
            onSelectDepartment={handleSelectDepartment}
            onOpenQrModal={() => setQrModalOpen(true)}
          />
        )}
        {activePage === 'about' && <AboutPage setActivePage={setActivePage} />}
        {activePage === 'doctors' && (
          <DoctorsPage
            setActivePage={setActivePage}
            onSelectDoctorForBooking={handleSelectDoctorForBooking}
            onOpenBookingModal={handleOpenBookingModal}
            onOpenQrModal={() => setQrModalOpen(true)}
          />
        )}
        {activePage === 'departments' && (
          <DepartmentsPage
            setActivePage={setActivePage}
            onSelectDoctorForBooking={handleSelectDoctorForBooking}
            onOpenBookingModal={handleOpenBookingModal}
            onOpenQrModal={() => setQrModalOpen(true)}
            initialDepartmentId={selectedDepartmentId}
          />
        )}
        {activePage === 'booking' && (
          <AppointmentBookingPage
            initialDoctor={selectedDoctorForBooking}
            setActivePage={setActivePage}
          />
        )}
        {activePage === 'contact' && <ContactPage setActivePage={setActivePage} />}
        {activePage === 'auth' && <AuthPage setActivePage={setActivePage} />}
      </main>

      <Footer setActivePage={setActivePage} />

      {/* Native Mobile App Bottom Navigation Dock */}
      <MobileAppBottomBar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenQrModal={() => setQrModalOpen(true)}
        onOpenBookingModal={() => handleOpenBookingModal()}
      />

      {/* Quick Booking Form Modal */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        selectedDoctor={bookingModalDoctor}
        onSuccess={handleBookingSuccess}
      />

      {/* Confirmation Slip Voucher Modal */}
      <AppointmentSlipModal
        isOpen={slipModalOpen}
        onClose={() => setSlipModalOpen(false)}
        appointment={confirmedSlip}
      />

      {/* Fast QR Patient Registration Modal */}
      <QrRegistrationModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onOpenDirectForm={() => setActivePage('register-qr')}
      />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('apexcare_active_page');
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
          <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚕️
            </div>
            <h2 className="text-xl font-bold text-white">MedicalCare Healthcare Portal</h2>
            <p className="text-xs text-slate-300">
              A view update occurred. Click below to refresh or cleanly return to the hospital portal.
            </p>

            {this.state.error?.message && (
              <div className="text-left bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-rose-300 break-words">
                <span className="text-slate-500 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Diagnostic Log:</span>
                {this.state.error.message}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
              >
                Reload View
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
