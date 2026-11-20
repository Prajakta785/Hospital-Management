import React from 'react';
import {
  Phone,
  MapPin,
  Mail,
  Calendar,
  ChevronRight
} from 'lucide-react';

export function Footer({ setActivePage }) {
  return (
    <footer className="bg-[#022c22] text-slate-200 pt-12 pb-8 border-t border-[#044434] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4 Column Grid with vertical dividers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-[#044434]/80 pb-10 border-b border-[#044434]/60">
          
          {/* Column 1: Brand & Accreditations */}
          <div className="lg:pr-8 space-y-4">
            <div
              onClick={() => setActivePage('home')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-xs border border-emerald-200 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                <img
                  src="/images/logo-icon.png"
                  alt="Health Care Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold text-white tracking-tight font-display">MedicalCare</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#059669] text-white shadow-xs">
                    HOSPITAL
                  </span>
                </div>
                <p className="text-[9px] font-bold text-emerald-300/80 uppercase tracking-wider">Medical Center & Research</p>
              </div>
            </div>

            <p className="text-xs text-slate-300/85 leading-relaxed">
              MedicalCare is dedicated to providing compassionate, advanced, and patient-centered healthcare. Your health is our commitment. Excellence is our promise.
            </p>
          </div>

          {/* Column 2: QUICK HOSPITAL SERVICES */}
          <div className="lg:px-8 space-y-3.5">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              QUICK HOSPITAL ACCESS
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActivePage('doctors')}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span className="text-emerald-500 group-hover:text-emerald-300 transition-colors">›</span>
                  <span>Doctors & Specialists</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('departments')}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span className="text-emerald-500 group-hover:text-emerald-300 transition-colors">›</span>
                  <span>Clinical Departments</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('booking')}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span className="text-emerald-500 group-hover:text-emerald-300 transition-colors">›</span>
                  <span>Book Clinical Appointment</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('register-qr')}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span className="text-emerald-500 group-hover:text-emerald-300 transition-colors">›</span>
                  <span>Patient QR Self-Registration</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('about')}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span className="text-emerald-500 group-hover:text-emerald-300 transition-colors">›</span>
                  <span>About Our Medical Center</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('contact')}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 group text-left cursor-pointer"
                >
                  <span className="text-emerald-500 group-hover:text-emerald-300 transition-colors">›</span>
                  <span>Emergency & Contact Info</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: CENTERS OF EXCELLENCE */}
          <div className="lg:px-8 space-y-3.5">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              CENTERS OF EXCELLENCE
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                'Cardiology & Heart Care',
                'Cancer Care & Oncology',
                'Orthopedics & Joint Replacement',
                'Neurosciences & Brain Care',
                'Women\'s Health & Maternity',
                'Digestive & Liver Care'
              ].map((center) => (
                <li key={center}>
                  <button
                    onClick={() => setActivePage('departments')}
                    className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 group text-left cursor-pointer"
                  >
                    <span className="text-emerald-500 group-hover:text-emerald-300 transition-colors">›</span>
                    <span>{center}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: EMERGENCY & LOCATION */}
          <div className="lg:pl-8 space-y-3.5">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              EMERGENCY & LOCATION
            </h4>

            <div className="space-y-3 text-xs">
              {/* Emergency Phone */}
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <p className="text-slate-300/90 text-[11px]">24/7 Emergency & Medical Help Desk:</p>
                  <a
                    href="tel:18002739227"
                    className="text-white font-bold hover:text-emerald-300 transition-colors text-xs"
                  >
                    1-800-273-9227
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-tight text-slate-300/90 text-xs">
                  <p className="font-semibold text-white">MedicalCare Medical Center</p>
                  <p>740 Health Sciences Blvd,</p>
                  <p>Chicago, IL - 60611</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="mailto:care@medicalcarehospital.com"
                  className="text-slate-300 hover:text-emerald-300 transition-colors text-xs"
                >
                  care@medicalcarehospital.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-300/70 gap-3">
          <p>© {new Date().getFullYear()} MedicalCare. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-emerald-300/80">
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setActivePage('about')}>
              Privacy Policy
            </span>
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setActivePage('about')}>
              Terms of Care
            </span>
            <span className="hover:text-white cursor-pointer transition-colors text-amber-300 font-semibold" onClick={() => setActivePage('doctor')}>
              🩺 Doctor Panel
            </span>
            <span className="hover:text-white cursor-pointer transition-colors text-emerald-300 font-semibold" onClick={() => setActivePage('nurse')}>
              👩‍⚕️ Nurse Desk
            </span>
            <span className="hover:text-white cursor-pointer transition-colors text-yellow-400 font-semibold" onClick={() => setActivePage('superadmin')}>
              👑 Super Admin
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
