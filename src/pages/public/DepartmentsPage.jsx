import React, { useState, useEffect } from 'react';
import { departmentsApi } from '../../services/api.js';
import { fallbackDepartments, fallbackDoctors } from '../../data/fallbackData.js';
import {
  Activity,
  MapPin,
  Phone,
  UserCheck,
  Calendar,
  CheckCircle2,
  Building,
  ArrowRight,
  ArrowLeft,
  Filter,
  QrCode
} from 'lucide-react';

export function DepartmentsPage({
  setActivePage,
  onSelectDoctorForBooking,
  onOpenBookingModal,
  onOpenQrModal,
  initialDepartmentId = null
}) {
  const [departments, setDepartments] = useState(() => fallbackDepartments);
  const [loading, setLoading] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState(() =>
    initialDepartmentId ? initialDepartmentId.toString() : 'all'
  );
  const [highlightedId, setHighlightedId] = useState(initialDepartmentId || null);

  useEffect(() => {
    async function loadDepts() {
      try {
        const res = await departmentsApi.getAll();
        if (res.success && res.data?.length > 0) setDepartments(res.data);
      } catch (err) {
        console.error('Failed to load departments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDepts();
  }, []);

  useEffect(() => {
    if (initialDepartmentId) {
      setSelectedDeptId(initialDepartmentId.toString());
      setHighlightedId(initialDepartmentId);
      const timer = setTimeout(() => {
        const el = document.getElementById(`dept-${initialDepartmentId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      const clearPulse = setTimeout(() => setHighlightedId(null), 3500);
      return () => {
        clearTimeout(timer);
        clearTimeout(clearPulse);
      };
    }
  }, [initialDepartmentId]);

  // Ensure every department has doctors populated for specialist cards
  const enrichedDepartments = departments.map(dept => {
    if (dept.doctors && dept.doctors.length > 0) return dept;
    const matchingDocs = fallbackDoctors.filter(d => d.department_id === dept.id);
    return {
      ...dept,
      doctorsCount: matchingDocs.length || 1,
      doctors: matchingDocs.length > 0 ? matchingDocs : fallbackDoctors.slice(0, 1)
    };
  });

  const displayedDepartments = selectedDeptId === 'all'
    ? enrichedDepartments
    : enrichedDepartments.filter(d => d.id.toString() === selectedDeptId);

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#022c22] via-[#033b20] to-[#044434] text-white py-12 lg:py-14 relative">
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

          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-[#044434]/80 px-3 py-1 rounded-full border border-[#059669]/40">
              Comprehensive Medical Disciplines
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
              Specialized Clinical Departments
            </h1>
            <p className="max-w-xl mx-auto text-xs sm:text-sm text-emerald-100/90">
              Explore our specialized clinical centers of excellence, state-of-the-art diagnostic equipment, and dedicated consultant teams.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Navigation Filter Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-lg border border-slate-200/90 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => {
              setSelectedDeptId('all');
              setHighlightedId(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedDeptId === 'all'
                ? 'bg-[#059669] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Departments
          </button>
          {enrichedDepartments.map(d => {
            // Clean simple name without abbreviations or brackets
            const cleanName = d.name
              .replace('& Vascular Center', '')
              .replace('& Neurosurgery', '')
              .replace('& Joint Replacement', '')
              .replace('& Diagnostics', '')
              .replace('& Trauma Center', '')
              .replace('& Gynecology', '')
              .trim();

            return (
              <button
                key={d.id}
                onClick={() => {
                  setSelectedDeptId(d.id.toString());
                  setHighlightedId(d.id);
                  setTimeout(() => {
                    const el = document.getElementById(`dept-${d.id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 50);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedDeptId === d.id.toString()
                    ? 'bg-[#059669] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cleanName}
              </button>
            );
          })}
        </div>

        {selectedDeptId !== 'all' && (
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 px-1">
            <span>
              Showing department: <strong className="text-[#042f1a]">{displayedDepartments[0]?.name}</strong>
            </span>
            <button
              onClick={() => {
                setSelectedDeptId('all');
                setHighlightedId(null);
              }}
              className="text-[#059669] hover:text-[#047857] font-bold hover:underline cursor-pointer"
            >
              Show All Departments
            </button>
          </div>
        )}
      </section>

      {/* Departments Listing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            Loading departments...
          </div>
        ) : (
          <div className="space-y-10">
            {displayedDepartments.map((dept) => (
              <div
                key={dept.id}
                id={`dept-${dept.id}`}
                className={`bg-white rounded-3xl border overflow-hidden transition-all duration-500 grid grid-cols-1 lg:grid-cols-12 ${
                  highlightedId === dept.id
                    ? 'ring-4 ring-emerald-500 shadow-2xl scale-[1.01] border-emerald-500'
                    : 'border-slate-200 shadow-xs hover:shadow-lg'
                }`}
              >
                {/* Department Image & Key Stats */}
                <div className="lg:col-span-5 relative h-64 lg:h-auto min-h-[280px]">
                  <img
                    src={dept.image_url}
                    alt={dept.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#022c22]/80 via-transparent to-transparent lg:hidden" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white lg:hidden">
                    <span className="text-xs font-bold uppercase tracking-wider bg-[#044434]/80 px-2.5 py-1 rounded-md">
                      {dept.code}
                    </span>
                  </div>
                </div>

                {/* Department Details & Doctors */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="hidden lg:inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        Code: {dept.code}
                      </span>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                          {dept.floor_location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-[#059669]" />
                          Ext: {dept.phone_extension}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                        {dept.name}
                      </h3>
                      <p className="text-xs font-medium text-[#059669] mt-1">
                        Clinical Head: {dept.head_doctor_name || 'Senior Consultant'}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                        {dept.description}
                      </p>
                    </div>

                    {/* Department Doctors Mini-List */}
                    {dept.doctors && dept.doctors.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Available Department Specialists:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {dept.doctors.map(doc => (
                            <div
                              key={doc.id}
                              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-300 transition-colors"
                            >
                              <img
                                src={doc.avatar}
                                alt={doc.name}
                                className="w-8 h-8 rounded-full object-cover shrink-0 border border-emerald-200"
                              />
                              <div className="truncate">
                                <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{doc.specialty}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (onOpenQrModal) onOpenQrModal();
                        else setActivePage('register-qr');
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-emerald-200" />
                      Register in {dept.code} via QR
                    </button>
                    <button
                      onClick={() => setActivePage('contact')}
                      className="text-xs font-bold text-slate-600 hover:text-[#059669] transition-colors cursor-pointer"
                    >
                      Call Clinic Desk
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
