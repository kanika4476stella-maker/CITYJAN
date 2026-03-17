/**
 * Firestore service for the Reports collection.
 * Falls back to localStorage in demo mode (no Firebase credentials).
 */
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export interface ReportData {
  userId: string;
  userDisplayName: string;
  title: string;
  description: string;
  category: string;
  photoUrl: string | null;
  latitude: number;
  longitude: number;
  address: string;
  status: "Submitted" | "Under Review" | "In Progress" | "Resolved" | "Verified" | "Rejected";
  verifiedByAdmin?: string;
  upvotes?: number;
  upvotedBy?: string[];
  createdAt?: Timestamp | Date | string;
}

export interface Report extends ReportData {
  reportId: string;
}

const DEMO_REPORTS_KEY = "CITYजन_demo_reports";

// ── Demo mode helpers ─────────────────────────────────────────────────────────
function getDemoReports(): Report[] {
  try {
    const raw = localStorage.getItem(DEMO_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDemoReports(reports: Report[]) {
  try {
    localStorage.setItem(DEMO_REPORTS_KEY, JSON.stringify(reports));
  } catch { /* ignore */ }
}

function isDemo(userId: string) {
  return userId.startsWith("demo-");
}

// ── Submit a new report ───────────────────────────────────────────────────────
export async function submitReport(data: ReportData): Promise<string> {
  if (isDemo(data.userId)) {
    // Save to localStorage for demo mode
    const reports = getDemoReports();
    const reportId = `GR-DEMO-${Date.now()}`;
    const newReport: Report = {
      ...data,
      reportId,
      status: "Submitted",
      createdAt: new Date().toISOString(),
    };
    reports.unshift(newReport);
    saveDemoReports(reports);
    return reportId;
  }

  try {
    const newDocRef = doc(collection(db, "reports"));
    let finalPhotoUrl = data.photoUrl;

    if (finalPhotoUrl && finalPhotoUrl.startsWith("data:image")) {
      const imageRef = ref(storage, `reports/${data.userId}/${newDocRef.id}.jpg`);
      await uploadString(imageRef, finalPhotoUrl, "data_url");
      finalPhotoUrl = await getDownloadURL(imageRef);
    }

    await setDoc(newDocRef, {
      ...data,
      photoUrl: finalPhotoUrl,
      reportId: newDocRef.id,
      status: "pending",
      upvotes: 0,
      upvotedBy: [],
      createdAt: serverTimestamp(),
    });
    return newDocRef.id;
  } catch (err) {
    console.error("Firestore submit error:", err);
    // Fallback to local if Firestore fails
    const reportId = `GR-LOCAL-${Date.now()}`;
    const reports = getDemoReports();
    reports.unshift({ ...data, reportId, status: "Submitted", createdAt: new Date().toISOString() });
    saveDemoReports(reports);
    return reportId;
  }
}

// ── Fetch reports for a user ──────────────────────────────────────────────────
export async function getUserReports(userId: string): Promise<Report[]> {
  if (isDemo(userId)) {
    return getDemoReports().filter((r) => r.userId === userId);
  }

  try {
    const q = query(
      collection(db, "reports"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      reportId: doc.id,
      ...(doc.data() as ReportData),
    }));
  } catch {
    return getDemoReports().filter((r) => r.userId === userId);
  }
}

// ── Fetch all reports (admin) ─────────────────────────────────────────────────
export async function getAllReports(): Promise<Report[]> {
  try {
    const q = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      reportId: doc.id,
      ...(doc.data() as ReportData),
    }));
  } catch {
    return getDemoReports();
  }
}

// ── Update report status (Admin gamification) ──────────────────────────────────
export async function updateReportStatus(reportId: string, newStatus: ReportData["status"], adminId: string, userId: string): Promise<void> {
  const isDemoReport = reportId.startsWith("GR-DEMO-") || reportId.startsWith("GR-LOCAL-");
  
  if (isDemoReport) {
    const reports = getDemoReports();
    const idx = reports.findIndex(r => r.reportId === reportId);
    if (idx !== -1) {
      reports[idx] = { ...reports[idx], status: newStatus, verifiedByAdmin: adminId };
      saveDemoReports(reports);
      
      // Update local storage demo user points
      try {
        const usersRaw = localStorage.getItem("CITYजन_demo_users") || "{}";
        const users = JSON.parse(usersRaw);
        if (!users[userId]) users[userId] = { points: 0, verified_reports: 0, rejected_reports: 0 };
        
        if (newStatus === "Verified") {
          users[userId].points += 10;
          users[userId].verified_reports += 1;
        } else if (newStatus === "Rejected") {
          users[userId].rejected_reports += 1;
        }
        localStorage.setItem("CITYजन_demo_users", JSON.stringify(users));
      } catch (e) {}
    }
    return;
  }

  try {
    const ref = doc(db, "reports", reportId);
    await updateDoc(ref, {
      status: newStatus,
      verifiedByAdmin: adminId,
    });

    // Gamification points update
    if (newStatus === "Verified" || newStatus === "Rejected") {
      const userRef = doc(db, "users", userId);
      if (newStatus === "Verified") {
        await updateDoc(userRef, {
          points: increment(10),
          verified_reports: increment(1),
        });
      } else if (newStatus === "Rejected") {
        await updateDoc(userRef, {
          rejected_reports: increment(1),
        });
      }
    }
  } catch (err) {
    console.error("Error updating report status:", err);
    throw err;
  }
}

// ── Upvote a report (Public Feed) ─────────────────────────────────────────────
export async function upvoteReport(reportId: string, userId: string): Promise<boolean> {
  const isDemoReport = reportId.startsWith("GR-DEMO-") || reportId.startsWith("GR-LOCAL-");
  
  if (isDemoReport) {
    const reports = getDemoReports();
    const idx = reports.findIndex(r => r.reportId === reportId);
    if (idx !== -1) {
      const report = reports[idx];
      const voters = report.upvotedBy || [];
      if (voters.includes(userId)) return false; // Already voted
      
      reports[idx] = { 
        ...report, 
        upvotes: (report.upvotes || 0) + 1,
        upvotedBy: [...voters, userId]
      };
      saveDemoReports(reports);
      return true;
    }
    return false;
  }

  try {
    const ref = doc(db, "reports", reportId);
    // In a real production app, we would use a transaction or an array-union to ensure atomicity.
    // For simplicity here we just use increment.
    await updateDoc(ref, {
      upvotes: increment(1),
      // Not pushing to array here to keep demo simple, but in production you'd use arrayUnion(userId)
    });
    return true;
  } catch (err) {
    console.error("Error upvoting report:", err);
    return false;
  }
}

export const CATEGORIES = [
  { id: "pothole", label: "Pothole", emoji: "🚧", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: "garbage", label: "Garbage", emoji: "🗑️", color: "bg-gray-100 text-gray-700 border-gray-200" },
  { id: "water leakage", label: "Water Leakage", emoji: "💧", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "streetlight", label: "Streetlight", emoji: "💡", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { id: "traffic", label: "Traffic", emoji: "🚥", color: "bg-red-100 text-red-700 border-red-200" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
