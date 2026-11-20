import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  PhoneCall,
  Menu,
  X,
  Stethoscope,
  Clock,
  MapPin,
  ShieldCheck,
  Activity,
  User,
  QrCode
} from 'lucide-react';

export function Navbar({ activePage, setActivePage, onOpenBookingModal, onOpenQrModal }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'departments', label: 'Departments' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
  };

  const tickerItems = [
    {
      icon: <PhoneCall className="w-3 h-3 text-emerald-400 shrink-0" />,
      label: "24/7 Trauma & Emergency:",
      highlight: "1-800-273-9227",
      href: "tel:18002739227"
    },
    {
      icon: <Clock className="w-3 h-3 text-emerald-300 shrink-0" />,
      label: "OPD Consultations:",
      highlight: "Mon – Sat 8:00 AM – 8:00 PM"
    },
    {
      icon: <MapPin className="w-3 h-3 text-emerald-300 shrink-0" />,
      label: "Hospital Campus:",
      highlight: "740 Health Sciences Blvd, Chicago"
    },
    {
      icon: <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />,
      label: "Accreditation:",
      highlight: "JCI Gold Seal & NABH Certified Center"
    },
    {
      icon: <Activity className="w-3 h-3 text-emerald-300 shrink-0" />,
      label: "Rapid Cardiac Ambulance Response:",
      highlight: "Toll-Free 108 / 1-800-911-CARE",
      href: "tel:18009112273"
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full shadow-xs">
      {/* Top Emergency & Info Auto-scrolling Ticker in Deep Forest Green */}
      <div className="bg-[#032e1d] text-emerald-100 text-[11px] py-1.5 overflow-hidden border-b border-[#05422a] select-none ticker-mask">
        <div className="animate-ticker flex items-center">
          {[0, 1].map((copyIndex) => (
            <div key={copyIndex} className="flex items-center shrink-0">
              {tickerItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-6 whitespace-nowrap">
                  {item.icon}
                  <span className="text-emerald-200/90 font-medium">{item.label}</span>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-white font-bold hover:text-emerald-300 underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      {item.highlight}
                    </a>
                  ) : (
                    <span className="text-white font-semibold">{item.highlight}</span>
                  )}
                  <span className="ml-6 text-emerald-700/80 font-bold select-none">•</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Navbar with sleek reduced height */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo with Green Heart & Cross */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center p-0.5 shadow-xs border border-emerald-200 group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src="/images/logo-icon.png"
                alt="Health Care Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold text-[#042f1a] tracking-tight font-display">MedicalCare</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#059669] text-white shadow-xs">HOSPITAL</span>
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Medical Center & Research</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1.5">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`transition-all duration-200 cursor-pointer ${
                  activePage === link.id
                    ? 'bg-[#059669] hover:bg-[#047857] text-white font-bold px-4 py-1.5 rounded-full shadow-md shadow-emerald-700/20 text-xs sm:text-sm'
                    : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/80 px-3.5 py-1.5 rounded-full font-medium text-xs sm:text-sm'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* QR Register Action */}
            <button
              onClick={() => onOpenQrModal ? onOpenQrModal() : handleNavClick('register-qr')}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200/90 text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Fast QR Patient Self-Registration"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-700" />
              <span>QR Register</span>
            </button>

            {/* 24/7 Emergency Helpline Button */}
            <a
              href="tel:18002739227"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 transition-all shadow-xs group"
              title="Click to call 24/7 Emergency & Trauma Hotline"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
              <PhoneCall className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 leading-none">Emergency 24/7</span>
                <span className="text-xs font-extrabold text-rose-700 leading-tight">1800-273-9227</span>
              </div>
            </a>
          </div>

          {/* Mobile Menu & Quick App Icons */}
          <div className="flex sm:hidden items-center gap-1.5">
            <a
              href="tel:18002739227"
              className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 active:scale-95 transition-transform"
              title="Emergency Call"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
            <button
              onClick={() => onOpenQrModal ? onOpenQrModal() : handleNavClick('register-qr')}
              className="p-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 active:scale-95 transition-transform cursor-pointer"
              title="QR Register"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-100 bg-white px-4 pt-2.5 pb-5 space-y-1.5 animate-in slide-in-from-top duration-200">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activePage === link.id
                    ? 'bg-[#059669] text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <a
                href="tel:18002739227"
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
                <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                <span>Emergency: 1800-273-9227</span>
              </a>

              {isAuthenticated ? (
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      logout();
                      setActivePage('home');
                    }}
                    className="w-full text-center py-2 text-xs text-rose-600 hover:text-rose-800 font-bold bg-rose-50 rounded-xl cursor-pointer"
                  >
                    Sign Out ({user?.name || 'User'})
                  </button>
                </div>
              ) : null}

              {/* Portals & QR Quick links for mobile */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenQrModal) onOpenQrModal();
                  else handleNavClick('register-qr');
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-200 text-xs font-bold"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                <span>📱 Scan QR Patient Registration</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
