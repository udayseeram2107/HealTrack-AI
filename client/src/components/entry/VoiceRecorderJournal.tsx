import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Globe,
  Volume2,
  Trash2,
  Check,
  AlertCircle,
  FileText
} from 'lucide-react';
import { SupportedLanguage } from '../../../../shared/index.js';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n/translations';

interface VoiceRecorderJournalProps {
  onAudioReady: (audioBlob: Blob | null, language: SupportedLanguage) => void;
  onTranscriptChange: (text: string) => void;
  manualText: string;
}

export const VoiceRecorderJournal: React.FC<VoiceRecorderJournalProps> = ({
  onAudioReady,
  onTranscriptChange,
  manualText
}) => {
  const { language: currentAppLang } = useAppStore();
  const t = translations[currentAppLang] || translations.en;

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(currentAppLang);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 20, 35, 20, 15, 25, 30]);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Sync with store language
  useEffect(() => {
    setSelectedLanguage(currentAppLang);
  }, [currentAppLang]);

  // Clean up
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setMicPermissionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Audio analysis for real-time waveform
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
        // sample 12 bars from dataArray
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

      // MediaRecorder
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
        onAudioReady(recordedBlob, selectedLanguage);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(200);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setMicPermissionError(
        'Microphone access is not available or blocked. You can still describe your symptoms in the text box below.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const discardAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingDuration(0);
    onAudioReady(null, selectedLanguage);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const languageOptions: { code: SupportedLanguage; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'te', label: 'Telugu (తెలుగు)', flag: '🇮🇳' },
    { code: 'hi', label: 'Hindi (हिंदी)', flag: '🇮🇳' },
    { code: 'ta', label: 'Tamil (தமிழ்)', flag: '🇮🇳' }
  ];

  return (
    <div className="space-y-4">
      {/* Header and Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Mic className="w-4 h-4 text-teal-400" />
            <span>{t.voiceJournalTitle}</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">{t.voiceJournalInstruction}</p>
        </div>

        {/* Language selector pill */}
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedLanguage}
            onChange={(e) => {
              const lang = e.target.value as SupportedLanguage;
              setSelectedLanguage(lang);
              if (audioBlob) {
                onAudioReady(audioBlob, lang);
              }
            }}
            disabled={isRecording}
            className="bg-slate-800 border border-slate-700 text-teal-300 font-medium text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-500 disabled:opacity-50"
          >
            {languageOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.flag} {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {micPermissionError && (
        <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{micPermissionError}</span>
        </div>
      )}

      {/* Recording Stage Visualizer */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 text-center flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated background pulse during recording */}
        {isRecording && (
          <div className="absolute inset-0 bg-teal-500/5 animate-pulse pointer-events-none" />
        )}

        {/* Live Audio Waveform Animation */}
        <div className="h-16 flex items-center justify-center gap-1.5 w-full max-w-xs mb-4">
          {audioLevels.map((lvl, idx) => (
            <div
              key={idx}
              className={`w-2.5 rounded-full transition-all duration-75 ${
                isRecording
                  ? 'bg-gradient-to-t from-teal-500 to-emerald-300 shadow-[0_0_8px_rgba(20,184,166,0.6)]'
                  : audioUrl
                  ? 'bg-teal-700/60 h-4'
                  : 'bg-slate-800 h-2'
              }`}
              style={{
                height: isRecording ? `${lvl}%` : audioUrl ? '24px' : '8px'
              }}
            />
          ))}
        </div>

        {/* Recording Status / Timer */}
        <div className="mb-4">
          {isRecording ? (
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>{t.listeningStatus} ({formatTime(recordingDuration)})</span>
            </div>
          ) : audioUrl ? (
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <Check className="w-4 h-4" />
              <span>Voice journal recorded ({formatTime(recordingDuration)})</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">
              Tap below to record symptoms in {selectedLanguage.toUpperCase()}
            </span>
          )}
        </div>

        {/* Recording Buttons */}
        <div className="flex items-center gap-3">
          {!isRecording && !audioUrl && (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-extrabold text-sm rounded-full shadow-lg shadow-teal-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Mic className="w-5 h-5" />
              <span>{t.recordVoiceBtn}</span>
            </button>
          )}

          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm rounded-full shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all animate-pulse"
            >
              <Square className="w-5 h-5 fill-current" />
              <span>{t.stopVoiceBtn}</span>
            </button>
          )}

          {audioUrl && !isRecording && (
            <div className="flex items-center gap-3">
              <audio src={audioUrl} controls className="h-9 rounded-lg" />
              <button
                type="button"
                onClick={discardAudio}
                className="p-2.5 rounded-full bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                title="Discard and re-record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Manual text note or transcript preview override */}
      <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span>Patient Journal Notes &amp; Observations</span>
          </label>
          <span className="text-[10px] text-slate-500">
            Multimodal Gemini will cross-reference audio &amp; text
          </span>
        </div>
        <textarea
          rows={3}
          value={manualText}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder={t.manualNotePlaceholder}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none transition-colors"
        />
      </div>
    </div>
  );
};
