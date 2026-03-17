import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — CITYजन",
  description: "Sign in to CITYजन to access your civic engagement dashboard.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDFDFD] relative flex items-center justify-center overflow-hidden">
      {/* Background decorations - ultra subtle */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none -translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-50/30 rounded-full blur-[120px] pointer-events-none translate-x-1/4 translate-y-1/4" />
      
      {/* Subtlest grid overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />

      <div className="relative z-10 w-full flex items-center justify-center p-4 py-20">
        {children}
      </div>
    </div>
  );
}
