"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, CheckCircle, Clock, TrendingUp, AlertCircle, ArrowUp, Zap, Filter, LogIn } from "lucide-react";
import { getAllReports, Report, upvoteReport } from "@/lib/reports";
import Link from "next/link";
import { getTopUsers } from "@/lib/users";
import { AppUser, useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  resolved: { color: "text-green-600", bg: "bg-green-50 border-green-200", icon: CheckCircle },
  "in progress": { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Clock },
  "under review": { color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: TrendingUp },
  submitted: { color: "text-gray-500", bg: "bg-gray-50 border-gray-200", icon: AlertCircle },
  verified: { color: "text-purple-600", bg: "bg-purple-50 border-purple-200", icon: CheckCircle },
  rejected: { color: "text-red-500", bg: "bg-red-50 border-red-200", icon: AlertCircle },
};

const UPVOTES_KEY = "CITYजन_feed_upvotes";

function getLocalUpvotes(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(UPVOTES_KEY) || "{}"); } catch { return {}; }
}
function saveLocalUpvote(reportId: string) {
  const v = getLocalUpvotes();
  v[reportId] = true;
  try { localStorage.setItem(UPVOTES_KEY, JSON.stringify(v)); } catch {}
}

export default function PublicFeedPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [topCitizens, setTopCitizens] = useState<AppUser[]>([]);
  const [localUpvotes, setLocalUpvotes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLocalUpvotes(getLocalUpvotes());
    Promise.all([getAllReports(), getTopUsers(5)]).then(([reportsData, usersData]) => {
      setReports(reportsData.length > 0 ? reportsData : getDemoFeed());
      setTopCitizens(usersData);
      setLoading(false);
    });
  }, []);

  const handleUpvote = useCallback(async (reportId: string) => {
    if (!user) {
      toast.error("Please log in to upvote reports.");
      return;
    }
    if (localUpvotes[reportId]) {
      // Toggle off
      setReports(prev => prev.map(r => r.reportId === reportId ? { ...r, upvotes: Math.max(0, (r.upvotes || 1) - 1) } : r));
      const updated = { ...localUpvotes };
      delete updated[reportId];
      setLocalUpvotes(updated);
      try { localStorage.setItem(UPVOTES_KEY, JSON.stringify(updated)); } catch {}
      return;
    }
    // Optimistic update
    setReports(prev => prev.map(r => r.reportId === reportId ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r));
    setLocalUpvotes(prev => ({ ...prev, [reportId]: true }));
    saveLocalUpvote(reportId);
    const ok = await upvoteReport(reportId, user.uid);
    if (ok) {
      toast.success("Thanks for voting! Admins will see this.", { icon: "⬆️" });
    }
  }, [user, localUpvotes]);

  const filtered = reports.filter(r => {
    const matchStatus = filter === "All" || r.status.toLowerCase() === filter.toLowerCase();
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.address?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0F1E3C] to-[#1A3C6E] pb-32 pt-16 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="text-white space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-white/50 hover:text-white text-sm font-medium transition-colors">← Home</Link>
              <span className="text-white/20">/</span>
              <span className="text-white/80 text-sm font-medium">Community Feed</span>
            </div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tight">
              Community <span className="text-highlight">Pulse</span>
            </h1>
            <p className="text-white/70 leading-relaxed">
              Upvote issues that affect your neighborhood to help admins prioritize faster resolutions.
            </p>
          </div>
          <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by location or issue..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-white placeholder:text-white/50 px-4 py-2 outline-none w-full md:w-64"
            />
            <button className="bg-highlight hover:bg-yellow-500 text-yellow-900 px-5 py-2 rounded-xl font-bold transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 -mt-24 pb-20 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Feed */}
        <div className="lg:col-span-2 space-y-5">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-3 flex gap-2 overflow-x-auto shadow-sm border border-primary/5 items-center">
            <div className="flex items-center gap-1.5 pr-3 border-r border-primary/10 mr-1 text-primary/40 text-xs font-bold uppercase tracking-wide shrink-0">
              <Filter className="w-4 h-4" /> Filter
            </div>
            {["All", "Submitted", "Under Review", "In Progress", "Verified", "Resolved"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === f ? "bg-primary text-white shadow-sm" : "bg-primary/5 text-primary/60 hover:bg-primary/10"}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Report count */}
          <p className="text-primary/50 text-sm font-medium px-1">
            Showing <strong className="text-primary">{filtered.length}</strong> reports
            {filter !== "All" && <> with status <strong className="text-accent">{filter}</strong></>}
            {search && <> matching <strong className="text-accent">&quot;{search}&quot;</strong></>}
          </p>

          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-primary/5"></div>)
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-primary/5">
              <AlertCircle className="w-10 h-10 text-primary/20 mx-auto mb-3" />
              <p className="text-primary/50 font-medium">No reports found.</p>
              <Link href="/report"><button className="mt-4 bg-accent text-white px-6 py-2 rounded-xl font-bold text-sm">Be the first to report</button></Link>
            </div>
          ) : (
            filtered.map((report, idx) => {
              const config = statusConfig[report.status.toLowerCase()] || statusConfig.submitted;
              const voteCount = report.upvotes || 0;
              const isHot = voteCount > 15 && ["Submitted", "Under Review"].includes(report.status);
              const voted = localUpvotes[report.reportId];

              return (
                <motion.div
                  key={report.reportId}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border transition-shadow hover:shadow-md ${isHot ? "border-red-300/60 bg-red-50/5" : "border-primary/5"}`}
                >
                  <div className="flex gap-4 sm:gap-6">
                    {/* Upvote */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleUpvote(report.reportId)}
                        title={user ? (voted ? "Remove vote" : "Upvote this issue") : "Login to vote"}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border ${
                          voted
                            ? "bg-accent text-white border-accent shadow-lg scale-105"
                            : "bg-primary/5 text-primary/40 hover:text-accent hover:bg-accent/10 border-primary/10"
                        }`}
                      >
                        <ArrowUp className="w-5 h-5" />
                      </button>
                      <span className={`text-base font-black ${voted ? "text-accent" : "text-primary/60"}`}>{voteCount}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            {isHot && (
                              <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Zap className="w-3 h-3 fill-current" /> Hot
                              </span>
                            )}
                            <span className="bg-primary/5 text-primary/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider capitalize">
                              {report.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-primary leading-tight">{report.title}</h3>
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.color} shrink-0`}>
                          <config.icon className="w-3.5 h-3.5" />
                          <span className="capitalize">{report.status}</span>
                        </span>
                      </div>

                      <p className="text-primary/60 text-sm leading-relaxed line-clamp-2">{report.description}</p>

                      <div className="flex items-center gap-3 text-xs text-primary/50 flex-wrap">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0" /> <span className="truncate max-w-[160px]">{report.address || "Location pending"}</span></span>
                        <span className="text-primary/20">•</span>
                        <span className="font-medium">{report.userDisplayName}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5 sticky top-6">
          {!user && (
            <div className="bg-gradient-to-br from-accent/10 to-primary/10 border border-primary/10 rounded-2xl p-5 text-center">
              <LogIn className="w-8 h-8 text-primary/40 mx-auto mb-3" />
              <p className="text-sm font-bold text-primary mb-1">Login to Vote</p>
              <p className="text-xs text-primary/60 mb-3">Your votes help prioritize real civic issues.</p>
              <Link href="/auth/login"><button className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm w-full hover:bg-primary/90 transition-colors">Sign In with Google</button></Link>
            </div>
          )}

          <Link href="/report" className="block">
            <button className="w-full bg-gradient-to-r from-highlight to-[#E59100] text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-amber-200 transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" /> File a New Report
            </button>
          </Link>

          <div className="bg-white rounded-3xl border border-primary/5 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 flex items-center justify-between">
              <h3 className="font-heading font-bold text-white">Civic Heroes</h3>
              <Link href="/leaderboard" className="text-white/70 hover:text-white text-xs font-bold underline underline-offset-2">View All</Link>
            </div>
            <div className="p-4 space-y-3">
              {topCitizens.length === 0 && <p className="text-xs text-primary/40 text-center py-2">No data yet</p>}
              {topCitizens.map((c, i) => (
                <div key={c.uid} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-amber-100 text-amber-700" : "bg-primary/5 text-primary/40"}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-primary truncate">{c.displayName || "Citizen"}</p>
                    <p className="text-[10px] text-primary/50 capitalize">{c.points && c.points >= 200 ? "Good Citizen" : c.points && c.points >= 100 ? "Responsible" : "Active"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-purple-600 text-sm">{c.points || 0}</p>
                    <p className="text-[9px] uppercase tracking-wider text-primary/40 font-bold">Pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-primary/5 shadow-sm p-5">
            <h3 className="font-heading font-bold text-primary mb-3">How Voting Works</h3>
            <ul className="space-y-2 text-xs text-primary/70">
              <li className="flex items-start gap-2"><ArrowUp className="w-4 h-4 text-accent shrink-0 mt-0.5" /> Click the arrow on any issue you want prioritized</li>
              <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-red-500 shrink-0 mt-0.5 fill-current" /> Issues with 15+ votes are flagged as &quot;Hot&quot; for admins</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Admins review hot issues first</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

function getDemoFeed(): Report[] {
  return [
    { reportId: "GR-DEMO-001", userId: "demo-citizen-001", userDisplayName: "Arjun Mehta", title: "Large pothole on MG Road near bus stop", description: "There is a massive pothole that has been causing accidents for bikers. Needs urgent repair.", category: "pothole", address: "MG Road, Sector 12, Bangalore", latitude: 12.97, longitude: 77.59, photoUrl: null, status: "Under Review", upvotes: 32, createdAt: new Date().toISOString() },
    { reportId: "GR-DEMO-002", userId: "demo-citizen-002", userDisplayName: "Priya Nair", title: "Garbage overflowing near market area", description: "The garbage bin has been overflowing for 3 days. Very unhygienic for nearby residents.", category: "garbage", address: "Koramangala Market, Bangalore", latitude: 12.93, longitude: 77.62, photoUrl: null, status: "Submitted", upvotes: 18, createdAt: new Date().toISOString() },
    { reportId: "GR-DEMO-003", userId: "demo-citizen-003", userDisplayName: "Raj Kumar", title: "Streetlight not working for 2 weeks", description: "The streetlight near the school has been off for over 2 weeks creating safety risks at night.", category: "streetlight", address: "HSR Layout, Bangalore", latitude: 12.91, longitude: 77.64, photoUrl: null, status: "Verified", upvotes: 8, createdAt: new Date().toISOString() },
    { reportId: "GR-DEMO-004", userId: "demo-citizen-004", userDisplayName: "Sunita Sharma", title: "Water leakage on main road causing damage", description: "Pipeline leak on the main road. The water has been flowing for days causing road damage.", category: "water leakage", address: "JP Nagar, Bangalore", latitude: 12.90, longitude: 77.58, photoUrl: null, status: "In Progress", upvotes: 5, createdAt: new Date().toISOString() },
  ];
}
