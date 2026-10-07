import React, { useState } from 'react';
import {
  MapPin,
  ShieldAlert,
  Building2,
  Navigation,
  ExternalLink,
  Compass,
  Layers,
  Map as MapIcon,
  Crosshair,
  Maximize2
} from 'lucide-react';
import { VerifiedFacility } from '../../../../shared/index.js';

interface HospitalDirectoryMapProps {
  facilities: (VerifiedFacility & { distance_km: number })[];
  userLat: number;
  userLng: number;
  locationName?: string;
  selectedFacility: (VerifiedFacility & { distance_km: number }) | null;
  onSelectFacility: (facility: (VerifiedFacility & { distance_km: number }) | null) => void;
  searchSpecialty?: string;
}

export const HospitalDirectoryMap: React.FC<HospitalDirectoryMapProps> = ({
  facilities,
  userLat,
  userLng,
  locationName = 'Current GPS Location',
  selectedFacility,
  onSelectFacility,
  searchSpecialty = ''
}) => {
  const [viewMode, setViewMode] = useState<'google-embed' | 'radar'>('google-embed');

  // Google Maps embed URL using the user's current GPS location (no API key required)
  const searchQuery = searchSpecialty
    ? `${searchSpecialty} hospital`
    : 'hospitals emergency wound care trauma center';

  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    searchQuery
  )}+near+${userLat},${userLng}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const googleMapsAppUrl = `https://www.google.com/maps/search/${encodeURIComponent(
    searchQuery
  )}/@${userLat},${userLng},14z`;

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-slate-800 shadow-2xl space-y-0 relative">
      {/* Top Header & Controls */}
      <div className="p-3.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Google Maps Live Location</span>
              <span className="text-[10px] text-teal-400 font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-950 border border-teal-800">
                GPS: {userLat.toFixed(4)}, {userLng.toFixed(4)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Centered on: <strong className="text-slate-200">{locationName}</strong>
            </p>
          </div>
        </div>

        {/* View mode toggle and Google Maps Direct App Link */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-800 p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('google-embed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'google-embed'
                  ? 'bg-teal-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Google Maps View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('radar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'radar'
                  ? 'bg-teal-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Radar Pins ({facilities.length})</span>
            </button>
          </div>

          <a
            href={googleMapsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-semibold transition-colors"
            title="Open in Google Maps App"
          >
            <span>Open in App</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Map Display */}
      {viewMode === 'google-embed' ? (
        <div className="relative w-full h-80 sm:h-[420px] bg-slate-950 overflow-hidden">
          <iframe
            title="Google Maps Current Location"
            src={googleMapsEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'contrast(102%) brightness(95%)' }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />

          {/* Floating location badge overlay */}
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700 text-xs text-white shadow-xl flex items-center gap-2 pointer-events-none">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
            <span className="font-semibold">Live Google Maps</span>
            <span className="text-slate-400 text-[11px]">| Hospitals &amp; Clinics</span>
          </div>
        </div>
      ) : (
        /* Radar / Visual Pins View */
        <div className="relative w-full h-80 sm:h-[420px] bg-slate-950 overflow-hidden flex items-center justify-center select-none">
          {/* Radar background grid */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #14b8a6 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Concentric rings centered on GPS position */}
          <div className="absolute w-44 h-44 rounded-full border border-teal-500/25 animate-ping opacity-20" />
          <div className="absolute w-60 h-60 rounded-full border border-teal-500/25" />
          <div className="absolute w-96 h-96 rounded-full border border-teal-500/10" />

          {/* User GPS Center Pin */}
          <div className="absolute z-20 flex flex-col items-center pointer-events-none">
            <div className="w-4 h-4 rounded-full bg-teal-400 ring-4 ring-teal-500/40 shadow-[0_0_15px_rgba(45,212,191,0.9)]" />
            <span className="text-[10px] font-bold text-teal-300 bg-slate-950/90 px-2 py-0.5 rounded-full mt-1 border border-teal-800 shadow">
              You Are Here
            </span>
          </div>

          {/* Facility Markers */}
          {facilities.map((fac, idx) => {
            const dLat = fac.latitude - userLat;
            const dLng = fac.longitude - userLng;
            const topPercent = Math.max(12, Math.min(88, 50 - dLat * 2400));
            const leftPercent = Math.max(12, Math.min(88, 50 + dLng * 2400));
            const isSelected = selectedFacility?.id === fac.id;

            return (
              <div
                key={fac.id || idx}
                onClick={() => onSelectFacility(fac)}
                style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 group ${
                  isSelected ? 'scale-125 z-40' : 'hover:scale-110'
                }`}
              >
                <div
                  className={`p-2 rounded-full border-2 shadow-xl flex items-center justify-center transition-all ${
                    fac.is_emergency_capable
                      ? isSelected
                        ? 'bg-red-600 text-white border-white ring-4 ring-red-500/50 shadow-red-500/50'
                        : 'bg-red-950 text-red-400 border-red-500 hover:bg-red-900'
                      : isSelected
                      ? 'bg-teal-500 text-slate-950 border-white ring-4 ring-teal-500/50 shadow-teal-500/50'
                      : 'bg-slate-900 text-teal-400 border-teal-500/70 hover:bg-slate-800'
                  }`}
                >
                  {fac.is_emergency_capable ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : (
                    <Building2 className="w-4 h-4" />
                  )}
                </div>

                {/* Tooltip on hover */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-44 p-2 rounded-xl bg-slate-900/95 border border-slate-700 text-[11px] shadow-2xl pointer-events-none transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <div className="font-bold text-white truncate">{fac.name}</div>
                  <div className="text-teal-400 font-mono text-[10px]">{fac.distance_km} km away</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Facility Details Ribbon */}
      {selectedFacility && (
        <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in slide-in-from-bottom duration-200">
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span className="text-sm">{selectedFacility.name}</span>
              {selectedFacility.is_emergency_capable && (
                <span className="text-[10px] text-red-400 font-semibold px-2 py-0.5 rounded bg-red-950 border border-red-800">
                  24/7 Trauma / Emergency
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-lg mt-0.5">
              {selectedFacility.formatted_address} ({selectedFacility.distance_km} km away)
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.latitude},${selectedFacility.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-xl shadow transition-all active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions on Google Maps</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
