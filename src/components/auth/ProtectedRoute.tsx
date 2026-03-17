"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full"
      />
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="font-heading text-white/70 text-sm">
          Verifying session…
        </span>
      </div>
    </div>
  );
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(redirectTo);
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      // Wrong role — send to their own dashboard
      router.replace(
        user.role === "admin" ? "/dashboard/admin" : "/dashboard/citizen"
      );
    }
  }, [user, loading, requiredRole, redirectTo, router]);

  if (loading) return <LoadingSpinner />;
  if (!user) return null;
  if (requiredRole && user.role !== requiredRole) return null;

  return <>{children}</>;
}
