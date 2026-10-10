import { z } from 'zod';

export const AnsEntrySchema = z.object({
  contract_id: z.string().optional().nullable(),
  user: z.string(),
  name: z.string(),
  url: z.string(),
  description: z.string(),
  expires_at: z.string().datetime().optional().nullable(),
});

export const LookupEntryByNameResponseSchema = z.object({
  entry: AnsEntrySchema,
});

export const LookupEntryByPartyResponseSchema = z.object({
  entry: AnsEntrySchema,
});

export const ListEntriesResponseSchema = z.object({
  entries: z.array(AnsEntrySchema),
});

export type AnsEntry = z.infer<typeof AnsEntrySchema>;
