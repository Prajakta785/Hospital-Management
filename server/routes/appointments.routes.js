import express from 'express';
import { db } from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { calculateTriageScore, calculateQueueETA } from '../services/clinicalLogic.js';

const router = express.Router();

// Helper to enrich appointment with patient & doctor info + clinical queue logic
function enrichAppointment(appointment, patients, doctors, departments, allAppointments = []) {
  const patient = patients.find(p => p.id === appointment.patient_id);
  const doctor = doctors.find(d => d.id === appointment.doctor_id);
  const dept = departments.find(dep => dep.id === (appointment.department_id || doctor?.department_id));

  // Compute live queue ETA logic
  const queueInfo = calculateQueueETA(allAppointments, appointment.doctor_id, appointment.id);

  // Compute or restore triage assessment
  const triage = appointment.triage || calculateTriageScore(appointment.vitals || {}, appointment.reason || '');

  return {
    ...appointment,
    patientName: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient',
    patientPhone: patient?.phone || '',
    patientEmail: patient?.email || '',
    patientMrn: patient?.mrn || '',
    patientGender: patient?.gender || 'Male',
    patientBloodGroup: patient?.blood_group || appointment.blood_group || 'O+',
    patientAllergies: patient?.allergies || 'None recorded',
    doctorName: doctor?.name || 'Assigned Physician',
    doctorSpecialty: doctor?.specialty || '',
    doctorAvatar: doctor?.avatar || '',
    departmentName: dept?.name || 'General Outpatient',
    consultationFee: doctor?.consultation_fee || 50.00,
    queueInfo,
    triage
  };
}

// GET /api/appointments
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, doctorId, date, patientId } = req.query;
    let appointments = await db.getCollection('appointments');
    const patients = await db.getCollection('patients');
    const doctors = await db.getCollection('doctors');
    const departments = await db.getCollection('departments');

    const rawAll = [...appointments];

    // Role-based restrictions:
    if (req.user.role === 'patient') {
      const patientRecord = patients.find(p => p.user_id === req.user.id || p.email === req.user.email);
      if (!patientRecord) {
        return res.json({ success: true, data: [] });
      }
      appointments = appointments.filter(a => a.patient_id === patientRecord.id);
    } else if (req.user.role === 'doctor') {
      const doctorRecord = doctors.find(d => d.user_id === req.user.id || d.email === req.user.email);
      if (doctorRecord && !req.query.all) {
        appointments = appointments.filter(a => a.doctor_id === doctorRecord.id);
      }
    }

    if (patientId) {
      const pId = parseInt(patientId, 10);
      appointments = appointments.filter(a => a.patient_id === pId);
    }

    if (doctorId) {
      const dId = parseInt(doctorId, 10);
      appointments = appointments.filter(a => a.doctor_id === dId);
    }

    if (status) {
      appointments = appointments.filter(a => a.status === status);
    }

    if (date) {
      appointments = appointments.filter(a => a.appointment_date === date);
    }

    // Sort descending by date
    appointments.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));

    const enriched = appointments.map(apt => enrichAppointment(apt, patients, doctors, departments, rawAll));

    return res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve appointments.' });
  }
});

// GET /api/appointments/online-stats - Public & Patient Real-time Online Booking Counter
router.get('/online-stats', async (req, res) => {
  try {
    const appointments = await db.getCollection('appointments');
    const patients = await db.getCollection('patients');
    const doctors = await db.getCollection('doctors');
    const departments = await db.getCollection('departments');

    // Filter only online appointments (exclude offline walk-in tokens)
    const onlineAppointments = appointments.filter(a => a.booking_channel !== 'offline_walkin');

    const enriched = onlineAppointments.map(apt => enrichAppointment(apt, patients, doctors, departments, appointments));

    // Sort descending by date & time
    enriched.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));

    // Slot booking counts map: key is `${date}_${doctorId}_${time}`
    const slotCounts = {};
    onlineAppointments.forEach(apt => {
      if (apt.appointment_date && apt.appointment_time) {
        const key = `${apt.appointment_date}_${apt.doctor_id}_${apt.appointment_time}`;
        slotCounts[key] = (slotCounts[key] || 0) + 1;
      }
    });

    return res.json({
      success: true,
      totalOnlineCount: enriched.length,
      slotCounts,
      data: enriched
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve online appointment stats.' });
  }
});

// GET /api/appointments/:id
router.get('/:id', async (req, res) => {
  try {
    const apt = await db.findById('appointments', req.params.id);
    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const appointments = await db.getCollection('appointments');
    const patients = await db.getCollection('patients');
    const doctors = await db.getCollection('doctors');
    const departments = await db.getCollection('departments');

    const enriched = enrichAppointment(apt, patients, doctors, departments, appointments);
    return res.json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve appointment.' });
  }
});

