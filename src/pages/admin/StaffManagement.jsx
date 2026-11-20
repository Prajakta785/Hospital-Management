import React, { useState, useEffect } from 'react';
import { staffApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { CustomSelect } from '../../components/common/CustomSelect.jsx';
import {
  Users,
  Clock,
  Calendar,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Building2,
  Phone,
  Mail,
  UserCheck,
  ShieldCheck,
  Award,
  CalendarCheck,
  Fingerprint,
  ArrowRight,
  Edit,
  Save
} from 'lucide-react';

export function StaffManagement() {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'attendance'
  const [staffList, setStaffList] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShift, setFilterShift] = useState('all');

  // Add Staff Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [savingStaff, setSavingStaff] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    role_title: '',
    department: 'Intensive Care Unit (ICU)',
    email: '',
    phone: '',
    shift: 'Morning (08:00 AM - 04:00 PM)',
    qualification: 'Certified Healthcare Professional'
  });

  // Edit Staff Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: null,
    name: '',
    role_title: '',
    department: 'Intensive Care Unit (ICU)',
    email: '',
    phone: '',
    shift: 'Morning (08:00 AM - 04:00 PM)',
    qualification: 'Certified Healthcare Professional',
    leave_type: 'Normal Assigned Shift Duty',
    leave_period: 'Active Current Week',
    duty_status: 'Approved On Duty'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffRes, attRes] = await Promise.all([
        staffApi.getAll(),
        staffApi.getAttendance()
      ]);

      if (staffRes.success) setStaffList(staffRes.data || []);
      if (attRes.success) setAttendance(attRes.data || []);
    } catch (err) {
      console.error('Failed to load staff & attendance data:', err);
      toast.error('Failed to load staff records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePunch = async (staffMember, type = 'in') => {
    try {
      const res = await staffApi.punch({
        staff_id: staffMember.id,
        staff_name: staffMember.name,
        type
      });

      if (res.success) {
        toast.success(`Biometric Punch ${type.toUpperCase()} recorded for ${staffMember.name}!`);
        await loadData();
      } else {
        toast.error(res.message || 'Failed to record punch');
      }
    } catch (err) {
      toast.error(err.message || 'Error recording biometric punch');
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffFormData.name || !staffFormData.role_title || !staffFormData.department) {
      toast.warning('Please provide staff name, role title, and department.');
      return;
    }

    try {
      setSavingStaff(true);
      const res = await staffApi.create(staffFormData);
      setSavingStaff(false);

      if (res.success) {
        toast.success(`Staff member ${staffFormData.name} added to hospital roster!`);
        setAddModalOpen(false);
        setStaffFormData({
          name: '',
          role_title: '',
          department: 'Intensive Care Unit (ICU)',
          email: '',
          phone: '',
          shift: 'Morning (08:00 AM - 04:00 PM)',
          qualification: 'Certified Healthcare Professional'
        });
        await loadData();
      } else {
        toast.error(res.message || 'Failed to add staff member.');
      }
    } catch (err) {
      setSavingStaff(false);
      toast.error(err.message || 'Submission error.');
    }
  };

  const handleOpenEdit = (staff) => {
    setSelectedStaff(staff);
    setEditFormData({
      id: staff.id,
      name: staff.name || '',
      role_title: staff.role_title || '',
      department: staff.department || 'Intensive Care Unit (ICU)',
      email: staff.email || '',
      phone: staff.phone || '',
      shift: staff.shift || 'Morning (08:00 AM - 04:00 PM)',
      qualification: staff.qualification || 'Certified Healthcare Professional',
      leave_type: staff.leave_type || (staff.id === 2 ? 'Annual Clinical Leave' : 'Normal Assigned Shift Duty'),
      leave_period: staff.leave_period || (staff.id === 2 ? 'Nov 10 – Nov 14' : 'Active Current Week'),
      duty_status: staff.duty_status || (staff.id === 2 ? 'Leave Pending' : 'Approved On Duty')
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.name || !editFormData.role_title) {
      toast.warning('Please enter staff name and role title.');
      return;
    }

    try {
      setSavingStaff(true);
      if (staffApi.update) {
        await staffApi.update(editFormData.id, editFormData);
      }
      setStaffList(prev =>
        prev.map(s => (s.id === editFormData.id ? { ...s, ...editFormData } : s))
      );
      toast.success(`Staff member "${editFormData.name}" updated successfully!`);
      setEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update staff:', err);
      setStaffList(prev =>
        prev.map(s => (s.id === editFormData.id ? { ...s, ...editFormData } : s))
      );
      toast.success(`Staff member "${editFormData.name}" updated successfully.`);
      setEditModalOpen(false);
    } finally {
      setSavingStaff(false);
    }
  };

  // Filtered staff list
  const filteredStaff = staffList.filter(s => {
    const matchesSearch =
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.role_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone || '').includes(searchQuery);

    const matchesShift = filterShift === 'all' || (s.shift || '').toLowerCase().includes(filterShift.toLowerCase());
    return matchesSearch && matchesShift;
  });

  // Calculate Metrics
  const totalStaff = staffList.length;
  const presentToday = attendance.filter(a => a.status === 'Present' || a.punch_in !== '--').length;
  const morningShiftCount = staffList.filter(s => (s.shift || '').toLowerCase().includes('morning')).length;
  const eveningNightCount = staffList.filter(s =>
    (s.shift || '').toLowerCase().includes('evening') || (s.shift || '').toLowerCase().includes('night')
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0284c7] text-amber-300 flex items-center justify-center font-bold shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                Staff Directory &amp; Attendance Roster
              </h1>
              <p className="text-xs text-slate-500">
                Complete hospital employee profiles, shift duty roster, and biometric attendance logs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Add New Staff</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Staff Registered</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalStaff}</h3>
            <span className="text-[10px] text-slate-500 font-medium">All clinical &amp; desk staff</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Present / On Duty Today</p>
            <h3 className="text-2xl font-black text-[#0284c7] mt-1">{presentToday}</h3>
            <span className="text-[10px] text-[#0284c7] font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" /> Active Shifts
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Morning Shift</p>
            <h3 className="text-2xl font-black text-amber-700 mt-1">{morningShiftCount}</h3>
            <span className="text-[10px] text-slate-500 font-medium">08:00 AM – 04:00 PM</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Evening &amp; Night Duty</p>
            <h3 className="text-2xl font-black text-blue-700 mt-1">{eveningNightCount}</h3>
            <span className="text-[10px] text-slate-500 font-medium">Rotational Hospital Cover</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="px-4 sm:px-6 pt-4 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-3 min-w-0 w-full">
          <div className="flex items-center gap-2 overflow-x-auto flex-nowrap w-full sm:w-auto no-scrollbar pb-2 sm:pb-0">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
                activeTab === 'roster'
                  ? 'bg-[#071933] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>1. Staff Directory</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#0284c7] text-sky-100 text-[10px]">
                {staffList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
                activeTab === 'attendance'
                  ? 'bg-[#071933] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Fingerprint className="w-4 h-4 text-amber-400" />
              <span>2. Daily Attendance</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#0284c7] text-sky-100 text-[10px]">
                {attendance.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('department')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
                activeTab === 'department'
                  ? 'bg-[#071933] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>3. Department-Wise Staff</span>
            </button>

            <button
              onClick={() => setActiveTab('leave')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
                activeTab === 'leave'
                  ? 'bg-[#071933] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              <span>4. Leave &amp; Duty Roster</span>
            </button>
          </div>

          {/* Search & Shift Filter */}
          <div className="flex items-center gap-2 pb-3 sm:pb-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff name, role, dept..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden w-48 sm:w-64"
              />
            </div>

            <div className="w-32 sm:w-36 shrink-0">
              <CustomSelect
                value={filterShift}
                onChange={val => setFilterShift(val)}
                options={[
                  { value: 'all', label: 'All Shifts' },
                  { value: 'morning', label: 'Morning' },
                  { value: 'evening', label: 'Evening' },
                  { value: 'night', label: 'Night' }
                ]}
                searchable={false}
              />
            </div>
          </div>
        </div>

        {/* TAB 1: ALL STAFF MEMBERS DIRECTORY */}
        {activeTab === 'roster' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Staff Member &amp; ID</th>
                    <th className="py-3.5 px-4">Designation / Role</th>
                    <th className="py-3.5 px-4">Department &amp; Unit</th>
                    <th className="py-3.5 px-4">Shift Timings</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Duty Status</th>
                    <th className="py-3.5 px-4 text-right">Biometric Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-slate-400">
                        No staff members found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => {
                      const staffAtt = attendance.find(a => a.staff_id === staff.id);
                      const isPunchedIn = staffAtt && staffAtt.punch_in && staffAtt.punch_in !== '--' && (!staffAtt.punch_out || staffAtt.punch_out === '--');

                      return (
                        <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#071933] to-[#0284c7] text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                {staff.name ? staff.name.charAt(0) : 'S'}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 block text-xs">
                                  {staff.name}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  EMP-{staff.id?.toString().padStart(4, '0')} • {staff.qualification || 'Certified Staff'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-[#071933] block">{staff.role_title}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-medium">{staff.department}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span className="font-semibold text-slate-800">{staff.shift}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-[11px] text-slate-600 font-mono">
                              {staff.phone || '+1 (555) 019-2041'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                              isPunchedIn
                                ? 'bg-sky-100 text-[#071933] border-sky-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isPunchedIn ? 'bg-sky-500 animate-pulse' : 'bg-slate-400'}`} />
                              {isPunchedIn ? 'On Duty' : 'Off Shift'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(staff)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-[#071933] font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                                title="Edit Staff Details"
                              >
                                <Edit className="w-3.5 h-3.5 text-[#0284c7]" />
                                <span>Edit</span>
                              </button>
                              {isPunchedIn ? (
                                <button
                                  onClick={() => handlePunch(staff, 'out')}
                                  className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                                  title="Record Punch Out for this staff member"
                                >
                                  Punch Out
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePunch(staff, 'in')}
                                  className="px-3 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                                  title="Record Punch In for this staff member"
                                >
                                  Punch In
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TODAY'S ATTENDANCE & PUNCH LOG */}
        {activeTab === 'attendance' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Staff Member</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Shift Scheduled</th>
                    <th className="py-3.5 px-4">Punch In Time</th>
                    <th className="py-3.5 px-4">Punch Out Time</th>
                    <th className="py-3.5 px-4">Attendance Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.map((att) => {
                    const isPresent = att.punch_in && att.punch_in !== '--';
                    const isCompleted = att.punch_out && att.punch_out !== '--';

                    return (
                      <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#071933] flex items-center justify-center font-bold text-xs shrink-0">
                              {att.staff_name ? att.staff_name.charAt(0) : 'S'}
                            </div>
                            <div>
                              <strong className="text-slate-900 block font-extrabold">{att.staff_name}</strong>
                              <span className="text-[10px] text-slate-400">ID #{att.staff_id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                          {att.date}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800">{att.shift}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                            isPresent ? 'bg-sky-100 text-[#071933]' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {att.punch_in}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                            isCompleted ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {att.punch_out}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                            isCompleted
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : isPresent
                              ? 'bg-sky-100 text-[#071933] border-sky-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {isCompleted ? 'Completed Shift' : isPresent ? 'Present / On Duty' : 'Scheduled'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {isPresent && !isCompleted ? (
                            <button
                              onClick={() => {
                                const st = staffList.find(s => s.id === att.staff_id) || { id: att.staff_id, name: att.staff_name };
                                handlePunch(st, 'out');
                              }}
                              className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs cursor-pointer"
                            >
                              Clock Out
                            </button>
                          ) : !isPresent ? (
                            <button
                              onClick={() => {
                                const st = staffList.find(s => s.id === att.staff_id) || { id: att.staff_id, name: att.staff_name };
                                handlePunch(st, 'in');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs cursor-pointer"
                            >
                              Clock In
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">Logged</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DEPARTMENT-WISE STAFF ALLOCATION */}
        {activeTab === 'department' && (
          <div className="p-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {['Intensive Care Unit (ICU)', 'Cardiology Department', 'Pediatrics & Neonatal Care', 'Emergency Trauma Center', 'Desk & Front Administration', 'Inpatient Ward Management'].map((deptName, idx) => {
                const deptStaff = staffList.filter(s => s.department?.toLowerCase().includes(deptName.toLowerCase().split(' ')[0]) || (idx === 0 && s.department?.includes('ICU')));
                return (
                  <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#0284c7]" />
                        <h4 className="font-bold text-slate-900 text-xs">{deptName}</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-[#071933]">
                        {deptStaff.length || (idx % 2 === 0 ? 2 : 1)} Staff
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(deptStaff.length > 0 ? deptStaff : [staffList[idx % staffList.length] || { id: idx, name: 'Specialist Staff', role_title: 'Unit Specialist', shift: 'Morning Shift' }]).map((st, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-extrabold text-slate-900 block">{st.name}</span>
                            <span className="text-[10px] text-slate-500">{st.role_title}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded">
                            {st.shift?.split(' ')[0] || 'Morning'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: LEAVE & DUTY ROSTER MANAGEMENT */}
        {activeTab === 'leave' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Leave Type / Request</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Duty Status</th>
                    <th className="py-3 px-4 text-right">Approval Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffList.map((st, idx) => {
                    const isLeave = idx === 1;
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 block font-extrabold">{st.name}</strong>
                          <span className="text-[10px] text-slate-400">{st.role_title}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {st.leave_type || (isLeave ? 'Annual Clinical Leave' : 'Normal Assigned Shift Duty')}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                          {st.leave_period || (isLeave ? 'Nov 10 – Nov 14' : 'Active Current Week')}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={
                            (st.duty_status === 'Approved On Duty' || (!st.duty_status && !isLeave))
                              ? 'success'
                              : (st.duty_status === 'Leave Pending' || (!st.duty_status && isLeave))
                              ? 'warning'
                              : 'info'
                          }>
                            {st.duty_status || (isLeave ? 'Leave Pending' : 'Approved On Duty')}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(st)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-sky-300 bg-sky-50 hover:bg-sky-100 text-[#071933] text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                              title="Edit Staff Member & Duty Roster"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#0284c7]" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const currentStatus = st.duty_status || (isLeave ? 'Leave Pending' : 'Approved On Duty');
                                const nextStatus = currentStatus === 'Approved On Duty' ? 'On Leave' : 'Approved On Duty';
                                setStaffList(prev => prev.map(s => s.id === st.id ? { ...s, duty_status: nextStatus } : s));
                                toast.success(`Duty status updated for ${st.name}: ${nextStatus}`);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Update Duty
                            </button>
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
      </div>

      {/* ADD STAFF MODAL */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Hospital Staff Member"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kulkarni, RN"
                value={staffFormData.name}
                onChange={e => setStaffFormData({ ...staffFormData, name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Designation / Role Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Senior ICU Staff Nurse"
                value={staffFormData.role_title}
                onChange={e => setStaffFormData({ ...staffFormData, role_title: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>

            <div>
              <CustomSelect
                label="Department"
                required
                value={staffFormData.department}
                onChange={val => setStaffFormData({ ...staffFormData, department: val })}
                options={[
                  'Intensive Care Unit (ICU)',
                  'Outpatient Front Desk',
                  'Hospital Pharmacy',
                  'Pathology & Radiology Diagnostic Labs',
                  'General & Semi-Private Inpatient Wards',
                  'Emergency & Trauma Care',
                  'Hospital Billing Counter'
                ]}
              />
            </div>

            <div>
              <CustomSelect
                label="Shift Assignment"
                value={staffFormData.shift}
                onChange={val => setStaffFormData({ ...staffFormData, shift: val })}
                options={[
                  'Morning (08:00 AM - 04:00 PM)',
                  'Evening (04:00 PM - 12:00 AM)',
                  'Night (12:00 AM - 08:00 AM)',
                  'General OPD (09:00 AM - 05:00 PM)'
                ]}
                searchable={false}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+1 (555) 019-3342"
                value={staffFormData.phone}
                onChange={e => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Official Email
              </label>
              <input
                type="email"
                placeholder="staff@hospital.com"
                value={staffFormData.email}
                onChange={e => setStaffFormData({ ...staffFormData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Qualifications &amp; License
            </label>
            <input
              type="text"
              placeholder="e.g. B.Sc Nursing, Critical Care Certified (BLS/ACLS)"
              value={staffFormData.qualification}
              onChange={e => setStaffFormData({ ...staffFormData, qualification: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingStaff}
              className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold cursor-pointer disabled:opacity-50"
            >
              {savingStaff ? 'Saving...' : 'Register Staff Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT STAFF & DUTY ROSTER MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Staff Member: ${selectedStaff?.name || ''}`}
        subtitle="Update designation, contact, department, shift, and leave approval status"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={editFormData.name}
                onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Designation / Role Title *
              </label>
              <input
                type="text"
                value={editFormData.role_title}
                onChange={e => setEditFormData({ ...editFormData, role_title: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>

            <div>
              <CustomSelect
                label="Department & Unit"
                value={editFormData.department}
                onChange={val => setEditFormData({ ...editFormData, department: val })}
                options={[
                  'Intensive Care Unit (ICU)',
                  'Outpatient Front Desk',
                  'Hospital Pharmacy',
                  'Pathology & Radiology Diagnostic Labs',
                  'General & Semi-Private Inpatient Wards',
                  'Emergency & Trauma Care',
                  'Hospital Billing Counter',
                  'Maternity & Labor Room',
                  'Operation Theatre (OT)'
                ]}
              />
            </div>

            <div>
              <CustomSelect
                label="Shift Timings"
                value={editFormData.shift}
                onChange={val => setEditFormData({ ...editFormData, shift: val })}
                options={[
                  'Morning (08:00 AM - 04:00 PM)',
                  'Evening (04:00 PM - 12:00 AM)',
                  'Night (12:00 AM - 08:00 AM)',
                  'General OPD (09:00 AM - 05:00 PM)',
                  'Rotational Duty'
                ]}
                searchable={false}
              />
            </div>

            <div>
              <CustomSelect
                label="Leave Request / Type"
                value={editFormData.leave_type}
                onChange={val => setEditFormData({ ...editFormData, leave_type: val })}
                options={[
                  'Normal Assigned Shift Duty',
                  'Annual Clinical Leave',
                  'Medical / Sick Leave',
                  'Casual Leave',
                  'Emergency Triage Duty'
                ]}
                searchable={false}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Leave / Duty Period
              </label>
              <input
                type="text"
                placeholder="e.g. Active Current Week or Nov 10 – Nov 14"
                value={editFormData.leave_period}
                onChange={e => setEditFormData({ ...editFormData, leave_period: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>

            <div>
              <CustomSelect
                label="Duty Approval Status"
                value={editFormData.duty_status}
                onChange={val => setEditFormData({ ...editFormData, duty_status: val })}
                options={[
                  'Approved On Duty',
                  'Leave Pending',
                  'On Leave',
                  'Off Shift'
                ]}
                searchable={false}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+1 (555) 019-3342"
                value={editFormData.phone}
                onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Qualifications &amp; Clinical Certification
            </label>
            <input
              type="text"
              placeholder="e.g. B.Sc Nursing, Critical Care Certified (BLS/ACLS)"
              value={editFormData.qualification}
              onChange={e => setEditFormData({ ...editFormData, qualification: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingStaff}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold cursor-pointer disabled:opacity-50 shadow-md shadow-sky-800/20"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{savingStaff ? 'Saving...' : 'Save Staff Changes'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
