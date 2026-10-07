import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  LayoutDashboard,
  FolderHeart,
  MapPin,
  Globe,
  Settings,
  Phone,
  CheckCircle2,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n/translations';
import { SupportedLanguage } from '@/shared/index.js';
import { api } from '../../api/client';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, user, isAuthenticated, logout, systemStatus, setSystemStatus } = useAppStore();
  const t = translations[language] || translations.en;

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [mapsKeyInput, setMapsKeyInput] = useState('');
  const [keyUpdateMsg, setKeyUpdateMsg] = useState('');

  useEffect(() => {
    api.getSystemStatus().then((res) => {
      setSystemStatus({
        geminiConfigured: res.gemini?.isConfigured || false,
        mapsConfigured: res.googleMaps?.isConfigured || false
      });
    }).catch(() => {});
  }, [setSystemStatus]);

  const navLinks = [
    { to: '/dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { to: '/wounds', label: t.navWounds, icon: FolderHeart },
    { to: '/hospitals', label: t.navHospitals, icon: MapPin }
  ];

  const languages: { code: SupportedLanguage; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' }
  ];

  const handleSaveApiKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await api.updateApiKeys({
        geminiApiKey: geminiKeyInput.trim() || undefined,
        googleMapsApiKey: mapsKeyInput.trim() || undefined
      });
      setKeyUpdateMsg('Keys updated successfully!');
      setSystemStatus({
        geminiConfigured: res.status?.geminiConfigured,
        mapsConfigured: res.status?.mapsConfigured
      });
      setTimeout(() => {
        setKeyUpdateMsg('');
        setSettingsOpen(false);
      }, 1500);
    } catch (err: any) {
      setKeyUpdateMsg(`Error: ${err.message}`);
    }
  };

  return (
    <>
      <nav className="glass-panel border-b border-slate-800 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-teal-200 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
                    {t.brandTitle}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800/60">
                    Clinical
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  {t.brandTagline}
                </p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-inner'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-teal-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2.5">
              {/* Emergency Hotline Button */}
              <a
                href="tel:112"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-semibold rounded-lg transition-colors"
                title="Direct Emergency Hotline"
              >
                <Phone className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>ER: 112 / 108</span>
              </a>

              {/* Language Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
                  aria-label="Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-teal-400" />
                  <span className="uppercase font-semibold">{language}</span>
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 glass-dropdown rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[10px] text-slate-400 px-2 py-1 font-semibold uppercase tracking-wider">
                      Select Language
                    </div>
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          language === l.code
                            ? 'bg-teal-500/20 text-teal-300 font-bold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span>{l.label}</span>
                        <span className="text-[11px] text-slate-400 font-sans">{l.native}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings / API Key modal button */}
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-colors relative"
                title="System Settings & Clinical API Configuration"
              >
                <Settings className="w-4 h-4" />
                {!systemStatus.geminiConfigured && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
                )}
              </button>

              {/* User Avatar & Logout Dropdown */}
              {isAuthenticated && user ? (
                <div className="relative pl-1 border-l border-slate-800">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-900/80 border border-teal-500/40 flex items-center justify-center text-teal-300 text-xs font-bold">
                      {user.full_name ? user.full_name.charAt(0) : 'U'}
                    </div>
                    <div className="hidden xl:block text-left">
                      <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{user.full_name}</div>
                      <div className="text-[10px] text-teal-400 capitalize">{user.role}</div>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 glass-dropdown rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 border-b border-slate-800">
                        <div className="text-xs font-bold text-white truncate">{user.full_name}</div>
                        <div className="text-[10px] text-teal-400 capitalize font-medium">{user.role} Portal</div>
                        {user.email && (
                          <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                        )}
                      </div>
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-teal-400" />
                          <span>Clinical Dashboard</span>
                        </Link>
                        <Link
                          to="/wounds"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <FolderHeart className="w-3.5 h-3.5 text-teal-400" />
                          <span>Wounds Portfolio</span>
                        </Link>
                      </div>
                      <div className="pt-1 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                            navigate('/login');
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-300 hover:bg-rose-950/60 font-semibold transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-400" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-bold shadow transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/80 bg-slate-900/90 text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg ${
                  isActive ? 'text-teal-400 font-bold' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-bold text-white">System & AI Integration</h3>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  API Status
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-300">Google Gemini 2.5 Flash SDK:</span>
                  <span className="flex items-center gap-1">
                    {systemStatus.geminiConfigured ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Fallback Engine Active
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-300">Google Maps Places API:</span>
                  <span className="flex items-center gap-1">
                    {systemStatus.mapsConfigured ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Key Not Provided
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveApiKeys} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Google Gemini API Key
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy... (optional runtime override)"
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Used for audio transcription and image analysis.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Google Maps Server API Key
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy... (optional runtime override)"
                    value={mapsKeyInput}
                    onChange={(e) => setMapsKeyInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Used for verified Places discovery & Hospital directory.
                  </p>
                </div>

                {keyUpdateMsg && (
                  <div className="text-xs p-2 rounded bg-teal-950/80 text-teal-300 border border-teal-800">
                    {keyUpdateMsg}
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors"
                  >
                    Save Credentials
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
