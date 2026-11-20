import React, { useState, useEffect } from 'react';
import { doctorsApi, departmentsApi, staffApi, appointmentsApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { CsvPreviewModal } from '../../components/common/CsvPreviewModal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { CustomSelect } from '../../components/common/CustomSelect.jsx';
import {
  UserCheck,
  Search,
  Plus,
  Edit,
  Star,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  Stethoscope,
  HeartPulse,
  Building2,
  CheckCircle2,
  Clock,
  Award,
  Download,
  AlertCircle,
  Trash2
} from 'lucide-react';

export function DoctorManagement() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'allocation' | 'attendance' | 'performance'
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('all');

  // Doctor Attendance State (stored locally & in memory)
  const [doctorAttendance, setDoctorAttendance] = useState({
    1: 'On Duty',
    2: 'Present',
    3: 'On Call',
    4: 'Present',
    5: 'On Duty',
    6: 'On Leave'
  });

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [csvPreviewOpen, setCsvPreviewOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    department_id: 1,
    qualifications: '',
    experience_years: 10,
    consultation_fee: 120.00,
    available_days: 'Mon, Tue, Wed, Thu, Fri',
    available_time_slots: '09:00 AM, 11:00 AM, 02:00 PM, 04:00 PM',
    room_number: 'Suite 201',
    bio: '',
    status: 'active'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [docRes, deptRes, aptRes] = await Promise.all([
        doctorsApi.getAll(),
        departmentsApi.getAll(),
        appointmentsApi.getAll()
      ]);
      if (docRes.success) {
        const sortedDocs = (docRes.data || []).slice().sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
        setDoctors(sortedDocs);
      }
      if (deptRes.success) setDepartments(deptRes.data || []);
      if (aptRes.success) setAppointments(aptRes.data || []);
    } catch (err) {
      console.error('Failed to load doctors data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      specialty: '',
      department_id: departments[0]?.id || 1,
      qualifications: 'MD, MBBS, Board Certified',
      experience_years: 10,
      consultation_fee: 120.00,
      available_days: 'Mon, Tue, Wed, Thu, Fri',
      available_time_slots: '09:00 AM, 11:00 AM, 02:00 PM, 04:00 PM',
      room_number: 'Suite 201',
      bio: 'Dedicated medical consultant specialized in evidence-based care.',
      status: 'active'
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setSelectedDoctor(doc);
    setFormData({
      name: doc.name || '',
      specialty: doc.specialty || '',
      department_id: doc.department_id || 1,
      qualifications: doc.qualifications || '',
      experience_years: doc.experience_years || 10,
      consultation_fee: doc.consultation_fee || 120.00,
      available_days: doc.available_days || '',
      available_time_slots: doc.available_time_slots || '',
      room_number: doc.room_number || '',
      bio: doc.bio || '',
      status: doc.status || 'active'
    });
    setEditModalOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.specialty) {
      toast.warning('Doctor name and specialty are required.');
      return;
    }
    try {
      const res = await doctorsApi.create(formData);
      if (res.success) {
        toast.success(`Doctor ${formData.name} added successfully.`);
        setAddModalOpen(false);
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add doctor.');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    try {
      const res = await doctorsApi.update(selectedDoctor.id, formData);
      if (res.success) {
        toast.success(`Doctor profile for ${formData.name} updated.`);
        setEditModalOpen(false);
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update doctor profile.');
    }
  };

  const handleOpenDelete = (doc) => {
    setDoctorToDelete(doc);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!doctorToDelete) return;
    try {
      setDeleting(true);
      const res = await doctorsApi.delete(doctorToDelete.id);
      if (res && res.success) {
        toast.success(`Dr. ${doctorToDelete.name} removed successfully.`);
        setDeleteModalOpen(false);
        setDoctorToDelete(null);
        setDoctors(prev => prev.filter(d => d.id !== doctorToDelete.id));
        loadData();
      } else {
        toast.error(res?.message || 'Failed to remove doctor.');
      }
    } catch (err) {
      toast.error('Failed to remove doctor.');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateDoctorAttendance = (docId, newStatus) => {
    setDoctorAttendance(prev => ({ ...prev, [docId]: newStatus }));
    toast.success(`Duty status updated to "${newStatus}"`);
  };

  const exportDoctorsCSV = () => {
    setCsvPreviewOpen(true);
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesDept = selectedDeptId === 'all' || doc.department_id?.toString() === selectedDeptId;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (doc.name || '').toLowerCase().includes(q) ||
      (doc.specialty || '').toLowerCase().includes(q) ||
      (doc.departmentName || '').toLowerCase().includes(q);
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 min-w-0 w-full max-w-full">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
              <Stethoscope className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display truncate">
              Doctor Management & Clinical Roster
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
            Total Doctor Records, Department Allocations, Attendance Tracking, and Clinical Performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={exportDoctorsCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white text-xs font-bold shadow-md shadow-sky-800/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto flex-nowrap w-full no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'directory'
              ? 'border-[#1e3a5f] text-[#071933] bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctor Records ({doctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('allocation')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'allocation'
              ? 'border-[#1e3a5f] text-[#071933] bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-purple-600" />
          <span>Department Allocation</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'border-[#1e3a5f] text-[#071933] bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Doctor Attendance & Roster</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'performance'
              ? 'border-[#1e3a5f] text-[#071933] bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-[#0284c7]" />
          <span>Performance Reports</span>
        </button>
      </div>

      {/* TAB 1: DOCTOR DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search physician by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Department:</span>
              <div className="w-48">
                <CustomSelect
                  value={selectedDeptId}
                  onChange={val => setSelectedDeptId(val)}
                  options={[
                    { value: 'all', label: 'All Departments' },
                    ...departments.map(d => ({ value: d.id.toString(), label: d.name }))
                  ]}
                  searchable={false}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.map(doc => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={doc.avatar || `/images/doctors/doctor-${doc.id || 1}.jpg`}
                      alt={doc.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `/images/doctors/doctor-${doc.id || 1}.jpg`;
                      }}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-100 shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                          {doc.departmentName || 'Specialist'}
                        </span>
                        <Badge variant={doc.status === 'active' ? 'success' : 'warning'}>
                          {doc.status}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1 truncate">{doc.name}</h3>
                      <p className="text-xs font-semibold text-[#0284c7] truncate">{doc.specialty}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p><strong>Qualifications:</strong> {doc.qualifications}</p>
                    <p><strong>Experience:</strong> {doc.experience_years} Years</p>
                    <p><strong>Suite / Room:</strong> {doc.room_number || 'Room 101'}</p>
                    <p><strong>Available Days:</strong> {doc.available_days}</p>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Consult Fee</span>
                    <p className="font-bold text-slate-900 font-mono">₹{doc.consultation_fee?.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-white text-xs font-bold transition-colors cursor-pointer"
                      title="Edit Doctor Profile"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleOpenDelete(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                      title="Remove Doctor"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR-WISE DEPARTMENT ALLOCATION */}
      {activeTab === 'allocation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {departments.map(dept => {
              const deptDocs = doctors.filter(d => d.department_id === dept.id);
              return (
                <div key={dept.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-display">{dept.name}</h3>
                      <span className="text-[10px] font-mono font-bold text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded">
                        {dept.code || `D-${dept.id}`}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg">
                      {deptDocs.length} Assigned Doctors
                    </span>
                  </div>

                  <div className="space-y-2">
                    {deptDocs.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">No consultants allocated yet.</p>
                    ) : (
                      deptDocs.map(doc => (
                        <div key={doc.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-900">{doc.name}</p>
                            <span className="text-[10px] text-slate-500">{doc.specialty} • {doc.room_number || 'Suite 201'}</span>
                          </div>
                          <Badge variant="success">Active</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DOCTOR ATTENDANCE & ROSTER */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden min-w-0 w-full">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Daily Doctor Attendance & Shift Roster</h3>
              <p className="text-xs text-slate-500">Live attendance verification and on-duty status</p>
            </div>
            <span className="text-xs font-bold text-[#0284c7] bg-sky-50 px-2.5 py-1 rounded-lg self-start sm:self-auto">
              Updated Live
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Physician</th>
                  <th className="px-5 py-3">Specialty / Department</th>
                  <th className="px-5 py-3">Assigned Room</th>
                  <th className="px-5 py-3">Duty Shift</th>
                  <th className="px-5 py-3">Current Attendance</th>
                  <th className="px-5 py-3 text-right">Update Duty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {doctors.map(doc => {
                  const currentStatus = doctorAttendance[doc.id] || 'Present';
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900">{doc.name}</p>
                        <span className="text-[10px] text-slate-400 font-mono">ID: DOC-{doc.id}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-800">{doc.specialty}</p>
                        <span className="text-[10px] text-[#0284c7]">{doc.departmentName}</span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {doc.room_number || 'Suite 201'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-slate-600">{doc.available_days}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={currentStatus === 'On Duty' ? 'success' : currentStatus === 'Present' ? 'info' : currentStatus === 'On Call' ? 'warning' : 'neutral'}>
                          {currentStatus}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="w-32 ml-auto">
                          <CustomSelect
                            value={currentStatus}
                            onChange={(val) => handleUpdateDoctorAttendance(doc.id, val)}
                            options={['On Duty', 'Present', 'On Call', 'On Leave']}
                            searchable={false}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DOCTOR CLINICAL PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden min-w-0 w-full">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Doctor Clinical Performance Reports</h3>
              <p className="text-xs text-slate-500">Patient consultations, satisfaction rating, and clinical efficiency</p>
            </div>
            <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg self-start sm:self-auto">
              Performance Index: 4.8 / 5.0
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Physician</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3 text-center">Experience</th>
                  <th className="px-5 py-3 text-center">Consultations</th>
                  <th className="px-5 py-3 text-center">Patient Rating</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {doctors.map((doc, idx) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{doc.name}</p>
                      <span className="text-[10px] text-slate-500">{doc.specialty}</span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {doc.departmentName}
                    </td>
                    <td className="px-5 py-3.5 text-center font-semibold text-slate-800">
                      {doc.experience_years} Years
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-[#071933]">
                      {12 + (idx * 5)} patients
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {(4.7 + (idx % 3) * 0.1).toFixed(1)} / 5.0
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Badge variant="success">Excellent</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Doctor */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Hospital Physician"
        subtitle="Register medical consultant in Super Admin Directory"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Physician Full Name *</label>
              <input
                type="text"
                placeholder="Dr. Full Name, MD"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Clinical Specialty *</label>
              <input
                type="text"
                placeholder="e.g. Interventional Cardiology"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                required
              />
            </div>
            <div>
              <CustomSelect
                label="Department Allocation"
                value={formData.department_id}
                onChange={(val) => setFormData({ ...formData, department_id: parseInt(val, 10) })}
                options={departments.map(d => ({
                  value: d.id,
                  label: d.name
                }))}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Consultation Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Qualifications</label>
              <input
                type="text"
                placeholder="MBBS, MD, FACS"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Experience (Years)</label>
              <input
                type="number"
                min="1"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Suite / Room Number</label>
              <input
                type="text"
                placeholder="Suite 204"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Available Schedule</label>
              <input
                type="text"
                placeholder="Mon, Tue, Wed, Thu, Fri"
                value={formData.available_days}
                onChange={(e) => setFormData({ ...formData, available_days: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7]"
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
              className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold cursor-pointer"
            >
              Register Physician
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Doctor */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Update Physician Profile"
        subtitle={`Editing records for ${selectedDoctor?.name}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Physician Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Specialty</label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                required
              />
            </div>
            <div>
              <CustomSelect
                label="Department"
                value={formData.department_id}
                onChange={(val) => setFormData({ ...formData, department_id: parseInt(val, 10) })}
                options={departments.map(d => ({
                  value: d.id,
                  label: d.name
                }))}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Consultation Fee (₹)</label>
              <input
                type="number"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Qualifications</label>
              <input
                type="text"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Room</label>
              <input
                type="text"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
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
              className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
      {/* CSV Spreadsheet Data Preview Modal */}
      <CsvPreviewModal
        isOpen={csvPreviewOpen}
        onClose={() => setCsvPreviewOpen(false)}
        title="MedicalCare Doctors & Medical Staff Directory"
        filename={`MedicalCare_Doctors_Directory_${new Date().toISOString().slice(0, 10)}.csv`}
        columns={['ID', 'Doctor Name', 'Specialty', 'Department', 'Qualifications', 'Experience', 'Consult Fee', 'Status']}
        data={[...doctors].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0)).map(d => [
          d.id,
          d.name,
          d.specialty,
          d.departmentName || d.department || 'Clinical Specialty',
          d.qualifications || 'MD, MBBS',
          `${d.experience_years || 5} Yrs`,
          `₹${d.consultation_fee || 500}`,
          d.status || 'Active'
        ])}
      />

      {/* Modal: Confirm Remove Doctor */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="Remove Doctor Profile"
        subtitle="Confirm deletion of physician record"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              Are you sure you want to remove this doctor?
            </p>
            <p className="text-[11px] text-rose-700">
              You are about to remove <strong>{doctorToDelete?.name}</strong> ({doctorToDelete?.specialty}) from the hospital clinical directory.
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleting ? 'Removing...' : 'Confirm Remove'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
