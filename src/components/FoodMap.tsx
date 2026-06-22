// src/components/FoodMap.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FoodListing } from '@/lib/types';
import { Clock, MapPin, HeartHandshake, Tractor, Recycle } from 'lucide-react';

// Fix for default custom map markers in Leaflet under Next.js
const customIcon = (tier: number) => {
  const color = tier === 1 ? '#10b981' : tier === 2 ? '#f59e0b' : '#3b82f6';
  const glow = tier === 1 ? 'rgba(16,185,129,0.5)' : tier === 2 ? 'rgba(245,158,11,0.5)' : 'rgba(59,130,246,0.5)';
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: 0; background-color: ${glow}; border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #0f172a; box-shadow: 0 0 15px ${glow}; display: flex; align-items: center; justify-content: center; color: #0f172a; font-weight: 900; font-size: 11px; z-index: 10;">
          ${tier}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const CountdownTimer = ({ expiryTime, status }: { expiryTime: string, status: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (status !== 'available') {
      setTimeLeft(status === 'claimed' ? 'Claimed' : 'Expired');
      return;
    }
    const update = () => {
      const diff = new Date(expiryTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Escalating...');
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiryTime, status]);

  return <span className="font-mono">{timeLeft}</span>;
};

interface FoodMapProps {
  listings: FoodListing[];
  onClaim: (id: string, tier: number) => void;
  userLocation?: { lat: number, lng: number } | null;
}

export default function FoodMap({ listings, onClaim, userLocation }: FoodMapProps) {
  const [selectedListing, setSelectedListing] = React.useState<FoodListing | null>(null);

  // Center coordinate (Dynamic based on user or Downtown Hub fallback)
  const centerLat = userLocation ? userLocation.lat : 12.9716;
  const centerLng = userLocation ? userLocation.lng : 77.5946;

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
            eventHandlers={{
              click: () => setSelectedListing(item),
            }}
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
                  <div className="flex items-center gap-1"><Clock className="h-2.5 w-2.5 text-amber-600"/> Exp: <CountdownTimer expiryTime={item.expiryTime} status={item.status} /></div>
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

        {/* Dynamic Route Preview */}
        {userLocation && selectedListing && (
          <Polyline 
            positions={[
              [userLocation.lat, userLocation.lng],
              [selectedListing.latitude, selectedListing.longitude]
            ]} 
            pathOptions={{ color: '#3b82f6', dashArray: '5, 10', weight: 3 }} 
          />
        )}

        {/* User GPS Location Marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'custom-leaflet-marker',
              html: `
                <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
                  <div style="position: absolute; inset: -4px; background-color: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                  <div style="position: relative; background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); z-index: 10;"></div>
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
          >
            <Popup className="custom-popup">
              <div className="p-1 text-slate-900 font-sans text-xs font-bold text-center">Your Live GPS Location</div>
            </Popup>
          </Marker>
        )}
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