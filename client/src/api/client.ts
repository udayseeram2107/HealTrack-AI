import {
  WoundRecord,
  WoundEntryRecord,
  CreateWoundInput,
  DoctorShareCreateInput,
  VerifiedFacility,
  SBARSummary
} from '@/shared/index.js';

// Dynamic API Base URL resolver supporting environment variables, localStorage override, and remote fallback
export function getApiBaseUrl(): string {
  // 1. Runtime override saved by user in browser
  if (typeof window !== 'undefined') {
    try {
      const custom = localStorage.getItem('healtrack_custom_api_url');
      if (custom && custom.trim()) {
        const c = custom.trim().replace(/\/+$/, '');
        return c.endsWith('/api/v1') ? c : `${c}/api/v1`;
      }
    } catch (_) {}
  }

  // 2. Build-time Vite environment variable
  const rawBase = (((import.meta as any).env?.VITE_API_BASE_URL as string) || '').trim().replace(/\/+$/, '');
  if (rawBase) {
    return rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`;
  }

  // 3. Fallback for remote static hosting (like Vercel) where /api/v1 is not locally proxied
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'https://inkhc-2401-4900-cbed-4d50-d8ba-6e87-9031-7c6.run.pinggy-free.link/api/v1';
  }

  // 4. Default to local proxy /api/v1 for local Vite dev server
  return '/api/v1';
}

export function setApiBaseUrl(url: string) {
  try {
    if (url && url.trim()) {
      localStorage.setItem('healtrack_custom_api_url', url.trim());
    } else {
      localStorage.removeItem('healtrack_custom_api_url');
    }
  } catch (_) {}
}

export const API_BASE = getApiBaseUrl();

export function getFullImageUrl(url?: string): string {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const base = getApiBaseUrl();
  if (base.startsWith('http://') || base.startsWith('https://')) {
    try {
      const origin = new URL(base).origin;
      return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
    } catch (_) {}
  }
  return url;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';

  // Prevent "Unexpected token 'T', "The page c"... is not valid JSON" when reverse proxy/tunnels return HTML
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    const cleanSnippet = text.replace(/<[^>]*>?/gm, '').trim().substring(0, 120);

    if (res.status === 405) {
      throw new Error(
        `Backend service unavailable (405): The request was sent to a static frontend path instead of the API server. Please configure your API URL or check Vercel environment variables.`
      );
    }

    if (!res.ok) {
      throw new Error(
        `Backend service unavailable (${res.status}): ${cleanSnippet || res.statusText || 'Unable to communicate with API server.'}`
      );
    }
    throw new Error(
      `Received non-JSON response from server (${res.status}). Please verify that the API backend is active.`
    );
  }

  try {
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error || `Server request failed with status ${res.status}`);
    }
    return (json.data !== undefined ? json.data : json) as T;
  } catch (err: any) {
    if (err.message && !err.message.includes('not valid JSON')) {
      throw err;
    }
    throw new Error(
      'Invalid JSON response from server. Please verify the API backend is running.'
    );
  }
}

export const api = {
  // Profiles & System
  async getProfile() {
    const res = await fetch(`${getApiBaseUrl()}/profile`, {
      headers: { Authorization: `Bearer demo-token` }
    });
    return handleResponse(res);
  },

  async updateProfile(data: { full_name?: string; phone_number?: string; preferred_language?: string }) {
    const res = await fetch(`${getApiBaseUrl()}/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer demo-token`
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getSystemStatus(): Promise<{
    gemini: { isConfigured: boolean; model: string };
    googleMaps: { isConfigured: boolean };
    database: { type: string; status: string };
  }> {
    const res = await fetch(`${getApiBaseUrl()}/profile/status`);
    return handleResponse(res);
  },

  async updateApiKeys(keys: { geminiApiKey?: string; googleMapsApiKey?: string }) {
    const res = await fetch(`${getApiBaseUrl()}/profile/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer demo-token`
      },
      body: JSON.stringify(keys)
    });
    return handleResponse(res);
  },

  // Wounds
  async listWounds(): Promise<WoundRecord[]> {
    const res = await fetch(`${getApiBaseUrl()}/wounds`, {
      headers: { Authorization: `Bearer demo-token` }
    });
    return handleResponse<WoundRecord[]>(res);
  },

  async getWound(woundId: string): Promise<WoundRecord & { entries: WoundEntryRecord[] }> {
    const res = await fetch(`${getApiBaseUrl()}/wounds/${woundId}`, {
      headers: { Authorization: `Bearer demo-token` }
    });
    return handleResponse<WoundRecord & { entries: WoundEntryRecord[] }>(res);
  },

  async createWound(input: CreateWoundInput): Promise<WoundRecord> {
    const res = await fetch(`${getApiBaseUrl()}/wounds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer demo-token`
      },
      body: JSON.stringify(input)
    });
    return handleResponse<WoundRecord>(res);
  },

  // Entries
  async createWoundEntry(woundId: string, formData: FormData): Promise<WoundEntryRecord> {
    const res = await fetch(`${getApiBaseUrl()}/wounds/${woundId}/entries`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer demo-token`
      },
      body: formData
    });
    return handleResponse<WoundEntryRecord>(res);
  },

  async compareEntries(
    woundId: string,
    baseEntryId: string,
    targetEntryId: string
  ): Promise<{
    baseEntry: WoundEntryRecord;
    targetEntry: WoundEntryRecord;
    daysElapsed: number;
    healingStatus: string;
    deltas: {
      pain: number;
      granulation: number;
      slough: number;
      necrosis: number;
    };
  }> {
    const res = await fetch(`${getApiBaseUrl()}/wounds/${woundId}/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer demo-token`
      },
      body: JSON.stringify({ baseEntryId, targetEntryId })
    });
    return handleResponse(res);
  },

  async getWoundSummary(woundId: string): Promise<{
    wound: WoundRecord;
    summary: SBARSummary;
    entryCount: number;
    latestRisk: string;
  }> {
    const res = await fetch(`${getApiBaseUrl()}/wounds/${woundId}/summary`, {
      headers: { Authorization: `Bearer demo-token` }
    });
    return handleResponse(res);
  },

  // Doctor Shares
  async createDoctorShare(
    woundId: string,
    durationHours: number = 48,
    passcode?: string
  ): Promise<{ token: string; expires_at: string; share_url: string }> {
    const res = await fetch(`${getApiBaseUrl()}/wounds/${woundId}/shares`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer demo-token`
      },
      body: JSON.stringify({ duration_hours: durationHours, passcode })
    });
    return handleResponse(res);
  },

  async getSharedData(token: string): Promise<{
    wound: WoundRecord;
    entries: WoundEntryRecord[];
    sbarSummary: SBARSummary | null;
    shareInfo: { expires_at: string; view_count: number };
  }> {
    const res = await fetch(`${getApiBaseUrl()}/public/shares/${token}`);
    return handleResponse(res);
  },

  // Maps & Places
  async getNearbyFacilities(params: {
    lat: number;
    lng: number;
    radius?: number;
    specialty?: string;
  }): Promise<{
    isConfigured: boolean;
    status: string;
    message: string;
    setupGuidance?: {
      step1: string;
      step2: string;
      step3: string;
      docsUrl: string;
    };
    facilities: (VerifiedFacility & { distance_km: number })[];
  }> {
    const query = new URLSearchParams({
      lat: params.lat.toString(),
      lng: params.lng.toString(),
      radius: (params.radius || 10000).toString(),
      ...(params.specialty ? { specialty: params.specialty } : {})
    });

    const res = await fetch(`${getApiBaseUrl()}/maps/nearby-facilities?${query.toString()}`);
    return handleResponse(res);
  },

  async geocode(query: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null> {
    const res = await fetch(`${getApiBaseUrl()}/maps/geocode?q=${encodeURIComponent(query)}`);
    const data = await handleResponse<{ lat: number; lng: number; formattedAddress: string } | null>(res);
    return data;
  }
};
