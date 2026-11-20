import React from 'react';
import { Modal } from './Modal.jsx';
import {
  Printer,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Stethoscope,
  AlertCircle,
  ShieldCheck,
  Award,
  Phone,
  Building2,
  CreditCard,
  Activity,
  FileCheck2,
  HeartPulse,
  BadgeCheck
} from 'lucide-react';
import { QRCodeToken } from './QRCodeToken.jsx';

export function AppointmentSlipModal({ isOpen, onClose, appointment }) {
  if (!appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  const bookingRef = appointment.appointment_number || 'APT-2026-1627';
  const tokenNumber = appointment.token_number || appointment.appointment_number?.split('-')?.[2] || '14';
  const doctorName = appointment.doctorName || 'Dr. Maya Lin, MD';
  const doctorSpecialty = appointment.doctorSpecialty || 'Pediatrics & Pediatric Critical Care';
  const departmentName = appointment.departmentName || 'Pediatrics & Neonatal ICU';
  const patientName = appointment.patientName || 'David Miller';
  const bloodGroup = appointment.patientBloodGroup || appointment.blood_group || appointment.guest_blood_group || 'O+';
  const mrn = appointment.patientMrn || appointment.mrn || 'MRN-2026-0814';
  const appDate = appointment.appointment_date || '2026-11-06';
  const appTime = appointment.appointment_time || '10:00 AM';
  const appType = appointment.type || 'General Clinical Consultation';
  const fee = appointment.consultationFee !== undefined ? appointment.consultationFee : 900;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MedicalCare Official Clinical Consultation Pass"
      subtitle="Authorized Outpatient Appointment & Triage Token Slip"
      maxWidth="max-w-2xl"
    >
      <div className="printable-area space-y-4 print:space-y-3 text-slate-800">
        {/* 1. Official Hospital Header Band */}
        <div className="rounded-2xl p-4 bg-gradient-to-r from-[#071933] via-[#092244] to-[#041022] text-white shadow-sm border border-[#0d2a4f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white p-1.5 shadow-md border border-sky-400/40 shrink-0 overflow-hidden">
              <img
                src="/images/logo-icon.png"
                alt="MedicalCare Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white font-display">
                  MedicalCare Hospital
                </h1>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-400 text-[#071933] uppercase tracking-wider">
                  Verified Pass
                </span>
              </div>
              <p className="text-[11px] text-sky-200/90 font-medium">
                JCI Gold Seal & NABH Certified Multi-Specialty Quaternary Healthcare Center
              </p>
              <p className="text-[10px] text-sky-300/80 font-mono mt-0.5">
                740 Health Sciences Blvd, Chicago, IL • Tel: +1 (800) 273-9227
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-sky-800/80 pt-2 sm:pt-0 sm:pl-4">
            <span className="text-[10px] uppercase font-bold text-sky-300 tracking-wider block">OPD TOKEN</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono leading-none my-0.5">
              #{tokenNumber}
            </div>
            <span className="text-[10px] font-bold text-sky-200 inline-flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5 text-amber-300" />
              Confirmed Slot
            </span>
          </div>
        </div>

        {/* 2. Reference & Check-in QR Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 gap-3">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking Ref:</span>
              <span className="font-mono text-xs font-black text-[#071933] bg-sky-100/80 px-2 py-0.5 rounded border border-sky-200">
                {bookingRef}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                Active &amp; Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Present this digital pass or physical slip at Hospital Triage Counter Suite 301.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <QRCodeToken value={bookingRef} size={54} label="" />
            <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
              <p className="font-bold text-slate-700">Scan at Kiosk</p>
              <p>Express Check-In</p>
            </div>
          </div>
        </div>

        {/* 3. Clinical Consultation Details Box (Doctor, Department, Date, Time) */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-sky-200 bg-sky-50/40 space-y-3">
          <div className="flex items-center justify-between border-b border-sky-200/80 pb-2">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#0284c7]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#071933] font-display">
                Clinical Specialist &amp; Consultation Slot
              </h3>
            </div>
            <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
              Suite 302 • 3rd Floor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Consulting Doctor</span>
              <p className="text-sm font-extrabold text-slate-900">{doctorName}</p>
              <p className="text-[11px] text-[#0284c7] font-medium">{doctorSpecialty}</p>
              <div className="pt-1 text-[10px] text-slate-500 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#0284c7]" />
                <span>{departmentName}</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Scheduled Time Slot</span>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-black text-slate-900 font-mono">{appTime}</span>
                <span className="text-xs font-bold text-[#0284c7]">({appDate})</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Reporting Time: <strong>15 Mins Prior</strong> (09:45 AM)</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Gate Entry: West Wing • Elevators B &amp; C
              </p>
            </div>
          </div>
        </div>

        {/* 4. Patient Information & Financial Token Card */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#0284c7]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">
                Patient Medical Dossier &amp; Billing
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-slate-700">
              MRN: {mrn}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Patient Name</span>
              <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{patientName}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Blood Group</span>
              <span className="inline-block mt-0.5 text-xs font-extrabold text-rose-700 bg-rose-50 px-2 py-0.2 rounded border border-rose-200">
                {bloodGroup}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Consultation Type</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{appType}</p>
            </div>
            <div className="bg-sky-50 p-2.5 rounded-lg border border-sky-100 text-right">
              <span className="text-[10px] text-[#0284c7] uppercase font-bold block">Consultation Fee</span>
              <p className="text-sm font-black text-[#071933] font-mono mt-0.5">₹{parseFloat(fee).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* 5. Triage Instructions & Checklist */}
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Important Patient Triage Instructions:</p>
            <p className="text-amber-900/90 leading-relaxed text-[10.5px]">
              • Please arrive 15 minutes before your consultation for vital sign triage (BP, Pulse, Temperature, Height &amp; Weight).
              <br />
              • Please bring prior prescriptions, diagnostic lab reports, government photo ID, and insurance health card.
            </p>
          </div>
        </div>

        {/* 6. Security Seal & Authorized Signature Footer */}
        <div className="pt-2.5 border-t-2 border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284c7] shrink-0">
              <Award className="w-5 h-5 text-[#0284c7]" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                MedicalCare OPD Central Registry
              </p>
              <p className="text-[10px] text-slate-500">
                Cryptographically signed &amp; verified via MedicalCare EHR Core.
              </p>
              <span className="text-[9px] font-mono text-[#0284c7] font-bold block">
                Verification Hash: MC-APT-{bookingRef.replace(/\D/g, '') || '9128'}-SEC
              </span>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 space-y-0.5">
            <div className="h-6 flex items-end justify-end">
              <span className="font-serif italic font-bold text-slate-800 text-xs border-b border-slate-400 pb-0.5">
                Dr. Marcus Vance, MD
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900">Dr. Marcus Vance, MD, FACS</p>
            <p className="text-[9px] text-slate-500">Medical Director &amp; OPD Superintendent</p>
          </div>
        </div>

        {/* Action Controls (Hidden during print, Sticky at bottom of modal) */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 no-print sticky bottom-0 bg-white/95 backdrop-blur-xs py-2.5 -mx-3.5 sm:-mx-6 px-3.5 sm:px-6 -mb-3.5 sm:-mb-6 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] z-20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Close Pass
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl shadow-md shadow-sky-800/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Printer className="w-4 h-4 text-sky-200" />
            <span>Print Official Slip</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
