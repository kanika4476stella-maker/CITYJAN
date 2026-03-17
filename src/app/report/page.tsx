"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  FileText,
  Image as ImageIcon,
  ChevronRight,
  CheckCircle,
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  Tag,
  Shield,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { submitReport, CATEGORIES } from "@/lib/reports";
import { GeoLocation } from "@/lib/geocoding";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LanguageSelector from "@/components/layout/LanguageSelector";
import { T } from "@/context/LanguageContext";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Dynamic import to avoid SSR issues with Google Maps / browser APIs
const MapPicker = dynamic(() => import("@/components/report/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-72 rounded-2xl bg-background border border-primary/15 flex items-center justify-center gap-2 text-primary/40 text-sm">
      <Loader2 className="w-5 h-5 animate-spin" /> Loading map…
    </div>
  ),
});
const PhotoUpload = dynamic(() => import("@/components/report/PhotoUpload"), {
  ssr: false,
});

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4;

interface FormState {
  title: string;
  description: string;
  category: string;
  photo: string | null;
  location: GeoLocation | null;
}

const STEPS = [
  { id: 1, label: "Location", icon: MapPin },
  { id: 2, label: "Details", icon: FileText },
  { id: 3, label: "Photo", icon: ImageIcon },
  { id: 4, label: "Confirm", icon: CheckCircle },
] as const;

// ── Step components ───────────────────────────────────────────────────────────
function StepLocation({
  value,
  onChange,
}: {
  value: GeoLocation | null;
  onChange: (v: GeoLocation) => void;
}) {
  return (
    <div>
      <h2 className="font-heading font-bold text-primary text-xl mb-1">
        <T>📍 Where is the issue?</T>
      </h2>
      <p className="text-primary/50 text-sm mb-5">
        <T>We'll auto-detect your GPS, or tap the map to set a precise pin.</T>
      </p>
      <MapPicker value={value} onChange={onChange} />
      {!value && (
        <p className="text-xs text-primary/40 text-center mt-3">
          Location is required to file a report
        </p>
      )}
    </div>
  );
}

