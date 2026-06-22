import React, { useState, useRef, useEffect } from 'react';
import { Bell, Activity, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuditLog, EscalationLog } from '@/lib/types';

interface NotificationCenterProps {
  auditLogs: AuditLog[];
  escalationLogs: EscalationLog[];
}

export const NotificationCenter = ({ auditLogs, escalationLogs }: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Combine logs into a single feed and sort by time (newest first)
  const combinedFeed = [
    ...auditLogs.map(l => ({ ...l, type: 'audit' as const, time: new Date(l.createdAt).getTime() })),
    ...escalationLogs.map(l => ({ ...l, type: 'escalation' as const, time: new Date(l.createdAt).getTime() }))
  ].sort((a, b) => b.time - a.time).slice(0, 10);

  useEffect(() => {
    // If new logs arrive while closed, show unread badge
    if (!isOpen && combinedFeed.length > 0) {
      setHasUnread(true);
    }
  }, [combinedFeed.length, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setHasUnread(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative p-2 rounded-xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        title="Notification Center"
      >
        <Bell className="h-4 w-4" />
        {hasUnread && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-slate-900"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 transform origin-top-right transition-all">
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              Activity Feed
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Live</span>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {combinedFeed.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm italic">
                No recent activity.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {combinedFeed.map(item => (
                  <div key={item.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                    {item.type === 'audit' ? (
                      <div className="flex gap-3">
                        <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${item.action === 'CREATE' ? 'bg-blue-500/20 text-blue-400' : item.action === 'CLAIM' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {item.action === 'CLAIM' ? <CheckCircle2 className="h-3 w-3" /> : item.action === 'CREATE' ? <Activity className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        </div>
                        <div>
                          <p className="text-xs text-slate-300">
                            <strong className="text-white">{item.actorName}</strong> {item.action.toLowerCase()}d <strong className="text-white">{item.entityName}</strong>
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">{new Date(item.time).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <div className="mt-1 h-6 w-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          <ArrowRight className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-300">
                            System auto-escalated <strong className="text-white">{item.listingTitle}</strong> to <strong className="text-amber-400">Tier {item.newTier === 'expired' ? 'Expired' : item.newTier}</strong> due to expiration timeout.
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">{new Date(item.time).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
