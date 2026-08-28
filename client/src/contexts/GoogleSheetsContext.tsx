import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  authenticateWithToken,
  getFirebaseDomainConfig,
  type GoogleUser,
} from "@/lib/googleAuth";
import {
  getSpreadsheetMetadata,
  createFinTrackSpreadsheet,
  syncAllDataToGoogleSheet,
  extractSpreadsheetId,
  type SyncFinancialDataPayload,
} from "@/lib/googleSheetsService";
import { toast } from "sonner";

export interface ConnectedSheet {
  id: string;
  title: string;
  webViewLink?: string;
  connectedAt: string;
}

export interface AuthErrorInfo {
  code: string;
  message: string;
  domain?: string;
  settingsUrl?: string;
  projectId?: string;
}

interface GoogleSheetsContextType {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authError: AuthErrorInfo | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<string | null>;
  connectWithToken: (token: string) => Promise<string | null>;
  signOutGoogle: () => Promise<void>;
  
  // Active sheet management
  activeSheet: ConnectedSheet | null;
  setActiveSheet: (sheet: ConnectedSheet | null) => void;
  disconnectSheet: () => void;
  
  // Sheet Selector Modal control
  isSelectorOpen: boolean;
  setIsSelectorOpen: (open: boolean) => void;
  
  // Live Sync Status
  syncStatus: "idle" | "syncing" | "synced" | "error";
  lastSyncTime: string | null;
  syncError: string | null;
  autoSyncEnabled: boolean;
  setAutoSyncEnabled: (val: boolean) => void;
  
  // Sync Actions
  syncData: (dataPayload: SyncFinancialDataPayload, isAutomated?: boolean) => Promise<boolean>;
  createAndConnectNewSheet: (customTitle?: string) => Promise<ConnectedSheet>;
  connectExistingSheet: (sheetIdOrUrl: string, title?: string) => Promise<ConnectedSheet>;
}

const STORAGE_KEYS = {
  ACTIVE_SHEET: "fintrack_connected_google_sheet_v1",
  AUTO_SYNC: "fintrack_google_sheet_auto_sync_v1",
  LAST_SYNC: "fintrack_google_sheet_last_sync_v1",
};

const GoogleSheetsContext = createContext<GoogleSheetsContextType | null>(null);

