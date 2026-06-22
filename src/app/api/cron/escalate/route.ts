// src/app/api/cron/escalate/route.ts
import { NextResponse } from 'next/server';
import { collection, getDocs, updateDoc, doc, addDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FoodListing, RescueTier } from '@/lib/types';

export async function GET() {
  try {
    const q = query(collection(db, 'food_listings'), where('status', '==', 'available'));
    const snapshot = await getDocs(q);

    const now = new Date().getTime();
    let escalatedCount = 0;

    for (const document of snapshot.docs) {
      const data = document.data() as FoodListing;
      const expiryTime = new Date(data.expiryTime).getTime();

      if (now > expiryTime) {
        // Needs escalation
        let nextTier: RescueTier | 'expired' = 'expired';
        let status = 'available';

        if (data.tier === 1) nextTier = 2;
        else if (data.tier === 2) nextTier = 3;
        else {
          nextTier = 'expired';
          status = 'expired';
        }

        const docRef = doc(db, 'food_listings', document.id);
        
        // Setup new expiry time for the next tier (e.g. +5 hours)
        const newExpiryTime = new Date(now + 5 * 60 * 60 * 1000).toISOString();

        await updateDoc(docRef, {
          tier: nextTier === 'expired' ? data.tier : nextTier,
          status: status,
          expiryTime: nextTier === 'expired' ? data.expiryTime : newExpiryTime
        });

        // Log escalation
        await addDoc(collection(db, 'escalation_logs'), {
          listingId: document.id,
          listingTitle: data.title,
          previousTier: data.tier,
          newTier: nextTier,
          reason: `Auto-escalated due to expiration threshold reached.`,
          createdAt: new Date().toISOString()
        });

        escalatedCount++;
      }
    }

    return NextResponse.json({ success: true, escalatedCount });
  } catch (error: unknown) {
    if (error instanceof Error) console.error("Escalation Cron Error:", error.message);
    return NextResponse.json({ success: false, error: "Failed to process escalations" }, { status: 500 });
  }
}
