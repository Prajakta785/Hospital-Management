import React, { useState, useEffect } from 'react';
import { doctorsApi, departmentsApi, appointmentsApi } from '../../services/api.js';
import { fallbackDepartments, fallbackDoctors } from '../../data/fallbackData.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { AppointmentSlipModal } from '../../components/common/AppointmentSlipModal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Droplet,
  Printer
} from 'lucide-react';

export function AppointmentBookingPage({ initialDoctor = null, setActivePage }) {
  const { user } = useAuth();
  const toast = useToast();

  const [departments, setDepartments] = useState(() => fallbackDepartments);
  const [doctors, setDoctors] = useState(() => fallbackDoctors);
  const [selectedDeptId, setSelectedDeptId] = useState(() => initialDoctor?.department_id?.toString() || (fallbackDoctors[0]?.department_id?.toString() || '1'));
  const [selectedDoctorId, setSelectedDoctorId] = useState(() => initialDoctor?.id?.toString() || (fallbackDoctors[0]?.id?.toString() || '1'));
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [appointmentType, setAppointmentType] = useState('General Consultation');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Guest details (or prefilled if patient logged in)
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientBloodGroup, setPatientBloodGroup] = useState('O+');

  // Confirmation state
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [slipModalOpen, setSlipModalOpen] = useState(false);

  const defaultTimeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  // Prefill logged in patient
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
  }, [user]);

  // Load departments & doctors
  useEffect(() => {
    async function loadData() {
      try {
        const [deptRes, docRes] = await Promise.all([
          departmentsApi.getAll(),
          doctorsApi.getAll()
        ]);
        if (deptRes.success) setDepartments(deptRes.data);
        if (docRes.success) {
          setDoctors(docRes.data);
          if (initialDoctor) {
            setSelectedDoctorId(initialDoctor.id.toString());
            setSelectedDeptId(initialDoctor.department_id?.toString() || '');
          } else if (docRes.data.length > 0) {
            setSelectedDoctorId(docRes.data[0].id.toString());
            setSelectedDeptId(docRes.data[0].department_id?.toString() || '');
          }
        }
      } catch (err) {
        console.error('Failed to load booking dependencies:', err);
      }
    }
    loadData();

    // Default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
    setSelectedTimeSlot('10:00 AM');
  }, [initialDoctor]);

  const selectedDoctor = doctors.find(d => d.id === parseInt(selectedDoctorId, 10));

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDoctorId) {
      toast.warning('Please select a doctor.');
      return;
    }
    if (!selectedDate) {
      toast.warning('Please choose a consultation date.');
      return;
    }
    if (!selectedTimeSlot) {
      toast.warning('Please pick an appointment time slot.');
      return;
    }
    if (!patientName.trim() || !patientPhone.trim()) {
      toast.warning('Please provide your name and contact phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        doctor_id: parseInt(selectedDoctorId, 10),
        department_id: selectedDoctor?.department_id || null,
        appointment_date: selectedDate,
        appointment_time: selectedTimeSlot,
        type: appointmentType,
        reason: reason || 'Clinical Consultation',
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
        setConfirmedAppointment(res.data);
        setSlipModalOpen(true);
        toast.success(`Appointment confirmed! Queue Pos: #${res.data.queueInfo?.queuePosition || 1} (ETA: ${res.data.queueInfo?.estimatedWaitMins || 15}m)`);
      } else {
        toast.error(res.message || 'Failed to book appointment.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to complete appointment booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Printable Voucher Modal */}
      <AppointmentSlipModal
        isOpen={slipModalOpen}
        onClose={() => setSlipModalOpen(false)}
        appointment={confirmedAppointment}
      />

      {/* Header */}
      <section className="bg-gradient-to-r from-[#022c22] via-[#033b20] to-[#044434] text-white py-12 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          {setActivePage && (
            <div className="mb-4">
              <button
                onClick={() => setActivePage('home')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white text-xs font-bold backdrop-blur-md border border-white/15 transition-all hover:-translate-x-1 cursor-pointer shadow-sm group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Back to Home</span>
              </button>
            </div>
          )}

          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-[#044434]/80 px-3 py-1 rounded-full border border-[#059669]/40">
              Online Consultation Booking
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
              Book Doctor Consultation
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90">
              Select your preferred specialist, choose a date & time slot, and get your instant booking confirmation slip.
            </p>
          </div>
        </div>
      </section>

      {/* Main Booking Wizard Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <form onSubmit={handleBookingSubmit} className="space-y-8">
          {/* Step 1: Select Doctor & Specialty */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#059669] text-white font-bold text-xs">
                1
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Select Specialty & Physician</h3>
                <p className="text-xs text-slate-500">Choose the medical discipline and doctor for your clinical visit</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Department Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Clinical Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => {
                    setSelectedDeptId(e.target.value);
                    const matchingDoc = doctors.find(d => d.department_id === parseInt(e.target.value, 10));
                    if (matchingDoc) setSelectedDoctorId(matchingDoc.id.toString());
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 focus:outline-hidden"
                >
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Doctor Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Consultant Physician
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 focus:outline-hidden"
                  required
                >
                  {doctors
                    .filter(doc => !selectedDeptId || doc.department_id === parseInt(selectedDeptId, 10))
                    .map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} - {doc.specialty}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Selected Doctor Summary Card */}
            {selectedDoctor && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-sky-50/70 border border-sky-100">
                <img
                  src={selectedDoctor.avatar || `/images/doctors/doctor-${selectedDoctor.id || 1}.jpg`}
                  alt={selectedDoctor.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `/images/doctors/doctor-${selectedDoctor.id || 1}.jpg`;
                  }}
                  className="w-16 h-16 rounded-xl object-cover object-top border border-sky-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{selectedDoctor.name}</h4>
                  </div>
                  <p className="text-xs font-semibold text-sky-800">{selectedDoctor.specialty}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{selectedDoctor.qualifications} • Room: {selectedDoctor.room_number}</p>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Date & Time Slot */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#059669] text-white font-bold text-xs">
                2
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Choose Appointment Date & Time</h3>
                <p className="text-xs text-slate-500">Select an available clinic day and consultation slot</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Consultation Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Appointment Category
                </label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                >
                  <option value="General Consultation">General Consultation</option>
                  <option value="Follow-up">Follow-up Visit</option>
                  <option value="Routine Checkup">Annual Health Checkup</option>
                  <option value="Specialist Review">Specialist Second Opinion</option>
                  <option value="Emergency">Urgent Same-Day Triage</option>
                </select>
              </div>
            </div>

            {/* Time Slot Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Available Time Slots
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {defaultTimeSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                      selectedTimeSlot === slot
                        ? 'bg-[#059669] text-white border-[#059669] shadow-xs scale-102'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Patient Demographics */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#059669] text-white font-bold text-xs">
                3
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Patient Information & Medical Reason</h3>
                <p className="text-xs text-slate-500">Provide contact details for booking confirmation and appointment updates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. David Miller"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 focus:outline-hidden"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-rose-600 fill-rose-600/30" />
                    Blood Group
                  </span>
                  <span className="text-[10px] text-sky-800 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-100">Patient Group</span>
                </label>
                <select
                  value={patientBloodGroup}
                  onChange={(e) => setPatientBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-600 focus:outline-hidden cursor-pointer"
                >
                  <option value="A+">A+ (A Positive)</option>
                  <option value="A-">A- (A Negative)</option>
                  <option value="B+">B+ (B Positive)</option>
                  <option value="B-">B- (B Negative)</option>
                  <option value="O+">O+ (O Positive)</option>
                  <option value="O-">O- (O Negative)</option>
                  <option value="AB+">AB+ (AB Positive)</option>
                  <option value="AB-">AB- (AB Negative)</option>
                  <option value="Unknown">Don't Know / Need Blood Test</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Visit / Symptoms
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your current symptoms, medical history notes, or consultation objectives..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Submission Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-[#022c22] border border-[#044434] text-white">
            <div className="text-center sm:text-left space-y-1">
              <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Fast & Hassle-Free Booking</p>
              <h4 className="text-base font-bold">Pay at hospital desk on appointment day</h4>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm shadow-md transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Confirming Appointment...' : 'Confirm Appointment Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
