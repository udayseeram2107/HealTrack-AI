import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Layers,
  Calendar,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from '../api/client';
import { WoundComparisonSlider } from '../components/comparison/WoundComparisonSlider';
import { RiskBadge } from '../components/common/RiskBadge';
import { useAppStore } from '../store/useAppStore';
import { translations } from '../i18n/translations';

export const WoundComparePage: React.FC = () => {
  const { woundId } = useParams<{ woundId: string }>();
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = translations[language] || translations.en;

  const [baseEntryId, setBaseEntryId] = useState<string>('');
  const [targetEntryId, setTargetEntryId] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  const { data: woundData, isLoading } = useQuery({
    queryKey: ['wound', woundId],
    queryFn: () => (woundId ? api.getWound(woundId) : null),
    enabled: !!woundId
  });

  const entries = woundData?.entries || [];

  // Initialize comparison between earliest and latest entry
  useEffect(() => {
    if (entries.length >= 2 && !baseEntryId && !targetEntryId) {
      const oldest = entries[entries.length - 1];
      const newest = entries[0];
      setBaseEntryId(oldest.id);
      setTargetEntryId(newest.id);
    }
  }, [entries, baseEntryId, targetEntryId]);

  // Execute comparison when base & target are set
  useEffect(() => {
    if (woundId && baseEntryId && targetEntryId && baseEntryId !== targetEntryId) {
      setIsComparing(true);
      api
        .compareEntries(woundId, baseEntryId, targetEntryId)
        .then((res) => setComparisonResult(res))
        .catch((e) => console.error('Comparison calculation failed:', e))
        .finally(() => setIsComparing(false));
    }
  }, [woundId, baseEntryId, targetEntryId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading wound entries for visual diff...
      </div>
    );
  }

  if (entries.length < 2) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Layers className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-white">Insufficient Data for Visual Diff</h3>
        <p className="text-xs text-slate-400">
          Longitudinal visual comparison requires at least 2 recorded observations. Please submit a new entry first.
        </p>
        <button
          onClick={() => navigate(`/wounds/${woundId}/new-entry`)}
          className="px-5 py-2.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow"
        >
          Add Second Entry
        </button>
      </div>
    );
  }

  const baseEntry = entries.find((e) => e.id === baseEntryId) || entries[entries.length - 1];
  const targetEntry = entries.find((e) => e.id === targetEntryId) || entries[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <button
            onClick={() => navigate(`/wounds/${woundId}`)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {woundData?.wound_name} Timeline</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Before vs. After Visual AI Comparison
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-800 text-xs font-bold">
              Longitudinal Delta
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Objective surface shift, tissue granulation vs. slough/necrosis metrics
          </p>
        </div>
      </div>

      {/* Entry Selectors Row */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Baseline Selector */}
        <div className="flex-1 w-full space-y-1">
          <label className="block text-[11px] font-bold text-teal-400 uppercase tracking-wider">
            Baseline / Before Capture:
          </label>
          <select
            value={baseEntryId}
            onChange={(e) => setBaseEntryId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 font-semibold"
          >
            {entries.map((e, idx) => (
              <option key={e.id} value={e.id}>
                Entry #{entries.length - idx} ({e.entry_date.split('T')[0]}) — Pain: {e.pain_score}/10 — {e.ai_risk_level.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="text-slate-500 font-bold text-xs uppercase px-2 shrink-0 hidden sm:block">
          VS
        </div>

        {/* Target / Latest Selector */}
        <div className="flex-1 w-full space-y-1">
          <label className="block text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Target / After Capture:
          </label>
          <select
            value={targetEntryId}
            onChange={(e) => setTargetEntryId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 font-semibold"
          >
            {entries.map((e, idx) => (
              <option key={e.id} value={e.id}>
                Entry #{entries.length - idx} ({e.entry_date.split('T')[0]}) — Pain: {e.pain_score}/10 — {e.ai_risk_level.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Comparison Slider Component */}
      {baseEntry && targetEntry && (
        <WoundComparisonSlider
          beforeImage={baseEntry.image_url}
          afterImage={targetEntry.image_url}
          beforeDate={baseEntry.entry_date}
          afterDate={targetEntry.entry_date}
          beforeLabel="Baseline Photo"
          afterLabel="Follow-up Photo"
          deltas={comparisonResult?.deltas}
          healingStatus={comparisonResult?.healingStatus}
          visualChangeSummary={
            targetEntry.ai_change_detection_summary ||
            `Visual evaluation spanning ${comparisonResult?.daysElapsed ?? 0} days between captures.`
          }
        />
      )}

      {/* Side-by-side Clinical Telemetry Comparison Table */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-400" />
          <span>Clinical Telemetry Shift Matrix</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Metric Parameter</th>
                <th className="py-2.5 px-3 text-teal-400 font-bold">Baseline ({baseEntry?.entry_date.split('T')[0]})</th>
                <th className="py-2.5 px-3 text-emerald-400 font-bold">Target ({targetEntry?.entry_date.split('T')[0]})</th>
                <th className="py-2.5 px-3 text-right">Delta / Net Shift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Risk Triage Level</td>
                <td className="py-3 px-3">
                  <RiskBadge level={baseEntry.ai_risk_level} size="sm" />
                </td>
                <td className="py-3 px-3">
                  <RiskBadge level={targetEntry.ai_risk_level} size="sm" />
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-300">
                  {baseEntry.ai_risk_level === targetEntry.ai_risk_level
                    ? 'Maintained'
                    : `${baseEntry.ai_risk_level} → ${targetEntry.ai_risk_level}`}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Pain Score (0 - 10)</td>
                <td className="py-3 px-3 font-mono">{baseEntry.pain_score} / 10</td>
                <td className="py-3 px-3 font-mono">{targetEntry.pain_score} / 10</td>
                <td className="py-3 px-3 text-right font-mono font-bold">
                  {(comparisonResult?.deltas?.pain ?? 0) <= 0 ? (
                    <span className="text-emerald-400">{comparisonResult?.deltas?.pain} pts (Improved)</span>
                  ) : (
                    <span className="text-rose-400">+{comparisonResult?.deltas?.pain} pts (Increased)</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Tissue Granulation %</td>
                <td className="py-3 px-3 font-mono">{baseEntry.ai_granulation_percentage ?? 0}%</td>
                <td className="py-3 px-3 font-mono">{targetEntry.ai_granulation_percentage ?? 0}%</td>
                <td className="py-3 px-3 text-right font-mono font-bold">
                  {(comparisonResult?.deltas?.granulation ?? 0) >= 0 ? (
                    <span className="text-emerald-400">+{comparisonResult?.deltas?.granulation}%</span>
                  ) : (
                    <span className="text-rose-400">{comparisonResult?.deltas?.granulation}%</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Slough Percentage %</td>
                <td className="py-3 px-3 font-mono">{baseEntry.ai_slough_percentage ?? 0}%</td>
                <td className="py-3 px-3 font-mono">{targetEntry.ai_slough_percentage ?? 0}%</td>
                <td className="py-3 px-3 text-right font-mono font-bold">
                  {(comparisonResult?.deltas?.slough ?? 0) <= 0 ? (
                    <span className="text-emerald-400">{comparisonResult?.deltas?.slough}%</span>
                  ) : (
                    <span className="text-amber-400">+{comparisonResult?.deltas?.slough}%</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Exudate Volume &amp; Type</td>
                <td className="py-3 px-3 capitalize">{baseEntry.exudate_level} ({baseEntry.exudate_type})</td>
                <td className="py-3 px-3 capitalize">{targetEntry.exudate_level} ({targetEntry.exudate_type})</td>
                <td className="py-3 px-3 text-right text-slate-300">
                  {targetEntry.exudate_level === baseEntry.exudate_level ? 'Stable' : 'Shifted'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
