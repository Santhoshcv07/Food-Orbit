// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { UtensilsCrossed, LayoutDashboard, ArrowRight } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  if (pathname === '/dashboard') {
    return null;
  }

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
    >
      <div className="flex h-16 w-full max-w-5xl items-center justify-between rounded-full border border-white/10 bg-slate-900/60 backdrop-blur-2xl px-6 shadow-2xl shadow-black/50 pointer-events-auto">
        
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-transform group-hover:scale-105">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-white drop-shadow-md">
              Food<span className="text-amber-500">Orbit</span>
            </span>
            <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase opacity-80">
              Live Network
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-full border border-white/5">
          {[
            { name: 'Home', path: '/' },
            { name: 'Live Hub', path: '/dashboard' },
            { name: 'Impact', path: '/dashboard?tab=analytics' }
          ].map((link) => {
            const isActive = pathname === link.path || (link.name === 'Live Hub' && pathname === '/dashboard');
            return (
              <Link 
                key={link.name} 
                href={link.path} 
                className="relative px-5 py-2 text-xs font-bold transition-colors z-10"
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-white/10 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                  {link.name}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="hidden sm:inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950/50 px-5 py-2 text-xs font-bold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LayoutDashboard className="mr-2 h-3.5 w-3.5 text-amber-500" />
            Dashboard
          </Link>
          
          <Link 
            href="/dashboard" 
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2 text-xs font-extrabold text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]"
          >
            Launch Hub
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </motion.header>
  );
}