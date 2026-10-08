import type { Metadata } from "next";
import { PolicyPage } from "@/components/shop/policy-page";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description: "Cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của khách hàng khi mua sắm.",
  alternates: { canonical: "/chinh-sach-bao-mat" },
};

export default function PrivacyPage() {
  return <PolicyPage kind="privacy" />;
}
