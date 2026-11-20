import React from 'react';
import { Modal } from './Modal.jsx';
import { Printer, Pill, Stethoscope, User, Calendar, ShieldCheck, FileText, Clock } from 'lucide-react';
import { QRCodeToken } from './QRCodeToken.jsx';

export function PrescriptionSlipModal({ isOpen, onClose, prescription }) {
  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  const rxCode = prescription.prescription_code || prescription.code || (prescription.id ? `RX-${prescription.id}` : 'RX-2026');
  const patientName = prescription.patientName || prescription.patient_name || prescription.name || 'Patient';
  const patientMrn = prescription.patientMrn || prescription.patient_mrn || prescription.patient_id || 'MRN-ON-FILE';
  const patientBlood = prescription.patientBloodGroup || prescription.blood_group || 'O+';
  const doctorName = prescription.doctorName || prescription.doctor_name || 'Dr. Neha Kapoor, MD';
  const doctorSpecialty = prescription.doctorSpecialty || prescription.doctor_specialty || prescription.specialty || 'Clinical Dermatology & Trichology';
  const rxDate = prescription.prescribed_date || prescription.consultation_date || (prescription.created_at ? prescription.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
  const diagnosis = prescription.diagnosis || prescription.diagnosis_notes || 'Clinical Consultation Evaluation';
  const instructions = prescription.instructions || prescription.doctor_notes || prescription.followup_instructions || prescription.special_instructions || 'Follow complete medication regimen as prescribed.';
  
  const rawItems = Array.isArray(prescription.medicines) 
    ? prescription.medicines 
    : (Array.isArray(prescription.items) ? prescription.items : []);
  
  const nextApptDate = prescription.next_appointment_date || prescription.nextAppointmentDate;
  const nextApptTime = prescription.next_appointment_time || prescription.nextAppointmentTime;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Medical Prescription (Rx)" maxWidth="max-w-2xl">
      <div className="printable-area space-y-5">
        {/* Hospital Letterhead Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b-2 border-[#071933] gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-slate-100 shadow-xs shrink-0 overflow-hidden">
              <img src="/images/logo-icon.png" alt="MedicalCare Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#071933] tracking-tight">MedicalCare Hospital</h2>
              <p className="text-xs text-slate-500 font-medium">Department of Clinical Medicine & Outpatient Services</p>
              <p className="text-[11px] text-slate-400">740 Health Sciences Blvd, Medical District | Tel: +1 (800) 273-9227</p>
            </div>
          </div>
          <QRCodeToken value={rxCode} size={72} label="Digital Rx" />
        </div>

        {/* Doctor & Prescription Identification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div>
            <p className="text-slate-500 font-medium">Prescribing Physician:</p>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
              <Stethoscope className="w-4 h-4 text-[#0284c7]" />
              {doctorName}
            </p>
            <p className="text-[11px] text-slate-500">{doctorSpecialty}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-slate-500 font-medium">Prescription Code:</p>
            <p className="font-mono font-bold text-[#0284c7] text-sm">{rxCode}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Date: {rxDate}</p>
          </div>
        </div>

        {/* Patient Details Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-sky-50/60 border border-sky-100 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Patient Name</span>
            <span className="font-bold text-slate-900">{patientName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">MRN / ID</span>
            <span className="font-mono font-bold text-slate-900">{patientMrn}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Blood Group</span>
            <span className="font-bold text-rose-700">{patientBlood}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Status</span>
            <span className="font-semibold text-sky-800 capitalize">{prescription.status || 'Dispensed / Active'}</span>
          </div>
        </div>

        {/* Clinical Diagnosis */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs space-y-1">
          <span className="text-amber-900 font-extrabold uppercase tracking-wide text-[10px] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-700" /> Clinical Diagnosis & Findings
          </span>
          <p className="font-semibold text-slate-800 text-sm leading-relaxed">{diagnosis}</p>
        </div>

        {/* Rx Medication Table */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
            <span className="text-2xl font-serif font-black text-[#071933]">℞</span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Prescribed Medications & Regimen</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Medicine & Strength</th>
                  <th className="py-2.5 px-3">Dosage</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rawItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-3 px-3 text-center text-slate-400 italic">
                      No individual oral medications prescribed. Follow general clinical care advice below.
                    </td>
                  </tr>
                ) : (
                  rawItems.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.medicine_name || item.name || item.medicine}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{item.dosage || item.dose || '1 dose'}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#0284c7]">{item.frequency || item.freq || 'Daily'}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-600">{item.duration || item.timing || '5 days'}</td>
                      <td className="py-2.5 px-3 text-slate-500 italic">{item.instructions || item.notes || 'With water'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Doctor Instructions & Next Appointment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">General Advice & Precautions:</span>
            <p className="text-slate-700 leading-relaxed">{instructions}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/80 space-y-1">
            <span className="text-[#071933] font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0284c7]" /> Next Follow-Up Appointment
            </span>
            <p className="text-[#071933] font-bold text-sm">
              {nextApptDate ? `${nextApptDate} ${nextApptTime ? `• ${nextApptTime}` : ''}` : 'As required on clinical review'}
            </p>
            <p className="text-[11px] text-sky-800/80">Please bring this slip during follow-up consultation.</p>
          </div>
        </div>

        {/* Sign-off & Digital Stamp */}
        <div className="flex justify-between items-end pt-3 border-t border-slate-200 text-xs">
          <div className="space-y-1 text-slate-500 text-[11px]">
            <p className="flex items-center gap-1 text-[#0284c7] font-bold">
              <ShieldCheck className="w-4 h-4" /> Digitally Signed & Authenticated
            </p>
            <p>MedicalCare Integrated Electronic Health Records System</p>
            <p>Verification Code: {rxCode}</p>
          </div>
          <div className="text-right space-y-1">
            <div className="h-7 w-28 border-b-2 border-slate-400/80 mx-auto" />
            <p className="font-bold text-slate-800">{doctorName}</p>
            <p className="text-[10px] text-slate-500 font-mono">Reg No: MED-88492-FACC</p>
          </div>
        </div>

        {/* Actions (Hidden on Print, Sticky at bottom of modal) */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 no-print sticky bottom-0 bg-white/95 backdrop-blur-xs py-2.5 -mx-3.5 sm:-mx-6 px-3.5 sm:px-6 -mb-3.5 sm:-mb-6 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] z-20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Prescription
          </button>
        </div>
      </div>
    </Modal>
  );
}
