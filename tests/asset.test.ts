import { describe, expect, it } from 'vitest';
import { asset } from '@/lib/asset';

describe('asset()', () => {
  it('leaves paths unchanged when no base path is set (local dev/tests)', () => {
    expect(asset('/feed.xml')).toBe('/feed.xml');
  });
  it('leaves absolute, protocol-relative and data URLs alone', () => {
    expect(asset('https://x.test/a.png')).toBe('https://x.test/a.png');
    expect(asset('//cdn.test/a.png')).toBe('//cdn.test/a.png');
    expect(asset('data:image/svg+xml,<svg/>')).toBe('data:image/svg+xml,<svg/>');
  });
});
