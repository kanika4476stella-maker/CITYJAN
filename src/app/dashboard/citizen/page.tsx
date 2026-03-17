"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Bell,
  LogOut,
  Plus,
  TrendingUp,
  ChevronRight,
  Settings,
  Megaphone,
  Hospital,
  Building,
  PhoneCall,
  Flame,
  User as UserIcon,
  Award,
  Trophy,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getUserReports, Report } from "@/lib/reports";
import Link from "next/link";
import Image from "next/image";
import LanguageSelector from "@/components/layout/LanguageSelector";
import { T } from "@/context/LanguageContext";

type NavTab = "overview" | "my-reports" | "rewards" | "settings";

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  resolved: { color: "text-green-600", bg: "bg-green-50 border-green-200", icon: CheckCircle },
  "in progress": { color: "text-highlight", bg: "bg-amber-50 border-amber-200", icon: Clock },
  "under review": { color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: TrendingUp },
  submitted: { color: "text-gray-500", bg: "bg-gray-50 border-gray-200", icon: AlertCircle },
  verified: { color: "text-purple-600", bg: "bg-purple-50 border-purple-200", icon: CheckCircle },
  rejected: { color: "text-red-500", bg: "bg-red-50 border-red-200", icon: AlertCircle },
};

export default function CitizenDashboardPage() {
  return (
    <ProtectedRoute requiredRole="citizen">
      <CitizenDashboardContent />
    </ProtectedRoute>
  );
}

