import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Đăng nhập quản trị", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <main id="main" className="bg-grid grid flex-1 place-items-center px-4 py-16">
      <div className="card w-full max-w-sm p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold">Quản trị</h1>
        <p className="mt-1 text-sm text-muted">Đăng nhập bằng tài khoản được cấp quyền.</p>
        <LoginForm />
      </div>
    </main>
  );
}
