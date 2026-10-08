import { formatVND } from "@/lib/format";
import { calcShippingFee } from "@/lib/shipping";
import type { ShippingSettings } from "@/lib/types";

export function OrderSummary({ subtotal, shipping }: { subtotal: number; shipping: ShippingSettings }) {
  const fee = calcShippingFee(subtotal, shipping);
  const missing = shipping.free_threshold - subtotal;
  return (
    <div className="card p-5">
      <h2 className="font-display text-lg font-semibold">Tóm tắt đơn hàng</h2>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between"><dt className="text-muted">Tạm tính</dt><dd>{formatVND(subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Phí vận chuyển</dt><dd>{fee ? formatVND(fee) : "Miễn phí"}</dd></div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
          <dt>Tổng cộng</dt><dd className="font-display text-hot">{formatVND(subtotal + fee)}</dd>
        </div>
      </dl>
      {missing > 0 && fee > 0 && (
        <p className="mt-3 rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent">Mua thêm {formatVND(missing)} để được miễn phí vận chuyển.</p>
      )}
    </div>
  );
}