function CitizenDashboardContent() {
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast("Signed out. See you soon!", { icon: "👋" });
    router.replace("/auth/login");
  };

  const tabs: { id: NavTab; label: string; icon: any }[] = [
    { id: "overview", label: "Dashboard", icon: TrendingUp },
    { id: "my-reports", label: "My Reports", icon: AlertCircle },
    { id: "rewards", label: "Rewards & Certificate", icon: Award },
    { id: "settings", label: "Profile Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-primary/5 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-heading font-bold text-primary text-lg">
              CITY<span className="text-accent">जन</span>
            </span>
            <span className="hidden sm:block ml-1 text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full font-medium border border-accent/20">
              Citizen Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button className="relative p-2 rounded-xl text-primary/50 hover:text-primary hover:bg-primary/5 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-2.5 bg-background rounded-xl px-3 py-1.5 border border-primary/10">
              <div className="w-7 h-7 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center text-white text-xs font-bold">
                {user?.displayName?.[0]?.toUpperCase() ?? "C"}
              </div>
              <div className="hidden sm:block">
                <p className="text-primary text-xs font-semibold leading-none">{user?.displayName ?? "Citizen"}</p>
                <p className="text-primary/40 text-[10px] leading-none mt-0.5 truncate max-w-[120px]">{user?.email ?? ""}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-xl text-primary/40 hover:text-red-500 hover:bg-red-50 transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full transition-all ${
                  activeTab === tab.id 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "bg-transparent text-primary/60 hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <T>{tab.label}</T>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "my-reports" && <MyReportsTab />}
            {activeTab === "rewards" && <RewardsTab />}
            {activeTab === "settings" && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview Tab
// ─────────────────────────────────────────────────────────────────────────────

function OverviewTab() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(" ")[0] ?? "Citizen";
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      if (user) {
        try {
          const userReports = await getUserReports(user.uid);
          setReports(userReports);
        } catch (error) {
          console.error("Failed to fetch reports", error);
        }
      }
      setLoading(false);
    }
    fetchReports();
  }, [user]);

  const recentReport = reports[0];
  const pendingCount = reports.filter(r => r.status === "Submitted" || r.status === "Under Review").length;
  const resolvedCount = reports.filter(r => r.status === "Resolved").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Hero & Quick Action) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-[#1A3C6E] to-[#0F1E3C] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-3xl rounded-full -mr-20 -mt-20"></div>
            <div className="relative z-10">
              <p className="text-white/70 text-sm font-medium">Welcome back,</p>
              <h2 className="font-heading font-bold text-3xl mt-1 mb-4">{firstName}</h2>
              <p className="text-white/80 text-sm max-w-sm leading-relaxed mb-6">
                Your civic participation builds a better city. 
                {pendingCount > 0 ? ` You have ${pendingCount} active reports tracked right now.` : " Ready to make an impact today?"}
              </p>
              
              {/* Primary Call to Action */}
              <Link href="/report">
                <button className="flex items-center gap-2 bg-highlight hover:bg-[#E59100] text-[#4A2D00] px-6 py-3.5 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-glow-amber">
                  <Plus className="w-5 h-5" />
                  <T>Report an Issue</T>
                </button>
              </Link>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-primary/5 shadow-sm">
              <p className="text-primary/50 text-xs font-semibold uppercase tracking-wider mb-2">Total Reports</p>
              <p className="text-3xl font-bold text-primary">{loading ? "-" : reports.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-primary/5 shadow-sm">
              <p className="text-primary/50 text-xs font-semibold uppercase tracking-wider mb-2">Resolved</p>
              <p className="text-3xl font-bold text-green-600">{loading ? "-" : resolvedCount}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-primary/5 shadow-sm">
              <p className="text-primary/50 text-xs font-semibold uppercase tracking-wider mb-2">In Progress</p>
              <p className="text-3xl font-bold text-highlight">{loading ? "-" : pendingCount}</p>
            </div>
          </div>

          {/* Ticket Status Tracker (Latest) */}
          <div className="bg-white rounded-3xl border border-primary/5 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-primary text-lg">Latest Ticket Status</h3>
              <Link href="#" className="text-accent text-sm font-semibold hover:underline flex items-center gap-1">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-primary/10 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-primary/10 rounded"></div>
                    <div className="h-4 bg-primary/10 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ) : recentReport ? (
              <div className="bg-background rounded-2xl p-5 border border-primary/5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary mb-2">
                      {recentReport.category}
                    </span>
                    <h4 className="font-bold text-primary text-base">{recentReport.title}</h4>
                    <p className="text-xs text-primary/50 mt-1 max-w-md truncate">{recentReport.address}</p>
                  </div>
                  {(() => {
                    const cfg = statusConfig[recentReport.status.toLowerCase()] || statusConfig.pending;
                    return (
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color}`}>
                        <cfg.icon className="w-3.5 h-3.5" />
                        <span className="capitalize">{recentReport.status}</span>
                      </span>
                    )
                  })()}
                </div>
                
                {/* Progress Tracker UI */}
                <div className="relative mt-6 pt-2">
                  <div className="absolute top-4 left-0 w-full h-1 bg-primary/10 rounded-full" />
                  <div className={`absolute top-4 left-0 h-1 rounded-full transition-all duration-1000 ${
                    recentReport.status === 'Submitted' ? 'w-1/4 bg-gray-400' :
                    recentReport.status === 'Under Review' ? 'w-1/2 bg-blue-400' :
                    recentReport.status === 'In Progress' ? 'w-3/4 bg-amber-400' :
                    'w-full bg-green-500'
                  }`} />
                  
                  <div className="relative z-10 flex justify-between">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center border-4 border-white"><CheckCircle className="w-3 h-3"/></div>
                      <span className="text-[10px] font-bold text-primary uppercase">Submitted</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border-4 border-white ${recentReport.status !== 'Submitted' ? 'bg-blue-500 text-white' : 'bg-primary/20 text-transparent'}`}><CheckCircle className="w-3 h-3"/></div>
                      <span className={`text-[10px] font-bold uppercase ${recentReport.status !== 'Submitted' ? 'text-blue-600' : 'text-primary/40'}`}>Under Review</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border-4 border-white ${['In Progress', 'Resolved'].includes(recentReport.status) ? 'bg-amber-500 text-white' : 'bg-primary/20 text-transparent'}`}><CheckCircle className="w-3 h-3"/></div>
                      <span className={`text-[10px] font-bold uppercase ${['In Progress', 'Resolved'].includes(recentReport.status) ? 'text-amber-600' : 'text-primary/40'}`}>In Progress</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border-4 border-white ${recentReport.status === 'Resolved' ? 'bg-green-500 text-white' : 'bg-primary/20 text-transparent'}`}><CheckCircle className="w-3 h-3"/></div>
                      <span className={`text-[10px] font-bold uppercase ${recentReport.status === 'Resolved' ? 'text-green-600' : 'text-primary/40'}`}>Resolved</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-primary/20" />
                </div>
                <p className="text-primary/60 text-sm font-medium">No active reports.</p>
                <p className="text-primary/40 text-xs mt-1">Found an issue? Report it now.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Announcements & Resources) */}
        <div className="space-y-6">
          
          {/* Civic Score & Achievements */}
          <div className="bg-white rounded-3xl border border-primary/5 shadow-sm p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex items-center justify-between mb-5 relative z-10">
              <h3 className="font-heading font-bold text-primary text-base flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" /> Civic Score
              </h3>
              <span className="bg-yellow-50 text-yellow-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-yellow-200 tracking-wide uppercase">
                {user?.points! >= 200 ? "Good Citizen" : user?.points! >= 100 ? "Responsible Citizen" : user?.points! >= 50 ? "Active Citizen" : "Beginner Citizen"}
              </span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center mb-6 pt-2">
              <div className="text-4xl font-black text-primary mb-1 tracking-tight">
                {user?.points || 0} <span className="text-sm font-medium text-primary/40 tracking-normal">pts</span>
              </div>
              <div className="w-full bg-background rounded-full h-2.5 mb-2 border border-primary/5 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-400 to-indigo-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (user?.points || 0) / 200 * 100)}%` }}></div>
              </div>
              <p className="text-[10px] text-primary/50 font-bold uppercase tracking-wider">{Math.max(0, 200 - (user?.points || 0))} pts to Certificate</p>
            </div>
            
            <div className="grid grid-cols-3 gap-2 relative z-10">
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 text-center shadow-sm">
                <Award className="w-6 h-6 text-amber-500 mb-1" />
                <span className="text-[10px] font-bold text-amber-900 leading-tight">First Reporter</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-center shadow-sm">
                <Star className="w-6 h-6 text-blue-500 mb-1" />
                <span className="text-[10px] font-bold text-blue-900 leading-tight">Civic Hero</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-background border border-primary/5 text-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="Resolve 10 reports to unlock">
                <CheckCircle className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-[10px] font-bold text-primary/60 leading-tight">Master Fixer</span>
              </div>
            </div>
          </div>
          
          {/* Announcements */}
          <div className="bg-white rounded-3xl border border-primary/5 shadow-sm overflow-hidden">
            <div className="bg-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Megaphone className="w-5 h-5 text-highlight" />
                <h3 className="font-heading font-bold text-white text-base">Govt Announcements</h3>
              </div>
              <Link href="/announcements" className="text-xs text-white/70 hover:text-white font-medium underline underline-offset-2">
                View All
              </Link>
            </div>
            <div className="p-5 space-y-4">
              {[
                { date: "Today, 10:00 AM", title: "Water Supply Disruption", desc: "Sectors 12 to 15 will face water cuts due to pipeline maintenance.", color: "border-l-red-500" },
                { date: "Mar 15, 2026", title: "New Smart Bins Deployed", desc: "100+ sensor-equipped bins installed across major market areas.", color: "border-l-green-500" },
                { date: "Mar 12, 2026", title: "Property Tax Deadline", desc: "Last date to avail 5% rebate on property tax is March 31st.", color: "border-l-accent" },
              ].map((ann, i) => (
                <div key={i} className={`pl-4 border-l-4 ${ann.color}`}>
                  <p className="text-[10px] font-bold text-primary/40 uppercase mb-1">{ann.date}</p>
                  <p className="text-sm font-bold text-primary mb-1">{ann.title}</p>
                  <p className="text-xs text-primary/60 leading-relaxed">{ann.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Resources */}
          <div className="bg-white rounded-3xl border border-primary/5 shadow-sm p-6">
            <h3 className="font-heading font-bold text-primary text-base mb-4">Nearby Emergency Resources</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "City Hospital", icon: Hospital, color: "text-red-500", bg: "bg-red-50" },
                { label: "Police Station", icon: Shield, color: "text-blue-500", bg: "bg-blue-50" },
                { label: "Fire Brigade", icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
                { label: "Municipal Corp.", icon: Building, color: "text-primary", bg: "bg-primary/5" },
              ].map((res, i) => (
                <Link key={i} href="/emergency" className={`flex flex-col items-center justify-center p-3 rounded-2xl ${res.bg} hover:brightness-95 transition-all text-center group`}>
                  <res.icon className={`w-6 h-6 ${res.color} mb-2 group-hover:scale-110 transition-transform`} />
                  <span className="text-[11px] font-bold text-primary leading-tight">{res.label}</span>
                </Link>
              ))}
            </div>
            <Link href="/emergency" className="block w-full mt-4">
              <button className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-3 rounded-xl border border-red-100 hover:bg-red-100 transition-colors text-sm">
                <PhoneCall className="w-4 h-4" />
                View Emergency Contacts
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// My Reports Tab (Includes Detailed Status)
// ─────────────────────────────────────────────────────────────────────────────

function MyReportsTab() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      if (user) {
        setReports(await getUserReports(user.uid));
      }
      setLoading(false);
    }
    fetchReports();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-primary text-2xl">My Submitted Reports</h2>
          <p className="text-primary/50 text-sm mt-1">Track the resolution status of all your complaints.</p>
        </div>
        <Link href="/report">
          <button className="hidden sm:flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all text-sm">
            <Plus className="w-4 h-4" /> New Report
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-primary/5 animate-pulse flex gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-xl" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-primary/10 rounded w-1/4" />
                <div className="h-5 bg-primary/10 rounded w-1/2" />
                <div className="h-3 bg-primary/10 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-primary/5 shadow-sm">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-primary/20" />
          </div>
          <h3 className="font-heading font-bold text-primary text-xl mb-2">No reports yet</h3>
          <p className="text-primary/50 text-sm mb-6">You haven't submitted any civic issues to the municipality.</p>
          <Link href="/report">
            <button className="bg-accent text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Start a Report
            </button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-primary/10 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-background border-b border-primary/8">
                  <th className="px-4 py-3 text-xs font-semibold text-primary/50 uppercase tracking-wide">Ticket ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-primary/50 uppercase tracking-wide">Description</th>
                  <th className="px-4 py-3 text-xs font-semibold text-primary/50 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-primary/50 uppercase tracking-wide">Location</th>
                  <th className="px-4 py-3 text-xs font-semibold text-primary/50 uppercase tracking-wide">Resolution Updates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {reports.map((r) => {
                  const cfg = statusConfig[r.status.toLowerCase()] || statusConfig.submitted;
                  
                  return (
                    <tr key={r.reportId} className="hover:bg-background/60 transition-colors">
                      <td className="px-4 py-4 align-top">
                        <span className="text-xs font-mono font-bold text-primary/70">{r.reportId}</span>
                      </td>
                      <td className="px-4 py-4 align-top max-w-xs">
                        <p className="text-sm font-bold text-primary mb-1"><T>{r.title}</T></p>
                        <p className="text-xs text-primary/60 line-clamp-2"><T>{r.description}</T></p>
                      </td>
                      <td className="px-4 py-4 align-top whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color}`}>
                          <cfg.icon className="w-3 h-3" />
                          <span className="capitalize">{r.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top max-w-[150px]">
                        <p className="text-xs font-medium text-primary/70 truncate" title={r.address}>
                          <MapPin className="w-3 h-3 inline mr-1 text-primary/40 -mt-0.5" />
                          {r.address || "No precise location"}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top min-w-[160px]">
                        <p className="text-xs text-primary/60">
                          {r.status === "Submitted" && "Ticket lodged. Waiting for municipal assignment."}
                          {r.status === "Under Review" && "An officer is currently reviewing your ticket."}
                          {r.status === "In Progress" && "Action is being taken on ground. Resolution expected soon."}
                          {r.status === "Resolved" && "Issue has been completely resolved. Thank you!"}
                        </p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings Tab
// ─────────────────────────────────────────────────────────────────────────────

function SettingsTab() {
  const { user } = useAuth();
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-heading font-bold text-primary text-2xl">Profile Settings</h2>
        <p className="text-primary/50 text-sm mt-1">Manage your account and preferences.</p>
      </div>
      <div className="bg-white rounded-3xl border border-primary/5 shadow-sm p-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-primary/10">
          <div className="w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user?.displayName?.[0]?.toUpperCase() ?? "C"}
          </div>
          <div>
            <h3 className="font-bold text-primary text-xl">{user?.displayName ?? "Citizen User"}</h3>
            <p className="text-primary/60 text-sm mt-1">{user?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified Citizen
            </div>
          </div>
        </div>
        <SettingsForm />
      </div>
    </div>
  );
}

function SettingsForm() {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [twitter, setTwitter] = useState(user?.social_links?.twitter || "");
  const [linkedin, setLinkedin] = useState(user?.social_links?.linkedin || "");
  const [instagram, setInstagram] = useState(user?.social_links?.instagram || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({
        displayName: name.trim() || (user?.displayName ?? "Citizen"),
        social_links: { twitter: twitter.trim(), linkedin: linkedin.trim(), instagram: instagram.trim() },
      });
      toast.success("Profile updated!");
    } catch {
      toast.error("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSave}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-bold text-primary/50 uppercase tracking-wide mb-2 block">Full Name</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-primary/15 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-primary focus:outline-none focus:border-accent" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-primary/50 uppercase tracking-wide mb-2 block">Phone Number</label>
          <div className="relative">
            <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
            <input type="text" placeholder="+91 98765 43210" className="w-full bg-background border border-primary/15 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-primary focus:outline-none focus:border-accent" />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-primary mb-3">Social Media Links</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-primary/50 uppercase tracking-wide mb-2 block">Twitter / X</label>
            <input type="text" value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="https://twitter.com/..." className="w-full bg-background border border-primary/15 rounded-xl px-4 py-3 text-sm font-medium text-primary focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs font-bold text-primary/50 uppercase tracking-wide mb-2 block">LinkedIn</label>
            <input type="text" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full bg-background border border-primary/15 rounded-xl px-4 py-3 text-sm font-medium text-primary focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs font-bold text-primary/50 uppercase tracking-wide mb-2 block">Instagram</label>
            <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/..." className="w-full bg-background border border-primary/15 rounded-xl px-4 py-3 text-sm font-medium text-primary focus:outline-none focus:border-accent" />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-primary/10 flex justify-end">
        <button type="submit" disabled={saving} className="bg-primary hover:bg-[#0F1E3C] disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2">
          {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Rewards & Gamification Tab
// ─────────────────────────────────────────────────────────────────────────────

function RewardsTab() {
  const { user } = useAuth();
  const points = user?.points || 0;
  const rank = points >= 200 ? "Good Citizen" : points >= 100 ? "Responsible Citizen" : points >= 50 ? "Active Citizen" : "Beginner Citizen";
  const progressPercent = Math.min(100, (points / 200) * 100);
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-heading font-bold text-primary text-2xl">Rewards & Leaderboard</h2>
        <p className="text-primary/50 text-sm mt-1">Earn points by submitting valid reports. Get a certificate at 200 points.</p>
      </div>

      <div className="bg-white rounded-3xl border border-primary/5 shadow-sm p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/3 flex flex-col items-center p-6 bg-gradient-to-b from-purple-50 to-indigo-50 border border-purple-100 rounded-3xl text-center">
            <Trophy className="w-16 h-16 text-purple-600 mb-3" />
            <h3 className="font-bold text-primary text-xl mb-1">{rank}</h3>
            <p className="text-3xl font-black text-purple-700 mb-2">{points} <span className="text-sm font-medium">pts</span></p>
            <p className="text-xs text-primary/60">Verified Reports: <strong className="text-green-600">{user?.verified_reports || 0}</strong></p>
            <p className="text-xs text-primary/60 mt-1">Rejected Reports: <strong className="text-red-500">{user?.rejected_reports || 0}</strong></p>
          </div>
          
          <div className="w-full md:w-2/3 space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h4 className="font-bold text-primary">Certificate Progress</h4>
                  <p className="text-xs text-primary/50">Reach 200 points to unlock your official Good Citizen Certificate.</p>
                </div>
                <span className="font-bold text-purple-600">{points} / 200</span>
              </div>
              <div className="w-full bg-background rounded-full h-4 mb-2 border border-primary/5 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-4 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            <div className="bg-background border border-primary/10 rounded-2xl p-5">
              <h5 className="font-bold text-sm text-primary mb-3">How does it work?</h5>
              <ul className="space-y-2 text-xs text-primary/70">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Each verified report = <strong>+10 points</strong></li>
                <li className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500" /> Rejected / fake report = <strong>0 points</strong></li>
                <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500" /> Repeated fake reports may flag your account.</li>
              </ul>
            </div>

            {points >= 200 ? (
              <div className="pt-4 border-t border-primary/10 flex flex-wrap gap-3">
                <Link href={`/certificate/${user?.uid}`} target="_blank">
                  <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-purple-200 transition-all flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    View Certificate
                  </button>
                </Link>
                <Link href="/leaderboard">
                  <button className="bg-background hover:bg-white text-primary px-6 py-3 rounded-xl font-bold border border-primary/10 transition-all">
                    View Leaderboard
                  </button>
                </Link>
              </div>
            ) : (
              <div className="pt-4 border-t border-primary/10 flex items-center justify-between text-sm text-primary/50 font-medium">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 opacity-40" />
                  Certificate locked. Keep reporting!
                </div>
                <Link href="/leaderboard">
                  <button className="text-accent hover:underline font-bold">
                    View Leaderboard
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
