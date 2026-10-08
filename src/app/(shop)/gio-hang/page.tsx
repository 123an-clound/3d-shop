import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { CartView } from "@/components/shop/cart-view";

export const metadata: Metadata = { title: "Giỏ hàng", robots: { index: false } };

export default async function CartPage() {
  const { shipping } = await getSettings();
  return (
    <div className="container-x py-8 md:py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Giỏ hàng</h1>
      <CartView shipping={shipping} />
    </div>
  );
}
