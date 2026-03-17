"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, MapPin, CheckCircle, Users, ArrowRight, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const floatingItems = [
  { icon: MapPin, label: "Report Issue", color: "text-blue-400", bg: "bg-blue-400/15", delay: 0 },
  { icon: CheckCircle, label: "Track Status", color: "text-green-400", bg: "bg-green-400/15", delay: 0.3 },
  { icon: Users, label: "Community", color: "text-highlight", bg: "bg-highlight/15", delay: 0.6 },
];

const features = [
  "Submit civic grievances with GPS + photo",
  "AI-powered auto-routing to departments",
  "Real-time status updates & notifications",
  "Community polls & ward announcements",
  "Admin analytics dashboard",
];

export default function WelcomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(
        user.role === "admin" ? "/dashboard/admin" : "/dashboard/citizen"
      );
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className="min-h-screen animated-gradient grain-texture relative overflow-hidden flex flex-col">
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-highlight/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 hero-grid opacity-40 pointer-events-none" />

      {/* Header bar */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-heading font-bold text-xl text-white">
            CITY<span className="text-accent-light">जन</span>
          </span>
        </div>
        <Link
          href="/"
          className="text-white/60 hover:text-white text-sm transition-colors"
        >
          ← Back to homepage
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left: Headline + CTAs */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 glass border border-white/20 rounded-full px-4 py-2 mb-8"
            >
              <span className="w-2 h-2 bg-highlight rounded-full animate-pulse" />
              <span className="text-white/80 text-sm font-medium">🇮🇳 Smart Governance Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-5xl sm:text-6xl font-bold text-white leading-tight mb-5"
            >
              Welcome to
              <span className="block text-gradient-amber">CITYजन</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/65 text-lg leading-relaxed mb-10 max-w-md"
            >
              Your civic engagement platform. Report city issues, track resolutions, 
              and participate in shaping your community — powered by AI.
            </motion.p>

            {/* Feature checklist */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2.5 mb-10"
            >
              {features.map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="flex items-center gap-3 text-white/70 text-sm"
                >
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  {f}
                </motion.li>
              ))}
            </motion.ul>

            {/* Auth CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/auth/register">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="shine flex items-center justify-center gap-2 bg-highlight hover:bg-amber-400 text-dark font-bold px-8 py-4 rounded-2xl text-lg shadow-glow-amber transition-all cursor-pointer"
                >
                  <Zap className="w-5 h-5" />
                  Get Started Free
                </motion.div>
              </Link>
              <Link href="/auth/login">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 glass border border-white/25 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition-all cursor-pointer"
                >
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Link>
            </motion.div>
          </div>

          {/* Right: Animated card UI */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="hidden lg:block relative"
          >
            {/* Main card */}
            <div className="glass rounded-3xl border border-white/20 p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wide">Active Sessions</p>
                  <p className="font-heading font-bold text-white text-2xl">50,241</p>
                </div>
                <span className="flex items-center gap-1.5 bg-green-400/15 border border-green-400/25 rounded-full px-3 py-1.5 text-green-400 text-xs font-semibold">
                  <span className="pulse-dot" /> Live
                </span>
              </div>

              {/* Role cards */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-accent/15 border border-accent/20 rounded-2xl p-4">
                  <Users className="w-5 h-5 text-accent mb-2" />
                  <p className="font-heading font-bold text-white text-xl">48,392</p>
                  <p className="text-white/50 text-xs">Citizens</p>
                </div>
                <div className="bg-highlight/15 border border-highlight/20 rounded-2xl p-4">
                  <Shield className="w-5 h-5 text-highlight mb-2" />
                  <p className="font-heading font-bold text-white text-xl">1,849</p>
                  <p className="text-white/50 text-xs">Admins</p>
                </div>
              </div>

              {/* Recent activity */}
              <div className="space-y-2">
                <p className="text-white/40 text-xs uppercase tracking-wide mb-3">Recent Reports</p>
                {[
                  { text: "Road damage — Sector 42, Delhi", status: "Resolved", color: "text-green-400" },
                  { text: "Water leakage — Tank Road, Mumbai", status: "In Progress", color: "text-highlight" },
                  { text: "Broken streetlight — MG Road", status: "Assigned", color: "text-blue-400" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5">
                    <span className="text-white/70 text-xs truncate max-w-[160px]">{item.text}</span>
                    <span className={`text-xs font-semibold ${item.color}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating role badges */}
            {floatingItems.map((item, i) => (
              <motion.div
                key={item.label}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3 + i, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
                className={`absolute glass border border-white/15 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-xl ${
                  i === 0 ? "-top-6 -left-8" : i === 1 ? "-bottom-4 -left-6" : "-right-8 top-1/3"
                }`}
              >
                <div className={`w-8 h-8 ${item.bg} rounded-xl flex items-center justify-center`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-white text-xs font-medium">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Bottom tagline */}
      <footer className="relative z-10 text-center py-5">
        <p className="text-white/30 text-xs">
          Empowering Citizens • Powered by AWS AI • Built for Bharat 🇮🇳
        </p>
      </footer>
    </div>
  );
}
