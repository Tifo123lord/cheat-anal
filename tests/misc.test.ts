import { describe, expect, it } from 'vitest';
import { artSvg, parseArt } from '@/lib/art';
import { products } from '@/lib/catalog';
import { licenseKey, orderNumber } from '@/lib/keys';
import { isEmail, luhn, validCvc, validExpiry } from '@/lib/validation';
import { buildZip, crc32 } from '@/lib/zip';

describe('validation', () => {
  it('checks cards with Luhn', () => {
    expect(luhn('4242 4242 4242 4242')).toBe(true);
    expect(luhn('4242 4242 4242 4241')).toBe(false);
    expect(luhn('123')).toBe(false);
  });
  it('checks expiry, cvc and email', () => {
    const now = new Date(2026, 10, 16);
    expect(validExpiry('11/26', now)).toBe(true);
    expect(validExpiry('10/26', now)).toBe(false);
    expect(validExpiry('13/30', now)).toBe(false);
    expect(validCvc('123')).toBe(true);
    expect(validCvc('12')).toBe(false);
    expect(isEmail('a@b.co')).toBe(true);
    expect(isEmail('nope@')).toBe(false);
  });
});

describe('keys', () => {
  it('licence keys are stable and well-formed', () => {
    const k = licenseKey('LP-1', 'p01', 'Personal');
    expect(k).toBe(licenseKey('LP-1', 'p01', 'Personal'));
    expect(k).toMatch(/^LP-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(k).not.toBe(licenseKey('LP-1', 'p01', 'Commercial'));
  });
  it('order numbers carry the date', () => {
    expect(orderNumber(Date.UTC(2026, 10, 16), 0.123456)).toBe('LP-20261116-123456');
  });
});

describe('zip + art', () => {
  it('computes the standard CRC32', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });
  it('writes a valid zip structure', () => {
    const z = buildZip([{ name: 'a.txt', content: 'hello' }]);
    const v = new DataView(z.buffer);
    expect(v.getUint32(0, true)).toBe(0x04034b50);
    expect(v.getUint32(z.length - 22, true)).toBe(0x06054b50);
  });
  it('renders an SVG for every product preview', () => {
    for (const p of products) {
      for (const d of p.images) {
        expect(parseArt(d).kind).toBeTruthy();
        const svg = artSvg(d, p.title);
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).not.toContain('NaN');
      }
    }
  });
});
