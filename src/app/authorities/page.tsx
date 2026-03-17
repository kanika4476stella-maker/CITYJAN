"use client";

import { useState, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "framer-motion";
import { 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Shield, 
  ArrowRight,
  Building2,
  Zap,
  Droplets,
  Truck,
  Flame,
  HeartPulse,
  Car,
  UserRound,
  Ambulance,
  Info,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  PhoneCall
} from "lucide-react";
import { getAllAuthorities, Authority } from "@/lib/authorities";
import Link from "next/link";

const DEPARTMENTS = [
  "All",
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
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "Shield": return Shield;
    case "Building2": return Building2;
    case "Zap": return Zap;
    case "Droplets": return Droplets;
    case "Truck": return Truck;
    case "Flame": return Flame;
    case "HeartPulse": return HeartPulse;
    case "Car": return Car;
    case "UserRound": return UserRound;
    case "Ambulance": return Ambulance;
    default: return Info;
  }
};

const getDeptColor = (dept: string) => {
  if (dept.includes("Police")) return "from-blue-600 to-indigo-600";
  if (dept.includes("Fire")) return "from-red-500 to-orange-600";
  if (dept.includes("Electricity")) return "from-amber-400 to-yellow-600";
  if (dept.includes("Water")) return "from-cyan-400 to-blue-500";
  if (dept.includes("Health") || dept.includes("Emergency")) return "from-rose-500 to-pink-600";
  return "from-slate-600 to-slate-800";
};

export default function AuthoritiesPage() {
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    getAllAuthorities().then(data => {
      setAuthorities(data);
      setLoading(false);
    });
  }, []);

  const filtered = authorities.filter(auth => {
    const matchesSearch = auth.name.toLowerCase().includes(search.toLowerCase()) || 
                          auth.department.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || auth.department === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-100 hidden lg:block z-40 overflow-y-auto pt-24 px-6 pb-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Filter className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-gray-900 text-lg">Department Filter</h2>
          </div>
          <div className="space-y-1">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => setFilter(dept)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                  filter === dept 
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-2" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"
                }`}
              >
                <span className="text-sm font-bold tracking-tight">{dept}</span>
                <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${filter === dept ? "opacity-100" : ""}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <Sparkles className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="font-heading font-bold text-lg mb-2 leading-tight">Civic Transparency Portal</h3>
            <p className="text-white/60 text-xs mb-6 leading-relaxed">
              Real-time access to verified helplines and administrative contacts for Noida/NCR.
            </p>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-widest">
              Verified Records <Shield className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-24 pb-20 px-4 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-4"
              >
                <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
                  Official Directory
                </span>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  {filtered.length} Active Agencies
                </div>
              </motion.div>
              <h1 className="font-heading font-black text-4xl lg:text-5xl text-gray-900 tracking-tight mb-4">
                Verify. Connect. <span className="text-blue-600">Resolve.</span>
              </h1>
              <p className="text-gray-500 text-lg max-w-xl font-medium leading-relaxed">
                Direct channel to Noida's essential authorities and emergency command centers.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
              <input
                type="text"
                placeholder="Search by agency or purpose..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-5 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600/10 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Mobile Filter Tabs */}
          <div className="lg:hidden flex overflow-x-auto scrollbar-hide gap-2 mb-10 pb-2">
            {DEPARTMENTS.slice(0, 6).map((dept) => (
              <button
                key={dept}
                onClick={() => setFilter(dept)}
                className={`flex-shrink-0 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === dept ? "bg-blue-600 text-white shadow-lg" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Results Grid - Interactive Bento Layout */}
          {loading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2, 4, 5].map(i => (
                <div key={i} className="bg-gray-50 rounded-[2.5rem] p-8 h-80 animate-pulse" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {filtered.map((auth, index) => {
                const Icon = getIcon(auth.iconName);
                const colorClass = getDeptColor(auth.department);
                
                return (
                  <motion.div
                    key={auth.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-[0_40px_80px_-15px_rgba(26,60,110,0.1)] hover:-translate-y-2 transition-all duration-500"
                  >
                    {/* Header: Agency Identity */}
                    <div className="flex items-start justify-between mb-10">
                      <div className="flex gap-4">
                        <div className={`w-20 h-20 bg-gradient-to-br ${colorClass} rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-600/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                          <Icon className="w-10 h-10" strokeWidth={2.5} />
                        </div>
                        <div className="pt-2">
                          <h3 className="font-heading font-black text-2xl lg:text-3xl text-gray-900 leading-[1.1] mb-2 group-hover:text-blue-600 transition-colors">
                            {auth.name}
                          </h3>
                          <div className="inline-flex px-3 py-1 bg-blue-50/50 backdrop-blur-sm rounded-full border border-blue-100">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-600">
                              {auth.department}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Information Strip: Compact & Clear */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                      {/* Helpline Card */}
                      <div className="bg-gray-50 rounded-2xl p-4 group-hover:bg-blue-50/50 transition-colors">
                        <div className="flex items-center gap-3 mb-1">
                          <PhoneCall className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Helpline</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {auth.phone}
                        </p>
                      </div>

                      {/* Working Hours Card */}
                      <div className="bg-gray-50 rounded-2xl p-4 group-hover:bg-blue-50/50 transition-colors">
                        <div className="flex items-center gap-3 mb-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hours</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                          {auth.workingHours}
                        </p>
                      </div>

                      {/* Contact Card */}
                      <div className="bg-gray-50 rounded-2xl p-4 group-hover:bg-blue-50/50 transition-colors sm:col-span-2">
                        <div className="flex items-center gap-3 mb-1">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Official Communication</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {auth.email}
                        </p>
                      </div>

                      {/* Office Address Card */}
                      <div className="bg-gray-50 rounded-2xl p-4 group-hover:bg-blue-50/50 transition-colors sm:col-span-2 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-1">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Location</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 leading-snug pr-8">
                          {auth.address}
                        </p>
                        <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>

                    {/* Action Strip: High Contrast & Interactive */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        href={`/report?dept=${encodeURIComponent(auth.department)}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                      >
                        Lodge Grievance
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      
                      <button className="flex items-center justify-center gap-3 px-6 py-5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-all group/btn">
                        Maps
                        <MapPin className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="font-heading font-black text-2xl text-gray-900 mb-2">No matching agencies found</h3>
              <p className="text-gray-400 font-medium mb-8">Refine your search parameters or try a different department category.</p>
              <button 
                onClick={() => {setSearch(""); setFilter("All");}}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/10 hover:shadow-blue-600/30 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
