import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  PlusCircle,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FolderHeart,
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { api } from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';
import { useAppStore } from '../store/useAppStore';
import { translations } from '../i18n/translations';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, language } = useAppStore();
  const t = translations[language] || translations.en;

  const { data: wounds = [], isLoading } = useQuery({
    queryKey: ['wounds'],
    queryFn: () => api.listWounds()
  });

  // Calculate high level metrics
  const totalWounds = wounds.length;
  const activeWounds = wounds.filter((w) => w.is_active).length;
  const latestEntryWound = wounds.find((w) => w.latest_entry);
  const latestRisk = latestEntryWound?.latest_entry?.ai_risk_level || 'stable';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/70 p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                Active Clinical Telemetry
              </span>
              <span className="text-slate-400 text-xs">Patient ID: {user?.id ? user.id.substring(0, 8) : '00000000'}...</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name || 'Patient'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Your remote wound monitoring dashboard tracks tissue granulation, pain progression, and infection risks calibrated against the clinical TIME framework.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {wounds.length > 0 && (
              <button
                onClick={() => navigate(`/wounds/${wounds[0].id}/new-entry`)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-teal-500/25 hover:scale-105 active:scale-95 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t.navNewEntry}</span>
              </button>
            )}

            <button
              onClick={() => navigate('/hospitals')}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-teal-300 border border-slate-700 font-semibold text-xs sm:text-sm transition-colors"
            >
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>{t.navHospitals}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Wounds */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tracked Conditions</span>
            <FolderHeart className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {activeWounds} <span className="text-xs font-normal text-slate-400">Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalWounds} total registered wound sites
          </p>
        </div>

        {/* Card 2: Latest Risk Tier */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Current Risk Status</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2">
            <RiskBadge level={latestRisk} size="lg" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Calibrated on latest visual capture
          </p>
        </div>

        {/* Card 3: Granulation Trajectory */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tissue Granulation</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            {latestEntryWound?.latest_entry?.ai_granulation_percentage ?? 85}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Healthy revascularized wound bed
          </p>
        </div>

        {/* Card 4: Next Scheduled Check-in */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Routine Check-in</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            Today
          </div>
          <p className="text-[11px] text-teal-400 mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Daily photo capture recommended</span>
          </p>
        </div>
      </div>

      {/* Main Section: Tracked Wounds Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderHeart className="w-5 h-5 text-teal-400" />
              <span>Tracked Wound Conditions</span>
            </h2>
            <p className="text-xs text-slate-400">
              Select a wound to inspect chronological timeline, visual diffs, and doctor sharing.
            </p>
          </div>
          <button
            onClick={() => navigate('/wounds')}
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
          >
            <span>View All Wounds</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading clinical wounds...</div>
        ) : wounds.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-3xl border border-slate-800 space-y-3">
            <p className="text-sm text-slate-300">No active wounds registered for this patient profile.</p>
            <button
              onClick={() => navigate('/wounds')}
              className="px-4 py-2 bg-teal-500 text-slate-950 rounded-xl font-bold text-xs"
            >
              Register New Wound
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {wounds.map((wound) => {
              const latest = wound.latest_entry;
              return (
                <div
                  key={wound.id}
                  className="glass-card rounded-3xl p-5 border border-slate-800 hover:border-slate-700 shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-950/80 text-teal-400 border border-teal-800/60">
                            {wound.wound_type}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {wound.anatomical_location}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1 group-hover:text-teal-300 transition-colors">
                          {wound.wound_name}
                        </h3>
                      </div>

                      {latest && (
                        <RiskBadge level={latest.ai_risk_level} reasoning={latest.ai_risk_reasoning} />
                      )}
                    </div>

                    {/* Latest Entry Card Preview */}
                    {latest ? (
                      <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 flex items-center gap-3 mt-2">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-700/60">
                          <img
                            src={latest.image_url}
                            alt="Latest Wound"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">
                              Latest Update: {latest.entry_date.split('T')[0]}
                            </span>
                            <span className="font-mono text-teal-300 font-bold text-xs">
                              Pain: {latest.pain_score}/10
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                            {latest.ai_change_detection_summary || latest.ai_risk_reasoning}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-950/40 rounded-2xl text-xs text-slate-400 italic">
                        No entries recorded yet. Tap below to submit initial baseline photo.
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/wounds/${wound.id}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <span>Timeline &amp; SBAR</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>

                      {(wound.entry_count ?? 0) >= 2 && (
                        <Link
                          to={`/wounds/${wound.id}/compare`}
                          className="px-3 py-1.5 rounded-xl bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 text-xs font-semibold border border-teal-800/50 transition-colors flex items-center gap-1"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Visual Diff</span>
                        </Link>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/wounds/${wound.id}/new-entry`)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-extrabold shadow transition-transform active:scale-95 flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ New Update</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clinical Safety Protocol Footnote */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-200">
            Clinical Safety &amp; Non-Diagnostic Protocol
          </span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {t.nonDiagnosticDisclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
