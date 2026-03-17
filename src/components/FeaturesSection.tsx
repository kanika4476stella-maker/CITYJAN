"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  AlertCircle,
  BarChart3,
  Globe,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Bell,
  Vote,
  Map,
  FileText,
} from "lucide-react";

const features = [
  {
    icon: AlertCircle,
    title: "AI Grievance Redressal",
    description: "AWS Rekognition validates issues, Comprehend extracts intent, and auto-routes to the right department.",
    badge: "Core Feature",
  },
  {
    icon: BarChart3,
    title: "City Analytics",
    description: "Real-time civic health metrics. Track ward-wise grievance rates and satisfaction scores.",
    badge: "Dashboard",
  },
  {
    icon: Vote,
    title: "Community Polls",
    description: "Enable ward-level participatory governance. Citizens vote on local infrastructure directly.",
    badge: "Engagement",
  },
  {
    icon: Map,
    title: "Geo-Issue Mapping",
    description: "Interactive city map powered by Amazon Location Service. Visualize hotspots in real-time.",
    badge: "Maps",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "AWS SNS-powered real-time alerts for grievance updates and emergency notices.",
    badge: "Real-time",
  },
  {
    icon: MessageCircle,
    title: "JanBot AI Assistant",
    description: "24/7 multilingual civic assistant built on Amazon Lex + Bedrock. Handles FAQs and reports.",
    badge: "AI Powered",
  },
  {
    icon: ShieldCheck,
    title: "Aadhaar Auth",
    description: "Secure citizen identity verification via AWS Cognito with OTP. Prevents fake reports.",
    badge: "Security",
  },
  {
    icon: Smartphone,
    title: "PWA Support",
    description: "Works on any device without internet. Queues grievances offline, syncs when connected.",
    badge: "Inclusive",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: (index % 4) * 0.1 }}
      className="group bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
    >
      <div className="flex flex-col h-full">
        {/* Badge */}
        <span className="inline-block text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mb-6">
          {feature.badge}
        </span>

        {/* Icon */}
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
          <feature.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" strokeWidth={2} />
        </div>

        {/* Content */}
        <h3 className="font-heading font-bold text-gray-900 text-lg mb-3">
          {feature.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed font-medium">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="features" className="py-24 lg:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div ref={ref} className="max-w-3xl mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-[2px] bg-blue-600" />
            <span className="text-blue-600 font-black text-xs uppercase tracking-[0.2em]">Platform Capabilities</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-heading text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight"
          >
            Intelligence for <br />
            <span className="text-blue-600">Modern Governance.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg font-medium"
          >
            From filing a pothole report to participating in city budgets — 
            accessible, transparent, and intelligent services for every citizen.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
