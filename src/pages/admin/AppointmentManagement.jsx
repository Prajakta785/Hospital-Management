import React, { useState, useEffect } from 'react';
import { appointmentsApi, doctorsApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { AppointmentSlipModal } from '../../components/common/AppointmentSlipModal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { CustomSelect } from '../../components/common/CustomSelect.jsx';
import {
  CalendarDays,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Calendar,
  User,
  Stethoscope,
  Activity,
  AlertCircle,
  Timer,
  Users
} from 'lucide-react';

export function AppointmentManagement() {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Slip modal
  const [selectedAptForSlip, setSelectedAptForSlip] = useState(null);
  const [slipModalOpen, setSlipModalOpen] = useState(false);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const [aptRes, docRes] = await Promise.all([
        appointmentsApi.getAll(),
        doctorsApi.getAll()
      ]);
      if (aptRes.success) setAppointments(aptRes.data);
      if (docRes.success) setDoctors(docRes.data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusChange = async (aptId, newStatus) => {
    try {
      const res = await appointmentsApi.updateStatus(aptId, newStatus);
      if (res.success) {
        toast.success(`Appointment status updated to ${newStatus}.`);
        loadAppointments();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update appointment status.');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = selectedStatus === 'all' || apt.status === selectedStatus;
    const matchesDoc = selectedDoctorId === 'all' || apt.doctor_id === parseInt(selectedDoctorId, 10);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      apt.patientName?.toLowerCase().includes(q) ||
      apt.doctorName?.toLowerCase().includes(q) ||
      apt.appointment_number?.toLowerCase().includes(q);
    return matchesStatus && matchesDoc && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Printable Slip Modal */}
      <AppointmentSlipModal
        isOpen={slipModalOpen}
        onClose={() => setSlipModalOpen(false)}
        appointment={selectedAptForSlip}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
            Appointments
          </h2>
          <p className="text-xs text-slate-500">
            Manage patient bookings, doctor schedules, and visit status.
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Confirmed</span>
            <Users className="w-4 h-4 text-[#0284c7]" />
          </div>
          <h4 className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            {appointments.filter(a => a.status === 'confirmed').length}
          </h4>
          <span className="text-[10px] text-slate-400">Waiting for doctor</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Emergency Cases</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <h4 className="text-2xl font-extrabold text-rose-600 mt-1 font-mono">
            {appointments.filter(a => a.triage && a.triage.acuity <= 2).length}
          </h4>
          <span className="text-[10px] text-rose-500 font-semibold">Need immediate care</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed Today</span>
            <CheckCircle className="w-4 h-4 text-[#0284c7]" />
          </div>
          <h4 className="text-2xl font-extrabold text-[#0284c7] mt-1 font-mono">
            {appointments.filter(a => a.status === 'completed').length}
          </h4>
          <span className="text-[10px] text-slate-400">Visits finished</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Available Doctors</span>
            <Stethoscope className="w-4 h-4 text-amber-600" />
          </div>
          <h4 className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{doctors.length}</h4>
          <span className="text-[10px] text-slate-400">On duty today</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient, doctor, or Ref#..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Doctor filter */}
          <div className="w-44">
            <CustomSelect
              value={selectedDoctorId}
              onChange={(val) => setSelectedDoctorId(val)}
              options={[
                { value: 'all', label: 'All Doctors' },
                ...doctors.map(d => ({ value: d.id, label: d.name }))
              ]}
              searchable={false}
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['all', 'confirmed', 'completed', 'pending', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-colors ${
                  selectedStatus === s ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Ref# & Patient</th>
                <th className="px-5 py-3.5">Physician & Specialty</th>
                <th className="px-5 py-3.5">Date & Live Queue</th>
                <th className="px-5 py-3.5">Category & Reason</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading appointments queue...</td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">No appointments found matching filters.</td>
                </tr>
              ) : (
                filteredAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-sm">{apt.patientName}</p>
                        {apt.triage && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              apt.triage.acuity <= 2
                                ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                                : apt.triage.acuity === 3
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-sky-100 text-[#0284c7]'
                            }`}
                            title={apt.triage.label}
                          >
                            ESI {apt.triage.acuity}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[10px] text-slate-400">{apt.appointment_number}</span>
                        {apt.triage?.label && (
                          <span className="text-[10px] text-slate-500 font-medium">• {apt.triage.label}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{apt.doctorName}</p>
                      <span className="text-[10px] text-[#0284c7]">{apt.departmentName}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{apt.appointment_date}</p>
                      <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                        <span className="text-slate-500">{apt.appointment_time}</span>
                        {apt.queueInfo && (
                          <span className={`px-1.5 py-0.5 rounded font-mono font-semibold text-[10px] ${
                            apt.queueInfo.liveStatus === 'In Consultation'
                              ? 'bg-sky-100 text-[#0284c7] border border-sky-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {apt.queueInfo.liveStatus}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="font-medium text-slate-800">{apt.type}</p>
                      <p className="text-[10px] text-slate-400 truncate">{apt.reason}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={
                        apt.status === 'confirmed' ? 'success' :
                        apt.status === 'completed' ? 'info' :
                        apt.status === 'pending' ? 'warning' : 'danger'
                      }>
                        {apt.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedAptForSlip(apt);
                            setSlipModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          title="Print Appointment Voucher Slip"
                        >
                          <Printer className="w-4 h-4 text-[#0284c7]" />
                        </button>
                        {apt.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(apt.id, 'completed')}
                            className="px-2 py-1 rounded-md bg-sky-50 hover:bg-sky-100 text-[#0284c7] font-bold text-[10px]"
                            title="Mark Consultation Completed"
                          >
                            Complete
                          </button>
                        )}
                        {apt.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusChange(apt.id, 'cancelled')}
                            className="px-2 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px]"
                            title="Cancel Appointment"
                          >
                            Cancel
                          </button>
                        )}
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
  );
}
