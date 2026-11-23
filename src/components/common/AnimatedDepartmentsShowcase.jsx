import React, { useState, useMemo } from 'react';
import {
  Building2,
  Stethoscope,
  Activity,
  HeartPulse,
  Sparkles,
  Search,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Award,
  Users,
  Bed,
  Layers,
  Heart,
  Eye
} from 'lucide-react';

const departmentCategories = [
  {
    id: 'centres_of_excellence',
    title: 'CENTRES OF EXCELLENCE',
    subtitle: 'Quaternary multi-disciplinary surgical & clinical institutes',
    badge: 'Quaternary Surgical Excellence',
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80',
    highlightStat: '14 Multidisciplinary Centres • 3D Robotic Precision',
    description: 'Brings together pioneering medical robotics, dedicated intensive care resuscitation, and multi-organ specialist teams for zero-compromise clinical treatment.',
    specialties: [
      { name: 'Toumai® Robotic Surgery', tag: 'Pioneering', desc: 'Sub-millimeter robotic precision' },
      { name: 'Cardiac Sciences Institute', tag: '24/7 Cath Lab', desc: 'Interventional cardiology & CABG' },
      { name: 'Neurosciences & Spine', tag: 'Stereotactic', desc: 'Acute stroke & robotic neurosurgery' },
      { name: 'Cancer Care (Oncology)', tag: 'Immunotherapy', desc: 'Precision oncology & marrow transplant' },
      { name: 'Bone, Joint & Sports', tag: 'Robotic Arthroplasty', desc: 'Joint replacement & sports rehab' },
      { name: 'Mother & Child Centre', tag: 'NICU Level-3', desc: 'High-risk obstetrics & pediatric surgery' }
    ]
  },
  {
    id: 'clinical_departments',
    title: 'CLINICAL DEPARTMENTS',
    subtitle: 'Comprehensive specialized surgical, medical & diagnostic disciplines',
    badge: '40+ Specialized Clinical Branches',
    image: '/images/slider/slide-5-robotics.png',
    highlightStat: '40+ Specialized Units • 120+ On-Duty MD Consultants',
    description: 'Expert consultant-led disciplines providing diagnosis, therapeutic interventions, advanced laparoscopy, and personalized rehabilitation.',
    specialties: [
      { name: 'Minimal Access Surgery', tag: 'Day Care', desc: 'Single-incision laparoscopy & hernia' },
      { name: 'Gastroenterology & HPB', tag: 'Endoscopic', desc: 'Advanced ERCP & hepatology unit' },
      { name: 'Nephrology & Urology', tag: 'Dialysis Ready', desc: 'Kidney transplant & laser lithotripsy' },
      { name: 'Pulmonology & Sleep', tag: 'PFT & Broncho', desc: 'Interventional chest & allergy' },
      { name: 'Endocrinology & Diabetes', tag: 'Comprehensive', desc: 'Metabolic & thyroid disorder clinic' },
      { name: 'Dermatology & Cosmetology', tag: 'Aesthetic', desc: 'Laser therapy & reconstructive derm' }
    ]
  },
  {
    id: 'support_groups',
    title: 'SUPPORT GROUPS & CRITICAL CARE',
    subtitle: '24/7 High-dependency ICU life support & rehabilitation services',
    badge: 'Round-the-Clock Critical Care',
    image: '/images/slider/slide-2-icu.png',
    highlightStat: '200+ ICU Beds • 1:1 Nurse-to-Patient Care',
    description: 'Quaternary critical care with continuous invasive telemetry, mechanical ventilation, renal dialysis support, and trauma resuscitation.',
    specialties: [
      { name: 'Level-3 Intensive Care Unit (ICU)', tag: '24/7 Intensivist', desc: 'Invasive hemodynamic telemetry' },
      { name: 'Hemodialysis & CRRT Bay', tag: 'Dialysis', desc: 'Continuous renal replacement therapy' },
      { name: 'Cardiac & Neuro Rehab', tag: 'Physiotherapy', desc: 'Robotic assisted limb mobilization' },
      { name: 'Blood Bank & Apheresis Lab', tag: 'NABH Accr.', desc: 'Component separation & stem cells' },
      { name: 'Clinical Nutrition & Dietetics', tag: 'Personalized', desc: 'Therapeutic nutritional formulation' },
      { name: 'Trauma Resuscitation Bay', tag: 'Zero-Delay', desc: 'High-speed emergency trauma triage' }
    ]
  },
  {
    id: 'executive_health',
    title: 'EXECUTIVE HEALTH CHECKUPS',
    subtitle: 'Evidence-based preventive longevity & whole-body screening suites',
    badge: 'Preventive Health & Longevity',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    highlightStat: '35+ Diagnostic Tests in 4 Hours • Same-Day Digital Reports',
    description: 'Comprehensive screening profiles combining cardiac stress diagnostics, whole-body imaging, cancer biomarkers, and lifestyle physician consultations.',
    specialties: [
      { name: 'Comprehensive Heart Check', tag: 'Cardiac CT', desc: 'Coronary calcium & Echo stress analysis' },
      { name: 'Executive Master Health Profile', tag: 'Full Body', desc: '60+ clinical biomarkers & ultrasound' },
      { name: 'Senior Citizen Longevity Track', tag: 'Geriatric', desc: 'Bone densitometry & memory baseline' },
      { name: 'Well-Woman Screening Suite', tag: 'Mammogram', desc: '3D mammography & cervical screening' },
      { name: 'Early Cancer Detection Track', tag: 'Tumor Markers', desc: 'Low-dose chest CT & molecular markers' },
      { name: 'Diabetes Comprehensive Review', tag: 'Endocrine', desc: 'HbA1c, fundus exam & neuropathy test' }
    ]
  },
  {
    id: 'outstation_clinics',
    title: 'OUTSTATION & SPECIALTY CLINICS',
    subtitle: 'Focused niche outpatient clinics for complex chronic conditions',
    badge: 'Condition-Specific Expert Centers',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    highlightStat: 'Dedicated Multi-MD Panels • Specialized OPD Rooms',
    description: 'Targeted disease clinics bringing together specialized surgeons, geneticists, therapists, and dietitians for focused chronic care.',
    specialties: [
      { name: 'Dedicated Comprehensive Breast Clinic', tag: 'Same-Day Biopsy', desc: 'Triple-assessment one-stop evaluation' },
      { name: 'Sports Medicine & Arthroscopy', tag: 'Athlete Care', desc: 'Ligament repair & motion kinematics' },
      { name: 'Pain Management & Palliative Care', tag: 'Interventional', desc: 'Radiofrequency nerve ablation' },
      { name: 'Memory & Movement Disorders', tag: 'Neuro-Geriatric', desc: 'Parkinsons & cognitive assessment' },
      { name: 'Sleep Disorders & Polysomnography', tag: 'Sleep Lab', desc: 'Overnight sleep apnea diagnostic suite' },
      { name: 'Heart Failure & LVAD Clinic', tag: 'Advanced Cardio', desc: 'Optimized heart failure therapy' }
    ]
  }
];

