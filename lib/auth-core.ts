import { hashPassword, passwordProblem, randomSalt, verifyPassword } from './password';

export type Role = 'user' | 'admin';

export interface User {
  name: string;
  email: string;
  salt: string;
  /** hex SHA-256 of `salt:password`; the password itself is never stored. */
  passwordHash: string;
  role: Role;
  newsletter: boolean;
  /** True while the admin still uses the documented demo password. */
  defaultPassword?: boolean;
}

export const DEMO_USER = { email: 'demo@leafpress.test', password: 'leafpress' };
export const ADMIN_USER = { email: 'admin@leafpress.local', password: 'leafpress-admin' };

/** Seed accounts. Hashes are precomputed for the documented demo passwords (see README). */
export const SEED_USERS: User[] = [
  {
    name: 'Demo Gardener',
    email: DEMO_USER.email,
    salt: '7f3a1c9e5b2d4a60c8e1f2a3b4c5d6e7',
    passwordHash: '6d985fdd00f57e88b97e9ec13c9902444f3fefa9877c134588d0556991dce55d',
    role: 'user',
    newsletter: true,
  },
  {
    name: 'Cheat & Anal Admin',
    email: ADMIN_USER.email,
    salt: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
    passwordHash: '999078b86082afded133c708a5d284a143bffb4581ceeb7fce0974b44547bda9',
    role: 'admin',
    newsletter: false,
    defaultPassword: true,
  },
];

export const normEmail = (e: string): string => e.trim().toLowerCase();

type Result =
  | { users: User[]; user: User; error?: undefined }
  | { error: string; users?: undefined; user?: undefined };

export async function registerUser(
  users: User[],
  name: string,
  email: string,
  password: string,
): Promise<Result> {
  const e = normEmail(email);
  if (name.trim().length < 2) return { error: 'لطفاً نامت را وارد کن.' };
  const pwErr = passwordProblem(password);
  if (pwErr) return { error: pwErr };
  if (users.some((u) => u.email === e)) return { error: 'با این ایمیل قبلاً حساب ساخته شده است.' };
  const salt = randomSalt();
  const user: User = {
    name: name.trim(),
    email: e,
    salt,
    passwordHash: await hashPassword(password, salt),
    role: 'user',
    newsletter: false,
  };
  return { users: [...users, user], user };
}

export async function loginUser(users: User[], email: string, password: string): Promise<User | string> {
  const u = users.find((x) => x.email === normEmail(email));
  if (!u || !(await verifyPassword(password, u.salt, u.passwordHash))) return 'ایمیل یا رمز عبور درست نیست.';
  return u;
}

export async function changeUserPassword(
  users: User[],
  email: string,
  current: string,
  next: string,
): Promise<User[] | string> {
  const u = users.find((x) => x.email === email);
  if (!u) return 'لطفاً دوباره وارد شو.';
  if (!(await verifyPassword(current, u.salt, u.passwordHash))) return 'رمز عبور فعلی درست نیست.';
  const pwErr = passwordProblem(next);
  if (pwErr) return pwErr;
  if (next === current) return 'رمز عبور جدید باید با رمز فعلی فرق داشته باشد.';
  const salt = randomSalt();
  const passwordHash = await hashPassword(next, salt);
  return users.map((x) => (x.email === email ? { ...x, salt, passwordHash, defaultPassword: false } : x));
}

/** Persisted users plus any seed account that is missing (e.g. the admin on an older browser state). */
export function withSeeds(users: User[]): User[] {
  const valid = users.filter((u) => typeof u.salt === 'string' && typeof u.passwordHash === 'string');
  return [...valid, ...SEED_USERS.filter((s) => !valid.some((u) => u.email === s.email))];
}
