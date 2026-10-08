import type { ShippingSettings } from "./types";

/** Must stay in sync with shop3d_place_order in supabase/migrations (server is the source of truth). */
export function calcShippingFee(subtotal: number, shipping: ShippingSettings) {
  if (subtotal <= 0) return 0;
  return subtotal >= shipping.free_threshold ? 0 : shipping.flat_fee;
}
