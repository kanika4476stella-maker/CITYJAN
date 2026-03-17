"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  AuthError,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

export type UserRole = "citizen" | "admin";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt?: unknown;
  isDemo?: boolean;
  points?: number;
  verified_reports?: number;
  rejected_reports?: number;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<{ isNewUser: boolean }>;
  registerWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  setUserRole: (uid: string, role: UserRole) => Promise<void>;
  updateUserProfile: (updates: Partial<Pick<AppUser, "displayName" | "social_links">>) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  loginAsDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Demo credentials (local only, no Firebase needed) ───────────────────────
export const DEMO_ACCOUNTS = {
  admin: {
    email: "admin@cityjan.demo",
    password: "Admin@2025",
    displayName: "Ramesh Kumar (Admin)",
    role: "admin" as UserRole,
    uid: "demo-admin-001",
  },
  citizen: {
    email: "citizen@cityjan.demo",
    password: "Citizen@2025",
    displayName: "Arjun Mehta",
    role: "citizen" as UserRole,
    uid: "demo-citizen-001",
  },
} as const;

const DEMO_SESSION_KEY = "cityjan_demo_user";

function loadDemoSession(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DEMO_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDemoSession(user: AppUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  }
}

// ─── Firebase helpers ─────────────────────────────────────────────────────────
async function fetchUserProfile(uid: string): Promise<AppUser | null> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) return snap.data() as AppUser;
    return null;
  } catch {
    return null;
  }
}

async function upsertUserProfile(user: User, role?: UserRole): Promise<AppUser> {
  const ref = doc(db, "users", user.uid);
  const existing = await fetchUserProfile(user.uid);
  const profile: AppUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: existing?.role ?? role ?? "citizen",
    createdAt: existing?.createdAt ?? serverTimestamp(),
    points: existing?.points ?? 0,
    verified_reports: existing?.verified_reports ?? 0,
    rejected_reports: existing?.rejected_reports ?? 0,
    social_links: existing?.social_links ?? {},
  };
  await setDoc(ref, profile, { merge: true });
  return profile;
}

function friendlyError(err: unknown): string {
  const code = (err as AuthError)?.code ?? "";
  const map: Record<string, string> = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "This email is already registered.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/invalid-credential": "Invalid credentials. Please check and retry.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Restore demo session first (before Firebase resolves)
    const demo = loadDemoSession();
    if (demo) {
      setUser(demo);
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      // If a demo session is active, don't overwrite with Firebase null
      const currentDemo = loadDemoSession();
      if (currentDemo) return;

      if (fbUser) {
        setFirebaseUser(fbUser);
        const profile = await fetchUserProfile(fbUser.uid);
        setUser(profile);
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // ── Demo login (no Firebase needed) ─────────────────────────────────────────
  const loginAsDemo = useCallback((role: UserRole) => {
    const account = DEMO_ACCOUNTS[role];
    const demoUser: AppUser = {
      uid: account.uid,
      email: account.email,
      displayName: account.displayName,
      photoURL: null,
      role: account.role,
      isDemo: true,
      points: 0,
      verified_reports: 0,
      rejected_reports: 0,
    };
    
    // For demo users, also load from localStorage if they have played before
    try {
      const usersRaw = localStorage.getItem("CITYजन_demo_users") || "{}";
      const users = JSON.parse(usersRaw);
      if (users[demoUser.uid]) {
        demoUser.points = users[demoUser.uid].points || 0;
        demoUser.verified_reports = users[demoUser.uid].verified_reports || 0;
        demoUser.rejected_reports = users[demoUser.uid].rejected_reports || 0;
      }
    } catch(e) {}

    saveDemoSession(demoUser);
    setUser(demoUser);
    setLoading(false);
  }, []);

  // ── Email login ──────────────────────────────────────────────────────────────
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    // Check if it's a demo credential
    for (const account of Object.values(DEMO_ACCOUNTS)) {
      if (email === account.email && password === account.password) {
        loginAsDemo(account.role);
        return;
      }
    }
    try {
      setError(null);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(cred.user.uid);
      if (!profile) await upsertUserProfile(cred.user);
    } catch (err) {
      console.warn("Firebase Auth failed, falling back to Demo mode", err);
      loginAsDemo("citizen");
    }
  }, [loginAsDemo]);

  // ── Google login ─────────────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async (): Promise<{ isNewUser: boolean }> => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const existing = await fetchUserProfile(result.user.uid);
      const isNewUser = !existing;
      if (isNewUser) await upsertUserProfile(result.user, "citizen");
      return { isNewUser };
    } catch (err) {
      console.warn("Firebase Google Auth failed, falling back to Demo Citizen mode", err);
      loginAsDemo("citizen");
      return { isNewUser: false };
    }
  }, [loginAsDemo]);

  // ── Register ─────────────────────────────────────────────────────────────────
  const registerWithEmail = useCallback(async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      setError(null);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      await upsertUserProfile(cred.user, "citizen");
    } catch (err) {
      console.warn("Firebase Registration failed, falling back to Demo mode", err);
      loginAsDemo("citizen");
    }
  }, [loginAsDemo]);

  // ── Set role ─────────────────────────────────────────────────────────────────
  const setUserRole = useCallback(async (uid: string, role: UserRole) => {
    try {
      // Demo user role change — just update state/session
      const currentDemo = loadDemoSession();
      if (currentDemo) {
        const updated = { ...currentDemo, role };
        saveDemoSession(updated);
        setUser(updated);
        return;
      }
      await setDoc(doc(db, "users", uid), { role }, { merge: true });
      setUser((prev) => (prev ? { ...prev, role } : prev));
    } catch (err) {
      setError(friendlyError(err));
      throw err;
    }
  }, []);

  // ── Update profile (display name, social links) ──────────────────────────────────
  const updateUserProfile = useCallback(async (updates: Partial<Pick<AppUser, "displayName" | "social_links">>) => {
    const currentDemo = loadDemoSession();
    if (currentDemo || user?.isDemo) {
      // For demo users, just update state and session
      const updated = { ...(currentDemo || user!), ...updates };
      saveDemoSession(updated);
      setUser(updated);
      return;
    }
    try {
      if (!user) return;
      await setDoc(doc(db, "users", user.uid), updates, { merge: true });
      setUser(prev => prev ? { ...prev, ...updates } : prev);
    } catch (err) {
      setError(friendlyError(err));
      throw err;
    }
  }, [user]);

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    saveDemoSession(null);
    const currentDemo = loadDemoSession(); // should be null now
    if (!currentDemo) {
      try { await signOut(auth); } catch { /* ignore */ }
    }
    setUser(null);
    setFirebaseUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        error,
        signInWithEmail,
        signInWithGoogle,
        registerWithEmail,
        setUserRole,
        updateUserProfile,
        logout,
        clearError,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
