import express from 'express';
import { db } from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { calculateInsuranceSplit } from '../services/clinicalLogic.js';

const router = express.Router();

function enrichInvoice(inv, patients) {
  const patient = patients.find(p => p.id === inv.patient_id);
  const insuranceSplit = calculateInsuranceSplit(inv.total_amount, patient?.insurance_provider || 'Self-Pay');

  return {
    ...inv,
    patientName: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient',
    patientMrn: patient?.mrn || '',
    patientPhone: patient?.phone || '',
    patientEmail: patient?.email || '',
    patientAddress: patient?.address || '',
    patientInsurance: patient?.insurance_provider || 'Self-Pay',
    insuranceSplit
  };
}

// GET /api/billing
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, patientId } = req.query;
    let invoices = await db.getCollection('invoices');
    const patients = await db.getCollection('patients');

    // Role check: if patient, only see own invoices
    if (req.user.role === 'patient') {
      const patientRecord = patients.find(p => p.user_id === req.user.id || p.email === req.user.email);
      if (!patientRecord) return res.json({ success: true, data: [] });
      invoices = invoices.filter(i => i.patient_id === patientRecord.id);
    }

    if (patientId) {
      const pId = parseInt(patientId, 10);
      invoices = invoices.filter(i => i.patient_id === pId);
    }

    if (status) {
      invoices = invoices.filter(i => i.status === status);
    }

    // Sort descending by ID / created_at
    invoices.sort((a, b) => b.id - a.id);

    const enriched = invoices.map(i => enrichInvoice(i, patients));
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (parseFloat(i.total_amount) || 0), 0);
    const pendingAmount = invoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + (parseFloat(i.total_amount) || 0), 0);

    return res.json({
      success: true,
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingAmount: Math.round(pendingAmount * 100) / 100,
        totalInvoices: invoices.length,
        unpaidCount: invoices.filter(i => i.status === 'unpaid').length
      },
      data: enriched
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve invoices.' });
  }
});

// GET /api/billing/paid-transactions - Public/Patient endpoint showing who made payments
router.get('/paid-transactions', async (req, res) => {
  try {
    const invoices = await db.getCollection('invoices');
    const patients = await db.getCollection('patients');

    // Filter only paid invoices
    const paidInvoices = invoices.filter(i => i.status === 'paid');

    // Enrich with patient details
    const enriched = paidInvoices.map(i => enrichInvoice(i, patients));
    enriched.sort((a, b) => b.id - a.id);

    const totalPaidAmount = paidInvoices.reduce((sum, i) => sum + (parseFloat(i.total_amount) || 0), 0);

    return res.json({
      success: true,
      count: enriched.length,
      totalPaidAmount: Math.round(totalPaidAmount * 100) / 100,
      data: enriched
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve paid transactions.' });
  }
});

// GET /api/billing/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const inv = await db.findById('invoices', req.params.id);
    if (!inv) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const patients = await db.getCollection('patients');
    const enriched = enrichInvoice(inv, patients);
    return res.json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve invoice.' });
  }
});

// POST /api/billing/auto-discharge (Smart Auto-Billing Logic)
// Automatically computes all charges (bed days + lab tests + consultation) for a patient!
router.post('/auto-discharge', verifyToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { patient_id } = req.body;
    if (!patient_id) {
      return res.status(400).json({ success: false, message: 'Patient ID is required.' });
    }

    const patient = await db.findById('patients', patient_id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const beds = await db.getCollection('beds');
    const wards = await db.getCollection('wards');
    const labTests = await db.getCollection('lab_tests');

    const allocatedBed = beds.find(b => b.current_patient_id === parseInt(patient_id, 10));
    const patientLabs = labTests.filter(l => l.patient_id === parseInt(patient_id, 10));

    const lineItems = [];

    // 1. Bed Stay Charge
    if (allocatedBed) {
      const ward = wards.find(w => w.id === allocatedBed.ward_id);
      const admittedAt = new Date(allocatedBed.admitted_at || Date.now());
      const now = new Date();
      const diffDays = Math.max(1, Math.round((now - admittedAt) / (1000 * 60 * 60 * 24)));
      const rate = parseFloat(ward?.daily_rate || 180.00);

      lineItems.push({
        description: `${ward?.name || 'Inpatient Bed'} (${allocatedBed.bed_number}) - ${diffDays} Night(s)`,
        category: 'Room & Board',
        quantity: diffDays,
        unit_price: rate,
        total: Math.round(diffDays * rate * 100) / 100
      });
    }

    // 2. Clinical Attending Physician Fee
    lineItems.push({
      description: 'Senior Consultant Round Visits & Clinical Care',
      category: 'Consultation',
      quantity: 1,
      unit_price: 150.00,
      total: 150.00
    });

    // 3. Laboratory Diagnostics
    if (patientLabs.length > 0) {
      for (const lab of patientLabs) {
        lineItems.push({
          description: `Diagnostic Pathology: ${lab.test_name}`,
          category: 'Diagnostics',
          quantity: 1,
          unit_price: 85.00,
          total: 85.00
        });
      }
    } else {
      lineItems.push({
        description: 'Comprehensive Metabolic Diagnostic Panel',
        category: 'Diagnostics',
        quantity: 1,
        unit_price: 95.00,
        total: 95.00
      });
    }

    // 4. Pharmacy & Nursing IV Consumables
    lineItems.push({
      description: 'Inpatient Pharmacy Medications & Sterile IV Consumables',
      category: 'Pharmacy',
      quantity: 1,
      unit_price: 110.00,
      total: 110.00
    });

    const subtotal = lineItems.reduce((sum, it) => sum + it.total, 0);
    const taxRate = 5.0;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoice_number = `INV-${year}-${randomSuffix}`;

    const newInvoice = await db.insert('invoices', {
      invoice_number,
      patient_id: parseInt(patient_id, 10),
      appointment_id: null,
      subtotal: Math.round(subtotal * 100) / 100,
      tax_rate: taxRate,
      tax_amount: Math.round(taxAmount * 100) / 100,
      discount_amount: 0.00,
      total_amount: Math.round(totalAmount * 100) / 100,
      status: 'unpaid',
      payment_method: null,
      transaction_ref: null,
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      paid_at: null,
      notes: 'Auto-compiled Comprehensive Inpatient Discharge Bill',
      items: lineItems.map((item, idx) => ({ id: idx + 1, ...item }))
    });

    const patients = await db.getCollection('patients');
    const enriched = enrichInvoice(newInvoice, patients);

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'AUTO_DISCHARGE_BILL_GENERATED',
      entity_type: 'Invoice',
      entity_id: newInvoice.id.toString(),
      details: `Generated auto-discharge bill ${invoice_number} for ${patient.first_name} ${patient.last_name} (₹${newInvoice.total_amount})`
    });

    return res.status(201).json({ success: true, message: 'Discharge bill automatically generated.', data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to auto-generate discharge bill.' });
  }
});