export function GoogleSheetsProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");
  const [syncError, setSyncError] = useState<string | null>(null);

  const [activeSheet, setActiveSheetState] = useState<ConnectedSheet | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SHEET);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [autoSyncEnabled, setAutoSyncEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTO_SYNC);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || null;
    } catch {
      return null;
    }
  });

  // Keep a ref to latest access token & state
  const accessTokenRef = useRef<string | null>(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        if (token) {
          accessTokenRef.current = token;
        }
      },
      () => {
        setUser(null);
        accessTokenRef.current = null;
      }
    );
    return () => unsubscribe();
  }, []);

  const setActiveSheet = useCallback((sheet: ConnectedSheet | null) => {
    setActiveSheetState(sheet);
    if (sheet) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SHEET, JSON.stringify(sheet));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SHEET);
    }
  }, []);

  const setAutoSyncEnabled = useCallback((enabled: boolean) => {
    setAutoSyncEnabledState(enabled);
    localStorage.setItem(STORAGE_KEYS.AUTO_SYNC, JSON.stringify(enabled));
  }, []);

  const disconnectSheet = useCallback(() => {
    setActiveSheet(null);
    setSyncStatus("idle");
    toast.info("Google Sheet disconnected from workspace.");
  }, [setActiveSheet]);

  // Sign in with Google
  const signInWithGoogle = useCallback(async (): Promise<string | null> => {
    setIsAuthenticating(true);
    clearAuthError();
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        accessTokenRef.current = res.accessToken;
        setUser(res.user);
        setAuthError(null);
        toast.success(`Connected to Google as ${res.user.email || res.user.displayName || "user"}`);
        return res.accessToken;
      }
      return null;
    } catch (err: any) {
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request" ||
        String(err?.message || "").includes("popup-closed-by-user")
      ) {
        // Normal user dismissal of sign-in window
        return null;
      }

      if (err?.code === "auth/unauthorized-domain" || (err?.message && String(err.message).includes("unauthorized-domain"))) {
        const config = getFirebaseDomainConfig();
        const errInfo: AuthErrorInfo = {
          code: "auth/unauthorized-domain",
          message: err.message,
          domain: err.domain || config.currentDomain,
          settingsUrl: err.settingsUrl || config.settingsUrl,
          projectId: config.projectId,
        };
        setAuthError(errInfo);
        toast.error("Firebase domain authorization required.", {
          description: `Add "${config.currentDomain}" to Authorized Domains in Firebase Console.`,
        });
        return null;
      }

      if (err?.code === "auth/popup-blocked") {
        toast.error("Sign-in popup blocked", {
          description: "Please allow popups for this site in your browser address bar and try again.",
        });
        return null;
      }

      console.warn("Google sign in notice:", err?.message || err);
      toast.error(err?.message || "Google Authentication failed. Please try again.");
      return null;
    } finally {
      setIsAuthenticating(false);
    }
  }, [clearAuthError]);

  // Direct token authentication
  const connectWithToken = useCallback(async (token: string): Promise<string | null> => {
    setIsAuthenticating(true);
    clearAuthError();
    try {
      const res = await authenticateWithToken(token);
      accessTokenRef.current = res.accessToken;
      setUser(res.user);
      setAuthError(null);
      toast.success(`Connected to Google as ${res.user.email || res.user.displayName || "user"}`);
      return res.accessToken;
    } catch (err: any) {
      console.warn("Token authentication notice:", err?.message || err);
      toast.error(err.message || "Failed to authenticate with token.");
      return null;
    } finally {
      setIsAuthenticating(false);
    }
  }, [clearAuthError]);

  // Sign out
  const signOutGoogle = useCallback(async () => {
    await logoutGoogle();
    accessTokenRef.current = null;
    setUser(null);
    clearAuthError();
    toast.info("Signed out of Google account.");
  }, [clearAuthError]);

  // Helper to ensure valid access token before Google API calls
  const requireToken = useCallback(async (): Promise<string> => {
    const existing = await getAccessToken();
    if (existing) {
      accessTokenRef.current = existing;
      return existing;
    }
    if (accessTokenRef.current) {
      return accessTokenRef.current;
    }
    // Need interactive sign-in
    const token = await signInWithGoogle();
    if (!token) {
      throw new Error("Authentication required to interact with Google Sheets.");
    }
    return token;
  }, [signInWithGoogle]);

  // Connect existing sheet
  const connectExistingSheet = useCallback(
    async (sheetIdOrUrl: string, title?: string): Promise<ConnectedSheet> => {
      const token = await requireToken();
      const sheetId = extractSpreadsheetId(sheetIdOrUrl);
      if (!sheetId) {
        throw new Error("Please enter a valid Google Spreadsheet ID or link.");
      }

      setSyncStatus("syncing");
      const metadata = await getSpreadsheetMetadata(token, sheetId);
      const connected: ConnectedSheet = {
        id: metadata.spreadsheetId,
        title: title || metadata.title,
        webViewLink: metadata.webViewLink,
        connectedAt: new Date().toISOString(),
      };

      setActiveSheet(connected);
      setSyncStatus("idle");
      return connected;
    },
    [requireToken, setActiveSheet]
  );

  // Create brand new FinTrack sheet
  const createAndConnectNewSheet = useCallback(
    async (customTitle?: string): Promise<ConnectedSheet> => {
      const token = await requireToken();
      setSyncStatus("syncing");
      const metadata = await createFinTrackSpreadsheet(token, customTitle);
      const connected: ConnectedSheet = {
        id: metadata.spreadsheetId,
        title: metadata.title,
        webViewLink: metadata.webViewLink,
        connectedAt: new Date().toISOString(),
      };

      setActiveSheet(connected);
      setSyncStatus("idle");
      return connected;
    },
    [requireToken, setActiveSheet]
  );

  // Sync data to active sheet
  const syncData = useCallback(
    async (payload: SyncFinancialDataPayload, isAutomated = false): Promise<boolean> => {
      if (!activeSheet) {
        if (!isAutomated) {
          setIsSelectorOpen(true);
        }
        return false;
      }

      try {
        setSyncStatus("syncing");
        setSyncError(null);

        const token = await requireToken();
        const res = await syncAllDataToGoogleSheet(token, activeSheet.id, payload);

        setSyncStatus("synced");
        const formattedTime = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        setLastSyncTime(formattedTime);
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, formattedTime);

        if (!isAutomated) {
          toast.success(`Google Sheet updated! ${res.updatedCells} cells synchronized.`);
        }
        return true;
      } catch (err: any) {
        console.warn("Google Sheet sync notice:", err?.message || err);
        setSyncStatus("error");
        const message = err?.message || "Sync failed. Check spreadsheet permissions.";
        setSyncError(message);
        if (!isAutomated) {
          toast.error(`Sync error: ${message}`);
        }
        return false;
      }
    },
    [activeSheet, requireToken]
  );

  return (
    <GoogleSheetsContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!accessTokenRef.current,
        isAuthenticating,
        authError,
        clearAuthError,
        signInWithGoogle,
        connectWithToken,
        signOutGoogle,
        activeSheet,
        setActiveSheet,
        disconnectSheet,
        isSelectorOpen,
        setIsSelectorOpen,
        syncStatus,
        lastSyncTime,
        syncError,
        autoSyncEnabled,
        setAutoSyncEnabled,
        syncData,
        createAndConnectNewSheet,
        connectExistingSheet,
      }}
    >
      {children}
    </GoogleSheetsContext.Provider>
  );
}

export function useGoogleSheets() {
  const context = useContext(GoogleSheetsContext);
  if (!context) {
    throw new Error("useGoogleSheets must be used within a GoogleSheetsProvider");
  }
  return context;
}
