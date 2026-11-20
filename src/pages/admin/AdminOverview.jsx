import React, { useState, useEffect } from 'react';
import { reportsApi, appointmentsApi, bedsApi, doctorsApi, staffApi, departmentsApi } from '../../services/api.js';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import {
  Users,
  UserCheck,
  CalendarDays,
  Bed,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Building2,
  UsersRound,
  Stethoscope,
  ReceiptIndianRupee,
  HeartPulse,
  Sparkles,
  Layers,
  FileText,
  Microscope
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const IndianRupeeIcon = ({ className = 'w-5 h-5' }) => (
  <span className={`font-mono font-extrabold text-base leading-none inline-flex items-center justify-center ${className}`}>
    ₹
  </span>
);

export function AdminOverview({ setActivePage }) {
  const [data, setData] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

  const loadOverview = async () => {
    try {
      setRefreshing(true);
      const [repRes, aptRes] = await Promise.all([
        reportsApi.getAnalytics(),
        appointmentsApi.getAll()
      ]);
      if (repRes.success) setData(repRes);
      if (aptRes.success) setRecentAppointments(aptRes.data.slice(0, 6));
      setLastSynced(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const kpis = data?.kpis || {};
  const todayOverview = data?.todayOverview || {};
  const charts = data?.charts || {};
  const departmentAnalytics = data?.departmentAnalytics || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Alert / Super Admin System Status with Pulse Ping Animation */}
      <div className="animate-fade-in-up delay-50 flex flex-col md:flex-row md:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#071933] via-[#092244] to-[#041022] text-white shadow-md border border-[#0d2a4f] gap-3">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
          <div className="relative flex h-3 w-3 shrink-0 mt-0.5 sm:mt-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-400 shadow-xs shadow-sky-400/50" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide uppercase font-display">
                SUPER ADMIN CENTRAL CONTROL • LEVEL-1 EMERGENCY
              </span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold font-mono">
                Live DB Synced: {lastSynced}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-sky-200/80 mt-0.5 leading-snug">
              Complete Hospital Overview: All Doctors, Staff, Patients, Beds &amp; Operations controlled from this single panel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-0.5 sm:pt-0">
          <button
            onClick={() => setActivePage('admin_departments')}
            className="flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-xl bg-[#0b2447]/80 hover:bg-[#0284c7] text-sky-100 text-xs font-bold border border-sky-700/80 transition-all cursor-pointer"
          >
            Departments
          </button>
          <button
            onClick={() => setActivePage('admin_appointments')}
            className="flex-1 sm:flex-initial text-center px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#071933] text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Appointments
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - 4, 4 Boxes Layout (4 boxes in Row 1, 4 boxes in Row 2) */}
      <div className="animate-fade-in-up delay-100 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-4.5">
        {/* ROW 1: 4 BOXES */}
        {/* 1. Total Doctors */}
        <StatCard
          title="Total Doctors"
          shortTitle="Doctors"
          value={kpis.totalDoctors || 10}
          icon={Stethoscope}
          change={`${kpis.activeDoctors || 6} on duty`}
          subtitle="All Specialties"
          color="blue"
        />

        {/* 2. Total Staff */}
        <StatCard
          title="Total Staff"
          shortTitle="Staff"
          value={kpis.totalStaff || 8}
          icon={UsersRound}
          change={`${todayOverview.staffPresentCount || 7} present`}
          subtitle="Nursing & Admin"
          color="blue"
        />

        {/* 3. Total Patients */}
        <StatCard
          title="Total Patients"
          shortTitle="Patients"
          value={kpis.totalPatients || 16}
          icon={Users}
          change="+18%"
          trend="up"
          subtitle="Registered EHR"
          color="blue"
        />

        {/* 4. Total Appointments */}
        <StatCard
          title="Appointments"
          shortTitle="Appts"
          value={kpis.totalAppointments || 20}
          icon={CalendarDays}
          change={`${kpis.todayAppointmentsCount || 2} today`}
          subtitle="Scheduled visits"
          color="amber"
        />

        {/* ROW 2: 4 BOXES */}
        {/* 5. Total Departments */}
        <StatCard
          title="Departments"
          shortTitle="Depts"
          value={kpis.totalDepartments || 8}
          icon={Building2}
          change="All Active"
          subtitle="Clinical Centers"
          color="purple"
        />

        {/* 6. Available Beds */}
        <StatCard
          title="Available Beds"
          shortTitle="Beds"
          value={kpis.availableBeds !== undefined ? kpis.availableBeds : 19}
          icon={Bed}
          change={`${kpis.occupiedBeds || 7} busy (${kpis.bedOccupancyRate || 27}%)`}
          subtitle={`${kpis.totalBeds || 26} total triage beds`}
          color="blue"
        />

        {/* 7. Laboratory Diagnostics */}
        <StatCard
          title="Lab Diagnostics"
          shortTitle="Lab Tests"
          value={kpis.labTestsCount || 12}
          icon={Microscope}
          change="All Normal"
          subtitle="Diagnostic Pathology"
          color="blue"
        />

        {/* 8. Total Hospital Revenue */}
        <StatCard
          title="Total Revenue"
          shortTitle="Revenue"
          value={`₹${(kpis.totalRevenue || 42437).toLocaleString()}`}
          icon={IndianRupeeIcon}
          change="+24.5%"
          trend="up"
          subtitle="Collected receipts"
          color="blue"
        />
      </div>

      {/* Today's Hospital Real-Time Overview Banner Strip */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 border-b border-slate-100 pb-2.5 sm:pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] animate-pulse shrink-0" />
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider font-display">
              Today's Hospital Overview &amp; Real-Time Operational Statistics
            </h3>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 sm:py-1 rounded-lg self-start sm:self-auto">
            Date: {new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100">
            <span className="text-[10px] font-bold uppercase text-[#0284c7] tracking-wider block">Today's Consultations</span>
            <span className="text-xl font-extrabold text-[#071933] font-display">{todayOverview.todayAppointments || 2}</span>
            <span className="text-[10px] text-[#0284c7] block">Queue Active</span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
            <span className="text-[10px] font-bold uppercase text-blue-800 tracking-wider block">OPD Patients</span>
            <span className="text-xl font-extrabold text-blue-950 font-display">{todayOverview.opdPatientsCount || 12}</span>
            <span className="text-[10px] text-blue-700 block">Outpatient care</span>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100">
            <span className="text-[10px] font-bold uppercase text-purple-800 tracking-wider block">IPD Inpatients</span>
            <span className="text-xl font-extrabold text-purple-950 font-display">{todayOverview.ipdPatientsCount || 3}</span>
            <span className="text-[10px] text-purple-700 block">Admitted in Wards</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
            <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider block">Staff on Duty</span>
            <span className="text-xl font-extrabold text-amber-950 font-display">
              {todayOverview.staffPresentCount || 4} / {kpis.totalStaff || 5}
            </span>
            <span className="text-[10px] text-amber-700 block">Present today</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
            <span className="text-[10px] font-bold uppercase text-rose-800 tracking-wider block">Pharmacy Stock Alert</span>
            <span className="text-xl font-extrabold text-rose-950 font-display">{kpis.lowStockAlerts || 2}</span>
            <span className="text-[10px] text-rose-700 block">Batches below min</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-700 tracking-wider block">Trauma & ICU</span>
            <span className="text-xs font-extrabold text-[#0284c7] font-display flex items-center gap-1 mt-1">
              <ShieldCheck className="w-4 h-4 text-[#0284c7]" /> Operational
            </span>
            <span className="text-[10px] text-slate-500 block">24/7 Hotline Ready</span>
          </div>
        </div>
      </div>

      {/* Interactive Recharts Section */}
      <div className="animate-fade-in-up delay-200 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Patient Inflow Trends (Area Chart) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Patient Inflow & Admissions Trends (6 Months)
              </h3>
              <p className="text-xs text-slate-500">Outpatient clinical consultations vs Inpatient surgical admissions</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#0284c7]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] animate-pulse" /> Outpatients
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Inpatients
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyAdmissions || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOutpatient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorInpatient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071933', borderRadius: '12px', color: '#fff', fontSize: '12px', border: '1px solid #1e3a5f', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="outpatients"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorOutpatient)"
                  isAnimationActive={true}
                  animationDuration={1300}
                  animationEasing="ease-out"
                />
                <Area
                  type="monotone"
                  dataKey="inpatients"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorInpatient)"
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Appointments Volume (Bar Chart) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-all duration-300">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">Specialty Distribution</h3>
            <p className="text-xs text-slate-500">Department-wise consultations & doctors</p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.departmentBreakdown || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}
                />
                <Bar
                  dataKey="appointments"
                  fill="#0284c7"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Appointments Queue & Bed Capacity */}
      <div className="animate-fade-in-up delay-300 grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0 w-full">
        {/* Recent Appointments Feed */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hover:shadow-md transition-all duration-300 min-w-0 w-full">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Today's Scheduled Consultations</h3>
              <p className="text-xs text-slate-500">Live clinical intake and patient queue</p>
            </div>
            <button
              onClick={() => setActivePage('admin_appointments')}
              className="text-xs font-bold text-[#0284c7] hover:text-[#071933] flex items-center gap-1 group transition-colors cursor-pointer"
            >
              View Full Schedule <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Consultant</th>
                  <th className="px-5 py-3">Date & Slot</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-sky-50/50 hover:translate-x-0.5 transition-all duration-150">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{apt.patientName}</p>
                      <span className="text-[10px] font-mono text-slate-400">{apt.patientMrn || apt.appointment_number}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">{apt.doctorName}</p>
                      <span className="text-[10px] text-[#0284c7]">{apt.doctorSpecialty}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{apt.appointment_date}</p>
                      <span className="text-[10px] text-slate-500">{apt.appointment_time}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={apt.status === 'confirmed' ? 'success' : apt.status === 'completed' ? 'info' : 'warning'}>
                        {apt.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setActivePage('admin_appointments')}
                        className="px-2.5 py-1 rounded-md bg-sky-50 hover:bg-sky-100 text-[#0284c7] font-bold text-[11px] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Ward & Bed Alert Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 font-display">Critical Bed Capacity</h3>
            <span className="text-xs font-bold text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded animate-pulse">
              {kpis.bedOccupancyRate || 30}% Occupied
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:border-sky-200 transition-colors">
              <div>
                <p className="font-bold text-slate-900">Intensive Cardiac Care (ICCU)</p>
                <span className="text-[11px] text-slate-500">Floor 3 • 6 Total Beds</span>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                1 Occupied / 1 Maint
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:border-sky-200 transition-colors">
              <div>
                <p className="font-bold text-slate-900">Surgical Recovery Ward</p>
                <span className="text-[11px] text-slate-500">Floor 2 • 10 Total Beds</span>
              </div>
              <span className="text-xs font-bold text-[#0284c7] bg-sky-50 px-2 py-1 rounded-md border border-sky-200">
                1 Occupied / 9 Free
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:border-sky-200 transition-colors">
              <div>
                <p className="font-bold text-slate-900">Executive Private Suites</p>
                <span className="text-[11px] text-slate-500">Floor 4 • 8 Total Beds</span>
              </div>
              <span className="text-xs font-bold text-[#0284c7] bg-sky-50 px-2 py-1 rounded-md border border-sky-200">
                1 Reserved / 7 Free
              </span>
            </div>
          </div>

          <button
            onClick={() => setActivePage('admin_beds')}
            className="w-full py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            Open Interactive Ward & Bed Map
          </button>
        </div>
      </div>
    </div>
  );
}
