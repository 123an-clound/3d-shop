import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCategories, getProducts } from "@/lib/data";
import { filterProducts, parseCatalogQuery, SORT_OPTIONS } from "@/lib/catalog";
import { ProductGrid } from "@/components/shop/product-card";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";

export const metadata: Metadata = {
  title: "Tất cả sản phẩm",
  description: "Đồ chơi in 3D, mô hình, máy in 3D, sợi nhựa và phụ kiện. Tìm kiếm và lọc theo danh mục, giá.",
  alternates: { canonical: "/san-pham" },
};

export default function ProductsPage(props: PageProps<"/san-pham">) {
  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ name: "Sản phẩm", href: "/san-pham" }]} />
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Catalog({ searchParams }: { searchParams: PageProps<"/san-pham">["searchParams"] }) {
  const [sp, categories, products] = await Promise.all([searchParams, getCategories(), getProducts()]);
  const query = parseCatalogQuery(sp);
  const results = filterProducts(products, query);
  const active = categories.find((c) => c.slug === query.category);
  const title = query.q ? `Kết quả cho “${query.q}”` : (active?.name ?? "Tất cả sản phẩm");

  return (
    <>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {active?.description && !query.q && <p className="mt-2 max-w-2xl text-sm text-muted">{active.description}</p>}
        </div>
        <p className="text-sm text-muted" aria-live="polite">{results.length} sản phẩm</p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Plain GET form: filters work without JavaScript and every state is a shareable URL. */}
        <form className="card h-fit space-y-5 p-5 lg:sticky lg:top-24" aria-label="Bộ lọc sản phẩm">
          <div>
            <label htmlFor="f-q" className="label">Từ khóa</label>
            <input id="f-q" name="q" type="search" defaultValue={query.q} className="input" placeholder="VD: máy in resin" />
          </div>
          <div>
            <label htmlFor="f-cat" className="label">Danh mục</label>
            <select id="f-cat" name="danh-muc" defaultValue={query.category ?? ""} className="input">
              <option value="">Tất cả</option>
              {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <fieldset>
            <legend className="label">Khoảng giá (đ)</legend>
            <div className="grid grid-cols-2 gap-2">
              <input name="gia-tu" type="number" min={0} step={1000} inputMode="numeric" defaultValue={query.min} className="input" placeholder="Từ" aria-label="Giá từ" />
              <input name="gia-den" type="number" min={0} step={1000} inputMode="numeric" defaultValue={query.max} className="input" placeholder="Đến" aria-label="Giá đến" />
            </div>
          </fieldset>
          <div>
            <label htmlFor="f-sort" className="label">Sắp xếp</label>
            <select id="f-sort" name="sap-xep" defaultValue={query.sort ?? "moi-nhat"} className="input">
              {Object.entries(SORT_OPTIONS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
            <input type="checkbox" name="con-hang" value="1" defaultChecked={query.inStock} className="size-4 accent-[var(--color-accent)]" />
            Chỉ hiện còn hàng
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">Áp dụng</button>
            <Link href="/san-pham" className="btn-ghost">Xóa</Link>
          </div>
        </form>

        <section aria-label="Danh sách sản phẩm">
          {results.length ? (
            <ProductGrid products={results} priorityCount={4} />
          ) : (
            <div className="card grid place-items-center gap-3 px-6 py-16 text-center">
              <p className="font-display text-lg font-semibold">Không tìm thấy sản phẩm phù hợp</p>
              <p className="text-sm text-muted">Thử bỏ bớt bộ lọc hoặc dùng từ khóa khác.</p>
              <Link href="/san-pham" className="btn-ghost mt-2">Xem tất cả</Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function CatalogSkeleton() {
  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]" aria-busy="true" aria-label="Đang tải sản phẩm">
      <div className="card h-96 animate-pulse" />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => <div key={i} className="card aspect-[3/4] animate-pulse" />)}
      </div>
    </div>
  );
}
