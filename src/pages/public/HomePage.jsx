import React, { useEffect, useState } from 'react';
import { departmentsApi, doctorsApi } from '../../services/api.js';
import { fallbackDepartments, fallbackDoctors } from '../../data/fallbackData.js';
import {
  Calendar,
  PhoneCall,
  ShieldCheck,
  Award,
  HeartPulse,
  Clock,
  ArrowRight,
  Star,
  Users,
  CheckCircle2,
  Stethoscope,
  Activity,
  Sparkles,
  MapPin,
  Pause,
  Play,
  Building2,
  Eye,
  QrCode
} from 'lucide-react';

const hospitalFacilitySlides = [
  {
    id: 1,
    image: '/images/slider/slide-1-ward.jpg',
    title: 'Modern Inpatient Wards & Continuous Clinical Monitoring',
    category: 'Inpatient Care',
    department: 'General & Recovery Wards',
    description: 'Spacious patient recovery suites equipped with continuous telemetry vitals monitors, motorized ergonomic beds, and 24/7 dedicated nursing staff.',
    badge: 'Inpatient & Nursing Care',
    rating: '4.98',
    stats: '150+ Inpatient Beds • 24/7 Continuous Telemetry'
  },
  {
    id: 2,
    image: '/images/slider/slide-2-icu.jpg',
    title: 'Advanced Intensive Care Unit (ICU) & Critical Resuscitation',
    category: 'Critical Care',
    department: 'Intensive Care Unit (ICU)',
    description: 'Quaternary critical care infrastructure with real-time invasive hemodynamic monitoring, advanced mechanical ventilators, and round-the-clock intensivist coverage.',
    badge: 'Level-3 ICU',
    rating: '5.0',
    stats: '1:1 Nurse-to-Patient Ratio • Life Support Ready'
  },
  {
    id: 3,
    image: '/images/slider/slide-3-trauma.jpg',
    title: '24/7 Rapid Emergency Trauma Stretcher & Resuscitation Bay',
    category: 'Emergency & Trauma',
    department: 'Emergency & Trauma Bay',
    description: 'High-speed emergency triage bay designed for immediate patient intake, rapid defibrillation, trauma imaging, and zero-delay critical stabilization.',
    badge: '24/7 Emergency Trauma',
    rating: '4.99',
    stats: '< 5 Mins Triage Response • 24/7 On-Duty Trauma MDs'
  },
  {
    id: 4,
    image: '/images/operation-theater-live.png',
    title: 'Advanced Surgical Suites & Multidisciplinary Operating Theaters',
    category: 'Surgical Care',
    department: 'Laminar Airflow Surgery Theaters',
    description: 'Ultra-sterile positive-pressure surgical suites equipped with real-time fluoroscopic imaging, intraoperative telemetry, and board-certified surgeons.',
    badge: 'Advanced Surgical Suites',
    rating: '5.0',
    stats: '18 Modular OTs • 24/7 Emergency Surgery'
  },
  {
    id: 5,
    image: '/images/slider/slide-5-robotics.jpg',
    title: 'Advanced Robotic Surgery Centre & Modern Operating Theaters',
    category: 'Surgical Excellence',
    department: 'Robotic Surgery Centre',
    description: 'State-of-the-art robotic surgical console with 3D high-definition visualization, sub-millimeter instrument control, and laminar air-flow surgical suites.',
    badge: 'Robotic Surgery',
    rating: '4.97',
    stats: 'Sub-millimeter Precision • Rapid Post-Op Recovery'
  }
];

