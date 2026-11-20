import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { contactApi } from '../../services/api.js';
import { CustomSelect } from '../../components/common/CustomSelect.jsx';
import {
  MapPin,
  PhoneCall,
  Mail,
  Clock,
  Send,
  Building,
  ShieldAlert,
  Car,
  ArrowLeft
} from 'lucide-react';

const DEPARTMENT_OPTIONS = [
  { value: 'General Inquiries', label: 'General Patient Inquiries' },
  { value: 'Cardiology', label: 'Cardiology & Vascular Institute' },
  { value: 'Neurology', label: 'Neurology & Neurosurgery' },
  { value: 'Orthopedics', label: 'Orthopedics & Joint Replacement' },
  { value: 'Pediatrics', label: 'Pediatrics & Neonatal Care' },
  { value: 'Oncology', label: 'Oncology & Chemotherapy' },
  { value: 'Billing', label: 'Billing & Cashless Insurance Desk' },
];

export function ContactPage({ setActivePage }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'General Inquiries',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.warning('Please fill in name, email, and message.');
      return;
    }
    setSending(true);
    try {
      const res = await contactApi.submit(formData);
      setSending(false);
      if (res && res.success) {
        toast.success(`Inquiry registered successfully! Reference Ticket: ${res.data?.ticket_id || 'TCK-2026'}. Front desk notified.`);
        setFormData({
          name: '',
          email: '',
          phone: '',
          department: 'General Inquiries',
          subject: '',
          message: ''
        });
      } else {
        toast.error(res?.message || 'Failed to submit inquiry.');
      }
    } catch (err) {
      setSending(false);
      toast.error(err.message || 'Error submitting message to hospital desk.');
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#022c22] via-[#033b20] to-[#044434] text-white py-12 lg:py-14 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              24/7 Direct Patient Assistance
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
              Contact MedicalCare Medical Center
            </h1>
            <p className="max-w-xl mx-auto text-xs sm:text-sm text-emerald-100/90">
              Reach our patient relations team, emergency ambulance dispatch, or insurance pre-authorization desk.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Col: Contact Information Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Emergency Hotline Card */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-950 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-wide text-rose-800">24/7 Trauma Emergency</h4>
                  <a href="tel:18002739227" className="text-xl font-extrabold text-rose-700 hover:underline">
                    1-800-273-9227
                  </a>
                </div>
              </div>
              <p className="text-xs text-rose-800/90 leading-relaxed">
                Dedicated rapid ambulance dispatch with in-transit paramedic tele-link directly to our trauma resuscitation bay.
              </p>
            </div>

            {/* General Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Campus Location & Extensions
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Hospital Address:</strong>
                    <p className="text-slate-500 mt-0.5">740 Health Sciences Boulevard, Medical District, Chicago, IL 60611</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PhoneCall className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">General Board Line:</strong>
                    <p className="text-slate-500 mt-0.5">+1 (555) 019-2000 (Mon - Sat 8 AM - 8 PM)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Patient Relations & Appointments:</strong>
                    <p className="text-slate-500 mt-0.5">care@apexcarehospital.org</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Inpatient Visiting Hours:</strong>
                    <p className="text-slate-500 mt-0.5">General Wards: 11:00 AM - 1:00 PM & 4:30 PM - 7:00 PM</p>
                    <p className="text-slate-500">ICU Suites: 12:00 PM - 1:00 PM (1 visitor at a time)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Car className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Parking & Accessibility:</strong>
                    <p className="text-slate-500 mt-0.5">Multi-level valet parking available 24/7 at North and South entrances.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Interactive Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs min-w-0">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-xl font-bold text-slate-900 font-display">Send a Medical Inquiry</h3>
              <p className="text-xs text-slate-500 mt-1">
                Have questions about a specialty, admission, insurance policy, or second medical opinion?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Connor"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                    required
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="sarah@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                    required
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Regarding Department
                  </label>
                  <CustomSelect
                    value={formData.department}
                    onChange={(val) => setFormData({ ...formData, department: val })}
                    options={DEPARTMENT_OPTIONS}
                    placeholder="Select Department"
                    searchable={false}
                    className="w-full min-w-0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pre-surgery consultation inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Message *
                </label>
                <textarea
                  rows={4}
                  placeholder="How can our clinical team assist you today?..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-emerald-200" />
                {sending ? 'Sending Message...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
