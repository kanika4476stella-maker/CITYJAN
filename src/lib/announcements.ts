import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type AnnouncementType = "government notice" | "safety alert" | "city announcement";

export interface AnnouncementData {
  title: string;
  description: string;
  type: AnnouncementType;
  date: string;
  imageUrl: string | null;
  verifiedBadge: boolean;
  createdAt?: Timestamp | Date | string;
}

export interface Announcement extends AnnouncementData {
  id: string;
}

const DEMO_ANNOUNCEMENTS_KEY = "CITYजन_demo_announcements";

// ── Demo mode helpers ─────────────────────────────────────────────────────────
function getDemoAnnouncements(): Announcement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DEMO_ANNOUNCEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDemoAnnouncements(announcements: Announcement[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DEMO_ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  } catch { /* ignore */ }
}

function isDemo(userId: string) {
  return userId && userId.startsWith("demo-");
}

// ── API ───────────────────────────────────────────────────────────────────────
export async function submitAnnouncement(data: AnnouncementData, adminId: string): Promise<string> {
  if (isDemo(adminId)) {
    const announcements = getDemoAnnouncements();
    const id = `ANN-DEMO-${Date.now()}`;
    const newAnnouncement: Announcement = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    announcements.unshift(newAnnouncement);
    saveDemoAnnouncements(announcements);
    return id;
  }

  try {
    const newDocRef = doc(collection(db, "announcements"));
    let finalImageUrl = data.imageUrl;

    if (finalImageUrl && finalImageUrl.startsWith("data:image")) {
      const imageRef = ref(storage, `announcements/${newDocRef.id}.jpg`);
      await uploadString(imageRef, finalImageUrl, "data_url");
      finalImageUrl = await getDownloadURL(imageRef);
    }

    await setDoc(newDocRef, {
      ...data,
      imageUrl: finalImageUrl,
      id: newDocRef.id,
      createdAt: serverTimestamp(),
    });
    return newDocRef.id;
  } catch (err) {
    console.error("Firestore submit error:", err);
    // fallback to demo local storage
    const announcements = getDemoAnnouncements();
    const id = `ANN-LOCAL-${Date.now()}`;
    announcements.unshift({ ...data, id, createdAt: new Date().toISOString() });
    saveDemoAnnouncements(announcements);
    return id;
  }
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  try {
    const q = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    
    // We also fetch demo ones to merge because during dev you sometimes switch between modes
    // Or we just return the remote ones if successful
    const remote = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as AnnouncementData),
    }));
    return remote.length > 0 ? remote : getDemoAnnouncements();
  } catch {
    return getDemoAnnouncements();
  }
}
