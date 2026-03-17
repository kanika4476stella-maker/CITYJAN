"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import DemoSection from "@/components/DemoSection";
import AwsAiSection from "@/components/AwsAiSection";
import Footer from "@/components/Footer";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  CheckCircle2, 
  Users2, 
  Building2, 
  ChevronDown,
  HelpCircle,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";

// Local component for Clean Impact Block
const CleanImpact = () => {
  const stats = [
    { label: "Resolved", value: "84K+" },
    { label: "Citizens", value: "320K+" },
    { label: "Cities", value: "48" },
    { label: "Response", value: "< 24h" },
  ];

  return (
    <section className="py-20 bg-gray-50/30 border-y border-gray-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-black text-gray-900 mb-2">{stat.value}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Simplified Clean FAQ
const MinimalFaq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does CITYजन verify my grievance?",
      a: "Our system uses Amazon Rekognition AI to verify issue photos against selected categories. A ticket isn't closed until confirmation from both officials and AI."
    },
    {
      q: "Is my personal data secure?",
      a: "Yes. We use industry-standard encryption and AWS Cognito for secure, identity-linked authentication."
    },
    {
      q: "Which languages are supported?",
      a: "English, Hindi, Tamil, Bengali, and Marathi are supported natively."
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-4xl font-black text-gray-900 mb-16 text-center">Questions?</h2>
        <div className="space-y-8">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-gray-100 pb-8 last:border-0">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between text-left group"
              >
                <span className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors tracking-tight">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
              {openIndex === i && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-gray-500 leading-relaxed font-medium"
                >
                  {faq.a}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      
      <main>
        {/* Reimagined Hero */}
        <HeroSection />

        {/* Impact Sub-Section */}
        <CleanImpact />
        
        {/* Core Capabilities */}
        <FeaturesSection />
        
        {/* Intelligent Infrastructure */}
        <AwsAiSection />
        
        {/* Experience Simulation */}
        <DemoSection />

        {/* Insightful FAQ */}
        <MinimalFaq />

        {/* Final Conviction CTA */}
        <section className="py-32 bg-blue-50/50 border-t border-blue-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-5xl font-black text-gray-900 mb-8 leading-tight">Built for a <br /> <span className="text-blue-600">Smarter Bharat.</span></h2>
            <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto font-medium">
              Join thousands of citizens making our cities liveable. Be the change today.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link
                href="/report" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest px-12 py-6 rounded-2xl transition-all shadow-2xl shadow-blue-600/30"
              >
                File Your First Report
              </Link>
              <Link 
                href="/auth/role"
                className="bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-900 font-black text-xs uppercase tracking-widest px-12 py-6 rounded-2xl transition-all shadow-xl shadow-gray-200/10"
              >
                Join as Official
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
