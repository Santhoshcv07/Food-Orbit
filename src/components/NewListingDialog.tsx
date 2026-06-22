// src/components/NewListingDialog.tsx
/* eslint-disable react-hooks/purity */
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UtensilsCrossed, AlertCircle, Plus } from 'lucide-react';
import { FoodListing, RescueTier, UserProfile } from '@/lib/types';

const listingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Provide a brief description (min 10 chars)'),
  quantity: z.string().min(1, 'Quantity is required (e.g., "50 kg" or "100 meals")'),
  foodType: z.string().min(1, 'Please specify the food category'),
  address: z.string().min(5, 'Exact street address or pickup gate is required'),
  tier: z.preprocess((val) => Number(val), z.union([z.literal(1), z.literal(2), z.literal(3)])),
  organizerName: z.string().min(2, 'Organization name is required'),
  organizerPhone: z.string().min(7, 'Contact phone number is required'),
});

type FormData = z.output<typeof listingSchema>;

interface NewListingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddListing: (newListing: FoodListing) => void;
  currentUser?: UserProfile | null;
}

export function NewListingDialog({ isOpen, onClose, onAddListing, currentUser }: NewListingDialogProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(listingSchema) as any,
    defaultValues: {
      tier: 1, // Tier 1: Human Consumption priority
      foodType: 'Cooked Food',
    }
  });

  const onSubmit = (data: FormData) => {
    const newEntry: FoodListing = {
      id: `batch-${Date.now()}`,
      title: data.title,
      description: data.description,
      quantity: data.quantity,
      foodType: data.foodType,
      tier: data.tier as RescueTier,
      status: 'available',
      expiryTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours countdown timer
      latitude: 12.9716 + (Math.random() - 0.5) * 0.04,
      longitude: 77.5946 + (Math.random() - 0.5) * 0.04,
      address: data.address,
      organizerId: currentUser?.id || `org-${Date.now()}`,
      organizerName: currentUser?.name || data.organizerName,
      organizerPhone: currentUser?.phone || data.organizerPhone,
      createdAt: new Date().toISOString(),
    };

    onAddListing(newEntry);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100 overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] pointer-events-none" />

            {/* Modal Header */}
            <div className="relative z-10 flex items-center justify-between pb-6 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight drop-shadow-md">Broadcast Surplus Batch</h3>
                  <p className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest mt-0.5">Initiate Automated Escalation Workflow</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors border border-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 space-y-5 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Batch Title *</label>
                  <input 
                    {...register('title')} 
                    placeholder="e.g. Wedding Banquet Curry & Rice" 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600" 
                  />
                  {errors.title && <span className="text-rose-400 text-[10px] font-bold mt-1.5 ml-1 flex items-center gap-1 uppercase"><AlertCircle className="h-3 w-3"/>{errors.title.message}</span>}
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Estimated Quantity *</label>
                  <input 
                    {...register('quantity')} 
                    placeholder="e.g. 50 kg (approx. 120 servings)" 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600" 
                  />
                  {errors.quantity && <span className="text-rose-400 text-[10px] font-bold mt-1.5 ml-1 flex items-center gap-1 uppercase"><AlertCircle className="h-3 w-3"/>{errors.quantity.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Food Category *</label>
                  <select 
                    {...register('foodType')} 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Cooked Food">Cooked Catering / Buffet</option>
                    <option value="Fresh Produce">Fresh Produce / Raw</option>
                    <option value="Bakery">Bakery & Pastries</option>
                    <option value="Packaged / Dry">Packaged / Dry Rations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Initial Priority Tier *</label>
                  <select 
                    {...register('tier')} 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-amber-400 font-bold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value={1}>Tier 1: Human Consumption (0-6 hrs)</option>
                    <option value={2}>Tier 2: Animal Feed / Farmers</option>
                    <option value={3}>Tier 3: Composting Agency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description & Condition *</label>
                <textarea 
                  {...register('description')} 
                  rows={2}
                  placeholder="Specify details (e.g. kept in warmers, unserved trays only, unseasoned vegetable trimmings)." 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600 resize-none" 
                />
                {errors.description && <span className="text-rose-400 text-[10px] font-bold mt-1.5 ml-1 flex items-center gap-1 uppercase"><AlertCircle className="h-3 w-3"/>{errors.description.message}</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-white/5 pt-5">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Pickup Location / Gate *</label>
                  <input 
                    {...register('address')} 
                    placeholder="e.g. Convention Center, Gate 4 Loading Dock" 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600" 
                  />
                  {errors.address && <span className="text-rose-400 text-[10px] font-bold mt-1.5 ml-1 flex items-center gap-1 uppercase"><AlertCircle className="h-3 w-3"/>{errors.address.message}</span>}
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Organizer Name *</label>
                  <input 
                    {...register('organizerName')} 
                    placeholder="e.g. Royal Banquet Logistics" 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600" 
                  />
                  {errors.organizerName && <span className="text-rose-400 text-[10px] font-bold mt-1.5 ml-1 flex items-center gap-1 uppercase"><AlertCircle className="h-3 w-3"/>{errors.organizerName.message}</span>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">On-Site Contact Phone *</label>
                <input 
                  {...register('organizerPhone')} 
                  placeholder="e.g. +1 (555) 382-9102" 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600" 
                />
                {errors.organizerPhone && <span className="text-rose-400 text-[10px] font-bold mt-1.5 ml-1 flex items-center gap-1 uppercase"><AlertCircle className="h-3 w-3"/>{errors.organizerPhone.message}</span>}
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 mt-2 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-6 py-3 rounded-full border border-white/10 bg-slate-950/50 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="relative px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-sm shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden"
                >
                  Broadcast to Network
                  <div className="absolute inset-0 bg-white/20 -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}