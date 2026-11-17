import { describe, expect, it } from 'vitest';
import {
  FALLBACK_MIME,
  MAX_FILE_BYTES,
  buildProduct,
  defaultLicenses,
  downloadMime,
  fileNote,
  fileProblem,
  isQuotaError,
  storageErrorMessage,
  validateInput,
} from '@/lib/admin-products';
import { allFileTypes, products, setExtraProducts } from '@/lib/catalog';
import {
  MAX_CHIPS,
  NO_EXT_CHIP,
  addChips,
  chipFromFileName,
  extOf,
  fileTypeOptions,
  normalizeChip,
  parseChips,
} from '@/lib/file-types';
import { applyFilters, filtersToQuery, parseFilters } from '@/lib/filters';
import { IMAGE_EXTENSIONS, acceptsImageFile, isAnimatedGif, isGifFile, isSvgFile } from '@/lib/images';

const MB = 1024 * 1024;

describe('extension → file-type chip detection', () => {
  it.each([
    ['hook.dll', 'DLL'],
    ['server.cfg', 'CFG'],
    ['init.lua', 'LUA'],
    ['Setup.EXE', 'EXE'],
    ['pack.rar', 'RAR'],
    ['pack.7z', '7Z'],
    ['game.apk', 'APK'],
    ['notes.txt', 'TXT'],
    ['config.ini', 'INI'],
    ['data.json', 'JSON'],
    ['backup.tar.gz', 'GZ'],
    ['C:\\mods\\weapon.pak', 'PAK'],
  ])('%s → %s', (name, chip) => {
    expect(chipFromFileName(name)).toBe(chip);
  });

  it('uses FILE for names without an extension', () => {
    expect(chipFromFileName('README')).toBe(NO_EXT_CHIP);
    expect(chipFromFileName('trailing.')).toBe(NO_EXT_CHIP);
    expect(extOf('README')).toBe('');
  });

  it('reads the extension in lower case', () => {
    expect(extOf('Mod.DLL')).toBe('dll');
    expect(extOf('.env')).toBe('env');
  });

  it('normalises typed chips', () => {
    expect(normalizeChip(' .lua ')).toBe('LUA');
    expect(normalizeChip('tar.gz')).toBe('TAR.GZ');
    expect(normalizeChip('c++')).toBe('C++');
    expect(normalizeChip('<b>x</b>')).toBe('BXB');
    expect(normalizeChip('averyveryverylongtype')).toHaveLength(12);
  });

  it('adds chips without duplicates and caps the list', () => {
    expect(addChips(['DLL'], 'dll', '.cfg', '', 'Lua')).toEqual(['DLL', 'CFG', 'LUA']);
    expect(parseChips('dll, .cfg lua;ini')).toEqual(['DLL', 'CFG', 'LUA', 'INI']);
    const many = Array.from({ length: 20 }, (_, i) => `T${i}`);
    expect(addChips([], ...many)).toHaveLength(MAX_CHIPS);
  });
});

describe('free-form file types in products and shop filters', () => {
  const input = {
    title: 'Hookshot Mod Loader',
    description: 'A DLL mod loader with a Lua script and a config file for the game.',
    category: 'templates',
    price: 9,
    salePrice: null,
    tags: ['mod'],
    fileTypes: ['dll', '.lua', 'Cfg', 'dll'],
    licenses: defaultLicenses(9),
  };
  const dll = buildProduct(input, {
    id: 'adm-dll1',
    now: '2026-11-17T08:00:00Z',
    images: [],
    fileSize: 4096,
    fileName: 'hookshot.dll',
  });

  it('stores any type, upper-cased and deduplicated, plus the download extension', () => {
    expect(dll.fileTypes).toEqual(['DLL', 'LUA', 'CFG']);
    expect(dll.fileExt).toBe('dll');
    expect(dll.fileSize).toBe('4.0 KB');
    expect(validateInput(input, true).fileTypes).toBeUndefined();
    expect(validateInput({ ...input, fileTypes: ['  ', '.'] }, true).fileTypes).toMatch(/at least one/);
  });

  it('keeps fileExt on edit when no new file is uploaded', () => {
    const edited = buildProduct(input, { id: 'adm-dll1', now: '2026-11-18', images: [], existing: dll });
    expect(edited.fileExt).toBe('dll');
  });

  it('lists the types that exist dynamically, including new admin types', () => {
    setExtraProducts([dll], [dll]);
    const types = allFileTypes();
    expect(types).toEqual(expect.arrayContaining(['DLL', 'LUA', 'CFG', 'PSD', 'ZIP']));
    expect(types).toEqual([...types].sort());
    expect(allFileTypes(['APK'])).toContain('APK');
    setExtraProducts([], []);
    expect(allFileTypes()).not.toContain('DLL');
    expect(fileTypeOptions([{ fileTypes: ['lua'] }, { fileTypes: ['LUA', 'ini'] }])).toEqual(['INI', 'LUA']);
  });

  it('filters by any type from the URL, case-insensitively', () => {
    const f = parseFilters(new URLSearchParams('type=dll,.lua'));
    expect(f.fileTypes).toEqual(['DLL', 'LUA']);
    expect(filtersToQuery(f)).toBe('type=DLL%2CLUA');
    const out = applyFilters([dll, ...products], f);
    expect(out.map((p) => p.id)).toEqual(['adm-dll1']);
    const cfg = applyFilters([{ ...dll, fileTypes: ['cfg'] }], parseFilters(new URLSearchParams('type=CFG')));
    expect(cfg).toHaveLength(1);
  });
});

