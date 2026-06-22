// src/components/NewListingDialog.tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, UtensilsCrossed, AlertCircle } from 'lucide-react';
import { FoodListing, RescueTier } from '@/lib/types';

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
}

export function NewListingDialog({ isOpen, onClose, onAddListing }: NewListingDialogProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
  resolver: zodResolver(listingSchema) as any,
    defaultValues: {
      tier: 1, // Tier 1: Human Consumption priority
      foodType: 'Cooked Food',
    }
  });

  if (!isOpen) return null;

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
      organizerId: `org-${Date.now()}`,
      organizerName: data.organizerName,
      organizerPhone: data.organizerPhone,
      createdAt: new Date().toISOString(),
    };

    onAddListing(newEntry);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">List Surplus Food Batch</h3>
              <p className="text-xs text-slate-400">Initiate automated 3-tier rescue workflow</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Batch Title *</label>
              <input 
                {...register('title')} 
                placeholder="e.g. Wedding Banquet Curry & Rice" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" 
              />
              {errors.title && <span className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3"/>{errors.title.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Estimated Quantity *</label>
              <input 
                {...register('quantity')} 
                placeholder="e.g. 50 kg (approx. 120 servings)" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" 
              />
              {errors.quantity && <span className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3"/>{errors.quantity.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Food Category *</label>
              <select 
                {...register('foodType')} 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Cooked Food">Cooked Catering / Buffet</option>
                <option value="Fresh Produce">Fresh Produce / Raw</option>
                <option value="Bakery">Bakery & Pastries</option>
                <option value="Packaged / Dry">Packaged / Dry Rations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Initial Priority Tier *</label>
              <select 
                {...register('tier')} 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value={1}>Tier 1: Human Consumption (0-6 hrs)</option>
                <option value={2}>Tier 2: Animal Feed / Farmers</option>
                <option value={3}>Tier 3: Composting Agency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description & Condition *</label>
            <textarea 
              {...register('description')} 
              rows={2}
              placeholder="Specify details (e.g. kept in warmers, unserved trays only, unseasoned vegetable trimmings)." 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none" 
            />
            {errors.description && <span className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3"/>{errors.description.message}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800 pt-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Pickup Location / Gate *</label>
              <input 
                {...register('address')} 
                placeholder="e.g. Convention Center, Gate 4 Loading Dock" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" 
              />
              {errors.address && <span className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3"/>{errors.address.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Organizer Name *</label>
              <input 
                {...register('organizerName')} 
                placeholder="e.g. Royal Banquet Logistics" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" 
              />
              {errors.organizerName && <span className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3"/>{errors.organizerName.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">On-Site Contact Phone *</label>
            <input 
              {...register('organizerPhone')} 
              placeholder="e.g. +1 (555) 382-9102" 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" 
            />
            {errors.organizerPhone && <span className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3"/>{errors.organizerPhone.message}</span>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
            >
              Broadcast Listing
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}