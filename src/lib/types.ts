// src/lib/types.ts

export type UserRole = 'organizer' | 'ngo' | 'farmer' | 'compost';

export type RescueTier = 1 | 2 | 3; // 1: Human Consumption, 2: Animal Feed, 3: Composting

export type ListingStatus = 'available' | 'claimed' | 'expired';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationName?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
}

export interface FoodListing {
  id: string;
  title: string;
  description: string;
  quantity: string; // e.g., "50 kg" or "30 meals"
  foodType: string; // e.g., "Cooked Food", "Fresh Produce", "Bakery"
  tier: RescueTier;
  status: ListingStatus;
  expiryTime: string; // ISO Date string
  latitude: number;
  longitude: number;
  address: string;
  organizerId: string;
  organizerName?: string;
  organizerPhone?: string;
  claimedById?: string;
  claimedByName?: string;
  claimedAt?: string;
  imageUrl?: string;
  createdAt: string;
  distKm?: number | null;
  travelTimeMins?: number | null;
}

export interface ImpactMetrics {
  totalRescuedKg: number;
  mealsProvided: number;
  co2SavedKg: number;
  activeListingsCount: number;
}

export interface EscalationLog {
  id: string;
  listingId: string;
  listingTitle: string;
  previousTier: RescueTier;
  newTier: RescueTier | 'expired';
  reason: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'CLAIM' | 'DELETE' | 'ESCALATE';
  entityType: 'LISTING';
  entityId: string;
  entityName: string;
  actorId: string | 'SYSTEM';
  actorName: string;
  details: string;
  createdAt: string;
}