import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { RiskLevel } from '../../../../shared/index.js';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n/translations';

interface RiskBadgeProps {
  level: RiskLevel;
  reasoning?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  reasoning,
  size = 'md',
  showTooltip = true
}) => {
  const [hovered, setHovered] = useState(false);
  const { language } = useAppStore();
  const t = translations[language] || translations.en;

  let badgeColor = '';
  let icon = null;
  let label = '';
  let defaultCriteria = '';

  switch (level) {
    case 'stable':
      badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30';
      icon = <ShieldCheck className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      label = `🟢 ${t.stableBadge}`;
      defaultCriteria = 'Active re-epithelialization, minimal serous drainage, decreasing erythema, controlled pain.';
      break;
    case 'monitor':
      badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-500/30';
      icon = <AlertTriangle className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      label = `🟡 ${t.monitorBadge}`;
      defaultCriteria = 'Stagnant margins, mild seropurulent exudate, localized warmth, mild periwound edema.';
      break;
    case 'clinical_review_recommended':
      badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-500/30 animate-pulse';
      icon = <AlertOctagon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      label = `🔴 ${t.reviewBadge}`;
      defaultCriteria = 'Spreading periwound erythema, purulent drainage, foul odor, necrosis or pain spike.';
      break;
    default:
      badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
      label = 'Pending';
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm transition-all duration-200 cursor-help ${badgeColor} ${sizeClasses}`}
      >
        {icon}
        <span>{label}</span>
      </span>

      {showTooltip && hovered && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-md text-xs text-slate-200 pointer-events-none">
          <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>Clinical Triage Rationale</span>
          </div>
          <p className="text-slate-300 leading-relaxed mb-2">
            {reasoning || defaultCriteria}
          </p>
          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1.5 italic">
            Calibrated against TIME clinical framework
          </div>
        </div>
      )}
    </div>
  );
};
