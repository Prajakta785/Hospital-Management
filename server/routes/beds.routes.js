import express from 'express';
import { db } from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { calculateTriageScore } from '../services/clinicalLogic.js';

const router = express.Router();

// GET /api/beds (Public summary or authenticated view)
router.get('/', async (req, res) => {
  try {
    const wards = await db.getCollection('wards');
    const beds = await db.getCollection('beds');
    const patients = await db.getCollection('patients');

    const enrichedWards = wards.map(ward => {
      const wardBeds = beds.filter(b => b.ward_id === ward.id);
      const occupiedCount = wardBeds.filter(b => b.status === 'occupied').length;
      const availableCount = wardBeds.filter(b => b.status === 'available').length;
      const maintenanceCount = wardBeds.filter(b => b.status === 'maintenance').length;

      return {
        ...ward,
        totalBeds: wardBeds.length || ward.total_beds,
        occupiedBeds: occupiedCount,
        availableBeds: availableCount,
        maintenanceBeds: maintenanceCount,
        occupancyRate: wardBeds.length > 0 ? Math.round((occupiedCount / wardBeds.length) * 100) : 0,
        beds: wardBeds.map(b => {
          const patient = patients.find(p => p.id === b.current_patient_id);
          return {
            ...b,
            patientName: patient ? `${patient.first_name} ${patient.last_name}` : null,
            patientMrn: patient?.mrn || null,
            patientAge: patient?.age || null,
            patientGender: patient?.gender || null,
            patientBlood: patient?.blood_group || null
          };
        })
      };
    });

    const totalBeds = beds.length;
    const totalOccupied = beds.filter(b => b.status === 'occupied').length;
    const totalAvailable = beds.filter(b => b.status === 'available').length;

    return res.json({
      success: true,
      summary: {
        totalBeds,
        totalOccupied,
        totalAvailable,
        overallOccupancyRate: totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0
      },
      wards: enrichedWards
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve ward and bed data.' });
  }
});

// POST /api/beds/recommend (Smart Bed & Ward Allocation Recommendation Algorithm)
router.post('/recommend', async (req, res) => {
  try {
    const { patient_id, symptoms = '', vitals = {} } = req.body;
    const wards = await db.getCollection('wards');
    const beds = await db.getCollection('beds');
    const patients = await db.getCollection('patients');

    let patient = null;
    if (patient_id) {
      patient = patients.find(p => p.id === parseInt(patient_id, 10));
    }

    // Run triage logic
    const triage = calculateTriageScore(vitals, (symptoms || '') + ' ' + (patient?.medical_history || ''));

    // Determine target ward type
    let targetWardType = 'General Ward';
    let estimatedLOSDays = 3;

    if (triage.esiLevel <= 2 || symptoms.toLowerCase().includes('cardiac') || symptoms.toLowerCase().includes('heart')) {
      targetWardType = 'ICU';
      estimatedLOSDays = 4;
    } else if (patient?.age && patient.age < 15) {
      targetWardType = 'Pediatric Care';
      estimatedLOSDays = 2;
    } else if (symptoms.toLowerCase().includes('executive') || symptoms.toLowerCase().includes('private')) {
      targetWardType = 'Private Suite';
      estimatedLOSDays = 3;
    }

    // Find ward matching type
    const matchedWard = wards.find(w => w.type === targetWardType) || wards[0];
    const wardBeds = beds.filter(b => b.ward_id === matchedWard.id);
    const availableBed = wardBeds.find(b => b.status === 'available') || beds.find(b => b.status === 'available');

    const dailyRate = parseFloat(matchedWard.daily_rate) || 150.00;
    const projectedRoomTotal = dailyRate * estimatedLOSDays;

    return res.json({
      success: true,
      recommendation: {
        triage,
        recommendedWard: matchedWard,
        recommendedBed: availableBed || null,
        estimatedLOSDays,
        dailyRate,
        projectedRoomTotal: Math.round(projectedRoomTotal * 100) / 100,
        clinicalRationale: `Assessed as ${triage.acuity}. Recommended for ${matchedWard.name} with expected ${estimatedLOSDays} days inpatient telemetry.`
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to compute bed recommendation.' });
  }
});

// POST /api/beds/admit (Staff/Admin)
router.post('/admit', verifyToken, requireRole(['admin', 'doctor', 'staff']), async (req, res) => {
  try {
    const { bed_id, patient_id, notes, estimated_los_days } = req.body;
    if (!bed_id || !patient_id) {
      return res.status(400).json({ success: false, message: 'Bed ID and Patient ID are required.' });
    }

    const bed = await db.findById('beds', bed_id);
    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found.' });
    }
    if (bed.status === 'occupied') {
      return res.status(400).json({ success: false, message: 'Bed is currently occupied.' });
    }

    const patient = await db.findById('patients', patient_id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // Update bed
    const updatedBed = await db.update('beds', bed_id, {
      status: 'occupied',
      current_patient_id: parseInt(patient_id, 10),
      admitted_at: new Date().toISOString(),
      estimated_los_days: estimated_los_days ? parseInt(estimated_los_days, 10) : 3,
      notes: notes || `Admitted patient ${patient.first_name} ${patient.last_name}`
    });

    // Update patient status to inpatient
    await db.update('patients', patient_id, {
      admission_status: 'inpatient'
    });

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'PATIENT_ADMITTED_TO_BED',
      entity_type: 'Bed',
      entity_id: bed_id.toString(),
      details: `Admitted patient ${patient.first_name} ${patient.last_name} (${patient.mrn}) to Bed ${bed.bed_number}`
    });

    return res.json({ success: true, message: 'Patient successfully admitted with clinical telemetry.', data: updatedBed });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to admit patient to bed.' });
  }
});

// POST /api/beds/discharge (Staff/Admin)
router.post('/discharge', verifyToken, requireRole(['admin', 'doctor', 'staff']), async (req, res) => {
  try {
    const { bed_id } = req.body;
    const bed = await db.findById('beds', bed_id);
    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found.' });
    }

    const patientId = bed.current_patient_id;

    // Free bed
    const updatedBed = await db.update('beds', bed_id, {
      status: 'available',
      current_patient_id: null,
      admitted_at: null,
      notes: 'Discharged & ready for sanitization.'
    });

    if (patientId) {
      await db.update('patients', patientId, {
        admission_status: 'discharged'
      });
    }

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'PATIENT_DISCHARGED_FROM_BED',
      entity_type: 'Bed',
      entity_id: bed_id.toString(),
      details: `Discharged patient from Bed ${bed.bed_number}`
    });

    return res.json({ success: true, message: 'Patient successfully discharged.', data: updatedBed });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to discharge patient.' });
  }
});

// PATCH /api/beds/:id/status
router.patch('/:id/status', verifyToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!['available', 'occupied', 'maintenance', 'reserved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid bed status.' });
    }

    const updated = await db.update('beds', req.params.id, { status, notes: notes || '' });
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update bed status.' });
  }
});

export default router;
