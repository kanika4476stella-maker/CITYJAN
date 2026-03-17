"use client";

import { motion } from "framer-motion";
import { Shield, Twitter, Github, Linkedin, Mail, ArrowUpRight, Heart } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  Platform: [
    { label: "Features", href: "#features" },
    { label: "AWS AI", href: "#aws-ai" },
    { label: "Live Demo", href: "#demo" },
    { label: "Dashboard", href: "#dashboard" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Case Studies", href: "#" },
    { label: "Blog", href: "#" },
  ],
  Company: [
    { label: "About Us", href: "#about" },
    { label: "Team", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
];

const badges = [
  { label: "AWS Partner", color: "from-orange-500 to-amber-500" },
  { label: "Digital India", color: "from-green-500 to-emerald-500" },
  { label: "MeitY Recognised", color: "from-blue-500 to-indigo-500" },
];

export default function Footer() {
  return (
    <footer className="bg-dark grain-texture overflow-hidden relative">
      {/* Decorative radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-highlight/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top CTA strip */}
        <div className="py-12 border-b border-white/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="font-heading text-3xl font-bold text-white mb-2">
                Ready to transform your city?
              </h2>
              <p className="text-white/60 text-lg">
                Join 50,000+ citizens already using CITYजन across Bharat.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.a
                href="#demo"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20"
              >
                Get Started
                <ArrowUpRight className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="#features"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 glass border border-white/20 text-white font-semibold px-6 py-3.5 rounded-2xl hover:bg-white/10 transition-all"
              >
                Learn More
              </motion.a>
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group w-fit">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary-light rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading font-bold text-xl text-white tracking-tight">
                  CITY<span className="text-accent-light">जन</span>
                </span>
                <span className="text-[9px] font-medium text-white/40 tracking-widest uppercase">
                  Smart City · Bharat
                </span>
              </div>
            </Link>

            <p className="text-white/55 text-sm leading-relaxed mb-6 max-w-xs">
              Bridging citizens and governance through AI-powered civic engagement. From grievance redressal to community insights — all in one platform.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {badges.map((badge) => (
                <span
                  key={badge.label}
                  className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${badge.color} text-white`}
                >
                  {badge.label}
                </span>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-heading font-semibold text-white text-sm mb-4 tracking-wide">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                        {link.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm text-center sm:text-left">
            © 2025 CITYजन Technologies Pvt. Ltd. All rights reserved.
          </p>
          
          {/* Tagline */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-white/50 text-xs font-medium">Empowering Citizens</span>
            <span className="text-highlight text-xs">•</span>
            <span className="text-white/50 text-xs font-medium">Powered by AWS AI</span>
            <span className="text-highlight text-xs">•</span>
            <span className="text-white/50 text-xs font-medium flex items-center gap-1">
              Built for Bharat
              <Heart className="w-3 h-3 text-red-400 inline" />
            </span>
          </div>

          <div className="flex gap-4">
            <a href="#" className="text-white/40 hover:text-white/70 text-xs transition-colors">Privacy</a>
            <a href="#" className="text-white/40 hover:text-white/70 text-xs transition-colors">Terms</a>
            <a href="#" className="text-white/40 hover:text-white/70 text-xs transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
