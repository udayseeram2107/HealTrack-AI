import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  Clock,
  Printer,
  FileText,
  AlertTriangle,
  HeartPulse,
  Activity,
  Calendar,
  Sparkles,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';

export const PublicDoctorPortalPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number>(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['sharedWound', token],
    queryFn: () => (token ? api.getSharedData(token) : null),
    enabled: !!token,
    retry: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <HeartPulse className="w-10 h-10 text-teal-400 animate-pulse" />
        <h3 className="text-base font-bold text-white">
          Verifying Cryptographic Doctor-Share Token...
        </h3>
        <p className="text-xs text-slate-400">
          Decrypting sanitized longitudinal wound telemetry for clinical review.
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card rounded-3xl p-8 border border-red-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-950 text-red-400 border border-red-700/60 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white">Access Token Expired or Invalid</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            This tokenized doctor-share portal link has expired or reached its maximum validity period. For patient privacy and HIPAA compliance, time-limited clinical tokens automatically self-revoke.
          </p>
          <div className="p-3 bg-slate-950/80 rounded-xl text-[11px] text-slate-400 border border-slate-800">
            Please request a renewed zero-knowledge share link from the patient or attending hospital staff.
          </div>
        </div>
      </div>
    );
  }

  const { wound, entries = [], sbarSummary, shareInfo } = data;
  const activeEntry = entries[selectedEntryIndex] || entries[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Professional Physician Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  HealTrack AI
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                  Attending Clinician View
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Zero-Knowledge Encrypted Clinical Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="text-right text-[11px] hidden sm:block">
              <div className="text-slate-400">Valid until:</div>
              <div className="text-teal-300 font-mono font-semibold">
                {new Date(shareInfo.expires_at).toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors shadow"
            >
              <Printer className="w-3.5 h-3.5 text-teal-400" />
              <span>Print / Export Memo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 animate-in fade-in duration-300">
        {/* Patient / Wound Header Banner */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-teal-950 text-teal-300 border border-teal-800 text-xs font-bold">
                  {wound.wound_type}
                </span>
                <span className="text-xs text-slate-400">
                  Site: {wound.anatomical_location}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Onset: {wound.initial_onset_date || 'Documented at procedure'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {wound.wound_name}
              </h1>
              {wound.baseline_notes && (
                <p className="text-xs text-slate-300 mt-1 max-w-3xl italic">
                  Clinical History &amp; Baseline: "{wound.baseline_notes}"
                </p>
              )}
            </div>

            {activeEntry && (
              <RiskBadge
                level={activeEntry.ai_risk_level}
                reasoning={activeEntry.ai_risk_reasoning}
                size="lg"
              />
            )}
          </div>
        </div>

        {/* Physician SBAR Clinical Summary Section */}
        {sbarSummary && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-sky-500/30 bg-slate-900/90 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Physician SBAR Executive Clinical Summary
                </h3>
                <p className="text-xs text-slate-400">
                  Automated synthesis across {entries.length} longitudinal telemetry captures
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Situation */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-extrabold text-sky-400 uppercase tracking-wider text-[11px]">
                  S — Situation
                </span>
                <p className="text-slate-200 leading-relaxed">{sbarSummary.situation}</p>
              </div>

              {/* Background */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-extrabold text-teal-400 uppercase tracking-wider text-[11px]">
                  B — Background
                </span>
                <p className="text-slate-200 leading-relaxed">{sbarSummary.background}</p>
              </div>

              {/* Assessment */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px]">
                  A — Assessment
                </span>
                <p className="text-slate-200 leading-relaxed">{sbarSummary.assessment}</p>
              </div>

              {/* Recommendation */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px]">
                  R — Recommendation
                </span>
                <p className="text-slate-200 leading-relaxed">{sbarSummary.recommendation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Longitudinal Entry Viewer */}
        {activeEntry && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Chronological Telemetry Detail ({activeEntry.entry_date.split('T')[0]})
                </h3>
                <span className="text-xs text-slate-400">
                  Viewing entry {selectedEntryIndex + 1} of {entries.length}
                </span>
              </div>

              {/* Entry selector pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {entries.map((entry, idx) => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntryIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      selectedEntryIndex === idx
                        ? 'bg-teal-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Day #{entries.length - idx} ({entry.entry_date.split('T')[0].substring(5)})
                  </button>
                ))}
              </div>
            </div>

            {/* Entry Details & Image */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* High-res image */}
              <div className="lg:col-span-6 h-80 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                <img
                  src={activeEntry.image_url}
                  alt="Clinical observation"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Telemetry and tissue parameters */}
              <div className="lg:col-span-6 space-y-4">
                {/* TIME Tissue composition */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    TIME Tissue Breakdown
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-emerald-400 font-semibold">Granulation</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {activeEntry.ai_granulation_percentage ?? 0}%
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-amber-400 font-semibold">Slough</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {activeEntry.ai_slough_percentage ?? 0}%
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-rose-400 font-semibold">Necrosis</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {activeEntry.ai_necrosis_percentage ?? 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient reported values */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Pain NRS</div>
                    <div className="text-base font-bold text-teal-300 mt-1">
                      {activeEntry.pain_score} / 10
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Exudate</div>
                    <div className="text-xs font-bold text-white mt-1 capitalize truncate">
                      {activeEntry.exudate_level}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Odor</div>
                    <div className="text-xs font-bold text-white mt-1 capitalize truncate">
                      {activeEntry.odor_level}
                    </div>
                  </div>
                </div>

                {/* Patient Notes */}
                {activeEntry.patient_notes && (
                  <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 text-xs">
                    <span className="font-bold text-slate-300 block mb-1">
                      Patient Reported Symptoms &amp; Notes:
                    </span>
                    <p className="text-slate-400 italic">"{activeEntry.patient_notes}"</p>
                  </div>
                )}

                {/* Clinical reasoning */}
                <div className="p-3.5 bg-teal-950/30 rounded-2xl border border-teal-800/40 text-xs">
                  <span className="font-bold text-teal-300 block mb-1">
                    AI Clinical Decision Support Rationale:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {activeEntry.ai_risk_reasoning}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security & HIPAA Compliance Notice */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero-Knowledge Consultation Session: Patient account credentials isolated.</span>
          </div>
          <span className="font-mono text-slate-500 text-[11px]">
            Token Ref: {token?.substring(0, 12)}...
          </span>
        </div>
      </div>
    </div>
  );
};
