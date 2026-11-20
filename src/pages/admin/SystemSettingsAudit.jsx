import React, { useState, useEffect } from 'react';
import { auditApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import {
  Sliders,
  Shield,
  Search,
  Save,
  Clock,
  User,
  Activity,
  Lock,
  Building
} from 'lucide-react';

export function SystemSettingsAudit() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('audit');
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({
    hospital_name: '',
    tagline: '',
    emergency_phone: '',
    general_phone: '',
    contact_email: '',
    address_line1: '',
    currency_symbol: '₹',
    tax_percentage: '5.0',
    working_hours: ''
  });
  const [loading, setLoading] = useState(true);
  const [searchLog, setSearchLog] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsRes, settingsRes] = await Promise.all([
        auditApi.getLogs(),
        auditApi.getSettings()
      ]);
      if (logsRes.success) setLogs(logsRes.data);
      if (settingsRes.success) setSettings(settingsRes.data);
    } catch (err) {
      console.error('Failed to load settings & audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await auditApi.updateSettings(settings);
      if (res.success) {
        toast.success('Hospital system configuration saved successfully.');
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update settings.');
    }
  };

  const filteredLogs = logs.filter(l => {
    const q = searchLog.toLowerCase();
    return (
      l.action?.toLowerCase().includes(q) ||
      l.user_name?.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
            Settings & Logs
          </h2>
          <p className="text-xs text-slate-500">
            Manage hospital settings and view system activity logs.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'audit' ? 'bg-[#0284c7] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Activity Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'bg-[#0284c7] text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hospital Settings
          </button>
        </div>
      </div>

      {activeTab === 'audit' ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail by user, action, or details..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5">Actor / User</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Action Event</th>
                    <th className="px-5 py-3.5">Audit Details</th>
                    <th className="px-5 py-3.5 text-right">Host IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading audit trail...</td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">No audit logs logged.</td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          {log.created_at?.split('T')[0]} {log.created_at?.split('T')[1]?.substring(0, 8)}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">{log.user_name || 'System'}</td>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-[#0284c7] uppercase text-[10px] bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                            {log.role || 'system'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-800 font-mono text-[11px]">
                          {log.action}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 max-w-sm">
                          <p className="line-clamp-2">{log.details}</p>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-slate-400 text-[10px]">
                          {log.ip_address || '127.0.0.1'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Settings Form - Full Screen Width Box */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs w-full">
          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#0284c7]" />
                  <span>General Hospital Profile</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hospital institutional profile, hotline contacts, physical address, and billing parameters.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-[#0284c7] border border-sky-200">
                <Shield className="w-3.5 h-3.5 text-[#0284c7]" />
                Active Configuration
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block font-bold text-slate-700 uppercase mb-1">Hospital Official Name</label>
                <input
                  type="text"
                  value={settings.hospital_name || ''}
                  onChange={(e) => setSettings({ ...settings, hospital_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Billing Currency Symbol</label>
                <input
                  type="text"
                  value={settings.currency_symbol || '₹'}
                  onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block font-bold text-slate-700 uppercase mb-1">Hospital Tagline / Motto</label>
                <input
                  type="text"
                  value={settings.tagline || ''}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Emergency Hotline Phone</label>
                <input
                  type="text"
                  value={settings.emergency_phone || ''}
                  onChange={(e) => setSettings({ ...settings, emergency_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">General Reception Phone</label>
                <input
                  type="text"
                  value={settings.general_phone || ''}
                  onChange={(e) => setSettings({ ...settings, general_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Hospital Service Tax (%)</label>
                <input
                  type="text"
                  value={settings.tax_percentage || '5.0'}
                  onChange={(e) => setSettings({ ...settings, tax_percentage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block font-bold text-slate-700 uppercase mb-1">Primary Contact Email</label>
                <input
                  type="email"
                  value={settings.contact_email || ''}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block font-bold text-slate-700 uppercase mb-1">Campus Physical Address</label>
                <input
                  type="text"
                  value={settings.address_line1 || ''}
                  onChange={(e) => setSettings({ ...settings, address_line1: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block font-bold text-slate-700 uppercase mb-1">Working & Clinic Hours</label>
                <input
                  type="text"
                  value={settings.working_hours || ''}
                  onChange={(e) => setSettings({ ...settings, working_hours: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end pt-5 border-t border-slate-100">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Save System Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
