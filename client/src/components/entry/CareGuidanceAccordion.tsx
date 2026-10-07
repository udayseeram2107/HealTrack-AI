import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n/translations';

interface CareGuidanceAccordionProps {
  careTips: string[];
  risksIfNeglected: string[];
  recommendedSpecialties: string[];
  isEmergency?: boolean;
}

export const CareGuidanceAccordion: React.FC<CareGuidanceAccordionProps> = ({
  careTips = [],
  risksIfNeglected = [],
  recommendedSpecialties = [],
  isEmergency = false
}) => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = translations[language] || translations.en;

  const [openCard, setOpenCard] = useState<'tips' | 'risks' | 'specialties' | 'all'>('all');

  const toggle = (card: 'tips' | 'risks' | 'specialties') => {
    if (openCard === 'all') {
      setOpenCard(card);
    } else if (openCard === card) {
      setOpenCard('all');
    } else {
      setOpenCard(card);
    }
  };

  const isOpen = (card: 'tips' | 'risks' | 'specialties') => openCard === 'all' || openCard === card;

  return (
    <div className="space-y-4">
      {/* 1. Care Tips Card */}
      <div className="glass-card rounded-2xl border border-teal-500/20 overflow-hidden shadow-lg transition-all">
        <button
          type="button"
          onClick={() => toggle('tips')}
          className="w-full flex items-center justify-between p-4 bg-teal-950/40 hover:bg-teal-950/60 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-teal-200">
                1. {t.careTipsHeader}
              </h4>
              <p className="text-xs text-slate-400">
                Direct, hygienic, non-invasive maintenance protocols
              </p>
            </div>
          </div>
          {isOpen('tips') ? (
            <ChevronUp className="w-4 h-4 text-teal-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-teal-400" />
          )}
        </button>

        {isOpen('tips') && (
          <div className="p-4 pt-2 border-t border-teal-950/50 bg-slate-900/50">
            <ul className="space-y-2.5">
              {careTips.length > 0 ? (
                careTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-400 italic">
                  Continue current clean dressing regimen. Avoid mechanical pressure.
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* 2. Risks of Neglect Card */}
      <div className="glass-card rounded-2xl border border-amber-500/20 overflow-hidden shadow-lg transition-all">
        <button
          type="button"
          onClick={() => toggle('risks')}
          className="w-full flex items-center justify-between p-4 bg-amber-950/30 hover:bg-amber-950/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                2. {t.risksIfNeglectedHeader}
              </h4>
              <p className="text-xs text-slate-400">
                Objective, non-sensational explanations of clinical sequelae
              </p>
            </div>
          </div>
          {isOpen('risks') ? (
            <ChevronUp className="w-4 h-4 text-amber-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {isOpen('risks') && (
          <div className="p-4 pt-2 border-t border-amber-950/50 bg-slate-900/50">
            <ul className="space-y-2.5">
              {risksIfNeglected.length > 0 ? (
                risksIfNeglected.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{risk}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-400 italic">
                  Failure to monitor dressing could lead to bacterial contamination or skin maceration.
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* 3. Recommended Next Steps & Specialties Card */}
      <div className="glass-card rounded-2xl border border-sky-500/20 overflow-hidden shadow-lg transition-all">
        <button
          type="button"
          onClick={() => toggle('specialties')}
          className="w-full flex items-center justify-between p-4 bg-sky-950/30 hover:bg-sky-950/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-sky-200">
                3. {t.recommendedStepsHeader}
              </h4>
              <p className="text-xs text-slate-400">
                Targeted clinical departments &amp; medical providers
              </p>
            </div>
          </div>
          {isOpen('specialties') ? (
            <ChevronUp className="w-4 h-4 text-sky-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-sky-400" />
          )}
        </button>

        {isOpen('specialties') && (
          <div className="p-4 pt-2 border-t border-sky-950/50 bg-slate-900/50 space-y-3">
            <div className="flex flex-wrap gap-2">
              {recommendedSpecialties.map((spec, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => navigate(`/hospitals?specialty=${encodeURIComponent(spec)}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-900/40 hover:bg-sky-800/60 border border-sky-700/50 text-sky-200 text-xs font-semibold transition-all hover:scale-105"
                >
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>{spec}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
              <span className="text-slate-400">
                Need to locate verified providers in your area?
              </span>
              <button
                type="button"
                onClick={() => navigate('/hospitals')}
                className="text-teal-400 hover:text-teal-300 font-bold underline transition-colors"
              >
                Open Hospital Directory →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
