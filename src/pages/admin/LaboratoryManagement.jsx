import React, { useState, useEffect } from 'react';
import { labApi, patientsApi, doctorsApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { LabReportModal } from '../../components/common/LabReportModal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { CustomSelect } from '../../components/common/CustomSelect.jsx';
import {
  FlaskConical,
  Search,
  Plus,
  FileCheck,
  Printer,
  AlertTriangle,
  FileText,
  User
} from 'lucide-react';

export function LaboratoryManagement() {
  const toast = useToast();
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const [selectedTest, setSelectedTest] = useState(null);

  // Order form
  const [orderForm, setOrderForm] = useState({
    patient_id: '',
    doctor_id: '',
    test_name: '',
    category: 'Hematology',
    sample_type: 'Venous Blood',
    normal_range: '',
    notes: ''
  });

  // Results form
  const [resultsForm, setResultsForm] = useState({
    results: '',
    normal_range: '',
    is_abnormal: false,
    notes: ''
  });

  const loadLabData = async () => {
    try {
      setLoading(true);
      const [labRes, patRes, docRes] = await Promise.all([
        labApi.getAll(),
        patientsApi.getAll(),
        doctorsApi.getAll()
      ]);
      if (labRes.success) setTests(labRes.data);
      if (patRes.success) setPatients(patRes.data);
      if (docRes.success) setDoctors(docRes.data);
    } catch (err) {
      console.error('Failed to load lab data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLabData();
  }, []);

  const handleOpenOrder = () => {
    setOrderForm({
      patient_id: patients[0]?.id?.toString() || '',
      doctor_id: doctors[0]?.id?.toString() || '',
      test_name: '',
      category: 'Hematology',
      sample_type: 'Venous Blood',
      normal_range: 'Standard Reference Limits',
      notes: ''
    });
    setOrderModalOpen(true);
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.patient_id || !orderForm.test_name) {
      toast.warning('Patient and test name are required.');
      return;
    }
    try {
      const res = await labApi.order(orderForm);
      if (res.success) {
        toast.success(`Lab test ${res.data.test_code} ordered successfully.`);
        setOrderModalOpen(false);
        loadLabData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to order lab test.');
    }
  };

  const handleOpenResults = (test) => {
    setSelectedTest(test);
    setResultsForm({
      results: test.results || '',
      normal_range: test.normal_range || 'Normal Reference Limits',
      is_abnormal: !!test.is_abnormal,
      notes: test.notes || ''
    });
    setResultsModalOpen(true);
  };

  const handleSaveResults = async (e) => {
    e.preventDefault();
    if (!selectedTest || !resultsForm.results) {
      toast.warning('Results content is required.');
      return;
    }
    try {
      const res = await labApi.authorizeResults(selectedTest.id, {
        results: resultsForm.results,
        normal_range: resultsForm.normal_range,
        is_abnormal: resultsForm.is_abnormal,
        status: 'completed',
        notes: resultsForm.notes
      });
      if (res.success) {
        toast.success('Test results authorized and certified.');
        setResultsModalOpen(false);
        loadLabData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to authorize test results.');
    }
  };

  const filteredTests = tests.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.test_code?.toLowerCase().includes(q) ||
      t.test_name?.toLowerCase().includes(q) ||
      t.patientName?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Printable Lab Report Modal */}
      <LabReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        labTest={selectedTest}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
            Lab Tests
          </h2>
          <p className="text-xs text-slate-500">
            Order medical tests, view results, and print lab reports.
          </p>
        </div>

        <button
          onClick={handleOpenOrder}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          + Order Lab Test
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by accession code, test, or patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {['all', 'ordered', 'processing', 'completed'].map(s => (
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

      {/* Tests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Accession & Patient</th>
                <th className="px-5 py-3.5">Diagnostic Test Name</th>
                <th className="px-5 py-3.5">Category & Specimen</th>
                <th className="px-5 py-3.5">Order Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading diagnostic orders...</td>
                </tr>
              ) : filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">No laboratory test orders found.</td>
                </tr>
              ) : (
                filteredTests.map(test => (
                  <tr key={test.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{test.patientName}</p>
                      <span className="font-mono text-[10px] text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        {test.test_code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-800">{test.test_name}</p>
                      <span className="text-[10px] text-slate-400">Dr. {test.doctorName}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-700 block">{test.category}</span>
                      <span className="text-[10px] text-slate-400">{test.sample_type}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-800">{test.ordered_date}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={test.status === 'completed' ? 'success' : test.status === 'processing' ? 'warning' : 'info'}>
                        {test.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenResults(test)}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284c7] font-bold text-[11px] transition-colors"
                          title="Record / Authorize Diagnostic Results"
                        >
                          {test.status === 'completed' ? 'Edit Findings' : 'Authorize Results'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTest(test);
                            setReportModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          title="Print Certified Lab Certificate"
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

      {/* Modal: Order New Test */}
      <Modal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        title="Order Clinical Diagnostic Test"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleConfirmOrder} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <CustomSelect
                label="Patient"
                required
                placeholder="-- Select Patient --"
                value={orderForm.patient_id}
                onChange={(val) => setOrderForm(prev => ({ ...prev, patient_id: val }))}
                options={patients.map(p => ({
                  value: p.id,
                  label: `${p.first_name} ${p.last_name}`,
                  sublabel: p.mrn
                }))}
              />
            </div>
            <div>
              <CustomSelect
                label="Ordering Physician"
                placeholder="-- Select Physician --"
                value={orderForm.doctor_id}
                onChange={(val) => setOrderForm(prev => ({ ...prev, doctor_id: val }))}
                options={doctors.map(d => ({
                  value: d.id,
                  label: d.name,
                  sublabel: d.specialty
                }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">Test Name *</label>
              <input
                type="text"
                placeholder="e.g. Complete Blood Count, Liver Function Panel, 3T Brain MRI"
                value={orderForm.test_name}
                onChange={(e) => setOrderForm({ ...orderForm, test_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                required
              />
            </div>
            <div>
              <CustomSelect
                label="Category"
                placeholder="-- Select Category --"
                value={orderForm.category}
                onChange={(val) => setOrderForm(prev => ({ ...prev, category: val }))}
                options={['Hematology', 'Clinical Biochemistry', 'Radiology', 'Neuroradiology', 'Microbiology', 'Pathology']}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Specimen Sample</label>
              <input
                type="text"
                placeholder="e.g. Venous Blood, Urine, Imaging"
                value={orderForm.sample_type}
                onChange={(e) => setOrderForm({ ...orderForm, sample_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setOrderModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
            >
              Issue Test Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Authorize Results */}
      <Modal
        isOpen={resultsModalOpen}
        onClose={() => setResultsModalOpen(false)}
        title="Authorize Clinical Diagnostic Results"
        subtitle={selectedTest ? `${selectedTest.test_name} (${selectedTest.test_code})` : ''}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveResults} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Diagnostic Findings / Results *</label>
            <textarea
              rows={4}
              placeholder="Enter detailed laboratory analyzer values, platelet count, radiologic observations..."
              value={resultsForm.results}
              onChange={(e) => setResultsForm({ ...resultsForm, results: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Biological Reference Limits</label>
            <input
              type="text"
              placeholder="e.g. WBC: 4.5 - 11.0 K/uL"
              value={resultsForm.normal_range}
              onChange={(e) => setResultsForm({ ...resultsForm, normal_range: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isAbnormal"
              checked={resultsForm.is_abnormal}
              onChange={(e) => setResultsForm({ ...resultsForm, is_abnormal: e.target.checked })}
              className="rounded text-[#0284c7] focus:ring-[#0284c7]"
            />
            <label htmlFor="isAbnormal" className="font-bold text-rose-700 cursor-pointer">
              Flag as Clinically Abnormal / Outside Biological Limits
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setResultsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold"
            >
              Sign & Authorize Report
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
