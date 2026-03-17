"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Eye, EyeOff, Chrome, User, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const passwordRules = [
  { label: "At least 6 characters", test: (p: string) => p.length >= 6 },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  { label: "Contains a letter", test: (p: string) => /[a-zA-Z]/.test(p) },
];

export default function RegisterPage() {
  const { user, loading, registerWithEmail, signInWithGoogle, error, clearError } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === "admin" ? "/dashboard/admin" : "/dashboard/citizen");
    }
  }, [user, loading, router]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required.";
    if (!email) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match.";
    if (!agreed) errs.agreed = "Please accept the terms to continue.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await registerWithEmail(email, password, name.trim());
      toast.success("Account created! Choose your role.");
      router.push("/auth/role");
    } catch {
      // error handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    clearError();
    setGoogleLoading(true);
    try {
      const { isNewUser } = await signInWithGoogle();
      if (isNewUser) {
        toast.success("Account created! Choose your role.");
        router.push("/auth/role");
      } else {
        toast.success("Welcome back!");
      }
    } catch {
      // error handled in context
    } finally {
      setGoogleLoading(false);
    }
  };

  if (loading || user) return null;

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="glass-light rounded-3xl border border-white/80 shadow-card-hover p-8 sm:p-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-highlight to-orange-400 rounded-2xl flex items-center justify-center shadow-glow-amber mb-4">
              <Shield className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="font-heading font-bold text-2xl text-primary">Create your account</h1>
            <p className="text-primary/50 text-sm mt-1">Join 50,000+ citizens on CITYजन 🇮🇳</p>
          </div>

          {/* Google */}
          <motion.button
            onClick={handleGoogleRegister}
            disabled={googleLoading || submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-primary/15 hover:border-accent/40 text-primary font-semibold py-3.5 rounded-2xl transition-all duration-200 mb-5 shadow-sm hover:shadow-card disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <Chrome className="w-5 h-5 text-blue-500" />
            )}
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-primary/10" />
            <span className="text-primary/40 text-xs font-medium">or register with email</span>
            <div className="flex-1 h-px bg-primary/10" />
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-5"
            >
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-primary/60 uppercase tracking-wide mb-1.5 block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-primary/35" />
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: "" })); }}
                  placeholder="Arjun Mehta"
                  className={`w-full pl-10 pr-4 py-3.5 bg-background border rounded-xl text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.name ? "border-red-300 focus:ring-red-200" : "border-primary/15 focus:ring-accent/25 focus:border-accent/40"
                  }`}
                />
              </div>
              {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-primary/60 uppercase tracking-wide mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-primary/35" />
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3.5 bg-background border rounded-xl text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.email ? "border-red-300 focus:ring-red-200" : "border-primary/15 focus:ring-accent/25 focus:border-accent/40"
                  }`}
                />
              </div>
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-primary/60 uppercase tracking-wide mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-primary/35" />
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3.5 bg-background border rounded-xl text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.password ? "border-red-300 focus:ring-red-200" : "border-primary/15 focus:ring-accent/25 focus:border-accent/40"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/35 hover:text-primary/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}

              {/* Password strength */}
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordRules.map((rule) => (
                    <div key={rule.label} className="flex items-center gap-1.5">
                      <CheckCircle className={`w-3 h-3 ${rule.test(password) ? "text-green-500" : "text-primary/20"}`} />
                      <span className={`text-xs ${rule.test(password) ? "text-green-600" : "text-primary/40"}`}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-semibold text-primary/60 uppercase tracking-wide mb-1.5 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-primary/35" />
                <input
                  id="register-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: "" })); }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3.5 bg-background border rounded-xl text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.confirmPassword ? "border-red-300 focus:ring-red-200" : "border-primary/15 focus:ring-accent/25 focus:border-accent/40"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/35 hover:text-primary/60 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  id="register-terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => { setAgreed(e.target.checked); setFieldErrors((p) => ({ ...p, agreed: "" })); }}
                  className="mt-0.5 accent-accent w-4 h-4 rounded"
                />
                <span className="text-primary/60 text-sm leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-accent hover:underline font-medium">terms of service</a>{" "}
                  and{" "}
                  <a href="#" className="text-accent hover:underline font-medium">privacy policy</a>.
                </span>
              </label>
              {fieldErrors.agreed && <p className="text-red-500 text-xs mt-1">{fieldErrors.agreed}</p>}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting || googleLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-highlight hover:bg-amber-400 text-dark font-bold py-3.5 rounded-2xl shadow-glow-amber transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>

          <p className="text-center text-primary/50 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-accent font-semibold hover:underline">
              Sign in →
            </Link>
          </p>
        </div>

        <p className="text-center mt-5">
          <Link href="/auth/welcome" className="text-white/50 hover:text-white text-sm transition-colors">
            ← Back to welcome
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
