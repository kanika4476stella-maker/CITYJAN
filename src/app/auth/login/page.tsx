"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  Chrome,
  AlertCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { user, loading, signInWithGoogle, error, clearError, loginAsDemo } = useAuth();
  const router = useRouter();

  const [googleLoading, setGoogleLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === "admin" ? "/dashboard/admin" : "/dashboard/citizen");
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    clearError();
    setGoogleLoading(true);
    try {
      const { isNewUser } = await signInWithGoogle();
      if (isNewUser) {
        toast.success("Account created! Let's pick your role.");
        router.push("/auth/role");
      } else {
        toast.success("Welcome back!");
      }
    } catch {
      /* error shown via context */
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemoLogin = (role: "admin" | "citizen") => {
    loginAsDemo(role);
    toast.success(
      role === "admin"
        ? "Logged in as Admin 🏛️ — full dashboard access!"
        : "Logged in as Citizen 🏙️ — try filing a report!"
    );
  };

  if (loading || user) return null;

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-4 py-10">
      {/* Decorative Interactive Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-visible pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.2, 1],
              x: Math.random() * 20 - 10,
              y: Math.random() * 20 - 10,
            }}
            transition={{ 
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute rounded-full bg-blue-100"
            style={{
              width: `${10 + Math.random() * 30}px`,
              height: `${10 + Math.random() * 30}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: "blur(20px)"
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="group w-full max-w-md"
      >
        <motion.div
          whileHover={{ rotateX: 1, rotateY: 1 }}
          className="bg-white rounded-[48px] border border-gray-100 shadow-2xl shadow-blue-500/5 p-12 relative overflow-hidden transition-all duration-500 hover:shadow-blue-500/10"
        >
          {/* Subtle light streak */}
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-white via-blue-50/10 to-transparent pointer-events-none opacity-50" />

          {/* Logo Section */}
          <div className="flex flex-col items-center mb-12">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-[72px] h-[72px] bg-blue-600 rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-600/30 mb-8 relative"
            >
              <Shield className="w-8 h-8 text-white" strokeWidth={2} />
              <div className="absolute inset-0 bg-blue-600 rounded-[24px] animate-ping opacity-15" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-heading font-black text-3xl text-gray-900 mb-3"
            >
              Sign in to CITY<span className="text-blue-600">जन</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-sm font-medium text-center leading-relaxed max-w-[280px]"
            >
              Empowering citizens to build a smarter, more responsive Bharat.
            </motion.p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-start gap-4 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-8"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-[11px] font-black uppercase tracking-tight">{error}</p>
            </motion.div>
          )}

          {/* Google Button */}
          <motion.button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-4 bg-white hover:bg-gray-50 text-gray-900 font-black py-5 rounded-2xl transition-all border border-gray-100 shadow-xl shadow-gray-200/20 mb-10 disabled:opacity-50"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <Chrome className="w-5 h-5 text-blue-600" />
            )}
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-6 mb-10">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] whitespace-nowrap">OR DEMO ACCESS</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Interactive Demo Panels */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button 
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDemoLogin('citizen')} 
              className="group bg-blue-50/30 hover:bg-blue-600 border border-blue-100/50 hover:border-blue-600 rounded-[24px] p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-blue-500 transition-colors">
                <Users className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[10px] font-black text-blue-700/60 uppercase tracking-widest group-hover:text-white">Citizen</span>
            </motion.button>
            
            <motion.button 
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDemoLogin('admin')} 
              className="group bg-indigo-50/30 hover:bg-indigo-700 border border-indigo-100/50 hover:border-indigo-700 rounded-[24px] p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-indigo-600 transition-colors">
                <Shield className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[10px] font-black text-indigo-700/60 uppercase tracking-widest group-hover:text-white">Official</span>
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          className="mt-10 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/"
            className="group flex items-center gap-2 text-gray-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
          >
            <motion.span 
              whileHover={{ x: -2 }}
              className="inline-block"
            >
              ← 
            </motion.span>
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
