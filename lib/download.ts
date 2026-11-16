import { buildZip } from './zip';

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export interface DummyFile {
  slug: string;
  title: string;
  license: string;
  licenseKey: string;
  buyer?: string;
}

/** Builds a small, genuine .zip containing a read-me and licence certificate. */
export function downloadDummyZip(f: DummyFile): void {
  const readme = [
    `${f.title}`,
    '='.repeat(f.title.length),
    '',
    'Thanks for downloading from leafpress!',
    'This is a demo store, so this archive holds placeholder files only.',
    '',
    `Licence: ${f.license}`,
    `Licence key: ${f.licenseKey}`,
    f.buyer ? `Licensed to: ${f.buyer}` : '',
    '',
    'Digital files, grown with care.',
  ].join('\n');
  const licence = `LEAFPRESS ${f.license.toUpperCase()} LICENCE\nKey: ${f.licenseKey}\nItem: ${f.title}\n`;
  const bytes = buildZip([
    { name: `${f.slug}/README.txt`, content: readme },
    { name: `${f.slug}/LICENSE.txt`, content: licence },
  ]);
  const buf = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buf).set(bytes);
  saveBlob(new Blob([buf], { type: 'application/zip' }), `${f.slug}.zip`);
}
