import { create } from 'zustand';
import { normEmail, type Role } from '@/lib/auth-core';
import { passwordProblem } from '@/lib/password';
import { sb } from '@/lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  newsletter: boolean;
  /** Never set for server accounts; kept so older admin screens type-check. */
  defaultPassword?: boolean;
}

interface AuthState {
  user: User | null;
  /** Reads the signed-in session (if any) and its profile from the server. */
  init: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  update: (patch: Partial<Pick<User, 'name' | 'newsletter'>>) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<string | null>;
}

const friendly = (msg: string): string => {
  if (/invalid login credentials/i.test(msg)) return 'ایمیل یا رمز عبور درست نیست.';
  if (/already registered|already exists/i.test(msg)) return 'با این ایمیل قبلاً حساب ساخته شده است.';
  if (/rate limit/i.test(msg)) return 'تلاش‌ها بیش از حد بود. یک دقیقه صبر کن و دوباره امتحان کن.';
  if (/email not confirmed/i.test(msg)) return 'هنوز ایمیلت را تأیید نکرده‌ای. صندوق ایمیلت را بررسی کن.';
  if (/password should be/i.test(msg)) return 'رمز عبور به اندازهٔ کافی قوی نیست.';
  if (/failed to fetch|network/i.test(msg))
    return 'اتصال به سرور برقرار نشد. اینترنتت را بررسی کن و دوباره امتحان کن.';
  return msg;
};

async function loadProfile(id: string, email: string): Promise<User> {
  const { data } = await sb().from('profiles').select('name, role, newsletter').eq('id', id).maybeSingle();
  return {
    id,
    email,
    name: (data?.name as string | undefined) || email.split('@')[0],
    role: data?.role === 'admin' ? 'admin' : 'user',
    newsletter: Boolean(data?.newsletter),
  };
}

export const useAuth = create<AuthState>()((set, get) => ({
  user: null,
  init: async () => {
    const { data } = await sb().auth.getSession();
    const u = data.session?.user;
    set({ user: u ? await loadProfile(u.id, u.email ?? '') : null });
  },
  register: async (name, email, password) => {
    if (name.trim().length < 2) return 'لطفاً نامت را وارد کن.';
    const pwErr = passwordProblem(password);
    if (pwErr) return pwErr;
    const { data, error } = await sb().auth.signUp({
      email: normEmail(email),
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) return friendly(error.message);
    if (!data.user || !data.session) return 'ایمیلت را برای تأیید حساب بررسی کن و بعد وارد شو.';
    set({ user: await loadProfile(data.user.id, data.user.email ?? normEmail(email)) });
    return null;
  },
  login: async (email, password) => {
    const { data, error } = await sb().auth.signInWithPassword({ email: normEmail(email), password });
    if (error || !data.user) return friendly(error?.message ?? 'ورود انجام نشد.');
    set({ user: await loadProfile(data.user.id, data.user.email ?? normEmail(email)) });
    return null;
  },
  logout: () => {
    set({ user: null });
    void sb().auth.signOut();
  },
  update: async (patch) => {
    const u = get().user;
    if (!u) return;
    set({ user: { ...u, ...patch } });
    await sb().from('profiles').update(patch).eq('id', u.id);
  },
  changePassword: async (current, next) => {
    const u = get().user;
    if (!u) return 'لطفاً دوباره وارد شو.';
    const check = await sb().auth.signInWithPassword({ email: u.email, password: current });
    if (check.error) return 'رمز عبور فعلی درست نیست.';
    const pwErr = passwordProblem(next);
    if (pwErr) return pwErr;
    if (next === current) return 'رمز عبور جدید باید با رمز فعلی فرق داشته باشد.';
    const { error } = await sb().auth.updateUser({ password: next });
    return error ? friendly(error.message) : null;
  },
}));

export const useCurrentUser = (): User | null => useAuth((s) => s.user);

export const useIsAdmin = (): boolean => useAuth((s) => s.user?.role === 'admin');
