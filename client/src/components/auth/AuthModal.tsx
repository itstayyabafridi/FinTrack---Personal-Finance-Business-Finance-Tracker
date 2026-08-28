import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Loader2,
  KeyRound,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    domainAuthError,
    clearDomainAuthError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInAsDemo,
    resetPassword,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showDomainHelp, setShowDomainHelp] = useState(false);

  const currentDomain = typeof window !== "undefined" ? window.location.hostname : "";
  const projectId = domainAuthError?.projectId || "gen-lang-client-0617584982";
  const settingsUrl =
    domainAuthError?.settingsUrl ||
    `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

  const handleCopyDomain = async () => {
    try {
      await navigator.clipboard.writeText(currentDomain);
      setCopiedDomain(true);
      toast.success(`Domain "${currentDomain}" copied to clipboard!`);
      setTimeout(() => setCopiedDomain(false), 2500);
    } catch {
      toast.error("Could not copy automatically. Please select and copy manually.");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide both email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      setEmail("");
      setPassword("");
    } catch {
      // toast is already fired in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await signUpWithEmail(email, password, fullName);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFullName("");
    } catch {
      // toast is already fired in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address to reset password.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(email);
      setShowForgotPassword(false);
    } catch {
      // toast in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setSubmitting(true);
    try {
      await signInAsDemo();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white border border-[#e4ebf3] rounded-2xl shadow-2xl">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-[#183b56] to-[#0f2434] p-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white tracking-tight">
                {showForgotPassword
                  ? "Reset Your Password"
                  : authModalMode === "signin"
                  ? "Welcome Back to FinTrack"
                  : "Create Your FinTrack Account"}
              </DialogTitle>
              <DialogDescription className="text-xs text-white/70 mt-0.5">
                {showForgotPassword
                  ? "We'll send you an email with password reset instructions."
                  : authModalMode === "signin"
                  ? "Sign in to access your financial ledger and analytics."
                  : "Start tracking income, expenses, clients, and profits."}
              </DialogDescription>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          {!showForgotPassword && (
            <div className="flex bg-black/20 p-1 rounded-xl mt-5 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode("signin");
                  clearDomainAuthError();
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  authModalMode === "signin"
                    ? "bg-white text-[#183b56] shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode("signup");
                  clearDomainAuthError();
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  authModalMode === "signup"
                    ? "bg-white text-[#183b56] shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Domain Authorization Diagnostic Banner (Shown on error or toggle) */}
          {(domainAuthError || showDomainHelp) && (
            <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl space-y-2.5 text-xs text-amber-900 animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-amber-900">
                    Firebase Domain Authorization Required
                  </div>
                  <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                    Google OAuth popups require this app’s domain to be whitelisted in your Firebase Console.
                  </p>
                </div>
              </div>

              {/* Current Domain Box with Copy Button */}
              <div className="bg-white/80 border border-amber-200/80 rounded-lg p-2 flex items-center justify-between gap-2">
                <code className="text-[11px] font-mono text-amber-950 truncate select-all">
                  {currentDomain}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyDomain}
                  className="h-7 px-2.5 text-[11px] border-amber-300 text-amber-900 hover:bg-amber-100/60 shrink-0 gap-1"
                >
                  {copiedDomain ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  {copiedDomain ? "Copied" : "Copy Domain"}
                </Button>
              </div>

              {/* Action Links */}
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <a
                  href={settingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline"
                >
                  Authorize in Firebase Console
                  <ExternalLink size={11} />
                </a>
                <span className="text-amber-800 font-medium">
                  Settings → Authorized domains
                </span>
              </div>

              <div className="text-[11px] bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-emerald-900 flex items-center gap-1.5">
                <Sparkles size={13} className="text-emerald-600 shrink-0" />
                <span>
                  <strong>Tip:</strong> Email & Password sign-in / registration works immediately without domain authorization!
                </span>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {showForgotPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <Label className="text-xs font-semibold text-[#32435b]">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 text-[#8897ab]" size={15} />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="pl-9 text-xs h-9 bg-[#fbfcfe] border-[#d8e2ee] focus:border-[#2f6bff]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#183b56] hover:bg-[#122e43] text-white text-xs h-9 font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-2" />
                    Sending link...
                  </>
                ) : (
                  "Send Password Reset Email"
                )}
              </Button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-center text-xs text-[#52647c] hover:text-[#183b56] font-medium pt-1"
              >
                Back to Sign In
              </button>
            </form>
          ) : authModalMode === "signin" ? (
            /* SIGN IN FORM */
            <form onSubmit={handleSignIn} className="space-y-3">
              <div>
                <Label className="text-xs font-semibold text-[#32435b]">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 text-[#8897ab]" size={15} />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="itstayyabafridi@gmail.com"
                    required
                    className="pl-9 text-xs h-9 bg-[#fbfcfe] border-[#d8e2ee] focus:border-[#2f6bff]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-[#32435b]">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[11px] text-[#2f6bff] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 text-[#8897ab]" size={15} />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-9 text-xs h-9 bg-[#fbfcfe] border-[#d8e2ee] focus:border-[#2f6bff]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#183b56] hover:bg-[#122e43] text-white text-xs h-9 font-semibold shadow-sm transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In with Email
                    <ArrowRight size={14} className="ml-1.5" />
                  </>
                )}
              </Button>

              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#e2e8f0]" />
                </div>
                <span className="relative bg-white px-2.5 text-[11px] uppercase tracking-wider text-[#8897ab] font-medium">
                  or
                </span>
              </div>

              {/* Google Sign In Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={submitting}
                className="w-full h-9 border-[#d8e2ee] bg-[#fbfcfe] hover:bg-[#f3f7fc] text-xs font-semibold text-[#27384f] flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </Button>

              {/* Instant Demo Account Sign-in */}
              <Button
                type="button"
                variant="ghost"
                onClick={handleDemoSignIn}
                disabled={submitting}
                className="w-full h-8 text-[11px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-medium flex items-center justify-center gap-1.5"
              >
                <UserCheck size={13} className="text-emerald-600" />
                Instant Demo Access (Tayyab Afridi)
              </Button>

              {/* Domain Help Toggle */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowDomainHelp(!showDomainHelp)}
                  className="text-[11px] text-[#64748b] hover:text-[#183b56] underline font-medium"
                >
                  {showDomainHelp ? "Hide Firebase Domain Help" : "Domain authorization info"}
                </button>
              </div>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <Label className="text-xs font-semibold text-[#32435b]">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-2.5 text-[#8897ab]" size={15} />
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tayyab Afridi"
                    required
                    className="pl-9 text-xs h-9 bg-[#fbfcfe] border-[#d8e2ee] focus:border-[#2f6bff]"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-[#32435b]">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 text-[#8897ab]" size={15} />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tayyab@example.com"
                    required
                    className="pl-9 text-xs h-9 bg-[#fbfcfe] border-[#d8e2ee] focus:border-[#2f6bff]"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-[#32435b]">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 text-[#8897ab]" size={15} />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="pl-9 text-xs h-9 bg-[#fbfcfe] border-[#d8e2ee] focus:border-[#2f6bff]"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-[#32435b]">Confirm Password</Label>
                <div className="relative mt-1">
                  <KeyRound className="absolute left-3 top-2.5 text-[#8897ab]" size={15} />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    minLength={6}
                    className="pl-9 text-xs h-9 bg-[#fbfcfe] border-[#d8e2ee] focus:border-[#2f6bff]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#183b56] hover:bg-[#122e43] text-white text-xs h-9 font-semibold shadow-sm transition-all mt-1"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Free Account
                    <ArrowRight size={14} className="ml-1.5" />
                  </>
                )}
              </Button>

              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#e2e8f0]" />
                </div>
                <span className="relative bg-white px-2.5 text-[11px] uppercase tracking-wider text-[#8897ab] font-medium">
                  or
                </span>
              </div>

              {/* Google Sign Up Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={submitting}
                className="w-full h-9 border-[#d8e2ee] bg-[#fbfcfe] hover:bg-[#f3f7fc] text-xs font-semibold text-[#27384f] flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign up with Google
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
