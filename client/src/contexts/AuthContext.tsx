import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, firebaseConfig } from "@/lib/firebase";
import { handleFirestoreError, OperationType } from "@/lib/firestoreError";
import type { Profile } from "@shared/types";
import { toast } from "sonner";

export interface DomainAuthErrorInfo {
  domain: string;
  projectId: string;
  settingsUrl: string;
  errorDetail?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "signin" | "signup";
  domainAuthError: DomainAuthErrorInfo | null;
  openAuthModal: (mode?: "signin" | "signup") => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: "signin" | "signup") => void;
  clearDomainAuthError: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: { fullName?: string; phone?: string; avatarUrl?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_PROFILE_KEY = "fintrack_cached_user_profile_v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
  const [domainAuthError, setDomainAuthError] = useState<DomainAuthErrorInfo | null>(null);

  // Sync profile to localStorage whenever it updates
  useEffect(() => {
    if (profile) {
      try {
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
      } catch {}
    } else if (!user) {
      try {
        localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
      } catch {}
    }
  }, [profile, user]);

  // Fetch or initialize profile in Firestore
  const fetchProfile = useCallback(async (firebaseUser: User) => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const loadedProfile: Profile = {
          id: firebaseUser.uid,
          user_id: firebaseUser.uid,
          full_name: data.fullName || firebaseUser.displayName || "User",
          avatar_url: data.avatarUrl || firebaseUser.photoURL || null,
          email: data.email || firebaseUser.email || null,
          phone: data.phone || null,
          created_at: data.createdAt || new Date().toISOString(),
          updated_at: data.updatedAt || new Date().toISOString(),
        };
        setProfile(loadedProfile);
      } else {
        // Create initial profile in Firestore
        const now = new Date().toISOString();
        const initialProfile: Profile = {
          id: firebaseUser.uid,
          user_id: firebaseUser.uid,
          full_name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Tayyab Afridi",
          avatar_url: firebaseUser.photoURL || null,
          email: firebaseUser.email || null,
          phone: null,
          created_at: now,
          updated_at: now,
        };

        try {
          await setDoc(userDocRef, {
            userId: firebaseUser.uid,
            email: firebaseUser.email || "",
            fullName: initialProfile.full_name || "User",
            role: "owner",
            createdAt: now,
            updatedAt: now,
          });
        } catch (err) {
          console.warn("Firestore profile initial write notice:", err);
        }

        setProfile(initialProfile);
      }
    } catch (err: any) {
      console.warn("Notice fetching user profile from Firestore:", err?.message || err);
      // Fallback local profile if Firestore read is restricted or pending
      const fallback: Profile = {
        id: firebaseUser.uid,
        user_id: firebaseUser.uid,
        full_name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Tayyab Afridi",
        avatar_url: firebaseUser.photoURL || null,
        email: firebaseUser.email || null,
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(fallback);
    }
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        // Fallback default guest profile if not logged in
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchProfile]);

  const openAuthModal = useCallback((mode: "signin" | "signup" = "signin") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const clearDomainAuthError = useCallback(() => {
    setDomainAuthError(null);
  }, []);

  // Email & Password Sign In
  const signInWithEmail = async (email: string, pass: string) => {
    setDomainAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      toast.success(`Welcome back, ${cred.user.displayName || cred.user.email?.split("@")[0] || "User"}!`);
      closeAuthModal();
    } catch (err: any) {
      let message = "Failed to sign in. Please check your credentials.";
      if (err?.code === "auth/user-not-found" || err?.code === "auth/invalid-credential") {
        message = "Invalid email or password. Please verify your details or sign up.";
      } else if (err?.code === "auth/wrong-password") {
        message = "Incorrect password. Please try again or reset your password.";
      } else if (err?.code === "auth/too-many-requests") {
        message = "Too many failed attempts. Please wait a few moments before trying again.";
      } else if (err?.message) {
        message = err.message;
      }
      toast.error(message);
      throw new Error(message);
    }
  };

  // Email & Password Sign Up
  const signUpWithEmail = async (email: string, pass: string, fullName: string) => {
    setDomainAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (fullName.trim()) {
        try {
          await firebaseUpdateProfile(cred.user, { displayName: fullName.trim() });
        } catch {}
      }

      const now = new Date().toISOString();
      const newProfile: Profile = {
        id: cred.user.uid,
        user_id: cred.user.uid,
        full_name: fullName.trim() || cred.user.email?.split("@")[0] || "User",
        avatar_url: null,
        email: cred.user.email || null,
        phone: null,
        created_at: now,
        updated_at: now,
      };

      try {
        await setDoc(doc(db, "users", cred.user.uid), {
          userId: cred.user.uid,
          email: cred.user.email || "",
          fullName: newProfile.full_name || "User",
          role: "owner",
          createdAt: now,
          updatedAt: now,
        });
      } catch (e) {
        console.warn("Firestore user record notice:", e);
      }

      setProfile(newProfile);
      toast.success(`Account created successfully! Welcome, ${newProfile.full_name}.`);
      closeAuthModal();
    } catch (err: any) {
      let message = "Failed to create account. Please try again.";
      if (err?.code === "auth/email-already-in-use") {
        message = "An account with this email already exists. Please sign in instead.";
      } else if (err?.code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      } else if (err?.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (err?.message) {
        message = err.message;
      }
      toast.error(message);
      throw new Error(message);
    }
  };

  // Google Sign In (handles domain authorization errors)
  const signInWithGoogle = async () => {
    setDomainAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const result = await signInWithPopup(auth, provider);
      toast.success(`Signed in as ${result.user.displayName || result.user.email}`);
      closeAuthModal();
    } catch (error: any) {
      const code = error?.code || "";
      const msg = String(error?.message || "");

      // Ignore normal popup dismissal
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request" ||
        msg.includes("popup-closed-by-user")
      ) {
        return;
      }

      // Check for Unauthorized Domain Error
      if (code === "auth/unauthorized-domain" || msg.includes("auth/unauthorized-domain")) {
        const currentDomain = typeof window !== "undefined" ? window.location.hostname : "";
        const projectId = firebaseConfig.projectId;
        const settingsUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

        setDomainAuthError({
          domain: currentDomain,
          projectId,
          settingsUrl,
          errorDetail: "Domain authorization required for Firebase Google OAuth.",
        });

        toast.error(`Firebase domain authorization required for "${currentDomain}". Follow instructions below to authorize or use Email/Password sign-in.`, {
          duration: 7000,
        });
        return;
      }

      if (code === "auth/popup-blocked") {
        toast.error("Sign-in popup was blocked by your browser. Please allow popups for this site.");
        return;
      }

      toast.error(error?.message || "Google Sign-In failed.");
    }
  };

  // Quick Demo Account Sign-In (no configuration barrier)
  const signInAsDemo = async () => {
    setDomainAuthError(null);
    const demoProfile: Profile = {
      id: "demo-owner-uid",
      user_id: "demo-owner-uid",
      full_name: "Tayyab Afridi",
      avatar_url: null,
      email: "itstayyabafridi@gmail.com",
      phone: "+92 300 1234567",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProfile(demoProfile);
    toast.success("Signed in with Tayyab Afridi workspace account");
    closeAuthModal();
  };

  // Sign Out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Sign out notice:", e);
    }
    setProfile(null);
    toast.info("You have been signed out.");
  };

  // Password Reset
  const resetPassword = async (email: string) => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      toast.success(`Password reset email sent to ${email.trim()}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to send password reset email.");
      throw err;
    }
  };

  // Update profile
  const updateUserProfile = async (updates: { fullName?: string; phone?: string; avatarUrl?: string }) => {
    if (!user && !profile) return;
    const uid = user ? user.uid : profile?.user_id;
    if (!uid) return;

    const now = new Date().toISOString();
    const updated: Profile = {
      id: uid,
      user_id: uid,
      full_name: updates.fullName !== undefined ? updates.fullName : profile?.full_name || null,
      avatar_url: updates.avatarUrl !== undefined ? updates.avatarUrl : profile?.avatar_url || null,
      email: profile?.email || user?.email || null,
      phone: updates.phone !== undefined ? updates.phone : profile?.phone || null,
      created_at: profile?.created_at || now,
      updated_at: now,
    };

    setProfile(updated);

    if (user) {
      if (updates.fullName) {
        try {
          await firebaseUpdateProfile(user, { displayName: updates.fullName });
        } catch {}
      }

      try {
        await updateDoc(doc(db, "users", uid), {
          fullName: updated.full_name,
          phone: updated.phone,
          avatarUrl: updated.avatar_url,
          updatedAt: now,
        });
      } catch (err) {
        console.warn("Firestore updateDoc profile notice:", err);
      }
    }

    toast.success("Profile updated successfully");
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthModalOpen,
        authModalMode,
        domainAuthError,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        clearDomainAuthError,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInAsDemo,
        signOut,
        resetPassword,
        updateUserProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
