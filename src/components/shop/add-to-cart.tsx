"use client";

import Link from "next/link";
import { useState } from "react";
import { type CartItem, useCart } from "@/lib/cart-store";
import { CartIcon } from "@/components/icons";
import { QtyStepper } from "./qty-stepper";

export function AddToCart({ product }: { product: Omit<CartItem, "qty"> }) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (product.stock <= 0) {
    return <button type="button" disabled className="btn-ghost w-full sm:w-auto">Hết hàng</button>;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <QtyStepper value={qty} max={Math.min(product.stock, 50)} onChange={setQty} />
      <button
        type="button"
        className="btn-primary flex-1 sm:flex-none"
        onClick={() => {
          add(product, qty);
          setAdded(true);
        }}
      >
        <CartIcon /> Thêm vào giỏ
      </button>
      <p role="status" className="w-full text-sm text-success">
        {added && (
          <>
            Đã thêm vào giỏ. <Link href="/gio-hang" className="font-semibold underline">Xem giỏ hàng</Link>
          </>
        )}
      </p>
    </div>
  );
}
