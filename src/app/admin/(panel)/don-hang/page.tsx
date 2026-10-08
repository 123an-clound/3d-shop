import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatDateTime, formatVND } from "@/lib/format";
import { ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";
import { RealtimeRefresh } from "@/components/admin/realtime-refresh";
import { OrderControls } from "@/components/admin/order-controls";

export const metadata: Metadata = { title: "Đơn hàng" };

const PAGE_SIZE = 30;

export default async function AdminOrdersPage(props: PageProps<"/admin/don-hang">) {
  const sp = await props.searchParams;
  const status = typeof sp["trang-thai"] === "string" && sp["trang-thai"] in ORDER_STATUS_LABEL ? (sp["trang-thai"] as OrderStatus) : null;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 50) : "";
  const page = Math.max(1, Number.parseInt(String(sp.trang ?? "1"), 10) || 1);

  const supabase = await createSupabaseServer();
  let query = supabase
    .from("shop3d_orders")
    .select("*, items:shop3d_order_items(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (status) query = query.eq("status", status);
  // Only digits/letters reach the filter, so the PostgREST or() expression cannot be broken out of.
  const safeQ = q.replace(/[^\p{L}\p{N}]/gu, "");
  if (safeQ) query = query.or(`code.ilike.%${safeQ}%,phone.ilike.%${safeQ}%`);
  const { data, count, error } = await query;
  const orders = (data ?? []) as (Order & { items: OrderItem[] })[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const qs = (p: Record<string, string | number | null>) => {
    const params = new URLSearchParams();
    const merged = { "trang-thai": status, q: q || null, ...p };
    Object.entries(merged).forEach(([k, v]) => v !== null && v !== "" && params.set(k, String(v)));
    return `/admin/don-hang${params.size ? `?${params}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Đơn hàng</h1>
        <RealtimeRefresh tables={["shop3d_orders"]} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link href={qs({ "trang-thai": null, trang: null })} className={`rounded-lg px-3 py-2 text-sm ${!status ? "bg-accent/15 text-accent" : "text-muted hover:bg-surface-2"}`}>Tất cả</Link>
        {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
          <Link key={s} href={qs({ "trang-thai": s, trang: null })} className={`rounded-lg px-3 py-2 text-sm ${status === s ? "bg-accent/15 text-accent" : "text-muted hover:bg-surface-2"}`}>
            {ORDER_STATUS_LABEL[s]}
          </Link>
        ))}
        <form className="ml-auto flex gap-2">
          {status && <input type="hidden" name="trang-thai" value={status} />}
          <label htmlFor="order-q" className="sr-only">Tìm mã đơn hoặc SĐT</label>
          <input id="order-q" name="q" defaultValue={q} placeholder="Mã đơn / SĐT" className="input w-44" />
          <button className="btn-ghost">Tìm</button>
        </form>
      </div>

      {error && <p role="alert" className="text-sm text-danger">Không tải được đơn hàng.</p>}

      {orders.length ? (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="card">
              <details>
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <div>
                    <p className="font-semibold">{o.code} · {o.customer_name}</p>
                    <p className="text-xs text-muted">{formatDateTime(o.created_at)} · {o.phone} · {o.payment_method === "cod" ? "COD" : "Chuyển khoản"}{o.is_paid ? " · Đã thanh toán" : ""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_CLASS[o.status]}`}>{ORDER_STATUS_LABEL[o.status]}</span>
                    <span className="font-display font-bold">{formatVND(o.total)}</span>
                  </div>
                </summary>
                <div className="grid gap-6 border-t border-line p-4 lg:grid-cols-2">
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted">Địa chỉ:</span> {o.address}</p>
                    {o.email && <p><span className="text-muted">Email:</span> {o.email}</p>}
                    {o.note && <p><span className="text-muted">Ghi chú:</span> {o.note}</p>}
                    <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
                      {o.items.map((i) => (
                        <li key={i.id} className="flex justify-between gap-3 px-3 py-2">
                          <span>{i.quantity} × {i.product_name}</span>
                          <span>{formatVND(i.unit_price * i.quantity)}</span>
                        </li>
                      ))}
                      <li className="flex justify-between px-3 py-2 text-muted"><span>Phí vận chuyển</span><span>{formatVND(o.shipping_fee)}</span></li>
                    </ul>
                  </div>
                  <OrderControls id={o.id} status={o.status} isPaid={o.is_paid} />
                </div>
              </details>
            </li>
          ))}
        </ul>
      ) : (
        <p className="card p-8 text-center text-sm text-muted">Không có đơn hàng.</p>
      )}

      {pages > 1 && (
        <nav aria-label="Phân trang" className="flex justify-center gap-2">
          {page > 1 && <Link href={qs({ trang: page - 1 })} className="btn-ghost">Trước</Link>}
          <span className="self-center text-sm text-muted">Trang {page}/{pages}</span>
          {page < pages && <Link href={qs({ trang: page + 1 })} className="btn-ghost">Sau</Link>}
        </nav>
      )}
    </div>
  );
}
