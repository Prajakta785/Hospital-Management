// ApexCare Hospital Management System - Complete Cloud Firestore & Storage Service Layer
// Real-time synchronization (onSnapshot), Full CRUD, Role-based operations & Storage uploads

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestoreDb, storage, isFirebaseConfigured } from './config.js';

// Base helper for Collection references
export const getColRef = (colName) => {
  if (!firestoreDb) return null;
  return collection(firestoreDb, colName);
};

// ----------------------------------------------------
// 1. UNIVERSAL FIRESTORE CRUD OPERATIONS
// ----------------------------------------------------

export async function fetchCollection(colName, constraints = []) {
  if (!firestoreDb) return [];
  try {
    const q = constraints.length > 0
      ? query(collection(firestoreDb, colName), ...constraints)
      : collection(firestoreDb, colName);
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (err) {
    console.warn(`[Firestore] fetchCollection '${colName}' notice:`, err.message);
    return [];
  }
}

export async function fetchDocument(colName, docId) {
  if (!firestoreDb) return null;
  try {
    const dRef = doc(firestoreDb, colName, String(docId));
    const snap = await getDoc(dRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (err) {
    console.warn(`[Firestore] fetchDocument '${colName}/${docId}' error:`, err.message);
    return null;
  }
}

export async function createDocument(colName, data) {
  if (!firestoreDb) return null;
  try {
    const col = collection(firestoreDb, colName);
    const payload = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _serverTimestamp: serverTimestamp()
    };
    const docRef = await addDoc(col, payload);
    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error(`[Firestore] createDocument error on '${colName}':`, err);
    throw err;
  }
}

export async function updateDocument(colName, docId, data) {
  if (!firestoreDb) return null;
  try {
    const dRef = doc(firestoreDb, colName, String(docId));
    const payload = {
      ...data,
      updated_at: new Date().toISOString()
    };
    await updateDoc(dRef, payload);
    return { id: docId, ...payload };
  } catch (err) {
    console.error(`[Firestore] updateDocument error on '${colName}/${docId}':`, err);
    throw err;
  }
}

export async function deleteDocument(colName, docId) {
  if (!firestoreDb) return false;
  try {
    const dRef = doc(firestoreDb, colName, String(docId));
    await deleteDoc(dRef);
    return true;
  } catch (err) {
    console.error(`[Firestore] deleteDocument error on '${colName}/${docId}':`, err);
    throw err;
  }
}

// ----------------------------------------------------
// 2. REAL-TIME DATA SYNCHRONIZATION (onSnapshot)
// ----------------------------------------------------

export function subscribeToCollection(colName, callback, constraints = []) {
  if (!firestoreDb) return () => {};
  try {
    const q = constraints.length > 0
      ? query(collection(firestoreDb, colName), ...constraints)
      : collection(firestoreDb, colName);

    return onSnapshot(
      q,
      (snapshot) => {
        const records = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        callback(records);
      },
      (err) => {
        console.warn(`[Firestore] Real-time subscription notice on '${colName}':`, err.message);
      }
    );
  } catch (err) {
    console.warn(`[Firestore] Error establishing subscription on '${colName}':`, err.message);
    return () => {};
  }
}

// ----------------------------------------------------
// 3. FIREBASE STORAGE SERVICE (File/Document Uploads)
// ----------------------------------------------------

export async function uploadHospitalFile(file, folder = 'documents') {
  if (!storage || !file) {
    console.warn('[Firebase Storage] Storage not initialized or no file provided.');
    return null;
  }
  try {
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `hospital/${folder}/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return {
      success: true,
      downloadUrl,
      path: snapshot.metadata.fullPath,
      name: file.name,
      size: file.size,
      contentType: file.type
    };
  } catch (err) {
    console.error('[Firebase Storage] Upload error:', err);
    throw err;
  }
}

// ----------------------------------------------------
// 4. MODULE DOMAIN-SPECIFIC SERVICES
// ----------------------------------------------------

// PATIENTS
export const patientService = {
  getAll: (constraints) => fetchCollection('patients', constraints),
  getById: (id) => fetchDocument('patients', id),
  create: (data) => createDocument('patients', data),
  update: (id, data) => updateDocument('patients', id, data),
  delete: (id) => deleteDocument('patients', id),
  subscribe: (callback) => subscribeToCollection('patients', callback)
};

// DOCTORS
export const doctorService = {
  getAll: (constraints) => fetchCollection('doctors', constraints),
  getById: (id) => fetchDocument('doctors', id),
  create: (data) => createDocument('doctors', data),
  update: (id, data) => updateDocument('doctors', id, data),
  delete: (id) => deleteDocument('doctors', id),
  subscribe: (callback) => subscribeToCollection('doctors', callback)
};

// STAFF & ATTENDANCE
export const staffService = {
  getAll: () => fetchCollection('staff'),
  getById: (id) => fetchDocument('staff', id),
  create: (data) => createDocument('staff', data),
  update: (id, data) => updateDocument('staff', id, data),
  delete: (id) => deleteDocument('staff', id),
  getAttendance: () => fetchCollection('attendance'),
  punchAttendance: (data) => createDocument('attendance', data),
  subscribe: (callback) => subscribeToCollection('staff', callback),
  subscribeAttendance: (callback) => subscribeToCollection('attendance', callback)
};

// DEPARTMENTS
export const departmentService = {
  getAll: () => fetchCollection('departments'),
  getById: (id) => fetchDocument('departments', id),
  create: (data) => createDocument('departments', data),
  update: (id, data) => updateDocument('departments', id, data),
  subscribe: (callback) => subscribeToCollection('departments', callback)
};

// APPOINTMENTS
export const appointmentService = {
  getAll: (constraints) => fetchCollection('appointments', constraints),
  getById: (id) => fetchDocument('appointments', id),
  book: (data) => createDocument('appointments', { ...data, status: 'confirmed' }),
  updateStatus: (id, status, notes) => updateDocument('appointments', id, { status, notes }),
  delete: (id) => deleteDocument('appointments', id),
  subscribe: (callback) => subscribeToCollection('appointments', callback)
};

// BEDS & WARDS
export const bedService = {
  getAll: () => fetchCollection('beds'),
  getWards: () => fetchCollection('wards'),
  updateStatus: (id, status, notes) => updateDocument('beds', id, { status, notes }),
  admit: (data) => updateDocument('beds', data.bed_id, {
    status: 'occupied',
    patient_id: data.patient_id,
    patient_name: data.patient_name,
    admission_date: new Date().toISOString()
  }),
  discharge: (data) => updateDocument('beds', data.bed_id, {
    status: 'available',
    patient_id: null,
    patient_name: null,
    discharge_date: new Date().toISOString()
  }),
  subscribe: (callback) => subscribeToCollection('beds', callback)
};

// PHARMACY
export const pharmacyService = {
  getAll: () => fetchCollection('pharmacy_items'),
  add: (data) => createDocument('pharmacy_items', data),
  update: (id, data) => updateDocument('pharmacy_items', id, data),
  dispense: async (id, quantity, patient_id) => {
    const item = await fetchDocument('pharmacy_items', id);
    if (!item) throw new Error('Medicine not found in inventory');
    const newQty = Math.max(0, (item.stock_quantity || 0) - Number(quantity));
    await updateDocument('pharmacy_items', id, { stock_quantity: newQty });
    return { success: true, remaining: newQty };
  },
  subscribe: (callback) => subscribeToCollection('pharmacy_items', callback)
};

// LAB TESTS
export const labService = {
  getAll: () => fetchCollection('lab_tests'),
  getById: (id) => fetchDocument('lab_tests', id),
  order: (data) => createDocument('lab_tests', { ...data, status: 'pending', test_date: new Date().toISOString().split('T')[0] }),
  authorizeResults: (id, resultsData) => updateDocument('lab_tests', id, { ...resultsData, status: 'completed' }),
  subscribe: (callback) => subscribeToCollection('lab_tests', callback)
};

// BILLING & INVOICES
export const billingService = {
  getAll: () => fetchCollection('invoices'),
  getById: (id) => fetchDocument('invoices', id),
  create: (data) => createDocument('invoices', data),
  pay: (id, paymentData) => updateDocument('invoices', id, {
    status: 'paid',
    payment_method: paymentData.payment_method || 'Online/UPI',
    paid_at: new Date().toISOString(),
    transaction_reference: paymentData.transaction_reference || `TXN-FB-${Date.now()}`
  }),
  subscribe: (callback) => subscribeToCollection('invoices', callback)
};

// PRESCRIPTIONS
export const prescriptionService = {
  getAll: () => fetchCollection('prescriptions'),
  getById: (id) => fetchDocument('prescriptions', id),
  create: (data) => createDocument('prescriptions', data),
  delete: (id) => deleteDocument('prescriptions', id),
  subscribe: (callback) => subscribeToCollection('prescriptions', callback)
};

// SETTINGS & AUDIT
export const auditService = {
  getSettings: async () => {
    const docSnap = await fetchDocument('settings', 'hospital_config');
    return docSnap || null;
  },
  updateSettings: (data) => setDoc(doc(firestoreDb, 'settings', 'hospital_config'), data, { merge: true }),
  getLogs: () => fetchCollection('audit_logs', [orderBy('created_at', 'desc')]),
  addLog: (entry) => createDocument('audit_logs', entry)
};

