import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  PlusCircle,
  Share2,
  Layers,
  FileText,
  Clock,
  Sparkles,
  Activity,
  AlertTriangle,
  Stethoscope,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Volume2
} from 'lucide-react';
import { api } from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';
import { DoctorShareModal } from '../components/sharing/DoctorShareModal';
import { CareGuidanceAccordion } from '../components/entry/CareGuidanceAccordion';
import { SBARSummary } from '../../../shared/index.js';
import { useAppStore } from '../store/useAppStore';
import { translations } from '../i18n/translations';

export const WoundDetailPage: React.FC = () => {
  const { woundId } = useParams<{ woundId: string }>();
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = translations[language] || translations.en;

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sbarModalOpen, setSbarModalOpen] = useState(false);
  const [sbarData, setSbarData] = useState<SBARSummary | null>(null);
  const [loadingSbar, setLoadingSbar] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const { data: woundData, isLoading, refetch } = useQuery({
    queryKey: ['wound', woundId],
    queryFn: () => (woundId ? api.getWound(woundId) : null),
    enabled: !!woundId
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading wound timeline...
      </div>
    );
  }

  if (!woundData) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sm text-slate-300">Wound record not found.</p>
        <button
          onClick={() => navigate('/wounds')}
          className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl"
        >
          Return to Wounds Portfolio
        </button>
      </div>
    );
  }

  const entries = woundData.entries || [];
  const latestEntry = entries[0];
  const activeEntry = entries.find((e) => e.id === selectedEntryId) || latestEntry;

  const handleGenerateSbar = async () => {
    if (!woundId) return;
    setLoadingSbar(true);
    setSbarModalOpen(true);
    try {
      const res = await api.getWoundSummary(woundId);
      setSbarData(res.summary);
    } catch (e) {
      console.error('Failed to generate SBAR summary', e);
    } finally {
      setLoadingSbar(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <button
            onClick={() => navigate('/wounds')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Wounds Portfolio</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-teal-950/80 text-teal-400 border border-teal-800/60 text-xs font-bold">
              {woundData.wound_type}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{woundData.anatomical_location}</span>
            </span>
            {latestEntry && (
              <RiskBadge level={latestEntry.ai_risk_level} reasoning={latestEntry.ai_risk_reasoning} />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {woundData.wound_name}
          </h1>

          {woundData.baseline_notes && (
            <p className="text-xs text-slate-300 mt-1 max-w-2xl italic">
              Baseline Etiology: "{woundData.baseline_notes}"
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Visual Diff Comparison (if >= 2 entries) */}
          {entries.length >= 2 && (
            <Link
              to={`/wounds/${woundId}/compare`}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-semibold text-xs transition-colors"
            >
              <Layers className="w-4 h-4 text-teal-400" />
              <span>{t.compareButton}</span>
            </Link>
          )}

          {/* SBAR Physician Memo Button */}
          {entries.length > 0 && (
            <button
              onClick={handleGenerateSbar}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-950/60 hover:bg-sky-900/60 text-sky-200 border border-sky-800/60 font-semibold text-xs transition-colors"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Generate SBAR Memo</span>
            </button>
          )}

          {/* Doctor Share Token Trigger */}
          <button
            onClick={() => setShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
          >
            <Share2 className="w-4 h-4 text-teal-400" />
            <span>Doctor Share QR</span>
          </button>

          {/* Add Daily Entry Trigger */}
          <button
            onClick={() => navigate(`/wounds/${woundId}/new-entry`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.navNewEntry}</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Active Selected Entry Details & Chronological Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Main Column: Selected Entry Inspection (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeEntry ? (
            <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      Observation Telemetry: {new Date(activeEntry.entry_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    {activeEntry.id === latestEntry?.id && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                        Latest
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Recorded Language: {activeEntry.recorded_language.toUpperCase()}
                  </span>
                </div>

                <RiskBadge level={activeEntry.ai_risk_level} reasoning={activeEntry.ai_risk_reasoning} size="lg" />
              </div>

              {/* Photo & Tissue Composition Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center relative group">
                  <img
                    src={activeEntry.image_url}
                    alt="Wound Capture"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md text-[10px] text-teal-300 font-mono border border-slate-800">
                    High-Res Telemetry Capture
                  </div>
                </div>

                {/* Tissue Breakdown & TIME Metrics */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-3">
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                      <span>TIME Tissue Composition</span>
                      <span className="text-teal-400 font-mono text-[11px]">Est. %</span>
                    </div>

                    {/* Granulation Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span>Granulation (Healthy)</span>
                        </span>
                        <span className="font-bold text-emerald-400">
                          {activeEntry.ai_granulation_percentage ?? 0}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${activeEntry.ai_granulation_percentage ?? 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Slough Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span>Slough (Fibrinous)</span>
                        </span>
                        <span className="font-bold text-amber-400">
                          {activeEntry.ai_slough_percentage ?? 0}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${activeEntry.ai_slough_percentage ?? 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Necrosis Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                          <span>Necrosis (Eschar)</span>
                        </span>
                        <span className="font-bold text-rose-400">
                          {activeEntry.ai_necrosis_percentage ?? 0}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-rose-600 rounded-full transition-all duration-500"
                          style={{ width: `${activeEntry.ai_necrosis_percentage ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Patient Symptoms Telemetry Pills */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Pain Score</div>
                      <div className="text-base font-extrabold text-teal-300 mt-0.5">
                        {activeEntry.pain_score} / 10
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Exudate</div>
                      <div className="text-xs font-bold text-slate-200 mt-1 capitalize truncate">
                        {activeEntry.exudate_level}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Odor</div>
                      <div className="text-xs font-bold text-slate-200 mt-1 capitalize truncate">
                        {activeEntry.odor_level}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Voice Journal / Notes */}
              {(activeEntry.raw_voice_transcript || activeEntry.patient_notes) && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="text-xs font-bold text-teal-300 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span>Patient Multilingual Journal / Notes</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{activeEntry.patient_notes || activeEntry.raw_voice_transcript}"
                  </p>
                </div>
              )}

              {/* Visual Change Detection Summary */}
              {activeEntry.ai_change_detection_summary && (
                <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-800/40 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-teal-200">
                      AI Visual Delta &amp; Margin Assessment
                    </h5>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {activeEntry.ai_change_detection_summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Strict 3-part Care Guidance Accordion */}
              <CareGuidanceAccordion
                careTips={activeEntry.ai_care_tips}
                risksIfNeglected={activeEntry.ai_risks_if_neglected}
                recommendedSpecialties={activeEntry.ai_recommended_specialties}
                isEmergency={activeEntry.is_emergency_escalation}
              />
            </div>
          ) : (
            <div className="p-12 text-center glass-card rounded-3xl border border-slate-800">
              <p className="text-sm text-slate-400">No telemetry entries recorded yet.</p>
            </div>
          )}
        </div>

        {/* Right Column: Chronological Timeline Log (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Chronological Timeline ({entries.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {entries.map((entry, idx) => {
              const isSelected = (selectedEntryId ? selectedEntryId === entry.id : idx === 0);
              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntryId(entry.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-teal-950/40 border-teal-500/50 shadow-lg'
                      : 'glass-card border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-700/60 shrink-0">
                    <img
                      src={entry.image_url}
                      alt="Wound entry"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">
                        {entry.entry_date.split('T')[0]}
                      </span>
                      <RiskBadge level={entry.ai_risk_level} size="sm" showTooltip={false} />
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span>Pain: {entry.pain_score}/10</span>
                      <span>•</span>
                      <span className="text-emerald-400">{entry.ai_granulation_percentage ?? 0}% gran</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Doctor Share Modal */}
      <DoctorShareModal
        woundId={woundId || ''}
        woundName={woundData.wound_name}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* SBAR Physician Summary Modal */}
      {sbarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Physician SBAR Clinical Summary Memo
                  </h3>
                  <p className="text-xs text-slate-400">
                    Standardized Situation, Background, Assessment, Recommendation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSbarModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {loadingSbar ? (
              <div className="py-16 text-center text-xs text-slate-400 space-y-3">
                <Sparkles className="w-6 h-6 text-teal-400 mx-auto animate-spin" />
                <p>Generating SBAR executive memo with Gemini clinical intelligence...</p>
              </div>
            ) : sbarData ? (
              <div className="mt-6 space-y-4 text-xs">
                {/* Situation */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="font-extrabold text-sky-400 uppercase tracking-wider text-[11px]">
                    S — Situation
                  </span>
                  <p className="text-slate-200 leading-relaxed">{sbarData.situation}</p>
                </div>

                {/* Background */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="font-extrabold text-teal-400 uppercase tracking-wider text-[11px]">
                    B — Background
                  </span>
                  <p className="text-slate-200 leading-relaxed">{sbarData.background}</p>
                </div>

                {/* Assessment */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px]">
                    A — Assessment
                  </span>
                  <p className="text-slate-200 leading-relaxed">{sbarData.assessment}</p>
                </div>

                {/* Recommendation */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px]">
                    R — Recommendation
                  </span>
                  <p className="text-slate-200 leading-relaxed">{sbarData.recommendation}</p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                  <span className="text-[11px] text-slate-500">
                    SBAR synthesized across {entries.length} longitudinal clinical entries
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs"
                  >
                    Print Memo
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Failed to generate SBAR summary. Please try again.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
