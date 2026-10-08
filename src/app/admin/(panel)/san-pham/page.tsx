import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatVND, normalizeText } from "@/lib/format";
import type { Product } from "@/lib/types";
import { RealtimeRefresh } from "@/components/admin/realtime-refresh";
import { ProductRowActions } from "@/components/admin/product-row-actions";

export const metadata: Metadata = { title: "Sản phẩm" };

export default async function AdminProductsPage(props: PageProps<"/admin/san-pham">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("shop3d_products")
    .select("*, category:shop3d_categories(name)")
    .order("created_at", { ascending: false });

  const term = normalizeText(q);
  const products = ((data ?? []) as (Product & { category: { name: string } | null })[]).filter(
    (p) => !term || normalizeText(`${p.name} ${p.slug}`).includes(term),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-2xl font-bold">Sản phẩm</h1>
          <RealtimeRefresh tables={["shop3d_products", "shop3d_categories"]} />
        </div>
        <div className="flex gap-2">
          <form>
            <label htmlFor="pq" className="sr-only">Tìm sản phẩm</label>
            <input id="pq" name="q" defaultValue={q} placeholder="Tìm sản phẩm..." className="input w-48" />
          </form>
          <Link href="/admin/san-pham/moi" className="btn-primary">+ Thêm</Link>
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-danger">Không tải được sản phẩm.</p>}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="p-3">Sản phẩm</th>
              <th scope="col" className="p-3">Danh mục</th>
              <th scope="col" className="p-3 text-right">Giá</th>
              <th scope="col" className="p-3 text-right">Tồn</th>
              <th scope="col" className="p-3">Hiển thị</th>
              <th scope="col" className="p-3"><span className="sr-only">Thao tác</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-surface-2/50">
                <td className="p-3">
                  <Link href={`/admin/san-pham/${p.id}`} className="flex items-center gap-3 hover:text-accent">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                      {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />}
                    </span>
                    <span className="line-clamp-2 font-medium">{p.name}</span>
                  </Link>
                </td>
                <td className="p-3 text-muted">{p.category?.name ?? "—"}</td>
                <td className="p-3 text-right">{formatVND(p.price)}</td>
                <td className={`p-3 text-right ${p.stock === 0 ? "text-danger" : ""}`}>{p.stock}</td>
                <td className="p-3">
                  <ProductRowActions id={p.id} name={p.name} isPublished={p.is_published} isFeatured={p.is_featured} />
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/san-pham/${p.id}`} className="text-accent hover:underline">Sửa</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length && <p className="p-8 text-center text-sm text-muted">Không có sản phẩm.</p>}
      </div>
    </div>
  );
}
