'use client';

import { useEffect, useId, useState } from 'react';
import { categories } from '@/lib/catalog';
import type { Errors } from '@/lib/validation';
import { useStudio, type Submission } from '@/store/studio';
import { useUI } from '@/store/ui';

type Field = 'title' | 'description' | 'category' | 'price' | 'tags' | 'previews' | 'file';

const MAX_PREVIEW = 5 * 1024 * 1024;
const MAX_FILE = 500 * 1024 * 1024;

interface Props {
  author: string;
  editing: Submission | null;
  onDone: () => void;
}

export default function UploadForm({ author, editing, onDone }: Props) {
  const id = useId();
  const save = useStudio((s) => s.save);
  const toast = useUI((s) => s.toast);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [tags, setTags] = useState('');
  const [previews, setPreviews] = useState<File[]>([]);
  const [previewNames, setPreviewNames] = useState<string[]>([]);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState<Errors<Field>>({});

  useEffect(() => {
    if (!editing) return;
    setTitle(editing.title);
    setDescription(editing.description);
    setCategory(editing.category);
    setPrice(String(editing.price));
    setTags(editing.tags.join(', '));
    setPreviewNames(editing.previewNames);
    setFileName(editing.fileName);
    setErrors({});
  }, [editing]);

  useEffect(() => {
    const urls = previews.map((f) => URL.createObjectURL(f));
    setThumbs(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  const reset = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setPrice('');
    setTags('');
    setPreviews([]);
    setPreviewNames([]);
    setFile(null);
    setFileName('');
    setErrors({});
  };

  const tagList = tags
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const validate = (publish: boolean): Errors<Field> => {
    const e: Errors<Field> = {};
    if (title.trim().length < 4) e.title = 'Give your file a title of at least 4 characters.';
    if (!publish) return e;
    if (description.trim().length < 20) e.description = 'Describe the file in at least 20 characters.';
    if (!category) e.category = 'Choose a category.';
    const p = Number(price);
    if (price.trim() === '' || !Number.isFinite(p) || p < 0 || p > 500)
      e.price = 'Enter a price between $0 and $500.';
    if (tagList.length < 1 || tagList.length > 8) e.tags = 'Add 1 to 8 comma-separated tags.';
    const names = previews.length ? previews.map((f) => f.name) : previewNames;
    if (names.length < 1) e.previews = 'Add at least one preview image.';
    else if (previews.length > 5) e.previews = 'Up to 5 preview images.';
    else if (previews.some((f) => !f.type.startsWith('image/'))) e.previews = 'Previews must be images.';
    else if (previews.some((f) => f.size > MAX_PREVIEW)) e.previews = 'Each preview must be under 5 MB.';
    if (!file && !fileName) e.file = 'Attach the downloadable file (.zip).';
    else if (file && !/\.zip$/i.test(file.name)) e.file = 'The main file must be a .zip archive.';
    else if (file && file.size > MAX_FILE) e.file = 'The file must be under 500 MB.';
    return e;
  };

  const submit = (publish: boolean) => {
    const e = validate(publish);
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`${id}-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    save({
      id: editing?.id ?? `sub-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      price: Number(price) || 0,
      tags: tagList,
      previewNames: previews.length ? previews.map((f) => f.name) : previewNames,
      fileName: file?.name ?? fileName,
      status: publish ? 'pending' : 'draft',
      author,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    });
    toast(publish ? 'Submitted for review. We usually reply within a day.' : 'Draft saved.');
    reset();
    onDone();
  };

  const err = (k: Field) =>
    errors[k] ? (
      <p id={`${id}-${k}-err`} className="error-text">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: Field) => ({
    id: `${id}-${k}`,
    'aria-invalid': Boolean(errors[k]),
    'aria-describedby': errors[k] ? `${id}-${k}-err` : undefined,
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit(true);
      }}
      className="grid gap-3 sm:grid-cols-2"
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
          className="field min-h-[80px]"
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
      <div>
        <label htmlFor={`${id}-price`} className="label">
          Price (USD, Personal licence)
        </label>
        <input
          className="field"
          type="number"
          min={0}
          max={500}
          step="1"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          {...aria('price')}
        />
        {err('price')}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-tags`} className="label">
          Tags (comma separated)
        </label>
        <input
          className="field"
          value={tags}
          placeholder="icons, line, ui"
          onChange={(e) => setTags(e.target.value)}
          {...aria('tags')}
        />
        {err('tags')}
      </div>
      <div>
        <label htmlFor={`${id}-previews`} className="label">
          Preview images (1–5)
        </label>
        <input
          className="field !py-1.5 text-[12px]"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            setPreviews(files);
            setPreviewNames(files.map((f) => f.name));
          }}
          {...aria('previews')}
        />
        {err('previews')}
        {thumbs.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Selected previews">
            {thumbs.map((u, i) => (
              <li key={u}>
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                <img
                  src={u}
                  alt={`Preview ${i + 1}`}
                  className="h-12 w-16 rounded border border-[#8f8770] object-cover"
                />
              </li>
            ))}
          </ul>
        ) : (
          previewNames.length > 0 && (
            <p className="mt-1 text-[11px] text-ink-muted">{previewNames.join(', ')}</p>
          )
        )}
      </div>
      <div>
        <label htmlFor={`${id}-file`} className="label">
          Downloadable file (.zip)
        </label>
        <input
          className="field !py-1.5 text-[12px]"
          type="file"
          accept=".zip,application/zip"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            setFileName(f?.name ?? '');
          }}
          {...aria('file')}
        />
        {err('file')}
        {fileName && !file && <p className="mt-1 text-[11px] text-ink-muted">Current: {fileName}</p>}
      </div>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button type="submit" className="btn">
          {editing ? 'Update & submit for review' : 'Publish (submit for review)'}
        </button>
        <button type="button" className="btn-ghost" onClick={() => submit(false)}>
          Save as draft
        </button>
        {editing && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              reset();
              onDone();
            }}
          >
            Cancel editing
          </button>
        )}
      </div>
    </form>
  );
}
