import React from 'react';
import {
  MapPin,
  Phone,
  Navigation,
  Star,
  ShieldAlert,
  Building2,
  ExternalLink
} from 'lucide-react';
import { VerifiedFacility } from '@/shared/index.js';

interface DoctorCardProps {
  facility: VerifiedFacility & { distance_km: number };
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ facility }) => {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`;

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all shadow-xl hover:shadow-2xl flex flex-col justify-between group">
      <div>
        {/* Badges row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {facility.is_emergency_capable && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-700/60 text-[11px] font-bold">
                <ShieldAlert className="w-3 h-3 text-red-400" />
                <span>24/7 Trauma / Emergency</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
              <Building2 className="w-2.5 h-2.5 text-teal-400" />
              <span>Verified Facility</span>
            </span>
          </div>

          {/* Distance */}
          <span className="text-xs font-bold text-teal-400 font-mono shrink-0">
            {facility.distance_km} km away
          </span>
        </div>

        {/* Facility Name */}
        <h4 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
          {facility.name}
        </h4>

        {/* Formatted Address */}
        <div className="flex items-start gap-1.5 mt-2 text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-relaxed">{facility.formatted_address}</span>
        </div>

        {/* Rating if available */}
        {facility.rating !== undefined && facility.rating !== null && (
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-amber-300">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-bold">{facility.rating}</span>
            {facility.user_ratings_total && (
              <span className="text-slate-500 text-[11px]">
                ({facility.user_ratings_total} Google reviews)
              </span>
            )}
          </div>
        )}

        {/* Specialties Badges */}
        {facility.supported_specialties && facility.supported_specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-800/80">
            {facility.supported_specialties.map((spec, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-teal-950/60 text-teal-300 text-[10px] font-medium border border-teal-800/40"
              >
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center gap-2">
        {facility.phone_number ? (
          <a
            href={`tel:${facility.phone_number}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Clinic</span>
          </a>
        ) : (
          <a
            href="tel:112"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Dispatch</span>
          </a>
        )}

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Directions</span>
          <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
        </a>
      </div>
    </div>
  );
};
