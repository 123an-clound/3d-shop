"use server";

import { revalidateTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { CATALOG_TAG } from "@/lib/data";
import { checkoutSchema } from "@/lib/order-schema";

export type PlaceOrderResult =
  | { ok: true; code: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

const RPC_ERRORS: Record<string, string> = {
  OUT_OF_STOCK: "Một số sản phẩm không đủ hàng. Vui lòng giảm số lượng và thử lại.",
  NOT_FOUND: "Một số sản phẩm không còn bán. Vui lòng xóa khỏi giỏ và thử lại.",
  RATE_LIMITED: "Bạn đặt hàng quá nhanh. Vui lòng thử lại sau ít phút.",
  INVALID_INPUT: "Thông tin đơn hàng không hợp lệ.",
};

export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Vui lòng kiểm tra lại thông tin.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { items, payment_method, ...customer } = parsed.data;

  const { data, error } = await createPublicClient().rpc("shop3d_place_order", {
    p_items: items,
    p_customer: customer,
    p_payment_method: payment_method,
  });

  if (error) {
    const key = Object.keys(RPC_ERRORS).find((k) => error.message.includes(k));
    if (!key) console.error("shop3d_place_order failed", error);
    return { ok: false, error: key ? RPC_ERRORS[key] : "Không thể đặt hàng lúc này. Vui lòng thử lại." };
  }

  // Stock changed: refresh cached catalog in the background (stale-while-revalidate).
  revalidateTag(CATALOG_TAG, "max");
  return { ok: true, code: data as string };
}
