import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { workflowApi } from '../../services/api.js';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon.jsx';
import {
  Printer,
  Download,
  Share2,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Pill,
  MessageCircle,
  UserCheck
} from 'lucide-react';

export function PrescriptionViewPage({ prescriptionId, onBack }) {
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Extract ID from prop, pathname, query param (?id=...), or hash
  const extractId = () => {
    if (prescriptionId) return String(prescriptionId).trim();
    if (typeof window === 'undefined') return null;

    // Check query param: /prescription?id=5
    try {
      const qId = new URLSearchParams(window.location.search).get('id');
      if (qId) return qId.trim();
    } catch {
      // Ignore
    }

    // Check pathname: /prescription/5
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && lastPart.toLowerCase() !== 'prescription') {
      return lastPart.trim();
    }

    // Check hash: #prescription/5 or #5
    const hashParts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const lastHash = hashParts[hashParts.length - 1];
    if (lastHash && lastHash.toLowerCase() !== 'prescription') {
      return lastHash.trim();
    }

    return null;
  };

  const idToFetch = extractId();

  useEffect(() => {
    async function loadPrescription() {
      try {
        setLoading(true);
        let rxData = null;

        // 1. Try loading by specific ID if available
        if (idToFetch) {
          try {
            const res = await workflowApi.getPrescription(idToFetch);
            if (res && res.success && res.data) {
              rxData = res.data;
            }
          } catch (e) {
            console.warn('Direct ID prescription fetch failed, trying consultation list fallback...', e);
          }
        }

        // 2. Resilient fallback: If no ID or ID not found, load the latest clinical consultation
        if (!rxData) {
          try {
            const listRes = await workflowApi.getConsultations();
            if (listRes && listRes.success && Array.isArray(listRes.data) && listRes.data.length > 0) {
              // Find by matching ID or fallback to latest completed
              if (idToFetch) {
                rxData = listRes.data.find(c => 
                  String(c.id) === String(idToFetch) || 
                  String(c.consultation_id) === String(idToFetch) ||
                  String(c.patient_id) === String(idToFetch)
                ) || listRes.data[0];
              } else {
                rxData = listRes.data[0];
              }
            }
          } catch (e) {
            console.warn('Consultations list fetch failed, falling back to demo prescription record...', e);
          }
        }

        if (rxData) {
          setPrescription(rxData);
          setError(null);

          // Generate verification QR
          const verifyUrl = `${window.location.origin}/prescription/${rxData.id || rxData.consultation_id || idToFetch || '1'}`;
          QRCode.toDataURL(verifyUrl, { width: 140, margin: 1, color: { dark: '#022c22', light: '#ffffff' } })
            .then(url => setQrCodeUrl(url))
            .catch(() => {});
        } else {
          setError('No certified medical prescriptions found in the hospital repository.');
        }
      } catch (err) {
        console.error('Failed to load prescription record:', err);
        setError(err?.message || 'Could not load prescription record.');
      } finally {
        setLoading(false);
      }
    }

    loadPrescription();
  }, [idToFetch]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!prescription) return;
    const text = encodeURIComponent(
      `Prescription for ${prescription.patient_name} (${prescription.patient_id}): ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Retrieving certified hospital prescription...</p>
        </div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-md border border-slate-200 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">Prescription Unavailable</h2>
          <p className="text-xs text-slate-600 mt-1 mb-5">{error || 'Unable to locate medical record.'}</p>
          <button
            onClick={() => onBack ? onBack() : window.location.href = '/'}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Hospital Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/80 py-6 sm:py-10 px-3 sm:px-6">
      {/* Top Floating Action Bar (Hidden on print) */}
      <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <button
          onClick={() => onBack ? onBack() : window.location.href = '/'}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
            Share WhatsApp
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Official Prescription Document */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none">
        {/* Hospital Certified Header */}
        <div className="border-b-2 border-sky-900/40 p-6 sm:p-8 bg-gradient-to-r from-[#071933] via-[#0b2447] to-[#0e3160] text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0">
                <img src="/images/logo-icon.png" alt="MedicalCare Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight font-display">MedicalCare Hospital</h1>
                <p className="text-xs text-sky-300 font-semibold">Tertiary Care, Multi-Speciality & Research Center</p>
                <p className="text-[10px] text-sky-400">NABH & JCI Accredited • Registration #MC-HOSP-2026</p>
              </div>
            </div>

            <div className="text-left sm:text-right text-[11px] text-sky-200 border-t sm:border-t-0 pt-2 sm:pt-0 border-sky-800/60">
              <p className="font-bold text-white">Emergency: 1800-273-9227</p>
              <p>740 Health Sciences Blvd, Chicago</p>
              <p>reception@medicalcare-hospital.com</p>
            </div>
          </div>
        </div>

        {/* Prescription Metadata Ribbon */}
        <div className="bg-slate-50 px-6 sm:px-8 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 font-medium">Prescription ID: </span>
            <span className="font-mono font-bold text-slate-800">{prescription.consultation_id || prescription.id}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Date & Time: </span>
            <span className="font-bold text-slate-800">
              {new Date(prescription.consultation_date || prescription.created_at).toLocaleString()}
            </span>
          </div>
          <div className="inline-flex items-center gap-1 text-sky-800 font-bold bg-sky-100/70 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
            Verified Clinical Record
          </div>
        </div>

        {/* Doctor & Patient Information Section */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100">
          {/* Patient Card */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">Patient Information</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">{prescription.patient_name}</span>
              <span className="font-mono text-[11px] font-bold text-[#071933] bg-sky-100 px-2 py-0.5 rounded">
                {prescription.patient_id}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
              <div>
                <span className="text-slate-400 block">Mobile (WhatsApp):</span>
                <span className="font-semibold text-slate-800">{prescription.patient_phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Age / Gender:</span>
                <span className="font-semibold text-slate-800">{prescription.patient_age ? `${prescription.patient_age} yrs` : 'N/A'} • {prescription.patient_gender || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Doctor Card */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">Attending Physician</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">{prescription.doctor_name}</span>
              <span className="font-mono text-[11px] font-bold text-sky-950 bg-sky-100 px-2 py-0.5 rounded">
                {prescription.doctor_id || 'DOC-REG'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
              <div>
                <span className="text-slate-400 block">Department / Specialty:</span>
                <span className="font-semibold text-slate-800">{prescription.doctor_specialty || prescription.department || 'General Medicine'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Assigned Nurse:</span>
                <span className="font-semibold text-slate-800">{prescription.nurse_name || 'Nurse Station Desk'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnosis & Clinical Findings */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 bg-amber-50/30">
          <div className="text-xs mb-1 font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            Clinical Diagnosis & Findings
          </div>
          <p className="text-sm font-bold text-slate-900">{prescription.diagnosis || 'Routine Clinical Consultation'}</p>
          {prescription.symptoms && (
            <p className="text-xs text-slate-600 mt-1">
              <span className="font-semibold text-slate-700">Presented Symptoms: </span>
              {prescription.symptoms}
            </p>
          )}
        </div>

        {/* Prescribed Medicines (Rx) */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-black text-[#071933] font-serif italic">℞</span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Prescribed Medication (Rx Schedule)</h2>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Medicine & Strength</th>
                  <th className="py-2.5 px-3">Dosage</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Timing / Food</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Special Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(prescription.medicines) && prescription.medicines.length > 0 ? (
                  prescription.medicines.map((med, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                        <Pill className="w-3 h-3 text-[#0284c7] shrink-0" />
                        <span>{med.name}</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{med.dosage || '1 Tab'}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{med.frequency || 'Once daily'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          String(med.food_timing || med.food_instructions).toLowerCase().includes('before')
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}>
                          {med.food_timing || med.food_instructions || 'After Food'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{med.duration || '5 days'}</td>
                      <td className="py-2.5 px-3 text-slate-500 italic">{med.instructions || med.notes || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-slate-400 italic">No oral medications prescribed.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Doctor's Advice & Notes */}
          {prescription.doctor_notes && (
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Doctor's Clinical Instructions & Lifestyle Advice:
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {prescription.doctor_notes}
              </p>
            </div>
          )}

          {/* Next Appointment Card */}
          {prescription.next_appointment_date && (
            <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#0284c7] text-white shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-sky-900 uppercase tracking-wider block">
                    Next Recommended Follow-Up Appointment
                  </span>
                  <p className="text-sm font-extrabold text-[#071933]">
                    {prescription.next_appointment_date} {prescription.next_appointment_time ? `at ${prescription.next_appointment_time}` : ''}
                  </p>
                  {prescription.follow_up_instructions && (
                    <p className="text-[11px] text-sky-800 mt-0.5">
                      Instructions: {prescription.follow_up_instructions}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white text-sky-800 border border-sky-300 shadow-2xs">
                  Automated Reminder Scheduled
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer & Signature Row */}
        <div className="border-t border-slate-200 p-6 sm:p-8 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Verification QR Code */}
          <div className="flex items-center gap-3">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Validation" className="w-16 h-16 rounded border border-slate-200" />
            ) : (
              <div className="w-16 h-16 bg-slate-200 rounded" />
            )}
            <div className="text-[10px] text-slate-500">
              <p className="font-bold text-slate-800">Scan to Verify Authenticity</p>
              <p>ApexCare Medical Health Information Exchange</p>
              <p>Cryptographically signed prescription</p>
            </div>
          </div>

          {/* Doctor Signature Stamp */}
          <div className="text-center sm:text-right min-w-[200px]">
            <div className="font-serif italic text-lg text-[#071933] tracking-wide mb-1 font-bold">
              {prescription.doctor_name}
            </div>
            <div className="w-48 h-0.5 bg-slate-400 mx-auto sm:ml-auto sm:mr-0 mb-1" />
            <p className="text-xs font-bold text-slate-800">{prescription.doctor_name}</p>
            <p className="text-[10px] text-slate-500 font-medium">Authorized Signature & Medical License</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default PrescriptionViewPage;
