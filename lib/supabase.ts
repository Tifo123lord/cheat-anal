import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Project URL and publishable key: both are public by design (row-level security guards the data). */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://ihxjvfoqlgmodlwbomrh.supabase.co';
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY ?? 'sb_publishable_-_leaMiVuBo55vxFrZERSA_naQ56KzJ';

export const IMAGE_BUCKET = 'product-images';
export const FILE_BUCKET = 'product-files';

let client: SupabaseClient | null = null;

/** Shared browser client (created lazily so static rendering never touches the network). */
export function sb(): SupabaseClient {
  if (!client)
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: typeof window !== 'undefined', autoRefreshToken: true, storageKey: 'cheat-anal-auth' },
    });
  return client;
}

/** Turns a Supabase error into a thrown Error, so callers can use try/catch. */
export function must<T>(r: { data: T; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data;
}