// POST /api/billing (Staff/Admin)
router.post('/', verifyToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const {
      patient_id,
      appointment_id,
      items = [],
      tax_rate = 5.0,
      discount_amount = 0.0,
      due_date,
      notes
    } = req.body;

    if (!patient_id || !items.length) {
      return res.status(400).json({ success: false, message: 'Patient ID and at least one item line are required.' });
    }

    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.unit_price) * parseInt(item.quantity || 1, 10)), 0);
    const taxAmount = (subtotal * parseFloat(tax_rate)) / 100;
    const discount = parseFloat(discount_amount || 0);
    const totalAmount = Math.max(0, subtotal + taxAmount - discount);

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoice_number = `INV-${year}-${randomSuffix}`;

    const newInvoice = await db.insert('invoices', {
      invoice_number,
      patient_id: parseInt(patient_id, 10),
      appointment_id: appointment_id ? parseInt(appointment_id, 10) : null,
      subtotal: Math.round(subtotal * 100) / 100,
      tax_rate: parseFloat(tax_rate),
      tax_amount: Math.round(taxAmount * 100) / 100,
      discount_amount: Math.round(discount * 100) / 100,
      total_amount: Math.round(totalAmount * 100) / 100,
      status: 'unpaid',
      payment_method: null,
      transaction_ref: null,
      due_date: due_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      paid_at: null,
      notes: notes || 'Standard Hospital Services Invoice',
      items: items.map((item, idx) => ({
        id: idx + 1,
        description: item.description,
        category: item.category || 'Clinical Care',
        quantity: parseInt(item.quantity || 1, 10),
        unit_price: parseFloat(item.unit_price),
        total: Math.round(parseFloat(item.unit_price) * parseInt(item.quantity || 1, 10) * 100) / 100
      }))
    });

    const patients = await db.getCollection('patients');
    const enriched = enrichInvoice(newInvoice, patients);

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'INVOICE_GENERATED',
      entity_type: 'Invoice',
      entity_id: newInvoice.id.toString(),
      details: `Generated invoice ${invoice_number} for ${enriched.patientName} total ₹${newInvoice.total_amount}`
    });

    return res.status(201).json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create invoice.' });
  }
});

// POST /api/billing/:id/pay
router.post('/:id/pay', verifyToken, async (req, res) => {
  try {
    const { payment_method = 'Credit Card', transaction_ref } = req.body;
    const inv = await db.findById('invoices', req.params.id);

    if (!inv) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const txRef = transaction_ref || `TXN-PAY-${Math.floor(100000 + Math.random() * 900000)}`;

    const updated = await db.update('invoices', req.params.id, {
      status: 'paid',
      payment_method,
      transaction_ref: txRef,
      paid_at: new Date().toISOString()
    });

    const patients = await db.getCollection('patients');
    const enriched = enrichInvoice(updated, patients);

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'INVOICE_PAID',
      entity_type: 'Invoice',
      entity_id: req.params.id,
      details: `Processed payment of ₹${inv.total_amount} via ${payment_method} (${txRef}) for invoice ${inv.invoice_number}`
    });

    return res.json({ success: true, message: 'Payment processed successfully.', data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to process payment.' });
  }
});

export default router;
