import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initDatabase, db } from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import departmentRoutes from './routes/departments.routes.js';
import doctorRoutes from './routes/doctors.routes.js';
import patientRoutes from './routes/patients.routes.js';
import appointmentRoutes from './routes/appointments.routes.js';
import bedRoutes from './routes/beds.routes.js';
import pharmacyRoutes from './routes/pharmacy.routes.js';
import labRoutes from './routes/lab.routes.js';
import billingRoutes from './routes/billing.routes.js';
import reportRoutes from './routes/reports.routes.js';
import auditRoutes from './routes/audit.routes.js';
import prescriptionRoutes from './routes/prescriptions.routes.js';
import staffRoutes from './routes/staff.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import contactRoutes from './routes/contact.routes.js';
import workflowRoutes from './routes/clinicalWorkflow.routes.js';
import settingsRoutes from './routes/settings.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const possibleDistPaths = [
  path.join(process.cwd(), 'dist'),
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, 'dist')
];
const distPath = possibleDistPaths.find(p => fs.existsSync(p)) || possibleDistPaths[1];
const indexHtmlPath = path.join(distPath, 'index.html');

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Serve static assets from production build if available
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Mount Modular API Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'ApexCare Hospital Management System API',
    databaseMode: db.getMode()
  });
});

// Intelligent Frontend Router & Auto-Redirect (Never show "Cannot GET /")
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  // If built frontend exists (production or local dist), serve it immediately
  if (fs.existsSync(indexHtmlPath)) {
    return res.sendFile(indexHtmlPath);
  }

  const host = req.hostname || 'localhost';
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.');

  // ONLY redirect to port 5173 during local development (NEVER on Vercel / Cloud)
  if (isLocal && !process.env.VERCEL && process.env.NODE_ENV !== 'production') {
    const targetUrl = `http://${host}:5173${req.originalUrl || req.url || '/'}`;
    if (req.accepts('html')) {
      return res.redirect(targetUrl);
    }
  }

  res.json({
    status: 'online',
    message: 'ApexCare Hospital API Server is active.',
    healthCheck: `/api/health`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Boot standalone server (only when not running inside Vercel serverless functions)
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🏥 ApexCare Hospital API Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💾 Database Storage Mode: ${db.getMode()}`);
    console.log(`====================================================`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

/* reload_trigger: 1795084533699 */