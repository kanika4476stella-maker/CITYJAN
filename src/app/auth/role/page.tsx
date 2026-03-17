"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  MapPin,
  CheckCircle,
  BarChart3,
  FileText,
  MessageSquare,
  Settings,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth, UserRole } from "@/context/AuthContext";

const roles: {
  id: UserRole;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
  selectedBg: string;
  icon: typeof Users;
  capabilities: { icon: typeof MapPin; label: string }[];
}[] = [
  {
    id: "citizen",
    title: "Citizen",
    subtitle: "Report issues, track resolutions, engage with your ward",
    emoji: "🏙️",
    color: "text-accent",
    bg: "bg-accent/8",
    border: "border-accent/20",
    selectedBg: "bg-accent/15",
    icon: Users,
    capabilities: [
      { icon: MapPin, label: "Submit geo-tagged grievances" },
      { icon: CheckCircle, label: "Track issue status in real-time" },
      { icon: MessageSquare, label: "Chat with JanBot AI assistant" },
      { icon: FileText, label: "Access e-governance documents" },
      { icon: AlertCircle, label: "Give feedback & rate resolutions" },
    ],
  },
  {
    id: "admin",
    title: "Admin",
    subtitle: "Manage reports, update statuses, view city-wide analytics",
    emoji: "🏛️",
    color: "text-highlight",
    bg: "bg-highlight/8",
    border: "border-highlight/20",
    selectedBg: "bg-highlight/15",
    icon: Shield,
    capabilities: [
      { icon: BarChart3, label: "City-wide analytics dashboard" },
      { icon: Settings, label: "Manage and update issue statuses" },
      { icon: TrendingUp, label: "Performance & resolution metrics" },
      { icon: Users, label: "Citizen report management" },
      { icon: MessageSquare, label: "Send ward announcements" },
    ],
  },
];

export default function RolePage() {
  const { loading, setUserRole, firebaseUser } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace("/auth/login");
    }
  }, [loading, firebaseUser, router]);

  const handleConfirm = async () => {
    if (!selected || !firebaseUser) return;
    setSaving(true);
    try {
      await setUserRole(firebaseUser.uid, selected);
      toast.success(
        selected === "admin"
          ? "Admin access granted. Welcome, Officer! 🏛️"
          : "Welcome aboard, Citizen! 🏙️"
      );
      router.replace(
        selected === "admin" ? "/dashboard/admin" : "/dashboard/citizen"
      );
    } catch {
      toast.error("Could not save your role. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !firebaseUser) return null;

  const displayName = firebaseUser.displayName ?? "Citizen";
  const firstName = displayName.split(" ")[0];

  return (
    <div className="relative z-10 w-full max-w-4xl px-4 py-20">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <div className="w-[800px] h-[800px] border border-blue-600 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute w-[600px] h-[600px] border border-blue-600 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-blue-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-blue-600/30 mx-auto mb-10"
        >
          <Shield className="w-10 h-10 text-white" />
        </motion.div>
        
        <h1 className="font-heading font-black text-4xl lg:text-6xl text-gray-900 mb-4 tracking-tight">
          Hey, {firstName}! 
        </h1>
        <p className="text-gray-400 text-lg font-medium">
          Choose your interface to begin your journey.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {roles.map((role, i) => {
          const isSelected = selected === role.id;
          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              onClick={() => setSelected(role.id)}
              className={`relative cursor-pointer group`}
            >
              <div
                className={`h-full bg-white rounded-[40px] border-2 p-10 transition-all duration-500 ${
                  isSelected 
                    ? "border-blue-600 shadow-2xl shadow-blue-500/10 scale-[1.02]" 
                    : "border-gray-50 hover:border-blue-100 hover:shadow-xl shadow-gray-200/20"
                }`}
              >
                {/* Selection Indicator */}
                <div className={`absolute top-8 right-8 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isSelected ? "bg-blue-600 border-blue-600 scale-110" : "border-gray-100 bg-white"
                }`}>
                  {isSelected && <CheckCircle className="w-5 h-5 text-white" />}
                </div>

                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-50 transition-colors">
                  <role.icon className={`w-8 h-8 ${isSelected ? "text-blue-600" : "text-gray-400"} transition-colors`} />
                </div>

                <h3 className={`font-heading font-black text-2xl mb-2 transition-colors ${isSelected ? "text-blue-600" : "text-gray-900"}`}>
                  {role.title}
                </h3>
                <p className="text-gray-400 text-sm font-medium mb-10 leading-relaxed">
                  {role.subtitle}
                </p>

                <ul className="space-y-4">
                  {role.capabilities.map((cap, j) => (
                    <motion.li 
                      key={cap.label}
                      initial={false}
                      animate={{ opacity: isSelected ? 1 : 0.4 }}
                      className="flex items-center gap-4"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-600" : "bg-gray-200"}`} />
                      <span className={`text-[11px] font-black uppercase tracking-wider ${isSelected ? "text-gray-900" : "text-gray-400"}`}>
                        {cap.label}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <motion.button
          onClick={handleConfirm}
          disabled={!selected || saving}
          whileHover={selected ? { scale: 1.05 } : {}}
          whileTap={selected ? { scale: 0.95 } : {}}
          className={`px-16 py-6 rounded-2xl font-black text-lg transition-all flex items-center gap-4 ${
            selected 
              ? "bg-blue-600 text-white shadow-2xl shadow-blue-600/30" 
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          {saving ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Confirm & Launch
              <ArrowRight className="w-6 h-6" />
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
