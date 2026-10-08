import type { Metadata } from "next";
import { PolicyPage } from "@/components/shop/policy-page";

export const metadata: Metadata = {
  title: "Chính sách đổi trả & bảo hành",
  description: "Điều kiện đổi trả, hoàn tiền và bảo hành sản phẩm in 3D, máy in 3D và phụ kiện.",
  alternates: { canonical: "/chinh-sach-doi-tra" },
};

export default function ReturnsPage() {
  return <PolicyPage kind="returns" />;
}
