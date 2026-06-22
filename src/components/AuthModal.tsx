// src/components/AuthModal.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UtensilsCrossed, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { signUpWithRole, signIn } from '@/lib/auth';
import { UserRole, UserProfile } from '@/lib/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [role, setRole] = useState<UserRole>('organizer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name || !orgName) {
          throw new Error("Please fill in your name and organization.");
        }
        const newProfile = await signUpWithRole(email, password, name, role, orgName);
        if (newProfile) {
          toast.success(`Welcome to FoodOrbit, ${name}!`, { description: "Your secure node has been initialized." });
          onLoginSuccess(newProfile);
        }
      } else {
        const loggedInProfile = await signIn(email, password);
        if (loggedInProfile) {
          toast.success(`Authentication Successful`, { description: `Welcome back, ${loggedInProfile.name}.` });
          onLoginSuccess(loggedInProfile);
        }
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setError(msg);
      toast.error("Authentication Error", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-amber-500/20 blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between pb-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <UtensilsCrossed className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight drop-shadow-md">
                    {isSignUp ? "Join FoodOrbit" : "Secure Sign In"}
                  </h3>
                  <p className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">
                    {isSignUp ? "Global Rescue Network" : "Live Authorization"}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors border border-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="relative z-10 space-y-4 mt-6">
              <AnimatePresence mode="popLayout">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 overflow-hidden"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0"/> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@organization.org" 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600" 
                />
              </div>

              <AnimatePresence>
                {isSignUp && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins" 
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Entity Name</label>
                      <input 
                        type="text" 
                        value={orgName} 
                        onChange={e => setOrgName(e.target.value)}
                        placeholder="e.g. Downtown City Food Bank" 
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Stakeholder Tier</label>
                      <select 
                        value={role} 
                        onChange={e => setRole(e.target.value as UserRole)}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-amber-400 font-bold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="organizer">Event Organizer (List Surplus)</option>
                        <option value="ngo">Partner NGO (Claim Tier 1)</option>
                        <option value="farmer">Local Farmer (Claim Tier 2)</option>
                        <option value="compost">Compost Agency (Claim Tier 3)</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit"
                disabled={loading}
                className="relative w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-sm shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] mt-6 overflow-hidden disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? "Authenticating..." : isSignUp ? "Initialize Account Node" : "Access Command Center"}
                <div className="absolute inset-0 bg-white/20 -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              </button>
            </form>

            {/* Footer Switcher */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/5 text-center text-xs text-slate-400">
              {isSignUp ? (
                <span>Already registered on FoodOrbit? <button type="button" onClick={() => setIsSignUp(false)} className="text-amber-400 font-bold hover:text-amber-300 transition-colors">Sign In here</button></span>
              ) : (
                <span>Need a three-tier rescue portal account? <button type="button" onClick={() => setIsSignUp(true)} className="text-amber-400 font-bold hover:text-amber-300 transition-colors">Sign Up here</button></span>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}