describe('size limit, storage and download type', () => {
  it('allows up to 200 MB and explains anything bigger', () => {
    expect(MAX_FILE_BYTES).toBe(200 * MB);
    expect(fileProblem(200 * MB)).toBeNull();
    expect(fileProblem(1)).toBeNull();
    expect(fileProblem(200 * MB + 1)).not.toBeNull();
    expect(fileProblem(201 * MB)).toBe('This file is 201.0 MB; the limit is 200.0 MB.');
    expect(fileProblem(350 * MB)).toBe('This file is 350.0 MB; the limit is 200.0 MB.');
  });

  it('recognises quota errors and gives a friendly message', () => {
    const quota = { name: 'QuotaExceededError', message: 'The quota has been exceeded.' };
    expect(isQuotaError(quota)).toBe(true);
    expect(isQuotaError(new Error('boom'))).toBe(false);
    expect(storageErrorMessage(quota)).toMatch(/run out of storage space/);
    expect(storageErrorMessage(new Error('boom'))).toMatch(/boom/);
  });

  it('downloads with octet-stream when the MIME is empty', () => {
    expect(downloadMime('')).toBe(FALLBACK_MIME);
    expect(downloadMime(undefined)).toBe('application/octet-stream');
    expect(downloadMime('application/x-msdownload')).toBe('application/x-msdownload');
  });

  it('describes the file on the product page', () => {
    expect(fileNote('dll', '4.0 KB')).toBe('.dll file · 4.0 KB');
    expect(fileNote('', '1 B')).toBe('No extension file · 1 B');
  });
});

describe('image-type acceptance', () => {
  it.each([
    ['a.jpg', 'image/jpeg'],
    ['a.png', 'image/png'],
    ['a.webp', 'image/webp'],
    ['a.gif', 'image/gif'],
    ['a.avif', 'image/avif'],
    ['a.bmp', 'image/bmp'],
    ['a.ico', 'image/x-icon'],
    ['a.svg', 'image/svg+xml'],
    ['a.heic', 'image/heic'],
    ['a.heic', ''],
    ['A.JPEG', ''],
    ['odd.name', 'image/x-custom'],
  ])('accepts %s (%s)', (name, type) => {
    expect(acceptsImageFile({ name, type })).toBe(true);
  });

  it.each([
    ['hook.dll', ''],
    ['doc.pdf', 'application/pdf'],
    ['a.svg.exe', 'application/x-msdownload'],
  ])('rejects %s', (name, type) => {
    expect(acceptsImageFile({ name, type })).toBe(false);
  });

  it('covers the common formats', () => {
    for (const e of ['jpg', 'png', 'webp', 'gif', 'avif', 'bmp', 'ico', 'svg', 'heic'])
      expect(IMAGE_EXTENSIONS).toContain(e);
  });

  it('spots SVG and GIF uploads', () => {
    expect(isSvgFile({ name: 'logo.svg', type: '' })).toBe(true);
    expect(isSvgFile({ name: 'x', type: 'image/svg+xml' })).toBe(true);
    expect(isGifFile({ name: 'a.GIF', type: '' })).toBe(true);
    expect(isSvgFile({ name: 'a.png', type: 'image/png' })).toBe(false);
  });

  it('tells animated GIFs from still ones', () => {
    const head = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 1, 0, 1, 0, 0, 0, 0];
    const frame = [0x21, 0xf9, 0x04, 0, 10, 0, 0, 0, 0x2c, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 0x4c, 1, 0];
    expect(isAnimatedGif(new Uint8Array([...head, ...frame, 0x3b]))).toBe(false);
    expect(isAnimatedGif(new Uint8Array([...head, ...frame, ...frame, 0x3b]))).toBe(true);
    expect(isAnimatedGif(new Uint8Array([1, 2, 3]))).toBe(false);
  });
});
