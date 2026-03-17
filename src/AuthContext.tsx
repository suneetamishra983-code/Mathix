import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile, Progress, Theme, Language } from './types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  progress: Progress | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProgress: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      try {
        // Cleanup previous progress listener if it exists
        if (unsubProgress) {
          unsubProgress();
          unsubProgress = null;
        }

        setUser(u);
        if (u) {
          // Fetch or create profile
          const userRef = doc(db, 'users', u.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            const newProfile: UserProfile = {
              uid: u.uid,
              displayName: u.displayName || 'Student',
              email: u.email || '',
              photoURL: u.photoURL || '',
              theme: 'light',
              language: 'en',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          } else {
            setProfile(userSnap.data() as UserProfile);
          }

          // Fetch progress
          const progressRef = doc(db, 'progress', u.uid);
          unsubProgress = onSnapshot(progressRef, (snap) => {
            if (snap.exists()) {
              setProgress(snap.data() as Progress);
            } else {
              const initialProgress: Progress = {
                userId: u.uid,
                totalQuestions: 0,
                correctAnswers: 0,
                level: 1,
                accuracy: 0,
                weakTopics: [],
                topicPerformance: {},
                lastUpdated: new Date().toISOString(),
              };
              setDoc(progressRef, initialProgress);
              setProgress(initialProgress);
            }
          }, (error) => {
            console.error("Progress snapshot error:", error);
          });
        } else {
          setProfile(null);
          setProgress(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProgress) unsubProgress();
    };
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error.code === 'auth/popup-blocked') {
        alert("Please allow popups for this site to sign in with Google.");
      } else {
        alert("Failed to sign in. Please try again.");
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, data, { merge: true });
    setProfile(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, progress, loading, signIn, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
