-- 3d-shop schema. All objects prefixed shop3d_ because the Supabase project is shared with other sites.

create table public.shop3d_admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
comment on table public.shop3d_admins is '3d-shop: admin allowlist by confirmed email';

create or replace function public.shop3d_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    join public.shop3d_admins a on a.email = lower(u.email)
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;

create or replace function public.shop3d_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.shop3d_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 100),
  description text not null default '',
  image_url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
comment on table public.shop3d_categories is '3d-shop: product categories';

create table public.shop3d_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 200),
  category_id uuid references public.shop3d_categories (id) on delete set null,
  short_description text not null default '',
  description text not null default '',
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  -- [{ "label": "Size", "value": "20 x 10 cm" }, ...]
  specs jsonb not null default '[]' check (jsonb_typeof(specs) = 'array'),
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sold_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.shop3d_products is '3d-shop: products (toys, printers, filament, tools)';
create index shop3d_products_category_idx on public.shop3d_products (category_id);
create index shop3d_products_published_idx on public.shop3d_products (is_published, created_at desc);

create trigger shop3d_products_updated_at
before update on public.shop3d_products
for each row execute function public.shop3d_set_updated_at();

-- key/value site config edited from admin: site, contact, hero, banners, sections, shipping, bank
create table public.shop3d_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
comment on table public.shop3d_settings is '3d-shop: site configuration edited from admin';

create trigger shop3d_settings_updated_at
before update on public.shop3d_settings
for each row execute function public.shop3d_set_updated_at();

create type public.shop3d_order_status as enum ('pending', 'confirmed', 'shipping', 'completed', 'cancelled');
create type public.shop3d_payment_method as enum ('cod', 'bank_transfer');

create table public.shop3d_orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_name text not null,
  phone text not null,
  email text not null default '',
  address text not null,
  note text not null default '',
  payment_method public.shop3d_payment_method not null,
  status public.shop3d_order_status not null default 'pending',
  is_paid boolean not null default false,
  subtotal integer not null,
  shipping_fee integer not null,
  total integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.shop3d_orders is '3d-shop: guest orders (written only via shop3d_place_order / shop3d_admin_update_order)';
create index shop3d_orders_created_idx on public.shop3d_orders (created_at desc);
create index shop3d_orders_phone_idx on public.shop3d_orders (phone, created_at desc);

create trigger shop3d_orders_updated_at
before update on public.shop3d_orders
for each row execute function public.shop3d_set_updated_at();

create table public.shop3d_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shop3d_orders (id) on delete cascade,
  product_id uuid references public.shop3d_products (id) on delete set null,
  product_name text not null,
  unit_price integer not null,
  quantity integer not null check (quantity > 0)
);
create index shop3d_order_items_order_idx on public.shop3d_order_items (order_id);
create index shop3d_order_items_product_idx on public.shop3d_order_items (product_id);

-- RLS -----------------------------------------------------------------------
alter table public.shop3d_admins enable row level security;
alter table public.shop3d_categories enable row level security;
alter table public.shop3d_products enable row level security;
alter table public.shop3d_settings enable row level security;
alter table public.shop3d_orders enable row level security;
alter table public.shop3d_order_items enable row level security;

create policy "shop3d admins read admins" on public.shop3d_admins
  for select to authenticated using ((select public.shop3d_is_admin()));

create policy "shop3d public read categories" on public.shop3d_categories
  for select to anon, authenticated using (true);
create policy "shop3d admin insert categories" on public.shop3d_categories
  for insert to authenticated with check ((select public.shop3d_is_admin()));
create policy "shop3d admin update categories" on public.shop3d_categories
  for update to authenticated using ((select public.shop3d_is_admin())) with check ((select public.shop3d_is_admin()));
create policy "shop3d admin delete categories" on public.shop3d_categories
  for delete to authenticated using ((select public.shop3d_is_admin()));

create policy "shop3d read products" on public.shop3d_products
  for select to anon, authenticated using (is_published or (select public.shop3d_is_admin()));
create policy "shop3d admin insert products" on public.shop3d_products
  for insert to authenticated with check ((select public.shop3d_is_admin()));
create policy "shop3d admin update products" on public.shop3d_products
  for update to authenticated using ((select public.shop3d_is_admin())) with check ((select public.shop3d_is_admin()));
create policy "shop3d admin delete products" on public.shop3d_products
  for delete to authenticated using ((select public.shop3d_is_admin()));

create policy "shop3d public read settings" on public.shop3d_settings
  for select to anon, authenticated using (true);
create policy "shop3d admin insert settings" on public.shop3d_settings
  for insert to authenticated with check ((select public.shop3d_is_admin()));
create policy "shop3d admin update settings" on public.shop3d_settings
  for update to authenticated using ((select public.shop3d_is_admin())) with check ((select public.shop3d_is_admin()));

-- Orders: no direct writes; customers go through shop3d_place_order, admins through shop3d_admin_update_order.
create policy "shop3d admin read orders" on public.shop3d_orders
  for select to authenticated using ((select public.shop3d_is_admin()));
create policy "shop3d admin read order items" on public.shop3d_order_items
  for select to authenticated using ((select public.shop3d_is_admin()));

-- Orders ----------------------------------------------------------------------

-- Guest checkout. Prices, stock and shipping fee are computed server-side; client only sends ids + quantities.
create or replace function public.shop3d_place_order(p_items jsonb, p_customer jsonb, p_payment_method public.shop3d_payment_method)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_code text;
  v_phone text := coalesce(p_customer ->> 'phone', '');
  v_subtotal integer := 0;
  v_fee integer;
  v_shipping jsonb;
  v_item record;
  v_product record;
