import React from 'react';
import {
  Home,
  Stethoscope,
  Building2,
  QrCode,
  ShieldCheck,
  CalendarCheck2,
  Sparkles
} from 'lucide-react';

export function MobileAppBottomBar({
  activePage,
  setActivePage,
  onOpenQrModal,
  onOpenBookingModal
}) {
  const isQrActive = activePage === 'register-qr' || activePage === 'qr_registration';
  const isHomeActive = activePage === 'home';
  const isDoctorsActive = activePage === 'doctors';
  const isDeptsActive = activePage === 'departments';
  const isPortalActive = ['superadmin', 'doctor', 'nurse', 'staff_portal', 'auth'].includes(activePage);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 select-none print:hidden">
      {/* Frosted Glass Floating Dock Container with iOS Safe Area support */}
      <div className="bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] px-2 pt-1.5 pb-safe">
        <nav className="flex items-center justify-around max-w-lg mx-auto relative h-14">
          
          {/* TAB 1: HOME */}
          <button
            type="button"
            onClick={() => setActivePage('home')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
              isHomeActive
                ? 'text-[#059669] font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="relative">
              <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              {isHomeActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#059669]" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-none">Home</span>
          </button>

          {/* TAB 2: DOCTORS */}
          <button
            type="button"
            onClick={() => setActivePage('doctors')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
              isDoctorsActive
                ? 'text-[#059669] font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="relative">
              <Stethoscope className={`w-5 h-5 ${isDoctorsActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              {isDoctorsActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#059669]" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-none">Doctors</span>
          </button>

          {/* TAB 3: CENTER HERO ACTION (OPD QR REGISTRATION PASS) */}
          <div className="flex-1 flex flex-col items-center justify-center relative -top-3">
            <button
              type="button"
              onClick={() => setActivePage('register-qr')}
              className="relative group cursor-pointer"
              title="OPD Self-Registration Pass"
            >
              {/* Pulsing ring indicator */}
              <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping opacity-70" />
              
              {/* Elevated floating circle */}
              <div className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 border-2 ${
                isQrActive
                  ? 'bg-gradient-to-br from-[#022c22] via-[#044434] to-[#059669] text-white border-amber-300 shadow-emerald-950/40'
                  : 'bg-gradient-to-br from-[#059669] via-[#047857] to-[#065f46] text-white border-white shadow-emerald-900/30'
              }`}>
                <QrCode className="w-6 h-6 stroke-[2.2]" />
              </div>
            </button>
            <span className={`text-[10px] mt-0.5 font-extrabold tracking-tight leading-none ${
              isQrActive ? 'text-[#059669]' : 'text-slate-700'
            }`}>
              OPD Pass
            </span>
          </div>

          {/* TAB 4: DEPARTMENTS */}
          <button
            type="button"
            onClick={() => setActivePage('departments')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
              isDeptsActive
                ? 'text-[#059669] font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="relative">
              <Building2 className={`w-5 h-5 ${isDeptsActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              {isDeptsActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#059669]" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-none">Depts</span>
          </button>

          {/* TAB 5: STAFF / PORTAL LOGIN */}
          <button
            type="button"
            onClick={() => setActivePage('superadmin')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
              isPortalActive
                ? 'text-[#059669] font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="relative">
              <ShieldCheck className={`w-5 h-5 ${isPortalActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              {isPortalActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#059669]" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-none">Staff Portal</span>
          </button>

        </nav>
      </div>
    </div>
  );
}

export default MobileAppBottomBar;
