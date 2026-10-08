import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";
import { RealtimeRefresh } from "@/components/admin/realtime-refresh";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata: Metadata = { title: "Danh mục" };

export default async function AdminCategoriesPage() {
  const supabase = await createSupabaseServer();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("shop3d_categories").select("*").order("sort_order").order("name"),
    supabase.from("shop3d_products").select("category_id"),
  ]);
  const counts: Record<string, number> = {};
  for (const p of products ?? []) if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-display text-2xl font-bold">Danh mục</h1>
        <RealtimeRefresh tables={["shop3d_categories"]} />
      </div>
      <CategoryManager categories={(categories ?? []) as Category[]} counts={counts} />
    </div>
  );
}
