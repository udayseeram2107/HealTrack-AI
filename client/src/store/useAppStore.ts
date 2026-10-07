import { create } from 'zustand';
import { SupportedLanguage } from '../../../shared/index.js';

export interface UserState {
  id: string;
  full_name: string;
  role: 'patient' | 'doctor' | 'caregiver' | 'admin';
  phone_number?: string;
  email?: string;
  preferred_language: SupportedLanguage;
}

interface AppStore {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  user: UserState | null;
  isAuthenticated: boolean;
  login: (user: UserState) => void;
  logout: () => void;
  setUser: (user: UserState) => void;
  isEmergencyActive: boolean;
  emergencyReason: string;
  triggerEmergencyAlert: (reason: string) => void;
  dismissEmergencyAlert: () => void;
  activeWoundId: string | null;
  setActiveWoundId: (id: string | null) => void;
  systemStatus: {
    geminiConfigured: boolean;
    mapsConfigured: boolean;
  };
  setSystemStatus: (status: { geminiConfigured: boolean; mapsConfigured: boolean }) => void;
}

const getStoredUser = (): UserState | null => {
  try {
    const raw = localStorage.getItem('healtrack_user');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
};

const initialUser: UserState | null = getStoredUser();
const initialIsAuth: boolean = localStorage.getItem('healtrack_auth') === 'true';

export const useAppStore = create<AppStore>((set) => ({
  language: (localStorage.getItem('healtrack_lang') as SupportedLanguage) || 'en',
  setLanguage: (lang) => {
    localStorage.setItem('healtrack_lang', lang);
    set((state) => ({
      language: lang,
      user: state.user ? { ...state.user, preferred_language: lang } : null
    }));
  },
  user: initialUser,
  isAuthenticated: initialIsAuth,
  login: (user) => {
    localStorage.setItem('healtrack_auth', 'true');
    localStorage.setItem('healtrack_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('healtrack_auth');
    localStorage.removeItem('healtrack_user');
    set({ user: null, isAuthenticated: false });
  },
  setUser: (user) => {
    localStorage.setItem('healtrack_user', JSON.stringify(user));
    set({ user });
  },
  isEmergencyActive: false,
  emergencyReason: '',
  triggerEmergencyAlert: (reason) =>
    set({
      isEmergencyActive: true,
      emergencyReason: reason
    }),
  dismissEmergencyAlert: () =>
    set({
      isEmergencyActive: false,
      emergencyReason: ''
    }),
  activeWoundId: null,
  setActiveWoundId: (id) => set({ activeWoundId: id }),
  systemStatus: {
    geminiConfigured: false,
    mapsConfigured: false
  },
  setSystemStatus: (status) => set({ systemStatus: status })
}));
