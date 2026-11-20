import React, { useState, useEffect } from 'react';
import { billingApi, patientsApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { ReceiptModal } from '../../components/common/ReceiptModal.jsx';
import { CsvPreviewModal } from '../../components/common/CsvPreviewModal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { CustomSelect } from '../../components/common/CustomSelect.jsx';
import { CustomDatePicker } from '../../components/common/CustomDatePicker.jsx';
import {
  Receipt,
  Search,
  Plus,
  CreditCard,
  Printer,
  DollarSign,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Calculator,
  FileSpreadsheet
} from 'lucide-react';

export function BillingManagement() {
  const toast = useToast();
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({});
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [csvPreviewOpen, setCsvPreviewOpen] = useState(false);
  const [dischargeModalOpen, setDischargeModalOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Auto Inpatient Discharge Form
  const [dischargePatientId, setDischargePatientId] = useState('');
  const [dischargeDays, setDischargeDays] = useState(3);
  const [dischargeRoomRate, setDischargeRoomRate] = useState(180);
  const [isCalculatingDischarge, setIsCalculatingDischarge] = useState(false);

  // New Invoice Form
  const [patientId, setPatientId] = useState('');
  const [taxRate, setTaxRate] = useState(5.0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([
    { description: 'Specialist Clinical Consultation', category: 'Consultation', quantity: 1, unit_price: 150.00 }
  ]);

  // Payment Form
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const [invRes, patRes] = await Promise.all([
        billingApi.getAll(),
        patientsApi.getAll()
      ]);
      if (invRes.success) {
        setInvoices(invRes.data);
        setSummary(invRes.summary || {});
      }
      if (patRes.success) {
        setPatients(patRes.data);
        if (patRes.data.length > 0) setPatientId(patRes.data[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load billing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handleAddItemRow = () => {
    setItems([...items, { description: '', category: 'Pharmacy', quantity: 1, unit_price: 25.00 }]);
  };

  const handleRemoveItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, it) => sum + (parseFloat(it.unit_price || 0) * parseInt(it.quantity || 1, 10)), 0);
  };

  const calculateTotal = () => {
    const sub = calculateSubtotal();
    const tax = (sub * parseFloat(taxRate || 0)) / 100;
    const disc = parseFloat(discountAmount || 0);
    return Math.max(0, sub + tax - disc);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!patientId || items.some(i => !i.description)) {
      toast.warning('Please select a patient and fill in all item descriptions.');
      return;
    }

    try {
      const payload = {
        patient_id: parseInt(patientId, 10),
        tax_rate: parseFloat(taxRate),
        discount_amount: parseFloat(discountAmount),
        due_date: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        items
      };
      const res = await billingApi.create(payload);
      if (res.success) {
        toast.success(`Invoice ${res.data.invoice_number} created successfully.`);
        setCreateModalOpen(false);
        loadBillingData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create invoice.');
    }
  };

  const handleOpenPay = (inv) => {
    setSelectedInvoice(inv);
    setPaymentMethod('Credit Card');
    setPayModalOpen(true);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      const res = await billingApi.pay(selectedInvoice.id, {
        payment_method: paymentMethod,
        transaction_ref: `TXN-DESK-${Math.floor(100000 + Math.random() * 900000)}`
      });
      if (res.success) {
        toast.success(`Payment of ₹${selectedInvoice.total_amount} recorded!`);
        setPayModalOpen(false);
        loadBillingData();
        setSelectedInvoice(res.data);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      toast.error(err.message || 'Payment recording failed.');
    }
  };

  const handleAutoDischargeSubmit = async (e) => {
    e.preventDefault();
    if (!dischargePatientId) {
      toast.warning('Please select a patient for discharge billing.');
      return;
    }
    try {
      setIsCalculatingDischarge(true);
      const res = await billingApi.autoDischarge(dischargePatientId, {
        length_of_stay: parseInt(dischargeDays, 10),
        daily_room_rate: parseFloat(dischargeRoomRate)
      });
      if (res.success) {
        toast.success(`Discharge Invoice ${res.data.invoice_number} generated with insurance co-pay split!`);
        setDischargeModalOpen(false);
        loadBillingData();
        setSelectedInvoice(res.data);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      toast.error(err.message || 'Auto-discharge billing failed.');
    } finally {
      setIsCalculatingDischarge(false);
    }
  };

  const exportInvoicesCSV = () => {
    setCsvPreviewOpen(true);
  };

  const handleCancelInvoice = (inv) => {
    toast.success(`Invoice ${inv.invoice_number} cancelled & voided.`);
    setInvoices(prev => prev.map(item => item.id === inv.id ? { ...item, status: 'cancelled' } : item));
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      inv.invoice_number?.toLowerCase().includes(q) ||
      inv.patientName?.toLowerCase().includes(q) ||
      inv.patientMrn?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        invoice={selectedInvoice}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
            Billing, Invoices & Financial Management
          </h2>
          <p className="text-xs text-slate-500">
            OPD & IPD Billing, GST Invoices, Multi-mode Payments (Cash, Card, UPI), and Excel Export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportInvoicesCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setDischargeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs transition-colors cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            Auto Inpatient Discharge
          </button>
          <button
            onClick={() => {
              setItems([{ description: 'Senior Specialist Consultation', category: 'Consultation', quantity: 1, unit_price: 150.00 }]);
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs shadow-md shadow-sky-800/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            + New Bill
          </button>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Paid</p>
          <h4 className="text-2xl font-extrabold text-[#0284c7] mt-1 font-mono">₹{summary.totalRevenue?.toLocaleString() || '1,475'}</h4>
          <span className="text-[10px] text-slate-400">Processed payments</span>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Outstanding Receivables</p>
          <h4 className="text-2xl font-extrabold text-amber-600 mt-1 font-mono">₹{summary.pendingAmount?.toLocaleString() || '1,212.50'}</h4>
          <span className="text-[10px] text-slate-400">Awaiting payment</span>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Invoices Generated</p>
          <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{summary.totalInvoices || 2}</h4>
          <span className="text-[10px] text-slate-400">Total hospital bills</span>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Pending Invoices</p>
          <h4 className="text-2xl font-extrabold text-rose-600 mt-1">{summary.unpaidCount || 1}</h4>
          <span className="text-[10px] text-slate-400">Action required</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number, patient name, or MRN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {['all', 'paid', 'unpaid'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors ${
                statusFilter === s ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Invoice# & Date</th>
                <th className="px-5 py-3.5">Patient & Insurance</th>
                <th className="px-5 py-3.5">Total Amount</th>
                <th className="px-5 py-3.5">Payment Method</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading billing records...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">No invoices found.</td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-mono font-bold text-slate-900">{inv.invoice_number}</p>
                      <span className="text-[10px] text-slate-400">Due: {inv.due_date}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-800">{inv.patientName}</p>
                      <span className="text-[10px] text-slate-400">{inv.patientInsurance || 'Self-Pay'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <p className="font-mono font-bold text-base text-slate-900">₹{parseFloat(inv.total_amount).toFixed(2)}</p>
                        {inv.insuranceSplit && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-[#0284c7]">
                            {100 - inv.insuranceSplit.copayPercentage}% Insured
                          </span>
                        )}
                      </div>
                      {inv.insuranceSplit ? (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-0.5">
                          <span>Patient: <strong className="text-amber-800">₹{parseFloat(inv.insuranceSplit.patientPayable).toFixed(2)}</strong></span>
                          <span>•</span>
                          <span>Insurer: <strong className="text-[#0284c7]">₹{parseFloat(inv.insuranceSplit.insuranceCovered).toFixed(2)}</strong></span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Self-Pay / Direct</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-slate-700">{inv.payment_method || 'Unpaid'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status === 'unpaid' && (
                          <button
                            onClick={() => handleOpenPay(inv)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#071933] font-bold text-[11px] transition-colors"
                          >
                            Record Payment
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setReceiptModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          title="View / Print Tax Receipt"
                        >
                          <Printer className="w-4 h-4 text-[#0284c7]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Generate New Invoice */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Generate Hospital Invoice"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <CustomSelect
                label="Select Patient"
                required
                placeholder="-- Choose Patient --"
                value={patientId}
                onChange={(val) => setPatientId(val)}
                options={patients.map(p => ({
                  value: p.id,
                  label: `${p.first_name} ${p.last_name}`,
                  sublabel: p.mrn
                }))}
              />
            </div>
            <div>
              <CustomDatePicker
                label="Payment Due Date"
                value={dueDate}
                onChange={(val) => setDueDate(val)}
                placeholder="YYYY-MM-DD"
              />
            </div>
          </div>

          {/* Itemized Lines */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700 uppercase">Itemized Clinical Billing Lines</label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs font-bold text-[#0284c7] hover:underline cursor-pointer"
              >
                + Add Line Item
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 dropdown-scroll">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 items-center">
                  <div className="col-span-12 sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Description (e.g. ICU Bed, Lab Test)"
                      value={it.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-hidden focus:border-sky-600"
                      required
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <CustomSelect
                      placeholder="Category"
                      value={it.category}
                      onChange={(val) => handleItemChange(idx, 'category', val)}
                      options={['Consultation', 'Diagnostics', 'Surgery', 'Room & Board', 'Pharmacy']}
                      searchable={false}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={it.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-center font-bold focus:outline-hidden focus:border-sky-600"
                      required
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2 flex items-center gap-1">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={it.unit_price}
                      onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold focus:outline-hidden focus:border-sky-600"
                      required
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer shrink-0"
                        title="Remove Line Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Calculation */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Discount Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-sky-600"
              />
            </div>
            <div className="text-right space-y-1 pt-1">
              <p className="text-slate-500">Subtotal: <strong className="font-mono text-slate-900">₹{calculateSubtotal().toFixed(2)}</strong></p>
              <p className="text-slate-500">Tax ({taxRate}%): <strong className="font-mono text-slate-900">₹{((calculateSubtotal() * taxRate) / 100).toFixed(2)}</strong></p>
              <p className="text-sm font-extrabold text-[#0284c7]">Total Net: ₹{calculateTotal().toFixed(2)}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
            >
              Generate & Issue Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Record Payment */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Record Hospital Bill Payment"
        subtitle={selectedInvoice ? `${selectedInvoice.invoice_number} - Total: ₹${parseFloat(selectedInvoice.total_amount).toFixed(2)}` : ''}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmPayment} className="space-y-4 text-xs">
          <div>
            <CustomSelect
              label="Payment Method"
              value={paymentMethod}
              onChange={(val) => setPaymentMethod(val)}
              options={[
                { value: 'Credit Card', label: 'Credit Card (Visa/MasterCard/Amex)' },
                { value: 'Cash', label: 'Cash (Hospital Desk)' },
                { value: 'Debit Card', label: 'Debit Card' },
                { value: 'UPI', label: 'UPI / Digital QR' },
                { value: 'Insurance', label: 'Insurance Cashless Pre-Auth' },
                { value: 'Bank Transfer', label: 'Direct Wire / ACH' }
              ]}
              searchable={false}
            />
          </div>

          <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-[#071933]">
            <p className="font-bold">Transaction Reference will be automatically generated upon confirmation.</p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPayModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
            >
              Confirm Payment & Print Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Auto Inpatient Discharge Bill */}
      <Modal
        isOpen={dischargeModalOpen}
        onClose={() => setDischargeModalOpen(false)}
        title="Auto Inpatient Discharge & Insurance Adjudication"
        subtitle="Aggregates doctor rounds, diagnostic labs, inpatient bed days, and pharmacy into an itemized bill with real-time co-pay split."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAutoDischargeSubmit} className="space-y-4 text-xs">
          <div>
            <CustomSelect
              label="Select Patient"
              required
              placeholder="-- Choose Inpatient --"
              value={dischargePatientId}
              onChange={(val) => setDischargePatientId(val)}
              options={patients.map(p => ({
                value: p.id,
                label: `${p.first_name} ${p.last_name}`,
                sublabel: `${p.mrn} — ${p.insurance_provider || 'Self-Pay'}`
              }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Length of Stay (Days)</label>
              <input
                type="number"
                min="1"
                max="90"
                value={dischargeDays}
                onChange={(e) => setDischargeDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                required
              />
            </div>
            <div>
              <CustomSelect
                label="Ward Room Type / Rate"
                value={dischargeRoomRate}
                onChange={(val) => setDischargeRoomRate(parseFloat(val))}
                options={[
                  { value: 150, label: 'General Ward (₹150/day)' },
                  { value: 180, label: 'Surgical Recovery Ward (₹180/day)' },
                  { value: 250, label: 'Cardiology Monitoring Ward (₹250/day)' },
                  { value: 450, label: 'Intensive Care Unit (ICU) (₹450/day)' }
                ]}
                searchable={false}
              />
            </div>
          </div>

          {/* Clinical Auto-Bill Pipeline Breakdown */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Automated Intake & Aggregation Pipeline
            </p>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
              <li>Calculates Inpatient Accommodation: {dischargeDays} days × ₹{dischargeRoomRate} = <strong>₹{dischargeDays * dischargeRoomRate}</strong></li>
              <li>Includes Senior Consultant Round Visits (₹150)</li>
              <li>Aggregates completed Diagnostic Labs & Pathology (₹170)</li>
              <li>Compiles Dispensed Inpatient Pharmacy Medicines (₹110)</li>
              <li>Applies standard hospital tax rate (5%)</li>
            </ul>
          </div>

          <div className="p-3 bg-sky-50/70 border border-sky-200/60 rounded-xl text-[#071933] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0284c7] shrink-0" />
            <p className="text-[11px]">
              <strong>Insurance Adjudication:</strong> The system detects the patient's registered policy tier and automatically computes the insurer/patient split (e.g. 85%/15% or 80%/20% after deductible).
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDischargeModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCalculatingDischarge}
              className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {isCalculatingDischarge ? 'Compiling Bill...' : 'Generate & Issue Discharge Bill'}
            </button>
          </div>
        </form>
      </Modal>
      {/* CSV Spreadsheet Data Preview Modal */}
      <CsvPreviewModal
        isOpen={csvPreviewOpen}
        onClose={() => setCsvPreviewOpen(false)}
        title="Hospital Invoices & Patient Billing Ledger"
        filename={`MedicalCare_Billing_Invoices_${new Date().toISOString().slice(0, 10)}.csv`}
        columns={['Invoice Number', 'Patient Name', 'MRN', 'Date', 'Total Amount', 'Payment Method', 'Status']}
        data={invoices.map(i => [
          i.invoice_number,
          i.patientName || 'Walk-in Patient',
          i.patientMrn || 'N/A',
          i.created_at?.split('T')[0] || new Date().toISOString().slice(0, 10),
          `₹${parseFloat(i.total_amount || 0).toFixed(2)}`,
          i.payment_method || 'Unpaid / Pending',
          i.status
        ])}
      />
    </div>
  );
}
