import { z } from 'zod';

export const CNS_SUFFIX = '.unverified.cns';

export const AnsEntrySchema = z.object({
  contract_id: z.string().optional(),
  user: z.string(),
  name: z.string(),
  url: z.string(),
  description: z.string(),
  expires_at: z.string().datetime().optional().nullable(),
});

export type AnsEntry = z.infer<typeof AnsEntrySchema>;

export const ListEntriesResponseSchema = z.object({
  entries: z.array(AnsEntrySchema),
});

export const LookupEntryByNameResponseSchema = z.object({
  entry: AnsEntrySchema,
});

export const LookupEntryByPartyResponseSchema = z.object({
  entry: AnsEntrySchema,
});

export const CreateAnsEntryRequestSchema = z.object({
  name: z.string().min(1),
  url: z.string().max(255),
  description: z.string().max(140),
});

export type CreateAnsEntryRequest = z.infer<typeof CreateAnsEntryRequestSchema>;

export const CreateAnsEntryResponseSchema = z.object({
  entryContextCid: z.string(),
  subscriptionRequestCid: z.string(),
  name: z.string(),
  url: z.string(),
  description: z.string(),
});

export type CreateAnsEntryResponse = z.infer<typeof CreateAnsEntryResponseSchema>;

export const UserAnsEntrySchema = z.object({
  contractId: z.string(),
  name: z.string(),
  amount: z.string(),
  unit: z.string(),
  expiresAt: z.string(),
  paymentInterval: z.string(),
  paymentDuration: z.string(),
});

export type UserAnsEntry = z.infer<typeof UserAnsEntrySchema>;

export const ListUserEntriesResponseSchema = z.object({
  entries: z.array(UserAnsEntrySchema),
});

export type NameAvailability =
  | { status: 'checking' }
  | { status: 'available' }
  | { status: 'taken'; entry: AnsEntry }
  | { status: 'invalid'; reason: string }
  | { status: 'error'; message: string };

export type RegistrationState =
  | { status: 'idle' }
  | { status: 'ready'; name: string }
  | { status: 'submitting'; name: string }
  | { status: 'awaiting_wallet'; name: string; subscriptionRequestCid: string; entryContextCid: string }
  | { status: 'awaiting_payment'; name: string; subscriptionRequestCid: string }
  | { status: 'awaiting_confirmation'; name: string }
  | { status: 'confirmed'; name: string; entry: AnsEntry }
  | { status: 'rejected'; name: string; reason: string }
  | { status: 'failed'; name: string; error: string }
  | { status: 'timeout'; name: string; lastKnownState: string };

export interface CnsConfig {
  scanApiUrl: string;
  validatorApiUrl: string;
  network: string;
  mode: 'live' | 'demo';
}

export interface AuthenticatedUser {
  partyId: string;
  displayName?: string;
  isConnected: boolean;
}

export interface ResolvedName {
  canonicalName: string;
  partyId: string;
  url: string;
  description: string;
  expiresAt: string | null;
  network: string;
  isExpired: boolean;
  isDemo: boolean;
}

export const NAME_VALIDATION = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 63,
  PATTERN: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
  RESERVED: ['dso', 'admin', 'canton', 'system', 'root', 'api', 'www', 'app'],
};

export function validateName(input: string): { valid: true; canonicalName: string } | { valid: false; reason: string } {
  const trimmed = input.trim().toLowerCase();
  
  let baseName = trimmed;
  if (baseName.endsWith(CNS_SUFFIX)) {
    baseName = baseName.slice(0, -CNS_SUFFIX.length);
  }
  
  if (baseName.length < NAME_VALIDATION.MIN_LENGTH) {
    return { valid: false, reason: `Name must be at least ${NAME_VALIDATION.MIN_LENGTH} characters` };
  }
  
  if (baseName.length > NAME_VALIDATION.MAX_LENGTH) {
    return { valid: false, reason: `Name must be at most ${NAME_VALIDATION.MAX_LENGTH} characters` };
  }
  
  if (!NAME_VALIDATION.PATTERN.test(baseName)) {
    return { valid: false, reason: 'Name can only contain lowercase letters, numbers, and hyphens (not at start or end)' };
  }
  
  if (NAME_VALIDATION.RESERVED.includes(baseName)) {
    return { valid: false, reason: 'This name is reserved' };
  }
  
  return { valid: true, canonicalName: `${baseName}${CNS_SUFFIX}` };
}

export function parseCanonicalName(fullName: string): string {
  if (fullName.endsWith(CNS_SUFFIX)) {
    return fullName.slice(0, -CNS_SUFFIX.length);
  }
  return fullName;
}

export function formatPartyId(partyId: string, short: boolean = false): string {
  if (short && partyId.length > 20) {
    return `${partyId.slice(0, 10)}...${partyId.slice(-8)}`;
  }
  return partyId;
}

export function isExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}
