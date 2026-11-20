import React, { useState, useEffect } from 'react';
import { pharmacyApi, patientsApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { CustomSelect } from '../../components/common/CustomSelect.jsx';
import { CustomDatePicker } from '../../components/common/CustomDatePicker.jsx';
import {
  Pill,
  Search,
  Plus,
  AlertTriangle,
  MinusCircle,
  Package,
  Calendar,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export function PharmacyInventory() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [dispenseModalOpen, setDispenseModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dispenseQty, setDispenseQty] = useState(1);
  const [dispensePatientId, setDispensePatientId] = useState('');
  const [safetyCheckResult, setSafetyCheckResult] = useState(null);
  const [checkingSafety, setCheckingSafety] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    category: 'Antibiotics',
    dosage_form: 'Tablet',
    strength: '500mg',
    unit_price: 15.00,
    stock_quantity: 100,
    min_stock_level: 25,
    batch_number: '',
    expiry_date: '2027-12-31',
    supplier: 'Authorized Pharma Corp'
  });

  const loadPharmacy = async () => {
    try {
      setLoading(true);
      const [res, patRes] = await Promise.all([
        pharmacyApi.getAll({ lowStock: lowStockOnly ? 'true' : '' }),
        patientsApi.getAll()
      ]);
      if (res.success) setItems(res.data);
      if (patRes.success) {
        setPatients(patRes.data);
        if (patRes.data.length > 0) setDispensePatientId(patRes.data[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load pharmacy:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPharmacy();
  }, [lowStockOnly]);

  const handleOpenAdd = () => {
    const randomBatch = `BAT-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      name: '',
      generic_name: '',
      category: 'Antibiotics',
      dosage_form: 'Tablet',
      strength: '500mg',
      unit_price: 15.00,
      stock_quantity: 100,
      min_stock_level: 25,
      batch_number: randomBatch,
      expiry_date: '2027-12-31',
      supplier: 'Authorized Pharma Corp'
    });
    setAddModalOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.batch_number) {
      toast.warning('Drug name and batch number are required.');
      return;
    }
    try {
      const res = await pharmacyApi.add(formData);
      if (res.success) {
        toast.success(`Medicine ${formData.name} added to pharmacy inventory.`);
        setAddModalOpen(false);
        loadPharmacy();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add medicine.');
    }
  };

  const handleOpenDispense = async (item) => {
    setSelectedItem(item);
    setDispenseQty(1);
    setSafetyCheckResult(null);
    setDispenseModalOpen(true);

    if (patients.length > 0) {
      runSafetyCheck(item.name, patients[0].id);
    }
  };

  const runSafetyCheck = async (medName, patientId) => {
    setCheckingSafety(true);
    try {
      const res = await pharmacyApi.checkSafety(medName, patientId);
      if (res.success) {
        setSafetyCheckResult(res);
      }
    } catch (err) {
      console.error('Safety check failed:', err);
    } finally {
      setCheckingSafety(false);
    }
  };

  const handlePatientSelectChange = (patId) => {
    setDispensePatientId(patId);
    if (selectedItem) {
      runSafetyCheck(selectedItem.name, patId);
    }
  };

  const handleConfirmDispense = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (safetyCheckResult?.safetyReport?.hasCriticalWarning) {
      toast.error('DISPENSING BLOCKED: Patient has documented severe allergy contraindication to this drug class!');
      return;
    }

    try {
      const res = await pharmacyApi.dispense(selectedItem.id, dispenseQty, dispensePatientId);
      if (res.success) {
        toast.success(`Dispensed ${dispenseQty} units of ${selectedItem.name} safely.`);
        setDispenseModalOpen(false);
        loadPharmacy();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to dispense medication.');
    }
  };

  const filteredItems = items.filter(i => {
    const q = searchQuery.toLowerCase();
    return (
      i.name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.batch_number.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
            Pharmacy
          </h2>
          <p className="text-xs text-slate-500">
            Manage medicine stock, pricing, and dispensing.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          + Add Medicine
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search drug by brand, generic, or batch#..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-colors ${
              lowStockOnly
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Low Stock Alerts Only</span>
          </button>
        </div>
      </div>

      {/* Pharmacy Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Medication & Strength</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Batch & Expiry</th>
                <th className="px-5 py-3.5">Unit Price</th>
                <th className="px-5 py-3.5">Stock Level & Supply</th>
                <th className="px-5 py-3.5">Reorder & Health</th>
                <th className="px-5 py-3.5 text-right">Dispense</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">Loading pharmacy stock...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">No medication items found.</td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isLow = item.stock_quantity <= item.min_stock_level;
                  const risk = item.inventoryRisk || {};
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                        <p className="text-[10px] text-slate-400">{item.generic_name} • {item.dosage_form}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-800">{item.category}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[10px] text-slate-600 block">{item.batch_number}</span>
                        <span className={`text-[10px] font-bold ${
                          risk.expiryRisk === 'CRITICAL_EXPIRY_RISK' ? 'text-rose-600' : 'text-slate-400'
                        }`}>
                          Exp: {item.expiry_date}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                        ₹{parseFloat(item.unit_price).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-mono font-extrabold text-sm ${isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                          {item.stock_quantity} units
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          ~{risk.daysOfSupply || 10} days remaining
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="space-y-1">
                          <Badge variant={isLow ? 'warning' : 'success'}>
                            {isLow ? `Low (ROP: ${risk.reorderPoint || 25})` : 'Optimal'}
                          </Badge>
                          {risk.expiryRisk === 'CRITICAL_EXPIRY_RISK' && (
                            <span className="block text-[10px] font-bold text-rose-600">
                              Expires in {risk.daysUntilExpiry}d!
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenDispense(item)}
                          disabled={item.stock_quantity === 0}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284c7] font-bold text-[11px] transition-colors disabled:opacity-40"
                        >
                          Dispense
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Medicine */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Pharmaceutical Item"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Brand Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Generic Chemical Name</label>
              <input
                type="text"
                value={formData.generic_name}
                onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>
            <div>
              <CustomSelect
                label="Category"
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                options={['Cardiovascular', 'Antibiotics', 'Endocrinology', 'Pulmonology', 'Gastroenterology', 'Analgesic']}
                searchable={false}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Unit Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Initial Stock Quantity</label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Min Alert Stock Threshold</label>
              <input
                type="number"
                value={formData.min_stock_level}
                onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Batch Number *</label>
              <input
                type="text"
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                required
              />
            </div>
            <div>
              <CustomDatePicker
                label="Expiry Date"
                required
                value={formData.expiry_date}
                onChange={(dateStr) => setFormData({ ...formData, expiry_date: dateStr })}
                placeholder="YYYY-MM-DD"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold"
            >
              Add Item to Inventory
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Dispense Medicine with Allergy Cross-Checker */}
      <Modal
        isOpen={dispenseModalOpen}
        onClose={() => setDispenseModalOpen(false)}
        title="Dispense Medication"
        subtitle={selectedItem ? `${selectedItem.name} (Batch: ${selectedItem.batch_number})` : ''}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleConfirmDispense} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="text-slate-500">Currently in inventory: <strong className="text-slate-900">{selectedItem?.stock_quantity} units</strong></p>
            <p className="text-slate-500">Unit Price: <strong className="font-mono text-[#0284c7]">₹{parseFloat(selectedItem?.unit_price || 0).toFixed(2)}</strong></p>
          </div>

          {/* Patient Selection for Allergy Safety Verification */}
          <div>
            <CustomSelect
              label="Select Patient for Pharmacovigilance Cross-Check"
              required
              placeholder="-- Choose Patient --"
              value={dispensePatientId}
              onChange={(val) => handlePatientSelectChange(val)}
              options={patients.map(p => ({
                value: p.id,
                label: `${p.first_name} ${p.last_name}`,
                sublabel: `${p.mrn} • Allergies: ${p.allergies || 'None'}`
              }))}
            />
          </div>

          {/* Allergy Safety Report Alert Box */}
          {safetyCheckResult && (
            <div className={`p-3.5 rounded-xl border ${
              safetyCheckResult.safetyReport?.hasCriticalWarning
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : 'bg-sky-50 border-sky-200 text-[#071933]'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {safetyCheckResult.safetyReport?.hasCriticalWarning ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span className="text-rose-700">CONTRAINDICATION WARNING</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
                    <span className="text-[#0284c7]">Allergy Safety Check Passed</span>
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed">
                {safetyCheckResult.safetyReport?.hasCriticalWarning
                  ? safetyCheckResult.safetyReport.alerts[0].message
                  : `Patient (${safetyCheckResult.patientName}) has no recorded cross-sensitivity to ${selectedItem?.name}. Safe to dispense.`}
              </p>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Quantity to Dispense *</label>
            <input
              type="number"
              min="1"
              max={selectedItem?.stock_quantity || 1}
              value={dispenseQty}
              onChange={(e) => setDispenseQty(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDispenseModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={safetyCheckResult?.safetyReport?.hasCriticalWarning}
              className={`px-5 py-2 rounded-xl font-bold text-white transition-colors ${
                safetyCheckResult?.safetyReport?.hasCriticalWarning
                  ? 'bg-rose-400 cursor-not-allowed opacity-60'
                  : 'bg-[#0284c7] hover:bg-[#0b2447]'
              }`}
            >
              {safetyCheckResult?.safetyReport?.hasCriticalWarning ? 'Blocked by Allergy Safety' : 'Confirm Safe Dispensing'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