export function AnimatedDepartmentsShowcase({ setActivePage, onSelectDoctorForBooking }) {
  const [activeCategoryId, setActiveCategoryId] = useState('centres_of_excellence');
  const [searchTab, setSearchTab] = useState('departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const activeCategory = departmentCategories.find(c => c.id === activeCategoryId) || departmentCategories[0];

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    if (searchTab === 'departments') {
      const allDepts = [];
      departmentCategories.forEach(cat => {
        cat.specialties.forEach(spec => {
          if (spec.name.toLowerCase().includes(q) || spec.desc.toLowerCase().includes(q)) {
            allDepts.push({ ...spec, category: cat.title });
          }
        });
      });
      return allDepts.slice(0, 5);
    } else {
      const allServices = [
        { name: 'Toumai® Robotic Surgery Console', category: 'Surgical Excellence', tag: 'Surgery' },
        { name: '3T Multi-Parametric MRI & Dual Source CT', category: 'Radiology', tag: 'Diagnostics' },
        { name: 'Coronary Angioplasty & Stenting (Cath Lab)', category: 'Cardiology', tag: 'Cardiac' },
        { name: '24/7 Level-1 Emergency Trauma Dispatch', category: 'Emergency', tag: 'Critical' },
        { name: 'Automated Hemodialysis & CRRT Unit', category: 'Nephrology', tag: 'Renal' },
        { name: 'Computer-Navigated Joint Replacement', category: 'Orthopedics', tag: 'Joints' },
        { name: 'Stereotactic Neurosurgery & Spine Fusion', category: 'Neurosciences', tag: 'Spine' }
      ];
      return allServices.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)).slice(0, 5);
    }
  }, [searchQuery, searchTab]);

  return (
    <div className="relative pt-6 pb-12">
      {/* 1. Floating Interactive Search Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-30 -mb-7">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 sm:p-2.5 flex flex-col md:flex-row items-stretch gap-2 transition-all">
          {/* Dual Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0 self-center md:self-auto">
            <button
              onClick={() => {
                setSearchTab('departments');
                setSearchQuery('');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                searchTab === 'departments'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>DEPARTMENTS</span>
            </button>
            <button
              onClick={() => {
                setSearchTab('services');
                setSearchQuery('');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                searchTab === 'services'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>SERVICES</span>
            </button>
          </div>

          {/* Search Input Box */}
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
              placeholder={
                searchTab === 'departments'
                  ? 'What can we help you find? (e.g. Cardiology, Robotic, Neuro)...'
                  : 'ex. cancer trt, robotic surgery, dialysis, MRI...'
              }
              className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 text-xs px-2"
              >
                Clear
              </button>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={() => {
              if (searchQuery.trim()) {
                setActivePage('departments');
              }
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] cursor-pointer shrink-0"
          >
            <span>Search</span>
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time search suggestions dropdown */}
        {isSearchFocused && searchSuggestions.length > 0 && (
          <div className="absolute left-4 right-4 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              Matching {searchTab === 'departments' ? 'Departments & Centers' : 'Clinical Services'} ({searchSuggestions.length})
            </p>
            <div className="divide-y divide-slate-100">
              {searchSuggestions.map((item, idx) => (
                <div
                  key={idx}
                  onMouseDown={() => {
                    setActivePage('departments');
                  }}
                  className="px-3 py-2 hover:bg-sky-50 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="text-slate-400 text-[11px] ml-2">in {item.category}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-sky-600" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. "Our Departments" Section with Angled Polygon Visual */}
      <section className="bg-gradient-to-b from-slate-50 via-white to-slate-100 pt-16 pb-14 border-t border-b border-slate-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Angled Polygon Visual with Smooth Image Transitions */}
            <div className="lg:col-span-6 relative">
              <div className="relative group overflow-hidden rounded-3xl shadow-2xl bg-slate-950 border-4 border-white lg:clip-angled-right min-h-[380px] sm:min-h-[460px]">
                {departmentCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      cat.id === activeCategoryId
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-105 z-0 pointer-events-none'
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/30" />
                  </div>
                ))}

                {/* Floating Top Badge on Image */}
                <div className="absolute top-5 left-5 z-20">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-lg">
                    <Activity className="w-3.5 h-3.5 text-sky-400" />
                    <span>{activeCategory.badge}</span>
                  </div>
                </div>

                {/* Bottom Overlay Pill on Image */}
                <div className="absolute bottom-5 left-5 right-5 lg:right-12 z-20 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-100 text-slate-900 shadow-xl space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                    Live Operational Unit
                  </p>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                    {activeCategory.specialties[0].name}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    {activeCategory.highlightStat}
                  </p>
                </div>
              </div>

              {/* Decorative Subtle Background Glow */}
              <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
            </div>

            {/* Right Column: "Our Departments" Title & Category Switcher */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                  World-Class Medical Disciplines
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display mt-2">
                  <span className="text-[#a01c34]">Our</span> <span className="text-slate-800">Departments</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg">
                  Explore specialized clinical institutes, 24/7 emergency centers, and dedicated multi-disciplinary consultation clinics.
                </p>
              </div>

              {/* Vertical Category Links */}
              <div className="space-y-2">
                {departmentCategories.map((cat) => {
                  const isActive = cat.id === activeCategoryId;
                  return (
                    <div key={cat.id} className="transition-all">
                      <button
                        onClick={() => setActiveCategoryId(cat.id)}
                        onMouseEnter={() => setActiveCategoryId(cat.id)}
                        className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between border ${
                          isActive
                            ? 'bg-white border-[#a01c34]/40 shadow-md text-slate-900 translate-x-1.5'
                            : 'bg-transparent border-transparent hover:bg-white/60 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                              isActive ? 'bg-[#a01c34] scale-125' : 'bg-slate-300'
                            }`}
                          />
                          <div>
                            <span className={`text-xs sm:text-sm tracking-wider uppercase font-extrabold block ${
                              isActive ? 'text-[#a01c34]' : 'text-slate-700'
                            }`}>
                              {cat.title}
                            </span>
                            {isActive && (
                              <span className="text-[11px] text-slate-500 hidden sm:block animate-in fade-in">
                                {cat.subtitle}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${
                          isActive ? 'text-[#a01c34] translate-x-1' : 'text-slate-300'
                        }`} />
                      </button>

                      {isActive && (
                        <div className="mt-2.5 mb-2 ml-4 pl-4 border-l-2 border-[#a01c34]/30 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {cat.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {cat.specialties.map((spec, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => setActivePage('departments')}
                                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-sky-500 text-[11px] font-semibold text-slate-700 hover:text-sky-700 transition-colors shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <span>{spec.name}</span>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-sky-50 text-sky-700 font-bold">
                                  {spec.tag}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* "View All" Button */}
              <div className="pt-2">
                <button
                  onClick={() => setActivePage('departments')}
                  className="group inline-flex items-center gap-2.5 px-7 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>View All Departments</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "Our Unmatched Achievements in the Medical Field" Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <div className="bg-[#0b2838] text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-sky-900/60 relative overflow-hidden lg:clip-angled-chevron">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Banner Title */}
          <div className="text-center space-y-2 mb-8 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Accredited Clinical Excellence
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-amber-300">Unmatched Achievements</span> in the Medical Field
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Setting international clinical benchmarks across multi-organ transplants, robotic surgeries, and trauma care.
            </p>
          </div>

          {/* 5 Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-10">
            {[
              {
                number: '21,022+',
                label: 'Complex Surgeries',
                sub: 'Zero-infection protocols',
                icon: Stethoscope,
                color: 'text-amber-400'
              },
              {
                number: '3,615+',
                label: 'Robotic Procedures',
                sub: 'Sub-millimeter precision',
                icon: Sparkles,
                color: 'text-cyan-400'
              },
              {
                number: '410+',
                label: 'Specialist MDs',
                sub: 'Full-time consultant model',
                icon: Users,
                color: 'text-sky-400'
              },
              {
                number: '200+',
                label: 'Level-3 ICU Beds',
                sub: 'Continuous invasive telemetry',
                icon: Bed,
                color: 'text-rose-400'
              },
              {
                number: '99.4%',
                label: 'Clinical Satisfaction',
                sub: 'JCI Gold Seal accredited',
                icon: ShieldCheck,
                color: 'text-amber-300'
              }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-300 text-center space-y-1.5 group cursor-default"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/10 mx-auto flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display">
                    {stat.number}
                  </h4>
                  <p className="text-xs font-bold text-slate-200 leading-tight">
                    {stat.label}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {stat.sub}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick CTA bar on bottom */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300 relative z-10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              <span>Full-Time Specialist System (FTSS) ensuring 24/7 consultant availability.</span>
            </div>
            <button
              onClick={() => setActivePage('register-qr')}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <span>OPD Patient Registration</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
