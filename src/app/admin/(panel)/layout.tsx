import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { AdminNav, AdminNavLinks } from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { CubeIcon } from "@/components/icons";

export const metadata: Metadata = { title: { default: "Quản trị", template: "%s | Quản trị" }, robots: { index: false, follow: false } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <aside className="border-b border-line bg-surface lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-2 p-4">
          <Link href="/admin" className="flex items-center gap-2 font-display font-bold">
            <span className="grid size-8 place-items-center rounded-lg bg-accent/15 text-accent"><CubeIcon /></span>
            Admin
          </Link>
          <Link href="/" className="text-xs text-muted hover:text-fg" target="_blank">Xem web ↗</Link>
        </div>
        <Suspense fallback={<AdminNavLinks pathname="" />}>
          <AdminNav />
        </Suspense>
      </aside>
      <main id="main" className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<div className="card h-64 animate-pulse" aria-busy="true" />}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </main>
    </div>
  );
}

/** Server-side authorization: only confirmed emails in shop3d_admins get past this point. */
async function AdminGate({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/admin/dang-nhap");

  const { data: isAdmin } = await supabase.rpc("shop3d_is_admin");
  if (!isAdmin) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <h1 className="font-display text-xl font-bold">Không có quyền truy cập</h1>
        <p className="mt-2 text-sm text-muted">Tài khoản {String(data.claims.email ?? "")} chưa được cấp quyền quản trị hoặc chưa xác thực email.</p>
        <div className="mt-6 flex justify-center"><SignOutButton /></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-end gap-3 text-sm text-muted">
        <span className="hidden sm:inline">{String(data.claims.email ?? "")}</span>
        <SignOutButton />
      </div>
      {children}
    </>
  );
}
