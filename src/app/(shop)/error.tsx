"use client";

import Link from "next/link";

export default function ShopError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-x grid place-items-center py-24 text-center">
      <div>
        <h1 className="font-display text-2xl font-bold">Đã có lỗi xảy ra</h1>
        <p className="mt-2 text-muted">Vui lòng thử lại sau giây lát.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">Thử lại</button>
          <Link href="/" className="btn-ghost">Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}
