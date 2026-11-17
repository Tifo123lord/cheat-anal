'use client';

import { useEffect, useId, useState } from 'react';
import {
  IDB_PREFIX,
  MAX_FILE_BYTES,
  MAX_IMAGES,
  buildProduct,
  defaultLicenses,
  downloadMime,
  fileProblem,
  formatBytes,
  newAdminId,
  splitList,
  storageErrorMessage,
  validateInput,
  type AdminProductInput,
  type AdminRecord,
  type InputErrors,
  type StoredFile,
} from '@/lib/admin-products';
import { blobKey, deleteBlobs, putBlob, storageHeadroom } from '@/lib/blobstore';
import { allFileTypes, categories, getCategory } from '@/lib/catalog';
import { addChips, chipFromFileName, parseChips } from '@/lib/file-types';
import { prepareImage } from '@/lib/images';
import { LICENSE_TYPES, type LicenseType } from '@/lib/types';
import { useAdminCatalog } from '@/store/admin-catalog';
import { useUI } from '@/store/ui';
import ProductImage from '@/components/ProductImage';

interface Props {
  editing: AdminRecord | null;
  onDone: () => void;
}

type Lic = Record<LicenseType, { on: boolean; price: string }>;

/** A picked preview image: decoding happens on pick so one bad image never blocks the others. */
interface Pending {
  id: string;
  name: string;
  blob?: Blob;
  url?: string;
  kept?: 'resized' | 'original';
  error?: string;
}

const licState = (rec: AdminRecord | null): Lic => {
  const base = defaultLicenses(rec?.product.price ?? 0);
  return Object.fromEntries(
    LICENSE_TYPES.map((t) => {
      const have = rec?.product.licenses.find((l) => l.type === t);
      return [
        t,
        {
          on: rec ? Boolean(have) : true,
          price: rec ? String(have?.price ?? base.find((b) => b.type === t)?.price ?? 0) : '',
        },
      ];
    }),
  ) as Lic;
};

