import React from 'react';
import {
  ShieldCheck,
  Award,
  Building,
  Heart,
  Users,
  Compass,
  Cpu,
  Target,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export function AboutPage({ setActivePage }) {
  const leadership = [
    {
      name: "Dr. Marcus Vance, MD, FACS",
      title: "Chief Medical Officer & Chairman",
      degrees: "Harvard Medical School, Board Certified General & Thoracic Surgery",
      bio: "Over 25 years of medical administration leadership, pioneering surgical quality frameworks, and clinical research.",
      image: "/images/doctors/doctor-2.jpg"
    },
    {
      name: "Dr. Neha Kapoor, MD, DVD",
      title: "Head of Clinical Dermatology & Laser Surgery",
      degrees: "PGI Chandigarh, Fellowship in Pediatric Dermatology",
      bio: "Internationally published clinical investigator and specialist in clinical dermatology, laser aesthetics, and advanced patient care.",
      image: "/images/doctors/doctor-1.jpg"
    },
    {
      name: "David H. Sterling, MHA",
      title: "Chief Executive Officer",
      degrees: "Master in Health Administration, Cornell University",
      bio: "Dedicated healthcare operations executive championing patient-first digital systems and clinical infrastructure.",
      image: "/images/doctors/doctor-5.jpg"
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-r from-[#022c22] via-[#033b20] to-[#044434] text-white py-12 lg:py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={() => setActivePage('home')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white text-xs font-bold backdrop-blur-md border border-white/15 transition-all hover:-translate-x-1 cursor-pointer shadow-sm group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </button>
          </div>

          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-[#044434]/80 px-3.5 py-1 rounded-full border border-[#059669]/40">
              About MedicalCare Hospital & Research Institute
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display">
              A Legacy of Compassion, Innovation & Clinical Excellence
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              Founded with the fundamental belief that world-class healthcare should be compassionate, technologically superior, and accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Mission, Vision, and Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group relative bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs space-y-4 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-900/10 hover:border-[#059669] overflow-hidden cursor-pointer">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#059669] group-hover:text-white shadow-xs">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">Our Mission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To deliver patient-centered healthcare of international standards through advanced medical science, compassionate human care, continuous clinical research, and medical education.
            </p>
          </div>

          <div className="group relative bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs space-y-4 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-900/10 hover:border-amber-500 overflow-hidden cursor-pointer">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white shadow-xs">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-slate-950 transition-colors">Our Vision</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To be the most trusted quaternary healthcare institution, recognized globally for groundbreaking clinical outcomes, innovative therapies, and zero-compromise patient safety.
            </p>
          </div>

          <div className="group relative bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs space-y-4 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-900/10 hover:border-[#059669] overflow-hidden cursor-pointer">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#059669] group-hover:text-white shadow-xs">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">Our Core Values</h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li><strong>Integrity:</strong> Unwavering ethical clinical standards and medical transparency.</li>
              <li><strong>Compassion:</strong> Empathy, dignity, and respect for every patient and family.</li>
              <li><strong>Excellence:</strong> Continuous peer-reviewed clinical quality improvement.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. International Accreditations */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Certified Quality Benchmarks
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-display">
              Accredited by Global Medical Authorities
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Joint Commission International (JCI)",
                desc: "Highest international benchmark for healthcare safety, medication protocols, and clinical standards.",
                badge: "Gold Seal of Approval"
              },
              {
                title: "NABH Hospital Accreditation",
                desc: "Certified for hospital infrastructure, patient rights, infection prevention, and diagnostic reliability.",
                badge: "National Excellence"
              },
              {
                title: "CAP Laboratory Accreditation",
                desc: "College of American Pathologists certified laboratory for diagnostic testing precision.",
                badge: "High-Complexity Diagnostic"
              },
              {
                title: "ISO 9001:2015 Healthcare",
                desc: "Quality management systems in inpatient, outpatient, and critical intensive care services.",
                badge: "Certified Systems"
              }
            ].map((acc, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 120}ms` }}
                className="group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-900/10 hover:border-[#059669] cursor-pointer overflow-hidden animate-fade-in-up"
              >
                {/* Top Glowing Emerald Accent Line that reveals on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center transition-all duration-300 group-hover:bg-[#059669] group-hover:scale-110 group-hover:rotate-6 shadow-xs">
                    <ShieldCheck className="w-6 h-6 text-[#059669] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 transition-all duration-300 group-hover:bg-amber-100 group-hover:border-amber-300 group-hover:scale-105">
                    {acc.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-950 transition-colors duration-200">
                  {acc.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors duration-200">
                  {acc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Infrastructure & Technology Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              State-of-the-Art Hospital Campus
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-display">
              Smart Healthcare Facilities Designed for Comfort and Healing
            </h2>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Our 500-bed multi-specialty campus features dedicated sterile negative-pressure isolation suites, specialized robotic surgery suites, hybrid cardiovascular catheterization laboratories, and smart touchless inpatient rooms.
              </p>
              <p>
                All hospital beds are equipped with continuous hemodynamic telemetry sensors, alerting the central nursing station immediately to any change in patient vital signs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <h5 className="text-xl font-extrabold text-[#042f1a]">500+</h5>
                <p className="text-xs text-slate-600">Total Inpatient Beds</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <h5 className="text-xl font-extrabold text-[#042f1a]">18</h5>
                <p className="text-xs text-slate-600">Modular Surgical Theaters</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <img
              src="/images/slider/slide-1-ward.png"
              alt="Hospital campus"
              className="rounded-2xl shadow-md w-full h-56 object-cover"
            />
            <img
              src="/images/slider/slide-5-robotics.png"
              alt="Hospital surgical facility"
              className="rounded-2xl shadow-md w-full h-56 object-cover mt-4 sm:mt-8"
            />
          </div>
        </div>
      </section>

      {/* 5. Medical Advisory & Executive Board */}
      <section className="bg-slate-100/70 py-16 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Executive Leadership
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-display">
              Hospital Executive & Medical Board
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadership.map((leader, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-emerald-300 cursor-pointer"
              >
                <div className="overflow-hidden">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/doctors/doctor-1.jpg';
                    }}
                    className="w-full h-64 object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 space-y-2">
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-[#059669] transition-colors">{leader.name}</h4>
                  <p className="text-xs font-semibold text-[#059669]">{leader.title}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{leader.degrees}</p>
                  <p className="text-xs text-slate-500 pt-2 leading-relaxed">{leader.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
