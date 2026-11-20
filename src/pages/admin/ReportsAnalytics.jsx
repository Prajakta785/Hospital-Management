import React, { useState, useEffect } from 'react';
import { reportsApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { HospitalReportModal } from '../../components/common/HospitalReportModal.jsx';
import { CsvPreviewModal } from '../../components/common/CsvPreviewModal.jsx';
import {
  BarChart3,
  Download,
  Calendar,
  Printer,
  TrendingUp,
  FileSpreadsheet,
  DollarSign,
  Users,
  Activity,
  FileText,
  PlusCircle,
  Eye,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

export function ReportsAnalytics() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('This Month');

  // Report Modal and Generated Reports List
  const [selectedReport, setSelectedReport] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // CSV Preview Modal State
  const [csvPreview, setCsvPreview] = useState({
    isOpen: false,
    title: '',
    filename: '',
    columns: [],
    data: []
  });

  const [generatedReports, setGeneratedReports] = useState([
    {
      id: 'rep-1',
      refId: 'REP-2026-OCT-8419',
      title: 'Executive Operational, Clinical & Financial Performance Audit',
      category: 'Executive Hospital Audit',
      period: 'October 2026',
      generatedDate: '31-10-2026 14:30',
      auditor: 'Dr. Marcus Vance, MD, FACS',
      status: 'Verified & Certified',
      fileType: 'PDF / Audit Statement',
      size: '2.4 MB'
    },
    {
      id: 'rep-2',
      refId: 'REP-2026-DEP-5211',
      title: 'Departmental Outpatient Volume & Consultation Revenue Breakdown',
      category: 'Clinical Specialties',
      period: 'October 2026',
      generatedDate: '30-10-2026 18:15',
      auditor: 'Dr. Neha Kapoor, MD (Cardiology)',
      status: 'Verified & Certified',
      fileType: 'Clinical Summary',
      size: '1.8 MB'
    },
    {
      id: 'rep-3',
      refId: 'REP-2026-BED-3390',
      title: 'Inpatient Census, Ward Occupancy & Bed Utilization Statement',
      category: 'Inpatient & Critical Care',
      period: 'October 2026',
      generatedDate: '28-10-2026 11:45',
      auditor: 'MedicalCare Quality Assurance Bureau',
      status: 'Verified & Certified',
      fileType: 'Census Report',
      size: '1.2 MB'
    },
    {
      id: 'rep-4',
      refId: 'REP-2026-QUAL-7012',
      title: 'Clinical Quality Assurance & Patient Safety Audit Statement',
      category: 'Accreditation & Safety',
      period: 'October 2026',
      generatedDate: '25-10-2026 09:20',
      auditor: 'JCI / NABH Compliance Bureau',
      status: 'Verified & Certified',
      fileType: 'Audit Statement',
      size: '2.1 MB'
    },
    {
      id: 'rep-5',
      refId: 'REP-2026-PHR-1142',
      title: 'Pharmacy Dispensation & Emergency Drug Inventory Reconciliation',
      category: 'Pharmacy & Therapeutics',
      period: 'October 2026',
      generatedDate: '22-10-2026 16:00',
      auditor: 'Hospital Chief Pharmacist',
      status: 'Verified & Certified',
      fileType: 'Inventory Audit',
      size: '1.5 MB'
    }
  ]);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const res = await reportsApi.getAnalytics();
        if (res.success) setData(res);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleExportCSV = () => {
    const columns = ['Month', 'Outpatient Visits', 'Inpatient Admissions', 'Total Revenue'];
    const rows = (data?.charts?.monthlyAdmissions || [
      { month: 'May 2026', outpatients: 120, inpatients: 35, revenue: 18500 },
      { month: 'Jun 2026', outpatients: 145, inpatients: 42, revenue: 23400 },
      { month: 'Jul 2026', outpatients: 160, inpatients: 48, revenue: 27900 },
      { month: 'Aug 2026', outpatients: 175, inpatients: 52, revenue: 31200 },
      { month: 'Sep 2026', outpatients: 190, inpatients: 58, revenue: 36800 },
      { month: 'Oct 2026', outpatients: 210, inpatients: 64, revenue: 42378 }
    ]).map(e => [
      e.month,
      e.outpatients,
      e.inpatients,
      `₹${e.revenue.toLocaleString()}`
    ]);

    setCsvPreview({
      isOpen: true,
      title: 'Hospital Monthly Admissions & Revenue Analytics',
      filename: `MedicalCare_Hospital_Analytics_${dateRange.replace(/\s+/g, '_')}.csv`,
      columns,
      data: rows
    });
  };

  const handleReportCsvPreview = (report) => {
    const columns = ['Department Name', 'Code', 'Head of Department', 'Consultations', 'Net Volume', 'Status'];
    const rows = [
      ['Cardiology & Vascular Center', 'CARD', 'Dr. Neha Kapoor, MD', 28, '₹33,600', 'Active'],
      ['Neurology & Neurosurgery', 'NEUR', 'Dr. Julian Sterling, MD', 18, '₹25,200', 'Active'],
      ['Orthopedics & Joint Replacement', 'ORTH', 'Dr. Sophia Alva, MS', 22, '₹24,200', 'Active'],
      ['Pediatrics & Neonatal ICU', 'PED', 'Dr. Maya Lin, MD', 30, '₹27,000', 'Active'],
      ['Oncology & Precision Therapeutics', 'ONC', 'Dr. Robert Chen, MD', 16, '₹28,800', 'Active'],
      ['Diagnostic Radiology & Imaging', 'RAD', 'Dr. Claire Dupont, MD', 24, '₹21,600', 'Active'],
      ['Emergency & Level-1 Trauma Bay', 'ER', 'Dr. Ethan Wright, MD', 35, '₹42,000', 'Active'],
      ['Obstetrics & Women\'s Health', 'OBGYN', 'Dr. Samantha Reynolds, MD', 25, '₹24,700', 'Active']
    ];

    setCsvPreview({
      isOpen: true,
      title: `${report.title} — Spreadsheet Data Preview`,
      filename: `${report.refId}_Department_Audit.csv`,
      columns,
      data: rows
    });
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setIsReportModalOpen(true);
  };

  const handlePrintReport = (report) => {
    setSelectedReport(report);
    setIsReportModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleGenerateNewReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const now = new Date();
      const randomRef = Math.floor(1000 + Math.random() * 9000);
      const newReport = {
        id: `rep-${Date.now()}`,
        refId: `REP-2026-LIVE-${randomRef}`,
        title: `Realtime Hospital Clinical & Operational Audit (${dateRange})`,
        category: 'Live Operational Audit',
        period: dateRange,
        generatedDate: `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        auditor: 'Dr. Marcus Vance, MD, FACS',
        status: 'Verified & Certified',
        fileType: 'Official Certified Audit',
        size: '2.6 MB'
      };

      setGeneratedReports(prev => [newReport, ...prev]);
      setIsGenerating(false);
      toast.success(`New Hospital Report "${newReport.refId}" generated successfully!`);
      setSelectedReport(newReport);
      setIsReportModalOpen(true);
    }, 600);
  };

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
            Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500">
            View hospital performance, revenue, and download reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateNewReport}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isGenerating ? 'Generating...' : 'Generate New Report'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-slate-400 font-bold uppercase">Total Patient Volume</p>
          <h3 className="text-2xl font-extrabold text-slate-900">{kpis.totalPatients || 6}</h3>
          <span className="text-[10px] text-[#0284c7] font-bold">+18.4% YoY Growth</span>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-slate-400 font-bold uppercase">Net Revenue Intake</p>
          <h3 className="text-2xl font-extrabold text-[#0284c7] font-mono">₹{kpis.totalRevenue?.toLocaleString() || '1,475'}</h3>
          <span className="text-[10px] text-[#0284c7] font-bold">+24.5% vs target</span>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-slate-400 font-bold uppercase">Bed Occupancy</p>
          <h3 className="text-2xl font-extrabold text-slate-900">{kpis.bedOccupancyRate || 50}%</h3>
          <span className="text-[10px] text-slate-400">Average 3.2 days stay</span>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-slate-400 font-bold uppercase">Clinical Satisfaction</p>
          <h3 className="text-2xl font-extrabold text-amber-600">99.4%</h3>
          <span className="text-[10px] text-slate-400">Post-discharge surveys</span>
        </div>
      </div>

      {/* Recharts Revenue & Admissions Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-display">Revenue Growth Trend (₹)</h3>
            <span className="text-xs font-bold text-[#0284c7] font-mono">Monthly Billed</span>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyAdmissions || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071933', borderRadius: '12px', color: '#fff', fontSize: '12px', border: '1px solid #1e3a5f' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={3} dot={{ fill: '#d97706', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Appointment Volume Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-display">Department Volume Breakdown</h3>
            <span className="text-xs font-bold text-slate-500">Appointments</span>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.departmentBreakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071933', borderRadius: '12px', color: '#fff', fontSize: '11px', border: '1px solid #1e3a5f' }}
                />
                <Bar dataKey="appointments" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Generated Hospital Reports & Statements Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284c7]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Generated Hospital Reports & Statements
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-[#0284c7]">
                  {generatedReports.length} Available
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official clinical, departmental, bed census and operational audit statements ready to view and print.
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateNewReport}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#071933] border border-sky-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Generate Certified Statement</span>
          </button>
        </div>

        {/* Table of Generated Reports */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Report Title & Reference</th>
                <th className="py-3 px-4">Audit Category</th>
                <th className="py-3 px-4">Period & Date</th>
                <th className="py-3 px-4">Auditor / Author</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {generatedReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border bg-sky-50 text-[#0284c7] border-sky-200">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs line-clamp-1">
                          {report.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-[#0284c7] font-bold">
                            {report.refId}
                          </span>
                          <span className="text-[10px] text-slate-400">• {report.size}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                      {report.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="font-bold text-slate-800">{report.period}</p>
                    <p className="text-[10px] text-slate-400">{report.generatedDate}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <p className="font-bold text-slate-900">{report.auditor}</p>
                    <p className="text-[10px] text-slate-400">Chief Directorate</p>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-[#071933] border border-sky-200">
                      <CheckCircle2 className="w-3 h-3 text-[#0284c7]" />
                      <span>{report.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        title="View Full Generated Report"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handlePrintReport(report)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Print Report"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleReportCsvPreview(report)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Preview & Download CSV"
                      >
                        <Download className="w-3.5 h-3.5 text-[#0284c7]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Hospital Audit Report Modal */}
      {selectedReport && (
        <HospitalReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          reportData={selectedReport}
          kpis={kpis}
          charts={charts}
        />
      )}

      {/* CSV Spreadsheet Data Preview Modal */}
      <CsvPreviewModal
        isOpen={csvPreview.isOpen}
        onClose={() => setCsvPreview(prev => ({ ...prev, isOpen: false }))}
        title={csvPreview.title}
        filename={csvPreview.filename}
        columns={csvPreview.columns}
        data={csvPreview.data}
      />
    </div>
  );
}