export default function ProductForm({ editing, onDone }: Props) {
  const id = useId();
  const save = useAdminCatalog((s) => s.save);
  const toast = useUI((s) => s.toast);
  const p = editing?.product;
  const [title, setTitle] = useState(p?.title ?? '');
  const [description, setDescription] = useState(p?.description ?? '');
  const [category, setCategory] = useState(p?.category ?? '');
  const [price, setPrice] = useState(p ? String(p.price) : '');
  const [salePrice, setSalePrice] = useState(p?.salePrice !== undefined ? String(p.salePrice) : '');
  const [tags, setTags] = useState(p?.tags.join(', ') ?? '');
  const [types, setTypes] = useState<string[]>(p?.fileTypes ?? []);
  const [typeDraft, setTypeDraft] = useState('');
  const [autoType, setAutoType] = useState<string | null>(null);
  const [lic, setLic] = useState<Lic>(() => licState(editing));
  const [published, setPublishedFlag] = useState(editing?.published ?? true);
  const [featured, setFeatured] = useState(editing?.featured ?? false);
  const [file, setFile] = useState<File | null>(null);
  const [keptImages, setKeptImages] = useState<string[]>(
    p?.images.filter((d) => d.startsWith(IDB_PREFIX)) ?? [],
  );
  const [pending, setPending] = useState<Pending[]>([]);
  const [errors, setErrors] = useState<InputErrors>({});
  const [busy, setBusy] = useState(false);

  // Revoke preview object URLs when they are replaced or the form unmounts.
  useEffect(() => {
    const urls = pending.map((x) => x.url).filter((u): u is string => Boolean(u));
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [pending]);

  const readyImages = pending.filter((x) => x.blob);
  const decoding = pending.some((x) => !x.blob && !x.error);
  const suggestions = allFileTypes().filter((t) => !types.includes(t));

  const commitDraft = () => {
    const add = parseChips(typeDraft);
    if (add.length) {
      setTypes((t) => addChips(t, ...add));
      setErrors((x) => ({ ...x, fileTypes: undefined }));
    }
    setTypeDraft('');
  };

  const pickImages = (files: File[]) => {
    const room = Math.max(0, MAX_IMAGES - keptImages.length);
    const take = files.slice(0, room);
    setErrors((x) => ({
      ...x,
      images:
        files.length > room
          ? `You can add ${room} more image${room === 1 ? '' : 's'} (max ${MAX_IMAGES}).`
          : undefined,
    }));
    const batch: Pending[] = take.map((f, i) => ({ id: `${Date.now()}-${i}`, name: f.name }));
    setPending(batch);
    take.forEach((f, i) => {
      const pid = batch[i].id;
      prepareImage(f)
        .then((r) =>
          setPending((list) =>
            list.map((x) =>
              x.id === pid ? { ...x, blob: r.blob, kept: r.kept, url: URL.createObjectURL(r.blob) } : x,
            ),
          ),
        )
        .catch((ex: unknown) =>
          setPending((list) =>
            list.map((x) =>
              x.id === pid ? { ...x, error: ex instanceof Error ? ex.message : `“${f.name}” failed.` } : x,
            ),
          ),
        );
    });
  };

  const existingFile: StoredFile | null = editing?.file ?? null;
  const priceNum = price === '' ? NaN : Number(price);

  const input = (): AdminProductInput => ({
    title,
    description,
    category,
    price: priceNum,
    salePrice: salePrice.trim() === '' ? null : Number(salePrice),
    tags: splitList(tags),
    fileTypes: addChips(types, ...parseChips(typeDraft)),
    licenses: LICENSE_TYPES.filter((t) => lic[t].on).map((t) => ({
      type: t,
      // Empty tier price follows the seeded catalogue's ratios.
      price:
        lic[t].price.trim() === ''
          ? (defaultLicenses(Number.isFinite(priceNum) ? priceNum : 0).find((d) => d.type === t)?.price ?? 0)
          : Number(lic[t].price),
    })),
  });

  const err = (k: keyof InputErrors) =>
    errors[k] ? (
      <p id={`${id}-${k}-err`} className="error-text" role="alert">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: keyof InputErrors) => ({
    id: `${id}-${k}`,
    'aria-invalid': Boolean(errors[k]),
    'aria-describedby': errors[k] ? `${id}-${k}-err` : undefined,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const data = input();
    const errs = validateInput(data, Boolean(file || existingFile));
    const fp = file ? fileProblem(file.size) : null;
    if (fp) errs.file = fp;
    if (keptImages.length + readyImages.length > MAX_IMAGES) errs.images = `Up to ${MAX_IMAGES} images.`;
    if (decoding) errs.images = 'Images are still being prepared. Try again in a moment.';
    if (!errs.file && file) {
      const free = await storageHeadroom();
      if (free !== null && file.size > free)
        errs.file = `This browser only has about ${formatBytes(free)} of storage left for uploads; this file is ${formatBytes(file.size)}.`;
    }
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`${id}-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setBusy(true);
    const created: string[] = [];
    try {
      const pid = editing?.product.id ?? newAdminId();
      let stored = existingFile;
      if (file) {
        const key = blobKey('file');
        await putBlob(key, file);
        created.push(key);
        stored = { key, name: file.name, size: file.size, type: downloadMime(file.type) };
      }
      const uploaded: string[] = [];
      for (const img of readyImages) {
        const key = blobKey('img');
        await putBlob(key, img.blob as Blob);
        created.push(key);
        uploaded.push(`${IDB_PREFIX}${key}`);
      }
      const images = [...keptImages, ...uploaded];
      const product = buildProduct(data, {
        id: pid,
        now: new Date().toISOString(),
        images,
        categoryArt: getCategory(data.category)?.art,
        fileSize: stored?.size,
        fileName: stored?.name,
        existing: editing?.product,
      });
      await save({ product, published, featured, file: stored });
      // Clean up blobs this edit replaced.
      const stale = [
        ...(file && existingFile ? [existingFile.key] : []),
        ...(editing?.product.images ?? [])
          .filter((d) => d.startsWith(IDB_PREFIX) && !images.includes(d))
          .map((d) => d.slice(IDB_PREFIX.length)),
      ];
      void deleteBlobs(stale).catch(() => undefined);
      toast(editing ? `Saved “${product.title}”` : `Added “${product.title}”`);
      onDone();
    } catch (ex) {
      void deleteBlobs(created).catch(() => undefined);
      setErrors({ file: storageErrorMessage(ex) });
      document.getElementById(`${id}-file`)?.focus();
    } finally {
      setBusy(false);
    }
  };

  const previewProduct = {
    title: title || 'Untitled',
    images: buildProduct(
      { ...input(), title: title || 'Untitled', price: Number.isFinite(priceNum) ? priceNum : 0 },
      { id: 'adm-preview', now: '2026-01-01', images: keptImages, categoryArt: getCategory(category)?.art },
    ).images,
  };

  return (
    <form
      noValidate
      onSubmit={submit}
      className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2"
      aria-label="Product"
    >
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-title`} className="label">
          Title
        </label>
        <input
          className="field"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          {...aria('title')}
        />
        {err('title')}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-description`} className="label">
          Description
        </label>
        <textarea
          className="field min-h-[90px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          {...aria('description')}
        />
        {err('description')}
      </div>
      <div>
        <label htmlFor={`${id}-category`} className="label">
          Category
        </label>
        <select
          className="field"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          {...aria('category')}
        >
          <option value="">Choose…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {err('category')}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`${id}-price`} className="label">
            Price (USD)
          </label>
          <input
            className="field"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            {...aria('price')}
          />
          {err('price')}
        </div>
        <div>
          <label htmlFor={`${id}-salePrice`} className="label">
            Sale price
          </label>
          <input
            className="field"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            placeholder="optional"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            {...aria('salePrice')}
          />
          {err('salePrice')}
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-tags`} className="label">
          Tags (comma separated)
        </label>
        <input
          className="field"
          value={tags}
          placeholder="landing, dark, html"
          onChange={(e) => setTags(e.target.value)}
          {...aria('tags')}
        />
      </div>
      <div>
        <label htmlFor={`${id}-fileTypes`} className="label">
          File types (any; auto-detected from the file)
        </label>
        <div className="flex gap-1.5">
          <input
            className="field"
            value={typeDraft}
            placeholder="e.g. DLL, LUA, CFG"
            list={`${id}-type-suggestions`}
            onChange={(e) => setTypeDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                commitDraft();
              }
            }}
            onBlur={commitDraft}
            {...aria('fileTypes')}
          />
          <button type="button" className="btn-ghost !px-2 text-[12px]" onClick={commitDraft}>
            Add
          </button>
        </div>
        <datalist id={`${id}-type-suggestions`}>
          {suggestions.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        {err('fileTypes')}
        {types.length > 0 && (
          <ul className="mt-1.5 flex flex-wrap gap-1" aria-label="Chosen file types" data-testid="type-chips">
            {types.map((t) => (
              <li key={t} className="chip !px-2 !py-0.5 !text-[11px]">
                {t}
                <button
                  type="button"
                  className="ml-1 text-[#9e2f19]"
                  aria-label={`Remove file type ${t}`}
                  onClick={() => setTypes(types.filter((x) => x !== t))}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {suggestions.length > 0 && (
          <p className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-ink-muted">
            <span>Pick:</span>
            {suggestions.slice(0, 10).map((t) => (
              <button
                key={t}
                type="button"
                className="chip !px-1.5 !py-0 !text-[10.5px]"
                aria-label={`Add file type ${t}`}
                onClick={() => {
                  setTypes((x) => addChips(x, t));
                  setErrors((x) => ({ ...x, fileTypes: undefined }));
                }}
              >
                +{t}
              </button>
            ))}
          </p>
        )}
      </div>
      <fieldset
        className="sm:col-span-2"
        aria-describedby={errors.licenses ? `${id}-licenses-err` : undefined}
      >
        <legend className="label" id={`${id}-licenses`} tabIndex={-1}>
          Licences (leave a price empty to use the default ratio)
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {LICENSE_TYPES.map((t) => (
            <div key={t} className="flex items-center gap-2 rounded border border-[#bcb399] p-1.5">
              <label className="flex items-center gap-1 text-[12px] text-ink">
                <input
                  type="checkbox"
                  checked={lic[t].on}
                  onChange={(e) => setLic({ ...lic, [t]: { ...lic[t], on: e.target.checked } })}
                />
                {t}
              </label>
              <input
                className="field !py-1 text-[12px]"
                type="number"
                min={0}
                step="0.01"
                aria-label={`${t} licence price`}
                placeholder={String(
                  defaultLicenses(Number.isFinite(priceNum) ? priceNum : 0).find((d) => d.type === t)
                    ?.price ?? 0,
                )}
                disabled={!lic[t].on}
                value={lic[t].price}
                onChange={(e) => setLic({ ...lic, [t]: { ...lic[t], price: e.target.value } })}
              />
            </div>
          ))}
        </div>
        {err('licenses')}
      </fieldset>
      <div>
        <label htmlFor={`${id}-file`} className="label">
          Downloadable file (any type, max {formatBytes(MAX_FILE_BYTES)})
        </label>
        <input
          className="field !py-1.5 text-[12px]"
          type="file"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            const problem = f ? fileProblem(f.size) : null;
            setErrors((x) => ({ ...x, file: problem ?? undefined }));
            setFile(problem ? null : f);
            if (problem) e.target.value = '';
            if (f && !problem) {
              // Auto-detect the chip from the extension; replace the chip the previous pick added.
              const chip = chipFromFileName(f.name);
              setTypes((t) => addChips(autoType ? t.filter((x) => x !== autoType) : t, chip));
              setAutoType(types.includes(chip) && chip !== autoType ? null : chip);
              setErrors((x) => ({ ...x, fileTypes: undefined }));
            }
          }}
          {...aria('file')}
        />
        <p className="mt-1 text-[11px] text-ink-muted">
          Stored as-is in this browser. Very large files depend on the browser&rsquo;s storage quota.
        </p>
        {err('file')}
        {file ? (
          <p className="mt-1 text-[11px] text-ink" data-testid="file-info">
            {file.name} · {formatBytes(file.size)}
          </p>
        ) : (
          existingFile && (
            <p className="mt-1 text-[11px] text-ink-muted" data-testid="file-info">
              Current: {existingFile.name} · {formatBytes(existingFile.size)}
            </p>
          )
        )}
      </div>
      <div>
        <label htmlFor={`${id}-images`} className="label">
          Preview images (any image, up to {MAX_IMAGES}, optional)
        </label>
        <input
          className="field !py-1.5 text-[12px]"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => pickImages([...(e.target.files ?? [])])}
          {...aria('images')}
        />
        <p className="mt-1 text-[11px] text-ink-muted">
          JPG, PNG, WebP, AVIF, BMP, ICO, HEIC (where supported) are resized to 1600px; SVG and animated GIF
          are kept as uploaded.
        </p>
        {err('images')}
        {pending.some((x) => x.error) && (
          <ul className="mt-1 space-y-0.5" role="alert" data-testid="image-errors">
            {pending
              .filter((x) => x.error)
              .map((x) => (
                <li key={x.id} className="error-text !mt-0">
                  {x.error}
                </li>
              ))}
          </ul>
        )}
        {(keptImages.length > 0 || readyImages.length > 0) && (
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Preview images">
            {keptImages.map((d, i) => (
              <li key={d} className="relative w-16">
                <ProductImage product={{ title, images: [d] }} alt={`Saved image ${i + 1}`} sizes="64px" />
                <button
                  type="button"
                  className="absolute -right-1 -top-1 rounded-full bg-[#9e2f19] px-1 text-[10px] text-white"
                  aria-label={`Remove saved image ${i + 1}`}
                  onClick={() => setKeptImages(keptImages.filter((x) => x !== d))}
                >
                  ×
                </button>
              </li>
            ))}
            {readyImages.map((x, i) => (
              <li key={x.id} data-kept={x.kept}>
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview (SVG stays in <img>, never inline) */}
                <img
                  src={x.url}
                  alt={`New image ${i + 1}: ${x.name}`}
                  className="h-10 w-16 rounded border border-[#8f8770] object-cover"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      {keptImages.length + readyImages.length === 0 && (
        <div className="sm:col-span-2">
          <p className="label">Default preview (generated because no image is uploaded)</p>
          <span className="inset-img block w-[200px] overflow-hidden" data-testid="default-preview">
            <ProductImage product={previewProduct} alt="Generated default preview" sizes="200px" />
          </span>
        </div>
      )}
      <div className="flex flex-wrap gap-4 text-[12px] text-ink sm:col-span-2">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={published} onChange={(e) => setPublishedFlag(e.target.checked)} />
          Published (visible in the shop)
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Show in the home slider
        </label>
      </div>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button type="submit" className="btn" disabled={busy || decoding}>
          {busy ? 'Saving…' : decoding ? 'Preparing images…' : editing ? 'Save changes' : 'Add product'}
        </button>
        {editing && (
          <button type="button" className="btn-ghost" onClick={onDone}>
            Cancel editing
          </button>
        )}
      </div>
    </form>
  );
}
