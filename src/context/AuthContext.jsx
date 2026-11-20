import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api.js';
import { useToast } from './ToastContext.jsx';
import { auth, isFirebaseConfigured } from '../firebase/config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestoreDb } from '../firebase/config.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('apexcare_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.me();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        localStorage.removeItem('apexcare_token');
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem('apexcare_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    if (!auth) {
      fetchCurrentUser();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          // Fetch role and details from Firestore users collection
          let userRole = 'admin';
          let userName = fbUser.displayName || fbUser.email.split('@')[0];
          
          if (firestoreDb) {
            const userDoc = await getDoc(doc(firestoreDb, 'users', fbUser.uid));
            if (userDoc.exists()) {
              const uData = userDoc.data();
              userRole = uData.role || 'admin';
              userName = uData.name || userName;
            }
          }

          const mappedUser = {
            id: fbUser.uid,
            email: fbUser.email,
            name: userName,
            role: userRole,
            avatar: fbUser.photoURL || '/images/doctors/doctor-2.jpg'
          };
          setUser(mappedUser);
          localStorage.setItem('apexcare_token', `fb_${fbUser.uid}`);
        } catch (e) {
          console.warn('[Firebase Auth] User profile mapping notice:', e.message);
        } finally {
          setLoading(false);
        }
      } else {
        fetchCurrentUser();
      }
    });

    return () => unsubscribe();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    // 1. Try Firebase Authentication first if configured
    if (auth && isFirebaseConfigured) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        let userRole = 'admin';
        let userName = cred.user.displayName || email.split('@')[0];

        if (firestoreDb) {
          const userDoc = await getDoc(doc(firestoreDb, 'users', cred.user.uid));
          if (userDoc.exists()) {
            const uData = userDoc.data();
            userRole = uData.role || 'admin';
            userName = uData.name || userName;
          }
        }

        const loggedUser = {
          id: cred.user.uid,
          email: cred.user.email,
          name: userName,
          role: userRole
        };
        setUser(loggedUser);
        localStorage.setItem('apexcare_token', `fb_${cred.user.uid}`);
        toast.success(`Welcome to ApexCare, ${loggedUser.name}!`);
        return { success: true, user: loggedUser };
      } catch (fbErr) {
        console.warn('[Firebase Auth] Direct sign-in attempt, trying system fallback:', fbErr.message);
      }
    }

    // 2. Standard Resilient Login Flow
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('apexcare_token', res.token);
        setUser(res.user);
        toast.success(`Welcome back, ${res.user.name}!`);
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      toast.error(err.message || 'Invalid email or password');
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    // 1. Try Firebase Authentication Registration if configured
    if (auth && isFirebaseConfigured) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        if (userData.name) {
          await updateProfile(cred.user, { displayName: userData.name });
        }
        if (firestoreDb) {
          await setDoc(doc(firestoreDb, 'users', cred.user.uid), {
            uid: cred.user.uid,
            name: userData.name || 'Hospital User',
            email: userData.email,
            role: userData.role || 'patient',
            phone: userData.phone || '',
            created_at: new Date().toISOString()
          });
        }
        const newUser = {
          id: cred.user.uid,
          email: cred.user.email,
          name: userData.name || 'Hospital User',
          role: userData.role || 'patient'
        };
        setUser(newUser);
        localStorage.setItem('apexcare_token', `fb_${cred.user.uid}`);
        toast.success(`Account created successfully! Welcome to ApexCare.`);
        return { success: true, user: newUser };
      } catch (fbErr) {
        console.warn('[Firebase Auth] Register notice, trying system fallback:', fbErr.message);
      }
    }

    // 2. Standard Resilient Registration Flow
    try {
      const res = await authApi.register(userData);
      if (res.success && res.token) {
        localStorage.setItem('apexcare_token', res.token);
        setUser(res.user);
        toast.success(`Account created successfully! Welcome to ApexCare.`);
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        // Ignore
      }
    }
    localStorage.removeItem('apexcare_token');
    localStorage.removeItem('apexcare_superadmin_mode');
    localStorage.removeItem('apexcare_active_page');
    setUser(null);
    toast.info('You have logged out.');
  };

  const switchDemoRole = async (role) => {
    try {
      const res = await authApi.switchDemo(role);
      if (res.success && res.token) {
        localStorage.setItem('apexcare_token', res.token);
        setUser(res.user);
        toast.success(`Switched active view to demo ${role.toUpperCase()}: ${res.user.name}`);
        return { success: true, user: res.user };
      }
    } catch (err) {
      toast.error(`Failed to switch to ${role} demo: ${err.message}`);
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isDoctor: user?.role === 'doctor',
        isStaff: user?.role === 'staff' || user?.role === 'admin',
        isPatient: user?.role === 'patient',
        login,
        register,
        logout,
        switchDemoRole,
        refreshUser: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
