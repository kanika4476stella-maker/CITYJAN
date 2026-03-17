"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  MessageSquare,
  TrendingUp,
  Users,
  CheckCircle,
} from "lucide-react";

const stats = [
  { label: "Cities Connected", value: "48+", icon: MapPin },
  { label: "Grievances Resolved", value: "1.2M+", icon: CheckCircle },
  { label: "Active Citizens", value: "50K+", icon: Users },
  { label: "Avg. Resolution Time", value: "18hrs", icon: TrendingUp },
];

const floatingCards = [
  {
    title: "Pothole Reported",
    subtitle: "Sector 12, Noida",
    status: "Assigned",
    icon: MapPin,
  },
  {
    title: "Water Supply Fixed",
    subtitle: "Ward 7, Pune",
    status: "Resolved ✓",
    icon: CheckCircle,
  },
  {
    title: "Community Poll",
    subtitle: "Park renovation vote",
    status: "278 votes",
    icon: MessageSquare,
  },
];

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const cardRotateX = useSpring(useTransform(mouseY, [-500, 500], [5, -5]), springConfig);
  const cardRotateY = useSpring(useTransform(mouseX, [-500, 500], [-5, 5]), springConfig);

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center overflow-hidden bg-[#FDFDFD]"
    >
      {/* Interactive Radial Glows */}
      <motion.div 
        style={{ x: mouseX, y: mouseY }}
        className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-50/40 rounded-full blur-[140px] pointer-events-none opacity-60" 
      />
      
      {/* Hero grid overlay - Interactive mouse mask */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(circle at center, #000 0.8px, transparent 0.8px)`, 
          backgroundSize: '24px 24px',
        }} 
      />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40"
      >
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          {/* Left: Content */}
          <div className="relative">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-3 bg-white border border-gray-100 rounded-full px-5 py-2.5 mb-10 shadow-xl shadow-blue-500/5 group cursor-default"
            >
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-blue-600 transition-colors">
                Built for Bharat • Powered by AWS AI
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading text-6xl sm:text-7xl lg:text-[100px] font-black text-gray-900 leading-[0.95] mb-10 tracking-tighter"
            >
              Smart City <br />
              <span className="text-blue-600">Redefined.</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-gray-500 text-lg sm:text-xl leading-relaxed mb-12 max-w-lg font-medium"
            >
              CITYजन empowers 50K+ citizens to build a smarter India 
              through real-time redressal and AI-powered civic intelligence.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-5 mb-20"
            >
              <motion.a
                href="/report"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 bg-blue-600 text-white font-black px-12 py-6 rounded-2xl text-lg shadow-2xl shadow-blue-600/30 transition-all uppercase tracking-widest"
              >
                File a Report
                <ArrowRight className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#demo"
                whileHover={{ scale: 1.05, backgroundColor: "#F9FAFB" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 bg-white border-2 border-gray-50 text-gray-900 font-black px-12 py-6 rounded-2xl text-lg transition-all shadow-xl shadow-gray-200/20 uppercase tracking-widest"
              >
                Live Demo
              </motion.a>
            </motion.div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-12">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="group hover:-translate-y-1 transition-transform"
                >
                  <div className="font-heading font-black text-3xl text-gray-900 group-hover:text-blue-600 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mt-2">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Floating UI mockup with Magnetic Tilt */}
          <div className="hidden lg:flex items-center justify-center relative perspective-[1200px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              style={{ rotateX: cardRotateX, rotateY: cardRotateY }}
              transition={{ duration: 1, delay: 0.4, type: "spring" }}
              className="relative w-[400px]"
            >
              {/* Main card */}
              <div className="bg-white rounded-[56px] border border-gray-100 p-10 shadow-[0_48px_100px_rgba(0,0,100,0.08)] backdrop-blur-sm">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <div className="font-heading font-black text-gray-900 text-2xl tracking-tight">Ward-12</div>
                    <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Live Analytics</div>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-3xl">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>

                {/* Simulated Chart */}
                <div className="space-y-8 mb-12">
                  {[
                    { label: "Resolved", val: 88, color: "bg-blue-600" },
                    { label: "Pending", val: 42, color: "bg-gray-100" },
                  ].map((item: { label: string; val: number; color: string }) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="text-gray-900">{item.val}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.val}%` }}
                          transition={{ delay: 1, duration: 1.5, ease: "circOut" }}
                          className={`h-full rounded-full ${item.color}`} 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">+1.2k Active</div>
                </div>
              </div>

              {/* Floaties with deeper parallax */}
              {floatingCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ 
                    y: useTransform(mouseY, [-500, 500], [5 * (i + 1), -5 * (i + 1)]),
                    x: useTransform(mouseX, [-500, 500], [5 * (i + 1), -5 * (i + 1)]) 
                  }}
                  className={`absolute bg-white/95 border border-white rounded-[32px] p-6 shadow-2xl backdrop-blur-md transition-shadow hover:shadow-blue-500/10 ${
                    i === 0 ? "-left-32 top-10" : i === 1 ? "-left-40 bottom-20" : "-right-24 top-1/2"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                      <card.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-gray-900 text-sm font-black tracking-tight">{card.title}</div>
                      <div className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">{card.status}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Floating Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-blue-600 to-transparent" />
      </motion.div>
    </section>
  );
}
