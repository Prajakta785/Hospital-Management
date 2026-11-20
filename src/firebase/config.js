// ApexCare Hospital Management System - Firebase Configuration
// Cloud Firestore + Firebase Authentication + Firebase Storage Integration

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoApexCareHospitalKey2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'apexcare-hospital-management.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'apexcare-hospital-management',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'apexcare-hospital-management.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '102938475612',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:102938475612:web:7a8b9c0d1e2f3a4b5c6d7e'
};

// Check if credentials are production vs placeholder
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  !import.meta.env.VITE_FIREBASE_API_KEY.includes('Demo') &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  !import.meta.env.VITE_FIREBASE_PROJECT_ID.includes('Demo')
);

// Initialize Firebase App safely
let app;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  console.log('[Firebase] Initialized ApexCare Firebase Client SDK successfully.');
} catch (err) {
  console.warn('[Firebase] Initialization notice:', err.message);
  app = getApps().length > 0 ? getApp() : null;
}

export const auth = app ? getAuth(app) : null;
export const firestoreDb = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export default app;

