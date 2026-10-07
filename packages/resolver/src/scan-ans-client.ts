import {
  LookupEntryByNameResponseSchema,
  LookupEntryByPartyResponseSchema,
  ListEntriesResponseSchema,
  type AnsEntry,
} from './scan-types';

export type UpstreamStyle = 'scan' | 'scan-proxy';

export interface ScanAnsClientOptions {
  baseUrl: string;
  style: UpstreamStyle;
  getAuthHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  fetchImpl?: typeof fetch;
}

function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function buildAnsEntriesBasePath(baseUrl: string, style: UpstreamStyle): string {
  const root = trimTrailingSlash(baseUrl);
  if (style === 'scan-proxy') {
    return `${root}/v0/scan-proxy/ans-entries`;
  }
  return `${root}/v0/ans-entries`;
}

export class ScanAnsClient {
  private entriesBase: string;
  private getAuthHeaders?: ScanAnsClientOptions['getAuthHeaders'];
  private fetchImpl: typeof fetch;

  constructor(options: ScanAnsClientOptions) {
    this.entriesBase = buildAnsEntriesBasePath(options.baseUrl, options.style);
    this.getAuthHeaders = options.getAuthHeaders;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async requestHeaders(): Promise<Record<string, string>> {
    const extra = this.getAuthHeaders ? await this.getAuthHeaders() : {};
    return { Accept: 'application/json', ...extra };
  }

  async lookupByName(name: string, signal?: AbortSignal): Promise<{ entry: AnsEntry } | 'not_found' | 'error'> {
    try {
      const response = await this.fetchImpl(
        `${this.entriesBase}/by-name/${encodeURIComponent(name)}`,
        { headers: await this.requestHeaders(), signal }
      );
      if (response.status === 404) return 'not_found';
      if (!response.ok) return 'error';
      const data = await response.json();
      const parsed = LookupEntryByNameResponseSchema.safeParse(data);
      if (!parsed.success) return 'error';
      return { entry: parsed.data.entry };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      return 'error';
    }
  }

  async lookupByParty(
    partyId: string,
    signal?: AbortSignal
  ): Promise<{ entry: AnsEntry } | 'not_found' | 'error'> {
    try {
      const response = await this.fetchImpl(
        `${this.entriesBase}/by-party/${encodeURIComponent(partyId)}`,
        { headers: await this.requestHeaders(), signal }
      );
      if (response.status === 404) return 'not_found';
      if (!response.ok) return 'error';
      const data = await response.json();
      const parsed = LookupEntryByPartyResponseSchema.safeParse(data);
      if (!parsed.success) return 'error';
      return { entry: parsed.data.entry };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      return 'error';
    }
  }

  async searchByPrefix(
    prefix: string,
    pageSize: number,
    signal?: AbortSignal
  ): Promise<AnsEntry[] | 'error'> {
    try {
      const params = new URLSearchParams({
        name_prefix: prefix,
        page_size: String(pageSize),
      });
      const response = await this.fetchImpl(`${this.entriesBase}?${params}`, {
        headers: await this.requestHeaders(),
        signal,
      });
      if (!response.ok) return 'error';
      const data = await response.json();
      const parsed = ListEntriesResponseSchema.safeParse(data);
      if (!parsed.success) return 'error';
      return parsed.data.entries;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      return 'error';
    }
  }
}
