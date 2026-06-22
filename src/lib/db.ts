// src/lib/db.ts
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { FoodListing, ListingStatus, RescueTier, EscalationLog, AuditLog, UserProfile } from './types';
import { initialListings } from './mockData';

const COLLECTION = 'food_listings';

// Helper: Map raw Firestore document to strict TypeScript Interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDocToListing(docId: string, data: any): FoodListing {
  return {
    id: docId,
    title: data.title,
    description: data.description,
    quantity: data.quantity,
    foodType: data.foodType || 'Cooked Food',
    tier: Number(data.tier) as RescueTier,
    status: data.status as ListingStatus,
    expiryTime: data.expiryTime,
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    address: data.address,
    organizerId: data.organizerId,
    organizerName: data.organizerName,
    organizerPhone: data.organizerPhone || undefined,
    claimedById: data.claimedById || undefined,
    claimedByName: data.claimedByName || undefined,
    claimedAt: data.claimedAt || undefined,
    imageUrl: data.imageUrl || undefined,
    createdAt: data.createdAt,
  };
}

// 1. ONE-TIME FETCH (Used for initial auto-seeding if the cloud is completely blank)
export async function getStoredListings(): Promise<FoodListing[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('Firestore empty. Auto-seeding initial 3-tier surplus batches...');
      for (const item of initialListings) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = item;
        const cleanPayload = JSON.parse(JSON.stringify({
          ...rest,
          createdAt: new Date().toISOString()
        }));
        await addDoc(collection(db, COLLECTION), cleanPayload);
      }
      const newSnapshot = await getDocs(q);
      return newSnapshot.docs.map(d => mapDocToListing(d.id, d.data()));
    }

    return snapshot.docs.map(d => mapDocToListing(d.id, d.data()));
  } catch (error) {
    console.error("Firestore GET error:", error);
    return initialListings;
  }
}

// ============================================================================
// 🚀 STEP 1: REAL-TIME FIRESTORE LISTENER (PUSH MODEL)
// ============================================================================
export function subscribeToListings(callback: (listings: FoodListing[]) => void): () => void {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));

  // onSnapshot opens a persistent, highly secure WebSockets stream to Google Cloud
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const liveData = snapshot.docs.map(d => mapDocToListing(d.id, d.data()));
    callback(liveData);
  }, (error) => {
    console.error("Firestore Real-Time WebSockets Error:", error);
    callback(initialListings); // Fallback to safe mock data if client loses internet
  });

  return unsubscribe; // Return the teardown function to Next.js
}

// 1.5 REAL-TIME ESCALATION LOGS
export function subscribeToEscalationLogs(callback: (logs: EscalationLog[]) => void, limitCount = 5): () => void {
  const q = query(collection(db, 'escalation_logs'), orderBy('createdAt', 'desc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const liveData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EscalationLog)).slice(0, limitCount);
    callback(liveData);
  }, (error) => {
    console.error("Firestore Logs WebSockets Error:", error);
    callback([]);
  });
  return unsubscribe;
}

// 1.6 SYSTEM AUDIT LOGGING
export async function saveAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>) {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      ...log,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Firestore Audit Log error:", error);
  }
}

export function subscribeToAuditLogs(callback: (logs: AuditLog[]) => void, limitCount = 10): () => void {
  const q = query(collection(db, 'audit_logs'), orderBy('createdAt', 'desc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const liveData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog)).slice(0, limitCount);
    callback(liveData);
  }, (error) => {
    console.error("Firestore Audit Logs WebSockets Error:", error);
    callback([]);
  });
  return unsubscribe;
}

