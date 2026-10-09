import type { AnsEntry, NameAvailability, CreateAnsEntryRequest, CreateAnsEntryResponse, UserAnsEntry, ResolvedName } from './types';
import { validateName, isExpired, LookupEntryByNameResponseSchema, ListEntriesResponseSchema } from './types';
import { cnsConfig, isDemoMode } from './config';
import { 
  getDemoEntry, 
  searchDemoEntries, 
  getDemoUserEntries, 
  isDemoNameTaken,
  getDemoScenario,
  toResolvedName,
  DEMO_PARTY_ID,
  DEMO_REGISTRATION_CONFIG,
} from './demo-fixtures';

export interface CnsReadAdapter {
  lookupByName(name: string): Promise<AnsEntry | null>;
  lookupByParty(partyId: string): Promise<AnsEntry | null>;
  searchByPrefix(prefix: string, limit?: number): Promise<AnsEntry[]>;
  checkAvailability(name: string): Promise<NameAvailability>;
  resolve(name: string): Promise<ResolvedName | null>;
}

export interface CnsRegistrationAdapter {
  requestRegistration(request: CreateAnsEntryRequest): Promise<CreateAnsEntryResponse>;
  getUserEntries(): Promise<UserAnsEntry[]>;
  getRegistrationConfig(): Promise<{ fee: string; unit: string; lifetimeDays: number }>;
}

const ENTRIES_API = '/api/cns/entries';

class DemoReadAdapter implements CnsReadAdapter {
  private delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 200));
  }

  async lookupByName(name: string): Promise<AnsEntry | null> {
    await this.delay();
    return getDemoEntry(name);
  }

  async lookupByParty(partyId: string): Promise<AnsEntry | null> {
    await this.delay();
    const entries = Object.values(await import('./demo-fixtures').then(m => m.DEMO_ENTRIES));
    return entries.find(e => e.user === partyId) ?? null;
  }

  async searchByPrefix(prefix: string, limit: number = 10): Promise<AnsEntry[]> {
    await this.delay();
    return searchDemoEntries(prefix, limit);
  }

  async checkAvailability(input: string): Promise<NameAvailability> {
    await this.delay(400);
    
    const validation = validateName(input);
    if (!validation.valid) {
      return { status: 'invalid', reason: validation.reason };
    }
    
    const { canonicalName } = validation;
    
    if (isDemoNameTaken(canonicalName)) {
      const entry = getDemoEntry(canonicalName);
      if (entry && !isExpired(entry.expires_at)) {
        return { status: 'taken', entry };
      }
    }
    
    return { status: 'available' };
  }

  async resolve(name: string): Promise<ResolvedName | null> {
    const entry = await this.lookupByName(name);
    if (!entry) return null;
    return toResolvedName(entry, cnsConfig.network, true);
  }
}

class DemoRegistrationAdapter implements CnsRegistrationAdapter {
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 300));
  }

  async requestRegistration(request: CreateAnsEntryRequest): Promise<CreateAnsEntryResponse> {
    await this.delay(800);
    
    const scenario = getDemoScenario();
    
    if (scenario === 'service_error') {
      throw new Error('Service temporarily unavailable');
    }
    
    if (scenario === 'insufficient_funds') {
      throw new Error('Insufficient Canton Coin balance');
    }
    
    return {
      entryContextCid: `demo-context-${Date.now()}`,
      subscriptionRequestCid: `demo-subscription-${Date.now()}`,
      name: request.name,
      url: request.url,
      description: request.description,
    };
  }

  async getUserEntries(): Promise<UserAnsEntry[]> {
    await this.delay();
    return getDemoUserEntries();
  }

  async getRegistrationConfig(): Promise<{ fee: string; unit: string; lifetimeDays: number }> {
    await this.delay(200);
    return {
      fee: DEMO_REGISTRATION_CONFIG.entryFee,
      unit: DEMO_REGISTRATION_CONFIG.feeUnit,
      lifetimeDays: DEMO_REGISTRATION_CONFIG.lifetimeDays,
    };
  }
}

