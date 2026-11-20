import express from 'express';
import { db } from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

function enrichLabTest(test, patients, doctors) {
  const patient = patients.find(p => p.id === test.patient_id);
  const doctor = doctors.find(d => d.id === test.doctor_id);
  return {
    ...test,
    patientName: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient',
    patientMrn: patient?.mrn || '',
    patientAge: patient?.age || null,
    patientGender: patient?.gender || '',
    doctorName: doctor?.name || 'Attending Physician'
  };
}

// GET /api/lab
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, patientId, category } = req.query;
    let tests = await db.getCollection('lab_tests');
    const patients = await db.getCollection('patients');
    const doctors = await db.getCollection('doctors');

    // Role check: if patient, only see own tests
    if (req.user.role === 'patient') {
      const patientRecord = patients.find(p => p.user_id === req.user.id || p.email === req.user.email);
      if (!patientRecord) return res.json({ success: true, data: [] });
      tests = tests.filter(t => t.patient_id === patientRecord.id);
    }

    if (patientId) {
      const pId = parseInt(patientId, 10);
      tests = tests.filter(t => t.patient_id === pId);
    }

    if (status) {
      tests = tests.filter(t => t.status === status);
    }

    if (category) {
      tests = tests.filter(t => t.category.toLowerCase() === category.toLowerCase());
    }

    // Sort descending by date
    tests.sort((a, b) => new Date(b.ordered_date) - new Date(a.ordered_date));

    const enriched = tests.map(t => enrichLabTest(t, patients, doctors));
    return res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve laboratory tests.' });
  }
});

// GET /api/lab/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const test = await db.findById('lab_tests', req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Lab test not found.' });
    }

    const patients = await db.getCollection('patients');
    const doctors = await db.getCollection('doctors');

    const enriched = enrichLabTest(test, patients, doctors);
    return res.json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve lab test.' });
  }
});

// POST /api/lab (Staff/Doctor/Admin)
router.post('/', verifyToken, requireRole(['admin', 'doctor', 'staff']), async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      test_name,
      category,
      sample_type,
      normal_range,
      unit,
      notes
    } = req.body;

    if (!patient_id || !test_name || !category) {
      return res.status(400).json({ success: false, message: 'Patient, test name, and category are required.' });
    }

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const test_code = `LAB-${year}-${randomSuffix}`;
    const today = new Date().toISOString().split('T')[0];

    const newTest = await db.insert('lab_tests', {
      test_code,
      patient_id: parseInt(patient_id, 10),
      doctor_id: doctor_id ? parseInt(doctor_id, 10) : null,
      test_name: test_name.trim(),
      category: category.trim(),
      ordered_date: today,
      sample_type: sample_type || 'Venous Blood',
      status: 'ordered',
      results: '',
      normal_range: normal_range || 'Standard Clinical',
      unit: unit || '',
      is_abnormal: 0,
      authorized_by: null,
      notes: notes || ''
    });

    const patients = await db.getCollection('patients');
    const doctors = await db.getCollection('doctors');
    const enriched = enrichLabTest(newTest, patients, doctors);

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'LAB_TEST_ORDERED',
      entity_type: 'LabTest',
      entity_id: newTest.id.toString(),
      details: `Ordered test ${test_code} (${newTest.test_name}) for patient ${enriched.patientName}`
    });

    return res.status(201).json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to order lab test.' });
  }
});

// PUT /api/lab/:id/results (Authorized doctor or lab pathologist)
router.put('/:id/results', verifyToken, requireRole(['admin', 'doctor', 'staff']), async (req, res) => {
  try {
    const { results, normal_range, is_abnormal, status = 'completed', notes } = req.body;

    if (!results) {
      return res.status(400).json({ success: false, message: 'Test results content is required.' });
    }

    const updates = {
      results,
      status,
      authorized_by: req.user.name,
      is_abnormal: is_abnormal ? 1 : 0
    };
    if (normal_range) updates.normal_range = normal_range;
    if (notes) updates.notes = notes;

    const updated = await db.update('lab_tests', req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Lab test not found.' });
    }

    const patients = await db.getCollection('patients');
    const doctors = await db.getCollection('doctors');
    const enriched = enrichLabTest(updated, patients, doctors);

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'LAB_RESULTS_AUTHORIZED',
      entity_type: 'LabTest',
      entity_id: req.params.id,
      details: `Authorized diagnostic results for test ${updated.test_code}`
    });

    return res.json({ success: true, message: 'Results saved and authorized.', data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update lab results.' });
  }
});

export default router;
