import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "CITYजन — AI-powered Smart City & Grievance Portal for Bharat",
  description: "Official-grade AI-powered Smart City platform bridging citizens and governance. Real-time grievance redressal, community dashboards, and AWS-powered civic intelligence — built for India.",
  keywords: ["Smart City Bharat", "Citizen Grievance Portal", "Digital India Initiative", "AI Governance India", "Municipal Reporting AI", "CITYजन Platform"],
  authors: [{ name: "CITYजन Council" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  robots: "index, follow",
  category: "Government Services",
  openGraph: {
    title: "CITYजन — Smart City Grievance & Resolution Platform",
    description: "Submit issues, track resolutions in real-time, and contribute to city planning. Built with AWS AI for a smarter Bharat.",
    url: "https://cityjan.bharat",
    siteName: "CITYजन",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "CITYजन — Smart City Grievance Portal",
    description: "Join 10k+ citizens building a smarter city together. AI-powered reporting and resolutions.",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Sora:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-background text-primary">
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#fff",
                  color: "#0F172A",
                  borderRadius: "24px",
                  border: "1px solid #F1F5F9",
                  fontSize: "14px",
                  fontWeight: "700",
                  fontFamily: "Inter, sans-serif",
                  padding: "16px 24px",
                  boxShadow: "0 20px 40px -10px rgba(0,0,0,0.05)",
                },
                success: {
                  iconTheme: { primary: "#2563EB", secondary: "#fff" },
                },
                error: {
                  iconTheme: { primary: "#EF4444", secondary: "#fff" },
                },
              }}
            />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
