// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HeartHandshake,
  Tractor,
  Recycle,
  Clock,
  MapPin,
  Plus,
  FastForward,
  Sparkles,
  CheckCircle2,
  Phone,
  BarChart3,
  Map as MapIcon,
  Layers,
  Trash2,
  Loader2,
  UserCheck,
  UserCircle,
  LogOut,
  Lock,
  ChevronDown,
  DollarSign,
  Search,
  Wheat,
  Leaf,
  Users,
  UtensilsCrossed,
  Wind,
  Activity,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FoodListing, UserProfile, EscalationLog, AuditLog } from '@/lib/types';
import { initialMetrics } from '@/lib/mockData';
import { NewListingDialog } from '@/components/NewListingDialog';
import { AuthModal } from '@/components/AuthModal';
import { FoodCard } from '@/components/FoodCard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { ProfileHub } from '@/components/ProfileHub';
import { Leaderboard } from '@/components/Leaderboard';
import { NotificationCenter } from '@/components/NotificationCenter';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
// Notice we import subscribeToListings and escalateListingTierInDb
import { saveNewListing, claimListingInDb, deleteListingInDb, subscribeToListings, escalateListingTierInDb, subscribeToEscalationLogs, subscribeToAuditLogs } from '@/lib/db';
import { auth } from '@/lib/firebase';
import { signOut, getUserProfile } from '@/lib/auth';
import { onAuthStateChanged } from 'firebase/auth';
import * as turf from '@turf/turf';

// SENIOR DEV FIX: Dynamically import Leaflet map to preserve static build stability
const DynamicFoodMap = dynamic(() => import('@/components/FoodMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-500 font-mono text-xs">
      <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      <span>Calibrating Live GPS Satellite Telemetry...</span>
    </div>
  )
});

