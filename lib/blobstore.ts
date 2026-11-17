/**
 * Uploaded files and preview images, stored on the server (Supabase Storage).
 * Keys starting with `file-` live in the private file bucket (download is checked by the server);
 * every other key lives in the public image bucket.
 */
import { FILE_BUCKET, IMAGE_BUCKET, must, sb, SUPABASE_URL } from './supabase';

export const bucketFor = (key: string): string => (key.startsWith('file-') ? FILE_BUCKET : IMAGE_BUCKET);

export const publicImageUrl = (key: string): string =>
  `${SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${encodeURIComponent(key)}`;

export async function putBlob(key: string, blob: Blob): Promise<void> {
  must(
    await sb()
      .storage.from(bucketFor(key))
      .upload(key, blob, { upsert: true, contentType: blob.type || 'application/octet-stream' }),
  );
}

export async function getBlob(key: string): Promise<Blob | undefined> {
  if (bucketFor(key) === IMAGE_BUCKET) {
    const res = await fetch(publicImageUrl(key));
    return res.ok ? res.blob() : undefined;
  }
  const r = await sb().storage.from(FILE_BUCKET).download(key);
  if (r.error) throw new Error('You do not have access to this file, or it was removed.');
  return r.data ?? undefined;
}

export async function deleteBlobs(keys: string[]): Promise<void> {
  const files = keys.filter((k) => bucketFor(k) === FILE_BUCKET);
  const imgs = keys.filter((k) => bucketFor(k) === IMAGE_BUCKET);
  if (files.length) must(await sb().storage.from(FILE_BUCKET).remove(files));
  if (imgs.length) must(await sb().storage.from(IMAGE_BUCKET).remove(imgs));
}

export const blobKey = (kind: 'file' | 'img'): string =>
  `${kind}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;

/** Server storage has no per-browser quota to report. */
export async function storageHeadroom(): Promise<number | null> {
  return null;
}
