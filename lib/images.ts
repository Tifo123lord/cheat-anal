import { MAX_IMAGE_SIDE } from './admin-products';

/** Fit (w, h) inside a max side, keeping the aspect ratio. Never upscales. */
export function fitSize(w: number, h: number, max = MAX_IMAGE_SIDE): { width: number; height: number } {
  const s = Math.min(1, max / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * s)), height: Math.max(1, Math.round(h * s)) };
}

/** Decode an uploaded image and re-encode it at most 1600px on the long side (WebP, JPEG fallback). */
export async function resizeImage(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const { width, height } = fitSize(bmp.width, bmp.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available.');
  ctx.drawImage(bmp, 0, 0, width, height);
  bmp.close();
  const encode = (type: string): Promise<Blob | null> => new Promise((r) => canvas.toBlob(r, type, 0.86));
  const out = (await encode('image/webp')) ?? (await encode('image/jpeg'));
  if (!out) throw new Error('Could not encode the image.');
  return out;
}
