import React from 'react';
import { FoodListing, AuditLog } from '@/lib/types';
import { BarChart3, Wind, Tractor, Recycle, Activity, History } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { downloadCSV } from '@/lib/export';
import { toast } from 'sonner';

interface AnalyticsDashboardProps {
  listings: FoodListing[];
  metrics: {
    totalRescuedKg: number;
    co2SavedKg: number;
  };
  auditLogs: AuditLog[];
}

export const AnalyticsDashboard = ({ listings, metrics, auditLogs }: AnalyticsDashboardProps) => {
  const handleExport = () => {
    downloadCSV(listings, 'foodorbit-analytics-export.csv');
    toast.success('CSR Impact Report Downloaded successfully');
  };

  return (
    <div className="space-y-6">
      
      {/* Metrics Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 className="w-20 h-20"/></div>
          <h5 className="font-bold text-white text-sm mb-2 flex items-center gap-2"><Wind className="h-4 w-4 text-emerald-400"/> Methane Diversion</h5>
          <p className="text-xs text-slate-400 leading-relaxed relative z-10">
            By routing <strong className="text-emerald-400">{metrics.totalRescuedKg} kg</strong> of organic surplus away from municipal dumps, FoodOrbit prevented <strong className="text-emerald-400">{metrics.co2SavedKg} kg</strong> of greenhouse gases.
          </p>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Tractor className="w-20 h-20"/></div>
          <h5 className="font-bold text-white text-sm mb-2 flex items-center gap-2"><Tractor className="h-4 w-4 text-amber-400"/> Agricultural Feed</h5>
          <p className="text-xs text-slate-400 leading-relaxed relative z-10">
            Tier 2 routing successfully delivered unseasoned kilocalories to local livestock sanctuaries, directly lowering farm feed overhead.
          </p>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Recycle className="w-20 h-20"/></div>
          <h5 className="font-bold text-white text-sm mb-2 flex items-center gap-2"><Recycle className="h-4 w-4 text-blue-400"/> Compost Remineralization</h5>
          <p className="text-xs text-slate-400 leading-relaxed relative z-10">
            Tier 3 collections yield rich, nitrogen-dense topsoil fertilizer distributed back to community garden cooperatives.
          </p>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Donut Chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-lg lg:col-span-1">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2"><Activity className="h-4 w-4 text-amber-500"/> Active Tier Distribution</h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Tier 1: Human', value: listings.filter(l => l.tier === 1).length, color: '#10b981' },
                    { name: 'Tier 2: Animal', value: listings.filter(l => l.tier === 2).length, color: '#f59e0b' },
                    { name: 'Tier 3: Compost', value: listings.filter(l => l.tier === 3).length, color: '#3b82f6' }
                  ]}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  { [
                      { name: 'Tier 1: Human', value: listings.filter(l => l.tier === 1).length, color: '#10b981' },
                      { name: 'Tier 2: Animal', value: listings.filter(l => l.tier === 2).length, color: '#f59e0b' },
                      { name: 'Tier 3: Compost', value: listings.filter(l => l.tier === 3).length, color: '#3b82f6' }
                    ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Area Chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-lg lg:col-span-2">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-emerald-500"/> Impact Accumulation (Kg Rescued)</h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[...listings].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((l, i, arr) => {
                  const sumKg = arr.slice(0, i+1).reduce((s, curr) => s + (parseInt(curr.quantity) || 45), 0);
                  return { name: new Date(l.createdAt).toLocaleDateString(), rescuedKg: sumKg };
                })}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRescued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="rescuedKg" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRescued)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Audit Logging Ledger */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><History className="h-4 w-4 text-slate-400"/> System Activity & Audit Ledger</h4>
          <div className="flex items-center gap-3">
            <button onClick={handleExport} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1 rounded font-bold uppercase tracking-widest transition-colors">Export CSV</button>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono uppercase tracking-widest">Immutable</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/50 text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">Timestamp</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">Action</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">Entity</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">Actor</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider w-1/3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500 italic">Awaiting network activity...</td></tr>
              ) : (
                auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-widest ${log.action === 'CREATE' ? 'bg-blue-500/10 text-blue-400' : log.action === 'CLAIM' ? 'bg-emerald-500/10 text-emerald-400' : log.action === 'DELETE' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white font-medium">{log.entityName}</td>
                    <td className="px-5 py-3 text-slate-300">{log.actorName}</td>
                    <td className="px-5 py-3 text-slate-400">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
