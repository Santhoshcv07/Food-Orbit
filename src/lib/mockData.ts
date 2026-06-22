// src/lib/mockData.ts
import { FoodListing, ImpactMetrics } from './types';

export const initialMetrics: ImpactMetrics = {
  totalRescuedKg: 1420,
  mealsProvided: 3550,
  co2SavedKg: 355,
  activeListingsCount: 4,
};

export const initialListings: FoodListing[] = [
  {
    id: 'listing-1',
    title: 'Gourmet Wedding Banquet Surplus',
    description: 'Pristine roasted vegetables, premium herb rice, and unserved artisanal bread rolls kept in hot chafing dishes.',
    quantity: '65 kg (approx. 150 meals)',
    foodType: 'Cooked Food',
    tier: 1, // Tier 1: Human Consumption
    status: 'available',
    expiryTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    latitude: 12.9716,
    longitude: 77.5946,
    address: 'Grand Horizon Ballroom, Sector 4, Downtown',
    organizerId: 'org-1',
    organizerName: 'Starlight Event Management',
    organizerPhone: '+1 (555) 234-5678',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'listing-2',
    title: 'Unseasoned Organic Vegetable Trimmings',
    description: 'Clean carrot tops, broccoli stalks, and unseasoned boiled corn cobs from a massive corporate gala prep kitchen.',
    quantity: '120 kg',
    foodType: 'Fresh Produce / Raw',
    tier: 2, // Tier 2: Animal Feed
    status: 'available',
    expiryTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    latitude: 12.9850,
    longitude: 77.6000,
    address: 'TechPark Convention Center, Gate B Loading Dock',
    organizerId: 'org-2',
    organizerName: 'GreenLeaf Corporate Services',
    organizerPhone: '+1 (555) 987-6543',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'listing-3',
    title: 'Overripe Fruit & Pastry Scraps',
    description: 'Mixed fruit salad scraps and bruised bakery items no longer suitable for human consumption or livestock feed.',
    quantity: '45 kg',
    foodType: 'Bakery & Organic',
    tier: 3, // Tier 3: Composting
    status: 'available',
    expiryTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    latitude: 12.9500,
    longitude: 77.5800,
    address: 'Lakeside Country Club, Kitchen Waste Terminal',
    organizerId: 'org-3',
    organizerName: 'Lakeside Catering',
    organizerPhone: '+1 (555) 333-4444',
    createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'listing-4',
    title: 'Freshly Baked Sourdough & Bagels',
    description: 'Surplus morning breakfast pastries and uncut sourdough loaves from a medical symposium.',
    quantity: '25 kg (approx. 60 meals)',
    foodType: 'Bakery',
    tier: 1, // Tier 1: Human Consumption
    status: 'available',
    expiryTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    latitude: 12.9620,
    longitude: 77.6100,
    address: 'Metro Grand Hotel, Banquet Entrance',
    organizerId: 'org-4',
    organizerName: 'Sunrise Hospitality',
    organizerPhone: '+1 (555) 888-9999',
    createdAt: new Date().toISOString(),
  }
];