// src/components/AuthModal.tsx
'use client';

import React, { useState } from 'react';
import { X, UtensilsCrossed, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
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

  if (!isOpen) return null;

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
        if (newProfile) onLoginSuccess(newProfile);
      } else {
        const loggedInProfile = await signIn(email, password);
        if (loggedInProfile) onLoginSuccess(loggedInProfile);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {isSignUp ? "Join FoodOrbit Network" : "Sign In to Secure Hub"}
              </h3>
              <p className="text-[11px] text-slate-400">Three-Tier Food Rescue Authorization</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0"/> {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Email Address *</label>
            <input 
              type="email" 
              required
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="name@organization.org" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" 
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Password *</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" 
            />
          </div>

          {isSignUp && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Your Full Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Organization / Entity Name *</label>
                <input 
                  type="text" 
                  value={orgName} 
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="e.g. Downtown City Food Bank" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Select Stakeholder Role *</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="organizer">Event Organizer (List Surplus Food)</option>
                  <option value="ngo">Partner NGO (Claim Tier 1 Human Food)</option>
                  <option value="farmer">Agricultural Farmer (Claim Tier 2 Animal Feed)</option>
                  <option value="compost">Compost Agency (Claim Tier 3 Bio-Waste)</option>
                </select>
              </div>
            </>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all mt-2"
          >
            {loading ? "Authenticating..." : isSignUp ? "Create Account & Authorize" : "Sign In to Portal"}
          </button>
        </form>

        {/* Footer Switcher */}
        <div className="pt-6 mt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          {isSignUp ? (
            <span>Already registered on FoodOrbit? <button onClick={() => setIsSignUp(false)} className="text-amber-400 font-bold hover:underline">Sign In here</button></span>
          ) : (
            <span>Need a three-tier rescue portal account? <button onClick={() => setIsSignUp(true)} className="text-amber-400 font-bold hover:underline">Sign Up here</button></span>
          )}
        </div>

      </div>
    </div>
  );
}