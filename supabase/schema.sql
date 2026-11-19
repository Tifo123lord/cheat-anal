-- Cheat & Anal backend schema (Supabase). Idempotent: safe to run again.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  role text not null default 'user' check (role in ('user','admin')),
  newsletter boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Emails that become admin on sign-up. No policies: invisible to the API, editable only from the SQL editor.
create table if not exists public.admin_emails (email text primary key);
alter table public.admin_emails enable row level security;
revoke all on public.admin_emails from anon, authenticated;
-- Add admins here: insert into public.admin_emails (email) values ('you@example.com') on conflict do nothing;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'name', ''),
    case when exists (select 1 from public.admin_emails a where a.email = lower(new.email)) then 'admin' else 'user' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- Promote an already-registered admin email, too.
update public.profiles set role = 'admin'
  where email in (select email from public.admin_emails) and role <> 'admin';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users may edit their own name/newsletter but never their role.
create or replace function public.protect_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- The dashboard, SQL editor and service key (no signed-in user) may change roles; users may not.
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
  end if;
  if new.email is distinct from old.email then new.email := old.email; end if;
  return new;
end $$;
drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_role();

alter table public.profiles enable row level security;
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create table if not exists public.products (
  id text primary key,
  product jsonb not null,
  published boolean not null default false,
  featured boolean not null default false,
  file_path text,
  file_name text,
  file_size bigint,
  file_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
drop policy if exists products_read on public.products;
create policy products_read on public.products for select using (published or public.is_admin());
drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.orders (
  id text primary key,
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null,
  product_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;
drop policy if exists orders_owner_read on public.orders;
create policy orders_owner_read on public.orders for select using (owner = auth.uid() or public.is_admin());
drop policy if exists orders_owner_insert on public.orders;
create policy orders_owner_insert on public.orders for insert with check (owner = auth.uid());
drop policy if exists orders_owner_update on public.orders;
create policy orders_owner_update on public.orders for update using (owner = auth.uid()) with check (owner = auth.uid());

-- Payment status. Buyers' orders start as pending; only an admin marks them paid (e.g. after a Telegram payment).
alter table public.orders add column if not exists status text not null default 'pending';
alter table public.orders add column if not exists method text not null default 'telegram';
do $$ begin
  alter table public.orders add constraint orders_status_chk check (status in ('pending','paid','cancelled'));
exception when duplicate_object then null; end $$;
drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders for update using (public.is_admin()) with check (public.is_admin());

create or replace function public.guard_order() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() or auth.uid() is null then return new; end if;
  if tg_op = 'INSERT' then
    new.status := 'pending';
  else
    new.status := old.status;
    new.product_ids := old.product_ids;
    new.owner := old.owner;
  end if;
  return new;
end $$;
drop trigger if exists orders_guard on public.orders;
create trigger orders_guard before insert or update on public.orders
  for each row execute function public.guard_order();

create table if not exists public.reviews (
  id text primary key,
  product_id text not null,
  data jsonb not null,
  user_id uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists reviews_product_idx on public.reviews(product_id);
alter table public.reviews enable row level security;
drop policy if exists reviews_read on public.reviews;
create policy reviews_read on public.reviews for select using (true);
drop policy if exists reviews_insert on public.reviews;
create policy reviews_insert on public.reviews for insert to authenticated with check (user_id = auth.uid());
drop policy if exists reviews_admin_delete on public.reviews;
create policy reviews_admin_delete on public.reviews for delete using (public.is_admin());

-- Storage: preview images are public; downloadable files are private.
insert into storage.buckets (id, name, public, file_size_limit)
values ('product-images', 'product-images', true, 15728640)
on conflict (id) do update set public = true, file_size_limit = 15728640;
insert into storage.buckets (id, name, public, file_size_limit)
values ('product-files', 'product-files', false, 209715200)
on conflict (id) do update set public = false, file_size_limit = 209715200;

-- Who may download a stored file: admins, anyone for a free published file, buyers of the product.
create or replace function public.can_download(object_name text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.products p
    where p.file_path = object_name and (
      (p.published and coalesce((p.product->>'salePrice')::numeric, (p.product->>'price')::numeric) = 0)
      or exists (select 1 from public.orders o where o.owner = auth.uid() and o.status = 'paid' and p.id = any(o.product_ids))
    )
  );
$$;

drop policy if exists "images admin write" on storage.objects;
create policy "images admin write" on storage.objects for all
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "files admin write" on storage.objects;
create policy "files admin write" on storage.objects for all
  using (bucket_id = 'product-files' and public.is_admin())
  with check (bucket_id = 'product-files' and public.is_admin());
drop policy if exists "files download" on storage.objects;
create policy "files download" on storage.objects for select
  using (bucket_id = 'product-files' and public.can_download(name));

-- ── Download unlocks & file updates ─────────────────────────────────────────
-- Paid orders may also be granted by hand from the admin panel (method 'manual').
do $$ begin
  alter table public.orders add constraint orders_method_chk check (method in ('telegram','manual'));
exception when duplicate_object then null; end $$;

-- When the downloadable file last changed. Buyers always download products.file_path (the current file),
-- never a path stored in the order, so replacing the file updates every buyer's download.
alter table public.products add column if not exists file_updated_at timestamptz;
update public.products set file_updated_at = created_at where file_path is not null and file_updated_at is null;

create or replace function public.stamp_file_update() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.file_path is not null and new.file_updated_at is null then new.file_updated_at := now(); end if;
  elsif new.file_path is distinct from old.file_path then
    new.file_updated_at := case when new.file_path is null then null else now() end;
  else
    new.file_updated_at := old.file_updated_at;
  end if;
  return new;
end $$;
drop trigger if exists products_stamp_file on public.products;
create trigger products_stamp_file before insert or update on public.products
  for each row execute function public.stamp_file_update();

-- Buyers keep access to a product's current file even after it is unpublished.
drop policy if exists products_buyer_read on public.products;
create policy products_buyer_read on public.products for select using (
  exists (select 1 from public.orders o where o.owner = auth.uid() and o.status = 'paid' and products.id = any(o.product_ids))
);

-- Admin: unlock a product's download for a registered user by email. Creates a paid 'manual' order.
create or replace function public.admin_grant_download(p_email text, p_product_id text)
returns jsonb
language plpgsql volatile security definer set search_path = public, auth as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_uid uuid;
  v_name text;
  v_product jsonb;
  v_license text;
  v_id text;
  v_key text;
  v_now timestamptz := now();
  v_alpha constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_data jsonb;
  i int;
begin
  if not public.is_admin() then
    raise exception 'فقط مدیرها می‌توانند دانلود را باز کنند.' using errcode = '42501';
  end if;
  if v_email = '' then
    raise exception 'ایمیل کاربر را وارد کن.' using errcode = '22023';
  end if;
  select u.id into v_uid from auth.users u where lower(u.email) = v_email limit 1;
  if v_uid is null then
    raise exception 'کاربری با ایمیل % پیدا نشد. اول باید در سایت ثبت‌نام کند.', v_email using errcode = 'P0002';
  end if;
  select p.product into v_product from public.products p where p.id = p_product_id;
  if v_product is null then
    raise exception 'این محصول پیدا نشد.' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.orders o where o.owner = v_uid and o.status = 'paid' and p_product_id = any(o.product_ids)) then
    raise exception 'دانلود این فایل برای این کاربر از قبل باز است.' using errcode = '23505';
  end if;
  select coalesce(pr.name, '') into v_name from public.profiles pr where pr.id = v_uid;
  v_license := coalesce(v_product->'licenses'->0->>'type', 'Personal');

  -- Same id format as the site's checkout: LP-YYYYMMDD-NNNNNN (UTC date).
  loop
    v_id := 'LP-' || to_char(v_now at time zone 'utc', 'YYYYMMDD') || '-' || lpad(floor(random() * 1000000)::int::text, 6, '0');
    exit when not exists (select 1 from public.orders where id = v_id);
  end loop;
  v_key := 'LP';
  for g in 1..4 loop
    v_key := v_key || '-';
    for i in 1..4 loop
      v_key := v_key || substr(v_alpha, 1 + floor(random() * length(v_alpha))::int, 1);
    end loop;
  end loop;

  v_data := jsonb_build_object(
    'id', v_id,
    'items', jsonb_build_array(jsonb_build_object(
      'kind', 'product', 'id', p_product_id, 'title', coalesce(v_product->>'title', p_product_id),
      'license', v_license, 'price', 0, 'licenseKey', v_key, 'downloads', 0)),
    'subtotal', 0, 'discount', 0, 'tax', 0, 'total', 0,
    'email', v_email, 'name', coalesce(nullif(v_name, ''), split_part(v_email, '@', 1)),
    'ownerEmail', v_email,
    'createdAt', to_char(v_now at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'licenseKeys', jsonb_build_array(v_key),
    'status', 'paid',
    'method', 'manual'
  );
  insert into public.orders (id, owner, data, product_ids, status, method, created_at)
  values (v_id, v_uid, v_data, array[p_product_id], 'paid', 'manual', v_now);
  return v_data;
end $$;
revoke all on function public.admin_grant_download(text, text) from public, anon;
grant execute on function public.admin_grant_download(text, text) to authenticated;
