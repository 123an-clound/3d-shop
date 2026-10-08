"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { placeOrder } from "@/app/(shop)/thanh-toan/actions";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";
import { formatVND } from "@/lib/format";
import { checkoutSchema } from "@/lib/order-schema";
import type { ShippingSettings } from "@/lib/types";
import { OrderSummary } from "./order-summary";

type Errors = Record<string, string[] | undefined>;

export function CheckoutForm({ shipping }: { shipping: ShippingSettings }) {
  const router = useRouter();
  const { items, clear } = useCart();
  const hydrated = useHydrated();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");

  if (!hydrated) return <div className="card mt-8 h-96 animate-pulse" aria-busy="true" />;

  if (!items.length) {
    return (
      <div className="card mt-8 grid place-items-center gap-4 px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">Giỏ hàng đang trống</p>
        <Link href="/san-pham" className="btn-primary">Xem sản phẩm</Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? "").replace(/\s|\./g, ""),
      email: String(fd.get("email") ?? "").trim(),
      address: String(fd.get("address") ?? ""),
      note: String(fd.get("note") ?? ""),
      payment_method: String(fd.get("payment_method") ?? "cod"),
      items: items.map((i) => ({ product_id: i.id, quantity: i.qty })),
    };

    const check = checkoutSchema.safeParse(input);
    if (!check.success) {
      setErrors(check.error.flatten().fieldErrors);
      setFormError("Vui lòng kiểm tra lại thông tin.");
      return;
    }
    setErrors({});
    setFormError("");

    startTransition(async () => {
      const res = await placeOrder(check.data);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.error);
        return;
      }
      clear();
      router.push(`/dat-hang-thanh-cong?ma=${encodeURIComponent(res.code)}&tt=${check.data.payment_method}`);
    });
  }

  const err = (k: string) => errors[k]?.[0];

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <fieldset className="card space-y-4 p-5 sm:p-6">
          <legend className="sr-only">Thông tin người nhận</legend>
          <h2 className="font-display text-lg font-semibold">Người nhận</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Họ và tên *" error={err("name")}>
              <input id="name" name="name" autoComplete="name" required className="input" aria-invalid={!!err("name")} aria-describedby={err("name") ? "name-err" : undefined} />
            </Field>
            <Field id="phone" label="Số điện thoại *" error={err("phone")}>
              <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required className="input" aria-invalid={!!err("phone")} aria-describedby={err("phone") ? "phone-err" : undefined} />
            </Field>
          </div>
          <Field id="email" label="Email (không bắt buộc)" error={err("email")}>
            <input id="email" name="email" type="email" autoComplete="email" className="input" aria-invalid={!!err("email")} aria-describedby={err("email") ? "email-err" : undefined} />
          </Field>
          <Field id="address" label="Địa chỉ nhận hàng *" error={err("address")}>
            <textarea id="address" name="address" rows={2} autoComplete="street-address" required className="input py-2.5" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" aria-invalid={!!err("address")} aria-describedby={err("address") ? "address-err" : undefined} />
          </Field>
          <Field id="note" label="Ghi chú" error={err("note")}>
            <textarea id="note" name="note" rows={2} maxLength={500} className="input py-2.5" placeholder="VD: giao giờ hành chính" />
          </Field>
        </fieldset>

        <fieldset className="card space-y-3 p-5 sm:p-6">
          <legend className="sr-only">Phương thức thanh toán</legend>
          <h2 className="font-display text-lg font-semibold">Thanh toán</h2>
          {[
            { v: "cod", t: "Thanh toán khi nhận hàng (COD)", d: "Trả tiền mặt cho nhân viên giao hàng." },
            { v: "bank_transfer", t: "Chuyển khoản ngân hàng", d: "Thông tin tài khoản hiển thị sau khi đặt hàng." },
          ].map((o) => (
            <label key={o.v} className="flex cursor-pointer gap-3 rounded-xl border border-line p-4 has-[:checked]:border-accent has-[:checked]:bg-accent/5">
              <input type="radio" name="payment_method" value={o.v} defaultChecked={o.v === "cod"} className="mt-1 size-4 accent-[var(--color-accent)]" />
              <span>
                <span className="block text-sm font-semibold">{o.t}</span>
                <span className="block text-xs text-muted">{o.d}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold">Sản phẩm ({items.length})</h2>
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="line-clamp-1 text-muted">{i.qty} × {i.name}</span>
                <span className="shrink-0">{formatVND(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
        </div>
        <OrderSummary subtotal={cartSubtotal(items)} shipping={shipping} />
        {formError && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{formError}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Đang đặt hàng..." : "Xác nhận đặt hàng"}
        </button>
        <p className="text-center text-xs text-muted">Tổng tiền cuối cùng được xác nhận theo giá và tồn kho hiện tại.</p>
      </aside>
    </form>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error && <p id={`${id}-err`} className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
