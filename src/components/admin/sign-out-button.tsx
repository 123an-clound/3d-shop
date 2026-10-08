"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn-ghost min-h-9 px-3 text-xs"
      onClick={async () => {
        await createSupabaseBrowser().auth.signOut();
        router.replace("/admin/dang-nhap");
        router.refresh();
      }}
    >
      Đăng xuất
    </button>
  );
}
