/** Recorded shapes matching Splice Scan `AnsEntry` responses (LocalNet / DevNet). */

export const LOCALNET_UNVERIFIED_ENTRY = {
  contract_id: '00abc123',
  user: 'app_user_1::1220f2fe29866fd6a0009ecc8a64ccdc09f1958bd0f801166baaee469d1251b2eb72',
  name: 'hackalice.unverified.ans',
  url: 'https://example.com',
  description: 'hackathon test',
  expires_at: '2099-12-31T23:59:59Z',
};

export const DEVNET_DSO_ENTRY = {
  user: 'DSO::1220000000000000000000000000000000000000000000000000000000000000',
  name: 'dso.cns',
  url: '',
  description: 'DSO entry',
};

export const EXPIRED_ENTRY = {
  ...LOCALNET_UNVERIFIED_ENTRY,
  name: 'expired.unverified.ans',
  expires_at: '2020-01-01T00:00:00Z',
};
