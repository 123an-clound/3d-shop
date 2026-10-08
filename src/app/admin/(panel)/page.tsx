import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatDateTime, formatVND } from "@/lib/format";
import { ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { Order } from "@/lib/types";
import { RealtimeRefresh } from "@/components/admin/realtime-refresh";

export default async function AdminDashboard() {
  const supabase = await createSupabaseServer();
  const [products, lowStock, pending, recent, completed] = await Promise.all([
    supabase.from("shop3d_products").select("id", { count: "exact", head: true }),
    supabase.from("shop3d_products").select("id, name, stock").lte("stock", 5).order("stock").limit(5),
    supabase.from("shop3d_orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("shop3d_orders").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("shop3d_orders").select("total").eq("status", "completed"),
  ]);
  const revenue = (completed.data ?? []).reduce((s, o) => s + o.total, 0);
  const orders = (recent.data ?? []) as Order[];

  const stats = [
    { label: "Đơn chờ xác nhận", value: String(pending.count ?? 0), href: "/admin/don-hang?trang-thai=pending" },
    { label: "Doanh thu (đơn hoàn tất)", value: formatVND(revenue), href: "/admin/don-hang?trang-thai=completed" },
    { label: "Tổng sản phẩm", value: String(products.count ?? 0), href: "/admin/san-pham" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Tổng quan</h1>
        <RealtimeRefresh tables={["shop3d_orders", "shop3d_products"]} />
      </div>

      <ul className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="card block p-5 hover:border-accent/50">
              <p className="text-sm text-muted">{s.label}</p>
              <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="card p-5" aria-labelledby="recent-orders">
          <div className="flex items-center justify-between">
            <h2 id="recent-orders" className="font-semibold">Đơn hàng mới</h2>
            <Link href="/admin/don-hang" className="text-sm text-accent hover:underline">Tất cả</Link>
          </div>
          {orders.length ? (
            <ul className="mt-4 divide-y divide-line">
              {orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{o.code} · {o.customer_name}</p>
                    <p className="text-xs text-muted">{formatDateTime(o.created_at)} · {o.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_CLASS[o.status]}`}>{ORDER_STATUS_LABEL[o.status]}</span>
                    <span className="font-semibold">{formatVND(o.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">Chưa có đơn hàng.</p>
          )}
        </section>

        <section className="card p-5" aria-labelledby="low-stock">
          <h2 id="low-stock" className="font-semibold">Sắp hết hàng (≤ 5)</h2>
          {lowStock.data?.length ? (
            <ul className="mt-4 space-y-2 text-sm">
              {lowStock.data.map((p) => (
                <li key={p.id} className="flex justify-between gap-3">
                  <Link href={`/admin/san-pham/${p.id}`} className="line-clamp-1 hover:text-accent">{p.name}</Link>
                  <span className={p.stock === 0 ? "text-danger" : "text-hot"}>{p.stock}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">Tồn kho ổn định.</p>
          )}
        </section>
      </div>
    </div>
  );
}
