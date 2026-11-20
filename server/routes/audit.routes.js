import express from 'express';
import { db } from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/audit (Admin only)
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { action, limit = 50 } = req.query;
    let logs = await db.getCollection('audit_logs');

    if (action) {
      logs = logs.filter(l => l.action.toLowerCase().includes(action.toLowerCase()));
    }

    // Sort newest first
    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const sliced = logs.slice(0, parseInt(limit, 10));

    return res.json({ success: true, count: sliced.length, data: sliced });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
  }
});

// GET /api/audit/settings (Public or authenticated)
router.get('/settings', async (req, res) => {
  try {
    const settings = await db.getSettings();
    return res.json({ success: true, data: settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve settings.' });
  }
});

// PUT /api/audit/settings (Admin only)
router.put('/settings', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const updated = await db.updateSettings(req.body);

    await db.addAuditLog({
      user_id: req.user.id,
      user_name: req.user.name,
      role: req.user.role,
      action: 'SYSTEM_SETTINGS_UPDATED',
      entity_type: 'SystemSettings',
      entity_id: 'SETTINGS',
      details: 'Hospital core configuration values modified.'
    });

    return res.json({ success: true, message: 'Settings saved successfully.', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
});

export default router;
