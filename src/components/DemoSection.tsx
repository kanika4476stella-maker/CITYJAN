"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  Send,
  ThumbsUp,
  Bell,
  Users,
  BarChart2,
  Filter,
} from "lucide-react";
import Link from "next/link";

type TabId = "grievance" | "dashboard" | "community" | "janbot";

const tabs: { id: TabId; label: string; icon: typeof MapPin }[] = [
  { id: "grievance", label: "File Grievance", icon: AlertCircle },
  { id: "dashboard", label: "City Dashboard", icon: BarChart2 },
  { id: "community", label: "Community", icon: Users },
  { id: "janbot", label: "JanBot AI", icon: MessageSquare },
];

const grievances = [
  {
    id: "GR-2025-001",
    title: "Waterlogging near Sector 14",
    category: "Water & Sanitation",
    status: "Resolved",
    time: "2h ago",
    upvotes: 47,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    id: "GR-2025-002",
    title: "Streetlight not working on MG Road",
    category: "Electricity",
    status: "In Progress",
    time: "5h ago",
    upvotes: 23,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "GR-2025-003",
    title: "Garbage not collected for 3 days",
    category: "Sanitation",
    status: "Assigned",
    time: "1d ago",
    upvotes: 89,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "GR-2025-004",
    title: "Deep pothole outside Metro exit",
    category: "Roads",
    status: "Pending",
    time: "2d ago",
    upvotes: 134,
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

const metrics = [
  { label: "Total Reports", value: "3,847", change: "+12%", up: true, icon: AlertCircle, color: "text-blue-600" },
  { label: "Resolved", value: "284", change: "+8%", up: true, icon: CheckCircle, color: "text-green-600" },
  { label: "Resolution", value: "18.4 hrs", change: "-23%", up: true, icon: Clock, color: "text-blue-600" },
  { label: "Trust Score", value: "4.8", change: "+0.3", up: true, icon: ThumbsUp, color: "text-indigo-600" },
];

const polls = [
  {
    question: "Should we expand the metro to Sector 62?",
    votes: 1247,
    options: [
      { label: "Yes, urgently needed", pct: 68 },
      { label: "After road improvements", pct: 22 },
      { label: "Not a priority", pct: 10 },
    ],
  },
  {
    question: "New park at Rajiv Chowk — priority?",
    votes: 892,
    options: [
      { label: "High priority", pct: 54 },
      { label: "Medium priority", pct: 31 },
      { label: "Low priority", pct: 15 },
    ],
  },
];

const chatMessages = [
  { from: "user", text: "My water supply has been cut for 2 days" },
  {
    from: "bot",
    text: "I understand — that's urgent! I can file an emergency grievance (Category: Water Supply) on your behalf right now. It'll be assigned within 1 hour during business hours. Shall I proceed?",
  },
  { from: "user", text: "Yes please, also what's the status of GR-2025-001?" },
  {
    from: "bot",
    text: "✅ Your grievance GR-2025-078 has been filed and assigned to Ward 12 Officer Ramesh Kumar (+91-98765-XXXXX). \n\n📋 GR-2025-001 (Waterlogging, Sector 14) is now RESOLVED. The municipal team completed repairs at 2:15 PM today.",
  },
];

function GrievanceDemoPanel() {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* File Grievance form */}
      <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
        <h3 className="font-heading font-black text-gray-900 text-xl mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          Submit Report
        </h3>
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
              Issue Category
            </label>
            <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 appearance-none font-bold">
              <option>🚧 Roads & Infrastructure</option>
              <option>💧 Water & Sanitation</option>
              <option>⚡ Electricity</option>
              <option>🌿 Parks & Environment</option>
              <option>🚨 Safety & Emergency</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the issue..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600/10 resize-none font-medium"
            />
          </div>
          <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="text-gray-400 text-xs font-bold">📷 Attach Photo (AI-Verify)</div>
          </div>
          <Link href="/report" className="w-full block">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20"
            >
              <Send className="w-4 h-4" />
              File a Report
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Recent Grievances list */}
      <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-heading font-black text-gray-900 text-xl">Recent Activity</h3>
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 rounded-full px-4 py-2">
            <Filter className="w-3 h-3" />
            Live Feed
          </button>
        </div>
        <div className="space-y-4">
          {grievances.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-4 p-5 rounded-[24px] bg-[#FDFDFD] border border-gray-100/50 hover:border-blue-100 hover:bg-white hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate mb-1">{g.title}</div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{g.id}</span>
                  <div className="w-1 h-1 bg-gray-200 rounded-full" />
                  <span className="text-[10px] font-bold text-blue-600/70">{g.category}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${g.bg} ${g.color}`}>
                  {g.status}
                </span>
                <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold">
                  <ThumbsUp className="w-3 h-3" />
                  {g.upvotes}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardPanel() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center">
                <m.icon className={`w-5 h-5 ${m.color}`} />
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${m.up ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"}`}>
                {m.change}
              </span>
            </div>
            <div className="font-heading font-black text-gray-900 text-3xl mb-1">{m.value}</div>
            <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h3 className="font-heading font-black text-gray-900 text-xl mb-2">Resolutions by Ward</h3>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Live Efficiency Tracker</p>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <div className="w-3 h-3 bg-blue-600 rounded-full" /> Volume
            </span>
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <div className="w-3 h-3 bg-green-500 rounded-full opacity-30" /> SLA Met
            </span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-4 h-48">
          {[
            { cat: "W-12", sub: 85, res: 72 },
            { cat: "W-24", sub: 63, res: 58 },
            { cat: "W-05", sub: 45, res: 40 },
            { cat: "W-09", sub: 92, res: 75 },
            { cat: "W-18", sub: 28, res: 26 },
            { cat: "W-21", sub: 38, res: 35 },
          ].map((item) => (
            <div key={item.cat} className="flex-1 flex flex-col items-center gap-4">
              <div className="w-full flex items-end gap-2 justify-center" style={{ height: "140px" }}>
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  style={{ height: `${item.sub}%` }}
                  className="w-4 bg-blue-600 rounded-full origin-bottom"
                />
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  style={{ height: `${item.res}%` }}
                  className="w-4 bg-green-500 opacity-30 rounded-full origin-bottom"
                />
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommunityPanel() {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {polls.map((poll, i) => (
        <div key={i} className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Active Poll
            </span>
            <span className="text-gray-400 text-[10px] font-bold">{poll.votes.toLocaleString()} votes</span>
          </div>
          <h3 className="font-heading font-bold text-gray-900 text-lg mb-6">{poll.question}</h3>
          <div className="space-y-4">
            {poll.options.map((opt, j) => (
              <div key={j}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-500 font-medium">{opt.label}</span>
                  <span className="font-black text-gray-900">{opt.pct}%</span>
                </div>
                <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${opt.pct}%` }}
                    transition={{ duration: 0.8, delay: j * 0.1 }}
                    className={`h-full rounded-full bg-blue-600`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-heading font-black text-gray-900 text-xl">Updates</h3>
        </div>
        <div className="space-y-2">
          {[
            { text: "Road repair work on NH-24 from 10 PM–5 AM", time: "Now", tag: "Traffic" },
            { text: "Free health camp at Sector 4 — Mar 20", time: "2h ago", tag: "Health" },
            { text: "Water supply gap in Ward 7 — tomorrow", time: "5h ago", tag: "Water" },
          ].map((a, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{a.text}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{a.time}</span>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">{a.tag}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JanBotPanel() {
  const [messages, setMessages] = useState([...chatMessages]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = { from: "user" as const, text: textToSend.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });
      const data = await res.json();
      if (data.response) setMessages((prev) => [...prev, { from: "bot", text: data.response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { from: "bot", text: "Connection error. Re-try." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-2xl">
        {/* Chat header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-heading font-black text-white text-lg">JanBot</div>
              <div className="text-white/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> AWS AI Pipeline
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/80">
            Multilingual
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="p-8 space-y-6 h-[400px] overflow-y-auto scrollbar-hide bg-[#FDFDFD]"
        >
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-6 py-4 rounded-[24px] text-sm font-medium leading-relaxed shadow-sm ${
                  msg.from === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-100 text-gray-700"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="bg-white border border-gray-100 w-fit px-6 py-4 rounded-[24px] shadow-sm flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-duration:0.6s]" />
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
            {["Payment", "Water", "Power cut", "Garbage", "Emergency"].map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="whitespace-nowrap bg-gray-50 border border-gray-100 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
            />
            <motion.button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              whileHover={{ scale: 1.05 }}
              className="bg-blue-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoSection() {
  const [activeTab, setActiveTab] = useState<TabId>("grievance");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="demo" className="py-24 lg:py-40 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6"
          >
            Live Simulation
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="font-heading text-4xl lg:text-6xl font-black text-gray-900 mb-6"
          >
            Experience <br />
            <span className="text-blue-600 text-gradient">Smart Governance.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="text-gray-500 text-lg font-medium"
          >
            Interactive highlights of the CITYजन ecosystem — no login required.
          </motion.p>
        </div>

        {/* Tab selector - Minimal Pill design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                  : "bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Panel Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
          >
            {activeTab === "grievance" && <GrievanceDemoPanel />}
            {activeTab === "dashboard" && <DashboardPanel />}
            {activeTab === "community" && <CommunityPanel />}
            {activeTab === "janbot" && <JanBotPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
