"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateOrder } from "@/app/admin/actions";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";

export function OrderControls({ id, status, isPaid }: { id: string; status: OrderStatus; isPaid: boolean }) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState(status);
  const [paid, setPaid] = useState(isPaid);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const locked = status === "completed" || status === "cancelled";

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (nextStatus === "cancelled" && status !== "cancelled" && !window.confirm("Hủy đơn sẽ hoàn lại tồn kho. Tiếp tục?")) return;
        startTransition(async () => {
          const res = await updateOrder(id, nextStatus, paid);
          setMsg(res.ok ? { ok: true, text: "Đã cập nhật." } : { ok: false, text: res.error });
          if (res.ok) router.refresh();
        });
      }}
    >
      <div>
        <label htmlFor={`st-${id}`} className="label">Trạng thái</label>
        <select id={`st-${id}`} value={nextStatus} onChange={(e) => setNextStatus(e.target.value as OrderStatus)} className="input" disabled={locked}>
          {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
        </select>
        {locked && <p className="mt-1 text-xs text-muted">Đơn đã kết thúc, chỉ có thể đổi trạng thái thanh toán.</p>}
      </div>
      <label className="flex min-h-11 items-center gap-2.5 text-sm">
        <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
        Đã thanh toán
      </label>
      <button type="submit" disabled={pending} className="btn-primary">{pending ? "Đang lưu..." : "Lưu"}</button>
      {msg && <p role="status" className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}
    </form>
  );
}
