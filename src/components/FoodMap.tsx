// src/components/FoodMap.tsx
'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FoodListing } from '@/lib/types';
import { Clock, MapPin, Phone, HeartHandshake, Tractor, Recycle } from 'lucide-react';

// Fix for default custom map markers in Leaflet under Next.js
const customIcon = (tier: number) => {
  const color = tier === 1 ? '#10b981' : tier === 2 ? '#f59e0b' : '#3b82f6';
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #0f172a; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">${tier}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface FoodMapProps {
  listings: FoodListing[];
  onClaim: (id: string, tier: number) => void;
}

export default function FoodMap({ listings, onClaim }: FoodMapProps) {
  // Center coordinate (Downtown Hub)
  const centerLat = 12.9716;
  const centerLng = 77.5946;

  // Cleanup Leaflet internal bugs on dismount
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  const availableListings = listings.filter(l => l.status === 'available');

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-slate-800 relative shadow-2xl z-10 bg-slate-950">
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={12} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* Dark Mode OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Operational Priority Radiuses */}
        {/* Tier 1: 5km Priority Circle */}
        <Circle 
          center={[centerLat, centerLng]} 
          pathOptions={{ fillColor: '#10b981', fillOpacity: 0.08, color: '#10b981', weight: 2, dashArray: '4' }} 
          radius={5000} 
        />
        {/* Tier 2: 10km Secondary Circle */}
        <Circle 
          center={[centerLat, centerLng]} 
          pathOptions={{ fillColor: '#f59e0b', fillOpacity: 0.05, color: '#f59e0b', weight: 1.5, dashArray: '4' }} 
          radius={10000} 
        />
        {/* Tier 3: 15km Max Boundary */}
        <Circle 
          center={[centerLat, centerLng]} 
          pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.03, color: '#3b82f6', weight: 1 }} 
          radius={15000} 
        />

        {/* Map Markers for Surplus Batches */}
        {availableListings.map((item) => (
          <Marker 
            key={item.id} 
            position={[item.latitude, item.longitude]}
            icon={customIcon(item.tier)}
          >
            <Popup className="custom-popup">
              <div className="p-1 max-w-xs text-slate-900 font-sans">
                <div className="flex items-center gap-1.5 mb-1 text-xs font-bold uppercase tracking-wider">
                  {item.tier === 1 ? (
                    <span className="text-emerald-700 flex items-center gap-1"><HeartHandshake className="h-3 w-3"/> Tier 1 (Human)</span>
                  ) : item.tier === 2 ? (
                    <span className="text-amber-700 flex items-center gap-1"><Tractor className="h-3 w-3"/> Tier 2 (Animal)</span>
                  ) : (
                    <span className="text-blue-700 flex items-center gap-1"><Recycle className="h-3 w-3"/> Tier 3 (Compost)</span>
                  )}
                </div>

                <h4 className="font-extrabold text-base leading-tight mb-1">{item.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2 mb-2">{item.description}</p>
                
                <div className="space-y-0.5 text-[11px] text-slate-500 mb-3 bg-slate-100 p-1.5 rounded">
                  <div className="font-bold text-slate-800">Qty: {item.quantity}</div>
                  <div className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5 text-slate-400"/> {item.address}</div>
                  <div className="flex items-center gap-1"><Clock className="h-2.5 w-2.5 text-amber-600"/> Exp: {new Date(item.expiryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>

                <button
                  onClick={() => onClaim(item.id, item.tier)}
                  className={`w-full py-2 px-3 rounded-lg font-bold text-xs text-white shadow transition-all ${
                    item.tier === 1 ? 'bg-emerald-600 hover:bg-emerald-500' : item.tier === 2 ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  Dispatch Driver Coordinates
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 z-[400] bg-slate-950/90 border border-slate-800 backdrop-blur p-3 rounded-xl shadow-lg text-xs space-y-1.5 text-slate-300">
        <div className="font-bold text-white border-b border-slate-800 pb-1 mb-2">Live Radius Perimeters</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"/> Tier 1: 5km (NGOs)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"/> Tier 2: 10km (Farmers)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"/> Tier 3: 15km (Compost)</div>
      </div>
    </div>
  );
}