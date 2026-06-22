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
  Trash2
} from 'lucide-react';
import { FoodListing } from '@/lib/types';
import { initialListings, initialMetrics } from '@/lib/mockData';
import { NewListingDialog } from '@/components/NewListingDialog';
import { getFoodRescueSummary } from '@/lib/groq';

// CRITICAL SENIOR DEV FIX: Dynamically import Leaflet map to disable Server-Side Rendering (SSR)
const DynamicFoodMap = dynamic(() => import('@/components/FoodMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-500 font-mono text-xs">
      <MapIcon className="h-8 w-8 text-amber-500 animate-spin"/>
      <span>Calibrating Live GPS Satellite Feeds...</span>
    </div>
  )
});

export default function DashboardPage() {
  

  // State Management
  const [listings, setListings] = useState<FoodListing[]>(initialListings);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [activeTab, setActiveTab] = useState<'listings' | 'analytics' | 'map'>('listings');
  const [selectedTierFilter, setSelectedTierFilter] = useState<number | 'all'>('all');
  const [isNewListingModalOpen, setIsNewListingModalOpen] = useState(false);
  
  // AI State
  const [aiInsight, setAiInsight] = useState<string>("Analyzing active rescue telemetry across all tiers...");
  const [isAiLoading, setIsAiLoading] = useState(true);

  // Parse URL query triggers (?action=new, ?simulate=true, ?tab=analytics)


  // Fetch Groq AI Insights when data changes
  useEffect(() => {
    async function fetchAi() {
      setIsAiLoading(true);
      const activeCount = listings.filter(l => l.status === 'available').length;
      const summary = await getFoodRescueSummary(activeCount, metrics.totalRescuedKg);
      setAiInsight(summary);
      setIsAiLoading(false);
    }
    fetchAi();
  }, [listings.length, metrics.totalRescuedKg]);

  // Action: Broadcast a new food listing
  const handleAddListing = (newItem: FoodListing) => {
    setListings(prev => [newItem, ...prev]);
    const addedKg = parseInt(newItem.quantity) || 50;
    setMetrics(prev => ({
      ...prev,
      totalRescuedKg: prev.totalRescuedKg + addedKg,
      mealsProvided: prev.mealsProvided + Math.round(addedKg * 2.5),
      co2SavedKg: prev.co2SavedKg + Math.round(addedKg * 0.25),
      activeListingsCount: prev.activeListingsCount + 1
    }));
  };

  // Action: Stakeholder claims food batch
  const handleClaim = (id: string, tier: number) => {
    setListings(prev => prev.map(item => {
      if (item.id === id) {
        const claimant = tier === 1 ? 'Metro Charities (NGO)' : tier === 2 ? 'Highland Agricultural Sanctuary' : 'EcoSoils Bio-Waste Agency';
        return { ...item, status: 'claimed', claimedByName: claimant, claimedAt: new Date().toLocaleTimeString() };
      }
      return item;
    }));
  };

  // Action: Delete listing
  const handleDelete = (id: string) => {
    setListings(prev => prev.filter(item => item.id !== id));
  };

  // Action: Simulate automated countdown timer tier escalation
  const handleSimulateEscalation = () => {
    setListings(prev => prev.map(item => {
      if (item.status === 'available') {
        // Demote Tier 1 -> Tier 2 (Animal Feed), or Tier 2 -> Tier 3 (Composting)
        const nextTier = item.tier === 1 ? 2 : item.tier === 2 ? 3 : 3;
        return { ...item, tier: nextTier };
      }
      return item;
    }));
    alert("⏳ AUTOMATED ESCALATION SIMULATOR TRIGGERED!\n\nUnclaimed Tier 1 batches have escalated to Tier 2 (Animal Feed / 10km radius). Unclaimed Tier 2 batches escalated to Tier 3 (Composting / 15km radius).");
  };

  // Filter listings
  const filteredListings = listings.filter(item => {
    if (selectedTierFilter === 'all') return true;
    return item.tier === selectedTierFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      
      {/* Sub-Navigation Command Strip */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 px-4 py-4 sm:px-6 sticky top-16 z-30 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Dashboard Tab Controls */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('listings')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'listings' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <Layers className="h-3.5 w-3.5"/> Live Hub
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'analytics' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <BarChart3 className="h-3.5 w-3.5"/> Impact Analytics
            </button>
            <button 
              onClick={() => setActiveTab('map')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'map' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <MapIcon className="h-3.5 w-3.5"/> Live GPS Map
            </button>
          </div>

          {/* Action Triggers */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button 
              onClick={handleSimulateEscalation}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-colors"
              title="Shift available batches to the next priority tier based on simulated expiry timers"
            >
              <FastForward className="h-3.5 w-3.5"/> Simulate Time Escalation
            </button>
            <button 
              onClick={() => setIsNewListingModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs shadow-md hover:from-amber-400 hover:to-amber-500 transition-all"
            >
              <Plus className="h-4 w-4"/> List Surplus Batch
            </button>
          </div>

        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        
        {/* Impact Analytics Overview Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Food Rescued</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-white">{metrics.totalRescuedKg} <span className="text-sm font-normal text-amber-500">kg</span></span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Meals Provided</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-emerald-400">{metrics.mealsProvided}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">CO2 Emissions Reduced</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-blue-400">{metrics.co2SavedKg} <span className="text-sm font-normal text-slate-400">kg</span></span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Active Batches</span>
            <span className="text-2xl sm:text-4xl font-extrabold text-amber-400">{listings.filter(l => l.status === 'available').length}</span>
          </div>
        </div>

        {/* AI Sustainability Advisor Box */}
        <div className="mb-10 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl shrink-0">
              <Sparkles className="h-6 w-6"/>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Groq AI Real-Time Sustainability Advisor</h4>
                {isAiLoading && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded animate-pulse font-mono">Fetching Intelligence...</span>}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "{aiInsight}"
              </p>
            </div>
          </div>
        </div>

        {/* ================= TAB 1: LIVE LISTINGS HUB ================= */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter By Workflow Stage:</span>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setSelectedTierFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedTierFilter === 'all' ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
                >
                  All Batches ({listings.length})
                </button>
                <button 
                  onClick={() => setSelectedTierFilter(1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${selectedTierFilter === 1 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-950 text-emerald-500/70 hover:text-emerald-400 border border-slate-800'}`}
                >
                  <HeartHandshake className="h-3 w-3"/> Tier 1: Human ({listings.filter(l => l.tier === 1).length})
                </button>
                <button 
                  onClick={() => setSelectedTierFilter(2)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${selectedTierFilter === 2 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-950 text-amber-500/70 hover:text-amber-400 border border-slate-800'}`}
                >
                  <Tractor className="h-3 w-3"/> Tier 2: Animal ({listings.filter(l => l.tier === 2).length})
                </button>
                <button 
                  onClick={() => setSelectedTierFilter(3)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${selectedTierFilter === 3 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-950 text-blue-500/70 hover:text-blue-400 border border-slate-800'}`}
                >
                  <Recycle className="h-3 w-3"/> Tier 3: Compost ({listings.filter(l => l.tier === 3).length})
                </button>
              </div>
            </div>

            {/* Surplus Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredListings.map(item => (
                <div 
                  key={item.id}
                  className={`bg-slate-900/80 border rounded-2xl p-6 relative flex flex-col justify-between shadow-xl transition-all ${
                    item.status === 'claimed' 
                      ? 'opacity-60 border-slate-800 bg-slate-950/60' 
                      : item.tier === 1 
                      ? 'border-emerald-500/30 hover:border-emerald-500/60' 
                      : item.tier === 2 
                      ? 'border-amber-500/30 hover:border-amber-500/60' 
                      : 'border-blue-500/30 hover:border-blue-500/60'
                  }`}
                >
                  <div>
                    {/* Status Pill & Expiry */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      {item.tier === 1 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider">
                          <HeartHandshake className="h-3.5 w-3.5"/> Tier 1: Human Consumption
                        </span>
                      ) : item.tier === 2 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase tracking-wider">
                          <Tractor className="h-3.5 w-3.5"/> Tier 2: Animal Feed (10km Radius)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/10 border border-blue-500/30 text-blue-400 uppercase tracking-wider">
                          <Recycle className="h-3.5 w-3.5"/> Tier 3: Composting (15km Radius)
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-amber-500"/> Exp: {new Date(item.expiryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                          title="Delete Listing"
                        >
                          <Trash2 className="h-3.5 w-3.5"/>
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">{item.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-400 mb-6">
                      <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-amber-400 font-bold">
                        Qty: {item.quantity}
                      </span>
                      <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                        Category: {item.foodType}
                      </span>
                      <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-500"/> {item.address}
                      </span>
                    </div>
                  </div>

                  {/* Footer Bar & Claim Control */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
                    <div className="text-xs text-slate-400">
                      <span className="block font-semibold text-slate-300">{item.organizerName}</span>
                      <span className="flex items-center gap-1 mt-0.5"><Phone className="h-2.5 w-2.5"/>{item.organizerPhone || "Verified Organizer"}</span>
                    </div>

                    {item.status === 'claimed' ? (
                      <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="h-4 w-4"/> Claimed by {item.claimedByName}
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleClaim(item.id, item.tier)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
                          item.tier === 1 
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20' 
                            : item.tier === 2 
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20' 
                            : 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20'
                        }`}
                      >
                        Claim Batch Now ({item.tier === 1 ? 'NGO' : item.tier === 2 ? 'Farmer' : 'Compost'})
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= TAB 2: IMPACT ANALYTICS ================= */}
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

        {/* ================= TAB 3: REAL OPENSTREETMAP ================= */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"/>
                <span className="text-xs font-bold text-white uppercase tracking-wider">Live Satellite Telemetry Hub</span>
              </div>
              <span className="text-xs text-slate-400">Click any colored pin on the map to dispatch claim coordinates</span>
            </div>
            
            {/* Real OpenStreetMap Render */}
            <DynamicFoodMap 
              listings={listings}
              onClaim={handleClaim}
            />
          </div>
        )}

      </div>

      <NewListingDialog 
        isOpen={isNewListingModalOpen}
        onClose={() => setIsNewListingModalOpen(false)}
        onAddListing={handleAddListing}
      />

    </div>
  );
}