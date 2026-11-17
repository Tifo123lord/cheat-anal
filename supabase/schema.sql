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

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

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
      or exists (select 1 from public.orders o where o.owner = auth.uid() and p.id = any(o.product_ids))
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
