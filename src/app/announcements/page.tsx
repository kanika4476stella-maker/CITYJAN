"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Megaphone, 
  ShieldAlert, 
  Building2, 
  CheckCircle, 
  Plus, 
  Image as ImageIcon,
  Calendar,
  ChevronLeft,
  X,
  Loader2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { 
  getAllAnnouncements, 
  submitAnnouncement, 
  Announcement, 
  AnnouncementType 
} from "@/lib/announcements";
import PhotoUpload from "@/components/report/PhotoUpload";
import LanguageSelector from "@/components/layout/LanguageSelector";
import { T } from "@/context/LanguageContext";

const typeConfig: Record<AnnouncementType, { icon: any; color: string; bg: string }> = {
  "government notice": { icon: Building2, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  "safety alert": { icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50 border-red-200" },
  "city announcement": { icon: Megaphone, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
};

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    setLoading(true);
    const data = await getAllAnnouncements();
    setAnnouncements(data);
    setLoading(false);
  }

  const handlePostSuccess = () => {
    setShowForm(false);
    fetchAnnouncements();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-primary/5 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={isAdmin ? "/dashboard/admin" : "/dashboard/citizen"} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors font-medium text-sm">
            <ChevronLeft className="w-5 h-5" />
            <T>Back to Dashboard</T>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <div className="font-heading font-bold text-primary text-xl hidden sm:block">
              CITY<span className="text-accent">जन</span> News
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="font-heading font-bold text-primary text-3xl">City Announcements</h1>
            <p className="text-primary/50 mt-2">Stay updated with official notices and alerts from your municipality.</p>
          </div>
          {isAdmin && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all shadow-glow-amber shrink-0"
            >
              <Plus className="w-4 h-4" /> Post Update
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="mb-12"
            >
              <AdminPostForm onSuccess={handlePostSuccess} onCancel={() => setShowForm(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-3xl h-72 border border-primary/5 animate-pulse" />
                  ))}
                </div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-primary/5 shadow-sm">
                  <Megaphone className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-primary text-xl">No Recent Announcements</h3>
                  <p className="text-primary/50 text-sm mt-2">Check back later for official city updates.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {announcements.map((ann) => (
                    <AnnouncementCard key={ann.id} ann={ann} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ── Admin Poster Component ──────────────────────────────────────────────────
function AdminPostForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<AnnouncementType>("city announcement");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [verifiedBadge, setVerifiedBadge] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required.");
      return;
    }
    setSubmitting(true);
    try {
      await submitAnnouncement({
        title,
        description,
        type,
        date,
        imageUrl,
        verifiedBadge
      }, user?.uid || "demo-admin");
      toast.success("Announcement posted successfully!");
      onSuccess();
    } catch (err) {
      toast.error("Failed to post announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-primary/10 shadow-card p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading font-bold text-primary text-xl">Create New Post</h2>
        <button onClick={onCancel} className="p-2 text-primary/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-primary/50 uppercase tracking-wide mb-2 block">Post Type</label>
              <div className="flex bg-background border border-primary/15 rounded-xl p-1">
                {(["city announcement", "government notice", "safety alert"] as AnnouncementType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg capitalize transition-colors ${
                      type === t ? "bg-white text-primary shadow-sm" : "text-primary/50 hover:text-primary"
                    }`}
                  >
                    {t.replace(" ", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-primary/50 uppercase tracking-wide mb-2 block">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="E.g., Severe Rain Warning"
                className="w-full bg-background border border-primary/15 rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                maxLength={80}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-primary/50 uppercase tracking-wide mb-2 block">Effective Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                <input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-background border border-primary/15 rounded-xl pl-10 pr-4 py-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 appearance-none"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 p-4 bg-background border border-primary/15 rounded-xl cursor-pointer hover:bg-primary/5 transition-colors">
                <input 
                  type="checkbox" 
                  checked={verifiedBadge} 
                  onChange={e => setVerifiedBadge(e.target.checked)}
                  className="w-5 h-5 accent-accent rounded"
                />
                <div>
                  <div className="text-sm font-bold text-primary flex items-center gap-1.5">
                    Attach Verified Badge <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-xs text-primary/50 mt-0.5">Adds an official tick to the announcement card.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-primary/50 uppercase tracking-wide mb-2 block">Full Description</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Include all necessary details, timings, and instructions for citizens..."
                className="w-full bg-background border border-primary/15 rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[140px] resize-none"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-primary/50 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" /> Feature Image (Optional)
              </label>
              <PhotoUpload value={imageUrl} onChange={setImageUrl} maxSizeMb={5} />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-primary/10 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-6 py-3 font-bold text-sm text-primary/60 hover:text-primary transition-colors">
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 disabled:opacity-70 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
            Publish Announcement
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Render Card Component ─────────────────────────────────────────────────────
function AnnouncementCard({ ann }: { ann: Announcement }) {
  const cfg = typeConfig[ann.type];
  const Icon = cfg.icon;

  return (
    <div className="bg-white rounded-3xl border border-primary/10 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {ann.imageUrl && (
        <div className="relative w-full h-48 bg-primary/5">
          <Image src={ann.imageUrl} alt={ann.title} fill className="object-cover" unoptimized/>
        </div>
      )}
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {ann.type}
          </span>
          <span className="text-xs font-semibold text-primary/40 bg-background px-2.5 py-1 rounded-lg border border-primary/5">
            {new Date(ann.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        
        <h3 className="font-heading font-bold text-primary text-xl leading-tight mb-2 flex items-start gap-1.5">
          <T>{ann.title}</T>
          {ann.verifiedBadge && (
            <span title="Verified Govt Official">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            </span>
          )}
        </h3>
        
        <p className="text-sm text-primary/60 leading-relaxed mb-4 whitespace-pre-wrap">
          <T>{ann.description}</T>
        </p>
        
        {/* Placeholder to keep card height flexible but align bottom elements if needed */}
        <div className="mt-auto pt-4 border-t border-primary/5 text-xs text-primary/40 flex items-center justify-between">
          <span>Posted officially via CITYजन</span>
        </div>
      </div>
    </div>
  );
}
