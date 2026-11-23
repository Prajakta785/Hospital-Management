import React, { useState, useEffect } from 'react';
import { doctorsApi, departmentsApi } from '../../services/api.js';
import { fallbackDoctors, fallbackDepartments } from '../../data/fallbackData.js';
import {
  Search,
  Calendar,
  Clock,
  Star,
  Briefcase,
  MapPin,
  CheckCircle2,
  Filter,
  ArrowLeft,
  QrCode
} from 'lucide-react';

export function DoctorsPage({ setActivePage, onOpenQrModal }) {
  const [doctors, setDoctors] = useState(() => fallbackDoctors);
  const [departments, setDepartments] = useState(() => fallbackDepartments);
  const [selectedDeptId, setSelectedDeptId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [docRes, deptRes] = await Promise.all([
          doctorsApi.getAll(),
          departmentsApi.getAll()
        ]);
        if (docRes.success) setDoctors(docRes.data);
        if (deptRes.success) setDepartments(deptRes.data);
      } catch (err) {
        console.error('Failed to load doctors:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    const matchesDept = selectedDeptId === 'all' || doc.department_id === parseInt(selectedDeptId, 10);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      doc.name.toLowerCase().includes(q) ||
      doc.specialty.toLowerCase().includes(q) ||
      doc.qualifications.toLowerCase().includes(q);
    return matchesDept && matchesSearch;
  });

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
              Medical Faculty & Consultants
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
              Find Your Specialist Doctor
            </h1>
            <p className="max-w-xl mx-auto text-xs sm:text-sm text-emerald-100/90">
              Consult directly with our board-certified medical leaders, senior surgeons, and clinical professors.
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search physician by name, specialty, or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#059669] focus:border-transparent"
              />
            </div>

            <p className="text-xs font-medium text-slate-500">
              Showing <strong className="text-slate-900">{filteredDoctors.length}</strong> available physicians
            </p>
          </div>

          {/* Department Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedDeptId('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDeptId === 'all'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Specialties
            </button>
            {departments.map(dept => (
              <button
                key={dept.id}
                onClick={() => setSelectedDeptId(dept.id.toString())}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedDeptId === dept.id.toString()
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            Loading physician directory...
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <p className="text-sm font-semibold text-slate-700">No physicians found matching your search.</p>
            <button
              onClick={() => { setSelectedDeptId('all'); setSearchQuery(''); }}
              className="text-xs font-bold text-[#059669] underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doctor => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                {/* Doctor Header & Photo */}
                <div className="p-6 pb-4">
                  <div className="flex gap-4 items-start">
                    <img
                      src={doctor.avatar || `/images/doctors/doctor-${doctor.id || 1}.jpg`}
                      alt={doctor.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `/images/doctors/doctor-${doctor.id || 1}.jpg`;
                      }}
                      className="w-20 h-20 rounded-2xl object-cover object-top border-2 border-emerald-100 shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {doctor.departmentName}
                        </span>
                        <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{doctor.rating || 4.9}</span>
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1 truncate">{doctor.name}</h3>
                      <p className="text-xs font-semibold text-[#059669]">{doctor.specialty}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{doctor.qualifications}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-3.5 line-clamp-2 leading-relaxed">
                    {doctor.bio}
                  </p>

                  {/* Badges / Specs */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{doctor.experience_years || 10}+ Yrs Experience</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{doctor.room_number || 'OPD Suite'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Days: {doctor.available_days}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (onOpenQrModal) onOpenQrModal();
                      else setActivePage('register-qr');
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-200" />
                    Patient Intake &amp; QR Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