const CountdownTimer = ({ expiryTime, status }: { expiryTime: string, status: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (status !== 'available') {
      setTimeLeft(status === 'claimed' ? 'Claimed' : 'Expired');
      return;
    }
    const update = () => {
      const diff = new Date(expiryTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Escalating...');
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiryTime, status]);

  return <span className="font-mono">{timeLeft}</span>;
};

export default function DashboardPage() {
  // ================= STATE MANAGEMENT =================
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [activeTab, setActiveTab] = useState<'listings' | 'analytics' | 'map' | 'profile' | 'leaderboard'>('listings');
  const [selectedTierFilter, setSelectedTierFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [escalationLogs, setEscalationLogs] = useState<EscalationLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNewListingModalOpen, setIsNewListingModalOpen] = useState(false);

  const [aiInsight, setAiInsight] = useState<string>("Requesting secure AI telemetry from backend route...");
  const [isAiLoading, setIsAiLoading] = useState(true);

  // ================= LIFECYCLE EFFECTS =================

  // 0. Geolocation Listener
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // 1. Authentication Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile) setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 0.5 Escalation Logs Listener
  useEffect(() => {
    const unsub = subscribeToEscalationLogs(setEscalationLogs, 5);
    return () => unsub();
  }, []);

  // 0.6 Audit Logs Listener
  useEffect(() => {
    const unsub = subscribeToAuditLogs(setAuditLogs, 20);
    return () => unsub();
  }, []);

  // 🚀 STEP 2: REAL-TIME FIRESTORE LISTENER (Replaces one-time manual loader)
  useEffect(() => {

    const unsubscribe = subscribeToListings((liveItems) => {
      setListings(liveItems);
      setIsLoadingDb(false);
    });

    // Automatically close the WebSocket stream when the user leaves the page
    return () => unsubscribe();
  }, []);

  // 3. Reactive Metrics Recalculator
  // Whenever the WebSockets stream pushes new listings, instantly recalculate the math
  useEffect(() => {
    if (listings.length === 0 && isLoadingDb) return;
    const totalKg = listings.reduce((sum, item) => sum + (parseInt(item.quantity) || 45), 0);
    setTimeout(() => {
      setMetrics({
        totalRescuedKg: totalKg,
        mealsProvided: Math.round(totalKg * 2.5),
        co2SavedKg: Math.round(totalKg * 0.25),
        activeListingsCount: listings.filter(l => l.status === 'available').length,
      });
    }, 0);
  }, [listings, isLoadingDb]);

  // 4. Server AI Route Trigger (/api/ai)
  useEffect(() => {
    if (listings.length === 0) return;
    async function fetchAiFromServerRoute() {
      setIsAiLoading(true);
      try {
        const activeCount = listings.filter(l => l.status === 'available').length;
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activeCount, totalKg: metrics.totalRescuedKg }),
        });
        if (!response.ok) throw new Error("Backend route failure");
        const data = await response.json();
        setAiInsight(data.summary);
      } catch {
        setAiInsight("AI Impact module is operating in secure offline cache mode. Keep rescuing!");
      } finally {
        setIsAiLoading(false);
      }
    }
    fetchAiFromServerRoute();
  }, [listings, metrics.totalRescuedKg]);

  // ================= ROLE-BASED ACCESS GATEKEEPERS =================

  const handleOpenNewListing = () => {
    if (!currentUser) {
      toast.error("Authorization Required", { description: "Please sign in to broadcast event food surplus." });
      setIsAuthModalOpen(true);
      return;
    }
    if (currentUser.role !== 'organizer') {
      toast.error("Access Denied", { description: "Only verified Event Organizers can broadcast new surplus batches." });
      return;
    }
    setIsNewListingModalOpen(true);
  };

  const canClaimTier = (tier: number): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'organizer') return false;
    if (tier === 1 && currentUser.role === 'ngo') return true;
    if (tier === 2 && currentUser.role === 'farmer') return true;
    if (tier === 3 && currentUser.role === 'compost') return true;
    return false;
  };

  // ================= REAL-TIME ACTION HANDLERS =================

  // Action: Broadcast new batch to Firestore
  const handleAddListing = async (newEntry: FoodListing) => {
    const saved = await saveNewListing({ ...newEntry, organizerId: currentUser?.id, organizerName: currentUser?.name });
    if (saved) {
      toast.success("Surplus Broadcasted!", { description: "Your batch is now live on the network." });
    }
  };

  // Action: Claim a food batch
  const handleClaim = async (id: string, tier: number) => {
    if (!currentUser) {
      toast.error("Authorization Required", { description: "Please sign in to claim surplus batches." });
      setIsAuthModalOpen(true);
      return;
    }
    // Check strictly enforced role boundaries
    if (tier === 1 && currentUser.role !== 'ngo') {
      toast.error("Access Denied", { description: "Tier 1 (Human) batches can only be claimed by verified Partner NGOs." });
      return;
    }
    if (tier === 2 && currentUser.role !== 'farmer') {
      toast.error("Access Denied", { description: "Tier 2 (Animal Feed) batches can only be claimed by Agricultural Farmers." });
      return;
    }
    if (tier === 3 && currentUser.role !== 'compost') {
      toast.error("Access Denied", { description: "Tier 3 (Bio-Waste) batches can only be claimed by Compost Agencies." });
      return;
    }

    try {
      await claimListingInDb(id, tier, currentUser);
      toast.success("Batch Claimed Successfully!", { description: "Navigation coordinates and manifest sent to your dispatch." });
    } catch (error: any) {
      toast.error("Claim Failed", { description: error.message || "An error occurred while claiming." });
    }
  };


  // Action: Delete batch permanently
  const handleDelete = async (id: string) => {
    if (window.confirm("SECURITY: Are you sure you want to permanently delete this listing?")) {
      await deleteListingInDb(id);
      toast.success("Listing Deleted", { description: "The database row was securely removed." });
    }
  };

  // Action: Shift all available food to the next rescue tier across the global cloud network
  const handleSimulateEscalation = async () => {
    const availableBatches = listings.filter(l => l.status === 'available');
    if (availableBatches.length === 0) {
      alert("No available batches to escalate!");
      return;
    }

    setIsLoadingDb(true);
    for (const item of availableBatches) {
      await escalateListingTierInDb(item.id, item.tier);
    }
    setIsLoadingDb(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out securely");
    setActiveTab('listings');
  };

  const enhancedListings = listings.map(item => {
    let distKm: number | null = null;
    let travelTimeMins: number | null = null;
    if (userLocation && item.latitude && item.longitude) {
      const from = turf.point([userLocation.lng, userLocation.lat]);
      const to = turf.point([item.longitude, item.latitude]);
      distKm = turf.distance(from, to, { units: 'kilometers' });
      travelTimeMins = Math.round((distKm / 30) * 60);
    }
    return { ...item, distKm, travelTimeMins };
  });

  const filteredListings = enhancedListings
    .filter(item => selectedTierFilter === 'all' ? true : item.tier === selectedTierFilter)
    .filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.organizerName && item.organizerName.toLowerCase().includes(q)) ||
        (item.address && item.address.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (a.distKm !== null && b.distKm !== null && a.distKm !== undefined && b.distKm !== undefined) {
        return a.distKm - b.distKm;
      }
      return 0;
    });

  // ================= ROLE-BASED DASHBOARD PERSONALIZATION RENDERER =================
  const renderPersonalizedMetrics = () => {
    if (!currentUser) return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <motion.div className="glass-panel rounded-2xl p-4 sm:p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-emerald-950/30 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <HeartHandshake className="absolute top-4 right-4 h-8 w-8 text-emerald-500/10 pointer-events-none group-hover:text-emerald-500/20 transition-colors" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1 relative z-10">Network Rescued</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-white relative z-10">
              <AnimatedCounter value={metrics.totalRescuedKg} /> <span className="text-sm font-normal text-emerald-400">kg</span>
            </span>
          </motion.div>
          <motion.div className="glass-panel rounded-2xl p-4 sm:p-6 group">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 relative z-10">Est. Meals Provided</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-emerald-400 relative z-10">
              <AnimatedCounter value={Math.round(metrics.totalRescuedKg * 2.5)} />
            </span>
          </motion.div>
          <motion.div className="glass-panel rounded-2xl p-4 sm:p-6 group">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 relative z-10">Methane CO2 Diverted</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-blue-400 relative z-10">
              <AnimatedCounter value={Math.round(metrics.totalRescuedKg * 0.25)} /> <span className="text-sm font-normal text-slate-400">kg</span>
            </span>
          </motion.div>
          <motion.div className="glass-panel rounded-2xl p-4 sm:p-6 group">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 relative z-10">Active Hub Batches</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-amber-400 relative z-10">
              <AnimatedCounter value={metrics.activeListingsCount} />
            </span>
          </motion.div>
        </motion.div>
      );

    if (currentUser.role === 'organizer') {
      const myDonations = listings.filter(l => l.organizerId === currentUser.id || l.organizerName === currentUser.organizationName);
      const myKg = myDonations.reduce((sum, i) => sum + (parseInt(i.quantity) || 50), 0);
      const estTaxReceipt = Math.round(myKg * 3.5);
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <motion.div className="glass-panel rounded-2xl p-5 sm:p-7 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-amber-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <HeartHandshake className="absolute top-4 right-4 h-8 w-8 text-amber-500/10 pointer-events-none group-hover:text-amber-500/20 transition-colors" />
            <span className="text-[10px] font-extrabold text-amber-500/80 uppercase tracking-widest block mb-1.5 relative z-10 drop-shadow-md">My Impact: Rescued</span>
            <span className="text-3xl sm:text-5xl font-extrabold text-white relative z-10 tracking-tight">
              <AnimatedCounter value={myKg || metrics.totalRescuedKg} /> <span className="text-base font-bold text-amber-400 tracking-normal">kg</span>
            </span>
          </motion.div>
          <motion.div className="glass-panel rounded-2xl p-5 sm:p-7 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-emerald-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <DollarSign className="absolute top-4 right-4 h-8 w-8 text-emerald-500/10 pointer-events-none group-hover:text-emerald-500/20 transition-colors" />
            <span className="text-[10px] font-extrabold text-emerald-500/80 uppercase tracking-widest block mb-1.5 relative z-10 drop-shadow-md">Est. Tax Receipt Value</span>
            <span className="text-3xl sm:text-5xl font-extrabold text-emerald-400 relative z-10 tracking-tight">
              $<AnimatedCounter value={estTaxReceipt || 1250} />
            </span>
          </motion.div>
          <motion.div className="glass-panel rounded-2xl p-5 sm:p-7 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-blue-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="text-[10px] font-extrabold text-blue-500/80 uppercase tracking-widest block mb-1.5 relative z-10 drop-shadow-md">My Carbon Offset</span>
            <span className="text-3xl sm:text-5xl font-extrabold text-blue-400 relative z-10 tracking-tight">
              <AnimatedCounter value={Math.round((myKg || metrics.totalRescuedKg) * 0.25)} /> <span className="text-base font-bold text-slate-400 tracking-normal">kg</span>
            </span>
          </motion.div>
          <motion.div className="glass-panel rounded-2xl p-5 sm:p-7 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-amber-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4 flex items-center justify-center">
              <span className="flex h-3 w-3 rounded-full bg-amber-500 opacity-20 absolute" />
              <span className="flex h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse relative" />
            </div>
            <span className="text-[10px] font-extrabold text-amber-500/80 uppercase tracking-widest block mb-1.5 relative z-10 drop-shadow-md">Active Event Batches</span>
            <span className="text-3xl sm:text-5xl font-extrabold text-amber-400 relative z-10 tracking-tight drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              <AnimatedCounter value={myDonations.filter(l => l.status === 'available').length || 1} />
            </span>
          </motion.div>
        </motion.div>
      );
    }

    if (currentUser.role === 'ngo') {
      const tier1Listings = listings.filter(l => l.tier === 1);
      const tier1Kg = tier1Listings.reduce((sum, i) => sum + (parseInt(i.quantity) || 50), 0);
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <motion.div className="glass-panel rounded-2xl p-4 sm:p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-emerald-950/30 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <HeartHandshake className="absolute top-4 right-4 h-8 w-8 text-emerald-500/10 pointer-events-none group-hover:text-emerald-500/20 transition-colors" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1 relative z-10">Tier 1 Human Food</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-white relative z-10">
              <AnimatedCounter value={tier1Kg || 650} /> <span className="text-sm font-normal text-emerald-400">kg</span>
            </span>
          </motion.div>
          <motion.div className="glass-panel rounded-2xl p-4 sm:p-6 group">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1 relative z-10"><Users className="h-3 w-3 text-emerald-400" /> Hot Meals Estimate</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-emerald-400 relative z-10">
              <AnimatedCounter value={Math.round((tier1Kg || 650) * 2.5)} />
            </span>
          </motion.div>
          <motion.div className="glass-panel rounded-2xl p-4 sm:p-6 group">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 relative z-10">Est. Methane Prevented</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-blue-400 relative z-10">
              <AnimatedCounter value={Math.round((tier1Kg || 650) * 0.25)} /> <span className="text-sm font-normal text-slate-400">kg</span>
            </span>
          </motion.div>
          <motion.div className="glass-panel rounded-2xl p-4 sm:p-6 group">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 relative z-10">Active Local Batches</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-emerald-400 relative z-10">
              <AnimatedCounter value={tier1Listings.filter(l => l.status === 'available').length || 2} />
            </span>
          </motion.div>
        </motion.div>
      );
    }

    if (currentUser.role === 'farmer') {
      const tier2Listings = listings.filter(l => l.tier === 2);
      const tier2Kg = tier2Listings.reduce((sum, i) => sum + (parseInt(i.quantity) || 120), 0);
      const grainSavings = Math.round(tier2Kg * 1.8);
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <motion.div className="glass-panel rounded-2xl p-4 sm:p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-amber-950/30 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <Tractor className="absolute top-4 right-4 h-8 w-8 text-amber-500/10 pointer-events-none group-hover:text-amber-500/20 transition-colors" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1 relative z-10">Tier 2 Animal Feed</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-white relative z-10">
              <AnimatedCounter value={tier2Kg || 480} /> <span className="text-sm font-normal text-amber-400">kg</span>
            </span>
          </motion.div>
          <motion.div className="glass-panel rounded-2xl p-4 sm:p-6 group">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1 relative z-10"><Wheat className="h-3 w-3 text-amber-400" /> Est. Livestock Fed</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-amber-400 relative z-10">
              <AnimatedCounter value={Math.round((tier2Kg || 480) * 1.5)} /> <span className="text-sm font-normal text-slate-400">Animals</span>
            </span>
          </motion.div>
          <motion.div className="glass-panel rounded-2xl p-4 sm:p-6 group">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 relative z-10">Grain Cost Saved</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-emerald-400 relative z-10">
              $<AnimatedCounter value={grainSavings || 864} />
            </span>
          </motion.div>
          <motion.div className="glass-panel rounded-2xl p-4 sm:p-6 group">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 relative z-10">Active Farm Batches</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-amber-400 relative z-10">
              <AnimatedCounter value={tier2Listings.filter(l => l.status === 'available').length || 1} />
            </span>
          </motion.div>
        </motion.div>
      );
    }

    if (currentUser.role === 'compost') {
      const tier3Listings = listings.filter(l => l.tier === 3);
      const tier3Kg = tier3Listings.reduce((sum, i) => sum + (parseInt(i.quantity) || 45), 0);
      const topsoilGenerated = Math.round(tier3Kg * 0.4);
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <motion.div className="glass-panel rounded-2xl p-4 sm:p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-blue-950/30 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <Recycle className="absolute top-4 right-4 h-8 w-8 text-blue-500/10 pointer-events-none group-hover:text-blue-500/20 transition-colors" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1 relative z-10">Tier 3 Bio-Waste</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-white relative z-10">
              <AnimatedCounter value={tier3Kg || 290} /> <span className="text-sm font-normal text-blue-400">kg</span>
            </span>
          </motion.div>
          <motion.div className="glass-panel rounded-2xl p-4 sm:p-6 group">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1 relative z-10"><Wind className="h-3 w-3 text-blue-400" /> Methane Prevented</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-blue-400 relative z-10">
              <AnimatedCounter value={Math.round((tier3Kg || 290) * 0.25)} /> <span className="text-sm font-normal text-slate-400">kg</span>
            </span>
          </motion.div>
          <motion.div className="glass-panel rounded-2xl p-4 sm:p-6 group">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1 relative z-10"><Leaf className="h-3 w-3 text-emerald-400" /> Rich Topsoil Created</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-emerald-400 relative z-10">
              <AnimatedCounter value={topsoilGenerated || 116} /> <span className="text-sm font-normal text-slate-400">kg</span>
            </span>
          </motion.div>
          <motion.div className="glass-panel rounded-2xl p-4 sm:p-6 group">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 relative z-10">Active Depot Batches</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-blue-400 relative z-10">
              <AnimatedCounter value={tier3Listings.filter(l => l.status === 'available').length || 0} />
            </span>
          </motion.div>
        </motion.div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">

      {/* ================= UNIFIED ENTERPRISE HEADER ================= */}
      <div className="border-b border-white/5 bg-slate-900/80 sticky top-0 z-50 backdrop-blur-2xl">
        {/* TOP LAYER: GLOBAL HEADER */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between border-b border-white/5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-white leading-tight">
                Food<span className="text-amber-500">Orbit</span>
              </span>
              <span className="text-[8px] font-bold tracking-widest text-emerald-400 uppercase leading-tight opacity-80">
                Live Network
              </span>
            </div>
          </Link>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <NotificationCenter auditLogs={auditLogs} escalationLogs={escalationLogs} />
            
            {currentUser ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent hover:border-white/5 hover:bg-slate-800/50 transition-all text-xs font-bold text-slate-300 hover:text-white">
                  <span className="bg-slate-800 p-1 rounded-md text-slate-400"><UserCheck className="h-3 w-3" /></span>
                  {currentUser.name} <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 z-50 overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-white/5 bg-slate-950/50">
                    <span className="block text-xs font-extrabold text-white truncate">{currentUser.name}</span>
                    <span className="text-[9px] font-bold tracking-widest text-amber-400 uppercase mt-0.5 block truncate">{currentUser.role}</span>
                  </div>
                  <div className="p-1">
                    <button onClick={() => setActiveTab('profile')} className="w-full text-left px-3 py-2 text-[11px] font-bold tracking-wide text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg flex items-center gap-2 transition-colors">
                      <UserCircle className="h-3.5 w-3.5" /> Profile Settings
                    </button>
                    <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-[11px] font-bold tracking-wide text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 transition-colors">
                      <LogOut className="h-3.5 w-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-extrabold transition-all shadow-sm">
                <Lock className="h-3 w-3" /> Sign In
              </button>
            )}
          </div>
        </div>

        {/* BOTTOM LAYER: SUBNAV & ACTIONS */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center h-full gap-2 sm:gap-6">
            <button
              onClick={() => setActiveTab('listings')}
              className={`relative h-full text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase transition-colors flex items-center ${activeTab === 'listings' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Live Feed
              {activeTab === 'listings' && <motion.div layoutId="subnav-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t-full shadow-[0_-2px_10px_rgba(245,158,11,0.5)]" />}
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`relative h-full text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase transition-colors flex items-center gap-1.5 ${activeTab === 'map' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <MapIcon className="h-3 w-3 hidden sm:inline" /> Map
              {activeTab === 'map' && <motion.div layoutId="subnav-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t-full shadow-[0_-2px_10px_rgba(245,158,11,0.5)]" />}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`relative h-full text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase transition-colors flex items-center ${activeTab === 'analytics' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Analytics
              {activeTab === 'analytics' && <motion.div layoutId="subnav-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t-full shadow-[0_-2px_10px_rgba(245,158,11,0.5)]" />}
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`relative h-full text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase transition-colors flex items-center ${activeTab === 'leaderboard' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Leaderboard
              {activeTab === 'leaderboard' && <motion.div layoutId="subnav-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t-full shadow-[0_-2px_10px_rgba(245,158,11,0.5)]" />}
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold shadow-inner uppercase tracking-wider hidden lg:flex" title="Live WebSockets connected">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              Live Sync
            </div>
            <button onClick={handleSimulateEscalation} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-transparent hover:border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-[10px] uppercase tracking-wider font-bold transition-all duration-300 hidden md:flex" title="Trigger Escallation">
              <FastForward className="h-3 w-3" /> Force Escalate
            </button>
            {currentUser?.role === 'organizer' && (
              <button onClick={handleOpenNewListing} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-[10px] sm:text-[11px] uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Plus className="h-3 w-3" /> Broadcast
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= MAIN DASHBOARD CONTAINER ================= */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-8">

        {isLoadingDb ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8 px-4">
              <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
              <span className="text-slate-400 font-mono text-sm">Syncing with Firestore WebSockets cluster...</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 h-64 animate-pulse flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="h-6 bg-slate-800/80 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-800/60 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-800/60 rounded w-5/6"></div>
                  </div>
                  <div className="h-10 bg-slate-800/50 rounded w-full mt-4"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {renderPersonalizedMetrics()}

            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
              className="mb-8 group relative rounded-2xl p-[1px] overflow-hidden"
            >
              {/* Neural Network Pulse Background */}
              <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-1000" style={{
                backgroundImage: 'radial-gradient(circle at 10% 50%, rgba(16, 185, 129, 0.4) 0%, transparent 40%), radial-gradient(circle at 90% 50%, rgba(245, 158, 11, 0.4) 0%, transparent 40%)',
                backgroundSize: '200% 200%',
                animation: 'pulse-ring 8s infinite alternate'
              }}></div>
              
              <div className="relative z-10 glass-panel rounded-2xl p-4 sm:p-5 flex items-center gap-4 overflow-hidden shadow-sm backdrop-blur-xl bg-slate-900/40 border border-white/5">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-amber-500 rounded-xl blur-md opacity-20 animate-pulse"></div>
                  <div className="relative p-2.5 bg-slate-950 border border-white/10 text-amber-400 rounded-xl shadow-lg">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400 uppercase tracking-widest drop-shadow-sm">
                      GROQ AI ANALYTICS CORE
                    </h4>
                    {isAiLoading ? (
                      <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full animate-pulse font-mono tracking-widest flex items-center gap-1">
                        PROCESSING
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full tracking-widest uppercase shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <p className="text-sm text-slate-300 leading-snug font-medium line-clamp-2 pr-4">
                      {aiInsight.replace(/[\*#]/g, '').replace(/[-]\s/g, '').split('. ').slice(0, 3).join('. ') + (aiInsight.split('. ').length > 3 ? '.' : '')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {escalationLogs.length > 0 && (
              <div className="mb-8 bg-slate-900/60 border border-slate-800 rounded-xl p-4 overflow-hidden relative shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live Auto-Escalation Ticker</h4>
                </div>
                <div className="space-y-2">
                  {escalationLogs.map(log => (
                    <div key={log.id} className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="text-slate-500 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      <span className="text-white font-medium">{log.listingTitle}</span>
                      <span>shifted to</span>
                      <span className={log.newTier === 2 ? 'text-amber-400 font-bold' : log.newTier === 3 ? 'text-blue-400 font-bold' : 'text-rose-400 font-bold'}>
                        {log.newTier === 'expired' ? 'Expired' : `Tier ${log.newTier}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row items-center gap-4 bg-slate-900/60 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-white/5 shadow-lg group">
                  <div className="flex items-center w-full lg:w-1/3 relative transition-all duration-300 focus-within:scale-[1.01] focus-within:shadow-[0_0_15px_rgba(245,158,11,0.15)] rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search batches, organizations, locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-500 shadow-inner"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 w-full lg:w-auto lg:ml-auto">
                    <span className="hidden sm:inline-block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest self-center mr-2">Filter:</span>
                    <button onClick={() => setSelectedTierFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${selectedTierFilter === 'all' ? 'bg-slate-800 text-white shadow-md border border-white/10' : 'bg-slate-950/50 text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/5'}`}>All ({listings.length})</button>
                    <button onClick={() => setSelectedTierFilter(1)} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${selectedTierFilter === 1 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]' : 'bg-slate-950/50 text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20'}`}><HeartHandshake className="h-3.5 w-3.5" /> Tier 1</button>
                    <button onClick={() => setSelectedTierFilter(2)} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${selectedTierFilter === 2 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]' : 'bg-slate-950/50 text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20'}`}><Tractor className="h-3.5 w-3.5" /> Tier 2</button>
                    <button onClick={() => setSelectedTierFilter(3)} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${selectedTierFilter === 3 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]' : 'bg-slate-950/50 text-blue-500/70 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20'}`}><Recycle className="h-3.5 w-3.5" /> Tier 3</button>
                  </div>
                </div>

                {filteredListings.length === 0 && !isLoadingDb ? (
                  <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl">
                    <Search className="h-10 w-10 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-300">No matching batches found</h3>
                    <p className="text-slate-500 text-sm mt-1">Try adjusting your search filters or workflow stage.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredListings.map(item => (
                      <FoodCard key={item.id} item={item} onClaim={handleClaim} onDelete={handleDelete} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <AnalyticsDashboard listings={listings} metrics={metrics} auditLogs={auditLogs} />
            )}

            {activeTab === 'map' && (
              <div className="space-y-4">
                <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Live Satellite Telemetry Hub</span>
                  </div>
                  <span className="text-xs text-slate-400">Click any colored pin on the map to dispatch claim coordinates</span>
                </div>
                <DynamicFoodMap listings={enhancedListings} onClaim={handleClaim} userLocation={userLocation} />
              </div>
            )}

            {activeTab === 'profile' && currentUser && (
              <ProfileHub currentUser={currentUser} listings={listings} handleSignOut={handleSignOut} />
            )}

            {activeTab === 'leaderboard' && (
              <Leaderboard listings={listings} />
            )}
          </>
        )}
      </div>
      {/* ================= MODALS ================= */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={(profile) => setCurrentUser(profile)} />
      <NewListingDialog isOpen={isNewListingModalOpen} onClose={() => setIsNewListingModalOpen(false)} onAddListing={handleAddListing} currentUser={currentUser} />
    </div>
  );
}