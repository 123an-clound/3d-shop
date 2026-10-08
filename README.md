# 3D Shop

E-commerce for 3D-printed toys, 3D printers, filament and accessories (Vietnam market).

- **Stack:** Next.js 16 (App Router, Cache Components), Tailwind CSS 4, TypeScript, Supabase (Postgres + Auth + Storage + Realtime), Zustand (cart), Zod.
- **Storefront:** home (hero, highlights, categories, promo banners, featured/new products), catalog with accent-insensitive search + filters (category, price, in stock, sort), product detail with gallery & spec table, cart, guest checkout (COD / bank transfer), contact page. SEO: metadata, Open Graph, JSON-LD (Store, WebSite, Product, BreadcrumbList), sitemap, robots.
- **Admin (`/admin`):** dashboard, orders (status, payment, stock restore on cancel), products CRUD (images, specs), categories CRUD, site settings (brand/logo, contact, hero, homepage sections, promo banners, shipping fee, bank account). Every admin list refreshes live via Supabase Realtime.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL + publishable key + public site URL
npm run dev
```

Database objects live in a shared Supabase project and are all prefixed `shop3d_`:

- `supabase/migrations/0001_shop3d_schema.sql` — tables, RLS, order RPCs, storage bucket `shop3d-media`, realtime.
- `supabase/seed.sql` — mock categories/products (Wikimedia Commons images) and default settings.

### Admin access

1. Create the user in Supabase Dashboard → Authentication (email must be confirmed).
2. Add the lowercase email to `shop3d_admins`:
   ```sql
   insert into public.shop3d_admins (email) values ('you@example.com');
   ```
3. Sign in at `/admin/dang-nhap`.

## Security model

- Browser only ever holds the publishable key; all authorization is Postgres RLS.
- Public can read published products, categories and settings. Writes require `shop3d_is_admin()` (confirmed email in the allowlist).
- Orders are never written directly: guests call `shop3d_place_order` (server re-reads price/stock, computes shipping, throttles per phone); admins call `shop3d_admin_update_order`.
- Admin server actions re-check admin status and validate input with Zod; storage uploads are admin-only.

## Scripts

`npm run dev` · `npm run build` · `npm run lint` · `npm test`
