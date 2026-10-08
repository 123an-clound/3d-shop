"use client";

import Link from "next/link";
import { CartIcon } from "@/components/icons";
import { cartCount, useCart } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";

export function CartButton() {
  const items = useCart((s) => s.items);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;

  return (
    <Link
      href="/gio-hang"
      className="relative flex size-11 items-center justify-center rounded-xl hover:bg-surface-2"
      aria-label={count ? `Giỏ hàng, ${count} sản phẩm` : "Giỏ hàng"}
    >
      <CartIcon />
      {count > 0 && (
        <span className="absolute right-1 top-1 grid min-w-5 place-items-center rounded-full bg-hot px-1 text-[11px] font-bold leading-5 text-bg">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
