import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'apexcare_hospital_super_secret_jwt_key_2026';

// GET /api/prescriptions (Resilient: works with or without token in Admin mode)
router.get('/', async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId } = req.query;
    let prescriptions = await db.getCollection('prescriptions');
    const patients = await db.getCollection('patients');
    const doctors = await db.getCollection('doctors');

    // Decode token if provided
    let currentUser = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        currentUser = jwt.verify(token, JWT_SECRET);
      } catch (e) {
        // Ignored, proceed as general admin
      }
    }

    if (patientId) {
      prescriptions = prescriptions.filter(p => p.patient_id === parseInt(patientId, 10));
    }
    if (doctorId) {
      prescriptions = prescriptions.filter(p => p.doctor_id === parseInt(doctorId, 10));
    }
    if (appointmentId) {
      prescriptions = prescriptions.filter(p => p.appointment_id === parseInt(appointmentId, 10));
    }

    // Role-based restrictions if patient
    if (currentUser && currentUser.role === 'patient') {
      const patient = patients.find(p => p.user_id === currentUser.id || p.email === currentUser.email);
      if (patient) {
        prescriptions = prescriptions.filter(p => p.patient_id === patient.id);
      }
    }

    // Enrich with patient and doctor details
    const enriched = prescriptions.map(rx => {
      const patient = patients.find(p => p.id === rx.patient_id);
      const doctor = doctors.find(d => d.id === rx.doctor_id);
      return {
        ...rx,
        patientName: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient',
        patientMrn: patient?.mrn || '',
        patientGender: patient?.gender || '',
        patientAge: patient?.age || '',
        patientBloodGroup: patient?.blood_group || '',
        patientPhone: patient?.phone || '',
        doctorName: doctor?.name || 'Attending Physician',
        doctorSpecialty: doctor?.specialty || 'General Medicine'
      };
    });

    return res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('Fetch prescriptions error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve prescriptions.' });
  }
});

// GET /api/prescriptions/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const rx = await db.findById('prescriptions', req.params.id);
    if (!rx) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }
    const patients = await db.getCollection('patients');
    const doctors = await db.getCollection('doctors');
    const patient = patients.find(p => p.id === rx.patient_id);
    const doctor = doctors.find(d => d.id === rx.doctor_id);

    return res.json({
      success: true,
      data: {
        ...rx,
        patientName: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient',
        patientMrn: patient?.mrn || '',
        doctorName: doctor?.name || 'Attending Physician'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve prescription.' });
  }
});

// POST /api/prescriptions (Doctor create digital RX)
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      appointment_id,
      diagnosis,
      instructions,
      items = []
    } = req.body;

    if (!patient_id || !diagnosis) {
      return res.status(400).json({ success: false, message: 'Patient ID and diagnosis are required.' });
    }

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prescription_code = `RX-${year}-${randomSuffix}`;

    const newPrescription = await db.insert('prescriptions', {
      prescription_code,
      patient_id: parseInt(patient_id, 10),
      doctor_id: doctor_id ? parseInt(doctor_id, 10) : 1,
      appointment_id: appointment_id ? parseInt(appointment_id, 10) : null,
      diagnosis,
      instructions: instructions || 'Take medications as directed. Consult physician if symptoms persist.',
      prescribed_date: new Date().toISOString().split('T')[0],
      status: 'active',
      items: items.map((it, idx) => ({
        id: idx + 1,
        medicine_name: it.medicine_name,
        dosage: it.dosage || '1 Tablet',
        frequency: it.frequency || 'Twice Daily',
        duration: it.duration || '7 Days',
        instructions: it.instructions || 'After meals'
      }))
    });

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'PRESCRIPTION_CREATED',
      entity_type: 'Prescription',
      entity_id: prescription_code,
      details: `Digital RX created with ${items.length} medicines for patient ID ${patient_id}.`
    });

    return res.status(201).json({
      success: true,
      message: 'Digital Prescription created successfully.',
      data: newPrescription
    });
  } catch (err) {
    console.error('Create prescription error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create digital prescription.' });
  }
});

// DELETE /api/prescriptions/:id
router.delete('/:id', async (req, res) => {
  try {
    const rxId = req.params.id;
    const numericId = parseInt(rxId, 10);
    const existing = await db.findById('prescriptions', numericId);
    if (!existing) {
      return res.json({ success: true, message: 'Prescription already removed.' });
    }

    const deleted = await db.delete('prescriptions', numericId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Could not delete prescription.' });
    }

    try {
      await db.addAuditLog({
        user_id: 1,
        user_name: 'Administrator',
        role: 'admin',
        action: 'PRESCRIPTION_DELETED',
        entity_type: 'Prescription',
        entity_id: existing.prescription_code,
        details: `Prescription ${existing.prescription_code} was removed.`
      });
    } catch (auditErr) {
      console.warn('Audit log write warning:', auditErr.message);
    }

    return res.json({
      success: true,
      message: `Prescription ${existing.prescription_code} removed successfully.`
    });
  } catch (err) {
    console.error('Delete prescription error:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove prescription.' });
  }
});

export default router;
