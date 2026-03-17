"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Bell,
  LogOut,
  TrendingUp,
  TrendingDown,
  Settings,
  Zap,
  Megaphone,
  Trophy,
  Plus,
  Pencil,
  Trash2,
  Save,
  X as CloseIcon,
  Phone,
  Mail,
  MapPin,
  Globe,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AnimatePresence as AP } from "framer-motion";
import { getAllReports, updateReportStatus, Report, CATEGORIES } from "@/lib/reports";
import { getAllAuthorities, addAuthority, updateAuthority, deleteAuthority, Authority } from "@/lib/authorities";
import dynamic from "next/dynamic";
import LanguageSelector from "@/components/layout/LanguageSelector";
import { T } from "@/context/LanguageContext";

const CityMap = dynamic(() => import("@/components/admin/CityMap"), { ssr: false });

type AdminTab = "dashboard" | "reports" | "authorities" | "analytics";

const allReports = [
  { id: "GR-001", citizen: "Arjun Mehta", title: "Pothole at Ring Road", category: "Roads", status: "Pending", date: "Mar 16", priority: "High", upvotes: 87 },
  { id: "GR-002", citizen: "Priya Sharma", title: "Water leakage — Tank Road", category: "Water", status: "Assigned", date: "Mar 15", priority: "Medium", upvotes: 34 },
  { id: "GR-003", citizen: "Rohan Singh", title: "Garbage overflow at park", category: "Sanitation", status: "In Progress", date: "Mar 14", priority: "High", upvotes: 56 },
  { id: "GR-004", citizen: "Ananya Roy", title: "Broken streetlight on NH-24", category: "Electricity", status: "Resolved", date: "Mar 13", priority: "Low", upvotes: 23 },
  { id: "GR-005", citizen: "Vikram Nair", title: "Damaged footpath near school", category: "Roads", status: "In Progress", date: "Mar 12", priority: "Medium", upvotes: 41 },
  { id: "GR-006", citizen: "Sana Qureshi", title: "No water supply for 2 days", category: "Water", status: "Resolved", date: "Mar 11", priority: "High", upvotes: 102 },
];

const statusOptions = ["Submitted", "Under Review", "In Progress", "Resolved", "Verified", "Rejected"];

