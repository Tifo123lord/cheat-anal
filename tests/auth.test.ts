import { describe, expect, it } from 'vitest';
import {
  ADMIN_USER,
  DEMO_USER,
  SEED_USERS,
  changeUserPassword,
  loginUser,
  registerUser,
  withSeeds,
  type User,
} from '@/lib/auth-core';
import { hashPassword, passwordProblem, randomSalt, verifyPassword } from '@/lib/password';
import { safeNext } from '@/lib/validation';

describe('password hashing', () => {
  it('produces a 64-char hex SHA-256 that depends on the salt', async () => {
    const a = await hashPassword('correct horse', 'salt-a');
    const b = await hashPassword('correct horse', 'salt-b');
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toBe(b);
    expect(await hashPassword('correct horse', 'salt-a')).toBe(a);
  });
  it('matches a known SHA-256 vector for salt:password', async () => {
    // sha256("s:abc")
    expect(await hashPassword('abc', 's')).toBe(
      'efff0385da714c8573aaf55138e8a03080e2d5666a680a6b017643d379019835',
    );
  });
  it('verifies and rejects', async () => {
    const salt = randomSalt();
    const h = await hashPassword('leafpress123', salt);
    expect(await verifyPassword('leafpress123', salt, h)).toBe(true);
    expect(await verifyPassword('leafpress124', salt, h)).toBe(false);
  });
  it('random salts are 32 hex chars and differ', () => {
    const a = randomSalt();
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(randomSalt()).not.toBe(a);
  });
  it('requires at least 8 characters', () => {
    expect(passwordProblem('short')).not.toBeNull();
    expect(passwordProblem('12345678')).toBeNull();
  });
  it('seed hashes match the documented demo passwords', async () => {
    for (const [cred, user] of [
      [DEMO_USER, SEED_USERS[0]],
      [ADMIN_USER, SEED_USERS[1]],
    ] as const) {
      expect(await verifyPassword(cred.password, user.salt, user.passwordHash)).toBe(true);
    }
  });
});

describe('accounts', () => {
  it('registers with a hashed password (never stored plain) and logs in', async () => {
    const r = await registerUser(SEED_USERS, 'Ivy Fern', ' Ivy@Example.com ', 'mossy-path-9');
    if (r.error !== undefined) throw new Error(r.error);
    expect(r.user.email).toBe('ivy@example.com');
    expect(r.user.role).toBe('user');
    expect(JSON.stringify(r.users)).not.toContain('mossy-path-9');
    const ok = await loginUser(r.users, 'IVY@example.com', 'mossy-path-9');
    expect(typeof ok).toBe('object');
    expect(await loginUser(r.users, 'ivy@example.com', 'wrong-pass')).toMatch(/do not match/);
  });
  it('rejects duplicates and short passwords', async () => {
    expect((await registerUser(SEED_USERS, 'Dup', DEMO_USER.email, 'longenough')).error).toMatch(/already/);
    expect((await registerUser(SEED_USERS, 'Ivy', 'a@b.co', 'short')).error).toMatch(/8/);
  });
  it('seeds exactly one admin with the demo password flag', async () => {
    const admins = SEED_USERS.filter((u) => u.role === 'admin');
    expect(admins).toHaveLength(1);
    expect(admins[0].email).toBe(ADMIN_USER.email);
    expect(admins[0].defaultPassword).toBe(true);
    const u = await loginUser(SEED_USERS, ADMIN_USER.email, ADMIN_USER.password);
    expect(typeof u === 'object' && u.role).toBe('admin');
  });
  it('changes the password, re-salts and clears the default flag', async () => {
    const next = await changeUserPassword(
      SEED_USERS,
      ADMIN_USER.email,
      ADMIN_USER.password,
      'new-admin-pass',
    );
    if (typeof next === 'string') throw new Error(next);
    const admin = next.find((u) => u.email === ADMIN_USER.email) as User;
    expect(admin.salt).not.toBe(SEED_USERS[1].salt);
    expect(admin.defaultPassword).toBe(false);
    expect(typeof (await loginUser(next, ADMIN_USER.email, 'new-admin-pass'))).toBe('object');
    expect(typeof (await loginUser(next, ADMIN_USER.email, ADMIN_USER.password))).toBe('string');
    expect(await changeUserPassword(SEED_USERS, ADMIN_USER.email, 'nope-nope', 'whatever1')).toMatch(
      /current/,
    );
  });
  it('withSeeds restores a missing admin and drops legacy users without a salt', () => {
    const legacy = { name: 'Old', email: 'old@x.co', passwordHash: 'abc' } as unknown as User;
    const users = withSeeds([legacy, SEED_USERS[0]]);
    expect(users.map((u) => u.email).sort()).toEqual([ADMIN_USER.email, DEMO_USER.email].sort());
  });
  it('safeNext keeps same-site paths only', () => {
    expect(safeNext('/checkout/')).toBe('/checkout/');
    expect(safeNext('//evil.test')).toBe('/account/');
    expect(safeNext('https://evil.test')).toBe('/account/');
    expect(safeNext(null)).toBe('/account/');
  });
});
