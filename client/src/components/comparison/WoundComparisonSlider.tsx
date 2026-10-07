import React, { useState, useRef, useCallback } from 'react';
import {
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  Columns,
  Layers,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles
} from 'lucide-react';

interface WoundComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeDate?: string;
  afterDate?: string;
  beforeLabel?: string;
  afterLabel?: string;
  deltas?: {
    pain?: number;
    granulation?: number;
    slough?: number;
    necrosis?: number;
    areaTrend?: string;
  };
  visualChangeSummary?: string;
  healingStatus?: string;
}

export const WoundComparisonSlider: React.FC<WoundComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  beforeDate = 'Baseline Capture',
  afterDate = 'Current Capture',
  beforeLabel = 'Previous / Baseline',
  afterLabel = 'Latest Telemetry',
  deltas,
  visualChangeSummary,
  healingStatus
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'side-by-side'>('split');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="space-y-4">
      {/* View controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Comparison Mode:
          </span>
          <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'split'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Split Slider</span>
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'side-by-side'
                  ? 'bg-teal-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>
        </div>

        {/* Magnification Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Magnification:</span>
          <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
              disabled={zoomLevel <= 1}
              className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-40"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-teal-300">{zoomLevel.toFixed(1)}x</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              disabled={zoomLevel >= 2.5}
              className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-40"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Image Viewer */}
      {viewMode === 'split' ? (
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          className="relative w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden select-none border border-slate-800 bg-slate-950 shadow-2xl cursor-ew-resize group"
        >
          {/* After image (background layer) */}
          <img
            src={afterImage}
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform"
            style={{ transform: `scale(${zoomLevel})` }}
          />

          {/* Before image (clipped overlay layer) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="absolute top-0 left-0 h-full max-w-none object-contain transition-transform"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                transform: `scale(${zoomLevel})`
              }}
            />
          </div>

          {/* Visual Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 via-white to-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.8)] cursor-ew-resize"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={handleMouseDown}
          >
            {/* Draggable Thumb / Handle */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-slate-950 border-2 border-teal-400 shadow-xl flex items-center justify-center text-teal-300 cursor-ew-resize group-hover:scale-110 transition-transform">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </div>

          {/* Date Overlays */}
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-xs shadow-lg pointer-events-none">
            <span className="text-teal-400 font-semibold">{beforeLabel}</span>
            <span className="text-slate-400 ml-1.5">({beforeDate.split('T')[0]})</span>
          </div>
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-xs shadow-lg pointer-events-none">
            <span className="text-emerald-400 font-semibold">{afterLabel}</span>
            <span className="text-slate-400 ml-1.5">({afterDate.split('T')[0]})</span>
          </div>

          {/* Instructions pill */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-400 pointer-events-none">
            Drag slider left / right to reveal changes
          </div>
        </div>
      ) : (
        /* Side by side mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-3 border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-teal-400">{beforeLabel}</span>
              <span className="text-slate-400">{beforeDate.split('T')[0]}</span>
            </div>
            <div className="h-72 rounded-xl overflow-hidden bg-slate-950 relative flex items-center justify-center">
              <img
                src={beforeImage}
                alt={beforeLabel}
                className="w-full h-full object-contain transition-transform"
                style={{ transform: `scale(${zoomLevel})` }}
              />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-3 border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-emerald-400">{afterLabel}</span>
              <span className="text-slate-400">{afterDate.split('T')[0]}</span>
            </div>
            <div className="h-72 rounded-xl overflow-hidden bg-slate-950 relative flex items-center justify-center">
              <img
                src={afterImage}
                alt={afterLabel}
                className="w-full h-full object-contain transition-transform"
                style={{ transform: `scale(${zoomLevel})` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Visual Delta Metrics & Shift Breakdown */}
      {deltas && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Granulation Delta */}
          <div className="glass-card rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Granulation Shift</div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span
                className={`text-lg font-bold ${
                  (deltas.granulation ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {(deltas.granulation ?? 0) >= 0 ? `+${deltas.granulation}%` : `${deltas.granulation}%`}
              </span>
              {(deltas.granulation ?? 0) > 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (deltas.granulation ?? 0) < 0 ? (
                <TrendingDown className="w-4 h-4 text-rose-400" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Healthy capillary bed tissue</p>
          </div>

          {/* Slough Delta */}
          <div className="glass-card rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Slough Shift</div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span
                className={`text-lg font-bold ${
                  (deltas.slough ?? 0) <= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {(deltas.slough ?? 0) > 0 ? `+${deltas.slough}%` : `${deltas.slough}%`}
              </span>
              {(deltas.slough ?? 0) < 0 ? (
                <TrendingDown className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingUp className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Yellow non-viable tissue</p>
          </div>

          {/* Necrosis Delta */}
          <div className="glass-card rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Necrosis Shift</div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span
                className={`text-lg font-bold ${
                  (deltas.necrosis ?? 0) <= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {(deltas.necrosis ?? 0) > 0 ? `+${deltas.necrosis}%` : `${deltas.necrosis}%`}
              </span>
              {(deltas.necrosis ?? 0) <= 0 ? (
                <Minus className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <TrendingUp className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Black eschar / dead tissue</p>
          </div>

          {/* Pain Score Delta */}
          <div className="glass-card rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Pain Score Delta</div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span
                className={`text-lg font-bold ${
                  (deltas.pain ?? 0) <= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {(deltas.pain ?? 0) > 0 ? `+${deltas.pain} pts` : `${deltas.pain} pts`}
              </span>
              {(deltas.pain ?? 0) < 0 ? (
                <TrendingDown className="w-4 h-4 text-emerald-400" />
              ) : (deltas.pain ?? 0) > 0 ? (
                <TrendingUp className="w-4 h-4 text-rose-400" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">NRS 0-10 self-reported scale</p>
          </div>
        </div>
      )}

      {/* Visual Change Explanation */}
      {(visualChangeSummary || healingStatus) && (
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-start gap-3">
          <div className="p-2 bg-teal-950 text-teal-400 rounded-xl shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-teal-300">
              {healingStatus || 'Longitudinal Change Detection Summary'}
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {visualChangeSummary || 'Tissue granulation and margin advancement evaluated between captures.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
