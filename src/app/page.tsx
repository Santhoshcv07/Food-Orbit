// src/app/page.tsx
import Link from 'next/link';
import { 
  ArrowRight, 
  UtensilsCrossed, 
  HeartHandshake, 
  Tractor, 
  Recycle, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  BarChart3, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center bg-slate-950 text-slate-100">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28 px-4 sm:px-6">
        {/* Background Glowing Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-6xl text-center relative z-10">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold mb-8 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Gen Surplus Redistribution Logistics</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
            Systematic Food Rescue. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
              Zero Edible Waste.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 font-normal leading-relaxed">
            FoodOrbit dynamically connects event organizers with certified NGOs, agricultural farmers, and compost agencies using automated geolocation alerts and strict time-based tier escalation.
          </p>

          {/* Call To Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/dashboard?action=new" 
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-amber-500 hover:scale-[1.02]"
            >
              <UtensilsCrossed className="mr-2 h-5 w-5" />
              List Event Surplus Now
            </Link>

            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 backdrop-blur px-8 py-4 text-base font-semibold text-slate-200 transition-all hover:bg-slate-800 hover:text-white"
            >
              Open Live Hub & Map
              <ArrowRight className="ml-2 h-4 w-4 text-amber-500" />
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-14 pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-400 text-xs sm:text-sm font-medium">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" /> Real-Time Expiry Timers
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400" /> Dynamic Radius Expansion
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-400" /> Verified Recipient ID
            </div>
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-400" /> AI Impact Analytics
            </div>
          </div>

        </div>
      </section>

      {/* ================= THREE-TIER WORKFLOW SECTION ================= */}
      <section className="w-full py-24 bg-slate-900/50 border-y border-slate-800/80 px-4 sm:px-6 relative">
        <div className="container mx-auto max-w-6xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Autonomous Escalation</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">The Three-Tier Rescue Workflow</h3>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              When surplus food is listed, our smart timers initiate a prioritized, geographically expanding cascade to ensure high-value nutrition is routed to human consumption first.
            </p>
          </div>

          {/* Workflow Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 Card */}
            <div className="flex flex-col justify-between bg-slate-950 border border-slate-800 rounded-2xl p-8 relative shadow-xl shadow-black/40 hover:border-emerald-500/50 transition-all group">
              <div className="absolute -top-3 left-8 bg-emerald-500 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow">
                Priority Tier 1
              </div>
              <div>
                <div className="flex items-center justify-between mb-6 mt-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                    <HeartHandshake className="h-7 w-7" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-emerald-400" /> 5 km Radius
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Human Consumption</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Instant SMS & email alerts broadcast to partnered charities, shelters, and food banks. High-grade catering is instantly reserved to provide hot meals to those in need.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Claim Window:</span>
                <span className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">4 – 6 Hours</span>
              </div>
            </div>

            {/* Step 2 Card */}
            <div className="flex flex-col justify-between bg-slate-950 border border-slate-800 rounded-2xl p-8 relative shadow-xl shadow-black/40 hover:border-amber-500/50 transition-all group">
              <div className="absolute -top-3 left-8 bg-amber-500 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow">
                Escalation Tier 2
              </div>
              <div>
                <div className="flex items-center justify-between mb-6 mt-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                    <Tractor className="h-7 w-7" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-amber-400" /> 10 km Radius
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Animal Feed & Shelters</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  If food remains unclaimed as the primary timer runs out, alerts automatically expand to regional livestock farmers, animal sanctuaries, and zoological parks.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Claim Window:</span>
                <span className="text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded">3 – 4 Hours</span>
              </div>
            </div>

            {/* Step 3 Card */}
            <div className="flex flex-col justify-between bg-slate-950 border border-slate-800 rounded-2xl p-8 relative shadow-xl shadow-black/40 hover:border-blue-500/50 transition-all group">
              <div className="absolute -top-3 left-8 bg-blue-500 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow">
                Final Tier 3
              </div>
              <div>
                <div className="flex items-center justify-between mb-6 mt-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                    <Recycle className="h-7 w-7" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-blue-400" /> 15 km Radius
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Commercial Composting</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Unused or inedible organic leftovers trigger automated dispatch to bio-waste managers and composting facilities, completely bypassing methane-producing landfills.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Outcome:</span>
                <span className="text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded">Zero Landfill</span>
              </div>
            </div>

          </div>

          {/* Workflow Bottom Banner */}
          <div className="mt-12 bg-slate-950 border border-slate-800/80 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-bold">!</div>
              <span>Want to see how automated tier escalation works in action?</span>
            </div>
            <Link 
              href="/dashboard?simulate=true" 
              className="inline-flex items-center text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
            >
              Launch Live Tier Simulator <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* ================= STAKEHOLDER PORTAL SECTION ================= */}
      <section className="w-full py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Built For Every Link in the Chain</h3>
          <p className="text-slate-400 text-sm mt-2">Seamless multi-stakeholder synchronization on a single unified interface.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <h4 className="text-base font-bold text-white mb-1">Event Organizers</h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">Weddings, corporate galas, and banquet halls dump surplus instantly with 3 clicks.</p>
            <span className="text-[11px] font-semibold text-amber-500/90 flex items-center gap-1">
              Verified Tax Receipts <ArrowRight className="h-3 w-3" />
            </span>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <h4 className="text-base font-bold text-white mb-1">Partner NGOs</h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">Food banks and soup kitchens get first-dibs alerts with exact portions and pickup coordinates.</p>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              Tier 1 Priority Access <ArrowRight className="h-3 w-3" />
            </span>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <h4 className="text-base font-bold text-white mb-1">Livestock Farmers</h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">Receive unseasoned grains, produce, and bakery surplus safe for animal nourishment.</p>
            <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
              Free Agricultural Feed <ArrowRight className="h-3 w-3" />
            </span>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <h4 className="text-base font-bold text-white mb-1">Compost Agencies</h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">Collect verified organic waste to produce nutrient-dense soil fertilizers.</p>
            <span className="text-[11px] font-semibold text-blue-400 flex items-center gap-1">
              Eco-Disposal Tracking <ArrowRight className="h-3 w-3" />
            </span>
          </div>

        </div>
      </section>

      {/* ================= BOTTOM CALL TO ACTION ================= */}
      <section className="w-full pb-24 pt-12 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 max-w-2xl mx-auto">
            Ready to Transform Your Event’s Environmental Footprint?
          </h3>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 font-medium">
            Join the automated rescue network today. Bridge the gap between surplus abundance and profound societal need.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/dashboard?action=new" 
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-sm sm:text-base font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all hover:scale-105"
            >
              List Surplus Food Instantly
            </Link>
            <Link 
              href="/dashboard" 
              className="rounded-xl border border-slate-700 bg-slate-900 px-8 py-4 text-sm sm:text-base font-semibold text-white hover:bg-slate-800 transition-all"
            >
              Explore Impact Analytics
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}