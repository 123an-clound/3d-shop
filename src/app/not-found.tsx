import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Không tìm thấy trang", robots: { index: false } };

export default function NotFound() {
  return (
    <main id="main" className="grid flex-1 place-items-center px-4 py-24 text-center">
      <div>
        <p className="font-display text-7xl font-bold text-accent">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold">Không tìm thấy trang</h1>
        <p className="mt-2 text-muted">Trang bạn tìm có thể đã bị xóa hoặc đổi địa chỉ.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Về trang chủ</Link>
          <Link href="/san-pham" className="btn-ghost">Xem sản phẩm</Link>
        </div>
      </div>
    </main>
  );
}
