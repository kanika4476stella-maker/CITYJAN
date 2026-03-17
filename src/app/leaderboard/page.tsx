"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, User, Shield, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getTopUsers } from "@/lib/users";
import { AppUser } from "@/context/AuthContext";

function getRankInfo(points: number) {
  if (points >= 200) return { title: "Good Citizen", color: "text-purple-600", bg: "bg-purple-50 border-purple-200" };
  if (points >= 100) return { title: "Responsible Citizen", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
  if (points >= 50) return { title: "Active Citizen", color: "text-green-600", bg: "bg-green-50 border-green-200" };
  return { title: "Beginner Citizen", color: "text-gray-600", bg: "bg-gray-50 border-gray-200" };
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopUsers(50).then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-primary/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard/citizen" className="p-2 -ml-2 hover:bg-primary/5 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-primary" />
          </Link>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-highlight" />
            <h1 className="font-heading font-bold text-primary text-xl">City Leaderboard</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="font-heading font-bold text-3xl text-primary mb-3">Top Citizens of CityJan</h2>
          <p className="text-primary/60 max-w-lg mx-auto">
            Recognizing those who actively contriubute to making our city cleaner, safer, and structurally sound.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-primary/5"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((u, index) => {
              const rankInfo = getRankInfo(u.points || 0);
              const isTop3 = index < 3;
              
              return (
                <motion.div
                  key={u.uid}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-sm border ${
                    index === 0 ? "border-yellow-300 shadow-yellow-100/50" :
                    index === 1 ? "border-gray-300 shadow-gray-100/50" :
                    index === 2 ? "border-amber-700/30 shadow-amber-100/30" : "border-primary/5"
                  }`}
                >
                  <div className="w-10 sm:w-16 flex justify-center shrink-0">
                    {index === 0 ? <Medal className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500 fill-yellow-100" /> :
                     index === 1 ? <Medal className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 fill-gray-100" /> :
                     index === 2 ? <Medal className="w-6 h-6 sm:w-7 sm:h-7 text-amber-700 fill-amber-100/30" /> :
                     <span className="text-xl sm:text-2xl font-bold text-primary/30">#{index + 1}</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-primary text-base sm:text-lg truncate">{u.displayName || "Anonymous Citizen"}</h3>
                    <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                      <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold border ${rankInfo.bg} ${rankInfo.color}`}>
                        {rankInfo.title}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg sm:text-2xl font-black text-primary">{u.points || 0}</div>
                    <div className="text-[10px] sm:text-xs text-primary/50 font-bold uppercase tracking-wider">Points</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
