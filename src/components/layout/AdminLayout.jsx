import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard,
  UsersRound,
  Stethoscope,
  CalendarClock,
  BedDouble,
  Package,
  Microscope,
  ReceiptIndianRupee,
  FileBarChart,
  Settings2,
  LogOut,
  Globe,
  Menu,
  X,
  ShieldAlert,
  HeartHandshake,
  QrCode,
  ShieldCheck,
  Building2,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Search,
  Bell
} from 'lucide-react';

export function AdminLayout({ activePage, setActivePage, children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Grouped Menu Structure for Clean Organization
  const menuSections = [
    {
      title: 'CLINICAL TRIAGE & PORTALS',
      items: [
        { id: 'admin_overview', label: 'Executive Overview', icon: LayoutDashboard },
        { id: 'nurse', label: 'Nurse Triage Desk', icon: HeartHandshake, badge: 'Live' },
        { id: 'doctor', label: 'Doctor Consultation Desk', icon: Stethoscope, badge: 'Rx' },
        { id: 'register-qr', label: 'QR Patient Registration', icon: QrCode }
      ]
    },
    {
      title: 'PATIENT CARE & CLINICAL SERVICES',
      items: [
        { id: 'admin_patients', label: 'Patient Registry & EHR', icon: UsersRound, badge: 15 },
        { id: 'admin_appointments', label: 'Appointments Schedule', icon: CalendarClock, badge: 2 },
        { id: 'admin_beds', label: 'Wards & Bed Map', icon: BedDouble, badge: 3 },
        { id: 'admin_lab', label: 'Lab Diagnostics', icon: Microscope, badge: 5 },
        { id: 'admin_pharmacy', label: 'Pharmacy & Stock', icon: Package, badge: 2 }
      ]
    },
    {
      title: 'HOSPITAL GOVERNANCE & FINANCE',
      items: [
        { id: 'admin_doctors', label: 'Doctor Directory & Roster', icon: Stethoscope, badge: 10 },
        { id: 'admin_staff', label: 'Staff & Attendance Roster', icon: UsersRound, badge: 5 },
        { id: 'admin_departments', label: 'Departments & Analytics', icon: Building2 },
        { id: 'admin_billing', label: 'Billing & Invoices', icon: ReceiptIndianRupee, badge: 1 },
        { id: 'admin_reports', label: 'Reports & Analytics', icon: FileBarChart },
        { id: 'admin_settings', label: 'Settings & Audit Trail', icon: Settings2 }
      ]
    }
  ];

  const handlePageChange = (id) => {
    setActivePage(id);
    setSidebarOpen(false);
  };

  // Find currently active item and section
  let currentItem = null;
  let currentSection = null;
  for (const sec of menuSections) {
    const found = sec.items.find(i => i.id === activePage);
    if (found) {
      currentItem = found;
      currentSection = sec;
      break;
    }
  }
  if (!currentItem) {
    currentItem = menuSections[0].items[0];
    currentSection = menuSections[0];
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`w-72 bg-gradient-to-b from-[#022119] via-[#022c22] to-[#011a14] text-white flex flex-col h-screen shrink-0 border-r border-[#044434] shadow-xl transition-all duration-300 z-50 ${
          sidebarOpen ? 'fixed inset-y-0 left-0' : 'hidden md:flex'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 shrink-0 px-5 border-b border-[#044434] flex items-center justify-between bg-[#022119] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden">
              <img
                src="/images/logo-icon.png"
                alt="MedicalCare Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold tracking-tight font-display text-white">MedicalCare</h1>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-400 text-slate-950">
                  ADMIN
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold">
                Hospital Command Center
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-emerald-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Structured Categorized Sidebar Menu */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 sidebar-scrollbar">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <div className="px-3 pb-1 text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider flex items-center justify-between">
                <span>{section.title}</span>
              </div>

              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                const badge = item.badge;

                return (
                  <button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#059669] text-white font-extrabold shadow-sm translate-x-0.5'
                        : 'text-slate-200 hover:bg-white/12 hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {Icon && (
                        <Icon className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive ? 'text-white font-bold' : 'text-emerald-400'
                        }`} />
                      )}
                      <span className="truncate text-left">{item.label}</span>
                    </div>

                    {badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                        isActive
                          ? 'bg-[#022119] text-emerald-300'
                          : typeof badge === 'number'
                          ? 'bg-[#033b20] text-emerald-200 border border-emerald-700/60'
                          : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                      }`}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-[#044434] bg-[#022119]/90 space-y-2.5">
          <button
            onClick={() => setActivePage('home')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#033b20]/60 hover:bg-[#033b20] text-emerald-300 border border-emerald-700/60 text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Return to Public Hospital Site</span>
          </button>

          {/* Admin User Badge */}
          <div className="p-2.5 rounded-xl bg-[#033b20]/40 border border-emerald-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#059669] text-white flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || 'Dr. Marcus Vance'}
                </p>
                <p className="text-[10px] text-emerald-300 truncate">
                  Super Administrator
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                setActivePage('admin_login');
              }}
              className="text-emerald-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider hidden sm:inline-block">
                  {currentSection?.title || 'ADMIN MODULE'}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400 hidden sm:inline-block" />
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-display truncate">
                  {currentItem?.label || 'Dashboard Overview'}
                </h2>
              </div>
            </div>
          </div>

          {/* Quick Role & Portal Switchers in Header - Open Dedicated Standalone Panels */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <a
                href="/nurse"
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    setActivePage('nurse');
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                  activePage === 'nurse'
                    ? 'bg-white text-[#059669] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Open Dedicated Nurse Desk (Ctrl+Click to open in new tab)"
              >
                👩‍⚕️ Nurse Desk
              </a>
              <a
                href="/doctor"
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    setActivePage('doctor');
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                  activePage === 'doctor'
                    ? 'bg-white text-[#059669] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Open Dedicated Doctor Panel (Ctrl+Click to open in new tab)"
              >
                🩺 Doctor Panel
              </a>
            </div>

            <a
              href="/register-qr"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey) {
                  e.preventDefault();
                  setActivePage('register-qr');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
              title="Open QR Patient Registration (Ctrl+Click to open in new tab)"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">QR Intake</span>
            </a>

            <button
              onClick={() => setActivePage('home')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#059669]" />
              <span>Public Site</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 min-w-0 w-full admin-main-scroll bg-slate-50/60">
          <div className="max-w-7xl w-full mx-auto min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
export default AdminLayout;
