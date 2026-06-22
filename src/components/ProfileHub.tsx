import React from 'react';
import { FoodListing, UserProfile } from '@/lib/types';
import { History, LogOut, Download } from 'lucide-react';
import { downloadCSV } from '@/lib/export';
import { toast } from 'sonner';

interface ProfileHubProps {
  currentUser: UserProfile;
  listings: FoodListing[];
  handleSignOut: () => void;
}

export const ProfileHub = ({ currentUser, listings, handleSignOut }: ProfileHubProps) => {
  const userListings = listings.filter(l => currentUser.role === 'organizer' ? l.organizerId === currentUser.id : l.claimedByName?.includes(currentUser.name));

  const handleExport = () => {
    downloadCSV(userListings, `foodorbit-personal-records-${currentUser.name}.csv`);
    toast.success('Personal Records Downloaded successfully');
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg font-bold text-2xl">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{currentUser.name}</h2>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-emerald-400 uppercase tracking-widest">{currentUser.role}</span>
                <span>•</span>
                <span>{currentUser.organizationName || currentUser.email}</span>
              </div>
            </div>
          </div>
          <button onClick={handleSignOut} className="px-4 py-2 flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all">
            <LogOut className="h-4 w-4"/> Sign Out
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <History className="h-4 w-4 text-emerald-500"/>
              {currentUser.role === 'organizer' ? 'Your Broadcasted Batches' : 'Your Claimed Batches'}
            </h3>
            <button onClick={handleExport} disabled={userListings.length === 0} className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors">
              <Download className="h-3.5 w-3.5"/> Export Data
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userListings.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-slate-500 italic border border-dashed border-slate-800 rounded-xl">No active records found for your account.</div>
            ) : (
              userListings.map(item => (
                <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                    <span className="text-xs text-slate-400 font-mono">Tier {item.tier} • {item.quantity}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${item.status === 'claimed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
