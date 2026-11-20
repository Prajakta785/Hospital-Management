import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

const defaultSliders = [
  {
    id: 1,
    title: 'Advanced Healthcare Services',
    subtitle: 'Providing world-class medical facilities and expert patient care with cutting-edge technology.',
    image: '/images/slider/slide-1-ward.png',
    active: true
  },
  {
    id: 2,
    title: 'Intensive Care Excellence',
    subtitle: 'State-of-the-art ICU & Critical Care departments manned by experienced specialists 24/7.',
    image: '/images/slider/slide-2-icu.png',
    active: true
  },
  {
    id: 3,
    title: 'Pediatric & Neonatal Care',
    subtitle: 'Comprehensive and compassionate pediatric healthcare tailored for newborns and children.',
    image: '/images/slider/slide-4-pediatric.png',
    active: true
  },
  {
    id: 4,
    title: 'Robotic & Precision Surgery',
    subtitle: 'Pioneering minimally invasive surgeries with robotic precision and ultra-fast recovery.',
    image: '/images/slider/slide-5-robotics.png',
    active: true
  }
];

// GET /api/settings/sliders/all or /api/settings/sliders
router.get(['/sliders/all', '/sliders'], async (req, res) => {
  try {
    const settings = await db.getSettings();
    const sliders = settings?.sliders || defaultSliders;
    return res.json({ success: true, count: sliders.length, data: sliders });
  } catch (err) {
    return res.json({ success: true, count: defaultSliders.length, data: defaultSliders });
  }
});

// POST or PUT /api/settings/sliders
router.all(['/sliders', '/sliders/all'], async (req, res) => {
  if (req.method === 'GET') {
    const settings = await db.getSettings();
    const sliders = settings?.sliders || defaultSliders;
    return res.json({ success: true, count: sliders.length, data: sliders });
  }
  try {
    const updatedSliders = req.body?.sliders || req.body || defaultSliders;
    await db.updateSettings({ sliders: updatedSliders });
    return res.json({ success: true, message: 'Sliders updated successfully.', data: updatedSliders });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update sliders.' });
  }
});

// GET /api/settings or /api/settings/general
router.get(['/', '/general'], async (req, res) => {
  try {
    const settings = await db.getSettings();
    return res.json({ success: true, data: settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve settings.' });
  }
});

// PUT /api/settings or /api/settings/general
router.put(['/', '/general'], async (req, res) => {
  try {
    const updated = await db.updateSettings(req.body);
    return res.json({ success: true, message: 'Settings saved successfully.', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
});

// Fallback for any other /api/settings/* to prevent 404 errors
router.all('*', async (req, res) => {
  try {
    const settings = await db.getSettings();
    return res.json({ success: true, data: settings });
  } catch (err) {
    return res.json({ success: true, data: {} });
  }
});

export default router;