const departmentShowcaseSlides = [
  {
    id: 'coe',
    title: 'Centres of Excellence',
    label: 'CENTRES OF EXCELLENCE',
    highlight: 'Cardiology, Robotic Surgery & Neurosurgery Institutes',
    image: '/images/slider/slide-5-robotics.png',
    description: 'Pioneering surgical precision with state-of-the-art laminar air-flow operating suites, 3D robotic consoles, and board-certified quaternary surgical leaders.',
    items: ['Robotic Neurosurgery', 'Cardiothoracic Surgery', 'Organ Transplantation', 'Precision Oncology', 'Vascular & Endovascular Care']
  },
  {
    id: 'clinical',
    title: 'Clinical Departments',
    label: 'CLINICAL DEPARTMENTS',
    highlight: 'Comprehensive Multidisciplinary Inpatient & Outpatient Care',
    image: '/images/operation-theater-live.png',
    description: 'Round-the-clock intensive clinical coverage across 40+ specialized medical disciplines with seamless digital diagnostic integration.',
    items: ['Internal & Critical Care Medicine', 'Pediatrics & Neonatal ICU', 'Orthopedics & Joint Reconstruction', 'Pulmonology & Respiratory Care', 'Gastroenterology']
  },
  {
    id: 'support',
    title: 'Support Groups',
    label: 'SUPPORT GROUPS',
    highlight: 'Patient Rehabilitation, Psychological Counseling & Survivorship',
    image: '/images/slider/slide-1-ward.png',
    description: 'Compassionate rehabilitation programs, physical physiotherapy, clinical nutrition counseling, and specialized survivor community care circles.',
    items: ['Cardiac Rehabilitation Program', 'Stroke Recovery & Neuro Rehab', 'Oncology Care & Survivorship Circle', 'Diabetes Wellness Group', 'Palliative Support']
  },
  {
    id: 'health_checks',
    title: 'Executive Health Checkups',
    label: 'EXECUTIVE HEALTH CHECKUPS',
    highlight: 'Comprehensive Preventive Health Screening & Full-Body Diagnostics',
    image: '/images/slider/slide-2-icu.png',
    description: 'Advanced early-detection clinical profiling with cutting-edge 128-slice CT, high-field MRI, same-day digital pathology reports, and physician consultations.',
    items: ['Platinum Executive Health Check', 'Comprehensive Cardiac Risk Profile', 'Senior Citizen Longevity Package', 'Women Comprehensive Wellness', 'Pre-Employment Health Screening']
  },
  {
    id: 'outstation',
    title: 'Outstation Clinics',
    label: 'OUTSTATION CLINICS',
    highlight: 'Regional Consultation Hubs & Real-Time Tele-Medicine Network',
    image: '/images/slider/slide-4-pediatric.png',
    description: 'Connecting patients across regions with premier quaternary medical specialists via satellite diagnostic nodes and high-definition virtual OPDs.',
    items: ['Regional Tele-Cardiology OPD', 'Satellite Diagnostic & Blood Collection Nodes', 'Rural Emergency Medical Vans', 'International Second Opinion Desk', 'Home Care Services']
  }
];

