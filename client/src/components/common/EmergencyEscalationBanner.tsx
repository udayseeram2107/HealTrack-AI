import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, PhoneCall, MapPin, X, Activity } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n/translations';

export const EmergencyEscalationBanner: React.FC = () => {
  const navigate = useNavigate();
  const { isEmergencyActive, emergencyReason, dismissEmergencyAlert, language } = useAppStore();
  const t = translations[language] || translations.en;

  if (!isEmergencyActive) return null;

  return (
    <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white shadow-2xl border-b border-red-500/50 sticky top-0 z-50 animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Alert Title & Reasoning */}
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-red-900/80 rounded-xl border border-red-400/40 shrink-0 animate-pulse">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wide text-sm uppercase bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-400/30">
                  {t.emergencyAlertTitle}
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-red-100">
                {emergencyReason || t.emergencyAlertSubtitle}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-red-200">
                <Activity className="w-3.5 h-3.5" />
                <span>Immediate clinical evaluation warranted. Do not delay emergency consultation.</span>
              </div>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            {/* 1-tap Call Trigger */}
            <a
              href="tel:112"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-700 hover:bg-red-50 font-bold text-sm rounded-xl shadow-lg transition-transform active:scale-95"
            >
              <PhoneCall className="w-4 h-4 fill-current" />
              <span>{t.callEmergencyButton}</span>
            </a>

            {/* Direct ER Locator Trigger */}
            <button
              onClick={() => navigate('/hospitals?specialty=Emergency+Medicine')}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-900/90 hover:bg-red-950 text-white font-semibold text-sm rounded-xl border border-red-400/50 shadow-md transition-colors"
            >
              <MapPin className="w-4 h-4 text-red-300" />
              <span>{t.findNearestERButton}</span>
            </button>

            {/* Dismiss / Acknowledge */}
            <button
              onClick={dismissEmergencyAlert}
              title={t.dismissBanner}
              className="p-2 text-red-200 hover:text-white hover:bg-red-800/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
