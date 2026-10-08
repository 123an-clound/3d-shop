"use client";

import Image from "next/image";
import Link from "next/link";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";
import { formatVND } from "@/lib/format";
import type { ShippingSettings } from "@/lib/types";
import { CartIcon, CubeIcon, TrashIcon } from "@/components/icons";
import { QtyStepper } from "./qty-stepper";
import { OrderSummary } from "./order-summary";

export function CartView({ shipping }: { shipping: ShippingSettings }) {
  const { items, setQty, remove } = useCart();
  const hydrated = useHydrated();

  if (!hydrated) return <div className="card mt-8 h-64 animate-pulse" aria-busy="true" />;

  if (!items.length) {
    return (
      <div className="card mt-8 grid place-items-center gap-4 px-6 py-16 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-accent/10 text-accent"><CartIcon width={32} height={32} /></span>
        <p className="font-display text-lg font-semibold">Giỏ hàng đang trống</p>
        <Link href="/san-pham" className="btn-primary">Tiếp tục mua sắm</Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="space-y-3" aria-label="Sản phẩm trong giỏ">
        {items.map((item) => (
          <li key={item.id} className="card flex gap-4 p-3 sm:p-4">
            <Link href={`/san-pham/${item.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:size-24">
              {item.image ? <Image src={item.image} alt="" fill sizes="96px" className="object-cover" /> : <CubeIcon className="m-auto h-full" />}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/san-pham/${item.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-accent sm:text-base">{item.name}</Link>
                <button type="button" onClick={() => remove(item.id)} className="grid size-11 shrink-0 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger" aria-label={`Xóa ${item.name}`}>
                  <TrashIcon />
                </button>
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                <QtyStepper value={item.qty} max={Math.min(item.stock, 50)} onChange={(v) => setQty(item.id, v)} label={`Số lượng ${item.name}`} />
                <span className="font-display font-bold text-hot">{formatVND(item.price * item.qty)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit lg:sticky lg:top-24">
        <OrderSummary subtotal={cartSubtotal(items)} shipping={shipping} />
        <Link href="/thanh-toan" className="btn-primary mt-4 w-full">Tiến hành đặt hàng</Link>
        <Link href="/san-pham" className="btn-ghost mt-2 w-full">Tiếp tục mua sắm</Link>
      </aside>
    </div>
  );
}
