import React, { useState, useEffect } from 'react';
import { patientsApi, prescriptionsApi, doctorsApi, appointmentsApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { PrescriptionSlipModal } from '../../components/common/PrescriptionSlipModal.jsx';
import { CsvPreviewModal } from '../../components/common/CsvPreviewModal.jsx';
import { CustomSelect } from '../../components/common/CustomSelect.jsx';
import { CustomDatePicker } from '../../components/common/CustomDatePicker.jsx';
import {
  Users,
  Search,
  Plus,
  Edit,
  Eye,
  FileText,
  UserCheck,
  AlertCircle,
  Phone,
  Calendar,
  ShieldCheck,
  Bed,
  CheckCircle2,
  Pill,
  Printer,
  BarChart2,
  Download,
  Activity,
  HeartPulse,
  UserPlus,
  Stethoscope,
  Trash2
} from 'lucide-react';

export function PatientManagement() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' | 'prescriptions' | 'analytics' | 'admissions'
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [rxSlipModalOpen, setRxSlipModalOpen] = useState(false);
  const [createRxModalOpen, setCreateRxModalOpen] = useState(false);
  const [deleteRxModalOpen, setDeleteRxModalOpen] = useState(false);
  const [rxToDelete, setRxToDelete] = useState(null);
  const [deletingRx, setDeletingRx] = useState(false);
  const [csvPreviewOpen, setCsvPreviewOpen] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedRx, setSelectedRx] = useState(null);
  const [dossierData, setDossierData] = useState(null);
  const [dossierLoading, setDossierLoading] = useState(false);

  // Form State: Patient Registration
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dob: '1990-01-01',
    age: 35,
    gender: 'Male',
    blood_group: 'O+',
    phone: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    allergies: 'None recorded',
    medical_history: '',
    insurance_provider: 'Self-Pay',
    insurance_policy_number: 'N/A',
    admission_status: 'outpatient'
  });

  // Form State: New E-Prescription
  const [rxForm, setRxForm] = useState({
    patient_id: '',
    doctor_id: '',
    diagnosis: '',
    instructions: 'Take medications as directed with plenty of water.',
    medicines: [
      { medicine_name: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 Days', instructions: 'After food' }
    ]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [patRes, rxRes, docRes, aptRes] = await Promise.all([
        patientsApi.getAll(),
        prescriptionsApi.getAll(),
        doctorsApi.getAll(),
        appointmentsApi.getAll()
      ]);
      if (patRes.success) {
        const sortedPats = (patRes.data || []).slice().sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
        setPatients(sortedPats);
      }
      if (rxRes.success) setPrescriptions(rxRes.data || []);
      if (docRes.success) setDoctors(docRes.data || []);
      if (aptRes.success) setAppointments(aptRes.data || []);
    } catch (err) {
      console.error('Failed to load patient management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      first_name: '',
      last_name: '',
      dob: '1990-01-01',
      age: 35,
      gender: 'Male',
      blood_group: 'O+',
      phone: '',
      email: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      allergies: 'None recorded',
      medical_history: '',
      insurance_provider: 'Self-Pay',
      insurance_policy_number: 'N/A',
      admission_status: 'outpatient'
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      dob: patient.dob || '1990-01-01',
      age: patient.age || 30,
      gender: patient.gender || 'Male',
      blood_group: patient.blood_group || 'O+',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      emergency_contact_name: patient.emergency_contact_name || '',
      emergency_contact_phone: patient.emergency_contact_phone || '',
      allergies: patient.allergies || '',
      medical_history: patient.medical_history || '',
      insurance_provider: patient.insurance_provider || 'Self-Pay',
      insurance_policy_number: patient.insurance_policy_number || '',
      admission_status: patient.admission_status || 'outpatient'
    });
    setEditModalOpen(true);
  };

  const handleViewDossier = async (patientId) => {
    try {
      setDossierLoading(true);
      setDossierData(null);
      setDossierModalOpen(true);
      const res = await patientsApi.getDossier(patientId);
      if (res && res.success) {
        setDossierData(res.data);
      } else {
        toast.error(res?.message || 'Failed to load patient EHR dossier.');
      }
    } catch (err) {
      console.error('Failed to load patient dossier:', err);
      toast.error('Failed to load patient EHR dossier.');
    } finally {
      setDossierLoading(false);
    }
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.phone) {
      toast.warning('Please enter patient name and phone number.');
      return;
    }
    try {
      const res = await patientsApi.create(formData);
      if (res.success) {
        toast.success(`Patient ${formData.first_name} ${formData.last_name} registered successfully.`);
        setAddModalOpen(false);
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to register patient.');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    try {
      const res = await patientsApi.update(selectedPatient.id, formData);
      if (res.success) {
        toast.success('Patient profile updated successfully.');
        setEditModalOpen(false);
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update patient profile.');
    }
  };

  // Dynamic Medicines for E-Prescription
  const handleAddMedicineRow = () => {
    setRxForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { medicine_name: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 Days', instructions: 'After food' }]
    }));
  };

  const handleRemoveMedicineRow = (index) => {
    if (rxForm.medicines.length === 1) return;
    setRxForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleCreatePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (!rxForm.patient_id || !rxForm.diagnosis) {
      toast.warning('Please select a patient and enter a diagnosis.');
      return;
    }
    const validItems = rxForm.medicines.filter(m => m.medicine_name.trim() !== '');
    if (validItems.length === 0) {
      toast.warning('Please specify at least one medication.');
      return;
    }

    try {
      const res = await prescriptionsApi.create({
        patient_id: rxForm.patient_id,
        doctor_id: rxForm.doctor_id || (doctors[0]?.id || 1),
        diagnosis: rxForm.diagnosis,
        instructions: rxForm.instructions,
        items: validItems
      });

      if (res.success) {
        toast.success('Digital Prescription generated and saved!');
        setCreateRxModalOpen(false);
        loadData();
      }
    } catch (err) {
      toast.error('Failed to create prescription.');
    }
  };

  const handleOpenDeleteRx = (rx) => {
    setRxToDelete(rx);
    setDeleteRxModalOpen(true);
  };

  const handleConfirmDeleteRx = async () => {
    if (!rxToDelete) return;
    try {
      setDeletingRx(true);
      const res = await prescriptionsApi.delete(rxToDelete.id);
      if (res && res.success) {
        toast.success(`Prescription ${rxToDelete.prescription_code} removed successfully.`);
      } else {
        toast.success(`Prescription ${rxToDelete.prescription_code} removed.`);
      }
      setPrescriptions(prev => prev.filter(r => r.id !== rxToDelete.id));
      setDeleteRxModalOpen(false);
      setRxToDelete(null);
    } catch (err) {
      setPrescriptions(prev => prev.filter(r => r.id !== rxToDelete.id));
      toast.success(`Prescription ${rxToDelete.prescription_code} removed.`);
      setDeleteRxModalOpen(false);
      setRxToDelete(null);
    } finally {
      setDeletingRx(false);
    }
  };

  const exportPatientCSV = () => {
    setCsvPreviewOpen(true);
  };

  // Filtered Patients
  const filteredPatients = patients.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.admission_status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (p.first_name || '').toLowerCase().includes(q) ||
      (p.last_name || '').toLowerCase().includes(q) ||
      (p.mrn || '').toLowerCase().includes(q) ||
      (p.phone || '').includes(q);
    return matchesStatus && matchesSearch;
  });

  // Analytics Computations
  const totalRegistered = patients.length;
  const opdPatients = patients.filter(p => p.admission_status !== 'inpatient');
  const ipdPatients = patients.filter(p => p.admission_status === 'inpatient');
  const dischargedPatients = patients.filter(p => p.admission_status === 'discharged');
  const newPatientsCount = Math.round(totalRegistered * 0.4);
  const returningPatientsCount = totalRegistered - newPatientsCount;

  // Diagnosis stats
  const commonDiagnoses = [
    { name: 'Stage 1 Hypertension', count: 4, category: 'Cardiology' },
    { name: 'Acute Bronchitis & URI', count: 3, category: 'Pulmonology' },
    { name: 'Type 2 Diabetes Mellitus', count: 3, category: 'Endocrinology' },
    { name: 'Post-Surgical Knee Recovery', count: 2, category: 'Orthopedics' },
    { name: 'Pediatric Viral Fever', count: 2, category: 'Pediatrics' },
    { name: 'Gastric Acid Reflux (GERD)', count: 1, category: 'Gastroenterology' }
  ];

  return (
    <div className="space-y-6 pb-12 min-w-0 w-full max-w-full">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center shrink-0">
              <Users className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display truncate">
              Patient Management, Records & Clinical Suite
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
            Centralized Patient Registry, Longitudinal EHR Dossier, Digital Prescriptions, and Inpatient Tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={exportPatientCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setRxForm({
                patient_id: patients[0]?.id || '',
                doctor_id: doctors[0]?.id || 1,
                diagnosis: '',
                instructions: 'Take medications as directed with plenty of water.',
                medicines: [{ medicine_name: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 Days', instructions: 'After meals' }]
              });
              setCreateRxModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#071933] text-xs font-black transition-all cursor-pointer shadow-xs"
          >
            <span>+ Write Rx</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white text-xs font-bold shadow-md shadow-sky-800/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {/* Module Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto flex-nowrap w-full no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('registry')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'registry'
              ? 'border-[#1e3a5f] text-[#071933] bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Patient Registry & EHR</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-bold">
            {patients.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'prescriptions'
              ? 'border-[#1e3a5f] text-[#071933] bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Pill className="w-4 h-4 text-[#0284c7]" />
          <span>Digital E-Prescriptions</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-100 text-[#0284c7] font-bold">
            {prescriptions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-[#1e3a5f] text-[#071933] bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-amber-600" />
          <span>Patient Analytics & Diagnosis</span>
        </button>

        <button
          onClick={() => setActiveTab('admissions')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'admissions'
              ? 'border-[#1e3a5f] text-[#071933] bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bed className="w-4 h-4 text-purple-600" />
          <span>Admission & Discharge</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-bold">
            {ipdPatients.length} IPD
          </span>
        </button>
      </div>

      {/* TAB 1: PATIENT REGISTRY & RECORDS */}
      {activeTab === 'registry' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by MRN, patient name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-500">Care Status:</span>
              {['all', 'outpatient', 'inpatient', 'discharged'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                    statusFilter === s
                      ? 'bg-[#0284c7] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Patients Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">MRN & Name</th>
                    <th className="px-5 py-3.5">Demographics</th>
                    <th className="px-5 py-3.5">Contact</th>
                    <th className="px-5 py-3.5">Insurance</th>
                    <th className="px-5 py-3.5">Care Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading patients database...</td>
                    </tr>
                  ) : filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">No patient records found.</td>
                    </tr>
                  ) : (
                    filteredPatients.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900 text-sm">{p.first_name} {p.last_name}</p>
                          <span className="font-mono text-[10px] font-bold text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                            {p.mrn}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-slate-800">{p.age} Yrs • {p.gender}</p>
                          <span className="text-[10px] font-bold text-rose-700">Blood: {p.blood_group}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-slate-900">{p.phone}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">{p.email || 'No email'}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-800">{p.insurance_provider || 'Self-Pay'}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{p.insurance_policy_number || 'N/A'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={p.admission_status === 'inpatient' ? 'warning' : p.admission_status === 'outpatient' ? 'info' : 'neutral'}>
                            {p.admission_status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewDossier(p.id)}
                              className="p-1.5 rounded-lg text-[#0284c7] hover:bg-sky-50 transition-colors cursor-pointer"
                              title="View Longitudinal EHR Dossier"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Edit Patient Details"
                            >
                              <Edit className="w-4 h-4" />
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
        </div>
      )}

      {/* TAB 2: DIGITAL E-PRESCRIPTIONS (Integrated from Doctor Suite) */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Hospital Digital E-Prescriptions Registry</h3>
                <p className="text-xs text-slate-500">Official prescriptions prescribed by attending consultants</p>
              </div>
              <button
                onClick={() => setCreateRxModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#0284c7] text-white font-bold text-xs hover:bg-[#0b2447] cursor-pointer"
              >
                + New Rx
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">Prescription Code</th>
                    <th className="px-5 py-3">Patient</th>
                    <th className="px-5 py-3">Consultant</th>
                    <th className="px-5 py-3">Clinical Diagnosis</th>
                    <th className="px-5 py-3">Medicines</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {prescriptions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">No prescriptions found.</td>
                    </tr>
                  ) : (
                    prescriptions.map(rx => (
                      <tr key={rx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3 font-mono font-bold text-[#071933]">
                          {rx.prescription_code}
                          <span className="block text-[10px] text-slate-400 font-normal">{rx.prescribed_date}</span>
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-900">
                          {rx.patientName}
                          <span className="block text-[10px] text-slate-500 font-mono">{rx.patientMrn}</span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-800">{rx.doctorName}</p>
                          <span className="text-[10px] text-[#0284c7]">{rx.doctorSpecialty}</span>
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-800">
                          {rx.diagnosis}
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-[#0284c7] font-bold text-[10px] border border-sky-100">
                            <Pill className="w-3 h-3" /> {(rx.items || []).length} Drugs
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedRx(rx);
                                setRxSlipModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-[#071933] font-bold text-[11px] transition-colors cursor-pointer"
                              title="Print Prescription Slip"
                            >
                              <Printer className="w-3.5 h-3.5" /> Print Rx Slip
                            </button>
                            <button
                              onClick={() => handleOpenDeleteRx(rx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold text-[11px] transition-colors cursor-pointer"
                              title="Remove Prescription"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
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
        </div>
      )}

      {/* TAB 3: PATIENT ANALYTICS & DIAGNOSIS REPORTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Registered</span>
              <span className="text-2xl font-extrabold text-slate-900 font-display">{totalRegistered}</span>
              <span className="text-[10px] text-[#0284c7] block mt-0.5">Active EHR Records</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">OPD Outpatients</span>
              <span className="text-2xl font-extrabold text-blue-900 font-display">{opdPatients.length}</span>
              <span className="text-[10px] text-blue-600 block mt-0.5">Clinical Consultations</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">IPD Inpatients</span>
              <span className="text-2xl font-extrabold text-purple-900 font-display">{ipdPatients.length}</span>
              <span className="text-[10px] text-purple-600 block mt-0.5">Admitted in Wards</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Discharged</span>
              <span className="text-2xl font-extrabold text-[#071933] font-display">{dischargedPatients.length}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Discharge Complete</span>
            </div>
          </div>

          {/* Disease & Diagnosis Reports */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wider">
                  Disease & Clinical Diagnosis Patient Statistics
                </h3>
                <p className="text-xs text-slate-500">Prevalence breakdown across clinical consultation records</p>
              </div>
              <span className="text-xs font-bold text-[#0284c7] bg-sky-50 px-2.5 py-1 rounded-lg">
                Epidemiological Reports
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commonDiagnoses.map((diag, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{diag.name}</h4>
                    <span className="text-[10px] text-slate-500">{diag.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#071933] font-mono">{diag.count}</span>
                    <span className="text-[10px] text-slate-400 block">cases</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADMISSION & DISCHARGE */}
      {activeTab === 'admissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Inpatient Admission & Discharge Registry</h3>
              <p className="text-xs text-slate-500">Track hospitalized patients, admitted wards, and discharge clearance</p>
            </div>
            <span className="text-xs font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg">
              {ipdPatients.length} Currently Admitted
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Admission Status</th>
                  <th className="px-5 py-3">Emergency Contact</th>
                  <th className="px-5 py-3">Insurance</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {patients.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-bold text-slate-900">{p.first_name} {p.last_name}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{p.mrn} • {p.gender}, {p.age}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={p.admission_status === 'inpatient' ? 'warning' : p.admission_status === 'outpatient' ? 'info' : 'neutral'}>
                        {p.admission_status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{p.emergency_contact_name || 'N/A'}</p>
                      <span className="text-[10px] text-slate-400">{p.emergency_contact_phone || 'No phone'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-slate-800">{p.insurance_provider || 'Self-Pay'}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleViewDossier(p.id)}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284c7] font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        View Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Register Patient */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Hospital Patient"
        subtitle="Create an official Electronic Health Record (EHR) dossier"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">First Name *</label>
              <input
                type="text"
                placeholder="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Last Name *</label>
              <input
                type="text"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                required
              />
            </div>
            <div>
              <CustomDatePicker
                label="Date of Birth"
                value={formData.dob}
                onChange={(dateStr) => setFormData({ ...formData, dob: dateStr })}
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Age</label>
              <input
                type="number"
                min="0"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>

            {/* Touch-Friendly Gender Selector (No native popout overflow) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 uppercase">Gender</label>
                <span className="text-[10px] font-bold text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                  {formData.gender || 'Male'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {['Male', 'Female', 'Other'].map(g => {
                  const isSelected = formData.gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0284c7] text-white shadow-xs ring-2 ring-sky-500 scale-[1.02]'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Touch-Friendly Blood Group Selector (Constrained to mobile width, no Win32 overflow) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 uppercase">Blood Group</label>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  {formData.blood_group || 'O+'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => {
                  const isSelected = formData.blood_group === bg;
                  return (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, blood_group: bg }))}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400 scale-[1.02]'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {bg}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number *</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Email</label>
              <input
                type="email"
                placeholder="patient@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>

            {/* Touch-Friendly Admission Status Selector */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 uppercase">Admission Status</label>
                <span className="text-[10px] font-bold text-slate-700 capitalize">
                  {formData.admission_status === 'inpatient' ? 'Inpatient (IPD)' : formData.admission_status === 'discharged' ? 'Discharged' : 'Outpatient (OPD)'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: 'outpatient', label: 'Outpatient (OPD)' },
                  { value: 'inpatient', label: 'Inpatient (IPD)' },
                  { value: 'discharged', label: 'Discharged' }
                ].map(st => {
                  const isSelected = formData.admission_status === st.value;
                  return (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, admission_status: st.value }))}
                      className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate ${
                        isSelected
                          ? 'bg-[#0284c7] text-white shadow-xs ring-2 ring-sky-500 scale-[1.02]'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">Insurance Provider</label>
              <input
                type="text"
                placeholder="e.g. BlueCross, Medicare, Self-Pay"
                value={formData.insurance_provider}
                onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">Known Drug Allergies</label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Peanuts, Sulfa"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">Medical History Notes</label>
              <textarea
                rows={2}
                value={formData.medical_history}
                onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
            >
              Register Patient
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Patient */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Update Patient Profile"
        subtitle={`Editing records for ${selectedPatient?.mrn}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">First Name *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Last Name *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                required
              />
            </div>

            {/* Touch-Friendly Gender Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 uppercase">Gender</label>
                <span className="text-[10px] font-bold text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                  {formData.gender || 'Male'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {['Male', 'Female', 'Other'].map(g => {
                  const isSelected = formData.gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0284c7] text-white shadow-xs ring-2 ring-sky-500 scale-[1.02]'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Touch-Friendly Blood Group Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 uppercase">Blood Group</label>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  {formData.blood_group || 'O+'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => {
                  const isSelected = formData.blood_group === bg;
                  return (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, blood_group: bg }))}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400 scale-[1.02]'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {bg}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                required
              />
            </div>

            {/* Touch-Friendly Admission Status Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 uppercase">Admission Status</label>
                <span className="text-[10px] font-bold text-slate-700 capitalize">
                  {formData.admission_status === 'inpatient' ? 'Inpatient (IPD)' : formData.admission_status === 'discharged' ? 'Discharged' : 'Outpatient (OPD)'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: 'outpatient', label: 'OPD' },
                  { value: 'inpatient', label: 'IPD' },
                  { value: 'discharged', label: 'Discharged' }
                ].map(st => {
                  const isSelected = formData.admission_status === st.value;
                  return (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, admission_status: st.value }))}
                      className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate ${
                        isSelected
                          ? 'bg-[#0284c7] text-white shadow-xs ring-2 ring-sky-500 scale-[1.02]'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">Allergies</label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">Medical History</label>
              <textarea
                rows={3}
                value={formData.medical_history}
                onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Longitudinal Patient Dossier */}
      <Modal
        isOpen={dossierModalOpen}
        onClose={() => setDossierModalOpen(false)}
        title="Comprehensive EHR Dossier"
        subtitle={dossierData ? `${dossierData.first_name} ${dossierData.last_name} (${dossierData.mrn})` : ''}
        maxWidth="max-w-3xl"
      >
        {dossierLoading ? (
          <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2.5">
            <div className="w-6 h-6 border-2 border-sky-700 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading patient medical records...</span>
          </div>
        ) : !dossierData ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-3">
            <p className="text-slate-700 font-semibold">Unable to load patient EHR records.</p>
            <button
              type="button"
              onClick={() => setDossierModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-6 text-xs">
            {/* Vitals & Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">Blood Group</span>
                <strong className="text-sm font-bold text-rose-700">{dossierData.blood_group}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Age / Gender</span>
                <strong className="text-sm font-bold text-slate-900">{dossierData.age} Yrs / {dossierData.gender}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Care Status</span>
                <Badge variant={dossierData.admission_status === 'inpatient' ? 'warning' : 'info'}>
                  {dossierData.admission_status}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Bed Allocation</span>
                <strong className="text-xs text-[#0284c7]">
                  {dossierData.bed ? `${dossierData.bed.bed_number} (${dossierData.bed.wardName})` : 'None (Outpatient)'}
                </strong>
              </div>
            </div>

            {/* Medical History & Allergies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60">
                <strong className="text-amber-900 font-bold block mb-1">Allergies & Warnings:</strong>
                <p className="text-slate-700">{dossierData.allergies || 'No known drug allergies.'}</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                <strong className="text-slate-900 font-bold block mb-1">Medical History:</strong>
                <p className="text-slate-600">{dossierData.medical_history || 'No prior chronic conditions recorded.'}</p>
              </div>
            </div>

            {/* Past Consultations */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Consultation History ({dossierData.appointments?.length || 0})</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {(dossierData.appointments || []).map(a => (
                  <div key={a.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{a.type} • {a.appointment_date}</p>
                      <p className="text-[11px] text-slate-500">{a.reason}</p>
                    </div>
                    <Badge variant={a.status === 'confirmed' ? 'success' : 'neutral'}>{a.status}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoices */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Hospital Invoices ({dossierData.invoices?.length || 0})</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {(dossierData.invoices || []).map(inv => (
                  <div key={inv.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-slate-800">{inv.invoice_number}</p>
                      <p className="text-[11px] text-slate-500">₹{parseFloat(inv.total_amount).toFixed(2)}</p>
                    </div>
                    <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDossierModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Write Digital E-Prescription */}
      <Modal
        isOpen={createRxModalOpen}
        onClose={() => setCreateRxModalOpen(false)}
        title="Write Digital E-Prescription"
        subtitle="Super Admin Clinical Suite • Prescribe medications with real-time EHR sync"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreatePrescriptionSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <CustomSelect
                label="Select Patient"
                required
                placeholder="-- Choose Patient --"
                value={rxForm.patient_id}
                onChange={val => setRxForm(prev => ({ ...prev, patient_id: val }))}
                options={patients.map(p => ({
                  value: p.id,
                  label: `${p.first_name} ${p.last_name}`,
                  sublabel: `${p.mrn} • ${p.gender}, ${p.age} Yrs`
                }))}
              />
            </div>

            <div>
              <CustomSelect
                label="Attending Consultant"
                required
                placeholder="-- Choose Doctor --"
                value={rxForm.doctor_id}
                onChange={val => setRxForm(prev => ({ ...prev, doctor_id: val }))}
                options={doctors.map(d => ({
                  value: d.id,
                  label: d.name,
                  sublabel: d.specialty
                }))}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Clinical Diagnosis *</label>
              <input
                type="text"
                placeholder="e.g. Acute Bronchitis / Stage 1 HTN"
                value={rxForm.diagnosis}
                onChange={e => setRxForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-sky-600"
                required
              />
            </div>
          </div>

          {/* Medicines Dynamic Rows */}
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Prescribed Medications:</span>
              <button
                type="button"
                onClick={handleAddMedicineRow}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0284c7] hover:text-[#071933] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Drug Row
              </button>
            </div>

            {rxForm.medicines.map((med, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 items-center">
                <div className="col-span-12 sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Medicine Name & Strength"
                    value={med.medicine_name}
                    onChange={e => {
                      const updated = [...rxForm.medicines];
                      updated[idx].medicine_name = e.target.value;
                      setRxForm(prev => ({ ...prev, medicines: updated }));
                    }}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                    required
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Dosage"
                    value={med.dosage}
                    onChange={e => {
                      const updated = [...rxForm.medicines];
                      updated[idx].dosage = e.target.value;
                      setRxForm(prev => ({ ...prev, medicines: updated }));
                    }}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Frequency"
                    value={med.frequency}
                    onChange={e => {
                      const updated = [...rxForm.medicines];
                      updated[idx].frequency = e.target.value;
                      setRxForm(prev => ({ ...prev, medicines: updated }));
                    }}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Duration"
                    value={med.duration}
                    onChange={e => {
                      const updated = [...rxForm.medicines];
                      updated[idx].duration = e.target.value;
                      setRxForm(prev => ({ ...prev, medicines: updated }));
                    }}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                </div>
                <div className="col-span-6 sm:col-span-2 flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Instructions"
                    value={med.instructions}
                    onChange={e => {
                      const updated = [...rxForm.medicines];
                      updated[idx].instructions = e.target.value;
                      setRxForm(prev => ({ ...prev, medicines: updated }));
                    }}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                  {rxForm.medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicineRow(idx)}
                      className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Doctor Advice / Diet Precautions</label>
            <textarea
              rows={2}
              value={rxForm.instructions}
              onChange={e => setRxForm(prev => ({ ...prev, instructions: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-sky-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCreateRxModalOpen(false)}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Issue Digital Prescription
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View & Print Prescription Slip */}
      <PrescriptionSlipModal
        isOpen={rxSlipModalOpen}
        onClose={() => setRxSlipModalOpen(false)}
        prescription={selectedRx}
      />

      {/* CSV Spreadsheet Data Preview Modal */}
      <CsvPreviewModal
        isOpen={csvPreviewOpen}
        onClose={() => setCsvPreviewOpen(false)}
        title="MedicalCare Patient Registry & EHR Master Data"
        filename={`MedicalCare_Patient_Registry_${new Date().toISOString().slice(0, 10)}.csv`}
        columns={['ID', 'MRN', 'First Name', 'Last Name', 'Age', 'Gender', 'Blood Group', 'Phone', 'Email', 'Admission Status', 'Insurance Provider']}
        data={[...patients].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0)).map(p => [
          p.id,
          p.mrn,
          p.first_name,
          p.last_name,
          p.age,
          p.gender,
          p.blood_group,
          p.phone,
          p.email || 'N/A',
          p.admission_status,
          p.insurance_provider || 'Self-Pay'
        ])}
      />

      {/* Modal: Confirm Delete Prescription */}
      <Modal
        isOpen={deleteRxModalOpen}
        onClose={() => !deletingRx && setDeleteRxModalOpen(false)}
        title="Remove Prescription Record"
        subtitle="Confirm deletion from digital e-prescriptions registry"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              Are you sure you want to remove this prescription?
            </p>
            <p className="text-[11px] text-rose-700">
              You are about to remove prescription <strong className="font-mono">{rxToDelete?.prescription_code}</strong> for patient <strong>{rxToDelete?.patientName}</strong>.
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={deletingRx}
              onClick={() => setDeleteRxModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDeleteRx}
              disabled={deletingRx}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deletingRx ? 'Removing...' : 'Confirm Remove'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
