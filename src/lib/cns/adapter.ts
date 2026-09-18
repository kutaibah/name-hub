import type { AnsEntry, NameAvailability, CreateAnsEntryRequest, CreateAnsEntryResponse, UserAnsEntry, ResolvedName } from './types';
import { validateName, isExpired, ListEntriesResponseSchema, LookupEntryByNameResponseSchema } from './types';
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
  private baseUrl: string;

  constructor(scanApiUrl: string) {
    this.baseUrl = scanApiUrl;
  }

  async lookupByName(name: string): Promise<AnsEntry | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v0/ans-entries/by-name/${encodeURIComponent(name)}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const parsed = LookupEntryByNameResponseSchema.safeParse(data);
      if (!parsed.success) {
        console.error('Invalid response format:', parsed.error);
        throw new Error('Invalid response format from Scan API');
      }
      return parsed.data.entry;
    } catch (error) {
      console.error('Lookup by name failed:', error);
      throw error;
    }
  }

  async lookupByParty(partyId: string): Promise<AnsEntry | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v0/ans-entries/by-party/${encodeURIComponent(partyId)}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.entry;
    } catch (error) {
      console.error('Lookup by party failed:', error);
      throw error;
    }
  }

  async searchByPrefix(prefix: string, limit: number = 10): Promise<AnsEntry[]> {
    try {
      const params = new URLSearchParams({
        name_prefix: prefix,
        page_size: String(limit),
      });
      const response = await fetch(`${this.baseUrl}/v0/ans-entries?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const parsed = ListEntriesResponseSchema.safeParse(data);
      if (!parsed.success) {
        console.error('Invalid response format:', parsed.error);
        throw new Error('Invalid response format from Scan API');
      }
      return parsed.data.entries;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
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
  private baseUrl: string;

  constructor(validatorApiUrl: string) {
    this.baseUrl = validatorApiUrl;
  }

  async requestRegistration(_request: CreateAnsEntryRequest): Promise<CreateAnsEntryResponse> {
    throw new Error(
      'Live registration requires wallet authentication. ' +
      'Configure NEXT_PUBLIC_VALIDATOR_API_URL and implement wallet connection.'
    );
  }

  async getUserEntries(): Promise<UserAnsEntry[]> {
    throw new Error(
      'Listing user entries requires authentication. ' +
      'Configure NEXT_PUBLIC_VALIDATOR_API_URL and implement wallet connection.'
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
      : new LiveReadAdapter(cnsConfig.scanApiUrl);
  }
  return readAdapter;
}

export function getRegistrationAdapter(): CnsRegistrationAdapter {
  if (!registrationAdapter) {
    registrationAdapter = isDemoMode()
      ? new DemoRegistrationAdapter()
      : new LiveRegistrationAdapter(cnsConfig.validatorApiUrl);
  }
  return registrationAdapter;
}

export function resetAdapters(): void {
  readAdapter = null;
  registrationAdapter = null;
}

export { DEMO_PARTY_ID };
