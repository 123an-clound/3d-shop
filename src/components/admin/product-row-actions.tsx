"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteProduct, toggleProductFlag } from "@/app/admin/actions";

export function ProductRowActions({ id, name, isPublished, isFeatured }: { id: string; name: string; isPublished: boolean; isFeatured: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) window.alert(res.error);
      router.refresh();
    });

  return (
    <div className="flex flex-wrap items-center gap-3" aria-busy={pending}>
      <label className="flex items-center gap-1.5 text-xs">
        <input type="checkbox" checked={isPublished} disabled={pending} onChange={(e) => run(() => toggleProductFlag(id, "is_published", e.target.checked))} className="size-4 accent-[var(--color-accent)]" />
        Bán
      </label>
      <label className="flex items-center gap-1.5 text-xs">
        <input type="checkbox" checked={isFeatured} disabled={pending} onChange={(e) => run(() => toggleProductFlag(id, "is_featured", e.target.checked))} className="size-4 accent-[var(--color-accent)]" />
        Nổi bật
      </label>
      <button
        type="button"
        disabled={pending}
        className="text-xs text-danger hover:underline"
        onClick={() => window.confirm(`Xóa "${name}"? Không thể hoàn tác.`) && run(() => deleteProduct(id))}
      >
        Xóa
      </button>
    </div>
  );
}
