import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  type User,
  signOut as firebaseSignOut,
} from "firebase/auth";
import firebaseConfig from "./firebaseConfig";

// Initialize Firebase App instance safely (prevent duplicate initializations)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Unified user interface for Firebase and Google Identity Services
export interface GoogleUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

// Configured Workspace scopes for Google Drive and Google Sheets
export const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/spreadsheets.readonly",
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: "select_account",
  access_type: "offline",
});

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;

// Cache the access token strictly in memory (per security guidelines, never localStorage)
let cachedAccessToken: string | null = null;
let cachedCustomUser: GoogleUser | null = null;

// Firebase Domain diagnostic information
export const getFirebaseDomainConfig = () => {
  const currentDomain = typeof window !== "undefined" ? window.location.hostname : "";
  const projectId = firebaseConfig.projectId;
  const settingsUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;
  return {
    currentDomain,
    projectId,
    settingsUrl,
    isLocalhost: currentDomain === "localhost" || currentDomain === "127.0.0.1",
  };
};

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: GoogleUser, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (firebaseUser) {
      const u: GoogleUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      };
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(u, cachedAccessToken);
      } else if (!isSigningIn) {
        // User is known to Firebase but access token is not in memory
        if (onAuthSuccess) onAuthSuccess(u, null);
      }
    } else if (cachedCustomUser && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(cachedCustomUser, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      cachedCustomUser = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Google Identity Services (GSI) Token Client Sign-in
export const googleSignInWithGSI = (): Promise<{ user: GoogleUser; accessToken: string } | null> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }

    const g = (window as any).google;
    if (!g?.accounts?.oauth2?.initTokenClient) {
      resolve(null);
      return;
    }

    try {
      const scopeString = [
        ...SCOPES,
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ].join(" ");

      const tokenClient = g.accounts.oauth2.initTokenClient({
        client_id: firebaseConfig.oAuthClientId,
        scope: scopeString,
        error_callback: (err: any) => {
          if (err?.type === "popup_closed" || err?.type === "popup_failed_to_open") {
            console.info("Google Identity Services popup was closed by the user.");
            resolve(null);
          } else {
            console.warn("Google Identity Services auth notice:", err?.message || err);
            resolve(null);
          }
        },
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            if (tokenResponse.error === "access_denied" || tokenResponse.error === "user_logged_out") {
              console.info("Google Identity Services auth was cancelled.");
              resolve(null);
              return;
            }
            console.warn("Google Identity Services response notice:", tokenResponse.error_description || tokenResponse.error);
            resolve(null);
            return;
          }
          if (!tokenResponse.access_token) {
            resolve(null);
            return;
          }

          const accessToken = tokenResponse.access_token;
          cachedAccessToken = accessToken;

          try {
            const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            const userData = await userRes.json();
            const user: GoogleUser = {
              uid: userData.sub || "google-user",
              email: userData.email || null,
              displayName: userData.name || userData.email || "Google Account",
              photoURL: userData.picture || null,
            };
            cachedCustomUser = user;
            resolve({ user, accessToken });
          } catch {
            const fallbackUser: GoogleUser = {
              uid: "google-user",
              email: "Connected Account",
              displayName: "Google User",
            };
            cachedCustomUser = fallbackUser;
            resolve({ user: fallbackUser, accessToken });
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: "consent" });
    } catch (e: any) {
      console.warn("Failed to initialize Google Identity Services token client:", e?.message || e);
      resolve(null);
    }
  });
};

// Sign in with Google (Handles popup cancellation and domain diagnostics gracefully)
export const googleSignIn = async (): Promise<{ user: GoogleUser; accessToken: string } | null> => {
  isSigningIn = true;

  const isPopupClosedByUser = (err: any): boolean => {
    const code = err?.code || "";
    const msg = String(err?.message || "");
    return (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request" ||
      msg.includes("popup-closed-by-user") ||
      msg.includes("cancelled-popup-request") ||
      err?.type === "popup_closed"
    );
  };

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error("Failed to retrieve Google OAuth access token.");
    }

    cachedAccessToken = credential.accessToken;
    const user: GoogleUser = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
    };
    return { user, accessToken: cachedAccessToken };
  } catch (error: any) {
    // 1. Normal user closure or dismissal of the popup: return null gracefully without console.error
    if (isPopupClosedByUser(error)) {
      console.info("Google sign-in popup closed by user.");
      return null;
    }

    // 2. Unauthorized domain check
    const isUnauthorizedDomain =
      error?.code === "auth/unauthorized-domain" ||
      (error?.message && String(error.message).includes("auth/unauthorized-domain"));

    if (isUnauthorizedDomain) {
      // Try Google Identity Services fallback if available
      const hasGSI = typeof window !== "undefined" && !!(window as any).google?.accounts?.oauth2?.initTokenClient;
      if (hasGSI) {
        try {
          const gsiResult = await googleSignInWithGSI();
          if (gsiResult) return gsiResult;
        } catch {
          // Ignore GSI errors and proceed to helpful domain instructions
        }
      }

      const config = getFirebaseDomainConfig();
      const enrichedError: any = new Error(
        `Firebase domain authorization required: "${config.currentDomain}" is not in the Firebase Authorized Domains list.`
      );
      enrichedError.code = "auth/unauthorized-domain";
      enrichedError.domain = config.currentDomain;
      enrichedError.projectId = config.projectId;
      enrichedError.settingsUrl = config.settingsUrl;
      console.warn("Firebase Authorized Domain required:", config.currentDomain);
      throw enrichedError;
    }

    // 3. Popup blocked by browser
    if (error?.code === "auth/popup-blocked") {
      const blockedErr: any = new Error("Popup blocked by browser. Please allow popups for this site and retry.");
      blockedErr.code = "auth/popup-blocked";
      console.warn("Google sign-in popup was blocked by the browser.");
      throw blockedErr;
    }

    // Other unexpected error: warn and throw
    console.warn("Google Sign-In notice:", error?.message || error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Connect with manual Google OAuth Access Token
export const authenticateWithToken = async (
  token: string
): Promise<{ user: GoogleUser; accessToken: string }> => {
  const cleanToken = token.trim();
  if (!cleanToken) {
    throw new Error("OAuth access token cannot be empty.");
  }

  // Validate token against Google API
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${cleanToken}` },
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error_description || errBody.error || "Invalid or expired Google OAuth access token.");
  }

  const userData = await res.json();
  const user: GoogleUser = {
    uid: userData.sub || "google-token-user",
    email: userData.email || null,
    displayName: userData.name || userData.email || "Google Account",
    photoURL: userData.picture || null,
  };

  cachedAccessToken = cleanToken;
  cachedCustomUser = user;
  return { user, accessToken: cleanToken };
};

// Access token retriever
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Set token in memory if re-authenticated
export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

// Logout
export const logoutGoogle = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.warn("Firebase sign out warning:", e);
  } finally {
    cachedAccessToken = null;
    cachedCustomUser = null;
  }
};

