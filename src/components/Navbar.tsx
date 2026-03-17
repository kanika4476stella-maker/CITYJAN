"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X, ChevronRight, Zap, LogIn, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "AWS AI", href: "#aws-ai" },
  { label: "Demo", href: "#demo" },
  { label: "Authorities", href: "/authorities" },
];

export default function Navbar() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Update active section
      const sections = ["features", "aws-ai", "demo"];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveLink(`#${section}`);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    setActiveLink(href);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm"
            : "bg-white/50 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading font-bold text-xl text-gray-900 tracking-tight">
                  CITY<span className="text-blue-600">जन</span>
                </span>
                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">
                  BHARAT
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                      activeLink === link.href
                        ? "text-blue-600 bg-blue-50/50 shadow-sm"
                        : "text-gray-400 hover:text-blue-600 hover:bg-gray-50/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* CTA + Hamburger */}
            <div className="flex items-center gap-4">
              {/* Login/Profile Link */}
              {!loading && (
                <div className="hidden md:block">
                  {user ? (
                    <Link
                      href={user.role === "admin" ? "/dashboard/admin" : "/dashboard/citizen"}
                      className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50/50 hover:bg-blue-100/50 transition-all border border-blue-100/50"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 border border-gray-100 hover:bg-gray-50 transition-all"
                    >
                      Login
                    </Link>
                  )}
                </div>
              )}

              {/* File a Report CTA */}
              <motion.a
                href="/report"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase tracking-[0.2em] px-7 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300"
              >
                File a Report
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.a>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-3 rounded-2xl text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden bg-white border-t border-gray-100 shadow-2xl"
            >
              <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className="flex items-center justify-between px-6 py-4 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                    >
                      {link.label}
                      <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-6 border-t border-gray-50 mt-4 flex flex-col gap-3">
                  {!loading && (
                    <motion.a
                      whileTap={{ scale: 0.98 }}
                      href={user ? (user.role === "admin" ? "/dashboard/admin" : "/dashboard/citizen") : "/auth/login"}
                      className="flex items-center justify-center gap-2 w-full bg-gray-50 text-gray-900 border border-gray-100 font-black text-[10px] uppercase tracking-[0.2em] py-5 rounded-3xl"
                    >
                      {user ? "Personal Dashboard" : "Sign In to CITYजन"}
                    </motion.a>
                  )}
                  <motion.a
                    whileTap={{ scale: 0.98 }}
                    href="/report"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] py-5 rounded-3xl shadow-2xl shadow-blue-500/20"
                  >
                    File a Report
                  </motion.a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
