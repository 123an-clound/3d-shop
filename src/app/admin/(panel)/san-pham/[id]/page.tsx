import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/types";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Sửa sản phẩm" };

export default async function AdminProductEditPage(props: PageProps<"/admin/san-pham/[id]">) {
  const { id } = await props.params;
  const isNew = id === "moi";
  if (!isNew && !z.uuid().safeParse(id).success) notFound();

  const supabase = await createSupabaseServer();
  const [{ data: categories }, productRes] = await Promise.all([
    supabase.from("shop3d_categories").select("*").order("sort_order"),
    isNew ? Promise.resolve({ data: null }) : supabase.from("shop3d_products").select("*").eq("id", id).maybeSingle(),
  ]);
  const product = productRes.data as Product | null;
  if (!isNew && !product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/san-pham" className="text-sm text-muted hover:text-fg">← Danh sách sản phẩm</Link>
        <h1 className="mt-2 font-display text-2xl font-bold">{isNew ? "Thêm sản phẩm" : product!.name}</h1>
        {product && (
          <Link href={`/san-pham/${product.slug}`} target="_blank" className="text-sm text-accent hover:underline">Xem trên web ↗</Link>
        )}
      </div>
      <ProductForm product={product} categories={(categories ?? []) as Category[]} />
    </div>
  );
}