class LiveReadAdapter implements CnsReadAdapter {
  private async fetchEntries(path: string): Promise<Response> {
    const response = await fetch(path, { headers: { Accept: 'application/json' } });
    return response;
  }

  async lookupByName(name: string): Promise<AnsEntry | null> {
    const response = await this.fetchEntries(`${ENTRIES_API}?name=${encodeURIComponent(name)}`);
    if (response.status === 503) {
      throw new Error('Live CNS backend not configured');
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.entry) return null;
    const parsed = LookupEntryByNameResponseSchema.safeParse({ entry: data.entry });
    if (!parsed.success) throw new Error('Invalid response format');
    return parsed.data.entry;
  }

  async lookupByParty(partyId: string): Promise<AnsEntry | null> {
    const response = await this.fetchEntries(`${ENTRIES_API}?party=${encodeURIComponent(partyId)}`);
    if (response.status === 503) {
      throw new Error('Live CNS backend not configured');
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.entry ?? null;
  }

  async searchByPrefix(prefix: string, limit: number = 10): Promise<AnsEntry[]> {
    const params = new URLSearchParams({
      prefix,
      limit: String(limit),
    });
    const response = await this.fetchEntries(`${ENTRIES_API}?${params}`);
    if (response.status === 503) {
      throw new Error('Live CNS backend not configured');
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const parsed = ListEntriesResponseSchema.safeParse(data);
    if (!parsed.success) throw new Error('Invalid response format');
    return parsed.data.entries;
  }

  async checkAvailability(input: string): Promise<NameAvailability> {
    const validation = validateName(input);
    if (!validation.valid) {
      return { status: 'invalid', reason: validation.reason };
    }
    
    const { canonicalName } = validation;
    
    try {
      const entry = await this.lookupByName(canonicalName);
      if (entry && !isExpired(entry.expires_at)) {
        return { status: 'taken', entry };
      }
      return { status: 'available' };
    } catch (error) {
      return { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Failed to check availability' 
      };
    }
  }

  async resolve(name: string): Promise<ResolvedName | null> {
    const entry = await this.lookupByName(name);
    if (!entry) return null;
    return toResolvedName(entry, cnsConfig.network, false);
  }
}

class LiveRegistrationAdapter implements CnsRegistrationAdapter {
  async requestRegistration(_request: CreateAnsEntryRequest): Promise<CreateAnsEntryResponse> {
    const hint = cnsConfig.registrationUiUrl
      ? `Register in your wallet: ${cnsConfig.registrationUiUrl}`
      : 'Live registration requires wallet authentication on your validator.';
    throw new Error(hint);
  }

  async getUserEntries(): Promise<UserAnsEntry[]> {
    throw new Error(
      'Listing user entries requires authentication. Connect your wallet on your validator.'
    );
  }

  async getRegistrationConfig(): Promise<{ fee: string; unit: string; lifetimeDays: number }> {
    return {
      fee: 'TBD',
      unit: 'CC',
      lifetimeDays: 30,
    };
  }
}

let readAdapter: CnsReadAdapter | null = null;
let registrationAdapter: CnsRegistrationAdapter | null = null;

export function getReadAdapter(): CnsReadAdapter {
  if (!readAdapter) {
    readAdapter = isDemoMode() 
      ? new DemoReadAdapter()
      : new LiveReadAdapter();
  }
  return readAdapter;
}

export function getRegistrationAdapter(): CnsRegistrationAdapter {
  if (!registrationAdapter) {
    registrationAdapter = isDemoMode()
      ? new DemoRegistrationAdapter()
      : new LiveRegistrationAdapter();
  }
  return registrationAdapter;
}

export function resetAdapters(): void {
  readAdapter = null;
  registrationAdapter = null;
}

export { DEMO_PARTY_ID };
