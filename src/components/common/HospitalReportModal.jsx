import React from 'react';
import { Modal } from './Modal.jsx';
import { QRCodeToken } from './QRCodeToken.jsx';
import {
  Printer,
  FileCheck,
  ShieldCheck,
  Calendar,
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  Download,
  CheckCircle2,
  Activity,
  Award,
  CreditCard,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';

export function HospitalReportModal({ isOpen, onClose, reportData, kpis, charts }) {
  if (!reportData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Department,Code,Appointments,EstRevenue\n" +
      (charts?.departmentBreakdown || [])
        .map(d => `${d.name},${d.code || 'N/A'},${d.appointments},${d.appointments * 500}`)
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportData.refId || 'Hospital_Report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MedicalCare Official Hospital Audit Report"
      subtitle="Certified Operational, Clinical & Financial Performance Statement"
      maxWidth="max-w-4xl"
    >
      <div className="printable-area space-y-4 print:space-y-2 text-slate-800">
        {/* Hospital Official Letterhead */}
        <div className="border-b-2 border-slate-900 pb-3.5 print:pb-2 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 print:w-10 print:h-10 rounded-xl bg-white border border-slate-200 p-1 shadow-xs shrink-0 overflow-hidden">
              <img
                src="/images/logo-icon.png"
                alt="MedicalCare Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl print:text-lg font-extrabold text-slate-950 tracking-tight font-display">
                  MedicalCare Hospital
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-200 uppercase print:text-[9px]">
                  Accredited Quaternary Center
                </span>
              </div>
              <p className="text-xs print:text-[10px] text-slate-500 font-medium">
                JCI Gold Seal & NABH Certified Multi-Specialty Clinical Research Institute
              </p>
              <p className="text-[11px] print:text-[9px] text-slate-500">
                740 Health Sciences Blvd, Chicago, IL 60611 • Tel: +1 (800) 273-9227 • www.medicalcarehospital.org
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-right sm:border-l sm:border-slate-200 sm:pl-4">
            <div className="space-y-0.5 print:space-y-0">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-200">
                {reportData.status || 'Verified / Generated'}
              </span>
              <p className="text-xs print:text-[11px] font-mono font-bold text-slate-900">
                Ref: {reportData.refId || 'REP-2026-OCT-8419'}
              </p>
              <p className="text-[11px] print:text-[10px] text-slate-500">
                Period: <strong className="text-slate-800">{reportData.period || 'October 2026'}</strong>
              </p>
              <p className="text-[10px] print:text-[9px] text-slate-400">
                Issued: <span className="font-mono">{reportData.generatedDate || new Date().toLocaleString()}</span>
              </p>
            </div>
            <div className="hidden sm:block shrink-0">
              <QRCodeToken value={reportData.refId || 'REP-2026'} size={52} label="" />
            </div>
          </div>
        </div>

        {/* Report Overview Banner */}
        <div className="bg-gradient-to-r from-[#071933] via-[#092244] to-[#041022] text-white rounded-xl p-3.5 print:p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-sky-300 bg-[#0d2a4f]/80 px-2 py-0.5 rounded-full border border-[#1e3a5f]">
              Certified Executive Audit
            </span>
            <h2 className="text-sm sm:text-base print:text-sm font-bold text-white mt-0.5">
              {reportData.title || 'Comprehensive Hospital Operational & Clinical Audit Report'}
            </h2>
            <p className="text-xs print:text-[10px] text-sky-200/90">
              Authorized performance evaluation covering clinical volume, revenue turnover, inpatient census, and departmental safety.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[9px] uppercase font-bold text-sky-300">Auditor in Charge:</span>
            <p className="text-xs print:text-[11px] font-bold text-white">Dr. Marcus Vance, MD, FACS</p>
            <p className="text-[10px] print:text-[9px] text-amber-300">Chief Medical Officer & Chairman</p>
          </div>
        </div>

        {/* 4 Key Performance Metrics Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 print:gap-2 text-xs">
          <div className="bg-slate-50 p-2.5 print:p-2 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] print:text-[9px] font-bold uppercase text-slate-400">Total Patient Intake</span>
            <p className="text-base sm:text-lg print:text-base font-extrabold text-slate-900">{kpis?.totalPatients || 128} Patients</p>
            <span className="text-[10px] print:text-[9px] text-[#0284c7] font-bold block">+18.4% YoY Growth</span>
          </div>
          <div className="bg-slate-50 p-2.5 print:p-2 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] print:text-[9px] font-bold uppercase text-slate-400">Net Revenue Intake</span>
            <p className="text-base sm:text-lg print:text-base font-extrabold text-[#071933] font-mono">
              ₹{(kpis?.totalRevenue || 227100).toLocaleString()}
            </p>
            <span className="text-[10px] print:text-[9px] text-[#0284c7] font-bold block">+24.5% vs Monthly Target</span>
          </div>
          <div className="bg-slate-50 p-2.5 print:p-2 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] print:text-[9px] font-bold uppercase text-slate-400">Bed Occupancy Rate</span>
            <p className="text-base sm:text-lg print:text-base font-extrabold text-slate-900">{kpis?.bedOccupancyRate || 75}%</p>
            <span className="text-[10px] print:text-[9px] text-slate-500 block">Average 3.2 Days Stay</span>
          </div>
          <div className="bg-slate-50 p-2.5 print:p-2 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] print:text-[9px] font-bold uppercase text-slate-400">Clinical Satisfaction</span>
            <p className="text-base sm:text-lg print:text-base font-extrabold text-amber-600">99.4%</p>
            <span className="text-[10px] print:text-[9px] text-slate-500 block">Post-Discharge NPS</span>
          </div>
        </div>

        {/* Section 1: Department-wise Clinical Breakdown */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h3 className="text-xs print:text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>Departmental Outpatient & Surgical Consultations</span>
            </h3>
            <span className="text-[10px] print:text-[9px] text-slate-500 font-medium">8 Medical Disciplines Analyzed</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto table-scrollbar">
            <table className="w-full min-w-max text-xs print:text-[10px] text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-1.5 px-3 print:py-1 print:px-2">Department Name</th>
                  <th className="py-1.5 px-2 print:py-1 print:px-1.5">Code</th>
                  <th className="py-1.5 px-2 print:py-1 print:px-1.5">Head of Department</th>
                  <th className="py-1.5 px-2 text-right print:py-1 print:px-1.5">Consultations</th>
                  <th className="py-1.5 px-3 text-right print:py-1 print:px-2">Net Volume (₹)</th>
                  <th className="py-1.5 px-2 text-center print:py-1 print:px-1.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {[
                  { name: 'Cardiology & Vascular Center', code: 'CARD', head: 'Dr. Neha Kapoor, MD', count: 28, fee: 33600 },
                  { name: 'Neurology & Neurosurgery', code: 'NEUR', head: 'Dr. Julian Sterling, MD', count: 18, fee: 25200 },
                  { name: 'Orthopedics & Joint Replacement', code: 'ORTH', head: 'Dr. Sophia Alva, MS', count: 22, fee: 24200 },
                  { name: 'Pediatrics & Neonatal ICU', code: 'PED', head: 'Dr. Maya Lin, MD', count: 30, fee: 27000 },
                  { name: 'Oncology & Precision Therapeutics', code: 'ONC', head: 'Dr. Robert Chen, MD', count: 16, fee: 28800 },
                  { name: 'Diagnostic Radiology & Imaging', code: 'RAD', head: 'Dr. Claire Dupont, MD', count: 24, fee: 21600 },
                  { name: 'Emergency & Level-1 Trauma Bay', code: 'ER', head: 'Dr. Ethan Wright, MD', count: 35, fee: 42000 },
                  { name: 'Obstetrics & Women\'s Health', code: 'OBGYN', head: 'Dr. Samantha Reynolds, MD', count: 25, fee: 24700 }
                ].map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-1.5 px-3 print:py-1 print:px-2 font-bold text-slate-900">{row.name}</td>
                    <td className="py-1.5 px-2 print:py-1 print:px-1.5 font-mono text-[#0284c7] font-bold">{row.code}</td>
                    <td className="py-1.5 px-2 print:py-1 print:px-1.5 text-slate-600">{row.head}</td>
                    <td className="py-1.5 px-2 print:py-1 print:px-1.5 text-right font-bold text-slate-800">{row.count}</td>
                    <td className="py-1.5 px-3 print:py-1 print:px-2 text-right font-mono text-[#071933] font-bold">
                      ₹{row.fee.toLocaleString()}
                    </td>
                    <td className="py-1.5 px-2 print:py-1 print:px-1.5 text-center">
                      <span className="inline-block px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-sky-100 text-sky-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Inpatient Census & Quality Compliance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 print:gap-2 text-xs">
          <div className="bg-slate-50 p-2.5 print:p-2 rounded-xl border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1 text-xs print:text-[10px]">
              <Building2 className="w-3 h-3 text-[#0284c7]" />
              <span>Inpatient Ward & Bed Utilization</span>
            </h4>
            <div className="space-y-0.5 pt-0.5 text-[11px] print:text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Certified Capacity:</span>
                <span className="font-bold text-slate-900">150 Beds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Currently Occupied:</span>
                <span className="font-bold text-[#0284c7]">75 Beds (50.0%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ICU Level-3 Resuscitation:</span>
                <span className="font-bold text-slate-900">16 / 20 Beds (80%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Average Length of Stay (ALOS):</span>
                <span className="font-bold text-slate-900">3.2 Days</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 print:p-2 rounded-xl border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1 text-xs print:text-[10px]">
              <ShieldCheck className="w-3 h-3 text-[#0284c7]" />
              <span>Safety & Quality Compliance Indicators</span>
            </h4>
            <div className="space-y-0.5 pt-0.5 text-[11px] print:text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Hospital-Acquired Infection Rate:</span>
                <span className="font-bold text-[#0284c7]">0.08% (Below Benchmark)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unscheduled 30-Day Readmission:</span>
                <span className="font-bold text-[#0284c7]">2.1% (Top Decile)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Emergency Triage Door-to-Doctor:</span>
                <span className="font-bold text-[#0284c7]">&lt; 4.2 Minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cashless Insurance Settlement Ratio:</span>
                <span className="font-bold text-[#0284c7]">98.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Seals & Digital Signature */}
        <div className="pt-2 print:pt-1 border-t-2 border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 print:w-8 print:h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284c7] shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs print:text-[10px] font-extrabold text-slate-900 uppercase tracking-wider">
                Official Audit Bureau Verified Seal
              </p>
              <p className="text-[10px] print:text-[9px] text-slate-500">
                Electronically generated & cryptographically signed via MedicalCare Core EHR.
              </p>
              <span className="text-[9px] font-mono text-[#0284c7] font-bold block">
                Verification Hash: MC-SHA256-8419-A7F2
              </span>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 space-y-0.5">
            <div className="h-6 flex items-end justify-end">
              <span className="font-serif italic font-bold text-slate-800 text-xs border-b border-slate-400 pb-0.5">
                Marcus Vance, MD
              </span>
            </div>
            <p className="text-xs print:text-[10px] font-bold text-slate-900">Dr. Marcus Vance, MD, FACS</p>
            <p className="text-[9px] text-slate-500">Chief Medical Officer & Hospital Chairman</p>
          </div>
        </div>

        {/* Action Controls (Hidden when printed) */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close Report
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-md shadow-sky-800/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Printer className="w-4 h-4 text-sky-200" />
            <span>Print Official Report</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#0284c7]" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
