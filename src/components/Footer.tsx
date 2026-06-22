// src/components/Footer.tsx
import Link from 'next/link';
import { ShieldCheck, RefreshCw, Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 text-slate-400 py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-2">
            <span className="text-xl font-bold tracking-tight text-white mb-2 block">
              Food<span className="text-amber-500">Orbit</span> Network
            </span>
            <p className="text-sm text-slate-400 max-w-sm mb-4">
              A technology-driven logistics platform dedicated to systematically eliminating event food waste through automated, geo-located tier escalation.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium">
              <ShieldCheck className="h-4 w-4" /> Verified Production Secure Hub
            </div>
          </div>

          {/* Col 2: The Three Tiers */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Rescue Hierarchy</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-slate-300">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">1</span>
                Human Consumption
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">2</span>
                Animal Feed
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">3</span>
                Composting
              </li>
            </ul>
          </div>

          {/* Col 3: Stakeholders */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Stakeholders</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Event Organizers</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Partner NGOs</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Agricultural Farmers</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Compost Agencies</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-8 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FoodOrbit Network. Built with Next.js & Supabase.</p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <span className="flex items-center gap-1 hover:text-slate-400 transition-colors">
              <RefreshCw className="h-3 w-3 text-emerald-500" /> Circular Economy
            </span>
            <span className="flex items-center gap-1 hover:text-slate-400 transition-colors">
              <Leaf className="h-3 w-3 text-amber-500" /> Zero Landfill Mission
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}