export function HomePage({ setActivePage, onSelectDoctorForBooking, onOpenBookingModal, onSelectDepartment, onOpenQrModal }) {
  const [departments, setDepartments] = useState(() => fallbackDepartments.slice(0, 6));
  const [doctors, setDoctors] = useState(() => fallbackDoctors.slice(0, 4));
  const [loading, setLoading] = useState(false);

  // Slideshow state for one-by-one image transitions
  const [currentSlide, setCurrentSlide] = useState(0);

  // Department Showcase smooth loop state (exact reference design)
  const [activeDeptSlide, setActiveDeptSlide] = useState(0);
  const [isDeptAutoPlay, setIsDeptAutoPlay] = useState(true);

  // Continuous smooth auto-slide every 2 seconds without pause
  useEffect(() => {
    hospitalFacilitySlides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % hospitalFacilitySlides.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Smooth infinite loop for Departments showcase (auto switches every 2 seconds)
  useEffect(() => {
    if (!isDeptAutoPlay) return;
    const deptTimer = setInterval(() => {
      setActiveDeptSlide((prev) => (prev + 1) % departmentShowcaseSlides.length);
    }, 2000);
    return () => clearInterval(deptTimer);
  }, [isDeptAutoPlay]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % hospitalFacilitySlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + hospitalFacilitySlides.length) % hospitalFacilitySlides.length);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [deptRes, docRes] = await Promise.all([
          departmentsApi.getAll(),
          doctorsApi.getAll()
        ]);
        if (deptRes.success) setDepartments(deptRes.data.slice(0, 6));
        if (docRes.success) setDoctors(docRes.data.slice(0, 4));
      } catch (err) {
        console.error('Home data load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-10 sm:space-y-12 pb-16">
      {/* 1. FULL SCREEN HERO IMAGE SLIDER WITH CONTINUOUS 2-SECOND AUTO-SCROLL (MEDICAL GREEN & MINT THEME) */}
      <section 
        className="relative overflow-hidden w-full min-h-[580px] lg:min-h-[660px] text-white flex flex-col justify-between pt-8 pb-16 lg:pt-10 lg:pb-20"
      >
        {/* Full Screen Background Slider Images with Smooth Crossfade & Continuous Auto-scroll One by One */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {hospitalFacilitySlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center bg-slate-950 overflow-hidden ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center brightness-105 contrast-105"
              />
            </div>
          ))}

          {/* Ambient Lighting Orbs in Emerald */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none z-10" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none z-10" />

          {/* Balanced overlay allowing the background image to show with high opacity and clear visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/40 z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-radial from-black/10 via-transparent to-black/35 z-10 pointer-events-none" />
        </div>

        {/* Top Header Row on Image: Badges Centered */}
        <div className="max-w-5xl mx-auto px-4 relative z-20 w-full flex items-center justify-center gap-2.5 flex-wrap pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#022c22]/90 border border-emerald-500/50 text-xs font-semibold text-emerald-200 backdrop-blur-md shadow-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>JCI Gold Seal & NABH Certified Quaternary Medical Center</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/65 border border-emerald-400/30 text-xs font-bold text-emerald-300 backdrop-blur-md shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{hospitalFacilitySlides[currentSlide]?.badge || 'Level-3 Healthcare'}</span>
          </div>
        </div>

        {/* Center Main Content: Completely Centered & Highly Visible */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-20 w-full my-auto py-8 text-center flex flex-col items-center justify-center">
          <div className="max-w-3xl space-y-6 text-center flex flex-col items-center">
            {/* Headline - Centered with deep drop shadow */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.14] font-display text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] text-center">
              Advanced Medicine, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 drop-shadow-[0_4px_14px_rgba(0,0,0,0.9)]">
                Compassionate Care
              </span>
            </h1>

            {/* Subtitle - Centered & Highly Legible */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-100 max-w-2xl leading-relaxed text-center mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] font-medium">
              MedicalCare combines pioneering robotic surgical precision, multidisciplinary clinical institutes, and 24/7 dedicated trauma care to protect every patient's life and health.
            </p>

            {/* Quick Actions & KPIs - Centered Layout */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full">
              {/* Stats Counter Box */}
              <div className="flex items-center justify-center gap-6 bg-black/60 border border-emerald-500/30 px-6 py-3 rounded-2xl backdrop-blur-md shadow-2xl">
                <div className="text-center">
                  <h4 className="text-xl sm:text-2xl font-extrabold text-white">50k+</h4>
                  <p className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold">Treated</p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-center">
                  <h4 className="text-xl sm:text-2xl font-extrabold text-white">120+</h4>
                  <p className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">Specialists</p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-center">
                  <h4 className="text-xl sm:text-2xl font-extrabold text-white">99.4%</h4>
                  <p className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">Satisfaction</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    if (onOpenQrModal) onOpenQrModal();
                    else setActivePage('register-qr');
                  }}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-700 hover:to-green-800 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/40 transition-all hover:scale-[1.03] cursor-pointer"
                >
                  <QrCode className="w-5 h-5 text-emerald-100" />
                  <span>Scan QR Code – Patient Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Flowing Emerald Waves at Bottom of Hero Section */}
        <div className="absolute -bottom-[1px] left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none">
          <svg
            className="relative block w-full h-12 sm:h-16 md:h-20 lg:h-24 align-bottom"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            {/* Back light emerald wave */}
            <path
              d="M0,40 C320,15 420,15 720,45 C1020,75 1140,20 1440,35 L1440,121 L0,121 Z"
              fill="#10b981"
              fillOpacity="0.45"
            />
            {/* Middle rich green wave */}
            <path
              d="M0,60 C360,35 480,35 760,65 C1040,95 1200,40 1440,55 L1440,121 L0,121 Z"
              fill="#059669"
              fillOpacity="0.7"
            />
            {/* Foreground crisp wave matching bg-slate-50 */}
            <path
              d="M0,80 C380,55 540,60 820,85 C1100,110 1260,60 1440,75 L1440,121 L0,121 Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </section>

      {/* 2. "Our Departments" Featured Showcase with Smooth Infinite Loop (Compact Screen-Fit Height) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="relative bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden"
          onMouseEnter={() => setIsDeptAutoPlay(false)}
          onMouseLeave={() => setIsDeptAutoPlay(true)}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-fit">
            {/* Left Column: Hospital Imagery */}
            <div className="lg:col-span-5 relative bg-slate-950 overflow-hidden min-h-[220px] sm:min-h-[260px] lg:min-h-0 lg:h-full">
              {departmentShowcaseSlides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    idx === activeDeptSlide 
                      ? 'opacity-100 z-10 scale-100' 
                      : 'opacity-0 z-0 pointer-events-none scale-105'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-black/25 to-transparent" />
                </div>
              ))}

              {/* Bottom Image Tag */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white z-20">
                <span className="px-3 py-1 rounded-lg bg-[#032e1d]/90 text-[11px] font-bold backdrop-blur-md shadow-md border border-emerald-500/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {departmentShowcaseSlides[activeDeptSlide]?.title || 'Clinical Excellence'}
                </span>
                <span className="font-mono text-emerald-300 font-bold bg-black/75 px-2.5 py-1 rounded-lg text-[11px] border border-white/10 backdrop-blur-md">
                  0{activeDeptSlide + 1} / 0{departmentShowcaseSlides.length}
                </span>
              </div>
            </div>

            {/* Right Column: Clean Department Categories with Emerald Theme */}
            <div className="lg:col-span-7 p-4 sm:p-5 lg:p-6 flex flex-col justify-between space-y-3 bg-white z-20">
              <div>
                {/* Heading */}
                <div className="mb-2.5">
                  <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Specialized Care Centers
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display mt-1">
                    Our <span className="text-[#059669]">Departments & Specialties</span>
                  </h2>
                  <div className="w-14 h-1 bg-gradient-to-r from-[#059669] via-emerald-400 to-green-600 mt-1.5 rounded-full" />
                </div>

                {/* 5 Department Categories Navigation */}
                <div className="space-y-1 mb-2.5">
                  {departmentShowcaseSlides.map((item, idx) => {
                    const isActive = idx === activeDeptSlide;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveDeptSlide(idx);
                          setIsDeptAutoPlay(false);
                        }}
                        className={`w-full text-left flex items-center justify-between py-1.5 px-3 rounded-lg transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-[#059669] text-white font-bold shadow-xs'
                            : 'text-slate-600 hover:text-[#059669] hover:bg-emerald-50/60 font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              isActive ? 'bg-emerald-200 scale-125' : 'bg-slate-300'
                            }`}
                          />
                          <span className="text-[11px] uppercase tracking-wider">
                            {item.label}
                          </span>
                        </div>
                        {isActive && (
                          <span className="text-[9px] font-bold text-emerald-950 bg-emerald-200 px-1.5 py-0.2 rounded shadow-2xs">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Information Display Box */}
                <div
                  key={`dept-info-loop-${activeDeptSlide}`}
                  className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 border border-emerald-100 shadow-2xs space-y-2 animate-in fade-in duration-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                      {departmentShowcaseSlides[activeDeptSlide]?.title || 'Department Center'}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.2 rounded border border-emerald-200">
                      {departmentShowcaseSlides[activeDeptSlide]?.highlight || 'Multidisciplinary Care'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                    {departmentShowcaseSlides[activeDeptSlide]?.description || 'Comprehensive clinical care with cutting-edge medical infrastructure.'}
                  </p>

                  <div className="pt-1.5 border-t border-emerald-100/80">
                    <div className="flex flex-wrap gap-1">
                      {(departmentShowcaseSlides[activeDeptSlide]?.items || []).map((subItem, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded bg-white text-[#042f1a] border border-emerald-200/80 shadow-2xs"
                        >
                          ✦ {subItem}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* View All Button & Loop Status Controls */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setActivePage('departments')}
                  className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-[11px] uppercase tracking-wider shadow-sm hover:shadow transition-all rounded-lg cursor-pointer flex items-center gap-1.5 hover:scale-[1.01]"
                >
                  <span>View All Departments</span>
                  <ArrowRight className="w-3 h-3 text-white" />
                </button>

                {/* Looper indicator dots & controls */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    {departmentShowcaseSlides.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => {
                          setActiveDeptSlide(dotIdx);
                          setIsDeptAutoPlay(false);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          dotIdx === activeDeptSlide
                            ? 'w-5 bg-[#059669]'
                            : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                        }`}
                        title={`Slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setIsDeptAutoPlay(!isDeptAutoPlay)}
                    className="ml-1 text-[10px] font-mono font-bold text-slate-400 hover:text-emerald-700 cursor-pointer"
                  >
                    {isDeptAutoPlay ? 'Auto' : 'Paused'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Specialty Directory Cards Grid */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div
              onClick={() => {
                if (onSelectDepartment) onSelectDepartment(null);
                else setActivePage('departments');
              }}
              className="cursor-pointer group inline-block"
              title="Click to view all specialized medical departments"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                Specialties Directory
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display mt-2 group-hover:text-[#059669] flex items-center gap-2 transition-colors">
                <span>All Specialized Medical Departments</span>
                <ArrowRight className="w-5 h-5 text-[#059669] opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all" />
              </h3>
            </div>
            <button
              onClick={() => {
                if (onSelectDepartment) onSelectDepartment(null);
                else setActivePage('departments');
              }}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer transition-all"
            >
              <span>Explore All Institutes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map(dept => (
              <div
                key={dept.id}
                onClick={() => {
                  if (onSelectDepartment) onSelectDepartment(dept.id);
                  else setActivePage('departments');
                }}
                className="group bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {dept.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1.5 group-hover:text-[#059669] transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {dept.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#059669]">
                  <span>{dept.doctorsCount || 2} Specialists Available</span>
                  <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Senior Medical Specialists */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Medical Leadership
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                Distinguished Specialists
              </h2>
              <p className="text-sm text-slate-600">
                Board-certified physicians, surgeon leaders, and fellowship-trained medical experts.
              </p>
            </div>
            <button
              onClick={() => setActivePage('doctors')}
              className="inline-flex items-center gap-1 text-sm font-bold text-[#059669] hover:underline"
            >
              Browse Full Doctor Directory <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map(doctor => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-64 sm:h-60 bg-slate-100 overflow-hidden">
                    <img
                      src={doctor.avatar || `/images/doctors/doctor-${doctor.id || 1}.jpg`}
                      alt={doctor.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `/images/doctors/doctor-${doctor.id || 1}.jpg`;
                      }}
                      className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-xs font-bold text-amber-600 shadow-xs flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{doctor.rating || 4.9}</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-bold text-slate-900">{doctor.name}</h3>
                    <p className="text-xs font-semibold text-emerald-800 mt-0.5">{doctor.specialty}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{doctor.qualifications}</p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{doctor.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose ApexCare (Quality & Facilities) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Why MedicalCare Healthcare
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Uncompromising Standards in Patient Safety & Clinical Outcomes
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every detail of our hospital infrastructure is engineered for rapid healing, zero hospital-acquired infection tolerance, and maximum comfort for patients and families.
            </p>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 text-sm">Robotic-Assisted Surgical Theaters:</strong>
                  <p className="text-slate-500 mt-0.5">MAKO and DaVinci surgical platforms for minimal incision, less pain, and accelerated hospital discharge.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 text-sm">Automated Digital Diagnostic Lab & Imaging:</strong>
                  <p className="text-slate-500 mt-0.5">AI-assisted 3T MRI, dual-energy CT scanners, and 2-hour turnaround on critical blood diagnostics.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 text-sm">Transparent Inpatient & Day-Care Billing:</strong>
                  <p className="text-slate-500 mt-0.5">No hidden charges. Complete cashless insurance desk with instant pre-authorization approvals.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActivePage('about')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#042f1a] hover:bg-[#064e3b] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Learn More About Our Accreditations <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80"
              alt="Medical equipment"
              className="rounded-2xl shadow-md w-full h-64 object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80"
              alt="Hospital ward"
              className="rounded-2xl shadow-md w-full h-64 object-cover mt-6"
            />
          </div>
        </div>
      </section>

      {/* 6. Patient Testimonials */}
      <section className="bg-[#032e1d] text-white py-16 border-t border-[#05422a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Real Patient Stories
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight font-display">
              Trusted by Thousands of Recovered Patients
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "The cardiology team under Dr. Hayes saved my life during an acute coronary event. The ICU staff was exceptionally attentive and empathetic throughout my recovery.",
                author: "Robert Kowalski",
                role: "Cardiac Bypass Patient",
                rating: 5
              },
              {
                quote: "Underwent robotic knee replacement with Dr. Alva. I was walking without support within 48 hours! The private room felt like a luxury hotel with 5-star clinical nursing.",
                author: "Marianne Vance",
                role: "Orthopedic Surgery Patient",
                rating: 5
              },
              {
                quote: "The seamless online booking and digital patient portal made tracking my lab results and invoices effortless. ApexCare sets the benchmark for modern healthcare.",
                author: "Michael Chang",
                role: "Executive Health Patient",
                rating: 5
              }
            ].map((testi, i) => (
              <div key={i} className="bg-[#043d26]/80 border border-[#065f46] p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(testi.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-emerald-100 leading-relaxed italic">
                    "{testi.quote}"
                  </p>
                </div>
                <div className="pt-3 border-t border-[#065f46]">
                  <p className="text-xs font-bold text-white">{testi.author}</p>
                  <p className="text-[11px] text-emerald-300">{testi.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
