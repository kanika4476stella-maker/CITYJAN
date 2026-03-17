import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { AppUser } from "@/context/AuthContext";

export async function getTopUsers(limitCount: number = 20): Promise<AppUser[]> {
  try {
    const q = query(
      collection(db, "users"),
      orderBy("points", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    
    // Also merge with demo users from local storage if any
    let localUsers: AppUser[] = [];
    try {
      const usersRaw = localStorage.getItem("CITYजन_demo_users") || "{}";
      const usersData = JSON.parse(usersRaw);
      localUsers = Object.keys(usersData).map(uid => ({
        uid,
        email: "demo@user.com",
        displayName: uid.startsWith("demo-citizen-001") ? "Arjun Mehta (Demo)" : "Demo Citizen",
        role: "citizen" as const,
        photoURL: null,
        isDemo: true,
        points: usersData[uid].points || 0,
        verified_reports: usersData[uid].verified_reports || 0,
        rejected_reports: usersData[uid].rejected_reports || 0,
      }));
    } catch(e) {}

    const firebaseUsers = snap.docs.map((doc) => doc.data() as AppUser);
    
    // Merge and sort
    const allUsers = [...firebaseUsers];
    for(const lU of localUsers) {
      if(!allUsers.find(u => u.uid === lU.uid)) {
        allUsers.push(lU);
      } else {
        // update points if demo is higher
        const existing = allUsers.find(u => u.uid === lU.uid);
        if(existing && existing.isDemo) {
          existing.points = Math.max(existing.points || 0, lU.points || 0);
        }
      }
    }

    // fallback mocked data if the list is essentially empty
    if(allUsers.length === 0 || (allUsers.length === 1 && allUsers[0].points === 0)) {
      allUsers.push(
        { uid: "mock-1", displayName: "Ravi Shankar", email: "", role: "citizen", points: 340, photoURL: null },
        { uid: "mock-2", displayName: "Anita Desai", email: "", role: "citizen", points: 280, photoURL: null },
        { uid: "mock-3", displayName: "Meera Reddy", email: "", role: "citizen", points: 210, photoURL: null },
        { uid: "mock-4", displayName: "Sanjay Gupta", email: "", role: "citizen", points: 190, photoURL: null },
        { uid: "mock-5", displayName: "Priya Sharma", email: "", role: "citizen", points: 150, photoURL: null }
      );
    }
    
    return allUsers.sort((a,b) => (b.points || 0) - (a.points || 0)).slice(0, limitCount);
  } catch (e) {
    console.error("Failed to fetch top users", e);
    // fallback mocked data
    return [
        { uid: "mock-1", displayName: "Ravi Shankar", email: "", role: "citizen", points: 340, photoURL: null },
        { uid: "mock-2", displayName: "Anita Desai", email: "", role: "citizen", points: 280, photoURL: null },
        { uid: "mock-3", displayName: "Meera Reddy", email: "", role: "citizen", points: 210, photoURL: null },
        { uid: "mock-4", displayName: "Sanjay Gupta", email: "", role: "citizen", points: 190, photoURL: null },
        { uid: "mock-5", displayName: "Priya Sharma", email: "", role: "citizen", points: 150, photoURL: null }
    ];
  }
}
