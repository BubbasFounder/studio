'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { generateSalt, deriveKeyFromPassphrase, encryptData, decryptData, generateRecoveryKey, encryptRecoveryKey, decryptRecoveryKey } from '@/lib/crypto';

// Define the shape of the user object stored in context
interface UserProfile extends FirebaseUser {
  passphraseSalt?: string;
  encryptedRecoveryKey?: string;
  recoveryKeyIV?: string;
  // Add other custom user properties here if needed, e.g., tier, preferences
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  encryptionKey: CryptoKey | null;
  passphraseSalt: string | null;
  setPassphraseAndRecovery: (passphrase: string) => Promise<{ recoveryKey: string } | null>;
  unlockWithPassphrase: (passphrase: string) => Promise<boolean>;
  logout: () => Promise<void>;
  // login and signup will be handled by pages, this context primarily manages session
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [passphraseSalt, setPassphraseSalt] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const fullUser = { ...firebaseUser, ...userData } as UserProfile;
          setUser(fullUser);
          if (userData.passphraseSalt) {
            setPassphraseSalt(userData.passphraseSalt);
            // User needs to enter passphrase to unlock data
            // This will be handled by a prompt in UI components
          } else {
            // New user or passphrase not set, may need to prompt setup
          }
        } else {
          // This case might happen if user doc creation failed during signup
          // Or if it's a new signup and doc isn't created yet (handled by signup flow)
          setUser(firebaseUser as UserProfile); // Basic user info
        }
      } else {
        setUser(null);
        setEncryptionKey(null);
        setPassphraseSalt(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setPassphraseAndRecovery = async (passphrase: string): Promise<{ recoveryKey: string } | null> => {
    if (!user) return null;
    setLoading(true);
    try {
      const salt = generateSalt();
      const key = await deriveKeyFromPassphrase(passphrase, salt);
      const recoveryKey = generateRecoveryKey();
      
      const { iv: recoveryIv, ciphertext: encryptedRecoveryKeyCiphertext } = await encryptRecoveryKey(recoveryKey, key);

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { 
        passphraseSalt: salt,
        encryptedRecoveryKey: encryptedRecoveryKeyCiphertext,
        recoveryKeyIV: recoveryIv
      }, { merge: true });

      setUser(prevUser => prevUser ? ({ ...prevUser, passphraseSalt: salt, encryptedRecoveryKey: encryptedRecoveryKeyCiphertext, recoveryKeyIV: recoveryIv }) : null);
      setPassphraseSalt(salt);
      setEncryptionKey(key);
      setLoading(false);
      return { recoveryKey };
    } catch (error) {
      console.error("Error setting passphrase and recovery key:", error);
      setLoading(false);
      return null;
    }
  };

  const unlockWithPassphrase = async (passphrase: string): Promise<boolean> => {
    if (!user || !passphraseSalt) return false;
    setLoading(true);
    try {
      const key = await deriveKeyFromPassphrase(passphrase, passphraseSalt);
      setEncryptionKey(key);
      // Optionally, test decryption of recovery key here to verify passphrase
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error unlocking with passphrase:", error);
      setEncryptionKey(null); // Clear key on failure
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setEncryptionKey(null);
      setPassphraseSalt(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Show a global loader while auth state is resolving initially
  if (loading && user === null && typeof window !== 'undefined' && (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/')) {
     // Only show full page loader if not on auth pages or landing page
     // and initial user check is happening
    const isAuthPage = ['/login', '/signup'].includes(window.location.pathname);
    const isLandingPage = window.location.pathname === '/';
    
    // More fine-grained loading for initial app load vs navigation
    const initialLoad = user === null && passphraseSalt === null;

    if (initialLoad && !isAuthPage && !isLandingPage) {
      return (
        <div className="fixed inset-0 bg-background bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-[200]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-foreground">Loading Bubba's Friend...</p>
          </div>
        </div>
      );
    }
  }


  return (
    <AuthContext.Provider value={{ user, loading, encryptionKey, passphraseSalt, setPassphraseAndRecovery, unlockWithPassphrase, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
