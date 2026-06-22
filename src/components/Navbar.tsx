// src/components/Navbar.tsx
import Link from 'next/link';
import { UtensilsCrossed, LayoutDashboard, ArrowRight } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white">
              Food<span className="text-amber-500">Orbit</span>
            </span>
            <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">
              Three-Tier Rescue
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-slate-300 transition-colors hover:text-amber-400">
            Home
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-slate-300 transition-colors hover:text-amber-400">
            Live Hub
          </Link>
          <Link href="/dashboard?tab=analytics" className="text-sm font-medium text-slate-300 transition-colors hover:text-amber-400">
            AI Impact
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LayoutDashboard className="mr-2 h-4 w-4 text-amber-500" />
            Dashboard
          </Link>
          
          <Link 
            href="/dashboard?action=new" 
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30"
          >
            List Surplus
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

      </div>
    </header>
  );
}