"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/don-hang", label: "Đơn hàng" },
  { href: "/admin/san-pham", label: "Sản phẩm" },
  { href: "/admin/danh-muc", label: "Danh mục" },
  { href: "/admin/giao-dien", label: "Giao diện & thông tin" },
] as const;

export function AdminNav() {
  return <AdminNavLinks pathname={usePathname()} />;
}

/** Hook-free variant, also used as the Suspense fallback while the pathname is unknown at prerender time. */
export function AdminNavLinks({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Quản trị" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3 py-2.5 text-sm ${active ? "bg-accent/15 font-semibold text-accent" : "text-muted hover:bg-surface-2 hover:text-fg"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