begin
  if jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) not between 1 and 50
     or jsonb_typeof(p_customer) is distinct from 'object'
     or char_length(btrim(coalesce(p_customer ->> 'name', ''))) not between 2 and 100
     or v_phone !~ '^0[0-9]{9}$'
     or char_length(coalesce(p_customer ->> 'email', '')) > 200
     or (coalesce(p_customer ->> 'email', '') <> '' and (p_customer ->> 'email') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
     or char_length(btrim(coalesce(p_customer ->> 'address', ''))) not between 5 and 300
     or char_length(coalesce(p_customer ->> 'note', '')) > 500 then
    raise exception 'INVALID_INPUT';
  end if;

  -- ponytail: per-phone throttle only; add IP-based limiting at the edge if spam appears.
  if (select count(*) from public.shop3d_orders
      where phone = v_phone and created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'RATE_LIMITED';
  end if;

  v_code := '3D' || to_char(now() at time zone 'Asia/Ho_Chi_Minh', 'YYMMDD')
            || upper(substr(md5(gen_random_uuid()::text), 1, 6));

  insert into public.shop3d_orders (code, customer_name, phone, email, address, note, payment_method, subtotal, shipping_fee, total)
  values (
    v_code, btrim(p_customer ->> 'name'), v_phone, btrim(coalesce(p_customer ->> 'email', '')),
    btrim(p_customer ->> 'address'), btrim(coalesce(p_customer ->> 'note', '')), p_payment_method, 0, 0, 0
  ) returning id into v_order_id;

  -- Duplicate product ids are merged; locking in id order avoids deadlocks between concurrent orders.
  for v_item in
    select i.product_id, sum(i.quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as i (product_id uuid, quantity integer)
    group by i.product_id
    order by i.product_id
  loop
    if v_item.product_id is null or v_item.quantity is null or v_item.quantity not between 1 and 50 then
      raise exception 'INVALID_INPUT';
    end if;

    select p.id, p.name, p.price, p.stock into v_product
    from public.shop3d_products p
    where p.id = v_item.product_id and p.is_published
    for update;

    if not found then
      raise exception 'NOT_FOUND' using detail = v_item.product_id::text;
    end if;
    if v_product.stock < v_item.quantity then
      raise exception 'OUT_OF_STOCK' using detail = v_item.product_id::text;
    end if;

    update public.shop3d_products
    set stock = stock - v_item.quantity, sold_count = sold_count + v_item.quantity
    where id = v_product.id;

    insert into public.shop3d_order_items (order_id, product_id, product_name, unit_price, quantity)
    values (v_order_id, v_product.id, v_product.name, v_product.price, v_item.quantity);

    v_subtotal := v_subtotal + v_product.price * v_item.quantity;
  end loop;

  -- Must stay in sync with src/lib/shipping.ts calcShippingFee.
  select value into v_shipping from public.shop3d_settings where key = 'shipping';
  v_fee := case
    when v_subtotal >= coalesce((v_shipping ->> 'free_threshold')::integer, 1000000) then 0
    else coalesce((v_shipping ->> 'flat_fee')::integer, 30000)
  end;

  update public.shop3d_orders
  set subtotal = v_subtotal, shipping_fee = v_fee, total = v_subtotal + v_fee
  where id = v_order_id;

  return v_code;
end;
$$;

create or replace function public.shop3d_admin_update_order(p_order_id uuid, p_status public.shop3d_order_status, p_is_paid boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old public.shop3d_order_status;
begin
  if not public.shop3d_is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  select status into v_old from public.shop3d_orders where id = p_order_id for update;
  if not found then
    raise exception 'NOT_FOUND';
  end if;

  if v_old in ('cancelled', 'completed') and p_status <> v_old then
    raise exception 'INVALID_TRANSITION';
  end if;

  -- Cancelling returns stock.
  if p_status = 'cancelled' and v_old <> 'cancelled' then
    update public.shop3d_products p
    set stock = p.stock + s.quantity, sold_count = greatest(p.sold_count - s.quantity, 0)
    from (select product_id, sum(quantity)::integer as quantity
          from public.shop3d_order_items
          where order_id = p_order_id and product_id is not null
          group by product_id) s
    where p.id = s.product_id;
  end if;

  update public.shop3d_orders set status = p_status, is_paid = p_is_paid where id = p_order_id;
end;
$$;

revoke all on function public.shop3d_place_order(jsonb, jsonb, public.shop3d_payment_method) from public;
grant execute on function public.shop3d_place_order(jsonb, jsonb, public.shop3d_payment_method) to anon, authenticated;
revoke all on function public.shop3d_admin_update_order(uuid, public.shop3d_order_status, boolean) from public, anon;
grant execute on function public.shop3d_admin_update_order(uuid, public.shop3d_order_status, boolean) to authenticated;
revoke all on function public.shop3d_is_admin() from public;
grant execute on function public.shop3d_is_admin() to anon, authenticated;

-- Realtime for the admin panel
alter publication supabase_realtime add table public.shop3d_products, public.shop3d_categories, public.shop3d_orders, public.shop3d_settings;

-- Storage ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shop3d-media', 'shop3d-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
on conflict (id) do nothing;

create policy "shop3d admin upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'shop3d-media' and (select public.shop3d_is_admin()));
create policy "shop3d admin update media" on storage.objects
  for update to authenticated using (bucket_id = 'shop3d-media' and (select public.shop3d_is_admin()));
create policy "shop3d admin delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'shop3d-media' and (select public.shop3d_is_admin()));

-- Admin emails are added per environment (see README "Admin access"), never committed.
