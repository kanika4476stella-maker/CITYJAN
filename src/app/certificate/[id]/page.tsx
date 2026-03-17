"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Download, Share2, Award, CheckCircle, Trophy, Twitter, Linkedin, Instagram, Shield } from "lucide-react";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppUser } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function CertificatePage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const snap = await getDoc(doc(db, "users", userId));
        if (snap.exists()) {
          setUser(snap.data() as AppUser);
        } else {
          // Fallback to local
          const usersRaw = localStorage.getItem("CITYजन_demo_users") || "{}";
          const localUsers = JSON.parse(usersRaw);
          if (localUsers[userId]) {
            setUser({
              uid: userId,
              displayName: userId.startsWith("demo") ? "Demo Citizen" : "Citizen",
              points: localUsers[userId].points || 250,
              role: "citizen"
            } as any);
          } else {
            // Mock user to demonstrate the layout
            setUser({ uid: "mock", displayName: "Aarav Singh", points: 280, role: "citizen" } as any);
          }
        }
      } catch (e) {
        setUser({ uid: "mock", displayName: "Aarav Singh", points: 280, role: "citizen" } as any);
      }
      setLoading(false);
    }
    fetchUser();
  }, [userId]);

  const handleDownload = () => {
    window.print(); // Simple trick to get PDF natively
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My CityJan Good Citizen Certificate',
        text: `I just earned the Good Citizen Award on CityJan with ${user?.points} points! Join me in making our city better.`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Share link copied to clipboard!");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
  if (!user || (user.points || 0) < 200) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center p-8 bg-white rounded-3xl"><Trophy className="mx-auto w-12 h-12 text-primary/20 mb-4" /><h1 className="text-2xl font-bold text-primary mb-2">Certificate Not Unlocked</h1><p className="text-primary/60">This user has not reached 200 points yet.</p></div></div>;

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1E3C] to-[#1A3C6E] flex justify-center py-12 px-4 print:bg-white print:p-0">
      <div className="max-w-4xl w-full">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <h1 className="text-white font-bold text-2xl flex items-center gap-2"><Award className="w-8 h-8 text-yellow-400" /> Certificate Viewer</h1>
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 border border-white/20 rounded-xl flex items-center gap-2 transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button onClick={handleDownload} className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-colors">
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>

        {/* Certificate Container */}
        <div className="bg-white rounded-none sm:rounded-3xl overflow-hidden shadow-2xl relative p-10 sm:p-20 border-8 border-double border-yellow-600/20 print:border-none print:shadow-none print:rounded-none">
          {/* Decorative Corner Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-yellow-500 rounded-tl-xl opacity-30 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-yellow-500 rounded-tr-xl opacity-30 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-yellow-500 rounded-bl-xl opacity-30 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-yellow-500 rounded-br-xl opacity-30 pointer-events-none"></div>

          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
             <Trophy className="w-96 h-96 text-primary" />
          </div>

          <div className="relative z-10 text-center flex flex-col items-center">
            
            <div className="w-24 h-24 bg-gradient-to-br from-highlight to-primary rounded-2xl flex items-center justify-center shadow-lg mb-8">
               <Shield className="w-12 h-12 text-white" strokeWidth={2} />
            </div>

            <h2 className="font-heading font-black text-4xl sm:text-5xl text-primary md:tracking-widest uppercase mb-4">
              Certificate of Excellence
            </h2>
            <h3 className="text-xl sm:text-2xl text-highlight font-bold uppercase tracking-widest mb-10">Good Citizen Award — {currentYear}</h3>

            <p className="text-sm sm:text-lg text-primary/60 italic mb-6">This is proudly presented to</p>

            <h1 className="font-serif italic text-5xl sm:text-6xl text-primary font-bold border-b border-primary/20 pb-2 mb-8 px-10">
              {user.displayName || "Responsible Citizen"}
            </h1>

            <p className="text-sm sm:text-base text-primary/70 max-w-2xl leading-relaxed mb-12">
              In recognition of your exceptional civic responsibility and active participation in making CityJan a better, cleaner, and safer city. By earning <strong>{user.points || 0} points</strong> through verified civic reporting, you have demonstrated true leadership in our community.
            </p>

            <div className="flex justify-between items-end w-full max-w-2xl px-8 border-t border-primary/10 pt-8 mt-10">
              <div className="text-center">
                <div className="font-heading font-black text-2xl text-primary mb-1 border-b border-primary/20 pb-1 w-32 mx-auto">CITY<span className="text-highlight">जन</span></div>
                <div className="text-[10px] text-primary/40 font-bold uppercase tracking-wider">Official Platform</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-tr from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-sm text-white mb-2 relative">
                  <span className="absolute inset-1 rounded-full border border-white/50 border-dashed"></span>
                  <Award className="w-8 h-8 drop-shadow-sm" />
                </div>
                <div className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                  Govt. Verified
                </div>
              </div>

              <div className="text-center">
                <div className="font-mono text-xs text-primary/60 mb-1 border-b border-primary/20 pb-1 w-32 mx-auto">CERT-{user.uid.slice(0, 8).toUpperCase()}-{currentYear}</div>
                <div className="text-[10px] text-primary/40 font-bold uppercase tracking-wider">Certificate ID</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
