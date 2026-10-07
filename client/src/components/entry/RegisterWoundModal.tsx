import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  FolderHeart,
  X,
  Camera,
  Upload,
  Mic,
  Square,
  Globe,
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Check,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../../api/client';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n/translations';
import {
  CreateWoundInput,
  WoundType,
  SupportedLanguage,
  ExudateLevel,
  OdorLevel
} from '@/shared/index.js';

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

const SUGGESTED_NAMES = [
  'Left Lateral Malleolus Incision',
  'Diabetic Foot Ulcer (Great Toe)',
  'Abdominal Laparoscopic Incision',
  'Sacral Pressure Injury Stage 2',
  'Right Knee Arthroplasty Incision'
];

const SUGGESTED_LOCATIONS = [
  'Left Ankle (Lateral Aspect)',
  'Plantar Surface (Right Foot)',
  'Lower Abdomen (Midline)',
  'Sacrum / Lower Back',
  'Right Knee (Anterior Aspect)'
];

interface RegisterWoundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterWoundModal: React.FC<RegisterWoundModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language, triggerEmergencyAlert } = useAppStore();
  const t = translations[language] || translations.en;

  // Active Tab / Step: 'details' or 'status'
  const [activeTab, setActiveTab] = useState<'details' | 'status'>('details');

  // Form Fields - Wound Identity
  const [woundName, setWoundName] = useState('');
  const [anatomicalLocation, setAnatomicalLocation] = useState('');
  const [woundType, setWoundType] = useState<WoundType>('Post-Surgical Incision');
  const [initialOnsetDate, setInitialOnsetDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [baselineNotes, setBaselineNotes] = useState('');

  // Image Upload & Capture
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Voice Input & Audio Recording
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(language);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 25, 40, 20, 15, 30, 25]);
  const [micError, setMicError] = useState<string | null>(null);
  const [speechRecognizedText, setSpeechRecognizedText] = useState('');

  // Wound Status Defining Controls
  const [painScore, setPainScore] = useState<number>(3);
  const [exudateLevel, setExudateLevel] = useState<ExudateLevel>('none');
  const [odorLevel, setOdorLevel] = useState<OdorLevel>('none');
  const [woundStatusNotes, setWoundStatusNotes] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Media Recorder & Audio Context Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Sync modal language with store
  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  // Clean up media on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (_) {}
      }
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  if (!isOpen) return null;

  // Handle File Upload
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    setErrorMessage('');
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
  };

  const clearImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setSelectedImage(null);
    setImagePreviewUrl(null);
  };

  // Quick Demo / Sample Image generator for testing without physical wound photo
  const loadDemoSampleImage = async () => {
    try {
      // Create a simulated canvas image of wound for instantaneous testing
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 450;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clinical background
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 600, 450);

        // Skin surrounding tone
        ctx.fillStyle = '#e2b399';
        ctx.beginPath();
        ctx.ellipse(300, 225, 240, 180, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wound bed (erythema & granulation)
        const grad = ctx.createRadialGradient(300, 225, 20, 300, 225, 140);
        grad.addColorStop(0, '#be123c'); // Granulation red
        grad.addColorStop(0.6, '#e11d48');
        grad.addColorStop(0.85, '#f43f5e'); // Erythema margin
        grad.addColorStop(1, '#e2b399');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(300, 225, 120, 60, Math.PI / 12, 0, Math.PI * 2);
        ctx.fill();

        // Surgical incision suture marks
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(200, 225);
        ctx.lineTo(400, 225);
        ctx.stroke();

        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('HealTrack AI Clinical Camera Test Record', 20, 30);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const testFile = new File([blob], 'baseline_wound_capture.jpg', { type: 'image/jpeg' });
          handleFileSelect(testFile);
        }
      }, 'image/jpeg');
    } catch (e) {
      console.warn('Could not generate sample image:', e);
    }
  };

  // Start Voice Recording & Speech Dictation
  const startRecording = async () => {
    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 1. AudioContext waveform
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 64;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateWaveform = () => {
        analyser.getByteFrequencyData(dataArray);
        const bars: number[] = [];
        const step = Math.floor(bufferLength / 12) || 1;
        for (let i = 0; i < 12; i++) {
          const val = dataArray[i * step] || 10;
          bars.push(Math.max(12, Math.min(90, Math.round((val / 255) * 100))));
        }
        setAudioLevels(bars);
        animationFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();

      // 2. MediaRecorder for actual audio file
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm'
        });
        const url = URL.createObjectURL(recordedBlob);
        setAudioBlob(recordedBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(200);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // 3. Web Speech Recognition for instant Live Dictation into notes
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          const langMap: Record<SupportedLanguage, string> = {
            en: 'en-US',
            te: 'te-IN',
            hi: 'hi-IN',
            ta: 'ta-IN'
          };
          recognition.lang = langMap[selectedLanguage] || 'en-US';

          recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript;
            }
            if (transcript) {
              setSpeechRecognizedText(transcript);
              setWoundStatusNotes((prev) => {
                // If notes already contains text, append cleanly
                const base = prev.trim();
                return base ? `${base}\n${transcript}` : transcript;
              });
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('SpeechRecognition error:', e);
          };

          speechRecognitionRef.current = recognition;
          recognition.start();
        } catch (srErr) {
          console.warn('Could not start SpeechRecognition:', srErr);
        }
      }
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setMicError(
        'Microphone access is unavailable or denied. You can manually describe symptoms in the notes box.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (_) {}
      }
    }
  };

  const discardAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingDuration(0);
    setSpeechRecognizedText('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get color for pain scale
  const getPainColor = (score: number) => {
    if (score === 0) return 'text-emerald-400 bg-emerald-950/80 border-emerald-700/60';
    if (score <= 3) return 'text-teal-300 bg-teal-950/80 border-teal-700/60';
    if (score <= 6) return 'text-amber-300 bg-amber-950/80 border-amber-700/60';
    if (score <= 8) return 'text-orange-400 bg-orange-950/80 border-orange-700/60';
    return 'text-rose-400 bg-rose-950/80 border-rose-700/60';
  };

  const getPainLabel = (score: number) => {
    if (score === 0) return 'No Pain (0/10)';
    if (score <= 3) return `Mild Discomfort (${score}/10)`;
    if (score <= 6) return `Moderate Pain (${score}/10)`;
    if (score <= 8) return `Severe Distress (${score}/10)`;
    return `Worst Possible Pain (${score}/10)`;
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!woundName.trim() || !anatomicalLocation.trim()) {
      setActiveTab('details');
      setErrorMessage('Please provide a Wound Name and Anatomical Location.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Create the base wound condition record
      setSubmissionStep('Registering wound condition record...');
      const woundData: CreateWoundInput = {
        wound_name: woundName.trim(),
        anatomical_location: anatomicalLocation.trim(),
        wound_type: woundType,
        initial_onset_date: initialOnsetDate,
        baseline_notes: baselineNotes.trim() || undefined
      };

      const newWound = await api.createWound(woundData);

      // 2. If an image was attached, upload entry and run Gemini AI analysis right now!
      if (selectedImage) {
        setSubmissionStep('Uploading wound photograph & voice recording...');
        const formData = new FormData();
        formData.append('image', selectedImage);
        if (audioBlob) {
          formData.append('audio', audioBlob, 'patient_journal.webm');
        }

        const combinedNotes = [
          baselineNotes.trim() ? `Baseline: ${baselineNotes.trim()}` : '',
          woundStatusNotes.trim() ? `Symptoms: ${woundStatusNotes.trim()}` : ''
        ]
          .filter(Boolean)
          .join('\n');

        const telemetryPayload = {
          pain_score: painScore,
          exudate_level: exudateLevel,
          exudate_type: exudateLevel === 'none' ? 'none' : 'serous',
          odor_level: odorLevel,
          periwound_condition: ['Intact'],
          systemic_symptoms: [],
          patient_notes: combinedNotes,
          recorded_language: selectedLanguage
        };

        formData.append('body', JSON.stringify(telemetryPayload));

        setSubmissionStep('Gemini 2.5 Flash analyzing tissue, erythema & risk...');
        const analyzedEntry = await api.createWoundEntry(newWound.id, formData);

        // Check for emergency escalation
        if (analyzedEntry.is_emergency_escalation) {
          triggerEmergencyAlert(analyzedEntry.ai_risk_reasoning);
        }
      }

      setSubmissionStep('Finished! Loading patient clinical timeline...');
      queryClient.invalidateQueries({ queryKey: ['wounds'] });

      setTimeout(() => {
        onClose();
        navigate(`/wounds/${newWound.id}`);
      }, 500);
    } catch (err: any) {
      console.error('Failed to create wound condition:', err);
      setErrorMessage(err.message || 'Failed to register wound condition.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <FolderHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Register New Wound Condition
              </h3>
              <p className="text-xs text-slate-400">
                Log patient recovery baseline, photo, and voice telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'details'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Wound Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all relative ${
              activeTab === 'status'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>2. Image &amp; Voice Status</span>
            {(selectedImage || audioBlob) && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto mt-4 pr-1 space-y-5 text-xs">
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Wound Name */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Wound Name / Label <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Left Lateral Malleolus Incision"
                  value={woundName}
                  onChange={(e) => setWoundName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
                {/* Suggestions Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SUGGESTED_NAMES.slice(0, 3).map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => setWoundName(sugg)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors"
                    >
                      + {sugg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Anatomical Location */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Anatomical Location <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Left Ankle (Lateral Aspect)"
                  value={anatomicalLocation}
                  onChange={(e) => setAnatomicalLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SUGGESTED_LOCATIONS.slice(0, 3).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setAnatomicalLocation(loc)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors"
                    >
                      + {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Classification & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Clinical Classification <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={woundType}
                    onChange={(e) => setWoundType(e.target.value as WoundType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500 text-xs"
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
                    value={initialOnsetDate}
                    onChange={(e) => setInitialOnsetDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-teal-500 text-xs"
                  />
                </div>
              </div>

              {/* Baseline Notes */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Baseline Clinical Notes / Surgical Procedure
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. ORIF procedure for ankle fracture. Staples removed on postoperative Day 10."
                  value={baselineNotes}
                  onChange={(e) => setBaselineNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none text-xs"
                />
              </div>

              {/* Prompt to add Photo & Voice */}
              <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-800/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-teal-300">
                  <Camera className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="text-xs">
                    Upload initial wound photograph &amp; voice status for instant AI triage.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('status')}
                  className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-bold text-xs flex items-center gap-1 transition-colors shrink-0"
                >
                  <span>Attach Image &amp; Voice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMAGE UPLOAD & VOICE STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* SECTION 1: WOUND IMAGE UPLOAD */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-teal-400" />
                    <span>Wound Photograph (Image Upload)</span>
                  </label>
                  <span className="text-[10px] text-teal-400 font-medium">
                    {selectedImage ? 'Photo attached' : 'Optional baseline photo'}
                  </span>
                </div>

                {/* Dropzone / Preview */}
                {!imagePreviewUrl ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 ${
                      isDragOver
                        ? 'border-teal-400 bg-teal-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                      <Upload className="w-6 h-6" />
                    </div>

                    <div>
                      <p className="font-bold text-slate-200">
                        Drop wound photograph here or click to upload
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        JPEG, PNG, or WEBP (Max 15MB)
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      {/* Regular File Selector */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                        <span>Browse Files</span>
                      </button>

                      {/* Camera Selector (Mobile / Webcam) */}
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-semibold text-xs border border-teal-500/30 flex items-center gap-1.5 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Take Photo</span>
                      </button>

                      {/* Quick Demo Image */}
                      <button
                        type="button"
                        onClick={loadDemoSampleImage}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium text-[11px] border border-slate-800 transition-colors"
                        title="Simulate a test wound image"
                      >
                        + Demo Test Photo
                      </button>
                    </div>

                    {/* Hidden inputs */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                ) : (
                  /* Attached Image Preview */
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center group h-48">
                    <img
                      src={imagePreviewUrl}
                      alt="Wound Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end justify-between p-3">
                      <div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Photo Attached
                        </span>
                        <p className="text-[10px] text-slate-300 mt-1 truncate max-w-xs">
                          {selectedImage?.name} ({((selectedImage?.size || 0) / 1024).toFixed(0)} KB)
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={clearImage}
                        className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-colors"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: VOICE INPUT & ACOUSTIC JOURNAL */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-white flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-teal-400" />
                      <span>Voice Input: Speak to Define Wound Status</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Speak in your preferred language about pain, warmth, or drainage
                    </p>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
                      disabled={isRecording}
                      className="bg-slate-800 border border-slate-700 text-teal-300 font-semibold text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:border-teal-500"
                    >
                      <option value="en">🇬🇧 English</option>
                      <option value="te">🇮🇳 Telugu (తెలుగు)</option>
                      <option value="hi">🇮🇳 Hindi (हिंदी)</option>
                      <option value="ta">🇮🇳 Tamil (தமிழ்)</option>
                    </select>
                  </div>
                </div>

                {micError && (
                  <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{micError}</span>
                  </div>
                )}

                {/* Voice Recorder Control Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center flex flex-col items-center justify-center relative overflow-hidden">
                  {isRecording && (
                    <div className="absolute inset-0 bg-teal-500/5 animate-pulse pointer-events-none" />
                  )}

                  {/* Pulsing Audio Levels */}
                  <div className="h-10 flex items-center justify-center gap-1 w-full max-w-xs mb-3">
                    {audioLevels.map((lvl, idx) => (
                      <div
                        key={idx}
                        className={`w-2 rounded-full transition-all duration-75 ${
                          isRecording
                            ? 'bg-gradient-to-t from-teal-500 to-emerald-300 shadow-[0_0_8px_rgba(20,184,166,0.5)]'
                            : audioUrl
                            ? 'bg-teal-700/60 h-3'
                            : 'bg-slate-800 h-1.5'
                        }`}
                        style={{
                          height: isRecording ? `${lvl}%` : audioUrl ? '16px' : '6px'
                        }}
                      />
                    ))}
                  </div>

                  {/* Recording Status & Action Button */}
                  <div className="flex items-center gap-3">
                    {!isRecording && !audioUrl && (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-black text-xs rounded-full shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Tap to Record Voice Journal</span>
                      </button>
                    )}

                    {isRecording && (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-full shadow-lg shadow-rose-600/30 animate-pulse transition-all"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        <span>Stop Recording ({formatTime(recordingDuration)})</span>
                      </button>
                    )}

                    {audioUrl && !isRecording && (
                      <div className="flex items-center gap-2.5">
                        <audio src={audioUrl} controls className="h-8 max-w-[220px]" />
                        <button
                          type="button"
                          onClick={discardAudio}
                          className="p-2 rounded-full bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                          title="Discard & re-record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: WOUND STATUS CONTROLS (PAIN, EXUDATE, ODOR) */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-teal-400" />
                  <span>Clinical Wound Status Telemetry</span>
                </h4>

                {/* Pain Score Slider */}
                <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-300">
                      Pain Severity Level
                    </label>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg border font-mono font-bold text-xs ${getPainColor(
                        painScore
                      )}`}
                    >
                      {getPainLabel(painScore)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={painScore}
                    onChange={(e) => setPainScore(Number(e.target.value))}
                    className="w-full accent-teal-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0: Pain Free</span>
                    <span>5: Moderate</span>
                    <span>10: Worst Possible</span>
                  </div>
                </div>

                {/* Exudate & Odor Level Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Drainage Level */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">
                      Drainage / Exudate Level
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['none', 'scant', 'moderate', 'heavy'] as ExudateLevel[]).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setExudateLevel(lvl)}
                          className={`py-1.5 px-1 rounded-xl text-center capitalize font-semibold transition-all text-[11px] ${
                            exudateLevel === lvl
                              ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                              : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Odor Level */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">
                      Odor Level
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['none', 'mild', 'foul'] as OdorLevel[]).map((od) => (
                        <button
                          key={od}
                          type="button"
                          onClick={() => setOdorLevel(od)}
                          className={`py-1.5 px-1 rounded-xl text-center capitalize font-semibold transition-all text-[11px] ${
                            odorLevel === od
                              ? od === 'foul'
                                ? 'bg-rose-500 text-white font-bold'
                                : 'bg-teal-500 text-slate-950 font-bold'
                              : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {od}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Wound Status Notes & Voice Transcript */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-300 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-teal-400" />
                      <span>Patient Status Notes (Filled by Voice or Typing)</span>
                    </label>
                    {speechRecognizedText && (
                      <span className="text-[10px] text-teal-400 font-mono flex items-center gap-1">
                        <Check className="w-3 h-3" /> Voice transcribed
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={woundStatusNotes}
                    onChange={(e) => setWoundStatusNotes(e.target.value)}
                    placeholder="e.g. Incision edges feel warm and throbbing pain began yesterday after dressing change."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submission Loading Overlay */}
          {isSubmitting && (
            <div className="p-4 rounded-2xl bg-teal-950/60 border border-teal-800/80 text-teal-200 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2.5 font-bold">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                <span>Processing Clinical Intake...</span>
              </div>
              <p className="text-[11px] text-teal-300 font-mono">
                {submissionStep || 'Synchronizing with HealTrack AI backend...'}
              </p>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-400 hover:text-white font-semibold transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {activeTab === 'details' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('status')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <span>Next: Image &amp; Voice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !woundName.trim() || !anatomicalLocation.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-black rounded-xl shadow-lg shadow-teal-500/25 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {selectedImage ? (
                  <>
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>Create &amp; Analyze Wound</span>
                  </>
                ) : (
                  <span>Create Wound Record</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
