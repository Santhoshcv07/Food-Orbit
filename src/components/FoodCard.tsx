'use client';

import React, { useRef } from 'react';
import { FoodListing } from '@/lib/types';
import { HeartHandshake, Tractor, Recycle, Clock, Trash2, MapPin, Phone, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface FoodCardProps {
  item: FoodListing;
  onClaim: (id: string, tier: number) => void;
  onDelete: (id: string) => void;
}

export const FoodCard = ({ item, onClaim, onDelete }: FoodCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Motion values for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for rotation
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { damping: 25, stiffness: 150 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { damping: 25, stiffness: 150 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    // Calculate position from center [-0.5 to 0.5]
    const xPos = (event.clientX - rect.left) / rect.width - 0.5;
    const yPos = (event.clientY - rect.top) / rect.height - 0.5;
    
    x.set(xPos);
    y.set(yPos);
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl p-[1px] transition-all duration-500 overflow-hidden group hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl ${
        item.status === 'claimed' ? 'opacity-60 grayscale-[40%]' : ''
      }`}
    >
      {/* Spotlight Effect overlay */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([mx, my]) => `radial-gradient(circle at ${mx}px ${my}px, rgba(255,255,255,0.15) 0%, transparent 70%)`
          )
        }}
      />

      <div 
        style={{ transform: "translateZ(20px)" }}
        className={`h-full w-full bg-slate-900/60 backdrop-blur-2xl border rounded-3xl p-6 relative flex flex-col justify-between transition-colors duration-500 ${
        item.status === 'claimed' 
          ? 'border-slate-800' 
          : item.tier === 1 
            ? 'border-emerald-500/20 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
            : item.tier === 2 
              ? 'border-amber-500/20 group-hover:border-amber-500/50 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]' 
              : 'border-blue-500/20 group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]'
      }`}>
        
        <div>
          <div className="flex items-center justify-between gap-2 mb-5">
            {item.tier === 1 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <HeartHandshake className="h-3.5 w-3.5"/> Tier 1: Human
              </span>
            ) : item.tier === 2 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Tractor className="h-3.5 w-3.5"/> Tier 2: Animal
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 border border-blue-500/30 text-blue-400 uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Recycle className="h-3.5 w-3.5"/> Tier 3: Compost
              </span>
            )}

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-md border border-white/10 shadow-inner">
                <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <Clock className="h-3 w-3 text-amber-500"/> Exp: <CountdownTimer expiryTime={item.expiryTime} status={item.status} />
              </span>
              <button onClick={() => onDelete(item.id)} className="text-slate-500 hover:text-rose-400 transition-colors p-1.5 rounded-md hover:bg-slate-800" title="Delete Database Entry">
                <Trash2 className="h-3.5 w-3.5"/>
              </button>
            </div>
          </div>

          <h4 className="text-xl sm:text-2xl font-extrabold text-white mb-2.5 leading-tight tracking-tight drop-shadow-sm">{item.title}</h4>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6 font-medium line-clamp-2">{item.description}</p>
          
          <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-300 mb-6">
            <span className="bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-white/5 text-white shadow-inner flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-emerald-400" />
              Qty: <span className="text-emerald-400">{item.quantity}</span>
            </span>
            <span className="bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-white/5 shadow-inner">
              {item.foodType}
            </span>
            <span className="bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center gap-1.5 shadow-inner">
              <MapPin className="h-3 w-3 text-slate-500"/> {item.address}
            </span>
            {item.distKm !== null && item.distKm !== undefined && (
              <span className="bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                <MapPin className="h-3 w-3 text-emerald-500"/> {item.distKm.toFixed(1)} km ({item.travelTimeMins} min)
              </span>
            )}
          </div>
        </div>

        <div className="pt-5 border-t border-white/5 flex items-center justify-between gap-4">
          <div className="text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-extrabold text-slate-200">
              {item.organizerName}
              <span title="Verified Organization">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
              </span>
            </span>
            <span className="flex items-center gap-1.5 mt-1.5 font-medium opacity-80">
              <Phone className="h-3 w-3"/>{item.organizerPhone || "Verified Host"}
            </span>
          </div>

          {item.status === 'claimed' ? (
            <div className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-inner">
              <CheckCircle2 className="h-4 w-4"/> Claimed by {item.claimedByName}
            </div>
          ) : (
            <button 
              onClick={() => onClaim(item.id, item.tier)} 
              className={`px-6 py-2.5 rounded-xl font-extrabold text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                item.tier === 1 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]' 
                  : item.tier === 2 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]'
              }`}>
              Claim Batch
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
