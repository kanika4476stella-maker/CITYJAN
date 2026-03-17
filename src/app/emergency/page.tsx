"use client";

import { motion } from "framer-motion";
import { ChevronLeft, PhoneCall, Shield, Flame, Activity, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const emergencyContacts = [
  {
    title: "Police Control Room",
    number: "100",
    description: "For immediate police assistance, reporting crimes, or security threats.",
    icon: Shield,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    btnColor: "bg-blue-600 hover:bg-blue-700",
  },
  {
    title: "Fire Department",
    number: "101",
    description: "Emergency response for fire breakouts, rescues, and hazardous leaks.",
    icon: Flame,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    btnColor: "bg-red-600 hover:bg-red-700",
  },
  {
    title: "Ambulance",
    number: "102",
    description: "24/7 medical emergency transport to the nearest city hospital.",
    icon: Activity,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    btnColor: "bg-green-600 hover:bg-green-700",
  },
  {
    title: "Disaster Helpline",
    number: "1077",
    description: "City-wide disaster management and emergency relief operations.",
    icon: LifeBuoy,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    btnColor: "bg-amber-600 hover:bg-amber-700",
  },
];

export default function EmergencyPage() {
  const { user } = useAuth();
  const backLink = user?.role === "admin" ? "/dashboard/admin" : "/dashboard/citizen";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-primary/5 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={backLink} className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors font-medium text-sm">
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <div className="font-heading font-bold text-primary text-xl">
            CITY<span className="text-accent">जन</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-32">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-primary text-3xl flex items-center gap-3">
            <span className="bg-red-100 text-red-600 p-2.5 rounded-2xl">
              <PhoneCall className="w-6 h-6" />
            </span>
            Emergency Contacts
          </h1>
          <p className="text-primary/50 mt-3 text-lg">
            Direct hotlines for immediate city services. In case of a general emergency, dial 112.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {emergencyContacts.map((contact, i) => {
            const Icon = contact.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col bg-white rounded-3xl border ${contact.border} shadow-sm overflow-hidden`}
              >
                <div className="p-8 flex-1">
                  <div className={`w-14 h-14 rounded-2xl ${contact.bg} flex items-center justify-center mb-6`}>
                    <Icon className={`w-7 h-7 ${contact.color}`} />
                  </div>
                  <h3 className="font-heading font-bold text-primary text-2xl mb-3">{contact.title}</h3>
                  <p className="text-primary/60 text-base leading-relaxed mb-6">
                    {contact.description}
                  </p>
                </div>
                <div className={`p-5 ${contact.bg} border-t ${contact.border} flex items-center justify-between`}>
                  <span className={`text-4xl font-bold font-mono ${contact.color} tracking-wider`}>
                    {contact.number}
                  </span>
                  <a
                    href={`tel:${contact.number}`}
                    className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all shadow-md ${contact.btnColor} hover:brightness-110 active:scale-[0.97]`}
                  >
                    <PhoneCall className="w-5 h-5 fill-current" />
                    Call
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
