import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";

export interface Authority {
  id: string;
  name: string;
  department: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  iconName: string;
  complaintLink?: string;
  createdAt?: any;
}

const COLLECTION_NAME = "authorities";

// Initial Noida/NCR data
const INITIAL_AUTHORITIES = [
  {
    name: "Noida Police HQ",
    department: "Police Department",
    phone: "0120-2580001",
    email: "ssp-noida-up@nic.in",
    address: "Sector 14A, Noida, Uttar Pradesh 201301",
    workingHours: "24/7",
    iconName: "Shield"
  },
  {
    name: "Noida Authority (Main Office)",
    department: "Municipal Corporation",
    phone: "0120-2425025",
    email: "ceo@noidaauthorityonline.in",
    address: "Sector 6, Noida, Uttar Pradesh 201301",
    workingHours: "9:30 AM - 6:00 PM (Mon-Fri)",
    iconName: "Building2"
  },
  {
    name: "NPCL (Electricity) Noida",
    department: "Electricity Department",
    phone: "0120-6226601",
    email: "customercare@noida-power.com",
    address: "Commercial Complex, H-Block, Sector Alpha-II, Greater Noida",
    workingHours: "24/7 (Customer Care)",
    iconName: "Zap"
  },
  {
    name: "UP Jal Nigam (Water)",
    department: "Water Supply Department",
    phone: "0120-2422256",
    email: "ee_jal@noida.gov.in",
    address: "Sector 19, Noida, Uttar Pradesh 201301",
    workingHours: "10:00 AM - 5:00 PM",
    iconName: "Droplets"
  },
  {
    name: "Noida Traffic Police",
    department: "Traffic Police",
    phone: "0120-2441999",
    email: "traffic-noida@up.gov.in",
    address: "Sector 14A, Noida, Uttar Pradesh 201301",
    workingHours: "24/7",
    iconName: "Car"
  },
  {
    name: "Noida Fire Station",
    department: "Fire Department",
    phone: "101 / 0120-2521111",
    email: "cfo-noida@up.gov.in",
    address: "Sector 2, Noida, Uttar Pradesh 201301",
    workingHours: "24/7",
    iconName: "Flame"
  },
  {
    name: "Noida District Hospital",
    department: "Health Department",
    phone: "0120-2450012",
    email: "cms-noida@up.gov.in",
    address: "Sector 30, Noida, Uttar Pradesh 201301",
    workingHours: "24/7",
    iconName: "HeartPulse"
  },
  {
    name: "Noida RTO Office",
    department: "Transport Department",
    phone: "0120-2505556",
    email: "rtonoida-up@nic.in",
    address: "Sector 33, Noida, Uttar Pradesh",
    workingHours: "10:00 AM - 5:00 PM (Mon-Sat)",
    iconName: "Truck"
  },
  {
    name: "Women Power Line Noida",
    department: "Women Helpline",
    phone: "1090",
    email: "wpl-noida@up.gov.in",
    address: "Sector 14A, Noida, Uttar Pradesh",
    workingHours: "24/7",
    iconName: "UserRound"
  },
  {
    name: "Medical Emergency Noida",
    department: "Emergency Services",
    phone: "108 / 102",
    email: "ambulance-noida@up.gov.in",
    address: "District-wide services, Noida",
    workingHours: "24/7",
    iconName: "Ambulance"
  }
];

export async function getAllAuthorities(): Promise<Authority[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    
    // If no authorities exist, return initial list for now
    if (querySnapshot.empty) {
      return INITIAL_AUTHORITIES.map((auth, index) => ({
        id: `initial-${index}`,
        ...auth
      }));
    }

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Authority[];
  } catch (error) {
    console.error("Error fetching authorities:", error);
    // Fallback to initial list in case of error (e.g., during dev)
    return INITIAL_AUTHORITIES.map((auth, index) => ({
      id: `initial-${index}`,
      ...auth
    }));
  }
}

export async function addAuthority(auth: Omit<Authority, "id">) {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...auth,
    createdAt: Timestamp.now()
  });
  return docRef.id;
}

export async function updateAuthority(id: string, auth: Partial<Authority>) {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, auth);
}

export async function deleteAuthority(id: string) {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
