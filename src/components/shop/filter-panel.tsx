"use client";

import { useState } from "react";

/** Collapses the filter form behind a toggle on phones/tablets; always expanded on desktop. */
export function FilterPanel({ activeCount, children }: { activeCount: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="h-fit lg:sticky lg:top-24">
      <button
        type="button"
        className="btn-ghost w-full lg:hidden"
        aria-expanded={open}
        aria-controls="catalog-filters"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Ẩn bộ lọc" : `Bộ lọc & sắp xếp${activeCount ? ` (${activeCount})` : ""}`}
      </button>
      <div id="catalog-filters" className={`${open ? "mt-3 block" : "hidden"} lg:mt-0 lg:block`}>
        {children}
      </div>
    </div>
  );
}
