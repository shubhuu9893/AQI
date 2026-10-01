/**
 * context/AuthContext.jsx
 *
 * Provides global Firebase auth state to the entire app.
 * Wraps Firebase onAuthStateChanged so every component can
 * read `user`, `loading`, and call `logout`.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true until Firebase resolves

  // Listen to auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub; // cleanup listener on unmount
  }, []);

  // ── Auth actions ────────────────────────────────────────────

  async function loginWithEmail(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  async function signupWithEmail(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred.user;
  }

  async function loginWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  }

  async function logout() {
    await signOut(auth);
  }

  // Update profile display name & optional photo
  async function updateUserProfile(displayName, photoURL) {
    if (!auth.currentUser) throw new Error("No user is currently signed in.");
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (photoURL !== undefined) updates.photoURL = photoURL;
    await updateProfile(auth.currentUser, updates);
    // Refresh local user state
    setUser({ ...auth.currentUser });
    return auth.currentUser;
  }

  // Update password with optional re-authentication
  async function updateUserPassword(newPassword, currentPassword) {
    if (!auth.currentUser) throw new Error("No user is currently signed in.");
    const { updatePassword, EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');

    // If current password provided, re-authenticate first
    if (currentPassword && auth.currentUser.email) {
      const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, cred);
    }

    await updatePassword(auth.currentUser, newPassword);
    return true;
  }

  // Check if current user logged in with password provider
  const isPasswordProvider = user?.providerData?.some(p => p.providerId === 'password') ?? false;

  const value = {
    user,
    loading,
    isPasswordProvider,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logout,
    updateUserProfile,
    updateUserPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/** Convenience hook — use inside any component */
export function useAuth() {
  return useContext(AuthContext);
}
