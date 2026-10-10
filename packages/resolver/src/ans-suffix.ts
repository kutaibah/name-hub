/**
 * Configurable ANS acronym (network-specific: DevNet/MainNet use `cns`, LocalNet uses `ans`).
 * Defaults preserve backward compatibility with `.unverified.cns` / `.cns`.
 */

let ansAcronym = 'cns';

export function configureAnsAcronym(acronym: string): void {
  const trimmed = acronym.trim().toLowerCase();
  if (!trimmed || !/^[a-z]+$/.test(trimmed)) {
    throw new Error(`Invalid ANS acronym: ${acronym}`);
  }
  ansAcronym = trimmed;
}

export function getAnsAcronym(): string {
  return ansAcronym;
}

export function getUnverifiedSuffix(): string {
  return `.unverified.${ansAcronym}`;
}

export function getVerifiedSuffix(): string {
  return `.${ansAcronym}`;
}

/** @deprecated Use getUnverifiedSuffix() after optional configureAnsAcronym */
export const CNS_SUFFIX_UNVERIFIED = '.unverified.cns';

/** @deprecated Use getVerifiedSuffix() after optional configureAnsAcronym */
export const CNS_SUFFIX_VERIFIED = '.cns';

export function nameEndsWithUnverifiedSuffix(name: string): boolean {
  return name.endsWith(getUnverifiedSuffix());
}

export function isDsoOrSvStyleEntry(entry: {
  name: string;
  contract_id?: string | null;
  expires_at?: string | null;
}): boolean {
  if (!nameEndsWithUnverifiedSuffix(entry.name)) {
    return true;
  }
  const noContract = entry.contract_id == null || entry.contract_id === '';
  const noExpiry = entry.expires_at === undefined || entry.expires_at === null;
  return noContract && noExpiry;
}
