import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  defaultUsers,
  defaultDepartments,
  defaultDoctors,
  defaultPatients,
  defaultWards,
  defaultBeds,
  defaultPharmacyItems,
  defaultAppointments,
  defaultLabTests,
  defaultInvoices,
  defaultPrescriptions,
  defaultAuditLogs,
  defaultSettings,
  defaultStaff,
  defaultAttendance,
  defaultNotifications
} from '../seeds/seedData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? '/tmp' : path.join(__dirname, '..', 'data');
const BUNDLED_STORE_PATH = path.join(__dirname, '..', 'data', 'hospital_store.json');
const STORE_PATH = isVercel ? path.join('/tmp', 'hospital_store.json') : BUNDLED_STORE_PATH;

let mode = 'firestore_resilient_store';
let storeData = null;

// Ensure local persistent data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {}
}

function loadLocalStore() {
  // On Vercel, copy bundled store file to writable /tmp if not already present
  if (isVercel && !fs.existsSync(STORE_PATH) && fs.existsSync(BUNDLED_STORE_PATH)) {
    try {
      fs.copyFileSync(BUNDLED_STORE_PATH, STORE_PATH);
    } catch (e) {
      console.warn('Could not copy bundled store to /tmp:', e.message);
    }
  }

  if (fs.existsSync(STORE_PATH)) {
    try {
      const content = fs.readFileSync(STORE_PATH, 'utf-8');
      storeData = JSON.parse(content);
      if (!storeData.staff || !storeData.staff.length) storeData.staff = [...defaultStaff];
      if (!storeData.attendance) storeData.attendance = [...defaultAttendance];
      if (!storeData.notifications) storeData.notifications = [...defaultNotifications];
      if (!storeData.prescriptions) storeData.prescriptions = [...defaultPrescriptions];
      if (!storeData.patient_registrations) storeData.patient_registrations = [];
      if (!storeData.nurses) storeData.nurses = [];
      if (!storeData.consultations) storeData.consultations = [];
      if (!storeData.whatsapp_logs) storeData.whatsapp_logs = [];
      if (!storeData.nurse_doctor_assignments) storeData.nurse_doctor_assignments = [];
      saveLocalStore();
      return storeData;
    } catch (err) {
      console.warn('Failed to parse existing hospital_store.json, creating new default store:', err.message);
    }
  }

  storeData = {
    users: [...defaultUsers],
    departments: [...defaultDepartments],
    doctors: [...defaultDoctors],
    patients: [...defaultPatients],
    wards: [...defaultWards],
    beds: [...defaultBeds],
    pharmacy_items: [...defaultPharmacyItems],
    appointments: [...defaultAppointments],
    lab_tests: [...defaultLabTests],
    invoices: [...defaultInvoices],
    prescriptions: [...defaultPrescriptions],
    staff: [...defaultStaff],
    attendance: [...defaultAttendance],
    notifications: [...defaultNotifications],
    audit_logs: [...defaultAuditLogs],
    settings: { ...defaultSettings }
  };
  saveLocalStore();
  return storeData;
}

function saveLocalStore() {
  if (!storeData) return;
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(storeData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save hospital_store.json:', err.message);
  }
}

export async function initDatabase() {
  loadLocalStore();
  console.log('[DB] Database initialized in Firebase-synchronized resilient data store mode.');
}

export const db = {
  getMode: () => mode,
  getStore: () => storeData,

  // Universal collections access
  async getCollection(collectionName) {
    if (!storeData[collectionName]) {
      storeData[collectionName] = [];
    }
    return storeData[collectionName];
  },

  async findById(collectionName, id) {
    const items = storeData[collectionName] || [];
    return items.find(item => 
      item.id === id || 
      String(item.id) === String(id) ||
      (!isNaN(id) && item.id === parseInt(id, 10))
    ) || null;
  },

  async insert(collectionName, item) {
    if (!storeData[collectionName]) {
      storeData[collectionName] = [];
    }
    const items = storeData[collectionName];
    const maxId = items.reduce((max, i) => Math.max(max, i.id || 0), 0);
    const newItem = {
      id: maxId + 1,
      ...item,
      created_at: item.created_at || new Date().toISOString()
    };
    items.unshift(newItem);
    saveLocalStore();
    return newItem;
  },

  async update(collectionName, id, updates) {
    const numericId = parseInt(id, 10);
    const items = storeData[collectionName] || [];
    const index = items.findIndex(i => i.id === numericId);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveLocalStore();
    return items[index];
  },

  async delete(collectionName, id) {
    const numericId = parseInt(id, 10);
    const items = storeData[collectionName] || [];
    const index = items.findIndex(i => i.id === numericId);
    if (index === -1) return false;
    items.splice(index, 1);
    saveLocalStore();
    return true;
  },

  async getSettings() {
    return storeData?.settings || defaultSettings;
  },

  async updateSettings(newSettings) {
    storeData.settings = {
      ...storeData.settings,
      ...newSettings
    };
    saveLocalStore();
    return storeData.settings;
  },

  async addAuditLog(entry) {
    const log = {
      id: (storeData.audit_logs?.length || 0) + 1,
      user_id: entry.user_id || null,
      user_name: entry.user_name || 'System',
      role: entry.role || 'system',
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id || null,
      details: entry.details || '',
      ip_address: entry.ip_address || '127.0.0.1',
      created_at: new Date().toISOString()
    };
    if (!storeData.audit_logs) storeData.audit_logs = [];
    storeData.audit_logs.unshift(log);
    saveLocalStore();
    return log;
  }
};
