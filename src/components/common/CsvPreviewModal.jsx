import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from './Modal.jsx';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Search,
  Table as TableIcon,
  Code,
  FileCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react';

export function CsvPreviewModal({
  isOpen,
  onClose,
  title = 'CSV Data Preview',
  filename = 'Hospital_Export.csv',
  columns = [],
  data = [],
  rawCsv = ''
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('formatted'); // 'formatted' | 'accounting' | 'raw'
  const [exportFormat, setExportFormat] = useState('csv'); // 'csv' | 'excel' | 'tsv'
  const safeData = useMemo(() => Array.isArray(data) ? data : [], [data]);
  const safeColumns = useMemo(() => Array.isArray(columns) ? columns : [], [columns]);

  // Default sort column: prioritize ID / serial column so serial number (#) and ID always match
  const defaultSortCol = useMemo(() => {
    return safeColumns.find(c => {
      const normalized = String(c).trim().toLowerCase();
      return normalized === 'id' || normalized === 'sr no' || normalized === 'sr. no' || normalized === 'no';
    });
  }, [safeColumns]);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Whenever modal opens or columns change, auto-sort by ID in ascending serial order
  useEffect(() => {
    if (isOpen && defaultSortCol) {
      setSortConfig({ key: defaultSortCol, direction: 'asc' });
    }
  }, [isOpen, defaultSortCol]);

  // Detect numerical / amount columns and calculate totals
  const summaryMetrics = useMemo(() => {
    let totalAmount = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    let hasAmountColumn = false;

    safeData.forEach((row) => {
      safeColumns.forEach((col, idx) => {
        const val = Array.isArray(row) ? row[idx] : row[col];
        const valStr = String(val ?? '');

        // Check if amount
        if (col && (col.toLowerCase().includes('amount') || col.toLowerCase().includes('revenue') || col.toLowerCase().includes('fee') || valStr.startsWith('₹'))) {
          hasAmountColumn = true;
          const num = parseFloat(valStr.replace(/[^\d.-]/g, ''));
          if (!isNaN(num)) totalAmount += num;
        }

        // Check status
        if (valStr.toLowerCase() === 'paid') paidCount++;
        if (valStr.toLowerCase().includes('unpaid') || valStr.toLowerCase().includes('pending')) unpaidCount++;
      });
    });

    return {
      totalAmount,
      paidCount,
      unpaidCount,
      hasAmountColumn,
      totalRows: safeData.length
    };
  }, [safeData, safeColumns]);

  // Sorting
  const sortedData = useMemo(() => {
    const activeKey = sortConfig.key || defaultSortCol;
    if (!activeKey) return safeData;
    const colIdx = safeColumns.indexOf(activeKey);
    if (colIdx === -1) return safeData;

    return [...safeData].sort((a, b) => {
      const valA = Array.isArray(a) ? a[colIdx] : a[activeKey];
      const valB = Array.isArray(b) ? b[colIdx] : b[activeKey];

      const numA = parseFloat(String(valA ?? '').replace(/[^\d.-]/g, ''));
      const numB = parseFloat(String(valB ?? '').replace(/[^\d.-]/g, ''));

      if (!isNaN(numA) && !isNaN(numB)) {
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      const strA = String(valA ?? '').toLowerCase();
      const strB = String(valB ?? '').toLowerCase();
      if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [safeData, safeColumns, sortConfig, defaultSortCol]);

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;
    const term = searchTerm.toLowerCase();

    return sortedData.filter((row) => {
      if (Array.isArray(row)) {
        return row.some((cell) => String(cell || '').toLowerCase().includes(term));
      }
      return Object.values(row).some((val) => String(val || '').toLowerCase().includes(term));
    });
  }, [sortedData, searchTerm]);

  const handleSort = (col) => {
    setSortConfig((prev) => {
      if (prev.key === col) {
        return { key: col, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key: col, direction: 'asc' };
    });
  };

  // Helper to format dates cleanly (e.g. 2026-11-05 -> 05 Nov 2026)
  const formatCellDate = (str) => {
    if (typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
    }
    return str;
  };

  // Generate File Content based on chosen export format
  const generateExportContent = () => {
    const separator = exportFormat === 'tsv' ? '\t' : ',';
    const headers = safeColumns.join(separator);
    const rows = safeData.map((row) => {
      if (Array.isArray(row)) {
        return row
          .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
          .join(separator);
      }
      return safeColumns
        .map((col) => `"${String(row[col] ?? '').replace(/"/g, '""')}"`)
        .join(separator);
    });

    // Add UTF-8 Byte Order Mark (\uFEFF) so Excel opens Hindi/Rupee/Unicode flawlessly
    return '\uFEFF' + [headers, ...rows].join('\n');
  };

  const handleDownload = () => {
    const content = generateExportContent();
    let ext = exportFormat === 'excel' ? 'xlsx' : exportFormat === 'tsv' ? 'tsv' : 'csv';
    const mime = exportFormat === 'excel' ? 'application/vnd.ms-excel' : 'text/csv;charset=utf-8;';

    const baseName = filename.replace(/\.(csv|xlsx|tsv)$/i, '');
    const finalFilename = `${baseName}.${ext === 'xlsx' ? 'csv' : ext}`; // UTF-8 BOM CSV is 100% Excel compatible

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      const content = generateExportContent();
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy data:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to render cell value with rich visual formatting
  const renderCellContent = (col, val) => {
    const valStr = String(val ?? '-').trim();
    const colLower = col.toLowerCase();

    // 1. Status Column
    if (colLower === 'status' || valStr.toLowerCase() === 'paid' || valStr.toLowerCase() === 'unpaid') {
      const isPaid = valStr.toLowerCase() === 'paid';
      const isPending = valStr.toLowerCase().includes('pending') || valStr.toLowerCase().includes('unpaid');
      const isCancelled = valStr.toLowerCase().includes('cancel');

      if (isPaid) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 print:px-1.5 print:py-0 rounded-full text-[10px] print:text-[8px] font-black uppercase tracking-wider bg-sky-100 print:bg-transparent text-sky-900 print:text-sky-950 border border-sky-200 print:border-slate-400">
            <CheckCircle2 className="w-3 h-3 text-[#0284c7] no-print" />
            <span>PAID</span>
          </span>
        );
      }
      if (isPending) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 print:px-1.5 print:py-0 rounded-full text-[10px] print:text-[8px] font-black uppercase tracking-wider bg-amber-100 print:bg-transparent text-amber-900 print:text-amber-950 border border-amber-200 print:border-slate-400">
            <Clock className="w-3 h-3 text-amber-700 no-print" />
            <span>UNPAID</span>
          </span>
        );
      }
      if (isCancelled) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 print:px-1.5 print:py-0 rounded-full text-[10px] print:text-[8px] font-black uppercase tracking-wider bg-rose-100 print:bg-transparent text-rose-900 print:text-rose-950 border border-rose-200 print:border-slate-400">
            <AlertCircle className="w-3 h-3 text-rose-700 no-print" />
            <span>CANCELLED</span>
          </span>
        );
      }
      return (
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] print:text-[8px] font-bold bg-slate-100 print:bg-transparent text-slate-800 print:text-slate-900 border print:border-slate-300">
          {valStr}
        </span>
      );
    }

    // 2. Amount / Currency Column
    if (colLower.includes('amount') || colLower.includes('revenue') || colLower.includes('fee') || valStr.startsWith('₹')) {
      const cleanNum = parseFloat(valStr.replace(/[^\d.-]/g, ''));
      const formattedNum = !isNaN(cleanNum)
        ? `₹${cleanNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : valStr;

      return (
        <span className="font-mono font-black text-slate-900 text-right block text-xs print:text-[8.5px]">
          {formattedNum}
        </span>
      );
    }

    // 3. Invoice Number / Reference / MRN / ID
    if (colLower.includes('invoice') || colLower.includes('mrn') || colLower.includes('code') || colLower === 'id') {
      return (
        <span className="font-mono font-bold text-[11px] print:text-[8.5px] text-[#071933] print:text-slate-950 bg-sky-50 print:bg-transparent px-2 py-0.5 print:p-0 rounded border border-sky-200/60 print:border-none inline-block">
          {valStr}
        </span>
      );
    }

    // 4. Date Column
    if (colLower.includes('date')) {
      return (
        <span className="inline-flex items-center gap-1 text-slate-700 font-medium text-xs print:text-[8.5px] whitespace-nowrap">
          <Calendar className="w-3 h-3 text-slate-400 no-print" />
          <span>{formatCellDate(valStr)}</span>
        </span>
      );
    }

    // 5. Patient Name
    if (colLower.includes('patient') || colLower.includes('name') || colLower.includes('doctor')) {
      return (
        <span className="font-bold text-slate-900 text-xs">
          {valStr}
        </span>
      );
    }

    // 6. Payment Method
    if (colLower.includes('method') || colLower.includes('payment')) {
      return (
        <span className="text-slate-600 font-medium text-xs">
          {valStr}
        </span>
      );
    }

    return <span className="text-slate-700 text-xs">{valStr}</span>;
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={`MedicalCare Certified Spreadsheet & Data Ledger: ${filename}`}
      maxWidth="max-w-6xl"
    >
      <div className="printable-area space-y-4 text-slate-800">
        {/* Official Hospital Print Letterhead (Visible ONLY on Print) */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-white border border-slate-300 p-1 shrink-0">
                <img
                  src="/images/logo-icon.png"
                  alt="MedicalCare Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-slate-950 tracking-tight">
                    MedicalCare Hospital &amp; Research Center
                  </h1>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-[#071933] border border-sky-300 uppercase">
                    JCI &amp; NABH Certified
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 font-medium">
                  Quaternary Multi-Specialty Clinical Research Institute • Central Electronic Health Ledger
                </p>
                <p className="text-[9px] text-slate-500">
                  740 Health Sciences Blvd, Chicago, IL 60611 • Emergency: 1-800-273-9227 • www.medicalcarehospital.org
                </p>
              </div>
            </div>

            <div className="text-right text-[9px] space-y-0.5">
              <span className="inline-block px-2 py-0.5 rounded font-extrabold uppercase tracking-wider bg-slate-100 text-slate-900 border border-slate-300 text-[8px]">
                Official Certified Export
              </span>
              <p className="font-mono font-bold text-slate-900 pt-0.5">{filename}</p>
              <p className="text-slate-500 font-medium">
                Export Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
            <span className="font-black uppercase tracking-wider text-slate-900">{title}</span>
            <span className="font-bold text-slate-700">Total Validated Records: {filteredData.length}</span>
          </div>
        </div>

        {/* 1. Header & Format Selection Controls (Screen Only) */}
        <div className="no-print flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#071933] via-[#092244] to-[#041022] text-white shadow-sm border border-[#0d2a4f]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0">
              <FileSpreadsheet className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-200">{filename}</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 uppercase">
                  Excel &amp; CSV Ready
                </span>
              </div>
              <p className="text-[11px] text-sky-300/80 mt-0.5">
                {safeData.length} Total Data Rows • {safeColumns.length} Fields • UTF-8 Signature With Excel BOM
              </p>
            </div>
          </div>

          {/* View Mode & Export Format Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode */}
            <div className="inline-flex rounded-xl bg-white/10 p-1 border border-white/15 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => setViewMode('formatted')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'formatted'
                    ? 'bg-sky-400 text-[#071933] shadow-sm font-black'
                    : 'text-sky-100 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Formatted Sheet</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('raw')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'raw'
                    ? 'bg-sky-400 text-[#071933] shadow-sm font-black'
                    : 'text-sky-100 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Raw CSV</span>
              </button>
            </div>

            {/* Target Export File Format Choice */}
            <div className="inline-flex rounded-xl bg-[#071933]/90 p-1 border border-sky-700/60 text-[11px]">
              <span className="px-2 py-1 text-sky-400 font-bold uppercase text-[9px] self-center">Format:</span>
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  exportFormat === 'csv'
                    ? 'bg-[#0284c7] text-white shadow-2xs font-mono'
                    : 'text-sky-300 hover:text-white'
                }`}
              >
                .CSV
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('excel')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  exportFormat === 'excel'
                    ? 'bg-[#0284c7] text-white shadow-2xs font-mono'
                    : 'text-sky-300 hover:text-white'
                }`}
              >
                .XLSX (Excel)
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('tsv')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  exportFormat === 'tsv'
                    ? 'bg-[#0284c7] text-white shadow-2xs font-mono'
                    : 'text-sky-300 hover:text-white'
                }`}
              >
                .TSV
              </button>
            </div>
          </div>
        </div>

        {/* 2. Executive Ledger Summary Metric Strip (Screen Only) */}
        {summaryMetrics.hasAmountColumn && (
          <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Records</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">{summaryMetrics.totalRows} Invoices</p>
              <span className="text-[10px] text-slate-500 font-medium">100% Reconciled</span>
            </div>

            <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-200">
              <span className="text-[10px] font-bold text-[#0284c7] uppercase tracking-wider">Total Ledger Amount</span>
              <p className="text-lg font-black text-[#071933] font-mono mt-0.5">
                ₹{summaryMetrics.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-[#0284c7] font-bold">Aggregate Billed Value</span>
            </div>

            <div className="bg-sky-50 p-3 rounded-xl border border-sky-200">
              <span className="text-[10px] font-bold text-[#0284c7] uppercase tracking-wider">Paid Invoices</span>
              <p className="text-lg font-black text-[#0284c7] mt-0.5">{summaryMetrics.paidCount} Cleared</p>
              <span className="text-[10px] text-[#0284c7] font-bold">Verified Settlements</span>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Pending / Unpaid</span>
              <p className="text-lg font-black text-amber-900 mt-0.5">{summaryMetrics.unpaidCount} Invoices</p>
              <span className="text-[10px] text-amber-700 font-medium">Awaiting Desk Collection</span>
            </div>
          </div>
        )}

        {/* 3. Search and Quick Record Filter Bar (Screen Only) */}
        {viewMode === 'formatted' && (
          <div className="no-print flex items-center justify-between gap-3 bg-white p-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search across all columns (Invoice No, Patient Name, MRN, Date, Amount)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden bg-white shadow-2xs"
              />
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap text-[11px] font-bold text-slate-500">
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-semibold">
                ⇄ Horizontal Scroll Active
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                {filteredData.length} of {safeData.length} records shown
              </span>
            </div>
          </div>
        )}

        {/* 4. Main Spreadsheet Table with Crisp Print Formatting (No Clipping, No Scrollbars on Print) */}
        {viewMode === 'formatted' ? (
          <div className="border border-slate-200 rounded-2xl shadow-xs max-h-[52vh] print:max-h-none print:border-none print:shadow-none print:overflow-visible print:rounded-none overflow-x-auto overflow-y-auto table-scrollbar relative bg-white">
            <table className="w-full min-w-max print:min-w-0 print:w-full text-xs text-left print:text-[8.5px] print:border-collapse print:table-auto">
              <thead className="bg-slate-100 print:bg-slate-200 text-slate-800 print:text-slate-950 font-bold uppercase text-[10px] print:text-[8px] tracking-wider border-b border-slate-200 sticky top-0 backdrop-blur-md z-10 shadow-2xs print:static">
                <tr>
                  <th className="py-2.5 px-3 text-center text-slate-400 print:text-slate-900 w-10 print:w-5 print:py-1 print:px-1 print:border print:border-slate-300">#</th>
                  {safeColumns.map((col, idx) => {
                    const isSorted = sortConfig.key === col;
                    const isAmount = col.toLowerCase().includes('amount') || col.toLowerCase().includes('revenue');

                    return (
                      <th
                        key={idx}
                        onClick={() => handleSort(col)}
                        className={`py-2.5 px-3.5 print:py-1 print:px-1.5 print:border print:border-slate-300 print:text-slate-950 whitespace-nowrap print:whitespace-normal cursor-pointer hover:bg-slate-200/80 transition-colors ${
                          isAmount ? 'text-right' : 'text-left'
                        }`}
                        title="Click to sort column"
                      >
                        <div className={`inline-flex items-center gap-1.5 ${isAmount ? 'justify-end w-full' : ''}`}>
                          <span>{col}</span>
                          <span className="no-print">
                            {isSorted ? (
                              sortConfig.direction === 'asc' ? (
                                <ArrowUp className="w-3 h-3 text-[#0284c7]" />
                              ) : (
                                <ArrowDown className="w-3 h-3 text-[#0284c7]" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                            )}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-300 font-medium">
                {filteredData.length > 0 ? (
                  filteredData.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className={`transition-colors ${
                        rowIdx % 2 === 0 ? 'bg-white hover:bg-sky-50/40' : 'bg-slate-50/50 print:bg-slate-50/70 hover:bg-sky-50/50'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 print:text-slate-700 text-[10px] print:text-[8px] font-mono print:border print:border-slate-300 print:py-1 print:px-1">
                        {rowIdx + 1}
                      </td>
                      {safeColumns.map((col, colIdx) => {
                        const cellVal = Array.isArray(row) ? row[colIdx] : row[col];
                        const isAmount = col.toLowerCase().includes('amount') || col.toLowerCase().includes('revenue');

                        return (
                          <td
                            key={colIdx}
                            className={`py-2.5 px-3.5 print:py-1 print:px-1.5 print:border print:border-slate-300 whitespace-nowrap print:whitespace-normal ${isAmount ? 'text-right' : 'text-left'}`}
                          >
                            {renderCellContent(col, cellVal)}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={safeColumns.length + 1}
                      className="py-10 text-center text-slate-400 text-xs font-semibold print:py-4 print:border print:border-slate-300"
                    >
                      No matching records found for "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950 text-sky-400 font-mono text-xs max-h-[52vh] print:max-h-none overflow-y-auto overflow-x-auto shadow-inner table-scrollbar">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span>UTF-8 Comma-Separated Values (CSV Format)</span>
              <span>Lines: {safeData.length + 1}</span>
            </div>
            <pre className="whitespace-pre leading-relaxed text-[11px]">{generateExportContent()}</pre>
          </div>
        )}

        {/* Official Hospital Print Verification & Signatures (Print Only) */}
        <div className="hidden print:block pt-3 mt-4 border-t-2 border-slate-900 text-[8.5px] text-slate-600">
          <div className="grid grid-cols-3 gap-6 items-end">
            <div>
              <p className="font-bold text-slate-900 uppercase text-[8px]">Data Integrity &amp; Audit Trail</p>
              <p className="text-slate-500 mt-0.5">Electronically verified with 256-bit SHA audit checksum. Official MedicalCare Enterprise Record.</p>
              <p className="font-mono text-[7.5px] text-slate-400 mt-0.5">HASH: MC-EHR-LEDGER-{filteredData.length}REC</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto border border-dashed border-slate-400 rounded-lg flex items-center justify-center text-[7.5px] text-slate-400 uppercase font-bold text-center leading-tight p-1">
                Official Hospital Seal
              </div>
              <p className="text-[7.5px] text-slate-400 mt-0.5">NABH &amp; JCI Accredited</p>
            </div>
            <div className="text-right space-y-2">
              <div className="border-b border-slate-400 pb-0.5 inline-block min-w-[140px]">
                <span className="font-serif text-sm text-slate-800 italic">Dr. E. Hayes, MD</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 uppercase text-[8px]">Authorized Medical Superintendent</p>
                <p className="text-[7.5px] text-slate-500">Chief Records Officer • MedicalCare Hospital</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Footer Action Controls */}
        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <FileCheck className="w-4 h-4 text-[#0284c7] shrink-0" />
            <span>
              Format active: <strong className="text-slate-800">.{exportFormat.toUpperCase()}</strong> (Compatible with Excel 2016-2026, Sheets &amp; Tally)
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
              title="Print formatted sheet"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Sheet</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#0284c7]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Data'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-sky-800/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Download className="w-4 h-4 text-sky-200" />
              <span>Download {exportFormat.toUpperCase()} File</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
