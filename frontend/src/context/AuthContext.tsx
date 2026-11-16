import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, provider, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { updateUserStreak } from '../services/streakService';

type AuthContextType = {
  user: User | null;
  username: string;
  setUsername: (name: string) => void;
  streak: number;
  loading: boolean;
  hasCompletedOnboarding: boolean; 
  setHasCompletedOnboarding: (val: boolean) => void; 
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>(''); 
  const [streak, setStreak] = useState<number>(1); 
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false); 
  const [loading, setLoading] = useState(true);

  // Checks or initializes the user profile doc & daily login streak
  const checkOnboardingStatus = async (uid: string, email: string | null) => {
    const ref = doc(db, 'users', uid);
    try {
      // 1. Run the dynamic streak update calculation routine
      const activeStreak = await updateUserStreak(uid);
      setStreak(activeStreak);

      // 2. Process onboarding profile data paths
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setHasCompletedOnboarding(!!data.hasCompletedOnboarding);
        
        if (data.username) {
          setUsername(data.username);
        } else {
          setUsername(''); 
        }
      } else {
        await setDoc(ref, { uid, email, createdAt: Date.now(), hasCompletedOnboarding: false });
        setHasCompletedOnboarding(false);
        setUsername('');
      }
    } catch (err) {
      console.error('Failed to resolve user onboarding status or streak:', err);
      setHasCompletedOnboarding(false);
      setUsername('');
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoading(true); // Ensure loading is engaged when state flips
      
      if (u) {
        // Fixed 1: Clear out any previous user data instantly from state 
        // while the async database call pulls down the new user records.
        setUsername('');
        setHasCompletedOnboarding(false);
        
        setUser(u);
        // Fixed 2: Await this completely so loading doesn't flip to false prematurely
        await checkOnboardingStatus(u.uid, u.email || null);
      } else {
        setUser(null);
        setHasCompletedOnboarding(false);
        setUsername('');
        setStreak(1); 
      }

      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    // FIX 3: Simply initiate the popup. The onAuthStateChanged hook above 
    // will pick up the user change and run checkOnboardingStatus cleanly.
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    // FIX 4: Explicitly force clear data state during the logout pipeline execution
    setUser(null);
    setUsername('');
    setHasCompletedOnboarding(false);
    setStreak(1);
    await signOut(auth);
  };

  const getIdToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      username,
      streak, 
      loading, 
      hasCompletedOnboarding, 
      setHasCompletedOnboarding, 
      setUsername, 
      signup, 
      login, 
      loginWithGoogle, 
      logout, 
      getIdToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};