// POST /api/appointments (With automated clinical triage & queue allocation)
router.post('/', async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      department_id,
      appointment_date,
      appointment_time,
      type = 'General Consultation',
      reason,
      notes,
      vitals = {},
      // Guest booking details if not logged in
      guest_name,
      guest_email,
      guest_phone,
      guest_gender,
      guest_blood_group,
      blood_group,
      guest_dob
    } = req.body;

    if (!doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ success: false, message: 'Doctor, date, and time slot are required.' });
    }

    let finalPatientId = patient_id;

    // If guest booking without existing patient_id
    if (!finalPatientId && guest_name && guest_phone) {
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const nameParts = guest_name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const newPatient = await db.insert('patients', {
        user_id: null,
        mrn: `MRN-${year}-${randomSuffix}`,
        first_name: firstName,
        last_name: lastName,
        dob: guest_dob || '1990-01-01',
        age: 30,
        gender: guest_gender || 'Other',
        blood_group: guest_blood_group || blood_group || 'O+',
        phone: guest_phone.trim(),
        email: guest_email ? guest_email.trim() : null,
        address: 'Online Appointment Booking',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        allergies: 'None recorded',
        medical_history: 'Created via Online Booking Portal',
        insurance_provider: 'Self-Pay',
        insurance_policy_number: 'N/A',
        admission_status: 'outpatient'
      });
      finalPatientId = newPatient.id;
    }

    if (!finalPatientId) {
      return res.status(400).json({ success: false, message: 'Patient information or ID is required.' });
    }

    // Run clinical triage logic on appointment booking
    const triageScore = calculateTriageScore(vitals, reason || '');

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const appointment_number = `APT-${year}-${randomSuffix}`;

    const newAppointment = await db.insert('appointments', {
      appointment_number,
      patient_id: parseInt(finalPatientId, 10),
      doctor_id: parseInt(doctor_id, 10),
      department_id: department_id ? parseInt(department_id, 10) : null,
      appointment_date,
      appointment_time,
      type: triageScore.esiLevel <= 2 ? 'Emergency' : type,
      reason: reason || 'Routine Clinical Consultation',
      status: 'confirmed',
      blood_group: guest_blood_group || blood_group || 'O+',
      notes: notes || 'Booked through MedicalCare Portal.',
      booking_channel: req.body.booking_channel || 'online',
      vitals,
      triage: triageScore
    });

    const appointments = await db.getCollection('appointments');
    const patients = await db.getCollection('patients');
    const doctors = await db.getCollection('doctors');
    const departments = await db.getCollection('departments');
    const enriched = enrichAppointment(newAppointment, patients, doctors, departments, appointments);

    // 1. Auto-generate Billing Invoice for this consultation
    try {
      const selectedDoc = doctors.find(d => d.id === parseInt(doctor_id, 10));
      const fee = selectedDoc?.consultationFee || 50;
      const invNumber = `INV-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
      await db.insert('invoices', {
        invoice_number: invNumber,
        patient_id: parseInt(finalPatientId, 10),
        appointment_id: newAppointment.id,
        subtotal: fee,
        tax_amount: parseFloat((fee * 0.18).toFixed(2)),
        total_amount: parseFloat((fee * 1.18).toFixed(2)),
        status: 'unpaid',
        payment_method: null,
        due_date: appointment_date,
        items: [
          {
            description: `Specialist Consultation - ${enriched.doctorName || 'Senior Consultant'} (${enriched.departmentName || 'OPD'})`,
            quantity: 1,
            unit_price: fee,
            total: fee
          }
        ]
      });
    } catch (invErr) {
      console.warn('Invoice auto-creation warning:', invErr);
    }

    // 2. Auto-generate WhatsApp & SMS Notifications for Patient & Staff
    try {
      const patientContact = enriched.patientPhone || guest_phone || '+91 98201 23456';
      await db.insert('notifications', {
        patient_id: parseInt(finalPatientId, 10),
        type: 'whatsapp',
        title: 'OPD Appointment Confirmed',
        message: `Dear ${enriched.patientName}, your consultation with ${enriched.doctorName} is confirmed for ${appointment_date} at ${appointment_time}. Token: #${appointment_number}.`,
        phone: patientContact,
        status: 'delivered',
        timestamp: new Date().toISOString()
      });

      await db.insert('notifications', {
        patient_id: parseInt(finalPatientId, 10),
        type: 'sms',
        title: `Token #${appointment_number} Generated`,
        message: `MedicalCare Alert: Token #${appointment_number} confirmed for ${enriched.doctorName} on ${appointment_date} ${appointment_time}. Please arrive 10 mins prior.`,
        phone: patientContact,
        status: 'sent',
        timestamp: new Date().toISOString()
      });
    } catch (notifErr) {
      console.warn('Notification auto-creation warning:', notifErr);
    }

    await db.addAuditLog({
      user_id: null,
      user_name: enriched.patientName,
      role: 'patient',
      action: 'APPOINTMENT_BOOKED_WITH_TRIAGE',
      entity_type: 'Appointment',
      entity_id: newAppointment.id.toString(),
      details: `Booked appointment ${appointment_number} (${triageScore.acuity}). ETA Wait: ${enriched.queueInfo.estimatedWaitMins} mins.`
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully with clinical triage scoring!',
      data: enriched
    });
  } catch (err) {
    console.error('Appointment booking error:', err);
    return res.status(500).json({ success: false, message: 'Failed to book appointment.' });
  }
});

// PATCH /api/appointments/:id/status
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment status.' });
    }

    const updates = { status };
    if (notes) updates.notes = notes;

    const updated = await db.update('appointments', req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const appointments = await db.getCollection('appointments');
    const patients = await db.getCollection('patients');
    const doctors = await db.getCollection('doctors');
    const departments = await db.getCollection('departments');
    const enriched = enrichAppointment(updated, patients, doctors, departments, appointments);

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'APPOINTMENT_STATUS_CHANGE',
      entity_type: 'Appointment',
      entity_id: req.params.id,
      details: `Updated appointment status to ${status}`
    });

    return res.json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update appointment status.' });
  }
});

export default router;