function StepDetails({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (k: keyof FormState, v: string) => void;
}) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ category: string | null; confidence: number } | null>(null);
  
  // Real-time AI analysis trigger with debounce (simulating Amazon Comprehend payload processing)
  useEffect(() => {
    if (form.description.trim().length > 15) {
      const timer = setTimeout(async () => {
        setIsDetecting(true);
        try {
          const res = await fetch("/api/analyze", {
            method: "POST",
            body: JSON.stringify({ text: form.description }),
            headers: { "Content-Type": "application/json" },
          });
          const data = await res.json();
          if (data.category && data.confidence) {
            setAiAnalysis(data);
            // Auto assign if AI confidence > 80%
            if (data.confidence > 0.8 && form.category !== data.category) {
              onChange("category", data.category);
              const label = CATEGORIES.find(c => c.id === data.category)?.label;
              toast.success(`Amazon Comprehend AI auto-detected category: ${label}`);
            }
          }
        } catch (e) {
          console.error("Analysis Failed", e);
        } finally {
          setIsDetecting(false);
        }
      }, 1200); // Debounce typing
      
      return () => clearTimeout(timer);
    } else {
      setAiAnalysis(null);
    }
  }, [form.description]); // Intentionally not including onChange to prevent infinite loops if category updates

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-primary text-xl mb-1">
          <T>📋 What is the issue?</T>
        </h2>
        <p className="text-primary/50 text-sm"><T>Give us the details so we can act faster.</T></p>
      </div>

      {/* Category grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-primary/60 uppercase tracking-wide">
            Category *
          </label>
          {isDetecting ? (
            <div className="flex items-center gap-1.5 text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">
              <Loader2 className="w-3 h-3 animate-spin inline" /> Analyzing text...
            </div>
          ) : aiAnalysis?.category === form.category && aiAnalysis?.confidence > 0.8 ? (
            <div className="flex items-center gap-1 text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-bold">
              <Sparkles className="w-3 h-3 fill-current" /> Auto-detected ({(aiAnalysis.confidence * 100).toFixed(0)}% confidence)
            </div>
          ) : null}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange("category", cat.id)}
              className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border text-sm font-medium transition-all ${
                form.category === cat.id
                  ? "bg-accent/10 border-accent/40 text-accent shadow-sm ring-2 ring-accent/20"
                  : "bg-background border-primary/12 text-primary/60 hover:border-primary/25 hover:bg-white"
              }`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs text-center leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="report-title"
          className="text-xs font-semibold text-primary/60 uppercase tracking-wide mb-1.5 block"
        >
          Issue Title *
        </label>
        <input
          id="report-title"
          type="text"
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="e.g. Large pothole on Ring Road near Sector 12"
          maxLength={120}
          className="w-full bg-background border border-primary/15 rounded-xl px-4 py-3 text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/40 transition-all"
        />
        <p className="text-xs text-primary/30 mt-1 text-right">{form.title.length}/120</p>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="report-desc"
          className="text-xs font-semibold text-primary/60 uppercase tracking-wide mb-1.5 block"
        >
          Description *
        </label>
        <textarea
          id="report-desc"
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Describe the issue in detail. You can write in Hindi, English, or any Indian language."
          rows={4}
          maxLength={1000}
          className="w-full bg-background border border-primary/15 rounded-xl px-4 py-3 text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/40 transition-all resize-none"
        />
        <p className="text-xs text-primary/30 mt-1 text-right">{form.description.length}/1000</p>
      </div>
    </div>
  );
}

function StepPhoto({
  value,
  category,
  onChange,
}: {
  value: string | null;
  category: string;
  onChange: (v: string | null) => void;
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (value && category) {
      setAnalyzing(true);
      setWarning(null);
      fetch('/api/analyze-image', {
        method: "POST",
        body: JSON.stringify({ image: value, category }),
        headers: { "Content-Type": "application/json" }
      })
      .then(r => r.json())
      .then(data => {
        if (data.match === false) {
           const label = CATEGORIES.find(c => c.id === category)?.label || category;
           setWarning(`AI Warning: The uploaded photo doesn't clearly match the selected '${label}' category. Please ensure the image shows the issue clearly. You can still proceed.`);
        }
      })
      .catch((e) => console.error("Rekognition failed", e))
      .finally(() => setAnalyzing(false));
    } else {
      setWarning(null);
    }
  }, [value, category]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-bold text-primary text-xl mb-1">
          📷 Show us the issue
        </h2>
        <p className="text-primary/50 text-sm">
          A photo helps officials verify and prioritize your report faster.
        </p>
      </div>
      <PhotoUpload value={value} onChange={onChange} />
      {analyzing && (
        <div className="flex items-center gap-2 text-primary/60 text-xs bg-background rounded-xl px-3 py-2.5 border border-primary/10">
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          Analyzing image with Amazon Rekognition...
        </div>
      )}
      {warning && !analyzing && (
        <div className="flex items-start gap-2 text-amber-700 text-xs bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {warning}
        </div>
      )}
      {!value && (
        <div className="flex items-center gap-2 text-primary/40 text-xs bg-background rounded-xl px-3 py-2.5 border border-primary/10">
          <AlertCircle className="w-4 h-4" />
          Photo is optional but strongly recommended for faster action
        </div>
      )}
    </div>
  );
}

function StepConfirm({
  form,
  submitting,
  onSubmit,
}: {
  form: FormState;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const catInfo = CATEGORIES.find((c) => c.id === form.category);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-bold text-primary text-xl mb-1">
          ✅ Review & Submit
        </h2>
        <p className="text-primary/50 text-sm">Double-check your report before sending.</p>
      </div>

      <div className="space-y-3 bg-background rounded-2xl border border-primary/10 p-5">
        {/* Location */}
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary/40 uppercase tracking-wide">Location</p>
            <p className="text-sm text-primary font-medium">{form.location?.address}</p>
            <p className="text-xs text-primary/30 font-mono">
              {form.location?.lat.toFixed(6)}°, {form.location?.lng.toFixed(6)}°
            </p>
          </div>
        </div>

        <div className="h-px bg-primary/6" />

        {/* Category */}
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Tag className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary/40 uppercase tracking-wide">Category</p>
            <p className="text-sm text-primary font-medium">
              {catInfo?.emoji} {catInfo?.label ?? form.category}
            </p>
          </div>
        </div>

        <div className="h-px bg-primary/6" />

        {/* Title + Description */}
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary/40 uppercase tracking-wide">Report</p>
            <p className="text-sm text-primary font-semibold">{form.title}</p>
            <p className="text-sm text-primary/60 mt-1 line-clamp-3">{form.description}</p>
          </div>
        </div>

        {/* Photo preview */}
        {form.photo && (
          <>
            <div className="h-px bg-primary/6" />
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-primary/40 uppercase tracking-wide mb-2">
                  Photo
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.photo}
                  alt="Report"
                  className="w-full max-h-40 object-cover rounded-xl"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Submit button */}
      <motion.button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        whileHover={{ scale: submitting ? 1 : 1.02 }}
        whileTap={{ scale: submitting ? 1 : 0.98 }}
        className="w-full flex items-center justify-center gap-2.5 bg-accent hover:bg-accent/90 text-white font-bold py-4 rounded-2xl shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed text-base"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting Report…
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Submit Report
          </>
        )}
      </motion.button>

      <p className="text-xs text-primary/30 text-center">
        By submitting, you confirm this is a genuine civic issue in your area
      </p>
    </div>
  );
}

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({
  reportId,
  form,
  onNewReport,
}: {
  reportId: string;
  form: FormState;
  onNewReport: () => void;
}) {
  // Re-import dynamically to avoid SSR
  const MapPicker = dynamic(() => import("@/components/report/MapPicker"), {
    ssr: false,
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Success hero */}
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.15 }}
          className="w-20 h-20 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-10 h-10 text-green-500" />
        </motion.div>
        <h2 className="font-heading font-bold text-primary text-2xl mb-2">
          Report Submitted! 🎉
        </h2>
        <p className="text-primary/50 text-sm">
          Your complaint has been registered with the Municipal Corporation.
        </p>
        <div className="inline-flex items-center gap-2 mt-3 bg-primary/8 border border-primary/12 rounded-full px-4 py-2 text-sm font-mono text-primary/70">
          <ClipboardList className="w-4 h-4" />
          {reportId}
        </div>
      </div>

      {/* Map showing pin */}
      <div>
        <p className="text-xs font-semibold text-primary/50 uppercase tracking-wide mb-2">
          📍 Reported Location
        </p>
        <div className="rounded-2xl overflow-hidden border border-primary/15 pointer-events-none">
          <MapPicker value={form.location} onChange={() => {}} />
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-accent/6 border border-accent/20 rounded-2xl p-5 space-y-3">
        <p className="font-semibold text-primary text-sm">What happens next?</p>
        {[
          { step: "1", text: "AI auto-classifies your report and assigns priority" },
          { step: "2", text: "A municipal officer reviews and assigns it within 24 hours" },
          { step: "3", text: "You get a push notification on every status update" },
          { step: "4", text: "Rate the resolution once it's marked complete" },
        ].map((s) => (
          <div key={s.step} className="flex items-start gap-3">
            <div className="w-5 h-5 bg-accent/15 text-accent rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              {s.step}
            </div>
            <p className="text-sm text-primary/60">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onNewReport}
          className="flex-1 py-3 rounded-2xl border border-primary/20 text-primary/70 font-semibold text-sm hover:bg-primary/5 transition-colors"
        >
          File Another Report
        </button>
        <Link
          href="/dashboard/citizen"
          className="flex-1 py-3 rounded-2xl bg-accent text-white font-semibold text-sm text-center hover:bg-accent/90 transition-colors shadow-glow"
        >
          Go to Dashboard
        </Link>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function ReportPageContent() {
  const { user } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    category: "",
    photo: null,
    location: null,
  });

  const searchParams = useSearchParams();
  const initialDept = searchParams.get("dept");

  useEffect(() => {
    if (initialDept) {
      const dept = initialDept.toLowerCase();
      let autoCat = "";
      
      if (dept.includes("police") || dept.includes("traffic")) autoCat = "traffic";
      else if (dept.includes("water")) autoCat = "water leakage";
      else if (dept.includes("electricity") || dept.includes("light")) autoCat = "streetlight";
      else if (dept.includes("garbage") || dept.includes("municipal") || dept.includes("noida authority")) autoCat = "garbage";
      
      if (autoCat) {
        setForm(prev => ({ ...prev, category: autoCat }));
      }
    }
  }, [initialDept]);

  const updateForm = (key: keyof FormState, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ── Validation per step ───────────────────────────────────────────────────
  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return !!form.location;
      case 2:
        return !!form.category && form.title.trim().length > 5 && form.description.trim().length > 10;
      case 3:
        return true; // Photo is optional
      case 4:
        return true;
    }
  };

  const next = () => {
    if (!canProceed()) {
      switch (step) {
        case 1:
          toast.error("Please select a location first.");
          break;
        case 2:
          toast.error("Please fill in the category, title, and description.");
          break;
      }
      return;
    }
    setStep((s) => Math.min(4, s + 1) as Step);
  };

  const back = () => setStep((s) => Math.max(1, s - 1) as Step);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!user || !form.location) return;
    setSubmitting(true);
    try {
      const id = await submitReport({
        userId: user.uid,
        userDisplayName: user.displayName ?? "Anonymous",
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        photoUrl: form.photo,
        latitude: form.location.lat,
        longitude: form.location.lng,
        address: form.location.address,
        status: "Submitted",
      });
      setSubmittedId(id);
      toast.success("Report submitted successfully! 🎉", { duration: 4000 });
    } catch (err) {
      toast.error("Submission failed. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", category: "", photo: null, location: null });
    setSubmittedId(null);
    setStep(1);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-primary/10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/citizen"
              className="p-2 rounded-xl text-primary/50 hover:text-primary hover:bg-primary/8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="font-heading font-bold text-primary leading-none">File a Report</p>
              <p className="text-primary/40 text-xs mt-0.5">CITYजन Grievance Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-primary/50">
            <LanguageSelector />
            <Shield className="w-4 h-4 text-accent" />
            {user?.isDemo && (
              <span className="bg-highlight/15 text-highlight px-2 py-0.5 rounded-full font-medium text-[10px]">
                Demo
              </span>
            )}
          </div>
        </div>

        {/* Step progress bar */}
        {!submittedId && (
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <div className="flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 flex-1 last:flex-none">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all text-xs font-bold ${
                        step > s.id
                          ? "bg-green-500 text-white"
                          : step === s.id
                          ? "bg-accent text-white shadow-glow"
                          : "bg-primary/8 text-primary/30"
                      }`}
                    >
                      {step > s.id ? <CheckCircle className="w-3.5 h-3.5" /> : s.id}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:block ${
                        step === s.id ? "text-primary" : "text-primary/40"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 rounded-full overflow-hidden bg-primary/10">
                      <div
                        className={`h-full bg-accent transition-all duration-500 ${
                          step > s.id ? "w-full" : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 pb-32">
        <AnimatePresence mode="wait">
          {submittedId ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <SuccessScreen reportId={submittedId} form={form} onNewReport={resetForm} />
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <StepLocation
                  value={form.location}
                  onChange={(v) => updateForm("location", v)}
                />
              )}
              {step === 2 && (
                <StepDetails
                  form={form}
                  onChange={(k, v) => updateForm(k, v)}
                />
              )}
              {step === 3 && (
                <StepPhoto
                  value={form.photo}
                  category={form.category}
                  onChange={(v) => updateForm("photo", v)}
                />
              )}
              {step === 4 && (
                <StepConfirm
                  form={form}
                  submitting={submitting}
                  onSubmit={handleSubmit}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom nav bar */}
      {!submittedId && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-primary/10 px-4 py-4 shadow-lg">
          <div className="max-w-2xl mx-auto flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={back}
                className="flex items-center gap-2 bg-primary/8 hover:bg-primary/14 text-primary font-semibold px-5 py-3.5 rounded-2xl transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < 4 ? (
              <motion.button
                type="button"
                onClick={next}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!canProceed()}
                className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold py-3.5 rounded-2xl shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {step === 3 && !form.photo ? "Skip Photo" : "Continue"}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold py-3.5 rounded-2xl shadow-glow transition-all disabled:opacity-60 text-sm"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit Report</>
                )}
              </motion.button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-primary/40 font-black text-[10px] uppercase tracking-widest">Constructing Portal...</div>}>
        <ReportPageContent />
      </Suspense>
    </ProtectedRoute>
  );
}
