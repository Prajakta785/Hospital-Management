import express from 'express';
import { db } from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { calculateInventoryRisk, checkDrugSafety } from '../services/clinicalLogic.js';

const router = express.Router();

// GET /api/pharmacy (Enriched with Reorder Point & Expiry Risk intelligence)
router.get('/', async (req, res) => {
  try {
    const { category, lowStock, search } = req.query;
    let items = await db.getCollection('pharmacy_items');

    if (category) {
      items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }

    if (lowStock === 'true') {
      items = items.filter(i => i.stock_quantity <= i.min_stock_level);
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.generic_name && i.generic_name.toLowerCase().includes(q)) ||
        i.batch_number.toLowerCase().includes(q)
      );
    }

    // Enrich with operational inventory intelligence
    const enriched = items.map(item => {
      const risk = calculateInventoryRisk(item.stock_quantity, item.min_stock_level, item.expiry_date);
      return {
        ...item,
        inventoryRisk: risk
      };
    });

    const totalSKUs = items.length;
    const lowStockCount = items.filter(i => i.stock_quantity <= i.min_stock_level).length;
    const criticalExpiryCount = enriched.filter(i => i.inventoryRisk.expiryRisk === 'CRITICAL_EXPIRY_RISK').length;

    return res.json({
      success: true,
      summary: {
        totalSKUs,
        lowStockCount,
        criticalExpiryCount
      },
      data: enriched
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve pharmacy catalog.' });
  }
});

// POST /api/pharmacy/check-safety (Drug Allergy & Contraindication Logic)
router.post('/check-safety', async (req, res) => {
  try {
    const { medicine_name, patient_id } = req.body;
    if (!medicine_name || !patient_id) {
      return res.status(400).json({ success: false, message: 'Medicine name and Patient ID are required.' });
    }

    const patient = await db.findById('patients', patient_id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const safetyReport = checkDrugSafety(medicine_name, patient.allergies || '');
    return res.json({
      success: true,
      patientName: `${patient.first_name} ${patient.last_name}`,
      patientAllergies: patient.allergies || 'None known',
      safetyReport
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Safety check error.' });
  }
});

// POST /api/pharmacy (Staff/Admin)
router.post('/', verifyToken, requireRole(['admin', 'staff', 'doctor']), async (req, res) => {
  try {
    const {
      name,
      generic_name,
      category,
      dosage_form,
      strength,
      unit_price,
      stock_quantity,
      min_stock_level,
      batch_number,
      expiry_date,
      supplier
    } = req.body;

    if (!name || !category || !unit_price || !batch_number || !expiry_date) {
      return res.status(400).json({ success: false, message: 'Name, category, unit price, batch number, and expiry date are required.' });
    }

    const stock = parseInt(stock_quantity || 0, 10);
    const minStock = parseInt(min_stock_level || 20, 10);
    let status = 'in_stock';
    if (stock === 0) status = 'out_of_stock';
    else if (stock <= minStock) status = 'low_stock';

    const newItem = await db.insert('pharmacy_items', {
      name: name.trim(),
      generic_name: generic_name || '',
      category: category.trim(),
      dosage_form: dosage_form || 'Tablet',
      strength: strength || '',
      unit_price: parseFloat(unit_price),
      stock_quantity: stock,
      min_stock_level: minStock,
      batch_number: batch_number.trim(),
      expiry_date,
      supplier: supplier || 'Approved Medical Distributor',
      status
    });

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'PHARMACY_ITEM_ADDED',
      entity_type: 'Pharmacy',
      entity_id: newItem.id.toString(),
      details: `Added medicine ${newItem.name} (${newItem.batch_number}) - ${stock} units`
    });

    const risk = calculateInventoryRisk(newItem.stock_quantity, newItem.min_stock_level, newItem.expiry_date);
    return res.status(201).json({ success: true, data: { ...newItem, inventoryRisk: risk } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add pharmacy item.' });
  }
});

// PUT /api/pharmacy/:id
router.put('/:id', verifyToken, requireRole(['admin', 'staff', 'doctor']), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.stock_quantity !== undefined) {
      updates.stock_quantity = parseInt(updates.stock_quantity, 10);
      const min = parseInt(updates.min_stock_level || 20, 10);
      if (updates.stock_quantity === 0) updates.status = 'out_of_stock';
      else if (updates.stock_quantity <= min) updates.status = 'low_stock';
      else updates.status = 'in_stock';
    }

    const updated = await db.update('pharmacy_items', req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Medicine item not found.' });
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update medicine item.' });
  }
});

// POST /api/pharmacy/:id/dispense (With patient allergy safeguard check)
router.post('/:id/dispense', verifyToken, requireRole(['admin', 'staff', 'doctor']), async (req, res) => {
  try {
    const { quantity = 1, patient_id } = req.body;
    const item = await db.findById('pharmacy_items', req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Medicine item not found.' });
    }

    // Safety check if patient_id is supplied
    if (patient_id) {
      const patient = await db.findById('patients', patient_id);
      if (patient) {
        const check = checkDrugSafety(item.name, patient.allergies || '');
        if (check.hasCriticalWarning) {
          return res.status(400).json({
            success: false,
            message: `DISPENSING BLOCKED BY PHARMACOVIGILANCE: ${check.alerts[0].message}`,
            safetyReport: check
          });
        }
      }
    }

    const dispenseQty = parseInt(quantity, 10);
    if (item.stock_quantity < dispenseQty) {
      return res.status(400).json({ success: false, message: `Insufficient inventory. Only ${item.stock_quantity} units available.` });
    }

    const newStock = item.stock_quantity - dispenseQty;
    let newStatus = 'in_stock';
    if (newStock === 0) newStatus = 'out_of_stock';
    else if (newStock <= item.min_stock_level) newStatus = 'low_stock';

    const updated = await db.update('pharmacy_items', req.params.id, {
      stock_quantity: newStock,
      status: newStatus
    });

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'MEDICINE_DISPENSED',
      entity_type: 'Pharmacy',
      entity_id: req.params.id,
      details: `Dispensed ${dispenseQty} units of ${item.name}. Remaining stock: ${newStock}`
    });

    return res.json({ success: true, message: `Dispensed ${dispenseQty} units safely.`, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to dispense medicine.' });
  }
});

export default router;
