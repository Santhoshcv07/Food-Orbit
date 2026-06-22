// src/lib/db.ts
import { db } from './firebase';

import { FoodListing, ListingStatus, RescueTier } from './types';
import { initialListings } from './mockData';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

const COLLECTION = 'food_listings';

// Helper: Map Firestore document to TypeScript Interface
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

// 1. Fetch all active listings from Firestore
export async function getStoredListings(): Promise<FoodListing[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    // SENIOR DEV SAFETY NET: Auto-seed initial batches if cloud collection is empty!
    if (snapshot.empty) {
      console.log('Firestore empty. Auto-seeding initial 3-tier surplus batches...');
      for (const item of initialListings) {
        const { id, ...rest } = item; // Strip static mock ID
        const cleanPayload = JSON.parse(JSON.stringify({
          ...rest,
          createdAt: new Date().toISOString()
        }));
        await addDoc(collection(db, COLLECTION), cleanPayload);
      }
      // Re-fetch now that we seeded it
      const newSnapshot = await getDocs(q);
      return newSnapshot.docs.map(d => mapDocToListing(d.id, d.data()));
    }

    return snapshot.docs.map(d => mapDocToListing(d.id, d.data()));
  } catch (error) {
    console.error("Firestore GET error:", error);
    return initialListings; // Fallback to memory mock if offline
  }
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
      address: item.address || 'Central Gate',
      organizerId: item.organizerId || `org-${Date.now()}`,
      organizerName: item.organizerName || 'Verified Organizer',
      organizerPhone: item.organizerPhone || undefined,
      createdAt: new Date().toISOString(),
    }));

    const docRef = await addDoc(collection(db, COLLECTION), payload);
    return mapDocToListing(docRef.id, payload);
  } catch (error) {
    console.error("Firestore SAVE error:", error);
    return null;
  }
}

// 3. Update a listing status to 'claimed' in Firestore
export async function claimListingInDb(id: string, tier: number): Promise<boolean> {
  try {
    const claimant = tier === 1 ? 'Partner NGO Food Bank' : tier === 2 ? 'Regional Livestock Sanctuary' : 'EcoSoils Bio-Waste Agency';
    const docRef = doc(db, COLLECTION, id);
    
    await updateDoc(docRef, {
      status: 'claimed',
      claimedByName: claimant,
      claimedAt: new Date().toLocaleTimeString()
    });
    return true;
  } catch (error) {
    console.error("Firestore CLAIM error:", error);
    return false;
  }
}

// 4. Delete a listing permanently from Firestore
export async function deleteListingInDb(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    return true;
  } catch (error) {
    console.error("Firestore DELETE error:", error);
    return false;
  }
}
export function subscribeToListings(
  callback: (listings: FoodListing[]) => void
) {
  const q = query(
    collection(db, COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const listings = snapshot.docs.map((d) =>
      mapDocToListing(d.id, d.data())
    );

    callback(listings);
  });
}