const statCards = [
  { label: "Total Reports", value: "3,847", change: "+12%", up: true, icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
  { label: "Resolved Today", value: "284", change: "+8%", up: true, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
  { label: "Pending", value: "1,203", change: "-5%", up: false, icon: Clock, color: "text-highlight", bg: "bg-amber-50" },
  { label: "Active Citizens", value: "50,241", change: "+18%", up: true, icon: Users, color: "text-accent", bg: "bg-blue-50" },
];

const barData = [
  { day: "Mon", filed: 85, resolved: 72 },
  { day: "Tue", filed: 63, resolved: 58 },
  { day: "Wed", filed: 95, resolved: 80 },
  { day: "Thu", filed: 55, resolved: 50 },
  { day: "Fri", filed: 78, resolved: 70 },
  { day: "Sat", filed: 45, resolved: 42 },
  { day: "Sun", filed: 30, resolved: 28 },
];

const categoryBreakdown = [
  { cat: "Roads", pct: 34, color: "bg-blue-500" },
  { cat: "Water", pct: 24, color: "bg-cyan-500" },
  { cat: "Electricity", pct: 18, color: "bg-yellow-500" },
  { cat: "Sanitation", pct: 14, color: "bg-green-500" },
  { cat: "Other", pct: 10, color: "bg-purple-500" },
];

function AdminDashboardTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);

  useEffect(() => {
    getAllReports().then((data) => {
      setReports(data.length > 0 ? data : (allReports as any));
      setLoadingMap(false);
    });
  }, []);

  const total = reports.length;
  const resolved = reports.filter(r => r.status === "Resolved").length;
  const pending = reports.filter(r => r.status === "Submitted" || r.status === "Under Review").length;
  // Calculate dynamic active citizens
  const citizens = new Set(reports.map(r => r.userId || (r as any).citizen)).size;

  const dynamicStatCards = [
    { label: "Total Complaints", value: total.toString(), change: "+12%", up: true, icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
    { label: "Complaints Resolved", value: resolved.toString(), change: "+8%", up: true, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
    { label: "Pending Complaints", value: pending.toString(), change: "-5%", up: false, icon: Clock, color: "text-highlight", bg: "bg-amber-50" },
    { label: "Active Citizens", value: citizens.toString() === "0" ? "50,241" : citizens.toString(), change: "+18%", up: true, icon: Users, color: "text-accent", bg: "bg-blue-50" },
  ];

  // Calculate dynamic department (category) performance
  const catCount: Record<string, number> = {};
  reports.forEach(r => {
    const c = r.category?.toLowerCase() || 'other';
    catCount[c] = (catCount[c] || 0) + 1;
  });

  const dynamicBreakdown = CATEGORIES.map((cat, i) => {
    const count = catCount[cat.id] || 0;
    const pct = total === 0 ? 0 : Math.round((count / total) * 100);
    const colors = ["bg-blue-500", "bg-cyan-500", "bg-yellow-500", "bg-green-500", "bg-purple-500"];
    return { cat: cat.label, pct: pct, color: colors[i % colors.length] };
  });

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dynamicStatCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-primary/10 shadow-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color} w-[18px] h-[18px]`} strokeWidth={2} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                s.up ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"
              }`}>
                {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.change}
              </div>
            </div>
            <div className="font-heading font-bold text-primary text-2xl">{s.value}</div>
            <div className="text-primary/50 text-xs mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-primary/10 shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-bold text-primary text-lg">Weekly Report Trends</h3>
            <div className="flex items-center gap-3 text-xs text-primary/50">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-accent/70 rounded-sm" /> Filed</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-400/70 rounded-sm" /> Resolved</span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-40">
            {barData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-1 justify-center" style={{ height: "120px" }}>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.6 }}
                    style={{ height: `${d.filed}%` }}
                    className="w-4 bg-accent/70 rounded-t-md origin-bottom"
                  />
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    style={{ height: `${d.resolved}%` }}
                    className="w-4 bg-green-400/70 rounded-t-md origin-bottom"
                  />
                </div>
                <span className="text-[10px] text-primary/40 font-medium">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-2xl border border-primary/10 shadow-card p-6 flex flex-col">
          <h3 className="font-heading font-bold text-primary text-lg mb-1">Department Performance</h3>
          <p className="text-xs text-primary/50 mb-4">Volume handled by each department category</p>
          <div className="space-y-4 flex-1">
            {dynamicBreakdown.map((c) => (
              <div key={c.cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-primary/70 font-medium">{c.cat}</span>
                  <span className="text-primary font-semibold">{c.pct}%</span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.pct}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${c.color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-primary/8">
            <div className="text-center">
              <div className="font-heading font-bold text-primary text-3xl">
                {total === 0 ? "94" : Math.round((resolved / total) * 100) || 0}%
              </div>
              <div className="text-primary/50 text-xs mt-0.5">Overall resolution rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-primary/10 shadow-card p-6">
        <h3 className="font-heading font-bold text-primary text-lg mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {[
            { text: "GR-001 assigned to Water Dept. Officer", time: "2m ago", type: "assign" },
            { text: "GR-006 marked as Resolved", time: "15m ago", type: "resolve" },
            { text: "New emergency report from Ward 4 — flooding", time: "1h ago", type: "alert" },
            { text: "48 new reports filed today across 6 wards", time: "2h ago", type: "info" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                a.type === "resolve" ? "bg-green-400" : a.type === "alert" ? "bg-red-400" : a.type === "assign" ? "bg-blue-400" : "bg-primary/30"
              }`} />
              <span className="text-sm text-primary/70 flex-1">{a.text}</span>
              <span className="text-xs text-primary/30 flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Map Row */}
      <div className="w-full">
        {!loadingMap && <CityMap reports={reports} />}
      </div>
    </div>
  );
}

function ReportsManagementTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    getAllReports().then((data) => setReports(data.length > 0 ? data : (allReports as any)));
  }, []);

  const filtered = reports.filter((r) => 
    (filter === "All" || r.status === filter) &&
    (categoryFilter === "All" || r.category?.toLowerCase() === categoryFilter.toLowerCase())
  );

  const handleStatusChange = async (id: string, newStatus: string, reporterId: string) => {
    if (!user) return;
    setUpdatingId(id);
    try {
      await updateReportStatus(id, newStatus as any, user.uid, reporterId);
      setReports((prev) => prev.map((r) => r.reportId === id ? { ...r, status: newStatus as any } : r));
      toast.success(`Report ${id} status updated to "${newStatus}"`);
    } catch (e) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColor: Record<string, string> = {
    Submitted: "text-red-500 bg-red-50 border-red-200",
    "Under Review": "text-blue-600 bg-blue-50 border-blue-200",
    "In Progress": "text-amber-600 bg-amber-50 border-amber-200",
    Resolved: "text-green-600 bg-green-50 border-green-200",
    Verified: "text-purple-600 bg-purple-50 border-purple-200",
    Rejected: "text-gray-600 bg-gray-50 border-gray-200",
  };

  const priorityColor: Record<string, string> = {
    High: "text-red-500",
    Medium: "text-highlight",
    Low: "text-green-500",
  };

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
        <h2 className="font-heading font-bold text-primary text-xl">Manage Reports</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary/50 uppercase tracking-wide">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-white border border-primary/15 rounded-lg px-2.5 py-1.5 text-primary font-medium focus:outline-none focus:ring-1 focus:ring-accent/30 capitalize cursor-pointer shadow-sm"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
              {/* Backwards compatibility for mocked categories */}
              <option value="Roads">Roads (Mock)</option>
            </select>
          </div>

          <div className="flex gap-2 flex-wrap">
            {["All", ...statusOptions].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === f ? "bg-accent text-white shadow-glow" : "bg-white text-primary/60 border border-primary/10 hover:text-primary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports table */}
      <div className="bg-white rounded-2xl border border-primary/10 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-background border-b border-primary/8">
                {["ID", "Citizen", "Issue", "Category", "Priority", "Date", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-primary/50 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {filtered.map((r) => {
                const dateStr = r.createdAt && (r.createdAt as any).toDate 
                  ? (r.createdAt as any).toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) 
                  : (typeof r.createdAt === 'string' ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recently');
                
                return (
                <tr key={r.reportId} className="hover:bg-background/60 transition-colors">
                  <td className="px-4 py-3.5 text-xs font-mono text-primary/60">{r.reportId}</td>
                  <td className="px-4 py-3.5 text-sm text-primary font-medium whitespace-nowrap">{r.userDisplayName}</td>
                  <td className="px-4 py-3.5 text-sm text-primary/70 max-w-[180px] truncate">{r.title}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs bg-primary/8 text-primary/60 px-2 py-0.5 rounded-full capitalize">{r.category}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold ${priorityColor["Medium"] ?? "text-primary/50"}`}>{"Medium"}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-primary/40 whitespace-nowrap">{dateStr}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 capitalize ${statusColor[r.status] || statusColor["Submitted"]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {updatingId === r.reportId ? (
                      <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    ) : (
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.reportId, e.target.value, r.userId || ((r as any).citizen))}
                        className="text-xs bg-background border border-primary/15 rounded-lg px-2 py-1.5 text-primary focus:outline-none focus:ring-1 focus:ring-accent/30 cursor-pointer capitalize"
                      >
                        {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


function AuthoritiesManagementTab() {
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAuth, setEditingAuth] = useState<Partial<Authority> | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadAuthorities();
  }, []);

  async function loadAuthorities() {
    setLoading(true);
    const data = await getAllAuthorities();
    setAuthorities(data);
    setLoading(false);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuth) return;

    try {
      if (isAdding) {
        await addAuthority(editingAuth as Omit<Authority, "id">);
        toast.success("Authority added successfully");
      } else {
        await updateAuthority(editingAuth.id!, editingAuth);
        toast.success("Authority updated successfully");
      }
      setEditingAuth(null);
      setIsAdding(false);
      loadAuthorities();
    } catch (e) {
      toast.error("Failed to save authority");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this authority?")) return;
    try {
      await deleteAuthority(id);
      toast.success("Authority deleted");
      loadAuthorities();
    } catch (e) {
      toast.error("Failed to delete authority");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-primary text-xl">Authorities Directory</h2>
        <button 
          onClick={() => {
            setEditingAuth({
              name: "",
              department: "Police Department",
              phone: "",
              email: "",
              address: "",
              workingHours: "24/7",
              iconName: "Shield"
            });
            setIsAdding(true);
          }}
          className="bg-accent text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Add Authority
        </button>
      </div>

      {editingAuth && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-primary/10 p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-bold text-primary">{isAdding ? "Add New Authority" : "Edit Authority"}</h3>
            <button onClick={() => {setEditingAuth(null); setIsAdding(false);}} className="p-2 hover:bg-background rounded-lg">
              <CloseIcon className="w-5 h-5 text-primary/40" />
            </button>
          </div>
          <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Authority Name</label>
              <input 
                required
                value={editingAuth.name || ""}
                onChange={e => setEditingAuth({...editingAuth, name: e.target.value})}
                className="w-full bg-background border-none rounded-xl px-4 py-3 text-sm font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Department</label>
              <select 
                value={editingAuth.department || ""}
                onChange={e => setEditingAuth({...editingAuth, department: e.target.value})}
                className="w-full bg-background border-none rounded-xl px-4 py-3 text-sm font-medium"
              >
                {[
                  "Police Department",
                  "Municipal Corporation",
                  "Electricity Department",
                  "Water Supply Department",
                  "Traffic Police",
                  "Fire Department",
                  "Health Department",
                  "Transport Department",
                  "Women Helpline",
                  "Emergency Services"
                ].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Phone</label>
              <input 
                required
                value={editingAuth.phone || ""}
                onChange={e => setEditingAuth({...editingAuth, phone: e.target.value})}
                className="w-full bg-background border-none rounded-xl px-4 py-3 text-sm font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Email</label>
              <input 
                required
                value={editingAuth.email || ""}
                onChange={e => setEditingAuth({...editingAuth, email: e.target.value})}
                className="w-full bg-background border-none rounded-xl px-4 py-3 text-sm font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Working Hours</label>
              <input 
                required
                value={editingAuth.workingHours || ""}
                onChange={e => setEditingAuth({...editingAuth, workingHours: e.target.value})}
                className="w-full bg-background border-none rounded-xl px-4 py-3 text-sm font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Icon (Lucide Name)</label>
              <select 
                value={editingAuth.iconName || ""}
                onChange={e => setEditingAuth({...editingAuth, iconName: e.target.value})}
                className="w-full bg-background border-none rounded-xl px-4 py-3 text-sm font-medium"
              >
                {["Shield", "Building2", "Zap", "Droplets", "Truck", "Flame", "HeartPulse", "Car", "UserRound", "Ambulance"].map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Address</label>
              <textarea 
                required
                value={editingAuth.address || ""}
                onChange={e => setEditingAuth({...editingAuth, address: e.target.value})}
                className="w-full bg-background border-none rounded-xl px-4 py-3 text-sm font-medium"
                rows={2}
              />
            </div>
            <div className="sm:col-span-2 pt-2">
              <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Authority Info
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-primary/5" />)
        ) : (
          authorities.map(auth => (
            <div key={auth.id} className="bg-white rounded-2xl border border-primary/10 p-6 shadow-sm group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => {setEditingAuth(auth); setIsAdding(false);}}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(auth.id)}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h4 className="font-heading font-bold text-primary mb-1 line-clamp-1">{auth.name}</h4>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/30 mb-4">{auth.department}</p>
              
              <div className="space-y-2 text-xs text-primary/50 font-medium">
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {auth.phone}</div>
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {auth.email}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast("Signed out. Goodbye, Officer!", { icon: "🏛️" });
    router.replace("/auth/login");
  };

  const tabs: { id: AdminTab; label: string; icon: typeof BarChart3 }[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "reports", label: "Manage Reports", icon: Settings },
    { id: "authorities", label: "Authorities", icon: Building2 },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Demo banner */}
      {user?.isDemo && (
        <div className="sticky top-0 z-[60] flex items-center justify-center gap-2 bg-highlight px-4 py-2 text-dark text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          Demo Mode — data is local only. Connect Firebase to enable live data.
          <a
            href="/auth/login"
            className="ml-3 underline underline-offset-2 hover:opacity-70"
          >
            Switch account
          </a>
        </div>
      )}
      {/* Admin Topbar */}
      <header className="sticky top-0 z-50 bg-dark/98 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-highlight to-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-heading font-bold text-white text-lg">
              CITY<span className="text-highlight">जन</span>
            </span>
            <span className="hidden sm:block ml-1 text-xs bg-highlight/15 text-highlight px-2.5 py-1 rounded-full font-medium border border-highlight/20">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="invert brightness-0">
              <LanguageSelector />
            </div>
            <button className="relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-dark" />
            </button>

            <div className="flex items-center gap-2.5 bg-white/8 border border-white/10 rounded-xl px-3 py-2">
              <div className="w-7 h-7 bg-gradient-to-br from-highlight to-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                {user?.displayName?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div className="hidden sm:block">
                <p className="text-white text-xs font-semibold leading-none">{user?.displayName ?? "Admin"}</p>
                <p className="text-white/40 text-[10px] leading-none mt-0.5">Administrator</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-highlight text-highlight"
                    : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <T>{tab.label}</T>
              </button>
            ))}
            <Link
              href="/announcements"
              className="flex items-center gap-1.5 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all border-transparent text-white/40 hover:text-white/70"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <T>Manage Announcements</T>
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center gap-1.5 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all border-transparent text-white/40 hover:text-white/70"
            >
              <Trophy className="w-3.5 h-3.5" />
              <T>Leaderboard</T>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "dashboard" && <AdminDashboardTab />}
            {activeTab === "reports" && <ReportsManagementTab />}
            {activeTab === "authorities" && <AuthoritiesManagementTab />}
            {activeTab === "analytics" && (
              <div className="text-center py-20">
                <TrendingUp className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                <h3 className="font-heading font-bold text-primary text-xl mb-2">Advanced Analytics</h3>
                <p className="text-primary/50">AWS QuickSight integration coming soon.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
