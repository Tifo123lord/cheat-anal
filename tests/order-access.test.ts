import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { orderNumber } from '@/lib/keys';
import {
  grantProblems,
  isDownloadOpen,
  isNewVersion,
  LOCK_LABEL,
  lockedStatus,
  ORDER_STATUS_LABEL,
  UNLOCK_LABEL,
} from '@/lib/order-access';
import type { Order } from '@/lib/types';
import { recordToRow, rowToRecord } from '@/store/admin-catalog';
import { rowToOrder } from '@/store/admin-orders';

const schema = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8');

describe('admin unlock wording', () => {
  it('labels the paid action and state as download unlocks', () => {
    expect(UNLOCK_LABEL).toBe('باز کردن دانلود');
    expect(LOCK_LABEL).toBe('قفل کردن دانلود');
    expect(ORDER_STATUS_LABEL.paid).toBe('دانلود باز است');
  });

  it('locks a Telegram order back to pending and a manual grant to cancelled', () => {
    expect(lockedStatus({ method: 'telegram' })).toBe('pending');
    expect(lockedStatus({})).toBe('pending');
    expect(lockedStatus({ method: 'manual' })).toBe('cancelled');
  });

  it('only paid orders have open downloads', () => {
    expect(isDownloadOpen({ status: 'paid' })).toBe(true);
    expect(isDownloadOpen({ status: 'pending' })).toBe(false);
    expect(isDownloadOpen({ status: 'cancelled' })).toBe(false);
    expect(isDownloadOpen({})).toBe(false);
  });
});

describe('manual grant form', () => {
  it('needs a valid email and a product', () => {
    expect(grantProblems('', '')).toEqual({
      email: 'یک ایمیل معتبر وارد کن.',
      product: 'یک محصول انتخاب کن.',
    });
    expect(grantProblems('not-an-email', 'adm-x').email).toBeDefined();
    expect(grantProblems(' buyer@example.com ', 'adm-x')).toEqual({});
  });
});

describe('file updates', () => {
  const order = '2026-11-18T10:00:00.000Z';
  it('flags a file replaced after the order as a new version', () => {
    expect(isNewVersion('2026-11-19T08:00:00.000Z', order)).toBe(true);
    expect(isNewVersion('2026-11-18 10:00:01+00', order)).toBe(true);
  });
  it('does not flag the original or missing/invalid stamps', () => {
    expect(isNewVersion('2026-11-17T08:00:00.000Z', order)).toBe(false);
    expect(isNewVersion(order, order)).toBe(false);
    expect(isNewVersion(undefined, order)).toBe(false);
    expect(isNewVersion(null, order)).toBe(false);
    expect(isNewVersion('garbage', order)).toBe(false);
  });

  const base = {
    id: 'adm-1',
    product: { id: 'adm-1', title: 'T' } as never,
    published: true,
    featured: false,
    file_path: 'file-abc',
    file_name: 'tool.dll',
    file_size: 42,
    file_type: 'application/octet-stream',
  };

  it("reads the server's file_updated_at stamp into the record", () => {
    const rec = rowToRecord({ ...base, file_updated_at: '2026-11-19T08:00:00+00:00' });
    expect(rec.file).toEqual({
      key: 'file-abc',
      name: 'tool.dll',
      size: 42,
      type: 'application/octet-stream',
      updatedAt: '2026-11-19T08:00:00+00:00',
    });
    expect(rowToRecord({ ...base, file_updated_at: null }).file?.updatedAt).toBeUndefined();
    expect(rowToRecord({ ...base, file_path: null }).file).toBeNull();
  });

  it('never writes file_updated_at itself (the database trigger stamps it)', () => {
    const row = recordToRow(rowToRecord({ ...base, file_updated_at: '2026-11-19T08:00:00+00:00' }));
    expect(row).not.toHaveProperty('file_updated_at');
    expect(row.file_path).toBe('file-abc');
  });
});

describe('order rows', () => {
  const data = {
    id: 'LP-20261118-123456',
    items: [],
    createdAt: '2026-11-18T10:00:00.000Z',
  } as unknown as Order;
  it('carries status and method from the columns, defaulting to telegram', () => {
    expect(rowToOrder({ data, status: 'paid', method: 'manual' })).toMatchObject({
      status: 'paid',
      method: 'manual',
    });
    expect(rowToOrder({ data, status: 'pending', method: null }).method).toBe('telegram');
  });
  it('uses the same order id format as the server grant', () => {
    expect(orderNumber(Date.UTC(2026, 10, 18), 0.123456)).toMatch(/^LP-\d{8}-\d{6}$/);
    expect(schema).toContain(`'LP-' || to_char(v_now at time zone 'utc', 'YYYYMMDD') || '-' || lpad(`);
  });
});

describe('schema: unlocks and file updates', () => {
  it('defines an admin-only grant that looks users up by email', () => {
    expect(schema).toMatch(
      /create or replace function public\.admin_grant_download\(p_email text, p_product_id text\)/,
    );
    expect(schema).toMatch(/security definer/);
    expect(schema).toContain('if not public.is_admin() then');
    expect(schema).toContain('from auth.users u where lower(u.email) = v_email');
    expect(schema).toContain("values (v_id, v_uid, v_data, array[p_product_id], 'paid', 'manual', v_now)");
    expect(schema).toContain(
      'revoke all on function public.admin_grant_download(text, text) from public, anon;',
    );
  });
  it('stamps file_updated_at when the file changes', () => {
    expect(schema).toContain('add column if not exists file_updated_at timestamptz');
    expect(schema).toContain('new.file_path is distinct from old.file_path');
    expect(schema).toContain('create trigger products_stamp_file before insert or update on public.products');
  });
  it("checks downloads against the product's current file, not order data", () => {
    const fn = schema.slice(schema.indexOf('function public.can_download'));
    expect(fn).toContain('where p.file_path = object_name');
    expect(fn.slice(0, fn.indexOf('$$;'))).not.toMatch(/o\.data/);
  });
  it('allows the manual method', () => {
    expect(schema).toContain("check (method in ('telegram','manual'))");
  });
});
