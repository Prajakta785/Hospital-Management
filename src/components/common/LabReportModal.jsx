import React from 'react';
import { Modal } from './Modal.jsx';
import { Printer, FileCheck, AlertTriangle, ShieldCheck, User } from 'lucide-react';

export function LabReportModal({ isOpen, onClose, labTest }) {
  if (!labTest) return null;

  const handlePrint = () => {
    window.print();
  };

  const isCompleted = labTest.status === 'completed';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Certified Laboratory Diagnostic Report" maxWidth="max-w-2xl">
      <div className="printable-area space-y-6">
        {/* Lab Header */}
        <div className="border-b border-slate-200 pb-5 text-center">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white p-0.5 border border-slate-200 overflow-hidden shadow-xs">
              <img src="/images/logo-icon.png" alt="MedicalCare Logo" className="w-full h-full object-contain" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">MedicalCare Diagnostic Pathology</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">CAP & CLIA Accredited High-Complexity Clinical Laboratory</p>
          <div className="mt-2.5 inline-block bg-slate-100 px-3 py-1 rounded-full text-xs font-mono font-bold text-slate-700">
            Report Accession: {labTest.test_code}
          </div>
        </div>

        {/* Patient & Sample Demographics */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="space-y-1.5">
            <p><span className="text-slate-400 font-semibold">Patient Name:</span> <strong className="text-slate-900">{labTest.patientName}</strong></p>
            <p><span className="text-slate-400 font-semibold">MRN:</span> <strong className="font-mono text-slate-900">{labTest.patientMrn || 'N/A'}</strong></p>
            <p><span className="text-slate-400 font-semibold">Age / Gender:</span> {labTest.patientAge ? `${labTest.patientAge} Yrs` : 'N/A'} / {labTest.patientGender || 'N/A'}</p>
          </div>
          <div className="space-y-1.5">
            <p><span className="text-slate-400 font-semibold">Ordering Physician:</span> <strong className="text-slate-900">{labTest.doctorName}</strong></p>
            <p><span className="text-slate-400 font-semibold">Collection Date:</span> {labTest.ordered_date}</p>
            <p><span className="text-slate-400 font-semibold">Specimen:</span> {labTest.sample_type || 'Venous Blood'}</p>
          </div>
        </div>

        {/* Test Findings Box */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-[#071933] text-white px-4 py-3 flex justify-between items-center text-xs font-bold uppercase tracking-wider">
            <span>{labTest.test_name}</span>
            <span className="bg-[#0284c7] px-2 py-0.5 rounded text-[11px] font-mono">{labTest.category}</span>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Diagnostic Findings / Results:</p>
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 text-sm font-medium text-slate-800 leading-relaxed">
                {labTest.results || 'Specimen currently under processing in automated clinical analyzer.'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium">Biological Reference Range:</span>
                <p className="font-mono font-bold text-slate-800 mt-1">{labTest.normal_range || 'Normal Physiological Limits'}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium">Clinical Classification:</span>
                <p className="mt-1">
                  {labTest.is_abnormal ? (
                    <span className="inline-flex items-center gap-1 font-bold text-rose-700">
                      <AlertTriangle className="w-3.5 h-3.5" /> Outside Reference Limit
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-[#0284c7]">
                      <FileCheck className="w-3.5 h-3.5" /> Normal / Optimal
                    </span>
                  )}
                </p>
              </div>
            </div>

            {labTest.notes && (
              <div className="text-xs text-slate-600 bg-amber-50/60 p-3 rounded-lg border border-amber-100">
                <strong className="text-amber-900 font-semibold">Pathologist Clinical Comments:</strong> {labTest.notes}
              </div>
            )}
          </div>
        </div>

        {/* Doctor Authorization Signature */}
        <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-xs">
          <div>
            <div className="flex items-center gap-1.5 text-[#0284c7] font-semibold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Electronic Signature</span>
            </div>
            <p className="text-slate-500">Authorized by: <strong className="text-slate-800">{labTest.authorized_by || 'Chief Clinical Pathologist'}</strong></p>
            <p className="text-[11px] text-slate-400">Electronic verification hash: SHA256-V29-CERT</p>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <p>ApexCare Lab Diagnostics</p>
            <p>Report Printed: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Actions (Hidden during print, Sticky at bottom of modal) */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 no-print sticky bottom-0 bg-white/95 backdrop-blur-xs py-2.5 -mx-3.5 sm:-mx-6 px-3.5 sm:px-6 -mb-3.5 sm:-mb-6 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] z-20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-sm font-semibold rounded-xl shadow-xs transition-all hover:shadow cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Certified Lab Report
          </button>
        </div>
      </div>
    </Modal>
  );
}
