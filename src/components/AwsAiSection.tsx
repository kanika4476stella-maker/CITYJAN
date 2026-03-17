"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Brain,
  Eye,
  Languages,
  MessageSquare,
  Bot,
  Map,
  FileSearch,
  Cpu,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const awsServices = [
  {
    name: "Amazon Rekognition",
    description: "AI image analysis to validate photos submitted with grievances — detects damage severity, road condition, garbage levels, and more.",
    icon: Eye,
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/20",
    use: "Grievance Photo Validation",
  },
  {
    name: "Amazon Comprehend",
    description: "NLP-powered sentiment analysis and entity extraction on citizen feedback. Identifies intent, urgency, and routes complaints to correct departments.",
    icon: Brain,
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
    use: "Feedback Intelligence",
  },
  {
    name: "Amazon Lex + Bedrock",
    description: "Powers JanBot, the 24/7 multilingual civic assistant. Understands conversational queries about civic services, government schemes, and complaint status.",
    icon: Bot,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border-cyan-400/20",
    use: "JanBot AI Assistant",
  },
  {
    name: "Amazon Translate",
    description: "Real-time translation across Hindi, Bengali, Tamil, Telugu, Kannada, Marathi, Gujarati, and 8+ other Indian languages. True linguistic inclusivity.",
    icon: Languages,
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    use: "Multilingual Support",
  },
  {
    name: "Amazon Location Service",
    description: "Geo-tagged reporting, interactive city maps, ward boundary polygons, field officer routing, and proximity-based grievance clustering.",
    icon: Map,
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    use: "Smart City Mapping",
  },
  {
    name: "Amazon Textract",
    description: "Automatically extracts data from uploaded PDFs, scanned forms, and citizen documents — powers the digital document portal and e-governance services.",
    icon: FileSearch,
    color: "text-highlight",
    bg: "bg-highlight/10 border-highlight/20",
    use: "Document Intelligence",
  },
  {
    name: "Amazon SNS + SES",
    description: "Real-time push notifications, SMS, email, and WhatsApp alerts for grievance updates, government announcements, and emergency broadcasts.",
    icon: MessageSquare,
    color: "text-rose-400",
    bg: "bg-rose-400/10 border-rose-400/20",
    use: "Notification Engine",
  },
  {
    name: "AWS Lambda + ECS",
    description: "Serverless microservices for grievance routing, notification dispatch, and analytics. Auto-scales to millions of concurrent users across all smart cities.",
    icon: Cpu,
    color: "text-indigo-400",
    bg: "bg-indigo-400/10 border-indigo-400/20",
    use: "Scalable Infrastructure",
  },
];

const aiPipeline = [
  { step: "01", label: "Citizen files report", desc: "Photo + GPS + text via app" },
  { step: "02", label: "Rekognition validates", desc: "AI confirms issue authenticity" },
  { step: "03", label: "Comprehend analyses", desc: "Extracts intent & urgency level" },
  { step: "04", label: "Smart routing", desc: "Auto-assigns to correct dept." },
  { step: "05", label: "Resolution tracking", desc: "Real-time status updates sent" },
];

export default function AwsAiSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const pipelineRef = useRef(null);
  const pipelineInView = useInView(pipelineRef, { once: true });

  return (
    <section id="aws-ai" className="py-24 lg:py-32 bg-[#F9FBFF] border-y border-blue-100/50 relative overflow-hidden">
      {/* Decorative ultra-subtle elements */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div ref={ref} className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 font-black text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6"
          >
            AWS Enterprise Ready
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="font-heading text-4xl lg:text-6xl font-black text-gray-900 mb-6"
          >
            Smarter Cities, <br />
            <span className="text-blue-600">Built on AWS.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="text-gray-500 text-lg max-w-2xl mx-auto font-medium"
          >
            We harness the full power of AWS AI/ML services to make civic governance
            faster, inclusive, and transparent for every citizen.
          </motion.p>
        </div>

        {/* AI Pipeline - Simplified Light version */}
        <div ref={pipelineRef} className="mb-24">
          <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-xl shadow-blue-500/5">
            <h3 className="font-heading text-gray-900 font-bold text-center mb-12">
              The AI-Powered Pipeline
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-4">
              {aiPipeline.map((step, i) => (
                <div key={step.step} className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full md:w-auto">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={pipelineInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center text-center w-full"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-[18px] flex items-center justify-center mb-4 text-white font-black text-sm shadow-lg shadow-blue-600/30">
                      {step.step}
                    </div>
                    <div className="text-gray-900 text-sm font-bold">{step.label}</div>
                    <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-2">{step.desc}</div>
                  </motion.div>
                  {i < aiPipeline.length - 1 && (
                    <motion.div
                      className="hidden md:flex opacity-20"
                    >
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AWS Services grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {awsServices.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <service.icon className={`w-6 h-6 text-blue-600 group-hover:text-white transition-colors`} strokeWidth={2} />
                </div>
                <span className="text-blue-600 text-[9px] font-black uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                  {service.use.split(' ')[0]}
                </span>
              </div>
              <h3 className="font-heading font-black text-gray-900 text-sm mb-3">
                {service.name}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed font-medium line-clamp-3">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* High Precision Callout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="mt-20 bg-blue-600 rounded-[40px] p-12 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl shadow-blue-600/30"
        >
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Cpu className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-heading text-white font-black text-2xl mb-2">
                Enterprise Infrastructure
              </h3>
              <p className="text-white/70 text-sm max-w-lg font-medium leading-relaxed">
                Uses Aurora Serverless, ECS Fargate, and CloudFront for 99.99% uptime. 
                Full Aadhaar Auth & DPDP Compliance.
              </p>
            </div>
          </div>
          <motion.a
            href="#demo"
            whileHover={{ scale: 1.05 }}
            className="bg-white hover:bg-gray-50 text-blue-600 font-black px-10 py-5 rounded-2xl transition-all shadow-xl"
          >
            Live Demo
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
