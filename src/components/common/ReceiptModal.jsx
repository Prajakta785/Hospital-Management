import React from 'react';
import { Modal } from './Modal.jsx';
import { Printer, CheckCircle2, ShieldCheck, FileText, CreditCard } from 'lucide-react';

export function ReceiptModal({ isOpen, onClose, invoice }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.status === 'paid';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hospital Medical Receipt / Invoice" maxWidth="max-w-2xl">
      <div className="printable-area space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white p-0.5 border border-slate-200 overflow-hidden shadow-xs">
                <img src="/images/logo-icon.png" alt="MedicalCare Logo" className="w-full h-full object-contain" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">MedicalCare Hospital</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">740 Health Sciences Blvd, Chicago, IL 60611</p>
            <p className="text-xs text-slate-500">Tel: +1 (800) 273-9227 | Tax ID: US-EIN-94819203</p>
          </div>
          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isPaid ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {invoice.status}
            </span>
            <p className="text-sm font-mono font-bold text-slate-800 mt-1">{invoice.invoice_number}</p>
            <p className="text-xs text-slate-500">Date: {invoice.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]}</p>
          </div>
        </div>

        {/* Patient & Billing Info */}
        <div className="grid grid-cols-2 gap-6 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <p className="text-slate-400 font-semibold uppercase tracking-wider mb-1">Billed To:</p>
            <p className="text-sm font-bold text-slate-900">{invoice.patientName}</p>
            <p className="mt-0.5">MRN: <span className="font-mono font-semibold">{invoice.patientMrn || 'N/A'}</span></p>
            <p className="mt-0.5">Insurance: {invoice.patientInsurance || 'Self-Pay'}</p>
            <p className="mt-0.5">{invoice.patientAddress || 'Chicago, IL'}</p>
          </div>
          <div>
            <p className="text-slate-400 font-semibold uppercase tracking-wider mb-1">Payment Details:</p>
            <p className="font-semibold text-slate-800">
              Payment Method: <span className="text-slate-900 font-bold">{invoice.payment_method || 'Pending'}</span>
            </p>
            {invoice.transaction_ref && (
              <p className="mt-0.5 font-mono text-slate-600">Ref: {invoice.transaction_ref}</p>
            )}
            <p className="mt-0.5 text-slate-600">Due Date: {invoice.due_date || 'Immediate'}</p>
            {invoice.paid_at && (
              <p className="mt-0.5 text-[#0284c7] font-semibold">
                Paid At: {invoice.paid_at.split('T')[0]} {invoice.paid_at.split('T')[1]?.substring(0, 5)}
              </p>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(invoice.items || []).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{item.description}</td>
                  <td className="px-4 py-2.5 text-slate-500">{item.category}</td>
                  <td className="px-4 py-2.5 text-center">{item.quantity}</td>
                  <td className="px-4 py-2.5 text-right font-mono">₹{parseFloat(item.unit_price).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-slate-900 font-mono">₹{parseFloat(item.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          {invoice.insuranceSplit ? (
            <div className="flex-1 bg-sky-50/70 border border-sky-200/60 rounded-xl p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#071933]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
                  Insurance Split ({invoice.insuranceSplit.policyTier || 'Cashless'})
                </span>
                <span className="bg-sky-200/80 text-sky-900 px-2 py-0.5 rounded text-[10px]">
                  {invoice.insuranceSplit.copayPercentage}% Co-Pay
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-sky-100">
                  <p className="text-[10px] text-[#0284c7] uppercase font-sans">Insurer Pays</p>
                  <p className="font-bold text-[#0284c7]">₹{parseFloat(invoice.insuranceSplit.insuranceCovered || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-sky-100">
                  <p className="text-[10px] text-amber-700 uppercase font-sans">Patient Responsibility</p>
                  <p className="font-bold text-amber-800">₹{parseFloat(invoice.insuranceSplit.patientPayable || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ) : <div />}

          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold">₹{parseFloat(invoice.subtotal || 0).toFixed(2)}</span>
            </div>
            {parseFloat(invoice.discount_amount || 0) > 0 && (
              <div className="flex justify-between text-[#0284c7]">
                <span>Discount Applied:</span>
                <span className="font-mono font-semibold">-₹{parseFloat(invoice.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Tax ({invoice.tax_rate || 5}%):</span>
              <span className="font-mono font-semibold">₹{parseFloat(invoice.tax_amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Net Amount:</span>
              <span className="text-[#071933] font-mono">₹{parseFloat(invoice.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Stamp */}
        <div className="flex items-center justify-between pt-4 border-t border-dashed border-slate-200 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-[#0284c7] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Authorized Medical Billing Stamp</span>
          </div>
          <p>Thank you for choosing MedicalCare Hospital.</p>
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
            Print Receipt / Invoice
          </button>
        </div>
      </div>
    </Modal>
  );
}
