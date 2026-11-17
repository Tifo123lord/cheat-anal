'use client';

import { allCompatibility, allFileTypes, categories, maxPrice } from '@/lib/catalog';
import { DEFAULT_FILTERS, type Filters } from '@/lib/filters';
import { LICENSE_TYPES, type LicenseType } from '@/lib/types';
import { LeafRow } from './LeafRating';

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  idPrefix: string;
}

const toggle = <T,>(list: T[], v: T): T[] => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-[#bcb399] px-3 py-3 last:border-b-0">
      <legend className="widget-title float-left mb-2 w-full">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

export default function FiltersPanel({ filters: f, onChange, idPrefix }: Props) {
  const top = Math.ceil(maxPrice());
  const set = (patch: Partial<Filters>) => onChange({ ...f, ...patch, page: 1 });
  const minV = f.minPrice ?? 0;
  const maxV = f.maxPrice ?? top;
  const types = allFileTypes(f.fileTypes);
  const software = allCompatibility();
  return (
    <div className="text-[12.5px] text-ink">
      <Group title="Category">
        <ul className="grid grid-cols-1 gap-0.5">
          {categories.map((c) => (
            <li key={c.id}>
              <label className="flex cursor-pointer items-center gap-2 py-0.5">
                <input
                  type="checkbox"
                  checked={f.categories.includes(c.id)}
                  onChange={() => set({ categories: toggle(f.categories, c.id) })}
                />
                {c.name}
              </label>
            </li>
          ))}
        </ul>
      </Group>
      {types.length > 0 && (
        <Group title="File type">
          <ul className="flex flex-wrap gap-1.5">
            {types.map((t) => (
              <li key={t}>
                <label
                  className={`chip cursor-pointer !px-2 !py-0.5 !text-[11px] ${f.fileTypes.includes(t) ? '!border-leaf-dark !bg-leaf !text-white' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={f.fileTypes.includes(t)}
                    onChange={() => set({ fileTypes: toggle(f.fileTypes, t) })}
                  />
                  {t}
                </label>
              </li>
            ))}
          </ul>
        </Group>
      )}
      <Group title="Price">
        <div className="space-y-2">
          <div className="flex justify-between text-[12px] font-semibold" aria-live="polite">
            <span>${minV}</span>
            <span>${maxV}</span>
          </div>
          <label htmlFor={`${idPrefix}-min`} className="sr-only">
            Minimum price
          </label>
          <input
            id={`${idPrefix}-min`}
            type="range"
            min={0}
            max={top}
            step={1}
            value={minV}
            onChange={(e) => {
              const v = Math.min(Number(e.target.value), maxV);
              set({ minPrice: v === 0 ? null : v });
            }}
            className="w-full accent-[#c20e24]"
          />
          <label htmlFor={`${idPrefix}-max`} className="sr-only">
            Maximum price
          </label>
          <input
            id={`${idPrefix}-max`}
            type="range"
            min={0}
            max={top}
            step={1}
            value={maxV}
            onChange={(e) => {
              const v = Math.max(Number(e.target.value), minV);
              set({ maxPrice: v === top ? null : v });
            }}
            className="w-full accent-[#c20e24]"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={f.maxPrice === 0}
              onChange={() => set({ maxPrice: f.maxPrice === 0 ? null : 0, minPrice: null })}
            />
            Free files only
          </label>
        </div>
      </Group>
      {software.length > 0 && (
        <Group title="Software">
          <ul className="grid grid-cols-2 gap-0.5">
            {software.map((c) => (
              <li key={c}>
                <label className="flex cursor-pointer items-center gap-2 py-0.5">
                  <input
                    type="checkbox"
                    checked={f.compatibility.includes(c)}
                    onChange={() => set({ compatibility: toggle(f.compatibility, c) })}
                  />
                  {c}
                </label>
              </li>
            ))}
          </ul>
        </Group>
      )}
      <Group title="Rating">
        <ul className="space-y-0.5">
          {[0, 4.5, 4, 3.5].map((r) => (
            <li key={r}>
              <label className="flex cursor-pointer items-center gap-2 py-0.5">
                <input
                  type="radio"
                  name={`${idPrefix}-rating`}
                  checked={f.minRating === r}
                  onChange={() => set({ minRating: r })}
                />
                {r === 0 ? (
                  'Any rating'
                ) : (
                  <>
                    <LeafRow rating={r} size={13} /> {r}+
                  </>
                )}
              </label>
            </li>
          ))}
        </ul>
      </Group>
      <Group title="Licence">
        <ul className="space-y-0.5">
          {LICENSE_TYPES.map((l: LicenseType) => (
            <li key={l}>
              <label className="flex cursor-pointer items-center gap-2 py-0.5">
                <input
                  type="checkbox"
                  checked={f.licenses.includes(l)}
                  onChange={() => set({ licenses: toggle(f.licenses, l) })}
                />
                {l} available
              </label>
            </li>
          ))}
        </ul>
      </Group>
      <div className="px-3 py-3">
        <button
          type="button"
          className="btn-ghost w-full"
          onClick={() => onChange({ ...DEFAULT_FILTERS, q: f.q, sort: f.sort })}
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
