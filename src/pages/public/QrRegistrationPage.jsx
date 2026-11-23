import React, { useState } from 'react';
import QRCode from 'qrcode';
import { workflowApi } from '../../services/api.js';
import {
  QrCode,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Droplet,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Printer,
  ChevronLeft,
  HeartHandshake,
  Download,
  Search,
  UserPlus,
  FileSearch,
  RefreshCw,
  History,
  Check,
  UserCheck,
  Clock,
  Building2
} from 'lucide-react';

// Helper function to format Registration Date & Time in clear localized format
const formatDateTime = (val) => {
  if (!val) {
    return new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return String(val);
  }
};

export function QrRegistrationPage({ setActivePage }) {
  // Option 1: 'new' (नवीन नोंदणी) | Option 2: 'existing' (आधी नोंदणी केली असल्यास)
  const [activeTab, setActiveTab] = useState('new');

  // Existing Patient Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);
  const [existingPatientData, setExistingPatientData] = useState(null);
  const [todaySymptoms, setTodaySymptoms] = useState('');

  const [formData, setFormData] = useState({
    patient_id: '',
    name: '',
    age: '',
    dob: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    blood_group: 'O+',
    symptoms: '',
    medical_history: '',
    emergency_contact: '',
    whatsapp_enabled: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registeredPatient, setRegisteredPatient] = useState(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError(null);
  };

  // Option 2: Lookup Existing Patient Record
  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    const query = lookupQuery.trim();
    if (!query) {
      setLookupError('कृपया तुमचा आधीचा Registration / Patient ID (उदा. PAT-2026-XXXX) किंवा मोबाईल नंबर टाका.');
      return;
    }

    try {
      setLookupLoading(true);
      setLookupError(null);
      const res = await workflowApi.lookupPatient(query);
      if (res && res.success && res.data) {
        setExistingPatientData(res.data);
        setTodaySymptoms('');
      } else {
        setLookupError(res?.message || 'या नंबरने आधीचे कोणतेही रेकॉर्ड सापडले नाही.');
      }
    } catch (err) {
      setLookupError(err?.response?.data?.message || err?.message || 'रेकॉर्ड शोधताना त्रुटी आली. कृपया नंबर तपासा किंवा नवीन नोंदणी करा.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Pre-fill existing data into full form if patient wants to edit
  const handlePreFillNewForm = () => {
    if (!existingPatientData) return;
    setFormData({
      patient_id: existingPatientData.patient_id || '',
      name: existingPatientData.name || '',
      age: existingPatientData.age ? String(existingPatientData.age) : '',
      dob: existingPatientData.dob || '',
      gender: existingPatientData.gender || 'Male',
      phone: existingPatientData.phone || '',
      email: existingPatientData.email || '',
      address: existingPatientData.address || '',
      blood_group: existingPatientData.blood_group || 'O+',
      symptoms: todaySymptoms || existingPatientData.last_symptoms || '',
      medical_history: existingPatientData.medical_history || '',
      emergency_contact: existingPatientData.emergency_contact?.phone
        ? `${existingPatientData.emergency_contact?.name || ''} - ${existingPatientData.emergency_contact?.phone || ''}`
        : '',
      whatsapp_enabled: true
    });
    setActiveTab('new');
  };

  // Fast check-in for existing returning patient
  const handleExistingCheckin = async (e) => {
    e.preventDefault();
    if (!todaySymptoms.trim()) {
      setError('कृपया आज डॉक्टरांना दाखवण्याचे कारण / आजचा त्रास (Symptoms) नमूद करा.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload = {
        patient_id: existingPatientData.patient_id,
        name: existingPatientData.name,
        age: existingPatientData.age,
        dob: existingPatientData.dob,
        gender: existingPatientData.gender,
        phone: existingPatientData.phone,
        email: existingPatientData.email,
        address: existingPatientData.address,
        blood_group: existingPatientData.blood_group,
        symptoms: todaySymptoms.trim(),
        medical_history: existingPatientData.medical_history || '',
        emergency_contact_name: existingPatientData.emergency_contact?.name || '',
        emergency_contact_phone: existingPatientData.emergency_contact?.phone || '',
        whatsapp_consent: true,
        is_returning_patient: true
      };
      const res = await workflowApi.registerPatient(payload);
      if (res && res.success) {
        setRegisteredPatient(res.data);
      } else {
        setError(res?.message || 'Check-in failed. Please try again.');
      }
    } catch (err) {
      setError(err?.message || 'Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide patient full name.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please provide a valid mobile number for WhatsApp delivery.');
      return;
    }
    if (!formData.symptoms.trim()) {
      setError('Please describe current symptoms or health problem.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await workflowApi.registerPatient(formData);
      if (res && res.success) {
        setRegisteredPatient(res.data);
      } else {
        setError(res?.message || 'Registration failed. Please check details.');
      }
    } catch (err) {
      setError(err?.message || 'Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadSlip = async () => {
    if (!registeredPatient || downloading) return;
    setDownloading(true);
    try {
      const patientId = registeredPatient.patient_id || 'PAT-TOKEN';
      const patientName = registeredPatient.name || 'Patient';
      const regTimeSource = registeredPatient.registered_at || registeredPatient.created_at || new Date().toISOString();
      const regDate = new Date(regTimeSource);
      const dateStr = isNaN(regDate.getTime()) 
        ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : regDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const timeStr = isNaN(regDate.getTime())
        ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        : regDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      // Generate QR Code data URL for the patient ID
      let qrDataUrl = '';
      try {
        qrDataUrl = await QRCode.toDataURL(patientId, {
          width: 240,
          margin: 1,
          color: { dark: '#022c22', light: '#ffffff' }
        });
      } catch (e) {
        console.warn('QR Code generation skipped:', e);
      }

      // Draw high-resolution canvas slip (800x1050)
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1050;
      const ctx = canvas.getContext('2d');

      // 1. Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 800, 1050);

      // Card border
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, 760, 1010);

      // 2. Header Banner (Deep Forest Green)
      const headerGrad = ctx.createLinearGradient(0, 20, 0, 190);
      headerGrad.addColorStop(0, '#022119');
      headerGrad.addColorStop(0.5, '#022c22');
      headerGrad.addColorStop(1, '#033b20');
      ctx.fillStyle = headerGrad;
      ctx.fillRect(20, 20, 760, 170);

      // Hospital Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MedicalCare Medical Center', 400, 75);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('QUATERNARY HEALTHCARE & ACADEMIC RESEARCH INSTITUTE', 400, 105);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px sans-serif';
      ctx.fillText('740 Health Sciences Blvd, Chicago, IL 60611 • 24/7 Hotline: 1800-273-9227', 400, 135);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('★ JCI Gold Seal & NABH Certified Quaternary Care ★', 400, 165);

      // 3. Token Header Box
      ctx.fillStyle = '#ecfdf5';
      ctx.fillRect(50, 215, 700, 130);
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(50, 215, 700, 130);

      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('OUTPATIENT REGISTRATION & QUEUE TOKEN', 400, 245);

      ctx.fillStyle = '#022c22';
      ctx.font = 'bold 44px monospace';
      ctx.fillText(patientId, 400, 300);

      ctx.fillStyle = '#059669';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('● Status: Pending Nurse Station Review & Doctor Assignment', 400, 330);

      // 4. Patient Information Grid
      const drawInfoRow = (label, value, y) => {
        ctx.fillStyle = '#64748b';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, 70, y);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(value, 730, y);

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(70, y + 10);
        ctx.lineTo(730, y + 10);
        ctx.stroke();
      };

      let currY = 385;
      drawInfoRow('Patient Full Name', registeredPatient.name || 'N/A', currY);
      currY += 45;
      drawInfoRow('Registered WhatsApp Mobile', registeredPatient.phone || 'N/A', currY);
      currY += 45;
      drawInfoRow('Age & Gender', `${registeredPatient.age || 'N/A'} yrs • ${registeredPatient.gender || 'N/A'}`, currY);
      currY += 45;
      drawInfoRow('Blood Group', registeredPatient.blood_group || 'N/A', currY);
      currY += 45;
      drawInfoRow('Registration Date & Time', `${dateStr} at ${timeStr}`, currY);
      currY += 45;
      drawInfoRow('Symptoms / Intake Reason', (registeredPatient.symptoms || 'General Checkup').slice(0, 48), currY);

      // 5. QR Code block (if generated)
      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise((resolve) => {
          qrImg.onload = () => {
            ctx.drawImage(qrImg, 320, currY + 25, 160, 160);
            ctx.fillStyle = '#475569';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Scan at Nurse Counter / Doctor Station for instant file retrieval', 400, currY + 205);
            resolve();
          };
          qrImg.onerror = resolve;
        });
      }

      // 6. Footer Instructions
      const footerY = 960;
      ctx.fillStyle = '#044434';
      ctx.fillRect(50, footerY - 25, 700, 60);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AUTOMATIC WHATSAPP NOTIFICATION ACTIVATED', 400, footerY - 5);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = '11px sans-serif';
      ctx.fillText('Digital prescription & medicines list will be dispatched to your WhatsApp upon completion.', 400, footerY + 15);

      // Trigger download
      const dataUri = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${patientId}_Token_Slip.png`;
      link.href = dataUri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download slip error:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-blue-50/40 py-3 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Top Header / Back button */}
        <div className="flex items-center justify-between mb-3 sm:mb-6 print:hidden">
          <button
            onClick={() => setActivePage ? setActivePage('home') : window.location.href = '/'}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-950 hover:text-emerald-700 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Hospital Home
          </button>
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-100/80 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Direct Hospital In-take Desk
          </div>
        </div>

        {/* If successfully registered, show Success Slip */}
        {registeredPatient ? (
          <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-b from-[#022119] via-[#022c22] to-[#033b20] px-6 py-6 text-white text-center">
              <div className="w-14 h-14 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">Patient Registration Successful!</h2>
              <p className="text-xs text-emerald-200 mt-1">
                Your queue token has been transferred to the Nurse Station for immediate triage.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Highlight Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200/80 text-center">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Assigned Patient ID</span>
                <div className="text-2xl sm:text-3xl font-black text-[#022c22] tracking-tight font-mono my-1">
                  {registeredPatient.patient_id}
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-200 mt-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Status: Pending Nurse Review
                </div>
              </div>

              {/* Patient Summary grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">Patient Name</span>
                  <span className="text-slate-900 font-bold text-sm">{registeredPatient.name}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">Registered WhatsApp</span>
                  <span className="text-slate-900 font-bold text-sm">{registeredPatient.phone}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">Age & Gender</span>
                  <span className="text-slate-900 font-bold text-sm">{registeredPatient.age || 'N/A'} yrs • {registeredPatient.gender}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">Blood Group</span>
                  <span className="text-slate-900 font-bold text-sm">{registeredPatient.blood_group}</span>
                </div>
                {/* Dedicated Registration Date & Time Card */}
                <div className="p-3.5 bg-emerald-50/90 rounded-xl border border-emerald-200/90 col-span-1 sm:col-span-2 shadow-2xs">
                  <span className="text-emerald-800 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    नोंदणी तारीख आणि वेळ (Registration Date &amp; Time)
                  </span>
                  <span className="text-slate-950 font-black text-sm sm:text-base block mt-1 font-mono">
                    {formatDateTime(registeredPatient.registered_at || registeredPatient.created_at)}
                  </span>
                </div>
              </div>

              {/* WhatsApp Notification Box */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#059669] text-white shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-xs text-[#022c22]">
                  <p className="font-bold">Automatic WhatsApp Prescription Notification Active</p>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    As soon as your assigned doctor completes your consultation, your official signed prescription, medicines schedule, and follow-up appointment date will be messaged to <strong>{registeredPatient.phone}</strong>.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Download Slip & Print Slip + Register Another */}
              <div className="space-y-3 pt-2 print:hidden">
                {/* 2 Dedicated Options: Download & Print (Optimized for Mobile Phone Screens) */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadSlip}
                    disabled={downloading}
                    className="inline-flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-900/20 active:scale-[0.98] disabled:opacity-50"
                    title="Download high-resolution token slip to your phone"
                  >
                    <Download className="w-4 h-4 text-emerald-100" />
                    <span>{downloading ? 'Downloading...' : 'Download Slip'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-slate-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/60 text-slate-800 hover:text-emerald-950 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                    title="Print token slip or save as PDF via system printer"
                  >
                    <Printer className="w-4 h-4 text-emerald-700" />
                    <span>Print Slip</span>
                  </button>
                </div>

                {/* Register Another Patient Button */}
                <button
                  type="button"
                  onClick={() => {
                    setRegisteredPatient(null);
                    setFormData({
                      name: '',
                      age: '',
                      dob: '',
                      gender: 'Male',
                      phone: '',
                      email: '',
                      address: '',
                      blood_group: 'O+',
                      symptoms: '',
                      medical_history: '',
                      emergency_contact: '',
                      whatsapp_enabled: true
                    });
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#022c22] hover:bg-[#033b20] text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <span>Register Another Patient</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Registration Form with 2 Options: New vs Existing Patient */
          <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
            {/* Form Banner */}
            <div className="bg-gradient-to-b from-[#022119] via-[#022c22] to-[#033b20] px-6 sm:px-8 py-6 text-white relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 shadow-md">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">Patient OPD Self-Registration</h1>
                  <p className="text-xs text-emerald-200 mt-0.5">Direct Hospital Check-in & Queue Pass</p>
                </div>
              </div>
            </div>

            {/* 2 Options Selection Tabs */}
            <div className="bg-slate-100/90 p-2 border-b border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('new');
                    setError(null);
                  }}
                  className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    activeTab === 'new'
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>१. नवीन नोंदणी (New Registration)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('existing');
                    setError(null);
                  }}
                  className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    activeTab === 'existing'
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  <FileSearch className="w-4 h-4" />
                  <span>२. आधी नोंदणी केली असल्यास (Already Registered)</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="m-6 mb-0 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 font-medium animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* OPTION 2: ALREADY REGISTERED PATIENT LOOKUP */}
            {activeTab === 'existing' && (
              <div className="p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                {/* Search Box */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-sky-50 via-slate-50 to-emerald-50/40 rounded-2xl border border-sky-200/80 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-[#0284c7] text-white shrink-0 shadow-xs">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                        आधी नोंदणी केलेल्या पेशंटचा डेटा शोधा
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        तुमचा मागील <strong>Patient ID (उदा. PAT-2026-XXXX)</strong> किंवा <strong>नोंदणी केलेला मोबाईल नंबर</strong> खाली टाका.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleLookup} className="mt-4 flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={lookupQuery}
                        onChange={(e) => {
                          setLookupQuery(e.target.value);
                          if (lookupError) setLookupError(null);
                        }}
                        placeholder="उदा. PAT-2026-2570 किंवा 9876543210"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 shadow-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={lookupLoading}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-60"
                    >
                      {lookupLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>डेटा शोधत आहे...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>डेटा शोधा (Find Record)</span>
                        </>
                      )}
                    </button>
                  </form>

                  {lookupError && (
                    <div className="mt-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{lookupError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('new');
                          setError(null);
                        }}
                        className="text-xs font-bold text-rose-900 hover:underline cursor-pointer shrink-0"
                      >
                        नवीन नोंदणी करा ›
                      </button>
                    </div>
                  )}
                </div>

                {/* Patient Record Found Card */}
                {existingPatientData && (
                  <div className="p-3.5 sm:p-5 lg:p-6 bg-white rounded-2xl border border-emerald-300 shadow-sm space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg shadow-2xs shrink-0">
                          {existingPatientData.name?.charAt(0) || 'P'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-lg font-black text-slate-900 truncate">{existingPatientData.name}</h3>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800 flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Record
                            </span>
                          </div>
                          <p className="text-xs font-mono font-bold text-sky-800 mt-0.5 truncate">
                            Patient ID: {existingPatientData.patient_id}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handlePreFillNewForm}
                        className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900 hover:underline cursor-pointer self-start sm:self-auto"
                      >
                        <span>माहिती बदलायची आहे? (Edit Details)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Patient Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
                      <div className="p-2 sm:p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Age & Gender</span>
                        <span className="font-bold text-slate-800 text-[11px] sm:text-xs truncate block">{existingPatientData.age || 'N/A'} yrs • {existingPatientData.gender}</span>
                      </div>
                      <div className="p-2 sm:p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">WhatsApp Mobile</span>
                        <span className="font-bold text-slate-800 text-[11px] sm:text-xs truncate block">{existingPatientData.phone}</span>
                      </div>
                      <div className="p-2 sm:p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Blood Group</span>
                        <span className="font-bold text-slate-800 text-[11px] sm:text-xs">{existingPatientData.blood_group || 'O+'}</span>
                      </div>
                      <div className="p-2 sm:p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Past Visits</span>
                        <span className="font-bold text-emerald-700 text-[11px] sm:text-xs">{existingPatientData.past_visits_count || 1} Registered Visits</span>
                      </div>
                    </div>

                    {/* Patient Registration Date & Time Banner */}
                    <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/90 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 shadow-2xs">
                      <span className="text-emerald-900 font-bold text-[11px] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>नोंदणी तारीख आणि वेळ (Registered Date &amp; Time):</span>
                      </span>
                      <span className="font-extrabold text-slate-950 font-mono text-xs">
                        {formatDateTime(existingPatientData.registered_at || existingPatientData.created_at)}
                      </span>
                    </div>

                    {existingPatientData.address && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Address:</span>
                        <span className="font-medium text-slate-800">{existingPatientData.address}</span>
                      </div>
                    )}

                    {existingPatientData.medical_history && (
                      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                        <span className="font-bold block text-[11px] text-amber-950 uppercase tracking-wider">मागील वैद्यकीय इतिहास (Medical History):</span>
                        <p className="mt-0.5">{existingPatientData.medical_history}</p>
                      </div>
                    )}

                    {/* Fast 1-Click Check-in Form */}
                    <form onSubmit={handleExistingCheckin} className="space-y-4 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>आजचा त्रास किंवा चेकअपचे कारण (Reason for Visit) <strong className="text-rose-500">*</strong></span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">उदा. फॉलो-अप, ताप, खोकला, रूटीन चेकअप</span>
                        </label>
                        <textarea
                          name="todaySymptoms"
                          value={todaySymptoms}
                          onChange={(e) => setTodaySymptoms(e.target.value)}
                          required
                          rows={3}
                          placeholder="आज डॉक्टरांना दाखवण्याचे कारण किंवा आजची लक्षणे येथे लिहा..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all resize-none shadow-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                            <span className="text-xs sm:text-sm font-bold">टोकन तयार होत आहे...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
                            <div className="flex flex-col text-center leading-tight">
                              <span className="text-xs sm:text-sm font-black">आजच्या तपासणीसाठी टोकन मिळवा</span>
                              <span className="text-[10px] sm:text-xs text-emerald-100 font-semibold">(Check-in for Today's Visit)</span>
                            </div>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* OPTION 1: NEW PATIENT REGISTRATION FORM */}
            {activeTab === 'new' && (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                {formData.patient_id && (
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between text-xs text-sky-900">
                    <span className="font-bold">
                      Pre-filled with Patient ID: <strong className="font-mono text-sky-700">{formData.patient_id}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, patient_id: '' }))}
                      className="text-xs text-rose-600 font-bold hover:underline"
                    >
                      Clear ID
                    </button>
                  </div>
                )}
              {/* Field 1: Patient Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  1. Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Johnathan Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
                />
              </div>

              {/* Field 2 & 3: Age / DOB & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    2. Age (Years)
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="1"
                    max="125"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g. 34"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    3. Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
                  >
                    {genders.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field 4 & 5: Mobile & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    4. WhatsApp Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all font-mono"
                  />
                  <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                    Prescription PDF will be sent here automatically
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" />
                    5. Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. patient@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              {/* Field 6 & 7: Address & Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    6. Residential Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. 142 Medical Heights, Sector 4"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-rose-600" />
                    7. Blood Group
                  </label>
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all font-bold text-emerald-950"
                  >
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field 8: Symptoms / Health Problem */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-600" />
                  8. Current Symptoms / Health Problem <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="symptoms"
                  rows={3}
                  required
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="Describe your current symptoms, pain location, duration (e.g. fever for 3 days, persistent dry cough)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
                />
              </div>

              {/* Field 9: Previous Medical History */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  9. Previous Medical History / Chronic Conditions / Known Allergies
                </label>
                <textarea
                  name="medical_history"
                  rows={2}
                  value={formData.medical_history}
                  onChange={handleChange}
                  placeholder="e.g. Hypertension, Diabetes Type 2, allergic to Penicillin, past surgeries..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
                />
              </div>

              {/* Field 10: Emergency Contact */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-700" />
                  10. Emergency Contact Person & Phone Number
                </label>
                <input
                  type="text"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe (Spouse) - +91 98765 00000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
                />
              </div>

              {/* WhatsApp Notification Consent */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="whatsapp_enabled"
                    checked={formData.whatsapp_enabled}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-slate-300 text-[#059669] focus:ring-emerald-600"
                  />
                  <span className="text-xs text-slate-600">
                    Send me my official doctor prescription, medicine instructions, and follow-up appointment reminder via WhatsApp upon consultation completion.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/15 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting Registration to Nurse Station...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Patient Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default QrRegistrationPage;
