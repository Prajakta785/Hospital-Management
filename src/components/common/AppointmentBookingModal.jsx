import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal.jsx';
import { CustomDatePicker } from './CustomDatePicker.jsx';
import { doctorsApi, departmentsApi, appointmentsApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Stethoscope,
  Building2,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  Droplet,
  ChevronDown
} from 'lucide-react';

function DoctorDropdown({ doctors, value, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedDoctor = doctors.find(d => d.id.toString() === value?.toString());

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full sm:w-auto sm:min-w-[260px] max-w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-xl border border-sky-300 bg-white text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden cursor-pointer"
      >
        <span className="truncate pr-2 text-left">
          {selectedDoctor ? `${selectedDoctor.name} — ${selectedDoctor.specialty}` : 'Select Doctor'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#0284c7] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 sm:right-auto sm:w-[300px] top-full mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150 dropdown-scroll"
          style={{ position: 'absolute' }}
        >
          {doctors.map(d => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                onChange(d.id.toString());
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-sky-50 transition-colors cursor-pointer ${
                value?.toString() === d.id.toString() ? 'bg-sky-50 font-bold text-[#071933]' : 'text-slate-700'
              }`}
            >
              <div className="truncate pr-2 min-w-0">
                <span className="font-bold text-slate-900 block truncate">{d.name}</span>
                <span className="text-[10px] text-[#0284c7] block truncate">{d.specialty}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold shrink-0">₹{d.consultation_fee || 500}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppointmentBookingModal({ isOpen, onClose, selectedDoctor = null, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [activeDoctorId, setActiveDoctorId] = useState('');
  const [activeDeptId, setActiveDeptId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [appointmentType, setAppointmentType] = useState('General Consultation');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Patient info
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientBloodGroup, setPatientBloodGroup] = useState('O+');

  const defaultTimeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  // Load departments & doctors on mount or open
  useEffect(() => {
    async function fetchData() {
      try {
        const [deptRes, docRes] = await Promise.all([
          departmentsApi.getAll(),
          doctorsApi.getAll()
        ]);
        if (deptRes.success) setDepartments(deptRes.data);
        if (docRes.success) {
          setDoctors(docRes.data);
          if (selectedDoctor) {
            setActiveDoctorId(selectedDoctor.id.toString());
            setActiveDeptId(selectedDoctor.department_id?.toString() || '');
          } else if (docRes.data.length > 0) {
            setActiveDoctorId(docRes.data[0].id.toString());
            setActiveDeptId(docRes.data[0].department_id?.toString() || '');
          }
        }
      } catch (err) {
        console.error('Failed to load doctors/departments for modal:', err);
      }
    }
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, selectedDoctor]);

  // Sync selectedDoctor prop changes
  useEffect(() => {
    if (selectedDoctor) {
      setActiveDoctorId(selectedDoctor.id.toString());
      if (selectedDoctor.department_id) {
        setActiveDeptId(selectedDoctor.department_id.toString());
      }
    }
  }, [selectedDoctor]);

  // Prefill logged-in user details
  useEffect(() => {
    if (user) {
      setPatientName(user.name || '');
      setPatientEmail(user.email || '');
      const cleanPhone = user.phone && user.phone.includes('555') ? '+91 98201 23456' : (user.phone || '');
      setPatientPhone(cleanPhone);
      if (user?.patientRecord?.blood_group) {
        setPatientBloodGroup(user.patientRecord.blood_group);
      }
    }
    // Set tomorrow's date by default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setAppointmentDate(tomorrow.toISOString().split('T')[0]);
  }, [user, isOpen]);

  const currentDoctor = doctors.find(d => d.id === parseInt(activeDoctorId, 10)) || selectedDoctor;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!activeDoctorId) {
      toast.warning('Please select a doctor.');
      return;
    }
    if (!appointmentDate) {
      toast.warning('Please select an appointment date.');
      return;
    }
    if (!timeSlot) {
      toast.warning('Please select a time slot.');
      return;
    }
    if (!patientName.trim()) {
      toast.warning('Please enter patient full name.');
      return;
    }
    if (!patientPhone.trim()) {
      toast.warning('Please enter a valid contact phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        doctor_id: parseInt(activeDoctorId, 10),
        department_id: currentDoctor?.department_id || (activeDeptId ? parseInt(activeDeptId, 10) : null),
        appointment_date: appointmentDate,
        appointment_time: timeSlot,
        type: appointmentType,
        reason: reason.trim() || 'Clinical Consultation',
        patient_id: user?.patientRecord?.id || null,
        guest_name: patientName.trim(),
        guest_email: patientEmail.trim(),
        guest_phone: patientPhone.trim(),
        guest_gender: patientGender,
        guest_blood_group: patientBloodGroup,
        blood_group: patientBloodGroup
      };

      const res = await appointmentsApi.book(payload);
      if (res.success && res.data) {
        toast.success(`Appointment confirmed! Reference: #${res.data.appointment_number}`);
        onClose();
        if (onSuccess) {
          onSuccess(res.data);
        }
      } else {
        toast.error(res.message || 'Failed to complete appointment booking.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to complete appointment booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Doctor Appointment"
      subtitle="Fill in patient details & select a preferred consultation schedule"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Selected Doctor Card / Selector */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-sky-50/80 to-blue-50/60 border border-sky-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-sky-200/50">
            <label className="text-[11px] font-bold text-[#071933] uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <Stethoscope className="w-3.5 h-3.5 text-[#0284c7]" />
              Select Specialist Doctor
            </label>
            <DoctorDropdown
              doctors={doctors}
              value={activeDoctorId}
              onChange={val => setActiveDoctorId(val)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white border border-sky-200 overflow-hidden shrink-0 shadow-2xs">
              <img
                src={currentDoctor?.avatar || `/images/doctors/doctor-${currentDoctor?.id || 1}.jpg`}
                alt={currentDoctor?.name || 'Doctor'}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `/images/doctors/doctor-${currentDoctor?.id || 1}.jpg`;
                }}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-sm font-extrabold text-slate-900 truncate max-w-[200px] sm:max-w-none">
                  {currentDoctor?.name || 'Select Doctor'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 shrink-0">
                  {currentDoctor?.experience_years ? `${currentDoctor.experience_years}+ Yrs Exp` : 'Consultant MD'}
                </span>
                {currentDoctor?.room_number && (
                  <span className="text-[10px] font-semibold text-slate-500 shrink-0">
                    OPD: {currentDoctor.room_number}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-[#0284c7] mt-0.5 truncate">
                {currentDoctor?.specialty || 'General Medicine'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium break-words leading-tight mt-0.5">
                {currentDoctor?.qualifications || 'MBBS, MD'} • Consultation: ₹{currentDoctor?.consultation_fee || 500}
              </p>
            </div>
          </div>
        </div>

        {/* Date & Time Slot Selection */}
        <div className="space-y-3.5">
          <div>
            <CustomDatePicker
              label="Appointment Date"
              required
              value={appointmentDate}
              onChange={(dateStr) => setAppointmentDate(dateStr)}
              placeholder="Select Appointment Date"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0284c7]" />
                Consultation Slot
              </label>
              <span className="text-[10px] font-extrabold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200">
                {timeSlot || 'Select Slot'}
              </span>
            </div>

            {/* Responsive Touch-Friendly Time Slot Chips (Prevents popup overflow on mobile) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {defaultTimeSlots.map(slot => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeSlot(slot)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all text-center cursor-pointer ${
                    timeSlot === slot
                      ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-xs font-extrabold ring-2 ring-sky-500/30'
                      : 'bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-900 border-slate-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Patient Contact Information */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3.5">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#0284c7]" />
            Patient Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Patil"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. rahul@example.com"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-rose-600 fill-rose-600/30" />
                  Blood Group
                </span>
                <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  {patientBloodGroup}
                </span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setPatientBloodGroup(bg)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      patientBloodGroup === bg
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-1 ring-rose-400'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Male', 'Female', 'Other'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setPatientGender(g)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      patientGender === g
                        ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-xs font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Symptoms / Reason for Consultation (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Mild fever, chest discomfort, routine checkup..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-md shadow-sky-800/20 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-sky-200" />
                <span>Confirm & Book Visit</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
