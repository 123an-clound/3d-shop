import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { CheckoutForm } from "@/components/shop/checkout-form";

export const metadata: Metadata = { title: "Thanh toán", robots: { index: false } };

export default async function CheckoutPage() {
  const { shipping } = await getSettings();
  return (
    <div className="container-x py-8 md:py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Thông tin đặt hàng</h1>
      <CheckoutForm shipping={shipping} />
    </div>
  );
}
