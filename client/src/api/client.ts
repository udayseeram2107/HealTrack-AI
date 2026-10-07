import {
  WoundRecord,
  WoundEntryRecord,
  CreateWoundInput,
  DoctorShareCreateInput,
  VerifiedFacility,
  SBARSummary
} from '@/shared/index.js';

const API_BASE = '/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || 'Server request failed');
  }
  return (json.data !== undefined ? json.data : json) as T;
}

export const api = {
  // Profiles & System
  async getProfile() {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer demo-token` }
    });
    return handleResponse(res);
  },

  async updateProfile(data: { full_name?: string; phone_number?: string; preferred_language?: string }) {
    const res = await fetch(`${API_BASE}/profile`, {
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
    const res = await fetch(`${API_BASE}/profile/status`);
    return handleResponse(res);
  },

  async updateApiKeys(keys: { geminiApiKey?: string; googleMapsApiKey?: string }) {
    const res = await fetch(`${API_BASE}/profile/keys`, {
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
    const res = await fetch(`${API_BASE}/wounds`, {
      headers: { Authorization: `Bearer demo-token` }
    });
    return handleResponse<WoundRecord[]>(res);
  },

  async getWound(woundId: string): Promise<WoundRecord & { entries: WoundEntryRecord[] }> {
    const res = await fetch(`${API_BASE}/wounds/${woundId}`, {
      headers: { Authorization: `Bearer demo-token` }
    });
    return handleResponse<WoundRecord & { entries: WoundEntryRecord[] }>(res);
  },

  async createWound(input: CreateWoundInput): Promise<WoundRecord> {
    const res = await fetch(`${API_BASE}/wounds`, {
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
    const res = await fetch(`${API_BASE}/wounds/${woundId}/entries`, {
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
    const res = await fetch(`${API_BASE}/wounds/${woundId}/compare`, {
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
    const res = await fetch(`${API_BASE}/wounds/${woundId}/summary`, {
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
    const res = await fetch(`${API_BASE}/wounds/${woundId}/shares`, {
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
    const res = await fetch(`${API_BASE}/public/shares/${token}`);
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

    const res = await fetch(`${API_BASE}/maps/nearby-facilities?${query.toString()}`);
    const json = await res.json();
    return json;
  },

  async geocode(query: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null> {
    const res = await fetch(`${API_BASE}/maps/geocode?q=${encodeURIComponent(query)}`);
    const json = await res.json();
    return json.data || null;
  }
};