// 2. Insert a new surplus food batch into Firestore
export async function saveNewListing(item: Partial<FoodListing>): Promise<FoodListing | null> {
  try {
    const payload = JSON.parse(JSON.stringify({
      title: item.title,
      description: item.description,
      quantity: item.quantity,
      foodType: item.foodType || 'Cooked Food',
      tier: Number(item.tier || 1),
      status: 'available',
      expiryTime: item.expiryTime || new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      latitude: Number(item.latitude || 12.9716),
      longitude: Number(item.longitude || 77.5946),
      address: item.address || 'Central Loading Dock',
      organizerId: item.organizerId || `org-${Date.now()}`,
      organizerName: item.organizerName || 'Verified Organizer',
      organizerPhone: item.organizerPhone || undefined,
      createdAt: new Date().toISOString(),
    }));

    const docRef = await addDoc(collection(db, COLLECTION), payload);
    
    await saveAuditLog({
      action: 'CREATE',
      entityType: 'LISTING',
      entityId: docRef.id,
      entityName: item.title || 'Unknown Batch',
      actorId: payload.organizerId,
      actorName: payload.organizerName,
      details: `Created surplus batch at Tier ${payload.tier}`
    });

    return mapDocToListing(docRef.id, payload);
  } catch (error) {
    console.error("Firestore SAVE error:", error);
    return null;
  }
}

// 3. Update a listing status to 'claimed' in Firestore
export async function claimListingInDb(id: string, tier: number, user: UserProfile): Promise<void> {
  try {
    const claimant = user.organizationName || user.name;
    const docRef = doc(db, COLLECTION, id);
    
    const payload = {
      status: 'claimed',
      claimedById: user.id,
      claimedByName: claimant,
      claimedAt: new Date().toISOString()
    };

    console.group("CLAIM DEBUG");
    console.log("User Role:", user.role);
    console.log("User UID:", user.id);
    console.log("Listing Tier:", tier);
    console.log("Listing Status:", 'available');
    console.log("Payload:", payload);
    console.groupEnd();

    await updateDoc(docRef, payload);

    await saveAuditLog({
      action: 'CLAIM',
      entityType: 'LISTING',
      entityId: id,
      entityName: `Batch ${id.substring(0, 6)}`,
      actorId: user.id,
      actorName: claimant,
      details: `Claimed for Tier ${tier} processing`
    });

  } catch (error: any) {
    console.error("Firestore CLAIM error:", error);
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    
    // Provide specific rule failure contexts
    if (error.code === 'permission-denied') {
       if (tier === 1 && user.role !== 'ngo') throw new Error("Only Partner NGOs can claim Tier 1 batches");
       if (tier === 2 && user.role !== 'farmer') throw new Error("Only Agricultural Farmers can claim Tier 2 batches");
       if (tier === 3 && user.role !== 'compost') throw new Error("Only Compost Agencies can claim Tier 3 batches");
       throw new Error("Missing or insufficient permissions to claim this tier.");
    }
    
    throw error;
  }
}

// 4. Delete a listing permanently from Firestore
export async function deleteListingInDb(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    
    await saveAuditLog({
      action: 'DELETE',
      entityType: 'LISTING',
      entityId: id,
      entityName: `Batch ${id.substring(0, 6)}`,
      actorId: 'SYSTEM',
      actorName: 'Dashboard Admin',
      details: `Permanently removed from network`
    });

    return true;
  } catch (error) {
    console.error("Firestore DELETE error:", error);
    return false;
  }
}

// 5. LIVE CLOUD ESCALATION: Shift unclaimed food to the next priority tier in real-time
export async function escalateListingTierInDb(id: string, currentTier: number): Promise<boolean> {
  try {
    const nextTier = currentTier === 1 ? 2 : currentTier === 2 ? 3 : 3;
    await updateDoc(doc(db, COLLECTION, id), {
      tier: nextTier
    });

    await saveAuditLog({
      action: 'ESCALATE',
      entityType: 'LISTING',
      entityId: id,
      entityName: `Batch ${id.substring(0, 6)}`,
      actorId: 'SYSTEM',
      actorName: 'Auto-Escalation Engine',
      details: `Force escalated from Tier ${currentTier} to Tier ${nextTier}`
    });

    return true;
  } catch (error) {
    console.error("Firestore ESCALATE error:", error);
    return false;
  }
}