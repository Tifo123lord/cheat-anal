import { MAX_IMAGE_SIDE, MAX_ORIGINAL_IMAGE_BYTES, formatBytes } from './admin-products';
import { extOf } from './file-types';

/** Fit (w, h) inside a max side, keeping the aspect ratio. Never upscales. */
export function fitSize(w: number, h: number, max = MAX_IMAGE_SIDE): { width: number; height: number } {
  const s = Math.min(1, max / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * s)), height: Math.max(1, Math.round(h * s)) };
}

/** Extensions treated as images even when the browser reports no MIME type (e.g. HEIC on some systems). */
export const IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'jfif',
  'pjpeg',
  'png',
  'apng',
  'webp',
  'gif',
  'avif',
  'bmp',
  'ico',
  'cur',
  'svg',
  'svgz',
  'heic',
  'heif',
  'tif',
  'tiff',
] as const;

interface FileLike {
  name: string;
  type: string;
}

/**
 * Whether a picked file should be tried as a preview image: any image/* MIME, or a known image
 * extension when the MIME is missing. Whether it really decodes is checked afterwards in the browser.
 */
export function acceptsImageFile(f: FileLike): boolean {
  if (f.type.toLowerCase().startsWith('image/')) return true;
  return (IMAGE_EXTENSIONS as readonly string[]).includes(extOf(f.name));
}

export const isSvgFile = (f: FileLike): boolean =>
  f.type.toLowerCase() === 'image/svg+xml' || ['svg', 'svgz'].includes(extOf(f.name));

export const isGifFile = (f: FileLike): boolean =>
  f.type.toLowerCase() === 'image/gif' || extOf(f.name) === 'gif';

/** True when GIF bytes hold more than one frame (counts graphic-control / image-descriptor blocks). */
export function isAnimatedGif(bytes: Uint8Array): boolean {
  if (bytes.length < 13 || String.fromCharCode(bytes[0], bytes[1], bytes[2]) !== 'GIF') return false;
  let frames = 0;
  for (let i = 0; i < bytes.length - 3; i++) {
    // Graphic Control Extension: 0x21 0xF9 0x04, followed later by an image descriptor (0x2C).
    if (bytes[i] === 0x21 && bytes[i + 1] === 0xf9 && bytes[i + 2] === 0x04) {
      frames++;
      if (frames > 1) return true;
      i += 7;
    }
  }
  return false;
}

/** Preview image ready to store: re-encoded raster, or the original SVG / animated GIF. */
export interface PreparedImage {
  blob: Blob;
  kept: 'resized' | 'original';
}

export const imageDecodeError = (name: string): string =>
  `“${name}” could not be read as an image in this browser, so it was skipped.`;

/** Load a blob through an <img> element (works for SVG and formats createImageBitmap rejects). */
function loadImg(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode failed'));
    };
    img.src = url;
  });
}

async function decodeRaster(
  file: Blob,
): Promise<{ src: CanvasImageSource; w: number; h: number; done: () => void }> {
  try {
    const bmp = await createImageBitmap(file);
    return { src: bmp, w: bmp.width, h: bmp.height, done: () => bmp.close() };
  } catch {
    const img = await loadImg(file);
    if (!img.naturalWidth || !img.naturalHeight) throw new Error('decode failed');
    return { src: img, w: img.naturalWidth, h: img.naturalHeight, done: () => undefined };
  }
}

/** Decode a raster image and re-encode it at most 1600px on the long side (WebP, JPEG fallback). */
export async function resizeImage(file: Blob): Promise<Blob> {
  const d = await decodeRaster(file);
  const { width, height } = fitSize(d.w, d.h);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available.');
  ctx.drawImage(d.src, 0, 0, width, height);
  d.done();
  const encode = (type: string): Promise<Blob | null> => new Promise((r) => canvas.toBlob(r, type, 0.86));
  const out = (await encode('image/webp')) ?? (await encode('image/jpeg'));
  if (!out) throw new Error('Could not encode the image.');
  return out;
}

/**
 * Turn any picked image into a stored preview. SVG and animated GIF stay byte-for-byte as uploaded
 * (an SVG is only ever shown through <img> from a blob URL, which never runs its scripts);
 * everything else is decoded and resized. Throws a user-facing message when it cannot be used.
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!acceptsImageFile(file)) throw new Error(`“${file.name}” is not an image file, so it was skipped.`);
  const original =
    isSvgFile(file) || (isGifFile(file) && isAnimatedGif(new Uint8Array(await file.arrayBuffer())));
  if (original) {
    if (file.size > MAX_ORIGINAL_IMAGE_BYTES)
      throw new Error(
        `“${file.name}” is ${formatBytes(file.size)}; SVG and animated GIF previews can be up to ${formatBytes(MAX_ORIGINAL_IMAGE_BYTES)}.`,
      );
    const typed = new Blob([file], { type: isSvgFile(file) ? 'image/svg+xml' : 'image/gif' });
    try {
      await loadImg(typed);
    } catch {
      throw new Error(imageDecodeError(file.name));
    }
    return { blob: typed, kept: 'original' };
  }
  try {
    return { blob: await resizeImage(file), kept: 'resized' };
  } catch {
    throw new Error(imageDecodeError(file.name));
  }
}
