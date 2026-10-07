import { describe, expect, it } from 'vitest';
import { PRODUCT_PROOF } from '@/config/product-proof';

describe('PRODUCT_PROOF', () => {
  it('reports consistent test totals', () => {
    expect(PRODUCT_PROOF.totalTests).toBe(PRODUCT_PROOF.resolverTests + PRODUCT_PROOF.appTests);
  });
});
