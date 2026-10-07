import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Camera,
  Upload,
  Mic,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertOctagon,
  PhoneCall,
  Sun,
  Maximize2,
  ShieldAlert,
  ChevronRight,
  Flame,
  Info
} from 'lucide-react';
import { api } from '../api/client';
import { VoiceRecorderJournal } from '../components/entry/VoiceRecorderJournal';
import { CareGuidanceAccordion } from '../components/entry/CareGuidanceAccordion';
import { RiskBadge } from '../components/common/RiskBadge';
import { useAppStore } from '../store/useAppStore';
import { translations } from '../i18n/translations';
import {
  SupportedLanguage,
  ExudateLevel,
  ExudateType,
  OdorLevel,
  WoundEntryRecord
} from '@/shared/index.js';

export const NewEntryWizardPage: React.FC = () => {
  const { woundId } = useParams<{ woundId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language, triggerEmergencyAlert } = useAppStore();
  const t = translations[language] || translations.en;

  const [step, setStep] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Audio & Voice Journal
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordedLanguage, setRecordedLanguage] = useState<SupportedLanguage>(language);
  const [patientNotes, setPatientNotes] = useState<string>('');

  // Structured Symptoms Matrix
  const [painScore, setPainScore] = useState<number>(3);
  const [exudateLevel, setExudateLevel] = useState<ExudateLevel>('none');
  const [exudateType, setExudateType] = useState<ExudateType>('none');
  const [odorLevel, setOdorLevel] = useState<OdorLevel>('none');
  const [periwoundCondition, setPeriwoundCondition] = useState<string[]>(['Intact']);
  const [systemicSymptoms, setSystemicSymptoms] = useState<string[]>([]);

  // Real-time AI Analysis Result
  const [analyzedEntry, setAnalyzedEntry] = useState<WoundEntryRecord | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: wound } = useQuery({
    queryKey: ['wound', woundId],
    queryFn: () => (woundId ? api.getWound(woundId) : null),
    enabled: !!woundId
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreviewUrl(preview);
    }
  };

  const togglePeriwound = (val: string) => {
    if (val === 'Intact') {
      setPeriwoundCondition(['Intact']);
      return;
    }
    const filtered = periwoundCondition.filter((p) => p !== 'Intact');
    if (filtered.includes(val)) {
      const next = filtered.filter((p) => p !== val);
      setPeriwoundCondition(next.length > 0 ? next : ['Intact']);
    } else {
      setPeriwoundCondition([...filtered, val]);
    }
  };

  const toggleSystemic = (val: string) => {
    if (val === 'None') {
      setSystemicSymptoms([]);
      return;
    }
    if (systemicSymptoms.includes(val)) {
      setSystemicSymptoms(systemicSymptoms.filter((s) => s !== val));
    } else {
      setSystemicSymptoms([...systemicSymptoms.filter((s) => s !== 'None'), val]);
    }
  };

  const handleExecuteAnalysis = async () => {
    if (!woundId || !selectedFile) {
      setErrorMessage('Please capture or select a wound photograph before submitting.');
      setStep(1);
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');
    setStep(4);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (audioBlob) {
        formData.append('audio', audioBlob, 'patient_journal.webm');
      }

      const telemetryPayload = {
        pain_score: painScore,
        exudate_level: exudateLevel,
        exudate_type: exudateType,
        odor_level: odorLevel,
        periwound_condition: periwoundCondition,
        systemic_symptoms: systemicSymptoms,
        patient_notes: patientNotes,
        recorded_language: recordedLanguage
      };

      formData.append('body', JSON.stringify(telemetryPayload));

      const result = await api.createWoundEntry(woundId, formData);
      setAnalyzedEntry(result);

      // Invalidate wound queries so caches refresh
      queryClient.invalidateQueries({ queryKey: ['wound', woundId] });
      queryClient.invalidateQueries({ queryKey: ['wounds'] });

      // Check for emergency escalation
      if (result.is_emergency_escalation) {
        triggerEmergencyAlert(result.ai_risk_reasoning);
      }
    } catch (err: any) {
      console.error('Entry creation & analysis failed:', err);
      setErrorMessage(err.message || 'Analysis encountered an error. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const stepsList = [
    { num: 1, title: t.wizardStep1, icon: Camera },
    { num: 2, title: t.wizardStep2, icon: Mic },
    { num: 3, title: t.wizardStep3, icon: Sliders },
    { num: 4, title: t.wizardStep4, icon: Sparkles }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Heading */}
      <div>
        <button
          onClick={() => navigate(`/wounds/${woundId}`)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {wound?.wound_name || 'Wound'} Timeline</span>
        </button>

        <h1 className="text-2xl font-black text-white tracking-tight">
          New Clinical Telemetry Entry
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Step-by-step multimodal assessment for {wound?.wound_name} ({wound?.anatomical_location})
        </p>
      </div>

      {/* Wizard Step Progress Tracker */}
      <div className="grid grid-cols-4 gap-2">
        {stepsList.map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <div
              key={s.num}
              onClick={() => {
                // allow stepping back if already submitted or to earlier steps
                if (step < 4) setStep(s.num);
              }}
              className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                isActive
                  ? 'bg-teal-950/80 border-teal-500 text-teal-300 shadow-lg'
                  : isDone
                  ? 'bg-slate-900/90 border-teal-800/60 text-slate-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Step {s.num}
                </span>
              </div>
              <span className="text-xs font-semibold truncate hidden sm:block">
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Image Capture / Upload with Lighting & Angle Guide */}
      {step === 1 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-teal-400" />
                <span>Step 1: Wound Photograph Capture</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ensure consistent lighting and perpendicular camera angle for precision TIME delta tracking.
              </p>
            </div>
          </div>

          {/* Lighting & Angle Guideline Overlay */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-teal-900/50 space-y-3">
            <div className="text-xs font-bold text-teal-300 flex items-center gap-2">
              <Sun className="w-4 h-4" />
              <span>Clinical Photography Best Practices</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-white block mb-0.5">1. Perpendicular Angle</span>
                <span className="text-[11px] text-slate-400">Hold phone directly 90° above wound to avoid perspective distortion.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-white block mb-0.5">2. Diffuse Lighting</span>
                <span className="text-[11px] text-slate-400">Use bright, even lighting without casting harsh hand shadows.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-white block mb-0.5">3. Include Periwound</span>
                <span className="text-[11px] text-slate-400">Frame ~3cm of surrounding skin to evaluate erythema margins.</span>
              </div>
            </div>
          </div>

          {/* Capture / Upload Zone */}
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/heic"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {imagePreviewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center h-80 group">
                <img
                  src={imagePreviewUrl}
                  alt="Wound Preview"
                  className="w-full h-full object-contain"
                />

                {/* Retake overlay button */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl text-xs font-semibold shadow hover:bg-slate-800"
                  >
                    Change / Retake Photo
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md text-[11px] text-emerald-400 rounded-lg border border-emerald-900">
                  ✓ Photo selected: {selectedFile?.name}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-80 rounded-2xl border-2 border-dashed border-slate-700 hover:border-teal-500 bg-slate-950/60 hover:bg-slate-950 transition-all flex flex-col items-center justify-center cursor-pointer p-6 text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  Tap to Take Photo or Upload Image
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Accepts JPEG, PNG, or WebP up to 10MB. High-resolution captures ensure accurate tissue segmenting.
                </p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-slate-800 text-teal-300 font-semibold text-xs rounded-xl border border-slate-700"
                >
                  Select from Camera / Gallery
                </button>
              </div>
            )}
          </div>

          {/* Step 1 Actions */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={!selectedFile}
              onClick={() => setStep(2)}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <span>Proceed to Voice Journal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Voice-to-Text Symptom Journaling */}
      {step === 2 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mic className="w-5 h-5 text-teal-400" />
                <span>Step 2: Voice-to-Wound Multilingual Journal</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Record your symptoms in English, Telugu (తెలుగు), Hindi (हिंदी), or Tamil (தமிழ்).
              </p>
            </div>
          </div>

          {/* Embedded Voice Recorder Component */}
          <VoiceRecorderJournal
            onAudioReady={(blob, lang) => {
              setAudioBlob(blob);
              setRecordedLanguage(lang);
            }}
            onTranscriptChange={(text) => setPatientNotes(text)}
            manualText={patientNotes}
          />

          {/* Step 2 Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              ← Back to Photo
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Proceed to Telemetry Sliders</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Structured Symptoms Sliders & Matrix */}
      {step === 3 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal-400" />
              <span>Step 3: Structured Clinical Telemetry</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Standardized metrics calibrated against clinical wound bed assessment protocols.
            </p>
          </div>

          <div className="space-y-6 text-xs">
            {/* 1. Pain Score Slider (NRS 0 - 10) */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-white text-sm">
                  {t.painLevelLabel}
                </label>
                <span
                  className={`text-base font-extrabold font-mono px-3 py-1 rounded-xl border ${
                    painScore >= 8
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : painScore >= 4
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  }`}
                >
                  {painScore} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={painScore}
                onChange={(e) => setPainScore(parseInt(e.target.value, 10))}
                className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>0: No Pain</span>
                <span>3: Mild</span>
                <span>6: Moderate</span>
                <span>8: Severe (Trigger Flag)</span>
                <span>10: Worst Possible</span>
              </div>
            </div>

            {/* 2. Exudate / Drainage Volume */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-white">
                {t.exudateLevelLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['none', 'scant', 'moderate', 'heavy'] as ExudateLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExudateLevel(lvl)}
                    className={`py-2 px-3 rounded-xl capitalize font-semibold border transition-all ${
                      exudateLevel === lvl
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Exudate Type */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-white">
                {t.exudateTypeLabel}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'serous', label: 'Serous (Clear / Thin Watery)' },
                  { id: 'serosanguinous', label: 'Serosanguinous (Pinkish / Watery)' },
                  { id: 'sanguinous', label: 'Sanguinous (Red / Bloody)' },
                  { id: 'purulent', label: 'Purulent (Thick / Yellow / Green Pus) ⚠️' }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setExudateType(type.id as ExudateType)}
                    className={`py-2 px-3 rounded-xl text-left font-semibold border transition-all ${
                      exudateType === type.id
                        ? type.id === 'purulent'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-600'
                          : 'bg-teal-500/20 text-teal-300 border-teal-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Odor Level */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-white">
                {t.odorLevelLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'mild', label: 'Mild / Faint' },
                  { id: 'foul', label: 'Strong / Foul (Pus Scent) ⚠️' }
                ].map((od) => (
                  <button
                    key={od.id}
                    type="button"
                    onClick={() => setOdorLevel(od.id as OdorLevel)}
                    className={`py-2 px-3 rounded-xl font-semibold border transition-all text-center ${
                      odorLevel === od.id
                        ? od.id === 'foul'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-600'
                          : 'bg-teal-500/20 text-teal-300 border-teal-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {od.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Periwound Condition (Checkboxes) */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-white">
                {t.periwoundLabel}
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Intact',
                  'Erythematous (Red)',
                  'Macerated (White/Waterlogged)',
                  'Indurated (Hardened)',
                  'Edematous (Swollen)'
                ].map((cond) => {
                  const isChecked = periwoundCondition.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => togglePeriwound(cond)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        isChecked
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '} {cond}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Systemic Symptoms */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-white">
                {t.systemicSymptomsLabel}
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'None',
                  'Fever (>38°C/100.4°F) ⚠️',
                  'Chills ⚠️',
                  'Nausea',
                  'Dizziness / Weakness'
                ].map((symp) => {
                  const isChecked =
                    symp === 'None'
                      ? systemicSymptoms.length === 0
                      : systemicSymptoms.includes(symp);
                  return (
                    <button
                      key={symp}
                      type="button"
                      onClick={() => toggleSystemic(symp)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        isChecked
                          ? symp.includes('⚠️')
                            ? 'bg-rose-950/60 text-rose-300 border-rose-600'
                            : 'bg-teal-500/20 text-teal-300 border-teal-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '} {symp}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 3 Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              ← Back to Journal
            </button>

            <button
              type="button"
              onClick={handleExecuteAnalysis}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-xl shadow-teal-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.saveAndAnalyzeBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Real-time Multimodal Gemini Analysis Output */}
      {step === 4 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          {isAnalyzing ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-teal-500/20 border-t-teal-400 animate-spin mx-auto" />
              <h3 className="text-base font-bold text-white">
                Multimodal AI Clinical Inference Running...
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Synthesizing image tissue granulation, translating multilingual voice complaints, and evaluating TIME framework infection criteria.
              </p>
            </div>
          ) : analyzedEntry ? (
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              {/* Emergency Banner Override if triggered */}
              {analyzedEntry.is_emergency_escalation && (
                <div className="p-5 rounded-3xl bg-red-950 border border-red-500 text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-start gap-3">
                    <AlertOctagon className="w-8 h-8 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-extrabold uppercase tracking-wide text-red-200">
                        {t.emergencyAlertTitle}
                      </h4>
                      <p className="text-xs text-red-100 mt-1 leading-relaxed">
                        {analyzedEntry.ai_risk_reasoning}
                      </p>
                    </div>
                  </div>
                  <a
                    href="tel:112"
                    className="px-5 py-2.5 bg-white text-red-700 font-extrabold text-xs rounded-xl shadow-lg shrink-0 flex items-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{t.callEmergencyButton}</span>
                  </a>
                </div>
              )}

              {/* Triage Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                    Clinical Telemetry Evaluated
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    Observation Results
                  </h3>
                </div>
                <RiskBadge
                  level={analyzedEntry.ai_risk_level}
                  reasoning={analyzedEntry.ai_risk_reasoning}
                  size="lg"
                />
              </div>

              {/* Tissue Composition Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Healthy Granulation</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">
                    {analyzedEntry.ai_granulation_percentage ?? 0}%
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Vascular pink wound base</p>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Slough Present</div>
                  <div className="text-xl font-black text-amber-400 mt-1">
                    {analyzedEntry.ai_slough_percentage ?? 0}%
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Fibrinous tissue</p>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Necrosis / Eschar</div>
                  <div className="text-xl font-black text-rose-400 mt-1">
                    {analyzedEntry.ai_necrosis_percentage ?? 0}%
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Non-viable tissue</p>
                </div>
              </div>

              {/* AI Change Detection Summary */}
              {analyzedEntry.ai_change_detection_summary && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3 text-xs">
                  <Sparkles className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-teal-200">
                      Visual Change Detection &amp; Margin Trajectory
                    </h5>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      {analyzedEntry.ai_change_detection_summary}
                    </p>
                  </div>
                </div>
              )}

              {/* 3-part Clinical Care Guidance Accordion */}
              <CareGuidanceAccordion
                careTips={analyzedEntry.ai_care_tips}
                risksIfNeglected={analyzedEntry.ai_risks_if_neglected}
                recommendedSpecialties={analyzedEntry.ai_recommended_specialties}
                isEmergency={analyzedEntry.is_emergency_escalation}
              />

              {/* Finish Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate(`/wounds/${woundId}`)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
                >
                  Return to Wound Timeline
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/wounds/${woundId}/compare`)}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span>Launch Visual Diff Comparison</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 space-y-3">
              <p>Analysis failed to complete.</p>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl"
              >
                Retry Telemetry Submission
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
