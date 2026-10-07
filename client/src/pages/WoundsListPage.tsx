import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FolderHeart,
  PlusCircle,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  X,
  Sparkles,
  Activity
} from 'lucide-react';
import { api } from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';
import { CreateWoundInput, WoundType } from '@/shared/index.js';
import { useAppStore } from '../store/useAppStore';

const WOUND_TYPES: WoundType[] = [
  'Post-Surgical Incision',
  'Diabetic Foot Ulcer (DFU)',
  'Venous Leg Ulcer (VLU)',
  'Arterial Insufficiency Ulcer',
  'Pressure Injury (Stage 1-4)',
  'Traumatic Laceration / Abrasion',
  'Burn (1st/2nd Degree Superficial)',
  'Other Cutaneous Wound'
];

export const WoundsListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateWoundInput>({
    wound_name: '',
    anatomical_location: '',
    wound_type: 'Post-Surgical Incision',
    initial_onset_date: new Date().toISOString().split('T')[0],
    baseline_notes: ''
  });

  const { data: wounds = [], isLoading } = useQuery({
    queryKey: ['wounds'],
    queryFn: () => api.listWounds()
  });

  const createMutation = useMutation({
    mutationFn: (newWound: CreateWoundInput) => api.createWound(newWound),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wounds'] });
      setIsModalOpen(false);
      setFormData({
        wound_name: '',
        anatomical_location: '',
        wound_type: 'Post-Surgical Incision',
        initial_onset_date: new Date().toISOString().split('T')[0],
        baseline_notes: ''
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.wound_name || !formData.anatomical_location) return;
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Patient Wound Portfolio
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-teal-400 text-xs font-mono font-bold">
              {wounds.length} Tracked
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Longitudinal records for patient {user?.full_name || 'Patient'} ({user?.id ? user.id.substring(0, 8) : '00000000'})
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Wound Condition</span>
        </button>
      </div>

      {/* Grid of Wounds */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading wound portfolio...</div>
      ) : wounds.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4 border border-slate-800">
          <FolderHeart className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No active wounds logged</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Begin tracking your postoperative recovery or chronic wound progression with daily AI telemetry.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow"
          >
            Register First Wound
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {wounds.map((wound) => {
            const latest = wound.latest_entry;
            return (
              <div
                key={wound.id}
                className="glass-card rounded-3xl p-5 border border-slate-800 hover:border-slate-700 shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-teal-950/80 text-teal-400 border border-teal-800/60 text-[10px] font-bold">
                      {wound.wound_type}
                    </span>
                    {latest && (
                      <RiskBadge level={latest.ai_risk_level} reasoning={latest.ai_risk_reasoning} size="sm" />
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                    {wound.wound_name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{wound.anatomical_location}</span>
                  </div>

                  {/* Thumbnail / Image Preview */}
                  <div className="mt-3 h-40 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 relative flex items-center justify-center">
                    {latest ? (
                      <img
                        src={latest.image_url}
                        alt={wound.wound_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center p-4 text-xs text-slate-500">
                        No captures logged yet
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] text-slate-300 font-mono">
                      {wound.entry_count ?? 0} updates recorded
                    </div>
                  </div>

                  {wound.baseline_notes && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-3 italic">
                      "{wound.baseline_notes}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/wounds/${wound.id}`)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Timeline &amp; SBAR</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => navigate(`/wounds/${wound.id}/new-entry`)}
                    className="py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-bold transition-transform active:scale-95"
                  >
                    + Update
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register New Wound Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderHeart className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">Register New Wound Condition</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Wound Name / Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Left Lateral Malleolus Incision"
                  value={formData.wound_name}
                  onChange={(e) => setFormData({ ...formData, wound_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Anatomical Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Left Ankle (Lateral Aspect)"
                  value={formData.anatomical_location}
                  onChange={(e) =>
                    setFormData({ ...formData, anatomical_location: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Clinical Wound Classification *
                </label>
                <select
                  value={formData.wound_type}
                  onChange={(e) => setFormData({ ...formData, wound_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  {WOUND_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Initial Onset / Surgery Date
                </label>
                <input
                  type="date"
                  value={formData.initial_onset_date}
                  onChange={(e) =>
                    setFormData({ ...formData, initial_onset_date: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Baseline Clinical Notes / Surgical Procedure
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. ORIF procedure for ankle fracture. Staples removed on postoperative Day 10."
                  value={formData.baseline_notes}
                  onChange={(e) => setFormData({ ...formData, baseline_notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold rounded-xl shadow transition-transform active:scale-95 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Registering...' : 'Create Wound Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
