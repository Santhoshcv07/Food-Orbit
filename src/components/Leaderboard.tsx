import React from 'react';
import { FoodListing } from '@/lib/types';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

interface LeaderboardProps {
  listings: FoodListing[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const Leaderboard = ({ listings }: LeaderboardProps) => {
  // Calculate rankings based on claimed items (Rescuers)
  const rescuersMap = new Map<string, { name: string; kg: number; batches: number }>();
  
  listings.filter(l => l.status === 'claimed' && l.claimedByName).forEach(l => {
    const name = l.claimedByName!;
    const current = rescuersMap.get(name) || { name, kg: 0, batches: 0 };
    current.batches += 1;
    current.kg += (parseInt(l.quantity) || 45); // Approximate 45kg if not explicitly parseable
    rescuersMap.set(name, current);
  });

  const topRescuers = Array.from(rescuersMap.values()).sort((a, b) => b.kg - a.kg).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700" />
        <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none transform group-hover:rotate-12 transition-transform duration-1000">
          <Trophy className="w-64 h-64 text-emerald-500" />
        </div>
        
        <div className="mb-8 relative z-10">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400 mb-2 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Trophy className="h-6 w-6 text-emerald-500"/>
            </div>
            Green Heroes Network
          </h2>
          <p className="text-slate-400 text-sm font-medium">Recognizing the top organizations leading the fight against food waste and methane emissions this month.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4 relative z-10"
        >
          {topRescuers.length === 0 ? (
            <div className="py-12 text-center text-slate-500 italic border border-dashed border-white/10 rounded-2xl bg-slate-950/30">
              Leaderboard is currently calculating... Waiting for network telemetry.
            </div>
          ) : (
            topRescuers.map((hero, index) => (
              <motion.div 
                variants={itemVariants}
                key={hero.name} 
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                  index === 0 ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)] relative overflow-hidden' : 
                  index === 1 ? 'bg-slate-300/10 border-slate-300/30' : 
                  index === 2 ? 'bg-amber-700/10 border-amber-700/30' : 
                  'bg-slate-950/50 border-white/5 hover:border-white/10 hover:bg-slate-800/80'
                }`}
              >
                {index === 0 && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[200%] animate-[shimmer_3s_infinite]" />}
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-inner ${index === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-600 text-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : index === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 shadow-[0_0_15px_rgba(203,213,225,0.3)]' : index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 shadow-[0_0_15px_rgba(180,83,9,0.5)]' : 'bg-slate-800 text-slate-400 border border-white/5'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base tracking-tight">{hero.name}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mt-0.5">
                      {index === 0 ? <Medal className="h-3.5 w-3.5 text-amber-500 drop-shadow-md"/> : index === 1 ? <Medal className="h-3.5 w-3.5 text-slate-300"/> : index === 2 ? <Medal className="h-3.5 w-3.5 text-amber-700"/> : <Award className="h-3.5 w-3.5 text-slate-600"/>}
                      {index < 3 ? <span className="text-amber-500/90">Top Tier Partner</span> : 'Verified Partner'}
                    </span>
                  </div>
                </div>
                
                <div className="text-right relative z-10">
                  <div className="font-mono text-emerald-400 font-bold text-xl flex items-center justify-end gap-2 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                    <TrendingUp className="h-5 w-5"/> {hero.kg.toLocaleString()} kg
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">across <span className="text-slate-300">{hero.batches}</span> batches</div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};;
