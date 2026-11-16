'use client';

import Link from 'next/link';
import { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import ProductImage from '@/components/ProductImage';
import { blobKeys, formatBytes, type AdminRecord } from '@/lib/admin-products';
import { deleteBlobs } from '@/lib/blobstore';
import { getCategory, productHref } from '@/lib/catalog';
import { money } from '@/lib/format';
import { useAdminCatalog } from '@/store/admin-catalog';
import { useUI } from '@/store/ui';
import ProductForm from './ProductForm';

export default function ProductManager() {
  const records = useAdminCatalog((s) => s.records);
  const publish = useAdminCatalog((s) => s.publish);
  const remove = useAdminCatalog((s) => s.remove);
  const toast = useUI((s) => s.toast);
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const done = () => {
    setEditing(null);
    setFormKey((k) => k + 1);
  };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
      <section aria-labelledby="pm-list-h" className="min-w-0">
        <h2 id="pm-list-h" className="widget-title">
          Your products ({records.length})
        </h2>
        {records.length === 0 ? (
          <EmptyState title="No products yet">
            Add your first file with the form. Published files appear in the shop, search, the home grid and
            checkout.
          </EmptyState>
        ) : (
          <ul className="mt-2 space-y-2" aria-label="Admin products">
            {records.map((r) => {
              const p = r.product;
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center gap-3 rounded-md border border-[#a49b82] bg-paper-light/50 p-2.5 text-ink"
                  data-testid="admin-product"
                >
                  <span className="inset-img block w-[88px] shrink-0 overflow-hidden">
                    <ProductImage product={p} alt="" sizes="88px" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-[14px] font-bold">{p.title}</p>
                    <p className="text-[11px] text-ink-muted">
                      {getCategory(p.category)?.name ?? p.category} ·{' '}
                      {p.salePrice !== undefined ? (
                        <>
                          <s>{money(p.price)}</s> {money(p.salePrice)}
                        </>
                      ) : (
                        money(p.price)
                      )}{' '}
                      · {r.file ? `${r.file.name} (${formatBytes(r.file.size)})` : 'no file'}
                    </p>
                    <p className="mt-0.5 text-[11px]">
                      <span
                        className={`chip !py-0 ${r.published ? '!bg-[#d9e8b0]' : '!bg-[#eadfc6]'}`}
                        data-testid="admin-status"
                      >
                        {r.published ? 'Published' : 'Unpublished'}
                      </span>
                      {r.featured && <span className="chip ml-1 !py-0">Slider</span>}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Link href={productHref(p)} className="btn-ghost !px-2 !py-1 text-[11px]">
                      View
                    </Link>
                    <button
                      type="button"
                      className="btn-ghost !px-2 !py-1 text-[11px]"
                      onClick={() => {
                        setEditing(r);
                        setFormKey((k) => k + 1);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-ghost !px-2 !py-1 text-[11px]"
                      onClick={() => {
                        publish(p.id, !r.published);
                        toast(r.published ? `Unpublished “${p.title}”` : `Published “${p.title}”`);
                      }}
                    >
                      {r.published ? 'Unpublish' : 'Publish'}
                    </button>
                    {confirmDelete === p.id ? (
                      <button
                        type="button"
                        className="btn-ghost !border-sale !px-2 !py-1 text-[11px] !text-[#9e2f19]"
                        onClick={() => {
                          remove(p.id);
                          void deleteBlobs(blobKeys(r)).catch(() => undefined);
                          setConfirmDelete(null);
                          if (editing?.product.id === p.id) done();
                          toast(`Deleted “${p.title}”`);
                        }}
                      >
                        Confirm delete
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-ghost !px-2 !py-1 text-[11px]"
                        onClick={() => setConfirmDelete(p.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section aria-labelledby="pm-form-h" className="min-w-0">
        <h2 id="pm-form-h" className="widget-title">
          {editing ? `Edit “${editing.product.title}”` : 'Add a product'}
        </h2>
        <ProductForm key={formKey} editing={editing} onDone={done} />
      </section>
    </div>
  );
}
