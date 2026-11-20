import React, { useState, useEffect } from 'react';
import { bedsApi, patientsApi, billingApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { CustomSelect } from '../../components/common/CustomSelect.jsx';
import {
  Bed,
  UserPlus,
  LogOut,
  AlertCircle,
  Wrench,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Receipt,
  Activity
} from 'lucide-react';

export function BedManagement() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admission Modal State
  const [admitModalOpen, setAdmitModalOpen] = useState(false);
  const [selectedBedForAdmit, setSelectedBedForAdmit] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [admitNotes, setAdmitNotes] = useState('');

  // Smart Recommendation Modal State (NEW CLINICAL LOGIC)
  const [recommendModalOpen, setRecommendModalOpen] = useState(false);
  const [recPatientId, setRecPatientId] = useState('');
  const [recSymptoms, setRecSymptoms] = useState('Severe chest tightness and dyspnea');
  const [recVitals, setRecVitals] = useState({ heartRate: 118, systolicBP: 165, spo2: 91, painScale: 7 });
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [calculatingRec, setCalculatingRec] = useState(false);

  const loadBedData = async () => {
    try {
      setLoading(true);
      const [bedRes, patRes] = await Promise.all([
        bedsApi.getAll(),
        patientsApi.getAll()
      ]);
      if (bedRes.success) setData(bedRes);
      if (patRes.success) {
        setPatients(patRes.data);
        if (patRes.data.length > 0) setRecPatientId(patRes.data[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load bed map:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBedData();
  }, []);

  const handleOpenAdmit = (bed) => {
    setSelectedBedForAdmit(bed);
    setSelectedPatientId(patients[0]?.id?.toString() || '');
    setAdmitNotes('');
    setAdmitModalOpen(true);
  };

  const handleConfirmAdmit = async (e) => {
    e.preventDefault();
    if (!selectedBedForAdmit || !selectedPatientId) {
      toast.warning('Please select a patient to admit.');
      return;
    }
    try {
      const res = await bedsApi.admit({
        bed_id: selectedBedForAdmit.id,
        patient_id: parseInt(selectedPatientId, 10),
        notes: admitNotes
      });
      if (res.success) {
        toast.success(`Patient admitted to Bed ${selectedBedForAdmit.bed_number}!`);
        setAdmitModalOpen(false);
        loadBedData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to admit patient.');
    }
  };

  const handleRunSmartRecommend = async () => {
    setCalculatingRec(true);
    try {
      const res = await bedsApi.recommend({
        patient_id: parseInt(recPatientId, 10),
        symptoms: recSymptoms,
        vitals: recVitals
      });
      if (res.success) {
        setRecommendationResult(res.recommendation);
        toast.success('Clinical bed recommendation calculated!');
      }
    } catch (err) {
      toast.error('Failed to compute recommendation.');
    } finally {
      setCalculatingRec(false);
    }
  };

  const handleAdmitRecommendedBed = async () => {
    if (!recommendationResult?.recommendedBed) {
      toast.warning('No available bed in recommended ward.');
      return;
    }
    try {
      const res = await bedsApi.admit({
        bed_id: recommendationResult.recommendedBed.id,
        patient_id: parseInt(recPatientId, 10),
        estimated_los_days: recommendationResult.estimatedLOSDays,
        notes: `Clinical admission based on ESI triage: ${recommendationResult.clinicalRationale}`
      });
      if (res.success) {
        toast.success(`Admitted to Bed ${recommendationResult.recommendedBed.bed_number} (${recommendationResult.recommendedWard.name})!`);
        setRecommendModalOpen(false);
        setRecommendationResult(null);
        loadBedData();
      }
    } catch (err) {
      toast.error(err.message || 'Admission failed.');
    }
  };

  // 1-Click Discharge & Auto-Generate Inpatient Bill
  const handleDischargeAndBill = async (bed) => {
    if (!bed.current_patient_id) return;
    if (!window.confirm(`Discharge patient from Bed ${bed.bed_number} and auto-compile itemized hospital bill?`)) return;

    try {
      // 1. Discharge
      await bedsApi.discharge({ bed_id: bed.id });
      // 2. Auto-generate discharge bill
      const billRes = await billingApi.autoDischarge(bed.current_patient_id);
      if (billRes.success) {
        toast.success(`Patient discharged! Auto-generated invoice #${billRes.data.invoice_number} (Total: ₹${billRes.data.total_amount}).`);
        loadBedData();
      }
    } catch (err) {
      toast.error(err.message || 'Discharge and billing workflow failed.');
    }
  };

  const summary = data?.summary || {};
  const wards = data?.wards || [];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
            Beds & Wards
          </h2>
          <p className="text-xs text-slate-500">
            Check available beds, admit patients, and manage hospital wards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Smart Recommend Button */}
          <button
            onClick={() => {
              setRecommendModalOpen(true);
              handleRunSmartRecommend();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#071933] to-[#0284c7] hover:from-[#0b2447] hover:to-[#0369a1] text-white font-bold text-xs shadow-md transition-all hover:scale-102 cursor-pointer border border-sky-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Smart Bed & LOS Assistant
          </button>

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs bg-white px-3.5 py-2 rounded-xl border border-slate-200">
            <span className="flex items-center gap-1.5 font-semibold text-[#0284c7]">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Available
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Occupied
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Maintenance
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Hospital Beds</p>
          <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{summary.totalBeds || 10}</h4>
          <span className="text-[10px] text-slate-400">Across 4 specialized wards</span>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Currently Occupied</p>
          <h4 className="text-2xl font-extrabold text-amber-600 mt-1">{summary.totalOccupied || 3}</h4>
          <span className="text-[10px] text-slate-400">Admitted inpatients</span>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#0284c7]">Available Vacancies</p>
          <h4 className="text-2xl font-extrabold text-[#0284c7] mt-1">{summary.totalAvailable || 6}</h4>
          <span className="text-[10px] text-slate-400">Ready for patient intake</span>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Occupancy Ratio</p>
          <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{summary.overallOccupancyRate || 30}%</h4>
          <span className="text-[10px] text-[#0284c7] font-bold">Optimal capacity range</span>
        </div>
      </div>

      {/* Visual Ward Grid */}
      <div className="space-y-8">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading hospital ward telemetry...</div>
        ) : (
          wards.map(ward => (
            <div
              key={ward.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6"
            >
              {/* Ward Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-display">{ward.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      Floor {ward.floor_number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Category: <strong className="text-slate-800">{ward.type}</strong> • Daily Rate: <strong className="font-mono text-[#0284c7]">₹{parseFloat(ward.daily_rate).toFixed(2)}/day</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-slate-700">
                    {ward.occupiedBeds} / {ward.totalBeds} Occupied ({ward.occupancyRate}%)
                  </span>
                  <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#0284c7] rounded-full"
                      style={{ width: `${ward.occupancyRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bed Tiles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(ward.beds || []).map(bed => {
                  const isOccupied = bed.status === 'occupied';
                  const isAvailable = bed.status === 'available';

                  return (
                    <div
                      key={bed.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                        isOccupied
                          ? 'bg-amber-50/60 border-amber-200 shadow-xs'
                          : isAvailable
                          ? 'bg-sky-50/50 border-sky-200/80 hover:border-sky-400'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Bed className={`w-4 h-4 ${
                            isOccupied ? 'text-amber-600' : isAvailable ? 'text-[#0284c7]' : 'text-slate-400'
                          }`} />
                          <span className="font-bold text-slate-900 text-xs font-mono">{bed.bed_number}</span>
                        </div>
                        <Badge variant={isOccupied ? 'warning' : isAvailable ? 'success' : 'neutral'}>
                          {bed.status}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="text-xs min-h-[50px]">
                        {isOccupied ? (
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 truncate">{bed.patientName || 'Admitted Patient'}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              MRN: {bed.patientMrn || 'EHR-ID'} • Blood: {bed.patientBlood || 'O+'}
                            </p>
                            {bed.notes && <p className="text-[10px] text-amber-900 italic truncate">{bed.notes}</p>}
                          </div>
                        ) : isAvailable ? (
                          <p className="text-slate-500 text-[11px] leading-relaxed">
                            Sanitized & telemetry ready for patient intake.
                          </p>
                        ) : (
                          <p className="text-slate-400 text-[11px] leading-relaxed">
                            Under engineering and medical gas maintenance.
                          </p>
                        )}
                      </div>

                      {/* Action */}
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        {isAvailable ? (
                          <button
                            onClick={() => handleOpenAdmit(bed)}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold text-[11px] shadow-xs cursor-pointer"
                          >
                            <UserPlus className="w-3 h-3 text-amber-300" />
                            Admit Patient
                          </button>
                        ) : isOccupied ? (
                          <div className="flex items-center justify-between w-full gap-2">
                            <button
                              onClick={() => handleDischargeAndBill(bed)}
                              className="w-full inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-[10px] shadow-xs cursor-pointer"
                              title="Discharge and auto-generate itemized invoice"
                            >
                              <Receipt className="w-3 h-3 text-amber-300" />
                              Discharge & Bill
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium w-full text-center">Maintenance</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Admit Patient to Bed */}
      <Modal
        isOpen={admitModalOpen}
        onClose={() => setAdmitModalOpen(false)}
        title="Inpatient Bed Admission Triage"
        subtitle={selectedBedForAdmit ? `Assigning patient to Bed ${selectedBedForAdmit.bed_number}` : ''}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmAdmit} className="space-y-4 text-xs">
          <div>
            <CustomSelect
              label="Select Registered Patient (EHR)"
              required
              value={selectedPatientId}
              onChange={(val) => setSelectedPatientId(val)}
              options={patients.map(p => ({
                value: p.id,
                label: `${p.first_name} ${p.last_name}`,
                sublabel: `${p.mrn} • ${p.blood_group}`
              }))}
              placeholder="-- Choose Patient --"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1.5">
              Clinical Admission Notes & Triage
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Post-operative recovery monitoring, continuous ECG telemetry, IV fluid administration..."
              value={admitNotes}
              onChange={(e) => setAdmitNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0284c7]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAdmitModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold"
            >
              Confirm Bed Admission
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Smart Recommendation & LOS Assistant (NEW CLINICAL LOGIC) */}
      <Modal
        isOpen={recommendModalOpen}
        onClose={() => setRecommendModalOpen(false)}
        title="Smart Bed Allocation & LOS Assistant"
        subtitle="Clinical algorithms evaluate patient vitals & symptoms to recommend optimal ward and predict length of stay"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6 text-xs">
          {/* Patient & Clinical Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <CustomSelect
                label="Select Patient"
                required
                value={recPatientId}
                onChange={(val) => setRecPatientId(val)}
                options={patients.map(p => ({
                  value: p.id,
                  label: `${p.first_name} ${p.last_name}`,
                  sublabel: `${p.mrn} • ${p.age} Yrs`
                }))}
                placeholder="-- Choose Patient --"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Clinical Symptoms / Reason</label>
              <input
                type="text"
                value={recSymptoms}
                onChange={(e) => setRecSymptoms(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between pt-2">
              <span className="text-slate-500 text-[11px]">Heart Rate: 118 BPM • SpO2: 91% • Pain: 7/10</span>
              <button
                type="button"
                onClick={handleRunSmartRecommend}
                disabled={calculatingRec}
                className="px-4 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0b2447] text-white font-bold transition-colors"
              >
                {calculatingRec ? 'Recalculating...' : 'Recalculate Recommendation'}
              </button>
            </div>
          </div>

          {/* Recommendation Output Card */}
          {recommendationResult && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#071933] to-slate-900 text-white space-y-4 shadow-lg border border-[#1e3a5f]">
              <div className="flex items-center justify-between border-b border-[#1e3a5f]/80 pb-3">
                <span className="text-xs font-bold uppercase text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Recommendation Assessment
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#0284c7] text-sky-200 text-[11px] font-bold">
                  {recommendationResult.triage?.acuity}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Recommended Ward</span>
                  <strong className="text-sm font-bold text-white">{recommendationResult.recommendedWard?.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Available Bed</span>
                  <strong className="text-sm font-bold text-amber-300 font-mono">
                    {recommendationResult.recommendedBed ? recommendationResult.recommendedBed.bed_number : 'No Bed Free'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Predicted LOS</span>
                  <strong className="text-sm font-bold text-white">{recommendationResult.estimatedLOSDays} Days</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Projected Room Total</span>
                  <strong className="text-sm font-bold text-sky-300 font-mono">₹{recommendationResult.projectedRoomTotal?.toFixed(2)}</strong>
                </div>
              </div>

              <p className="text-xs text-sky-100 bg-[#0b2447]/60 p-3 rounded-xl border border-[#1e3a5f]">
                <strong>Clinical Rationale:</strong> {recommendationResult.clinicalRationale}
              </p>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAdmitRecommendedBed}
                  disabled={!recommendationResult.recommendedBed}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#071933] font-bold text-xs shadow-md transition-all hover:scale-102 disabled:opacity-40"
                >
                  Admit Directly to Recommended Bed ({recommendationResult.recommendedBed?.bed_number || 'None'})
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
