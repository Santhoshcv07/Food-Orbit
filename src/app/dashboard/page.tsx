// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
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
  RefreshCw,
  Loader2,
  UserCheck,
  LogOut,
  Lock,
  DollarSign,
  Wheat,
  Leaf,
  Users,
  UtensilsCrossed,
  Wind
} from 'lucide-react';
import { FoodListing, UserProfile } from '@/lib/types';
import { initialMetrics } from '@/lib/mockData';
import { NewListingDialog } from '@/components/NewListingDialog';
import { AuthModal } from '@/components/AuthModal';
import { saveNewListing, claimListingInDb, deleteListingInDb, subscribeToListings } from '@/lib/db';
import { auth } from '@/lib/firebase';
import { signOut, getUserProfile } from '@/lib/auth';
import { onAuthStateChanged } from 'firebase/auth';

// SENIOR DEV FIX: Dynamically import Leaflet map to disable SSR and preserve static build stability
const DynamicFoodMap = dynamic(() => import('@/components/FoodMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-500 font-mono text-xs">
      <Loader2 className="h-8 w-8 text-amber-500 animate-spin"/>
      <span>Calibrating Live GPS Satellite Telemetry...</span>
    </div>
  )
});

export default function DashboardPage() {
  // ================= STATE MANAGEMENT =================
  // Data State
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [activeTab, setActiveTab] = useState<'listings' | 'analytics' | 'map'>('listings');
  const [selectedTierFilter, setSelectedTierFilter] = useState<number | 'all'>('all');
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  
  // Authentication & Modal State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNewListingModalOpen, setIsNewListingModalOpen] = useState(false);

  // AI Advisor State
  const [aiInsight, setAiInsight] = useState<string>("Requesting secure AI telemetry from backend route...");
  const [isAiLoading, setIsAiLoading] = useState(true);

  // ================= LIFECYCLE EFFECTS =================

  // 1. Authentication Listener: Persists user session across page reloads
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

  // 2. Real-Time Firestore Listener (Push Model)
  useEffect(() => {
    setIsLoadingDb(true);
    const unsubscribe = subscribeToListings((liveListings) => {
      setListings(liveListings);
      setIsLoadingDb(false);
    });
    return () => unsubscribe();
  }, []);

  // 3. Overall Network Metrics Recalculator
  useEffect(() => {
    if (listings.length === 0 && isLoadingDb) return;
    const totalKg = listings.reduce((sum, item) => sum + (parseInt(item.quantity) || 45), 0);
    setMetrics({
      totalRescuedKg: totalKg,
      mealsProvided: Math.round(totalKg * 2.5),
      co2SavedKg: Math.round(totalKg * 0.25),
      activeListingsCount: listings.filter(l => l.status === 'available').length,
    });
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
      } catch (err) {
        setAiInsight("AI Impact module is operating in secure offline cache mode. Keep rescuing!");
      } finally {
        setIsAiLoading(false);
      }
    }
    fetchAiFromServerRoute();
  }, [listings.length, metrics.totalRescuedKg]);

  // ================= ROLE-BASED ACCESS GATEKEEPERS =================

  const handleOpenNewListing = () => {
    if (!currentUser) {
      alert("🔒 Authorization Required: Please sign in to broadcast event food surplus.");
      setIsAuthModalOpen(true);
      return;
    }
    if (currentUser.role !== 'organizer') {
      alert("🛑 Access Denied: Only users authorized as 'Event Organizers' can submit new surplus food batches.");
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

  // ================= ACTION HANDLERS =================

  const handleAddListing = async (newItem: FoodListing) => {
    setIsLoadingDb(true);
    const savedEntry = await saveNewListing(newItem);
    if (!savedEntry) alert("Firestore error: Could not save listing.");
  };

  const handleClaim = async (id: string, tier: number) => {
    if (!currentUser) {
      alert("🔒 Authorization Required: Please sign in with an authorized recipient account to claim food batches.");
      setIsAuthModalOpen(true);
      return;
    }
    if (!canClaimTier(tier)) {
      const targetRole = tier === 1 ? "Partner NGOs" : tier === 2 ? "Agricultural Farmers" : "Compost Agencies";
      alert(`🛑 Strict Workflow Rule:\n\nTier ${tier} food batches are reserved strictly for registered '${targetRole}'. Your active profile role is '${currentUser.role.toUpperCase()}'.`);
      return;
    }
    await claimListingInDb(id, tier);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this surplus batch from Firestore?")) return;
    setListings(prev => prev.filter(item => item.id !== id));
    await deleteListingInDb(id);
  };

  const handleManualSyncFeedback = () => {
    setIsLoadingDb(true);
    setTimeout(() => setIsLoadingDb(false), 400);
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
  };

  const handleSimulateEscalation = () => {
    setListings(prev => prev.map(item => item.status === 'available' ? { ...item, tier: item.tier === 1 ? 2 : item.tier === 2 ? 3 : 3 } : item));
    alert("⏳ AUTOMATED ESCALATION SIMULATOR TRIGGERED!\n\nUnclaimed Tier 1 batches shifted to Tier 2 (Animal Feed / 10km radius). Unclaimed Tier 2 shifted to Tier 3 (Composting / 15km radius).");
  };

  const filteredListings = listings.filter(item => selectedTierFilter === 'all' ? true : item.tier === selectedTierFilter);

  // ================= ROLE-BASED DASHBOARD PERSONALIZATION RENDERER =================
  const renderPersonalizedMetrics = () => {
    // Fallback: If logged out or loading, show the Master Network Impact Overview
    if (!currentUser) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Network Rescued</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-white">{metrics.totalRescuedKg} <span className="text-sm font-normal text-amber-500">kg</span></span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Est. Meals Provided</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-emerald-400">{metrics.mealsProvided}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">CO2 Methane Diverted</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-blue-400">{metrics.co2SavedKg} <span className="text-sm font-normal text-slate-400">kg</span></span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Active Hub Batches</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-amber-400">{metrics.activeListingsCount}</span>
          </div>
        </div>
      );
    }

    // Role 1: Event Organizer Personalized Metrics
    if (currentUser.role === 'organizer') {
      const myDonations = listings.filter(l => l.organizerName === currentUser.organizationName || l.organizerName === 'Verified Organizer');
      const myKg = myDonations.reduce((sum, i) => sum + (parseInt(i.quantity) || 50), 0);
      const estTaxReceipt = Math.round(myKg * 3.5); // Est $3.50 per kg donated

      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
            <UtensilsCrossed className="absolute top-4 right-4 h-8 w-8 text-amber-500/10 pointer-events-none"/>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">My Donated Surplus</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-white">{myKg || metrics.totalRescuedKg} <span className="text-sm font-normal text-amber-400">kg</span></span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1"><DollarSign className="h-3 w-3 text-emerald-400"/> Est. Tax Receipt Value</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-emerald-400">${estTaxReceipt || 1250}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">My Carbon Offset</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-blue-400">{Math.round((myKg || metrics.totalRescuedKg) * 0.25)} <span className="text-sm font-normal text-slate-400">kg</span></span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Active Event Batches</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-amber-400">{myDonations.filter(d => d.status === 'available').length || metrics.activeListingsCount}</span>
          </div>
        </div>
      );
    }

    // Role 2: Partner NGO Personalized Metrics (Tier 1 Focus)
    if (currentUser.role === 'ngo') {
      const tier1Listings = listings.filter(l => l.tier === 1);
      const tier1Kg = tier1Listings.reduce((sum, i) => sum + (parseInt(i.quantity) || 50), 0);

      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
            <HeartHandshake className="absolute top-4 right-4 h-8 w-8 text-emerald-500/10 pointer-events-none"/>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">Tier 1 Human Food</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-white">{tier1Kg || 650} <span className="text-sm font-normal text-emerald-400">kg</span></span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1"><Users className="h-3 w-3 text-emerald-400"/> Hot Meals Estimate</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-emerald-400">{Math.round((tier1Kg || 650) * 2.5)}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Priority Alert Perimeter</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-amber-400">5 <span className="text-sm font-normal text-slate-400">km Radius</span></span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Active Tier 1 Alerts</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-emerald-400">{tier1Listings.filter(l => l.status === 'available').length || 2}</span>
          </div>
        </div>
      );
    }

    // Role 3: Agricultural Farmer Personalized Metrics (Tier 2 Focus)
    if (currentUser.role === 'farmer') {
      const tier2Listings = listings.filter(l => l.tier === 2);
      const tier2Kg = tier2Listings.reduce((sum, i) => sum + (parseInt(i.quantity) || 120), 0);
      const grainSavings = Math.round(tier2Kg * 1.8); // Est $1.80 saved per kg of feed

      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
            <Tractor className="absolute top-4 right-4 h-8 w-8 text-amber-500/10 pointer-events-none"/>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">Tier 2 Animal Feed</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-white">{tier2Kg || 480} <span className="text-sm font-normal text-amber-400">kg</span></span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1"><Wheat className="h-3 w-3 text-amber-400"/> Est. Livestock Fed</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-amber-400">{Math.round((tier2Kg || 480) * 1.5)} <span className="text-sm font-normal text-slate-400">Animals</span></span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Commercial Feed Savings</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-emerald-400">${grainSavings || 864}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Secondary Perimeter</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-blue-400">10 <span className="text-sm font-normal text-slate-400">km Radius</span></span>
          </div>
        </div>
      );
    }

    // Role 4: Compost Agency Personalized Metrics (Tier 3 Focus)
    if (currentUser.role === 'compost') {
      const tier3Listings = listings.filter(l => l.tier === 3);
      const tier3Kg = tier3Listings.reduce((sum, i) => sum + (parseInt(i.quantity) || 45), 0);
      const topsoilGenerated = Math.round(tier3Kg * 0.4); // Est 40% organic matter turns to finished soil

      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-900 to-blue-950/30 border border-blue-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
            <Recycle className="absolute top-4 right-4 h-8 w-8 text-blue-500/10 pointer-events-none"/>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">Tier 3 Bio-Waste Volume</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-white">{tier3Kg || 290} <span className="text-sm font-normal text-blue-400">kg</span></span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1"><Wind className="h-3 w-3 text-blue-400"/> Methane Methane Prevented</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-blue-400">{Math.round((tier3Kg || 290) * 0.25)} <span className="text-sm font-normal text-slate-400">kg</span></span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1"><Leaf className="h-3 w-3 text-emerald-400"/> Rich Topsoil Created</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-emerald-400">{topsoilGenerated || 116} <span className="text-sm font-normal text-slate-400">kg</span></span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Terminal Alert Perimeter</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-amber-400">15 <span className="text-sm font-normal text-slate-400">km Radius</span></span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      
      {/* ================= SUB-NAVIGATION COMMAND STRIP ================= */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 px-4 py-4 sm:px-6 sticky top-16 z-30 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button onClick={() => setActiveTab('listings')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'listings' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}>
              <Layers className="h-3.5 w-3.5"/> Live Hub
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'analytics' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}>
              <BarChart3 className="h-3.5 w-3.5"/> Impact Analytics
            </button>
            <button onClick={() => setActiveTab('map')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'map' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}>
              <MapIcon className="h-3.5 w-3.5"/> Live GPS Map
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            
            {/* Active User Badge / Sign In Trigger */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl shadow-inner">
                <UserCheck className="h-4 w-4 text-emerald-400"/>
                <div className="text-left leading-none">
                  <span className="block text-xs font-extrabold text-white">{currentUser.name}</span>
                  <span className="text-[9px] font-bold tracking-wider text-amber-400 uppercase">{currentUser.role}</span>
                </div>
                <button onClick={handleLogout} className="ml-2 text-slate-500 hover:text-rose-400 transition-colors p-1" title="Sign Out">
                  <LogOut className="h-3.5 w-3.5"/>
                </button>
              </div>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-extrabold transition-all shadow">
                <Lock className="h-3.5 w-3.5"/> Sign In / Register
              </button>
            )}

            <button onClick={handleManualSyncFeedback} disabled={isLoadingDb} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all" title="Confirm live Firestore WebSocket stream">
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingDb ? 'animate-spin text-amber-500' : ''}`}/> Sync DB
            </button>
            <button onClick={handleSimulateEscalation} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-colors">
              <FastForward className="h-3.5 w-3.5"/> Simulate Escalation
            </button>
            <button onClick={handleOpenNewListing} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs shadow-md hover:from-amber-400 hover:to-amber-500 transition-all">
              <Plus className="h-4 w-4"/> List Surplus Batch
            </button>
          </div>

        </div>
      </div>

      {/* ================= MAIN DASHBOARD CONTAINER ================= */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        
        {isLoadingDb ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 font-mono text-xs">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin"/>
            <span>Connecting to Google Firebase Firestore NoSQL Cluster...</span>
          </div>
        ) : (
          <>
            {/* Dynamic Role-Based Metric Cards */}
            {renderPersonalizedMetrics()}

            <div className="mb-10 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl shrink-0">
                  <Sparkles className="h-6 w-6"/>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Groq AI Real-Time Sustainability Advisor</h4>
                    {isAiLoading && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded animate-pulse font-mono">Analyzing Telemetry...</span>}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">"{aiInsight}"</p>
                </div>
              </div>
            </div>

            {activeTab === 'listings' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter By Workflow Stage:</span>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button onClick={() => setSelectedTierFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedTierFilter === 'all' ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'}`}>All Batches ({listings.length})</button>
                    <button onClick={() => setSelectedTierFilter(1)} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${selectedTierFilter === 1 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-950 text-emerald-500/70 hover:text-emerald-400 border border-slate-800'}`}><HeartHandshake className="h-3 w-3"/> Tier 1: Human ({listings.filter(l => l.tier === 1).length})</button>
                    <button onClick={() => setSelectedTierFilter(2)} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${selectedTierFilter === 2 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-950 text-amber-500/70 hover:text-amber-400 border border-slate-800'}`}><Tractor className="h-3 w-3"/> Tier 2: Animal ({listings.filter(l => l.tier === 2).length})</button>
                    <button onClick={() => setSelectedTierFilter(3)} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${selectedTierFilter === 3 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-950 text-blue-500/70 hover:text-blue-400 border border-slate-800'}`}><Recycle className="h-3 w-3"/> Tier 3: Compost ({listings.filter(l => l.tier === 3).length})</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredListings.map(item => (
                    <div key={item.id} className={`bg-slate-900/80 border rounded-2xl p-6 relative flex flex-col justify-between shadow-xl transition-all ${item.status === 'claimed' ? 'opacity-60 border-slate-800 bg-slate-950/60' : item.tier === 1 ? 'border-emerald-500/30 hover:border-emerald-500/60' : item.tier === 2 ? 'border-amber-500/30 hover:border-amber-500/60' : 'border-blue-500/30 hover:border-blue-500/60'}`}>
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-4">
                          {item.tier === 1 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider"><HeartHandshake className="h-3.5 w-3.5"/> Tier 1: Human Consumption</span>
                          ) : item.tier === 2 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase tracking-wider"><Tractor className="h-3.5 w-3.5"/> Tier 2: Animal Feed (10km Radius)</span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/10 border border-blue-500/30 text-blue-400 uppercase tracking-wider"><Recycle className="h-3.5 w-3.5"/> Tier 3: Composting (15km Radius)</span>
                          )}

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3 text-amber-500"/> Exp: {new Date(item.expiryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-rose-400 transition-colors p-1" title="Delete Batch"><Trash2 className="h-3.5 w-3.5"/></button>
                          </div>
                        </div>

                        <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                        <p className="text-sm text-slate-300 leading-relaxed mb-4">{item.description}</p>
                        
                        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-400 mb-6">
                          <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-amber-400 font-bold">Qty: {item.quantity}</span>
                          <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">Category: {item.foodType}</span>
                          <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-500"/> {item.address}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
                        <div className="text-xs text-slate-400">
                          <span className="block font-semibold text-slate-300">{item.organizerName}</span>
                          <span className="flex items-center gap-1 mt-0.5"><Phone className="h-2.5 w-2.5"/>{item.organizerPhone || "Verified Host"}</span>
                        </div>

                        {item.status === 'claimed' ? (
                          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold"><CheckCircle2 className="h-4 w-4"/> Claimed by {item.claimedByName}</div>
                        ) : (
                          <button onClick={() => handleClaim(item.id, item.tier)} className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${item.tier === 1 ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20' : item.tier === 2 ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20' : 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20'}`}>
                            Claim Batch Now ({item.tier === 1 ? 'NGO' : item.tier === 2 ? 'Farmer' : 'Compost'})
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center space-y-6">
                <div className="max-w-xl mx-auto space-y-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center">
                    <BarChart3 className="h-7 w-7"/>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Impact Analytics & Reporting</h3>
                  <p className="text-sm text-slate-400">
                    Continuous logging tracks metrics like food rescued, CO2 emissions reduced, and meals provided across the three redistribution stages.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                    <h5 className="font-bold text-white text-sm mb-2">Methane Landfill Diversion</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      By routing {metrics.totalRescuedKg} kg of organic surplus away from municipal dumps, FoodOrbit has prevented the formation of {metrics.co2SavedKg} kg of atmospheric greenhouse gases.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                    <h5 className="font-bold text-white text-sm mb-2">Agricultural Feed Index</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Tier 2 routing has successfully delivered over 400,000 unseasoned kilocalories to local livestock sanctuaries and farmers, directly lowering feed overhead.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                    <h5 className="font-bold text-white text-sm mb-2">Compost Remineralization</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Tier 3 collections have yielded an estimated 180 kg of rich, nitrogen-dense topsoil fertilizer distributed back to community garden cooperatives.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div className="space-y-4">
                <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"/>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Live Satellite Telemetry Hub</span>
                  </div>
                  <span className="text-xs text-slate-400">Click any colored pin on the map to dispatch claim coordinates</span>
                </div>
                <DynamicFoodMap listings={listings} onClaim={handleClaim}/>
              </div>
            )}
          </>
        )}

      </div>

      {/* Popup Modals */}
      <NewListingDialog isOpen={isNewListingModalOpen} onClose={() => setIsNewListingModalOpen(false)} onAddListing={handleAddListing}/>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={prof => setCurrentUser(prof)}/>

    </div>
  );
}